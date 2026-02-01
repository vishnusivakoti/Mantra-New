import { useState, useEffect } from 'react';
import { scoresAPI, type MockTestScore } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import Notification from '../components/Notification';
import Loader from '../components/Loader';
import './Scores.css';

export default function Scores() {
  const [scores, setScores] = useState<MockTestScore[]>([]);
  const [loading, setLoading] = useState(true);
  const { notification, showNotification, hideNotification } = useNotification();

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = async () => {
    try {
      const user = localStorage.getItem('user');
      if (!user) return;
      
      const userData = JSON.parse(user);
      const userScores = await scoresAPI.getUserScores(userData.userid);
      setScores(userScores);
    } catch (error: any) {
      showNotification('Failed to load scores', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader size="large" message="Loading your scores..." />;
  }

  return (
    <div className="scores-container">
      <div className="scores-header">
        <h1>🏆 My Test Scores</h1>
        <p>Track your performance across all mock tests</p>
      </div>

      {scores.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏆</div>
          <h2>No test scores yet</h2>
          <p>Complete a mock test to see your scores here</p>
        </div>
      ) : (
        <div className="scores-grid">
          {scores.map((score) => (
            <div key={score.id} className="score-card">
              <div className="score-header">
                <h3>{score.mockTestTitle}</h3>
                <div className={`score-badge ${score.score >= 80 ? 'excellent' : score.score >= 60 ? 'good' : 'needs-improvement'}`}>
                  {score.score}%
                </div>
              </div>
              <div className="score-details">
                <p><strong>Completed:</strong> {new Date(score.completedAt).toLocaleDateString()}</p>
                <p><strong>Test ID:</strong> #{score.mockTestId}</p>
              </div>
            </div>
          ))}
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