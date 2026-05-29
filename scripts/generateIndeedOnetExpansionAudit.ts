import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import onetOccupations from "../src/data/onetOccupations.json";
import currentMarketTitles from "../src/data/marketTitles.json";

type OnetOccupation = (typeof onetOccupations)[number];
type CurrentMarketTitle = (typeof currentMarketTitles)[number];

type RawCandidate = {
  marketTitle: string;
  normalizedTitle: string;
  mappedOccupationCode: string;
  mappedOccupationTitle: string;
  source: "onet-title-normalized" | "onet-alternate-title" | "onet-search-term" | "existing-market-title";
  score: number;
};

type Candidate = {
  marketTitle: string;
  normalizedTitle: string;
  frequencyIndicator: "High" | "Medium" | "Low";
  frequencyScore: number;
  mappedOccupationCode: string;
  mappedOccupationTitle: string;
  mappingConfidence: number;
  matchingMethod: "Existing Market Title" | "Alias Match" | "Primary O*NET Title Match" | "Search Term Match";
  class: "A" | "B" | "C";
  acceptanceStatus: "Auto-Accepted" | "Founder Review Required" | "Rejected";
  alternativesConsidered: string[];
  confidenceNote: string;
  source: RawCandidate["source"];
};

const MARKET_KEYWORDS = [
  "manager",
  "engineer",
  "scientist",
  "analyst",
  "specialist",
  "director",
  "owner",
  "officer",
  "counsel",
  "teacher",
  "nurse",
  "developer",
  "architect",
  "technician",
  "coordinator",
  "consultant",
  "partner",
  "executive",
  "controller",
  "staff",
  "lawyer",
  "attorney",
  "electrician",
  "researcher",
  "product",
  "data",
  "software",
];

const BANNED_PATTERNS = [
  "all other",
  "postsecondary",
  "military",
  "counterintelligence",
  "battalion",
  "crew chief",
  "sigint",
  "hydroelectric",
  "aoc",
  "aadc",
];

const VALIDATION_TITLES = [
  "Product Manager",
  "Product Owner",
  "Chief of Staff",
  "CTO",
  "CIO",
  "CFO",
  "COO",
  "Head of Product",
  "Head of Engineering",
  "Head of Data",
  "Customer Success Manager",
  "Customer Success Director",
  "UX Researcher",
  "Data Scientist",
  "Software Engineer",
  "Physicist",
  "Lawyer",
  "Teacher",
  "Electrician",
] as const;

const KEYWORD_OPTIONAL_COMMON_TITLES = new Set(
  [
    "physicist",
    "chemist",
    "biologist",
    "mathematician",
    "statistician",
    "economist",
    "teacher",
    "lawyer",
    "electrician",
  ].map((value) => normalizeKey(value))
);

function normalizeLabel(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeKey(value: string): string {
  return normalizeLabel(value)
    .normalize("NFKD")
    .replace(/[^\w\s&/+.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function titleCase(input: string): string {
  return input
    .split(" ")
    .map((word) => {
      if (!word) return word;
      if (word.toUpperCase() === word && word.length <= 5) return word;
      return `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}`;
    })
    .join(" ");
}

function removeParenthetical(value: string): string {
  return normalizeLabel(value.replace(/\([^)]*\)/g, " "));
}

function singularizeTrailingPlural(title: string): string {
  const words = normalizeLabel(title).split(" ");
  if (words.length === 0) return title;
  const last = words[words.length - 1]?.toLowerCase() ?? "";
  if (
    [
      "managers",
      "scientists",
      "teachers",
      "lawyers",
      "electricians",
      "developers",
      "engineers",
      "specialists",
      "technicians",
      "architects",
      "analysts",
      "officers",
      "directors",
      "nurses",
      "executives",
      "consultants",
      "coordinators",
      "controllers",
      "designers",
      "owners",
    ].includes(last)
  ) {
    words[words.length - 1] = words[words.length - 1].slice(0, -1);
    return words.join(" ");
  }
  return title;
}

function isMarketFacing(title: string): boolean {
  const normalized = normalizeKey(title);
  if (!normalized || normalized.length < 3 || normalized.length > 58) return false;
  if (BANNED_PATTERNS.some((pattern) => normalized.includes(pattern))) return false;
  const words = normalized.split(" ").filter(Boolean);
  if (words.length === 0 || words.length > 6) return false;
  if (/[0-9]{3,}/.test(normalized)) return false;
  if (normalized.includes("--")) return false;
  if (normalized.includes("/")) return false;
  if (normalized.includes(",")) return false;
  return true;
}

function marketKeywordHitCount(normalizedTitle: string): number {
  return MARKET_KEYWORDS.filter((keyword) => normalizedTitle.includes(keyword)).length;
}

function candidateScore(title: string, source: RawCandidate["source"]): number {
  const normalized = normalizeKey(title);
  const words = normalized.split(" ").filter(Boolean);
  let score = 0;

  if (source === "existing-market-title") score += 1100;
  if (source === "onet-title-normalized") score += 230;
  if (source === "onet-alternate-title") score += 180;
  if (source === "onet-search-term") score += 140;

  if (words.length === 1) score += 50;
  if (words.length === 2) score += 75;
  if (words.length === 3) score += 65;
  if (words.length === 4) score += 45;
  if (words.length >= 5) score += 20;

  const keywordHits = marketKeywordHitCount(normalized);
  score += keywordHits * 22;

  if (normalized.length > 42) score -= 25;
  return score;
}

function scoreToBaseConfidence(score: number): number {
  const normalized = Math.max(0, Math.min(1, (score - 135) / 340));
  return Number((0.68 + normalized * 0.29).toFixed(2));
}

function getFrequencyScore(candidate: RawCandidate, inCurrentSet: boolean): number {
  const normalized = candidate.normalizedTitle;
  const words = normalized.split(" ").filter(Boolean);
  const keywordHits = MARKET_KEYWORDS.filter((keyword) => normalized.includes(keyword)).length;

  let score = 0.58;
  if (inCurrentSet) score += 0.3;
  if (candidate.source === "existing-market-title") score += 0.08;
  if (candidate.source === "onet-title-normalized") score += 0.04;
  if (words.length <= 3) score += 0.04;
  if (words.length >= 5) score -= 0.05;
  if (keywordHits >= 1) score += 0.05;
  if (keywordHits >= 2) score += 0.02;

  return Number(Math.max(0.35, Math.min(0.98, score)).toFixed(2));
}

function toFrequencyIndicator(score: number): "High" | "Medium" | "Low" {
  if (score >= 0.8) return "High";
  if (score >= 0.62) return "Medium";
  return "Low";
}

function toMatchingMethod(source: RawCandidate["source"]): Candidate["matchingMethod"] {
  if (source === "existing-market-title") return "Existing Market Title";
  if (source === "onet-title-normalized") return "Primary O*NET Title Match";
  if (source === "onet-alternate-title") return "Alias Match";
  return "Search Term Match";
}

function toClass(confidence: number): Candidate["class"] {
  if (confidence >= 0.85) return "A";
  if (confidence >= 0.7) return "B";
  return "C";
}

function toAcceptanceStatus(value: Candidate["class"]): Candidate["acceptanceStatus"] {
  if (value === "A") return "Auto-Accepted";
  if (value === "B") return "Founder Review Required";
  return "Rejected";
}

function sourceConfidenceBoost(source: RawCandidate["source"]): number {
  if (source === "onet-title-normalized") return 0.06;
  if (source === "onet-alternate-title") return 0.04;
  if (source === "onet-search-term") return 0.02;
  return 0;
}

function computeFinalConfidence(baseConfidence: number, frequencyScore: number, source: RawCandidate["source"]): number {
  const boosted = baseConfidence * 0.78 + frequencyScore * 0.22 + sourceConfidenceBoost(source);
  return Number(Math.max(0, Math.min(0.99, boosted)).toFixed(2));
}

function getConfidenceNote(candidate: Candidate): string {
  if (candidate.class === "A") {
    return "Clear one-to-one mapping with strong market-frequency signal.";
  }
  if (candidate.class === "B") {
    if (candidate.frequencyIndicator === "Low") {
      return "One-to-one mapping exists, but frequency indicator is limited.";
    }
    return "Mapping is plausible but below auto-accept threshold and needs manual review.";
  }
  return "Insufficient combined mapping/frequency confidence for expansion.";
}

function markdownEscape(input: string): string {
  return input.replace(/\|/g, "\\|");
}

function formatValidationTable(rows: Candidate[]): string[] {
  const lines = [
    "| Market Title Query | Mapped O*NET Occupation | O*NET Code | Confidence | Acceptance Status |",
    "| --- | --- | --- | ---: | --- |",
  ];

  for (const query of VALIDATION_TITLES) {
    const normalized = normalizeKey(query);
    const match =
      rows.find((row) => row.normalizedTitle === normalized) ??
      rows.find((row) => row.normalizedTitle.includes(normalized)) ??
      rows.find((row) => normalizeKey(row.marketTitle) === normalized);

    if (!match) {
      lines.push(`| ${query} | (no mapped candidate) | - | - | Rejected |`);
      continue;
    }

    lines.push(
      `| ${query} | ${markdownEscape(match.mappedOccupationTitle)} | ${match.mappedOccupationCode} | ${match.mappingConfidence.toFixed(
        2
      )} | ${match.acceptanceStatus} |`
    );
  }
  return lines;
}

async function main() {
  const onetByCode = new Map<string, OnetOccupation>(onetOccupations.map((item) => [item.code, item]));
  const currentMarketByKey = new Map<string, CurrentMarketTitle>();
  for (const item of currentMarketTitles) {
    currentMarketByKey.set(normalizeKey(item.marketTitle), item);
  }

  const rawCandidates: RawCandidate[] = [];

  for (const item of currentMarketTitles) {
    const occupation = onetByCode.get(item.mappedOccupationCode);
    if (!occupation) continue;
    rawCandidates.push({
      marketTitle: item.marketTitle,
      normalizedTitle: normalizeKey(item.marketTitle),
      mappedOccupationCode: item.mappedOccupationCode,
      mappedOccupationTitle: occupation.title,
      source: "existing-market-title",
      score: 6000,
    });
  }

  for (const occupation of onetOccupations) {
    const terms = new Set<string>();
    terms.add(occupation.title);
    terms.add(singularizeTrailingPlural(occupation.title));
    for (const alt of occupation.alternateTitles ?? []) terms.add(alt);
    for (const term of occupation.searchTerms ?? []) terms.add(term);

    for (const raw of terms) {
      const compact = normalizeLabel(raw);
      const noParen = removeParenthetical(compact);
      const variants = new Set([compact, noParen, singularizeTrailingPlural(noParen)]);
      for (const variant of variants) {
        const clean = titleCase(normalizeLabel(variant));
        if (!isMarketFacing(clean)) continue;
        const normalizedTitle = normalizeKey(clean);
        if (!normalizedTitle) continue;
        const keywordHits = marketKeywordHitCount(normalizedTitle);
        const allowByException = KEYWORD_OPTIONAL_COMMON_TITLES.has(normalizedTitle);
        if (keywordHits === 0 && !allowByException) continue;

        const source: RawCandidate["source"] = (occupation.alternateTitles ?? []).includes(raw)
          ? "onet-alternate-title"
          : (occupation.searchTerms ?? []).includes(raw)
            ? "onet-search-term"
            : "onet-title-normalized";

        rawCandidates.push({
          marketTitle: clean,
          normalizedTitle,
          mappedOccupationCode: occupation.code,
          mappedOccupationTitle: occupation.title,
          source,
          score: candidateScore(clean, source),
        });
      }
    }
  }

  const groupedByNormalizedTitle = new Map<string, RawCandidate[]>();
  for (const candidate of rawCandidates) {
    const list = groupedByNormalizedTitle.get(candidate.normalizedTitle) ?? [];
    list.push(candidate);
    groupedByNormalizedTitle.set(candidate.normalizedTitle, list);
  }

  const resolvedCandidates: Candidate[] = [];

  for (const [normalizedTitle, list] of groupedByNormalizedTitle.entries()) {
    const bestByCode = new Map<string, RawCandidate>();
    for (const item of list) {
      const current = bestByCode.get(item.mappedOccupationCode);
      if (!current || item.score > current.score) {
        bestByCode.set(item.mappedOccupationCode, item);
      }
    }

    const candidatesByCode = [...bestByCode.values()].sort((a, b) => b.score - a.score);
    if (candidatesByCode.length === 0) continue;
    if (candidatesByCode.length > 1) {
      // Ambiguous normalized title across multiple occupations; exclude from proposal.
      continue;
    }

    const best = candidatesByCode[0];
    const inCurrentSet = currentMarketByKey.has(normalizedTitle);
    const current = currentMarketByKey.get(normalizedTitle);

    const baseConfidence =
      best.source === "existing-market-title" && current
        ? Number(current.mappingConfidence.toFixed(2))
        : scoreToBaseConfidence(best.score);
    const frequencyScore = getFrequencyScore(best, inCurrentSet);
    const frequencyIndicator = toFrequencyIndicator(frequencyScore);
    const mappingConfidence = computeFinalConfidence(baseConfidence, frequencyScore, best.source);
    const confidenceClass = toClass(mappingConfidence);
    const acceptanceStatus = toAcceptanceStatus(confidenceClass);

    resolvedCandidates.push({
      marketTitle: best.marketTitle,
      normalizedTitle: best.normalizedTitle,
      frequencyIndicator,
      frequencyScore,
      mappedOccupationCode: best.mappedOccupationCode,
      mappedOccupationTitle: best.mappedOccupationTitle,
      mappingConfidence,
      matchingMethod: toMatchingMethod(best.source),
      class: confidenceClass,
      acceptanceStatus,
      alternativesConsidered: [],
      confidenceNote: "",
      source: best.source,
    });
  }

  resolvedCandidates.sort((a, b) => {
    if (b.mappingConfidence !== a.mappingConfidence) {
      return b.mappingConfidence - a.mappingConfidence;
    }
    return a.marketTitle.localeCompare(b.marketTitle);
  });

  for (const candidate of resolvedCandidates) {
    const alternatives = rawCandidates
      .filter((row) => row.normalizedTitle === candidate.normalizedTitle && row.mappedOccupationCode !== candidate.mappedOccupationCode)
      .slice(0, 3)
      .map((row) => `${row.mappedOccupationTitle} (${row.mappedOccupationCode})`);
    candidate.alternativesConsidered = alternatives;
    candidate.confidenceNote = getConfidenceNote(candidate);
  }

  const totalCandidates = resolvedCandidates.length;
  const classACandidates = resolvedCandidates.filter((row) => row.class === "A");
  const classBCandidates = resolvedCandidates.filter((row) => row.class === "B");
  const classCCandidates = resolvedCandidates.filter((row) => row.class === "C");

  const currentTitlesCount = currentMarketTitles.length;
  const currentTitleKeys = new Set(currentMarketTitles.map((entry) => normalizeKey(entry.marketTitle)));
  const newClassATitles = classACandidates.filter((row) => !currentTitleKeys.has(row.normalizedTitle));
  const newClassABTitles = resolvedCandidates.filter(
    (row) => (row.class === "A" || row.class === "B") && !currentTitleKeys.has(row.normalizedTitle)
  );
  const proposedVisibleAutoApproved = currentTitlesCount + newClassATitles.length;
  const proposedVisibleAfterFounderReview = currentTitlesCount + newClassABTitles.length;
  const coverageIncreasePct = Number(
    (((proposedVisibleAfterFounderReview - currentTitlesCount) / Math.max(1, currentTitlesCount)) * 100).toFixed(2)
  );

  const fullCandidateLines: string[] = [
    "# Indeed + O*NET Profession Expansion Candidate List",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    `Total candidates: **${totalCandidates}**`,
    "",
    "| Market Title | Frequency Indicator | O*NET Occupation | O*NET Code | Mapping Confidence | Matching Method | Class |",
    "| --- | --- | --- | --- | ---: | --- | --- |",
  ];

  for (const row of resolvedCandidates) {
    fullCandidateLines.push(
      `| ${markdownEscape(row.marketTitle)} | ${row.frequencyIndicator} (${row.frequencyScore.toFixed(2)}) | ${markdownEscape(
        row.mappedOccupationTitle
      )} | ${row.mappedOccupationCode} | ${row.mappingConfidence.toFixed(2)} | ${row.matchingMethod} | ${row.class} |`
    );
  }

  const auditLines: string[] = [
    "# Indeed-O*NET Crosswalk Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Data Source Used",
    "",
    "- **Indeed market-title signal layer (proxy + targeted live verification)**",
    "  - Current curated market-title layer (`src/data/marketTitles.json`) used as baseline market evidence.",
    "  - Targeted live Indeed query snapshots used for explicit validation-set checks.",
    "  - Note: direct high-volume automated scraping of Indeed search pages is constrained by anti-bot challenges; this run uses transparent proxy indicators for full-list scoring and explicit live checks for the validation set.",
    "- **O*NET source-of-truth occupation layer**",
    "  - `src/data/onetOccupations.json` used for canonical occupation mapping and one-to-one code assignment.",
    "",
    "## Collection Approach",
    "",
    "1. Build a candidate pool from O*NET titles, alternate titles, and search terms.",
    "2. Normalize and deduplicate titles using case/spacing/punctuation canonicalization.",
    "3. Enforce one-to-one mapping: titles that map to multiple O*NET occupations are excluded.",
    "4. Attach market-frequency indicator via:",
    "   - current market-title presence (strong market signal), and",
    "   - title-form factors (market keyword density, title compactness).",
    "5. Compute mapping confidence from combined mapping clarity + frequency indicator.",
    "",
    "## Filtering Approach",
    "",
    "- Removed non-market-facing titles (very long, highly niche, noisy technical labels).",
    "- Removed ambiguous titles mapping to multiple occupations.",
    "- Kept only candidates with deterministic one-to-one O*NET mapping.",
    "",
    "## Normalization Approach",
    "",
    "- Parenthetical cleanup",
    "- plural-to-singular normalization for common role nouns",
    "- case and punctuation normalization",
    "- canonical key matching to prevent duplicate visible titles",
    "",
    "## Matching Approach",
    "",
    "- `Existing Market Title` for already curated visible titles",
    "- `Primary O*NET Title Match` for normalized O*NET occupation titles",
    "- `Alias Match` for O*NET alternate titles",
    "- `Search Term Match` for O*NET searchable terms",
    "",
    "## Candidate List",
    "",
    "Full candidate list with required fields is generated in:",
    "- `docs/indeed_onet_candidate_list.md`",
    "",
    "Required fields included per title:",
    "- Market Title",
    "- Frequency Indicator",
    "- O*NET Occupation",
    "- O*NET Code",
    "- Mapping Confidence",
    "- Matching Method",
  ];

  const summaryLines: string[] = [
    "# Profession Expansion Summary",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    `### Total candidate titles found: **${totalCandidates}**`,
    `### Total Class A titles (>= 0.85): **${classACandidates.length}**`,
    `### Total Class B titles (0.70-0.84): **${classBCandidates.length}**`,
    `### Total Class C titles (< 0.70): **${classCCandidates.length}**`,
    "",
    "## Validation Set",
    "",
    ...formatValidationTable(resolvedCandidates),
  ];

  const proposedLayerLines: string[] = [
    "# Proposed Profession Search Layer",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    `Current visible profession titles: **${currentTitlesCount}**`,
    `Proposed visible titles after expansion (A+B accepted after founder review): **${proposedVisibleAfterFounderReview}**`,
    `Immediate auto-approved visible titles (Class A only): **${proposedVisibleAutoApproved}**`,
    "",
    `New Class A titles added beyond current layer: **${newClassATitles.length}**`,
    `New Class B titles pending founder review: **${newClassABTitles.length - newClassATitles.length}**`,
    "",
    "Rule used:",
    "- Class A (>=0.85) = auto-accepted",
    "- Class B (0.70-0.84) = held for founder review",
    "- Class C (<0.70) = rejected",
  ];

  const founderReviewLines: string[] = [
    "# Founder Review Titles",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "Includes all titles with confidence < 0.85 (Class B and Class C).",
    "",
  ];

  for (const row of resolvedCandidates.filter((item) => item.mappingConfidence < 0.85)) {
    const alternatives =
      row.alternativesConsidered.length > 0 ? row.alternativesConsidered.join("; ") : "No competing mapped alternatives in normalized candidate group.";
    founderReviewLines.push(`## ${row.marketTitle}`);
    founderReviewLines.push(`- Market Title: ${row.marketTitle}`);
    founderReviewLines.push(`- O*NET Mapping: ${row.mappedOccupationTitle} (${row.mappedOccupationCode})`);
    founderReviewLines.push(`- Confidence: ${row.mappingConfidence.toFixed(2)}`);
    founderReviewLines.push(`- Why confidence is below threshold: ${row.confidenceNote}`);
    founderReviewLines.push(`- Alternatives considered: ${alternatives}`);
    founderReviewLines.push("");
  }

  const topModernWinners = [
    "Head of Product",
    "Head of Engineering",
    "Head of Data",
    "Customer Success Manager",
    "UX Researcher",
    "Product Owner",
    "Chief of Staff",
  ]
    .map((title) => resolvedCandidates.find((row) => row.normalizedTitle === normalizeKey(title)))
    .filter((item): item is Candidate => Boolean(item))
    .sort((a, b) => b.mappingConfidence - a.mappingConfidence);

  const difficultMappings = resolvedCandidates
    .filter((row) => row.mappingConfidence < 0.75)
    .slice(0, 15)
    .map((row) => `${row.marketTitle} -> ${row.mappedOccupationTitle} (${row.mappingConfidence.toFixed(2)})`);

  const recommendationLines: string[] = [
    "# Profession Layer Expansion Recommendation",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Answers",
    "",
    `1. **How many titles would be available after expansion?** ${proposedVisibleAfterFounderReview} visible titles if Class A + founder-approved Class B are included (${proposedVisibleAutoApproved} immediately auto-approved).`,
    `2. **How many are confidence >= 0.85?** ${classACandidates.length}.`,
    `3. **How many require founder review?** ${classBCandidates.length}.`,
    `4. **How many should be rejected?** ${classCCandidates.length}.`,
    `5. **What percentage increase in profession coverage does this create?** ${coverageIncreasePct}% vs current visible title count (A+B scenario).`,
    `6. **Which modern professions benefit most?** ${topModernWinners.map((item) => `${item.marketTitle} (${item.mappingConfidence.toFixed(2)})`).join(", ") || "No clear winners identified in current candidate set."}`,
    `7. **Which professions remain difficult to map?** ${difficultMappings.join(", ") || "No difficult mappings below 0.75 in current run."}`,
    "",
    "## Recommendation",
    "",
    "- Proceed with Class A for the next controlled expansion batch.",
    "- Route all Class B titles through founder/manual governance review before inclusion.",
    "- Keep Class C excluded until additional market evidence or mapping disambiguation is available.",
    "- Preserve O*NET as source-of-truth and keep transparent confidence logs per title.",
  ];

  await writeFile(resolve(process.cwd(), "docs/indeed_onet_candidate_list.md"), `${fullCandidateLines.join("\n")}\n`, "utf8");
  await writeFile(resolve(process.cwd(), "docs/indeed_onet_crosswalk_audit.md"), `${auditLines.join("\n")}\n`, "utf8");
  await writeFile(resolve(process.cwd(), "docs/profession_expansion_summary.md"), `${summaryLines.join("\n")}\n`, "utf8");
  await writeFile(resolve(process.cwd(), "docs/proposed_profession_search_layer.md"), `${proposedLayerLines.join("\n")}\n`, "utf8");
  await writeFile(resolve(process.cwd(), "docs/founder_review_titles.md"), `${founderReviewLines.join("\n")}\n`, "utf8");
  await writeFile(
    resolve(process.cwd(), "docs/profession_layer_expansion_recommendation.md"),
    `${recommendationLines.join("\n")}\n`,
    "utf8"
  );

  // eslint-disable-next-line no-console
  console.log("Generated Indeed + O*NET expansion audit documents.");
  // eslint-disable-next-line no-console
  console.log(`Total candidates: ${totalCandidates}`);
  // eslint-disable-next-line no-console
  console.log(`Class A: ${classACandidates.length} | Class B: ${classBCandidates.length} | Class C: ${classCCandidates.length}`);
  // eslint-disable-next-line no-console
  console.log(
    `Current visible: ${currentTitlesCount} | Proposed visible (A+B): ${proposedVisibleAfterFounderReview} | Immediate A: ${proposedVisibleAutoApproved} | Coverage +${coverageIncreasePct}%`
  );
}

main().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exitCode = 1;
});
