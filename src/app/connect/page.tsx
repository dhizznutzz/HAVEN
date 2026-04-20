'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { OpportunityCard } from '@/components/connect/OpportunityCard';
import { OpportunityMap } from '@/components/connect/OpportunityMap';
import { Opportunity } from '@/types';

const DEMO_OPPORTUNITIES: Opportunity[] = [
  {
    id: '1',
    org_id: 'o1',
    title: 'Environmental Education Volunteer',
    description: 'Teach local school students about environmental conservation. Weekly 2-hour sessions.',
    type: 'volunteer',
    location: 'Petaling Jaya, Selangor',
    lat: 3.1073,
    lng: 101.6067,
    skills_required: ['Communication', 'Environmental Science'],
    deadline: new Date(Date.now() + 14 * 24 * 3600000).toISOString(),
    slots: 10,
    created_at: new Date().toISOString(),
    match_score: 94,
  },
  {
    id: '2',
    org_id: 'o2',
    title: 'UI/UX Design Intern',
    description: 'Join our product team to design mobile-first experiences for 1M+ Malaysian users.',
    type: 'internship',
    location: 'Kuala Lumpur (Hybrid)',
    lat: 3.1390,
    lng: 101.6869,
    skills_required: ['Figma', 'UI/UX Design', 'Prototyping'],
    deadline: new Date(Date.now() + 21 * 24 * 3600000).toISOString(),
    slots: 3,
    created_at: new Date().toISOString(),
    match_score: 88,
  },
  {
    id: '3',
    org_id: 'o3',
    title: 'Youth Leadership Programme 2025',
    description: 'A 3-month cohort for ambitious Malaysian youth to develop leadership skills with top mentors.',
    type: 'program',
    location: 'Putrajaya',
    lat: 2.9264,
    lng: 101.6964,
    skills_required: ['Leadership', 'Public Speaking'],
    deadline: new Date(Date.now() + 30 * 24 * 3600000).toISOString(),
    slots: 50,
    created_at: new Date().toISOString(),
    match_score: 79,
  },
  {
    id: '4',
    org_id: 'o4',
    title: 'Tech for Good Hackathon',
    description: 'Build solutions for Malaysian social challenges in 48 hours. Cash prizes up to RM5000.',
    type: 'event',
    location: 'Cyberjaya',
    lat: 2.9195,
    lng: 101.6500,
    skills_required: ['Programming', 'Design', 'Problem Solving'],
    deadline: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
    slots: 200,
    created_at: new Date().toISOString(),
    match_score: 91,
  },
];

const TYPES = ['all', 'volunteer', 'internship', 'program', 'event'] as const;

export default function ConnectPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(DEMO_OPPORTUNITIES);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [view, setView] = useState<'list' | 'map'>('list');

  useEffect(() => {
    fetch('/api/opportunities')
      .then(r => r.json())
      .then(data => { if (data.length > 0) setOpportunities(data); })
      .catch(() => {});
  }, []);

  const filtered = typeFilter === 'all'
    ? opportunities
    : opportunities.filter(o => o.type === typeFilter);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Connect</h1>
          <p className="text-sm text-gray-500">Opportunities matched to your profile</p>
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${view === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
          >
            List
          </button>
          <button
            onClick={() => setView('map')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${view === 'map' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
          >
            Map
          </button>
        </div>
      </div>

      {/* Type filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6">
        {TYPES.map(type => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap capitalize transition-colors ${
              typeFilter === type
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {type === 'all' ? 'All types' : type}
          </button>
        ))}
      </div>

      {view === 'map' ? (
        <OpportunityMap opportunities={filtered} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map(opp => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">No opportunities found for this filter</p>
        </div>
      )}
    </div>
  );
}
