import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/index';

function RankBadge({ rank }) {
    const cls = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : 'rank-other';
    return <span className={`rank-badge ${cls}`}>{rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}</span>;
}

function MatchPill({ pct }) {
    const cls = pct >= 70 ? 'match-high' : pct >= 40 ? 'match-mid' : 'match-low';
    return <span className={`match-pill ${cls}`}>{pct}%</span>;
}

function RankingsPage() {
    const navigate = useNavigate();
    const [jd, setJd] = useState(null);
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [loaded, setLoaded] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [selectedDeptId, setSelectedDeptId] = useState('');
    const [minCgpa, setMinCgpa] = useState('');
    const [allowBacklogs, setAllowBacklogs] = useState(true);

    useEffect(() => {
        const storedJD = sessionStorage.getItem('currentJD');
        if (storedJD) {
            const parsed = JSON.parse(storedJD);
            setJd(parsed);
            if (parsed.min_cgpa) setMinCgpa(parsed.min_cgpa);
            if (parsed.allow_backlogs === false) setAllowBacklogs(false);
        }
        fetchDepartments();
    }, []);

    useEffect(() => {
        if (jd) {
            fetchRankings(jd, selectedDeptId, minCgpa, allowBacklogs);
        }
    }, [jd, selectedDeptId, minCgpa, allowBacklogs]);

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/students/departments');
            setDepartments(res.data);
        } catch (err) {
            console.error('Failed to fetch departments');
        }
    };

    const fetchRankings = async (jdData, deptId, minC, allowB) => {
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/recruiter/rankings', {
                jd: jdData,
                departmentId: deptId || null,
                minCgpa: minC || null,
                allowBacklogs: allowB
            });
            setRankings(res.data.rankings || []);
            setLoaded(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load rankings.');
        } finally {
            setLoading(false);
        }
    };

    if (!jd) {
        return (
            <div className="page-header" style={{ textAlign: 'center', paddingTop: '3rem' }}>
                <h1 className="page-title">No Job Description Found</h1>
                <p className="page-subtitle" style={{ marginBottom: '1.5rem' }}>
                    Please upload a job description first to view candidate rankings.
                </p>
                <button className="btn btn-primary" onClick={() => navigate('/recruiter/upload-jd')}>
                    ← Upload JD
                </button>
            </div>
        );
    }

    return (
        <div className="rankings-page">
            <div className="page-header rankings-header">
                <div>
                    <h1 className="page-title">Candidate Rankings</h1>
                    <p className="page-subtitle">
                        Ranked against: <strong style={{ color: 'var(--accent-secondary)' }}>{jd.role}</strong>
                        {' · '}{jd.required_skills?.length || 0} required skills
                        {' · '}{jd.min_experience_years > 0 ? `${jd.min_experience_years}y exp` : 'Any exp'}
                    </p>
                </div>
                <button className="btn btn-secondary" onClick={() => navigate('/recruiter/upload-jd')}>
                    ← Change JD
                </button>
            </div>

            {/* JD Summary */}
            <div className="card" style={{ marginBottom: '1.25rem' }}>
                <div className="jd-summary-row">
                    <div>
                        <div className="section-title">⚡ Required Skills</div>
                        <div className="chips-group">
                            {jd.required_skills?.map((s, i) => (
                                <span key={i} className="chip chip-tech">{s}</span>
                            ))}
                        </div>
                    </div>
                    {jd.preferred_skills?.length > 0 && (
                        <div>
                            <div className="section-title">✨ Preferred Skills</div>
                            <div className="chips-group">
                                {jd.preferred_skills.map((s, i) => (
                                    <span key={i} className="chip chip-soft">{s}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Error */}
            {error && <div className="alert alert-error">⚠️ {error}</div>}

            {/* Loading */}
            {loading && (
                <div className="spinner-wrap">
                    <div className="spinner" />
                    <span className="spinner-text">Computing rankings…</span>
                </div>
            )}

            {/* Rankings Table */}
            {!loading && loaded && (
                <div className="card">
                    <div className="rankings-meta" style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            {rankings.length} candidate{rankings.length !== 1 ? 's' : ''} found
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Dept:</label>
                                <select
                                    value={selectedDeptId}
                                    onChange={(e) => setSelectedDeptId(e.target.value)}
                                    style={{
                                        fontSize: '0.8rem',
                                        border: '1px solid var(--border)',
                                        padding: '0.2rem 0.4rem',
                                        borderRadius: '4px',
                                        background: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="" style={{ background: 'var(--bg-card)' }}>All</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id} style={{ background: 'var(--bg-card)' }}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Min CGPA:</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={minCgpa}
                                    onChange={(e) => setMinCgpa(e.target.value)}
                                    placeholder="eg. 7.5"
                                    style={{ width: '60px', fontSize: '0.8rem', border: '1px solid var(--border)', padding: '0.2rem 0.4rem', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    checked={!allowBacklogs}
                                    onChange={(e) => setAllowBacklogs(!e.target.checked)}
                                    id="backlog-filter"
                                />
                                <label htmlFor="backlog-filter" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>No Backlogs</label>
                            </div>
                        </div>
                    </div>

                    {rankings.length === 0 ? (
                        <div className="empty-state" style={{ padding: '4rem 2rem', borderTop: '1px solid var(--border)' }}>
                            <div className="empty-icon">📂</div>
                            <div className="empty-text">No candidates match the current filters.</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                Try adjusting the department or academic filters above.
                            </div>
                        </div>
                    ) : (
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Candidate</th>
                                        <th>Match %</th>
                                        <th>Req Match</th>
                                        <th>Pref Match</th>
                                        <th>Exp</th>
                                        <th>Missing Skills</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rankings.map((s, i) => (
                                        <tr
                                            key={s.id}
                                            onClick={() => navigate(`/student/dashboard/${s.id}`)}
                                            style={{ cursor: 'pointer' }}
                                            className="clickable-row"
                                        >
                                            <td><RankBadge rank={i + 1} /></td>
                                            <td style={{ minWidth: '180px' }}>
                                                <div style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>{s.name}</div>
                                                {s.department && (
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        {s.department}{s.year ? ` · Year ${s.year}` : ''}
                                                    </div>
                                                )}
                                            </td>
                                            <td><MatchPill pct={s.matchPercentage} /></td>
                                            <td>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-secondary)' }}>
                                                    {s.requiredScore}%
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                    {s.preferredScore}%
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                    {s.experience_years > 0 ? `${s.experience_years}y` : '0y'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="chips-group">
                                                    {s.missingSkills?.length > 0
                                                        ? s.missingSkills.map((skill, j) => (
                                                            <span key={j} className="chip chip-missing">{skill}</span>
                                                        ))
                                                        : <span className="chip chip-soft">✓ All matched</span>
                                                    }
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default RankingsPage;
