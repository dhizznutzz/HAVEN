'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Users, Heart, User } from 'lucide-react';

const navItems = [
  { href: '/feed', label: 'Home', icon: Home },
  { href: '/grow', label: 'Grow', icon: Compass },
  { href: '/circle', label: 'Circle', icon: Users },
  { href: '/safe-space', label: 'Safe Space', icon: Heart },
  { href: '/profile', label: 'Me', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  // Hide on auth pages and landing
  if (pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors"
            >
              <Icon
                className={`w-5 h-5 ${active ? 'text-purple-600' : 'text-gray-400'}`}
              />
              <span
                className={`text-[10px] font-medium ${active ? 'text-purple-600' : 'text-gray-400'}`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
