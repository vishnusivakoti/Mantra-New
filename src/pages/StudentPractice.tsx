import { useState, useEffect } from 'react';
import { userDppAPI, type DPPResponse } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import Notification from '../components/Notification';
import Loader from '../components/Loader';
import './StudentPractice.css';

export default function StudentPractice() {
  const [problems, setProblems] = useState<DPPResponse[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const { notification, showNotification, hideNotification } = useNotification();

  useEffect(() => {
    loadProblems();
  }, [selectedDate]);

  const loadProblems = async () => {
    try {
      setLoading(true);
      const response = await userDppAPI.getByDate(selectedDate);
      setProblems(response);
    } catch (error: any) {
      if (error.response?.status === 204) {
        setProblems([]);
      } else {
        showNotification('Failed to load practice problems', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-practice">
      <div className="practice-header">
        <h1>📚 Daily Practice</h1>
        <p>Sharpen your skills with daily practice problems</p>
      </div>

      <div className="date-selector">
        <label htmlFor="practice-date">📅 Select Date:</label>
        <input
          id="practice-date"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="date-input"
        />
      </div>

      {loading ? (
        <Loader size="large" message="Loading practice problems..." />
      ) : problems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h2>No problems for {new Date(selectedDate).toLocaleDateString()}</h2>
          <p>Try selecting a different date or check back later</p>
        </div>
      ) : (
        <div className="problems-grid">
          {problems.map((problem) => (
            <div key={problem.id} className="problem-card">
              <div className="problem-header">
                <div className={`difficulty-badge ${problem.difficulty.toLowerCase()}`}>
                  {problem.difficulty}
                </div>
                <span className="problem-date">
                  {new Date(problem.date).toLocaleDateString()}
                </span>
              </div>
              
              <div className="problem-content">
                <h3>{problem.question}</h3>
                {problem.description && (
                  <p className="problem-description">{problem.description}</p>
                )}
              </div>
              
              <div className="problem-footer">
                <span className="created-by">👤 {problem.createdBy}</span>
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