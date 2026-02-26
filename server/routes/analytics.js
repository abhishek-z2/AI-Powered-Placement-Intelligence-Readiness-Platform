const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const roleSkillMap = require('../utils/roleSkillMap');
const { computeRoleReadiness } = require('../services/rankingService');

// GET /analytics/roles
router.get('/roles', async (req, res) => {
    try {
        const studentsResult = await pool.query('SELECT * FROM students');
        const students = studentsResult.rows;

        if (students.length === 0) {
            return res.json({ totalStudents: 0, roles: {}, distribution: [] });
        }

        // Build role analytics
        const roleAnalytics = {};
        for (const role of Object.keys(roleSkillMap)) {
            roleAnalytics[role] = {
                role,
                totalStudents: students.length,
                scores: [],
                avgReadiness: 0,
                above70Count: 0,
            };
        }

        for (const student of students) {
            const readiness = computeRoleReadiness(student.technical_skills || []);
            for (const [role, score] of Object.entries(readiness)) {
                if (roleAnalytics[role]) {
                    roleAnalytics[role].scores.push(Math.round(score * 100));
                    if (score >= 0.7) roleAnalytics[role].above70Count++;
                }
            }
        }

        // Compute averages
        for (const role of Object.keys(roleAnalytics)) {
            const scores = roleAnalytics[role].scores;
            roleAnalytics[role].avgReadiness =
                scores.length > 0
                    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                    : 0;
            delete roleAnalytics[role].scores; // clean up raw scores
        }

        // Readiness distribution (buckets: 0-20, 21-40, 41-60, 61-80, 81-100)
        const buckets = [
            { label: '0-20%', min: 0, max: 20, count: 0 },
            { label: '21-40%', min: 21, max: 40, count: 0 },
            { label: '41-60%', min: 41, max: 60, count: 0 },
            { label: '61-80%', min: 61, max: 80, count: 0 },
            { label: '81-100%', min: 81, max: 100, count: 0 },
        ];

        for (const student of students) {
            const score = Math.round((student.readiness_score || 0) * 100);
            for (const bucket of buckets) {
                if (score >= bucket.min && score <= bucket.max) {
                    bucket.count++;
                    break;
                }
            }
        }

        // Top missing skills (skills least covered across all students vs all roles)
        const allRoleSkills = [...new Set(Object.values(roleSkillMap).flat())];
        const skillCoverage = {};
        for (const skill of allRoleSkills) {
            const covered = students.filter(s =>
                (s.technical_skills || []).map(x => x.toLowerCase()).includes(skill)
            ).length;
            skillCoverage[skill] = covered;
        }

        const topMissingSkills = Object.entries(skillCoverage)
            .sort((a, b) => a[1] - b[1])
            .slice(0, 8)
            .map(([skill, count]) => ({
                skill,
                studentsWithSkill: count,
                studentsWithout: students.length - count,
            }));

        res.json({
            totalStudents: students.length,
            roles: roleAnalytics,
            distribution: buckets,
            topMissingSkills,
        });
    } catch (err) {
        console.error('Analytics error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
