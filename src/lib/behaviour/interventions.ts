import { createClient } from '@/lib/supabase/server';
import { sendGentleNudge, sendCrisisMessage } from './whatsapp';

const ALERT_THRESHOLD = parseInt(process.env.WELLBEING_SCORE_ALERT_THRESHOLD ?? '40');
const CRISIS_THRESHOLD = parseInt(process.env.WELLBEING_SCORE_CRISIS_THRESHOLD ?? '20');
const NUDGE_COOLDOWN_HOURS = 48;
const CRISIS_COOLDOWN_HOURS = 24;

export async function checkAndTriggerInterventions(userId: string, score: number): Promise<void> {
  const supabase = await createClient();
  const now = new Date();

  const { data: wellbeing } = await supabase
    .from('wellbeing_scores')
    .select('last_nudge_sent_at, last_crisis_alert_at')
    .eq('user_id', userId)
    .single();

  // ── CRISIS: score ≤ 20 ────────────────────────────────────────────────────
  if (score <= CRISIS_THRESHOLD) {
    const lastCrisis = wellbeing?.last_crisis_alert_at ? new Date(wellbeing.last_crisis_alert_at) : null;
    const hoursSince = lastCrisis ? (now.getTime() - lastCrisis.getTime()) / 3_600_000 : Infinity;

    if (hoursSince > CRISIS_COOLDOWN_HOURS) {
      // In-app notification
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'crisis_support',
        title: 'HAVEN is here for you 💙',
        body: "We noticed you might be going through a tough time. You're not alone — would you like to talk?",
        action_url: '/safe-space',
        priority: 'high',
      });

      // WhatsApp crisis message if connected
      const { data: wa } = await supabase
        .from('whatsapp_integrations')
        .select('phone_number')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (wa) await sendCrisisMessage(wa.phone_number);

      // Anonymised cohort-level signal for counselor dashboard
      const { data: profile } = await supabase
        .from('profiles')
        .select('school')
        .eq('id', userId)
        .single();

      if (profile?.school) {
        await supabase.from('wellbeing_events').insert({
          school: profile.school,
          cohort: 'unknown',
          risk_category: 'combined_signals',
          risk_level: 'high',
          week_start: now.toISOString().split('T')[0],
        });
      }

      await supabase
        .from('wellbeing_scores')
        .update({ last_crisis_alert_at: now.toISOString() })
        .eq('user_id', userId);

      await supabase.from('wellbeing_interventions').insert({
        user_id: userId,
        intervention_type: 'counselor_alert',
        trigger_score: score,
        trigger_source: 'combined',
      });
    }
    return;
  }

  // ── GENTLE NUDGE: score ≤ 40 ─────────────────────────────────────────────
  if (score <= ALERT_THRESHOLD) {
    const lastNudge = wellbeing?.last_nudge_sent_at ? new Date(wellbeing.last_nudge_sent_at) : null;
    const hoursSince = lastNudge ? (now.getTime() - lastNudge.getTime()) / 3_600_000 : Infinity;

    if (hoursSince > NUDGE_COOLDOWN_HOURS) {
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'gentle_nudge',
        title: 'How are you doing? 💚',
        body: 'Your HAVEN circles and Safe Space are always here if you need them.',
        action_url: '/safe-space',
        priority: 'normal',
      });

      const { data: wa } = await supabase
        .from('whatsapp_integrations')
        .select('phone_number')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (wa) await sendGentleNudge(wa.phone_number);

      await supabase
        .from('wellbeing_scores')
        .update({ last_nudge_sent_at: now.toISOString() })
        .eq('user_id', userId);

      await supabase.from('wellbeing_interventions').insert({
        user_id: userId,
        intervention_type: 'gentle_nudge',
        trigger_score: score,
        trigger_source: 'combined',
      });
    }
  }
}
