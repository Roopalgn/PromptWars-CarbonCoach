import { MODE_LABELS } from '../config/emissionsFactors';
import { MODE_BAR_CLASS } from '../config/constants';
import { roundCO2 } from '../utils/formatters';
import { IconSave, IconRefresh, IconBarChart2 } from './Icons';

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
 * Trip Result Card displaying calculated carbon emission values,
 * alternative mode comparisons, and logs/saves controls.
 *
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
export default function TripResultCard({ result, onLog, onReset, saving, isGuest }) {
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
          <IconBarChart2 size={14} />
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
