import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import occupations from "../src/data/onetOccupations.json";

type Occupation = (typeof occupations)[number];

type SeedRole = {
  title: string;
  domain: "product" | "engineering" | "data-ai" | "design" | "customer" | "go-to-market";
  frequency: "high" | "medium";
  impact: "high" | "medium";
};

type MappingPlan = {
  code: string;
  confidence: number;
  flag: "ok" | "weak" | "ambiguous" | "missing";
  rationale: string;
  alternatives: string[];
};

type MappingReview = {
  role: SeedRole;
  mappedOccupationCode: string;
  mappedOccupationTitle: string;
  confidence: number;
  flag: "ok" | "weak" | "ambiguous" | "missing";
  rationale: string;
  alternatives: Array<{ code: string; title: string }>;
};

const SEED_ROLES: SeedRole[] = [
  { title: "Product Manager", domain: "product", frequency: "high", impact: "high" },
  { title: "Senior Product Manager", domain: "product", frequency: "high", impact: "high" },
  { title: "Lead Product Manager", domain: "product", frequency: "medium", impact: "high" },
  { title: "Principal Product Manager", domain: "product", frequency: "medium", impact: "high" },
  { title: "Product Owner", domain: "product", frequency: "high", impact: "high" },
  { title: "Technical Product Manager", domain: "product", frequency: "high", impact: "high" },
  { title: "Growth Product Manager", domain: "product", frequency: "high", impact: "high" },
  { title: "AI Product Manager", domain: "product", frequency: "medium", impact: "high" },
  { title: "Platform Product Manager", domain: "product", frequency: "medium", impact: "high" },
  { title: "Head of Product", domain: "product", frequency: "high", impact: "high" },
  { title: "Chief Product Officer", domain: "product", frequency: "high", impact: "high" },
  { title: "Director of Product", domain: "product", frequency: "high", impact: "high" },
  { title: "Product Operations Manager", domain: "product", frequency: "medium", impact: "medium" },
  { title: "Program Manager", domain: "product", frequency: "high", impact: "medium" },
  { title: "Technical Program Manager", domain: "product", frequency: "high", impact: "medium" },
  { title: "Project Manager", domain: "product", frequency: "high", impact: "medium" },

  { title: "Software Engineer", domain: "engineering", frequency: "high", impact: "high" },
  { title: "Senior Software Engineer", domain: "engineering", frequency: "high", impact: "high" },
  { title: "Staff Software Engineer", domain: "engineering", frequency: "medium", impact: "high" },
  { title: "Principal Software Engineer", domain: "engineering", frequency: "medium", impact: "high" },
  { title: "Backend Engineer", domain: "engineering", frequency: "high", impact: "high" },
  { title: "Frontend Engineer", domain: "engineering", frequency: "high", impact: "high" },
  { title: "Full Stack Engineer", domain: "engineering", frequency: "high", impact: "high" },
  { title: "Mobile Engineer", domain: "engineering", frequency: "medium", impact: "high" },
  { title: "iOS Engineer", domain: "engineering", frequency: "medium", impact: "medium" },
  { title: "Android Engineer", domain: "engineering", frequency: "medium", impact: "medium" },
  { title: "Cloud Engineer", domain: "engineering", frequency: "high", impact: "high" },
  { title: "DevOps Engineer", domain: "engineering", frequency: "high", impact: "high" },
  { title: "Site Reliability Engineer", domain: "engineering", frequency: "high", impact: "high" },
  { title: "Platform Engineer", domain: "engineering", frequency: "medium", impact: "high" },
  { title: "Infrastructure Engineer", domain: "engineering", frequency: "medium", impact: "high" },
  { title: "Security Engineer", domain: "engineering", frequency: "high", impact: "high" },
  { title: "Application Security Engineer", domain: "engineering", frequency: "medium", impact: "high" },
  { title: "Solutions Architect", domain: "engineering", frequency: "high", impact: "high" },
  { title: "Cloud Architect", domain: "engineering", frequency: "medium", impact: "high" },
  { title: "Software Architect", domain: "engineering", frequency: "medium", impact: "high" },
  { title: "Engineering Manager", domain: "engineering", frequency: "high", impact: "high" },
  { title: "Software Engineering Manager", domain: "engineering", frequency: "high", impact: "high" },
  { title: "Director of Engineering", domain: "engineering", frequency: "high", impact: "high" },
  { title: "VP Engineering", domain: "engineering", frequency: "high", impact: "high" },
  { title: "Head of Engineering", domain: "engineering", frequency: "high", impact: "high" },
  { title: "Chief Technology Officer", domain: "engineering", frequency: "high", impact: "high" },
  { title: "Chief Information Officer", domain: "engineering", frequency: "high", impact: "high" },
  { title: "IT Manager", domain: "engineering", frequency: "high", impact: "medium" },

  { title: "Data Scientist", domain: "data-ai", frequency: "high", impact: "high" },
  { title: "Senior Data Scientist", domain: "data-ai", frequency: "high", impact: "high" },
  { title: "Applied Scientist", domain: "data-ai", frequency: "medium", impact: "high" },
  { title: "Machine Learning Engineer", domain: "data-ai", frequency: "high", impact: "high" },
  { title: "AI Engineer", domain: "data-ai", frequency: "high", impact: "high" },
  { title: "MLOps Engineer", domain: "data-ai", frequency: "medium", impact: "high" },
  { title: "Prompt Engineer", domain: "data-ai", frequency: "medium", impact: "medium" },
  { title: "Data Engineer", domain: "data-ai", frequency: "high", impact: "high" },
  { title: "Analytics Engineer", domain: "data-ai", frequency: "medium", impact: "high" },
  { title: "Data Analyst", domain: "data-ai", frequency: "high", impact: "high" },
  { title: "Business Intelligence Analyst", domain: "data-ai", frequency: "high", impact: "high" },
  { title: "Business Analyst", domain: "data-ai", frequency: "high", impact: "medium" },
  { title: "Data Platform Engineer", domain: "data-ai", frequency: "medium", impact: "high" },
  { title: "Research Scientist", domain: "data-ai", frequency: "medium", impact: "high" },
  { title: "AI Research Scientist", domain: "data-ai", frequency: "medium", impact: "high" },
  { title: "ML Research Engineer", domain: "data-ai", frequency: "medium", impact: "high" },
  { title: "Data Architect", domain: "data-ai", frequency: "medium", impact: "high" },
  { title: "Chief Data Officer", domain: "data-ai", frequency: "high", impact: "high" },
  { title: "Head of Data", domain: "data-ai", frequency: "high", impact: "high" },
  { title: "Director of Data", domain: "data-ai", frequency: "high", impact: "high" },
  { title: "Director of Analytics", domain: "data-ai", frequency: "medium", impact: "high" },
  { title: "Data Governance Manager", domain: "data-ai", frequency: "medium", impact: "medium" },
  { title: "AI Program Manager", domain: "data-ai", frequency: "medium", impact: "medium" },
  { title: "AI Consultant", domain: "data-ai", frequency: "medium", impact: "medium" },

  { title: "Product Designer", domain: "design", frequency: "high", impact: "high" },
  { title: "UX Designer", domain: "design", frequency: "high", impact: "high" },
  { title: "UI Designer", domain: "design", frequency: "high", impact: "high" },
  { title: "UX Researcher", domain: "design", frequency: "high", impact: "high" },
  { title: "Design Researcher", domain: "design", frequency: "medium", impact: "high" },
  { title: "Interaction Designer", domain: "design", frequency: "medium", impact: "high" },
  { title: "Service Designer", domain: "design", frequency: "medium", impact: "medium" },
  { title: "Visual Designer", domain: "design", frequency: "high", impact: "medium" },
  { title: "Design Systems Designer", domain: "design", frequency: "medium", impact: "medium" },
  { title: "Design Systems Engineer", domain: "design", frequency: "medium", impact: "medium" },
  { title: "Head of Design", domain: "design", frequency: "high", impact: "high" },
  { title: "Design Director", domain: "design", frequency: "high", impact: "high" },
  { title: "Creative Director", domain: "design", frequency: "high", impact: "medium" },
  { title: "User Experience Manager", domain: "design", frequency: "medium", impact: "high" },

  { title: "Customer Success Manager", domain: "customer", frequency: "high", impact: "high" },
  { title: "Customer Success Director", domain: "customer", frequency: "high", impact: "high" },
  { title: "Customer Success Operations Manager", domain: "customer", frequency: "medium", impact: "high" },
  { title: "Customer Experience Manager", domain: "customer", frequency: "medium", impact: "high" },
  { title: "Account Manager", domain: "customer", frequency: "high", impact: "high" },
  { title: "Enterprise Account Manager", domain: "customer", frequency: "high", impact: "high" },
  { title: "Account Executive", domain: "customer", frequency: "high", impact: "high" },
  { title: "Sales Manager", domain: "customer", frequency: "high", impact: "high" },
  { title: "Sales Director", domain: "customer", frequency: "high", impact: "high" },
  { title: "Revenue Operations Manager", domain: "customer", frequency: "medium", impact: "high" },
  { title: "Customer Support Manager", domain: "customer", frequency: "high", impact: "high" },
  { title: "Technical Support Engineer", domain: "customer", frequency: "high", impact: "medium" },
  { title: "Solutions Consultant", domain: "customer", frequency: "medium", impact: "high" },
  { title: "Implementation Manager", domain: "customer", frequency: "medium", impact: "high" },
  { title: "Implementation Consultant", domain: "customer", frequency: "medium", impact: "high" },
  { title: "Professional Services Manager", domain: "customer", frequency: "medium", impact: "medium" },
  { title: "Head of People", domain: "customer", frequency: "high", impact: "high" },
  { title: "Chief of Staff", domain: "customer", frequency: "high", impact: "high" },
];

const BLUEPRINTS: Array<{ match: (title: string) => boolean; plan: MappingPlan }> = [
  {
    match: (title) => /product manager|senior product manager|lead product manager|principal product manager|technical product manager|growth product manager|ai product manager|platform product manager/i.test(title),
    plan: { code: "11-2021.00", confidence: 0.9, flag: "ok", rationale: "Closest available O*NET managerial product/market ownership baseline in current model.", alternatives: ["13-1082.00", "11-1021.00"] },
  },
  {
    match: (title) => /product owner|product operations manager|ai program manager/i.test(title),
    plan: { code: "13-1082.00", confidence: 0.86, flag: "ok", rationale: "Best-fit execution and roadmap coordination profile under current O*NET set.", alternatives: ["11-2021.00", "11-1021.00"] },
  },
  {
    match: (title) => /head of product|director of product|chief product officer/i.test(title),
    plan: { code: "11-2021.00", confidence: 0.82, flag: "ambiguous", rationale: "Reasonable product leadership proxy, but senior leadership granularity is limited in O*NET.", alternatives: ["11-1021.00", "11-1011.00"] },
  },
  {
    match: (title) => /program manager|technical program manager|project manager/i.test(title),
    plan: { code: "13-1082.00", confidence: 0.88, flag: "ok", rationale: "Direct project/program delivery alignment in O*NET.", alternatives: ["11-1021.00", "11-9041.00"] },
  },
  {
    match: (title) => /software engineer|senior software engineer|staff software engineer|principal software engineer|backend engineer|frontend engineer|full stack engineer|mobile engineer|ios engineer|android engineer/i.test(title),
    plan: { code: "15-1252.00", confidence: 0.9, flag: "ok", rationale: "Best software build-and-ship baseline for modern engineering variants.", alternatives: ["15-1254.00", "15-1255.00"] },
  },
  {
    match: (title) => /cloud engineer|devops engineer|site reliability engineer|platform engineer|infrastructure engineer|mlops engineer|data platform engineer/i.test(title),
    plan: { code: "15-1241.00", confidence: 0.83, flag: "ambiguous", rationale: "Infrastructure/platform role family spans multiple O*NET technical buckets; mapping is workable but not ideal.", alternatives: ["15-1252.00", "15-1244.00"] },
  },
  {
    match: (title) => /security engineer|application security engineer/i.test(title),
    plan: { code: "15-1299.05", confidence: 0.87, flag: "ok", rationale: "Direct cybersecurity engineering alignment in imported O*NET set.", alternatives: ["15-1212.00", "15-1244.00"] },
  },
  {
    match: (title) => /solutions architect|cloud architect|software architect/i.test(title),
    plan: { code: "15-1241.00", confidence: 0.84, flag: "ambiguous", rationale: "Architecture roles map reasonably to network/systems architect patterns but can vary by implementation focus.", alternatives: ["15-1299.08", "15-1243.00"] },
  },
  {
    match: (title) => /engineering manager|software engineering manager|director of engineering|vp engineering|head of engineering/i.test(title),
    plan: { code: "11-9041.00", confidence: 0.85, flag: "ok", rationale: "Best leadership baseline for engineering-team management responsibilities.", alternatives: ["11-1021.00", "15-1252.00"] },
  },
  {
    match: (title) => /chief technology officer|chief information officer/i.test(title),
    plan: { code: "11-1011.00", confidence: 0.81, flag: "ambiguous", rationale: "C-level technology roles collapse to executive bucket; mapping is broad and should be reviewed.", alternatives: ["11-3021.00", "11-1021.00"] },
  },
  {
    match: (title) => /it manager/i.test(title),
    plan: { code: "11-3021.00", confidence: 0.88, flag: "ok", rationale: "Direct IT management alignment.", alternatives: ["11-1021.00", "15-1212.00"] },
  },
  {
    match: (title) => /data scientist|senior data scientist|applied scientist|ai research scientist|research scientist/i.test(title),
    plan: { code: "15-2051.00", confidence: 0.9, flag: "ok", rationale: "Primary modeling and statistical science baseline in O*NET import.", alternatives: ["15-1221.00", "19-2042.00"] },
  },
  {
    match: (title) => /machine learning engineer|ai engineer|ml research engineer|prompt engineer/i.test(title),
    plan: { code: "15-1221.00", confidence: 0.84, flag: "ambiguous", rationale: "Modern AI engineering roles straddle research and software implementation; this is the closest current O*NET anchor.", alternatives: ["15-1252.00", "15-2051.00"] },
  },
  {
    match: (title) => /data engineer|analytics engineer|data architect|director of data|head of data|chief data officer|director of analytics|data governance manager/i.test(title),
    plan: { code: "15-1243.00", confidence: 0.83, flag: "ambiguous", rationale: "Data architecture/governance/engineering cluster is only partially separable in O*NET; this mapping is pragmatic but broad.", alternatives: ["15-2051.00", "15-1252.00"] },
  },
  {
    match: (title) => /data analyst|business intelligence analyst|business analyst/i.test(title),
    plan: { code: "15-2051.01", confidence: 0.87, flag: "ok", rationale: "Direct BI/data-analysis representation available in imported detailed occupation.", alternatives: ["15-2041.00", "13-1111.00"] },
  },
  {
    match: (title) => /product designer|ux designer|ui designer|visual designer|interaction designer|design systems designer/i.test(title),
    plan: { code: "15-1255.00", confidence: 0.89, flag: "ok", rationale: "Closest digital product/interface design baseline in O*NET import.", alternatives: ["27-1024.00", "27-1025.00"] },
  },
  {
    match: (title) => /ux researcher|design researcher|service designer/i.test(title),
    plan: { code: "13-1161.00", confidence: 0.82, flag: "ambiguous", rationale: "User/design research maps most closely to market research analyst structure, but semantic gap remains.", alternatives: ["19-3032.00", "15-1255.00"] },
  },
  {
    match: (title) => /head of design|design director|creative director|user experience manager/i.test(title),
    plan: { code: "27-1011.00", confidence: 0.84, flag: "ambiguous", rationale: "Design leadership roles are broader than a single O*NET creative-director class; mapping is usable with caution.", alternatives: ["11-1021.00", "15-1255.00"] },
  },
  {
    match: (title) => /customer success manager|customer success director|customer success operations manager|customer experience manager|customer support manager/i.test(title),
    plan: { code: "11-2022.00", confidence: 0.8, flag: "weak", rationale: "Customer success is underrepresented in O*NET; current best proxy is sales/customer leadership, but semantic fit is imperfect.", alternatives: ["41-3091.00", "11-1021.00"] },
  },
  {
    match: (title) => /account manager|enterprise account manager|account executive|sales manager|sales director|revenue operations manager/i.test(title),
    plan: { code: "41-3091.00", confidence: 0.88, flag: "ok", rationale: "Direct service-sales/account management baseline.", alternatives: ["11-2022.00", "11-1021.00"] },
  },
  {
    match: (title) => /technical support engineer|solutions consultant|implementation manager|implementation consultant|professional services manager|ai consultant/i.test(title),
    plan: { code: "13-1111.00", confidence: 0.82, flag: "ambiguous", rationale: "Implementation and solutions roles sit between consulting, support, and delivery; mapping is practical but broad.", alternatives: ["15-1232.00", "11-1021.00"] },
  },
  {
    match: (title) => /head of people/i.test(title),
    plan: { code: "11-3121.00", confidence: 0.9, flag: "ok", rationale: "Strong direct mapping to HR leadership baseline.", alternatives: ["11-1021.00", "13-1071.00"] },
  },
  {
    match: (title) => /chief of staff/i.test(title),
    plan: { code: "11-9199.00", confidence: 0.79, flag: "weak", rationale: "No dedicated O*NET chief-of-staff role; falls into broad managerial catch-all and should be treated as provisional.", alternatives: ["11-1021.00", "11-1011.00"] },
  },
];

function findBlueprint(title: string): MappingPlan | null {
  return BLUEPRINTS.find((entry) => entry.match(title))?.plan ?? null;
}

function formatConfidence(value: number): string {
  return value.toFixed(2);
}

function impactWeight(value: SeedRole["impact"]): number {
  return value === "high" ? 3 : 2;
}

function frequencyWeight(value: SeedRole["frequency"]): number {
  return value === "high" ? 3 : 2;
}

async function main() {
  const onetByCode = new Map<string, Occupation>(occupations.map((occupation) => [occupation.code, occupation]));

  const reviews: MappingReview[] = SEED_ROLES.map((role) => {
    const blueprint = findBlueprint(role.title);
    if (!blueprint) {
      return {
        role,
        mappedOccupationCode: "",
        mappedOccupationTitle: "",
        confidence: 0.65,
        flag: "missing",
        rationale: "No high-confidence blueprint currently exists for this modern title in the targeted remediation set.",
        alternatives: [],
      };
    }

    return {
      role,
      mappedOccupationCode: blueprint.code,
      mappedOccupationTitle: onetByCode.get(blueprint.code)?.title ?? "Unknown O*NET occupation",
      confidence: blueprint.confidence,
      flag: blueprint.flag,
      rationale: blueprint.rationale,
      alternatives: blueprint.alternatives.map((code) => ({
        code,
        title: onetByCode.get(code)?.title ?? "Unknown O*NET occupation",
      })),
    };
  });

  const weak = reviews.filter((item) => item.flag === "weak");
  const ambiguous = reviews.filter((item) => item.flag === "ambiguous");
  const missing = reviews.filter((item) => item.flag === "missing");
  const ok = reviews.filter((item) => item.flag === "ok");

  const rankedFindings = [...reviews]
    .filter((item) => item.flag !== "ok")
    .map((item) => {
      const severity =
        (1 - item.confidence) * 100 +
        impactWeight(item.role.impact) * 20 +
        frequencyWeight(item.role.frequency) * 20 +
        (item.flag === "missing" ? 25 : item.flag === "ambiguous" ? 12 : 8);
      return { ...item, severity: Number(severity.toFixed(1)) };
    })
    .sort((a, b) => b.severity - a.severity);

  const lines: string[] = [
    "# Modern Profession Mapping Review",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "Scope: targeted remediation pass for 100 high-frequency modern knowledge-worker titles across digital, technology, product, design, AI, and customer-facing roles.",
    "",
    "This is a review-only artifact. No automatic search-layer implementation changes are applied by this document.",
    "",
    "## Summary",
    `- Total titles reviewed: **${reviews.length}**`,
    `- OK mappings: **${ok.length}**`,
    `- Weak mappings: **${weak.length}**`,
    `- Ambiguous mappings: **${ambiguous.length}**`,
    `- Missing mappings: **${missing.length}**`,
    "",
    "## Top Findings Ranked by User Impact, Search Frequency, and Mapping Confidence",
    "",
  ];

  rankedFindings.slice(0, 20).forEach((item, index) => {
    lines.push(
      `${index + 1}. **${item.role.title}** (${item.flag.toUpperCase()}) - severity ${item.severity} - proposed mapping \`${item.mappedOccupationTitle || "No mapping"}\` (\`${item.mappedOccupationCode || "-"}\`) at confidence ${formatConfidence(item.confidence)}`
    );
  });

  lines.push("");
  lines.push("## Full 100-Title Seed Mapping Review");
  lines.push("");
  lines.push("| Seed title | Domain | Impact | Frequency | Proposed O*NET occupation | O*NET code | Confidence | Flag | Rationale | Alternative mappings considered |");
  lines.push("| --- | --- | --- | --- | --- | --- | ---: | --- | --- | --- |");

  for (const item of reviews) {
    const altText =
      item.alternatives.length > 0
        ? item.alternatives
            .map((alt) => `${alt.title} (${alt.code})`)
            .join("; ")
        : "-";

    lines.push(
      `| ${item.role.title} | ${item.role.domain} | ${item.role.impact} | ${item.role.frequency} | ${
        item.mappedOccupationTitle || "-"
      } | ${item.mappedOccupationCode || "-"} | ${formatConfidence(item.confidence)} | ${
        item.flag
      } | ${item.rationale.replace(/\|/g, "/")} | ${altText.replace(/\|/g, "/")} |`
    );
  }

  lines.push("");
  lines.push("## Recommended Remediation Priorities (Review Only)");
  lines.push("");
  lines.push("1. **Critical weak/ambiguous executive-role mappings**");
  lines.push("   - Chief of Staff, Chief Technology Officer, Chief Information Officer, Chief Product Officer, Chief Data Officer.");
  lines.push("2. **Modern platform/infra role stabilization**");
  lines.push("   - DevOps, SRE, Platform, Cloud, MLOps titles need clearer one-to-one consensus mappings.");
  lines.push("3. **Customer-success family quality**");
  lines.push("   - Customer Success Manager/Director/Ops currently map via sales leadership proxies; requires explicit policy choice.");
  lines.push("4. **Design-research and AI-engineering semantics**");
  lines.push("   - UX Researcher / Design Researcher / Prompt Engineer should be explicitly resolved rather than inherited from broad proxies.");
  lines.push("5. **Governance threshold suggestion**");
  lines.push("   - For production exposure, require founder sign-off for mappings below 0.82 confidence.");

  const outputPath = resolve(process.cwd(), "docs/modern_profession_mapping_review.md");
  await writeFile(outputPath, `${lines.join("\n")}\n`, "utf8");

  // eslint-disable-next-line no-console
  console.log(`Generated ${outputPath}`);
}

main().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exitCode = 1;
});
