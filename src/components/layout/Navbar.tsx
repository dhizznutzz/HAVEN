'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sprout, Bell, Search, LogOut, User } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { ThemeToggle } from '@/components/ThemeToggle';

const GOAL_LABELS: Record<string, string> = {
  skills:    '📚 Learn & grow skills',
  community: '🤝 Find my community',
  wellness:  '🌱 Take care of myself',
  jobs:      '💼 Find jobs or internships',
};

const AGE_LABELS: Record<string, string> = {
  'u18':   'Under 18',
  '18-21': '18 – 21',
  '22-25': '22 – 25',
  '26-30': '26 – 30',
};

export function Navbar() {
  const pathname = usePathname();
  const { profile, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = profile
    ? (profile.display_name?.[0] || profile.username?.[0] || '?').toUpperCase()
    : '';

  if (pathname === '/' || pathname.startsWith('/signup') || pathname.startsWith('/login')) return null;
  if (loading || !profile) return null;

  return (
    <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 h-14 items-center px-6">
      <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900 mr-8">
        <Sprout className="w-5 h-5 text-sage-600" />
        <span>HAVEN</span>
      </Link>

      <nav className="flex items-center gap-1 flex-1">
        {[
          { href: '/feed',       label: 'Feed' },
          { href: '/grow',       label: 'Grow' },
          { href: '/connect',    label: 'Connect' },
          { href: '/circle',     label: 'Circle' },
          { href: '/safe-space', label: 'Safe Space' },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              pathname.startsWith(href)
                ? 'bg-sage-50 text-sage-700 font-medium'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg hover:bg-gray-50 text-gray-500">
          <Search className="w-4 h-4" />
        </button>
        <button className="p-2 rounded-lg hover:bg-gray-50 text-gray-500">
          <Bell className="w-4 h-4" />
        </button>
        <ThemeToggle />

        {loading ? (
          <div className="w-24 h-8 rounded-lg bg-gray-100 animate-pulse" />
        ) : profile ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(o => !o)}
              className="flex items-center gap-2 px-3 py-1.5 bg-sage-50 hover:bg-sage-100 border border-sage-200 rounded-lg transition-all"
            >
              <div className="w-6 h-6 rounded-full bg-sage-100 flex items-center justify-center text-xs font-bold text-sage-700">
                {initials}
              </div>
              <span className="text-sm font-medium text-sage-700">Account</span>
            </button>

            {open && (
              <div className="absolute right-0 top-11 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                <div className="px-4 py-4 bg-gradient-to-br from-sage-50 to-white border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-sage-100 flex items-center justify-center text-lg font-bold text-sage-700 flex-shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {profile.display_name || profile.username}
                      </p>
                      <p className="text-xs text-gray-400 truncate">@{profile.username}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(profile as any).age_group && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-sage-100 text-sage-700 font-medium">
                        {AGE_LABELS[(profile as any).age_group] ?? (profile as any).age_group}
                      </span>
                    )}
                    {(profile as any).goal && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-sage-100 text-sage-700 font-medium">
                        {GOAL_LABELS[(profile as any).goal] ?? (profile as any).goal}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-2">
                  <Link
                    href={`/profile/${profile.username}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    View profile
                  </Link>
                  <button
                    onClick={signOut}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors w-full mt-0.5"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}
