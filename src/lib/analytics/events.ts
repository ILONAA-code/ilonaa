"use client";

import { track } from "@vercel/analytics";
import { trackProductEvent } from "@/lib/analytics/track";
import { PRODUCT_EVENTS } from "@/lib/analytics/types";

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

function trackVercelEvent(
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
  landingPageViewed: () => {
    trackProductEvent(PRODUCT_EVENTS.LANDING_VIEW);
    trackVercelEvent("landing_page_viewed");
  },

  assessmentStarted: () => {
    trackProductEvent(PRODUCT_EVENTS.ASSESSMENT_STARTED);
    trackVercelEvent("assessment_started");
  },

  questionCompleted: (
    questionId: string,
    questionNumber: number,
    timeSpentMs: number
  ) => {
    trackProductEvent(PRODUCT_EVENTS.QUESTION_COMPLETED, {
      question_id: questionId,
      question_number: questionNumber,
      time_spent_ms: timeSpentMs,
    });
    trackVercelEvent("question_completed", { questionId, questionNumber });
  },

  assessmentCompleted: (aiExposureScore: number, resilienceScore: number) => {
    trackProductEvent(PRODUCT_EVENTS.ASSESSMENT_COMPLETED, {
      ai_exposure_score: aiExposureScore,
      resilience_score: resilienceScore,
    });
    trackVercelEvent("assessment_completed", {
      aiExposureScore,
      resilienceScore,
    });
  },

  resultsViewed: (aiExposureScore: number, resilienceScore: number) => {
    trackProductEvent(PRODUCT_EVENTS.RESULTS_VIEWED, {
      ai_exposure_score: aiExposureScore,
      resilience_score: resilienceScore,
    });
    trackVercelEvent("results_viewed", { aiExposureScore, resilienceScore });
  },

  backButtonUsed: (questionNumber: number) => {
    trackProductEvent(PRODUCT_EVENTS.BACK_BUTTON_USED, {
      question_number: questionNumber,
    });
  },

  assessmentAbandoned: (questionNumber: number) => {
    trackProductEvent(PRODUCT_EVENTS.ASSESSMENT_ABANDONED, {
      abandoned_at_question: questionNumber,
    });
  },

  ctaClicked: (ctaId: string, location: string) => {
    trackProductEvent(PRODUCT_EVENTS.CTA_CLICKED, {
      cta_id: ctaId,
      location,
    });
    trackVercelEvent("cta_interaction", { ctaId, location });
  },

  /** @deprecated Use ctaClicked — kept for internal compatibility */
  ctaInteraction: (ctaId: string, location: string) => {
    analytics.ctaClicked(ctaId, location);
  },
};
