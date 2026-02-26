import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import api from '../../api/index';

const ROLE_LABELS = {
    frontend: '🖥️ Frontend',
    backend: '⚙️ Backend',
    fullstack: '🔗 Full Stack',
    data_analyst: '📊 Data Analyst',
    devops: '🛠️ DevOps',
};

const COLORS = ['#6c63ff', '#a78bfa', '#10d97a', '#3b82f6', '#f59e0b'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                fontSize: '0.82rem',
                color: 'var(--text-primary)',
            }}>
                <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{label}</div>
                {payload.map((p, i) => (
                    <div key={i} style={{ color: p.color }}>
                        {p.name}: <strong>{typeof p.value === 'number' ? `${Math.round(p.value)}%` : p.value}</strong>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function AnalyticsDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/analytics/roles');
                setData(res.data);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to load analytics.');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="spinner-wrap">
                <div className="spinner" />
                <span className="spinner-text">Loading analytics…</span>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '2rem' }}>
                <div className="alert alert-error">⚠️ {error}</div>
            </div>
        );
    }

    const { roles = {}, totalStudents = 0, distribution = [] } = data || {};

    // Bar chart data: avg readiness per role
    const barData = Object.entries(roles).map(([role, stats]) => ({
        role: ROLE_LABELS[role] || role,
        avgReadiness: stats.avgReadiness || 0,
        above70: stats.above70Count || 0,
    }));

    // Distribution histogram data
    // Map backend `label` key to `bucket` for chart dataKey
    const histData = distribution.length > 0
        ? distribution.map(d => ({ bucket: d.label || d.bucket, count: d.count }))
        : [
            { bucket: '0-20%', count: 0 },
            { bucket: '21-40%', count: 0 },
            { bucket: '41-60%', count: 0 },
            { bucket: '61-80%', count: 0 },
            { bucket: '81-100%', count: 0 },
        ];

    // Pie chart: top roles by above-70 count
    const pieData = Object.entries(roles)
        .map(([role, stats]) => ({
            name: ROLE_LABELS[role] || role,
            value: stats.above70Count || 0,
        }))
        .filter(d => d.value > 0);

    return (
        <div className="analytics-page">
            <div className="page-header">
                <h1 className="page-title">Placement Analytics Dashboard</h1>
                <p className="page-subtitle">
                    Batch-level insights on student readiness across all placement roles.
                </p>
            </div>

            {/* Summary Stats */}
            <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
                <div className="stat-card">
                    <div className="stat-value">{totalStudents}</div>
                    <div className="stat-label">Total Students</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">
                        {Object.values(roles).reduce((s, r) => s + (r.above70Count || 0), 0)}
                    </div>
                    <div className="stat-label">Students ≥70% Readiness</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">
                        {Object.keys(roles).length > 0
                            ? `${Math.round(
                                Object.values(roles).reduce((s, r) => s + (r.avgReadiness || 0), 0) /
                                Object.keys(roles).length
                            )}%`
                            : '—'}
                    </div>
                    <div className="stat-label">Overall Avg Readiness</div>
                </div>
            </div>

            {totalStudents === 0 ? (
                <div className="card empty-state">
                    <div className="empty-icon">📊</div>
                    <div className="empty-text">No student data yet. Students need to upload their resumes first.</div>
                </div>
            ) : (
                <>
                    {/* Avg Readiness Bar Chart */}
                    <div className="card" style={{ marginBottom: '1.25rem' }}>
                        <div className="section-title">📊 Average Role Readiness</div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
                            Average readiness score (%) per role across all students
                        </p>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={barData} barCategoryGap="30%">
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis
                                    dataKey="role"
                                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={v => `${v}%`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="avgReadiness" name="Avg Readiness" radius={[6, 6, 0, 0]}>
                                    {barData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Bottom Grid: Histogram + Pie */}
                    <div className="grid-2">
                        {/* Readiness Distribution Histogram */}
                        <div className="card">
                            <div className="section-title">📈 Readiness Score Distribution</div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                                Number of students per readiness bucket
                            </p>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={histData} barCategoryGap="20%">
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                    <XAxis
                                        dataKey="bucket"
                                        tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="count" name="Students" fill="#6c63ff" radius={[4, 4, 0, 0]}>
                                        {histData.map((d, i) => {
                                            const bucket = d.bucket || '';
                                            const low = parseInt(bucket);
                                            const color = low >= 60 ? '#10d97a' : low >= 40 ? '#f59e0b' : '#6c63ff';
                                            return <Cell key={i} fill={color} />;
                                        })}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Pie: Students Above 70% per Role */}
                        <div className="card">
                            <div className="section-title">🎯 High-Readiness Students by Role</div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1rem' }}>
                                Count of students with ≥70% readiness per role
                            </p>
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={85}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {pieData.map((_, i) => (
                                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend
                                            formatter={(value) => (
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{value}</span>
                                            )}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="empty-state" style={{ padding: '1.5rem 0' }}>
                                    <div className="empty-icon">📉</div>
                                    <div className="empty-text">No students have ≥70% readiness yet.</div>
                                </div>
                            )}

                            {/* Role table summary */}
                            <div style={{ marginTop: '0.75rem' }}>
                                {Object.entries(roles).map(([role, stats]) => (
                                    <div key={role} className="progress-bar-wrap" style={{ marginBottom: '0.5rem' }}>
                                        <span className="progress-label">{ROLE_LABELS[role] || role}</span>
                                        <div className="progress-track">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${Math.min(stats.avgReadiness || 0, 100)}%` }}
                                            />
                                        </div>
                                        <span className="progress-pct">{stats.above70Count || 0}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
