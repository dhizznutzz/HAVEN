import { Post, Profile } from '@/types';

export function rankFeedPosts(posts: Post[], userProfile: Partial<Profile>): Post[] {
  return posts
    .map(post => ({
      ...post,
      _score: calculateFeedScore(post, userProfile),
    }))
    .sort((a: any, b: any) => b._score - a._score)
    .map(({ _score: _, ...post }) => post as Post);
}

function calculateFeedScore(post: Post, user: Partial<Profile>): number {
  let score = 0;

  // Recency (decays over 48 hours)
  const hoursAgo = (Date.now() - new Date(post.created_at).getTime()) / 3600000;
  score += Math.max(0, 100 - hoursAgo * 2);

  // Skill/interest relevance
  const userSkills = user.skills || [];
  const userInterests = user.interests || [];
  const overlap = post.tags.filter(t =>
    userSkills.includes(t) || userInterests.includes(t)
  ).length;
  score += overlap * 30;

  // Social engagement
  score += post.likes * 2;

  // Penalise very negative posts outside Safe Space
  if (post.pillar !== 'safe_space' && (post.sentiment_score ?? 0) < -0.3) {
    score -= 15;
  }

  return score;
}

export async function findCompatibleUsers(userId: string, supabase: any) {
  const { data: currentUser } = await supabase
    .from('profiles')
    .select('embedding, skills, interests')
    .eq('id', userId)
    .single();

  if (!currentUser?.embedding) return [];

  const { data: matches } = await supabase.rpc('match_users', {
    query_embedding: currentUser.embedding,
    match_threshold: 0.7,
    match_count: 10,
    exclude_id: userId,
  });

  return matches || [];
}
