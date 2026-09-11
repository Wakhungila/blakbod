-- Apply once to an existing Supabase project.

alter table public.profiles
  add constraint valid_primary_position check (
    position_primary is null or position_primary in (
      'Prop', 'Hooker', 'Lock', 'Flanker', '8th Man',
      'Scrumhalf', 'Flyhalf', 'Centre', 'Wing', 'Fullback'
    )
  );

alter table public.profiles
  add constraint valid_secondary_position check (
    position_secondary is null or position_secondary in (
      'Prop', 'Hooker', 'Lock', 'Flanker', '8th Man',
      'Scrumhalf', 'Flyhalf', 'Centre', 'Wing', 'Fullback'
    )
  );

alter table public.profiles
  add constraint complete_onboarded_profile check (
    not onboarded or (
      length(trim(coalesce(first_name, ''))) > 0
      and length(trim(coalesce(last_name, ''))) > 0
      and position_primary is not null
      and avatar_url is not null
    )
  );
