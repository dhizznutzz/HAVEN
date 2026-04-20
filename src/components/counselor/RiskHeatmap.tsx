'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { WellbeingEvent } from '@/types';

const RISK_COLORS: Record<string, string> = {
  high: 'bg-red-200 text-red-900',
  medium: 'bg-amber-200 text-amber-900',
  low: 'bg-yellow-100 text-yellow-900',
  minimal: 'bg-green-200 text-green-900',
  clear: 'bg-teal-100 text-teal-900',
};

const CATEGORIES = ['stress', 'isolation', 'cyberbullying', 'inactivity'];

const RISK_ORDER: Record<string, number> = { high: 4, medium: 3, low: 2, minimal: 1, clear: 0 };

function getOverallRisk(cohortEvents: WellbeingEvent[]): string {
  if (cohortEvents.length === 0) return 'clear';
  const sorted = cohortEvents.sort((a, b) => (RISK_ORDER[b.risk_level] || 0) - (RISK_ORDER[a.risk_level] || 0));
  return sorted[0].risk_level;
}

export function RiskHeatmap({ school }: { school: string }) {
  const [cohortData, setCohortData] = useState<WellbeingEvent[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from('wellbeing_events')
        .select('*')
        .eq('school', school)
        .gte('week_start', weekAgo.split('T')[0]);
      setCohortData(data || []);
    };
    fetchData();
  }, [school]);

  const cohorts = [...new Set(cohortData.map(d => d.cohort))].sort();

  if (cohorts.length === 0) {
    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-8 text-center">
        <p className="text-sm text-gray-500">No wellbeing data available for this week</p>
        <p className="text-xs text-gray-400 mt-1">Data aggregates anonymously from student activity</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left text-gray-500 font-medium">Cohort</th>
            {CATEGORIES.map(c => (
              <th key={c} className="p-3 text-center text-gray-500 font-medium capitalize">{c}</th>
            ))}
            <th className="p-3 text-center text-gray-500 font-medium">Overall</th>
          </tr>
        </thead>
        <tbody>
          {cohorts.map(cohort => {
            const cohortEvents = cohortData.filter(d => d.cohort === cohort);
            const overall = getOverallRisk(cohortEvents);

            return (
              <tr key={cohort} className="border-t border-gray-50">
                <td className="p-3 font-medium text-gray-900">{cohort}</td>
                {CATEGORIES.map(cat => {
                  const event = cohortEvents.find(d => d.risk_category === cat);
                  const level = event?.risk_level || 'clear';
                  return (
                    <td key={cat} className="p-3 text-center">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${RISK_COLORS[level]}`}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </span>
                    </td>
                  );
                })}
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${RISK_COLORS[overall]}`}>
                    {overall.charAt(0).toUpperCase() + overall.slice(1)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
