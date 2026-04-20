import { createClient } from '@/lib/supabase/server';
import { rankFeedPosts } from '@/lib/ai/recommender';

export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const pillar = searchParams.get('pillar');
  const limit = parseInt(searchParams.get('limit') || '20');

  let query = supabase
    .from('posts')
    .select('*, profiles(id, username, display_name, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (pillar && pillar !== 'all') {
    query = query.eq('pillar', pillar);
  }

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Get user profile for ranking
  const { data: { user } } = await supabase.auth.getUser();
  let ranked = data || [];

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('skills, interests')
      .eq('id', user.id)
      .single();

    if (profile) {
      ranked = rankFeedPosts(ranked as any, profile);
    }
  }

  return Response.json(ranked);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { data, error } = await supabase.from('posts').insert({
    ...body,
    author_id: user.id,
  }).select().single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
