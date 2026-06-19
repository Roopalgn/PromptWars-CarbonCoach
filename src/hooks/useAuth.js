import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

/**
 * Custom hook to manage Firebase Google Authentication state.
 * 
 * - user === undefined  → auth state still loading
 * - user === null       → not authenticated
 * - user === object     → authenticated Firebase User
 * 
 * @returns {{
 *   user: import('firebase/auth').User|null|undefined,
 *   authError: string|null,
 *   signIn: function(): Promise<void>,
 *   signOutUser: function(): Promise<void>
 * }} Authentication status and helper functions
 */
export function useAuth() {
  const [user, setUser] = useState(undefined);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u ?? null);
    });
    return unsubscribe;
  }, []);

  async function signIn() {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setAuthError('Sign-in failed. Please try again.');
    }
  }

  async function signOutUser() {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
  }

  return { user, authError, signIn, signOutUser };
}
