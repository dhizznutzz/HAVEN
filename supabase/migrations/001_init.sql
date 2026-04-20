-- Enable vector extension for AI embeddings
create extension if not exists vector;

-- Users profile (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users primary key,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  school text,
  school_cohort text,
  location text,
  level integer default 1,
  points integer default 0,
  skills text[] default '{}',
  interests text[] default '{}',
  role text default 'youth', -- 'youth' | 'counselor' | 'mentor' | 'org'
  is_anonymous_mode boolean default false,
  embedding vector(384), -- for Circle matching
  wellbeing_score integer default 100, -- 0-100, AI-tracked
  created_at timestamptz default now()
);

-- Posts (feed)
create table posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id),
  content text not null,
  pillar text not null, -- 'grow' | 'connect' | 'circle' | 'safe_space'
  tags text[] default '{}',
  is_anonymous boolean default false,
  sentiment_score float,
  risk_level text default 'none', -- 'none' | 'low' | 'medium' | 'high'
  likes integer default 0,
  created_at timestamptz default now()
);

-- Opportunities (Connect pillar)
create table opportunities (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references profiles(id),
  title text not null,
  description text,
  type text, -- 'volunteer' | 'internship' | 'program' | 'event'
  location text,
  lat float,
  lng float,
  skills_required text[] default '{}',
  deadline timestamptz,
  slots integer,
  created_at timestamptz default now()
);

-- Circles (groups)
create table circles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  interest_tags text[] default '{}',
  member_count integer default 0,
  max_members integer default 20,
  is_private boolean default false,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Circle memberships
create table circle_members (
  circle_id uuid references circles(id),
  user_id uuid references profiles(id),
  joined_at timestamptz default now(),
  primary key (circle_id, user_id)
);

-- Safe Space sessions
create table safe_space_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  mode text, -- 'ai_companion' | 'peer_listener' | 'counselor'
  is_anonymous boolean default true,
  risk_level text default 'none',
  messages jsonb default '[]',
  created_at timestamptz default now()
);

-- Badges / achievements
create table badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  badge_type text,
  earned_at timestamptz default now()
);

-- Wellbeing events (anonymized, for counselor dashboard)
create table wellbeing_events (
  id uuid primary key default gen_random_uuid(),
  school text,
  cohort text,
  risk_category text,
  risk_level text,
  week_start date,
  created_at timestamptz default now(),
  unique(school, cohort, risk_category, week_start)
);

-- Enable RLS
alter table profiles enable row level security;
alter table posts enable row level security;
alter table safe_space_sessions enable row level security;
alter table circles enable row level security;
alter table circle_members enable row level security;
alter table badges enable row level security;

-- RLS Policies
create policy "Users can view all profiles" on profiles for select using (true);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

create policy "Users can read all posts" on posts for select using (true);
create policy "Users can create posts" on posts for insert with check (auth.uid() = author_id);
create policy "Users can update own posts" on posts for update using (auth.uid() = author_id);

create policy "Safe space sessions are private" on safe_space_sessions for all using (auth.uid() = user_id);

create policy "Anyone can view circles" on circles for select using (true);
create policy "Authenticated users can create circles" on circles for insert with check (auth.uid() = created_by);

create policy "Anyone can view memberships" on circle_members for select using (true);
create policy "Users can manage own memberships" on circle_members for insert with check (auth.uid() = user_id);

create policy "Users can view own badges" on badges for select using (auth.uid() = user_id);

-- Function to increment points safely
create or replace function increment_points(user_id uuid, amount integer)
returns void language plpgsql security definer as $$
begin
  update profiles
  set
    points = points + amount,
    level = greatest(1, floor((points + amount) / 200)::integer + 1)
  where id = user_id;
end;
$$;

-- Vector similarity search function for Circle/peer matching
create or replace function match_users(
  query_embedding vector(384),
  match_threshold float,
  match_count int,
  exclude_id uuid
)
returns table (id uuid, display_name text, similarity float)
language sql stable
as $$
  select
    id,
    display_name,
    1 - (embedding <=> query_embedding) as similarity
  from profiles
  where
    id != exclude_id
    and embedding is not null
    and 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
