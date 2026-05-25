import type { Metadata } from "next";
import { ResultsView } from "@/components/assessment/ResultsView";

export const metadata: Metadata = {
  title: "Your Results — ILONAA",
  description:
    "Your personalized AI career exposure and career resilience profile.",
};

export default function ResultsPage() {
  return <ResultsView />;
}
