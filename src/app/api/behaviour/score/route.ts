import { createClient } from '@/lib/supabase/server';
import { computeWellbeingScore } from '@/lib/behaviour/scorer';
import { checkAndTriggerInterventions } from '@/lib/behaviour/interventions';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { userId } = await req.json();

  if (!userId) return Response.json({ error: 'Missing userId' }, { status: 400 });

  const score = await computeWellbeingScore(userId);
  await checkAndTriggerInterventions(userId, score);

  return Response.json({ score });
}

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data } = await supabase
    .from('wellbeing_scores')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return Response.json(data ?? { score: 100, score_trend: 'stable' });
}
