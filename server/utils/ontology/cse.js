/**
 * CSE ONTOLOGY - Computer Science & Software Engineering
 */

const cseGraph = {
    // Frontend
    "react": "frontend_framework",
    "react.js": "frontend_framework",
    "reactjs": "frontend_framework",
    "next.js": "react",
    "nextjs": "react",
    "gatsby": "react",
    "angular": "frontend_framework",
    "vue": "frontend_framework",
    "svelte": "frontend_framework",
    "sveltekit": "svelte",

    // Backend
    "express": "node.js",
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

    // Programming Languages
    "javascript": "programming_language",
    "js": "programming_language",
    "typescript": "javascript",
    "ts": "javascript",
    "python": "programming_language",
    "java": "programming_language",
    "kotlin": "programming_language",
    "ruby": "programming_language",
    "php": "programming_language",
    "go": "programming_language",
    "rust": "programming_language",
    "c#": "programming_language",
    "csharp": "programming_language",
    "swift": "programming_language",
    "c++": "programming_language",
    "c": "programming_language",

    // Databases
    "postgresql": "sql_database",
    "postgres": "sql_database",
    "mysql": "sql_database",
    "sqlite": "sql_database",
    "mssql": "sql_database",
    "oracle": "sql_database",
    "sql": "sql_database",
    "sql_database": "database",
    "mongodb": "nosql_database",
    "mongo": "nosql_database",
    "dynamodb": "nosql_database",
    "firestore": "nosql_database",
    "nosql": "nosql_database",
    "nosql_database": "database",
    "redis": "caching",
    "caching": "database",

    // DevOps & Cloud
    "aws": "cloud",
    "amazon web services": "cloud",
    "azure": "cloud",
    "gcp": "cloud",
    "google cloud": "cloud",
    "heroku": "cloud",
    "vercel": "cloud",
    "docker": "containerization",
    "kubernetes": "containerization",
    "k8s": "containerization",
    "ci/cd": "devops",
    "github actions": "ci/cd",
    "jenkins": "ci/cd",
    "terraform": "iac",
    "ansible": "iac",
    "iac": "devops",
    "git": "version_control",
    "github": "version_control",
    "version_control": "devops",

    // Core Concepts
    "data structures": "computer_science_fundamentals",
    "algorithms": "computer_science_fundamentals",
    "operating systems": "computer_science_fundamentals",
    "database management": "computer_science_fundamentals",
    "computer networks": "computer_science_fundamentals",
    "object oriented programming": "computer_science_fundamentals",
    "oop": "computer_science_fundamentals"
};

const cseSiblings = [
    ["react", "angular", "vue", "svelte"],
    ["express", "node.js", "django", "flask", "spring boot", "laravel", "asp.net", "fastapi"],
    ["postgresql", "mysql", "mssql", "sqlite", "oracle"],
    ["mongodb", "dynamodb", "firestore", "cassandra"],
    ["aws", "azure", "gcp", "heroku", "digitalocean"],
    ["docker", "podman", "kubernetes"],
    ["javascript", "python", "java", "c#", "go", "php", "ruby", "c++", "c"]
];

const cseDomains = {
    "react": "frontend",
    "angular": "frontend",
    "vue": "frontend",
    "html": "frontend",
    "css": "frontend",
    "node.js": "backend",
    "node": "backend",
    "express": "backend",
    "django": "backend",
    "spring boot": "backend",
    "postgresql": "database",
    "sql": "database",
    "mongodb": "database",
    "nosql": "database",
    "aws": "cloud",
    "azure": "cloud",
    "docker": "devops",
    "kubernetes": "devops",
    "git": "devops",
    "javascript": "programming",
    "python": "programming",
    "java": "programming",
    "c#": "programming",
    "data structures": "fundamentals",
    "algorithms": "fundamentals"
};

const cseAliases = {
    "js": "javascript",
    "ts": "typescript",
    "nodejs": "node.js",
    "node js": "node.js",
    "python3": "python",
    "sql server": "mssql",
    "mongo": "mongodb",
    "amazon aws": "aws",
    "google cloud platform": "gcp",
    "ms azure": "azure",
    "cpp": "c++",
    "c plus plus": "c++",
    "ecmascript": "javascript",
    "reactjs": "react",
    "react.js": "react"
};

module.exports = {
    cseGraph,
    cseSiblings,
    cseDomains,
    cseAliases
};
