# ILONAA Alias Layer v2 Review

Date: 2026-05-30  
Branch: `reset-profession-search`

## 1) Aliases added

Exactly the requested aliases were added (no additional aliases):

- Senior Product Manager
- Head of Product
- Chief Product Officer
- Technical Program Manager
- Backend Engineer
- Frontend Engineer
- Prompt Engineer
- MLOps Engineer
- Customer Success Director
- Customer Success Operations Manager
- Revenue Operations Manager
- Head of People
- Head of Design
- Operations Executive
- Analytics Engineer

Data file updated:

- `src/data/ilonaaOccupationAliases.json`

## 2) Mapping table

| Alias | Target O*NET Occupation | O*NET Code |
| --- | --- | --- |
| Senior Product Manager | Marketing Managers | 11-2021.00 |
| Head of Product | Marketing Managers | 11-2021.00 |
| Chief Product Officer | Marketing Managers | 11-2021.00 |
| Technical Program Manager | Project Management Specialists | 13-1082.00 |
| Backend Engineer | Software Developers | 15-1252.00 |
| Frontend Engineer | Software Developers | 15-1252.00 |
| Prompt Engineer | Computer and Information Research Scientists | 15-1221.00 |
| MLOps Engineer | Computer Network Architects | 15-1241.00 |
| Customer Success Director | Sales Managers | 11-2022.00 |
| Customer Success Operations Manager | General and Operations Managers | 11-1021.00 |
| Revenue Operations Manager | Sales Representatives of Services, Except Advertising, Insurance, Financial Services, and Travel | 41-3091.00 |
| Head of People | Human Resources Managers | 11-3121.00 |
| Head of Design | Art Directors | 27-1011.00 |
| Operations Executive | General and Operations Managers | 11-1021.00 |
| Analytics Engineer | Business Intelligence Analysts | 15-2051.01 |

## 3) Before vs After challenge results

Using the same top-100 challenge and same classification logic:

- Before v2:
  - Green: 72
  - Yellow: 12
  - Red: 16
- After v2:
  - Green: 87
  - Yellow: 12
  - Red: 1

Net impact:

- Green: **+15**
- Yellow: **0**
- Red: **-15**

## 4) Updated Green / Yellow / Red totals

- Total tested: **100**
- Green: **87**
- Yellow: **12**
- Red: **1**

Segment detail:

- Modern Knowledge Worker:
  - Green: 48
  - Yellow: 2
  - Red: 0
- Classical Profession:
  - Green: 39
  - Yellow: 10
  - Red: 1

## 5) Remaining RED professions

1. Customer Support Manager (no_match)

## 6) Remaining YELLOW professions

1. Platform Engineer -> Blockchain Engineers (`15-1299.07`), confidence `0.620`
2. Chief Executive Officer -> Chief Executives (`11-1011.00`), confidence `0.668`
3. HVAC Technician -> Geothermal Technicians (`49-9099.01`), confidence `0.612`
4. Lawyer -> Lawyers (`23-1011.00`), confidence `1.000`
5. Pharmacist -> Pharmacists (`29-1051.00`), confidence `1.000`
6. Firefighter -> Firefighters (`33-2011.00`), confidence `1.000`
7. Electrician -> Electricians (`47-2111.00`), confidence `1.000`
8. Carpenter -> Carpenters (`47-2031.00`), confidence `1.000`
9. Physicist -> Physicists (`19-2012.00`), confidence `1.000`
10. Chemist -> Chemists (`19-2031.00`), confidence `1.000`
11. Biologist -> Biologists (`19-1029.04`), confidence `1.000`
12. Economist -> Economists (`19-3011.00`), confidence `1.000`

Note: the last 9 YELLOW entries are canonical matches and are classification artifacts from the current challenge rubric, not low-confidence failures.

## 7) Recommendation

Further broad alias expansion is **not strongly justified now**.

Recommended next step:

1. Keep alias governance tight and only patch high-value misses.
2. Add at most 1-3 targeted aliases for remaining business-critical gaps (for example `Customer Support Manager`, potentially `Platform Engineer` after mapping review).
3. Start real-user testing with current architecture:
   - O*NET Occupations
   - O*NET Aliases
   - Small ILONAA Alias Layer

No market-title layer or LLM is required at this stage based on v2 challenge outcomes.
