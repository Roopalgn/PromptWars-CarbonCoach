import { useState, useEffect } from 'react';
import { subscribeToTrips } from '../services/firestore';

/**
 * Custom hook for real-time subscription to the current user's trips.
 * Updates automatically via Firestore onSnapshot or loads from localStorage for guests.
 * 
 * @param {string|null|undefined} uid - The current user's UID (or 'guest')
 * @returns {{
 *   trips: Array<Object>,
 *   tripsLoading: boolean
 * }} The list of trips and loading state
 */
export function useTrips(uid) {
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      Promise.resolve().then(() => {
        setTrips([]);
        setTripsLoading(false);
      });
      return;
    }

    if (uid === 'guest') {
      const loadGuestTrips = () => {
        setTripsLoading(true);
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

      Promise.resolve().then(() => {
        loadGuestTrips();
      });

      // Listen for updates from other tabs/screens
      window.addEventListener('storage', loadGuestTrips);
      return () => window.removeEventListener('storage', loadGuestTrips);
    }

    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        setTripsLoading(true);
      }
    });
    const unsubscribe = subscribeToTrips(uid, (newTrips) => {
      setTrips(newTrips);
      setTripsLoading(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [uid]);

  return { trips, tripsLoading };
}
