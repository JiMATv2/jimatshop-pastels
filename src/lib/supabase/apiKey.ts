/**
 * ex_supabase API key resolution.
 *
 * - Public reads: ex_supabase anon JWT (`role: anon`) via `apikey` header
 * - User-scoped reads/writes: session JWT from login (`role: authenticated`) via `apikey` header
 */
export const EX_SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJleF9zdXBhYmFzZSIsInJvbGUiOiJhbm9uIn0.EjytFJDXov2AGIo9tabwk-G1S7iP3ktL17DciczAen0";

const NATIVE_SESSION_KEY = "native_session";

type NativeSession = {
  access_token?: string;
  expires_at?: number;
};

function readNativeSession(): NativeSession | null {
  try {
    const raw = localStorage.getItem(NATIVE_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as NativeSession;
    return session && typeof session === "object" ? session : null;
  } catch {
    return null;
  }
}

function isUsableSessionToken(token: string): boolean {
  if (!token) return false;
  // Legacy native_session_<uuid> tokens are not valid apikey JWTs — ignore them.
  if (token.startsWith("native_session_")) return false;
  return token.split(".").length === 3;
}

/**
 * Returns the session JWT when signed in, otherwise the ex_supabase anon JWT.
 */
export function getSupabaseApiKey(): string {
  const session = readNativeSession();
  const token = session?.access_token;

  if (typeof token === "string" && isUsableSessionToken(token)) {
    const expiresAt = session?.expires_at;
    if (typeof expiresAt === "number" && expiresAt <= Math.floor(Date.now() / 1000)) {
      return EX_SUPABASE_ANON_KEY;
    }
    return token;
  }

  return EX_SUPABASE_ANON_KEY;
}

export function getSupabaseQueryHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    apikey: getSupabaseApiKey(),
  };
}
