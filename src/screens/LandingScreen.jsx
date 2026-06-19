import { useState, useEffect, useRef } from 'react';
import { IconActivity, IconLeaf, IconMapPin, IconBarChart2 as IconBarChart, IconShield, IconCpu, IconGoogle, IconArrowRight, IconAlertCircle } from '../components/Icons';



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
                <><IconGoogle />Continue with Google</>
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
              <IconArrowRight size={16} />
            </button>
          </div>

          {authError && (
            <p className="form-error auth-error-card" role="alert" aria-live="assertive">
              <IconAlertCircle size={16} />
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
