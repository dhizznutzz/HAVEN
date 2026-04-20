'use client';

import { Pillar } from '@/types';
import { pillarMeta } from '@/lib/colors';

interface FeedFilterProps {
  active: Pillar | 'all';
  onChange: (pillar: Pillar | 'all') => void;
}

const filters: { value: Pillar | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: 'All', icon: '✨' },
  { value: 'grow', label: 'Grow', icon: '🌱' },
  { value: 'connect', label: 'Connect', icon: '🔗' },
  { value: 'circle', label: 'Circle', icon: '⭕' },
  { value: 'safe_space', label: 'Safe Space', icon: '💙' },
];

export function FeedFilter({ active, onChange }: FeedFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {filters.map(({ value, label, icon }) => {
        const isActive = active === value;
        const meta = value !== 'all' ? pillarMeta[value] : null;

        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              isActive
                ? meta
                  ? meta.badge
                  : 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <span>{icon}</span>
            {label}
          </button>
        );
      })}
    </div>
  );
}
