# Scoring & Placement Platform Logic

This document explains the multi-layered scoring system of the AI-Powered Placement Intelligence platform, detailing how it calculates Role Readiness for students and Alignment Scores for specific Job Descriptions.

---

## 1. Readiness Score Calculation

### Overall Readiness (`computeOverallReadiness`)
Measures the general placement readiness of a student across all industry standard roles. This score is persistent and updated every time a student updates their resume.

```
Readiness Score = Average(Role Match % for all predefined roles)
```

### Predefined Role Mapping
The platform tracks readiness for five core industrial roles:

| Role | Required Tech Pillar |
|------|----------------------|
| **Frontend** | `react`, `javascript`, `css`, `html`, `typescript` |
| **Backend** | `node.js`, `express`, `postgres`, `sql`, `rest api` |
| **Fullstack** | `react`, `javascript`, `node.js`, `express`, `sql` |
| **Data Analyst** | `python`, `pandas`, `sql`, `excel`, `tableau` |
| **DevOps** | `docker`, `kubernetes`, `linux`, `ci/cd`, `aws` |

---

## 2. JD Ranking Logic (The Saturation Model)

When a specific Job Description (JD) is uploaded, the platform uses a **saturation-based alignment model** instead of strict percentage matching.

### Core Scoring Formula
The final score is a weighted combination of three components:

| Component | Weight | Max Ratio |
|-----------|--------|-----------|
| **Required Skills** | 50% | 1.0 (Boosted) |
| **Preferred Skills** | 25% | 1.0 (Saturated) |
| **Experience** | 25% | 1.2 (Senority Bonus) |

### Hierarchy Weight Matching
We use a **Skill Ontology** with five layers of matching to reward transferable skills:

- **100% (Exact):** `node.js` ↔ `node.js`
- **80% (Parent):** `javascript` ↔ `typescript`
- **70% (Ancestor):** `markup` ↔ `html5`
- **60% (Sibling):** `python` ↔ `node.js` (Interchangeable backend)
- **50% (Domain):** `express` ↔ `react` (Both web technologies)

### The Saturation Threshold
To solve for "Denominator Explosion" (where adding more keywords lowers the score), we apply a **Saturation Point of 75%** for Required Skills.
- If a candidate hits 75% of the weighted requirement list, they get a **100% (1.0) component score**.
- Any additional skill beyond this is "saturated" but serves to solidify the candidate's ranking.

---

## 3. Structural Safeguards

### I. Canonical Mapping (AI Mapping Layer)
The platform uses Gemini as a **Mapper** during ingest. When a resume says "JS (ES6+)", Gemini maps it to the canonical ontology ID `javascript`. This ensures deterministic ranking without relying on fragile string matching.

### II. The Intelligent "Missing Skills" List
A skill is only listed as "Missing" in the UI if the candidate has **zero credit (Weight = 0.0)** for it. 
- If the JD asks for `postgresql` and the student has `mysql`, it will **NOT** be shown as missing because they have sibling credit.

### III. Sensitivity Threshold Gate
A candidate must achieve at least **35% raw match** to be fully scored. 
- Below 35%: Candidate is "Gated" and penalized (Score * 0.4).
- Above 35%: Component weights and saturation are applied.

---

*Last Updated: 2026*
*Version: 2.5 (High Sensitivity Redesign)*
