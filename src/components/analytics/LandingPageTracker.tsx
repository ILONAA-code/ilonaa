"use client";

import { useEffect, useRef } from "react";
import { analytics } from "@/lib/analytics/events";

export function LandingPageTracker() {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    analytics.landingPageViewed();
    tracked.current = true;
  }, []);

  return null;
}
