const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { extractJDData } = require('../services/geminiService');
const { normalizeForStorage } = require('../utils/skillOntology');
const { rankStudents } = require('../services/rankingService');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

// Apply authentication to all recruiter routes
router.use(authenticate);
router.use(requireRole('recruiter'))

// POST /recruiter/upload-jd
router.post('/upload-jd', async (req, res) => {
    try {
        const { jdText } = req.body;
        if (!jdText || jdText.trim().length < 20) {
            return res.status(400).json({ error: 'Job description text is required' });
        }

        const extracted = await extractJDData(jdText);

        const jd = {
            role: extracted.role || 'Unknown Role',
            required_skills: (extracted.required_skills || []).map(normalizeForStorage),
            preferred_skills: (extracted.preferred_skills || []).map(normalizeForStorage),
            min_experience_years: extracted.min_experience_years || 0,
            min_cgpa: extracted.min_cgpa || null,
            allow_backlogs: extracted.allow_backlogs !== undefined ? extracted.allow_backlogs : true,
        };

        res.json({ jd });
    } catch (err) {
        console.error('JD upload error:', err.message);
        res.status(500).json({ error: err.message || 'Failed to process job description' });
    }
});

// POST /recruiter/rankings  (POST so JD can be sent in body)
router.post('/rankings', async (req, res) => {
    try {
        const { jd, departmentId, minCgpa, allowBacklogs } = req.body;
        if (!jd || !jd.role) {
            return res.status(400).json({ error: 'Valid JD object is required in request body' });
        }

        // Build parameters and conditions
        const params = [];
        let conditions = "WHERE u.role = 'student'";

        if (departmentId) {
            params.push(departmentId);
            conditions += ` AND u.department_id = $${params.length}`;
        }

        // Fetch students but only their ACTIVE assessment
        let query = `
            WITH active_ids AS (
                SELECT 
                    u.id as user_id, 
                    COALESCE(u.active_assessment_id, (SELECT id FROM students s2 WHERE s2.user_id = u.id ORDER BY created_at DESC LIMIT 1)) as target_id
                FROM users u
                ${conditions}
            )
            SELECT s.* 
            FROM students s
            JOIN active_ids ai ON s.id = ai.target_id
        `;

        const studentsResult = await pool.query(query, params);
        let students = studentsResult.rows;

        // Apply global filters (CGPA and Backlogs)
        if (minCgpa) {
            students = students.filter(s => (s.cgpa || 0) >= parseFloat(minCgpa));
        }
        if (allowBacklogs === false) {
            students = students.filter(s => (s.backlogs ?? 0) === 0);
        }

        if (students.length === 0) {
            return res.json({ rankings: [], jd });
        }

        const rankings = rankStudents(students, jd);

        res.json({ jd, rankings });
    } catch (err) {
        console.error('Rankings error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
