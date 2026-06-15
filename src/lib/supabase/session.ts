const EX_SUPABASE_ENDPOINT =
  import.meta.env.VITE_EX_SUPABASE_API_URL ||
  import.meta.env.VITE_EX_SUPABASE_ENDPOINT ||
  "https://ex_supabase.jimatbiz.com";

export const NATIVE_SESSION_KEY = "native_session";

export type NativeSessionUser = {
  id: string;
  email?: string | null;
  phone?: string | null;
  user_metadata?: Record<string, unknown>;
};

export type NativeSession = {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  expires_in?: number;
  user?: NativeSessionUser;
};

export function isUsableSessionToken(token: string): boolean {
  if (!token) return false;
  if (token.startsWith("native_session_")) return false;
  return token.split(".").length === 3;
}

function getAccessTokenExpiry(accessToken: string): number | null {
  try {
    const payload = JSON.parse(atob(accessToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

export function readNativeSession(): NativeSession | null {
  try {
    const raw = localStorage.getItem(NATIVE_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as NativeSession;
    return session && typeof session === "object" ? session : null;
  } catch {
    return null;
  }
}

export function writeNativeSession(session: NativeSession): void {
  localStorage.setItem(NATIVE_SESSION_KEY, JSON.stringify(session));
}

export function clearNativeSession(): void {
  localStorage.removeItem(NATIVE_SESSION_KEY);
}

export function getSessionExpiry(session: NativeSession | null): number | null {
  if (!session) return null;

  const expiresAt = session.expires_at;
  if (typeof expiresAt === "number") return expiresAt;

  const token = session.access_token;
  if (typeof token === "string" && isUsableSessionToken(token)) {
    return getAccessTokenExpiry(token);
  }

  return null;
}

export function isSessionExpired(session: NativeSession | null): boolean {
  if (!session?.access_token || !isUsableSessionToken(session.access_token)) return true;

  const expiry = getSessionExpiry(session);
  if (expiry === null) return false;

  return expiry <= Math.floor(Date.now() / 1000);
}

let refreshInFlight: Promise<NativeSession | null> | null = null;

export async function tryRefreshNativeSession(
  session: NativeSession,
): Promise<NativeSession | null> {
  const body: Record<string, string> = {};

  if (typeof session.refresh_token === "string" && session.refresh_token) {
    body.refresh_token = session.refresh_token;
  } else if (typeof session.access_token === "string" && session.access_token) {
    body.access_token = session.access_token;
  } else {
    return null;
  }

  try {
    const response = await fetch(`${EX_SUPABASE_ENDPOINT}/supabase/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await response.json().catch(() => null);
    if (!response.ok || result?.error || !result?.data?.session) {
      return null;
    }

    return result.data.session as NativeSession;
  } catch {
    return null;
  }
}

/**
 * Returns a valid session, refreshing when the access token has expired.
 * Returns null when there is no session or refresh fails.
 */
export async function ensureValidNativeSession(): Promise<NativeSession | null> {
  const session = readNativeSession();
  if (!session) return null;
  if (!isSessionExpired(session)) return session;

  if (!refreshInFlight) {
    refreshInFlight = tryRefreshNativeSession(session).finally(() => {
      refreshInFlight = null;
    });
  }

  const refreshed = await refreshInFlight;
  if (refreshed) {
    writeNativeSession(refreshed);
    return refreshed;
  }

  clearNativeSession();
  return null;
}
