import { useState } from 'react';
import { useTrips } from '../hooks/useTrips';
import { roundCO2 } from '../utils/formatters';
import { INDIA_DAILY_AVERAGE_KG } from '../config/emissionsFactors';
import { IconUser, IconLeaf, IconTrendingDown, IconLogOut, IconShield, IconGoogle, IconActivity } from '../components/Icons';



/**
 * Guest Profile promo component explaining benefits of authenticated mode.
 * @param {Object} props - Component props
 * @param {function} props.onSignIn - google sign in handler
 * @returns {JSX.Element}
 */
function GuestProfile({ onSignIn }) {
  return (
    <div className="flex-col-gap6">
      <div className="profile-hero">
        <div className="profile-avatar-placeholder">
          <IconUser size={32} />
        </div>
        <div>
          <p className="profile-name">Guest</p>
          <p className="profile-email">Not signed in</p>
        </div>
      </div>

      <div className="profile-guest-promo">
        <div className="profile-guest-icon-box">
          <IconShield size={28} />
        </div>
        <h2 className="profile-guest-heading">
          Sign in to save your data
        </h2>
        <p className="profile-guest-desc">
          Your trips and carbon data will be securely stored in your private Firebase account.
          No data is shared with anyone.
        </p>
        <button
          id="profile-sign-in-btn"
          type="button"
          className="btn btn--google margin-auto"
          onClick={onSignIn}
          aria-label="Sign in with Google"
        >
          <IconGoogle size={18} />
          Continue with Google
        </button>
      </div>
    </div>
  );
}

/* ── Real user profile ─────────────────────────────────────── */
/**
 * ProfileScreen component showing user details, lifetime stats, and comparisons.
 * @param {Object} props - Component props
 * @param {Object} props.user - Current user object
 * @param {string} [props.user.uid] - User ID
 * @param {string} [props.user.displayName] - User's display name
 * @param {string} [props.user.email] - User's email
 * @param {string} [props.user.photoURL] - User's photo URL
 * @param {boolean} [props.user.isGuest] - Whether the user is a guest
 * @param {function} props.onSignOut - Sign out handler function
 * @param {function} props.onSignIn - Sign in handler function for Google auth
 * @returns {JSX.Element}
 */
export default function ProfileScreen({ user, onSignOut, onSignIn }) {
  const isGuest = user?.isGuest;

  const { trips: loadedTrips, tripsLoading } = useTrips(user?.uid);
  const trips = Array.isArray(loadedTrips) ? loadedTrips : [];

  // Lifetime stats
  const totalTrips    = trips.length;
  const totalKg       = trips.reduce((s, t) => s + (t.kg_co2 ?? 0), 0);
  const totalSavedPot = trips.reduce((s, t) => s + (t.kg_saved_if_alt > 0 ? t.kg_saved_if_alt : 0), 0);

  const [mountTime] = useState(() => Date.now());

  // Daily average
  const tripsWithDate = trips.filter((t) => t.timestamp);
  let userDailyAvg = 0;
  if (tripsWithDate.length > 0) {
    const oldest = tripsWithDate[tripsWithDate.length - 1]?.timestamp?.toDate?.() ?? new Date(mountTime);
    const days   = Math.max(1, Math.ceil((mountTime - oldest.getTime()) / 86400000));
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
              alt={user.displayName ?? 'User'}
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
        <section aria-label="Lifetime statistics" className="mb-6">
          <div className="section-header">
            <h2 className="section-title">
              <IconLeaf size={16} />
              Lifetime Stats
            </h2>
          </div>

          {tripsLoading ? (
            <div className="flex-center-p8">
              <div className="spinner spinner--md" />
            </div>
          ) : (
            <div className="grid-cols-2-gap4">
              {/* Trips card */}
              <div className="glass-card kpi-card kpi-card--cyan">
                <div className="kpi-icon kpi-icon--cyan" aria-hidden="true">
                  <IconActivity size={20} />
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
              <div className="glass-card kpi-card kpi-card--green grid-span-2">
                <div className="kpi-icon kpi-icon--green" aria-hidden="true">
                  <IconTrendingDown size={20} />
                </div>
                <div className="kpi-value" aria-label={`${roundCO2(totalSavedPot)} kg CO₂ saveable`}>
                  {roundCO2(totalSavedPot)}
                  <span className="kpi-unit">kg</span>
                </div>
                <div className="kpi-label">Could have saved by taking best alternative</div>
                <div className="kpi-badge kpi-badge--green mt-2" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.1)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--c-primary)' }}>
                  <IconLeaf size={12} />
                  Equivalent to planting {Math.max(0, Math.round((totalSavedPot / 21) * 10) / 10)} trees yearly offset
                </div>
              </div>
            </div>
          )}
        </section>

        {/* India comparison */}
        {!tripsLoading && totalTrips > 0 && (
          <section
            className="glass-card mb-6"
            aria-label="Comparison with India urban average"
          >
            <div className="section-header mb-4">
              <h2 className="section-title">
                <IconTrendingDown size={16} />
                vs India Average
              </h2>
              {isBelow && (
                <span className="label-tag label-tag--green">Below avg</span>
              )}
            </div>

            <p className="compare-intro-text">
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
                <span className="compare-bar-val text-secondary">
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

            <p className="compare-feedback-text" style={{ color: isBelow ? 'var(--c-primary)' : 'var(--text-secondary)' }}>
              {isBelow
                ? 'You\'re below the India urban average — great work!'
                : 'You\'re above the India average. Try switching to metro or bus.'}
            </p>
          </section>
        )}

        {/* Sign out */}
        <div className="pb-4">
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
