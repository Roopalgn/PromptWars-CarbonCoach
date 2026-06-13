import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Subscribe to real-time trip updates for a user.
 * @param {string} uid - Firebase user ID
 * @param {function} callback - called with Trip[] on every update
 * @returns {function} unsubscribe function
 */
export function subscribeToTrips(uid, callback) {
  const q = query(
    collection(db, 'users', uid, 'trips'),
    orderBy('timestamp', 'desc'),
    limit(50)
  );
  return onSnapshot(q, (snapshot) => {
    const trips = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(trips);
  });
}

/**
 * Save a new trip to Firestore.
 * @param {string} uid
 * @param {Object} tripData
 * @returns {Promise<DocumentReference>}
 */
export async function saveTrip(uid, tripData) {
  // Strip whitespace from string fields before saving
  const sanitised = {
    origin:                   tripData.origin.trim(),
    destination:              tripData.destination.trim(),
    origin_place_id:          tripData.origin_place_id,
    destination_place_id:     tripData.destination_place_id,
    mode:                     tripData.mode,
    distance_km:              tripData.distance_km,
    kg_co2:                   tripData.kg_co2,
    best_alternative_mode:    tripData.best_alternative_mode,
    best_alternative_kg:      tripData.best_alternative_kg,
    kg_saved_if_alt:          tripData.kg_saved_if_alt,
    timestamp:                serverTimestamp(),
  };
  return addDoc(collection(db, 'users', uid, 'trips'), sanitised);
}

/**
 * Save or overwrite the latest AI insight for a user.
 * @param {string} uid
 * @param {Object} insightData - { summary, top_action, encouragement }
 */
export async function saveInsight(uid, insightData) {
  const ref = doc(db, 'users', uid, 'insights', 'latest');
  return setDoc(ref, {
    ...insightData,
    weekly_total_kg:          insightData.weekly_total_kg ?? 0,
    weekly_saved_potential_kg: insightData.weekly_saved_potential_kg ?? 0,
    generated_at:             serverTimestamp(),
  });
}

/**
 * Get the latest AI insight for a user.
 * @param {string} uid
 * @returns {Promise<Object|null>}
 */
export async function getLatestInsight(uid) {
  const ref = doc(db, 'users', uid, 'insights', 'latest');
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

/**
 * Delete a trip from Firestore.
 * @param {string} uid
 * @param {string} tripId
 * @returns {Promise<void>}
 */
export async function deleteTrip(uid, tripId) {
  const ref = doc(db, 'users', uid, 'trips', tripId);
  return deleteDoc(ref);
}
