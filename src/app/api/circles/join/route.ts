import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { circle_id } = await req.json();
  if (!circle_id) return Response.json({ error: 'circle_id required' }, { status: 400 });

  // Verify circle exists and has capacity
  const { data: circle, error: circleErr } = await supabase
    .from('circles')
    .select('id, member_count, max_members')
    .eq('id', circle_id)
    .single();

  if (circleErr || !circle) {
    return Response.json({ error: 'Circle not found' }, { status: 404 });
  }
  if (circle.member_count >= circle.max_members) {
    return Response.json({ error: 'Circle is full' }, { status: 409 });
  }

  const { error: insertErr } = await supabase
    .from('circle_members')
    .insert({ circle_id, user_id: user.id });

  if (insertErr) {
    if (insertErr.code === '23505') {
      return Response.json({ error: 'Already a member' }, { status: 409 });
    }
    return Response.json({ error: insertErr.message }, { status: 500 });
  }

  // Increment member_count
  await supabase
    .from('circles')
    .update({ member_count: circle.member_count + 1 })
    .eq('id', circle_id);

  return Response.json({ ok: true });
}
