import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import api from '../../api/index';

const ROLE_LABELS = {
    // TECH
    frontend: '🖥️ Frontend',
    backend: '⚙️ Backend',
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

const COLORS = ['#6c63ff', '#a78bfa', '#10d97a', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

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
                        {p.name}: <strong>{typeof p.value === 'number' ? (p.name.includes('Count') || p.name.includes('Students') ? p.value : `${Math.round(p.value)}%`) : p.value}</strong>
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
    const [selectedDeptId, setSelectedDeptId] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, [selectedDeptId]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await api.get('/analytics/roles', {
                params: { departmentId: selectedDeptId || undefined }
            });
            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load analytics.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !data) {
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

    const { roles = {}, totalStudents = 0, distribution = [], departments = [] } = data || {};

    // Bar chart data: median readiness per role
    const barData = Object.entries(roles)
        .map(([role, stats]) => ({
            role: ROLE_LABELS[role] ? ROLE_LABELS[role].replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim() : role,
            medianReadiness: stats.medianReadiness || 0,
            above70: stats.above70Count || 0,
        }))
        .filter(d => d.medianReadiness > 0);

    // Distribution histogram data
    const histData = distribution.length > 0
        ? distribution.map(d => ({ bucket: d.label || d.bucket, count: d.count }))
        : [
            { bucket: '0-20%', count: 0 },
            { bucket: '21-40%', count: 0 },
            { bucket: '41-60%', count: 0 },
            { bucket: '61-80%', count: 0 },
            { bucket: '81-100%', count: 0 },
        ];

    // Pie chart: top roles by above-70 count (filtered to > 0)
    const pieData = Object.entries(roles)
        .map(([role, stats]) => ({
            name: ROLE_LABELS[role] ? ROLE_LABELS[role].replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim() : role,
            value: stats.above70Count || 0,
        }))
        .filter(d => d.value > 0);

    return (
        <div className="analytics-page">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Placement Analytics Dashboard</h1>
                    <p className="page-subtitle">
                        Batch-level insights on student readiness across departments.
                    </p>
                </div>
                <div className="dept-filter-wrap card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Department:</label>
                    <select
                        value={selectedDeptId}
                        onChange={(e) => setSelectedDeptId(e.target.value)}
                        style={{
                            padding: '0.4rem 0.75rem',
                            borderRadius: '6px',
                            border: '1px solid var(--border)',
                            background: 'var(--bg-card)', // Darker background for contrast
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem',
                            outline: 'none',
                        }}
                    >
                        <option value="" style={{ background: '#1a1a2e', color: '#fff' }}>All Departments</option>
                        {departments.map(d => (
                            <option key={d.id} value={d.id} style={{ background: '#1a1a2e', color: '#fff' }}>{d.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
                <div className="stat-card">
                    <div className="stat-value">{totalStudents}</div>
                    <div className="stat-label">Total Students</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">
                        {data.totalReadyStudents || 0}
                    </div>
                    <div className="stat-label">Students Ready (≥70%)</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{data.eligibility?.noBacklogs || 0}</div>
                    <div className="stat-label">Zero Backlog Students</div>
                </div>
            </div>

            <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
                <div className="stat-card" style={{ background: 'rgba(16, 217, 122, 0.05)' }}>
                    <div className="stat-value" style={{ fontSize: '1.5rem' }}>{data.eligibility?.avgCgpa || 0}</div>
                    <div className="stat-label">Avg CGPA</div>
                </div>
                <div className="stat-card" style={{ background: 'rgba(108, 99, 255, 0.05)' }}>
                    <div className="stat-value" style={{ fontSize: '1.5rem' }}>{data.eligibility?.highCgpa || 0}</div>
                    <div className="stat-label">High CGPA (≥8.5)</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ fontSize: '1.5rem' }}>
                        {Object.keys(roles).length > 0
                            ? `${Math.round(
                                Object.values(roles).reduce((s, r) => s + (r.medianReadiness || 0), 0) /
                                Math.max(Object.keys(roles).filter(r => roles[r].medianReadiness > 0).length, 1)
                            )}%`
                            : '—'}
                    </div>
                    <div className="stat-label">Median Readiness</div>
                </div>
            </div>

            {totalStudents === 0 ? (
                <div className="card empty-state">
                    <div className="empty-icon">📊</div>
                    <div className="empty-text">No student data found for the selected filters.</div>
                </div>
            ) : (
                <>
                    {/* Median Readiness Bar Chart */}
                    <div className="card" style={{ marginBottom: '1.25rem' }}>
                        <div className="section-title">📊 Median Role Readiness</div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
                            Median readiness score (%) per role (excluding outliers)
                        </p>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={barData} barCategoryGap="20%" margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis
                                    dataKey="role"
                                    tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
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
                                <Bar dataKey="medianReadiness" name="Median Readiness" radius={[6, 6, 0, 0]}>
                                    {barData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Department Breakdown Table (Only shown if viewing "All Departments") */}
                    {!selectedDeptId && (
                        <div className="card" style={{ marginBottom: '1.25rem' }}>
                            <div className="section-title">🏢 Departmental Performance</div>
                            <div className="table-wrap" style={{ marginTop: '1rem' }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Department</th>
                                            <th>Students</th>
                                            <th>Median Score</th>
                                            <th>Performance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {departments.filter(d => d.count > 0).map(d => (
                                            <tr key={d.id}>
                                                <td style={{ fontWeight: 600 }}>{d.name}</td>
                                                <td>{d.count}</td>
                                                <td>
                                                    <span style={{ fontWeight: 600, color: d.medianScore >= 60 ? 'var(--accent-green)' : d.medianScore >= 40 ? 'var(--accent-orange)' : 'var(--accent-red)' }}>
                                                        {d.medianScore}%
                                                    </span>
                                                </td>
                                                <td style={{ minWidth: '150px' }}>
                                                    <div className="progress-track" style={{ height: '8px' }}>
                                                        <div
                                                            className="progress-fill"
                                                            style={{
                                                                width: `${d.medianScore}%`,
                                                                background: d.medianScore >= 60 ? 'var(--accent-green)' : d.medianScore >= 40 ? 'var(--accent-orange)' : 'var(--accent-red)'
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Bottom Grid: Histogram + Pie */}
                    <div className="grid-2">
                        {/* Readiness Distribution Histogram */}
                        <div className="card">
                            <div className="section-title">📈 Readiness Distribution</div>
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
                            <div className="section-title">🎯 Ready Talent by Role</div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1rem' }}>
                                Students with ≥70% score per role
                            </p>
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={280}>
                                    <PieChart margin={{ top: 0, bottom: 20 }}>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="45%"
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
                                            iconType="circle"
                                            verticalAlign="bottom"
                                            height={36}
                                            wrapperStyle={{ paddingTop: '20px' }}
                                            formatter={(value) => (
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', paddingRight: '10px' }}>{value}</span>
                                            )}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="empty-state" style={{ padding: '1.5rem 0' }}>
                                    <div className="empty-icon">📉</div>
                                    <div className="empty-text">No students have reached ≥70% readiness.</div>
                                </div>
                            )}

                            {/* Top Skills Missing Section can be added here if needed */}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
