import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const today = new Date().toISOString().split('T')[0];

  // Merge provided fields into today's snapshot
  const { error } = await supabase.from('behaviour_snapshots').upsert(
    { user_id: user.id, snapshot_date: today, ...body },
    { onConflict: 'user_id,snapshot_date', ignoreDuplicates: false }
  );

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ success: true });
}

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get('days') ?? '7');

  const since = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('behaviour_snapshots')
    .select('*')
    .eq('user_id', user.id)
    .gte('snapshot_date', since)
    .order('snapshot_date', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json(data);
}
