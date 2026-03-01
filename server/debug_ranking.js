// Debug script to check Deep's ranking against the JD
const { normalizeSkill, computeScore, getBestWeight, aliases, skillGraph, siblingGroups } = require('./utils/skillOntology');

const jd = {
    role: "Senior Full Stack Engineer (Backend-Focused)",
    required_skills: [
        "javascript", "node.js", "vue.js", "html", "css",
        "api integration", "rest", "soap", "mysql", "postgresql", "mongodb",
        "nosql database concepts", "git", "ci/cd pipelines", "caching strategies",
        "troubleshooting and debugging", "performance optimization",
        "database optimization", "performance monitoring"
    ],
    preferred_skills: [
        "php", "architectural planning and system design",
        "code reviews and enforcing technical standards",
        "leadership and mentoring experience"
    ],
    min_experience_years: 3
};

// What Deep has in his resume (normalized)
const deepSkills = [
    "c#", "java", "python", "ruby", "javascript", "sql",
    "angular", "react", "react-native", "ruby on rails", "django",
    "azure", "aws", "firebase",
    "app-service", "functions", "azure ad", "keyvault", "apim", "sql",
    "cosmosdb", "queue", "redis", "iot-hub", "app-gateway", "load-balancer",
    "vnet", "vpn", "storage", "cognitive-services", "fhir",
    "azure-devops", "github actions", "terraform", "arm-templates",
    "ansible", "kubernetes"
];

console.log("=== Deep's Normalized Skills ===");
console.log(deepSkills.map(s => normalizeSkill(s)));
console.log("\n=== JD Required Skills ===");
console.log(jd.required_skills);

console.log("\n=== Matching Analysis ===");
for (const req of jd.required_skills) {
    const weight = getBestWeight(req, deepSkills);
    console.log(`${req}: ${weight}`);
}

// Correct the JD structure to match what computeScore expects
const result = computeScore(
    { skills: deepSkills, experience: 5 },
    {
        required: jd.required_skills,
        preferred: jd.preferred_skills,
        minExp: jd.min_experience_years
    }
);
console.log(JSON.stringify(result, null, 2));

