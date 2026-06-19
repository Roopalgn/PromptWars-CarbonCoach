import { describe, test, expect } from 'vitest';
import { calculateCO2, getBestAlternative, getKgSaved, getAllAlternatives } from './carbonCalc';
import { formatShortAddress } from '../utils/formatters';

describe('calculateCO2', () => {
  test('Ola trip of 5km = 0.715 kg', () => {
    expect(calculateCO2('ola_uber', 5)).toBeCloseTo(0.715);
  });

  test('Walking produces zero emissions', () => {
    expect(calculateCO2('walk', 10)).toBe(0);
  });

  test('Cycling produces zero emissions', () => {
    expect(calculateCO2('cycle', 10)).toBe(0);
  });

  test('Zero distance returns zero emissions', () => {
    expect(calculateCO2('ola_uber', 0)).toBe(0);
  });

  test('Negative distance returns zero', () => {
    expect(calculateCO2('ola_uber', -5)).toBe(0);
  });

  test('Invalid mode returns zero', () => {
    expect(calculateCO2('invalid_mode', 5)).toBe(0);
    expect(calculateCO2(null, 5)).toBe(0);
    expect(calculateCO2(undefined, 5)).toBe(0);
    expect(calculateCO2('', 5)).toBe(0);
  });

  test('Invalid distance returns zero', () => {
    expect(calculateCO2('auto', null)).toBe(0);
    expect(calculateCO2('auto', undefined)).toBe(0);
    expect(calculateCO2('auto', 'invalid')).toBe(0);
  });

  test('Bus is cheaper than auto per km', () => {
    expect(calculateCO2('bus', 10)).toBeLessThan(calculateCO2('auto', 10));
  });

  test('Carpool is cheaper than solo Ola per km', () => {
    expect(calculateCO2('carpool', 10)).toBeLessThan(calculateCO2('ola_uber', 10));
  });

  test('Large distances are handled correctly', () => {
    const result = calculateCO2('ola_uber', 1000);
    expect(result).toBeGreaterThan(100);
    expect(typeof result).toBe('number');
  });

  test('Very small distances are handled', () => {
    expect(calculateCO2('metro', 0.1)).toBeCloseTo(0.003);
  });
});

describe('getBestAlternative', () => {
  test('Metro is always the best alternative to Ola', () => {
    expect(getBestAlternative('ola_uber')).toBe('metro');
  });

  test('Returns a valid mode when chosen mode is excluded', () => {
    const best = getBestAlternative('metro');
    expect(best).toBeTruthy();
    expect(best).not.toBe('metro');
  });

  test('Excludes the chosen mode from alternatives', () => {
    const best = getBestAlternative('walk');
    expect(best).not.toBe('walk');
  });

  test('Prioritizes motorized modes over zero-emission', () => {
    const best = getBestAlternative('ola_uber');
    // Should return metro (motorized) not walk/cycle (zero-emission)
    expect(['metro', 'bus', 'train', 'carpool', 'auto']).toContain(best);
  });

  test('Handles all available transport modes', () => {
    const modes = ['ola_uber', 'auto', 'bus', 'metro', 'train', 'carpool', 'cycle', 'walk'];
    modes.forEach(mode => {
      const best = getBestAlternative(mode);
      expect(best).toBeTruthy();
      expect(best).not.toBe(mode);
    });
  });
});

describe('getKgSaved', () => {
  test('Savings calculation is correct', () => {
    expect(getKgSaved(1.4, 0.09)).toBeCloseTo(1.31);
  });

  test('Positive savings when choosing greener option', () => {
    expect(getKgSaved(1.0, 0.5)).toBe(0.5);
  });

  test('Negative savings when choosing worse option', () => {
    expect(getKgSaved(0.5, 1.0)).toBe(-0.5);
  });

  test('Zero savings for same mode', () => {
    expect(getKgSaved(1.0, 1.0)).toBe(0);
  });

  test('Handles zero values', () => {
    expect(getKgSaved(0, 0)).toBe(0);
    expect(getKgSaved(1.0, 0)).toBe(1.0);
    expect(getKgSaved(0, 1.0)).toBe(-1.0);
  });

  test('Rejects invalid inputs', () => {
    expect(getKgSaved(null, 1.0)).toBe(0);
    expect(getKgSaved(1.0, null)).toBe(0);
    expect(getKgSaved('invalid', 1.0)).toBe(0);
    expect(getKgSaved(1.0, undefined)).toBe(0);
  });

  test('Rounds to 2 decimal places', () => {
    expect(getKgSaved(1.234, 0.111)).toBeCloseTo(1.12);
  });
});

describe('getAllAlternatives', () => {
  test('Returns array for any valid mode', () => {
    const result = getAllAlternatives('ola_uber', 5);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  test('Excludes the chosen mode', () => {
    const result = getAllAlternatives('metro', 5);
    const modes = result.map(alt => alt.mode);
    expect(modes).not.toContain('metro');
  });

  test('Returns sorted by emissions (lowest first)', () => {
    const result = getAllAlternatives('auto', 10);
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].kg).toBeLessThanOrEqual(result[i + 1].kg);
    }
  });

  test('Each alternative has required properties', () => {
    const result = getAllAlternatives('ola_uber', 5);
    result.forEach(alt => {
      expect(alt).toHaveProperty('mode');
      expect(alt).toHaveProperty('kg');
      expect(typeof alt.mode).toBe('string');
      expect(typeof alt.kg).toBe('number');
    });
  });

  test('Handles zero distance', () => {
    const result = getAllAlternatives('auto', 0);
    expect(result.every(alt => alt.kg === 0)).toBe(true);
  });

  test('Large distance produces correct alternatives', () => {
    const result = getAllAlternatives('ola_uber', 100);
    expect(result.some(alt => alt.kg > 5)).toBe(true);
  });
});

describe('formatShortAddress', () => {
  test('returns normal short addresses', () => {
    expect(formatShortAddress('vidhya gayatri homes, 7th cross road, green garden layout')).toBe('vidhya gayatri homes');
    expect(formatShortAddress('Medchal Rd, Kandlakoya Village, Hyderabad')).toBe('Medchal Rd');
  });

  test('combines short room/floor prefixes', () => {
    expect(formatShortAddress('2nd floor, 134, 17th Cross Road')).toBe('2nd floor, 134');
    expect(formatShortAddress('239/240, Bellary Rd, Indra Nagar')).toBe('239/240, Bellary Rd');
  });
});

test('getAllAlternatives sorts by emissions ascending', () => {
  const alts = getAllAlternatives('ola_uber', 10);
  for (let i = 1; i < alts.length; i++) {
    expect(alts[i].kg_co2).toBeGreaterThanOrEqual(alts[i - 1].kg_co2);
  }
  expect(alts.find((a) => a.mode === 'ola_uber')).toBeUndefined(); // excludes chosen mode
});

