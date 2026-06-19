import { memo } from 'react';

/**
 * Key Performance Indicator Card component.
 * Displays a single metric value, unit, label, and icon in a stylized container.
 *
 * @param {Object} props - Component props
 * @param {JSX.Element} props.icon - Icon element for visual representation
 * @param {string|number} props.value - Numeric statistic value
 * @param {string} [props.unit] - Units of the value
 * @param {string} props.label - Explanatory stat label
 * @param {string} props.colorClass - CSS modifier class for card coloring
 * @param {string} props.iconClass - CSS modifier class for icon coloring
 * @returns {JSX.Element}
 */
const KpiCard = memo(function KpiCard({ icon, value, unit, label, colorClass, iconClass }) {
  return (
    <div className={`kpi-card kpi-card--${colorClass}`}>
      <div className={`kpi-icon kpi-icon--${iconClass}`} aria-hidden="true">
        {icon}
      </div>
      <div className="kpi-value" aria-label={`${value} ${unit}`}>
        {value}
        {unit && <span className="kpi-unit">{unit}</span>}
      </div>
      <div className="kpi-label">{label}</div>
    </div>
  );
});

export default KpiCard;
