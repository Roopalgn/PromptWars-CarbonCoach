/**
 * Gemini AI Insight Card — premium glassmorphism style.
 * Only renders when `insight` is non-null.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.insight - The insight object from Gemini
 * @param {string} props.insight.summary - Headline/summary of the insight
 * @param {string} props.insight.top_action - Recommendation for the user
 * @param {string} props.insight.encouragement - Positive reinforcement message
 * @returns {JSX.Element|null}
 */
export default function InsightCard({ insight }) {
  if (!insight) return null;

  return (
    <div className="insight-card" role="complementary" aria-label="AI-powered carbon insight">
      <div className="insight-label">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"/>
        </svg>
        Gemini AI Insight
      </div>

      {insight.summary && (
        <p className="insight-headline">{insight.summary}</p>
      )}

      {insight.top_action && (
        <p className="insight-body">
          <strong className="insight-strong">Tomorrow&apos;s move:</strong>{' '}
          {insight.top_action}
        </p>
      )}

      {insight.encouragement && (
        <div className="insight-action">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          {insight.encouragement}
        </div>
      )}
    </div>
  );
}
