'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sprout, MapPin, Users, Heart, LayoutGrid } from 'lucide-react';

const pillars = [
  { href: '/feed', label: 'All Pillars', icon: LayoutGrid, color: 'text-gray-600' },
  { href: '/grow', label: 'Grow', icon: Sprout, color: 'text-purple-600' },
  { href: '/connect', label: 'Connect', icon: MapPin, color: 'text-teal-600' },
  { href: '/circle', label: 'Circle', icon: Users, color: 'text-amber-600' },
  { href: '/safe-space', label: 'Safe Space', icon: Heart, color: 'text-rose-600' },
];

export function PillarSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-48 shrink-0">
      <div className="sticky top-20 space-y-1">
        <p className="text-xs font-medium text-gray-400 px-3 mb-3 uppercase tracking-wide">Pillars</p>
        {pillars.map(({ href, label, icon: Icon, color }) => {
          const active = pathname === href || (href !== '/feed' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? color : 'text-gray-400'}`} />
              {label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
