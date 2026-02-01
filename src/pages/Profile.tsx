import { useState, useEffect } from 'react';
import { usersAPI, type UserResponse, type UserRequest } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import Notification from '../components/Notification';
import Loader from '../components/Loader';
import './Profile.css';

export default function Profile() {
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState<UserRequest | null>(null);
  const { notification, showNotification, hideNotification } = useNotification();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = localStorage.getItem('user');
      if (!user) return;
      
      const userData = JSON.parse(user);
      const userProfile = await usersAPI.getById(userData.userid);
      setProfile(userProfile);
      
      // Initialize form data
      setFormData({
        name: userProfile.name || '',
        emailid: userProfile.emailid || '',
        password: '', // Never populate password
        phoneno: userProfile.phoneno || '',
        gender: userProfile.gender || '',
        dob: userProfile.dob || '',
        highestQualification: userProfile.highestQualification || '',
        university: userProfile.university || '',
        yearOfPassing: userProfile.yearOfPassing || 0,
        attemptsGiven: userProfile.attemptsGiven || 0,
        state: userProfile.state || '',
        city: userProfile.city || '',
        pinCode: userProfile.pinCode || '',
        address: userProfile.address || '',
        dateOfJoining: userProfile.dateOfJoining || '',
        aadharNumber: userProfile.aadharNumber || '',
        acess: userProfile.acess || '',
        roles: userProfile.roles || '',
        status: userProfile.status || ''
      });
    } catch (error: any) {
      showNotification('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!formData || !profile) return;
    
    setUpdating(true);
    try {
      await usersAPI.update(profile.userid, formData);
      showNotification('Profile updated successfully!', 'success');
      setEditing(false);
      loadProfile(); // Reload profile data
    } catch (error: any) {
      showNotification('Failed to update profile', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleInputChange = (field: keyof UserRequest, value: string | number) => {
    if (!formData) return;
    setFormData({ ...formData, [field]: value });
  };

  if (loading) {
    return <Loader size="large" message="Loading your profile..." />;
  }

  if (!profile) {
    return (
      <div className="error-state">
        <h2>Failed to load profile</h2>
        <button onClick={loadProfile}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>👤 My Profile</h1>
        <p>Manage your account information</p>
        <div className="profile-actions">
          {!editing ? (
            <button className="btn btn-primary" onClick={() => setEditing(true)}>
              ✏️ Update Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button 
                className="btn btn-primary" 
                onClick={handleUpdateProfile}
                disabled={updating}
              >
                {updating ? 'Saving...' : '💾 Save Changes'}
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => setEditing(false)}
                disabled={updating}
              >
                ❌ Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="profile-basic">
              <h2>{profile.name}</h2>
              <p className="role-badge">{profile.roles}</p>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-section">
              <h3>Personal Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Full Name</label>
                  {editing ? (
                    <input 
                      type="text" 
                      value={formData?.name || ''} 
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="form-input"
                    />
                  ) : (
                    <span>{profile.name}</span>
                  )}
                </div>
                <div className="detail-item">
                  <label>Email</label>
                  {editing ? (
                    <input 
                      type="email" 
                      value={formData?.emailid || ''} 
                      onChange={(e) => handleInputChange('emailid', e.target.value)}
                      className="form-input"
                    />
                  ) : (
                    <span>{profile.emailid}</span>
                  )}
                </div>
                <div className="detail-item">
                  <label>Phone</label>
                  {editing ? (
                    <input 
                      type="tel" 
                      value={formData?.phoneno || ''} 
                      onChange={(e) => handleInputChange('phoneno', e.target.value)}
                      className="form-input"
                    />
                  ) : (
                    <span>{profile.phoneno || 'Not provided'}</span>
                  )}
                </div>
                <div className="detail-item">
                  <label>Gender</label>
                  {editing ? (
                    <select 
                      value={formData?.gender || ''} 
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="form-input"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <span>{profile.gender || 'Not provided'}</span>
                  )}
                </div>
                <div className="detail-item">
                  <label>Date of Birth</label>
                  {editing ? (
                    <input 
                      type="date" 
                      value={formData?.dob || ''} 
                      onChange={(e) => handleInputChange('dob', e.target.value)}
                      className="form-input"
                    />
                  ) : (
                    <span>{profile.dob || 'Not provided'}</span>
                  )}
                </div>
                <div className="detail-item">
                  <label>Aadhar Number</label>
                  {editing ? (
                    <input 
                      type="text" 
                      value={formData?.aadharNumber || ''} 
                      onChange={(e) => handleInputChange('aadharNumber', e.target.value)}
                      className="form-input"
                      maxLength={12}
                    />
                  ) : (
                    <span>{profile.aadharNumber || 'Not provided'}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Address Information</h3>
              <div className="detail-grid">
                <div className="detail-item full-width">
                  <label>Address</label>
                  {editing ? (
                    <textarea 
                      value={formData?.address || ''} 
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="form-input"
                      rows={3}
                    />
                  ) : (
                    <span>{profile.address || 'Not provided'}</span>
                  )}
                </div>
                <div className="detail-item">
                  <label>City</label>
                  {editing ? (
                    <input 
                      type="text" 
                      value={formData?.city || ''} 
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="form-input"
                    />
                  ) : (
                    <span>{profile.city || 'Not provided'}</span>
                  )}
                </div>
                <div className="detail-item">
                  <label>State</label>
                  {editing ? (
                    <input 
                      type="text" 
                      value={formData?.state || ''} 
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="form-input"
                    />
                  ) : (
                    <span>{profile.state || 'Not provided'}</span>
                  )}
                </div>
                <div className="detail-item">
                  <label>PIN Code</label>
                  {editing ? (
                    <input 
                      type="text" 
                      value={formData?.pinCode || ''} 
                      onChange={(e) => handleInputChange('pinCode', e.target.value)}
                      className="form-input"
                      maxLength={6}
                    />
                  ) : (
                    <span>{profile.pinCode || 'Not provided'}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Education Details</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Highest Qualification</label>
                  {editing ? (
                    <input 
                      type="text" 
                      value={formData?.highestQualification || ''} 
                      onChange={(e) => handleInputChange('highestQualification', e.target.value)}
                      className="form-input"
                    />
                  ) : (
                    <span>{profile.highestQualification || 'Not provided'}</span>
                  )}
                </div>
                <div className="detail-item">
                  <label>University</label>
                  {editing ? (
                    <input 
                      type="text" 
                      value={formData?.university || ''} 
                      onChange={(e) => handleInputChange('university', e.target.value)}
                      className="form-input"
                    />
                  ) : (
                    <span>{profile.university || 'Not provided'}</span>
                  )}
                </div>
                <div className="detail-item">
                  <label>Year of Passing</label>
                  {editing ? (
                    <input 
                      type="number" 
                      value={formData?.yearOfPassing || ''} 
                      onChange={(e) => handleInputChange('yearOfPassing', parseInt(e.target.value) || 0)}
                      className="form-input"
                      min="1950"
                      max="2030"
                    />
                  ) : (
                    <span>{profile.yearOfPassing || 'Not provided'}</span>
                  )}
                </div>
                <div className="detail-item">
                  <label>UPSC Attempts Given</label>
                  {editing ? (
                    <input 
                      type="number" 
                      value={formData?.attemptsGiven || ''} 
                      onChange={(e) => handleInputChange('attemptsGiven', parseInt(e.target.value) || 0)}
                      className="form-input"
                      min="0"
                      max="10"
                    />
                  ) : (
                    <span>{profile.attemptsGiven || 'Not provided'}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Account Details</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Access Level</label>
                  <span>{profile.acess}</span>
                </div>
                <div className="detail-item">
                  <label>Role</label>
                  <span className="role-badge">{profile.roles}</span>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <span className={`status-badge ${profile.status?.toLowerCase()}`}>
                    {profile.status || 'Active'}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Date of Joining</label>
                  <span>{profile.dateOfJoining || 'Not available'}</span>
                </div>
              </div>
            </div>
          </div>
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