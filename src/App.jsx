import { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LandingScreen   from './screens/LandingScreen';
import LogTripScreen   from './screens/LogTripScreen';
import DashboardScreen from './screens/DashboardScreen';
import ProfileScreen   from './screens/ProfileScreen';
import { GUEST_USER } from './config/constants';
import LoadingShell from './components/LoadingShell';

/**
 * @file App.jsx
 * @description Main application entry point handling routing, global layout, and auth state.
 */

/**
 * Leaf SVG Icon component.
 * @param {Object} props - Component props
 * @param {number} [props.size=20] - Width/height of the icon
 * @returns {JSX.Element}
 */
function IconLeaf({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  );
}

/**
 * Route SVG Icon component.
 * @param {Object} props - Component props
 * @param {number} [props.size=20] - Width/height of the icon
 * @returns {JSX.Element}
 */
function IconRoute({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/>
      <circle cx="18" cy="5" r="3"/>
    </svg>
  );
}

/**
 * Bar Chart SVG Icon component.
 * @param {Object} props - Component props
 * @param {number} [props.size=20] - Width/height of the icon
 * @returns {JSX.Element}
 */
function IconBarChart({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  );
}

/**
 * User SVG Icon component.
 * @param {Object} props - Component props
 * @param {number} [props.size=20] - Width/height of the icon
 * @returns {JSX.Element}
 */
function IconUser({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

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
 * Animated mesh background.
 * Tracks mouse movements to dynamically displace overlay blobs.
 * @returns {JSX.Element}
 */
function BgCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      if (canvasRef.current) {
        canvasRef.current.style.setProperty('--mouse-x', `${x * 120}px`);
        canvasRef.current.style.setProperty('--mouse-y', `${y * 120}px`);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={canvasRef} className="bg-canvas" aria-hidden="true">
      <div className="bg-blob-wrap bg-blob-wrap--1">
        <div className="bg-blob bg-blob--1" />
      </div>
      <div className="bg-blob-wrap bg-blob-wrap--2">
        <div className="bg-blob bg-blob--2" />
      </div>
      <div className="bg-blob-wrap bg-blob-wrap--3">
        <div className="bg-blob bg-blob--3" />
      </div>
    </div>
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
function Sidebar({ user, onSignOut, onSignIn, isGuest }) {
  return (
    <nav className="app-sidebar" aria-label="Main navigation">
      <div className="sidebar-brand" aria-label="CarbonCoach">
        <div className="app-logo" aria-hidden="true">
          <IconLeaf size={18} />
        </div>
        CarbonCoach
        <div className="brand-dot" aria-hidden="true" />
      </div>

      <div className="sidebar-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          aria-label="Log a trip"
        >
          <IconRoute size={18} />
          Log Trip
        </NavLink>

        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          aria-label="Dashboard"
        >
          <IconBarChart size={18} />
          Dashboard
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          aria-label="Profile"
        >
          <IconUser size={18} />
          Profile
        </NavLink>
      </div>

      <div className="sidebar-bottom">
        {isGuest ? (
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={onSignIn}
            aria-label="Sign in with Google"
          >
            Sign in with Google
          </button>
        ) : (
          <div className="sidebar-bottom-panel">
            <div className="sidebar-user-info-row">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={`${user.displayName ?? 'User'} avatar`}
                  referrerPolicy="no-referrer"
                  className="sidebar-profile-img"
                />
              ) : (
                <div className="sidebar-profile-placeholder">
                  <IconUser size={16} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="sidebar-display-name">
                  {user?.displayName ?? 'User'}
                </div>
                <div className="sidebar-display-email">
                  {user?.email ?? ''}
                </div>
              </div>
            </div>
            <button
              id="sign-out-btn"
              type="button"
              className="btn btn--danger btn--sm btn--full"
              onClick={onSignOut}
              aria-label="Sign out of CarbonCoach"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

/**
 * Bottom navigation bar visible on mobile and tablet viewport widths.
 * Handles primary route switches using React Router NavLinks.
 * @returns {JSX.Element}
 */
function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        aria-label="Log a trip"
      >
        <IconRoute size={22} />
        Log Trip
      </NavLink>
      <NavLink
        to="/dashboard"
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        aria-label="Dashboard"
      >
        <IconBarChart size={22} />
        Dashboard
      </NavLink>
      <NavLink
        to="/profile"
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        aria-label="Profile"
      >
        <IconUser size={22} />
        Profile
      </NavLink>
    </nav>
  );
}

/**
 * Top brand header bar visible on mobile.
 * @returns {JSX.Element}
 */
function TopBar() {
  return (
    <header className="app-topbar" role="banner">
      <div className="app-brand">
        <div className="app-logo" aria-hidden="true">
          <IconLeaf size={18} />
        </div>
        CarbonCoach
        <div className="brand-dot" aria-hidden="true" />
      </div>
    </header>
  );
}



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
