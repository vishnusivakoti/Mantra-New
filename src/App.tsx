import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import StudentNavbar from './components/StudentNavbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import TestAttempt from './pages/TestAttempt';
import Meetings from './pages/Meetings';
import MockTests from './pages/MockTests';
import Users from './pages/Users';
import DailyProblems from './pages/DailyProblems';
import StudentMeetings from './pages/StudentMeetings';
import StudentTests from './pages/StudentTests';
import FreeTests from './pages/FreeTests';
import StudentPractice from './pages/StudentPractice';
import Scores from './pages/Scores';
import Profile from './pages/Profile';
import './styles/globals.css';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const user = localStorage.getItem('user');
  if (!user) return <Navigate to="/login" />;
  
  const userData = JSON.parse(user);
  if (adminOnly && userData.role !== 'ADMIN') {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
}

function RoleBasedRedirect() {
  const user = localStorage.getItem('user');
  if (!user) return <Navigate to="/login" />;
  
  const userData = JSON.parse(user);
  if (userData.role === 'ADMIN') {
    return <Navigate to="/admin" />;
  } else {
    return <Navigate to="/dashboard" />;
  }
}

function AppLayout({ children, isStudent = false }: { children: React.ReactNode; isStudent?: boolean }) {
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div>
      {isStudent ? (
        <StudentNavbar onLogout={handleLogout} />
      ) : (
        <Navbar onLogout={handleLogout} />
      )}
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
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout isStudent={true}>
                <StudentDashboard />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/student/meetings" element={
            <ProtectedRoute>
              <AppLayout isStudent={true}>
                <StudentMeetings />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/student/tests" element={
            <ProtectedRoute>
              <AppLayout isStudent={true}>
                <StudentTests />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/student/free-tests" element={
            <ProtectedRoute>
              <AppLayout isStudent={true}>
                <FreeTests />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/student/practice" element={
            <ProtectedRoute>
              <AppLayout isStudent={true}>
                <StudentPractice />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/meetings" element={
            <ProtectedRoute adminOnly={true}>
              <AppLayout>
                <Meetings />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/tests" element={
            <ProtectedRoute adminOnly={true}>
              <AppLayout>
                <MockTests />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute adminOnly={true}>
              <AppLayout>
                <Users />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/dpp" element={
            <ProtectedRoute adminOnly={true}>
              <AppLayout>
                <DailyProblems />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/meetings" element={
            <ProtectedRoute adminOnly={true}>
              <AppLayout>
                <Meetings />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/tests" element={
            <ProtectedRoute adminOnly={true}>
              <AppLayout>
                <MockTests />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute adminOnly={true}>
              <AppLayout>
                <Users />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/dpp" element={
            <ProtectedRoute adminOnly={true}>
              <AppLayout>
                <DailyProblems />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/scores" element={
            <ProtectedRoute>
              <AppLayout isStudent={true}>
                <Scores />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <AppLayout isStudent={true}>
                <Profile />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/test/:testId/:testType" element={
            <ProtectedRoute>
              <TestAttempt />
            </ProtectedRoute>
          } />
          <Route path="/" element={<RoleBasedRedirect />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}