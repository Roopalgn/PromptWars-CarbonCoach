import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ModeSelector from '../components/ModeSelector';
import TripResultCard from '../components/TripResultCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { IconMapPin, IconFlag, IconAlertCircle } from '../components/Icons';
import { loadMapsApi, getRouteDistance } from '../services/maps';
import { saveTrip } from '../services/firestore';
import {
  calculateCO2,
  getBestAlternative,
  getKgSaved,
  getAllAlternatives,
} from '../services/carbonCalc';

/**
 * Primary action screen — log a trip, see your CO₂, compare alternatives.
 * First screen shown after auth. Core loop: select → calculate → compare → log.
 */
export default function LogTripScreen({ user }) {
  const navigate = useNavigate();

  const originInputRef      = useRef(null);
  const destinationInputRef = useRef(null);
  const originACRef         = useRef(null);
  const destinationACRef    = useRef(null);

  const [originAddress,  setOriginAddress]  = useState('');
  const [originPlaceId,  setOriginPlaceId]  = useState('');
  const [destAddress,    setDestAddress]    = useState('');
  const [destPlaceId,    setDestPlaceId]    = useState('');
  const [selectedMode,   setSelectedMode]   = useState('');
  const [calcState,      setCalcState]      = useState('idle'); // idle | loading | result | error
  const [calcError,      setCalcError]      = useState('');
  const [result,         setResult]         = useState(null);
  const [saving,         setSaving]         = useState(false);
  const [mapsReady,      setMapsReady]      = useState(false);

  // Load Maps JS API once
  useEffect(() => {
    let cancelled = false;
    loadMapsApi()
      .then(() => { if (!cancelled) setMapsReady(true); })
      .catch(() => { /* degraded mode: inputs work as plain text */ });
    return () => { cancelled = true; };
  }, []);

  // Attach Places Autocomplete once Maps API is ready
  useEffect(() => {
    if (!mapsReady || !originInputRef.current || !destinationInputRef.current) return;

    const opts = { componentRestrictions: { country: 'in' } };

    originACRef.current = new window.google.maps.places.Autocomplete(
      originInputRef.current,
      opts
    );
    originACRef.current.addListener('place_changed', () => {
      const place = originACRef.current.getPlace();
      if (place?.place_id) {
        setOriginPlaceId(place.place_id);
        setOriginAddress(place.formatted_address ?? originInputRef.current.value);
      }
    });

    destinationACRef.current = new window.google.maps.places.Autocomplete(
      destinationInputRef.current,
      opts
    );
    destinationACRef.current.addListener('place_changed', () => {
      const place = destinationACRef.current.getPlace();
      if (place?.place_id) {
        setDestPlaceId(place.place_id);
        setDestAddress(place.formatted_address ?? destinationInputRef.current.value);
      }
    });
  }, [mapsReady]);

  function resetForm() {
    setOriginAddress('');
    setOriginPlaceId('');
    setDestAddress('');
    setDestPlaceId('');
    setSelectedMode('');
    setResult(null);
    setCalcState('idle');
    setCalcError('');
    if (originInputRef.current)      originInputRef.current.value      = '';
    if (destinationInputRef.current) destinationInputRef.current.value = '';
  }

  async function handleCalculate(e) {
    e.preventDefault();
    setCalcError('');

    // Validation — errors positioned near relevant field (§8 error-placement)
    if (!originPlaceId) {
      setCalcError('Please select an origin from the dropdown suggestions.');
      originInputRef.current?.focus();
      return;
    }
    if (!destPlaceId) {
      setCalcError('Please select a destination from the dropdown suggestions.');
      destinationInputRef.current?.focus();
      return;
    }
    if (!selectedMode) {
      setCalcError('Please select a transport mode.');
      document.getElementById(`mode-ola_uber`)?.focus();
      return;
    }

    setCalcState('loading');

    try {
      const distance_km          = await getRouteDistance(originPlaceId, destPlaceId);
      const kg_co2               = calculateCO2(selectedMode, distance_km);
      const bestMode             = getBestAlternative(selectedMode);
      const bestKg               = calculateCO2(bestMode, distance_km);
      const savedKg              = getKgSaved(kg_co2, bestKg);

      setResult({
        mode:                  selectedMode,
        origin:                originAddress,
        destination:           destAddress,
        origin_place_id:       originPlaceId,
        destination_place_id:  destPlaceId,
        distance_km,
        kg_co2,
        best_alternative_mode: bestMode,
        best_alternative_kg:   bestKg,
        kg_saved_if_alt:       savedKg,
        alternatives:          getAllAlternatives(selectedMode, distance_km),
      });
      setCalcState('result');
    } catch (err) {
      setCalcState('error');
      setCalcError(
        err.message || "Couldn't calculate route — check your connection."
      );
    }
  }

  async function handleLog() {
    if (!result || saving) return;
    setSaving(true);
    try {
      await saveTrip(user.uid, result);
      navigate('/dashboard');
    } catch {
      setCalcError('Failed to save trip — please try again.');
      setSaving(false);
    }
  }

  return (
    <>
      <a href="#log-form" className="skip-link">Skip to trip form</a>
      <main className="screen screen--log" aria-label="Log a trip">
        <header className="screen-header">
          <h1 className="screen-title">Log a Trip</h1>
          <p className="screen-subtitle">
            Find out what your commute really costs the planet
          </p>
        </header>

        {calcState !== 'result' && (
          <form
            id="log-form"
            className="log-form"
            onSubmit={handleCalculate}
            noValidate
            aria-label="Trip details"
          >
            {/* Origin */}
            <div className="form-group">
              <label htmlFor="origin-input" className="form-label form-label--required">
                From
              </label>
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">
                  <IconMapPin size={18} />
                </span>
                <input
                  id="origin-input"
                  ref={originInputRef}
                  type="text"
                  className="form-input"
                  placeholder="Starting point"
                  aria-required="true"
                  aria-describedby={calcError && !originPlaceId ? 'form-error' : undefined}
                  onChange={(e) => {
                    setOriginAddress(e.target.value);
                    if (!e.target.value) setOriginPlaceId('');
                  }}
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Destination */}
            <div className="form-group">
              <label htmlFor="destination-input" className="form-label form-label--required">
                To
              </label>
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">
                  <IconFlag size={18} />
                </span>
                <input
                  id="destination-input"
                  ref={destinationInputRef}
                  type="text"
                  className="form-input"
                  placeholder="Destination"
                  aria-required="true"
                  aria-describedby={calcError && !destPlaceId ? 'form-error' : undefined}
                  onChange={(e) => {
                    setDestAddress(e.target.value);
                    if (!e.target.value) setDestPlaceId('');
                  }}
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Mode selector */}
            <div className="form-group">
              <p className="form-label form-label--required" id="mode-group-label">
                Mode used
              </p>
              <ModeSelector selected={selectedMode} onChange={setSelectedMode} />
            </div>

            {/* Error message — near the form (§8 error-placement) */}
            {(calcState === 'error' || calcError) && (
              <p
                id="form-error"
                className="error-msg"
                role="alert"
                aria-live="assertive"
              >
                <IconAlertCircle size={16} />
                {calcError}
              </p>
            )}

            <button
              id="calculate-btn"
              type="submit"
              className="btn btn--primary btn--full"
              disabled={calcState === 'loading'}
              aria-label="Calculate carbon footprint for this trip"
            >
              {calcState === 'loading' ? (
                <LoadingSpinner size={20} label="Calculating route…" />
              ) : (
                'Calculate & Log'
              )}
            </button>
          </form>
        )}

        {calcState === 'result' && result && (
          <div className="result-wrapper">
            <TripResultCard
              result={result}
              onLog={handleLog}
              onReset={resetForm}
            />
            {saving && (
              <div className="saving-overlay" aria-live="polite" aria-label="Saving your trip">
                <LoadingSpinner label="Saving trip…" />
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
