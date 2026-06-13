import { useState, useEffect } from 'react';
import { subscribeToTrips } from '../services/firestore';

/**
 * Real-time subscription to the current user's trips.
 * Updates automatically via Firestore onSnapshot.
 */
export function useTrips(uid) {
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setTrips([]);
      setTripsLoading(false);
      return;
    }

    setTripsLoading(true);
    const unsubscribe = subscribeToTrips(uid, (newTrips) => {
      setTrips(newTrips);
      setTripsLoading(false);
    });

    return unsubscribe;
  }, [uid]);

  return { trips, tripsLoading };
}
