import type { Metadata } from "next";
import { ResultsView } from "@/components/assessment/ResultsView";
import { resultsMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = resultsMetadata;

export default function ResultsPage() {
  return <ResultsView />;
}
