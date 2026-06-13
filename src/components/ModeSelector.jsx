import { MODE_LABELS } from '../config/emissionsFactors';
import { ModeIcon } from './Icons';

const MODES = Object.keys(MODE_LABELS);

/**
 * Accessible mode selector — behaves as a radio group.
 * Keyboard: Tab to focus group, Arrow keys to navigate, Space/Enter to select.
 * Uses SVG icons (no emojis) per UI/UX Pro Max §4 no-emoji-icons rule.
 */
export default function ModeSelector({ selected, onChange }) {
  function handleKeyDown(e, mode) {
    const idx = MODES.indexOf(mode);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = MODES[(idx + 1) % MODES.length];
      onChange(next);
      document.getElementById(`mode-${next}`)?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = MODES[(idx - 1 + MODES.length) % MODES.length];
      onChange(prev);
      document.getElementById(`mode-${prev}`)?.focus();
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(mode);
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label="Select your transport mode"
      className="mode-grid"
    >
      {MODES.map((mode) => {
        const isSelected = selected === mode;
        return (
          <button
            key={mode}
            id={`mode-${mode}`}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={MODE_LABELS[mode]}
            tabIndex={isSelected ? 0 : -1}
            className={`mode-btn${isSelected ? ' selected' : ''}`}
            onClick={() => onChange(mode)}
            onKeyDown={(e) => handleKeyDown(e, mode)}
          >
            <span className="mode-icon">
              <ModeIcon mode={mode} size={20} />
            </span>
            <span className="mode-label">{MODE_LABELS[mode]}</span>
          </button>
        );
      })}
    </div>
  );
}
