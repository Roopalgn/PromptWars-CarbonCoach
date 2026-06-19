import { useEffect } from 'react';
import { IconCheck, IconAlert } from './Icons';

/**
 * Unified Toast Notification component.
 * Displays self-dismissing alerts with success or warning styling and icons.
 *
 * @param {Object} props - Component props
 * @param {string} props.message - Text message to display
 * @param {function} props.onDone - Callback triggered upon auto-dismissal
 * @param {'success'|'warning'} [props.type='success'] - Toast styling and icon type
 * @param {number} [props.duration=3500] - Duration in milliseconds before dismissing
 * @returns {JSX.Element}
 */
export default function Toast({ message, onDone, type = 'success', duration = 3500 }) {
  useEffect(() => {
    const timer = setTimeout(onDone, duration);
    return () => {
      clearTimeout(timer);
    };
  }, [onDone, duration]);

  const isWarning = type === 'warning';

  return (
    <div className="toast-container" aria-live="polite">
      <div className={`toast toast--${type}`} role="status">
        {isWarning ? <IconAlert size={16} /> : <IconCheck size={16} />}
        <span>{message}</span>
      </div>
    </div>
  );
}
