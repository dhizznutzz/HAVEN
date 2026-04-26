import { createClient } from '@/lib/supabase/server';
import { sendLowWellbeingReply } from '@/lib/behaviour/whatsapp';

// GET /api/integrations/whatsapp/test
// Sends a real low-wellbeing reply to your own number.
// Use this to verify Twilio credentials and message delivery work end-to-end.
// Remove or gate this route before going to production.
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  const { data: integration } = await supabase
    .from('whatsapp_integrations')
    .select('phone_number')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  if (!integration?.phone_number) {
    return Response.json({ error: 'No WhatsApp integration found for your account' }, { status: 404 });
  }

  const checks = {
    TWILIO_ACCOUNT_SID:    !!process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN:     !!process.env.TWILIO_AUTH_TOKEN,
    TWILIO_WHATSAPP_NUMBER: !!process.env.TWILIO_WHATSAPP_NUMBER,
    NEXT_PUBLIC_URL:       !!process.env.NEXT_PUBLIC_URL,
    phone_number_stored:   integration.phone_number,
  };

  try {
    await sendLowWellbeingReply(integration.phone_number, 1);
    return Response.json({ ok: true, message_sent_to: integration.phone_number, env_checks: checks });
  } catch (err: any) {
    return Response.json({ ok: false, error: err.message, env_checks: checks }, { status: 500 });
  }
}
