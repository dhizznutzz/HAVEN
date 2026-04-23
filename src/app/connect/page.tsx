'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Plus, X, Users, MapPin, Calendar, Zap, Lock, Search } from 'lucide-react';
import { Circle, Opportunity } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO_CIRCLES: Circle[] = [
  {
    id: '1', name: 'Python Study Group — KL',
    description: 'Weekly online sessions covering Python from basics to data science.',
    interest_tags: ['python', 'programming', 'data-science'],
    member_count: 17, max_members: 20, is_private: false,
    created_by: 'u1', created_at: new Date().toISOString(),
  },
  {
    id: '2', name: 'UI/UX Designers Bangi',
    description: 'Design critique, portfolio reviews, and Figma tips for Malaysian designers.',
    interest_tags: ['design', 'figma', 'ux'],
    member_count: 14, max_members: 20, is_private: false,
    created_by: 'u2', created_at: new Date().toISOString(),
  },
  {
    id: '3', name: 'SPM Warriors 2025',
    description: 'Study together, share tips, and motivate each other through SPM prep.',
    interest_tags: ['spm', 'study', 'academics'],
    member_count: 20, max_members: 20, is_private: false,
    created_by: 'u3', created_at: new Date().toISOString(),
  },
  {
    id: '4', name: 'Startup Founders Malaysia',
    description: 'For youth building their first startups. Pitch practice and connections.',
    interest_tags: ['entrepreneurship', 'startup', 'business'],
    member_count: 11, max_members: 15, is_private: false,
    created_by: 'u4', created_at: new Date().toISOString(),
  },
];

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

// ─── Type config ──────────────────────────────────────────────────────────────

const TYPE_STYLES: Record<string, { pill: string; dot: string }> = {
  volunteer:   { pill: 'bg-teal-50 text-teal-700 border border-teal-100',   dot: 'bg-teal-400' },
  internship:  { pill: 'bg-blue-50 text-blue-700 border border-blue-100',   dot: 'bg-blue-400' },
  program:     { pill: 'bg-emerald-50 text-emerald-700 border border-emerald-100', dot: 'bg-emerald-400' },
  event:       { pill: 'bg-amber-50 text-amber-700 border border-amber-100', dot: 'bg-amber-400' },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ConnectPage() {
  const [tab, setTab] = useState<'circles' | 'opportunities'>('circles');
  const [circles, setCircles] = useState<Circle[]>(DEMO_CIRCLES);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [jobQuery, setJobQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTags, setNewTags] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetch('/api/circles').then(r => r.json()).then(d => { if (d.length) setCircles(d); }).catch(() => {});
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

  // ── Filtering ────────────────────────────────────────────────────────────────

  const filteredCircles = circles.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.interest_tags.some(t => t.includes(search.toLowerCase()))
  );

  const filteredOpportunities = opportunities.filter(o => {
    const matchesType = typeFilter === 'all' || o.type === typeFilter;
    const matchesSearch = !search || o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.location?.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  // ── Create circle ────────────────────────────────────────────────────────────

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

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-gray-900">Community</h1>
        <p className="text-sm text-gray-500 mt-0.5">Find your people and your next opportunity</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-4">
        {(['circles', 'opportunities'] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setSearch(''); setTypeFilter('all'); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'circles' ? `Circles` : 'Opportunities'}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={tab === 'circles' ? 'Search circles or tags…' : 'Search opportunities or locations…'}
          className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-transparent"
        />
      </div>

      {/* ── CIRCLES ─────────────────────────────────────────────────────────── */}
      {tab === 'circles' && (
        <>
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

          <div className="space-y-3">
            {filteredCircles.map(c => <CircleRow key={c.id} circle={c} />)}
            {filteredCircles.length === 0 && <EmptyState text="No circles match your search" />}
          </div>
        </>
      )}

      {/* ── OPPORTUNITIES ────────────────────────────────────────────────────── */}
      {tab === 'opportunities' && (
        <>
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
              {[1, 2, 3].map(i => (
                <div key={i} className="h-36 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-400 mb-3">{filteredOpportunities.length} opportunities found in Malaysia</p>
              <div className="space-y-3">
                {filteredOpportunities.map(o => <OpportunityRow key={o.id} opportunity={o} />)}
                {filteredOpportunities.length === 0 && <EmptyState text="No opportunities match your filter" />}
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
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors"
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

// ─── Circle row card ──────────────────────────────────────────────────────────

function CircleRow({ circle }: { circle: Circle }) {
  const [joined, setJoined] = useState(false);
  const [memberCount, setMemberCount] = useState(circle.member_count);
  const supabase = createClient();
  const full = memberCount >= circle.max_members;

  // Demo circles have short numeric IDs — they don't exist in the DB
  const isDemo = !circle.id.includes('-');

  const handleJoin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('Sign in to join circles'); return; }

    let circleId = circle.id;

    // Demo circles don't exist in DB yet — create them first
    if (isDemo) {
      const createRes = await fetch('/api/circles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: circle.name,
          description: circle.description,
          interest_tags: circle.interest_tags,
          max_members: circle.max_members,
        }),
      });
      if (!createRes.ok) { toast.error('Failed to join'); return; }
      const created = await createRes.json();
      circleId = created.id;
      // Creator is auto-joined, so we're done
      setJoined(true);
      setMemberCount(c => c + 1);
      toast.success(`Joined ${circle.name}!`);
      return;
    }

    const res = await fetch('/api/circles/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ circle_id: circleId }),
    });
    const json = await res.json();

    if (!res.ok) {
      toast.error(json.error === 'Already a member' ? 'Already a member' : json.error ?? 'Failed to join');
    } else {
      setJoined(true);
      setMemberCount(c => c + 1);
      toast.success(`Joined ${circle.name}!`);
    }
  };

  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-white hover:border-amber-200 transition-colors">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-700 font-semibold text-sm">
        {circle.name[0]}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-gray-900 truncate">{circle.name}</p>
          {circle.is_private && <Lock className="w-3 h-3 text-gray-400 flex-shrink-0" />}
        </div>
        {circle.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{circle.description}</p>
        )}
        <div className="flex items-center gap-3 mt-1.5">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Users className="w-3 h-3" />
            {memberCount}/{circle.max_members}
          </span>
          {circle.interest_tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-xs px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={handleJoin}
        disabled={joined || full}
        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          joined ? 'bg-green-100 text-green-700 cursor-default'
          : full ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-amber-500 hover:bg-amber-600 text-white'
        }`}
      >
        {joined ? 'Joined' : full ? 'Full' : 'Join'}
      </button>
    </div>
  );
}

// ─── Opportunity row card ─────────────────────────────────────────────────────

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
      {/* Header row — logo + title */}
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
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.pill}`}>
              {opportunity.type}
            </span>
            {(opportunity as any).source === 'linkedin' && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-600 border border-blue-100">
                LinkedIn
              </span>
            )}
            {opportunity.match_score !== undefined && (
              <span className="flex items-center gap-0.5 text-xs text-teal-600 font-medium">
                <Zap className="w-3 h-3" />
                {opportunity.match_score}% match
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

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-12 text-center text-gray-400">
      <p className="text-sm">{text}</p>
    </div>
  );
}
