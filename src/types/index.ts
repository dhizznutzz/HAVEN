export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  school: string | null;
  location: string | null;
  level: number;
  points: number;
  skills: string[];
  interests: string[];
  role: 'youth' | 'counselor' | 'mentor' | 'org';
  is_anonymous_mode: boolean;
  wellbeing_score: number;
  created_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  content: string;
  pillar: 'grow' | 'connect' | 'circle' | 'safe_space';
  tags: string[];
  is_anonymous: boolean;
  sentiment_score: number | null;
  risk_level: 'none' | 'low' | 'medium' | 'high';
  image_url?: string | null;
  likes: number;
  created_at: string;
  profiles?: Profile;
}

export interface Opportunity {
  id: string;
  org_id: string;
  title: string;
  description: string | null;
  type: 'volunteer' | 'internship' | 'program' | 'event';
  location: string | null;
  lat: number | null;
  lng: number | null;
  skills_required: string[];
  deadline: string | null;
  slots: number | null;
  created_at: string;
  profiles?: Profile;
  match_score?: number;
}

export interface Circle {
  id: string;
  name: string;
  description: string | null;
  interest_tags: string[];
  member_count: number;
  max_members: number;
  is_private: boolean;
  created_by: string;
  created_at: string;
}

export interface SafeSpaceSession {
  id: string;
  user_id: string;
  mode: 'ai_companion' | 'peer_listener' | 'counselor';
  is_anonymous: boolean;
  risk_level: 'none' | 'low' | 'medium' | 'high';
  messages: ChatMessage[];
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface Badge {
  id: string;
  user_id: string;
  badge_type: string;
  earned_at: string;
}

export interface WellbeingEvent {
  id: string;
  school: string;
  cohort: string;
  risk_category: string;
  risk_level: 'minimal' | 'low' | 'medium' | 'high';
  week_start: string;
  created_at: string;
}

export type Pillar = 'grow' | 'connect' | 'circle' | 'safe_space';

// ─── Guardian module types ────────────────────────────────────────────────────

export interface WhatsAppIntegration {
  id: string;
  user_id: string;
  phone_number: string;
  is_active: boolean;
  checkin_frequency: 'daily' | 'every_2_days' | 'weekly';
  checkin_time: string;
  last_checkin_sent_at: string | null;
  last_reply_at: string | null;
  consent_given_at: string;
  created_at: string;
}

export interface WhatsAppCheckin {
  id: string;
  user_id: string;
  message_sent: string;
  user_reply: string | null;
  reply_sentiment_score: number | null;
  reply_risk_level: 'none' | 'low' | 'medium' | 'high';
  sent_at: string;
  replied_at: string | null;
  is_read: boolean;
}

export interface InstagramIntegration {
  id: string;
  user_id: string;
  instagram_user_id: string;
  instagram_username: string;
  is_active: boolean;
  last_synced_at: string | null;
  consent_given_at: string;
  created_at: string;
}

export interface InstagramPostAnalysis {
  id: string;
  user_id: string;
  instagram_post_id: string;
  caption: string;
  posted_at: string;
  sentiment_score: number;
  risk_level: 'none' | 'low' | 'medium' | 'high';
  emotion_labels: Record<string, number>;
  synced_at: string;
}

export interface BehaviourSnapshot {
  id: string;
  user_id: string;
  snapshot_date: string;
  posts_created: number;
  posts_liked: number;
  comments_made: number;
  circles_active_in: number;
  safe_space_visits: number;
  session_count: number;
  late_night_sessions: number;
  avg_session_start_hour: number | null;
  total_session_minutes: number;
  avg_post_sentiment: number | null;
  negative_post_count: number;
  used_safe_space: boolean;
  daily_wellbeing_score: number | null;
  created_at: string;
}

export interface WellbeingScore {
  id: string;
  user_id: string;
  score: number;
  score_7day_avg: number | null;
  score_trend: 'improving' | 'stable' | 'declining' | 'critical';
  haven_score: number | null;
  whatsapp_score: number | null;
  instagram_score: number | null;
  last_nudge_sent_at: string | null;
  last_crisis_alert_at: string | null;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  action_url: string | null;
  priority: 'normal' | 'high';
  is_read: boolean;
  created_at: string;
}
