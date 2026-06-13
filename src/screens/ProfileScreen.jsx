import { useTrips } from '../hooks/useTrips';
import { roundCO2 } from '../utils/formatters';
import { INDIA_DAILY_AVERAGE_KG } from '../config/emissionsFactors';

/* ── SVG Icons ─────────────────────────────────────────────── */
function IconUser({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function IconLeaf({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  );
}

function IconTrendingDown({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
      <polyline points="17 18 23 18 23 12"/>
    </svg>
  );
}

function IconLogOut({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

function IconShield({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

function IconGoogle({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

/* ── Guest profile placeholder ─────────────────────────────── */
function GuestProfile({ onSignIn }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-6)' }}>
      <div className="profile-hero">
        <div className="profile-avatar-placeholder">
          <IconUser size={32} />
        </div>
        <div>
          <p className="profile-name">Guest</p>
          <p className="profile-email">Not signed in</p>
        </div>
      </div>

      <div
        style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(6,182,212,0.04))',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 'var(--r-2xl)',
          padding: 'var(--s-8)',
          textAlign: 'center',
        }}
      >
        <div style={{
          width: 64, height: 64, borderRadius: 'var(--r-xl)',
          background: 'rgba(16,185,129,0.12)',
          border: '1px solid rgba(16,185,129,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto var(--s-5)',
          color: 'var(--c-primary)',
        }}>
          <IconShield size={28} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 'var(--w-bold)', color: 'var(--text-primary)', marginBottom: 'var(--s-3)' }}>
          Sign in to save your data
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.7, maxWidth: 340, margin: '0 auto var(--s-6)' }}>
          Your trips and carbon data will be securely stored in your private Firebase account.
          No data is shared with anyone.
        </p>
        <button
          id="profile-sign-in-btn"
          type="button"
          className="btn btn--google"
          onClick={onSignIn}
          aria-label="Sign in with Google"
          style={{ margin: '0 auto' }}
        >
          <IconGoogle size={18} />
          Continue with Google
        </button>
      </div>
    </div>
  );
}

/* ── Real user profile ─────────────────────────────────────── */
export default function ProfileScreen({ user, onSignOut, onSignIn }) {
  const isGuest = user?.isGuest;

  const { trips, tripsLoading } = useTrips(user?.uid);

  // Lifetime stats
  const totalTrips    = trips.length;
  const totalKg       = trips.reduce((s, t) => s + (t.kg_co2 ?? 0), 0);
  const totalSavedPot = trips.reduce((s, t) => s + (t.kg_saved_if_alt > 0 ? t.kg_saved_if_alt : 0), 0);

  // Daily average
  const tripsWithDate = trips.filter((t) => t.timestamp);
  let userDailyAvg = 0;
  if (tripsWithDate.length > 0) {
    const oldest = tripsWithDate[tripsWithDate.length - 1]?.timestamp?.toDate?.() ?? new Date();
    const days   = Math.max(1, Math.ceil((Date.now() - oldest.getTime()) / 86400000));
    userDailyAvg = roundCO2(totalKg / days);
  }

  const maxBar        = Math.max(userDailyAvg, INDIA_DAILY_AVERAGE_KG, 0.1);
  const userBarPct    = Math.min(100, (userDailyAvg / maxBar) * 100);
  const indiaBarPct   = Math.min(100, (INDIA_DAILY_AVERAGE_KG / maxBar) * 100);
  const isBelow       = userDailyAvg < INDIA_DAILY_AVERAGE_KG;

  if (isGuest) {
    return (
      <>
        <a href="#profile-content" className="skip-link">Skip to profile</a>
        <main id="profile-content" className="screen" aria-label="Profile">
          <header className="page-header">
            <h1 className="page-title">Profile</h1>
          </header>
          <GuestProfile onSignIn={onSignIn} />
        </main>
      </>
    );
  }

  return (
    <>
      <a href="#profile-content" className="skip-link">Skip to profile</a>
      <main id="profile-content" className="screen" aria-label="Your profile and lifetime stats">

        <header className="page-header">
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Your lifetime carbon footprint</p>
        </header>

        {/* User card */}
        <section className="profile-hero" aria-label="User information">
          {user.photoURL ? (
            <img
              className="profile-avatar"
              src={user.photoURL}
              alt={`${user.displayName ?? 'User'}'s profile picture`}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="profile-avatar-placeholder" aria-hidden="true">
              <IconUser size={32} />
            </div>
          )}
          <div>
            <p className="profile-name">{user.displayName ?? 'Traveller'}</p>
            {user.email && <p className="profile-email">{user.email}</p>}
          </div>
        </section>

        {/* Stats */}
        <section aria-label="Lifetime statistics" style={{ marginBottom: 'var(--s-6)' }}>
          <div className="section-header">
            <h2 className="section-title">
              <IconLeaf size={16} />
              Lifetime Stats
            </h2>
          </div>

          {tripsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--s-8)' }}>
              <div className="spinner" style={{ width: 24, height: 24 }} />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--s-4)' }}>
              {/* Trips card */}
              <div className="glass-card kpi-card kpi-card--cyan">
                <div className="kpi-icon kpi-icon--cyan" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </div>
                <div className="kpi-value" aria-label={`${totalTrips} trips logged`}>{totalTrips}</div>
                <div className="kpi-label">Trips logged</div>
              </div>

              {/* Total CO₂ */}
              <div className="glass-card kpi-card kpi-card--warn">
                <div className="kpi-icon kpi-icon--warn" aria-hidden="true">
                  <IconLeaf size={20} />
                </div>
                <div className="kpi-value" aria-label={`${roundCO2(totalKg)} kg CO₂ total`}>
                  {roundCO2(totalKg)}
                  <span className="kpi-unit">kg</span>
                </div>
                <div className="kpi-label">Total CO₂</div>
              </div>

              {/* Could have saved — full width */}
              <div className="glass-card kpi-card kpi-card--green" style={{ gridColumn: 'span 2' }}>
                <div className="kpi-icon kpi-icon--green" aria-hidden="true">
                  <IconTrendingDown size={20} />
                </div>
                <div className="kpi-value" aria-label={`${roundCO2(totalSavedPot)} kg CO₂ saveable`}>
                  {roundCO2(totalSavedPot)}
                  <span className="kpi-unit">kg</span>
                </div>
                <div className="kpi-label">Could have saved by taking best alternative</div>
              </div>
            </div>
          )}
        </section>

        {/* India comparison */}
        {!tripsLoading && totalTrips > 0 && (
          <section
            className="glass-card"
            aria-label="Comparison with India urban average"
            style={{ marginBottom: 'var(--s-6)' }}
          >
            <div className="section-header" style={{ marginBottom: 'var(--s-4)' }}>
              <h2 className="section-title">
                <IconTrendingDown size={16} />
                vs India Average
              </h2>
              {isBelow && (
                <span className="label-tag label-tag--green">Below avg</span>
              )}
            </div>

            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--s-5)' }}>
              Daily transport CO₂ — you vs urban India average (CPCB 2023)
            </p>

            {/* You */}
            <div className="compare-bar-row">
              <div className="compare-bar-meta">
                <span className="compare-bar-name">You</span>
                <span
                  className="compare-bar-val"
                  style={{ color: isBelow ? 'var(--c-primary)' : 'var(--c-warning)' }}
                >
                  {userDailyAvg} kg/day
                </span>
              </div>
              <div
                className="compare-track"
                role="progressbar"
                aria-valuenow={userDailyAvg}
                aria-valuemin={0}
                aria-valuemax={maxBar}
                aria-label={`Your daily average: ${userDailyAvg} kg CO₂`}
              >
                <div
                  className="compare-fill compare-fill--you"
                  style={{ width: `${userBarPct}%` }}
                />
              </div>
            </div>

            {/* India average */}
            <div className="compare-bar-row">
              <div className="compare-bar-meta">
                <span className="compare-bar-name">India avg</span>
                <span className="compare-bar-val" style={{ color: 'var(--text-secondary)' }}>
                  {INDIA_DAILY_AVERAGE_KG} kg/day
                </span>
              </div>
              <div
                className="compare-track"
                role="progressbar"
                aria-valuenow={INDIA_DAILY_AVERAGE_KG}
                aria-valuemin={0}
                aria-valuemax={maxBar}
                aria-label={`India urban average: ${INDIA_DAILY_AVERAGE_KG} kg CO₂ per day`}
              >
                <div
                  className="compare-fill compare-fill--india"
                  style={{ width: `${indiaBarPct}%` }}
                />
              </div>
            </div>

            <p style={{ marginTop: 'var(--s-4)', fontSize: 'var(--text-sm)', color: isBelow ? 'var(--c-primary)' : 'var(--text-secondary)' }}>
              {isBelow
                ? 'You\'re below the India urban average — great work!'
                : 'You\'re above the India average. Try switching to metro or bus.'}
            </p>
          </section>
        )}

        {/* Sign out */}
        <div style={{ paddingBottom: 'var(--s-4)' }}>
          <button
            id="sign-out-btn"
            type="button"
            className="btn btn--danger btn--full"
            onClick={onSignOut}
            aria-label="Sign out of CarbonCoach"
          >
            <IconLogOut size={18} />
            Sign out
          </button>
        </div>
      </main>
    </>
  );
}
