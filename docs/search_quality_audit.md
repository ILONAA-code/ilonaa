# Profession Search Quality Audit

Date: 2026-05-29

## Scope

Audited current profession search behavior in:

- `src/lib/assessment/occupations.ts`
- `src/data/onetOccupations.json`

Current ranking logic (simplified):

1. exact title match (`1000`)
2. title prefix (`900`)
3. exact alias/search term (`800`)
4. alias/search term prefix (`750`)
5. title contains (`700`)
6. alias/search term contains (`650`)

No token overlap, no typo tolerance, no semantic mapping, no synonym expansion.

---

## 1) Does "Product Manager" exist?

### Finding

- **No exact canonical O*NET title** named `Product Manager` in current imported occupations.
- It **does exist as imported alias/search term** on multiple occupations, including:
  - `11-2021.00` - `Marketing Managers` (alias includes `Product Manager`)
  - `11-9041.01` - `Biofuels/Biodiesel Technology and Product Development Managers`
  - `11-3071.04` - `Supply Chain Managers`
  - other domain-specific product-manager variants

### Why it is not a clear top user result

- The visible result title is canonical O*NET (`Marketing Managers`), not `Product Manager`.
- Multiple occupations include "product manager" aliases, creating noisy/competing matches.
- Current sort tie-break uses alphabetical canonical title after score, which can feel arbitrary.

---

## 2) If exists: exact occupation title and ranking reason

For the most relevant mapping seen by current ranking:

- Query: `Product Manager`
- Top mapped occupation shown: `Marketing Managers` (`11-2021.00`)
- Reason: exact alias match (`Product Manager`) => score `800`

It is near the top technically, but UX is confusing because users do not see "Product Manager" as canonical title.

---

## 3) If does not exist: closest occupation mapping

### Product Owner

- Exact phrase not present in title/alias/search terms => no result.
- Closest conceptual mappings in current dataset:
  - `Marketing Managers` (contains product-manager aliases)
  - `Project Management Specialists` (closest process role)
- Current algorithm cannot bridge `Product Owner` to those because it requires literal contains/prefix/exact matching.

### Chief of Staff

- Exact phrase not present in title/alias/search terms => no result.
- Closest conceptual mappings in current dataset:
  - `Chief Executives`
  - `General and Operations Managers`
  - `Managers, All Other`
- Current algorithm does not perform conceptual mapping, so no fallback result is shown.

---

## 4) Required Query Tests (Top 10 + explanation + acceptability)

Note: Some queries return fewer than 10 results under current strict matching.

### Query: Product Manager

Top results:
1. `Marketing Managers` (`11-2021.00`) - `800`
2. `Biofuels/Biodiesel Technology and Product Development Managers` (`11-9041.01`) - `650`
3. `Geothermal Production Managers` (`11-3051.02`) - `650`
4. `Online Merchants` (`13-1199.06`) - `650`
5. `Supply Chain Managers` (`11-3071.04`) - `650`

Ranking explanation:
- #1 is exact alias match.
- Others are alias/title contains matches with lower score.

Acceptable?
- **Partially acceptable** (relevant hits exist, but canonical titles are not user-intuitive and include unrelated domain variants).

---

### Query: Product Owner

Top results:
- No matches.

Ranking explanation:
- No exact/prefix/contains occurrence of "product owner" in imported title/alias/search terms.

Acceptable?
- **Not acceptable**.

---

### Query: Financial Controller

Top results:
1. `Treasurers and Controllers` (`11-3031.01`) - `800`

Ranking explanation:
- Exact alias match (`Financial Controller`) mapped to canonical O*NET role.

Acceptable?
- **Acceptable**.

---

### Query: CFO

Top results:
1. `Chief Executives` (`11-1011.00`) - `800`

Ranking explanation:
- Exact alias match (`CFO`) under `Chief Executives`.

Acceptable?
- **Mostly acceptable** (findable, though broad canonical label may feel too generic for some users).

---

### Query: Chief of Staff

Top results:
- No matches.

Ranking explanation:
- Phrase absent in title/alias/search terms. Current ranker has no semantic fallback.

Acceptable?
- **Not acceptable**.

---

### Query: Data Scientist

Top results:
1. `Data Scientists` (`15-2051.00`) - `900`
2. `Biofuels Processing Technicians` (`51-8099.01`) - `650`

Ranking explanation:
- #1 strong title prefix match.
- #2 appears from alias/search-term contains noise.

Acceptable?
- **Acceptable** (primary intent hit is clear at #1).

---

### Query: Software Engineer

Top results:
1. `Software Developers` (`15-1252.00`) - `800`
2. `Computer and Information Systems Managers` (`11-3021.00`) - `750`
3. `Blockchain Engineers` (`15-1299.07`) - `650`
4. `Information Security Engineers` (`15-1299.05`) - `650`
5. `Software Quality Assurance Analysts and Testers` (`15-1253.00`) - `650`
6. `Web and Digital Interface Designers` (`15-1255.00`) - `650`
7. `Web Developers` (`15-1254.00`) - `650`

Ranking explanation:
- Alias exact/prefix on software-family occupations.
- Contains-level matches introduce broad adjacent roles.

Acceptable?
- **Acceptable** (clear top mapping, moderate noise beneath).

---

### Query: Teacher

Top results:
1. `Teachers and Instructors, All Other` (`25-3099.00`) - `900`
2. `Adult Basic Education, Adult Secondary Education, and English as a Second Language Instructors` (`25-3011.00`) - `800`
3. `Business Teachers, Postsecondary` (`25-1011.00`) - `800`
4. `Career/Technical Education Teachers, Middle School` (`25-2023.00`) - `800`
5. `Career/Technical Education Teachers, Postsecondary` (`25-1194.00`) - `800`
6. `Career/Technical Education Teachers, Secondary School` (`25-2032.00`) - `800`
7. `Economics Teachers, Postsecondary` (`25-1063.00`) - `800`
8. `Elementary School Teachers, Except Special Education` (`25-2021.00`) - `800`
9. `English Language and Literature Teachers, Postsecondary` (`25-1123.00`) - `800`
10. `Foreign Language and Literature Teachers, Postsecondary` (`25-1124.00`) - `800`

Ranking explanation:
- Strong plural title prefix for generic teacher family.
- Many tied score `800` results due alias/title containing "teacher".

Acceptable?
- **Acceptable** (good coverage; tie handling could be smarter).

---

### Query: Lawyer

Top results:
1. `Lawyers` (`23-1011.00`) - `900`

Ranking explanation:
- Direct title prefix match.

Acceptable?
- **Acceptable**.

---

### Query: Electrician

Top results:
1. `Electricians` (`47-2111.00`) - `900`
2. `Electrical and Electronics Repairers, Commercial and Industrial Equipment` (`49-2094.00`) - `750`
3. `First-Line Supervisors of Construction Trades and Extraction Workers` (`47-1011.00`) - `750`
4. `First-Line Supervisors of Mechanics, Installers, and Repairers` (`49-1011.00`) - `750`
5. `Helpers--Electricians` (`47-3013.00`) - `750`
6. `Helpers--Production Workers` (`51-9198.00`) - `750`
7. `Aircraft Mechanics and Service Technicians` (`49-3011.00`) - `650`
8. `Audiovisual Equipment Installers and Repairers` (`49-2097.00`) - `650`
9. `Automotive Service Technicians and Mechanics` (`49-3023.00`) - `650`
10. `Avionics Technicians` (`49-2091.00`) - `650`

Ranking explanation:
- Primary occupation is correctly captured at title prefix level.
- Related trade roles included by alias/contains.

Acceptable?
- **Acceptable** (good top hit, some expected long-tail noise).

---

## 5) Search Ranking Weaknesses Identified

1. **Literal phrase dependence**
   - Fails for semantically equivalent titles (`Product Owner`, `Chief of Staff`).

2. **No token-based or overlap scoring**
   - Query with multiple words is not decomposed for robust retrieval.

3. **No acronym/abbreviation expansion layer**
   - Works only when acronym happens to be explicitly in alias data.

4. **Canonical-title mismatch UX**
   - User searches common market title, sees unfamiliar canonical O*NET title first.

5. **Tie-breaking is naive**
   - Alphabetical tie-break among many equal-score results can surface less useful rows.

6. **Contains matching introduces weakly related noise**
   - Especially on broad terms (`product`, `engineer`, `teacher`).

7. **No confidence/intent disambiguation**
   - Search cannot ask or adapt when query is ambiguous.

---

## 6) Proposed Fixes

Priority 1 (quick, high impact):

1. **Add synonym map for high-frequency market titles**
   - Examples:
     - `product owner` -> boost `product manager`, `project management specialist`
     - `chief of staff` -> boost `chief executives`, `general and operations managers`

2. **Token overlap scoring**
   - Score by matched query tokens in title/aliases, not only full string contains.

3. **Plural/singular normalization**
   - Ensure `teacher` and `teachers`, `lawyer` and `lawyers` behave consistently.

4. **Improve tie-break**
   - Prefer:
     - exact alias phrase > prefix alias > token overlap count > canonical title.

Priority 2 (UX quality):

5. **Display matched alias under canonical title**
   - Example: `Marketing Managers` with subtitle `Matched title: Product Manager`.

6. **Add "Did you mean" suggestions for zero-result searches**
   - For queries like `Product Owner`, propose nearest mapped occupations.

7. **Add optional category boosts**
   - For modern product/tech terms, gently prioritize software/digital management families.

Priority 3 (future):

8. **Two-stage retrieval**
   - Fast lexical retrieval + reranker to reduce noise and improve intent mapping.

---

## Conclusion

- `Product Manager` is present only as alias-level mappings, not as canonical O*NET title.
- Current search can retrieve it, but not with consistently clear user-facing relevance.
- The most visible failures are zero-result terms like `Product Owner` and `Chief of Staff`.
- Improving token/synonym logic and tie-break strategy should materially improve search quality without changing model scoring logic.
