import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './styles/globals.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = localStorage.getItem('user');
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div>
      <Navbar onLogout={handleLogout} />
      <main>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/meetings" element={
            <ProtectedRoute>
              <AppLayout>
                <div style={{ padding: '32px', textAlign: 'center' }}>
                  <h1>📅 Meetings</h1>
                  <p>Meetings management coming soon...</p>
                </div>
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/tests" element={
            <ProtectedRoute>
              <AppLayout>
                <div style={{ padding: '32px', textAlign: 'center' }}>
                  <h1>📝 Mock Tests</h1>
                  <p>Mock tests management coming soon...</p>
                </div>
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute>
              <AppLayout>
                <div style={{ padding: '32px', textAlign: 'center' }}>
                  <h1>👥 Users</h1>
                  <p>User management coming soon...</p>
                </div>
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/dpp" element={
            <ProtectedRoute>
              <AppLayout>
                <div style={{ padding: '32px', textAlign: 'center' }}>
                  <h1>📚 Daily Practice</h1>
                  <p>Daily practice problems coming soon...</p>
                </div>
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/admin" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}