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
import { useAuth } from '../../context/AuthContext';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer
} from 'recharts';

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
    // TECH
    frontend: '🖥️ Frontend Dev',
    backend: '⚙️ Backend Dev',
    fullstack: '🔗 Full Stack',
    data_analyst: '📊 Data Analyst',
    devops: '🛠️ DevOps',
    // MECH
    design_engineer: '📐 Design Engineer',
    thermal_engineer: '🔥 Thermal Engineer',
    production_engineer: '🏭 Production Engineer',
    automotive_engineer: '🏎️ Automotive Engineer',
    // ECE/EEE
    embedded_engineer: '📟 Embedded Engineer',
    vlsi_designer: '💾 VLSI Designer',
    signal_processing: '📡 Signal Processing',
    electrical_engineer: '⚡ Electrical Engineer',
    // CIVIL
    structural_engineer: '🏗️ Structural Engineer',
    bim_modeler: '🏢 BIM Modeler',
    site_engineer: '🚜 Site Engineer',
    environmental_engineer: '🌿 Environmental Engineer',
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
    const { user } = useAuth();

    const [student, setStudent] = useState(null);
    const [history, setHistory] = useState([]);
    const [projects, setProjects] = useState([]);
    const [roleReadiness, setRoleReadiness] = useState({});
    const [selectedDomain, setSelectedDomain] = useState('tech');
    const [questions, setQuestions] = useState([]);
    const [questLoading, setQuestLoading] = useState(false);
    const [questError, setQuestError] = useState('');
    const [roadmap, setRoadmap] = useState(null);
    const [roadLoading, setRoadLoading] = useState(false);
    const [roadError, setRoadError] = useState('');
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

            // Auto-select domain based on department
            const dept = studentData.department?.toLowerCase() || '';
            if (dept.includes('mech')) setSelectedDomain('mechanical');
            else if (dept.includes('civil')) setSelectedDomain('civil');
            else if (dept.includes('electronics') || dept.includes('electrical') || dept.includes('ece') || dept.includes('eee')) setSelectedDomain('ece_eee');
            else setSelectedDomain('tech');

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

    const handleGenerateRoadmap = async (targetRole) => {
        if (!id) return;
        setRoadLoading(true);
        setRoadError('');
        try {
            const res = await api.post(`/students/${id}/roadmap`, { targetRole });
            setRoadmap(res.data.roadmap || null);
        } catch (err) {
            setRoadError(err.response?.data?.error || 'Failed to generate roadmap.');
        } finally {
            setRoadLoading(false);
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
    const overallScore = student.readiness_score || 0;

    return (
        <div className="dashboard-page">
            <div className="page-header dash-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="btn btn-ghost" onClick={() => navigate(-1)}>
                        ← Back
                    </button>
                    <div>
                        <h1 className="page-title">{user?.role === 'student' && String(student.user_id) === String(user.userId) ? 'Resume Report' : 'Candidate Report'}: {student.name}</h1>
                        <p className="page-subtitle">
                            {student.department && `${student.department} · `}
                            {student.year ? `Year ${student.year} · ` : ''}
                            {student.experience_years > 0 ? `${student.experience_years}y experience` : 'Fresher'}
                            {' · Analyzed on ' + new Date(student.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {user?.role === 'student' && String(student.user_id) === String(user.userId) && (
                        <button className="btn btn-ghost btn-danger" onClick={(e) => handleDelete(e, student.id)}>
                            Delete Resume
                        </button>
                    )}
                    <ScoreBadge score={overallScore} />
                </div>
            </div>

            <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
                <div className="card">
                    <div className="section-title">🎓 Academic Profile (KTU)</div>
                    <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', height: '100%' }}>
                        <div style={{ textAlign: 'center', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: (student.cgpa >= 8.5 ? 'var(--accent-green)' : student.cgpa >= 7.0 ? 'var(--accent-secondary)' : 'var(--accent-orange)') }}>
                                {student.cgpa || 'N/A'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>CGPA</div>
                        </div>
                        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: (student.backlogs > 0 ? 'var(--accent-red)' : 'var(--accent-green)') }}>
                                {student.backlogs ?? 0}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Backlogs</div>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '1rem' }}>
                    <div className="section-title" style={{ marginBottom: '0.5rem' }}>🕸️ Skill Profile Radar</div>
                    <div style={{ width: '100%', height: '220px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                                { subject: 'Frontend', A: Math.round((roleReadiness.frontend || 0) * 100), fullMark: 100 },
                                { subject: 'Backend', A: Math.round((roleReadiness.backend || 0) * 100), fullMark: 100 },
                                { subject: 'Fullstack', A: Math.round((roleReadiness.fullstack || 0) * 100), fullMark: 100 },
                                { subject: 'Data', A: Math.round((roleReadiness.data_analyst || 0) * 100), fullMark: 100 },
                                { subject: 'DevOps', A: Math.round((roleReadiness.devops || 0) * 100), fullMark: 100 },
                            ]}>
                                <PolarGrid stroke="var(--border)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Skills"
                                    dataKey="A"
                                    stroke="var(--accent-primary)"
                                    fill="var(--accent-primary)"
                                    fillOpacity={0.5}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
                <div className="card">
                    <div className="section-title">⚡ Technical Skills</div>
                    <div className="chips-group">
                        {student.technical_skills?.length > 0
                            ? student.technical_skills.map((s, i) => {
                                const isRare = student.rareSkills?.includes(s);
                                return (
                                    <div key={i} style={{ position: 'relative' }}>
                                        <span className={`chip chip-tech ${isRare ? 'chip-rare' : ''}`}>
                                            {s}
                                        </span>
                                        {isRare && (
                                            <span style={{
                                                position: 'absolute',
                                                top: '-6px',
                                                right: '-6px',
                                                fontSize: '0.6rem',
                                                background: 'var(--accent-orange)',
                                                color: '#000',
                                                padding: '1px 4px',
                                                borderRadius: '4px',
                                                fontWeight: '800',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                                zIndex: 1
                                            }}>
                                                ✨ RARE
                                            </span>
                                        )}
                                    </div>
                                );
                            })
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

            {user?.role === 'student' && String(student.user_id) === String(user.userId) && (
                <div className="card" style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div className="section-title" style={{ marginBottom: 0 }}>🎯 Role Readiness Breakdown</div>
                        <div className="domain-tabs">
                            {[
                                { id: 'tech', label: 'Tech' },
                                { id: 'mechanical', label: 'Mechanical' },
                                { id: 'civil', label: 'Civil' },
                                { id: 'ece_eee', label: 'ECE / EEE' }
                            ].map(d => (
                                <button
                                    key={d.id}
                                    className={`tab-btn ${selectedDomain === d.id ? 'active' : ''}`}
                                    onClick={() => setSelectedDomain(d.id)}
                                >
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {Object.entries(roleReadiness).filter(([role]) => {
                        const tech = ['frontend', 'backend', 'fullstack', 'data_analyst', 'devops'];
                        const mech = ['design_engineer', 'thermal_engineer', 'production_engineer', 'automotive_engineer'];
                        const civil = ['structural_engineer', 'bim_modeler', 'site_engineer', 'environmental_engineer'];
                        const ece = ['embedded_engineer', 'vlsi_designer', 'signal_processing', 'electrical_engineer'];

                        if (selectedDomain === 'tech') return tech.includes(role);
                        if (selectedDomain === 'mechanical') return mech.includes(role);
                        if (selectedDomain === 'civil') return civil.includes(role);
                        if (selectedDomain === 'ece_eee') return ece.includes(role);
                        return true;
                    }).length > 0
                        ? Object.entries(roleReadiness).filter(([role]) => {
                            const tech = ['frontend', 'backend', 'fullstack', 'data_analyst', 'devops'];
                            const mech = ['design_engineer', 'thermal_engineer', 'production_engineer', 'automotive_engineer'];
                            const civil = ['structural_engineer', 'bim_modeler', 'site_engineer', 'environmental_engineer'];
                            const ece = ['embedded_engineer', 'vlsi_designer', 'signal_processing', 'electrical_engineer'];

                            if (selectedDomain === 'tech') return tech.includes(role);
                            if (selectedDomain === 'mechanical') return mech.includes(role);
                            if (selectedDomain === 'civil') return civil.includes(role);
                            if (selectedDomain === 'ece_eee') return ece.includes(role);
                            return true;
                        }).map(([role, score]) => (
                            <RoleBar key={role} role={role} score={score} />
                        ))
                        : <div className="empty-text">No role data available for this domain.</div>
                    }
                </div>
            )}

            <div className={user?.role === 'student' && String(student.user_id) === String(user.userId) ? 'grid-2' : 'grid-1'} style={{ marginBottom: '1.25rem' }}>
                {user?.role === 'student' && String(student.user_id) === String(user.userId) && (
                    <div className="card">
                        <div className="section-title">💡 Suggested Roles</div>
                        <div className="chips-group">
                            {student.suggested_roles?.length > 0
                                ? student.suggested_roles.map((r, i) => (
                                    <span key={i} className="chip chip-role">{ROLE_LABELS[r] || r}</span>
                                ))
                                : <span className="empty-text">None suggested</span>
                            }
                        </div>
                    </div>
                )}

                <div className="card">
                    <div className="section-title">🗂️ Projects</div>
                    {projects.length > 0 ? (
                        <div className="project-list">
                            {projects.map((p, i) => (
                                <div key={i} className="project-item">
                                    <div className="project-name">{p.name}</div>
                                    <div className="chips-group" style={{ marginTop: '0.4rem' }}>
                                        {p.tech_stack?.map((t, j) => (
                                            <span key={j} className={`chip chip-tech ${student.rareSkills?.includes(t) ? 'chip-rare' : ''}`} style={{ fontSize: '0.7rem' }}>{t}</span>
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

            {/* Only show Prep Tools for the student owner */}
            {user?.role === 'student' && String(student.user_id) === String(user.userId) && (
                <>
                    <div className="card" style={{ marginBottom: '1.25rem' }}>
                        <div className="dash-questions-header">
                            <div>
                                <div className="section-title">🗺️ Personal Skill Roadmap</div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                    Bridge the gap to your dream role with a 4-week AI-powered plan
                                </p>
                            </div>
                        </div>

                        {!roadmap && !roadLoading && (
                            <div style={{ marginTop: '1.5rem' }}>
                                <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Select a target role to generate your roadmap:</p>
                                <div className="chips-group">
                                    {Object.keys(ROLE_LABELS).map((role) => (
                                        <button
                                            key={role}
                                            className="chip chip-clickable"
                                            onClick={() => handleGenerateRoadmap(role)}
                                            disabled={roadLoading}
                                        >
                                            {ROLE_LABELS[role]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {roadLoading && (
                            <div className="empty-state" style={{ padding: '3rem 0' }}>
                                <div className="spinner" style={{ margin: '0 auto 1rem' }} />
                                <div className="empty-text">Building your personalized roadmap...</div>
                            </div>
                        )}

                        {roadError && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{roadError}</div>}

                        {roadmap && (
                            <div className="roadmap-container" style={{ marginTop: '2rem' }}>
                                <div className="roadmap-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ margin: 0 }}>Projected Path to {ROLE_LABELS[roadmap.targetRole] || roadmap.targetRole}</h3>
                                    <button className="btn btn-ghost btn-sm" onClick={() => setRoadmap(null)}>Change Role</button>
                                </div>

                                <div className="roadmap-timeline">
                                    {roadmap.weeks.map((week, idx) => (
                                        <div key={idx} className="roadmap-week">
                                            <div className="roadmap-week-num">Week {week.week}</div>
                                            <div className="roadmap-week-content">
                                                <div className="roadmap-focus" style={{ fontWeight: '600', color: 'var(--accent-indigo)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                                                    {week.focus}
                                                </div>
                                                <div className="roadmap-topics" style={{ marginBottom: '0.8rem' }}>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Topics:</span>
                                                    <div className="chips-group" style={{ marginTop: '0.3rem' }}>
                                                        {week.topics.map((t, i) => <span key={i} className="chip chip-tech" style={{ fontSize: '0.75rem' }}>{t}</span>)}
                                                    </div>
                                                </div>
                                                <div className="roadmap-task" style={{ marginBottom: '1rem', padding: '0.8rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid var(--accent-green)' }}>
                                                    <span style={{ fontWeight: '500', display: 'block', marginBottom: '0.2rem' }}>🔨 Weekly Task:</span>
                                                    <span style={{ fontSize: '0.9rem' }}>{week.task}</span>
                                                </div>
                                                <div className="roadmap-resources">
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resources:</span>
                                                    <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                                                        {week.resources.map((res, i) => (
                                                            <a key={i} href={res.url} target="_blank" rel="noopener noreferrer" className="resource-link">
                                                                {res.title} ↗
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="card">
                        <div className="dash-questions-header">
                            <div>
                                <div className="section-title">🎤 Interview Prep</div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                    Tailored interview questions for your profile
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
                </>
            )}
        </div>
    );
}
