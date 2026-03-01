# Ranking Logic Documentation (JD-Based)

This document details all the relevant files, functions, and data used to rank students against a Job Description (JD) in the AI-Powered Placement Intelligence Readiness Platform.

---

## Table of Contents

1. [Overview](#overview)
2. [Relevant Files](#relevant-files)
3. [Data Flow (New Architecture)](#data-flow)
4. [Input Data](#input-data)
5. [Scoring Algorithm (Saturation Model)](#scoring-algorithm)
6. [Threshold Gate (Revised)](#threshold-gate)
7. [Output Data](#output-data)
8. [Example Calculations](#example-calculations)

---

## Overview

The **Ranking Logic 2.0** uses a **Saturation-Based Alignment Model** to rank students against a Job Description. It solves the "Denominator Explosion" issue where missing a few secondary keywords would tank a candidate's score.

It evaluates:
1. **Required Skills (50% weight)** - Uses saturation (75% match = 100% score) and hierarchy matching.
2. **Preferred Skills (25% weight)** - Uses saturation (70% match = 100% score).
3. **Experience (25% weight)** - Rewards seniority with a 20% overqualification bonus.

---

## Relevant Files

| File | Purpose |
|------|---------|
| `server/services/rankingService.js` | Core ranking wrapper - handles DB fetching and result mapping. |
| `server/utils/skillOntology.js` | **Core Logic Engine**: Contains the `computeScore` function, skill graph, sibling groups, domain mapping, and canonical aliases. |
| `server/services/geminiService.js` | **Canonical Mapper**: Uses AI to map resume/JD skills to the ontology IDs. |
| `server/db/schema.sql` | Database schema for students and projects. |

---

## Data Flow (New Architecture)

To ensure high accuracy and deterministic results, the platform follows this strictly controlled flow:

```
1. JD/Resume Uploaded
        ↓
2. Gemini AI performs "Canonical Mapping"
   (Maps "Node JS" → "node.js", "RESTful" → "rest api" using the Ontology list)
        ↓
3. Normalized skills stored in Database
        ↓
4. rankStudents() triggers computeScore()
        ↓
5. saturationPoint applied (e.g., hitting 6/8 skills = 100% Required Match)
        ↓
6. Missing Skills filter checks for zero-weight associations only
        ↓
7. Final Score returned (0–100%)
```

---

## Scoring Algorithm (Saturation Model)

### Step 1: Hierarchy-Based Match Weights

For every required skill, the engine calculates the best match among student skills:

| Match Type | Weight | Description |
|------------|--------|-------------|
| **Exact Match** | 1.0 | Student has the exact canonical skill. |
| **Direct Parent** | 0.8 | Student has a parent skill (e.g., `javascript` matches `typescript`). |
| **Indirect Ancestor** | 0.7 | Student has a skill 2+ levels up in the hierarchy. |
| **Sibling Match** | 0.6 | Skills in the same family (e.g., `python` matches `node.js` for backend). |
| **Domain Match** | 0.5 | Both skills share a domain (e.g., `react` and `sass` share `frontend`). |
| **No Relation** | 0.0 | No relationship found. |

### Step 2: Saturation Ratio (Solving Denominator Explosion)

Recruiters don't need 100% keyword parity; they need "enough" coverage.

```javascript
// Required Saturation = 75%
const saturationPoint = totalRequiredSkills * 0.75;
const requiredMatchRatio = Math.min(totalWeightedMatch / saturationPoint, 1.0);
```
*If a JD has 8 skills, a candidate reaching a weighted total of 6.0 gets a 100% Required Match.*

### Step 3: Threshold Gate

A softer gate is applied to the **raw** (un-saturated) ratio to prevent false negatives for strong candidates using different stacks.

*   **Raw Match < 35%**: Penalty applied (`rawRatio * 0.4`), Gate = `TRUE`.
*   **Raw Match ≥ 35%**: Full scoring with boost enabled.

### Step 4: Non-Linear Boost

Applied to the saturated ratio to give a slight edge to elite matches:
```javascript
boostedRequired = Math.pow(requiredMatchRatio, 1.2)
```

### Step 5: Experience Bonus

Rewards seniority by allowing scores above 100% for the experience component.
```javascript
experienceScore = Math.min(studentExperience / minRequiredExperience, 1.2)
```
*A candidate with 6 years experience for a 3-year requirement receives a 20% bonus in the experience bucket.*

---

## Threshold Gate (Revised)

The new gate is less aggressive to account for the breadth of modern tech stacks.

| Raw Match | Final Status | Effect |
|-----------|--------------|--------|
| **< 35%** | **Gated** | Score is slashed; Preferred skills & Experience not counted. |
| **35% – 50%**| **Safe** | Candidate is considered "Developing"; all components counted. |
| **> 50%** | **Strong** | Full component scoring + non-linear boost logic. |

---

## Output Data

### The "Intelligent" Missing Skills List
Unlike traditional ATS, we only show a skill as "Missing" if the candidate has **zero relationship** (Weight = 0) to it.
*   If a student has `python` and the JD asks for `node.js`, it is **NOT** listed as missing because they have a sibling match (Weight 0.6).

---

## Example Calculation

**JD:** Full Stack (React, Node, Postgres, AWS), 3 years min.
**Student:** (React, Java, MySQL), 5 years exp.

1. **Required Weights:**
   - React (1.0) + Node (0.6 - sibling) + Postgres (0.6 - sibling) = **2.2**
   - Saturation Point: `4 * 0.75 = 3.0`
   - **requiredMatchRatio:** `2.2 / 3.0 = 0.73`
2. **Gate:** Raw Ratio `2.2 / 4 = 0.55`. (Pass ✅)
3. **Preferred:** 0 (Skip)
4. **Experience:** `min(5/3, 1.2) = 1.2`
5. **Final Result:**
   - `(0.73^1.2 * 0.5) + (0 * 0.25) + (1.2 * 0.25) = 0.34 + 0 + 0.3 = 0.64 (64%)`

---

*Last Updated: March 2026*
*Version: 2.1 (Saturation Model)*
