const SESSION_STORAGE_KEY = "ilonaa_anonymous_session";

export function getAnonymousSessionId(): string | null {
  if (typeof window === "undefined") return null;

  const existing = sessionStorage.getItem(SESSION_STORAGE_KEY);

  if (existing) {
    return existing;
  }

  const sessionId = crypto.randomUUID();
  sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);

  return sessionId;
}
