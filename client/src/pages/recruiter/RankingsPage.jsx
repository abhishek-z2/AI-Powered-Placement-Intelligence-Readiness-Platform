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

export default function RankingsPage() {
    const navigate = useNavigate();
    const [jd, setJd] = useState(null);
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const storedJD = sessionStorage.getItem('currentJD');
        if (storedJD) {
            const parsed = JSON.parse(storedJD);
            setJd(parsed);
        }
    }, []);

    useEffect(() => {
        if (!jd) return;
        fetchRankings(jd);
    }, [jd]);

    const fetchRankings = async (jdData) => {
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/recruiter/rankings', { jd: jdData });
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
                <>
                    {rankings.length === 0 ? (
                        <div className="card empty-state">
                            <div className="empty-icon">🔍</div>
                            <div className="empty-text">No students in the system yet. Ask students to upload their resumes first.</div>
                        </div>
                    ) : (
                        <div className="card">
                            <div className="rankings-meta" style={{ marginBottom: '1rem' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                    {rankings.length} candidate{rankings.length !== 1 ? 's' : ''} ranked
                                </span>
                            </div>
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Rank</th>
                                            <th>Candidate</th>
                                            <th>Match %</th>
                                            <th>Req. Match</th>
                                            <th>Pref. Match</th>
                                            <th>Experience</th>
                                            <th>Missing Skills</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rankings.map((s, i) => (
                                            <tr key={s.id}>
                                                <td><RankBadge rank={i + 1} /></td>
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                                                    {s.department && (
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                            {s.department}{s.year ? ` · Year ${s.year}` : ''}
                                                        </div>
                                                    )}
                                                </td>
                                                <td><MatchPill pct={s.matchPercentage} /></td>
                                                <td>
                                                    <span style={{
                                                        color: s.requiredScore >= 70 ? 'var(--accent-green)' : s.requiredScore >= 40 ? 'var(--accent-orange)' : 'var(--accent-red)',
                                                        fontWeight: 600,
                                                        fontSize: '0.85rem'
                                                    }}>
                                                        {s.requiredScore}%
                                                    </span>
                                                </td>
                                                <td>
                                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                        {s.preferredScore}%
                                                    </span>
                                                </td>
                                                <td>
                                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                        {s.experience_years > 0 ? `${s.experience_years}y` : 'Fresher'}
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
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
