import { supabase } from "@/lib/supabase/client";

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


