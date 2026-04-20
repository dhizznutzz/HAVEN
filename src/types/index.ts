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
  image_url: string | null;
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
