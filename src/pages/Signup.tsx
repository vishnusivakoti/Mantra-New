import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usersAPI, authAPI } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import { useTheme } from '../contexts/ThemeContext';
import Notification from '../components/Notification';
import './Signup.css';

interface SignupForm {
  name: string;
  emailid: string;
  password: string;
  confirmPassword: string;
  phoneno: string;
}

export default function Signup() {
  const [formData, setFormData] = useState<SignupForm>({
    name: '',
    emailid: '',
    password: '',
    confirmPassword: '',
    phoneno: ''
  });
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { notification, showNotification, hideNotification } = useNotification();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleInputChange = (field: keyof SignupForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const sendOtp = async () => {
    if (!formData.emailid) {
      showNotification('Please enter email address', 'error');
      return;
    }

    setLoading(true);
    try {
      // Check if email already exists
      const emailExists = await authAPI.checkEmailExists(formData.emailid);
      if (emailExists) {
        showNotification('User already exists with this email', 'error');
        return;
      }

      await authAPI.sendRegisterOtp(formData.emailid);
      setOtpSent(true);
      setStep('otp');
      showNotification('OTP sent to your email', 'success');
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to send OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      showNotification('Please enter OTP', 'error');
      return;
    }

    setLoading(true);
    try {
      await authAPI.validateOtp(formData.emailid, otp);
      showNotification('Email verified successfully', 'success');
      await createAccount();
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Invalid OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async () => {
    try {
      const userData = {
        name: formData.name,
        emailid: formData.emailid,
        password: formData.password,
        phoneno: formData.phoneno,
        acess: 'ACTIVE',
        roles: 'USER',
        status: 'ACTIVE'
      };

      await usersAPI.createUser(userData);
      showNotification('Account created successfully! Please login.', 'success');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to create account', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }

    if (formData.password.length < 6) {
      showNotification('Password must be at least 6 characters', 'error');
      return;
    }

    await sendOtp();
  };

  return (
    <div className="signup-container">
      <div className="signup-header">
        <div className="brand-section">
          <h1>MANTRA IAS</h1>
          <p>Join thousands of aspirants in their IAS journey</p>
        </div>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>

      <div className="signup-content">
        <div className="signup-card">
          {step === 'form' ? (
            <>
              <div className="signup-form-header">
                <h2>Create Account</h2>
                <p>Start your IAS preparation journey today</p>
              </div>

              <form onSubmit={handleSubmit} className="signup-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={formData.emailid}
                    onChange={(e) => handleInputChange('emailid', e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phoneno}
                    onChange={(e) => handleInputChange('phoneno', e.target.value)}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Create a password (min 6 characters)"
                    required
                    minLength={6}
                  />
                </div>

                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    required
                  />
                </div>

                <button type="submit" className="signup-btn" disabled={loading}>
                  {loading ? 'Sending OTP...' : 'Send Verification Code'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="signup-form-header">
                <h2>Verify Email</h2>
                <p>Enter the OTP sent to {formData.emailid}</p>
              </div>

              <div className="otp-form">
                <div className="form-group">
                  <label>Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className="otp-input"
                  />
                </div>

                <div className="otp-actions">
                  <button 
                    type="button" 
                    className="verify-btn" 
                    onClick={verifyOtp}
                    disabled={loading || !otp}
                  >
                    {loading ? 'Verifying...' : 'Verify & Create Account'}
                  </button>
                  
                  <button 
                    type="button" 
                    className="resend-btn" 
                    onClick={sendOtp}
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                  
                  <button 
                    type="button" 
                    className="back-btn" 
                    onClick={() => setStep('form')}
                  >
                    Back to Form
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="signup-footer">
            <p>Already have an account? <Link to="/login">Sign In</Link></p>
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