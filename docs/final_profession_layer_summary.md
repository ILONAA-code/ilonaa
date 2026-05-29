# Final Profession Layer Summary

Generated: 2026-05-29T22:09:40.668Z

- total visible profession titles: **1990**
- total accepted titles (Class A raw): **1993**
- total rejected titles (Class B + C deferred/rejected): **8100**

## Freeze Rule Applied

- Only Class A titles (confidence >= 0.85) are accepted into the production-visible layer.
- Class B and Class C are stored for future review and are not exposed in production search.
- Executive acronyms are retained as internal aliases and collapse to preferred full titles.

## Examples of Accepted Titles

- Electrician -> 47-2111.00 (0.97)
- Lawyer -> 23-1011.00 (0.97)
- Data Scientist -> 15-2051.00 (0.96)
- Financial Controller -> 11-3031.01 (0.96)
- Software Engineer -> 15-1252.00 (0.96)
- Product Manager -> 11-2021.00 (0.93)
- Chief Information Officer -> 11-1011.00 (0.92)
- Chief Technology Officer -> 11-1011.00 (0.92)
- Architectural And Engineering Manager -> 11-9041.00 (0.90)
- Chief Executive -> 11-1011.00 (0.89)
- Conservation Scientist -> 19-1031.00 (0.89)
- Dietetic Technician -> 29-2051.00 (0.89)
- Political Scientist -> 19-3094.00 (0.89)
- Product Owner -> 13-1082.00 (0.89)
- Self-enrichment Teacher -> 25-3021.00 (0.89)

## Examples of Deferred Titles

- Aircraft Launch And Recovery Officer -> 55-1012.00 (0.84, deferred-review)
- Aircraft Launch And Recovery Specialist -> 55-3012.00 (0.84, deferred-review)
- Aircraft Mechanics And Service Technician -> 49-3011.00 (0.84, deferred-review)
- Commercial And Industrial Designer -> 27-1021.00 (0.84, deferred-review)
- Customs And Border Protection Officer -> 33-3051.04 (0.84, deferred-review)
- Electrician Technician -> 49-2094.00 (0.83, deferred-review)
- Product Consultant -> 17-2111.00 (0.83, deferred-review)
- Production Analyst -> 17-3026.00 (0.83, deferred-review)
- Productivity Engineer -> 17-3026.00 (0.83, deferred-review)
- Products Engineer -> 17-2141.00 (0.83, deferred-review)
- Reproduction Specialist -> 51-9151.00 (0.83, deferred-review)
- Reproduction Technician -> 51-9151.00 (0.83, deferred-review)
- Software Analyst -> 15-1211.00 (0.83, deferred-review)
- Software Architect -> 15-1252.00 (0.83, deferred-review)
- Software Consultant -> 15-1211.00 (0.83, deferred-review)

## Produced Artifacts

- `src/data/professionLayerFinal.json` (production-visible layer, frozen)
- `src/data/professionLayerDeferred.json` (Class B/C storage for later review)
- `src/data/professionAliasMap.json` (internal alias routing to preferred visible titles)
