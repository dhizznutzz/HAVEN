-- Fix user deletion: add ON DELETE CASCADE to all FKs that were missing it.
-- Without these, deleting from auth.users fails due to FK constraint violations.

-- profiles → auth.users
alter table profiles drop constraint profiles_id_fkey;
alter table profiles add constraint profiles_id_fkey
  foreign key (id) references auth.users(id) on delete cascade;

-- posts → profiles
alter table posts drop constraint posts_author_id_fkey;
alter table posts add constraint posts_author_id_fkey
  foreign key (author_id) references profiles(id) on delete cascade;

-- opportunities → profiles
alter table opportunities drop constraint opportunities_org_id_fkey;
alter table opportunities add constraint opportunities_org_id_fkey
  foreign key (org_id) references profiles(id) on delete cascade;

-- circles → profiles
alter table circles drop constraint circles_created_by_fkey;
alter table circles add constraint circles_created_by_fkey
  foreign key (created_by) references profiles(id) on delete cascade;

-- circle_members → profiles
alter table circle_members drop constraint circle_members_user_id_fkey;
alter table circle_members add constraint circle_members_user_id_fkey
  foreign key (user_id) references profiles(id) on delete cascade;

-- safe_space_sessions → profiles
alter table safe_space_sessions drop constraint safe_space_sessions_user_id_fkey;
alter table safe_space_sessions add constraint safe_space_sessions_user_id_fkey
  foreign key (user_id) references profiles(id) on delete cascade;

-- badges → profiles
alter table badges drop constraint badges_user_id_fkey;
alter table badges add constraint badges_user_id_fkey
  foreign key (user_id) references profiles(id) on delete cascade;
