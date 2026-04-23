// Deploy:  supabase functions deploy daily-checkin-scheduler
// Schedule: supabase functions schedule daily-checkin-scheduler --cron "0 1 * * *"
//           (runs at 09:00 MYT = 01:00 UTC)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async () => {
  const now = new Date();
  const currentHour = now.getUTCHours();
  const today = now.toISOString().split('T')[0];

  const { data: integrations, error } = await supabase
    .from('whatsapp_integrations')
    .select('id, user_id, phone_number, checkin_time, checkin_frequency')
    .eq('is_active', true);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  let sent = 0;

  for (const integration of integrations ?? []) {
    // Match preferred hour (stored as UTC-equivalent — adjust if needed)
    const preferredHour = parseInt(integration.checkin_time?.split(':')[0] ?? '1');
    if (preferredHour !== currentHour) continue;

    // Skip if already sent today
    const { data: existing } = await supabase
      .from('whatsapp_checkins')
      .select('id')
      .eq('user_id', integration.user_id)
      .gte('sent_at', `${today}T00:00:00Z`)
      .maybeSingle();

    if (existing) continue;

    // Trigger checkin via HAVEN API
    const appUrl = Deno.env.get('NEXT_PUBLIC_URL') ?? 'http://localhost:3000';
    const res = await fetch(`${appUrl}/api/integrations/whatsapp/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({
        userId: integration.user_id,
        phoneNumber: integration.phone_number,
      }),
    });

    if (res.ok) sent++;
  }

  return new Response(JSON.stringify({ sent, hour: currentHour }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
