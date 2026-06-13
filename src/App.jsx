import { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LandingScreen   from './screens/LandingScreen';
import LogTripScreen   from './screens/LogTripScreen';
import DashboardScreen from './screens/DashboardScreen';
import ProfileScreen   from './screens/ProfileScreen';
import BottomNav       from './components/BottomNav';
import LoadingSpinner  from './components/LoadingSpinner';
import { IconLeaf }    from './components/Icons';

export default function App() {
  const { user, authError, signIn, signOutUser } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  async function handleSignIn() {
    setSigningIn(true);
    await signIn();
    setSigningIn(false);
  }

  // Auth state loading (undefined = still resolving)
  if (user === undefined) {
    return (
      <div className="loading-shell" aria-label="Loading CarbonCoach" role="status">
        <div className="loading-shell-brand" aria-hidden="true">
          <div style={{
            width: 40, height: 40,
            background: 'var(--gradient-hero)',
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(8,145,178,0.35)',
          }}>
            <IconLeaf size={22} style={{ color: '#D1FAE5' }} />
          </div>
          CarbonCoach
        </div>
        <LoadingSpinner label="Checking sign-in status…" />
      </div>
    );
  }

  // Unauthenticated
  if (!user) {
    return (
      <LandingScreen
        onSignIn={handleSignIn}
        authError={authError}
        signingIn={signingIn}
      />
    );
  }

  // Authenticated
  return (
    <HashRouter>
      {/* App header */}
      <header className="app-header" role="banner">
        <div className="app-brand" aria-label="CarbonCoach">
          <div className="app-logo" aria-hidden="true">
            <IconLeaf size={18} style={{ color: '#D1FAE5' }} />
          </div>
          <span className="app-name">CarbonCoach</span>
        </div>
      </header>

      {/* Screen content */}
      <Routes>
        <Route path="/"          element={<LogTripScreen   user={user} />} />
        <Route path="/dashboard" element={<DashboardScreen user={user} />} />
        <Route path="/profile"   element={<ProfileScreen   user={user} onSignOut={signOutUser} />} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>

      {/* Bottom navigation */}
      <BottomNav />
    </HashRouter>
  );
}
