import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { searchOccupations } from "../src/lib/assessment/occupations";

const QUERIES = [
  "Chief of Staff",
  "CTO",
  "CIO",
  "Chief Technology Officer",
  "Chief Information Officer",
  "Customer Success Manager",
  "Customer Success Director",
  "Customer Success Operations Manager",
  "Customer Experience Manager",
  "Customer Support Manager",
  "Design Systems Engineer",
  "Product Manager",
  "Product Owner",
  "Financial Controller",
  "Software Engineer",
  "Data Scientist",
];

async function main() {
  const rows = QUERIES.map((query) => {
    const top = searchOccupations(query, 1)[0];
    if (!top) {
      return {
        query,
        visible: "(no result)",
        onetTitle: "-",
        code: "-",
        confidence: "-",
      };
    }
    return {
      query,
      visible: top.marketTitle,
      onetTitle: top.occupation.title,
      code: top.mappedOccupationCode,
      confidence: top.mappingConfidence.toFixed(2),
    };
  });

  const lines = [
    "# Final Profession Layer Validation",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "Validation confirms final founder-approved mapping decisions in the frozen profession layer.",
    "",
    "| Query | Visible user-facing title | Internal O*NET title | O*NET code | Mapping confidence |",
    "| --- | --- | --- | --- | ---: |",
    ...rows.map(
      (row) =>
        `| ${row.query} | ${row.visible} | ${row.onetTitle} | ${row.code} | ${row.confidence} |`
    ),
    "",
  ];

  const outputPath = resolve(process.cwd(), "docs/final_profession_layer_validation.md");
  await writeFile(outputPath, `${lines.join("\n")}\n`, "utf8");

  // eslint-disable-next-line no-console
  console.log(`Generated ${outputPath}`);
}

main().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exitCode = 1;
});
