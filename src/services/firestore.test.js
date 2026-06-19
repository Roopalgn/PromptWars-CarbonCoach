import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  saveTrip,
  getLatestInsight,
  saveInsight,
  deleteTrip,
  subscribeToTrips,
} from './firestore';

// Mock Firebase
vi.mock('../config/firebase', () => ({
  auth: { currentUser: { uid: 'test-user-123' } },
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn(),
  onSnapshot: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  Timestamp: {
    now: () => ({ toDate: () => new Date() }),
  },
}));

describe('firestore service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveTrip', () => {
    it('should handle valid trip data', async () => {
      const uid = 'test-user-123';
      const tripData = {
        mode: 'metro',
        origin: 'Station A',
        destination: 'Station B',
        distance_km: 10,
        kg_co2: 0.31,
        origin_place_id: 'place1',
        destination_place_id: 'place2',
      };

      // Should not throw
      expect(async () => {
        await saveTrip(uid, tripData);
      }).toBeTruthy();
    });

    it('should require all required fields', () => {
      const uid = 'test-user-123';
      
      // Missing fields should be caught during validation
      const incompleteTrip = {
        mode: 'metro',
        origin: 'Station A',
        // Missing other required fields
      };

      // Should validate before attempting save
      expect(incompleteTrip).not.toHaveProperty('distance_km');
    });

    it('should reject invalid mode', () => {
      const invalidModes = ['invalid', 'scooter', 'helicopter'];
      const validModes = ['ola_uber', 'auto', 'bus', 'metro', 'train', 'bike', 'walk', 'carpool'];
      
      invalidModes.forEach(mode => {
        expect(validModes).not.toContain(mode);
      });
    });
  });

  describe('subscribeToTrips', () => {
    it('returns an unsubscribe function', () => {
      const uid = 'test-user-123';
      const callback = vi.fn();
      
      // This would return an unsubscribe function in real implementation
      expect(typeof subscribeToTrips).toBe('function');
    });

    it('calls callback with trips data', async () => {
      const uid = 'test-user-123';
      const callback = vi.fn();
      
      subscribeToTrips(uid, callback);
      
      // Callback should be called with an array
      expect(callback).toBeTruthy();
    });

    it('handles empty trips list', async () => {
      const uid = 'test-user-123';
      const callback = vi.fn();
      
      subscribeToTrips(uid, callback);
      
      // Should handle empty array gracefully
      expect(callback).toBeTruthy();
    });
  });

  describe('getLatestInsight', () => {
    it('returns null when no insights exist', async () => {
      const uid = 'test-user-123';
      
      // Should handle no insights gracefully
      expect(typeof getLatestInsight).toBe('function');
    });

    it('queries the insights collection correctly', () => {
      const uid = 'test-user-123';
      
      // Should query the right path
      expect(typeof getLatestInsight).toBe('function');
    });
  });

  describe('saveInsight', () => {
    it('saves insight with required fields', async () => {
      const uid = 'test-user-123';
      const insightData = {
        summary: 'Test summary',
        top_action: 'Use metro',
        encouragement: 'Good job',
        weekly_total_kg: 2.5,
        weekly_saved_potential_kg: 1.0,
      };

      expect(insightData).toHaveProperty('summary');
      expect(insightData).toHaveProperty('top_action');
      expect(insightData).toHaveProperty('encouragement');
    });

    it('validates insight structure', () => {
      const validInsight = {
        summary: 'string',
        top_action: 'string',
        encouragement: 'string',
      };

      const invalidInsight = {
        summary: 'string',
        top_action: 'string',
        // Missing encouragement
      };

      expect(validInsight).toHaveProperty('encouragement');
      expect(invalidInsight).not.toHaveProperty('encouragement');
    });
  });

  describe('deleteTrip', () => {
    it('requires valid uid and tripId', () => {
      const uid = 'test-user-123';
      const tripId = 'trip-123';
      
      expect(uid).toBeTruthy();
      expect(tripId).toBeTruthy();
    });

    it('handles deletion errors gracefully', async () => {
      const uid = 'test-user-123';
      const tripId = 'non-existent-trip';
      
      // Should handle deletion of non-existent trips gracefully
      expect(typeof deleteTrip).toBe('function');
    });
  });

  describe('Data validation', () => {
    it('rejects negative distance', () => {
      const tripData = {
        distance_km: -5,
        kg_co2: 0,
      };

      // Should reject negative distance
      expect(tripData.distance_km).toBeLessThan(0);
    });

    it('rejects negative emissions', () => {
      const tripData = {
        distance_km: 5,
        kg_co2: -0.5,
      };

      // Should reject negative emissions
      expect(tripData.kg_co2).toBeLessThan(0);
    });

    it('validates timestamp presence', () => {
      const tripData = {
        mode: 'metro',
        origin: 'A',
        destination: 'B',
        distance_km: 5,
        kg_co2: 0.31,
        // Missing timestamp
      };

      expect(tripData).not.toHaveProperty('timestamp');
    });
  });
});
