import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

function getValidUrl(raw?: string): string {
  if (raw?.startsWith('http://') || raw?.startsWith('https://')) return raw;
  return 'https://placeholder.supabase.co';
}

// Module-level singleton — one client per browser tab, no lock contention.
let _client: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (_client) return _client;
  _client = createBrowserClient(
    getValidUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
  );
  return _client;
}
