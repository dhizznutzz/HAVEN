import { createBrowserClient } from '@supabase/ssr';

function getValidUrl(raw?: string): string {
  if (raw?.startsWith('http://') || raw?.startsWith('https://')) return raw;
  return 'https://placeholder.supabase.co';
}

export function createClient() {
  return createBrowserClient(
    getValidUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
  );
}
