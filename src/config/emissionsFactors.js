// Sources:
// - CPCB 2023 Transport Emissions Report (Central Pollution Control Board)
// - CEA Annual Report 2024 (Central Electricity Authority) — grid emission factor
// - IEA India 2023 (International Energy Agency)
// Units: kg CO₂ per passenger-km

export const EMISSIONS_FACTORS = {
  ola_uber: 0.143,  // private cab — petrol/CNG mix, Indian fleet average
  auto:     0.093,  // CNG auto-rickshaw
  bus:      0.040,  // urban bus — diesel, average occupancy
  metro:    0.031,  // Indian metro — grid electricity mix, 2024 CEA
  carpool:  0.048,  // ride-share cab with 3 passengers sharing
  cycle:    0.000,  // zero operational emissions
  walk:     0.000,  // zero operational emissions
};

// Modes shown in the comparison panel (exclude user's chosen mode at runtime)
export const COMPARISON_MODES = ['metro', 'bus', 'auto', 'carpool', 'cycle', 'walk'];

export const MODE_LABELS = {
  ola_uber: 'Ola / Uber',
  auto:     'Auto',
  bus:      'Bus',
  metro:    'Metro',
  carpool:  'Carpool',
  cycle:    'Cycle',
  walk:     'Walk',
};

export const MODE_EMOJIS = {
  ola_uber: '🚗',
  auto:     '🛺',
  bus:      '🚌',
  metro:    '🚇',
  carpool:  '👥',
  cycle:    '🚲',
  walk:     '🚶',
};

// India urban transport daily average — source: CPCB 2023
export const INDIA_DAILY_AVERAGE_KG = 2.1;
