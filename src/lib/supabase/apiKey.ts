/**
 * ex_supabase API key resolution.
 *
 * - Public reads: ex_supabase anon JWT (`role: anon`) via `apikey` header
 * - User-scoped reads/writes: session JWT from login (`role: authenticated`) via `apikey` header
 */
import { getSessionExpiry, isUsableSessionToken, readNativeSession } from "./session";

export const EX_SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJleF9zdXBhYmFzZSIsInJvbGUiOiJhbm9uIn0.EjytFJDXov2AGIo9tabwk-G1S7iP3ktL17DciczAen0";

/**
 * Returns the session JWT when signed in, otherwise the ex_supabase anon JWT.
 */
export function getSupabaseApiKey(): string {
  const session = readNativeSession();
  const token = session?.access_token;

  if (typeof token === "string" && isUsableSessionToken(token)) {
    const expiry = getSessionExpiry(session);
    if (typeof expiry === "number" && expiry <= Math.floor(Date.now() / 1000)) {
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
