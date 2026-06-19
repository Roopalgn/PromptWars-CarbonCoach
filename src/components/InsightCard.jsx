import { IconSparkles, IconCheckCircle } from './Icons';

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
        <IconSparkles size={14} />
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
          <IconCheckCircle size={16} />
          {insight.encouragement}
        </div>
      )}
    </div>
  );
}
