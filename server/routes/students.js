const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const router = express.Router();
const pool = require('../db/pool');
const { extractResumeData, generateInterviewQuestions } = require('../services/geminiService');
const { normalizeForStorage } = require('../utils/skillOntology');
const { computeRoleReadiness, computeOverallReadiness } = require('../services/rankingService');
const { authenticate } = require('../middleware/authMiddleware');

// Multer — store file in memory for pdf-parse
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files are allowed'), false);
    },
});

// POST /students/upload-resume
router.post('/upload-resume', authenticate, upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded' });

        // Extract text from PDF
        const pdfData = await pdfParse(req.file.buffer);
        const resumeText = pdfData.text;

        if (!resumeText || resumeText.trim().length < 50) {
            return res.status(400).json({ error: 'Could not extract enough text from PDF' });
        }

        // Extract structured data via Gemini
        const extracted = await extractResumeData(resumeText);

        // Normalize skills for storage in DB (lowercase, trim, normalize special chars)
        const technicalSkills = (extracted.technical_skills || []).map(normalizeForStorage);
        const softSkills = (extracted.soft_skills || []).map(normalizeForStorage);
        const suggestedRoles = (extracted.suggested_roles || []).map(r => r.toLowerCase().trim());

        // Compute readiness score
        const overallReadiness = computeOverallReadiness(technicalSkills);

        // Fix: Ensure year and experience_years are valid numbers (not undefined/null strings)
        const yearValue = extracted.year ? parseInt(extracted.year, 10) : null;
        const experienceValue = extracted.experience_years ? parseFloat(extracted.experience_years) : 0;

        // Insert student into DB with user_id from authenticated user
        const studentResult = await pool.query(
            `INSERT INTO students (user_id, name, department, year, experience_years, technical_skills, soft_skills, readiness_score, suggested_roles)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [
                req.user.userId,
                extracted.name || 'Unknown',
                extracted.department || '',
                yearValue,
                experienceValue,
                technicalSkills,
                softSkills,
                overallReadiness,
                suggestedRoles,
            ]
        );
        const student = studentResult.rows[0];

        // Insert projects
        const projects = extracted.projects || [];
        for (const project of projects) {
            await pool.query(
                `INSERT INTO projects (student_id, name, tech_stack, description) VALUES ($1, $2, $3, $4)`,
                [student.id, project.name || '', (project.tech_stack || []).map(normalizeForStorage), project.description || '']
            );
        }

        // Fetch inserted projects
        const projectsResult = await pool.query('SELECT * FROM projects WHERE student_id = $1', [student.id]);

        // Compute role readiness breakdown
        const roleReadiness = computeRoleReadiness(technicalSkills);

        res.status(201).json({
            student: {
                ...student,
                roleReadiness,
                projects: projectsResult.rows,
            },
        });
    } catch (err) {
        console.error('Upload resume error:', err.message);
        res.status(500).json({ error: err.message || 'Failed to process resume' });
    }
});

// GET /students/my-history — get all assessments for current logged-in student
router.get('/my-history', authenticate, async (req, res) => {
    try {
        const historyResult = await pool.query(
            'SELECT * FROM students WHERE user_id = $1 ORDER BY created_at ASC',
            [req.user.userId]
        );
        const history = historyResult.rows;

        // Fetch active_assessment_id for the user
        const userResult = await pool.query('SELECT active_assessment_id FROM users WHERE id = $1', [req.user.userId]);
        const activeId = userResult.rows[0]?.active_assessment_id;

        // Calculate growth: compare current score with previous score in chronological order
        const enhancedHistory = history.map((curr, idx) => {
            const prev = idx > 0 ? history[idx - 1] : null;
            const growth = prev ? Math.round((curr.readiness_score - prev.readiness_score) * 100) : 0;
            return {
                ...curr,
                growth,
                isActive: curr.id === activeId
            };
        });

        // Return most recent first for the table, but with growth data computed
        res.json(enhancedHistory.reverse());
    } catch (err) {
        console.error('History error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// POST /students/set-active — set which assessment recruiters see
router.post('/set-active', authenticate, async (req, res) => {
    try {
        const { assessmentId } = req.body;
        // Verify ownership
        const check = await pool.query('SELECT user_id FROM students WHERE id = $1', [assessmentId]);
        if (check.rows.length === 0) return res.status(404).json({ error: 'Assessment not found' });
        if (check.rows[0].user_id !== req.user.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await pool.query('UPDATE users SET active_assessment_id = $1 WHERE id = $2', [assessmentId, req.user.userId]);
        res.json({ message: 'Active resume updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /students/:id — delete a specific assessment
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        // Verify ownership (only if student role, admins might be allowed but let's stick to student for now)
        if (req.user.role === 'student') {
            const check = await pool.query('SELECT user_id FROM students WHERE id = $1', [id]);
            if (check.rows.length === 0) return res.status(404).json({ error: 'Assessment not found' });
            if (check.rows[0].user_id !== req.user.userId) {
                return res.status(403).json({ error: 'Unauthorized to delete this' });
            }
        }

        await pool.query('DELETE FROM students WHERE id = $1', [id]);
        res.json({ message: 'Assessment deleted successfully' });
    } catch (err) {
        console.error('Delete error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET /students — list all students (for admins/officers)
router.get('/', authenticate, async (req, res) => {
    try {
        // Simple role check for officer/admin
        if (req.user.role === 'student') {
            return res.status(403).json({ error: 'Access denied' });
        }
        const result = await pool.query('SELECT * FROM students ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /students/:id — get student by ID
router.get('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const studentResult = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
        if (studentResult.rows.length === 0) return res.status(404).json({ error: 'Student not found' });

        const student = studentResult.rows[0];

        // Ownership check for students
        if (req.user.role === 'student' && student.user_id !== req.user.userId) {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        const projectsResult = await pool.query('SELECT * FROM projects WHERE student_id = $1', [id]);
        const roleReadiness = computeRoleReadiness(student.technical_skills || []);

        res.json({ ...student, roleReadiness, projects: projectsResult.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /students/:id/interview-questions
router.post('/:id/interview-questions', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const studentResult = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
        if (studentResult.rows.length === 0) return res.status(404).json({ error: 'Student not found' });

        const student = studentResult.rows[0];

        // Ownership check
        if (req.user.role === 'student' && student.user_id !== req.user.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const questions = await generateInterviewQuestions(
            student.name,
            student.technical_skills || [],
            student.suggested_roles || []
        );

        res.json({ questions });
    } catch (err) {
        console.error('Interview questions error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
