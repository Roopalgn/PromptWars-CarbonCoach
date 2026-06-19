import { useState, useEffect, useRef } from 'react';

/* ── SVG Icons ─────────────────────────────────────────────── */
function IconActivity({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  );
}

function IconLeaf({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  );
}

function IconMapPin({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function IconBarChart({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  );
}

function IconShield({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

function IconCpu({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/>
      <path d="M15 2v2M9 2v2M15 20v2M9 20v2M2 15h2M2 9h2M20 15h2M20 9h2"/>
    </svg>
  );
}

/* ── Scroll-in animation hook ──────────────────────────────── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('in-view'); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function RevealCard({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('in-view'); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * Google brand SVG icon component.
 * @returns {JSX.Element}
 */
function GoogleIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" className="flex-shrink-0">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

/* ── Features data ─────────────────────────────────────────── */
const FEATURES = [
  {
    icon: <IconMapPin size={26} />,
    title: 'Live Route Data',
    desc: 'Real Google Maps distances with India-specific emission factors from CPCB 2023 — no estimates, real numbers.',
    color: 'green',
    iconBg: 'rgba(16,185,129,0.12)',
    iconColor: 'var(--c-primary)',
  },
  {
    icon: <IconBarChart size={26} />,
    title: 'Visual Analytics',
    desc: 'Interactive charts comparing CO₂ across modes, weekly trends, and your footprint vs India urban average.',
    color: 'cyan',
    iconBg: 'rgba(6,182,212,0.12)',
    iconColor: 'var(--c-cyan)',
  },
  {
    icon: <IconCpu size={26} />,
    title: 'Gemini AI Insights',
    desc: 'Personalised weekly summaries and actionable recommendations powered by Google Gemini.',
    color: 'violet',
    iconBg: 'rgba(167,139,250,0.12)',
    iconColor: 'var(--c-accent)',
  },
  {
    icon: <IconActivity size={26} />,
    title: 'Smart Alternatives',
    desc: "Every trip shows exactly how many kg CO\u2082 you'd save by switching to metro, bus, or cycling.",
    color: 'cyan',
    iconBg: 'rgba(6,182,212,0.12)',
    iconColor: 'var(--c-cyan)',
  },
  {
    icon: <IconShield size={26} />,
    title: 'Private by Default',
    desc: 'Your trip data lives in your private Firestore collection. No ads, no sharing, no profiling.',
    color: 'green',
    iconBg: 'rgba(16,185,129,0.12)',
    iconColor: 'var(--c-primary)',
  },
  {
    icon: <IconLeaf size={26} />,
    title: 'India-First Data',
    desc: 'Emission factors for Ola/Uber, Auto, Bus, Metro, Carpool, Cycle & Walk — tuned for Indian roads.',
    color: 'violet',
    iconBg: 'rgba(167,139,250,0.12)',
    iconColor: 'var(--c-accent)',
  },
];

/**
 * Animated counter component that counts up to a target number.
 * Triggers when the element intersects the viewport.
 * @param {Object} props - Component props
 * @param {number} props.target - Numeric count limit
 * @param {string} [props.suffix=''] - Suffix string (e.g. '%')
 * @param {number} [props.duration=1600] - Duration of animation in ms
 * @returns {JSX.Element}
 */
function AnimatedCounter({ target, suffix = '', duration = 1600 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          setVal(Math.round(ease * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{val}{suffix}</span>;
}

/**
 * Landing Screen welcome and onboarding screen.
 * Displays call-to-action buttons for Google sign-in or Guest access,
 * alongside features grid and app metrics stats.
 * @param {Object} props - Component props
 * @param {function} props.onSignIn - Authentication trigger handler
 * @param {function} props.onGuestMode - Guest login state handler
 * @param {string|null} props.authError - Firebase authentication error message
 * @param {boolean} props.signingIn - In-flight authentication request state
 * @returns {JSX.Element}
 */
export default function LandingScreen({ onSignIn, onGuestMode, authError, signingIn }) {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <main id="main-content" className="landing" aria-label="CarbonCoach welcome page">

        {/* ── Hero ─────────────────────────────────────── */}
        <section className="landing-hero" aria-labelledby="hero-headline">
          <div className="hero-eyebrow" aria-hidden="true">
            <IconLeaf size={12} />
            India's Carbon Commute Tracker
          </div>

          <h1 id="hero-headline" className="hero-headline">
            Every trip has a{' '}
            <span className="text-gradient-green">carbon cost.</span>
            <br />
            <em className="normal-secondary">Know yours.</em>
          </h1>

          <p className="hero-sub">
            Track, visualise, and reduce your transport carbon footprint with
            real route data, live emission factors, and Gemini AI insights.
          </p>

          <div className="hero-cta-row">
            <button
              id="sign-in-btn"
              type="button"
              className="btn btn--google btn--lg"
              onClick={onSignIn}
              disabled={signingIn}
              aria-label="Sign in with Google to start tracking"
            >
              {signingIn ? (
                <><div className="spinner spinner-18" />Signing in…</>
              ) : (
                <><GoogleIcon />Continue with Google</>
              )}
            </button>

            <button
              id="guest-btn"
              type="button"
              className="btn btn--ghost btn--lg"
              onClick={onGuestMode}
              aria-label="Try CarbonCoach as a guest without signing in"
            >
              Try as Guest
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          {authError && (
            <p className="form-error auth-error-card" role="alert" aria-live="assertive">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {authError}
            </p>
          )}

          {/* Stats strip */}
          <div className="hero-stats" aria-label="App highlights">
            <div className="hero-stat">
              <div className="hero-stat-val">
                <AnimatedCounter target={7} />
              </div>
              <div className="hero-stat-label">Modes tracked</div>
            </div>
            <div className="hero-stat-divider" aria-hidden="true" />
            <div className="hero-stat">
              <div className="hero-stat-val">
                <AnimatedCounter target={30} suffix="s" />
              </div>
              <div className="hero-stat-label">Per trip</div>
            </div>
            <div className="hero-stat-divider" aria-hidden="true" />
            <div className="hero-stat">
              <div className="hero-stat-val text-cyan">
                <AnimatedCounter target={100} suffix="%" />
              </div>
              <div className="hero-stat-label">Private data</div>
            </div>
            <div className="hero-stat-divider" aria-hidden="true" />
            <div className="hero-stat">
              <div className="hero-stat-val text-accent">
                AI
              </div>
              <div className="hero-stat-label">Gemini insights</div>
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────── */}
        <section
          className="landing-features"
          aria-labelledby="features-heading"
        >
          <RevealCard>
            <div className="features-header">
              <div className="label-tag label-tag--green tag-center">
                Features
              </div>
              <h2 id="features-heading" className="heading-lg text-primary">
                Built for <span className="text-gradient-green">India's commuters</span>
              </h2>
              <p className="features-intro">
                Real emission factors from CPCB 2023, CEA 2024, and IEA — not generic global averages.
              </p>
            </div>
          </RevealCard>

          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <RevealCard key={f.title} delay={i * 80}>
                <div className="feature-card">
                  <div
                    className="feature-icon-wrap feature-icon-wrapper-custom"
                    style={{ '--icon-bg': f.iconBg, '--icon-color': f.iconColor }}
                  >
                    {f.icon}
                  </div>
                  <h3 className="feature-title">{f.title}</h3>
                  <p className="feature-desc">{f.desc}</p>
                </div>
              </RevealCard>
            ))}
          </div>
        </section>

        {/* ── Footer note ──────────────────────────────── */}
        <footer className="landing-footer">
          <p className="footer-text">
            CarbonCoach · Open-source · Built with Firebase + Gemini · Data from CPCB 2023
          </p>
        </footer>
      </main>
    </>
  );
}
