import { NavLink } from 'react-router-dom';
import { IconRoute, IconBarChart2, IconUser } from './Icons';

/**
 * Bottom navigation bar visible on mobile and tablet viewport widths.
 * Handles primary route switches using React Router NavLinks.
 * @returns {JSX.Element}
 */
export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        aria-label="Log a trip"
      >
        <IconRoute size={22} />
        Log Trip
      </NavLink>
      <NavLink
        to="/dashboard"
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        aria-label="Dashboard"
      >
        <IconBarChart2 size={22} />
        Dashboard
      </NavLink>
      <NavLink
        to="/profile"
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        aria-label="Profile"
      >
        <IconUser size={22} />
        Profile
      </NavLink>
    </nav>
  );
}
