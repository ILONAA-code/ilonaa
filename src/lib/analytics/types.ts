import type { DeviceType } from "@/lib/analytics/metadata";

/** Anonymous product telemetry events — no PII, no identity linkage. */
export const PRODUCT_EVENTS = {
  LANDING_VIEW: "landing_view",
  ASSESSMENT_STARTED: "assessment_started",
  QUESTION_COMPLETED: "question_completed",
  ASSESSMENT_COMPLETED: "assessment_completed",
  RESULTS_VIEWED: "results_viewed",
  BACK_BUTTON_USED: "back_button_used",
  ASSESSMENT_ABANDONED: "assessment_abandoned",
  RESULTS_SCROLL_DEPTH: "results_scroll_depth",
  CTA_CLICKED: "cta_clicked",
  RESULTS_ENGAGEMENT: "results_engagement",
  RECOMMENDATION_ENGAGED: "recommendation_engaged",
} as const;

export type ProductEventName =
  (typeof PRODUCT_EVENTS)[keyof typeof PRODUCT_EVENTS];

/** Whitelisted anonymous metadata fields stored in events.metadata (jsonb). */
export type EventMetadataPayload = {
  question_number?: number;
  question_id?: string;
  time_spent_ms?: number;
  device_type?: DeviceType;
  screen_width?: number;
  timestamp?: string;
  session_started_at?: string;
  session_last_activity_at?: string;
  scroll_depth_percent?: number;
  time_on_page_ms?: number;
  cta_id?: string;
  location?: string;
  section_id?: string;
  ai_exposure_score?: number;
  resilience_score?: number;
  abandoned_at_question?: number;
  engagement_type?: string;
};

export type QuestionCompletedPayload = {
  questionId: string;
  questionNumber: number;
  timeSpentMs: number;
};

export type ResultsEngagementPayload = {
  timeOnPageMs: number;
  scrollDepthPercent: number;
  aiExposureScore: number;
  resilienceScore: number;
};
