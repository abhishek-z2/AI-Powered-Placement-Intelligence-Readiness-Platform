import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/index';

export default function UploadJDPage() {
    const [jdText, setJdText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [jd, setJd] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (!jdText.trim()) return;
        setLoading(true);
        setError('');
        setJd(null);
        try {
            const res = await api.post('/recruiter/upload-jd', { jdText });
            setJd(res.data.jd);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to extract JD. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewRankings = () => {
        // Pass JD via sessionStorage so rankings page can read it
        sessionStorage.setItem('currentJD', JSON.stringify(jd));
        navigate('/recruiter/rankings');
    };

    return (
        <div className="jd-upload-page">
            <div className="page-header">
                <h1 className="page-title">Upload Job Description</h1>
                <p className="page-subtitle">
                    Paste a job description and our AI will extract the role requirements to rank candidates.
                </p>
            </div>

            {error && <div className="alert alert-error">⚠️ {error}</div>}

            <div className="grid-2" style={{ alignItems: 'start' }}>
                {/* Input Panel */}
                <div className="card">
                    <div className="section-title">📋 Job Description Text</div>
                    <textarea
                        id="jd-textarea"
                        rows={16}
                        placeholder="Paste the full job description here…

Example:
We are looking for a Frontend Engineer with 2+ years of experience in React, JavaScript, and CSS. Experience with TypeScript and REST APIs is a plus. Strong communication skills required."
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                        style={{ marginBottom: '1rem' }}
                    />
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={!jdText.trim() || loading}
                            id="jd-extract-btn"
                        >
                            {loading ? (
                                <><span className="btn-spinner" /> Extracting…</>
                            ) : (
                                <>🤖 Extract with AI</>
                            )}
                        </button>
                        {jdText && (
                            <button className="btn btn-secondary" onClick={() => { setJdText(''); setJd(null); }}>
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Extracted JD Panel */}
                <div className="card">
                    <div className="section-title">🎯 Extracted Job Details</div>
                    {loading && (
                        <div className="spinner-wrap" style={{ padding: '2rem' }}>
                            <div className="spinner" />
                            <span className="spinner-text">Gemini is analyzing the JD…</span>
                        </div>
                    )}

                    {!loading && !jd && (
                        <div className="empty-state">
                            <div className="empty-icon">🔍</div>
                            <div className="empty-text">Extracted requirements will appear here after you submit the JD.</div>
                        </div>
                    )}

                    {jd && (
                        <div className="jd-result">
                            <div className="jd-role-badge">
                                <span className="jd-role-label">Role</span>
                                <span className="jd-role-value">{jd.role || 'Not specified'}</span>
                            </div>

                            <div className="jd-section">
                                <div className="jd-field-label">⚡ Required Skills</div>
                                <div className="chips-group">
                                    {jd.required_skills?.length > 0
                                        ? jd.required_skills.map((s, i) => (
                                            <span key={i} className="chip chip-tech">{s}</span>
                                        ))
                                        : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None listed</span>
                                    }
                                </div>
                            </div>

                            <div className="jd-section">
                                <div className="jd-field-label">✨ Preferred Skills</div>
                                <div className="chips-group">
                                    {jd.preferred_skills?.length > 0
                                        ? jd.preferred_skills.map((s, i) => (
                                            <span key={i} className="chip chip-soft">{s}</span>
                                        ))
                                        : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None listed</span>
                                    }
                                </div>
                            </div>

                            <div className="jd-section">
                                <div className="jd-field-label">📅 Minimum Experience</div>
                                <span className="chip chip-role">
                                    {jd.min_experience_years > 0 ? `${jd.min_experience_years} year(s)` : 'Not specified'}
                                </span>
                            </div>

                            <div style={{ marginTop: '1.5rem' }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleViewRankings}
                                    id="view-rankings-btn"
                                    style={{ width: '100%', justifyContent: 'center' }}
                                >
                                    📊 View Candidate Rankings →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
