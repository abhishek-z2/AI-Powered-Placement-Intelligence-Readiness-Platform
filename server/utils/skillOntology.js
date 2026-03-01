/**
 * SKILL ONTOLOGY — Senior Web Developer (Production Grade)
 * ─────────────────────────────────────────────────────────
 * Drop this file into your ranking engine and replace your
 * existing skillGraph with the exports below.
 *
 * WEIGHT HIERARCHY (deterministic, no changes to formula):
 *   Exact match          → 1.0
 *   Direct parent        → 0.8   (child skill covers parent requirement)
 *   Indirect ancestor    → 0.7
 *   Sibling (same family)→ 0.6   (NEW)
 *   Domain match only    → 0.5   (NEW)
 *   No relation          → 0.0
 */

// ─── 1. PARENT-CHILD GRAPH ───────────────────────────────────────────────────
// Format: "child": "parent"
// A child skill implies the parent skill (child is more specific).
// Example: "express" implies "node.js" implies "backend_framework"

const skillGraph = {

  // ── Frontend Frameworks ──────────────────────────────────────
  "react": "frontend_framework",
  "react.js": "frontend_framework",
  "reactjs": "frontend_framework",
  "next.js": "react",
  "nextjs": "react",
  "gatsby": "react",
  "angular": "frontend_framework",
  "angularjs": "frontend_framework",
  "angular.js": "frontend_framework",
  "vue": "frontend_framework",
  "vue.js": "frontend_framework",
  "vuejs": "frontend_framework",
  "nuxt": "vue",
  "nuxt.js": "vue",
  "svelte": "frontend_framework",
  "sveltekit": "svelte",

  // ── Backend Frameworks ───────────────────────────────────────
  "express": "node.js",
  "express.js": "node.js",
  "koa": "node.js",
  "fastify": "node.js",
  "nestjs": "node.js",
  "node.js": "backend_framework",
  "node": "backend_framework",
  "django": "backend_framework",
  "flask": "backend_framework",
  "fastapi": "backend_framework",
  "rails": "backend_framework",
  "ruby on rails": "backend_framework",
  "spring": "backend_framework",
  "spring boot": "backend_framework",
  "laravel": "backend_framework",
  "asp.net": "backend_framework",
  ".net": "backend_framework",
  "dotnet": "backend_framework",

  // ── Programming Languages ────────────────────────────────────
  "javascript": "programming_language",
  "js": "programming_language",
  "es6": "javascript",
  "es6+": "javascript",
  "typescript": "javascript",
  "ts": "javascript",
  "python": "programming_language",
  "java": "programming_language",
  "kotlin": "programming_language",
  "ruby": "programming_language",
  "php": "programming_language",
  "go": "programming_language",
  "golang": "programming_language",
  "rust": "programming_language",
  "c#": "programming_language",
  "csharp": "programming_language",
  "swift": "programming_language",

  // ── Markup & Styling ─────────────────────────────────────────
  "html5": "html",
  "html": "markup",
  "css3": "css",
  "css": "markup",
  "sass": "css",
  "scss": "css",
  "less": "css",
  "tailwind": "css",
  "tailwindcss": "css",
  "bootstrap": "css",
  "styled-components": "css",

  // ── Databases — SQL ──────────────────────────────────────────
  "postgresql": "sql_database",
  "postgres": "sql_database",
  "mysql": "sql_database",
  "mariadb": "sql_database",
  "sqlite": "sql_database",
  "mssql": "sql_database",
  "sql server": "sql_database",
  "oracle": "sql_database",
  "sql": "sql_database",
  "sql_database": "database",

  // ── Databases — NoSQL ────────────────────────────────────────
  "mongodb": "nosql_database",
  "mongo": "nosql_database",
  "dynamodb": "nosql_database",
  "firestore": "nosql_database",
  "couchdb": "nosql_database",
  "cassandra": "nosql_database",
  "nosql": "nosql_database",
  "nosql_database": "database",
  "cosmosdb": "nosql_database",
  "cosmos db": "nosql_database",
  "azure cosmosdb": "nosql_database",

  // ── Caching ──────────────────────────────────────────────────
  "redis": "caching",
  "memcached": "caching",
  "caching": "database",

  // ── API Technologies ─────────────────────────────────────────
  "rest": "api",
  "rest api": "api",
  "restful": "api",
  "restful api": "api",
  "soap": "api",
  "graphql": "api",
  "grpc": "api",
  "websockets": "api",
  "websocket": "api",
  "backend apis": "api",
  "api development": "api",
  "web api": "api",
  "api integration": "api",
  "api management": "api",
  "api integration": "rest api",

  // ── Cloud Providers ──────────────────────────────────────────
  "aws": "cloud",
  "amazon web services": "cloud",
  "azure": "cloud",
  "microsoft azure": "cloud",
  "gcp": "cloud",
  "google cloud": "cloud",
  "google cloud platform": "cloud",
  "heroku": "cloud",
  "digitalocean": "cloud",
  "vercel": "cloud",
  "netlify": "cloud",
  "firebase": "cloud",

  // ── Containerization & Orchestration ────────────────────────
  "docker": "containerization",
  "podman": "containerization",
  "kubernetes": "containerization",
  "k8s": "containerization",
  "helm": "kubernetes",
  "containerization": "devops",

  // ── CI/CD ────────────────────────────────────────────────────
  "ci/cd": "devops",
  "github actions": "ci/cd",
  "gitlab ci": "ci/cd",
  "jenkins": "ci/cd",
  "circleci": "ci/cd",
  "travis ci": "ci/cd",
  "bitbucket pipelines": "ci/cd",
  "azure devops": "ci/cd",

  // ── Infrastructure as Code ───────────────────────────────────
  "terraform": "iac",
  "pulumi": "iac",
  "ansible": "iac",
  "cloudformation": "iac",
  "iac": "devops",

  // ── Version Control ──────────────────────────────────────────
  "git": "version_control",
  "github": "version_control",
  "gitlab": "version_control",
  "bitbucket": "version_control",
  "version_control": "devops",

  // ── Testing ──────────────────────────────────────────────────
  "jest": "testing",
  "mocha": "testing",
  "cypress": "testing",
  "playwright": "testing",
  "selenium": "testing",
  "junit": "testing",
  "pytest": "testing",
  "vitest": "testing",
  "react testing library": "testing",
  "unit testing": "testing",
  "e2e testing": "testing",
  "tdd": "testing",

  // ── Web Performance & Security ───────────────────────────────
  "seo": "web_optimization",
  "web vitals": "web_optimization",
  "lighthouse": "web_optimization",
  "web security": "security",
  "owasp": "security",
  "oauth": "security",
  "oauth2": "security",
  "jwt": "security",
  "ssl": "security",
  "https": "security",

  // ── Methodologies ────────────────────────────────────────────
  "agile": "methodology",
  "scrum": "agile",
  "kanban": "agile",
  "jira": "agile",

  // ── Mobile ───────────────────────────────────────────────────
  "react native": "mobile_framework",
  "flutter": "mobile_framework",
  "ionic": "mobile_framework",
  "mobile_framework": "frontend_framework",
};


// ─── 2. SIBLING GROUPS (same tech family) ────────────────────────────────────
// If required skill and student skill are in the same sibling group → weight 0.6
// These are interchangeable/transferable technologies at the same level.

const siblingGroups = [

  // Frontend frameworks — very transferable at senior level
  ["react", "angular", "vue", "svelte", "react.js", "vue.js", "angular.js"],

  // Backend frameworks — server-side experience transfers
  ["express", "django", "flask", "fastapi", "rails", "ruby on rails",
    "spring", "spring boot", "laravel", "asp.net", ".net", "koa", "fastify", "nestjs"],

  // Backend languages — general server-side transferability
  ["node.js", "python", "java", "ruby", "php", "go", "golang", "c#", "csharp", "django", "rails", "ruby on rails"],

  // SQL databases — schema/query skills transfer
  ["postgresql", "postgres", "mysql", "mariadb", "mssql", "sql server", "sqlite", "oracle", "sql", "azure sql"],

  // NoSQL databases
  ["mongodb", "dynamodb", "firestore", "couchdb", "cassandra", "cosmosdb", "cosmos db", "azure cosmosdb"],

  // Cloud providers
  ["aws", "azure", "gcp", "google cloud", "digitalocean", "heroku", "firebase"],

  // CI/CD tools
  ["github actions", "gitlab ci", "jenkins", "circleci", "travis ci",
    "bitbucket pipelines", "azure devops", "ci/cd", "github"],

  // IaC tools
  ["terraform", "ansible", "pulumi", "cloudformation", "arm templates"],

  // CSS preprocessors / frameworks
  ["sass", "scss", "less", "tailwind", "tailwindcss", "bootstrap", "styled-components"],

  // API paradigms
  ["rest", "rest api", "restful", "graphql", "grpc", "soap", "api integration", "backend apis", "web api"],

  // Testing frameworks
  ["jest", "mocha", "vitest", "jasmine"],
  ["cypress", "playwright", "selenium"],

  // Containerization
  ["docker", "podman", "kubernetes", "k8s"],

  // Version control hosts
  ["github", "gitlab", "bitbucket", "git", "version_control"],

  // Programming languages
  ["javascript", "java", "python", "ruby", "c#", "csharp", "php", "golang", "go"],
];


// ─── 3. DOMAIN MAP ───────────────────────────────────────────────────────────
// If no exact/parent/sibling match, check if both skills share a domain → 0.5
// Maps every skill to its top-level domain bucket.

const domainMap = {

  // frontend
  "react": "frontend",
  "react.js": "frontend",
  "reactjs": "frontend",
  "next.js": "frontend",
  "nextjs": "frontend",
  "angular": "frontend",
  "angularjs": "frontend",
  "vue": "frontend",
  "vue.js": "frontend",
  "svelte": "frontend",
  "html": "frontend",
  "html5": "frontend",
  "css": "frontend",
  "css3": "frontend",
  "sass": "frontend",
  "scss": "frontend",
  "tailwind": "frontend",
  "bootstrap": "frontend",
  "frontend_framework": "frontend",
  "markup": "frontend",
  "react native": "frontend",
  "mobile_framework": "frontend",

  // backend
  "node.js": "backend",
  "node": "backend",
  "express": "backend",
  "django": "backend",
  "flask": "backend",
  "fastapi": "backend",
  "rails": "backend",
  "ruby on rails": "backend",
  "spring": "backend",
  "spring boot": "backend",
  "laravel": "backend",
  "asp.net": "backend",
  ".net": "backend",
  "java": "backend",
  "python": "backend",
  "ruby": "backend",
  "php": "backend",
  "go": "backend",
  "golang": "backend",
  "c#": "backend",
  "javascript": "backend",
  "typescript": "backend",
  "backend_framework": "backend",
  "programming_language": "backend",
  "backend apis": "backend",

  // database
  "sql": "database",
  "postgresql": "database",
  "postgres": "database",
  "mysql": "database",
  "mongodb": "database",
  "redis": "database",
  "dynamodb": "database",
  "nosql": "database",
  "sql_database": "database",
  "nosql_database": "database",
  "caching": "database",

  // api
  "rest": "api",
  "rest api": "api",
  "restful": "api",
  "graphql": "api",
  "grpc": "api",
  "soap": "api",
  "api": "api",
  "web api": "api",

  // cloud
  "aws": "cloud",
  "azure": "cloud",
  "gcp": "cloud",
  "google cloud": "cloud",
  "heroku": "cloud",
  "digitalocean": "cloud",
  "vercel": "cloud",
  "netlify": "cloud",
  "cloud": "cloud",

  // devops
  "docker": "devops",
  "kubernetes": "devops",
  "k8s": "devops",
  "ci/cd": "devops",
  "github actions": "devops",
  "jenkins": "devops",
  "terraform": "devops",
  "ansible": "devops",
  "git": "devops",
  "github": "devops",
  "devops": "devops",
  "containerization": "devops",
  "iac": "devops",
  "version_control": "devops",

  // testing
  "jest": "testing",
  "cypress": "testing",
  "playwright": "testing",
  "selenium": "testing",
  "unit testing": "testing",
  "e2e testing": "testing",
  "tdd": "testing",
  "testing": "testing",

  // security
  "web security": "security",
  "oauth": "security",
  "jwt": "security",
  "owasp": "security",
  "security": "security",

  // methodology
  "agile": "methodology",
  "scrum": "methodology",
  "kanban": "methodology",
  "jira": "methodology",
  "methodology": "methodology",
};


// ─── 4. NORMALIZATION ALIASES ─────────────────────────────────────────────────
// Normalize raw strings from resumes/JDs before any matching.
// Maps messy real-world strings → canonical skill keys used above.

const aliases = {
  // JavaScript variants
  "es6": "javascript",
  "es2015": "javascript",
  "es2020": "javascript",
  "ecmascript": "javascript",
  "js": "javascript",
  "vanilla js": "javascript",
  "vanilla javascript": "javascript",
  "javascript (es6+)": "javascript",
  "javascript(es6+)": "javascript",
  "es6+": "javascript",
  "node": "node.js",
  "nodejs": "node.js",
  "ts": "typescript",

  // HTML/CSS variants
  "html5": "html",         // normalize version → base skill
  "html": "markup",        // HTML is markup, not frontend framework
  "css3": "css",
  "scss": "sass",

  // Framework aliases
  "react.js": "react",
  "reactjs": "react",
  "next": "next.js",
  "vue.js": "vue",
  "vuejs": "vue",
  "nuxt.js": "vue",          // nuxt → treat as vue family
  "angular.js": "angular",
  "angularjs": "angular",
  "express.js": "express",

  // Database aliases
  "postgres": "postgresql",
  "mongo": "mongodb",
  "mongo db": "mongodb",
  "dynamo": "dynamodb",
  "sql server": "mssql",
  "ms sql": "mssql",
  "azure sql": "postgresql",    // Map Azure SQL to PostgreSQL (similar)
  "azure sql database": "postgresql",

  // NoSQL database aliases
  "cosmosdb": "mongodb",       // CosmosDB is MongoDB-compatible
  "cosmos db": "mongodb",
  "azure cosmosdb": "mongodb",
  "dynamodb": "nosql_database",

  // Cloud aliases
  "amazon web services": "aws",
  "amazon aws": "aws",
  "microsoft azure": "azure",
  "google cloud platform": "gcp",
  "google cloud": "gcp",

  // Azure-specific services
  "azure functions": "serverless",
  "azure app service": "cloud",
  "azure iot hub": "iot",
  "azure iot-hub": "iot",
  "azure keyvault": "security",
  "azure key vault": "security",
  "azure ad": "identity",
  "azure active directory": "identity",
  "azure apim": "api management",
  "azure app gateway": "networking",
  "azure load balancer": "networking",
  "azure vnet": "networking",
  "azure vpn": "networking",
  "azure storage": "storage",
  "azure cognitive services": "ai ml",

  // Correcting node.js and common databases
  "node js": "node.js",
  "node.js": "node.js",
  "nodejs": "node.js",
  "postgresql": "postgresql",
  "mongodb": "mongodb",

  // Authentication & Security
  "jwt": "security",
  "auth": "security",
  "authentication": "security",
  "identity": "security",
  "authorization": "security",
  "oauth": "security",
  "oauth2": "security",

  // Modern phrase aliases
  "api integration": "rest api",
  "rest api integration": "rest api",
  "rest": "rest api",
  "api": "rest api",
  "backend apis": "rest api",
  "api development": "rest api",

  // Additional common skills
  "visual studio code": "ide",
  "vscode": "ide",
  "npm": "package manager",
  "yarn": "package manager",
  "webpack": "build tools",
  "vite": "build tools",
  "microservices": "architecture",

  // Modern phrase aliases (existing, moved to new block)
  "restful": "rest api",
  "restful api": "rest api",
  "web api": "rest api",

  // DevOps / Infrastructure
  "ci cd": "ci/cd",
  "ci-cd": "ci/cd",
  "ci/cd pipelines": "ci/cd",
  "cicd": "ci/cd",
  "cicd pipelines": "ci/cd",
  "containerization": "docker",
  "infrastructure as code": "terraform",
  "iac": "terraform",

  // Quality & Performance
  "troubleshooting": "debugging",
  "debugging": "debugging",
  "troubleshooting and debugging": "debugging",
  "problem-solving": "problem solving",
  "problem solving": "problem solving",
  "performance optimization": "performance tuning",
  "database optimization": "database tuning",
  "performance monitoring": "monitoring",
  "system monitoring": "monitoring",
  "code reviews": "code review",
  "architectural planning": "architecture",
  "system design": "architecture",
  "architectural planning and system design": "architecture",

  // Leadership / Soft
  "leadership": "team leadership",
  "mentoring": "mentoring",
  "leadership and mentoring experience": "team leadership",
  "code reviews and enforcing technical standards": "code review",

  // Data / AI
  "nosql database concepts": "nosql_database",
  "machine learning": "ai ml",
  "caching strategies": "caching",
  "data structures and algorithms": "dsa",
  "dsa": "dsa",

  // API aliases
  // These were already present in the "Modern phrase aliases" section, now consolidated.

  // DevOps aliases
  "k8s": "kubernetes",
  "gh actions": "github actions",
  "gitlab-ci": "gitlab ci",
  // These were already present in the "DevOps / Infrastructure" section, now consolidated.
  "azure devops": "github actions",   // Map Azure DevOps to GitHub Actions (both CI/CD)
  "azure-devops": "github actions",
  "arm templates": "terraform",          // Map ARM to Terraform (both IaC)
  "arm-templates": "terraform",

  // Language aliases
  "golang": "go",
  "csharp": "c#",
  "c sharp": "c#",
  "ruby on rails": "rails",

  // Methodology
  "agile/scrum": "scrum",
  "agile methodologies": "agile",

  // Mobile
  "react-native": "react native",
  "react native": "mobile_framework",

  // Soft skills to technical skills mapping (for JD parsing)
  // These were already present in the "Quality & Performance" and "Leadership / Soft" sections, now consolidated.

  // Additional common skills (existing, moved to new block)
  "intellij": "ide",
  "eclipse": "ide",
  "grunt": "build tools",
  "gulp": "build tools",
  "microservice": "architecture",
};


// ─── 5. MATCHING FUNCTION ─────────────────────────────────────────────────────
// Drop-in replacement for your existing getHierarchyWeight().
// Returns a weight between 0.0 and 1.0.

/**
 * Normalize a raw skill string: lowercase, trim, apply aliases.
 */
function normalizeSkill(raw) {
  const lowered = raw.toLowerCase().trim();
  return aliases[lowered] ?? lowered;
}

/**
 * Get ancestors of a skill by walking up the skillGraph.
 * Returns [directParent, grandparent, ...] or [] if none.
 */
function getAncestors(skill) {
  const ancestors = [];
  let current = skillGraph[skill];
  while (current) {
    ancestors.push(current);
    current = skillGraph[current];
  }
  return ancestors;
}

/**
 * Check if two skills are in the same sibling group.
 */
function areSiblings(skillA, skillB) {
  return siblingGroups.some(
    group => group.includes(skillA) && group.includes(skillB)
  );
}

/**
 * Check if two skills share the same top-level domain.
 */
function shareDomain(skillA, skillB) {
  const domainA = domainMap[skillA];
  const domainB = domainMap[skillB];
  return domainA && domainB && domainA === domainB;
}

/**
 * Main weight function.
 * Given a required skill and a student skill (both already normalized),
 * returns the best weight between 0.0 – 1.0.
 *
 * Weight ladder:
 *   1.0 → exact match
 *   0.8 → student skill's direct parent === required skill
 *   0.7 → required skill appears anywhere in student skill's ancestor chain
 *   0.6 → same sibling group
 *   0.5 → same domain bucket
 *   0.0 → no relationship
 */
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

/**
 * Best weight for a required skill against ALL student skills.
 * This is what your outer loop should call.
 *
 * Usage:
 *   for (const req of required) {
 *     totalWeightedMatch += getBestWeight(req, studentSkills);
 *   }
 */
function getBestWeight(requiredSkill, studentSkills) {
  let best = 0;
  for (const s of studentSkills) {
    const w = getSkillWeight(requiredSkill, s);
    if (w > best) best = w;
    if (best === 1.0) break; // can't do better than exact
  }
  return best;
}


// ─── 6. UPDATED SCORING FUNCTION (full drop-in) ──────────────────────────────
/**
 * Compute final ranking score for one candidate against one JD.
 *
 * REVISION 2.0: Saturation-Based Model
 * - Solves "Denominator Explosion" by setting a saturation threshold (75% match = 100% component score).
 * - Softer gating: Penalize below 0.35 instead of 0.5.
 * - Caps component scores at 1.0 to prevent over-inflation while rewarding alignment.
 */
function computeScore(candidate, jd) {
  const { required = [], preferred = [], minExp = 0 } = jd;
  const studentSkills = (candidate.skills || []).map(normalizeSkill);

  // ── Step 1: Required skill matching ──────────────────────────
  let totalWeightedMatch = 0;
  const requiredBreakdown = [];

  for (const req of required) {
    const best = getBestWeight(req, studentSkills);
    totalWeightedMatch += best;
    requiredBreakdown.push({ skill: req, weight: best });
  }

  // ── Step 2: Saturation Ratio ───────────────────────────
  // Recruiter logic: A candidate doesn't need 100% of keywords to be perfect.
  // We use a saturation point of 75%. If they hit 75% of weights, they get 1.0.
  const saturationPoint = Math.max(required.length * 0.75, 1);
  const requiredMatchRatio = Math.min(totalWeightedMatch / saturationPoint, 1.0);

  // Also keep the raw ratio for internal debugging/gating
  const rawRatio = totalWeightedMatch / Math.max(required.length, 1);

  // ── Step 3: Threshold Gate ──────────────────────────────────
  // Lowered threshold to 0.35 raw match to prevent "strong but worded differently" candidates from tanking.
  if (rawRatio < 0.35) {
    return {
      finalScore: rawRatio * 0.4, // Faster drop-off for truly unqualified candidates
      requiredMatchRatio: rawRatio,
      gated: true,
      requiredBreakdown,
    };
  }

  // ── Step 4: Non-linear boost ──────────────────────────────────
  // Boost gives a slight edge to those who hit higher saturation levels.
  const boostedRequired = Math.pow(requiredMatchRatio, 1.2);

  // ── Step 5: Preferred skills ──────────────────────────────────
  let totalPreferredMatch = 0;
  const preferredBreakdown = [];

  for (const pref of preferred) {
    const best = getBestWeight(pref, studentSkills);
    totalPreferredMatch += best;
    preferredBreakdown.push({ skill: pref, weight: best });
  }

  const preferredSaturation = Math.max(preferred.length * 0.7, 1);
  const preferredMatchRatio = preferred.length > 0
    ? Math.min(totalPreferredMatch / preferredSaturation, 1.0)
    : 0;

  // ── Step 6: Experience score ──────────────────────────────────
  const experienceScore = minExp > 0
    ? Math.min(candidate.experience / minExp, 1.2) // Give slight 20% bonus for overqualification
    : 1.0;

  // ── Final formula ─────────────────────────────────────────────
  // 50% Required, 25% Preferred, 25% Experience
  const finalScore =
    (boostedRequired * 0.50) +
    (preferredMatchRatio * 0.25) +
    (experienceScore * 0.25);

  return {
    finalScore: Math.min(finalScore, 1.0), // Cap final score at 100%
    requiredMatchRatio,
    boostedRequired,
    preferredMatchRatio,
    experienceScore,
    gated: false,
    requiredBreakdown,
    preferredBreakdown,
  };
}

/**
 * Normalize a raw skill string for storage in DB.
 * Run this on every skill Gemini returns before INSERT into DB.
 */
function normalizeForStorage(raw) {
  return raw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')        // collapse multiple spaces
    .replace(/[\-_]/g, ' ')      // Don't strip dots here! "node.js" → "node.js"
    .trim();
}

// Export all functions and data structures for CommonJS
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

