-- 0005: Workout-Blöcke - Bibliothek-Einträge vom Typ 'Workout' besitzen eine
-- geordnete Liste von Blöcken (analog training_blocks, aber Parent = library_entries).
--
-- Motivation: Beim "In Bibliothek speichern" einer Einheit gingen bisher die
-- einzelnen Blöcke verloren (nur ein flacher library_entries-Datensatz mit
-- aufsummierter duration_minutes). Diese Tabelle bewahrt die Einzelteile.
--
-- Nicht-destruktiv/additiv. created_at/updated_at via Default + Trigger
-- (set_updated_at existiert bereits aus 0001_init.sql).
--
-- Hinweis zu category_id: seit Migration 0004 zeigt category_id von
-- training_blocks/library_entries direkt auf focus_areas (Schwerpunkte). Diese
-- Tabelle folgt demselben Stand (FK auf focus_areas, on delete restrict).

begin;

create table public.library_workout_blocks (
  id               text primary key,
  library_entry_id text not null references public.library_entries(id) on delete cascade,
  sort_order       integer not null,
  title            text not null,
  category_id      text not null references public.focus_areas(id) on delete restrict,
  duration_minutes integer not null check (duration_minutes >= 0),
  icon_emoji       text,
  note             text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_workout_blocks_entry on public.library_workout_blocks(library_entry_id, sort_order);
create index idx_workout_blocks_category on public.library_workout_blocks(category_id);

-- updated_at-Trigger (gleicher Mechanismus wie die übrigen Tabellen aus 0001_init.sql).
create trigger trg_workout_blocks_updated_at
  before update on public.library_workout_blocks
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Constraint: Ein Workout muss >= 2 Blöcke besitzen.
-- Eine reine CHECK-Constraint kann die Anzahl von Kindzeilen nicht ausdrücken,
-- daher ein CONSTRAINT-Trigger (DEFERRABLE INITIALLY DEFERRED), der erst am
-- Transaktionsende prüft - so dürfen Blöcke innerhalb einer Transaktion einzeln
-- eingefügt/gelöscht werden, ohne zwischenzeitlich zu verletzen.
-- Geprüft wird nur für Einträge, die NOCH existieren und type='Workout' haben
-- (ein per CASCADE gelöschter Eintrag soll die Prüfung nicht auslösen).
-- Primäre Durchsetzung erfolgt clientseitig in der UI; dieser Trigger ist das
-- DB-seitige Sicherheitsnetz.
-- ACHTUNG: Da PostgREST je Insert eine eigene Transaktion fährt, MÜSSEN alle
-- Blöcke eines Workouts in EINEM Request geschrieben werden (Bulk-insert eines
-- Arrays via supabase .insert([...])); siehe setWorkoutBlocks in repos.ts.
-- ---------------------------------------------------------------------------
create or replace function public.check_workout_min_blocks() returns trigger as $$
declare
  v_entry_id text;
  v_type     text;
  v_count    integer;
begin
  v_entry_id := coalesce(new.library_entry_id, old.library_entry_id);

  select type into v_type from public.library_entries where id = v_entry_id;
  if not found then
    return null; -- Eintrag (per CASCADE) entfernt -> keine Prüfung
  end if;
  if v_type <> 'Workout' then
    return null;
  end if;

  select count(*) into v_count
    from public.library_workout_blocks
   where library_entry_id = v_entry_id;

  if v_count < 2 then
    raise exception 'Ein Workout muss mindestens 2 Blöcke besitzen (Eintrag %, aktuell % Block/Blöcke).', v_entry_id, v_count;
  end if;

  return null;
end;
$$ language plpgsql;

create constraint trigger trg_workout_min_blocks
  after insert or update or delete on public.library_workout_blocks
  deferrable initially deferred
  for each row execute function public.check_workout_min_blocks();

commit;
