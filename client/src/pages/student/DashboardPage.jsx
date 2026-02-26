import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/index';

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
    const [projects, setProjects] = useState([]);
    const [roleReadiness, setRoleReadiness] = useState({});
    const [questions, setQuestions] = useState([]);
    const [questLoading, setQuestLoading] = useState(false);
    const [questError, setQuestError] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) {
            setError('No student ID provided. Please upload a resume first.');
            setLoading(false);
            return;
        }
        const fetchStudent = async () => {
            try {
                const res = await api.get(`/students/${id}`);
                const { projects, roleReadiness, ...studentData } = res.data;
                setStudent(studentData);
                setProjects(projects || []);
                setRoleReadiness(roleReadiness || {});
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to load student profile.');
            } finally {
                setLoading(false);
            }
        };
        fetchStudent();
    }, [id]);

    const handleGenerateQuestions = async () => {
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
                <span className="spinner-text">Loading your profile…</span>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '2rem' }}>
                <div className="alert alert-error">{error}</div>
                <button className="btn btn-primary" onClick={() => navigate('/student/upload')}>
                    Upload Resume
                </button>
            </div>
        );
    }

    const overallScore = Object.values(roleReadiness).length
        ? Object.values(roleReadiness).reduce((s, v) => s + v, 0) / Object.values(roleReadiness).length
        : 0;

    return (
        <div className="dashboard-page">
            {/* Header */}
            <div className="page-header dash-header">
                <div>
                    <h1 className="page-title">Welcome, {student.name} 👋</h1>
                    <p className="page-subtitle">
                        {student.department && `${student.department} · `}
                        {student.year ? `Year ${student.year} · ` : ''}
                        {student.experience_years > 0 ? `${student.experience_years}y experience` : 'Fresher'}
                    </p>
                </div>
                <ScoreBadge score={overallScore} />
            </div>

            {/* Top Grid: Skills */}
            <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
                {/* Technical Skills */}
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

                {/* Soft Skills */}
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

            {/* Role Readiness */}
            <div className="card" style={{ marginBottom: '1.25rem' }}>
                <div className="section-title">🎯 Role Readiness Breakdown</div>
                {Object.entries(roleReadiness).length > 0
                    ? Object.entries(roleReadiness).map(([role, score]) => (
                        <RoleBar key={role} role={role} score={score} />
                    ))
                    : <div className="empty-text">No role data available.</div>
                }
            </div>

            {/* Suggested Roles + Projects */}
            <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
                {/* Suggested Roles */}
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

                {/* Projects Count */}
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

            {/* Interview Questions */}
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
