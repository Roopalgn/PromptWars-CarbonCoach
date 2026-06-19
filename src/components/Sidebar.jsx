import { NavLink } from 'react-router-dom';
import { IconLeaf, IconRoute, IconBarChart2, IconUser } from './Icons';

/**
 * Sidebar navigation component visible on desktop viewport widths.
 * Displays application branding, navigation links, and user authentication panel.
 * 
 * @param {Object} props - Component props
 * @param {Object|null} props.user - Active user profile object or null
 * @param {function} props.onSignOut - User sign-out handler
 * @param {function} props.onSignIn - Google sign-in handler
 * @param {boolean} props.isGuest - Active guest mode status flag
 * @returns {JSX.Element}
 */
export default function Sidebar({ user, onSignOut, onSignIn, isGuest }) {
  return (
    <nav className="app-sidebar" aria-label="Main navigation">
      <div className="sidebar-brand" aria-label="CarbonCoach">
        <div className="app-logo" aria-hidden="true">
          <IconLeaf size={18} />
        </div>
        CarbonCoach
        <div className="brand-dot" aria-hidden="true" />
      </div>

      <div className="sidebar-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          aria-label="Log a trip"
        >
          <IconRoute size={18} />
          Log Trip
        </NavLink>

        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          aria-label="Dashboard"
        >
          <IconBarChart2 size={18} />
          Dashboard
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          aria-label="Profile"
        >
          <IconUser size={18} />
          Profile
        </NavLink>
      </div>

      <div className="sidebar-bottom">
        {isGuest ? (
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={onSignIn}
            aria-label="Sign in with Google"
          >
            Sign in with Google
          </button>
        ) : (
          <div className="sidebar-bottom-panel">
            <div className="sidebar-user-info-row">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={`${user.displayName ?? 'User'} avatar`}
                  referrerPolicy="no-referrer"
                  className="sidebar-profile-img"
                />
              ) : (
                <div className="sidebar-profile-placeholder">
                  <IconUser size={16} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="sidebar-display-name">
                  {user?.displayName ?? 'User'}
                </div>
                <div className="sidebar-display-email">
                  {user?.email ?? ''}
                </div>
              </div>
            </div>
            <button
              id="sign-out-btn"
              type="button"
              className="btn btn--danger btn--sm btn--full"
              onClick={onSignOut}
              aria-label="Sign out of CarbonCoach"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
