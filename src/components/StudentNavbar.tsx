import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import './StudentNavbar.css';

interface NavItem {
  key: string;
  label: string;
  path: string;
  icon: string;
  roles: string[];
}

const STUDENT_NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: '🏠', roles: ['USER', 'MOCKTEST', 'FULL_COURSE'] },
  { key: 'meetings', label: 'Live Classes', path: '/student/meetings', icon: '🎥', roles: ['FULL_COURSE'] },
  { key: 'tests', label: 'Mock Tests', path: '/student/tests', icon: '📝', roles: ['MOCKTEST', 'FULL_COURSE'] },
  { key: 'free-tests', label: 'Free Tests', path: '/student/free-tests', icon: '🆓', roles: ['USER'] },
  { key: 'practice', label: 'Daily Practice', path: '/student/practice', icon: '📚', roles: ['FULL_COURSE'] },
  { key: 'scores', label: 'My Scores', path: '/scores', icon: '🏆', roles: ['USER', 'MOCKTEST', 'FULL_COURSE'] },
  { key: 'profile', label: 'Profile', path: '/profile', icon: '👤', roles: ['USER', 'MOCKTEST', 'FULL_COURSE'] },
];

interface StudentNavbarProps {
  onLogout: () => void;
}

export default function StudentNavbar({ onLogout }: StudentNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const currentPath = location.pathname;

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUserRole(userData.role);
    }
  }, []);

  const getVisibleNavItems = () => {
    return STUDENT_NAV_ITEMS.filter(item => 
      item.roles.includes(userRole)
    );
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      <nav className="student-navbar">
        <div className="student-navbar-brand">
          <h2>MANTRA IAS</h2>
          <span className="student-portal">Student Portal</span>
        </div>

        {/* Desktop Navigation */}
        <div className="student-navbar-menu">
          {getVisibleNavItems().map(item => (
            <button
              key={item.key}
              className={`student-navbar-item ${currentPath === item.path ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
            >
              <span className="student-navbar-icon">{item.icon}</span>
              <span className="student-navbar-label">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="student-navbar-actions">
          <button className="student-navbar-theme" onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button className="student-navbar-logout" onClick={onLogout}>
            Logout
          </button>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="student-navbar-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="student-navbar-mobile">
          <div className="student-navbar-mobile-overlay" onClick={() => setIsOpen(false)} />
          <div className="student-navbar-mobile-menu">
            <div className="student-navbar-mobile-header">
              <h3>Navigation</h3>
              <button onClick={() => setIsOpen(false)}>×</button>
            </div>
            
            {getVisibleNavItems().map(item => (
              <button
                key={item.key}
                className={`student-navbar-mobile-item ${currentPath === item.path ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
            
            <div className="student-navbar-mobile-actions">
              <button className="student-navbar-mobile-item" onClick={toggleTheme}>
                <span>{theme === 'light' ? '🌙' : '☀️'}</span>
                <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
              </button>
              <button className="student-navbar-mobile-item logout" onClick={onLogout}>
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}