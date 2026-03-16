/**
 * Consolidated Skill Ontology Entry Point
 *
 * Skill Similarity Model: Ontology-Distance-Based Semantic Matching
 * ─────────────────────────────────────────────────────────────────
 * Skills are modeled as nodes in an undirected graph G = (V, E).
 * Similarity between two skills is derived using a Breadth-First Search (BFS)
 * to compute the shortest path distance d(u, v) in the graph.
 *
 * The final score is computed using an Exponential Decay Function:
 *
 *   score(u, v) = λ^d   where λ = 0.8 (decay constant)
 *
 * This ensures:
 *   d = 0 (exact)       → score = 0.8^0 = 1.0
 *   d = 1 (neighbour)   → score = 0.8^1 = 0.8
 *   d = 2 (2 hops)      → score = 0.8^2 = 0.64
 *   d = 3 (3 hops)      → score = 0.8^3 = 0.51
 *   d = ∞ (no path)     → score = 0.0  (Jaro-Winkler fuzzy fallback applied)
 *
 * The graph is built from three complementary edge sources:
 *   1. Parent-Child edges  — from the directed skill hierarchy (skillGraph)
 *   2. Sibling edges       — from the sibling technology family groups
 *   3. Domain edges        — bridging skills that share a common domain
 *
 * References:
 *   - Maree et al. (base paper), Section 4.3: Semantic network construction
 *   - Maree et al. (base paper), Section 4.6: Jaro-Winkler as fuzzy fallback
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

// ─────────────────────────────────────────────────────────────────────────────
// GRAPH CONSTRUCTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds an undirected adjacency list from:
 *   1. Parent-child edges in skillGraph (bidirectional: child ↔ parent)
 *   2. Sibling edges within each sibling group (fully connected clique)
 *   3. Domain edges: skills sharing a domain are connected via a virtual
 *      "domain hub" node (e.g., "__domain__frontend") to avoid O(n²) edges.
 *
 * This is computed once at module load time and cached.
 *
 * @returns {Map<string, Set<string>>} adjacency list
 */
function buildAdjacencyList() {
    const adj = new Map();

    function addEdge(a, b) {
        if (!a || !b || a === b) return;
        if (!adj.has(a)) adj.set(a, new Set());
        if (!adj.has(b)) adj.set(b, new Set());
        adj.get(a).add(b);
        adj.get(b).add(a);
    }

    // Source 1: Parent-child hierarchy (directed graph → undirected edges)
    for (const [child, parent] of Object.entries(skillGraph)) {
        addEdge(child, parent);
    }

    // Source 2: Sibling groups → fully connected within each group
    for (const group of siblingGroups) {
        for (let i = 0; i < group.length; i++) {
            for (let j = i + 1; j < group.length; j++) {
                addEdge(group[i], group[j]);
            }
        }
    }

    // Source 3: Domain hub nodes — each skill with a domain is connected
    // to a virtual hub node "__domain__<domainName>". This makes
    // domain-match distance = 2 (skill → hub → other skill).
    for (const [skill, domain] of Object.entries(domainMap)) {
        const hubNode = `__domain__${domain}`;
        addEdge(skill, hubNode);
    }

    return adj;
}

// Singleton: build once, reuse on every scoring call.
const adjacencyList = buildAdjacencyList();

// ─────────────────────────────────────────────────────────────────────────────
// BFS SHORTEST PATH
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Finds the shortest path distance between two skill nodes in the
 * undirected ontology graph using Breadth-First Search (BFS).
 *
 * BFS guarantees the minimum number of hops between two nodes,
 * which maps directly to semantic closeness in the ontology.
 *
 * Time Complexity: O(V + E) per call, where V = skills, E = relations.
 * In practice V ≈ 300–500, E ≈ 800–1500, making this very fast.
 *
 * @param {string} source - start node (normalized skill)
 * @param {string} target - end node (normalized skill)
 * @param {number} [maxDepth=4] - stop searching beyond this depth (performance guard)
 * @returns {number} shortest hop count, or Infinity if unreachable
 */
function bfsShortestPath(source, target, maxDepth = 4) {
    if (source === target) return 0;
    if (!adjacencyList.has(source) || !adjacencyList.has(target)) return Infinity;

    const visited = new Set([source]);
    // Queue stores [currentNode, currentDepth]
    const queue = [[source, 0]];

    while (queue.length > 0) {
        const [node, depth] = queue.shift();

        if (depth >= maxDepth) continue;

        for (const neighbour of (adjacencyList.get(node) || [])) {
            if (neighbour === target) return depth + 1;
            if (!visited.has(neighbour)) {
                visited.add(neighbour);
                queue.push([neighbour, depth + 1]);
            }
        }
    }

    return Infinity;
}

/**
 * Builds a subgraph (nodes and links) centered around a set of student skills.
 * Used for "Skill Neighborhood" visualizations.
 *
 * @param {string[]} seeds - student's normalized skills
 * @param {number} [depth=1] - how many hops to traverse
 * @returns {{ nodes: any[], links: any[] }} graph data
 */
function getSkillNeighborhood(seeds, depth = 1) {
    const normalizedSeeds = seeds.map(normalizeSkill);
    const nodes = new Map(); // id -> { id, label, type, isSeed }
    const links = new Set(); // "id1|id2"

    const queue = [];
    normalizedSeeds.forEach(s => {
        if (adjacencyList.has(s)) {
            nodes.set(s, { id: s, label: s, type: 'skill', isSeed: true });
            queue.push([s, 0]);
        }
    });

    while (queue.length > 0) {
        const [node, currentDepth] = queue.shift();
        if (currentDepth >= depth) continue;

        const neighbors = adjacencyList.get(node) || [];
        for (const neighbor of neighbors) {
            // Add Node
            if (!nodes.has(neighbor)) {
                let type = 'skill';
                if (neighbor.startsWith('__domain__')) type = 'domain';
                nodes.set(neighbor, {
                    id: neighbor,
                    label: neighbor.replace('__domain__', ''),
                    type,
                    isSeed: normalizedSeeds.includes(neighbor)
                });
            }

            // Add Link (sorted to avoid duplicates in undirected graph)
            const linkId = [node, neighbor].sort().join('|');
            links.add(linkId);

            if (currentDepth + 1 < depth) {
                queue.push([neighbor, currentDepth + 1]);
            }
        }
    }

    return {
        nodes: Array.from(nodes.values()),
        links: Array.from(links).map(id => {
            const [source, target] = id.split('|');
            return { source, target };
        })
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// JARO-WINKLER FUZZY FALLBACK
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Jaro-Winkler Similarity — as cited in Maree et al. (base paper), Section 4.6.
 * Used as a fuzzy fallback when BFS finds no path in the ontology graph,
 * to compensate for Knowledge Incompleteness in the ontology.
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

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS (kept for backward compatibility)
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// CORE SKILL SCORING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Exponential Decay Constant (λ).
 *
 * Controls how fast similarity decays with graph distance.
 * λ = 0.8 was chosen so that the model aligns with empirically
 * validated weights from the pre-BFS system:
 *
 *   d=0 → 1.0 (exact)
 *   d=1 → 0.8 (direct neighbour / parent)
 *   d=2 → 0.64 (sibling or grandparent — approximately the old 0.6)
 *   d=3 → 0.51 (domain-level match via hub — approximately the old 0.5)
 *
 * This continuity ensures predictable behaviour during migration and
 * provides a mathematically principled answer to the question "why these weights?"
 */
const DECAY_LAMBDA = 0.8;

/**
 * Computes the semantic similarity score between a required skill (from JD)
 * and a student skill, using ontology graph distance.
 *
 * Algorithm:
 *   1. Exact match check → 1.0
 *   2. BFS shortest-path in ontology graph → λ^d  (Exponential Decay)
 *   3. Jaro-Winkler fuzzy fallback for unknown/misspelled skills
 *      (Maree et al., Section 4.6) → ≤ 0.35 penalty-discounted score
 *
 * @param {string} requiredSkill - skill from the Job Description
 * @param {string} studentSkill  - skill from the student's profile
 * @returns {number} similarity score in [0.0, 1.0]
 */
function getSkillWeight(requiredSkill, studentSkill) {
    const req = normalizeSkill(requiredSkill);
    const stu = normalizeSkill(studentSkill);

    // Layer 1: Exact match
    if (stu === req) return 1.0;

    // Layer 2: BFS-based Ontology Distance with Exponential Decay
    const d = bfsShortestPath(stu, req);
    if (isFinite(d)) {
        // d=1 → 0.8, d=2 → 0.64, d=3 → 0.512, ...
        // Domain-hub nodes have d=2 (skill→hub→skill) giving ~0.64
        // We cap at 0.9 to preserve the exact-match ceiling of 1.0
        return Math.min(Math.pow(DECAY_LAMBDA, d), 0.9);
    }

    // Layer 3: Jaro-Winkler fuzzy fallback (Maree et al., Section 4.6)
    // Triggered only when BFS finds no path —i.e., the ontology has a gap.
    // High similarity (≥ 0.88) earns discounted partial credit (max 0.35),
    // preventing unknown skills from being scored equally to known ones.
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

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SCORING ENGINE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Computes how well a student's profile matches a Job Description.
 *
 * Final Score Model (weighted sum):
 *   finalScore = (boostedRequired × 0.50)
 *              + (preferredMatchRatio × 0.25)
 *              + (experienceScore × 0.25)
 *
 * @param {{ skills: string[], experience: number }} student
 * @param {{ required: string[], preferred: string[], minExp: number }} jd
 */
function computeScore(student, jd) {
    const { skills: studentSkills = [], experience: studentExp = 0 } = student;
    const { required = [], preferred = [], minExp = 0 } = jd;

    // 1. Required Skills Match (BFS-based weighted partial credit)
    const requiredBreakdown = required.map(req => ({
        skill: req,
        score: getBestWeight(req, studentSkills)
    }));

    const totalWeightedMatch = requiredBreakdown.reduce((sum, item) => sum + item.score, 0);

    // Saturation Model: 75% weighted coverage = 100% component score.
    // Prevents "Denominator Explosion" from a JD with many niche tags.
    const saturationPoint = Math.max(required.length * 0.75, 1);
    const requiredMatchRatio = required.length > 0
        ? Math.min(totalWeightedMatch / saturationPoint, 1.0)
        : 1.0;

    // RAW ratio for the Threshold Gate (before saturation)
    const rawRequiredRatio = required.length > 0 ? totalWeightedMatch / required.length : 1.0;

    // Threshold Gate: RAW match < 35% → candidate is "gated" (severe penalty)
    const gated = required.length > 0 && rawRequiredRatio < 0.35;

    // Non-linear boost: rewards higher overlaps more aggressively
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

    // 3. Experience Score (20% overqualification seniority bonus)
    let experienceScore = 1.0;
    if (minExp > 0) {
        experienceScore = Math.min(studentExp / minExp, 1.2);
    }

    // 4. Final Balanced Score
    let finalScore = (boostedRequired * 0.5) + (preferredMatchRatio * 0.25) + (experienceScore * 0.25);

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

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

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
    bfsShortestPath,
    buildAdjacencyList,
    getSkillWeight,
    getBestWeight,
    computeScore,
    getSkillNeighborhood
};
