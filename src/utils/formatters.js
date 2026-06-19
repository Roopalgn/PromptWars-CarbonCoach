/**
 * Round a CO₂ value to 2 decimal places for display.
 * @param {number} value - CO2 emissions value in kg
 * @returns {number} Rounded value
 */
export function roundCO2(value) {
  if (value === null || value === undefined || typeof value !== 'number') {
    console.warn('[formatters] Invalid CO2 value:', value);
    return 0;
  }
  return Math.round(value * 100) / 100;
}

/**
 * Round a distance value to 2 decimal places for display.
 * @param {number} value - Distance value in km
 * @returns {number} Rounded value
 */
export function formatKm(value) {
  if (value === null || value === undefined || typeof value !== 'number') {
    console.warn('[formatters] Invalid distance value:', value);
    return 0;
  }
  return Math.round(value * 100) / 100;
}

/**
 * Format a Firestore Timestamp or Date for display.
 * @param {import('firebase/firestore').Timestamp|Date|null} timestamp - The timestamp/date to format
 * @returns {string} Formatted local date string
 */
export function formatDate(timestamp) {
  if (!timestamp) return '';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.warn('[formatters] Invalid date:', timestamp);
      return '';
    }
    return new Intl.DateTimeFormat('en-IN', {
      day:    'numeric',
      month:  'short',
      hour:   '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (error) {
    console.warn('[formatters] formatDate error:', error.message);
    return '';
  }
}

/**
 * Format a Date as a short weekday label (Mon, Tue …)
 * @param {Date} date - The date to format
 * @returns {string} The day label
 */
export function formatDayLabel(date) {
  return new Intl.DateTimeFormat('en-IN', { weekday: 'short' }).format(date);
}

/**
 * Return an array of the last 7 calendar days (oldest first, today last).
 * Each item is a Date set to midnight.
 * @returns {Date[]} Array of Date objects
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
 * @param {import('firebase/firestore').Timestamp|Date} timestamp - The timestamp to check
 * @returns {boolean} True if within the current week
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

/**
 * Format a long address into a cleaner short version.
 * Takes the first part, or first two parts if the first part is a short prefix.
 * @param {string} address - The long address string
 * @returns {string} Shortened address
 */
export function formatShortAddress(address) {
  if (!address) return '';
  const parts = address.split(',');
  if (parts.length <= 1) return address;

  const first = parts[0].trim();
  const second = parts[1].trim();

  // If first part is a number or floor/room prefix, combine first two parts
  if (first.length <= 12 && /^\d|floor|room|flat|shop|no\./i.test(first)) {
    return `${first}, ${second}`;
  }
  return first;
}
