const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const roleSkillMap = require('../utils/roleSkillMap');
const { computeRoleReadiness } = require('../services/rankingService');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

// Apply authentication to all analytics routes
router.use(authenticate);
router.use(requireRole('officer'));

// GET /analytics/roles
router.get('/roles', async (req, res) => {
    try {
        const { departmentId } = req.query;

        // Fetch students, optionally filtered by department
        let query = 'SELECT * FROM students';
        const params = [];
        if (departmentId) {
            query += ' WHERE department_id = $1';
            params.push(departmentId);
        }

        const studentsResult = await pool.query(query, params);
        const students = studentsResult.rows;

        // Get department list for comparison
        const deptResult = await pool.query('SELECT * FROM departments');
        const departments = deptResult.rows;

        if (students.length === 0) {
            return res.json({
                totalStudents: 0,
                roles: {},
                distribution: [],
                departments,
                topMissingSkills: []
            });
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

        // Readiness distribution buckets (defined before loop used)
        const buckets = [
            { label: '0-20%', min: 0, max: 20, count: 0 },
            { label: '21-40%', min: 21, max: 40, count: 0 },
            { label: '41-60%', min: 41, max: 60, count: 0 },
            { label: '61-80%', min: 61, max: 80, count: 0 },
            { label: '81-100%', min: 81, max: 100, count: 0 },
        ];

        const getMedian = (arr) => {
            if (arr.length === 0) return 0;
            const s = [...arr].sort((a, b) => a - b);
            const mid = Math.floor(s.length / 2);
            return s.length % 2 !== 0 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
        };

        let totalReadyStudents = 0;
        for (const student of students) {
            const readiness = computeRoleReadiness(student.technical_skills || []);
            let isStudentReady = false;

            for (const [role, score] of Object.entries(readiness)) {
                if (roleAnalytics[role]) {
                    // Only include in score list if they have some potential (score > 0.05)
                    if (score > 0.05) {
                        roleAnalytics[role].scores.push(Math.round(score * 100));
                    }

                    if (score >= 0.7) {
                        roleAnalytics[role].above70Count++;
                        isStudentReady = true;
                    }
                }
            }
            if (isStudentReady) totalReadyStudents++;

            // Dynamic distribution based on BEST role match (readiness_score)
            const maxScore = Math.round((student.readiness_score || 0) * 100);
            for (const bucket of buckets) {
                if (maxScore >= bucket.min && maxScore <= bucket.max) {
                    bucket.count++;
                    break;
                }
            }
        }

        // Compute medians
        for (const role of Object.keys(roleAnalytics)) {
            const scores = roleAnalytics[role].scores;
            roleAnalytics[role].medianReadiness = getMedian(scores);
            delete roleAnalytics[role].scores;
        }

        // Department Breakdown
        const deptBreakdown = departments.map(d => {
            const deptStudents = students.filter(s => s.department_id === d.id);
            const scores = deptStudents.map(s => Math.round((s.readiness_score || 0) * 100));
            const medianReadiness = getMedian(scores);

            return {
                id: d.id,
                name: d.name,
                count: deptStudents.length,
                medianScore: medianReadiness
            };
        });

        // Top missing skills
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

        // Academic Eligibility Summary
        const cleanExitStudents = students.filter(s => (s.backlogs ?? 0) === 0);
        const highPerformers = students.filter(s => (s.cgpa || 0) >= 8.5);

        const avgCgpa = students.length > 0
            ? Math.round(students.reduce((acc, s) => acc + (parseFloat(s.cgpa) || 0), 0) / students.length * 100) / 100
            : 0;

        console.log('Role Analytics Data:', JSON.stringify(roleAnalytics, null, 2));
        res.json({
            totalStudents: students.length,
            roles: roleAnalytics,
            distribution: buckets,
            departments: deptBreakdown,
            eligibility: {
                noBacklogs: cleanExitStudents.length,
                highCgpa: highPerformers.length,
                avgCgpa
            },
            totalReadyStudents,
            topMissingSkills,
        });
    } catch (err) {
        console.error('Analytics error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
