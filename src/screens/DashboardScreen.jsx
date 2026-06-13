import { useState, useEffect } from 'react';
import { useTrips } from '../hooks/useTrips';
import { getLatestInsight, saveInsight } from '../services/firestore';
import { generateInsight } from '../services/gemini';
import { roundCO2, formatDate, formatDayLabel, getLast7Days, isThisWeek } from '../utils/formatters';
import { MODE_LABELS } from '../config/emissionsFactors';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  LineElement, PointElement, Filler, Title, Tooltip, Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  LineElement, PointElement, Filler, Title, Tooltip, Legend
);

/* ── Mode colors — dark glassmorphism palette ─────────────── */
const MODE_COLORS = {
  ola_uber: '#ef4444',
  auto:     '#f59e0b',
  bus:      '#06b6d4',
  metro:    '#10b981',
  carpool:  '#a78bfa',
  cycle:    '#34d399',
  walk:     '#22d3ee',
};

/* ── Demo/seed trips for guest mode ───────────────────────── */
const SEED_TRIPS = [
  { id: 's1', mode: 'ola_uber', origin: 'Connaught Place', destination: 'Gurugram', distance_km: 28, kg_co2: 4.00, kg_saved_if_alt: 2.9, timestamp: { toDate: () => new Date(Date.now() - 86400000 * 0) } },
  { id: 's2', mode: 'metro',   origin: 'Hauz Khas',        destination: 'Rajiv Chowk', distance_km: 9, kg_co2: 0.28, kg_saved_if_alt: 0, timestamp: { toDate: () => new Date(Date.now() - 86400000 * 1) } },
  { id: 's3', mode: 'bus',     origin: 'Sarojini Nagar',   destination: 'Nehru Place',  distance_km: 7, kg_co2: 0.28, kg_saved_if_alt: 0, timestamp: { toDate: () => new Date(Date.now() - 86400000 * 2) } },
  { id: 's4', mode: 'auto',    origin: 'Lajpat Nagar',     destination: 'Saket',        distance_km: 5, kg_co2: 0.47, kg_saved_if_alt: 0.31, timestamp: { toDate: () => new Date(Date.now() - 86400000 * 2) } },
  { id: 's5', mode: 'cycle',   origin: 'Dwarka Sector 10', destination: 'Dwarka Sec 14',distance_km: 3, kg_co2: 0,   kg_saved_if_alt: 0, timestamp: { toDate: () => new Date(Date.now() - 86400000 * 3) } },
  { id: 's6', mode: 'ola_uber', origin: 'Vasant Vihar',   destination: 'Aerocity',      distance_km: 15, kg_co2: 2.15, kg_saved_if_alt: 1.7, timestamp: { toDate: () => new Date(Date.now() - 86400000 * 4) } },
  { id: 's7', mode: 'metro',   origin: 'Janakpuri',        destination: 'Barakhamba',    distance_km: 18, kg_co2: 0.56, kg_saved_if_alt: 0, timestamp: { toDate: () => new Date(Date.now() - 86400000 * 5) } },
];

/* ── SVG Icons ─────────────────────────────────────────────── */
function IconLeaf({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  );
}

function IconBarChart({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  );
}

function IconPieChart({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>
    </svg>
  );
}

function IconTrendUp({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  );
}

function IconClock({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function IconStar({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );
}

/* ── Shared chart style tokens ─────────────────────────────── */
const CHART_FONT = "'Fira Sans', system-ui, sans-serif";
const CHART_MONO = "'Fira Code', monospace";
const GRID_COLOR  = 'rgba(255,255,255,0.05)';
const TICK_COLOR  = '#475569';

/* ── Mode icon SVGs for the trip list ─────────────────────── */
const MODE_ICON_PATHS = {
  ola_uber: <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
  auto:     <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9h-2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
  bus:      <path d="M4 6h16a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z M4 12h16 M7 17v2 M17 17v2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
  metro:    <rect x="4" y="2" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>,
  carpool:  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
  cycle:    <><circle cx="5.5" cy="17.5" r="3.5" stroke="currentColor" strokeWidth="2" fill="none"/><circle cx="18.5" cy="17.5" r="3.5" stroke="currentColor" strokeWidth="2" fill="none"/></>,
  walk:     <><circle cx="12" cy="5" r="1" fill="currentColor"/><path d="m9 20 3-8 3 3 2-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
};

function ModeIcon({ mode, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      {MODE_ICON_PATHS[mode]}
    </svg>
  );
}

/* ── Insight card ──────────────────────────────────────────── */
function InsightCard({ insight }) {
  return (
    <div className="insight-card" role="region" aria-label="AI-generated weekly insight">
      <div className="insight-badge">
        <IconStar size={12} />
        Gemini AI Insight
      </div>
      {insight.summary && (
        <p style={{ color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: 'var(--s-3)', fontSize: 'var(--text-base)' }}>
          {insight.summary}
        </p>
      )}
      {insight.top_action && (
        <div style={{
          background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 'var(--r-lg)',
          padding: 'var(--s-3) var(--s-4)',
          marginBottom: 'var(--s-3)',
        }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--w-semi)', color: 'var(--c-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Top action
          </span>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--s-1)' }}>
            {insight.top_action}
          </p>
        </div>
      )}
      {insight.encouragement && (
        <p style={{ color: 'var(--c-accent)', fontStyle: 'italic', fontSize: 'var(--text-sm)' }}>
          "{insight.encouragement}"
        </p>
      )}
    </div>
  );
}

/* ── KPI card ──────────────────────────────────────────────── */
function KpiCard({ icon, value, unit, label, colorClass, iconClass }) {
  return (
    <div className={`kpi-card kpi-card--${colorClass}`}>
      <div className={`kpi-icon kpi-icon--${iconClass}`} aria-hidden="true">
        {icon}
      </div>
      <div className="kpi-value" aria-label={`${value} ${unit}`}>
        {value}
        {unit && <span className="kpi-unit">{unit}</span>}
      </div>
      <div className="kpi-label">{label}</div>
    </div>
  );
}

/* ── Main dashboard ────────────────────────────────────────── */
export default function DashboardScreen({ user }) {
  const isGuest = user?.isGuest;

  /* For guests, use seed data; for real users, use Firestore */
  const { trips: realTrips, tripsLoading } = useTrips(isGuest ? null : user.uid);
  const trips = isGuest ? SEED_TRIPS : realTrips;
  const loading = isGuest ? false : tripsLoading;

  const [insight, setInsight]         = useState(null);
  const [insightLoading, setIL]       = useState(false);

  // Week-scoped trips
  const weekTrips         = trips.filter((t) => t.timestamp && isThisWeek(t.timestamp));
  const weekTotalKg       = weekTrips.reduce((s, t) => s + (t.kg_co2 ?? 0), 0);
  const weekTripCount     = weekTrips.length;
  const weekSavedPotential = weekTrips.reduce((s, t) => {
    const sv = t.kg_saved_if_alt ?? 0;
    return s + (sv > 0 ? sv : 0);
  }, 0);
  const avgKgPerTrip = weekTripCount > 0 ? weekTotalKg / weekTripCount : 0;

  // AI insight
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
  }, [trips.length, user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Bar chart: daily CO₂ last 7 days ──
  const last7Days = getLast7Days();
  const dailyData = last7Days.map((day) => {
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

  const barData = {
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
  };

  const barOptions = {
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
  };

  // ── Line chart: cumulative CO₂ trend ──
  const cumulative = [];
  let running = 0;
  [...dailyData].reverse().forEach((v) => { running += v; cumulative.push(roundCO2(running)); });
  cumulative.reverse();

  const lineData = {
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

  const lineOptions = {
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
  };

  // ── Donut: mode breakdown ──
  const modeCounts = {};
  trips.slice(0, 50).forEach((t) => { modeCounts[t.mode] = (modeCounts[t.mode] ?? 0) + 1; });
  const donutLabels = Object.keys(modeCounts);
  const donutData = {
    labels: donutLabels.map((m) => MODE_LABELS[m] ?? m),
    datasets: [{
      data: donutLabels.map((m) => modeCounts[m]),
      backgroundColor: donutLabels.map((m) => MODE_COLORS[m] ?? '#64748b'),
      borderWidth: 2,
      borderColor: 'rgba(10,15,30,0.8)',
      hoverBorderColor: 'rgba(255,255,255,0.2)',
    }],
  };

  const donutOptions = {
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
  };

  return (
    <>
      <a href="#dashboard-content" className="skip-link">Skip to dashboard</a>
      <main id="dashboard-content" className="screen" aria-label="Your carbon dashboard">

        <header className="page-header">
          <div className="flex items-center gap-3" style={{ marginBottom: 'var(--s-1)' }}>
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
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--s-16)' }}>
            <div className="spinner" style={{ width: 32, height: 32 }} aria-label="Loading trips" />
          </div>
        ) : (
          <>
            {/* KPI row */}
            <section aria-label="Weekly summary statistics" style={{ marginBottom: 'var(--s-6)' }}>
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
            {insightLoading && (
              <div style={{ display: 'flex', gap: 'var(--s-2)', alignItems: 'center', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--s-5)' }}>
                <div className="spinner" style={{ width: 16, height: 16 }} />
                <span aria-live="polite">Generating Gemini insight…</span>
              </div>
            )}
            {insight && !isGuest && (
              <div style={{ marginBottom: 'var(--s-6)' }}>
                <InsightCard insight={insight} />
              </div>
            )}
            {isGuest && trips.length >= 5 && (
              <div className="insight-card" style={{ marginBottom: 'var(--s-6)' }}>
                <div className="insight-badge">
                  <IconStar size={12} />
                  Gemini AI — Demo
                </div>
                <p style={{ color: 'var(--text-primary)', lineHeight: 1.7 }}>
                  Your demo week shows <strong style={{ color: 'var(--c-primary)' }}>5.74 kg CO₂</strong> — mostly from cab rides. Switching your daily commute to Metro could cut that by 60%.
                </p>
                <p style={{ marginTop: 'var(--s-3)', color: 'var(--c-accent)', fontStyle: 'italic', fontSize: 'var(--text-sm)' }}>
                  "Sign in to get personalised AI insights based on your actual trips."
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
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                      Log your first trip to see your daily chart
                    </p>
                  </div>
                ) : (
                  <div style={{ height: 200 }} aria-label="Bar chart of daily CO₂ emissions">
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
                <div style={{ height: 180 }} aria-label="Line chart showing cumulative CO₂ this week">
                  <Line data={lineData} options={lineOptions} />
                </div>
              </section>

              {/* Mode donut */}
              {donutLabels.length > 0 && (
                <section className="chart-wrap" aria-label="Mode breakdown donut chart">
                  <h2 className="chart-title">
                    <IconPieChart size={14} />
                    Mode Breakdown
                  </h2>
                  <div style={{ height: 220 }} aria-label="Donut chart showing trips by transport mode">
                    <Doughnut data={donutData} options={donutOptions} />
                  </div>
                </section>
              )}
            </div>

            {/* Recent trips list */}
            <section aria-label="Recent trips" style={{ marginTop: 'var(--s-2)' }}>
              <div className="section-header">
                <h2 className="section-title">
                  <IconClock size={16} />
                  Recent Trips
                </h2>
              </div>

              {trips.length === 0 ? (
                <div className="empty-state glass-card">
                  <div className="empty-icon"><IconClock size={32} /></div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                    No trips yet — log your first commute
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
                  {trips.slice(0, 10).map((trip) => {
                    const level = trip.kg_co2 > 3 ? 'high' : trip.kg_co2 > 1 ? 'med' : 'low';
                    const co2Color = level === 'high' ? 'var(--c-danger)' : level === 'med' ? 'var(--c-warning)' : 'var(--c-primary)';
                    return (
                      <article
                        key={trip.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--s-4)',
                          padding: 'var(--s-4)',
                          background: 'var(--glass-bg)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: 'var(--r-lg)',
                          transition: 'border-color var(--dur-base), background var(--dur-base)',
                          cursor: 'default',
                        }}
                        aria-label={`${MODE_LABELS[trip.mode] ?? trip.mode} from ${trip.origin} to ${trip.destination}`}
                      >
                        {/* Mode icon badge */}
                        <div style={{
                          width: 40, height: 40,
                          borderRadius: 'var(--r-md)',
                          background: `${MODE_COLORS[trip.mode] ?? '#64748b'}20`,
                          border: `1px solid ${MODE_COLORS[trip.mode] ?? '#64748b'}40`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: MODE_COLORS[trip.mode] ?? '#64748b',
                          flexShrink: 0,
                        }}>
                          <ModeIcon mode={trip.mode} size={18} />
                        </div>

                        {/* Route info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--w-medium)',
                            color: 'var(--text-primary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {trip.origin} → {trip.destination}
                          </p>
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {MODE_LABELS[trip.mode]}
                            {trip.distance_km ? ` · ${roundCO2(trip.distance_km)} km` : ''}
                            {trip.timestamp ? ` · ${formatDate(trip.timestamp)}` : ''}
                          </p>
                        </div>

                        {/* CO₂ value */}
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--w-bold)',
                            color: co2Color,
                          }}>
                            {roundCO2(trip.kg_co2)} kg
                          </div>
                          {trip.kg_saved_if_alt > 0 && (
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--c-primary)', marginTop: '2px' }}>
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


