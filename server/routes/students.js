const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const router = express.Router();
const pool = require('../db/pool');
const { extractResumeData, generateInterviewQuestions } = require('../services/geminiService');
const { normalizeSkills } = require('../utils/normalizeSkills');
const { computeRoleReadiness, computeOverallReadiness } = require('../services/rankingService');

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
router.post('/upload-resume', upload.single('resume'), async (req, res) => {
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

        // Normalize skills
        const technicalSkills = normalizeSkills(extracted.technical_skills || []);
        const softSkills = normalizeSkills(extracted.soft_skills || []);
        const suggestedRoles = (extracted.suggested_roles || []).map(r => r.toLowerCase().trim());

        // Compute readiness score
        const overallReadiness = computeOverallReadiness(technicalSkills);

        // Fix: Ensure year and experience_years are valid numbers (not undefined/null strings)
        const yearValue = extracted.year ? parseInt(extracted.year, 10) : null;
        const experienceValue = extracted.experience_years ? parseFloat(extracted.experience_years) : 0;

        // Insert student into DB
        const studentResult = await pool.query(
            `INSERT INTO students (name, department, year, experience_years, technical_skills, soft_skills, readiness_score, suggested_roles)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [
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
                [student.id, project.name || '', normalizeSkills(project.tech_stack || []), project.description || '']
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

// GET /students — list all students
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM students ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /students/:id — get student by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const studentResult = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
        if (studentResult.rows.length === 0) return res.status(404).json({ error: 'Student not found' });

        const student = studentResult.rows[0];
        const projectsResult = await pool.query('SELECT * FROM projects WHERE student_id = $1', [id]);
        const roleReadiness = computeRoleReadiness(student.technical_skills || []);

        res.json({ ...student, roleReadiness, projects: projectsResult.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /students/:id/interview-questions
router.post('/:id/interview-questions', async (req, res) => {
    try {
        const { id } = req.params;
        const studentResult = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
        if (studentResult.rows.length === 0) return res.status(404).json({ error: 'Student not found' });

        const student = studentResult.rows[0];
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
