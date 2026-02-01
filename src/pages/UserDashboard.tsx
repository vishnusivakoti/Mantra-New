import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userMockTestsAPI, userMeetingsAPI, userDppAPI, scoresAPI, usersAPI, type MockTestResponse, type MockTestScore, type MeetingResponse, type DPPResponse, type UserResponse } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import Notification from '../components/Notification';
import Loader from '../components/Loader';
import './UserDashboard.css';

interface UserData {
  userid: number;
  name: string;
  email: string;
  role: string;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [mockTests, setMockTests] = useState<MockTestResponse[]>([]);
  const [scores, setScores] = useState<MockTestScore[]>([]);
  const [meetings, setMeetings] = useState<MeetingResponse[]>([]);
  const [dailyProblems, setDailyProblems] = useState<DPPResponse[]>([]);
  const [userProfile, setUserProfile] = useState<UserResponse | null>(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const { notification, showNotification, hideNotification } = useNotification();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      const parsedUser = JSON.parse(user);
      setUserData(parsedUser);
      loadUserData(parsedUser);
    }
  }, []);

  const loadUserData = async (user: UserData) => {
    try {
      setLoading(true);
      
      // Load scores for all users
      const userScores = await scoresAPI.getUserScores(user.userid);
      setScores(userScores);

      // Load data based on role
      if (user.role === 'FULL_COURSE') {
        const [paidTests, meetingsData, dppData] = await Promise.all([
          userMockTestsAPI.getAllPaid(),
          userMeetingsAPI.getUpcoming(),
          userDppAPI.getToday()
        ]);
        setMockTests(paidTests.data);
        setMeetings(meetingsData.data);
        setDailyProblems(dppData);
      } else if (user.role === 'MOCKTEST') {
        const paidTests = await userMockTestsAPI.getAllPaid();
        setMockTests(paidTests.data);
      } else if (user.role === 'USER') {
        const freeTests = await userMockTestsAPI.getAllFree();
        setMockTests(freeTests.data);
      }

      // Load user profile
      const profile = await usersAPI.getById(user.userid);
      setUserProfile(profile);
    } catch (error: any) {
      showNotification('Failed to load user data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableTabs = () => {
    const tabs = [{ id: 'overview', label: '📊 Overview', icon: '📊' }];
    
    if (userData?.role === 'FULL_COURSE') {
      tabs.push(
        { id: 'meetings', label: '🎥 Meetings', icon: '🎥' },
        { id: 'paid-tests', label: '📝 Paid Tests', icon: '📝' },
        { id: 'daily-problems', label: '📚 Daily Problems', icon: '📚' }
      );
    } else if (userData?.role === 'MOCKTEST') {
      tabs.push({ id: 'paid-tests', label: '📝 Paid Tests', icon: '📝' });
    } else if (userData?.role === 'USER') {
      tabs.push({ id: 'free-tests', label: '🆓 Free Tests', icon: '🆓' });
    }
    
    tabs.push(
      { id: 'scores', label: '🏆 My Scores', icon: '🏆' },
      { id: 'profile', label: '👤 Profile', icon: '👤' }
    );
    
    return tabs;
  };

  const renderOverview = () => (
    <div className="overview-section">
      <div className="welcome-card">
        <h2>Welcome back, {userData?.name}! 👋</h2>
        <p>Your learning journey continues here</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>{mockTests.length}</h3>
            <p>Available Tests</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <h3>{scores.length}</h3>
            <p>Tests Completed</p>
          </div>
        </div>
        
        {userData?.role === 'FULL_COURSE' && (
          <>
            <div className="stat-card">
              <div className="stat-icon">🎥</div>
              <div className="stat-content">
                <h3>{meetings.length}</h3>
                <p>Meetings Available</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-content">
                <h3>{dailyProblems.length}</h3>
                <p>Today's Problems</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderMockTests = (type: 'paid' | 'free') => (
    <div className="tests-section">
      <h2>{type === 'paid' ? '📝 Paid Mock Tests' : '🆓 Free Mock Tests'}</h2>
      {mockTests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <p>No {type} tests available</p>
        </div>
      ) : (
        <div className="tests-grid">
          {mockTests.map((test) => (
            <div key={test.id} className="test-card">
              <h3>{test.name}</h3>
              <div className="test-details">
                <p><strong>Duration:</strong> {test.timerInMinutes} minutes</p>
                <p><strong>Created:</strong> {new Date(test.createdAt).toLocaleDateString()}</p>
              </div>
              <button 
                className="btn btn-primary" 
                onClick={() => navigate(`/test/${test.id}/${type}`)}
              >
                Start Test
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderScores = () => (
    <div className="scores-section">
      <h2>🏆 My Test Scores</h2>
      {scores.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏆</div>
          <p>No test scores yet</p>
          <p>Complete a test to see your scores here</p>
        </div>
      ) : (
        <div className="scores-grid">
          {scores.map((score) => (
            <div key={score.id} className="score-card">
              <h3>{score.mockTestTitle}</h3>
              <div className="score-value">{score.score}%</div>
              <p>Completed: {new Date(score.completedAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMeetings = () => (
    <div className="meetings-section">
      <h2>🎥 Upcoming Meetings</h2>
      {meetings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎥</div>
          <p>No meetings scheduled</p>
        </div>
      ) : (
        <div className="meetings-grid">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="meeting-card">
              <h3>{meeting.courseName}</h3>
              <div className="meeting-details">
                <p><strong>Date:</strong> {new Date(meeting.meetingDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {meeting.startTime} - {meeting.endTime}</p>
                <p><strong>Course:</strong> {meeting.courseCode}</p>
              </div>
              <a href={meeting.meetingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-success">
                Join Meeting
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDailyProblems = () => (
    <div className="daily-problems-section">
      <h2>📚 Today's Practice Problems</h2>
      {dailyProblems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <p>No problems for today</p>
        </div>
      ) : (
        <div className="problems-grid">
          {dailyProblems.map((problem) => (
            <div key={problem.id} className="problem-card">
              <div className="difficulty-badge" style={{ backgroundColor: problem.difficulty === 'Easy' ? '#10b981' : problem.difficulty === 'Medium' ? '#f59e0b' : '#ef4444' }}>
                {problem.difficulty}
              </div>
              <h3>{problem.question}</h3>
              {problem.description && <p>{problem.description}</p>}
              <div className="problem-footer">
                <span>By: {problem.createdBy}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="profile-section">
      <h2>👤 My Profile</h2>
      {userProfile && (
        <div className="profile-card">
          <div className="profile-info">
            <h3>{userProfile.name}</h3>
            <p><strong>Email:</strong> {userProfile.emailid}</p>
            <p><strong>Phone:</strong> {userProfile.phoneno}</p>
            <p><strong>Role:</strong> {userProfile.roles}</p>
            <p><strong>Access:</strong> {userProfile.acess}</p>
            {userProfile.city && <p><strong>City:</strong> {userProfile.city}</p>}
            {userProfile.state && <p><strong>State:</strong> {userProfile.state}</p>}
          </div>
          <button className="btn btn-primary" onClick={() => setShowProfileForm(true)}>
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'paid-tests': return renderMockTests('paid');
      case 'free-tests': return renderMockTests('free');
      case 'scores': return renderScores();
      case 'meetings': return renderMeetings();
      case 'daily-problems': return renderDailyProblems();
      case 'profile': return renderProfile();
      default: return renderOverview();
    }
  };

  if (!userData) {
    return <Loader size="large" message="Loading dashboard..." />;
  }

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <div className="user-info">
          <span>{userData.name}</span>
          <span className="role-badge">{userData.role}</span>
        </div>
      </div>

      <div className="dashboard-tabs">
        {getAvailableTabs().map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="dashboard-content">
        {loading ? (
          <Loader size="large" message="Loading..." />
        ) : (
          renderContent()
        )}
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