import { useState, useEffect } from 'react';
import { usersAPI, type UserRequest, type UserResponse } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import Notification from '../components/Notification';
import Loader from '../components/Loader';
import './Users.css';

export default function Users() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [searchType, setSearchType] = useState<'userid' | 'email'>('userid');
  const [searchValue, setSearchValue] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const { notification, showNotification, hideNotification } = useNotification();

  const [formData, setFormData] = useState<UserRequest>({
    name: '',
    emailid: '',
    password: '',
    phoneno: '',
    gender: '',
    dob: '',
    highestQualification: '',
    university: '',
    yearOfPassing: undefined,
    attemptsGiven: undefined,
    state: '',
    city: '',
    pinCode: '',
    address: '',
    dateOfJoining: '',
    aadharNumber: '',
    acess: 'ACTIVE',
    roles: '',
    status: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('Loading all users...');
      const response = await usersAPI.getAll();
      console.log('Users response:', response);
      setUsers(response.data);
    } catch (error: any) {
      console.error('Error loading users:', error);
      showNotification(`Failed to load users: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      showNotification('Please enter a search value', 'error');
      return;
    }

    try {
      setSearchLoading(true);
      let user: UserResponse;
      
      if (searchType === 'userid') {
        const userId = parseInt(searchValue);
        if (isNaN(userId)) {
          showNotification('Please enter a valid User ID', 'error');
          return;
        }
        user = await usersAPI.getById(userId);
        setUsers([user]);
      } else {
        const response = await usersAPI.getByEmail(searchValue);
        setUsers([response.data]);
      }
      
      showNotification('User found successfully', 'success');
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'User not found', 'error');
      setUsers([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchValue('');
    loadUsers();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        await usersAPI.update(editingUser.userid, formData);
        showNotification('User updated successfully', 'success');
      } else {
        // Create new user
        if (formData.roles === 'ADMIN') {
          await usersAPI.createAdmin(formData);
        } else {
          await usersAPI.createUser(formData);
        }
        showNotification('User created successfully', 'success');
      }
      
      resetForm();
      loadUsers();
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleEdit = (user: UserResponse) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      emailid: user.emailid,
      password: '', // Keep empty - will be handled in backend
      phoneno: user.phoneno,
      gender: user.gender || '',
      dob: user.dob || '',
      highestQualification: user.highestQualification || '',
      university: user.university || '',
      yearOfPassing: user.yearOfPassing,
      attemptsGiven: user.attemptsGiven,
      state: user.state || '',
      city: user.city || '',
      pinCode: user.pinCode || '',
      address: user.address || '',
      dateOfJoining: user.dateOfJoining || '',
      aadharNumber: user.aadharNumber || '',
      acess: user.acess,
      roles: user.roles,
      status: user.status
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      emailid: '',
      password: '',
      phoneno: '',
      gender: '',
      dob: '',
      highestQualification: '',
      university: '',
      yearOfPassing: undefined,
      attemptsGiven: undefined,
      state: '',
      city: '',
      pinCode: '',
      address: '',
      dateOfJoining: '',
      aadharNumber: '',
      acess: 'ACTIVE',
      roles: '',
      status: ''
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return '#ef4444';
      case 'MOCKTEST': return '#f59e0b';
      case 'FULL_COURSE': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'ACTIVE' ? '#10b981' : '#ef4444';
  };

  return (
    <div className="users-container">
      <div className="users-header">
        <h1>👥 Users Management</h1>
        <div className="users-actions">
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            ➕ Add New User
          </button>
          <div className="users-stats">
            <span className="stat-item">Total Users: {users.length}</span>
          </div>
        </div>
      </div>

      <div className="search-section">
        <div className="search-controls">
          <select 
            value={searchType} 
            onChange={(e) => setSearchType(e.target.value as 'userid' | 'email')}
            className="search-dropdown"
          >
            <option value="userid">By User ID</option>
            <option value="email">By Email</option>
          </select>
          
          <input
            type={searchType === 'userid' ? 'number' : 'email'}
            placeholder={searchType === 'userid' ? 'Enter User ID...' : 'Enter Email...'}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="search-input"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          
          <button 
            onClick={handleSearch} 
            disabled={searchLoading}
            className="btn btn-primary search-btn"
          >
            {searchLoading ? '🔍 Searching...' : '🔍 Search'}
          </button>
          
          <button 
            onClick={handleClearSearch}
            className="btn btn-secondary clear-btn"
          >
            🔄 Show All
          </button>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>✏️ {editingUser ? 'Edit User' : 'Add New User'}</h2>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-row">
                <div className="form-group">
                  <label>👤 Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>📧 Email *</label>
                  <input
                    type="email"
                    value={formData.emailid}
                    onChange={(e) => setFormData({...formData, emailid: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>📱 Phone *</label>
                  <input
                    type="tel"
                    value={formData.phoneno}
                    onChange={(e) => setFormData({...formData, phoneno: e.target.value})}
                    required
                  />
                </div>
                {!editingUser && (
                  <div className="form-group">
                    <label>🔐 Password *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                      placeholder="Enter password"
                    />
                  </div>
                )}
                {editingUser && (
                  <div className="form-group">
                    <label>👨👩👧👦 Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                )}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>👨👩👧👦 Role *</label>
                  <select
                    value={formData.roles}
                    onChange={(e) => setFormData({...formData, roles: e.target.value})}
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="USER">User</option>
                    <option value="MOCKTEST">Mock Test</option>
                    <option value="FULL_COURSE">Full Course</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>📊 Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>🎂 Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>🎓 Highest Qualification</label>
                  <input
                    type="text"
                    value={formData.highestQualification}
                    onChange={(e) => setFormData({...formData, highestQualification: e.target.value})}
                    placeholder="e.g., Bachelor's, Master's"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>🏢 University</label>
                  <input
                    type="text"
                    value={formData.university}
                    onChange={(e) => setFormData({...formData, university: e.target.value})}
                    placeholder="University name"
                  />
                </div>
                <div className="form-group">
                  <label>📅 Year of Passing</label>
                  <input
                    type="number"
                    value={formData.yearOfPassing || ''}
                    onChange={(e) => setFormData({...formData, yearOfPassing: e.target.value ? parseInt(e.target.value) : undefined})}
                    min="1950"
                    max="2030"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>📝 Attempts Given</label>
                  <input
                    type="number"
                    value={formData.attemptsGiven || ''}
                    onChange={(e) => setFormData({...formData, attemptsGiven: e.target.value ? parseInt(e.target.value) : undefined})}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>📍 State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    placeholder="State name"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>🏢 City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    placeholder="City name"
                  />
                </div>
                <div className="form-group">
                  <label>📮 Pin Code</label>
                  <input
                    type="text"
                    value={formData.pinCode}
                    onChange={(e) => setFormData({...formData, pinCode: e.target.value})}
                    placeholder="Pin code"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group full-width">
                  <label>🏠 Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Full address"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>📅 Date of Joining</label>
                  <input
                    type="date"
                    value={formData.dateOfJoining}
                    onChange={(e) => setFormData({...formData, dateOfJoining: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>🆔 Aadhar Number</label>
                  <input
                    type="text"
                    value={formData.aadharNumber}
                    onChange={(e) => setFormData({...formData, aadharNumber: e.target.value})}
                    placeholder="Aadhar number"
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingUser ? '✏️ Update User' : '➕ Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="users-content">
        {loading ? (
          <Loader size="large" message="Loading users..." />
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <p>No users found.</p>
          </div>
        ) : (
          <div className="users-grid">
            {users.map((user) => (
              <div key={user.userid} className="user-card">
                <div className="user-header">
                  <div className="user-info">
                    <h3>{user.name}</h3>
                    <p className="user-email">{user.emailid}</p>
                  </div>
                  <div className="user-badges">
                    <span 
                      className="role-badge" 
                      style={{ backgroundColor: getRoleColor(user.roles) }}
                    >
                      {user.roles}
                    </span>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(user.status) }}
                    >
                      {user.status}
                    </span>
                  </div>
                </div>
                
                <div className="user-details">
                  <div className="user-detail-item">
                    <span className="user-detail-icon">📱</span>
                    <span><strong>Phone:</strong> {user.phoneno}</span>
                  </div>
                  <div className="user-detail-item">
                    <span className="user-detail-icon">🆔</span>
                    <span><strong>User ID:</strong> {user.userid}</span>
                  </div>
                  {user.state && (
                    <div className="user-detail-item">
                      <span className="user-detail-icon">📍</span>
                      <span><strong>Location:</strong> {user.city}, {user.state}</span>
                    </div>
                  )}
                  {user.dateOfJoining && (
                    <div className="user-detail-item">
                      <span className="user-detail-icon">📅</span>
                      <span><strong>Joined:</strong> {user.dateOfJoining}</span>
                    </div>
                  )}
                </div>
                
                <div className="user-actions">
                  <button className="btn btn-secondary" onClick={() => handleEdit(user)}>
                    ✏️ Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
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