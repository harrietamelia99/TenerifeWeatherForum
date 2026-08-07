import { createClient } from "@supabase/supabase-js";

// ─── Server-side client (uses service role — never expose to browser) ─────────
// Pass cache: "no-store" to every fetch the Supabase client makes internally,
// preventing Next.js App Router from caching Supabase REST API responses.
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars are not set.");
  return createClient(url, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) =>
        fetch(input, { ...init, cache: "no-store" }),
    },
  });
}

// ─── Types ───────────────────────────────────────────────────────────────────
export interface Subscriber {
  id: string;
  email: string;
  daily_digest: boolean;
  monthly_newsletter: boolean;
  unsubscribe_token: string;
  created_at: string;
}
