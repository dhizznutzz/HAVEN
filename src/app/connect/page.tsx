'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Users, MapPin, Calendar, Zap, Search, MessageCircle, ExternalLink } from 'lucide-react';
import { Opportunity } from '@/types';
import { ALL_CIRCLES, CATEGORIES, EnrichedCircle, CircleCategory } from '@/data/circles-data';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

// ─── Demo opportunities ────────────────────────────────────────────────────────

const DEMO_OPPORTUNITIES: Opportunity[] = [
  {
    id: '1', org_id: 'o1',
    title: 'Environmental Education Volunteer',
    description: 'Teach local school students about environmental conservation. Weekly 2-hour sessions.',
    type: 'volunteer', location: 'Petaling Jaya, Selangor',
    lat: 3.1073, lng: 101.6067,
    skills_required: ['Communication', 'Environmental Science'],
    deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
    slots: 10, created_at: new Date().toISOString(), match_score: 94,
  },
  {
    id: '2', org_id: 'o2',
    title: 'UI/UX Design Intern',
    description: 'Join our product team to design mobile-first experiences for 1M+ Malaysian users.',
    type: 'internship', location: 'Kuala Lumpur (Hybrid)',
    lat: 3.1390, lng: 101.6869,
    skills_required: ['Figma', 'UI/UX Design', 'Prototyping'],
    deadline: new Date(Date.now() + 21 * 86400000).toISOString(),
    slots: 3, created_at: new Date().toISOString(), match_score: 88,
  },
  {
    id: '3', org_id: 'o3',
    title: 'Youth Leadership Programme 2025',
    description: 'A 3-month cohort for ambitious Malaysian youth to develop leadership skills.',
    type: 'program', location: 'Putrajaya',
    lat: 2.9264, lng: 101.6964,
    skills_required: ['Leadership', 'Public Speaking'],
    deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
    slots: 50, created_at: new Date().toISOString(), match_score: 79,
  },
  {
    id: '4', org_id: 'o4',
    title: 'Tech for Good Hackathon',
    description: 'Build solutions for Malaysian social challenges in 48 hours. Cash prizes up to RM5000.',
    type: 'event', location: 'Cyberjaya',
    lat: 2.9195, lng: 101.6500,
    skills_required: ['Programming', 'Design'],
    deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
    slots: 200, created_at: new Date().toISOString(), match_score: 91,
  },
];

const TYPE_STYLES: Record<string, { pill: string }> = {
  volunteer:  { pill: 'bg-teal-50 text-teal-700 border border-teal-100' },
  internship: { pill: 'bg-blue-50 text-blue-700 border border-blue-100' },
  program:    { pill: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
  event:      { pill: 'bg-amber-50 text-amber-700 border border-amber-100' },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ConnectPage() {
  const router = useRouter();
  const supabase = createClient();

  // Top-level tabs
  const [tab, setTab] = useState<'circles' | 'opportunities'>('circles');

  // Circles state
  const [circles, setCircles] = useState<EnrichedCircle[]>(ALL_CIRCLES);
  const [circlesSubTab, setCirclesSubTab] = useState<'discover' | 'my'>('discover');
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [circleSearch, setCircleSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<CircleCategory | 'All'>('All');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTags, setNewTags] = useState('');

  // Opportunities state
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [oppSearch, setOppSearch] = useState('');
  const [jobQuery, setJobQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('circle_members').select('circle_id').eq('user_id', user.id)
        .then(({ data }) => {
          if (data) setJoinedIds(new Set(data.map((r: { circle_id: string }) => r.circle_id)));
        });
    });
    loadJobs('');
  }, []);

  async function loadJobs(query: string) {
    setJobsLoading(true);
    try {
      const url = query ? `/api/opportunities?query=${encodeURIComponent(query)}` : '/api/opportunities';
      const data = await fetch(url).then(r => r.json());
      setOpportunities(Array.isArray(data) ? data : []);
    } catch {
      setOpportunities(DEMO_OPPORTUNITIES);
    } finally {
      setJobsLoading(false);
    }
  }

  function handleJobSearch(e: React.FormEvent) {
    e.preventDefault();
    loadJobs(jobQuery);
  }

  const handleJoin = async (circle: EnrichedCircle) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setJoinedIds(prev => new Set([...prev, circle.id]));
      setCircles(prev => prev.map(c => c.id === circle.id ? { ...c, member_count: c.member_count + 1 } : c));
      toast.success(`Joined ${circle.name}!`);
      return;
    }
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
    setShowCreate(false);
    setNewName(''); setNewDesc(''); setNewTags('');
    toast.success('Circle created!');
  };

  // Filtered circles for discover
  const filteredCircles = circles.filter(c => {
    const matchSearch = !circleSearch ||
      c.name.toLowerCase().includes(circleSearch.toLowerCase()) ||
      c.description.toLowerCase().includes(circleSearch.toLowerCase()) ||
      c.interest_tags.some(t => t.includes(circleSearch.toLowerCase()));
    const matchCat = activeCategory === 'All' || c.category === activeCategory;
    return matchSearch && matchCat;
  });

  const joinedCircles = circles.filter(c => joinedIds.has(c.id));

  // Filtered opportunities
  const filteredOpportunities = (opportunities.length ? opportunities : DEMO_OPPORTUNITIES).filter(o => {
    const matchesType = typeFilter === 'all' || o.type === typeFilter;
    const matchesSearch = !oppSearch || o.title.toLowerCase().includes(oppSearch.toLowerCase()) ||
      o.location?.toLowerCase().includes(oppSearch.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-gray-900">Community</h1>
        <p className="text-sm text-gray-500 mt-0.5">Find your people and your next opportunity</p>
      </div>

      {/* Top tab switcher */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-4">
        {(['circles', 'opportunities'] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'circles' ? 'Circles' : 'Opportunities'}
          </button>
        ))}
      </div>

      {/* ── CIRCLES ─────────────────────────────────────────────────────────────── */}
      {tab === 'circles' && (
        <div>
          {/* Sub-tabs: Discover / My Circles */}
          <div className="flex gap-0 border-b border-gray-100 mb-4">
            {(['discover', 'my'] as const).map(st => (
              <button
                key={st}
                onClick={() => setCirclesSubTab(st)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
                  circlesSubTab === st
                    ? 'border-amber-500 text-gray-900'
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
              >
                {st === 'discover' ? 'Discover' : (
                  <span className="flex items-center gap-1.5">
                    My Circles
                    {joinedIds.size > 0 && (
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold leading-none">
                        {joinedIds.size}
                      </span>
                    )}
                  </span>
                )}
              </button>
            ))}
          </div>

          {circlesSubTab === 'my' ? (
            /* ── MY CIRCLES DASHBOARD ── */
            joinedCircles.length === 0 ? (
              <div className="text-center py-14">
                <div className="text-4xl mb-3">⭕</div>
                <p className="text-sm text-gray-500">You haven&apos;t joined any circles yet</p>
                <button onClick={() => setCirclesSubTab('discover')} className="mt-2 text-sm text-amber-600 hover:underline">
                  Browse circles →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-400 mb-1">{joinedCircles.length} circle{joinedCircles.length !== 1 ? 's' : ''} joined</p>
                {joinedCircles.map(circle => (
                  <div key={circle.id} className="rounded-xl border border-gray-100 bg-white p-4 hover:border-amber-200 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="text-2xl leading-none mt-0.5">{circle.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold text-gray-900">{circle.name}</h3>
                            {circle.is_real && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">Real org</span>
                            )}
                            <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                              {circle.category}
                            </span>
                          </div>
                          {circle.location && <p className="text-xs text-gray-400 mt-0.5">📍 {circle.location}</p>}
                          {circle.last_message && (
                            <p className="text-xs text-gray-500 mt-1.5 truncate">
                              <span className="text-gray-400">{circle.last_message_time} · </span>
                              {circle.last_message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {(circle.unread ?? 0) > 0 && (
                          <span className="px-1.5 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-bold leading-none">
                            {circle.unread}
                          </span>
                        )}
                        <button
                          onClick={() => router.push(`/circle/${circle.id}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 transition-colors"
                        >
                          <MessageCircle className="w-3 h-3" />
                          Open Chat
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{circle.member_count} members</span>
                      <span className="text-green-500 font-medium">● Active</span>
                      {circle.website && (
                        <a
                          href={`https://${circle.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-0.5 text-amber-600 hover:underline ml-auto"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {circle.website}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* ── DISCOVER ── */
            <div>
              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={circleSearch}
                  onChange={e => setCircleSearch(e.target.value)}
                  placeholder="Search circles by name or interest…"
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-transparent"
                />
              </div>

              {/* Category filter pills */}
              <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
                {(['All', ...CATEGORIES] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat as CircleCategory | 'All')}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                      activeCategory === cat
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-amber-300 hover:text-amber-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Count + New Circle */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400">{filteredCircles.length} circles</p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Circle
                </button>
              </div>

              {/* Circle cards */}
              <div className="space-y-3">
                {filteredCircles.map(circle => {
                  const isJoined = joinedIds.has(circle.id);
                  const fillPct = Math.round((circle.member_count / circle.max_members) * 100);
                  const isFull = circle.member_count >= circle.max_members;
                  return (
                    <div key={circle.id} className="rounded-xl border border-gray-100 bg-white p-4 hover:border-amber-200 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <span className="text-xl leading-none mt-0.5 shrink-0">{circle.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="text-sm font-semibold text-gray-900">{circle.name}</h3>
                              {circle.is_real && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">Real org</span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1 mb-1.5">
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                                {circle.category}
                              </span>
                              {circle.interest_tags.slice(0, 2).map(tag => (
                                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{circle.description}</p>
                            {circle.location && <p className="text-xs text-gray-400 mt-1">📍 {circle.location}</p>}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <button
                            onClick={() => !isJoined && !isFull && handleJoin(circle)}
                            disabled={isJoined || isFull}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              isJoined
                                ? 'bg-green-100 text-green-700 cursor-default'
                                : isFull
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'border border-amber-200 bg-white text-amber-700 hover:bg-amber-50'
                            }`}
                          >
                            {isJoined ? '✓ Joined' : isFull ? 'Full' : 'Join'}
                          </button>
                          {isJoined && (
                            <button
                              onClick={() => router.push(`/circle/${circle.id}`)}
                              className="flex items-center gap-1 text-xs text-amber-600 hover:underline"
                            >
                              <MessageCircle className="w-3 h-3" />
                              Chat
                            </button>
                          )}
                        </div>
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
                    </div>
                  );
                })}
                {filteredCircles.length === 0 && (
                  <div className="py-12 text-center text-gray-400">
                    <p className="text-sm">No circles match your search</p>
                    <button
                      onClick={() => { setCircleSearch(''); setActiveCategory('All'); }}
                      className="mt-2 text-sm text-amber-600 hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── OPPORTUNITIES ───────────────────────────────────────────────────────── */}
      {tab === 'opportunities' && (
        <>
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={oppSearch}
              onChange={e => setOppSearch(e.target.value)}
              placeholder="Search opportunities or locations…"
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-transparent"
            />
          </div>

          {/* Job keyword search */}
          <form onSubmit={handleJobSearch} className="flex gap-2 mb-3">
            <input
              value={jobQuery}
              onChange={e => setJobQuery(e.target.value)}
              placeholder="e.g. UI/UX designer, data analyst…"
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-xl transition-colors whitespace-nowrap"
            >
              Search jobs
            </button>
          </form>

          {/* Type filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 mb-3 scrollbar-hide">
            {(['all', 'volunteer', 'internship', 'program', 'event'] as const).map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  typeFilter === type
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {jobsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-36 rounded-xl bg-gray-100 animate-pulse" />)}
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-400 mb-3">{filteredOpportunities.length} opportunities found in Malaysia</p>
              <div className="space-y-3">
                {filteredOpportunities.map(o => <OpportunityRow key={o.id} opportunity={o} />)}
                {filteredOpportunities.length === 0 && (
                  <div className="py-12 text-center text-gray-400">
                    <p className="text-sm">No opportunities match your filter</p>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* Create Circle modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
              <h2 className="font-medium text-gray-900">Create a Circle</h2>
              <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-3">
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
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
              <input
                value={newTags}
                onChange={e => setNewTags(e.target.value)}
                placeholder="Tags: design, ux, figma (comma separated)"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
              <button
                type="submit"
                disabled={!newName.trim()}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Create Circle
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Opportunity card ─────────────────────────────────────────────────────────

function OpportunityRow({ opportunity }: { opportunity: Opportunity & { employer_name?: string; employer_logo?: string; apply_url?: string } }) {
  const style = TYPE_STYLES[opportunity.type] ?? TYPE_STYLES.event;

  function handleApply() {
    if ((opportunity as any).apply_url) {
      window.open((opportunity as any).apply_url, '_blank', 'noopener,noreferrer');
    } else {
      toast.success('Application submitted!');
    }
  }

  return (
    <div className="p-4 rounded-xl border border-gray-100 bg-white hover:border-teal-200 transition-colors">
      <div className="flex items-start gap-3">
        {(opportunity as any).employer_logo ? (
          <img
            src={(opportunity as any).employer_logo}
            alt={(opportunity as any).employer_name ?? ''}
            className="w-9 h-9 rounded-lg object-contain border border-gray-100 flex-shrink-0 bg-white"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0 text-teal-600 font-semibold text-sm">
            {((opportunity as any).employer_name ?? opportunity.title)[0]}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.pill}`}>{opportunity.type}</span>
            {(opportunity as any).source === 'linkedin' && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-600 border border-blue-100">LinkedIn</span>
            )}
            {opportunity.match_score !== undefined && (
              <span className="flex items-center gap-0.5 text-xs text-teal-600 font-medium">
                <Zap className="w-3 h-3" />{opportunity.match_score}% match
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-900 leading-snug">{opportunity.title}</p>
          {(opportunity as any).employer_name && (
            <p className="text-xs text-gray-400 mt-0.5">{(opportunity as any).employer_name}</p>
          )}
        </div>
      </div>

      {opportunity.description && (
        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{opportunity.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-400">
        {opportunity.location && (
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{opportunity.location}</span>
        )}
        {opportunity.deadline && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Closes {formatDistanceToNow(new Date(opportunity.deadline), { addSuffix: true })}
          </span>
        )}
      </div>

      {opportunity.skills_required.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {opportunity.skills_required.slice(0, 4).map(s => (
            <span key={s} className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">{s}</span>
          ))}
        </div>
      )}

      <button
        onClick={handleApply}
        className="mt-3 w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium transition-colors"
      >
        {(opportunity as any).apply_url ? 'Apply on site →' : 'Apply Now'}
      </button>
    </div>
  );
}
