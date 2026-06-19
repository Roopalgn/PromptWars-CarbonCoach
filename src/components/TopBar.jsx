import { IconLeaf } from './Icons';

/**
 * Top brand header bar visible on mobile.
 * @returns {JSX.Element}
 */
export default function TopBar() {
  return (
    <header className="app-topbar" role="banner">
      <div className="app-brand">
        <div className="app-logo" aria-hidden="true">
          <IconLeaf size={18} />
        </div>
        CarbonCoach
        <div className="brand-dot" aria-hidden="true" />
      </div>
    </header>
  );
}
