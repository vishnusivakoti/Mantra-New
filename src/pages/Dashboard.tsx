import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { meetingsAPI, mockTestsAPI, usersAPI, dppAPI } from '../services/api';
import './Dashboard.css';

interface DashboardStats {
  meetings: number;
  mockTests: number;
  users: number;
  dailyProblems: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    meetings: 0,
    mockTests: 0,
    users: 0,
    dailyProblems: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [meetingsRes, paidTestsRes, freeTestsRes, usersRes, dppRes] = await Promise.all([
        meetingsAPI.getAll().catch(() => ({ data: [] })),
        mockTestsAPI.getAllPaid().catch(() => ({ data: [] })),
        mockTestsAPI.getAllFree().catch(() => ({ data: [] })),
        usersAPI.getAll().catch(() => ({ data: [] })),
        dppAPI.getAll().catch(() => [])
      ]);

      setStats({
        meetings: meetingsRes.data.length,
        mockTests: paidTestsRes.data.length + freeTestsRes.data.length,
        users: usersRes.data.length,
        dailyProblems: dppRes.length
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const DASHBOARD_ITEMS = [
    { key: 'meetings', title: 'Meetings', icon: '🏢', count: stats.meetings, color: '#3b82f6' },
    { key: 'tests', title: 'Mock Tests', icon: '📋', count: stats.mockTests, color: '#10b981' },
    { key: 'users', title: 'Users', icon: '👤', count: stats.users, color: '#f59e0b' },
    { key: 'dpp', title: 'Daily Practice', icon: '📖', count: stats.dailyProblems, color: '#ef4444' },
  ];

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
              <p className="dashboard-card-count">
                {loading ? '...' : item.count}
              </p>
            </div>
            <div className="dashboard-card-arrow">→</div>
          </div>
        ))}
      </div>

      <div className="dashboard-stats">
        <div className="stats-card">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <button className="btn btn-primary" onClick={() => navigate('/meetings')}>
              🏢 Schedule Meeting
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/tests')}>
              📋 Create Test
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/users')}>
              👤 Add User
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/dpp')}>
              📖 Add Problem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}