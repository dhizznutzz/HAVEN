'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuth } from '@/components/AuthProvider';

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/auth/callback'];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) =>
    route === '/' ? pathname === '/' : pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, loading } = useAuth();

  const isPublic = isPublicRoute(pathname);
  const isAuthed = Boolean(profile);

  useEffect(() => {
    if (!loading && !isPublic && !isAuthed) {
      router.replace('/login');
    }
  }, [isAuthed, isPublic, loading, router]);

  if (isPublic) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background" />
    );
  }

  if (!isAuthed) {
    return null;
  }

  return (
    <div className="haven-app-shell">
      <Navbar />
      <main className="md:pt-14 pb-16 md:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
}
