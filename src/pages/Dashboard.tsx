import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const DASHBOARD_ITEMS = [
  { key: 'meetings', title: 'Meetings', icon: '📅', count: 12, color: '#3b82f6' },
  { key: 'tests', title: 'Mock Tests', icon: '📝', count: 45, color: '#10b981' },
  { key: 'users', title: 'Users', icon: '👥', count: 234, color: '#f59e0b' },
  { key: 'dpp', title: 'Daily Practice', icon: '📚', count: 89, color: '#ef4444' },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back! Here's what's happening with your platform.</p>
      </div>

      <div className="dashboard-grid">
        {DASHBOARD_ITEMS.map(item => (
          <div 
            key={item.key}
            className="dashboard-card"
            onClick={() => navigate(`/${item.key}`)}
            style={{ '--card-color': item.color } as React.CSSProperties}
          >
            <div className="dashboard-card-icon">
              {item.icon}
            </div>
            <div className="dashboard-card-content">
              <h3>{item.title}</h3>
              <p className="dashboard-card-count">{item.count}</p>
            </div>
            <div className="dashboard-card-arrow">→</div>
          </div>
        ))}
      </div>

      <div className="dashboard-stats">
        <div className="stats-card">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-icon">👤</span>
              <span>New user registered</span>
              <span className="activity-time">2 min ago</span>
            </div>
            <div className="activity-item">
              <span className="activity-icon">📝</span>
              <span>Mock test completed</span>
              <span className="activity-time">5 min ago</span>
            </div>
            <div className="activity-item">
              <span className="activity-icon">📅</span>
              <span>Meeting scheduled</span>
              <span className="activity-time">10 min ago</span>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <button className="btn btn-primary" onClick={() => navigate('/meetings')}>
              📅 Schedule Meeting
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/tests')}>
              📝 Create Test
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/users')}>
              👥 Add User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}