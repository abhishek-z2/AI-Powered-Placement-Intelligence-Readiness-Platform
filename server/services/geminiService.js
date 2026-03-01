const { GoogleGenerativeAI } = require('@google/generative-ai');
const ontology = require('../utils/skillOntology');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

/**
 * Get the list of all unique canonical skill IDs from our ontology.
 */
function getCanonicalSkills() {
  const keys = new Set([
    ...Object.keys(ontology.skillGraph),
    ...Object.values(ontology.skillGraph),
    ...Object.keys(ontology.domainMap),
    ...Object.keys(ontology.aliases),
    ...Object.values(ontology.aliases)
  ]);
  return Array.from(keys).sort();
}

const CANONICAL_SKILLS = getCanonicalSkills();

/**
 * Extract structured resume data from raw resume text.
 */
async function extractResumeData(resumeText) {
  const prompt = `
You are a career-focused resume parser. Extract information from the resume below and return ONLY a valid JSON object.

ONTOLOGY MAPPING RULE:
For every technical skill found, map it to the closest matching ID from the "CANONICAL_SKILLS" list provided below.
- Do NOT invent new skill names if a match exists.
- If a skill has multiple words, check if they exist independently in the list.
- If NO match exists for a skill, discard it or map it to the closest higher-level concept (e.g., "Azure" if specific Azure service not found).

CANONICAL_SKILLS:
${CANONICAL_SKILLS.join(', ')}

Required JSON format:
{
  "name": "string",
  "department": "string or empty",
  "year": number or null,
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
- suggested_roles must be from: frontend, backend, fullstack, data_analyst, devops
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

ONTOLOGY MAPPING RULE:
You MUST map every extracted skill to one of the IDs in the "CANONICAL_SKILLS" list below.
- Maximum 15 skills for the whole JD.
- If a skill in JD isn't in the list, use the closest existing tech family (e.g., "Tailwind" -> "css").
- Split compound skills: "Node/Express" -> ["node.js", "express"].
- Be aggressive in mapping: "RESTful API Integration" should just be "rest api".

CANONICAL_SKILLS:
${CANONICAL_SKILLS.join(', ')}

Required JSON format:
{
  "role": "string",
  "required_skills": ["canonical_skill1", "canonical_skill2"],
  "preferred_skills": ["canonical_skill1", "canonical_skill2"],
  "min_experience_years": number
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
