const roleSkillMap = require('../utils/roleSkillMap');

/**
 * Compute role-wise readiness for a single student.
 * Returns an object like: { frontend: 0.75, backend: 0.4, ... }
 */
function computeRoleReadiness(technicalSkills = []) {
    const studentSkills = new Set(technicalSkills.map(s => s.toLowerCase().trim()));
    const readiness = {};

    for (const [role, requiredSkills] of Object.entries(roleSkillMap)) {
        const matched = requiredSkills.filter(s => studentSkills.has(s)).length;
        readiness[role] = requiredSkills.length > 0 ? matched / requiredSkills.length : 0;
    }

    return readiness;
}

/**
 * Compute the overall readiness score for a student (average across all roles).
 */
function computeOverallReadiness(technicalSkills = []) {
    const readiness = computeRoleReadiness(technicalSkills);
    const values = Object.values(readiness);
    if (values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Deterministic ranking engine.
 * Ranks students against a structured JD.
 * Gemini is NOT involved here.
 */
function rankStudents(students, jd) {
    const { required_skills = [], preferred_skills = [], min_experience_years = 0 } = jd;

    const normalizedRequired = required_skills.map(s => s.toLowerCase().trim());
    const normalizedPreferred = preferred_skills.map(s => s.toLowerCase().trim());

    const ranked = students.map(student => {
        const studentSkills = new Set((student.technical_skills || []).map(s => s.toLowerCase().trim()));

        // Required skills match ratio
        const matchedRequired = normalizedRequired.filter(s => studentSkills.has(s)).length;
        const requiredScore = normalizedRequired.length > 0 ? matchedRequired / normalizedRequired.length : 1;

        // Preferred skills match ratio
        const matchedPreferred = normalizedPreferred.filter(s => studentSkills.has(s)).length;
        const preferredScore = normalizedPreferred.length > 0 ? matchedPreferred / normalizedPreferred.length : 1;

        // Experience score
        const studentExp = student.experience_years || 0;
        const experienceScore = min_experience_years > 0
            ? Math.min(studentExp / min_experience_years, 1)
            : 1;

        // Weighted final score
        const finalScore = (requiredScore * 0.6) + (preferredScore * 0.2) + (experienceScore * 0.2);

        // Missing required skills
        const missingSkills = normalizedRequired.filter(s => !studentSkills.has(s));

        return {
            id: student.id,
            name: student.name,
            department: student.department,
            year: student.year,
            experience_years: studentExp,
            technical_skills: student.technical_skills,
            finalScore: Math.round(finalScore * 100) / 100,
            matchPercentage: Math.round(finalScore * 100),
            missingSkills,
            requiredScore: Math.round(requiredScore * 100),
            preferredScore: Math.round(preferredScore * 100),
            experienceScore: Math.round(experienceScore * 100),
        };
    });

    return ranked.sort((a, b) => b.finalScore - a.finalScore);
}

module.exports = { computeRoleReadiness, computeOverallReadiness, rankStudents };
