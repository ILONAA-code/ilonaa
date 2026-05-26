"use client";

import { track } from "@vercel/analytics";

export type AnalyticsEvent =
  | "landing_page_viewed"
  | "assessment_started"
  | "question_completed"
  | "assessment_completed"
  | "results_viewed"
  | "cta_interaction";

export type AnalyticsProperties = Record<
  string,
  string | number | boolean | undefined
>;

/**
 * Privacy-first behavioral analytics layer.
 * Sends anonymous funnel events via Vercel Analytics — no personal data collected.
 */
export function trackEvent(
  event: AnalyticsEvent,
  properties?: AnalyticsProperties
): void {
  if (typeof window === "undefined") return;

  const payload = sanitizeProperties(properties);

  if (process.env.NODE_ENV === "development") {
    console.debug("[ILONAA analytics]", event, payload);
  }

  track(event, payload);
}

function sanitizeProperties(
  properties?: AnalyticsProperties
): Record<string, string | number | boolean> | undefined {
  if (!properties) return undefined;

  const sanitized: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(properties)) {
    if (value !== undefined) {
      sanitized[key] = value;
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

export const analytics = {
  landingPageViewed: () => trackEvent("landing_page_viewed"),

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

  ctaInteraction: (ctaId: string, location: string) =>
    trackEvent("cta_interaction", { ctaId, location }),
};
