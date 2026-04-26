'use client';

import { useRouter } from 'next/navigation';
import { X, Sparkles, Users, Zap, Briefcase, ChevronRight, Loader2 } from 'lucide-react';

interface CircleRec {
  id: string;
  name: string;
  emoji: string;
  category: string;
  member_count: number;
}

interface SkillRec {
  name: string;
  reason: string;
  resources: string[];
}

interface LikeRecommendationsProps {
  likedCount: number;
  circles: CircleRec[];
  skills: SkillRec[];
  opportunityTypes: string[];
  summary?: string;
  aiRefining?: boolean;
  onDismiss: () => void;
  joinedCircleIds: Set<string>;
  onJoinCircle: (id: string) => void;
}

export function LikeRecommendations({
  likedCount,
  circles,
  skills,
  opportunityTypes,
  summary,
  aiRefining,
  onDismiss,
  joinedCircleIds,
  onJoinCircle,
}: LikeRecommendationsProps) {
  const router = useRouter();

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-amber-200 bg-white">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-semibold text-gray-900">Suggested for you</span>
          <span className="text-xs text-gray-400">· based on {likedCount} like{likedCount !== 1 ? 's' : ''}</span>
          {aiRefining && (
            <span className="flex items-center gap-1 text-[10px] text-amber-600">
              <Loader2 className="w-3 h-3 animate-spin" />
              personalising…
            </span>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {summary && (
          <p className="text-xs text-amber-800 italic">&ldquo;{summary}&rdquo;</p>
        )}

        {/* ── Circles ── */}
        {circles.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs font-semibold text-gray-700">Circles for you</span>
              </div>
              <button
                onClick={() => router.push('/connect')}
                className="text-xs text-amber-600 hover:underline flex items-center gap-0.5"
              >
                See all <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {circles.map(c => {
                const isJoined = joinedCircleIds.has(c.id);
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 bg-white rounded-xl border border-amber-100"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base leading-none shrink-0">{c.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{c.name}</p>
                        <p className="text-[10px] text-gray-400">{c.category} · {c.member_count} members</p>
                      </div>
                    </div>
                    {isJoined ? (
                      <button
                        onClick={() => router.push(`/circle/${c.id}`)}
                        className="shrink-0 px-2.5 py-1 bg-amber-500 text-white rounded-lg text-[10px] font-medium hover:bg-amber-600 transition-colors"
                      >
                        Open Chat
                      </button>
                    ) : (
                      <button
                        onClick={() => onJoinCircle(c.id)}
                        className="shrink-0 px-2.5 py-1 border border-amber-300 bg-white text-amber-700 rounded-lg text-[10px] font-medium hover:bg-amber-50 transition-colors"
                      >
                        Join
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Skills ── */}
        {skills.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-semibold text-gray-700">Skills to build</span>
            </div>
            <div className="space-y-2">
              {skills.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 bg-white rounded-xl border border-amber-100"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800">{s.name}</p>
                    <p className="text-[10px] text-gray-400 leading-relaxed truncate">{s.reason}</p>
                  </div>
                  <button
                    onClick={() => router.push('/grow')}
                    className="shrink-0 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg text-[10px] font-medium hover:bg-purple-200 transition-colors whitespace-nowrap"
                  >
                    Start →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Opportunities ── */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Briefcase className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-semibold text-gray-700">Opportunities</span>
          </div>
          <button
            onClick={() => router.push('/connect')}
            className="w-full flex items-center justify-between gap-3 px-3 py-2.5 bg-white rounded-xl border border-amber-100 hover:border-amber-300 transition-colors"
          >
            <div className="min-w-0 text-left">
              <p className="text-xs font-semibold text-gray-800">
                {opportunityTypes.length > 0
                  ? `${opportunityTypes.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' & ')} roles`
                  : 'Roles matching your interests'}
              </p>
              <p className="text-[10px] text-gray-400">Internships, volunteer work & programmes in Malaysia</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
