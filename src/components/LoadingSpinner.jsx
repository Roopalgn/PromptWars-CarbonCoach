export default function LoadingSpinner({ size = 28, label = 'Loading…' }) {
  return (
    <div
      className="spinner-wrapper"
      role="status"
      aria-label={label}
      aria-live="polite"
    >
      <svg
        className="spinner"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="40 60"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}
