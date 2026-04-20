// Supabase Edge Function — runs DAILY via cron
// Aggregates anonymous cohort signals. NEVER stores individual user data.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

function aggregateCohortRisks(posts: any[]): Record<string, { level: string; count: number }> {
  const cohortRisks: Record<string, { level: string; count: number }> = {};

  const RISK_ORDER: Record<string, number> = { none: 0, low: 1, medium: 2, high: 3 };

  for (const post of posts) {
    if (!post.profiles?.school) continue;

    const school = post.profiles.school;
    const cohort = post.profiles.school_cohort || 'General';
    const riskLevel = post.risk_level || 'none';

    const categories = [
      { key: 'stress', tags: ['stress', 'anxiety', 'pressure', 'overwhelmed', 'exam'] },
      { key: 'isolation', tags: ['lonely', 'alone', 'isolated', 'no friends', 'friendless'] },
      { key: 'cyberbullying', tags: ['bullying', 'harassed', 'targeted', 'attacked'] },
      { key: 'inactivity', tags: [] }, // inactivity is computed separately
    ];

    for (const cat of categories) {
      const matchesCat =
        cat.tags.length === 0 ||
        cat.tags.some(tag => post.content?.toLowerCase().includes(tag));

      if (!matchesCat) continue;

      const key = `${school}::${cohort}::${cat.key}`;
      const existing = cohortRisks[key];

      if (!existing || RISK_ORDER[riskLevel] > RISK_ORDER[existing.level]) {
        cohortRisks[key] = { level: riskLevel, count: (existing?.count || 0) + 1 };
      }
    }
  }

  return cohortRisks;
}

Deno.serve(async () => {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const { data: posts, error } = await supabase
    .from('posts')
    .select('content, risk_level, profiles(school)')
    .gte('created_at', weekStart.toISOString())
    .eq('pillar', 'safe_space');

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const cohortRisks = aggregateCohortRisks(posts || []);
  const weekStartDate = weekStart.toISOString().split('T')[0];

  for (const [key, data] of Object.entries(cohortRisks)) {
    const [school, cohort, category] = key.split('::');
    await supabase.from('wellbeing_events').upsert({
      school,
      cohort,
      risk_category: category,
      risk_level: data.level,
      week_start: weekStartDate,
    });
  }

  return new Response(JSON.stringify({ processed: Object.keys(cohortRisks).length }));
});
