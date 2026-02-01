import { useState, useEffect } from 'react';
import { dppAPI, type DPPRequest, type DPPResponse } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import Notification from '../components/Notification';
import Loader from '../components/Loader';
import './DailyProblems.css';

export default function DailyProblems() {
  const [problems, setProblems] = useState<DPPResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProblem, setEditingProblem] = useState<DPPResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean, problemId: number | null, question: string}>({
    show: false, problemId: null, question: ''
  });
  const { notification, showNotification, hideNotification } = useNotification();

  const [formData, setFormData] = useState<DPPRequest>({
    question: '',
    description: '',
    difficulty: 'Medium',
    createdBy: 'Admin',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadProblems();
  }, [selectedDate]);

  const loadProblems = async () => {
    try {
      setLoading(true);
      const response = await dppAPI.getByDate(selectedDate);
      setProblems(response);
    } catch (error: any) {
      if (error.response?.status === 204) {
        setProblems([]);
      } else {
        showNotification('Failed to load daily problems', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProblem) {
        await dppAPI.update(editingProblem.id, formData);
        showNotification('Problem updated successfully', 'success');
      } else {
        await dppAPI.create(formData);
        showNotification('Problem created successfully', 'success');
      }
      
      resetForm();
      loadProblems();
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleEdit = (problem: DPPResponse) => {
    setEditingProblem(problem);
    setFormData({
      question: problem.question,
      description: problem.description || '',
      difficulty: problem.difficulty,
      createdBy: problem.createdBy,
      date: problem.date
    });
    setShowForm(true);
  };

  const handleDelete = (problem: DPPResponse) => {
    setDeleteConfirm({ show: true, problemId: problem.id, question: problem.question });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.problemId) return;
    
    try {
      await dppAPI.delete(deleteConfirm.problemId);
      showNotification('Problem deleted successfully', 'success');
      loadProblems();
    } catch (error: any) {
      showNotification('Failed to delete problem', 'error');
    } finally {
      setDeleteConfirm({ show: false, problemId: null, question: '' });
    }
  };

  const handleDeletePast = async () => {
    try {
      const response = await dppAPI.deletePast();
      showNotification(response.message, 'success');
      loadProblems();
    } catch (error: any) {
      showNotification('Failed to delete past problems', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      description: '',
      difficulty: 'Medium',
      createdBy: 'Admin',
      date: new Date().toISOString().split('T')[0]
    });
    setEditingProblem(null);
    setShowForm(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'Hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="daily-problems-container">
      <div className="daily-problems-header">
        <h1>📚 Daily Practice Problems</h1>
        <div className="header-actions">
          <button className="btn btn-danger" onClick={handleDeletePast}>
            🗑️ Delete Past
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            ➕ Add Problem
          </button>
        </div>
      </div>

      <div className="calendar-section">
        <div className="date-picker">
          <label htmlFor="date-select">📅 Select Date:</label>
          <input
            id="date-select"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
          />
        </div>
        <div className="selected-date-info">
          <span>Showing problems for: <strong>{new Date(selectedDate).toLocaleDateString()}</strong></span>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>📚 {editingProblem ? 'Edit' : 'Add'} Daily Problem</h2>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="problem-form">
              <div className="form-group">
                <label>❓ Question</label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData({...formData, question: e.target.value})}
                  placeholder="Enter the practice problem question..."
                  rows={3}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>📝 Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Additional details or explanation..."
                  rows={4}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>⚡ Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                    required
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>📅 Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProblem ? '✏️ Update' : '➕ Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="problems-content">
        {loading ? (
          <Loader size="large" message="Loading daily problems..." />
        ) : problems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <p>No daily problems created yet.</p>
            <p>Create your first practice problem!</p>
          </div>
        ) : (
          <div className="problems-grid">
            {problems.map((problem) => (
              <div key={problem.id} className="problem-card">
                <div className="problem-header">
                  <span 
                    className="difficulty-badge" 
                    style={{ backgroundColor: getDifficultyColor(problem.difficulty) }}
                  >
                    {problem.difficulty}
                  </span>
                  <span className="problem-date">📅 {new Date(problem.date).toLocaleDateString()}</span>
                </div>
                
                <div className="problem-content">
                  <h3 className="problem-question">{problem.question}</h3>
                  {problem.description && (
                    <p className="problem-description">{problem.description}</p>
                  )}
                </div>
                
                <div className="problem-footer">
                  <span className="created-by">👤 {problem.createdBy}</span>
                  <div className="problem-actions">
                    <button className="btn btn-secondary" onClick={() => handleEdit(problem)}>
                      ✏️ Edit
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(problem)}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteConfirm.show && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-header">
              <h3>⚠️ Confirm Delete</h3>
            </div>
            <div className="delete-modal-body">
              <p>Are you sure you want to delete this problem?</p>
              <p className="problem-preview">"{deleteConfirm.question.substring(0, 100)}..."</p>
              <p className="delete-warning">This action cannot be undone.</p>
            </div>
            <div className="delete-modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm({ show: false, problemId: null, question: '' })}>
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