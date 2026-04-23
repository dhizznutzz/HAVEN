-- ─────────────────────────────────────────────────────────────
-- GUARDIAN MODULE — Behaviour Analysis & Social Media Integration
-- ─────────────────────────────────────────────────────────────

-- WhatsApp integrations (one per user)
create table whatsapp_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  phone_number text not null,
  is_active boolean default true,
  checkin_frequency text default 'daily', -- 'daily' | 'every_2_days' | 'weekly'
  checkin_time time default '09:00:00',
  last_checkin_sent_at timestamptz,
  last_reply_at timestamptz,
  consent_given_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(user_id)
);

-- Per-checkin log (one row per message sent)
create table whatsapp_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  message_sent text not null,
  user_reply text,
  reply_sentiment_score float,
  reply_risk_level text default 'none', -- 'none' | 'low' | 'medium' | 'high'
  sent_at timestamptz default now(),
  replied_at timestamptz,
  is_read boolean default false
);

-- Instagram integrations (one per user)
create table instagram_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  instagram_user_id text,
  instagram_username text,
  access_token text,
  token_expires_at timestamptz,
  is_active boolean default true,
  last_synced_at timestamptz,
  consent_given_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(user_id)
);

-- Analysed Instagram post captions (no images, no private data)
create table instagram_post_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  instagram_post_id text,
  caption text,
  posted_at timestamptz,
  sentiment_score float,
  risk_level text default 'none',
  emotion_labels jsonb,
  synced_at timestamptz default now()
);

-- One row per user per day — aggregated daily snapshot
create table behaviour_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  snapshot_date date not null,
  posts_created integer default 0,
  posts_liked integer default 0,
  comments_made integer default 0,
  circles_active_in integer default 0,
  safe_space_visits integer default 0,
  session_count integer default 0,
  late_night_sessions integer default 0,
  avg_session_start_hour float,
  total_session_minutes integer default 0,
  avg_post_sentiment float,
  negative_post_count integer default 0,
  used_safe_space boolean default false,
  daily_wellbeing_score integer,
  created_at timestamptz default now(),
  unique(user_id, snapshot_date)
);

-- Master wellbeing score per user (one row per user, upserted daily)
create table wellbeing_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  score integer default 100,
  score_7day_avg float,
  score_trend text default 'stable', -- 'improving' | 'stable' | 'declining' | 'critical'
  haven_score integer,
  whatsapp_score integer,
  instagram_score integer,
  last_nudge_sent_at timestamptz,
  last_crisis_alert_at timestamptz,
  updated_at timestamptz default now(),
  unique(user_id)
);

-- Audit trail of automated interventions
create table wellbeing_interventions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  intervention_type text, -- 'gentle_nudge' | 'safe_space_prompt' | 'counselor_alert'
  trigger_score integer,
  trigger_source text,    -- 'haven' | 'whatsapp' | 'instagram' | 'combined'
  sent_at timestamptz default now()
);

-- In-app notifications table (used by interventions)
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  action_url text,
  priority text default 'normal', -- 'normal' | 'high'
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────
-- RLS POLICIES
-- ─────────────────────────────────────────────────────────────

alter table whatsapp_integrations enable row level security;
alter table whatsapp_checkins enable row level security;
alter table instagram_integrations enable row level security;
alter table instagram_post_analyses enable row level security;
alter table behaviour_snapshots enable row level security;
alter table wellbeing_scores enable row level security;
alter table wellbeing_interventions enable row level security;
alter table notifications enable row level security;

create policy "Users manage own WA integration" on whatsapp_integrations for all using (auth.uid() = user_id);
create policy "Users manage own checkins" on whatsapp_checkins for all using (auth.uid() = user_id);
create policy "Users manage own IG integration" on instagram_integrations for all using (auth.uid() = user_id);
create policy "Users see own IG analyses" on instagram_post_analyses for select using (auth.uid() = user_id);
create policy "Users see own behaviour snapshots" on behaviour_snapshots for select using (auth.uid() = user_id);
create policy "Users see own wellbeing score" on wellbeing_scores for select using (auth.uid() = user_id);
create policy "Users see own interventions" on wellbeing_interventions for select using (auth.uid() = user_id);
create policy "Users see own notifications" on notifications for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- DATA RETENTION — auto-delete old records weekly
-- ─────────────────────────────────────────────────────────────

-- Behaviour snapshots: 90 days
create or replace function delete_old_behaviour_snapshots()
returns void language sql security definer as $$
  delete from behaviour_snapshots where snapshot_date < current_date - interval '90 days';
$$;

-- WhatsApp checkins: 30 days
create or replace function delete_old_whatsapp_checkins()
returns void language sql security definer as $$
  delete from whatsapp_checkins where sent_at < now() - interval '30 days';
$$;

-- Instagram analyses: 60 days
create or replace function delete_old_instagram_analyses()
returns void language sql security definer as $$
  delete from instagram_post_analyses where synced_at < now() - interval '60 days';
$$;

-- ─────────────────────────────────────────────────────────────
-- HELPER: safe integer increment for behaviour snapshots
-- ─────────────────────────────────────────────────────────────

create or replace function upsert_behaviour_snapshot(
  p_user_id uuid,
  p_date date,
  p_column text,
  p_increment integer default 1
)
returns void language plpgsql security definer as $$
begin
  insert into behaviour_snapshots (user_id, snapshot_date)
  values (p_user_id, p_date)
  on conflict (user_id, snapshot_date) do nothing;

  execute format(
    'update behaviour_snapshots set %I = coalesce(%I, 0) + $1 where user_id = $2 and snapshot_date = $3',
    p_column, p_column
  ) using p_increment, p_user_id, p_date;
end;
$$;
