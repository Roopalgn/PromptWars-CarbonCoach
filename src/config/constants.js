/**
 * @file constants.js
 * @description Centralized constants and configuration settings for CarbonCoach.
 */

/**
 * Default structure representing an unauthenticated guest user.
 * @type {Object}
 * @property {string} uid - Unique identifier for the guest
 * @property {string} displayName - Name displayed for the guest
 * @property {null} email - Email is null for guest
 * @property {null} photoURL - Photo is null for guest
 * @property {boolean} isGuest - Flag to identify guest mode
 */
export const GUEST_USER = {
  uid: 'guest',
  displayName: 'Guest',
  email: null,
  photoURL: null,
  isGuest: true,
};

/**
 * Seed trips data displayed as a placeholder for guest mode.
 * @type {Array<Object>}
 */
export const SEED_TRIPS = [
  {
    id: 's1',
    mode: 'ola_uber',
    origin: 'Connaught Place',
    destination: 'Gurugram',
    distance_km: 28,
    kg_co2: 4.00,
    kg_saved_if_alt: 2.9,
    timestamp: { toDate: () => new Date() }
  },
  {
    id: 's2',
    mode: 'metro',
    origin: 'Hauz Khas',
    destination: 'Rajiv Chowk',
    distance_km: 9,
    kg_co2: 0.28,
    kg_saved_if_alt: 0,
    timestamp: { toDate: () => new Date(Date.now() - 86400000 * 1) }
  },
  {
    id: 's3',
    mode: 'bus',
    origin: 'Sarojini Nagar',
    destination: 'Nehru Place',
    distance_km: 7,
    kg_co2: 0.28,
    kg_saved_if_alt: 0,
    timestamp: { toDate: () => new Date(Date.now() - 86400000 * 2) }
  },
  {
    id: 's4',
    mode: 'auto',
    origin: 'Lajpat Nagar',
    destination: 'Saket',
    distance_km: 5,
    kg_co2: 0.47,
    kg_saved_if_alt: 0.31,
    timestamp: { toDate: () => new Date(Date.now() - 86400000 * 2) }
  },
  {
    id: 's5',
    mode: 'cycle',
    origin: 'Dwarka Sector 10',
    destination: 'Dwarka Sec 14',
    distance_km: 3,
    kg_co2: 0,
    kg_saved_if_alt: 0,
    timestamp: { toDate: () => new Date(Date.now() - 86400000 * 3) }
  },
  {
    id: 's6',
    mode: 'ola_uber',
    origin: 'Vasant Vihar',
    destination: 'Aerocity',
    distance_km: 15,
    kg_co2: 2.15,
    kg_saved_if_alt: 1.7,
    timestamp: { toDate: () => new Date(Date.now() - 86400000 * 4) }
  },
  {
    id: 's7',
    mode: 'metro',
    origin: 'Janakpuri',
    destination: 'Barakhamba',
    distance_km: 18,
    kg_co2: 0.56,
    kg_saved_if_alt: 0,
    timestamp: { toDate: () => new Date(Date.now() - 86400000 * 5) }
  },
];

/**
 * Mapping of transport modes to their theme colors.
 * @type {Object.<string, string>}
 */
export const MODE_COLORS = {
  ola_uber: '#ef4444',
  auto:     '#f59e0b',
  bus:      '#06b6d4',
  metro:    '#10b981',
  carpool:  '#a78bfa',
  cycle:    '#34d399',
  walk:     '#22d3ee',
};

/**
 * Mapping of transport modes to CSS fill class names.
 * @type {Object.<string, string>}
 */
export const MODE_BAR_CLASS = {
  walk:    'alt-bar-fill--green',
  cycle:   'alt-bar-fill--green',
  metro:   'alt-bar-fill--cyan',
  bus:     'alt-bar-fill--cyan',
  carpool: 'alt-bar-fill--violet',
  auto:    'alt-bar-fill--amber',
  ola_uber:'alt-bar-fill--red',
};

/**
 * Chart styling configuration constants.
 */
export const CHART_FONT = "'Fira Sans', system-ui, sans-serif";
export const CHART_MONO = "'Fira Code', monospace";
export const GRID_COLOR  = 'rgba(255,255,255,0.05)';
export const TICK_COLOR  = '#475569';
