/**
 * Renders a Gemini-generated insight as a persistent card.
 * Only renders when `insight` is non-null.
 */
export default function InsightCard({ insight }) {
  if (!insight) return null;

  return (
    <div className="insight-card" role="complementary" aria-label="AI-powered carbon insight">
      <div className="insight-header">
        <span className="insight-icon" aria-hidden="true">✨</span>
        <span className="insight-title">Your Carbon Insight</span>
        <span className="insight-badge">AI</span>
      </div>

      <p className="insight-summary">{insight.summary}</p>

      {insight.top_action && (
        <div className="insight-action">
          <span className="insight-action-label">Tomorrow's move</span>
          <p>{insight.top_action}</p>
        </div>
      )}

      {insight.encouragement && (
        <p className="insight-encouragement">🎉 {insight.encouragement}</p>
      )}
    </div>
  );
}
