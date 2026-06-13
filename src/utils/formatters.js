/** Round a CO₂ value to 2 decimal places for display. */
export function roundCO2(value) {
  return Math.round(value * 100) / 100;
}

/** Round a distance value to 2 decimal places for display. */
export function formatKm(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Format a Firestore Timestamp or Date for display.
 * @param {import('firebase/firestore').Timestamp|Date|null} timestamp
 * @returns {string}
 */
export function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('en-IN', {
    day:    'numeric',
    month:  'short',
    hour:   '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Format a Date as a short weekday label (Mon, Tue …)
 * @param {Date} date
 */
export function formatDayLabel(date) {
  return new Intl.DateTimeFormat('en-IN', { weekday: 'short' }).format(date);
}

/**
 * Return an array of the last 7 calendar days (oldest first, today last).
 * Each item is a Date set to midnight.
 */
export function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
}

/**
 * Check if a Firestore Timestamp is within the current calendar week (Mon–Sun).
 * @param {import('firebase/firestore').Timestamp} timestamp
 */
export function isThisWeek(timestamp) {
  if (!timestamp) return false;
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1; // Mon = 0
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);
  return date >= weekStart;
}
