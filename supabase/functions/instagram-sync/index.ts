// Deploy:  supabase functions deploy instagram-sync
// Schedule: supabase functions schedule instagram-sync --cron "0 2 * * *"
//           (runs daily at 02:00 UTC = 10:00 MYT)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async () => {
  const appUrl = Deno.env.get('NEXT_PUBLIC_URL') ?? 'http://localhost:3000';

  const { data: integrations, error } = await supabase
    .from('instagram_integrations')
    .select('user_id, token_expires_at')
    .eq('is_active', true);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  let synced = 0;
  let skipped = 0;

  for (const integration of integrations ?? []) {
    // Skip if token has expired
    if (integration.token_expires_at && new Date(integration.token_expires_at) < new Date()) {
      // Deactivate expired integrations
      await supabase
        .from('instagram_integrations')
        .update({ is_active: false })
        .eq('user_id', integration.user_id);
      skipped++;
      continue;
    }

    const res = await fetch(`${appUrl}/api/integrations/instagram/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({ userId: integration.user_id }),
    });

    if (res.ok) synced++;
  }

  return new Response(JSON.stringify({ synced, skipped }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
