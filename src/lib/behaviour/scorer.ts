import { createClient } from '@/lib/supabase/server';

export async function computeWellbeingScore(userId: string): Promise<number> {
  const supabase = await createClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

  // ── HAVEN In-App Score ──────────────────────────────────────────────────────
  const { data: snapshots } = await supabase
    .from('behaviour_snapshots')
    .select('*')
    .eq('user_id', userId)
    .gte('snapshot_date', sevenDaysAgo)
    .order('snapshot_date', { ascending: false });

  let havenScore = 70;

  if (snapshots && snapshots.length > 0) {
    const latest = snapshots[0];
    const weekAvgPosts =
      snapshots.reduce((s: number, d: any) => s + (d.posts_created ?? 0), 0) / snapshots.length;

    if ((latest.posts_created ?? 0) > 0) havenScore += 10;
    if ((latest.circles_active_in ?? 0) > 0) havenScore += 10;
    if ((latest.posts_liked ?? 0) > 2) havenScore += 5;
    if ((latest.comments_made ?? 0) > 0) havenScore += 5;

    if ((latest.posts_created ?? 0) === 0 && weekAvgPosts > 1) havenScore -= 15;
    if ((latest.late_night_sessions ?? 0) >= 3) havenScore -= 15;
    if ((latest.safe_space_visits ?? 0) > 2) havenScore -= 10;
    if (latest.avg_post_sentiment !== null && latest.avg_post_sentiment < -0.3) havenScore -= 20;

    const oldPosts = snapshots.slice(-3).reduce((s: number, d: any) => s + (d.posts_created ?? 0), 0);
    const newPosts = snapshots.slice(0, 3).reduce((s: number, d: any) => s + (d.posts_created ?? 0), 0);
    if (oldPosts > 5 && newPosts === 0) havenScore -= 20;
  }

  havenScore = Math.max(0, Math.min(100, havenScore));

  // ── WhatsApp Score ──────────────────────────────────────────────────────────
  const { data: checkins } = await supabase
    .from('whatsapp_checkins')
    .select('reply_sentiment_score, reply_risk_level, replied_at')
    .eq('user_id', userId)
    .not('user_reply', 'is', null)
    .gte('sent_at', new Date(Date.now() - 7 * 86400000).toISOString())
    .order('sent_at', { ascending: false });

  let waScore = 70;
  const hasWA = (checkins?.length ?? 0) > 0;

  if (hasWA && checkins) {
    const avgSentiment =
      checkins.reduce((s: number, c: any) => s + (c.reply_sentiment_score ?? 0), 0) / checkins.length;
    const hasHighRisk = checkins.some((c: any) => c.reply_risk_level === 'high');

    waScore = 50 + avgSentiment * 40;
    if (hasHighRisk) waScore = Math.min(waScore, 25);
    if (checkins.length < 2) waScore -= 10;
    waScore = Math.max(0, Math.min(100, waScore));
  }

  // ── Instagram Score ─────────────────────────────────────────────────────────
  const { data: igPosts } = await supabase
    .from('instagram_post_analyses')
    .select('sentiment_score, risk_level, posted_at')
    .eq('user_id', userId)
    .gte('posted_at', new Date(Date.now() - 14 * 86400000).toISOString())
    .order('posted_at', { ascending: false });

  let igScore = 70;
  const hasIG = (igPosts?.length ?? 0) > 0;

  if (hasIG && igPosts) {
    const avgSentiment =
      igPosts.reduce((s: number, p: any) => s + (p.sentiment_score ?? 0), 0) / igPosts.length;
    const hasHighRisk = igPosts.some((p: any) => p.risk_level === 'high');

    igScore = 50 + avgSentiment * 40;
    if (hasHighRisk) igScore = Math.min(igScore, 20);
    igScore = Math.max(0, Math.min(100, igScore));
  }

  // ── Weighted Combined Score ─────────────────────────────────────────────────
  let totalScore: number;
  if (hasWA && hasIG) {
    totalScore = havenScore * 0.5 + waScore * 0.3 + igScore * 0.2;
  } else if (hasWA) {
    totalScore = havenScore * 0.65 + waScore * 0.35;
  } else if (hasIG) {
    totalScore = havenScore * 0.7 + igScore * 0.3;
  } else {
    totalScore = havenScore;
  }

  totalScore = Math.round(Math.max(0, Math.min(100, totalScore)));

  // Determine trend
  const { data: prev } = await supabase
    .from('wellbeing_scores')
    .select('score')
    .eq('user_id', userId)
    .single();

  const prevScore = prev?.score ?? 70;
  const trend =
    totalScore >= prevScore + 5
      ? 'improving'
      : totalScore <= prevScore - 20
      ? 'critical'
      : totalScore <= prevScore - 10
      ? 'declining'
      : 'stable';

  await supabase.from('wellbeing_scores').upsert(
    {
      user_id: userId,
      score: totalScore,
      score_7day_avg: totalScore,
      score_trend: trend,
      haven_score: havenScore,
      whatsapp_score: hasWA ? waScore : null,
      instagram_score: hasIG ? igScore : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  return totalScore;
}
