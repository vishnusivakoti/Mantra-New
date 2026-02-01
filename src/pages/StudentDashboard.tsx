import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userMockTestsAPI, scoresAPI, type MockTestScore } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import Notification from '../components/Notification';
import Loader from '../components/Loader';
import './StudentDashboard.css';

interface UserData {
  userid: number;
  name: string;
  email: string;
  role: string;
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [recentScores, setRecentScores] = useState<MockTestScore[]>([]);
  const [testCount, setTestCount] = useState(0);
  const { notification, showNotification, hideNotification } = useNotification();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const user = localStorage.getItem('user');
      if (!user) return;
      
      const parsedUser = JSON.parse(user);
      setUserData(parsedUser);

      // Load recent scores
      const userScores = await scoresAPI.getUserScores(parsedUser.userid);
      setRecentScores(userScores.slice(0, 3)); // Show only recent 3 scores

      // Load available tests count
      if (parsedUser.role === 'FULL_COURSE' || parsedUser.role === 'MOCKTEST') {
        const paidTests = await userMockTestsAPI.getAllPaid();
        setTestCount(paidTests.data.length);
      } else {
        const freeTests = await userMockTestsAPI.getAllFree();
        setTestCount(freeTests.data.length);
      }
    } catch (error: any) {
      showNotification('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getQuickActions = () => {
    if (!userData) return [];
    
    const actions = [];
    
    if (userData.role === 'FULL_COURSE') {
      actions.push(
        { label: 'Join Live Class', icon: '🎥', path: '/meetings', color: '#10b981' },
        { label: 'Take Mock Test', icon: '📝', path: '/tests', color: '#3b82f6' },
        { label: 'Daily Practice', icon: '📚', path: '/dpp', color: '#f59e0b' }
      );
    } else if (userData.role === 'MOCKTEST') {
      actions.push(
        { label: 'Take Mock Test', icon: '📝', path: '/tests', color: '#3b82f6' }
      );
    } else {
      actions.push(
        { label: 'Free Mock Tests', icon: '🆓', path: '/free-tests', color: '#8b5cf6' }
      );
    }
    
    actions.push(
      { label: 'View Scores', icon: '🏆', path: '/scores', color: '#ef4444' },
      { label: 'My Profile', icon: '👤', path: '/profile', color: '#6b7280' }
    );
    
    return actions;
  };

  if (loading) {
    return <Loader size="large" message="Loading your dashboard..." />;
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <h1>Welcome back, {userData?.name}! 👋</h1>
          <p>Ready to continue your IAS preparation journey?</p>
        </div>
        <div className="role-indicator">
          <span className="role-badge">{userData?.role}</span>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>{testCount}</h3>
            <p>Available Tests</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <h3>{recentScores.length}</h3>
            <p>Tests Completed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>{recentScores.length > 0 ? Math.round(recentScores.reduce((acc, score) => acc + score.score, 0) / recentScores.length) : 0}%</h3>
            <p>Average Score</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          {getQuickActions().map((action, index) => (
            <button
              key={index}
              className="action-card"
              onClick={() => navigate(action.path)}
              style={{ borderColor: action.color }}
            >
              <div className="action-icon" style={{ backgroundColor: action.color }}>
                {action.icon}
              </div>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {recentScores.length > 0 && (
        <div className="recent-scores">
          <div className="section-header">
            <h2>Recent Scores</h2>
            <button onClick={() => navigate('/scores')} className="view-all-btn">
              View All →
            </button>
          </div>
          <div className="scores-list">
            {recentScores.map((score) => (
              <div key={score.id} className="score-item">
                <div className="score-info">
                  <h4>{score.mockTestTitle}</h4>
                  <p>{new Date(score.completedAt).toLocaleDateString()}</p>
                </div>
                <div className={`score-value ${score.score >= 80 ? 'excellent' : score.score >= 60 ? 'good' : 'needs-improvement'}`}>
                  {score.score}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}
    </div>
  );
}