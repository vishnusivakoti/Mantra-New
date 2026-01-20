import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification, type NotificationType } from '../hooks/useNotification';
import Notification from '../components/Notification';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } = useNotification();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === 'admin@mantraias.com' && password === 'admin123') {
        localStorage.setItem('user', JSON.stringify({ email, role: 'admin' }));
        showNotification('Login successful!', 'success');
        setTimeout(() => navigate('/admin'), 1000);
      } else {
        showNotification('Invalid credentials', 'error');
      }
    } catch (error) {
      showNotification('Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
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
          <p>Demo credentials: admin@mantraias.com / admin123</p>
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