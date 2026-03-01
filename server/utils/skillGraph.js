/**
 * Skill Hierarchy Graph for matching skills with parent relationships.
 * All keys must be lowercase (normalized).
 * 
 * Structure: { skillName: { parents: [parentSkill1, parentSkill2, ...] } }
 */
const skillGraph = {
  // ======================
  // Core Languages
  // ======================
  "javascript": { parents: [] },
  "typescript": { parents: ["javascript"] },
  "python": { parents: [] },
  "java": { parents: [] },
  "c++": { parents: [] },
  "go": { parents: [] },
  "rust": { parents: [] },

  // ======================
  // Frontend
  // ======================
  "html": { parents: [] },
  "css": { parents: [] },
  "sass": { parents: ["css"] },
  "less": { parents: ["css"] },
  "tailwind": { parents: ["css"] },
  "bootstrap": { parents: ["css"] },

  "react": { parents: ["javascript"] },
  "next.js": { parents: ["react"] },
  "vue": { parents: ["javascript"] },
  "angular": { parents: ["typescript"] },

  "redux": { parents: ["react"] },

  // ======================
  // Backend
  // ======================
  "node.js": { parents: ["javascript"] },
  "express": { parents: ["node.js"] },
  "nestjs": { parents: ["node.js"] },
  "fastify": { parents: ["node.js"] },

  "django": { parents: ["python"] },
  "flask": { parents: ["python"] },
  "fastapi": { parents: ["python"] },

  "spring": { parents: ["java"] },

  // ======================
  // Databases
  // ======================
  "sql": { parents: [] },
  "postgres": { parents: ["sql"] },
  "mysql": { parents: ["sql"] },
  "sqlite": { parents: ["sql"] },
  "mongodb": { parents: [] },
  "redis": { parents: [] },

  // ======================
  // DevOps / Cloud
  // ======================
  "docker": { parents: [] },
  "kubernetes": { parents: ["docker"] },

  "aws": { parents: [] },
  "ec2": { parents: ["aws"] },
  "s3": { parents: ["aws"] },
  "lambda": { parents: ["aws"] },

  "azure": { parents: [] },
  "gcp": { parents: [] },

  "ci/cd": { parents: [] },
  "github actions": { parents: ["ci/cd"] },
  "gitlab ci": { parents: ["ci/cd"] },
  "jenkins": { parents: ["ci/cd"] },

  // ======================
  // Version Control
  // ======================
  "git": { parents: [] },
  "github": { parents: ["git"] },
  "gitlab": { parents: ["git"] },

  // ======================
  // APIs
  // ======================
  "rest api": { parents: [] },
  "graphql": { parents: [] },

  // ======================
  // Data / Analytics
  // ======================
  "pandas": { parents: ["python"] },
  "numpy": { parents: ["python"] },
  "matplotlib": { parents: ["python"] },
  "tableau": { parents: [] },
  "excel": { parents: [] },

  // Data Engineering
  "hadoop": { parents: [] },
  "spark": { parents: [] },
  "airflow": { parents: [] },

  // ======================
  // Cybersecurity
  // ======================
  "cybersecurity": { parents: [] },
  "penetration testing": { parents: ["cybersecurity"] },
  "ethical hacking": { parents: ["cybersecurity"] },
  "network security": { parents: ["cybersecurity"] },
  "owasp": { parents: ["cybersecurity"] },
  "siem": { parents: ["cybersecurity"] },

  // ======================
  // Testing / QA
  // ======================
  "testing": { parents: [] },
  "unit testing": { parents: ["testing"] },
  "integration testing": { parents: ["testing"] },
  "jest": { parents: ["unit testing"] },
  "mocha": { parents: ["unit testing"] },
  "cypress": { parents: ["testing"] },

  // ======================
  // Mobile
  // ======================
  "react native": { parents: ["react"] },
  "flutter": { parents: [] },
  "android": { parents: ["java"] },
  "kotlin": { parents: ["java"] },
  "swift": { parents: [] },

  // ======================
  // System Fundamentals
  // ======================
  "linux": { parents: [] },
  "operating systems": { parents: [] },
  "data structures": { parents: [] },
  "algorithms": { parents: ["data structures"] },
  "system design": { parents: [] }
};

module.exports = { skillGraph };

