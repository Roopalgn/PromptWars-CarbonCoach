/**
 * Gemini AI service via Firebase AI Logic (firebase/ai).
 * Uses GoogleAI backend — authenticated via Firebase project credentials.
 * Falls back to @google/generative-ai if Firebase AI Logic is unavailable.
 *
 * Returns null on any failure — Gemini insight card simply won't render.
 *
 * @param {Array} trips - recent trip objects from Firestore
 * @param {Object} weeklyStats - { total_kg, saved_potential_kg }
 * @returns {Promise<{summary, top_action, encouragement}|null>}
 */
export async function generateInsight(trips, weeklyStats = {}) {
  const tripSummary = trips
    .slice(0, 14)
    .map((t) => `${t.mode} | ${t.distance_km} km | ${t.kg_co2} kg CO2`)
    .join('\n');

  const prompt = `You are a carbon footprint coach for urban Indian commuters. \
Analyse the following recent transport trips and return ONLY a valid JSON object — \
no markdown, no code fences, no preamble.

Trips (last 14 days):
${tripSummary}

Weekly total: ${weeklyStats.total_kg ?? 0} kg CO2
Potential savings if best alternatives taken: ${weeklyStats.saved_potential_kg ?? 0} kg CO2

Return exactly this JSON with no extra text:
{
  "summary": "2-sentence plain English observation about this user's transport pattern",
  "top_action": "One specific sentence: the single best thing this user can do tomorrow to reduce transport carbon",
  "encouragement": "One sentence acknowledging their best transport choice this week"
}`;

  // Strategy 1: Firebase AI Logic (firebase/ai) — uses Firebase project credentials
  try {
    const { getAI, getGenerativeModel, GoogleAIBackend } = await import('firebase/ai');
    const { app } = await import('../config/firebase');
    const ai    = getAI(app, { backend: new GoogleAIBackend() });
    const model = getGenerativeModel(ai, { model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text   = result.response.text();
    return parseGeminiJSON(text);
  } catch {
    // Strategy 1 failed (firebase/ai not available or quota) — try Strategy 2
  }

  // Strategy 2: @google/generative-ai direct (uses VITE_GEMINI_API_KEY)
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error('No Gemini API key');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text   = result.response.text();
    return parseGeminiJSON(text);
  } catch {
    // Both strategies failed — silent fail per plan
    return null;
  }
}

function parseGeminiJSON(text) {
  const jsonStr = text
    .replace(/^```json?\s*/im, '')
    .replace(/```\s*$/m, '')
    .trim();
  return JSON.parse(jsonStr);
}
