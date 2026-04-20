'use client';

import { Opportunity } from '@/types';
import { MapPin } from 'lucide-react';

interface OpportunityMapProps {
  opportunities: Opportunity[];
}

export function OpportunityMap({ opportunities }: OpportunityMapProps) {
  // Placeholder map — replace with @vis.gl/react-google-maps when API key is set
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 h-64 flex flex-col items-center justify-center gap-3">
      <MapPin className="w-8 h-8 text-teal-400" />
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">Interactive Map</p>
        <p className="text-xs text-gray-400 mt-1">Add NEXT_PUBLIC_GOOGLE_MAPS_KEY to .env.local to enable</p>
      </div>
      <div className="flex flex-wrap gap-2 px-4">
        {opportunities.slice(0, 5).map(opp => (
          <span key={opp.id} className="text-xs px-2 py-1 rounded-full bg-teal-100 text-teal-700">
            📍 {opp.location || 'Remote'}
          </span>
        ))}
      </div>
    </div>
  );
}
