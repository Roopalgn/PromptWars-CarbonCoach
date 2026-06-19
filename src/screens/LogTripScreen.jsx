import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadMapsApi, getRouteDistance, resolvePlaceFromText } from '../services/maps';
import { saveTrip } from '../services/firestore';
import {
  calculateCO2,
  getBestAlternative,
  getKgSaved,
  getAllAlternatives,
} from '../services/carbonCalc';

import {
  IconMapPin,
  IconFlag,
  IconAlertCircle,
} from '../components/Icons';
import ModeSelector from '../components/ModeSelector';
import TripResultCard from '../components/TripResultCard';
import Toast from '../components/Toast';










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
