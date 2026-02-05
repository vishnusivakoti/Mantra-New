import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userMockTestsAPI, scoresAPI, attemptsAPI, type AttemptTestDTO, type AttemptQuestionDTO, type QuestionDTO } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import Notification from '../components/Notification';
import Loader from '../components/Loader';
import './TestAttempt.css';

interface TestResult {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  questionsWithAnswers: Array<{
    question: AttemptQuestionDTO;
    correctAnswer: string;
    userAnswer: string;
    isCorrect: boolean;
  }>;
}

export default function TestAttempt() {
  const { testId, testType } = useParams<{ testId: string; testType: 'paid' | 'free' }>();
  const navigate = useNavigate();
  const [attemptData, setAttemptData] = useState<AttemptTestDTO | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const { notification, showNotification, hideNotification } = useNotification();

  const startTest = useCallback(async () => {
    try {
      const user = localStorage.getItem('user');
      if (!user) {
        navigate('/login');
        return;
      }

      const userData = JSON.parse(user);
      const mockTestId = parseInt(testId!);

      const response = testType === 'paid' 
        ? await userMockTestsAPI.attemptPaidTest(mockTestId, userData.userid)
        : await userMockTestsAPI.attemptFreeTest(mockTestId, userData.userid);

      setAttemptData(response.data);
      setTimeRemaining(response.data.timerInMinutes * 60); // Convert to seconds
    } catch (error: any) {
      showNotification('Failed to start test', 'error');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [testId, testType, navigate, showNotification]);

  useEffect(() => {
    startTest();
  }, [startTest]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0 && !submitting) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && attemptData) {
      handleSubmitTest();
    }
  }, [timeRemaining, submitting, attemptData]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: number, option: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const calculateScore = async () => {
    if (!attemptData) return null;
    
    try {
      const user = localStorage.getItem('user');
      if (!user) return null;
      
      const userData = JSON.parse(user);
      
      // Use secure backend calculation
      const scoreResponse = testType === 'paid' 
        ? await userMockTestsAPI.calculatePaidScore(attemptData.mockTestId, userData.userid, answers)
        : await userMockTestsAPI.calculateFreeScore(attemptData.mockTestId, userData.userid, answers);
      
      const score = scoreResponse.data;
      
      // Get detailed results with correct answers
      const resultsResponse = testType === 'paid'
        ? await userMockTestsAPI.getPaidTestResults(attemptData.mockTestId, userData.userid, answers)
        : await userMockTestsAPI.getFreeTestResults(attemptData.mockTestId, userData.userid, answers);
      
      const detailedResults = resultsResponse.data;
      
      // Map results to our interface
      const questionsWithResults = detailedResults.map((result: any) => ({
        question: {
          questionId: result.questionId,
          questionNo: result.questionNo,
          question: result.question,
          optionA: result.optionA,
          optionB: result.optionB,
          optionC: result.optionC,
          optionD: result.optionD
        },
        correctAnswer: result.correctAnswer,
        userAnswer: result.userAnswer || '',
        isCorrect: result.isCorrect
      }));
      
      const correctCount = detailedResults.filter((r: any) => r.isCorrect).length;
      
      return {
        score,
        correctAnswers: correctCount,
        totalQuestions: attemptData.questions.length,
        questionsWithAnswers: questionsWithResults
      };
    } catch (error) {
      console.error('Error calculating score:', error);
      return null;
    }
  };

  const handleSubmitTest = async () => {
    if (!attemptData) return;
    
    setSubmitting(true);
    try {
      const user = localStorage.getItem('user');
      if (!user) return;
      
      const userData = JSON.parse(user);
      
      // Calculate score with correct answers
      const result = await calculateScore();
      if (!result) {
        showNotification('Failed to calculate score', 'error');
        return;
      }
      
      // Save detailed attempt data
      const attemptAnswers = attemptData.questions.map(question => ({
        questionId: question.questionId,
        selectedOption: answers[question.questionId] || null
      }));
      
      const timeTaken = (attemptData.timerInMinutes * 60) - timeRemaining; // Calculate time taken
      
      await attemptsAPI.saveAttempt({
        userId: userData.userid,
        mockTestId: attemptData.mockTestId,
        mockTestName: attemptData.mockTestName,
        mockTestType: testType === 'paid' ? 'PAID' : 'FREE',
        answers: attemptAnswers,
        timeTaken
      });
      
      // Save score
      await scoresAPI.saveScore(
        userData.userid,
        attemptData.mockTestId,
        attemptData.mockTestName,
        result.score
      );
      
      // Show results
      setTestResult(result);
      setShowResults(true);
      showNotification('Test submitted successfully!', 'success');
    } catch (error: any) {
      showNotification('Failed to submit test', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const nextQuestion = () => {
    if (attemptData && currentQuestionIndex < attemptData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return <Loader size="large" message="Starting test..." />;
  }

  if (!attemptData) {
    return <div className="error-state">Failed to load test</div>;
  }

  // Show results after test submission
  if (showResults && testResult) {
    return (
      <div className="test-results-container">
        <div className="results-header">
          <h1>🎉 Test Completed!</h1>
          <div className="score-display">
            <div className="score-circle">
              <span className="score-value">{testResult.score}%</span>
            </div>
            <div className="score-details">
              <p>{testResult.correctAnswers} out of {testResult.totalQuestions} correct</p>
              <p className={`score-grade ${
                testResult.score >= 80 ? 'excellent' : 
                testResult.score >= 60 ? 'good' : 'needs-improvement'
              }`}>
                {testResult.score >= 80 ? 'Excellent!' : 
                 testResult.score >= 60 ? 'Good Job!' : 'Keep Practicing!'}
              </p>
            </div>
          </div>
        </div>

        <div className="answers-review">
          <h2>Answer Review</h2>
          <div className="questions-list">
            {testResult.questionsWithAnswers.map((item, index) => (
              <div key={item.question.questionId} className={`question-review ${item.isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="question-header">
                  <span className="question-number">Q{item.question.questionNo}</span>
                  <span className={`result-indicator ${item.isCorrect ? 'correct' : 'incorrect'}`}>
                    {item.isCorrect ? '✓' : '✗'}
                  </span>
                </div>
                <div className="question-text">{item.question.question}</div>
                <div className="answers-comparison">
                  <div className="answer-item">
                    <span className="answer-label">Your Answer:</span>
                    <span className={`answer-value ${item.userAnswer ? '' : 'not-answered'}`}>
                      {item.userAnswer || 'Not Answered'}
                    </span>
                  </div>
                  <div className="answer-item">
                    <span className="answer-label">Correct Answer:</span>
                    <span className="answer-value correct">{item.correctAnswer}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="results-actions">
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/scores')}>
            View All Scores
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = attemptData.questions[currentQuestionIndex];
  const isAnswered = (questionId: number) => answers[questionId] !== undefined;

  return (
    <div className="test-attempt-container">
      <div className="test-header">
        <div className="test-info">
          <h1>{attemptData.mockTestName}</h1>
          <span className="question-counter">
            Question {currentQuestionIndex + 1} of {attemptData.questions.length}
          </span>
        </div>
        <div className="timer">
          <span className={`time ${timeRemaining < 300 ? 'warning' : ''}`}>
            ⏰ {formatTime(timeRemaining)}
          </span>
        </div>
      </div>

      <div className="test-content">
        <div className="question-panel">
          <div className="question-section">
            <div className="question-number">Q{currentQuestion.questionNo}</div>
            <div className="question-text">{currentQuestion.question}</div>
          </div>

          <div className="options-section">
            {['A', 'B', 'C', 'D'].map(option => (
              <label key={option} className="option">
                <input
                  type="radio"
                  name={`question-${currentQuestion.questionId}`}
                  value={option}
                  checked={answers[currentQuestion.questionId] === option}
                  onChange={() => handleAnswerSelect(currentQuestion.questionId, option)}
                />
                <span className="option-label">{option}</span>
                <span className="option-text">
                  {currentQuestion[`option${option}` as keyof AttemptQuestionDTO] as string}
                </span>
              </label>
            ))}
          </div>

          <div className="question-navigation">
            <button 
              className="btn btn-secondary" 
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
            >
              ← Previous
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={nextQuestion}
              disabled={currentQuestionIndex === attemptData.questions.length - 1}
            >
              Next →
            </button>
          </div>
        </div>

        <div className="sidebar">
          <div className="question-grid">
            <h3>Questions</h3>
            <div className="grid">
              {attemptData.questions.map((question, index) => (
                <button
                  key={question.questionId}
                  className={`question-btn ${
                    index === currentQuestionIndex ? 'current' : ''
                  } ${isAnswered(question.questionId) ? 'answered' : ''}`}
                  onClick={() => goToQuestion(index)}
                >
                  {question.questionNo}
                </button>
              ))}
            </div>
          </div>

          <div className="test-summary">
            <div className="summary-item">
              <span>Total Questions:</span>
              <span>{attemptData.questions.length}</span>
            </div>
            <div className="summary-item">
              <span>Answered:</span>
              <span>{Object.keys(answers).length}</span>
            </div>
            <div className="summary-item">
              <span>Remaining:</span>
              <span>{attemptData.questions.length - Object.keys(answers).length}</span>
            </div>
          </div>

          <button 
            className="btn btn-primary submit-btn"
            onClick={handleSubmitTest}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>
      </div>

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