'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sprout, Bell, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Profile } from '@/types';

export function Navbar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
      }
    };
    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 h-14 items-center px-6">
      <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900 mr-8">
        <Sprout className="w-5 h-5 text-purple-600" />
        <span>Tumbuh</span>
      </Link>

      <nav className="flex items-center gap-1 flex-1">
        {[
          { href: '/feed', label: 'Feed' },
          { href: '/grow', label: 'Grow' },
          { href: '/connect', label: 'Connect' },
          { href: '/circle', label: 'Circle' },
          { href: '/safe-space', label: 'Safe Space' },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              pathname.startsWith(href)
                ? 'bg-purple-50 text-purple-700 font-medium'
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
        {profile ? (
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${profile.username}`}
              className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-medium text-purple-700"
            >
              {profile.display_name?.[0] || profile.username[0]}
            </Link>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-500 hover:text-gray-800"
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
