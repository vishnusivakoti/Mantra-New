import { useState, useEffect } from 'react';
import { mockTestsAPI, type MockTestRequest, type MockTestResponse } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import Notification from '../components/Notification';
import Loader from '../components/Loader';
import Questions from '../components/Questions';
import FreeQuestions from '../components/FreeQuestions';
import './MockTests.css';

type MockTestType = 'paid' | 'free';

export default function MockTests() {
  const [activeTab, setActiveTab] = useState<MockTestType>('paid');
  const [mockTests, setMockTests] = useState<MockTestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; testId: number | null; testName: string }>({ show: false, testId: null, testName: '' });
  const [editingTest, setEditingTest] = useState<MockTestResponse | null>(null);
  const [selectedMockTest, setSelectedMockTest] = useState<MockTestResponse | null>(null);
  const { notification, showNotification, hideNotification } = useNotification();

  const [formData, setFormData] = useState<MockTestRequest>({
    name: '',
    timerInMinutes: 60
  });

  useEffect(() => {
    loadMockTests();
  }, [activeTab]);

  const loadMockTests = async () => {
    try {
      setLoading(true);
      console.log(`Loading ${activeTab} mock tests...`);
      const response = activeTab === 'paid' 
        ? await mockTestsAPI.getAllPaid()
        : await mockTestsAPI.getAllFree();
      console.log(`${activeTab} mock tests response:`, response);
      setMockTests(response.data);
    } catch (error: any) {
      console.error(`Error loading ${activeTab} mock tests:`, error);
      showNotification(`Failed to load mock tests: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingTest) {
        activeTab === 'paid' 
          ? await mockTestsAPI.updatePaid(editingTest.id, formData)
          : await mockTestsAPI.updateFree(editingTest.id, formData);
        showNotification('Mock test updated successfully', 'success');
      } else {
        activeTab === 'paid' 
          ? await mockTestsAPI.createPaid(formData)
          : await mockTestsAPI.createFree(formData);
        showNotification('Mock test created successfully', 'success');
      }
      
      resetForm();
      loadMockTests();
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (test: MockTestResponse) => {
    setEditingTest(test);
    setFormData({
      name: test.name,
      timerInMinutes: test.timerInMinutes
    });
    setShowForm(true);
  };

  const handleDelete = (test: MockTestResponse) => {
    setDeleteConfirm({ show: true, testId: test.id, testName: test.name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.testId) return;
    
    try {
      activeTab === 'paid' 
        ? await mockTestsAPI.deletePaid(deleteConfirm.testId)
        : await mockTestsAPI.deleteFree(deleteConfirm.testId);
      showNotification('Mock test deleted successfully', 'success');
      loadMockTests();
    } catch (error: any) {
      showNotification('Failed to delete mock test', 'error');
    } finally {
      setDeleteConfirm({ show: false, testId: null, testName: '' });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, testId: null, testName: '' });
  };

  const resetForm = () => {
    setFormData({ name: '', timerInMinutes: 60 });
    setEditingTest(null);
    setShowForm(false);
  };

  const handleManageQuestions = (test: MockTestResponse) => {
    setSelectedMockTest(test);
    setShowQuestions(true);
  };

  const handleCloseQuestions = () => {
    setShowQuestions(false);
    setSelectedMockTest(null);
  };

  return (
    <div className="mock-tests-container">
      <div className="mock-tests-header">
        <h1>Mock Tests Management</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          Add {activeTab === 'paid' ? 'Paid' : 'Free'} Test
        </button>
      </div>

      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'paid' ? 'active' : ''}`}
            onClick={() => setActiveTab('paid')}
          >
            Paid Mock Tests
          </button>
          <button 
            className={`tab ${activeTab === 'free' ? 'active' : ''}`}
            onClick={() => setActiveTab('free')}
          >
            Free Mock Tests
          </button>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                {editingTest ? 'Edit' : 'Add'} {activeTab === 'paid' ? 'Paid' : 'Free'} Mock Test
              </h2>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="test-form">
              <div className="form-group">
                <label>Test Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., IAS Prelims Mock Test 1"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Duration (Minutes)</label>
                <input
                  type="number"
                  value={formData.timerInMinutes}
                  onChange={(e) => setFormData({...formData, timerInMinutes: parseInt(e.target.value)})}
                  min="1"
                  max="300"
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : editingTest ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="tests-content">
        {loading ? (
          <Loader size="large" message={`Loading ${activeTab} mock tests...`} />
        ) : mockTests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p>No {activeTab} mock tests created yet.</p>
            <p>Create your first {activeTab} mock test!</p>
          </div>
        ) : (
          <div className="tests-grid">
            {mockTests.map((test) => (
              <div key={test.id} className="test-card">
                <div className="test-header">
                  <h3>{test.name}</h3>
                  <span className={`test-type ${activeTab}`}>
                    {activeTab.toUpperCase()}
                  </span>
                </div>
                
                <div className="test-details">
                  <div className="test-detail-item">
                    <span className="test-detail-icon">⏱️</span>
                    <span><strong>Duration:</strong> {test.timerInMinutes} minutes</span>
                  </div>
                  <div className="test-detail-item">
                    <span className="test-detail-icon">📅</span>
                    <span><strong>Created:</strong> {new Date(test.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="test-actions">
                  <button className="btn btn-secondary" onClick={() => handleEdit(test)}>
                    Edit
                  </button>
                  <button className="btn btn-info" onClick={() => handleManageQuestions(test)}>
                    Questions
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(test)}>
                    Delete
                  </button>
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
              <h3>Confirm Delete</h3>
            </div>
            <div className="delete-modal-body">
              <p>Are you sure you want to delete the mock test:</p>
              <p className="test-name-highlight">"{deleteConfirm.testName}"</p>
              <p className="delete-warning">⚠️ This will permanently delete the mock test and all its questions.</p>
              <p className="delete-warning">This action cannot be undone.</p>
            </div>
            <div className="delete-modal-actions">
              <button className="btn btn-secondary" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                🗑️ Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {showQuestions && selectedMockTest && (
        activeTab === 'paid' ? (
          <Questions 
            mockTest={selectedMockTest} 
            onClose={handleCloseQuestions}
          />
        ) : (
          <FreeQuestions 
            mockTest={selectedMockTest} 
            onClose={handleCloseQuestions}
          />
        )
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