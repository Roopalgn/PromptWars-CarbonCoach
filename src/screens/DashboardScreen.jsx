import { useState, useEffect, useMemo, memo } from 'react';
import { useTrips } from '../hooks/useTrips';
import { getLatestInsight, saveInsight, deleteTrip } from '../services/firestore';
import { ModeIcon, IconMinus, IconLeaf, IconBarChart2 as IconBarChart, IconPieChart, IconTrendingUp as IconTrendUp, IconClock, IconStar, IconLock } from '../components/Icons';
import KpiCard from '../components/KpiCard';
import { generateInsight } from '../services/gemini';
import { roundCO2, formatDate, formatDayLabel, getLast7Days, isThisWeek, formatShortAddress } from '../utils/formatters';
import { MODE_LABELS } from '../config/emissionsFactors';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  LineElement, PointElement, Filler, Title, Tooltip, Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  SEED_TRIPS,
  MODE_COLORS,
  CHART_FONT,
  CHART_MONO,
  GRID_COLOR,
  TICK_COLOR,
} from '../config/constants';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  LineElement, PointElement, Filler, Title, Tooltip, Legend
);



/**
 * Gemini AI Insight Card component.
 * Uses React.memo to prevent unneeded redraws when props are unchanged.
 * @param {Object} props - Component props
 * @param {Object} props.insight - AI generated insight details
 * @param {string} props.insight.summary - AI overall commuter behavior summary
 * @param {string} props.insight.top_action - Recommended immediate next steps
 * @param {string} props.insight.encouragement - Affirmative callout for week's best choice
 */
const InsightCard = memo(function InsightCard({ insight }) {
  return (
    <div className="insight-card" role="region" aria-label="AI-generated weekly insight">
      <div className="insight-badge">
        <IconStar size={12} />
        Gemini AI Insight
      </div>
      {insight.summary && (
        <p className="insight-headline">
          {insight.summary}
        </p>
      )}
      {insight.top_action && (
        <div className="insight-action-container">
          <span className="insight-action-tag">
            Top action
          </span>
          <p className="insight-action-desc">
            {insight.top_action}
          </p>
        </div>
      )}
      {insight.encouragement && (
        <p className="insight-encouragement-txt">
          &ldquo;{insight.encouragement}&rdquo;
        </p>
      )}
    </div>
  );
});

/**
 * Main Dashboard Screen displaying trip statistics, AI insights, and emissions charts.
 * @param {Object} props - Component props
 * @param {Object} props.user - Active user details
 * @param {string} props.user.uid - User identifier
 * @param {string} [props.user.displayName] - User name
 * @param {boolean} [props.user.isGuest] - Flag for guest mode status
 * @returns {JSX.Element}
 */
export default function DashboardScreen({ user }) {
  const isGuest = user?.isGuest;

  const [deletedSeedIds, setDeletedSeedIds] = useState(() => {
    const stored = localStorage.getItem('carboncoach_deleted_seed_trips');
    return stored ? JSON.parse(stored) : [];
  });

  /* For guests, combine their local trips with seed data; for real users, use Firestore */
  const { trips: loadedTrips, tripsLoading } = useTrips(user?.uid);
  const rawTrips = isGuest
    ? [...(Array.isArray(loadedTrips) ? loadedTrips : []), ...SEED_TRIPS]
    : (Array.isArray(loadedTrips) ? loadedTrips : []);
  const trips = rawTrips.filter((t) => !deletedSeedIds.includes(t.id));
  const loading = tripsLoading;

  /**
   * Remove a trip either from Firestore (if registered) or from local lists (if guest).
   * @param {string} tripId - ID of trip to delete
   */
  const handleDeleteTrip = async (tripId) => {
    try {
      if (isGuest) {
        if (tripId.startsWith('guest_')) {
          const stored = localStorage.getItem('carboncoach_guest_trips');
          const guestTrips = stored ? JSON.parse(stored) : [];
          const updated = guestTrips.filter((t) => t.id !== tripId);
          localStorage.setItem('carboncoach_guest_trips', JSON.stringify(updated));
          window.dispatchEvent(new Event('storage'));
        } else {
          const updatedSeeds = [...deletedSeedIds, tripId];
          setDeletedSeedIds(updatedSeeds);
          localStorage.setItem('carboncoach_deleted_seed_trips', JSON.stringify(updatedSeeds));
        }
      } else {
        await deleteTrip(user.uid, tripId);
      }
    } catch (err) {
      console.error('Failed to delete trip:', err);
    }
  };

  const [insight, setInsight]         = useState(null);
  const [insightLoading, setIL]       = useState(false);

  // Week-scoped trips calculations
  const weekTrips = useMemo(() => trips.filter((t) => t.timestamp && isThisWeek(t.timestamp)), [trips]);
  
  const weekTotalKg = useMemo(() => weekTrips.reduce((s, t) => s + (t.kg_co2 ?? 0), 0), [weekTrips]);
  
  const weekTripCount = weekTrips.length;
  
  const weekSavedPotential = useMemo(() => weekTrips.reduce((s, t) => {
    const sv = t.kg_saved_if_alt ?? 0;
    return s + (sv > 0 ? sv : 0);
  }, 0), [weekTrips]);
  
  const avgKgPerTrip = weekTripCount > 0 ? weekTotalKg / weekTripCount : 0;

  // AI insight generation hook
  useEffect(() => {
    if (isGuest || !user?.uid || trips.length < 5) return;
    async function load() {
      try {
        const existing = await getLatestInsight(user.uid);
        if (existing) {
          const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          const genAt = existing.generated_at?.toDate?.()?.getTime() ?? 0;
          if (genAt > sevenDaysAgo) { setInsight(existing); return; }
        }
        setIL(true);
        const newInsight = await generateInsight(trips, {
          total_kg: roundCO2(weekTotalKg),
          saved_potential_kg: roundCO2(weekSavedPotential),
        });
        if (newInsight) {
          setInsight(newInsight);
          await saveInsight(user.uid, {
            ...newInsight,
            weekly_total_kg: roundCO2(weekTotalKg),
            weekly_saved_potential_kg: roundCO2(weekSavedPotential),
          });
        }
      } catch { /* silent */ } finally { setIL(false); }
    }
    load();
    // Using trips.length instead of trips array to avoid infinite loops when trips reference changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trips.length, user?.uid]);

  // ── Bar chart: daily CO₂ last 7 days calculations ──
  const last7Days = useMemo(() => getLast7Days(), []);
  
  const dailyData = useMemo(() => {
    return last7Days.map((day) => {
      const dayTrips = trips.filter((t) => {
        if (!t.timestamp) return false;
        const d = t.timestamp.toDate ? t.timestamp.toDate() : new Date(t.timestamp);
        return (
          d.getFullYear() === day.getFullYear() &&
          d.getMonth()    === day.getMonth() &&
          d.getDate()     === day.getDate()
        );
      });
      return roundCO2(dayTrips.reduce((s, t) => s + (t.kg_co2 ?? 0), 0));
    });
  }, [trips, last7Days]);

  const barData = useMemo(() => ({
    labels: last7Days.map(formatDayLabel),
    datasets: [{
      label: 'kg CO₂',
      data: dailyData,
      backgroundColor: dailyData.map((v) =>
        v > 3 ? 'rgba(239,68,68,0.75)' : v > 1 ? 'rgba(245,158,11,0.75)' : 'rgba(16,185,129,0.75)'
      ),
      borderRadius: 8,
      borderSkipped: false,
      borderColor: dailyData.map((v) =>
        v > 3 ? 'rgba(239,68,68,1)' : v > 1 ? 'rgba(245,158,11,1)' : 'rgba(16,185,129,1)'
      ),
      borderWidth: 1,
    }],
  }), [dailyData, last7Days]);

  const barOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(10,15,30,0.95)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        cornerRadius: 8,
        callbacks: { label: (ctx) => `  ${ctx.parsed.y} kg CO₂` },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: GRID_COLOR },
        ticks: { font: { family: CHART_MONO, size: 11 }, color: TICK_COLOR, callback: (v) => `${v} kg` },
        border: { color: 'transparent' },
      },
      x: {
        grid: { display: false },
        ticks: { font: { family: CHART_FONT, size: 12 }, color: TICK_COLOR },
        border: { color: 'transparent' },
      },
    },
  }), []);

  // ── Line chart: cumulative CO₂ trend calculations ──
  const lineData = useMemo(() => {
    const cumulative = [];
    let running = 0;
    [...dailyData].reverse().forEach((v) => { running += v; cumulative.push(roundCO2(running)); });
    cumulative.reverse();

    return {
      labels: last7Days.map(formatDayLabel),
      datasets: [{
        label: 'Cumulative kg CO₂',
        data: cumulative,
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6,182,212,0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#06b6d4',
        pointBorderColor: '#0a0f1e',
        pointRadius: 4,
        pointHoverRadius: 6,
      }],
    };
  }, [dailyData, last7Days]);

  const lineOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(10,15,30,0.95)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        cornerRadius: 8,
        callbacks: { label: (ctx) => `  ${ctx.parsed.y} kg cumulative` },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: GRID_COLOR },
        ticks: { font: { family: CHART_MONO, size: 11 }, color: TICK_COLOR, callback: (v) => `${v}` },
        border: { color: 'transparent' },
      },
      x: {
        grid: { display: false },
        ticks: { font: { family: CHART_FONT, size: 12 }, color: TICK_COLOR },
        border: { color: 'transparent' },
      },
    },
  }), []);

  // ── Donut: mode breakdown calculations ──
  const donutData = useMemo(() => {
    const modeCounts = {};
    trips.slice(0, 50).forEach((t) => { modeCounts[t.mode] = (modeCounts[t.mode] ?? 0) + 1; });
    const donutLabels = Object.keys(modeCounts);
    return {
      labels: donutLabels,
      data: donutLabels.map((m) => modeCounts[m]),
      rawLabels: donutLabels,
    };
  }, [trips]);

  const donutChartData = useMemo(() => {
    if (!donutData.labels.length) return null;
    return {
      labels: donutData.labels.map((m) => MODE_LABELS[m] ?? m),
      datasets: [{
        data: donutData.data,
        backgroundColor: donutData.rawLabels.map((m) => MODE_COLORS[m] ?? '#64748b'),
        borderWidth: 2,
        borderColor: 'rgba(10,15,30,0.8)',
        hoverBorderColor: 'rgba(255,255,255,0.2)',
      }],
    };
  }, [donutData]);

  const donutOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: CHART_FONT, size: 11 },
          color: '#94a3b8',
          padding: 12,
          boxWidth: 10,
          borderRadius: 3,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(10,15,30,0.95)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        cornerRadius: 8,
        callbacks: { label: (ctx) => `  ${ctx.label}: ${ctx.parsed} trips` },
      },
    },
  }), []);

  return (
    <>
      <a href="#dashboard-content" className="skip-link">Skip to dashboard</a>
      <main id="dashboard-content" className="screen" aria-label="Your carbon dashboard">

        <header className="page-header">
          <div className="flex items-center gap-3 mb-1">
            {isGuest && <span className="label-tag label-tag--cyan">Demo data</span>}
          </div>
          <h1 className="page-title">
            {isGuest ? 'Dashboard Preview' : `Welcome back, ${user.displayName?.split(' ')[0] ?? 'traveller'}`}
          </h1>
          <p className="page-subtitle">
            {isGuest ? 'Showing sample data — sign in to see your real emissions.' : 'Your carbon footprint at a glance.'}
          </p>
        </header>

        {loading ? (
          <div className="flex-center-p16">
            <div className="spinner spinner-32" aria-label="Loading trips" />
          </div>
        ) : (
          <>
            {/* KPI row */}
            <section aria-label="Weekly summary statistics" className="mb-6">
              <div className="kpi-grid">
                <KpiCard
                  icon={<IconLeaf size={20} />}
                  value={roundCO2(weekTotalKg)}
                  unit="kg"
                  label="CO₂ this week"
                  colorClass="green"
                  iconClass="green"
                />
                <KpiCard
                  icon={<IconBarChart size={20} />}
                  value={weekTripCount}
                  unit=""
                  label="Trips logged"
                  colorClass="cyan"
                  iconClass="cyan"
                />
                <KpiCard
                  icon={<IconTrendUp size={20} />}
                  value={roundCO2(weekSavedPotential)}
                  unit="kg"
                  label="Saveable CO₂"
                  colorClass="violet"
                  iconClass="violet"
                />
                <KpiCard
                  icon={<IconClock size={20} />}
                  value={weekTripCount > 0 ? roundCO2(avgKgPerTrip) : '—'}
                  unit={weekTripCount > 0 ? 'kg' : ''}
                  label="Avg per trip"
                  colorClass="warn"
                  iconClass="warn"
                />
              </div>
            </section>

            {/* AI insight */}
            {trips.length < 5 && (
              <div className="insight-card mb-6 insight-card--locked" style={{ opacity: 0.85, borderStyle: 'dashed' }}>
                <div className="insight-badge" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--c-warning)' }}>
                  <IconLock size={12} style={{ marginRight: 4 }} />
                  Gemini AI — Locked
                </div>
                <p className="insight-headline" style={{ fontSize: '0.95rem' }}>
                  Log at least <strong className="text-gradient-green">5 trips</strong> to unlock weekly AI-powered suggestions.
                </p>
                <p className="demo-insight-encouragement" style={{ margin: 0 }}>
                  You have logged {trips.length} {trips.length === 1 ? 'trip' : 'trips'} so far. Gemini needs more data to analyze your commute patterns.
                </p>
              </div>
            )}
            {insightLoading && (
              <div className="insight-loading-box">
                <div className="spinner spinner-16" />
                <span aria-live="polite">Generating Gemini insight…</span>
              </div>
            )}
            {insight && !isGuest && trips.length >= 5 && (
              <div className="mb-6">
                <InsightCard insight={insight} />
              </div>
            )}
            {isGuest && trips.length >= 5 && (
              <div className="insight-card mb-6">
                <div className="insight-badge">
                  <IconStar size={12} />
                  Gemini AI — Demo
                </div>
                <p className="insight-headline">
                  Your demo week shows <strong className="text-green">5.74 kg CO₂</strong> — mostly from cab rides. Switching your daily commute to Metro could cut that by 60%.
                </p>
                <p className="demo-insight-encouragement">
                  &ldquo;Sign in to get personalised AI insights based on your actual trips.&rdquo;
                </p>
              </div>
            )}

            {/* Charts grid */}
            <div className="dashboard-grid">
              {/* Daily CO₂ bar chart */}
              <section className="chart-wrap chart-wrap--wide" aria-label="Daily CO₂ bar chart">
                <h2 className="chart-title">
                  <IconBarChart size={14} />
                  Daily CO₂ — Last 7 Days
                </h2>
                {trips.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon"><IconBarChart size={32} /></div>
                    <p className="text-secondary text-sm">
                      Log your first trip to see your daily chart
                    </p>
                  </div>
                ) : (
                  <div className="chart-h-200" aria-label="Bar chart of daily CO₂ emissions">
                    <Bar data={barData} options={barOptions} />
                  </div>
                )}
              </section>

              {/* Cumulative line chart */}
              <section className="chart-wrap" aria-label="Cumulative CO₂ trend">
                <h2 className="chart-title">
                  <IconTrendUp size={14} />
                  Cumulative Trend
                </h2>
                <div className="chart-h-180" aria-label="Line chart showing cumulative CO₂ this week">
                  <Line data={lineData} options={lineOptions} />
                </div>
              </section>

              {/* Mode donut */}
              {donutChartData && (
                <section className="chart-wrap" aria-label="Mode breakdown donut chart">
                  <h2 className="chart-title">
                    <IconPieChart size={14} />
                    Mode Breakdown
                  </h2>
                  <div className="chart-h-220" aria-label="Donut chart showing trips by transport mode">
                    <Doughnut data={donutChartData} options={donutOptions} />
                  </div>
                </section>
              )}
            </div>

            {/* Recent trips list */}
            <section aria-label="Recent trips" className="mt-2">
              <div className="section-header">
                <h2 className="section-title">
                  <IconClock size={16} />
                  Recent Trips
                </h2>
              </div>

              {trips.length === 0 ? (
                <div className="empty-state glass-card">
                  <div className="empty-icon"><IconClock size={32} /></div>
                  <p className="text-secondary text-sm">
                    No trips yet — log your first commute
                  </p>
                </div>
              ) : (
                <div className="flex-col-gap2">
                  {trips.slice(0, 10).map((trip) => {
                    const level = trip.kg_co2 > 3 ? 'high' : trip.kg_co2 > 1 ? 'med' : 'low';
                    const co2Color = level === 'high' ? 'var(--c-danger)' : level === 'med' ? 'var(--c-warning)' : 'var(--c-primary)';
                    return (
                      <article
                        key={trip.id}
                        className="recent-trip-article"
                        aria-label={`${MODE_LABELS[trip.mode] ?? trip.mode} from ${trip.origin} to ${trip.destination}`}
                      >
                        {/* Mode icon badge */}
                        <button
                          type="button"
                          onClick={() => handleDeleteTrip(trip.id)}
                          className="trip-delete-btn recent-trip-mode-btn"
                          title="Click to remove this entry"
                          aria-label={`Remove trip: ${MODE_LABELS[trip.mode] ?? trip.mode} from ${trip.origin} to ${trip.destination}`}
                          style={{
                            '--mode-color': MODE_COLORS[trip.mode] ?? '#64748b',
                            '--mode-color-bg': `${MODE_COLORS[trip.mode] ?? '#64748b'}20`,
                            '--mode-color-border': `${MODE_COLORS[trip.mode] ?? '#64748b'}40`,
                          }}
                        >
                          <span className="mode-icon-default">
                            <ModeIcon mode={trip.mode} size={18} />
                          </span>
                          <span className="mode-icon-delete">
                            <IconMinus size={18} />
                          </span>
                        </button>

                        {/* Route info */}
                        <div className="flex-1 min-w-0">
                          <p className="sidebar-display-name">
                            {formatShortAddress(trip.origin)} → {formatShortAddress(trip.destination)}
                          </p>
                          <p className="sidebar-display-email">
                            {MODE_LABELS[trip.mode]}
                            {trip.distance_km ? ` · ${roundCO2(trip.distance_km)} km` : ''}
                            {trip.timestamp ? ` · ${formatDate(trip.timestamp)}` : ''}
                          </p>
                        </div>

                        {/* CO₂ value */}
                        <div className="text-center flex-shrink-0">
                          <div
                            className="font-mono text-sm font-semi"
                            style={{ color: co2Color }}
                          >
                            {roundCO2(trip.kg_co2)} kg
                          </div>
                          {trip.kg_saved_if_alt > 0 && (
                            <div className="text-xs text-green mt-3">
                              −{roundCO2(trip.kg_saved_if_alt)} possible
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}


