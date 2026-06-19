import { IconSpinner } from './Icons';

export default function LoadingSpinner({ size = 28, label = 'Loading…' }) {
  return (
    <div
      className="spinner-wrapper"
      role="status"
      aria-label={label}
      aria-live="polite"
    >
      <IconSpinner size={size} />
      <span className="sr-only">{label}</span>
    </div>
  );
}
