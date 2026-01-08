import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Auth will not work until configured.",
  );
}

export const supabase = createClient(supabaseUrl ?? "https://uurkkuvlpqhzfqjhdyti.supabase.co", supabaseAnonKey ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1cmtrdXZscHFoemZxamhkeXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxODQ4NzEsImV4cCI6MjA3Mzc2MDg3MX0.Y6EbnTGU9CrJGL3S7qnyCDWYrHjqUrx1YSRw4Mb5r6E", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});


