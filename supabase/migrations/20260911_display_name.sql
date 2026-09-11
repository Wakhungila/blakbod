-- Apply once to an existing Supabase project.

alter table public.profiles
  add column if not exists display_name text;