const roleSkillMap = require('../utils/roleSkillMap');
const { computeScore, normalizeSkill, getBestWeight } = require('../utils/skillOntology');

/**
 * Compute role-wise readiness for a single student.
 * Returns an object like: { frontend: 0.75, backend: 0.4, ... }
 */
function computeRoleReadiness(technicalSkills = []) {
    const { getBestWeight, normalizeSkill } = require('../utils/skillOntology');
    const studentSkills = (technicalSkills || []).map(s => normalizeSkill(s));
    const readiness = {};

    for (const [role, requiredSkills] of Object.entries(roleSkillMap)) {
        let totalWeight = 0;

        // Sum up the best weight for each required skill in the role
        for (const req of requiredSkills) {
            totalWeight += getBestWeight(req, studentSkills);
        }

        // Apply a small saturation factor: if you have 80% coverage, we treat it as 100% role-ready
        // This stops "overqualified" people from being penalized by missing one niche tag.
        const saturationPoint = Math.max(requiredSkills.length * 0.8, 1);
        readiness[role] = Math.min(totalWeight / saturationPoint, 1.0);
    }

    return readiness;
}

/**
 * Compute the overall readiness score for a student (best score across all roles).
 */
function computeOverallReadiness(technicalSkills = []) {
    const readiness = computeRoleReadiness(technicalSkills);
    const values = Object.values(readiness);
    if (values.length === 0) return 0;
    // We use Math.max because a student's readiness is defined by their BEST role match,
    // not by an average across roles they aren't meant for.
    return Math.max(...values);
}

/**
 * Get the match weight between a student skill and a required skill.
 * Uses the new skill ontology with sibling groups and domain mapping.
 * 
 * Returns:
 *   1.0 - Exact match
 *   0.8 - Direct parent match
 *   0.7 - Indirect ancestor match
 *   0.6 - Sibling match (same tech family)
 *   0.5 - Domain match only
 *   0   - No relation
 * 
 * @param {string} studentSkill - The skill the student has
 * @param {string} requiredSkill - The skill that is required
 * @returns {number} Match weight (0 to 1.0)
 */
function getSkillMatchWeight(studentSkill, requiredSkill) {
    const { getBestWeight } = require('../utils/skillOntology');
    const studentSkills = [normalizeSkill(studentSkill)];
    return getBestWeight(requiredSkill, studentSkills);
}

/**
 * Deterministic ranking engine with enhanced skill ontology.
 * Uses sibling groups, domain mapping, and aliases for better matching.
 * 
 * Scoring Model:
 * 1. Required Skill Matching (hierarchy-based weighted partial credit)
 *    - Exact match: 1.0
 *    - Direct parent: 0.8
 *    - Indirect ancestor: 0.7
 *    - Sibling (same tech family): 0.6
 *    - Domain match only: 0.5
 *    - No relation: 0.0
 * 2. Required Threshold Gate (reject if < 0.5)
 * 3. Non-Linear Boost (power of 1.3)
 * 4. Preferred Skills (hierarchy-based, no boost)
 * 5. Experience Score
 * 6. Final Score: (boostedRequired * 0.5) + (preferredMatchRatio * 0.25) + (experienceScore * 0.25)
 */
function rankStudents(students, jd) {
    const { required_skills = [], preferred_skills = [], min_experience_years = 0 } = jd;

    // Normalize skills using the ontology's normalizeSkill function
    const normalizedRequired = required_skills.map(s => normalizeSkill(s));
    const normalizedPreferred = preferred_skills.map(s => normalizeSkill(s));

    const ranked = students.map(student => {
        // Get student's normalized skills
        const studentSkills = (student.technical_skills || []).map(s => normalizeSkill(s));

        // Use the new computeScore function from skillOntology
        const result = computeScore(
            {
                skills: studentSkills,
                experience: student.experience_years || 0
            },
            {
                required: normalizedRequired,
                preferred: normalizedPreferred,
                minExp: min_experience_years
            }
        );

        // Determine missing skills: Only show if they have ZERO match (no sibling/parent credit)
        const missingSkills = normalizedRequired.filter(req =>
            getBestWeight(req, studentSkills) === 0
        );

        // Calculate display scores (in percentage)
        const requiredScoreDisplay = Math.round(result.requiredMatchRatio * 100);
        const preferredScoreDisplay = result.gated ? 0 : Math.round(result.preferredMatchRatio * 100);
        const experienceScoreDisplay = result.gated ? 0 : Math.round(result.experienceScore * 100);

        return {
            id: student.id,
            name: student.name,
            department: student.department,
            year: student.year,
            cgpa: student.cgpa,
            backlogs: student.backlogs ?? 0,
            experience_years: student.experience_years || 0,
            technical_skills: student.technical_skills,
            finalScore: Math.round(result.finalScore * 100) / 100,
            matchPercentage: Math.round(result.finalScore * 100),
            missingSkills,
            requiredScore: requiredScoreDisplay,
            preferredScore: preferredScoreDisplay,
            experienceScore: experienceScoreDisplay,
            requiredBreakdown: result.requiredBreakdown || [],
            preferredBreakdown: result.preferredBreakdown || [],
            boostedRequired: result.boostedRequired || 0,
            gated: result.gated || false,
        };
    });

    return ranked.sort((a, b) => b.finalScore - a.finalScore);
}

module.exports = {
    computeRoleReadiness,
    computeOverallReadiness,
    rankStudents,
    getSkillMatchWeight
};

