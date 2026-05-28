import type { Metadata } from "next";
import { AssessmentFlow } from "@/components/assessment/AssessmentFlow";
import { assessmentMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = assessmentMetadata;

export default function AssessmentPage() {
  return <AssessmentFlow />;
}
