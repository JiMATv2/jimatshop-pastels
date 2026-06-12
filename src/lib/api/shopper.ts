import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export async function resolveShopperId(args: {
  authUserId: string;
  email?: string | null;
}): Promise<string | null> {
  // Prefer explicit linkage via auth user id.
  const { data: byUserId, error: byUserIdErr } = await supabase
    .from("shoppers")
    .select("id")
    .eq("user_id", args.authUserId)
    .maybeSingle();

  if (byUserIdErr) throw byUserIdErr;
  if (byUserId?.id) return byUserId.id as string;

  // Fallback for legacy shoppers that were created before auth linkage:
  // match by email if available.
  const email = args.email?.trim();
  if (!email) return null;

  const { data: byEmail, error: byEmailErr } = await supabase
    .from("shoppers")
    .select("id")
    .eq("email", email)
    .limit(1);

  if (byEmailErr) throw byEmailErr;
  return (byEmail?.[0]?.id as string | undefined) ?? null;
}

function upsertArgsFromUser(user: User) {
  const meta = user.user_metadata ?? {};
  return {
    first_name:
      (meta.given_name as string | undefined) ||
      (meta.full_name as string | undefined) ||
      (meta.name as string | undefined) ||
      "",
    last_name: (meta.family_name as string | undefined) || null,
    email: user.email || null,
    phone: user.phone || null,
  };
}

/**
 * Resolves the shopper id, creating/linking a profile via RPC when missing.
 */
export async function ensureShopperId(user: User): Promise<string | null> {
  const existing = await resolveShopperId({ authUserId: user.id, email: user.email });
  if (existing) return existing;

  const { data, error } = await supabase.rpc("upsert_shopper_for_auth_user", upsertArgsFromUser(user));
  if (error) throw error;
  if (typeof data === "string" && data) return data;

  return resolveShopperId({ authUserId: user.id, email: user.email });
}


