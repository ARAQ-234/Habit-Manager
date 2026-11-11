import { createElement } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { FaCalendarAlt, FaHistory, FaHome, FaClipboardList, FaChartLine, FaSignOutAlt, FaCog, FaMoon, FaSun, FaChevronLeft, FaChevronRight, FaLightbulb } from 'react-icons/fa';

const navigation = [
  { to: '/dashboard', icon: FaHome, label: 'Overview' },
  { to: '/habits', icon: FaClipboardList, label: 'My habits' },
  { to: '/analytics', icon: FaChartLine, label: 'Insights' },
  { to: '/ai-coach', icon: FaLightbulb, label: 'AI Coach' },
  { to: '/calendar', icon: FaCalendarAlt, label: 'Calendar' },
  { to: '/history', icon: FaHistory, label: 'Activity' },
  { to: '/settings', icon: FaCog, label: 'Settings' },
];

export default function Sidebar({ collapsed, onToggleCollapse }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const initials = (user?.username || 'You').slice(0, 2);
  const theme = document.documentElement.dataset.theme || 'light';

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('habit-manager-theme', nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.dispatchEvent(new CustomEvent('habit-manager:theme', { detail: nextTheme }));
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        <NavLink to="/dashboard" className="sidebar-brand" aria-label="Habit Manager home">
          <span className="brand-mark"><img className="brand-mark-image" src="/habit-manager-logo.png" alt="" /></span>
          <span>
            <span className="brand-name">Habit Manager</span>
            <span className="brand-caption">Small steps, lasting change</span>
          </span>
        </NavLink>

        <button type="button" className="sidebar-collapse-toggle" onClick={onToggleCollapse} aria-expanded={!collapsed} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <FaChevronRight aria-hidden="true" /> : <FaChevronLeft aria-hidden="true" />}
          <span>{collapsed ? 'Expand menu' : 'Collapse menu'}</span>
        </button>

        <div className="sidebar-label">Workspace</div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navigation.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} title={label} aria-label={label} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              {createElement(Icon, { 'aria-hidden': true })}
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-spacer" />
        <button type="button" onClick={toggleTheme} className={`sidebar-theme-toggle${theme === 'dark' ? ' theme-dark-active' : ''}`} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} aria-pressed={theme === 'dark'} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}><span className="theme-toggle-icon">{theme === 'dark' ? <FaSun /> : <FaMoon />}</span><span className="theme-toggle-label">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span><span className="theme-toggle-switch" aria-hidden="true"><i /></span></button>
        <div className="sidebar-profile" title={collapsed ? (user?.username || 'Your account') : undefined}>
          <span className="profile-avatar">{initials}</span>
          <span className="min-w-0">
            <span className="profile-name d-block">{user?.username || 'Your account'}</span>
            <span className="profile-caption">Personal workspace</span>
          </span>
        </div>
        <button type="button" onClick={handleLogout} className="sidebar-logout" title={collapsed ? 'Sign out' : undefined}>
          <FaSignOutAlt aria-hidden="true" /><span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
