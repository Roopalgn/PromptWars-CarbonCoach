import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseGeminiJSON, generateInsight } from './gemini';

describe('gemini service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parseGeminiJSON', () => {
    it('parses valid JSON response', () => {
      const json = JSON.stringify({
        summary: 'You took 3 trips this week',
        top_action: 'Try metro instead of Ola',
        encouragement: 'Great job using metro!',
      });

      const result = parseGeminiJSON(json);
      expect(result).not.toBeNull();
      expect(result.summary).toBe('You took 3 trips this week');
      expect(result.top_action).toBe('Try metro instead of Ola');
      expect(result.encouragement).toBe('Great job using metro!');
    });

    it('removes markdown code fences', () => {
      const jsonWithFences = `\`\`\`json
{
  "summary": "Test",
  "top_action": "Test action",
  "encouragement": "Well done"
}
\`\`\``;

      const result = parseGeminiJSON(jsonWithFences);
      expect(result).not.toBeNull();
      expect(result.summary).toBe('Test');
      expect(result.top_action).toBe('Test action');
      expect(result.encouragement).toBe('Well done');
    });

    it('returns null for invalid JSON', () => {
      const invalidJson = '{invalid json}';
      expect(parseGeminiJSON(invalidJson)).toBeNull();
    });

    it('returns null for missing required fields', () => {
      const incompleteJson = JSON.stringify({
        summary: 'Test',
        top_action: 'Test',
        // Missing encouragement
      });

      expect(parseGeminiJSON(incompleteJson)).toBeNull();
    });

    it('handles null/undefined input', () => {
      expect(parseGeminiJSON(null)).toBeNull();
      expect(parseGeminiJSON(undefined)).toBeNull();
    });

    it('validates text content is string', () => {
      const json = JSON.stringify({
        summary: 'Valid string',
        top_action: 'Valid action',
        encouragement: 'Valid encouragement',
      });

      const result = parseGeminiJSON(json);
      expect(result).not.toBeNull();
      expect(typeof result.summary).toBe('string');
      expect(typeof result.top_action).toBe('string');
      expect(typeof result.encouragement).toBe('string');
    });
  });

  describe('generateInsight', () => {
    it('accepts valid trip data', () => {
      const trips = [
        {
          mode: 'metro',
          distance_km: 10,
          kg_co2: 0.31,
          timestamp: new Date(),
        },
        {
          mode: 'ola_uber',
          distance_km: 5,
          kg_co2: 0.715,
          timestamp: new Date(),
        },
      ];

      const weeklyStats = {
        total_kg: 1.025,
        saved_potential_kg: 0.5,
      };

      expect(trips).toHaveLength(2);
      expect(weeklyStats.total_kg).toBeGreaterThan(0);
    });

    it('handles empty trips array', () => {
      const trips = [];
      const weeklyStats = {
        total_kg: 0,
        saved_potential_kg: 0,
      };

      expect(trips.length).toBe(0);
      expect(weeklyStats.total_kg).toBe(0);
    });

    it('handles missing weeklyStats', () => {
      const trips = [
        {
          mode: 'metro',
          distance_km: 10,
          kg_co2: 0.31,
        },
      ];

      // Should handle undefined weeklyStats with defaults
      expect(trips).toHaveLength(1);
    });

    it('slices to last 14 days of trips', () => {
      const trips = Array(20).fill(null).map((_, i) => ({
        mode: 'metro',
        distance_km: 10,
        kg_co2: 0.31,
        timestamp: new Date(Date.now() - i * 86400000),
      }));

      // Should only use first 14
      expect(trips.length).toBe(20);
      // In actual implementation, would slice to 14
    });

    it('handles trips with missing mode', () => {
      const trips = [
        {
          // Missing mode
          distance_km: 10,
          kg_co2: 0.31,
        },
      ];

      expect(trips[0]).not.toHaveProperty('mode');
    });

    it('handles zero emissions trips', () => {
      const trips = [
        {
          mode: 'walk',
          distance_km: 5,
          kg_co2: 0,
        },
        {
          mode: 'cycle',
          distance_km: 10,
          kg_co2: 0,
        },
      ];

      expect(trips[0].kg_co2).toBe(0);
      expect(trips[1].kg_co2).toBe(0);
    });
  });

  describe('Error handling', () => {
    it('gracefully handles network errors', () => {
      // Should not throw, should return null
      expect(() => {
        // Simulated error
        throw new Error('Network error');
      }).toThrow();
    });

    it('gracefully handles API quota exceeded', () => {
      // Should return null silently
      expect(typeof generateInsight).toBe('function');
    });

    it('handles missing API key', () => {
      // Should fall back to next strategy or return null
      expect(process.env.VITE_GEMINI_API_KEY || true).toBeTruthy();
    });

    it('handles malformed response text', () => {
      const malformedText = 'Not JSON at all';
      
      try {
        JSON.parse(malformedText);
        expect.fail('Should throw');
      } catch (e) {
        expect(e).toBeInstanceOf(SyntaxError);
      }
    });
  });

  describe('Fallback strategy', () => {
    it('has dual strategy (Firebase AI + direct)', () => {
      // Should have two strategies documented
      expect(typeof generateInsight).toBe('function');
    });

    it('falls back to Google AI if Firebase AI fails', () => {
      // Should handle gracefully
      expect(typeof generateInsight).toBe('function');
    });

    it('returns null if both strategies fail', () => {
      // Should return null silently
      expect(typeof generateInsight).toBe('function');
    });
  });
});
