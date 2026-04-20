'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { CircleCard } from '@/components/circle/CircleCard';
import { Circle } from '@/types';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

const DEMO_CIRCLES: Circle[] = [
  {
    id: '1', name: 'Python Study Group — KL', description: 'Weekly online sessions covering Python from basics to data science. All levels welcome.',
    interest_tags: ['python', 'programming', 'data-science'], member_count: 17, max_members: 20, is_private: false,
    created_by: 'u1', created_at: new Date().toISOString(),
  },
  {
    id: '2', name: 'UI/UX Designers Bangi', description: 'Design critique, portfolio reviews, and Figma tips for Malaysian designers.',
    interest_tags: ['design', 'figma', 'ux'], member_count: 14, max_members: 20, is_private: false,
    created_by: 'u2', created_at: new Date().toISOString(),
  },
  {
    id: '3', name: 'SPM Warriors 2025', description: 'Study together, share tips, and motivate each other through SPM prep.',
    interest_tags: ['spm', 'study', 'academics'], member_count: 20, max_members: 20, is_private: false,
    created_by: 'u3', created_at: new Date().toISOString(),
  },
  {
    id: '4', name: 'Startup Founders Malaysia', description: 'For youth building their first startups. Pitch practice, feedback, and connections.',
    interest_tags: ['entrepreneurship', 'startup', 'business'], member_count: 11, max_members: 15, is_private: false,
    created_by: 'u4', created_at: new Date().toISOString(),
  },
];

export default function CirclePage() {
  const [circles, setCircles] = useState<Circle[]>(DEMO_CIRCLES);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTags, setNewTags] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetch('/api/circles')
      .then(r => r.json())
      .then(data => { if (data.length > 0) setCircles(data); })
      .catch(() => {});
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('Sign in to create circles'); return; }

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
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Circle</h1>
          <p className="text-sm text-gray-500">Find your people</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Circle
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {circles.map(c => <CircleCard key={c.id} circle={c} />)}
      </div>

      {/* Create Circle Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-sm font-medium">Create a Circle</h2>
              <button onClick={() => setShowCreate(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
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
                className="w-full py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors"
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
