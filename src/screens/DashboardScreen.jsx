import { useState, useEffect } from 'react';
import { useTrips } from '../hooks/useTrips';
import { getLatestInsight, saveInsight } from '../services/firestore';
import { generateInsight } from '../services/gemini';
import InsightCard from '../components/InsightCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { ModeIcon, IconBarChart2, IconPieChart, IconCalendar, IconLeaf } from '../components/Icons';
import { roundCO2, formatDate, formatDayLabel, getLast7Days, isThisWeek } from '../utils/formatters';
import { MODE_LABELS } from '../config/emissionsFactors';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const MODE_COLORS = {
  ola_uber: '#D97706',
  auto:     '#F59E0B',
  bus:      '#10B981',
  metro:    '#059669',
  carpool:  '#6366F1',
  cycle:    '#84CC16',
  walk:     '#14B8A6',
};

export default function DashboardScreen({ user }) {
  const { trips, tripsLoading } = useTrips(user.uid);
  const [insight, setInsight]   = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);

  // Week-scoped trips
  const weekTrips = trips.filter((t) => t.timestamp && isThisWeek(t.timestamp));

  const weekTotalKg    = weekTrips.reduce((s, t) => s + (t.kg_co2 ?? 0), 0);
  const weekTripCount  = weekTrips.length;
  const weekSavedPotential = weekTrips.reduce((s, t) => {
    const saved = t.kg_saved_if_alt ?? 0;
    return s + (saved > 0 ? saved : 0);
  }, 0);

  // Fetch / generate Gemini insight
  useEffect(() => {
    if (!user?.uid || trips.length < 5) return;

    async function loadInsight() {
      try {
        const existing = await getLatestInsight(user.uid);
        if (existing) {
          const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          const generatedAt  = existing.generated_at?.toDate?.()?.getTime() ?? 0;
          if (generatedAt > sevenDaysAgo) {
            setInsight(existing);
            return;
          }
        }
        // Generate new insight
        setInsightLoading(true);
        const newInsight = await generateInsight(trips, {
          total_kg:           roundCO2(weekTotalKg),
          saved_potential_kg: roundCO2(weekSavedPotential),
        });
        if (newInsight) {
          setInsight(newInsight);
          await saveInsight(user.uid, {
            ...newInsight,
            weekly_total_kg:          roundCO2(weekTotalKg),
            weekly_saved_potential_kg: roundCO2(weekSavedPotential),
          });
        }
      } catch {
        // Silent fail
      } finally {
        setInsightLoading(false);
      }
    }

    loadInsight();
  }, [trips.length, user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Bar chart: daily CO₂ last 7 days ----
  const last7Days = getLast7Days();
  const dailyData = last7Days.map((day) => {
    const dayTrips = trips.filter((t) => {
      if (!t.timestamp) return false;
      const d = t.timestamp.toDate ? t.timestamp.toDate() : new Date(t.timestamp);
      return (
        d.getFullYear()  === day.getFullYear() &&
        d.getMonth()     === day.getMonth() &&
        d.getDate()      === day.getDate()
      );
    });
    return roundCO2(dayTrips.reduce((s, t) => s + (t.kg_co2 ?? 0), 0));
  });

  const barData = {
    labels: last7Days.map(formatDayLabel),
    datasets: [
      {
        label: 'kg CO₂',
        data: dailyData,
        backgroundColor: dailyData.map((v) =>
          v > 3 ? 'rgba(220, 38, 38, 0.7)'
          : v > 1 ? 'rgba(217, 119, 6, 0.7)'
          : 'rgba(5, 150, 105, 0.7)'
        ),
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed.y} kg CO₂`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: {
          font: { family: "'JetBrains Mono', monospace", size: 11 },
          color: '#78716C',
          callback: (v) => `${v} kg`,
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { family: "'Inter', sans-serif", size: 12 },
          color: '#78716C',
        },
      },
    },
  };

  // ---- Donut chart: mode breakdown ----
  const modeCounts = {};
  trips.slice(0, 50).forEach((t) => {
    modeCounts[t.mode] = (modeCounts[t.mode] ?? 0) + 1;
  });
  const donutLabels = Object.keys(modeCounts);
  const donutData = {
    labels: donutLabels.map((m) => MODE_LABELS[m] ?? m),
    datasets: [
      {
        data: donutLabels.map((m) => modeCounts[m]),
        backgroundColor: donutLabels.map((m) => MODE_COLORS[m] ?? '#A8A29E'),
        borderWidth: 2,
        borderColor: '#FFFBEB',
      },
    ],
  };
  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: "'Inter', sans-serif", size: 11 },
          color: '#78716C',
          padding: 8,
          boxWidth: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.parsed} trips`,
        },
      },
    },
  };

  return (
    <>
      <a href="#dashboard-content" className="skip-link">Skip to dashboard</a>
      <main
        id="dashboard-content"
        className="screen screen--dashboard"
        aria-label="Your carbon dashboard"
      >
        <header className="screen-header">
          <p className="dashboard-greeting">Welcome back, {user.displayName?.split(' ')[0] ?? 'traveller'}</p>
          <h1 className="screen-title">This Week</h1>
        </header>

        {/* Loading state */}
        {tripsLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <LoadingSpinner label="Loading your trips…" />
          </div>
        ) : (
          <>
            {/* Week summary stats */}
            <section aria-label="Weekly summary" className="section">
              <div className="week-stats-grid">
                <div className="stat-card" role="group" aria-label={`${roundCO2(weekTotalKg)} kilograms CO₂ this week`}>
                  <p className="stat-number stat-number--primary" aria-hidden="true">
                    {roundCO2(weekTotalKg)}<small style={{ fontSize: '0.7em' }}> kg</small>
                  </p>
                  <p className="stat-label">CO₂ this week</p>
                </div>
                <div className="stat-card">
                  <p className="stat-number">{weekTripCount}</p>
                  <p className="stat-label">trips logged</p>
                </div>
                <div className="stat-card stat-card--accent" role="group" aria-label={`Could save ${roundCO2(weekSavedPotential)} kilograms CO₂`}>
                  <p className="stat-number stat-number--accent">{roundCO2(weekSavedPotential)}<small style={{ fontSize: '0.7em' }}> kg</small></p>
                  <p className="stat-label">saveable</p>
                </div>
              </div>
            </section>

            {/* Gemini insight card */}
            {insightLoading && trips.length >= 5 && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                <LoadingSpinner size={16} label="Generating AI insight…" />
                <span aria-live="polite">Generating insight…</span>
              </div>
            )}
            {insight && <InsightCard insight={insight} />}

            {/* Bar chart */}
            <section aria-label="Daily CO₂ chart" className="section">
              <div className="chart-card">
                <h2 className="chart-title">
                  <IconBarChart2 size={18} />
                  Daily CO₂ — Last 7 Days
                </h2>
                {trips.length === 0 ? (
                  <div className="chart-empty" aria-label="No trips logged yet">
                    <div className="chart-empty-icon">
                      <IconLeaf size={32} />
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                      Log your first trip to see your chart
                    </p>
                  </div>
                ) : (
                  <div style={{ height: 180 }} aria-label="Bar chart of daily carbon emissions for the last 7 days">
                    <Bar data={barData} options={barOptions} />
                  </div>
                )}
              </div>
            </section>

            {/* Mode donut chart */}
            {donutLabels.length > 0 && (
              <section aria-label="Mode breakdown chart" className="section">
                <div className="chart-card">
                  <h2 className="chart-title">
                    <IconPieChart size={18} />
                    Mode Breakdown
                  </h2>
                  <div style={{ height: 200 }} aria-label="Donut chart showing trips by transport mode">
                    <Doughnut data={donutData} options={donutOptions} />
                  </div>
                </div>
              </section>
            )}

            {/* Trip history */}
            <section aria-label="Recent trips" className="section">
              <h2 className="section-title">
                <IconCalendar size={18} />
                Recent Trips
              </h2>
              {trips.length === 0 ? (
                <div className="chart-card chart-empty">
                  <div className="chart-empty-icon">
                    <IconCalendar size={32} />
                  </div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                    No trips yet — log your first commute
                  </p>
                </div>
              ) : (
                <div className="trip-list" aria-label="List of recent trips">
                  {trips.slice(0, 10).map((trip) => (
                    <article
                      key={trip.id}
                      className="trip-item"
                      aria-label={`${MODE_LABELS[trip.mode] ?? trip.mode} trip from ${trip.origin} to ${trip.destination}`}
                    >
                      <div className="trip-mode-icon" aria-hidden="true">
                        <ModeIcon mode={trip.mode} size={18} />
                      </div>
                      <div className="trip-info">
                        <p className="trip-route">
                          {trip.origin} → {trip.destination}
                        </p>
                        <p className="trip-meta">
                          {MODE_LABELS[trip.mode] ?? trip.mode}
                          {trip.distance_km ? ` · ${roundCO2(trip.distance_km)} km` : ''}
                          {trip.timestamp ? ` · ${formatDate(trip.timestamp)}` : ''}
                        </p>
                      </div>
                      <div className="trip-co2">
                        <span className="trip-co2-num">{roundCO2(trip.kg_co2)} kg</span>
                        {trip.kg_saved_if_alt > 0 && (
                          <span className="trip-saved" aria-label={`Could save ${roundCO2(trip.kg_saved_if_alt)} kg CO₂`}>
                            −{roundCO2(trip.kg_saved_if_alt)} possible
                          </span>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}
