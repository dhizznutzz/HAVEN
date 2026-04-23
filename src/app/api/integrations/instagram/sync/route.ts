import { createClient } from '@/lib/supabase/server';
import { fetchRecentPosts } from '@/lib/behaviour/instagram';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { userId } = await req.json();

  if (!userId) return Response.json({ error: 'Missing userId' }, { status: 400 });

  const { data: integration } = await supabase
    .from('instagram_integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (!integration) {
    return Response.json({ error: 'Instagram not connected' }, { status: 400 });
  }

  let posts: Array<{ id: string; caption?: string; timestamp: string }>;
  try {
    posts = await fetchRecentPosts(integration.instagram_user_id, integration.access_token);
  } catch (err: any) {
    return Response.json({ error: `Instagram API error: ${err.message}` }, { status: 502 });
  }

  let analysed = 0;

  for (const post of posts) {
    if (!post.caption?.trim()) continue;

    // Skip posts already analysed
    const { data: existing } = await supabase
      .from('instagram_post_analyses')
      .select('id')
      .eq('instagram_post_id', post.id)
      .single();

    if (existing) continue;

    let sentimentScore = 0;
    let riskLevel = 'none';
    let emotions = {};

    try {
      const sentRes = await fetch(`${process.env.AI_SERVICE_URL}/sentiment-detailed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: post.caption }),
      });
      const analysis = await sentRes.json();
      sentimentScore = analysis.sentiment_score ?? 0;
      riskLevel = analysis.risk_level ?? 'none';
      emotions = analysis.emotions ?? {};
    } catch {
      // fall through with defaults
    }

    await supabase.from('instagram_post_analyses').insert({
      user_id: userId,
      instagram_post_id: post.id,
      caption: post.caption,
      posted_at: post.timestamp,
      sentiment_score: sentimentScore,
      risk_level: riskLevel,
      emotion_labels: emotions,
    });

    analysed++;
  }

  await supabase
    .from('instagram_integrations')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('user_id', userId);

  // Recalculate wellbeing score
  fetch(`${process.env.NEXT_PUBLIC_URL}/api/behaviour/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, source: 'instagram' }),
  }).catch(() => {});

  return Response.json({ analysed });
}

export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  await supabase.from('instagram_integrations').delete().eq('user_id', user.id);

  return Response.json({ success: true });
}
