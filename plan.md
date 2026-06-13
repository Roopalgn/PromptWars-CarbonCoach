# CarbonLens — Agent Build Brief
## PromptWars Virtual · Challenge 3: Carbon Footprint Awareness Platform

---

## 1. PRODUCT IDENTITY

**App Name:** CarbonCoach

**Tagline:** "Your next best low-carbon move — in under 30 seconds."

**One-line product definition:**
A context-aware personal carbon action coach for urban Indian commuters that turns every trip into an instant comparison between what you did and what you could have done — then tells you exactly what to do next.

**Persona (design every screen around this person):**
Urban Indian student or working professional, 18–30, making 2–5 trips a day across mixed modes — Ola/Uber, metro, auto-rickshaw, BEST/BMTC bus, walking. They have never calculated their transport carbon footprint. They do care about money and time. Carbon awareness is a side effect of a better decision, not the primary motivation. Every feature should feel like it makes their commute decision smarter, not like it's lecturing them about climate.

---

## 2. THE CORE LOOP (build this first, ship nothing else until it works perfectly)

```
User logs a trip
  → enters origin + destination (Places Autocomplete)
  → selects mode used (Ola, Metro, Auto, Bus, Walk, Cycle, Carpool)
  → app calls Maps Routes API → gets actual route distance in km
  → multiplies by India-specific emissions factor for that mode
  → stores result in Firestore (trip doc with timestamp, origin, dest, mode, km, kg_co2)
  → immediately shows: "This trip: 1.4 kg CO₂"
  → immediately shows: "If you'd taken Metro + Walk: 0.09 kg CO₂  [Save 1.31 kg]"
  → one-tap "Log & See My Week" → dashboard
```

This loop — log → calculate → compare → show savings — is the entire product. Everything else is polish on top of this.

---

## 3. GOOGLE SERVICES INTEGRATION (mandatory, must be deep not decorative)

### 3a. Firebase Authentication
- Google Sign-In only (one button, no email/password form)
- All data is user-scoped; unauthenticated users see a landing page only
- Auth state persists across sessions

### 3b. Firestore
- Collection structure:
  ```
  users/{uid}/trips/{tripId}
    - origin: string
    - destination: string
    - mode: string (enum)
    - distance_km: number (from Maps API, not user input)
    - kg_co2: number (calculated)
    - best_alternative_mode: string
    - best_alternative_kg: number
    - kg_saved_if_alt: number
    - timestamp: Firestore ServerTimestamp
  
  users/{uid}/insights/{insightId}
    - generated_at: timestamp
    - summary: string
    - top_action: string
    - weekly_total_kg: number
    - weekly_saved_potential_kg: number
  ```
- Use real-time `onSnapshot` listener on the dashboard so charts update live when a new trip is logged

### 3c. Google Maps Routes API
- Call on every trip log — do NOT let users type a distance number manually
- Use the Routes API (not the legacy Directions API): `POST https://routes.googleapis.com/directions/v2:computeRoutes`
- Request field mask: `routes.distanceMeters,routes.duration`
- Convert `distanceMeters` to km, round to 2 decimal places
- Handle API errors gracefully: if call fails, show "Couldn't calculate route — check your connection" and do not save the trip

### 3d. Places Autocomplete (Maps JavaScript API)
- Both origin and destination fields use Places Autocomplete widget
- Restrict to India (`componentRestrictions: { country: 'in' }`)
- Store the `place_id` alongside the address string in Firestore

### 3e. Gemini API (via Firebase AI Logic)
- Trigger: on dashboard load, if the user has ≥ 5 trips and no insight generated in the last 7 days
- System prompt instructs Gemini to return **only valid JSON**, no markdown, no preamble:
  ```json
  {
    "summary": "2-sentence plain English observation about this week's pattern",
    "top_action": "One specific sentence: the single best thing this user can do tomorrow",
    "encouragement": "One sentence acknowledging their best choice this week"
  }
  ```
- Pass the last 14 days of trip data as context (mode, distance, kg_co2 per trip)
- Render the output as a card on the dashboard — not a chatbot, not a modal, just a persistent insight card
- If Gemini call fails: show nothing, do not crash, log the error silently

### 3f. Firebase AI Logic — Maps Grounding (use if stable, skip if flaky)
- If `googleMapsWidgetContextToken` is available in your Firebase AI Logic SDK version, use it to ground the Gemini insight with real-time location context
- Implement it behind a try/catch with a plain Gemini API fallback
- Do not make this a headline feature in the README — mention it as "location-aware grounding via Firebase AI Logic" quietly in the architecture section

---

## 4. EMISSIONS DATA (India-specific, sourced, documented)

Store these as a config constant file (`src/config/emissionsFactors.js`). Reference the source in a comment.

```javascript
// Sources: CPCB 2023 Transport Emissions Report, CEA 2024, IEA India 2023
// Units: kg CO2 per passenger-km

export const EMISSIONS_FACTORS = {
  ola_uber:    0.143,   // private cab (petrol/CNG mix, Indian fleet avg)
  auto:        0.093,   // CNG auto-rickshaw
  bus:         0.040,   // urban bus (diesel, avg occupancy)
  metro:       0.031,   // Indian metro (grid electricity mix, 2024 CEA)
  carpool:     0.048,   // cab with 3 passengers sharing
  cycle:       0.000,   // zero operational emissions
  walk:        0.000,   // zero operational emissions
};

// For comparison panel: always compare against these alternatives
export const COMPARISON_MODES = ['metro', 'bus', 'auto', 'carpool', 'cycle', 'walk'];
```

This file must be:
- Imported by the calculation logic
- Referenced in the README with the source URLs
- Easy to find and easy to update (judges may look for this as a testability signal)

---

## 5. UI/UX REQUIREMENTS

### Visual identity
- Color system: dark forest green (#1a3a2a) as primary brand, warm off-white (#f5f2eb) as background, amber (#e8a020) as the action/savings accent
- Font: system-ui for body, a condensed weight for the CO₂ numbers (make the numbers feel like a dashboard instrument, not a web form)
- No gradients, no heavy shadows. Flat, clean, high-contrast
- Mobile-first layout — the primary user is on a phone

### Screen flow (all screens)

**Screen 1 — Landing (unauthenticated)**
- Single headline: "Every trip has a carbon cost. Know yours."
- Sub: "CarbonCoach shows your real transport footprint and your best alternative — instantly."
- One button: "Sign in with Google"
- No other content

**Screen 2 — Log a Trip (primary action screen, first screen after auth)**
- This is the home screen, not the dashboard
- Two autocomplete fields: "From" and "To"
- Mode selector: icon grid (7 modes), single-select, required
- "Calculate & Log" button
- On submit: loading state while Maps API call runs, then result card slides in:
  - "You used: [Mode] · [X km] · **[Y kg CO₂]**"
  - "Best alternative: [Mode] · **[Z kg CO₂]** · saves [W kg]"
  - Green CTA: "Log this trip →" saves to Firestore and redirects to dashboard

**Screen 3 — Dashboard**
- Week summary: total kg CO₂ this week, number of trips, kg saved if all best alternatives were taken
- Bar chart (Chart.js): daily CO₂ for last 7 days, bars colored by dominant mode
- Mode breakdown: small donut/pie showing % of trips by mode
- Gemini insight card (renders when available): bordered card, Gemini icon, 3 fields from JSON output
- Trip history list: last 10 trips, each showing mode icon + origin → destination + kg CO₂ + comparison savings
- Bottom nav: Log Trip | Dashboard | Profile

**Screen 4 — Profile**
- Display name + photo from Google Auth
- Lifetime stats: total trips logged, total kg CO₂, total kg saved vs alternatives
- "India average" comparison: 2.1 kg CO₂/day for urban transport (source: CPCB). Show user's daily average vs this
- Sign out button

### Accessibility requirements (these are scored)
- All interactive elements have visible focus rings
- All icon buttons have `aria-label` attributes
- Color contrast minimum 4.5:1 for all text (check with browser DevTools)
- Mode selector icons have `aria-label` and `role="radio"` or `role="button"` with `aria-pressed`
- All images have `alt` text
- Form inputs have associated `<label>` elements, not just placeholders
- App works with keyboard-only navigation (Tab, Enter, Space, Escape)

---

## 6. CODE QUALITY REQUIREMENTS (these are AI-evaluated)

### Structure
```
src/
  components/        # reusable UI components
  screens/           # one file per screen
  services/
    maps.js          # all Maps API calls isolated here
    gemini.js        # all Gemini/Firebase AI Logic calls isolated here
    firestore.js     # all Firestore read/write isolated here
    carbonCalc.js    # pure calculation functions (testable)
  config/
    emissionsFactors.js
    firebase.js      # Firebase app init
  hooks/             # custom React hooks if using React
  utils/             # date formatting, number rounding helpers
  App.js
  index.js
```

### Code rules the agent must follow
- No API keys in source code. All keys in `.env` file. `.env` in `.gitignore`
- `REACT_APP_` prefix for all env vars if using Create React App, or `VITE_` if using Vite
- Every async function wrapped in try/catch with user-visible error state
- No `console.log` left in production code (use only for debugging, remove before commit)
- All numbers that display to users go through a rounding function: `Math.round(value * 100) / 100`
- Maps API key restricted to HTTP referrer in Google Cloud Console (document this in README)
- Firestore security rules: users can only read/write their own documents
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{userId}/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
  ```
- No `any` types if using TypeScript; use typed interfaces for all Firestore documents
- Components under 150 lines where possible; extract logic to hooks/services

### Tech stack recommendation
- React (Vite) + plain CSS or Tailwind
- Firebase JS SDK v9+ (modular imports, tree-shakeable)
- Chart.js with react-chartjs-2 wrapper
- No heavy UI component libraries (they inflate bundle size past 10 MB repo limit risk)

---

## 7. SECURITY REQUIREMENTS (these are scored)

- Firestore rules deployed and tested (not just written)
- Maps API key has HTTP referrer restriction set in GCP console
- Gemini API calls go through Firebase AI Logic (client-side with App Check), not directly from client with exposed key
- Input sanitization: strip leading/trailing whitespace from all text inputs before saving to Firestore
- No user-controlled data interpolated directly into Gemini prompts without sanitization
- Add Firebase App Check to the project (even if in debug mode for the submission, configure it)

---

## 8. TESTING REQUIREMENTS (these are scored)

Write tests for the pure logic — this is where the testing criterion gets satisfied without needing complex E2E setup.

```javascript
// src/services/carbonCalc.test.js

import { calculateCO2, getBestAlternative, getKgSaved } from './carbonCalc';

test('Ola trip of 5km = 0.715 kg', () => {
  expect(calculateCO2('ola_uber', 5)).toBeCloseTo(0.715);
});

test('Metro is always the best alternative to Ola', () => {
  expect(getBestAlternative('ola_uber')).toBe('metro');
});

test('Savings calculation is correct', () => {
  expect(getKgSaved(1.4, 0.09)).toBeCloseTo(1.31);
});

test('Walking produces zero emissions', () => {
  expect(calculateCO2('walk', 10)).toBe(0);
});

test('Zero distance returns zero emissions', () => {
  expect(calculateCO2('ola_uber', 0)).toBe(0);
});
```

Use Jest (comes with Create React App) or Vitest (comes with Vite). At minimum 5 passing tests. Put them in `src/services/carbonCalc.test.js`.

---

## 9. README REQUIREMENTS (mandatory for submission)

The README must cover these sections explicitly (judges read this):

### Chosen Vertical
"Urban commuter in India — transport is 40–50% of personal urban carbon emissions and the most actionable slice for behavioral change. A transport-focused tool gives users specific, trip-level insights rather than abstract annual estimates."

### Approach and Logic
- Explain the core loop: Places Autocomplete → Routes API → India-specific emissions factors → Firestore → Gemini insight
- Explain why transport-only is a feature not a limitation
- List all Google Services used and why each one was chosen (not just listed)

### Emissions Data Sources
- Table: mode | factor | source | year
- Link to CPCB report, CEA annual report, IEA India
- Note that these are conservative averages for the Indian urban fleet

### Architecture Diagram
- Simple text or ASCII diagram showing: User → Firebase Auth → Firestore ← React App → Maps API / Gemini API

### How to Run
- `npm install` then `npm run dev`
- Environment variables needed (list names, not values)
- Firebase project setup steps

### Assumptions
- Emissions factors are per passenger-km averages, not vehicle-level
- Routes API returns road distance, not straight-line
- Gemini insight triggers only after 5+ trips to ensure meaningful context
- App is transport-only by design; food and home energy are out of scope for v1

### API Key Security
- Explicitly state: Maps API key restricted to HTTP referrer, Firestore rules deployed, Gemini accessed via Firebase AI Logic

---

## 10. REPO RULES (hard limits — violations disqualify)

- Repository must be PUBLIC on GitHub
- Single branch only: `main`
- Repo size must be under 10 MB — do not commit:
  - `node_modules/` (in .gitignore)
  - `.env` (in .gitignore)
  - Build output (`dist/` or `build/`) — exclude or the evaluator sees source anyway
  - Any large image assets (use SVG icons or emoji for mode icons)
- Commit regularly — commit history matters; a single giant commit looks like a one-shot paste

---

## 11. AGENT BUILD RULES — CRITICAL CONSTRAINTS TO MAINTAIN THROUGHOUT THE SESSION

These are non-negotiable rules the agent must apply at every step, not just at the start.

### Rule 1: Core loop before features
Do not build the dashboard before the trip log works end-to-end. Do not build Gemini insight before the dashboard renders real Firestore data. Build in strict sequence: Auth → Trip Log → Maps API → Firestore write → Dashboard read → Charts → Gemini → Polish.

### Rule 2: Every async operation has three states
Loading state (spinner or skeleton), success state (the result), error state (user-visible message). Never leave an async call without all three. Judges will click the app without an internet connection or with a bad address — it must not crash silently.

### Rule 3: Real distance, never user-typed distance
The Maps Routes API call is the product's core technical claim. If this call is skipped or mocked in the final submission, the entire differentiation collapses. The agent must not fall back to a manual distance input field under any circumstances.

### Rule 4: Emissions factors come from the config file only
The `EMISSIONS_FACTORS` object in `src/config/emissionsFactors.js` is the single source of truth. No hardcoded numbers anywhere else in the codebase. This makes the code testable, auditable, and shows architectural discipline to judges.

### Rule 5: No API keys in source
Before every commit, verify `.env` is in `.gitignore` and no key string appears in any `.js` file. This is a Security criterion item and a disqualification risk.

### Rule 6: Mobile layout is primary
Test every screen at 375px width (iPhone SE). If it breaks at 375px, it's broken. Desktop is secondary.

### Rule 7: Keep bundle lean
No Lodash, no Moment.js, no heavy UI libraries. Use native JS for date formatting (Intl.DateTimeFormat), native array methods for data processing. Target under 200KB gzipped bundle.

### Rule 8: Commit message discipline
Every commit message must be descriptive: `feat: add Places Autocomplete to trip log form` not `update`. This signals code quality to the AI evaluator.

### Rule 9: The comparison panel is mandatory
Every trip result must immediately show the best alternative. This is the product's "wow moment." It cannot be behind a click, a modal, or a separate screen. It appears automatically on the trip result card.

### Rule 10: Test file must pass before final commit
Run `npm test` before the final submission commit. All tests in `carbonCalc.test.js` must pass. Screenshot the test output and include it in the README if possible.

---

## 12. LINKEDIN POST TEMPLATE (required for submission)

```
Just built CarbonCoach for #PromptWarsVirtual Challenge 3 🌱

The insight: most carbon tracker apps ask "how far did you travel?" and trust whatever number you type. We call the Google Maps Routes API with your real origin and destination — so the CO₂ calculation is based on your actual route, not a guess.

Stack: React + Firebase Auth + Firestore + Maps Routes API + Places Autocomplete + Gemini via Firebase AI Logic

The core loop: log a trip → see your real CO₂ → instantly see what metro/bus/cycle would've cost → track your week on a live dashboard.

Using India-specific emissions factors (CPCB/CEA sourced) so the numbers actually reflect Indian auto-rickshaws and metro systems, not European defaults.

Built with Google Antigravity ⚡

#BuildwithAI #PromptWarsVirtual @googlefordevelopers @hack2skill
```

---

## 13. BLOG POST OUTLINE (required for submission)

Title: **"How I Built a Real-Data Carbon Coach for Indian Commuters — and Why Most Carbon Apps Get the Math Wrong"**

1. **The problem with carbon calculators** — they all ask you to type a number. We call an API instead.
2. **The core architecture** — React + Firebase + Maps Routes API + Gemini. Why each was chosen.
3. **The India-specific data problem** — Western kg CO₂/km defaults are wrong for Indian transport. Here's what the CPCB/CEA numbers actually say.
4. **The Gemini insight engine** — why a structured JSON output beats a chatbot for this use case. The exact prompt and why.
5. **What I'd build next** — food and home energy modules, carpool matching, offline support.
6. **Lessons from building with Google Antigravity** — what prompting for agent-first development feels like vs traditional coding.

---

## 14. PRIORITY ORDER IF TIME RUNS SHORT

If you're running out of time before Day 13, ship in this order:

1. ✅ Auth + Trip Log + Maps API call + Firestore write (non-negotiable)
2. ✅ Trip result card with comparison (non-negotiable)
3. ✅ Dashboard with Chart.js bar chart (non-negotiable)
4. ✅ README with all required sections (non-negotiable)
5. ✅ carbonCalc.test.js with 5 passing tests (non-negotiable)
6. ✅ Firestore security rules deployed (non-negotiable)
7. ⚡ Gemini insight card (high value, build if time allows)
8. ⚡ Profile screen with lifetime stats (medium value)
9. ⚡ PWA manifest (low value, 30 minutes max)
10. ⚡ Firebase AI Logic Maps grounding (only if Gemini is already working)

---

*End of build brief. Agent should treat this document as the single source of truth for all product, architecture, and code decisions throughout the build session.*
