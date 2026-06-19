# CarbonCoach Setup Guide

This document guides you through setting up CarbonCoach locally, configuring environment variables, and securing your API keys for production.

---

## 1. Local Development Setup

Follow these steps to run the application locally:

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# Edit .env and enter your Firebase and Google Maps API keys (see section below)

# 3. Run development server (Vite HMR)
npm run dev

# 4. Run tests
npm test
```

---

## 2. Environment Variables (`.env`)

Create a `.env` file in the root directory (based on `.env.example`). The following variables are required:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_MAPS_API_KEY=your_google_maps_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

*Note: `.env` is already configured in `.gitignore` to prevent secret leakage.*

---

## 3. Production Hardening: API Key Restrictions

Because the API keys are bundled into the client-side JavaScript, they must be restricted in the Google Cloud Console to prevent unauthorized usage and quota theft.

### A. Google Maps API Key Restrictions
1. Open the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2. Click on the API key used for **`VITE_MAPS_API_KEY`** to edit it.
3. Under **Application restrictions**:
   - Select **Web sites (HTTP referrers)**.
   - Under **Website restrictions**, click **Add**.
   - Add your deployed domain: `https://carboncoach-f8d95.web.app/*` (and `https://carboncoach-f8d95.firebaseapp.com/*`).
   - Add localhost for local testing (optional, or use a separate key for dev): `http://localhost:5173/*`.
4. Under **API restrictions**:
   - Select **Restrict key**.
   - In the dropdown, select:
     - **Maps JavaScript API**
     - **Places API**
     - **Routes API**
5. Click **Save**.

### B. Gemini API Key Restrictions
1. Open the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2. Click on the API key used for **`VITE_GEMINI_API_KEY`** to edit it.
3. Under **API restrictions**:
   - Select **Restrict key**.
   - In the dropdown, select:
     - **Generative Language API** (this restricts the key to only work with the Gemini Developer API/Google AI SDK).
4. Click **Save**.

---

## 4. Deployed Verification

After deployment, verify that cross-origin requests are blocked and restrictions are working:
1. Try using the Google Maps or Gemini services from a different domain or local port that is not in your referrer list. The requests should fail with a `403 Forbidden` / API restriction error.
2. Confirm that the application loads and functions correctly on `https://carboncoach-f8d95.web.app`.
