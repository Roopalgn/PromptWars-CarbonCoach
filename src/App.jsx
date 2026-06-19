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
import Toast from './components/Toast';

/**
 * @file App.jsx
 * @description Main application entry point handling routing, global layout, and auth state.
 */





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
        <Toast
          message="Guest mode — trips aren't saved. Sign in to persist your data."
          onDone={() => setShowGuestToast(false)}
          type="warning"
          duration={5000}
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
