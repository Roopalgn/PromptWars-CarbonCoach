import { IconLeaf } from './Icons';

/**
 * Full-screen loading shell indicating authentication state lookup progress.
 * @returns {JSX.Element}
 */
export default function LoadingShell() {
  return (
    <div className="loading-shell">
      <div className="loading-brand">
        <div className="app-logo">
          <IconLeaf size={20} />
        </div>
        CarbonCoach
      </div>
      <div className="spinner" aria-label="Loading" />
    </div>
  );
}
