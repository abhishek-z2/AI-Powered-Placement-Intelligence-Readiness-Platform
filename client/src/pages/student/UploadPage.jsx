import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/index';

export default function UploadPage() {
    const [file, setFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef();
    const navigate = useNavigate();

    const handleFile = (f) => {
        if (!f) return;
        if (f.type !== 'application/pdf') {
            setError('Only PDF files are supported.');
            return;
        }
        setError('');
        setFile(f);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const handleSubmit = async () => {
        if (!file) return;
        setLoading(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('resume', file);
            const res = await api.post('/students/upload-resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            navigate(`/student/dashboard/${res.data.student.id}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Upload failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="upload-page">
            <div className="page-header">
                <h1 className="page-title">Upload Your Resume</h1>
                <p className="page-subtitle">
                    Our system will extract your skills, projects and build your placement profile instantly.
                </p>
            </div>

            {error && <div className="alert alert-error">⚠️ {error}</div>}

            <div className="upload-card card">
                <div
                    className={`upload-zone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
                    onClick={() => fileInputRef.current.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFile(e.target.files[0])}
                    />
                    {file ? (
                        <>
                            <div className="upload-icon">📄</div>
                            <div className="upload-text file-name">{file.name}</div>
                            <div className="upload-hint">{(file.size / 1024).toFixed(1)} KB · Click to change</div>
                        </>
                    ) : (
                        <>
                            <div className="upload-icon">☁️</div>
                            <div className="upload-text">Drag & drop your PDF here</div>
                            <div className="upload-hint">or click to browse · PDF only · Max 10MB</div>
                        </>
                    )}
                </div>

                <div className="upload-actions">
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={!file || loading}
                        id="upload-submit-btn"
                    >
                        {loading ? (
                            <>
                                <span className="btn-spinner" />
                                Analyzing...
                            </>
                        ) : (
                            <>⚡ Analyze Resume</>
                        )}
                    </button>
                    {file && (
                        <button
                            className="btn btn-secondary"
                            onClick={() => setFile(null)}
                        >
                            Remove
                        </button>
                    )}
                </div>

                <div className="upload-features">
                    <div className="feature-item">
                        <span className="feature-icon">⚡</span>
                        <div>
                            <div className="feature-title">Skill Extraction</div>
                            <div className="feature-desc">Our system identifies your technical and soft skills automatically</div>
                        </div>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">📊</span>
                        <div>
                            <div className="feature-title">Role Readiness Score</div>
                            <div className="feature-desc">See how ready you are for Frontend, Backend, Data Analyst roles</div>
                        </div>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">🎯</span>
                        <div>
                            <div className="feature-title">Interview Prep</div>
                            <div className="feature-desc">Get tailored interview questions based on your profile</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
