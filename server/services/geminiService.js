const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

/**
 * Extract structured resume data from raw resume text.
 */
async function extractResumeData(resumeText) {
    const prompt = `
You are a resume parser. Extract information from the resume below and return ONLY a valid JSON object with no extra text, no markdown, no code blocks.

Required JSON format:
{
  "name": "string",
  "department": "string or empty",
  "year": number or null,
  "technical_skills": ["skill1", "skill2"],
  "soft_skills": ["skill1", "skill2"],
  "experience_years": number,
  "projects": [
    {
      "name": "string",
      "tech_stack": ["tech1", "tech2"],
      "description": "string"
    }
  ],
  "suggested_roles": ["role1", "role2"]
}

Rules:
- technical_skills and soft_skills must be arrays of strings
- experience_years is a number (0 if fresher/student)
- suggested_roles should be 1-3 roles from: frontend, backend, fullstack, data_analyst, devops
- Return ONLY the JSON, nothing else

Resume:
${resumeText}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip any accidental markdown code fences
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    console.log(cleaned)

    return JSON.parse(cleaned);
}

/**
 * Extract structured JD data from raw job description text.
 */
async function extractJDData(jdText) {
    const prompt = `
You are a job description parser. Extract information from the JD below and return ONLY a valid JSON object.

Required JSON format:
{
  "role": "string",
  "required_skills": ["skill1", "skill2"],
  "preferred_skills": ["skill1", "skill2"],
  "min_experience_years": number
}

Rules:
- required_skills and preferred_skills must be arrays of strings
- min_experience_years is a number (0 if not mentioned)
- Return ONLY the JSON, nothing else

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
