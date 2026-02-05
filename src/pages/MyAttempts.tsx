import { useState, useEffect } from 'react';
import { attemptsAPI, type AttemptResponse } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import Notification from '../components/Notification';
import Loader from '../components/Loader';
import './MyAttempts.css';

export default function MyAttempts() {
  const [attempts, setAttempts] = useState<AttemptResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttempt, setSelectedAttempt] = useState<AttemptResponse | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { notification, showNotification, hideNotification } = useNotification();

  useEffect(() => {
    loadAttempts();
  }, []);

  const loadAttempts = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await attemptsAPI.getUserAttempts(user.userid);
      setAttempts(response.data);
    } catch (error: any) {
      showNotification('Failed to load attempts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const viewAttemptDetails = async (attemptId: number) => {
    try {
      const response = await attemptsAPI.getAttemptDetails(attemptId);
      setSelectedAttempt(response.data);
      setShowDetails(true);
    } catch (error: any) {
      showNotification('Failed to load attempt details', 'error');
    }
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="my-attempts-container">
      <div className="attempts-header">
        <h1>📊 My Attempts</h1>
        <p>View your mock test attempts and detailed results</p>
      </div>

      {loading ? (
        <Loader size="large" message="Loading your attempts..." />
      ) : attempts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <h3>No attempts yet</h3>
          <p>Start taking mock tests to see your attempts here</p>
        </div>
      ) : (
        <div className="attempts-grid">
          {attempts.map((attempt) => (
            <div key={attempt.id} className="attempt-card">
              <div className="attempt-header">
                <h3>{attempt.mockTestName}</h3>
                <span className={`test-type ${attempt.mockTestType.toLowerCase()}`}>
                  {attempt.mockTestType}
                </span>
              </div>
              
              <div className="attempt-stats">
                <div className="stat">
                  <span className="stat-label">Score</span>
                  <span 
                    className="stat-value score"
                    style={{ color: getScoreColor(attempt.score, attempt.totalQuestions) }}
                  >
                    {attempt.score}/{attempt.totalQuestions}
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Correct</span>
                  <span className="stat-value correct">{attempt.correctAnswers}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Wrong</span>
                  <span className="stat-value wrong">{attempt.wrongAnswers}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Unanswered</span>
                  <span className="stat-value unanswered">{attempt.unanswered}</span>
                </div>
              </div>

              <div className="attempt-meta">
                <div className="meta-item">
                  <span>⏱️ Time: {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s</span>
                </div>
                <div className="meta-item">
                  <span>📅 {new Date(attempt.completedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <button 
                className="btn btn-primary"
                onClick={() => viewAttemptDetails(attempt.id)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {showDetails && selectedAttempt && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="attempt-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 {selectedAttempt.mockTestName} - Detailed Results</h2>
              <button className="close-btn" onClick={() => setShowDetails(false)}>×</button>
            </div>

            <div className="results-summary">
              <div className="summary-card">
                <h3>Overall Performance</h3>
                <div className="performance-stats">
                  <div className="perf-stat">
                    <span>Score: {selectedAttempt.score}/{selectedAttempt.totalQuestions}</span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${(selectedAttempt.score / selectedAttempt.totalQuestions) * 100}%`,
                          backgroundColor: getScoreColor(selectedAttempt.score, selectedAttempt.totalQuestions)
                        }}
                      />
                    </div>
                  </div>
                  <div className="perf-breakdown">
                    <span className="correct">✅ Correct: {selectedAttempt.correctAnswers}</span>
                    <span className="wrong">❌ Wrong: {selectedAttempt.wrongAnswers}</span>
                    <span className="unanswered">⚪ Unanswered: {selectedAttempt.unanswered}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="questions-review">
              <h3>Question-wise Analysis</h3>
              <div className="questions-list">
                {selectedAttempt.answers.map((answer) => (
                  <div key={answer.questionId} className={`question-review ${answer.isCorrect ? 'correct' : answer.selectedOption ? 'wrong' : 'unanswered'}`}>
                    <div className="question-header">
                      <span className="question-number">Q{answer.questionNo}</span>
                      <span className={`result-icon ${answer.isCorrect ? 'correct' : answer.selectedOption ? 'wrong' : 'unanswered'}`}>
                        {answer.isCorrect ? '✅' : answer.selectedOption ? '❌' : '⚪'}
                      </span>
                    </div>
                    
                    <div className="question-content">
                      <p className="question-text">{answer.question}</p>
                      
                      <div className="options-grid">
                        {['A', 'B', 'C', 'D'].map((option) => (
                          <div 
                            key={option}
                            className={`option ${
                              answer.correctOption === option ? 'correct-answer' : 
                              answer.selectedOption === option ? 'selected' : ''
                            }`}
                          >
                            <span className="option-label">{option}.</span>
                            <span className="option-text">
                              {answer[`option${option}` as keyof typeof answer]}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="answer-summary">
                        <span className="your-answer">
                          Your Answer: {answer.selectedOption || 'Not Answered'}
                        </span>
                        <span className="correct-answer">
                          Correct Answer: {answer.correctOption}
                        </span>
                        {answer.solutionLink && (
                          <a 
                            href={answer.solutionLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="solution-link"
                          >
                            🎥 Watch Solution
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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