# Final Mapping Freeze

Freeze date: 2026-05-29

Status: **Profession layer frozen for production**

Scope: This freeze applies only to founder-approved low-confidence modern profession mappings.  
No architecture, scoring, RIASEC, O*NET import, or search algorithm changes are introduced.

---

## Final Founder Mapping Table

| Market Title | Final O*NET Mapping | O*NET Code | Mapping Confidence | Founder Rationale |
| --- | --- | --- | ---: | --- |
| Chief of Staff | General and Operations Managers | 11-1021.00 | 0.83 | Better governance/operations anchor than broad managerial catch-all. |
| CTO | Chief Executives | 11-1011.00 | 0.90 | Treated as executive governance/accountability role, not operational IT management. |
| Chief Technology Officer | Chief Executives | 11-1011.00 | 0.90 | Treated as executive governance/accountability role, not operational IT management. |
| CIO | Chief Executives | 11-1011.00 | 0.90 | Treated as executive governance/accountability role, not operational IT management. |
| Chief Information Officer | Chief Executives | 11-1011.00 | 0.90 | Treated as executive governance/accountability role, not operational IT management. |
| Customer Success Manager | Sales Representatives of Services, Except Advertising, Insurance, Financial Services, and Travel | 41-3091.00 | 0.86 | Closer to day-to-day customer portfolio and service relationship ownership. |
| Customer Success Director | Sales Managers | 11-2022.00 | 0.85 | Leadership-level customer success oversight best represented by sales management baseline. |
| Customer Success Operations Manager | General and Operations Managers | 11-1021.00 | 0.84 | Ops-heavy role best represented by cross-functional operational management baseline. |
| Customer Experience Manager | General and Operations Managers | 11-1021.00 | 0.83 | Cross-functional CX ownership aligns with operations governance baseline. |
| Customer Support Manager | Sales Managers | 11-2022.00 | 0.83 | Support-leadership proxy remains acceptable under customer leadership management track. |
| Design Systems Engineer | Web and Digital Interface Designers | 15-1255.00 | 0.82 | Closest digital product/UI system design baseline currently available in O*NET layer. |

---

## Governance Principle for Executive / Board-Level Roles

For executive and board-adjacent roles, ILONAA mapping governance prioritizes:

- accountability ownership
- governance responsibility
- strategic decision consequence
- organizational risk ownership

Therefore:

- CTO -> Chief Executives (`11-1011.00`)
- CIO -> Chief Executives (`11-1011.00`)

This is intentional and should not be interpreted as day-to-day task-similarity mapping.

---

## Freeze Confirmation

Confirmed for freeze:

- Market Title Layer remains in place.
- O*NET remains internal source of truth.
- User-facing search shows market titles.
- Results continue to display selected market title.
- Profession baselines and scoring internals remain unchanged.

No additional profession-title expansion or search-logic redesign is included in this freeze.
