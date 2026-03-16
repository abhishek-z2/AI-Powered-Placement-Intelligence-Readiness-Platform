# AI-Powered Placement Intelligence & Readiness Platform

## Abstract

Traditional recruitment and placement processes frequently struggle with a lack of transparency and rigid automated screening, leaving students without actionable feedback and recruiters with suboptimal candidate matches. Existing Applicant Tracking Systems (ATS) often operate as "black boxes" that rely on literal keyword counts, failing to grasp the semantic context of a candidate's diverse skill set. This project introduces an AI-Powered Placement Intelligence and Readiness Platform designed to address these critical limitations through semantic document analysis and an ontology-distance-based alignment model.

The platform leverages Large Language Models (LLMs) via the Gemini API to perform canonical skill mapping, transforming raw resume data into a structured and scalable skill ontology. The core of the matching engine implements **Ontology-Distance-Based Semantic Matching** — skills are modelled as nodes in an undirected graph, and similarity is computed via Breadth-First Search (BFS) on that graph, with scores derived from an Exponential Decay Function. A Jaro-Winkler string-similarity layer acts as a fuzzy fallback for lexical variants not captured by the ontology, directly addressing the "Knowledge Incompleteness" problem identified by Maree et al. (base paper).

Built with a modern tech stack—React.js, Node.js, and PostgreSQL—the platform transforms static resumes into dynamic readiness insights, fostering more effective career development and efficient talent acquisition compared to traditional, non-contextual screening frameworks.

---

## Technical Scoring Logic Overview

This document provides a comprehensive explanation of the multi-layered scoring system used in the platform, covering student readiness and recruiter ranking alignment.

---

### 1. Skill Ontology & Canonical Mapping

The foundation of all scoring is the **Skill Ontology** — a domain-specific, directed graph of technical skills covering CSE, Mechanical, ECE, and Civil Engineering domains.

#### 1.1 Canonical Mapping (LLM Layer)
During ingest (resume or JD upload), the Gemini API maps varied terminology to a single canonical ID:
- `"ReactJS"`, `"React.js"`, `"react"` → all map to canonical ID `react`
- `"Postgres"`, `"PostgreSQL"`, `"pg"` → all map to canonical ID `postgresql`

This eliminates surface-level lexical ambiguity before scoring begins, analogous to the NLP pre-processing and concept normalisation step described by **Maree et al. (Section 4.1–4.2)**.

#### 1.2 Graph Construction

The skill ontology is modelled as an undirected graph **G = (V, E)** built from three complementary edge sources:

| Source | Description | Example |
|---|---|---|
| **Parent-Child edges** | Directed hierarchy from `skillGraph` (bidirectional) | `express → node.js` |
| **Sibling edges** | Fully-connected clique within each technology family | `react ↔ angular ↔ vue` |
| **Domain Hub edges** | Virtual hub node per domain connecting all skills in it | `react → __domain__frontend ← html` |

This construction runs once at server startup and is cached as an adjacency list, making all subsequent BFS operations O(V+E) ≈ O(1) amortised.

---

### 2. Skill Similarity: Ontology-Distance-Based Semantic Matching

> *"Skill similarity is computed using graph-distance traversal in the ontology via Breadth-First Search (BFS). The similarity score decays inversely with path length using an Exponential Decay Function."*

#### 2.1 BFS Shortest Path

To measure how "close" two skills are in the ontology, the system runs **BFS** from the student's skill node to the required skill node:

```
distance d(u, v) = minimum number of edges between nodes u and v in G
```

BFS guarantees the **minimum** hop count (shortest path), ensuring the most generous semantically-valid score is always awarded.

#### 2.2 Exponential Decay Scoring

The similarity score is computed using:

```
score(u, v) = λ^d      where λ = 0.8 (Decay Constant)
```

| Graph Distance (d) | Formula | Score | Semantic Meaning |
|---|---|---|---|
| 0 | λ⁰ | **1.00** | Exact canonical match |
| 1 | λ¹ | **0.80** | Direct neighbour (parent, sibling) |
| 2 | λ² | **0.64** | 2-hop path (grandparent, domain-sibling) |
| 3 | λ³ | **0.51** | 3-hop path (broad domain match via hub) |
| ∞ | — | **0.00** | No path in ontology → JW fallback |

**Why λ = 0.8?** The decay constant was chosen so the derived scores are numerically consistent with the empirically validated weights from the pre-BFS system. This provides both mathematical rigour and predictable behaviour.

#### 2.3 Jaro-Winkler Fuzzy Fallback

When BFS returns `d = ∞` (no path exists in the ontology), the system falls back to the **Jaro-Winkler string similarity algorithm**, as used in the base paper (Maree et al., Section 4.6), to compensate for **Knowledge Incompleteness** in the ontology:

```
If JW(stu, req) ≥ 0.88:
    score = min(JW(stu, req) × 0.4, 0.35)   ← penalty-discounted partial credit
```

The 0.35 cap ensures the fuzzy layer is treated as a "soft signal," not a guaranteed match.

---

### 3. Student Readiness Scores

Used to measure a student's preparedness for predefined industry-standard roles.

#### A. Role-wise Readiness
Calculated for five core roles: **Frontend**, **Backend**, **Fullstack**, **Data Analyst**, and **DevOps**.
- **Formula:** `Σ getBestWeight(req, studentSkills)  /  (nRequiredSkills × 0.8)`
- **Saturation Point (0.8):** A student is considered 100% ready for a role if their weighted match total hits 80% of the requirements. This prevents penalisation for missing niche or secondary skills when the core stack is strong.

#### B. Overall Readiness Score
- **Logic:** The overall score is the **Maximum** of all role-wise scores.
- **Rationale:** A student's value is defined by their best fit. Being 100% ready for Frontend but 0% for Data Analyst means they are perfectly placement-ready, not 50% ready.

---

### 4. JD Alignment Ranking (Recruiter View)

When a recruiter uploads a specific Job Description, the platform switches to a **Saturation-Based Alignment Model**.

#### Final Score Composition:
| Component | Weight | Max Ratio |
|-----------|--------|-----------|
| **Required Skills** | 50% | 1.0 (Non-linearly Boosted) |
| **Preferred Skills** | 25% | 1.0 (Saturated at 70%) |
| **Experience** | 25% | 1.2 (Seniority Bonus) |

#### Component Logic:
1. **Required Skills Saturation (0.75):** Matching 75% of weighted requirements grants a full 100% (1.0) component score.
2. **Non-linear Boost:** The required match ratio is raised to the power of **1.2** to give a competitive edge to high-overlap candidates.
3. **Experience Bonus:** Calculated as `StudentExperience / MinRequiredExperience`. Capped at **1.2**, allowing experienced candidates to overachieve in this bucket and rank higher.
4. **Threshold Gate:** Checks the **RAW match** (un-saturated). If a candidate matches less than **35%** of the JD literal requirements, a **0.4× penalty** is applied to their final score, effectively filtering out non-matches.

---

### 5. Global Hard Filters
In addition to the alignment ranking, recruiters can apply hard filters that exclude candidates regardless of their alignment score:
- **Minimum CGPA:** Students below the specified threshold are removed from the result set.
- **Backlog Restriction:** If "Allow Backlogs" is disabled, any student with more than 0 backlogs is excluded.

---

### 6. References
- Maree, M. et al. *"Analysis and shortcomings of e-recruitment systems: Towards a semantics-based approach addressing knowledge incompleteness and context-sensitivity."* (Base Paper)
  - Section 4.1–4.2: Concept extraction and NLP pre-processing
  - Section 4.3: Semantic network construction (informed our graph model)
  - Section 4.6: Jaro-Winkler distance (implemented as fuzzy fallback)

---

*Version: 4.0 (BFS Graph Distance Model)*
*Last Updated: March 2026*
