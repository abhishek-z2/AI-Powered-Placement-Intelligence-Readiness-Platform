const { GoogleGenerativeAI } = require('@google/generative-ai');
const ontology = require('../utils/skillOntology');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

/**
 * Get the list of all unique canonical skill IDs from our ontology.
 * Refined to exclude broad category labels (values that aren't also keys).
 */
function getCanonicalSkills(options = {}) {
  const { excludeSoftSkills = false } = options;

  const graphKeys = Object.keys(ontology.skillGraph || {});
  const domainKeys = Object.keys(ontology.domainMap || {});
  const aliasKeys = Object.keys(ontology.aliases || {});
  const aliasValues = Object.values(ontology.aliases || {});

  const keys = new Set([
    ...graphKeys,
    ...domainKeys,
    ...aliasKeys,
    ...aliasValues
  ]);

  let skillList = Array.from(keys).filter(k => k && typeof k === 'string');

  // Filter out soft skills if requested (used for JD extraction)
  if (excludeSoftSkills) {
    skillList = skillList.filter(s => ontology.domainMap[s] !== 'soft_skills');
  }

  // Final sanitization: remove known broad categories that don't represent specific tools/tech
  const broadCategories = [
    'computer_science_fundamentals',
    'soft_skill',
    'backend_framework',
    'frontend_framework',
    'programming_language',
    'sql_database',
    'nosql_database',
    'digital_literacy',
    'computer_science',
    'oop',
    'algorithms',
    'data structures',
    'version_control',
    'containerization',
    'iac',
    'cloud',
    'devops',
    'fundamental'
  ];

  return skillList
    .filter(s => !broadCategories.includes(s))
    .sort();
}

const CANONICAL_SKILLS = getCanonicalSkills();
const TECH_ONLY_SKILLS = getCanonicalSkills({ excludeSoftSkills: true });

/**
 * Extract structured resume data from raw resume text.
 */
async function extractResumeData(resumeText, departmentContext = 'Computer Science') {
  const prompt = `
You are a career-focused resume parser for the APJ Abdul Kalam Technological University (KTU). 
Extract information from the resume below for a student in the ${departmentContext} department.
Return ONLY a valid JSON object.

ONTOLOGY MAPPING RULE:
For every technical skill or core subject found, map it to the closest matching ID from the "CANONICAL_SKILLS" list provided below.
- If a skill has multiple variations (e.g. "ReactJS", "React.js"), use the exact ID from the list.
- If a core subject like "Thermodynamics" or "DSP" is mentioned, include it in technical_skills.
- If NO match exists for a skill, map it to its general domain (e.g., "Any CAD software" -> "cad_software").

CANONICAL_SKILLS:
${CANONICAL_SKILLS.join(', ')}

Required JSON format:
{
  "name": "string",
  "department": "string (confirm given: ${departmentContext})",
  "year": number or null,
  "cgpa": number or null,
  "backlogs": number (default 0),
  "activity_points": number (estimate from extracurriculars/volunteering, default 0),
  "technical_skills": ["canonical_skill1", "canonical_skill2"],
  "soft_skills": ["skill1", "skill2"],
  "experience_years": number,
  "projects": [
    {
      "name": "string",
      "tech_stack": ["canonical_skill1", "canonical_skill2"],
      "description": "string"
    }
  ],
  "suggested_roles": ["role1", "role2"]
}

Rules:
- suggested_roles must be relevant to the ${departmentContext} department.
- For CS: frontend, backend, fullstack, data_analyst, devops
- For Mech: design_engineer, thermal_engineer, production_engineer, automotive_engineer
- For ECE/EEE: embedded_engineer, vlsi_designer, signal_processing, electrical_engineer
- For Civil: structural_engineer, bim_modeler, site_engineer, environmental_engineer
- Look for keywords like "Arrears" for backlogs.
- Return ONLY the JSON, no Markdown fences.

Resume:
${resumeText}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();

  return JSON.parse(cleaned);
}

/**
 * Extract structured JD data from raw job description text.
 */
async function extractJDData(jdText) {
  const prompt = `
You are an expert recruiter parsing a Job Description (JD). Extract information and return ONLY a valid JSON object.
TASK DEFINITION:

Extract only concrete, verifiable technical skills that can be directly matched against resumes.

Ignore:
- Soft skills
- Behavioral traits
- Academic fundamentals
- Generic concepts
- Vague categories

This system does NOT evaluate personality or mindset.
Only technical stack components.

ONTOLOGY MAPPING RULE:
You MUST map every extracted skill to one of the IDs in the "CANONICAL_SKILLS" list below.
- Maximum 15 skills for the whole JD.
- If a skill in JD isn't in the list, use the closest existing tech family (e.g., "Tailwind" -> "css").
- Split compound skills: "Node/Express" -> ["node.js", "express"].
- Be aggressive in mapping: "RESTful API Integration" should just be "rest api".

1. DO NOT extract soft skills under any circumstance.
   The system rejects them. Remove:
   - communication, analytical thinking, teamwork, leadership, etc.

2. DO NOT extract academic fundamentals or vague categories:
   - computer science fundamentals
   - data structures, algorithms (unless a specific implementation language is mentioned)
   - OOP, backend_framework, frontend_framework
   - basic digital literacy (microsoft office, word, excel)

3. STRATEGY:
   - If the JD says "Experience with React", extract "react".
   - If the JD says "Strong problem solver", extract NOTHING.
   - If the JD says "Node/Express stack", extract ["node.js", "express"].

CANONICAL_SKILLS (TECH ONLY):
${TECH_ONLY_SKILLS.join(', ')}

Required JSON format:
{
  "role": "string",
  "required_skills": ["canonical_skill1", "canonical_skill2"],
  "preferred_skills": ["canonical_skill1", "canonical_skill2"],
  "min_experience_years": number,
  "min_cgpa": number or null,
  "allow_backlogs": boolean (default true unless "no backlogs" or "no arrears" mentioned)
}

Rules:
- Return ONLY the JSON.

Job Description:
${jdText}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();

  return JSON.parse(cleaned);
}

/**
 * Generate interview questions for a student based on their skills.
 */
async function generateInterviewQuestions(studentName, technicalSkills, suggestedRoles) {
  const prompt = `
Generate 8 interview questions for a candidate with the following profile:
- Name: ${studentName}
- Technical Skills: ${technicalSkills.join(', ')}
- Target Roles: ${suggestedRoles.join(', ')}

Return ONLY a valid JSON array of question strings. No extra text.
Format: ["Question 1?", "Question 2?", ...]
Mix of: technical (60%), behavioral (20%), situational (20%).
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();

  return JSON.parse(cleaned);
}

module.exports = { extractResumeData, extractJDData, generateInterviewQuestions };
