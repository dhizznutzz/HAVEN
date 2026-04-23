export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { SkillBadge } from '@/components/grow/SkillBadge';
import { PostCard } from '@/components/feed/PostCard';
import { MapPin, School } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="rounded-xl border border-gray-100 bg-white p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center text-2xl mx-auto mb-4">
            👤
          </div>
          <h1 className="text-lg font-medium text-gray-900">@{username}</h1>
          <p className="text-sm text-gray-500 mt-1">Profile not found or not yet created</p>
        </div>
      </div>
    );
  }

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('author_id', profile.id)
    .eq('is_anonymous', false)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Profile header */}
      <div className="rounded-xl border border-gray-100 bg-white p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center text-xl font-medium text-sage-700">
            {profile.display_name?.[0] || profile.username[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-medium text-gray-900">{profile.display_name || profile.username}</h1>
            <p className="text-sm text-gray-500">@{profile.username}</p>
            {profile.bio && <p className="text-sm text-gray-700 mt-2">{profile.bio}</p>}
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
              {profile.school && (
                <span className="flex items-center gap-1"><School className="w-3 h-3" />{profile.school}</span>
              )}
              {profile.location && (
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.location}</span>
              )}
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-medium text-sage-600">Lv.{profile.level}</div>
            <div className="text-xs text-gray-400">{profile.points} XP</div>
          </div>
        </div>

        {profile.skills?.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-gray-400 mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s: string) => <SkillBadge key={s} skill={s} verified />)}
            </div>
          </div>
        )}
      </div>

      {/* Posts */}
      {posts && posts.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-gray-700 mb-3">Posts</h2>
          <div className="space-y-3">
            {posts.map((post: any) => (
              <PostCard key={post.id} post={{ ...post, profiles: profile }} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
