/*
  Browser-side Supabase client initializer.
  Uses VITE_SUPABASE_ANON_KEY and SUPABASE_URL in environment (Vite exposes VITE_* to client).
  Install @supabase/supabase-js to enable: npm install @supabase/supabase-js
*/

export function createBrowserSupabaseClient() {
  const url = (import.meta.env.VITE_SUPABASE_URL as string) || (typeof process !== 'undefined' ? (process.env.VITE_SUPABASE_URL as string) : undefined);
  const anon = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || (typeof process !== 'undefined' ? (process.env.VITE_SUPABASE_ANON_KEY as string) : undefined);
  if (!url || !anon) return null;
  try {
    // Use require in environments where it's available; in browser bundlers this will be shimmed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createClient } = typeof require !== 'undefined' ? require("@supabase/supabase-js") : { createClient: undefined };
    if (!createClient) return null;
    return createClient(url, anon);
  } catch (err) {
    // If package not installed yet, return null and warn in console
    console.warn("@supabase/supabase-js not installed; install to enable Supabase client", err);
    return null;
  }
}
