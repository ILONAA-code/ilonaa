import type { Metadata } from "next";
import { AssessmentFlow } from "@/components/assessment/AssessmentFlow";

export const metadata: Metadata = {
  title: "Career Assessment — ILONAA",
  description:
    "Answer 10 thoughtful questions to understand your AI career exposure and resilience.",
};

export default function AssessmentPage() {
  return <AssessmentFlow />;
}
