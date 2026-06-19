import { describe, it, expect } from 'vitest';
import {
  roundCO2,
  formatKm,
  formatDate,
  formatDayLabel,
  getLast7Days,
  isThisWeek,
  formatShortAddress,
} from './formatters';

describe('formatters', () => {
  describe('roundCO2', () => {
    it('rounds CO2 to 2 decimal places', () => {
      expect(roundCO2(1.234)).toBe(1.23);
      expect(roundCO2(2.567)).toBe(2.57);
    });

    it('returns 0 for null/undefined', () => {
      expect(roundCO2(null)).toBe(0);
      expect(roundCO2(undefined)).toBe(0);
      expect(roundCO2('invalid')).toBe(0);
    });

    it('handles zero', () => {
      expect(roundCO2(0)).toBe(0);
    });

    it('handles negative values', () => {
      expect(roundCO2(-1.234)).toBe(-1.23);
    });

    it('handles very large values', () => {
      expect(roundCO2(9999.999)).toBe(10000);
    });
  });

  describe('formatKm', () => {
    it('rounds distance to 2 decimal places', () => {
      expect(formatKm(12.345)).toBe(12.35);
      expect(formatKm(0.567)).toBe(0.57);
    });

    it('returns 0 for null/undefined', () => {
      expect(formatKm(null)).toBe(0);
      expect(formatKm(undefined)).toBe(0);
    });

    it('handles zero', () => {
      expect(formatKm(0)).toBe(0);
    });

    it('handles very small values', () => {
      expect(formatKm(0.001)).toBe(0);
    });
  });

  describe('formatDate', () => {
    it('returns empty string for null/undefined', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });

    it('formats Date object correctly', () => {
      const date = new Date('2024-01-15T10:30:00');
      const result = formatDate(date);
      expect(result).toContain('15');
      expect(result).toContain('Jan');
    });

    it('formats Firestore Timestamp with toDate method', () => {
      const mockTimestamp = {
        toDate: () => new Date('2024-01-15T10:30:00'),
      };
      const result = formatDate(mockTimestamp);
      expect(result).toContain('15');
      expect(result).toContain('Jan');
    });

    it('returns empty string for invalid dates', () => {
      expect(formatDate(new Date('invalid'))).toBe('');
      expect(formatDate({ invalid: true })).toBe('');
    });

    it('handles timestamp number', () => {
      const timestamp = new Date('2024-01-15T10:30:00').getTime();
      const result = formatDate(timestamp);
      expect(result).toContain('15');
    });
  });

  describe('formatDayLabel', () => {
    it('returns weekday short label', () => {
      const monday = new Date('2024-01-15'); // Monday
      const result = formatDayLabel(monday);
      expect(['Mon', 'Monday']).toContain(result);
    });

    it('handles all days of week', () => {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      for (let i = 1; i <= 7; i++) {
        const date = new Date(`2024-01-${15 + i}`);
        const result = formatDayLabel(date);
        expect(days).toContain(result);
      }
    });
  });

  describe('getLast7Days', () => {
    it('returns array of 7 dates', () => {
      const result = getLast7Days();
      expect(result).toHaveLength(7);
    });

    it('returns dates in ascending order (oldest first)', () => {
      const result = getLast7Days();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].getTime()).toBeLessThanOrEqual(result[i + 1].getTime());
      }
    });

    it('returns dates at midnight', () => {
      const result = getLast7Days();
      result.forEach((date) => {
        expect(date.getHours()).toBe(0);
        expect(date.getMinutes()).toBe(0);
        expect(date.getSeconds()).toBe(0);
      });
    });

    it('includes today', () => {
      const result = getLast7Days();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expect(result[6].getTime()).toBe(today.getTime());
    });
  });

  describe('isThisWeek', () => {
    it('returns false for null/undefined', () => {
      expect(isThisWeek(null)).toBe(false);
      expect(isThisWeek(undefined)).toBe(false);
    });

    it('returns true for dates in current week', () => {
      const today = new Date();
      const result = isThisWeek(today);
      expect(result).toBe(true);
    });

    it('returns false for dates outside current week', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10);
      const result = isThisWeek(oldDate);
      expect(result).toBe(false);
    });

    it('handles Firestore Timestamp with toDate method', () => {
      const mockTimestamp = {
        toDate: () => new Date(),
      };
      const result = isThisWeek(mockTimestamp);
      expect(result).toBe(true);
    });
  });

  describe('formatShortAddress', () => {
    it('returns empty string for null/undefined', () => {
      expect(formatShortAddress(null)).toBe('');
      expect(formatShortAddress(undefined)).toBe('');
      expect(formatShortAddress('')).toBe('');
    });

    it('returns full address if no commas', () => {
      const address = 'New Delhi';
      expect(formatShortAddress(address)).toBe('New Delhi');
    });

    it('combines first two parts for short prefixes', () => {
      const address = 'Apt 5, New Delhi House, Delhi';
      const result = formatShortAddress(address);
      expect(result).toContain('Apt 5');
    });

    it('returns first part for long first parts', () => {
      const address = 'Connaught Place, Delhi, India';
      const result = formatShortAddress(address);
      expect(result).toContain('Connaught Place');
    });

    it('recognizes floor/room/flat patterns', () => {
      const address = 'Floor 3, Dwarka Residency, Delhi';
      const result = formatShortAddress(address);
      expect(result).toContain('Floor 3');
    });

    it('handles shop numbers', () => {
      const address = 'Shop No. 42, Market Street, Delhi';
      const result = formatShortAddress(address);
      expect(result).toContain('Shop No. 42');
    });
  });
});
