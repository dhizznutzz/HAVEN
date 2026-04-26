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

  // Save integration — always do this first so the user is connected regardless
  const { error: dbError } = await supabase.from('whatsapp_integrations').upsert(
    {
      user_id:           user.id,
      phone_number:      clean,
      checkin_frequency: frequency,
      checkin_time:      checkinTime,
      is_active:         true,
      consent_given_at:  new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (dbError) return Response.json({ error: dbError.message }, { status: 500 });

  // Attempt to send welcome message — but never let a Twilio error block the response
  let welcomeSent = false;
  let rateLimited = false;
  try {
    const template = getCheckinTemplate();
    await sendCheckinMessage(clean);
    welcomeSent = true;

    await supabase.from('whatsapp_checkins').insert({
      user_id:      user.id,
      message_sent: template,
    });
    await supabase.from('whatsapp_integrations')
      .update({ last_checkin_sent_at: new Date().toISOString() })
      .eq('user_id', user.id);
  } catch (err: any) {
    // Twilio sandbox 5 msg/day limit (code 63038) or any other send failure
    rateLimited = err?.code === 63038 || err?.status === 429;
    console.warn('[WA connect] welcome message not sent:', err?.message ?? err);
  }

  return Response.json({
    success: true,
    welcome_sent: welcomeSent,
    // Tell the client why if the welcome message didn't go through
    ...(rateLimited && {
      warning: 'Connected successfully! The Twilio sandbox daily message limit has been reached — your first check-in will arrive tomorrow.',
    }),
  });
}

export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  await supabase.from('whatsapp_integrations').delete().eq('user_id', user.id);
  return Response.json({ success: true });
}
