import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/index';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const ROLE_LABELS = {
    frontend: '🖥️ Frontend Dev',
    backend: '⚙️ Backend Dev',
    fullstack: '🔗 Full Stack',
    data_analyst: '📊 Data Analyst',
    devops: '🛠️ DevOps',
};

function ScoreBadge({ score }) {
    const pct = Math.round(score * 100);
    const cls = pct >= 70 ? 'score-high' : pct >= 40 ? 'score-mid' : 'score-low';
    return (
        <div className={`score-badge ${cls}`}>
            {pct}%
        </div>
    );
}

function RoleBar({ role, score }) {
    const pct = Math.round(score * 100);
    const label = ROLE_LABELS[role] || role;
    return (
        <div className="progress-bar-wrap">
            <span className="progress-label">{label}</span>
            <div className="progress-track">
                <div
                    className="progress-fill"
                    style={{ width: `${pct}%`, background: pct >= 70 ? 'var(--accent-green)' : pct >= 40 ? 'var(--accent-orange)' : 'var(--accent-red)' }}
                />
            </div>
            <span className="progress-pct">{pct}%</span>
        </div>
    );
}

export default function DashboardPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [student, setStudent] = useState(null);
    const [history, setHistory] = useState([]);
    const [projects, setProjects] = useState([]);
    const [roleReadiness, setRoleReadiness] = useState({});
    const [questions, setQuestions] = useState([]);
    const [questLoading, setQuestLoading] = useState(false);
    const [questError, setQuestError] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            fetchStudent();
        } else {
            fetchHistory();
        }
    }, [id]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await api.get('/students/my-history');
            setHistory(res.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load history.');
        } finally {
            setLoading(false);
        }
    };

    const fetchStudent = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/students/${id}`);
            const { projects, roleReadiness, ...studentData } = res.data;
            setStudent(studentData);
            setProjects(projects || []);
            setRoleReadiness(roleReadiness || {});
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load student profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, assessmentId) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to remove this resume from your history?')) return;
        try {
            await api.delete(`/students/${assessmentId}`);
            if (id && id === String(assessmentId)) {
                navigate('/student/dashboard');
            } else {
                setHistory(history.filter(h => h.id !== assessmentId));
            }
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete assessment.');
        }
    };

    const handleSetActive = async (e, assessmentId) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await api.post('/students/set-active', { assessmentId });
            setHistory(history.map(h => ({
                ...h,
                isActive: h.id === assessmentId
            })));
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to set active resume.');
        }
    };

    const handleGenerateQuestions = async () => {
        if (!id) return;
        setQuestLoading(true);
        setQuestError('');
        try {
            const res = await api.post(`/students/${id}/interview-questions`);
            setQuestions(res.data.questions || []);
        } catch (err) {
            setQuestError(err.response?.data?.error || 'Failed to generate questions.');
        } finally {
            setQuestLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="spinner-wrap">
                <div className="spinner" />
                <span className="spinner-text">Loading...</span>
            </div>
        );
    }

    if (error && !id) {
        return (
            <div style={{ padding: '2rem' }}>
                <div className="alert alert-error">{error}</div>
                <button className="btn btn-primary" onClick={() => navigate('/student/upload')}>
                    Upload Resume
                </button>
            </div>
        );
    }

    // --- Render History View ---
    if (!id) {
        // Prepare chart data (chronological order)
        const chronHistory = [...history].reverse();
        const chartData = {
            labels: chronHistory.map(h => new Date(h.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
            datasets: [
                {
                    label: 'Readiness Score %',
                    data: chronHistory.map(h => Math.round(h.readiness_score * 100)),
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#6366f1',
                    pointRadius: 4,
                }
            ]
        };

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: (ctx) => `Score: ${ctx.raw}%`
                    }
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: 'rgba(255, 255, 255, 0.5)', stepSize: 20 }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: 'rgba(255, 255, 255, 0.5)' }
                }
            }
        };

        return (
            <div className="dashboard-page">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">My Resume History</h1>
                        <p className="page-subtitle">Track your progress and view past readiness reports</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => navigate('/student/upload')}>
                        Upload New Resume
                    </button>
                </div>

                {history.length > 1 && (
                    <div className="card chart-card">
                        <div className="section-title" style={{ marginBottom: '1.5rem' }}>📈 Skill Growth Journey</div>
                        <div style={{ height: '240px' }}>
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    </div>
                )}

                {history.length === 0 ? (
                    <div className="card empty-state-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                        <h2>No Resumes Found</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            You haven't uploaded any resumes yet. Start by analyzing your first resume.
                        </p>
                        <button className="btn btn-primary" onClick={() => navigate('/student/upload')}>
                            Upload My First Resume
                        </button>
                    </div>
                ) : (
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <table className="ranking-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Suggested For</th>
                                    <th>Overall Score</th>
                                    <th>Experience</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((h) => (
                                    <tr key={h.id} className="history-row">
                                        <td>
                                            <div style={{ fontWeight: '500' }}>
                                                {new Date(h.created_at).toLocaleDateString(undefined, {
                                                    month: 'short', day: 'numeric', year: 'numeric'
                                                })}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                {new Date(h.created_at).toLocaleTimeString(undefined, {
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                {h.suggested_roles?.slice(0, 2).map((role, idx) => (
                                                    <span key={idx} className="chip chip-role" style={{ fontSize: '0.7rem' }}>
                                                        {ROLE_LABELS[role] || role}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div className="history-score-bar">
                                                    <div
                                                        className="history-score-fill"
                                                        style={{
                                                            width: `${Math.round(h.readiness_score * 100)}%`,
                                                            backgroundColor: h.readiness_score >= 0.7 ? 'var(--accent-green)' : h.readiness_score >= 0.4 ? 'var(--accent-orange)' : 'var(--accent-red)'
                                                        }}
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: 'bold' }}>{Math.round(h.readiness_score * 100)}%</span>
                                                    {h.growth !== 0 && (
                                                        <span className={`growth-badge ${h.growth > 0 ? 'growth-up' : 'growth-down'}`}>
                                                            {h.growth > 0 ? '↑' : '↓'} {Math.abs(h.growth)}%
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {h.experience_years > 0 ? `${h.experience_years}y` : 'Fresher'}
                                                {h.isActive && <span className="active-status-tag">Active</span>}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', alignItems: 'center' }}>
                                                <button
                                                    className={`btn btn-ghost btn-sm toggle-active-btn ${h.isActive ? 'is-active' : ''}`}
                                                    onClick={(e) => handleSetActive(e, h.id)}
                                                    title={h.isActive ? "This is your active resume" : "Set as active for recruiters"}
                                                >
                                                    {h.isActive ? '★' : '☆'}
                                                </button>
                                                <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/student/dashboard/${h.id}`)}>
                                                    View Report
                                                </button>
                                                <button className="btn btn-ghost btn-danger btn-sm" onClick={(e) => handleDelete(e, h.id)}>
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    }

    // --- Render Report View (with ID) ---
    const overallScore = Object.values(roleReadiness).length
        ? Object.values(roleReadiness).reduce((s, v) => s + v, 0) / Object.values(roleReadiness).length
        : 0;

    return (
        <div className="dashboard-page">
            <div className="page-header dash-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="btn btn-ghost" onClick={() => navigate('/student/dashboard')}>
                        ← Back to History
                    </button>
                    <div>
                        <h1 className="page-title">Resume Report: {student.name}</h1>
                        <p className="page-subtitle">
                            {student.department && `${student.department} · `}
                            {student.year ? `Year ${student.year} · ` : ''}
                            {student.experience_years > 0 ? `${student.experience_years}y experience` : 'Fresher'}
                            {' · Analyzed on ' + new Date(student.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="btn btn-ghost btn-danger" onClick={(e) => handleDelete(e, student.id)}>
                        Delete Resume
                    </button>
                    <ScoreBadge score={overallScore} />
                </div>
            </div>

            <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
                <div className="card">
                    <div className="section-title">⚡ Technical Skills</div>
                    <div className="chips-group">
                        {student.technical_skills?.length > 0
                            ? student.technical_skills.map((s, i) => (
                                <span key={i} className="chip chip-tech">{s}</span>
                            ))
                            : <span className="empty-text">None extracted</span>
                        }
                    </div>
                </div>

                <div className="card">
                    <div className="section-title">🌟 Soft Skills</div>
                    <div className="chips-group">
                        {student.soft_skills?.length > 0
                            ? student.soft_skills.map((s, i) => (
                                <span key={i} className="chip chip-soft">{s}</span>
                            ))
                            : <span className="empty-text">None extracted</span>
                        }
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '1.25rem' }}>
                <div className="section-title">🎯 Role Readiness Breakdown</div>
                {Object.entries(roleReadiness).length > 0
                    ? Object.entries(roleReadiness).map(([role, score]) => (
                        <RoleBar key={role} role={role} score={score} />
                    ))
                    : <div className="empty-text">No role data available.</div>
                }
            </div>

            <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
                <div className="card">
                    <div className="section-title">💡 AI Suggested Roles</div>
                    <div className="chips-group">
                        {student.suggested_roles?.length > 0
                            ? student.suggested_roles.map((r, i) => (
                                <span key={i} className="chip chip-role">{ROLE_LABELS[r] || r}</span>
                            ))
                            : <span className="empty-text">None suggested</span>
                        }
                    </div>
                </div>

                <div className="card">
                    <div className="section-title">🗂️ Projects</div>
                    {projects.length > 0 ? (
                        <div className="project-list">
                            {projects.map((p, i) => (
                                <div key={i} className="project-item">
                                    <div className="project-name">{p.name}</div>
                                    <div className="chips-group" style={{ marginTop: '0.4rem' }}>
                                        {p.tech_stack?.map((t, j) => (
                                            <span key={j} className="chip chip-tech" style={{ fontSize: '0.7rem' }}>{t}</span>
                                        ))}
                                    </div>
                                    {p.description && (
                                        <div className="project-desc">{p.description}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-text">No projects found.</div>
                    )}
                </div>
            </div>

            <div className="card">
                <div className="dash-questions-header">
                    <div>
                        <div className="section-title">🎤 Interview Prep</div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            AI-generated questions tailored to your skill profile
                        </p>
                    </div>
                    <button
                        className="btn btn-ghost"
                        onClick={handleGenerateQuestions}
                        disabled={questLoading}
                        id="generate-questions-btn"
                    >
                        {questLoading ? (
                            <><span className="btn-spinner" /> Generating…</>
                        ) : (
                            <>✨ Generate Questions</>
                        )}
                    </button>
                </div>

                {questError && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{questError}</div>}

                {questions.length > 0 && (
                    <ul className="question-list" style={{ marginTop: '1rem' }}>
                        {questions.map((q, i) => (
                            <li key={i} className="question-item">
                                <span className="question-num">Q{i + 1}.</span>
                                <span>{q}</span>
                            </li>
                        ))}
                    </ul>
                )}

                {questions.length === 0 && !questLoading && (
                    <div className="empty-state" style={{ padding: '1.5rem 0 0' }}>
                        <div className="empty-icon">💬</div>
                        <div className="empty-text">Click "Generate Questions" to start your interview prep</div>
                    </div>
                )}
            </div>
        </div>
    );
}
