import { searchOccupations } from "../src/lib/assessment/occupations";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function titlesFor(query: string, limit = 10): string[] {
  return searchOccupations(query, limit).map((hit) => hit.marketTitle);
}

function assertOnlyExpected(query: string, expected: string[]): void {
  const actual = titlesFor(query, 10);
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);

  assert(actual.length === expected.length, `[${query}] expected ${expected.length} results, got ${actual.length}: ${actual.join(", ")}`);
  for (const title of expectedSet) {
    assert(actualSet.has(title), `[${query}] missing expected title: ${title}`);
  }
  for (const title of actualSet) {
    assert(expectedSet.has(title), `[${query}] returned unrelated title: ${title}`);
  }
}

function assertFirst(query: string, expectedFirst: string): void {
  const actual = titlesFor(query, 10);
  assert(actual.length > 0, `[${query}] expected at least one result`);
  assert(actual[0] === expectedFirst, `[${query}] expected first result "${expectedFirst}", got "${actual[0]}"`);
}

function assertNoUnrelated(query: string): void {
  const normalizedQuery = query.toLowerCase().trim();
  const results = searchOccupations(query, 10);

  for (const result of results) {
    const title = result.marketTitle.toLowerCase();
    const acronym = title
      .split(/\s+/)
      .filter(Boolean)
      .map((token) => token[0])
      .join("");

    const relevant =
      title === normalizedQuery ||
      title.startsWith(normalizedQuery) ||
      title.split(/\s+/).some((token) => token.startsWith(normalizedQuery)) ||
      acronym === normalizedQuery;

    assert(relevant, `[${query}] unrelated match returned: ${result.marketTitle}`);
  }
}

function run(): void {
  assertOnlyExpected("CEO", ["Chief Executive"]);
  assertOnlyExpected("CTO", ["Chief Technology Officer"]);
  assertOnlyExpected("CFO", ["Chief Financial Officer"]);
  assertOnlyExpected("CIO", ["Chief Information Officer"]);
  assertOnlyExpected("COO", ["Chief Operating Officer"]);
  assertOnlyExpected("CHRO", []);
  assertOnlyExpected("Product Manager", ["Product Manager"]);
  assertOnlyExpected("Product Owner", ["Product Owner"]);

  assertOnlyExpected("phys", []);
  assertOnlyExpected("Physicist", []);

  const regressionQueries = [
    "Product Manager",
    "Product Owner",
    "Physicist",
    "Software Engineer",
    "Teacher",
    "Lawyer",
    "Chief of Staff",
  ];

  for (const query of regressionQueries) {
    assertNoUnrelated(query);
  }

  console.log("Profession search reset regression checks passed.");
}

run();
