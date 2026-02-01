import { useState, useEffect } from 'react';
import { meetingsAPI, type MeetingRequest, type MeetingResponse } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import Notification from '../components/Notification';
import Loader from '../components/Loader';
import './Meetings.css';

export default function Meetings() {
  const [meetings, setMeetings] = useState<MeetingResponse[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<MeetingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; meetingId: number | null }>({ show: false, meetingId: null });
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);
  const { notification, showNotification, hideNotification } = useNotification();
  
  const [formData, setFormData] = useState<MeetingRequest>({
    courseCode: '',
    courseName: '',
    meetingUrl: '',
    meetingDate: '',
    startTime: '',
    endTime: '',
    description: '',
    createdBy: ''
  });
  const [timeConfirmed, setTimeConfirmed] = useState(false);

  useEffect(() => {
    loadMeetingsByDate(selectedDate);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setFormData(prev => ({ ...prev, createdBy: user.name || 'Admin' }));
  }, [selectedDate]);

  const loadMeetingsByDate = async (date: string) => {
    try {
      setPageLoading(true);
      console.log(`Loading meetings for date: ${date}`);
      const response = await meetingsAPI.getByDate(date);
      console.log('Meetings response:', response);
      setMeetings(response.data);
    } catch (error: any) {
      console.error('Error loading meetings:', error);
      if (error.response?.status === 404) {
        setMeetings([]);
      } else {
        showNotification(`Failed to load meetings: ${error.response?.data?.message || error.message}`, 'error');
      }
    } finally {
      setPageLoading(false);
    }
  };

  const loadMeetings = async () => {
    try {
      const response = await meetingsAPI.getAll();
      setMeetings(response.data);
    } catch (error: any) {
      showNotification('Failed to load meetings', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingMeeting) {
        await meetingsAPI.update(editingMeeting.id, formData);
        showNotification('Meeting updated successfully', 'success');
      } else {
        await meetingsAPI.create(formData);
        showNotification('Meeting created successfully', 'success');
      }
      
      resetForm();
      loadMeetingsByDate(selectedDate);
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (meeting: MeetingResponse) => {
    setEditingMeeting(meeting);
    setFormData({
      courseCode: meeting.courseCode,
      courseName: meeting.courseName,
      meetingUrl: meeting.meetingUrl,
      meetingDate: meeting.meetingDate,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      description: meeting.description || '',
      createdBy: meeting.createdBy
    });
    setTimeConfirmed(true);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    setDeleteConfirm({ show: true, meetingId: id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.meetingId) return;
    
    try {
      await meetingsAPI.delete(deleteConfirm.meetingId);
      showNotification('Meeting deleted successfully', 'success');
      loadMeetingsByDate(selectedDate);
    } catch (error: any) {
      showNotification('Failed to delete meeting', 'error');
    } finally {
      setDeleteConfirm({ show: false, meetingId: null });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, meetingId: null });
  };

  const deletePastMeetings = async () => {
    try {
      await meetingsAPI.deletePastMeetings();
      showNotification('Past meetings deleted successfully', 'success');
      loadMeetingsByDate(selectedDate);
    } catch (error: any) {
      showNotification('Failed to delete past meetings', 'error');
    } finally {
      setDeleteAllConfirm(false);
    }
  };

  const resetForm = () => {
    setFormData({
      courseCode: '',
      courseName: '',
      meetingUrl: '',
      meetingDate: '',
      startTime: '',
      endTime: '',
      description: '',
      createdBy: JSON.parse(localStorage.getItem('user') || '{}').name || 'Admin'
    });
    setEditingMeeting(null);
    setShowForm(false);
    setTimeConfirmed(false);
  };

  const handleSetTime = () => {
    if (formData.startTime && formData.endTime) {
      setTimeConfirmed(true);
      showNotification('Time set successfully!', 'success');
    } else {
      showNotification('Please select both start and end times', 'error');
    }
  };

  return (
    <div className="meetings-container">
      <div className="meetings-header">
        <h1>
          <span>📅</span>
          Meetings Management
        </h1>
        <div className="header-actions">
          <div className="date-picker-container">
            <label htmlFor="date-picker">📅 Select Date:</label>
            <input
              id="date-picker"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-picker"
            />
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <span>➕</span>
            Add Meeting
          </button>
          <button className="btn btn-danger" onClick={() => setDeleteAllConfirm(true)}>
            <span>🗑️</span>
            Delete All Past
          </button>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                <span>📅</span>
                {editingMeeting ? 'Edit Meeting' : 'Add New Meeting'}
              </h2>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="meeting-form">
              <div className="form-row">
                <div className="form-group">
                  <label>📚 Course Code</label>
                  <input
                    type="text"
                    value={formData.courseCode}
                    onChange={(e) => setFormData({...formData, courseCode: e.target.value})}
                    placeholder="e.g., IAS-2024"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>🎓 Course Name</label>
                  <input
                    type="text"
                    value={formData.courseName}
                    onChange={(e) => setFormData({...formData, courseName: e.target.value})}
                    placeholder="e.g., IAS Foundation Course"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>🔗 Meeting URL</label>
                <input
                  type="url"
                  value={formData.meetingUrl}
                  onChange={(e) => setFormData({...formData, meetingUrl: e.target.value})}
                  placeholder="https://meet.google.com/..."
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>📅 Date</label>
                  <input
                    type="date"
                    value={formData.meetingDate}
                    onChange={(e) => setFormData({...formData, meetingDate: e.target.value})}
                    className="datetime-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>🕐 Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => {
                      setFormData({...formData, startTime: e.target.value});
                      setTimeConfirmed(false);
                    }}
                    className="datetime-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>🕑 End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => {
                      setFormData({...formData, endTime: e.target.value});
                      setTimeConfirmed(false);
                    }}
                    className="datetime-input"
                    required
                  />
                </div>
              </div>
              
              {formData.startTime && formData.endTime && !timeConfirmed && (
                <div className="time-confirmation">
                  <button type="button" className="btn btn-set" onClick={handleSetTime}>
                    ⏰ Set Time
                  </button>
                  <span className="time-preview">
                    {formData.startTime} - {formData.endTime}
                  </span>
                </div>
              )}
              
              {timeConfirmed && (
                <div className="time-confirmed">
                  <span className="confirmed-icon">✅</span>
                  <span>Time confirmed: {formData.startTime} - {formData.endTime}</span>
                </div>
              )}
              
              <div className="form-group">
                <label>📝 Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Meeting agenda, topics to be covered..."
                  rows={3}
                />
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading || !timeConfirmed}>
                  {loading ? '⏳ Saving...' : editingMeeting ? '✏️ Update' : '➕ Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="meetings-list">
        {pageLoading ? (
          <Loader size="large" message="Loading meetings..." />
        ) : meetings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <p>No meetings scheduled for {new Date(selectedDate).toLocaleDateString()}.</p>
            <p>Select a different date or create a new meeting!</p>
          </div>
        ) : (
          <div className="meetings-grid">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="meeting-card">
                <div className="meeting-card-header">
                  <h3>{meeting.courseName}</h3>
                  <span className="course-code">{meeting.courseCode}</span>
                </div>
                
                <div className="meeting-details">
                  <div className="meeting-detail-item">
                    <span className="meeting-detail-icon">📅</span>
                    <span><strong>Date:</strong> {new Date(meeting.meetingDate).toLocaleDateString()}</span>
                  </div>
                  <div className="meeting-detail-item">
                    <span className="meeting-detail-icon">🕐</span>
                    <span><strong>Time:</strong> {meeting.startTime} - {meeting.endTime}</span>
                  </div>
                  <div className="meeting-detail-item">
                    <span className="meeting-detail-icon">👤</span>
                    <span><strong>Created by:</strong> {meeting.createdBy}</span>
                  </div>
                  {meeting.description && (
                    <div className="meeting-detail-item">
                      <span className="meeting-detail-icon">📝</span>
                      <span><strong>Description:</strong> {meeting.description}</span>
                    </div>
                  )}
                </div>
                
                <div className="meeting-actions">
                  <a href={meeting.meetingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-link">
                    <span>🚀</span>
                    Join Meeting
                  </a>
                  <button className="btn btn-secondary" onClick={() => handleEdit(meeting)}>
                    <span>✏️</span>
                    Edit
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(meeting.id)}>
                    <span>🗑️</span>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteAllConfirm && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-header">
              <h3>⚠️ Confirm Delete All Past Meetings</h3>
            </div>
            <div className="delete-modal-body">
              <p>Are you sure you want to delete all past meetings?</p>
              <p className="delete-warning">This will permanently delete all meetings that have already occurred.</p>
            </div>
            <div className="delete-modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteAllConfirm(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={deletePastMeetings}>
                🗑️ Delete All Past
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm.show && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-header">
              <h3>⚠️ Confirm Delete</h3>
            </div>
            <div className="delete-modal-body">
              <p>Are you sure you want to delete this meeting?</p>
              <p className="delete-warning">This action cannot be undone.</p>
            </div>
            <div className="delete-modal-actions">
              <button className="btn btn-secondary" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                🗑️ Delete
              </button>
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