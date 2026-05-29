# ILONAA Occupation Dataset Audit

Audit date: 2026-05-29

Scope audited:
- Runtime search dataset: `src/data/onetOccupations.json`
- Runtime search logic: `src/lib/assessment/occupations.ts`
- Search UI consumer: `src/components/assessment/ProfessionSelect.tsx`
- Dataset generation source: `src/lib/assessment/jobProfiles.ts`
- Dataset generation script: `scripts/importOnetData.ts`

## 1) Total number of occupations currently available

- **200**

## 2) Total number of unique profession titles

- **200**

## 3) Total number of alternate titles / aliases

- **10** total aliases
- **10** unique aliases

## 4) Total number of searchable terms

Definition used for audit:
- Searchable phrase = canonical title + alternate titles (aliases), because runtime ranking checks these phrase fields directly.

Results:
- **210 total searchable phrases**
- **210 unique searchable phrases**

Additional diagnostic:
- Unique word tokens across canonical titles: **240**  
  (used indirectly via partial-term overlap scoring in `searchOccupations`)

## 5) Source breakdown

Based on current code path and generator behavior:

- **Imported from ONET:** 0 direct occupation rows imported at runtime
  - Current JSON is not produced by ingesting full raw O*NET tables directly.
- **Generated:** 200
  - `scripts/importOnetData.ts` generates `src/data/onetOccupations.json` programmatically.
- **Manually created:** 200
  - Base profession profiles are manually curated in `src/lib/assessment/jobProfiles.ts`.
- **Derived mappings:** 200
  - Each generated row applies derived mappings (category -> RIASEC pair/scores, derived factors, derived baselines, descriptor templates, optional alias normalization).

## 6) Distribution by category

Category distribution (from current profile groups used to generate the dataset):

- finance: **14**
- legal: **12**
- software: **16**
- AI/data: **12**
- healthcare: **14**
- education: **12**
- skilled trades: **12**
- engineering: **14**
- sales: **12**
- marketing: **14**
- HR: **10**
- operations: **24**
- administration: **10**
- science: **10**
- public sector: **10**

Total across requested categories: **200**

## 7) 100 most common searchable profession titles

Note:
- All listed items have equal frequency (**1**) in the current dataset (no duplicate searchable phrases).
- Sorted by frequency (desc), then alphabetically.

1. academic advisor (1)
2. account executive (1)
3. accounts payable specialist (1)
4. accounts receivable specialist (1)
5. administrative assistant (1)
6. ae (1)
7. ai product analyst (1)
8. ai research scientist (1)
9. analytics scientist (1)
10. anesthesiologist (1)
11. applied scientist (1)
12. assembly line operator (1)
13. audit associate (1)
14. automation engineer (1)
15. automotive technician (1)
16. behavioral scientist (1)
17. bi reporting analyst (1)
18. biostatistician (1)
19. bookkeeper (1)
20. brand designer (1)
21. brand manager (1)
22. budget analyst (1)
23. business unit director (1)
24. care coordinator (1)
25. case management assistant (1)
26. case worker (1)
27. channel manager (1)
28. chief compliance officer (1)
29. chief of staff (1)
30. city planner (1)
31. civil engineer (1)
32. client services coordinator (1)
33. clinical laboratory scientist (1)
34. clinical research associate (1)
35. clinical social worker (1)
36. cloud engineer (1)
37. cnc machinist (1)
38. communications director (1)
39. community outreach coordinator (1)
40. compensation analyst (1)
41. compliance analyst (1)
42. computer vision engineer (1)
43. content strategist (1)
44. contract administrator (1)
45. contract paralegal (1)
46. control systems engineer (1)
47. corporate governance analyst (1)
48. corporate lawyer (1)
49. corporate trainer (1)
50. creative director (1)
51. credit analyst (1)
52. curriculum designer (1)
53. customer operations manager (1)
54. customer success director (1)
55. customer success manager (1)
56. cybersecurity engineer (1)
57. data annotation specialist (1)
58. data entry clerk (1)
59. data quality analyst (1)
60. data scientist (1)
61. database administrator (1)
62. developer (1)
63. devops engineer (1)
64. digital marketing manager (1)
65. digital twin engineer (1)
66. director of logistics (1)
67. director of operations (1)
68. dispatch coordinator (1)
69. distribution manager (1)
70. documentation specialist (1)
71. education program manager (1)
72. educational content developer (1)
73. electrical engineer (1)
74. electrician (1)
75. elementary teacher (1)
76. embedded systems engineer (1)
77. emergency management coordinator (1)
78. employment lawyer (1)
79. enterprise account manager (1)
80. enterprise architect (1)
81. environmental scientist (1)
82. executive assistant (1)
83. field service technician (1)
84. finance manager (1)
85. financial controller (1)
86. fleet manager (1)
87. fp&a manager (1)
88. fulfillment operations manager (1)
89. general counsel (1)
90. graphic designer (1)
91. hardware engineer (1)
92. head of people (1)
93. health information manager (1)
94. high school teacher (1)
95. hr analyst (1)
96. hr business partner (1)
97. hr generalist (1)
98. hvac technician (1)
99. implementation specialist (1)
100. industrial engineer (1)

## 8) Exact file(s) currently used for profession search

Direct runtime files:
- `src/components/assessment/ProfessionSelect.tsx`
- `src/lib/assessment/occupations.ts`
- `src/data/onetOccupations.json`

## 9) Current dataset size classification

Current dataset contains:
- **~200 occupations** (exactly 200)
- Not ~500
- Not ~1000
- Not more than 1000

## 10) Realistic maximum size without noticeable UX/performance degradation

Current search approach characteristics:
- `searchOccupations` ranks all occupations then sorts by score on each query update.
- Complexity per query is effectively O(n log n) due to global sort.

Quick benchmark (same algorithm, synthetic scaled lists) showed:
- 200 rows: ~0.10 ms/query
- 500 rows: ~0.14 ms/query
- 1000 rows: ~0.24 ms/query
- 2000 rows: ~0.48 ms/query
- 5000 rows: ~1.18 ms/query
- 10000 rows: ~2.58 ms/query

Practical estimate:
- **1,000 to 2,000 occupations** should be comfortably fast on typical devices.
- **Up to ~5,000 occupations** is likely still acceptable for most users, but lower-end mobile devices may begin to show occasional input jank without debouncing/indexing.

## 11) Recommendation (A/B/C)

### Recommended: **C) Import complete O*NET occupation dataset plus aliases**

Rationale:
- Current search coverage is intentionally curated but narrow (200 occupations, only 10 aliases).
- Alias depth is the largest discoverability gap for real user queries and job-title variants.
- Full O*NET + alias expansion materially improves hit rate and reduces "no match" friction.
- Performance headroom is sufficient for >1000 occupations with current logic.
- This creates a stronger foundation for international title variants and enterprise use cases.

Implementation caution:
- Keep search-layer expansion separate from scoring-layer confidence.  
  If scoring fidelity differs by role, expose clear confidence semantics internally and keep public messaging calibrated.

Fallback option:
- If immediate full import is not desired, do a staged rollout (full occupations first, then aliases), but the target state should still be **C**.
