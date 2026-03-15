# AI-Powered Placement Intelligence & Readiness Platform

## Abstract

Traditional recruitment and placement processes frequently struggle with a lack of transparency and rigid automated screening, leaving students without actionable feedback and recruiters with suboptimal candidate matches. Existing Applicant Tracking Systems (ATS) often operate as "black boxes" that rely on literal keyword counts, failing to grasp the semantic context of a candidate's diverse skill set. This project introduces an AI-Powered Placement Intelligence and Readiness Platform designed to address these critical limitations through semantic document analysis and deterministic alignment models. The platform leverages Large Language Models (LLMs) via the Gemini API to perform canonical skill mapping, transforming raw resume data into a structured and scalable skill ontology. A key highlight is the multi-layered scoring system, featuring a Saturation-Based Alignment Model that prioritizes skill depth and transferable knowledge over simple keyword density. For students, the system computes role-wise readiness scores, identifying the most appropriate "best-fit" career path across core industry roles. For recruiters, it provides a sophisticated ranking engine that incorporates required and preferred skills, experience bonuses, and non-linear boost logic to identify top talent accurately. Furthermore, the system implements structural safeguards like threshold gates and intelligent sibling-match recognition to ensure enhanced human-like interpretability of candidate profiles. Built with a modern tech stack—React.js, Node.js, and PostgreSQL—the platform transforms static resumes into dynamic readiness insights, fostering more effective career development and efficient talent acquisition compared to traditional, non-contextual screening frameworks.

## Project Structure

- **Client:** React.js frontend providing dashboards for Students, Recruiters, and Placement Officers.
- **Server:** Node.js/Express backend with PostgreSQL for data management.
- **AI Engine:** Integration with Gemini API for resume parsing and Job Description analysis.
- **Ontology Engine:** Multi-layered skill graph for semantic matching and partial credit.

## Scoring Systems

Full technical details on our scoring methodologies can be found in [server/SCORING_LOGIC.md](server/SCORING_LOGIC.md).

1. **Student Readiness:** Measured against industry roles using an 80% saturation model.
2. **JD Alignment:** Ranked using a 50/25/25 weighted model for Required Skills, Preferred Skills, and Experience.
3. **Canonical Mapping:** Ensuring term-independent matching (e.g., "Node.js" ↔ "NodeJS").
4. **Hard Filters:** CGPA and Backlog restrictions for recruiter control.
