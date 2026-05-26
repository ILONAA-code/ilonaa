export type AnalyticsEvent =
  | "assessment_started"
  | "question_completed"
  | "assessment_completed"
  | "results_viewed";

export type AnalyticsProperties = Record<
  string,
  string | number | boolean | undefined
>;

/**
 * Frontend analytics hook — wire to Vercel Analytics or other providers later.
 * Currently a no-op in production; logs in development only.
 */
export function trackEvent(
  event: AnalyticsEvent,
  properties?: AnalyticsProperties
): void {
  if (process.env.NODE_ENV === "development") {
    console.debug("[ILONAA analytics]", event, properties ?? {});
  }

  // Future integration point:
  // import { track } from '@vercel/analytics';
  // track(event, properties);
}

export const analytics = {
  assessmentStarted: () => trackEvent("assessment_started"),
  questionCompleted: (questionId: string, questionNumber: number) =>
    trackEvent("question_completed", { questionId, questionNumber }),
  assessmentCompleted: (aiExposureScore: number, resilienceScore: number) =>
    trackEvent("assessment_completed", {
      aiExposureScore,
      resilienceScore,
    }),
  resultsViewed: (aiExposureScore: number, resilienceScore: number) =>
    trackEvent("results_viewed", { aiExposureScore, resilienceScore }),
};
