const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { extractJDData } = require('../services/geminiService');
const { normalizeSkills } = require('../utils/normalizeSkills');
const { rankStudents } = require('../services/rankingService');

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
            required_skills: normalizeSkills(extracted.required_skills || []),
            preferred_skills: normalizeSkills(extracted.preferred_skills || []),
            min_experience_years: extracted.min_experience_years || 0,
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
        const { jd } = req.body;
        if (!jd || !jd.role) {
            return res.status(400).json({ error: 'Valid JD object is required in request body' });
        }

        // Fetch all students
        const studentsResult = await pool.query('SELECT * FROM students');
        const students = studentsResult.rows;

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
