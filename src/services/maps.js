import { Loader } from '@googlemaps/js-api-loader';

let loader = null;
let mapsLoaded = false;

/**
 * Load the Google Maps JS API once and cache the result.
 * @returns {Promise<void>}
 */
export async function loadMapsApi() {
  if (mapsLoaded) return;
  if (!loader) {
    loader = new Loader({
      apiKey: import.meta.env.VITE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places'],
    });
  }
  await loader.load();
  mapsLoaded = true;
}

/**
 * Call the Google Maps Routes API to get actual road distance between two places.
 * @param {string} originPlaceId - Google Places placeId for origin
 * @param {string} destinationPlaceId - Google Places placeId for destination
 * @returns {Promise<number>} distance in km (rounded to 2 decimal places)
 * @throws {Error} if the API call fails or no route is found
 */
export async function getRouteDistance(originPlaceId, destinationPlaceId) {
  const response = await fetch(
    'https://routes.googleapis.com/directions/v2:computeRoutes',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': import.meta.env.VITE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration',
      },
      body: JSON.stringify({
        origin:      { placeId: originPlaceId },
        destination: { placeId: destinationPlaceId },
        travelMode:  'DRIVE',
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Routes API returned ${response.status} — check your connection.`);
  }

  const data = await response.json();

  if (!data.routes || data.routes.length === 0) {
    throw new Error("Couldn't find a route between these locations.");
  }

  const distanceMeters = data.routes[0].distanceMeters;
  return Math.round(distanceMeters / 10) / 100; // metres → km, 2 dp
}
