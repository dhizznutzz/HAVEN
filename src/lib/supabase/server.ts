import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function getValidUrl(raw?: string): string {
  if (raw?.startsWith('http://') || raw?.startsWith('https://')) return raw;
  return 'https://placeholder.supabase.co';
}

const SUPABASE_URL = getValidUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Can be ignored in Server Components
          }
        },
      },
    }
  );
}
