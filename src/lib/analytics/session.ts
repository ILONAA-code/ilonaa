const SESSION_ID_KEY = "ilonaa_anonymous_session";
const SESSION_STARTED_KEY = "ilonaa_session_started_at";
const SESSION_ACTIVITY_KEY = "ilonaa_session_last_activity_at";

function nowIso(): string {
  return new Date().toISOString();
}

export function getAnonymousSessionId(): string | null {
  if (typeof window === "undefined") return null;

  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
    sessionStorage.setItem(SESSION_STARTED_KEY, nowIso());
  }

  touchSessionActivity();

  return sessionId;
}

export function touchSessionActivity(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_ACTIVITY_KEY, nowIso());
}

export function getSessionTimestamps(): {
  startedAt: string;
  lastActivityAt: string;
} {
  if (typeof window === "undefined") {
    const now = nowIso();
    return { startedAt: now, lastActivityAt: now };
  }

  const startedAt =
    sessionStorage.getItem(SESSION_STARTED_KEY) ?? nowIso();
  const lastActivityAt =
    sessionStorage.getItem(SESSION_ACTIVITY_KEY) ?? startedAt;

  if (!sessionStorage.getItem(SESSION_STARTED_KEY)) {
    sessionStorage.setItem(SESSION_STARTED_KEY, startedAt);
  }

  return { startedAt, lastActivityAt };
}
