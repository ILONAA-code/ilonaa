# Final Mapping Governance Review

Date: 2026-05-29

Purpose: final governance pass before production freeze of the profession layer.

Boundary conditions followed:
- No architecture redesign
- No dataset expansion
- No search algorithm changes
- No O*NET import/model changes

---

## Scope Filter

This review includes only mappings from the modern-title governance set with:

- **confidence < 0.82**

Low-confidence mappings found in scope: **9**

---

## Priority Role Checkpoint (Requested Roles First)

Requested priority roles and current status:

| Role | Current Mapping | O*NET Code | Confidence | In This Low-Confidence Scope |
| --- | --- | --- | ---: | --- |
| Chief of Staff | Managers, All Other | 11-9199.00 | 0.79 | YES |
| CTO | Chief Executives | 11-1011.00 | 0.81 | YES |
| CIO | Chief Executives | 11-1011.00 | 0.81 | YES |
| Chief Product Officer | Marketing Managers | 11-2021.00 | 0.82 | NO (threshold boundary) |
| Head of Product | Marketing Managers | 11-2021.00 | 0.82 | NO (threshold boundary) |
| Head of Data | Database Architects | 15-1243.00 | 0.83 | NO |
| Chief Data Officer | Database Architects | 15-1243.00 | 0.83 | NO |
| Customer Success Manager | Sales Managers | 11-2022.00 | 0.80 | YES |
| Customer Success Director | Sales Managers | 11-2022.00 | 0.80 | YES |
| Customer Success Operations Manager | Sales Managers | 11-2022.00 | 0.80 | YES |
| UX Researcher | Market Research Analysts and Marketing Specialists | 13-1161.00 | 0.82 | NO (threshold boundary) |
| Design Researcher | Market Research Analysts and Marketing Specialists | 13-1161.00 | 0.82 | NO (threshold boundary) |
| Prompt Engineer | Computer and Information Research Scientists | 15-1221.00 | 0.84 | NO |
| AI Engineer | Computer and Information Research Scientists | 15-1221.00 | 0.84 | NO |
| Machine Learning Engineer | Computer and Information Research Scientists | 15-1221.00 | 0.84 | NO |
| DevOps Engineer | Computer Network Architects | 15-1241.00 | 0.83 | NO |
| Site Reliability Engineer | Computer Network Architects | 15-1241.00 | 0.83 | NO |
| Platform Engineer | Computer Network Architects | 15-1241.00 | 0.83 | NO |
| Cloud Engineer | Computer Network Architects | 15-1241.00 | 0.83 | NO |
| Solutions Architect | Computer Network Architects | 15-1241.00 | 0.84 | NO |

---

## Step 1 - All Mappings with Confidence < 0.82

| Market Title | Current O*NET Mapping | O*NET Code | Confidence | Rationale | Alternative Mappings Considered |
| --- | --- | --- | ---: | --- | --- |
| Design Systems Engineer | (none) | - | 0.65 | No high-confidence blueprint currently exists for this modern title. | Web and Digital Interface Designers (15-1255.00); Software Developers (15-1252.00) |
| Chief of Staff | Managers, All Other | 11-9199.00 | 0.79 | No dedicated O*NET chief-of-staff role; current mapping uses broad catch-all manager bucket. | General and Operations Managers (11-1021.00); Chief Executives (11-1011.00) |
| Customer Experience Manager | Sales Managers | 11-2022.00 | 0.80 | Customer-success/experience titles are underrepresented; sales-management proxy used. | Sales Representatives of Services (41-3091.00); General and Operations Managers (11-1021.00) |
| Customer Success Director | Sales Managers | 11-2022.00 | 0.80 | Customer-success titles currently proxied through sales leadership. | Sales Representatives of Services (41-3091.00); General and Operations Managers (11-1021.00) |
| Customer Success Manager | Sales Managers | 11-2022.00 | 0.80 | Customer-success titles currently proxied through sales leadership. | Sales Representatives of Services (41-3091.00); General and Operations Managers (11-1021.00) |
| Customer Success Operations Manager | Sales Managers | 11-2022.00 | 0.80 | Customer-success operations currently proxied through sales leadership. | Sales Representatives of Services (41-3091.00); General and Operations Managers (11-1021.00) |
| Customer Support Manager | Sales Managers | 11-2022.00 | 0.80 | Customer-support leadership proxied through sales management. | Sales Representatives of Services (41-3091.00); General and Operations Managers (11-1021.00) |
| Chief Information Officer | Chief Executives | 11-1011.00 | 0.81 | CIO currently collapses into broad executive bucket. | Computer and Information Systems Managers (11-3021.00); General and Operations Managers (11-1021.00) |
| Chief Technology Officer | Chief Executives | 11-1011.00 | 0.81 | CTO currently collapses into broad executive bucket. | Computer and Information Systems Managers (11-3021.00); General and Operations Managers (11-1021.00) |

---

## Step 2 - Recommendation Table

| Market Title | Current Mapping | Alternative 1 | Alternative 2 | Recommended Final Mapping | Recommendation Confidence | Founder Decision Required |
| --- | --- | --- | --- | --- | ---: | --- |
| Design Systems Engineer | (none) | Web and Digital Interface Designers (15-1255.00) | Software Developers (15-1252.00) | Web and Digital Interface Designers (15-1255.00) | 0.78 | YES |
| Chief of Staff | Managers, All Other (11-9199.00) | General and Operations Managers (11-1021.00) | Chief Executives (11-1011.00) | General and Operations Managers (11-1021.00) | 0.83 | YES |
| Customer Experience Manager | Sales Managers (11-2022.00) | Sales Representatives of Services (41-3091.00) | General and Operations Managers (11-1021.00) | General and Operations Managers (11-1021.00) | 0.82 | YES |
| Customer Success Director | Sales Managers (11-2022.00) | Sales Representatives of Services (41-3091.00) | General and Operations Managers (11-1021.00) | Sales Managers (11-2022.00) | 0.82 | YES |
| Customer Success Manager | Sales Managers (11-2022.00) | Sales Representatives of Services (41-3091.00) | General and Operations Managers (11-1021.00) | Sales Representatives of Services (41-3091.00) | 0.83 | YES |
| Customer Success Operations Manager | Sales Managers (11-2022.00) | Sales Representatives of Services (41-3091.00) | General and Operations Managers (11-1021.00) | General and Operations Managers (11-1021.00) | 0.82 | YES |
| Customer Support Manager | Sales Managers (11-2022.00) | Sales Representatives of Services (41-3091.00) | General and Operations Managers (11-1021.00) | Sales Managers (11-2022.00) | 0.82 | NO |
| Chief Information Officer | Chief Executives (11-1011.00) | Computer and Information Systems Managers (11-3021.00) | General and Operations Managers (11-1021.00) | Computer and Information Systems Managers (11-3021.00) | 0.84 | YES |
| Chief Technology Officer | Chief Executives (11-1011.00) | Computer and Information Systems Managers (11-3021.00) | General and Operations Managers (11-1021.00) | Computer and Information Systems Managers (11-3021.00) | 0.84 | YES |

---

## Step 4 - Founder Governance Recommendation

### Category A - Accept Immediately

- Customer Support Manager -> Sales Managers (11-2022.00)
  - Imperfect but directionally reasonable and low risk for immediate freeze.

### Category B - Founder Review Required

- Chief of Staff
- Chief Information Officer
- Chief Technology Officer
- Customer Experience Manager
- Customer Success Manager
- Customer Success Director
- Customer Success Operations Manager
- Design Systems Engineer

### Category C - Should Be Replaced Before Freeze

- Chief of Staff: replace broad catch-all `11-9199.00` with a tighter managerial baseline (`11-1021.00`) unless founder decides otherwise.
- CIO/CTO: replace executive mega-bucket `11-1011.00` with `11-3021.00` for stronger technology governance fit.
- Customer Success Manager: prefer `41-3091.00` over `11-2022.00` for better day-to-day customer-success fit.

---

## Step 5 - Final Recommendation Answers

1. **How many mappings still require human review?**  
   - **8** (Category B)

2. **How many are production-ready?**  
   - **1** immediate accept (Category A)  
   - plus **0** in low-confidence set that are clearly final without discussion

3. **Which mappings are the weakest?**  
   - Design Systems Engineer (missing)
   - Chief of Staff -> Managers, All Other
   - Customer Success family -> Sales Managers proxy
   - CIO/CTO -> Chief Executives bucket

4. **Which mappings are acceptable despite being imperfect?**  
   - Customer Support Manager -> Sales Managers (acceptable interim proxy)

5. **Which mappings would materially affect ILONAA results if changed?**  
   - Chief of Staff
   - CTO
   - CIO
   - Customer Success Manager
   - Customer Success Director
   - Customer Success Operations Manager  
   These are high-frequency managerial roles where different O*NET baselines can shift occupational factors and therefore downstream risk interpretation.

---

## Stop Condition Check

- No new titles created
- No dataset expansion
- No search logic changes
- No O*NET import changes
- No commit performed
