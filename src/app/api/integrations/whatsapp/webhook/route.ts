import { createClient } from '@/lib/supabase/server';

// Twilio sends form-encoded POST when user replies to HAVEN's WhatsApp number
export async function POST(req: Request) {
  const supabase = await createClient();
  const formData = await req.formData();

  const from = formData.get('From') as string;        // e.g. "whatsapp:+601234567890"
  const messageBody = formData.get('Body') as string;

  if (!from || !messageBody) {
    return new Response(twimlEmpty(), { headers: { 'Content-Type': 'text/xml' } });
  }

  const phoneNumber = from.replace('whatsapp:', '');

  // Find user by phone number
  const { data: integration } = await supabase
    .from('whatsapp_integrations')
    .select('user_id')
    .eq('phone_number', phoneNumber)
    .eq('is_active', true)
    .single();

  if (!integration) {
    return new Response(twimlEmpty(), { headers: { 'Content-Type': 'text/xml' } });
  }

  // Run detailed sentiment analysis via Python microservice
  let sentimentScore = 0;
  let riskLevel = 'none';
  try {
    const sentRes = await fetch(`${process.env.AI_SERVICE_URL}/sentiment-detailed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: messageBody }),
    });
    const analysis = await sentRes.json();
    sentimentScore = analysis.sentiment_score ?? 0;
    riskLevel = analysis.risk_level ?? 'none';
  } catch {
    // fall through with defaults if Python service is down
  }

  // Find the most recent unanswered check-in
  const { data: checkin } = await supabase
    .from('whatsapp_checkins')
    .select('id')
    .eq('user_id', integration.user_id)
    .is('user_reply', null)
    .order('sent_at', { ascending: false })
    .limit(1)
    .single();

  if (checkin) {
    await supabase
      .from('whatsapp_checkins')
      .update({
        user_reply: messageBody,
        reply_sentiment_score: sentimentScore,
        reply_risk_level: riskLevel,
        replied_at: new Date().toISOString(),
      })
      .eq('id', checkin.id);

    await supabase
      .from('whatsapp_integrations')
      .update({ last_reply_at: new Date().toISOString() })
      .eq('user_id', integration.user_id);
  }

  // Trigger wellbeing score recalculation in the background
  fetch(`${process.env.NEXT_PUBLIC_URL}/api/behaviour/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: integration.user_id, source: 'whatsapp' }),
  }).catch(() => {});

  return new Response(twimlEmpty(), { headers: { 'Content-Type': 'text/xml' } });
}

function twimlEmpty(): string {
  return `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;
}
