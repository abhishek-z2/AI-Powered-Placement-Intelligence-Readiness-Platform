/**
 * COMMON SKILLS - Shared across all departments
 */

const commonGraph = {
    // Soft Skills
    "communication": "soft_skill",
    "presentation": "communication",
    "technical writing": "communication",
    "public speaking": "communication",
    "problem solving": "soft_skill",
    "analytical thinking": "problem solving",
    "critical thinking": "problem solving",
    "teamwork": "soft_skill",
    "leadership": "teamwork",
    "time management": "soft_skill",

    // Basic Digital Skills
    "microsoft office": "digital_literacy",
    "excel": "microsoft office",
    "powerpoint": "microsoft office",
    "word": "microsoft office",
    "google sheets": "digital_literacy",
    "google docs": "digital_literacy"
};

const commonSiblings = [
    ["excel", "google sheets"],
    ["word", "google docs"],
    ["communication", "presentation", "public speaking", "technical writing"],
    ["problem solving", "analytical thinking", "critical thinking"],
    ["teamwork", "leadership"]
];

const commonDomains = {
    "communication": "soft_skills",
    "presentation": "soft_skills",
    "technical writing": "soft_skills",
    "public speaking": "soft_skills",
    "problem solving": "soft_skills",
    "analytical thinking": "soft_skills",
    "critical thinking": "soft_skills",
    "teamwork": "soft_skills",
    "leadership": "soft_skills",
    "time management": "soft_skills",
    "soft_skill": "soft_skills",
    "excel": "digital_office",
    "microsoft office": "digital_office",
    "google sheets": "digital_office",
    "google docs": "digital_office"
};

const commonAliases = {
    "ms excel": "excel",
    "ms word": "word",
    "ms powerpoint": "powerpoint",
    "office 365": "microsoft office",
    "soft skills": "soft_skill"
};

module.exports = {
    commonGraph,
    commonSiblings,
    commonDomains,
    commonAliases
};
