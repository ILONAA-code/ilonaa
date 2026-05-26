"use client";

import { useEffect, useRef } from "react";
import { trackProductEvent } from "@/lib/analytics/track";
import { PRODUCT_EVENTS } from "@/lib/analytics/types";

const SCROLL_MILESTONES = [25, 50, 75, 100] as const;

type UseResultsEngagementOptions = {
  aiExposureScore: number;
  resilienceScore: number;
  enabled: boolean;
};

export function useResultsEngagement({
  aiExposureScore,
  resilienceScore,
  enabled,
}: UseResultsEngagementOptions) {
  const pageEnteredAt = useRef<number>(0);
  const maxScrollDepth = useRef(0);
  const sentMilestones = useRef<Set<number>>(new Set());
  const engagedSections = useRef<Set<string>>(new Set());
  const summarySent = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    pageEnteredAt.current = Date.now();

    const calculateScrollDepth = (): number => {
      const scrollTop = window.scrollY;
      const viewport = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollable = Math.max(documentHeight - viewport, 1);

      return Math.min(100, Math.round(((scrollTop + viewport) / scrollable) * 100));
    };

    const handleScroll = () => {
      const depth = calculateScrollDepth();
      maxScrollDepth.current = Math.max(maxScrollDepth.current, depth);

      for (const milestone of SCROLL_MILESTONES) {
        if (depth >= milestone && !sentMilestones.current.has(milestone)) {
          sentMilestones.current.add(milestone);
          trackProductEvent(PRODUCT_EVENTS.RESULTS_SCROLL_DEPTH, {
            scroll_depth_percent: milestone,
            ai_exposure_score: aiExposureScore,
            resilience_score: resilienceScore,
          });
        }
      }
    };

    const sendSummary = () => {
      if (summarySent.current) return;
      summarySent.current = true;

      const timeOnPageMs = Date.now() - pageEnteredAt.current;

      trackProductEvent(PRODUCT_EVENTS.RESULTS_ENGAGEMENT, {
        time_on_page_ms: timeOnPageMs,
        scroll_depth_percent: maxScrollDepth.current,
        ai_exposure_score: aiExposureScore,
        resilience_score: resilienceScore,
        engagement_type: "session_summary",
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const sectionId = entry.target.getAttribute("data-analytics-section");
          if (!sectionId || engagedSections.current.has(sectionId)) continue;

          engagedSections.current.add(sectionId);

          trackProductEvent(PRODUCT_EVENTS.RECOMMENDATION_ENGAGED, {
            section_id: sectionId,
            ai_exposure_score: aiExposureScore,
            resilience_score: resilienceScore,
            engagement_type: "section_viewed",
          });
        }
      },
      { threshold: 0.4 }
    );

    const sections = document.querySelectorAll("[data-analytics-section]");
    sections.forEach((section) => observer.observe(section));

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pagehide", sendSummary);

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pagehide", sendSummary);
      observer.disconnect();
      sendSummary();
    };
  }, [enabled, aiExposureScore, resilienceScore]);
}
