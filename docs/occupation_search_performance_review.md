# Occupation Search Performance Review

Generated: 2026-05-29T16:36:11.952Z

Short report for stable search iteration:
- Search input debounce: **200 ms**
- Minimum query length: **2 characters**
- Max displayed results: **20**
- Ranking order: exact title -> title prefix -> alias -> contains

## Latency Benchmarks
- 200 occupations: 200 occupations / 22330 searchable entries -> **0.438 ms/query**
- 500 occupations: 500 occupations / 57727 searchable entries -> **1.137 ms/query**
- 1000 occupations: 1000 occupations / 123343 searchable entries -> **2.336 ms/query**
- 2000 occupations: 1016 occupations / 125586 searchable entries -> **2.330 ms/query**
- 5000 searchable entries: 58 occupations / 5034 searchable entries -> **0.103 ms/query**

## Dataset Size
- `src/data/onetOccupations.json` raw: **5.37 MB**
- Approx gzip transfer size: **0.68 MB**

## Mobile Impact
- Search remains local, deterministic, and responsive in this simple mode.
- Main tradeoff is payload size/parsing, not query CPU.
