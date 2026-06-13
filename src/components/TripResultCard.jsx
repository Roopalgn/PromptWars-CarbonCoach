import { MODE_LABELS } from '../config/emissionsFactors';
import { ModeIcon, IconLeaf, IconTrendingDown } from './Icons';
import { roundCO2 } from '../utils/formatters';

/**
 * Trip result card — the app's core "wow moment".
 * Slides in after calculation showing actual CO₂ vs best alternative.
 * Style: Organic Biophilic — glassmorphism, animated entrance.
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

  // Traffic-light color for CO₂ value
  const co2Color =
    kg_co2 > 3 ? 'var(--color-co2-high)'
    : kg_co2 > 1 ? 'var(--color-co2-med)'
    : 'var(--color-co2-low)';

  return (
    <div className="result-card" role="region" aria-label="Trip carbon calculation result">
      {/* Route */}
      <p className="result-route" aria-label={`Trip from ${origin} to ${destination}`}>
        {origin} <span style={{ color: 'var(--color-text-muted)', margin: '0 4px' }}>→</span> {destination}
      </p>

      {/* CO₂ big display */}
      <div className="result-co2-block">
        <div
          className="result-co2-value"
          style={{ color: co2Color }}
          aria-label={`${roundCO2(kg_co2)} kilograms CO₂`}
        >
          {roundCO2(kg_co2)}
          <span style={{ fontSize: '0.45em', fontWeight: 400, color: 'var(--color-text-secondary)', marginLeft: '4px' }}>
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
          <div style={{
            width: 40, height: 40,
            background: 'linear-gradient(135deg, rgba(22,163,74,0.15), rgba(22,163,74,0.05))',
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-accent)',
            flexShrink: 0,
          }}>
            <ModeIcon mode={best_alternative_mode} size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: 'var(--color-foreground)', fontFamily: 'var(--font-display)' }}>
              {MODE_LABELS[best_alternative_mode]}
            </p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '2px', fontWeight: 'var(--weight-medium)' }}>
              {roundCO2(best_alternative_kg)} kg CO₂
              {savedPositive && (
                <span style={{ color: 'var(--color-accent)', fontWeight: 'var(--weight-bold)', marginLeft: 6 }}>
                  · saves {roundCO2(kg_saved_if_alt)} kg
                </span>
              )}
            </p>
          </div>
          {savedPositive && (
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-accent)' }}>
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
