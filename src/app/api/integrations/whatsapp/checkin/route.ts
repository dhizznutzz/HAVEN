import { createClient } from '@/lib/supabase/server';
import { sendCheckinMessage, getCheckinTemplate } from '@/lib/behaviour/whatsapp';

// Called by the edge function scheduler (service role token) or manually
export async function POST(req: Request) {
  const supabase = await createClient();
  const { userId, phoneNumber } = await req.json();

  if (!userId || !phoneNumber) {
    return Response.json({ error: 'Missing userId or phoneNumber' }, { status: 400 });
  }

  const template = getCheckinTemplate();

  try {
    await sendCheckinMessage(phoneNumber);
  } catch (err: any) {
    return Response.json({ error: `WhatsApp send failed: ${err.message}` }, { status: 500 });
  }

  await supabase.from('whatsapp_checkins').insert({
    user_id: userId,
    message_sent: template,
  });

  await supabase
    .from('whatsapp_integrations')
    .update({ last_checkin_sent_at: new Date().toISOString() })
    .eq('user_id', userId);

  return Response.json({ success: true });
}
