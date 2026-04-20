'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { ChallengeCard } from '@/components/grow/ChallengeCard';
import { LevelProgress } from '@/components/grow/LevelProgress';
import { SkillBadge } from '@/components/grow/SkillBadge';
import { PostCard } from '@/components/feed/PostCard';
import { CreatePostModal } from '@/components/feed/CreatePostModal';
import { Post } from '@/types';
import { createClient } from '@/lib/supabase/client';

const DEMO_CHALLENGES = [
  {
    id: '1',
    title: 'Build a Python CLI tool',
    description: 'Create a command-line tool that solves a real problem in your daily life.',
    skill: 'python',
    xp: 50,
    participants: 234,
    daysLeft: 5,
    difficulty: 'beginner' as const,
  },
  {
    id: '2',
    title: 'Design a mobile app mockup',
    description: 'Use Figma to design 3 screens for an app idea. Focus on user experience.',
    skill: 'ui-ux',
    xp: 75,
    participants: 189,
    daysLeft: 8,
    difficulty: 'intermediate' as const,
  },
  {
    id: '3',
    title: '30-Day Consistency Challenge',
    description: 'Post your learning progress every day for 30 days.',
    skill: 'discipline',
    xp: 200,
    participants: 512,
    daysLeft: 22,
    difficulty: 'advanced' as const,
  },
];

const DEMO_SKILL_RECS = [
  { name: 'Data Analysis', reason: 'High demand in Malaysian tech sector', resources: ['Kaggle', 'Google Certificate'] },
  { name: 'UI/UX Design', reason: 'Growing market for digital products in SEA', resources: ['Figma Community', 'YouTube'] },
  { name: 'Cloud Computing', reason: 'AWS/Azure skills are scarce locally', resources: ['AWS Free Tier', 'freeCodeCamp'] },
];

const DEMO_POSTS: Post[] = [
  {
    id: 'g1',
    author_id: 'a1',
    content: 'Week 3 of learning React. Finally understood useState and useEffect! Building a todo app as practice — the satisfaction of seeing it work is amazing.',
    pillar: 'grow',
    tags: ['react', 'javascript', 'webdev'],
    is_anonymous: false,
    sentiment_score: 0.85,
    risk_level: 'none',
    likes: 31,
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    profiles: { id: 'a1', username: 'hafiz_tech', display_name: 'Hafiz', bio: null, avatar_url: null, school: 'UTM', location: 'JB', level: 4, points: 780, skills: ['react'], interests: ['webdev'], role: 'youth', is_anonymous_mode: false, wellbeing_score: 82, created_at: '' },
  },
];

export default function GrowPage() {
  const [posts, setPosts] = useState<Post[]>(DEMO_POSTS);
  const [showCreate, setShowCreate] = useState(false);
  const [skillRecs, setSkillRecs] = useState(DEMO_SKILL_RECS);
  const [userProfile, setUserProfile] = useState({ level: 3, points: 430, skills: ['Python', 'Design'] as string[] });
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('level, points, skills').eq('id', user.id).single();
        if (data) setUserProfile(data);

        // Fetch AI skill recommendations
        try {
          const res = await fetch('/api/ai/recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userSkills: data?.skills || [], userLevel: data?.level || 1, recentActivity: 'posting' }),
          });
          if (res.ok) {
            const { skills } = await res.json();
            if (skills?.length) setSkillRecs(skills);
          }
        } catch {}
      }

      // Fetch posts
      try {
        const res = await fetch('/api/posts?pillar=grow');
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) setPosts(data);
        }
      } catch {}
    };
    init();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Grow</h1>
          <p className="text-sm text-gray-500">Skills, challenges, and learning</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Share
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Challenges */}
          <section>
            <h2 className="text-sm font-medium text-gray-700 mb-3">Active Challenges</h2>
            <div className="space-y-3">
              {DEMO_CHALLENGES.map(c => <ChallengeCard key={c.id} challenge={c} />)}
            </div>
          </section>

          {/* Posts */}
          <section>
            <h2 className="text-sm font-medium text-gray-700 mb-3">Community Posts</h2>
            <div className="space-y-3">
              {posts.map(p => <PostCard key={p.id} post={p} />)}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          {/* Level progress */}
          <LevelProgress level={userProfile.level} points={userProfile.points} />

          {/* Current skills */}
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <h3 className="text-xs font-medium text-gray-500 mb-3">Your Skills</h3>
            <div className="flex flex-wrap gap-2">
              {userProfile.skills.map(s => <SkillBadge key={s} skill={s} verified />)}
              {userProfile.skills.length === 0 && (
                <p className="text-xs text-gray-400">Add skills to your profile</p>
              )}
            </div>
          </div>

          {/* AI recommendations */}
          <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-medium text-purple-800">AI Skill Picks for You</h3>
            </div>
            <div className="space-y-3">
              {skillRecs.map((rec, i) => (
                <div key={i} className="bg-white rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-900">{rec.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{rec.reason}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {rec.resources.map(r => (
                      <span key={r} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{r}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CreatePostModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => {}}
        defaultPillar="grow"
      />
    </div>
  );
}
