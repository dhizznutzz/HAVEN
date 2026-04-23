import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();

  // Stale / invalid refresh token — clear all sb-* auth cookies so the
  // browser starts fresh instead of looping on token-refresh errors.
  if (error?.message?.includes('Refresh Token Not Found') ||
      error?.message?.includes('Invalid Refresh Token')) {
    const response = NextResponse.next({ request });
    request.cookies.getAll().forEach(({ name }) => {
      if (name.startsWith('sb-')) {
        response.cookies.set(name, '', { maxAge: 0, path: '/' });
      }
    });
    return response;
  }

  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/auth/callback');
  const isApiOrAsset =
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico';

  if (!isApiOrAsset && !isPublicRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if ((pathname.startsWith('/login') || pathname.startsWith('/signup')) && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/feed';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
