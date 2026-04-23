// Deploy:  supabase functions deploy wellbeing-scorer
// Schedule: supabase functions schedule wellbeing-scorer --cron "0 3 * * *"
//           (runs daily at 03:00 UTC = 11:00 MYT)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async () => {
  const appUrl = Deno.env.get('NEXT_PUBLIC_URL') ?? 'http://localhost:3000';

  // Get all users who had any activity or integrations in the last 24h
  const since = new Date(Date.now() - 86400000).toISOString();

  const { data: activeUsers } = await supabase
    .from('behaviour_snapshots')
    .select('user_id')
    .gte('created_at', since);

  const userIds = [...new Set((activeUsers ?? []).map((r: any) => r.user_id))];

  let updated = 0;

  for (const userId of userIds) {
    const res = await fetch(`${appUrl}/api/behaviour/score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({ userId }),
    });

    if (res.ok) updated++;
  }

  // Run data retention cleanup
  await supabase.rpc('delete_old_behaviour_snapshots');
  await supabase.rpc('delete_old_whatsapp_checkins');
  await supabase.rpc('delete_old_instagram_analyses');

  return new Response(JSON.stringify({ updated, cleaned: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
