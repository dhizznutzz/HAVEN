'use client';

import { Users, Lock } from 'lucide-react';
import { Circle } from '@/types';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface CircleCardProps {
  circle: Circle;
}

export function CircleCard({ circle }: CircleCardProps) {
  const [joined, setJoined] = useState(false);
  const supabase = createClient();

  const handleJoin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('Sign in to join circles'); return; }

    const { error } = await supabase
      .from('circle_members')
      .insert({ circle_id: circle.id, user_id: user.id });

    if (error) {
      if (error.code === '23505') toast.error('Already a member');
      else toast.error('Failed to join');
    } else {
      setJoined(true);
      toast.success(`Joined ${circle.name}!`);
    }
  };

  const fullness = circle.member_count / circle.max_members;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 hover:border-amber-200 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-medium text-gray-900">{circle.name}</h3>
            {circle.is_private && <Lock className="w-3.5 h-3.5 text-gray-400" />}
          </div>
          {circle.description && (
            <p className="text-xs text-gray-500 line-clamp-2">{circle.description}</p>
          )}
        </div>
      </div>

      {circle.interest_tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {circle.interest_tags.slice(0, 4).map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Users className="w-3.5 h-3.5" />
          <span>{circle.member_count}/{circle.max_members}</span>
          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${fullness > 0.9 ? 'bg-red-400' : 'bg-amber-400'}`}
              style={{ width: `${fullness * 100}%` }}
            />
          </div>
        </div>

        <button
          onClick={handleJoin}
          disabled={joined || circle.member_count >= circle.max_members}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            joined
              ? 'bg-green-100 text-green-700 cursor-default'
              : circle.member_count >= circle.max_members
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-amber-500 text-white hover:bg-amber-600'
          }`}
        >
          {joined ? 'Joined' : circle.member_count >= circle.max_members ? 'Full' : 'Join'}
        </button>
      </div>
    </div>
  );
}
