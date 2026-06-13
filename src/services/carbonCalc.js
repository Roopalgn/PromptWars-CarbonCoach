import { EMISSIONS_FACTORS, COMPARISON_MODES } from '../config/emissionsFactors';

/**
 * Calculate CO₂ emissions for a given mode and distance.
 * @param {string} mode - transport mode key
 * @param {number} distanceKm - route distance in kilometres
 * @returns {number} kg CO₂ (rounded to 3 decimal places)
 */
export function calculateCO2(mode, distanceKm) {
  const factor = EMISSIONS_FACTORS[mode] ?? 0;
  return Math.round(factor * distanceKm * 1000) / 1000;
}

/**
 * Find the mode with the lowest non-zero emissions (excluding the user's chosen mode).
 * Zero-emission modes (walk/cycle) are shown separately — this returns the best
 * motorised/practical alternative for the comparison panel.
 * @param {string} chosenMode - the mode the user took
 * @returns {string} best practical alternative mode key
 */
export function getBestAlternative(chosenMode) {
  const motorisedModes = COMPARISON_MODES.filter(
    (m) => m !== chosenMode && EMISSIONS_FACTORS[m] > 0
  );
  if (motorisedModes.length === 0) return COMPARISON_MODES.find((m) => m !== chosenMode);
  return motorisedModes.reduce((best, m) =>
    EMISSIONS_FACTORS[m] < EMISSIONS_FACTORS[best] ? m : best
  );
}

/**
 * Calculate kg CO₂ saved if the user had taken the alternative.
 * @param {number} actualKg - actual emissions
 * @param {number} alternativeKg - alternative mode emissions
 * @returns {number} kg saved (can be negative if alternative is worse)
 */
export function getKgSaved(actualKg, alternativeKg) {
  return Math.round((actualKg - alternativeKg) * 100) / 100;
}

/**
 * Get all alternatives sorted by emissions (lowest first).
 * @param {string} chosenMode
 * @param {number} distanceKm
 * @returns {Array<{mode: string, kg: number}>}
 */
export function getAllAlternatives(chosenMode, distanceKm) {
  return COMPARISON_MODES
    .filter((m) => m !== chosenMode)
    .map((m) => {
      const val = calculateCO2(m, distanceKm);
      return { mode: m, kg: val, kg_co2: val };
    })
    .sort((a, b) => a.kg_co2 - b.kg_co2);
}
