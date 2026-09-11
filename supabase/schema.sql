-- BLAKBOD schema
-- Run this in the Supabase SQL Editor (Project > SQL Editor > New query)

-- ─────────────────────────────────────────────
-- 0. STORAGE — profile picture bucket
-- ─────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly accessible"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update their own avatar"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete their own avatar"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ─────────────────────────────────────────────
-- 1. PROFILES
-- One row per player, linked 1:1 to auth.users
-- ─────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  position_primary text,
  position_secondary text,
  instagram text,
  twitter_x text,
  tiktok text,
  avatar_url text,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  constraint valid_primary_position check (
    position_primary is null or position_primary in (
      'Prop', 'Hooker', 'Lock', 'Flanker', '8th Man',
      'Scrumhalf', 'Flyhalf', 'Centre', 'Wing', 'Fullback'
    )
  ),
  constraint valid_secondary_position check (
    position_secondary is null or position_secondary in (
      'Prop', 'Hooker', 'Lock', 'Flanker', '8th Man',
      'Scrumhalf', 'Flyhalf', 'Centre', 'Wing', 'Fullback'
    )
  ),
  constraint complete_onboarded_profile check (
    not onboarded or (
      length(trim(coalesce(first_name, ''))) > 0
      and length(trim(coalesce(last_name, ''))) > 0
      and position_primary is not null
      and avatar_url is not null
    )
  )
);

alter table public.profiles enable row level security;

-- Anyone signed in can read every profile (it's a team directory)
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

-- A player can only insert/update their own row
create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- ─────────────────────────────────────────────
-- 2. FOLLOWS
-- Tracks "I have followed teammate X on platform Y"
-- This is self-reported (no API), used for team completion stats
-- ─────────────────────────────────────────────
create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  followed_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null check (platform in ('instagram', 'twitter_x', 'tiktok')),
  followed_at timestamptz not null default now(),
  primary key (follower_id, followed_id, platform),
  constraint no_self_follow check (follower_id <> followed_id)
);

alter table public.follows enable row level security;

-- Anyone signed in can read follow records (needed for team completion %)
create policy "Follows are viewable by authenticated users"
  on public.follows for select
  to authenticated
  using (true);

-- A player can only create/delete their own follow records
create policy "Users can insert their own follow records"
  on public.follows for insert
  to authenticated
  with check (auth.uid() = follower_id);

create policy "Users can delete their own follow records"
  on public.follows for delete
  to authenticated
  using (auth.uid() = follower_id);

-- ─────────────────────────────────────────────
-- 3. Auto-create a blank profile row when a user signs up
-- ─────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────
-- 4. Helpful view: per-player follow completion count
-- (how many teammates they've marked as followed, per platform)
-- ─────────────────────────────────────────────
create or replace view public.follow_stats as
select
  p.id as player_id,
  p.first_name,
  p.last_name,
  (select count(*) from public.profiles where id <> p.id and onboarded) as team_size,
  count(f.*) filter (where f.platform = 'instagram') as instagram_followed,
  count(f.*) filter (where f.platform = 'twitter_x') as twitter_x_followed,
  count(f.*) filter (where f.platform = 'tiktok') as tiktok_followed
from public.profiles p
left join public.follows f on f.follower_id = p.id
group by p.id, p.first_name, p.last_name;
