import { MODE_LABELS } from '../config/emissionsFactors';
import { ModeIcon, IconLeaf, IconTrendingDown } from './Icons';
import { roundCO2 } from '../utils/formatters';

/**
 * Trip result card — the app's core "wow moment".
 * Slides in after calculation showing actual CO₂ vs best alternative.
 * Comparison panel is always visible, never behind a click (Rule 9).
 */
export default function TripResultCard({ result, onLog, onReset }) {
  const {
    mode,
    distance_km,
    kg_co2,
    best_alternative_mode,
    best_alternative_kg,
    kg_saved_if_alt,
  } = result;

  const savedPositive = kg_saved_if_alt > 0;

  return (
    <div className="result-card" role="region" aria-label="Trip carbon calculation result">
      {/* Actual trip section */}
      <div className="result-section result-section--actual">
        <p className="result-label">You used</p>
        <div className="result-mode-row">
          <ModeIcon mode={mode} size={18} />
          <span>{MODE_LABELS[mode]}</span>
          <span className="result-distance">{roundCO2(distance_km)} km</span>
        </div>
        <p className="result-co2" aria-label={`${roundCO2(kg_co2)} kilograms CO₂`}>
          <span className="co2-number">{roundCO2(kg_co2)}</span>
          <span className="co2-unit"> kg CO₂</span>
        </p>
      </div>

      {/* Best alternative section — always visible */}
      <div className={`result-section result-section--alt${savedPositive ? ' result-section--alt-better' : ''}`}>
        <p className="result-label">Best alternative</p>
        <div className="result-mode-row">
          <ModeIcon mode={best_alternative_mode} size={18} />
          <span>{MODE_LABELS[best_alternative_mode]}</span>
        </div>
        <p className="result-co2 result-co2--alt" aria-label={`${roundCO2(best_alternative_kg)} kilograms CO₂`}>
          <span className="co2-number">{roundCO2(best_alternative_kg)}</span>
          <span className="co2-unit"> kg CO₂</span>
        </p>
        {savedPositive && (
          <p className="result-savings" aria-label={`Saves ${roundCO2(kg_saved_if_alt)} kilograms CO₂`}>
            <IconLeaf size={14} />
            Saves {roundCO2(kg_saved_if_alt)} kg CO₂
          </p>
        )}
        {!savedPositive && kg_co2 === 0 && (
          <p className="result-savings" aria-label="Zero emissions trip">
            <IconLeaf size={14} />
            Zero emissions — great choice!
          </p>
        )}
      </div>

      {/* CTA actions */}
      <div className="result-actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={onLog}
          aria-label="Log this trip and go to your dashboard"
        >
          Log this trip
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <IconTrendingDown size={16} />
          </span>
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onReset}
          aria-label="Calculate a different trip"
        >
          Try another trip
        </button>
      </div>
    </div>
  );
}
