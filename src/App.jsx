import { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LandingScreen   from './screens/LandingScreen';
import LogTripScreen   from './screens/LogTripScreen';
import DashboardScreen from './screens/DashboardScreen';
import ProfileScreen   from './screens/ProfileScreen';
import { GUEST_USER } from './config/constants';
import LoadingShell from './components/LoadingShell';
import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import BgCanvas from './components/BgCanvas';

/**
 * @file App.jsx
 * @description Main application entry point handling routing, global layout, and auth state.
 */



/**
 * Alert SVG Icon component.
 * @param {Object} props - Component props
 * @param {number} [props.size=18] - Width/height of the icon
 * @returns {JSX.Element}
 */
function IconAlert({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}



/**
 * Toast alert component shown to unauthenticated guests.
 * Automatically dismisses itself after 5 seconds.
 * @param {Object} props - Component props
 * @param {string} props.message - Toast notification text
 * @param {function} props.onDone - Callback triggered upon dismissal
 * @returns {JSX.Element}
 */
function GuestToast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 5000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="toast-container" aria-live="polite">
      <div className="toast toast--warning" role="status">
        <IconAlert size={16} />
        <span>{message}</span>
      </div>
    </div>
  );
}

/**
 * Navigation sidebar used in desktop viewports.
 * Displays user identity summary and auth control buttons.
 * @param {Object} props - Component props
 * @param {Object} props.user - Active user object (or GUEST_USER)
 * @param {function} props.onSignOut - Sign-out handler
 * @param {function} props.onSignIn - Google sign-in handler
 * @param {boolean} props.isGuest - Active guest mode status flag
 * @returns {JSX.Element}
 */








/**
 * Root component that bootstraps application layout, routing paths, and global providers.
 * @returns {JSX.Element}
 */
export default function App() {
  const { user, authError, signIn, signOutUser } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [isGuest, setIsGuest]     = useState(false);
  const [showGuestToast, setShowGuestToast] = useState(false);

  async function handleSignIn() {
    setSigningIn(true);
    setIsGuest(false);
    setShowGuestToast(false);
    await signIn();
    setSigningIn(false);
  }

  function handleGuestMode() {
    setIsGuest(true);
    setShowGuestToast(true);
  }

  function handleSignOut() {
    setIsGuest(false);
    setShowGuestToast(false);
    signOutUser();
  }

  // Auth still resolving
  if (user === undefined) {
    return (
      <>
        <BgCanvas />
        <LoadingShell />
      </>
    );
  }

  // Not signed in and not guest → show landing
  if (!user && !isGuest) {
    return (
      <>
        <BgCanvas />
        <LandingScreen
          onSignIn={handleSignIn}
          onGuestMode={handleGuestMode}
          authError={authError}
          signingIn={signingIn}
        />
      </>
    );
  }

  const activeUser = user || GUEST_USER;

  return (
    <HashRouter>
      <BgCanvas />

      {/* Guest Toast (popup briefly once) */}
      {showGuestToast && (
        <GuestToast
          message="Guest mode — trips aren't saved. Sign in to persist your data."
          onDone={() => setShowGuestToast(false)}
        />
      )}

      <div className="app-layout">
        {/* Sidebar — visible on desktop */}
        <Sidebar
          user={activeUser}
          onSignOut={handleSignOut}
          onSignIn={handleSignIn}
          isGuest={isGuest}
        />

        <div className="app-main" id="main-content">
          {/* Top bar — visible on mobile */}
          <TopBar />

          <Routes>
            <Route
              path="/"
              element={<LogTripScreen user={activeUser} />}
            />
            <Route
              path="/dashboard"
              element={<DashboardScreen user={activeUser} />}
            />
            <Route
              path="/profile"
              element={
                <ProfileScreen
                  user={activeUser}
                  onSignOut={handleSignOut}
                  onSignIn={handleSignIn}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>

      {/* Bottom nav — visible on mobile */}
      <BottomNav />
    </HashRouter>
  );
}
