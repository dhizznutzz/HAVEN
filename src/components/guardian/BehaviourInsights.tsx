'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

interface Snapshot {
  snapshot_date: string;
  posts_created: number;
  safe_space_visits: number;
  late_night_sessions: number;
  session_count: number;
  daily_wellbeing_score: number | null;
}

export function BehaviourInsights() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/behaviour/snapshot?days=7')
      .then(r => r.json())
      .then(data => setSnapshots(Array.isArray(data) ? data.reverse() : []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-32 animate-pulse rounded-xl bg-white/5" />;

  if (snapshots.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
        <p className="text-sm text-gray-500">No activity recorded yet — start using HAVEN to build your insights.</p>
      </div>
    );
  }

  const chartData = snapshots.map(s => ({
    date: format(parseISO(s.snapshot_date), 'EEE'),
    Posts: s.posts_created,
    Sessions: s.session_count,
    'Safe Space': s.safe_space_visits,
  }));

  const totalPosts = snapshots.reduce((n, s) => n + (s.posts_created ?? 0), 0);
  const totalSessions = snapshots.reduce((n, s) => n + (s.session_count ?? 0), 0);
  const lateNights = snapshots.reduce((n, s) => n + (s.late_night_sessions ?? 0), 0);
  const safeSpaceVisits = snapshots.reduce((n, s) => n + (s.safe_space_visits ?? 0), 0);

  return (
    <div className="space-y-4">
      {/* Mini stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Posts', value: totalPosts },
          { label: 'Sessions', value: totalSessions },
          { label: 'Safe Space', value: safeSpaceVisits },
          { label: 'Late nights', value: lateNights, warn: lateNights >= 3 },
        ].map(stat => (
          <div key={stat.label} className={`rounded-lg p-3 text-center ${stat.warn ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-white/5'}`}>
            <p className={`text-lg font-bold ${stat.warn ? 'text-amber-400' : 'text-white'}`}>{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Activity chart */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">7-Day Activity</p>
        <ResponsiveContainer width="100%" height={80}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gradPosts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#9ca3af' }}
            />
            <Area type="monotone" dataKey="Posts" stroke="#a855f7" fill="url(#gradPosts)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-gray-600 text-center">
        This runs entirely within HAVEN. No data leaves the platform.
      </p>
    </div>
  );
}
