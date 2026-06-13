import { useTrips } from '../hooks/useTrips';
import { IconUser, IconLogOut, IconLeaf, IconTrendingDown } from '../components/Icons';
import { roundCO2 } from '../utils/formatters';
import { INDIA_DAILY_AVERAGE_KG } from '../config/emissionsFactors';

/**
 * Profile screen — display name, photo, lifetime stats, India average comparison.
 */
export default function ProfileScreen({ user, onSignOut }) {
  const { trips, tripsLoading } = useTrips(user.uid);

  // Lifetime stats
  const totalTrips     = trips.length;
  const totalKg        = trips.reduce((s, t) => s + (t.kg_co2 ?? 0), 0);
  const totalSavedPot  = trips.reduce((s, t) => s + (t.kg_saved_if_alt > 0 ? t.kg_saved_if_alt : 0), 0);

  // Daily average (use last 7 days with ≥1 trip)
  const tripsWithDate = trips.filter((t) => t.timestamp);
  let userDailyAvg = 0;
  if (tripsWithDate.length > 0) {
    const oldestDate = tripsWithDate[tripsWithDate.length - 1]?.timestamp?.toDate?.() ?? new Date();
    const daysDiff   = Math.max(
      1,
      Math.ceil((Date.now() - oldestDate.getTime()) / (1000 * 60 * 60 * 24))
    );
    userDailyAvg = roundCO2(totalKg / daysDiff);
  }

  const maxBar         = Math.max(userDailyAvg, INDIA_DAILY_AVERAGE_KG, 0.1);
  const userBarWidth   = Math.min(100, (userDailyAvg / maxBar) * 100);
  const indiaBarWidth  = Math.min(100, (INDIA_DAILY_AVERAGE_KG / maxBar) * 100);
  const isBelow        = userDailyAvg < INDIA_DAILY_AVERAGE_KG;

  return (
    <>
      <a href="#profile-content" className="skip-link">Skip to profile</a>
      <main
        id="profile-content"
        className="screen"
        aria-label="Your profile and lifetime stats"
      >
        <header className="screen-header">
          <h1 className="screen-title">Profile</h1>
        </header>

        {/* User info */}
        <section className="profile-header" aria-label="User information">
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
            {user.email && (
              <p className="profile-email">{user.email}</p>
            )}
          </div>
        </section>

        {/* Lifetime stats */}
        <section aria-label="Lifetime statistics" style={{ marginTop: 'var(--space-5)' }}>
          <h2 className="section-title">
            <IconLeaf size={18} />
            Lifetime Stats
          </h2>
          {tripsLoading ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
              Loading stats…
            </p>
          ) : (
            <div className="lifetime-grid">
              <div className="stat-card">
                <p className="stat-number">{totalTrips}</p>
                <p className="stat-label">trips logged</p>
              </div>
              <div className="stat-card">
                <p className="stat-number stat-number--primary">
                  {roundCO2(totalKg)}<small style={{ fontSize: '0.7em' }}> kg</small>
                </p>
                <p className="stat-label">total CO₂</p>
              </div>
              <div className="stat-card stat-card--accent" style={{ gridColumn: 'span 2' }}>
                <p className="stat-number stat-number--accent">
                  {roundCO2(totalSavedPot)}<small style={{ fontSize: '0.7em' }}> kg</small>
                </p>
                <p className="stat-label">could have saved by taking best alternative</p>
              </div>
            </div>
          )}
        </section>

        {/* India average comparison */}
        {!tripsLoading && totalTrips > 0 && (
          <section className="india-comparison" aria-label="Comparison with India urban average" style={{ marginTop: 'var(--space-5)' }}>
            <h2 className="section-title" style={{ marginBottom: 'var(--space-3)' }}>
              <IconTrendingDown size={18} />
              vs India Average
            </h2>
            <p className="india-comparison-label">
              Daily transport CO₂ — you vs urban India average (CPCB 2023)
            </p>

            <div className="comparison-bar-wrapper">
              <div className="comparison-bar-label">
                <span>You</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'var(--weight-bold)', color: isBelow ? 'var(--color-accent)' : 'var(--color-primary)' }}>
                  {userDailyAvg} kg/day
                </span>
              </div>
              <div className="comparison-bar-bg" role="progressbar" aria-valuenow={userDailyAvg} aria-valuemin={0} aria-valuemax={maxBar} aria-label={`Your daily average: ${userDailyAvg} kg CO₂`}>
                <div
                  className="comparison-bar-fill comparison-bar-fill--user"
                  style={{
                    width: `${userBarWidth}%`,
                    backgroundColor: isBelow ? 'var(--color-accent)' : 'var(--color-primary)',
                  }}
                />
              </div>
            </div>

            <div className="comparison-bar-wrapper">
              <div className="comparison-bar-label">
                <span>India avg</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
                  {INDIA_DAILY_AVERAGE_KG} kg/day
                </span>
              </div>
              <div className="comparison-bar-bg" role="progressbar" aria-valuenow={INDIA_DAILY_AVERAGE_KG} aria-valuemin={0} aria-valuemax={maxBar} aria-label={`India urban average: ${INDIA_DAILY_AVERAGE_KG} kg CO₂ per day`}>
                <div
                  className="comparison-bar-fill comparison-bar-fill--india"
                  style={{ width: `${indiaBarWidth}%` }}
                />
              </div>
            </div>

            {isBelow ? (
              <p style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-accent-dark)', fontWeight: 'var(--weight-medium)' }}>
                You're below the India average — well done!
              </p>
            ) : (
              <p style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                You're above the India average. Try switching to metro or bus on your next commute.
              </p>
            )}
          </section>
        )}

        {/* Sign out */}
        <div style={{ marginTop: 'var(--space-8)', paddingBottom: 'var(--space-4)' }}>
          <button
            id="sign-out-btn"
            type="button"
            className="btn btn--ghost btn--full"
            onClick={onSignOut}
            aria-label="Sign out of CarbonCoach"
            style={{ color: 'var(--color-error)', borderColor: 'var(--color-error-light)' }}
          >
            <IconLogOut size={18} />
            Sign out
          </button>
        </div>
      </main>
    </>
  );
}
