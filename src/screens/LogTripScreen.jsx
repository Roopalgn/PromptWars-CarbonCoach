import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadMapsApi, getRouteDistance } from '../services/maps';
import { saveTrip } from '../services/firestore';
import {
  calculateCO2,
  getBestAlternative,
  getKgSaved,
  getAllAlternatives,
} from '../services/carbonCalc';
import { MODE_LABELS, EMISSIONS_FACTORS } from '../config/emissionsFactors';
import { roundCO2 } from '../utils/formatters';
import {
  IconMapPin,
  IconFlag,
  IconAlertCircle,
  IconCheck,
  IconRefresh,
  IconSave,
} from '../components/Icons';
import ModeSelector from '../components/ModeSelector';
import { MODE_BAR_CLASS } from '../config/constants';

/**
 * Determine the emission impact level key based on kg CO2.
 * @param {number} kg - Carbon emissions in kilograms
 * @returns {'low'|'medium'|'high'}
 */
function co2Level(kg) {
  if (kg <= 0.5) return 'low';
  if (kg <= 2.0) return 'medium';
  return 'high';
}

/**
 * Toast alert notification component.
 * Automatically clears itself after 3.5 seconds.
 * @param {Object} props - Component props
 * @param {string} props.message - Banner text to display
 * @param {function} props.onDone - Dismiss callback
 * @returns {JSX.Element}
 */
function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="toast-container" aria-live="polite">
      <div className="toast toast--success" role="status">
        <IconCheck size={16} />
        {message}
      </div>
    </div>
  );
}

/**
 * Trip Result Card displaying calculated carbon emission values,
 * alternative mode comparisons, and logs/saves controls.
 * @param {Object} props - Component props
 * @param {Object} props.result - Calculated route emission results
 * @param {string} props.result.mode - Chosen mode key
 * @param {string} props.result.origin - Starting address
 * @param {string} props.result.destination - Ending address
 * @param {number} props.result.distance_km - Travel distance in km
 * @param {number} props.result.kg_co2 - Carbon footprint of chosen mode
 * @param {string} props.result.best_alternative_mode - Best alternative mode key
 * @param {number} props.result.best_alternative_kg - Carbon footprint of best alternative mode
 * @param {number} props.result.kg_saved_if_alt - Potential savings in kg CO2
 * @param {Array<Object>} props.result.alternatives - List of calculated alternative route options
 * @param {function} props.onLog - Trip log save trigger handler
 * @param {function} props.onReset - Reset form fields and state callback
 * @param {boolean} props.saving - In-flight log operations indicator
 * @param {boolean} props.isGuest - Flag indicating active guest mode
 * @returns {JSX.Element}
 */
function TripResultCard({ result, onLog, onReset, saving, isGuest }) {
  const level = co2Level(result.kg_co2);
  const maxKg = Math.max(...result.alternatives.map((a) => a.kg_co2), result.kg_co2, 0.01);

  const barClass = (mode) => MODE_BAR_CLASS[mode] ?? 'alt-bar-fill--slate';

  return (
    <div className="result-card">
      {/* CO₂ big display */}
      <div className="co2-display">
        <div className="label-tag label-tag--cyan result-label-tag">
          Your trip — {result.distance_km} km · {MODE_LABELS[result.mode]}
        </div>
        <div
          className="co2-value result-co2-display"
          style={{
            '--co2-color': level === 'low' ? 'var(--c-primary)' : level === 'medium' ? 'var(--c-warning)' : 'var(--c-danger)',
            '--co2-shadow': level === 'low'
              ? '0 0 40px var(--c-primary-glow)'
              : level === 'medium'
              ? '0 0 40px rgba(245,158,11,0.3)'
              : '0 0 40px rgba(239,68,68,0.3)',
          }}
        >
          {roundCO2(result.kg_co2)}
          <span className="co2-unit">kg CO₂</span>
        </div>
        <p className="co2-label">
          {level === 'low' && 'Low impact — great choice!'}
          {level === 'medium' && 'Moderate impact — consider alternatives below.'}
          {level === 'high' && 'High impact — see greener options below.'}
        </p>
      </div>

      {/* Your chosen mode vs reference bar */}
      <div className="mb-4">
        <div className="alt-bar-row">
          <span className="alt-bar-label">{MODE_LABELS[result.mode]}</span>
          <div className="alt-bar-track">
            <div
              className={`alt-bar-fill ${barClass(result.mode)}`}
              style={{ width: `${(result.kg_co2 / maxKg) * 100}%` }}
              role="progressbar"
              aria-valuenow={result.kg_co2}
              aria-valuemax={maxKg}
              aria-label={`${MODE_LABELS[result.mode]}: ${roundCO2(result.kg_co2)} kg`}
            >
              {roundCO2(result.kg_co2)} kg
            </div>
          </div>
        </div>
      </div>

      {/* Comparison bars */}
      <div className="section-header mb-3">
        <span className="chart-title mb-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
          </svg>
          Alternatives for this route
        </span>
      </div>

      <div aria-label="Alternative transport modes comparison">
        {result.alternatives.map((alt) => (
          <div key={alt.mode} className="alt-bar-row">
            <span className="alt-bar-label">{MODE_LABELS[alt.mode]}</span>
            <div className="alt-bar-track">
              <div
                className={`alt-bar-fill ${barClass(alt.mode)}`}
                style={{ width: `${(alt.kg_co2 / maxKg) * 100}%`, minWidth: alt.kg_co2 === 0 ? 60 : undefined }}
                role="progressbar"
                aria-valuenow={alt.kg_co2}
                aria-valuemax={maxKg}
                aria-label={`${MODE_LABELS[alt.mode]}: ${roundCO2(alt.kg_co2)} kg`}
              >
                {alt.kg_co2 === 0 ? '0 kg' : `${roundCO2(alt.kg_co2)} kg`}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Save / Reset */}
      <div className="log-trip-actions-row">
        <button
          id="log-trip-btn"
          type="button"
          className="btn btn--primary flex-1"
          onClick={onLog}
          disabled={saving}
          aria-label={isGuest ? 'Log trip locally (guest mode)' : 'Save trip to your account'}
        >
          {saving ? (
            <><div className="spinner spinner-16" />Saving…</>
          ) : (
            <><IconSave size={16} />{isGuest ? 'Log (guest)' : 'Save trip'}</>
          )}
        </button>
        <button
          id="reset-btn"
          type="button"
          className="btn btn--ghost"
          onClick={onReset}
          aria-label="Log another trip"
        >
          <IconRefresh size={16} />
          Reset
        </button>
      </div>

      {isGuest && (
        <p className="mt-3 text-xs text-muted text-center">
          Guest mode — trip stored in-session only. Sign in to persist your data.
        </p>
      )}
    </div>
  );
}

/* ── Helper to resolve place ID from typed text if dropdown skipped ── */
function resolvePlaceFromText(text, coords) {
  return new Promise((resolve) => {
    if (!text || !window.google) {
      resolve(null);
      return;
    }
    
    const getPlaceId = () => {
      return new Promise((res) => {
        const geocoder = new window.google.maps.Geocoder();
        const geocodeOpts = {
          address: text,
          componentRestrictions: { country: 'in' },
        };
        if (coords) {
          geocodeOpts.location = new window.google.maps.LatLng(coords.lat, coords.lng);
        }
        geocoder.geocode(geocodeOpts, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            res(results[0].place_id);
          } else {
            try {
              const service = new window.google.maps.places.AutocompleteService();
              const autoOpts = {
                input: text,
                componentRestrictions: { country: 'in' },
              };
              if (coords) {
                autoOpts.locationBias = new window.google.maps.LatLng(coords.lat, coords.lng);
              }
              service.getPlacePredictions(autoOpts, (predictions, status) => {
                if (status === 'OK' && predictions && predictions[0]) {
                  res(predictions[0].place_id);
                } else {
                  res(null);
                }
              });
            } catch (err) {
              res(null);
            }
          }
        });
      });
    };

    getPlaceId().then((placeId) => {
      if (!placeId) {
        resolve(null);
        return;
      }
      
      try {
        const dummy = document.createElement('div');
        const service = new window.google.maps.places.PlacesService(dummy);
        service.getDetails({ placeId, fields: ['name', 'formatted_address', 'place_id'] }, (place, status) => {
          if (status === 'OK' && place) {
            const name = place.name;
            const address = place.formatted_address || '';
            const fullAddress = (name && !address.startsWith(name)) ? `${name}, ${address}` : address;
            resolve({
              place_id: place.place_id,
              formatted_address: fullAddress
            });
          } else {
            resolve({
              place_id: placeId,
              formatted_address: text
            });
          }
        });
      } catch (err) {
        resolve({
          place_id: placeId,
          formatted_address: text
        });
      }
    });
  });
}

/* ── Main screen ───────────────────────────────────────────── */
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
  const [coords,         setCoords]         = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };
  const [selectedMode,   setSelectedMode]   = useState('');
  const [calcState,      setCalcState]      = useState('idle');
  const [calcError,      setCalcError]      = useState('');
  const [result,         setResult]         = useState(null);
  const [saving,         setSaving]         = useState(false);
  const [mapsReady,      setMapsReady]      = useState(false);
  const [toast,          setToast]          = useState(null);

  const isGuest = user?.isGuest;

  // Load Maps JS API
  useEffect(() => {
    let cancelled = false;
    loadMapsApi()
      .then(() => { if (!cancelled) setMapsReady(true); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Attach Places Autocomplete
  useEffect(() => {
    if (!mapsReady || !originInputRef.current || !destinationInputRef.current) return;
    
    const opts = { componentRestrictions: { country: 'in' } };
    if (coords && window.google) {
      opts.locationBias = new window.google.maps.LatLng(coords.lat, coords.lng);
    }

    originACRef.current = new window.google.maps.places.Autocomplete(originInputRef.current, opts);
    originACRef.current.addListener('place_changed', () => {
      const place = originACRef.current.getPlace();
      if (place?.place_id) {
        setOriginPlaceId(place.place_id);
        const name = place.name;
        const address = place.formatted_address || '';
        const fullAddress = (name && !address.startsWith(name)) ? `${name}, ${address}` : address;
        setOriginAddress(fullAddress);
        if (originInputRef.current) originInputRef.current.value = fullAddress;
      }
    });

    destinationACRef.current = new window.google.maps.places.Autocomplete(destinationInputRef.current, opts);
    destinationACRef.current.addListener('place_changed', () => {
      const place = destinationACRef.current.getPlace();
      if (place?.place_id) {
        setDestPlaceId(place.place_id);
        const name = place.name;
        const address = place.formatted_address || '';
        const fullAddress = (name && !address.startsWith(name)) ? `${name}, ${address}` : address;
        setDestAddress(fullAddress);
        if (destinationInputRef.current) destinationInputRef.current.value = fullAddress;
      }
    });
  }, [mapsReady, coords]);

  function resetForm() {
    setOriginAddress(''); setOriginPlaceId('');
    setDestAddress('');   setDestPlaceId('');
    setSelectedMode('');  setResult(null);
    setCalcState('idle'); setCalcError('');
    if (originInputRef.current)      originInputRef.current.value = '';
    if (destinationInputRef.current) destinationInputRef.current.value = '';
  }

  async function handleCalculate(e) {
    e.preventDefault();
    setCalcError('');

    let currentOriginId = originPlaceId;
    let currentOriginAddr = originAddress;
    let currentDestId = destPlaceId;
    let currentDestAddr = destAddress;

    setCalcState('loading');
    try {
      // Resolve Origin if missing place ID
      if (!currentOriginId) {
        const text = originInputRef.current?.value || '';
        if (text.trim()) {
          const resolved = await resolvePlaceFromText(text, coords);
          if (resolved) {
            currentOriginId = resolved.place_id;
            currentOriginAddr = resolved.formatted_address;
            setOriginPlaceId(resolved.place_id);
            setOriginAddress(resolved.formatted_address);
            if (originInputRef.current) originInputRef.current.value = resolved.formatted_address;
          }
        }
      }

      if (!currentOriginId) {
        setCalcState('idle');
        setCalcError('Please select an origin from the dropdown suggestions or enter a valid location.');
        originInputRef.current?.focus();
        return;
      }

      // Resolve Destination if missing place ID
      if (!currentDestId) {
        const text = destinationInputRef.current?.value || '';
        if (text.trim()) {
          const resolved = await resolvePlaceFromText(text, coords);
          if (resolved) {
            currentDestId = resolved.place_id;
            currentDestAddr = resolved.formatted_address;
            setDestPlaceId(resolved.place_id);
            setDestAddress(resolved.formatted_address);
            if (destinationInputRef.current) destinationInputRef.current.value = resolved.formatted_address;
          }
        }
      }

      if (!currentDestId) {
        setCalcState('idle');
        setCalcError('Please select a destination from the dropdown suggestions or enter a valid location.');
        destinationInputRef.current?.focus();
        return;
      }

      if (!selectedMode) {
        setCalcState('idle');
        setCalcError('Please select a transport mode.');
        document.getElementById(`mode-ola_uber`)?.focus();
        return;
      }

      const distance_km         = await getRouteDistance(currentOriginId, currentDestId);
      const kg_co2              = calculateCO2(selectedMode, distance_km);
      const bestMode            = getBestAlternative(selectedMode);
      const bestKg              = calculateCO2(bestMode, distance_km);
      const savedKg             = getKgSaved(kg_co2, bestKg);
      setResult({
        mode: selectedMode, origin: currentOriginAddr, destination: currentDestAddr,
        origin_place_id: currentOriginId, destination_place_id: currentDestId,
        distance_km, kg_co2, best_alternative_mode: bestMode, best_alternative_kg: bestKg,
        kg_saved_if_alt: savedKg, alternatives: getAllAlternatives(selectedMode, distance_km),
      });
      setCalcState('result');
    } catch (err) {
      setCalcState('error');
      setCalcError(err.message || "Couldn't calculate route — check your connection.");
    }
  }

  async function handleLog() {
    if (!result || saving) return;
    setSaving(true);
    try {
      if (isGuest) {
        // Guest mode: save to local storage
        await new Promise((r) => setTimeout(r, 400));
        const stored = localStorage.getItem('carboncoach_guest_trips');
        let guestTrips = [];
        try {
          guestTrips = stored ? JSON.parse(stored) : [];
        } catch (parseErr) {
          console.warn('[LogTripScreen] Failed to parse guest trips from localStorage:', parseErr);
          guestTrips = [];
        }
        
        const newTrip = {
          ...result,
          id: `guest_${Date.now()}`,
          timestamp: new Date().toISOString()
        };
        guestTrips.unshift(newTrip);
        try {
          localStorage.setItem('carboncoach_guest_trips', JSON.stringify(guestTrips));
        } catch (storageErr) {
          console.error('[LogTripScreen] Failed to save trip to localStorage:', storageErr);
          setCalcError('Unable to save to device storage — try clearing some space.');
          setSaving(false);
          return;
        }
        
        setToast('Trip logged locally (sign in to save)');
        navigate('/dashboard');
      } else {
        await saveTrip(user.uid, result);
        setToast('Trip saved!');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('[LogTripScreen] Error saving trip:', err);
      setCalcError(err.message || 'Failed to save trip — please try again.');
      setSaving(false);
    }
  }

  return (
    <>
      <a href="#log-form" className="skip-link">Skip to trip form</a>
      <main className="screen" aria-label="Log a trip">
        <header className="page-header">
          <h1 className="page-title">Log a Trip</h1>
          <p className="page-subtitle">Calculate the carbon cost of your commute</p>
        </header>

        {calcState !== 'result' && (
          <form
            id="log-form"
            onSubmit={handleCalculate}
            noValidate
            aria-label="Trip details"
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-5)' }}
          >
            {/* Origin */}
            <div className="form-group">
              <label htmlFor="origin-input" className="form-label form-label--required">
                From
              </label>
              <div className="input-wrap">
                <span className="input-icon" aria-hidden="true"><IconMapPin size={18} /></span>
                <input
                  id="origin-input"
                  ref={originInputRef}
                  type="text"
                  className="form-input"
                  placeholder="Starting point (e.g., New Delhi Station)"
                  aria-label="Trip origin"
                  aria-required="true"
                  aria-describedby={calcError && !originPlaceId ? 'form-error' : 'origin-help'}
                  onChange={(e) => {
                    setOriginAddress(e.target.value);
                    if (!e.target.value) setOriginPlaceId('');
                  }}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                />
                <span id="origin-help" style={{ display: 'none' }}>Select from autocomplete suggestions</span>
              </div>
            </div>

            {/* Destination */}
            <div className="form-group">
              <label htmlFor="destination-input" className="form-label form-label--required">
                To
              </label>
              <div className="input-wrap">
                <span className="input-icon" aria-hidden="true"><IconFlag size={18} /></span>
                <input
                  id="destination-input"
                  ref={destinationInputRef}
                  type="text"
                  className="form-input"
                  placeholder="Destination (e.g., Connaught Place)"
                  aria-label="Trip destination"
                  aria-required="true"
                  aria-describedby={calcError && !destPlaceId ? 'form-error' : 'destination-help'}
                  onChange={(e) => {
                    setDestAddress(e.target.value);
                    if (!e.target.value) setDestPlaceId('');
                  }}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                />
                <span id="destination-help" style={{ display: 'none' }}>Select from autocomplete suggestions</span>
              </div>
            </div>

            {/* Mode */}
            <div className="form-group">
              <p id="mode-group-label" className="form-label form-label--required">
                Mode used
              </p>
              <ModeSelector selected={selectedMode} onChange={setSelectedMode} />
            </div>

            {/* Error */}
            {(calcState === 'error' || calcError) && (
              <div id="form-error" className="form-error" role="alert" aria-live="assertive">
                <IconAlertCircle size={16} />
                {calcError}
              </div>
            )}

            <button
              id="calculate-btn"
              type="submit"
              className="btn btn--primary btn--full btn--lg"
              disabled={calcState === 'loading'}
              aria-label="Calculate carbon footprint for this trip"
            >
              {calcState === 'loading' ? (
                <><div className="spinner" style={{ width: 20, height: 20 }} />Calculating route…</>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                  Calculate &amp; Compare
                </>
              )}
            </button>
          </form>
        )}

        {calcState === 'result' && result && (
          <div className="pos-relative">
            <TripResultCard
              result={result}
              onLog={handleLog}
              onReset={resetForm}
              saving={saving}
              isGuest={isGuest}
            />
          </div>
        )}
      </main>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}
