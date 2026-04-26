'use client';

export const dynamic = 'force-dynamic';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { PostCard } from '@/components/feed/PostCard';
import { FeedFilter } from '@/components/feed/FeedFilter';
import { CreatePostModal } from '@/components/feed/CreatePostModal';
import { PillarSidebar } from '@/components/layout/PillarSidebar';
import { LikeRecommendations } from '@/components/feed/LikeRecommendations';
import { Post, Pillar } from '@/types';
import { ALL_CIRCLES } from '@/data/circles-data';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

const DEMO_POSTS: Post[] = [
  {
    id: '1',
    author_id: 'a1',
    content: 'Just completed my first Python script to automate my study schedule! It pulls from Google Calendar and sends me daily reminders. Coding really does solve real problems 🐍',
    pillar: 'grow',
    tags: ['python', 'automation', 'beginner'],
    is_anonymous: false,
    sentiment_score: 0.8,
    risk_level: 'none',
    likes: 24,
    image_url: null,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    profiles: { id: 'a1', username: 'fariz_codes', display_name: 'Fariz', bio: null, avatar_url: null, school: 'UPM', location: 'Serdang', level: 5, points: 890, skills: ['python'], interests: ['tech'], role: 'youth', is_anonymous_mode: false, wellbeing_score: 80, created_at: '' },
  },
  {
    id: '2',
    author_id: 'a2',
    content: "Looking for volunteers for our Hari Raya community clean-up in Cheras this Saturday! Free lunch provided. Let's make our neighbourhood shine ✨",
    pillar: 'connect',
    tags: ['volunteer', 'community', 'kuala-lumpur'],
    is_anonymous: false,
    sentiment_score: 0.7,
    risk_level: 'none',
    likes: 18,
    image_url: null,
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    profiles: { id: 'a2', username: 'sayang_komuniti', display_name: 'Siti Aishah', bio: null, avatar_url: null, school: 'UM', location: 'KL', level: 8, points: 1450, skills: [], interests: [], role: 'org', is_anonymous_mode: false, wellbeing_score: 90, created_at: '' },
  },
  {
    id: '3',
    author_id: 'a3',
    content: "Exam season is rough. Anyone else feel like they're running on 3 hours of sleep and pure anxiety? SPM really tests more than just knowledge 😮‍💨",
    pillar: 'safe_space',
    tags: ['exam', 'stress'],
    is_anonymous: true,
    sentiment_score: -0.5,
    risk_level: 'low',
    likes: 41,
    image_url: null,
    created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
    profiles: undefined,
  },
  {
    id: '4',
    author_id: 'a4',
    content: 'Our UI/UX Bangi Circle had our first design critique session! Everyone gave such thoughtful feedback. This community is different 💜 DM if you want to join',
    pillar: 'circle',
    tags: ['uiux', 'design', 'community', 'bangi'],
    is_anonymous: false,
    sentiment_score: 0.9,
    risk_level: 'none',
    likes: 33,
    image_url: null,
    created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    profiles: { id: 'a4', username: 'priya_designs', display_name: 'Priya', bio: null, avatar_url: null, school: 'UKM', location: 'Bangi', level: 6, points: 1120, skills: ['design'], interests: ['design'], role: 'youth', is_anonymous_mode: false, wellbeing_score: 85, created_at: '' },
  },
];

interface CircleRec { id: string; name: string; emoji: string; category: string; member_count: number; }
interface SkillRec { name: string; reason: string; resources: string[]; }

const FALLBACK_SKILLS: SkillRec[] = [
  { name: 'Python Programming', reason: 'High demand in Malaysian tech and data roles', resources: ['freeCodeCamp', 'CS50P'] },
  { name: 'UI/UX Design', reason: 'Growing need for product designers in KL', resources: ['Figma Community', 'Google UX Certificate'] },
  { name: 'Public Speaking', reason: 'Valued across every Malaysian career path', resources: ['Toastmasters Malaysia', 'TED Masterclass'] },
];

function computeLocalRecs(liked: Post[]) {
  const tags = liked.flatMap(p => p.tags ?? []);
  const pillars = [...new Set(liked.map(p => p.pillar))];

  const scored = ALL_CIRCLES.map(c => ({
    id: c.id, name: c.name, emoji: c.emoji, category: c.category, member_count: c.member_count,
    score: c.interest_tags.filter(t => tags.some(ut => ut.includes(t) || t.includes(ut))).length,
  }));
  const topCircles = scored.filter(c => c.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
  const circles: CircleRec[] = topCircles.length > 0
    ? topCircles
    : ALL_CIRCLES.slice(0, 3).map(c => ({ id: c.id, name: c.name, emoji: c.emoji, category: c.category, member_count: c.member_count }));

  const oppTypes = pillars.includes('connect') ? ['volunteer', 'program']
    : pillars.includes('grow') ? ['internship', 'program']
    : ['internship', 'volunteer'];

  return { circles, skills: FALLBACK_SKILLS, oppTypes };
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>(DEMO_POSTS);
  const [filter, setFilter] = useState<Pillar | 'all'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);

  // Likes tracking
  const likedPostsRef = useRef<Map<string, Post>>(new Map());
  const [likedCount, setLikedCount] = useState(0);
  const [showReco, setShowReco] = useState(false);
  const [aiRefining, setAiRefining] = useState(false);
  const [recoCircles, setRecoCircles] = useState<CircleRec[]>([]);
  const [recoSkills, setRecoSkills] = useState<SkillRec[]>([]);
  const [recoOppTypes, setRecoOppTypes] = useState<string[]>([]);
  const [recoSummary, setRecoSummary] = useState('');
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const fetchAbortRef = useRef<AbortController | null>(null);
  const supabase = createClient();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?pillar=${filter}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) setPosts(data);
      }
    } catch {
      // keep demo posts
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, [filter]);

  // Load joined circle IDs
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('circle_members').select('circle_id').eq('user_id', user.id)
        .then(({ data }) => {
          if (data) setJoinedIds(new Set(data.map((r: { circle_id: string }) => r.circle_id)));
        });
    });
  }, []);

  const fetchRecommendations = useCallback(async (liked: Post[]) => {
    fetchAbortRef.current?.abort();
    const ctrl = new AbortController();
    fetchAbortRef.current = ctrl;

    setAiRefining(true);
    try {
      const payload = liked.map(p => ({ tags: p.tags, pillar: p.pillar, content: p.content }));
      const res = await fetch('/api/ai/feed-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ likedPosts: payload }),
        signal: ctrl.signal,
      });
      if (!res.ok) return;
      const data = await res.json();
      setRecoCircles(data.circles ?? []);
      setRecoSkills(data.skills ?? []);
      setRecoOppTypes(data.opportunity_types ?? []);
      setRecoSummary(data.summary ?? '');
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
    } finally {
      setAiRefining(false);
    }
  }, []);

  const handlePostLike = useCallback((post: Post) => {
    const map = likedPostsRef.current;
    if (map.has(post.id)) return;
    map.set(post.id, post);
    const allPosts = [...map.values()];
    setLikedCount(map.size);

    // Show local recs immediately so the panel renders with content
    const local = computeLocalRecs(allPosts);
    setRecoCircles(local.circles);
    setRecoSkills(local.skills);
    setRecoOppTypes(local.oppTypes);
    setShowReco(true);

    // AI refines in background
    fetchRecommendations(allPosts);
  }, [fetchRecommendations]);

  const handleJoinCircle = async (circleId: string) => {
    const circle = ALL_CIRCLES.find(c => c.id === circleId);
    if (!circle) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setJoinedIds(prev => new Set([...prev, circleId]));
      toast.success(`Joined ${circle.name}!`);
      return;
    }
    const res = await fetch('/api/circles/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ circle_id: circleId }),
    });
    if (res.ok) {
      setJoinedIds(prev => new Set([...prev, circleId]));
      toast.success(`Joined ${circle.name}!`);
    } else {
      const err = await res.json();
      toast.error(err.error || 'Failed to join');
    }
  };

  const filteredPosts = filter === 'all' ? posts : posts.filter(p => p.pillar === filter);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 flex gap-6">
      <PillarSidebar />

      <div className="flex-1 min-w-0 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <FeedFilter active={filter} onChange={setFilter} />
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-sage-600 text-white rounded-xl text-sm font-medium hover:bg-sage-700 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            Post
          </button>
        </div>

        {/* AI recommendation panel — shown after first like */}
        {showReco && likedCount > 0 && (
          <LikeRecommendations
            likedCount={likedCount}
            circles={recoCircles}
            skills={recoSkills}
            opportunityTypes={recoOppTypes}
            summary={recoSummary}
            aiRefining={aiRefining}
            onDismiss={() => setShowReco(false)}
            joinedCircleIds={joinedIds}
            onJoinCircle={handleJoinCircle}
          />
        )}

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredPosts.map(post => (
          <PostCard key={post.id} post={post} onLike={handlePostLike} />
        ))}

        {!loading && filteredPosts.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">No posts yet in this pillar</p>
            <button onClick={() => setShowCreate(true)} className="text-sage-600 text-sm mt-2 hover:underline">
              Be the first to share something
            </button>
          </div>
        )}
      </div>

      <CreatePostModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={fetchPosts}
        defaultPillar={filter === 'all' ? 'grow' : filter}
      />
    </div>
  );
}
