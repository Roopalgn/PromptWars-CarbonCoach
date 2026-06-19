import { MODE_LABELS } from '../config/emissionsFactors';
import { ModeIcon, IconLeaf, IconTrendingDown } from './Icons';
import { roundCO2 } from '../utils/formatters';

/**
 * TripResultCard component — displays the carbon calculation results.
 * Shows the actual CO₂ of the trip versus the best alternative mode.
 * Slides in with an animated entrance and premium biophilic glassmorphism styling.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.result - The trip calculation result object
 * @param {string} props.result.mode - Chosen travel mode
 * @param {string} props.result.origin - Starting location name
 * @param {string} props.result.destination - Destination location name
 * @param {number} props.result.distance_km - Distance of the trip in kilometers
 * @param {number} props.result.kg_co2 - CO2 emissions in kilograms
 * @param {string} props.result.best_alternative_mode - Best alternative travel mode
 * @param {number} props.result.best_alternative_kg - CO2 emissions of the alternative mode
 * @param {number} props.result.kg_saved_if_alt - Kilograms of CO2 saved if alternative was used
 * @param {function} props.onLog - Callback when user logs the trip
 * @param {function} props.onReset - Callback when user resets/calculates another trip
 * @returns {JSX.Element}
 */
export default function TripResultCard({ result, onLog, onReset }) {
  const {
    mode,
    origin,
    destination,
    distance_km,
    kg_co2,
    best_alternative_mode,
    best_alternative_kg,
    kg_saved_if_alt,
  } = result;

  const savedPositive = kg_saved_if_alt > 0;

  // Traffic-light color for CO₂ value using design system variables
  const co2Color =
    kg_co2 > 3 ? 'var(--c-danger)'
    : kg_co2 > 1 ? 'var(--c-warning)'
    : 'var(--c-primary)';

  return (
    <div className="result-card" role="region" aria-label="Trip carbon calculation result">
      {/* Route */}
      <p className="result-route" aria-label={`Trip from ${origin} to ${destination}`}>
        {origin} <span className="result-route-arrow">→</span> {destination}
      </p>

      {/* CO₂ big display */}
      <div className="result-co2-block">
        <div
          className="result-co2-value"
          style={{ color: co2Color }}
          aria-label={`${roundCO2(kg_co2)} kilograms CO₂`}
        >
          {roundCO2(kg_co2)}
          <span className="result-co2-unit">
            kg CO₂
          </span>
        </div>
        <p className="result-co2-label">
          via {MODE_LABELS[mode]} · {roundCO2(distance_km)} km
        </p>
      </div>

      {/* Best alternative */}
      <div className="result-alt-section" aria-label="Best alternative transport mode">
        <p className="result-alt-label">
          {savedPositive ? '🌿 Switch to save' : '✅ Already optimal'}
        </p>
        <div className="result-alt-card">
          <div className="result-alt-icon-box">
            <ModeIcon mode={best_alternative_mode} size={20} />
          </div>
          <div className="flex-1">
            <p className="result-alt-title">
              {MODE_LABELS[best_alternative_mode]}
            </p>
            <p className="result-alt-subtitle">
              {roundCO2(best_alternative_kg)} kg CO₂
              {savedPositive && (
                <span className="result-alt-savings">
                  · saves {roundCO2(kg_saved_if_alt)} kg
                </span>
              )}
            </p>
          </div>
          {savedPositive && (
            <div className="result-alt-check">
              <IconLeaf size={18} />
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="result-actions">
        <button
          id="log-trip-btn"
          type="button"
          className="btn btn--primary btn--full"
          onClick={onLog}
          aria-label="Log this trip and go to your dashboard"
        >
          Log this trip
          <IconTrendingDown size={18} />
        </button>
        <button
          id="reset-trip-btn"
          type="button"
          className="btn btn--ghost btn--full"
          onClick={onReset}
          aria-label="Calculate a different trip"
        >
          Try another trip
        </button>
      </div>
    </div>
  );
}
