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

/**
 * Jaro-Winkler Similarity — as cited in Maree et al. (base paper), Section 4.6.
 * Used as a fuzzy fallback when the ontology graph finds no structural relation.
 *
 * Jaro distance: measures character-level overlap and transpositions.
 * Winkler prefix bonus: boosts score for strings sharing a common prefix (max 4 chars).
 *
 * @param {string} a
 * @param {string} b
 * @returns {number} similarity in [0, 1]
 */
function jaroWinkler(a, b) {
    if (a === b) return 1.0;
    if (!a || !b) return 0.0;

    const lenA = a.length;
    const lenB = b.length;
    const matchDistance = Math.floor(Math.max(lenA, lenB) / 2) - 1;

    const aMatches = new Array(lenA).fill(false);
    const bMatches = new Array(lenB).fill(false);

    let matches = 0;
    let transpositions = 0;

    // Step 1: Find matching characters within the match window
    for (let i = 0; i < lenA; i++) {
        const start = Math.max(0, i - matchDistance);
        const end = Math.min(i + matchDistance + 1, lenB);
        for (let j = start; j < end; j++) {
            if (bMatches[j] || a[i] !== b[j]) continue;
            aMatches[i] = true;
            bMatches[j] = true;
            matches++;
            break;
        }
    }

    if (matches === 0) return 0.0;

    // Step 2: Count transpositions
    let k = 0;
    for (let i = 0; i < lenA; i++) {
        if (!aMatches[i]) continue;
        while (!bMatches[k]) k++;
        if (a[i] !== b[k]) transpositions++;
        k++;
    }

    // Step 3: Jaro score
    const jaro = (
        matches / lenA +
        matches / lenB +
        (matches - transpositions / 2) / matches
    ) / 3;

    // Step 4: Winkler prefix bonus (p = 0.1, max prefix = 4)
    let prefixLen = 0;
    const maxPrefix = Math.min(4, Math.min(lenA, lenB));
    while (prefixLen < maxPrefix && a[prefixLen] === b[prefixLen]) prefixLen++;

    return jaro + prefixLen * 0.1 * (1 - jaro);
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

    // Layer 1 — Exact match
    if (stu === req) return 1.0;

    // Layer 2 / 3 — Hierarchy: walk ancestors of STUDENT skill
    const ancestors = getAncestors(stu);
    if (ancestors[0] === req) return 0.8;              // direct parent
    if (ancestors.slice(1).includes(req)) return 0.7;  // indirect ancestor

    // Layer 4a — Check if required skill IS an ancestor of student skill
    // (e.g. student has "react", JD asks for "frontend_framework")
    const reqAncestors = getAncestors(req);
    if (ancestors.includes(req) || reqAncestors.includes(stu)) return 0.7;

    // Layer 4b — Sibling match (same tech family)
    if (areSiblings(stu, req)) return 0.6;

    // Layer 4c — Domain match only
    if (shareDomain(stu, req)) return 0.5;

    // Layer 5 — Jaro-Winkler fuzzy fallback (Maree et al., Section 4.6)
    // Catches surface variants the alias map may have missed (e.g. "postgress" vs "postgres",
    // "nodeJS" vs "node.js" after normalization, or multi-word overlaps).
    // A high JW score (>= 0.88) earns discounted partial credit capped at 0.35,
    // preventing false-positive inflation on very short tokens.
    const jwSim = jaroWinkler(stu, req);
    if (jwSim >= 0.88) return Math.min(jwSim * 0.4, 0.35);

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
    jaroWinkler,
    getSkillWeight,
    getBestWeight,
    computeScore
};
