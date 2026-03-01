# Readiness Score Documentation

This document details all the relevant files, functions, and data used to calculate the readiness score in the AI-Powered Placement Intelligence Readiness Platform.

---

## Table of Contents

1. [Overview](#overview)
2. [Relevant Files](#relevant-files)
3. [Data Flow](#data-flow)
4. [Input Data](#input-data)
5. [Processing Functions](#processing-functions)
6. [Output Data](#output-data)
7. [Database Schema](#database-schema)
8. [Skill Mapping](#skill-mapping)

---

## Overview

The **Readiness Score** measures how prepared a student is for specific roles based on their technical skills. It calculates role-wise readiness percentages and an overall average across all defined roles.

---

## Relevant Files

| File | Purpose |
|------|---------|
| `server/services/rankingService.js` | Core scoring logic - contains `computeRoleReadiness` and `computeOverallReadiness` functions |
| `server/utils/roleSkillMap.js` | Defines the mapping of roles to required skills |
| `server/utils/normalizeSkills.js` | Utility for normalizing skill strings (lowercase, trim) |
| `server/utils/skillGraph.js` | Skill hierarchy graph for parent-child relationships |
| `server/routes/students.js` | API routes that trigger readiness calculation |
| `server/db/schema.sql` | Database schema for students table |

---

## Data Flow

```
1. Student uploads resume (PDF)
        ↓
2. Gemini AI extracts technical_skills from resume
        ↓
3. normalizeSkills() converts skills to lowercase/trimmed
        ↓
4. computeRoleReadiness() calculates per-role readiness
        ↓
5. computeOverallReadiness() calculates average across all roles
        ↓
6. Score stored in students.readiness_score in database
```

---

## Input Data

### From Resume (via Gemini AI)
- **technical_skills**: Array of strings (e.g., `['react', 'javascript', 'python']`)
- **soft_skills**: Array of strings (optional)
- **name**: Student name
- **department**: Academic department
- **year**: Academic year
- **experience_years**: Years of professional experience

### From Configuration
- **roleSkillMap**: Predefined mapping of roles to required skills (from `roleSkillMap.js`)

---

## Processing Functions

### 1. normalizeSkills(skills)

**Location:** `server/utils/normalizeSkills.js`

**Purpose:** Normalize skill strings for consistent matching

**Process:**
1. Filter out non-strings and empty strings
2. Convert each skill to lowercase
3. Trim whitespace from each skill

```javascript
// Input: ["React", "  JavaScript  ", "", "Node.js"]
// Output: ["react", "javascript", "node.js"]
```

---

### 2. computeRoleReadiness(technicalSkills)

**Location:** `server/services/rankingService.js`

**Purpose:** Calculate readiness percentage for each role

**Logic:**
```javascript
function computeRoleReadiness(technicalSkills = []) {
    const studentSkills = new Set(technicalSkills.map(s => s.toLowerCase().trim()));
    const readiness = {};

    for (const [role, requiredSkills] of Object.entries(roleSkillMap)) {
        const matched = requiredSkills.filter(s => studentSkills.has(s)).length;
        readiness[role] = requiredSkills.length > 0 ? matched / requiredSkills.length : 0;
    }

    return readiness;
}
```

**Formula:**
```
Role Readiness = (Matched Skills / Total Required Skills for Role) × 100
```

**Example:**
- Role: Frontend Developer
- Required Skills: `['react', 'javascript', 'css', 'html', 'typescript']` (5 skills)
- Student Skills: `['react', 'javascript', 'html']` (3 matched)
- Readiness: `3 / 5 = 0.6` (60%)

---

### 3. computeOverallReadiness(technicalSkills)

**Location:** `server/services/rankingService.js`

**Purpose:** Calculate average readiness across all roles

**Logic:**
```javascript
function computeOverallReadiness(technicalSkills = []) {
    const readiness = computeRoleReadiness(technicalSkills);
    const values = Object.values(readiness);
    if (values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
}
```

**Formula:**
```
Overall Readiness = Σ(Role Readiness) / Number of Roles
```

---

## Output Data

### Role Readiness Object
Returns an object with readiness for each role:

```javascript
{
    frontend: 0.6,      // 60%
    backend: 0.4,      // 40%
    data_analyst: 0.8, // 80%
    fullstack: 0.5,    // 50%
    devops: 0.2        // 20%
}
```

### Overall Readiness
Returns a single float value (0-1):

```javascript
0.5  // 50% overall readiness
```

### Database Storage
The overall readiness score is stored in:
- `students.readiness_score` (FLOAT)

---

## Database Schema

### students Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| user_id | UUID | Foreign key to users |
| name | TEXT | Student name |
| department | TEXT | Academic department |
| year | INT | Academic year |
| experience_years | FLOAT | Years of experience |
| technical_skills | TEXT[] | Array of tech skills |
| soft_skills | TEXT[] | Array of soft skills |
| readiness_score | FLOAT | Calculated readiness (0-1) |
| suggested_roles | TEXT[] | AI-suggested roles |
| created_at | TIMESTAMP | Creation timestamp |

---

## Skill Mapping

### roleSkillMap (from `server/utils/roleSkillMap.js`)

```javascript
const roleSkillMap = {
    frontend: ['react', 'javascript', 'css', 'html', 'typescript'],
    backend: ['node.js', 'express', 'postgres', 'sql', 'rest api'],
    data_analyst: ['python', 'pandas', 'sql', 'excel', 'tableau'],
    fullstack: ['react', 'javascript', 'node.js', 'express', 'sql'],
    devops: ['docker', 'kubernetes', 'linux', 'ci/cd', 'aws'],
};
```

### Role Descriptions

| Role | Required Skills | Description |
|------|-----------------|-------------|
| **Frontend Developer** | react, javascript, css, html, typescript | 5 skills - UI/UX development |
| **Backend Developer** | node.js, express, postgres, sql, rest api | 5 skills - Server-side development |
| **Data Analyst** | python, pandas, sql, excel, tableau | 5 skills - Data analysis & visualization |
| **Full Stack Developer** | react, javascript, node.js, express, sql | 5 skills - Full web development |
| **DevOps Engineer** | docker, kubernetes, linux, ci/cd, aws | 5 skills - Infrastructure & deployment |

---

## API Endpoint

### POST /students/upload-resume

**Trigger:** Student uploads PDF resume

**Process:**
1. Extract text from PDF
2. Call Gemini AI to extract structured data
3. Normalize skills
4. Calculate readiness scores
5. Store in database

**Response:**
```json
{
  "student": {
    "id": 1,
    "name": "John Doe",
    "department": "Computer Science",
    "year": 3,
    "experience_years": 2,
    "technical_skills": ["react", "javascript", "python"],
    "readiness_score": 0.65,
    "roleReadiness": {
      "frontend": 0.6,
      "backend": 0.4,
      "data_analyst": 0.8,
      "fullstack": 0.5,
      "devops": 0.2
    }
  }
}
```

---

## Summary

The readiness score calculation involves:

1. **Input:** Raw technical skills from student's resume (extracted via Gemini AI)
2. **Processing:** 
   - Normalize skills (lowercase, trim)
   - Compare against role-specific skill requirements
   - Calculate per-role and overall percentages
3. **Output:** 
   - Role-wise readiness (5 roles)
   - Overall readiness score (0-1)
4. **Storage:** Persisted in `students.readiness_score` database column

---

*Last Updated: 2024*
*Version: 1.0*

