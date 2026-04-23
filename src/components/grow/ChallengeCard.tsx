'use client';

import { useState } from 'react';
import { Trophy, Users, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface Challenge {
  id: string;
  title: string;
  description: string;
  skill: string;
  xp: number;
  participants: number;
  daysLeft: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface ChallengeCardProps {
  challenge: Challenge;
}

const difficultyColor = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-red-100 text-red-700',
};

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const [joined, setJoined] = useState(false);
  const supabase = createClient();

  const handleJoin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('Sign in to join challenges'); return; }
    setJoined(true);
    toast.success(`Joined "${challenge.title}"! +${challenge.xp} XP on completion`);
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 hover:border-gray-200 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-purple-600">#{challenge.skill}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColor[challenge.difficulty]}`}>
              {challenge.difficulty}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-900">{challenge.title}</h3>
          <p className="text-xs text-gray-500 mt-1">{challenge.description}</p>
        </div>
        <div className="flex items-center gap-1 text-amber-600 shrink-0">
          <Trophy className="w-4 h-4" />
          <span className="text-sm font-medium">{challenge.xp} XP</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {challenge.participants} joined
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {challenge.daysLeft}d left
          </span>
        </div>
        <button
          onClick={handleJoin}
          disabled={joined}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            joined
              ? 'bg-green-100 text-green-700 cursor-default'
              : 'bg-sage-600 text-white hover:bg-sage-700'
          }`}
        >
          {joined ? 'Joined!' : 'Join Challenge'}
        </button>
      </div>
    </div>
  );
}
