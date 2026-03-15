# AI-Powered Placement Intelligence & Readiness Platform

## Abstract

Traditional recruitment and placement processes frequently struggle with a lack of transparency and rigid automated screening, leaving students without actionable feedback and recruiters with suboptimal candidate matches. Existing Applicant Tracking Systems (ATS) often operate as "black boxes" that rely on literal keyword counts, failing to grasp the semantic context of a candidate's diverse skill set. This project introduces an AI-Powered Placement Intelligence and Readiness Platform designed to address these critical limitations through semantic document analysis and deterministic alignment models. The platform leverages Large Language Models (LLMs) via the Gemini API to perform canonical skill mapping, transforming raw resume data into a structured and scalable skill ontology. A key highlight is the multi-layered scoring system, featuring a Saturation-Based Alignment Model that prioritizes skill depth and transferable knowledge over simple keyword density. For students, the system computes role-wise readiness scores, identifying the most appropriate "best-fit" career path across core industry roles. For recruiters, it provides a sophisticated ranking engine that incorporates required and preferred skills, experience bonuses, and non-linear boost logic to identify top talent accurately. Furthermore, the system implements structural safeguards like threshold gates and intelligent sibling-match recognition to ensure enhanced human-like interpretability of candidate profiles. Built with a modern tech stack—React.js, Node.js, and PostgreSQL—the platform transforms static resumes into dynamic readiness insights, fostering more effective career development and efficient talent acquisition compared to traditional, non-contextual screening frameworks.

---

## Technical Scoring Logic Overview

This document provides a comprehensive explanation of the multi-layered scoring system used in the platform, covering student readiness and recruiter ranking alignment.

### 1. Skill Ontology & Canonical Mapping
The foundation of all scoring is the **Skill Ontology**. To ensure deterministic results and avoid the pitfalls of fragile keyword matching, the platform uses an AI-driven mapping layer:
- **Canonical Mapping:** During ingest (resume or JD upload), the Gemini API maps varied terminology (e.g., "Vanilla JS", "ES6+", "Javascript") to a single canonical ID (`javascript`).
- **Hierarchy Matching:** Skills are connected via a graph. The system recognizes:
    - **Exact Match (1.0):** Canonical IDs are identical.
    - **Direct Parent (0.8):** Student has a parent skill (e.g., `javascript` matches `typescript` requirement).
    - **Indirect Ancestor (0.7):** Student has a skill 2+ levels up in the hierarchy.
    - **Sibling Match (0.6):** Skills in the same tech family (e.g., `python` matches `node.js` for backend roles).
    - **Domain Match (0.5):** Skills sharing a broad domain (e.g., `react` and `sass` both being `frontend`).

---

### 2. Student Readiness Scores
Used to measure a student's preparedness for predefined industry-standard roles.

#### A. Role-wise Readiness
Calculated for five core roles: **Frontend**, **Backend**, **Fullstack**, **Data Analyst**, and **DevOps**.
- **Formula:** `Matched Skills Weight / Required Skills for Role`
- **Saturation Point (0.8):** A student is considered 100% ready for a role if their weighted match total hit 80% of the requirements. This prevents penalization for missing niche or secondary skills if the core stack is strong.

#### B. Overall Readiness Score
- **Logic:** The overall score is the **Maximum** of all role-wise scores.
- **Rationale:** A student's value is defined by their best fit. Being 100% ready for Frontend but 0% for Data Analyst means they are perfectly ready for a placement, not 50% ready.

---

### 3. JD Alignment Ranking (Recruiter View)
When a recruiter uploads a specific Job Description, the platform switches to a **Saturation-Based Alignment Model**.

#### Final Score Composition:
| Component | Weight | Max Ratio |
|-----------|--------|-----------|
| **Required Skills** | 50% | 1.0 (Boosted) |
| **Preferred Skills** | 25% | 1.0 (Saturated) |
| **Experience** | 25% | 1.2 (Seniority Bonus) |

#### Component Logic:
1. **Required Skills Saturation (0.75):** Matching 75% of weighted requirements grants a full 100% (1.0) component score.
2. **Non-linear Boost:** The required match ratio is raised to the power of **1.2** to give a competitive edge to high-overlap candidates.
3. **Experience Bonus:** Calculated as `StudentExperience / MinRequiredExperience`. It is capped at **1.2**, allowing experienced candidates to overachieve in this bucket and rank higher.
4. **Threshold Gate:** A security layer that checks the **RAW match** (un-saturated). If a candidate matches less than **35%** of the JD literal requirements, a **0.4x penalty** is applied to their final score, effectively filtering out non-matches.

---

### 4. Global Hard Filters
In addition to the alignment ranking, recruiters can apply hard filters that exclude candidates regardless of their alignment score:
- **Minimum CGPA:** Students below the specified threshold are removed from the result set.
- **Backlog Restriction:** If "Allow Backlogs" is disabled, any student with more than 0 backlogs is excluded.

---

*Version: 3.0 (Consolidated)*
*Last Updated: March 2026*
