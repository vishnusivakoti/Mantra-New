import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification, type NotificationType } from '../hooks/useNotification';
import Notification from '../components/Notification';
import { authAPI, type LoginRequest } from '../services/api';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'password'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } = useNotification();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const credentials: LoginRequest = {
        emailid: email,
        password: password,
      };

      const response = await authAPI.login(credentials);
      
      if (response.code === 200) {
        localStorage.setItem('user', JSON.stringify(response.data));
        localStorage.setItem('token', response.data.token);
        showNotification('Login successful!', 'success');
        
        // Redirect based on user role
        const redirectPath = response.data.role === 'ADMIN' ? '/admin' : '/dashboard';
        setTimeout(() => navigate(redirectPath), 1000);
      } else {
        showNotification(response.message || 'Login failed', 'error');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const sendForgotPasswordOtp = async () => {
    if (!forgotEmail) {
      showNotification('Please enter email address', 'error');
      return;
    }

    setLoading(true);
    try {
      await authAPI.sendForgotPasswordOtp(forgotEmail);
      setForgotStep('otp');
      showNotification('OTP sent to your email', 'success');
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to send OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpAndReset = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      showNotification('Please fill all fields', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showNotification('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(forgotEmail, otp, newPassword);
      showNotification('Password reset successful! Please login.', 'success');
      setShowForgotPassword(false);
      setForgotStep('email');
      setForgotEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to reset password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {!showForgotPassword ? (
          <>
            <div className="login-header">
              <h1>MANTRA IAS</h1>
              <p>Welcome back! Please sign in to continue.</p>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="input"
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="input"
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary login-btn"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="login-footer">
              <p>
                <button 
                  type="button" 
                  className="forgot-password-link" 
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot Password?
                </button>
              </p>
              <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
            </div>
          </>
        ) : (
          <>
            <div className="login-header">
              <h1>Reset Password</h1>
              <p>{forgotStep === 'email' ? 'Enter your email to receive OTP' : 'Enter OTP and new password'}</p>
            </div>

            {forgotStep === 'email' ? (
              <div className="forgot-form">
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="input"
                  />
                </div>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={sendForgotPasswordOtp}
                  disabled={loading}
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </div>
            ) : (
              <div className="forgot-form">
                <div className="form-group">
                  <label>Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className="input otp-input"
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="input"
                  />
                </div>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={verifyOtpAndReset}
                  disabled={loading}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            )}

            <div className="login-footer">
              <button 
                type="button" 
                className="back-to-login" 
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotStep('email');
                  setForgotEmail('');
                  setOtp('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                Back to Login
              </button>
            </div>
          </>
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