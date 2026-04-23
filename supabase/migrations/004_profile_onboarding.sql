alter table profiles add column if not exists age_group text; -- 'u18' | '18-21' | '22-25' | '26-30'
alter table profiles add column if not exists goal text;       -- 'skills' | 'community' | 'wellness' | 'jobs' | 'explore'
