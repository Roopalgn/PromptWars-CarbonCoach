# CarbonCoach

> **"Your next best low-carbon move — in under 30 seconds."**

**[Live Demo](https://carboncoach-f8d95.web.app)**


A context-aware personal carbon action coach for urban Indian commuters. Log a trip, see your real CO₂, and instantly discover the greener alternative.

Built for **PromptWars Virtual — Challenge 3: Carbon Footprint Awareness Platform**  
Built with **Google Antigravity**

---

## 1. Chosen Vertical

**Urban commuter in India — transport is 40–50% of personal urban carbon emissions and the most actionable slice for behavioural change.**

A transport-focused tool gives users specific, trip-level insights rather than abstract annual estimates. Every feature is designed around the insight that Indian users respond to money and time signals — carbon awareness is a side effect of a smarter commute decision.

---

## 2. Approach and Logic

### The Decision Loop
CarbonCoach operates on a context-driven, instantaneous cycle:
1. **Accurate Input Retrieval**: Instead of asking users to guess their travel distance, they select an origin and destination via Google Places autocomplete.
2. **Real-Road Routing**: The app queries the Google Maps Routes API, calculating the exact road distance in kilometers.
3. **Calibrated Calculations**: The distance is multiplied by transport-specific emissions factors calibrated for the Indian urban fleet ( Ola/Uber cabs, CNG auto-rickshaws, metro, diesel buses, shared carpools).
4. **Instant Alternative Matching**: The app immediately computes comparisons against zero-emission (walk/cycle) and low-emission practical transit options (metro/bus) for the same route.
5. **Real-Time Visualization**: The logged data is written to Cloud Firestore, which instantly updates the user's dashboard charts via `onSnapshot` listeners.
6. **Gemini Coaching Insights**: Once the user logs 5 or more trips, the app gathers their context and triggers Gemini 1.5 Flash (via Firebase AI Logic) to formulate personalized, structured coaching tips (Observation, Actionable Move, Encouragement).

```text
User enters origin + destination (Places Autocomplete)
  → selects transport mode used
  → app calls Google Maps Routes API → gets actual road distance in km
  → multiplies by India-specific emissions factor
  → stores in Firestore
  → shows: "This trip: 1.4 kg CO₂"
  → shows: "If you'd taken Metro: 0.09 kg CO₂ — saves 1.31 kg"
  → Log & See Dashboard → live chart updates
```

---

## 3. How the Solution Works

### High-Level Architecture

```text
User Browser
  │
  ├── Firebase Auth (Google Sign-In)
  │
  ├── React App (Vite)
  │     ├── Maps JS API (Places Autocomplete widget)
  │     ├── Routes API (POST /v2:computeRoutes → distance_km)
  │     ├── carbonCalc.js (pure functions, India-specific factors)
  │     └── firebase/ai (Gemini 1.5 Flash via Firebase AI Logic)
  │
  └── Firestore (users/{uid}/trips · users/{uid}/insights)
        └── onSnapshot → Dashboard re-renders live
```

### Google Services Integrated

| Service | Why / Implementation |
|---------|-----|
| **Firebase Authentication** | Google Sign-In — one button, no password form. Auth state persists across sessions and syncs across devices. |
| **Firestore Database** | Real-time `onSnapshot` subscriptions so dashboard charts update the moment a trip is logged. Scoped read/write security rules. |
| **Google Maps Routes API** | Computes actual road distance between origin/destination coordinates, avoiding user estimation errors. |
| **Places Autocomplete** | India-restricted search parameters (`componentRestrictions: { country: 'in' }`). Stores Google `place_id` alongside addresses. |
| **Firebase AI Logic** | Generates structured JSON insights (summary + top action + encouragement). Leverages direct backend configuration. |

### Technical Stack & Libraries
- **React 18 (Vite)**: High-speed bundling, hot module reloading.
- **Firebase JS SDK v10**: Tree-shakeable, modular imports.
- **Chart.js & react-chartjs-2**: High-performance rendering of carbon breakdowns.
- **@googlemaps/js-api-loader**: Lazy-loads Places widgets.
- **Vitest**: Unit testing calculations, component smoke tests, and security rule test suites.
- **Vanilla CSS**: Custom organic biophilic design system (no generic styling sheets).

---

## 4. Emissions Data Sources

Emissions factors represent per-passenger-km averages for the Indian urban fleet:

| Mode | Factor (kg CO₂/km) | Source | Year |
|------|---------------------|--------|------|
| Ola / Uber | 0.143 | CPCB Transport Emissions Report | 2023 |
| Auto-rickshaw | 0.093 | CPCB (CNG fleet average) | 2023 |
| Urban Bus | 0.040 | CPCB (diesel, avg occupancy) | 2023 |
| Metro | 0.031 | CEA Annual Report (grid electricity mix) | 2024 |
| Carpool (3 pax) | 0.048 | CPCB (shared cab average) | 2023 |
| Cycle | 0.000 | IEA India | 2023 |
| Walk | 0.000 | IEA India | 2023 |

- [CPCB 2023 Transport Emissions Report](https://cpcb.nic.in)
- [CEA Annual Report 2024](https://cea.nic.in)
- [IEA India 2023](https://www.iea.org/countries/india)

---

## 5. Assumptions Made

- **Per-Passenger Averages**: Emissions factors are passenger-km calculations rather than vehicle-level measurements (e.g. bus occupancy is averaged).
- **Practical Alternative Thresholds**: Zero-emission modes (walk/cycle) are shown separately. The "best practical alternative" recommends motorized transit options (metro, bus) suited for medium/long commutes.
- **Coaching Context Minimum**: Gemini insights trigger only after 5+ trips to ensure there is enough historical data to generate meaningful context.
- **Route travel**: Routes API calculations are based on driving distances (DRIVE mode) to mimic typical road-based transit routes.

---

## 6. How to Run & Setup

### Environment Variables
Configure these in `.env` (refer to `.env.example`):
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_MAPS_API_KEY=...
VITE_GEMINI_API_KEY=...
```

### Installation
```bash
# Install packages
npm install

# Start Vite HMR locally
npm run dev

# Run Vitest test suite
npm test

# Build production bundle and deploy
npm run deploy
```

---

## 7. Accessibility

- **Keyboard Navigation**: Full keyboard navigation on the mode selector (arrow keys, Space/Enter) using a roving tabindex pattern.
- **Semantic HTML**: Proper semantic landmarks (`<nav>`, `<main>`, `<header>`) and ARIA radiogroup/radio patterns.
- **Screen Reader Support**: Descriptive `aria-label` attributes on all icon-only buttons, dynamic `aria-current` state on navigation links, and screen-reader-only labels (`.sr-only`) to indicate the active page.

---

## 8. Rubric Mapping

### Code Quality
- **Separation of Concerns**: UI, API loaders, and calculations are kept separate (e.g., `carbonCalc.js` is a pure function module with 100% test coverage).
- **No Inline Styles**: Follows the `UI/UX Pro Max` design guidelines using standard CSS selectors and a consistent CSS custom properties variables system.

### Security
- **Data Scoping**: Firebase Firestore Security Rules explicitly restrict read/write access to matching authenticated UIDs (`/users/{userId}/**`).
- **API Key Hardening**: Environment variables are kept out of Git (`.env` in `.gitignore`). Setup instructions guide setting HTTP referrers and API restrictions in Google Cloud Console.
- **Firebase Hosting Headers**: Implements HTTP security headers including a strict Content-Security-Policy (CSP), `X-Content-Type-Options: nosniff`, and `X-Frame-Options: DENY`.

### Efficiency
- **State Optimization**: Uses real-time `onSnapshot` subscriptions optimized to update elements efficiently rather than trigger complete page rerenders.
- **Emissions Factors**: Zero-occupancy modes (walking, cycling) short-circuit calculations immediately to minimize unnecessary processing.

### Testing
- **Multi-layered Testing**: Includes unit tests for core calculation utility logic, React component testing for `ModeSelector` interaction via `@testing-library/react`, and emulator-based security rule integration tests.

### Accessibility
- **WCAG 2.1 AA Checklist**: Roving tabindex, accessible modal overlays, visible focus indicators, and semantic landmarks.

### Google Services
- **Firebase Auth & Firestore**: Integrates Google Sign-In and real-time Firestore database listener.
- **Google Maps JS API & Routes API**: Leverages the official JS loader to fetch real travel distances directly using Place Autocomplete and computeRoutes endpoint.

---

*Built with Google Antigravity for PromptWars Virtual Challenge 3.*
