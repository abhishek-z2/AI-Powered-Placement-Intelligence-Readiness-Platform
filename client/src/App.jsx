import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useState } from 'react';
import StudentUpload from './pages/student/UploadPage';
import StudentDashboard from './pages/student/DashboardPage';
import RecruiterUploadJD from './pages/recruiter/UploadJDPage';
import RecruiterRankings from './pages/recruiter/RankingsPage';
import AnalyticsDashboard from './pages/analytics/DashboardPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

const ROLES = [
  { label: '🎓 Student', value: 'student' },
  { label: '💼 Recruiter', value: 'recruiter' },
  { label: '📊 Placement Officer', value: 'officer' },
];

// Login/Signup Modal Component
const AuthModal = ({ isOpen, onClose, mode, setMode, setActiveRole }) => {
  const { login, signup } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let userRole;
      if (mode === 'login') {
        const result = await login(formData.email, formData.password);
        userRole = result.user.role;
      } else {
        const result = await signup(formData.name, formData.email, formData.password, formData.role);
        userRole = result.user.role;
      }
      // Set activeRole to user's role after login/signup
      const roleToSet = userRole || formData.role;
      setActiveRole(roleToSet);
      if (typeof window !== 'undefined') {
        localStorage.setItem('activeRole', roleToSet);
      }
      onClose();
      setFormData({ name: '', email: '', password: '', role: 'student' });
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{mode === 'login' ? 'Login' : 'Sign Up'}</h2>
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            required
          />
          {mode === 'signup' && (
            <select
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
            >
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          )}
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Sign Up')}
          </button>
        </form>
        <p className="modal-switch">
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? 'Sign Up' : 'Login'}
          </button>
        </p>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Main App Content with Auth
const AppContent = () => {
  const { user, logout } = useAuth();
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });

  // Compute activeRole - prefer user.role when available, fallback to localStorage
  const activeRole = (() => {
    if (user && user.role) return user.role;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeRole') || 'student';
    }
    return 'student';
  })();

  const setActiveRole = (role) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeRole', role);
    }
  };

  const handleLogout = async () => {
    await logout();
    setActiveRole('student');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('activeRole');
    }
  };

  const openLogin = () => setAuthModal({ isOpen: true, mode: 'login' });
  const openSignup = () => setAuthModal({ isOpen: true, mode: 'signup' });
  const closeModal = () => setAuthModal({ ...authModal, isOpen: false });

  return (
    <Router>
      <div className="app">
        <header className="navbar">
          <div className="navbar-brand">
            <span className="brand-icon">⚡</span>
            <span className="brand-name">PlaceIQ</span>
            <span className="brand-sub">AI Placement Intelligence</span>
          </div>
          <nav className="navbar-links">
            {user && activeRole === 'student' && (
              <>
                <NavLink to="/student/upload" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Upload Resume</NavLink>
                <NavLink to="/student/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>My Dashboard</NavLink>
              </>
            )}
            {user && activeRole === 'recruiter' && (
              <>
                <NavLink to="/recruiter/upload-jd" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Upload JD</NavLink>
                <NavLink to="/recruiter/rankings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Rankings</NavLink>
              </>
            )}
            {user && activeRole === 'officer' && (
              <NavLink to="/analytics/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Analytics</NavLink>
            )}
          </nav>
          <div className="auth-buttons">
            {user ? (
              <>
                <span className="user-info">{user.name} ({user.role})</span>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </>
            ) : (
              <>
                <button onClick={openLogin} className="login-btn">Login</button>
                <button onClick={openSignup} className="signup-btn">Sign Up</button>
              </>
            )}
          </div>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={
              user ? (
                activeRole === 'student' ? <Navigate to="/student/upload" /> :
                activeRole === 'recruiter' ? <Navigate to="/recruiter/upload-jd" /> :
                <Navigate to="/analytics/dashboard" />
              ) : (
                <div className="welcome-section">
                  <h1>Welcome to PlaceIQ</h1>
                  <p>AI-Powered Placement Intelligence Platform</p>
                  <div className="feature-cards">
                    <div className="feature-card">
                      <h3>🎓 For Students</h3>
                      <p>Upload your resume and get AI-powered feedback</p>
                    </div>
                    <div className="feature-card">
                      <h3>💼 For Recruiters</h3>
                      <p>Find the best candidates using AI ranking</p>
                    </div>
                    <div className="feature-card">
                      <h3>📊 For Placement Officers</h3>
                      <p>Track placement analytics and trends</p>
                    </div>
                  </div>
                </div>
              )
            } />
            <Route path="/student/upload" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentUpload />
              </ProtectedRoute>
            } />
            <Route path="/student/dashboard/:id" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student/dashboard" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/recruiter/upload-jd" element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <RecruiterUploadJD />
              </ProtectedRoute>
            } />
            <Route path="/recruiter/rankings" element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <RecruiterRankings />
              </ProtectedRoute>
            } />
            <Route path="/analytics/dashboard" element={
              <ProtectedRoute allowedRoles={['officer']}>
                <AnalyticsDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </main>

        <AuthModal 
          isOpen={authModal.isOpen} 
          onClose={closeModal}
          mode={authModal.mode}
          setMode={(mode) => setAuthModal({ ...authModal, mode })}
          setActiveRole={setActiveRole}
        />
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

