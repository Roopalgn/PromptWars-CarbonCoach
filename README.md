# CarbonCoach

> **"Your next best low-carbon move — in under 30 seconds."**

A context-aware personal carbon action coach for urban Indian commuters. Log a trip, see your real CO₂, and instantly discover the greener alternative.

Built for **PromptWars Virtual — Challenge 3: Carbon Footprint Awareness Platform**  
Built with **Google Antigravity**

---

## Chosen Vertical

**Urban commuter in India — transport is 40–50% of personal urban carbon emissions and the most actionable slice for behavioural change.**

A transport-focused tool gives users specific, trip-level insights rather than abstract annual estimates. Every feature is designed around the insight that Indian users respond to money and time signals — carbon awareness is a side effect of a smarter commute decision.

---

## The Core Loop

```
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

## Google Services Used

| Service | Why |
|---------|-----|
| **Firebase Authentication** | Google Sign-In — one button, no password form. Auth state persists across sessions. |
| **Firestore** | Real-time `onSnapshot` so dashboard charts update the moment a trip is logged. User-scoped data with deployed security rules. |
| **Google Maps Routes API** | Real road distance from actual origin/destination — not user-typed numbers. This is the product's core technical claim. |
| **Places Autocomplete (Maps JS API)** | Restricted to India (`componentRestrictions: { country: 'in' }`). Stores `place_id` in Firestore alongside address string. |
| **Firebase AI Logic (Gemini 1.5 Flash)** | Generates structured JSON insight (summary + top action + encouragement) when user has ≥5 trips. Called via Firebase AI Logic — no client-side Gemini key exposed. |

---

## Emissions Data Sources

| Mode | Factor (kg CO₂/km) | Source | Year |
|------|---------------------|--------|------|
| Ola / Uber | 0.143 | CPCB Transport Emissions Report | 2023 |
| Auto-rickshaw | 0.093 | CPCB (CNG fleet average) | 2023 |
| Urban Bus | 0.040 | CPCB (diesel, avg occupancy) | 2023 |
| Metro | 0.031 | CEA Annual Report (grid electricity mix) | 2024 |
| Carpool (3 pax) | 0.048 | CPCB (shared cab average) | 2023 |
| Cycle | 0.000 | IEA India | 2023 |
| Walk | 0.000 | IEA India | 2023 |

Sources:
- [CPCB 2023 Transport Emissions Report](https://cpcb.nic.in)
- [CEA Annual Report 2024](https://cea.nic.in)
- [IEA India 2023](https://www.iea.org/countries/india)

These are conservative per-passenger-km averages for the Indian urban fleet — not European defaults.

---

## Architecture

```
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

---

## Project Structure

```
src/
  components/        # Reusable UI components
    BottomNav.jsx
    Icons.jsx          # Inline SVG icon library (no external package)
    InsightCard.jsx
    LoadingSpinner.jsx
    ModeSelector.jsx
    TripResultCard.jsx
  config/
    emissionsFactors.js  # Single source of truth for all kg CO₂/km values
    firebase.js
  hooks/
    useAuth.js
    useTrips.js          # Real-time Firestore onSnapshot
  screens/
    LandingScreen.jsx
    LogTripScreen.jsx    # Primary action screen
    DashboardScreen.jsx  # Charts + Gemini insight + trip history
    ProfileScreen.jsx    # Lifetime stats + India average comparison
  services/
    carbonCalc.js        # Pure functions (testable)
    carbonCalc.test.js   # 7 Vitest tests
    firestore.js         # All Firestore reads/writes
    gemini.js            # Firebase AI Logic call
    maps.js              # Routes API + Maps JS API loader
  utils/
    formatters.js
  App.jsx
  main.jsx
  index.css              # Design system (Organic Biophilic — UI/UX Pro Max)
```

---

## How to Run

```bash
# Install dependencies
npm install

# Add environment variables
cp .env.example .env
# Fill in your Firebase and Maps API keys (see .env.example)

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Environment Variables Required

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_MAPS_API_KEY
```

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Google provider
3. Enable **Firestore** → Create database (production mode)
4. Deploy security rules: copy `firestore.rules` content into the Firestore rules editor
5. Enable **Firebase AI Logic** (Vertex AI) in the Firebase console
6. Enable **Maps JavaScript API**, **Places API**, **Routes API** in Google Cloud Console
7. Add HTTP referrer restriction to your Maps API key

---

## Assumptions

- Emissions factors are per passenger-km averages, not vehicle-level measurements
- Routes API returns road distance (not straight-line crow-flies)
- Gemini insight triggers only after 5+ trips to ensure meaningful context
- App is transport-only by design; food and home energy are out of scope for v1
- "Best alternative" means best motorised alternative (metro, bus, auto, carpool) — walk/cycle are shown separately

---

## API Key Security

- **Maps API key** is restricted to HTTP referrers in Google Cloud Console (document your deployment domain)
- **Firestore security rules** are deployed — users can only read/write `users/{their-uid}/**`
- **Gemini** is accessed via Firebase AI Logic (uses Firebase project credentials) — no Gemini key exposed client-side
- **`.env` is in `.gitignore`** — no keys committed to the repository

---

## Tech Stack

- **React 18** (Vite) — fast HMR, lean bundle
- **Firebase JS SDK v10** — modular imports, tree-shakeable
- **Chart.js + react-chartjs-2** — bar chart (daily CO₂) + donut (mode breakdown)
- **@googlemaps/js-api-loader** — lazy-loads Maps JS API with Places library
- **Vitest** — 7 unit tests for pure carbon calculation functions
- **Vanilla CSS** — custom design system (Organic Biophilic palette), no UI framework

---

## Design System

Generated with **UI/UX Pro Max v2.5.0** (Organic Biophilic style):

- **Style:** Organic Biophilic — nature-forward, rounded corners (16–24px), natural shadows
- **Colors:** Amber primary `#D97706` · Green accent `#059669` · Warm cream bg `#FFFBEB`
- **Typography:** Calistoga (headings) + Inter (body) — editorial warmth + readability
- **Icons:** Inline SVG only (no emoji as icons)
- **Accessibility:** WCAG AA — 4.5:1 contrast, visible focus rings, aria-labels, keyboard nav
- **Mobile-first:** Primary design target 375px (iPhone SE)

---

*Built with Google Antigravity for PromptWars Virtual Challenge 3.*
