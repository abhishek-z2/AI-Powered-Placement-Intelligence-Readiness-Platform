import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import StudentUpload from './pages/student/UploadPage';
import StudentDashboard from './pages/student/DashboardPage';
import RecruiterUploadJD from './pages/recruiter/UploadJDPage';
import RecruiterRankings from './pages/recruiter/RankingsPage';
import AnalyticsDashboard from './pages/analytics/DashboardPage';
import './App.css';

const ROLES = [
  { label: '🎓 Student', value: 'student' },
  { label: '💼 Recruiter', value: 'recruiter' },
  { label: '📊 Placement Officer', value: 'officer' },
];

function App() {
  const [activeRole, setActiveRole] = useState('student');

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
            {activeRole === 'student' && (
              <>
                <NavLink to="/student/upload" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Upload Resume</NavLink>
                <NavLink to="/student/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>My Dashboard</NavLink>
              </>
            )}
            {activeRole === 'recruiter' && (
              <>
                <NavLink to="/recruiter/upload-jd" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Upload JD</NavLink>
                <NavLink to="/recruiter/rankings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Rankings</NavLink>
              </>
            )}
            {activeRole === 'officer' && (
              <NavLink to="/analytics/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Analytics</NavLink>
            )}
          </nav>
          <div className="role-switcher">
            <span className="role-label">Role:</span>
            <select
              value={activeRole}
              onChange={e => setActiveRole(e.target.value)}
              className="role-select"
            >
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<StudentUpload />} />
            <Route path="/student/upload" element={<StudentUpload />} />
            <Route path="/student/dashboard/:id" element={<StudentDashboard />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/recruiter/upload-jd" element={<RecruiterUploadJD />} />
            <Route path="/recruiter/rankings" element={<RecruiterRankings />} />
            <Route path="/analytics/dashboard" element={<AnalyticsDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
