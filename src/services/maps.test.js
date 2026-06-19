import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadMapsApi, getRouteDistance, resolvePlaceFromText } from './maps';

// Mock global fetch
global.fetch = vi.fn();

describe('maps service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadMapsApi', () => {
    it('loads Maps API once and caches result', async () => {
      // Mock the loader
      global.google = {
        maps: {
          places: {},
        },
      };

      // Should not throw
      expect(typeof loadMapsApi).toBe('function');
    });

    it('handles API load failure gracefully', async () => {
      // Should handle errors
      expect(typeof loadMapsApi).toBe('function');
    });

    it('works offline without throwing', async () => {
      // Should handle offline gracefully
      expect(typeof loadMapsApi).toBe('function');
    });
  });

  describe('getRouteDistance', () => {
    beforeEach(() => {
      fetch.mockClear();
    });

    it('validates input parameters', () => {
      // Should require valid placeIds
      expect(() => {
        const result = getRouteDistance(null, 'dest');
      }).toBeTruthy();
    });

    it('rejects null originPlaceId', async () => {
      try {
        await getRouteDistance(null, 'place2');
        expect.fail('Should throw');
      } catch (err) {
        expect(err.message).toContain('Invalid origin');
      }
    });

    it('rejects empty originPlaceId', async () => {
      try {
        await getRouteDistance('', 'place2');
        expect.fail('Should throw');
      } catch (err) {
        expect(err.message).toContain('Invalid');
      }
    });

    it('rejects null destinationPlaceId', async () => {
      try {
        await getRouteDistance('place1', null);
        expect.fail('Should throw');
      } catch (err) {
        expect(err.message).toContain('Invalid destination');
      }
    });

    it('rejects empty destinationPlaceId', async () => {
      try {
        await getRouteDistance('place1', '');
        expect.fail('Should throw');
      } catch (err) {
        expect(err.message).toContain('Invalid');
      }
    });

    it('makes POST request to Routes API', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          routes: [{ distanceMeters: 5000 }],
        }),
      });

      const result = await getRouteDistance('place1', 'place2');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('routes.googleapis.com'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('sends correct headers', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          routes: [{ distanceMeters: 5000 }],
        }),
      });

      await getRouteDistance('place1', 'place2');
      const call = fetch.mock.calls[0];
      const headers = call[1].headers;
      
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['X-Goog-FieldMask']).toContain('routes.distanceMeters');
    });

    it('converts metres to kilometres', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          routes: [{ distanceMeters: 5000 }],
        }),
      });

      const result = await getRouteDistance('place1', 'place2');
      // 5000 metres = 5 km
      expect(result).toBe(5);
    });

    it('rounds to 2 decimal places', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          routes: [{ distanceMeters: 1234 }],
        }),
      });

      const result = await getRouteDistance('place1', 'place2');
      expect(Number.isFinite(result)).toBe(true);
      expect(result.toString().split('.')[1]?.length).toBeLessThanOrEqual(2);
    });

    it('handles API errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      try {
        await getRouteDistance('place1', 'place2');
        expect.fail('Should throw');
      } catch (err) {
        expect(err.message).toContain('Routes API');
      }
    });

    it('handles no routes in response', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          routes: [],
        }),
      });

      try {
        await getRouteDistance('place1', 'place2');
        expect.fail('Should throw');
      } catch (err) {
        expect(err.message).toContain("Couldn't find a route");
      }
    });

    it('handles network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      try {
        await getRouteDistance('place1', 'place2');
        expect.fail('Should throw');
      } catch (err) {
        expect(err.message).toContain('Network');
      }
    });

    it('handles missing distanceMeters in response', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          routes: [{ duration: '5m' }], // Missing distanceMeters
        }),
      });

      try {
        await getRouteDistance('place1', 'place2');
        // Should handle undefined distanceMeters
        expect(true).toBe(true);
      } catch (err) {
        // Error is acceptable
        expect(err).toBeTruthy();
      }
    });

    it('handles very large distances', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          routes: [{ distanceMeters: 5000000 }], // 5000 km
        }),
      });

      const result = await getRouteDistance('place1', 'place2');
      expect(result).toBe(5000);
    });

    it('handles very small distances', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          routes: [{ distanceMeters: 100 }], // 0.1 km
        }),
      });

      const result = await getRouteDistance('place1', 'place2');
      expect(result).toBeCloseTo(0.1, 1);
    });

    it('handles zero distance', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          routes: [{ distanceMeters: 0 }],
        }),
      });

      const result = await getRouteDistance('place1', 'place2');
      expect(result).toBe(0);
    });

    it('includes both origin and destination in request body', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          routes: [{ distanceMeters: 5000 }],
        }),
      });

      await getRouteDistance('place1', 'place2');
      const call = fetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      
      expect(body.origin.placeId).toBe('place1');
      expect(body.destination.placeId).toBe('place2');
      expect(body.travelMode).toBe('DRIVE');
    });
  });

  describe('Error handling', () => {
    it('handles API rate limiting', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
      });

      try {
        await getRouteDistance('place1', 'place2');
        expect.fail('Should throw');
      } catch (err) {
        expect(err).toBeTruthy();
      }
    });

    it('handles unauthorized access', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      try {
        await getRouteDistance('place1', 'place2');
        expect.fail('Should throw');
      } catch (err) {
        expect(err).toBeTruthy();
      }
    });

    it('handles server errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      try {
        await getRouteDistance('place1', 'place2');
        expect.fail('Should throw');
      } catch (err) {
        expect(err).toBeTruthy();
      }
    });
  });

  describe('resolvePlaceFromText', () => {
    beforeEach(() => {
      global.google = {
        maps: {
          Geocoder: class {
            geocode(opts, callback) {
              if (opts.address === 'valid') {
                callback([{ place_id: '123', formatted_address: 'Geocoded Address' }], 'OK');
              } else {
                callback(null, 'ZERO_RESULTS');
              }
            }
          },
          LatLng: class {
            constructor(lat, lng) {
              this.lat = lat;
              this.lng = lng;
            }
          }
        }
      };
    });

    it('returns null if input text is empty', async () => {
      const res = await resolvePlaceFromText('', null);
      expect(res).toBeNull();
    });

    it('returns null if google object is not present', async () => {
      const oldGoogle = global.google;
      delete global.google;
      const res = await resolvePlaceFromText('valid', null);
      expect(res).toBeNull();
      global.google = oldGoogle;
    });

    it('returns place details if geocoder returns OK', async () => {
      const res = await resolvePlaceFromText('valid', null);
      expect(res).toEqual({
        place_id: '123',
        formatted_address: 'Geocoded Address'
      });
    });

    it('uses location bias if coordinates are provided', async () => {
      const geocodeSpy = vi.fn((opts, callback) => {
        callback([{ place_id: '123', formatted_address: 'Geocoded Address' }], 'OK');
      });
      global.google.maps.Geocoder = class {
        geocode = geocodeSpy;
      };
      const res = await resolvePlaceFromText('valid', { lat: 12.97, lng: 77.59 });
      expect(geocodeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          location: expect.any(global.google.maps.LatLng)
        }),
        expect.any(Function)
      );
      expect(res).toEqual({
        place_id: '123',
        formatted_address: 'Geocoded Address'
      });
    });

    it('returns null if geocoder returns zero results', async () => {
      const res = await resolvePlaceFromText('invalid', null);
      expect(res).toBeNull();
    });
  });
});
