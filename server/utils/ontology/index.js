/**
 * Consolidated Skill Ontology Entry Point
 */

const { cseGraph, cseSiblings, cseDomains, cseAliases } = require('./cse');
const { mechGraph, mechSiblings, mechDomains, mechAliases } = require('./mech');
const { eceGraph, eceSiblings, eceDomains, eceAliases } = require('./ece');
const { civilGraph, civilSiblings, civilDomains, civilAliases } = require('./civil');
const { commonGraph, commonSiblings, commonDomains, commonAliases } = require('./common');

// 1. Merge Graphs
const skillGraph = {
    ...commonGraph,
    ...cseGraph,
    ...mechGraph,
    ...eceGraph,
    ...civilGraph
};

// 2. Merge Sibling Groups
const siblingGroups = [
    ...commonSiblings,
    ...cseSiblings,
    ...mechSiblings,
    ...eceSiblings,
    ...civilSiblings
];

// 3. Merge Domains
const domainMap = {
    ...commonDomains,
    ...cseDomains,
    ...mechDomains,
    ...eceDomains,
    ...civilDomains
};

// 4. Merge Aliases
const aliases = {
    ...commonAliases,
    ...cseAliases,
    ...mechAliases,
    ...eceAliases,
    ...civilAliases
};

// Helper Functions
function normalizeSkill(raw) {
    if (!raw) return '';
    const lowered = raw.toLowerCase().trim();
    return aliases[lowered] ?? lowered;
}

const normalizeForStorage = normalizeSkill;

function getAncestors(skill) {
    const ancestors = [];
    let current = skillGraph[skill];
    while (current) {
        ancestors.push(current);
        current = skillGraph[current];
    }
    return ancestors;
}

function areSiblings(skillA, skillB) {
    return siblingGroups.some(
        group => group.includes(skillA) && group.includes(skillB)
    );
}

function shareDomain(skillA, skillB) {
    const domainA = domainMap[skillA];
    const domainB = domainMap[skillB];
    return domainA && domainB && domainA === domainB;
}

function getSkillWeight(requiredSkill, studentSkill) {
    const req = normalizeSkill(requiredSkill);
    const stu = normalizeSkill(studentSkill);

    // 1.0 — exact
    if (stu === req) return 1.0;

    // 0.8 / 0.7 — hierarchy: walk ancestors of STUDENT skill
    const ancestors = getAncestors(stu);
    if (ancestors[0] === req) return 0.8;          // direct parent
    if (ancestors.slice(1).includes(req)) return 0.7; // indirect ancestor

    // 0.6 — sibling (same tech family)
    if (areSiblings(stu, req)) return 0.6;

    // 0.5 — domain match only
    if (shareDomain(stu, req)) return 0.5;

    return 0.0;
}

function getBestWeight(requiredSkill, studentSkills) {
    let best = 0;
    for (const s of studentSkills) {
        const w = getSkillWeight(requiredSkill, s);
        if (w > best) best = w;
        if (best === 1.0) break;
    }
    return best;
}

/**
 * Main scoring engine.
 * Computes how well a student matches a JD.
 */
function computeScore(student, jd) {
    const { skills: studentSkills = [], experience: studentExp = 0 } = student;
    const { required = [], preferred = [], minExp = 0 } = jd;

    // 1. Required Skills Match (with weighted partial credit)
    const requiredBreakdown = required.map(req => ({
        skill: req,
        score: getBestWeight(req, studentSkills)
    }));

    const totalWeightedMatch = requiredBreakdown.reduce((sum, item) => sum + item.score, 0);

    // Saturation Model: hitting 75% of the weighted requirement list = 100% component match.
    // This prevents "Denominator Explosion" from common soft skills or niche tags.
    const saturationPoint = Math.max(required.length * 0.75, 1);
    const requiredMatchRatio = required.length > 0
        ? Math.min(totalWeightedMatch / saturationPoint, 1.0)
        : 1.0;

    // RAW Ratio for the Threshold Gate (before saturation)
    const rawRequiredRatio = required.length > 0 ? totalWeightedMatch / required.length : 1.0;

    // Threshold Gate: If RAW match < 35%, the candidate is "Gated" (False Negative Prevention)
    const gated = required.length > 0 && rawRequiredRatio < 0.35;

    // Non-linear boost for required skills: higher scores get more reward
    const boostedRequired = Math.pow(requiredMatchRatio, 1.2);

    // 2. Preferred Skills Match (with 70% saturation)
    const preferredBreakdown = preferred.map(pref => ({
        skill: pref,
        score: getBestWeight(pref, studentSkills)
    }));

    const totalPreferredWeight = preferredBreakdown.reduce((sum, item) => sum + item.score, 0);
    const preferredSaturationPoint = Math.max(preferred.length * 0.7, 1);
    const preferredMatchRatio = preferred.length > 0
        ? Math.min(totalPreferredWeight / preferredSaturationPoint, 1.0)
        : 0;

    // 3. Experience Match (capped at 1.0, with 20% overqualification bonus in final score if possible)
    let experienceScore = 1.0;
    if (minExp > 0) {
        // We allows up to 1.2 (20% bonus) for candidates with significant extra experience
        experienceScore = Math.min(studentExp / minExp, 1.2);
    }

    // 4. Final Balanced Scoring Calculation
    // Model: (BoostedRequired * 0.5) + (Preferred saturated * 0.25) + (Experience * 0.25)
    let finalScore = (boostedRequired * 0.5) + (preferredMatchRatio * 0.25) + (experienceScore * 0.25);

    // If gated, we apply a significant penalty to the final score
    if (gated) finalScore = finalScore * 0.4;

    return {
        requiredMatchRatio,
        rawRequiredRatio,
        preferredMatchRatio,
        experienceScore,
        finalScore,
        requiredBreakdown,
        preferredBreakdown,
        boostedRequired,
        gated
    };
}

// Export everything as a single object compatible with old ontology.js
module.exports = {
    skillGraph,
    siblingGroups,
    domainMap,
    aliases,
    normalizeSkill,
    normalizeForStorage,
    getAncestors,
    areSiblings,
    shareDomain,
    getSkillWeight,
    getBestWeight,
    computeScore
};
