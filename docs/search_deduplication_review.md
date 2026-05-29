# Search Deduplication Review

Date: 2026-05-29  
Branch: `reset-profession-search`

## Goal

Ensure one occupation maps to one visible search result, using only the preferred market-facing title.

Internal acronyms/aliases remain available for matching, but are never shown as separate visible options.

## Before vs After

### CEO

- Before: `CEO`, `Chief Executive Officer`
- After: `Chief Executive Officer`

### CTO

- Before: `CTO`, `Chief Technology Officer`
- After: `Chief Technology Officer`

### CFO

- Before: `CFO`, `Chief Financial Officer`
- After: `Chief Financial Officer`

### CIO

- Before: `CIO`, `Chief Information Officer`
- After: `Chief Information Officer`

### COO

- Before: `COO`, `Chief Operating Officer`
- After: `Chief Operating Officer`

### CHRO

- Before: `CHRO`, `Chief Human Resources Officer`
- After: `Chief Human Resources Officer`

### Product Manager

- Before: `Product Manager`
- After: `Product Manager`

### Product Owner

- Before: `Product Owner`
- After: `Product Owner`

## Implementation Summary

### 1) Preferred-title-only visibility

Runtime visible entries are now canonical preferred titles from the seed layer.

### 2) Internal alias matching retained

Acronym alias mapping is internal only:

- CEO -> Chief Executive Officer
- CTO -> Chief Technology Officer
- CFO -> Chief Financial Officer
- CIO -> Chief Information Officer
- COO -> Chief Operating Officer
- CMO -> Chief Marketing Officer
- CHRO -> Chief Human Resources Officer

### 3) Occupation-level deduplication

Search results are deduplicated by mapped occupation code, not by matched term.  
Result: one occupation -> one visible result.

### 4) No alias/acronym entries in dropdown

Dropdown still shows profession title only, with no duplicate alias rows.

## Validation

Executed:

- `npx tsx scripts/testProfessionSearchReset.ts`

Regression checks pass, including:

- CEO/CTO/CFO/CIO/COO/CHRO each resolve to only the preferred title
- Product Manager and Product Owner remain stable
- No unrelated occupations returned in tested query set

## Files Updated

- `src/lib/assessment/occupations.ts`
- `src/data/professionSeedTitles.ts`
- `scripts/testProfessionSearchReset.ts`

