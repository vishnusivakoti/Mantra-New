import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import './Navbar.css';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', path: '/admin', icon: '🏠' },
  { key: 'meetings', label: 'Meetings', path: '/meetings', icon: '📅' },
  { key: 'tests', label: 'Mock Tests', path: '/tests', icon: '📝' },
  { key: 'users', label: 'Users', path: '/users', icon: '👥' },
  { key: 'dpp', label: 'Daily Practice', path: '/dpp', icon: '📚' },
];

interface NavbarProps {
  onLogout: () => void;
}

export default function Navbar({ onLogout }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const currentPath = location.pathname;

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          <h2>MANTRA IAS</h2>
        </div>

        <div className="navbar-menu">
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              className={`navbar-item ${currentPath === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="navbar-icon">{item.icon}</span>
              <span className="navbar-label">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="navbar-actions">
          <button className="navbar-theme" onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button className="navbar-logout" onClick={onLogout}>
            🚪 Logout
          </button>
        </div>

        <button 
          className="navbar-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </nav>

      {isOpen && (
        <div className="navbar-mobile">
          <div className="navbar-mobile-overlay" onClick={() => setIsOpen(false)} />
          <div className="navbar-mobile-menu">
            {NAV_ITEMS.map(item => (
              <button
                key={item.key}
                className={`navbar-mobile-item ${currentPath === item.path ? 'active' : ''}`}
                onClick={() => {
                  navigate(item.path);
                  setIsOpen(false);
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
            <button className="navbar-mobile-item" onClick={toggleTheme}>
              <span>{theme === 'light' ? '🌙' : '☀️'}</span>
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
            <button className="navbar-mobile-item logout" onClick={onLogout}>
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}