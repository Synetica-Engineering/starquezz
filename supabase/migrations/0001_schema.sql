-- StarqueZZ v2 · 0001_schema.sql
-- Tables, enums, indexes. The star ledger is the source of truth;
-- children.star_balance is a cached aggregate updated only inside RPCs.

create extension if not exists pgcrypto;

-- ---------- enums ----------
create type time_block as enum ('morning', 'afternoon', 'evening');
create type habit_category as enum ('body', 'mind', 'space', 'heart');
create type habit_status as enum ('active', 'graduated');
create type star_reason as enum (
  'habit_checkoff', 'bonus_habit', 'streak_3', 'perfect_week',
  'redemption', 'graduation_bonus', 'undo', 'manual_adjust'
);
create type adventure_status as enum ('planned', 'done', 'skipped');
create type dream_status as enum ('active', 'achieved', 'retired');
create type energy_type as enum ('indoor', 'outdoor', 'either');
create type cost_type as enum ('free', 'cheap', 'spendy');

-- ---------- families ----------
create table parents (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  parent_pin_hash text,
  ceremony_reminder boolean not null default false,
  created_at timestamptz not null default now()
);

create table children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references parents (id) on delete cascade,
  name text not null,
  avatar text not null default 'star-1',
  secret_code_hash text, -- optional toggle, default off
  star_balance int not null default 0,
  birth_year int,
  interests text[] not null default '{}',
  focus_notes text not null default '',
  created_at timestamptz not null default now()
);
create index children_parent_idx on children (parent_id);

-- ---------- global read-only libraries (curated by us; no parent_id) ----------
create table habit_library (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null,
  kid_label text not null,
  category habit_category not null,
  age_min int not null,
  age_max int not null,
  why_it_matters text not null,
  sources_note text not null default '', -- internal, never rendered
  suggested_block time_block not null,
  mastery_signal text not null
);

create table library_activities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  illustration text not null,
  explainer text not null, -- 2-3 sentences max: confidence, not a manual
  prep text not null default '',
  duration_min int not null,
  energy energy_type not null,
  age_min int not null,
  age_max int not null,
  cost cost_type not null,
  location_type text not null, -- generic only; never a venue database
  suggested_tier int not null check (suggested_tier between 0 and 3)
);

-- ---------- habits ----------
create table habits (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children (id) on delete cascade,
  library_id uuid references habit_library (id),
  name text not null,
  icon text not null default 'check',
  category habit_category not null default 'body',
  time_block time_block not null default 'morning',
  is_core boolean not null default true,
  active_days int[] not null default '{1,2,3,4,5,6,7}', -- ISO dow, 1=Mon
  sort_order int not null default 0,
  status habit_status not null default 'active',
  graduated_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);
create index habits_child_idx on habits (child_id);

create table completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits (id) on delete cascade,
  child_id uuid not null references children (id) on delete cascade,
  completed_on date not null,
  created_at timestamptz not null default now(),
  unique (habit_id, completed_on)
);
create index completions_child_date_idx on completions (child_id, completed_on);

-- ---------- star ledger (append-only) ----------
create table star_events (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children (id) on delete cascade,
  delta int not null,
  reason star_reason not null,
  ref_id uuid,
  note text,
  created_at timestamptz not null default now()
);
create index star_events_child_idx on star_events (child_id, created_at);

-- ---------- adventures ----------
create table adventures (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references parents (id) on delete cascade,
  library_id uuid references library_activities (id),
  name text not null,
  illustration text not null default 'tent',
  cost int not null check (cost >= 0),
  tier int not null check (tier between 0 and 3), -- 0 = the always-available fallback
  venue_note text not null default '',
  archived_at timestamptz,
  created_at timestamptz not null default now()
);
create index adventures_parent_idx on adventures (parent_id);

create table planned_adventures (
  id uuid primary key default gen_random_uuid(),
  adventure_id uuid not null references adventures (id) on delete cascade,
  child_id uuid not null references children (id) on delete cascade,
  planned_for date not null,
  status adventure_status not null default 'planned',
  created_at timestamptz not null default now()
);
create index planned_adv_child_idx on planned_adventures (child_id, status);

-- ---------- Big Dream (max ONE active per child) ----------
create table dreams (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children (id) on delete cascade,
  name text not null,
  illustration text not null default 'tent',
  pledge_text text not null,
  stars_required int not null check (stars_required between 1 and 52),
  stars_earned int not null default 0,
  anchor_date date,
  status dream_status not null default 'active',
  created_at timestamptz not null default now()
);
create unique index one_active_dream_per_child on dreams (child_id) where status = 'active';

-- ---------- ceremony bookkeeping (idempotent finalize_week) ----------
create table week_finalizations (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children (id) on delete cascade,
  week_start date not null, -- Monday
  perfect boolean not null,
  star_days int not null,
  created_at timestamptz not null default now(),
  unique (child_id, week_start)
);

-- ---------- tamper-evidence: every parent-side edit is visible ----------
create table parent_edits (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references parents (id) on delete cascade,
  summary text not null,
  created_at timestamptz not null default now()
);
create index parent_edits_parent_idx on parent_edits (parent_id, created_at);

-- ---------- PIN attempt cooldown (exponential, never permanent) ----------
create table pin_attempts (
  parent_id uuid primary key references parents (id) on delete cascade,
  failed_count int not null default 0,
  last_failed_at timestamptz
);

-- ---------- Scout rate limiting ----------
create table scout_sessions (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references parents (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index scout_sessions_parent_idx on scout_sessions (parent_id, created_at);

-- auto-create the parents row on signup
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.parents (id, email) values (new.id, coalesce(new.email, ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
