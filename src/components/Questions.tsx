import { useState, useEffect } from 'react';
import { questionsAPI, type QuestionRequest, type QuestionResponse, type MockTestResponse } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import Notification from '../components/Notification';
import Loader from '../components/Loader';
import './Questions.css';

interface QuestionsProps {
  mockTest: MockTestResponse;
  onClose: () => void;
}

export default function Questions({ mockTest, onClose }: QuestionsProps) {
  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionResponse | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; questionId: number | null; questionText: string }>({ show: false, questionId: null, questionText: '' });
  const { notification, showNotification, hideNotification } = useNotification();

  const [formData, setFormData] = useState<QuestionRequest>({
    questionNo: 1,
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A'
  });

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await questionsAPI.getByMockTest(mockTest.id);
      setQuestions(response.data);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        showNotification('Failed to load questions', 'error');
      }
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingQuestion) {
        await questionsAPI.update(editingQuestion.id, formData);
        showNotification('Question updated successfully', 'success');
      } else {
        await questionsAPI.create(mockTest.id, formData);
        showNotification('Question added successfully', 'success');
      }
      
      resetForm();
      loadQuestions();
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleEdit = (question: QuestionResponse) => {
    setEditingQuestion(question);
    setFormData({
      questionNo: question.questionNo,
      question: question.question,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      correctOption: question.correctOption
    });
    setShowForm(true);
  };

  const handleDelete = (question: QuestionResponse) => {
    setDeleteConfirm({ 
      show: true, 
      questionId: question.id, 
      questionText: question.question.length > 50 
        ? question.question.substring(0, 50) + '...' 
        : question.question 
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.questionId) return;
    
    try {
      await questionsAPI.delete(deleteConfirm.questionId);
      showNotification('Question deleted successfully', 'success');
      loadQuestions();
    } catch (error: any) {
      showNotification('Failed to delete question', 'error');
    } finally {
      setDeleteConfirm({ show: false, questionId: null, questionText: '' });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, questionId: null, questionText: '' });
  };

  const resetForm = () => {
    setFormData({
      questionNo: questions.length + 1,
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 'A'
    });
    setEditingQuestion(null);
    setShowForm(false);
  };

  return (
    <div className="modal-overlay">
      <div className="questions-modal">
        <div className="questions-header">
          <h2>❓ Questions - {mockTest.name}</h2>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              ➕ Add Question
            </button>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
        </div>

        {showForm && (
          <div className="question-form-container">
            <form onSubmit={handleSubmit} className="question-form">
              <div className="form-row">
                <div className="form-group">
                  <label>🔢 Question No.</label>
                  <input
                    type="number"
                    value={formData.questionNo}
                    onChange={(e) => setFormData({...formData, questionNo: parseInt(e.target.value)})}
                    min="1"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>❓ Question</label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData({...formData, question: e.target.value})}
                  placeholder="Enter your question here..."
                  rows={3}
                  required
                />
              </div>
              
              <div className="options-grid">
                <div className="form-group">
                  <label>🅰️ Option A</label>
                  <input
                    type="text"
                    value={formData.optionA}
                    onChange={(e) => setFormData({...formData, optionA: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>🅱️ Option B</label>
                  <input
                    type="text"
                    value={formData.optionB}
                    onChange={(e) => setFormData({...formData, optionB: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>🅲 Option C</label>
                  <input
                    type="text"
                    value={formData.optionC}
                    onChange={(e) => setFormData({...formData, optionC: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>🅳 Option D</label>
                  <input
                    type="text"
                    value={formData.optionD}
                    onChange={(e) => setFormData({...formData, optionD: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>✅ Correct Answer</label>
                <select
                  value={formData.correctOption}
                  onChange={(e) => setFormData({...formData, correctOption: e.target.value})}
                  required
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingQuestion ? '✏️ Update' : '➕ Add'} Question
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="questions-content">
          {loading ? (
            <Loader size="medium" message="Loading questions..." />
          ) : questions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">❓</div>
              <p>No questions added yet.</p>
              <p>Add your first question!</p>
            </div>
          ) : (
            <div className="questions-list">
              {questions.map((question) => (
                <div key={question.id} className="question-card">
                  <div className="question-header">
                    <span className="question-number">Q{question.questionNo}</span>
                    <div className="question-actions">
                      <button className="btn btn-secondary" onClick={() => handleEdit(question)}>
                        ✏️ Edit
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDelete(question)}>
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="question-text">
                    {question.question}
                  </div>
                  
                  <div className="options-list">
                    <div className="option">
                      <strong>A)</strong> {question.optionA}
                    </div>
                    <div className="option">
                      <strong>B)</strong> {question.optionB}
                    </div>
                    <div className="option">
                      <strong>C)</strong> {question.optionC}
                    </div>
                    <div className="option">
                      <strong>D)</strong> {question.optionD}
                    </div>
                    <div className="correct-answer-indicator">
                      <strong>✅ Correct Answer: {question.correctOption}</strong>
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
                <h3>⚠️ Confirm Delete Question</h3>
              </div>
              <div className="delete-modal-body">
                <p>Are you sure you want to delete this question:</p>
                <p className="question-text-highlight">"{deleteConfirm.questionText}"</p>
                <p className="delete-warning">This action cannot be undone.</p>
              </div>
              <div className="delete-modal-actions">
                <button className="btn btn-secondary" onClick={cancelDelete}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={confirmDelete}>
                  🗑️ Delete Question
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
    </div>
  );
}