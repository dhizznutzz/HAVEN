import { createClient } from '@/lib/supabase/server';
import { sendLowWellbeingReply } from '@/lib/behaviour/whatsapp';

// SETUP: In Twilio Console → Messaging → WhatsApp Sandbox settings
// "When a message comes in" → https://<your-domain>/api/integrations/whatsapp/webhook
// Method: HTTP POST

export async function POST(req: Request) {
  const formData    = await req.formData();
  const from        = formData.get('From') as string;    // "whatsapp:+601234567890"
  const messageBody = formData.get('Body') as string;

  console.log('[WA webhook] received — From:', from, '| Body:', messageBody);

  if (!from || !messageBody) {
    console.log('[WA webhook] missing From or Body, ignoring');
    return twimlEmpty();
  }

  // Normalise: strip whatsapp: prefix, spaces, dashes
  const rawPhone    = from.replace('whatsapp:', '').replace(/[\s\-]/g, '');
  const trimmed     = messageBody.trim();
  const numericScore = /^[1-5]$/.test(trimmed) ? (parseInt(trimmed, 10) as 1|2|3|4|5) : null;

  console.log('[WA webhook] normalised phone:', rawPhone, '| score:', numericScore);

  const supabase = await createClient();

  // Try exact match first, then without leading +
  let integration: { user_id: string } | null = null;
  for (const phone of [rawPhone, rawPhone.replace(/^\+/, '')]) {
    const { data } = await supabase
      .from('whatsapp_integrations')
      .select('user_id')
      .eq('phone_number', phone)
      .eq('is_active', true)
      .single();
    if (data) { integration = data; break; }
  }

  if (!integration) {
    console.log('[WA webhook] no active integration found for phone:', rawPhone);
    return twimlEmpty();
  }

  console.log('[WA webhook] matched user_id:', integration.user_id);

  // Send low-wellbeing reply via REST API (fire and forget — do not await)
  if (numericScore === 1 || numericScore === 2) {
    console.log('[WA webhook] sending low-wellbeing reply for score:', numericScore);
    sendLowWellbeingReply(rawPhone, numericScore).catch(err =>
      console.error('[WA webhook] REST API send failed:', err.message)
    );
  }

  // Everything slow goes in the background
  processReplyInBackground(integration.user_id, trimmed, numericScore).catch(err =>
    console.error('[WA webhook] background error:', err.message)
  );

  return twimlEmpty();
}

// ─── Background ────────────────────────────────────────────────────────────

async function processReplyInBackground(
  userId: string,
  message: string,
  numericScore: number | null,
) {
  let sentimentScore = numericScore != null ? (numericScore - 3) / 2 : 0;
  let riskLevel = numericScore != null
    ? numericScore <= 1 ? 'high' : numericScore === 2 ? 'medium' : 'none'
    : 'none';

  try {
    const sentRes = await fetch(`${process.env.AI_SERVICE_URL}/sentiment-detailed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    });
    if (sentRes.ok) {
      const a = await sentRes.json();
      sentimentScore = a.sentiment_score ?? sentimentScore;
      riskLevel      = a.risk_level      ?? riskLevel;
    }
  } catch { /* keep numeric defaults */ }

  const supabase = await createClient();

  const { data: checkin } = await supabase
    .from('whatsapp_checkins')
    .select('id')
    .eq('user_id', userId)
    .is('user_reply', null)
    .order('sent_at', { ascending: false })
    .limit(1)
    .single();

  if (checkin) {
    await supabase.from('whatsapp_checkins').update({
      user_reply:            message,
      reply_sentiment_score: sentimentScore,
      reply_risk_level:      riskLevel,
      replied_at:            new Date().toISOString(),
    }).eq('id', checkin.id);

    await supabase.from('whatsapp_integrations')
      .update({ last_reply_at: new Date().toISOString() })
      .eq('user_id', userId);
  }

  fetch(`${process.env.NEXT_PUBLIC_URL}/api/behaviour/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, source: 'whatsapp' }),
  }).catch(() => {});
}

function twimlEmpty(): Response {
  return new Response(
    '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
    { headers: { 'Content-Type': 'text/xml' } },
  );
}
