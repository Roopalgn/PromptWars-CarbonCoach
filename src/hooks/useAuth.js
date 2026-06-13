import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

/**
 * Provides Google auth state and sign-in/out helpers.
 * user === undefined  → auth state still loading
 * user === null       → not authenticated
 * user === object     → authenticated Firebase User
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
    } catch {
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
