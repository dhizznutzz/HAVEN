import { createClient } from '@/lib/supabase/client';

export type BehaviourEvent =
  | 'post_created'
  | 'post_liked'
  | 'comment_made'
  | 'circle_joined'
  | 'circle_message_sent'
  | 'safe_space_opened'
  | 'ai_companion_started'
  | 'session_started'
  | 'session_ended';

const EVENT_TO_COLUMN: Record<BehaviourEvent, string | null> = {
  post_created: 'posts_created',
  post_liked: 'posts_liked',
  comment_made: 'comments_made',
  circle_joined: 'circles_active_in',
  circle_message_sent: 'circles_active_in',
  safe_space_opened: 'safe_space_visits',
  ai_companion_started: 'safe_space_visits',
  session_started: 'session_count',
  session_ended: null,
};

export async function trackBehaviourEvent(
  userId: string,
  event: BehaviourEvent
): Promise<void> {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];
  const hour = new Date().getHours();
  const isLateNight = hour >= 23 || hour <= 4;
  const column = EVENT_TO_COLUMN[event];

  // Use the safe upsert helper defined in migration 003
  if (column) {
    await supabase.rpc('upsert_behaviour_snapshot', {
      p_user_id: userId,
      p_date: today,
      p_column: column,
      p_increment: 1,
    });
  }

  if (isLateNight && event === 'session_started') {
    await supabase.rpc('upsert_behaviour_snapshot', {
      p_user_id: userId,
      p_date: today,
      p_column: 'late_night_sessions',
      p_increment: 1,
    });
  }

  if (event === 'safe_space_opened') {
    // Ensure row exists, then set used_safe_space = true
    await supabase
      .from('behaviour_snapshots')
      .upsert({ user_id: userId, snapshot_date: today }, { onConflict: 'user_id,snapshot_date', ignoreDuplicates: true });
    await supabase
      .from('behaviour_snapshots')
      .update({ used_safe_space: true })
      .eq('user_id', userId)
      .eq('snapshot_date', today);
  }
}
