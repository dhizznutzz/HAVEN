import { createClient } from '@/lib/supabase/server';
import { sendCheckinMessage, getCheckinTemplate } from '@/lib/behaviour/whatsapp';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { phoneNumber, frequency = 'daily', checkinTime = '09:00:00' } = await req.json();

  if (!phoneNumber || !/^\+?[1-9]\d{7,14}$/.test(phoneNumber.replace(/\s/g, ''))) {
    return Response.json({ error: 'Invalid phone number' }, { status: 400 });
  }

  const clean = phoneNumber.replace(/\s/g, '');

  // Save integration (upsert in case they reconnect)
  const { error } = await supabase.from('whatsapp_integrations').upsert(
    {
      user_id: user.id,
      phone_number: clean,
      checkin_frequency: frequency,
      checkin_time: checkinTime,
      is_active: true,
      consent_given_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Send a welcome / first check-in immediately
  const template = getCheckinTemplate();
  await sendCheckinMessage(clean);

  await supabase.from('whatsapp_checkins').insert({
    user_id: user.id,
    message_sent: template,
  });

  await supabase.from('whatsapp_integrations')
    .update({ last_checkin_sent_at: new Date().toISOString() })
    .eq('user_id', user.id);

  return Response.json({ success: true });
}

export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Cascade delete removes checkins too via FK
  await supabase.from('whatsapp_integrations').delete().eq('user_id', user.id);

  return Response.json({ success: true });
}
