/**
 * Normalize an array of skills to lowercase trimmed strings.
 * Removes empty entries.
 */
function normalizeSkills(skills = []) {
    return skills
        .filter(s => typeof s === 'string' && s.trim().length > 0)
        .map(s => s.toLowerCase().trim());
}

module.exports = { normalizeSkills };
