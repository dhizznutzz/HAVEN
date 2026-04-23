'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Plus, Search, Users } from 'lucide-react';
import { Circle } from '@/types';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

const DEMO_CIRCLES: Circle[] = [
  {
    id: '1', name: 'UI/UX Designers Bangi',
    description: 'Design critique, portfolio reviews, and Figma tips for Malaysian designers.',
    interest_tags: ['design', 'figma', 'ux'],
    member_count: 14, max_members: 20, is_private: false,
    created_by: 'u2', created_at: new Date().toISOString(),
  },
  {
    id: '2', name: 'SPM Warriors 2025',
    description: 'Study together, share tips, and motivate each other through SPM prep.',
    interest_tags: ['spm', 'study', 'academics'],
    member_count: 28, max_members: 30, is_private: false,
    created_by: 'u3', created_at: new Date().toISOString(),
  },
  {
    id: '3', name: 'Python Malaysia',
    description: 'Build things together. Beginners welcome! Weekly project showcases.',
    interest_tags: ['python', 'coding'],
    member_count: 45, max_members: 50, is_private: false,
    created_by: 'u1', created_at: new Date().toISOString(),
  },
  {
    id: '4', name: 'KL Runners Club',
    description: 'Weekend runs around KL city. All paces welcome.',
    interest_tags: ['fitness', 'running'],
    member_count: 18, max_members: 25, is_private: false,
    created_by: 'u4', created_at: new Date().toISOString(),
  },
];

export default function CirclePage() {
  const [tab, setTab] = useState<'discover' | 'my'>('discover');
  const [circles, setCircles] = useState<Circle[]>(DEMO_CIRCLES);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTags, setNewTags] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetch('/api/circles').then(r => r.json()).then(d => { if (d?.length) setCircles(d); }).catch(() => {});

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('circle_members').select('circle_id').eq('user_id', user.id)
        .then(({ data }) => {
          if (data) setJoinedIds(new Set(data.map((r: { circle_id: string }) => r.circle_id)));
        });
    });
  }, []);

  const handleJoin = async (circle: Circle) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('Sign in to join circles'); return; }

    const res = await fetch('/api/circles/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ circle_id: circle.id }),
    });

    if (res.ok) {
      setJoinedIds(prev => new Set([...prev, circle.id]));
      setCircles(prev => prev.map(c => c.id === circle.id ? { ...c, member_count: c.member_count + 1 } : c));
      toast.success(`Joined ${circle.name}!`);
    } else {
      const err = await res.json();
      toast.error(err.error || 'Failed to join');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('Sign in to create a circle'); return; }

    const tags = newTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    const res = await fetch('/api/circles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, description: newDesc, interest_tags: tags }),
    });

    if (res.ok) {
      const circle = await res.json();
      setCircles(prev => [circle, ...prev]);
      setShowCreate(false);
      setNewName(''); setNewDesc(''); setNewTags('');
      toast.success('Circle created!');
    }
  };

  const filtered = circles.filter(c => {
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.interest_tags.some(t => t.includes(search.toLowerCase()));
    const matchTab = tab === 'discover' || joinedIds.has(c.id);
    return matchSearch && matchTab;
  });

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Circle</h1>
          <p className="text-sm text-gray-500 mt-0.5">Find your people</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Circle
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-100 mb-4">
        {(['discover', 'my'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
              tab === t
                ? 'border-amber-500 text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            {t === 'discover' ? 'Discover' : 'My Circles'}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search circles by interest…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-colors"
        />
      </div>

      {/* Circle cards */}
      <div className="space-y-3">
        {filtered.map(circle => {
          const isJoined = joinedIds.has(circle.id);
          const fillPct = Math.round((circle.member_count / circle.max_members) * 100);
          const isFull = circle.member_count >= circle.max_members;

          return (
            <div
              key={circle.id}
              className="rounded-xl border border-gray-100 bg-white p-4 hover:border-amber-200 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {circle.interest_tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-sm font-medium text-gray-900">{circle.name}</h3>
                  {circle.description && (
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{circle.description}</p>
                  )}
                </div>

                <button
                  onClick={() => !isJoined && !isFull && handleJoin(circle)}
                  disabled={isJoined || isFull}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isJoined
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : isFull
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'border border-amber-200 bg-white text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  {isJoined ? '✓ Joined' : isFull ? 'Full' : 'Join'}
                </button>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {circle.member_count}/{circle.max_members} members
                  </span>
                  <span className={fillPct >= 85 ? 'text-amber-600' : ''}>
                    {fillPct >= 85 ? 'Almost full' : `${100 - fillPct}% space left`}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${fillPct >= 85 ? 'bg-amber-400' : 'bg-amber-300'}`}
                    style={{ width: `${fillPct}%` }}
                  />
                </div>
              </div>

              {isJoined && (
                <div className="mt-3 px-3 py-2 bg-amber-50 rounded-lg text-xs text-amber-700">
                  You're in this circle
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && tab === 'my' && (
          <div className="text-center py-14">
            <div className="text-3xl mb-3">⭕</div>
            <p className="text-sm text-gray-500">You haven't joined any circles yet</p>
            <button
              onClick={() => setTab('discover')}
              className="mt-2 text-sm text-amber-600 hover:underline"
            >
              Browse circles →
            </button>
          </div>
        )}

        {filtered.length === 0 && tab === 'discover' && search && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">No circles match "{search}"</p>
          </div>
        )}
      </div>

      {/* Create Circle Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-sm font-medium text-gray-900">Create a Circle</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleCreate} className="p-4 space-y-3">
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Circle name"
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
              <textarea
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="What's this circle about?"
                rows={3}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
              <input
                value={newTags}
                onChange={e => setNewTags(e.target.value)}
                placeholder="Tags: design, python, fitness (comma separated)"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newName.trim()}
                  className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 disabled:opacity-40 transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
