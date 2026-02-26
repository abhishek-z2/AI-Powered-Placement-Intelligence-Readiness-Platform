/**
 * Static Role → Skill Map for readiness computation.
 * All skills must be lowercase (normalized).
 */
const roleSkillMap = {
    frontend: ['react', 'javascript', 'css', 'html', 'typescript'],
    backend: ['node.js', 'express', 'postgres', 'sql', 'rest api'],
    data_analyst: ['python', 'pandas', 'sql', 'excel', 'tableau'],
    fullstack: ['react', 'javascript', 'node.js', 'express', 'sql'],
    devops: ['docker', 'kubernetes', 'linux', 'ci/cd', 'aws'],
};

module.exports = roleSkillMap;
