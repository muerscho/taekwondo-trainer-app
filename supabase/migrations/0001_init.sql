-- Taekwondo-Trainer-App – Postgres-Schema (Migration von sql.js/SQLite)
-- Phase 1 der Supabase-Migration. Siehe specs/supabase-migration-plan.md.
--
-- Hinweise zur Übersetzung aus src/storage/schema.ts:
--   * Alle ID-Spalten bleiben TEXT (Referenzdaten nutzen kurze Slugs wie 'g10'/'kyorugi',
--     übrige Entitäten crypto.randomUUID() – beides passt in TEXT). Bewusst KEIN uuid-Typ.
--   * INTEGER 0/1 -> boolean; ISO-Text-Zeitstempel -> timestamptz; reine Datumsfelder -> date.
--   * created_at/updated_at bekommen Defaults; updated_at wird per Trigger gepflegt.
--   * KI-Tabellen (ai_config, ai_function_toggles, ai_recommendations) und schema_meta
--     wurden bewusst NICHT übernommen.

begin;

-- ---------------------------------------------------------------------------
-- updated_at-Trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Stammdaten / Referenz
-- ---------------------------------------------------------------------------
create table public.groups (
  id          text primary key,
  name        text not null unique,
  level       text not null check (level in ('Einsteiger','Fortgeschritten','Erwachsene')),
  min_age     integer not null default 0,
  max_age     integer not null default 99,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.belt_ranks (
  id               text primary key,
  label            text not null,
  color_name       text not null,
  color_hex        text not null,
  color_border_hex text not null,
  text_color_hex   text,
  sort_order       integer not null,
  is_dan           boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create unique index idx_belt_sort on public.belt_ranks(sort_order);

create table public.belt_rank_contents (
  id           text primary key,
  belt_rank_id text not null references public.belt_ranks(id) on delete cascade,
  kind         text not null check (kind in ('poomsae','technik','theorie')),
  text         text not null,
  sort_order   integer not null default 0
);

create table public.focus_areas (
  id             text primary key,
  name           text not null unique,
  color_hex      text not null,
  weight_percent integer not null default 0 check (weight_percent between 0 and 100),
  sort_order     integer not null,
  is_main        boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table public.block_categories (
  id            text primary key,
  name          text not null unique,
  focus_area_id text references public.focus_areas(id) on delete set null,
  sort_order    integer not null default 0
);

-- ---------------------------------------------------------------------------
-- Athleten
-- ---------------------------------------------------------------------------
create table public.athletes (
  id           text primary key,
  name         text not null,
  birth_date   date not null,
  group_id     text not null references public.groups(id) on delete restrict,
  belt_rank_id text not null references public.belt_ranks(id) on delete restrict,
  trainer_note text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index idx_athletes_group on public.athletes(group_id);
create index idx_athletes_belt on public.athletes(belt_rank_id);

create table public.goals (
  id          text primary key,
  athlete_id  text not null references public.athletes(id) on delete cascade,
  text        text not null,
  achieved    boolean not null default false,
  achieved_at timestamptz,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index idx_goals_athlete on public.goals(athlete_id, achieved);

create table public.graduation_history (
  id                text primary key,
  athlete_id        text not null references public.athletes(id) on delete cascade,
  date              date not null,
  from_belt_rank_id text not null references public.belt_ranks(id) on delete restrict,
  to_belt_rank_id   text not null references public.belt_ranks(id) on delete restrict,
  evaluation        text not null check (evaluation in ('Bestanden','Gut','Sehr gut','Nicht bestanden')),
  created_at        timestamptz not null default now()
);
create index idx_graduation_athlete on public.graduation_history(athlete_id, date desc);

-- ---------------------------------------------------------------------------
-- Planung (training_units vor library_entries wegen FK)
-- ---------------------------------------------------------------------------
create table public.training_units (
  id               text primary key,
  date             date not null,
  weekday          text not null check (weekday in ('Mo','Di','Mi','Do','Fr','Sa','So')),
  iso_year         integer not null,
  iso_week         integer not null,
  group_id         text not null references public.groups(id) on delete restrict,
  duration_minutes integer not null check (duration_minutes in (45,60,90,120)),
  status           text not null default 'geplant' check (status in ('geplant','durchgeführt','ausgefallen')),
  title            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index idx_units_week on public.training_units(iso_year, iso_week);
create index idx_units_date on public.training_units(date);
create index idx_units_group_date on public.training_units(group_id, date);

-- ---------------------------------------------------------------------------
-- Bibliothek
-- ---------------------------------------------------------------------------
create table public.library_entries (
  id                  text primary key,
  type                text not null check (type in ('Übung','Workout','Spiel')),
  title               text not null,
  category_id         text not null references public.block_categories(id) on delete restrict,
  niveau              text not null check (niveau in ('Anfänger','Mittelstufe','Fortgeschritten')),
  description         text,
  youtube_video_id    text,
  duration_minutes    integer not null default 0,
  source              text not null default 'manual' check (source in ('manual','from_planning')),
  created_from_unit_id text references public.training_units(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index idx_lib_category on public.library_entries(category_id, niveau);
create index idx_lib_source on public.library_entries(source);

create table public.library_steps (
  id               text primary key,
  library_entry_id text not null references public.library_entries(id) on delete cascade,
  step_number      integer not null,
  text             text not null,
  unique (library_entry_id, step_number)
);

create table public.library_materials (
  id               text primary key,
  library_entry_id text not null references public.library_entries(id) on delete cascade,
  text             text not null,
  sort_order       integer not null default 0
);

create table public.library_media (
  id               text primary key,
  library_entry_id text not null references public.library_entries(id) on delete cascade,
  kind             text not null check (kind in ('image','emoji')),
  uri              text not null,
  sort_order       integer not null default 0
);

create table public.tags (
  id   text primary key,
  name text not null unique
);

create table public.library_tags (
  library_entry_id text not null references public.library_entries(id) on delete cascade,
  tag_id           text not null references public.tags(id) on delete cascade,
  primary key (library_entry_id, tag_id)
);

create table public.library_timer_configs (
  library_entry_id text primary key references public.library_entries(id) on delete cascade,
  active           boolean not null default false,
  repetitions      integer not null default 1 check (repetitions between 1 and 10)
);

create table public.library_timer_phases (
  id               text primary key,
  library_entry_id text not null references public.library_entries(id) on delete cascade,
  name             text not null,
  duration_seconds integer not null check (duration_seconds between 5 and 600),
  color_hex        text not null,
  sort_order       integer not null
);

-- ---------------------------------------------------------------------------
-- Blöcke (nach training_units + block_categories + library_entries)
-- ---------------------------------------------------------------------------
create table public.training_blocks (
  id                      text primary key,
  training_unit_id        text not null references public.training_units(id) on delete cascade,
  sort_order              integer not null,
  title                   text not null,
  category_id             text not null references public.block_categories(id) on delete restrict,
  duration_minutes        integer not null check (duration_minutes >= 0),
  icon_emoji              text,
  note                    text,
  source                  text not null check (source in ('library','custom')),
  source_library_entry_id text references public.library_entries(id) on delete set null,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
create index idx_blocks_unit on public.training_blocks(training_unit_id, sort_order);
create index idx_blocks_category on public.training_blocks(category_id);

create table public.attendance_records (
  id               text primary key,
  training_unit_id text not null references public.training_units(id) on delete cascade,
  athlete_id       text not null references public.athletes(id) on delete cascade,
  present          boolean,
  recorded_at      timestamptz,
  unique (training_unit_id, athlete_id)
);
create index idx_att_unit on public.attendance_records(training_unit_id);
create index idx_att_athlete on public.attendance_records(athlete_id);

-- ---------------------------------------------------------------------------
-- Trainer (Domänen-Entität: zuweisbare Übungsleiter, NICHT auth.users)
-- ---------------------------------------------------------------------------
create table public.trainers (
  id         text primary key,
  name       text not null,
  role       text,
  color_hex  text,
  active     boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.training_unit_trainers (
  training_unit_id text not null references public.training_units(id) on delete cascade,
  trainer_id       text not null references public.trainers(id) on delete cascade,
  assigned_at      timestamptz not null default now(),
  primary key (training_unit_id, trainer_id)
);
create index idx_unit_trainers_trainer on public.training_unit_trainers(trainer_id);

-- ---------------------------------------------------------------------------
-- Prüfungen / Wettkämpfe
-- ---------------------------------------------------------------------------
create table public.exams_tournaments (
  id            text primary key,
  type          text not null check (type in ('Pruefung','Wettkampf')),
  label         text not null,
  date          date not null,
  location      text,
  description   text,
  examiner_name text,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index idx_termin_date on public.exams_tournaments(date, type);

create table public.termin_phases (
  id            text primary key,
  termin_id     text not null references public.exams_tournaments(id) on delete cascade,
  sort_order    integer not null,
  name          text not null,
  duration_weeks integer not null check (duration_weeks in (1,2,3,4,6,8)),
  focus_topic   text
);

create table public.termin_criteria (
  id           text primary key,
  termin_id    text not null references public.exams_tournaments(id) on delete cascade,
  sort_order   integer not null,
  text         text not null,
  fulfilled    boolean not null default false,
  fulfilled_at timestamptz
);

create table public.termin_athlete_assignments (
  termin_id   text not null references public.exams_tournaments(id) on delete cascade,
  athlete_id  text not null references public.athletes(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (termin_id, athlete_id)
);

create table public.termin_target_belts (
  termin_id    text not null references public.exams_tournaments(id) on delete cascade,
  belt_rank_id text not null references public.belt_ranks(id) on delete restrict,
  primary key (termin_id, belt_rank_id)
);

-- ---------------------------------------------------------------------------
-- App-Status
-- ---------------------------------------------------------------------------
create table public.alert_thresholds (
  kind  text primary key,
  value text not null
);

create table public.app_state (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

create table public.settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at-Trigger anhängen
-- ---------------------------------------------------------------------------
create trigger trg_groups_updated         before update on public.groups            for each row execute function public.set_updated_at();
create trigger trg_belt_ranks_updated      before update on public.belt_ranks         for each row execute function public.set_updated_at();
create trigger trg_focus_areas_updated     before update on public.focus_areas        for each row execute function public.set_updated_at();
create trigger trg_athletes_updated        before update on public.athletes           for each row execute function public.set_updated_at();
create trigger trg_goals_updated           before update on public.goals              for each row execute function public.set_updated_at();
create trigger trg_library_entries_updated before update on public.library_entries    for each row execute function public.set_updated_at();
create trigger trg_training_units_updated  before update on public.training_units     for each row execute function public.set_updated_at();
create trigger trg_training_blocks_updated before update on public.training_blocks    for each row execute function public.set_updated_at();
create trigger trg_trainers_updated        before update on public.trainers           for each row execute function public.set_updated_at();
create trigger trg_exams_updated           before update on public.exams_tournaments  for each row execute function public.set_updated_at();
create trigger trg_app_state_updated       before update on public.app_state          for each row execute function public.set_updated_at();
create trigger trg_settings_updated        before update on public.settings           for each row execute function public.set_updated_at();

commit;
