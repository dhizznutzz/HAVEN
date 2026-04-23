'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Compass, Users, Heart, UserCircle, LogOut, User, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { ThemeToggle } from '@/components/ThemeToggle';

const NAV_ITEMS = [
  { href: '/feed',       label: 'Home',      icon: Home },
  { href: '/grow',       label: 'Grow',      icon: Compass },
  { href: '/connect',    label: 'Community', icon: Users },
  { href: '/safe-space', label: 'Safe Space', icon: Heart },
];

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

export function BottomNav() {
  const pathname          = usePathname();
  const router            = useRouter();
  const { profile, loading, signOut } = useAuth();
  const [sheet, setSheet] = useState(false);

  if (pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    return null;
  }
  if (loading || !profile) return null;

  const initials = profile
    ? (profile.display_name?.[0] || profile.username?.[0] || '?').toUpperCase()
    : '?';

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100">
        <div className="flex items-center justify-around h-16 px-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors"
              >
                <Icon className={`w-5 h-5 ${active ? 'text-sage-600' : 'text-gray-400'}`} />
                <span className={`text-[10px] font-medium ${active ? 'text-sage-600' : 'text-gray-400'}`}>
                  {label}
                </span>
              </Link>
            );
          })}

          {/* Account tab */}
          <button
            onClick={() => {
              if (loading) return;
              profile ? setSheet(true) : router.push('/login');
            }}
            className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors"
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full bg-gray-200 animate-pulse" />
            ) : profile ? (
              <div className="w-5 h-5 rounded-full bg-sage-100 flex items-center justify-center text-[10px] font-bold text-sage-700">
                {initials}
              </div>
            ) : (
              <UserCircle className="w-5 h-5 text-gray-400" />
            )}
            <span className={`text-[10px] font-medium ${sheet ? 'text-sage-600' : 'text-gray-400'}`}>
              {profile ? 'Account' : 'Sign in'}
            </span>
          </button>
        </div>
      </nav>

      {/* Account sheet */}
      {sheet && profile && (
        <div className="md:hidden fixed inset-0 z-[60] flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSheet(false)}
          />
          <div className="relative bg-white rounded-t-3xl shadow-xl overflow-hidden">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>
            <button
              onClick={() => setSheet(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-gray-100"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>

            <div className="px-6 pt-3 pb-5 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-sage-100 flex items-center justify-center text-2xl font-bold text-sage-700 flex-shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-gray-900 truncate">
                    {profile.display_name || profile.username}
                  </p>
                  <p className="text-sm text-gray-400">@{profile.username}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {(profile as any).age_group && (
                  <span className="text-xs px-3 py-1 rounded-full bg-sage-50 text-sage-700 font-medium border border-sage-100">
                    {AGE_LABELS[(profile as any).age_group] ?? (profile as any).age_group}
                  </span>
                )}
                {(profile as any).goal && (
                  <span className="text-xs px-3 py-1 rounded-full bg-sage-50 text-sage-700 font-medium border border-sage-100">
                    {GOAL_LABELS[(profile as any).goal] ?? (profile as any).goal}
                  </span>
                )}
              </div>

              {profile.interests?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {profile.interests.slice(0, 5).map(i => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-500">{i}</span>
                  ))}
                  {profile.interests.length > 5 && (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-400">
                      +{profile.interests.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="px-4 py-3 space-y-1 pb-8">
              <div className="px-1 pb-1">
                <ThemeToggle className="w-full py-2.5 flex items-center justify-center gap-2" />
              </div>
              <Link
                href={`/profile/${profile.username}`}
                onClick={() => setSheet(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full"
              >
                <User className="w-5 h-5 text-gray-400" />
                View my profile
              </Link>
              <button
                onClick={() => { setSheet(false); signOut(); }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-red-500 hover:bg-red-50 transition-colors w-full"
              >
                <LogOut className="w-5 h-5" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
