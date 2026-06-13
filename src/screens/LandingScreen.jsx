import LoadingSpinner from '../components/LoadingSpinner';
import { IconLeaf } from '../components/Icons';

/**
 * Unauthenticated landing page.
 * Pattern: Data + Trust — Hero > Features > CTA (UI/UX Pro Max v2.5.0)
 * Style: Organic Biophilic — cyan gradient hero, organic shapes, premium glassmorphism.
 */
export default function LandingScreen({ onSignIn, authError, signingIn }) {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <main
        id="main-content"
        className="landing"
        aria-label="CarbonCoach welcome page"
      >
        {/* ── Hero Section ──────────────────────────────────────── */}
        <div className="landing-hero" role="banner">
          {/* Brand badge */}
          <div className="landing-logo-wrap">
            <div className="landing-logo-icon" aria-hidden="true">
              <IconLeaf size={34} style={{ color: '#FFFFFF' }} />
            </div>
          </div>

          <div className="landing-name-badge" aria-label="CarbonCoach app">
            <IconLeaf size={14} style={{ color: '#A5F3FC' }} aria-hidden="true" />
            CarbonCoach
          </div>

          <h1 className="landing-headline">
            Every trip has a<br />
            carbon cost.<br />
            <em>Know yours.</em>
          </h1>

          <p className="landing-sub">
            Real transport footprint · live route data · AI-powered insights
          </p>
        </div>

        {/* ── Content Section ───────────────────────────────────── */}
        <div className="landing-content">
          {/* Quick stats */}
          <div className="landing-stats" aria-label="App highlights">
            <div className="stat-pill">
              <span className="stat-num">7</span>
              <span className="stat-label">modes<br />tracked</span>
            </div>
            <div className="stat-pill">
              <span className="stat-num">🇮🇳</span>
              <span className="stat-label">India<br />data</span>
            </div>
            <div className="stat-pill">
              <span className="stat-num">30s</span>
              <span className="stat-label">per<br />trip</span>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="feature-list" aria-label="Key features">
            <div className="feature-item">
              <div className="feature-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                </svg>
              </div>
              <div className="feature-text">
                <p className="feature-title">Real-time calculation</p>
                <p className="feature-desc">Live Google Maps distances, India-specific emission factors</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon" aria-hidden="true" style={{ background: 'linear-gradient(135deg, rgba(22,163,74,0.15), rgba(22,163,74,0.05))', color: 'var(--color-accent)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12h4l3-9 4 18 3-9h4"/>
                </svg>
              </div>
              <div className="feature-text">
                <p className="feature-title">Compare alternatives</p>
                <p className="feature-desc">See how much CO₂ you'd save by switching modes</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon" aria-hidden="true" style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(34,211,238,0.05))', color: 'var(--color-secondary-dark)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 0 1 10 10"/><path d="M12 22a10 10 0 0 1-10-10"/><path d="M12 8v4l2 2"/>
                </svg>
              </div>
              <div className="feature-text">
                <p className="feature-title">Gemini AI insights</p>
                <p className="feature-desc">Personalised weekly summaries powered by Google AI</p>
              </div>
            </div>
          </div>

          {/* Error message */}
          {authError && (
            <p className="error-msg" role="alert" aria-live="assertive">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {authError}
            </p>
          )}

          {/* Sign In CTA */}
          <button
            id="sign-in-btn"
            type="button"
            className="btn btn--google btn--full"
            onClick={onSignIn}
            disabled={signingIn}
            aria-label="Sign in with Google to start tracking your carbon footprint"
          >
            {signingIn ? (
              <LoadingSpinner size={20} label="Signing in…" />
            ) : (
              <>
                <GoogleColorIcon />
                Sign in with Google
              </>
            )}
          </button>

          <p className="landing-note">
            🔒 Your trip data is private and only visible to you.
          </p>
        </div>
      </main>
    </>
  );
}

/** Official Google "G" logo in 4 colors */
function GoogleColorIcon() {
  return (
    <svg
      aria-hidden="true"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      style={{ flexShrink: 0 }}
    >
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
