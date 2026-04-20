import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('circles')
    .select('*')
    .order('member_count', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data || []);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { data, error } = await supabase.from('circles').insert({
    ...body,
    created_by: user.id,
    member_count: 1,
  }).select().single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Auto-join creator
  await supabase.from('circle_members').insert({ circle_id: data.id, user_id: user.id });

  return Response.json(data);
}
