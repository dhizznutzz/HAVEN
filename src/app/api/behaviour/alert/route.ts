import { createClient } from '@/lib/supabase/server';
import { checkAndTriggerInterventions } from '@/lib/behaviour/interventions';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { score } = await req.json();
  if (typeof score !== 'number') return Response.json({ error: 'Missing score' }, { status: 400 });

  await checkAndTriggerInterventions(user.id, score);

  return Response.json({ triggered: true });
}
