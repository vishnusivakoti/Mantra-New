import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userMockTestsAPI, type MockTestResponse } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import Notification from '../components/Notification';
import Loader from '../components/Loader';
import './StudentTests.css';

export default function StudentTests() {
  const navigate = useNavigate();
  const [tests, setTests] = useState<MockTestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { notification, showNotification, hideNotification } = useNotification();

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const response = await userMockTestsAPI.getAllPaid();
      setTests(response.data);
    } catch (error: any) {
      showNotification('Failed to load mock tests', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader size="large" message="Loading mock tests..." />;
  }

  return (
    <div className="student-tests">
      <div className="tests-header">
        <h1>📝 Mock Tests</h1>
        <p>Practice with our comprehensive mock test series</p>
      </div>

      {tests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <h2>No mock tests available</h2>
          <p>New tests will be added soon</p>
        </div>
      ) : (
        <div className="tests-grid">
          {tests.map((test) => (
            <div key={test.id} className="test-card">
              <div className="test-header">
                <h3>{test.name}</h3>
                <span className="test-type">PAID</span>
              </div>
              
              <div className="test-details">
                <div className="detail-item">
                  <span className="detail-icon">⏱️</span>
                  <span><strong>Duration:</strong> {test.timerInMinutes} minutes</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">📅</span>
                  <span><strong>Created:</strong> {new Date(test.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="test-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate(`/test/${test.id}/paid`)}
                >
                  🚀 Start Test
                </button>
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