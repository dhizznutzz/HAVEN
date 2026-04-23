'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

interface WellbeingScore {
  score: number;
  score_trend: 'improving' | 'stable' | 'declining' | 'critical';
  score_7day_avg: number | null;
  haven_score: number | null;
  whatsapp_score: number | null;
  instagram_score: number | null;
  updated_at: string | null;
}

export function WellbeingScoreCard() {
  const [data, setData] = useState<WellbeingScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/behaviour/score')
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 animate-pulse h-48" />
    );
  }

  const score = data?.score ?? 100;
  const trend = data?.score_trend ?? 'stable';

  const color =
    score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  const TrendIcon =
    trend === 'improving' ? TrendingUp : trend === 'declining' || trend === 'critical' ? TrendingDown : Minus;
  const trendLabel =
    trend === 'improving' ? 'Improving' : trend === 'declining' ? 'Declining' : trend === 'critical' ? 'Critical' : 'Stable';
  const trendColor =
    trend === 'improving' ? 'text-green-400' : trend === 'declining' ? 'text-amber-400' : trend === 'critical' ? 'text-red-400' : 'text-gray-400';

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white">Your Wellbeing Score</h3>
          <p className="text-xs text-gray-400 mt-0.5">Private — only you can see this</p>
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
          <TrendIcon className="w-4 h-4" />
          {trendLabel}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Circular progress ring */}
        <div className="relative flex-shrink-0">
          <svg width="128" height="128" className="-rotate-90">
            <circle cx="64" cy="64" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
            <circle
              cx="64" cy="64" r="54" fill="none"
              stroke={color} strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">{score}</span>
            <span className="text-xs text-gray-400">/100</span>
          </div>
        </div>

        {/* Source breakdown */}
        <div className="flex-1 space-y-2">
          {data?.haven_score != null && (
            <ScoreBar label="HAVEN" value={data.haven_score} />
          )}
          {data?.whatsapp_score != null && (
            <ScoreBar label="WhatsApp" value={data.whatsapp_score} />
          )}
          {data?.instagram_score != null && (
            <ScoreBar label="Instagram" value={data.instagram_score} />
          )}
          {data?.score_7day_avg != null && (
            <p className="text-xs text-gray-500 pt-1">
              7-day avg: {Math.round(data.score_7day_avg)}
            </p>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4 border-t border-white/5 pt-3">
        📞 Befrienders Malaysia: <span className="font-medium text-gray-400">03-7627 2929</span> (free, 24/7)
      </p>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? 'bg-green-500' : value >= 40 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${value}%`, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}
