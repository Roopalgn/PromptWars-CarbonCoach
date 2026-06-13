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

/* ── SVG Icons ─────────────────────────────────────────────── */
function IconMapPin({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function IconFlag({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
    </svg>
  );
}

function IconAlertCircle({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}

function IconCheck({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function IconRefresh({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
    </svg>
  );
}

function IconSave({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
    </svg>
  );
}

/* ── Mode SVG icons ────────────────────────────────────────── */
const MODE_ICONS = {
  ola_uber: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
  auto: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9h-2"/>
      <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
    </svg>
  ),
  bus: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6v6m8-6v6M2 12h20M4 6h16a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"/>
      <path d="M7 17v2M17 17v2"/>
    </svg>
  ),
  metro: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="16" rx="2"/><path d="M4 10h16M12 2v16M4 18l-1 2M20 18l1 2M8 14h0M16 14h0"/>
    </svg>
  ),
  carpool: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  cycle: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
      <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5L9 10l5 1 4-4"/>
    </svg>
  ),
  walk: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="1"/><path d="m9 20 3-8 3 3 2-5m-4-5-2 5 2 3"/>
      <path d="m12 7-2 5 3 3"/>
    </svg>
  ),
};

/* ── Mode selector ─────────────────────────────────────────── */
function ModeSelector({ selected, onChange }) {
  const modes = Object.keys(MODE_LABELS);
  return (
    <div className="mode-grid" role="radiogroup" aria-label="Select transport mode">
      {modes.map((m) => (
        <button
          key={m}
          id={`mode-${m}`}
          type="button"
          role="radio"
          aria-checked={selected === m}
          className={`mode-btn ${selected === m ? 'selected' : ''}`}
          onClick={() => onChange(m)}
          aria-label={MODE_LABELS[m]}
        >
          <span aria-hidden="true">{MODE_ICONS[m]}</span>
          {MODE_LABELS[m]}
        </button>
      ))}
    </div>
  );
}

/* ── CO₂ level helper ──────────────────────────────────────── */
function co2Level(kg) {
  if (kg <= 0.5) return 'low';
  if (kg <= 2.0) return 'medium';
  return 'high';
}

/* ── Bar fill colour by mode ───────────────────────────────── */
const MODE_BAR_CLASS = {
  walk:    'alt-bar-fill--green',
  cycle:   'alt-bar-fill--green',
  metro:   'alt-bar-fill--cyan',
  bus:     'alt-bar-fill--cyan',
  carpool: 'alt-bar-fill--violet',
  auto:    'alt-bar-fill--amber',
  ola_uber:'alt-bar-fill--red',
};

/* ── Toast ─────────────────────────────────────────────────── */
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

/* ── Result card ───────────────────────────────────────────── */
function TripResultCard({ result, onLog, onReset, saving, isGuest }) {
  const level = co2Level(result.kg_co2);
  const maxKg = Math.max(...result.alternatives.map((a) => a.kg_co2), result.kg_co2, 0.01);

  const barClass = (mode) => MODE_BAR_CLASS[mode] ?? 'alt-bar-fill--slate';

  return (
    <div className="result-card">
      {/* CO₂ big display */}
      <div className="co2-display">
        <div className="label-tag label-tag--cyan" style={{ margin: '0 auto var(--s-4)', width: 'fit-content' }}>
          Your trip — {result.distance_km} km · {MODE_LABELS[result.mode]}
        </div>
        <div className="co2-value" style={{
          color: level === 'low' ? 'var(--c-primary)' : level === 'medium' ? 'var(--c-warning)' : 'var(--c-danger)',
          textShadow: level === 'low'
            ? '0 0 40px var(--c-primary-glow)'
            : level === 'medium'
            ? '0 0 40px rgba(245,158,11,0.3)'
            : '0 0 40px rgba(239,68,68,0.3)',
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(3rem, 10vw, 5.5rem)',
          fontWeight: 'var(--w-bold)',
          lineHeight: 1,
          letterSpacing: '-0.03em',
        }}>
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
      <div style={{ marginBottom: 'var(--s-4)' }}>
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
      <div className="section-header" style={{ marginBottom: 'var(--s-3)' }}>
        <span className="chart-title" style={{ marginBottom: 0 }}>
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
      <div style={{ display: 'flex', gap: 'var(--s-3)', marginTop: 'var(--s-6)' }}>
        <button
          id="log-trip-btn"
          type="button"
          className="btn btn--primary"
          style={{ flex: 1 }}
          onClick={onLog}
          disabled={saving}
          aria-label={isGuest ? 'Log trip locally (guest mode)' : 'Save trip to your account'}
        >
          {saving ? (
            <><div className="spinner" style={{ width: 16, height: 16 }} />Saving…</>
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
        <p style={{ marginTop: 'var(--s-3)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textAlign: 'center' }}>
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
        const guestTrips = stored ? JSON.parse(stored) : [];
        const newTrip = {
          ...result,
          id: `guest_${Date.now()}`,
          timestamp: new Date().toISOString()
        };
        guestTrips.unshift(newTrip);
        localStorage.setItem('carboncoach_guest_trips', JSON.stringify(guestTrips));
        
        setToast('Trip logged locally (sign in to save)');
        navigate('/dashboard');
      } else {
        await saveTrip(user.uid, result);
        setToast('Trip saved!');
        navigate('/dashboard');
      }
    } catch {
      setCalcError('Failed to save trip — please try again.');
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
                <span className="input-icon"><IconMapPin size={18} /></span>
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
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Destination */}
            <div className="form-group">
              <label htmlFor="destination-input" className="form-label form-label--required">
                To
              </label>
              <div className="input-wrap">
                <span className="input-icon"><IconFlag size={18} /></span>
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
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                />
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
          <div style={{ position: 'relative' }}>
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
