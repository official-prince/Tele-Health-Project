/*
  Helper to initialize Supabase clients on the server.
  This uses a lazy require so the app doesn't crash if @supabase/supabase-js
  isn't installed yet. Install it with: npm install @supabase/supabase-js

  Create a service role client with SUPABASE_SERVICE_ROLE_KEY for server-only operations
  (insert credentials in config/supabase.env.template or your environment).
*/

import type { Database } from "../types/supabase";

export function getSupabaseServiceClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    // require lazily so CI/dev doesn't fail if package not installed yet
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createClient } = require("@supabase/supabase-js");
    return createClient(url, key, { auth: { persistSession: false } });
  } catch (err) {
    console.warn("@supabase/supabase-js not installed; install to enable Supabase integration", err);
    return null;
  }
}

export function getSupabaseAnonClient() {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createClient } = require("@supabase/supabase-js");
    return createClient(url, anon);
  } catch (err) {
    console.warn("@supabase/supabase-js not installed; install to enable Supabase integration", err);
    return null;
  }
}
