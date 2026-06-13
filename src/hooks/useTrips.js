import { useState, useEffect } from 'react';
import { subscribeToTrips } from '../services/firestore';

/**
 * Real-time subscription to the current user's trips.
 * Updates automatically via Firestore onSnapshot or loads from localStorage for guests.
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

    if (uid === 'guest') {
      setTripsLoading(true);
      const loadGuestTrips = () => {
        const stored = localStorage.getItem('carboncoach_guest_trips');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setTrips(Array.isArray(parsed) ? parsed : []);
          } catch (e) {
            console.error('Error parsing guest trips', e);
            setTrips([]);
          }
        } else {
          setTrips([]);
        }
        setTripsLoading(false);
      };

      loadGuestTrips();

      // Listen for updates from other tabs/screens
      window.addEventListener('storage', loadGuestTrips);
      return () => window.removeEventListener('storage', loadGuestTrips);
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
