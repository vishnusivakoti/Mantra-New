import { useState, useEffect } from 'react';
import { userMeetingsAPI, type MeetingResponse } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import Notification from '../components/Notification';
import Loader from '../components/Loader';
import './StudentMeetings.css';

export default function StudentMeetings() {
  const [meetings, setMeetings] = useState<MeetingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { notification, showNotification, hideNotification } = useNotification();

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      const response = await userMeetingsAPI.getUpcoming();
      setMeetings(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setMeetings([]);
      } else {
        showNotification('Failed to load meetings', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader size="large" message="Loading live classes..." />;
  }

  return (
    <div className="student-meetings">
      <div className="meetings-header">
        <h1>🎥 Live Classes</h1>
        <p>Join your scheduled live classes and interactive sessions</p>
      </div>

      {meetings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎥</div>
          <h2>No upcoming classes</h2>
          <p>Check back later for new live class schedules</p>
        </div>
      ) : (
        <div className="meetings-grid">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="meeting-card">
              <div className="meeting-header">
                <h3>{meeting.courseName}</h3>
                <span className="course-code">{meeting.courseCode}</span>
              </div>
              
              <div className="meeting-details">
                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-icon">📅</span>
                    <div className="detail-content">
                      <span className="detail-label">Date</span>
                      <span className="detail-value">{new Date(meeting.meetingDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">⏰</span>
                    <div className="detail-content">
                      <span className="detail-label">Time</span>
                      <span className="detail-value">{meeting.startTime} - {meeting.endTime}</span>
                    </div>
                  </div>
                </div>
                {meeting.description && (
                  <div className="detail-item full-width">
                    <span className="detail-icon">📝</span>
                    <div className="detail-content">
                      <span className="detail-label">Topic</span>
                      <span className="detail-value">{meeting.description}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="meeting-actions">
                <a 
                  href={meeting.meetingUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-primary"
                >
                  🎥 Join Class
                </a>
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