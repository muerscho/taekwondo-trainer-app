export const SCHEMA_VERSION = 1;

export const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_meta (
  id TEXT PRIMARY KEY CHECK(id='default'),
  schema_version INTEGER NOT NULL,
  applied_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  level TEXT NOT NULL CHECK(level IN ('Einsteiger','Fortgeschritten','Erwachsene')),
  min_age INTEGER NOT NULL DEFAULT 0,
  max_age INTEGER NOT NULL DEFAULT 99,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS belt_ranks (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  color_name TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  color_border_hex TEXT NOT NULL,
  text_color_hex TEXT,
  sort_order INTEGER NOT NULL,
  is_dan INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_belt_sort ON belt_ranks(sort_order);

CREATE TABLE IF NOT EXISTS belt_rank_contents (
  id TEXT PRIMARY KEY,
  belt_rank_id TEXT NOT NULL REFERENCES belt_ranks(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK(kind IN ('poomsae','technik','theorie')),
  text TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS focus_areas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color_hex TEXT NOT NULL,
  weight_percent INTEGER NOT NULL DEFAULT 0 CHECK(weight_percent BETWEEN 0 AND 100),
  sort_order INTEGER NOT NULL,
  is_main INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS block_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  focus_area_id TEXT REFERENCES focus_areas(id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS athletes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE RESTRICT,
  belt_rank_id TEXT NOT NULL REFERENCES belt_ranks(id) ON DELETE RESTRICT,
  trainer_note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_athletes_group ON athletes(group_id);
CREATE INDEX IF NOT EXISTS idx_athletes_belt ON athletes(belt_rank_id);

CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  athlete_id TEXT NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  achieved INTEGER NOT NULL DEFAULT 0,
  achieved_at TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_goals_athlete ON goals(athlete_id, achieved);

CREATE TABLE IF NOT EXISTS graduation_history (
  id TEXT PRIMARY KEY,
  athlete_id TEXT NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  from_belt_rank_id TEXT NOT NULL REFERENCES belt_ranks(id) ON DELETE RESTRICT,
  to_belt_rank_id TEXT NOT NULL REFERENCES belt_ranks(id) ON DELETE RESTRICT,
  evaluation TEXT NOT NULL CHECK(evaluation IN ('Bestanden','Gut','Sehr gut','Nicht bestanden')),
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_graduation_athlete ON graduation_history(athlete_id, date DESC);

CREATE TABLE IF NOT EXISTS library_entries (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('Übung','Workout','Spiel')),
  title TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES block_categories(id) ON DELETE RESTRICT,
  niveau TEXT NOT NULL CHECK(niveau IN ('Anfänger','Mittelstufe','Fortgeschritten')),
  description TEXT,
  youtube_video_id TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL CHECK(source IN ('manual','from_planning')) DEFAULT 'manual',
  created_from_unit_id TEXT REFERENCES training_units(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_lib_category ON library_entries(category_id, niveau);
CREATE INDEX IF NOT EXISTS idx_lib_source ON library_entries(source);

CREATE TABLE IF NOT EXISTS library_steps (
  id TEXT PRIMARY KEY,
  library_entry_id TEXT NOT NULL REFERENCES library_entries(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  text TEXT NOT NULL,
  UNIQUE(library_entry_id, step_number)
);

CREATE TABLE IF NOT EXISTS library_materials (
  id TEXT PRIMARY KEY,
  library_entry_id TEXT NOT NULL REFERENCES library_entries(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS library_media (
  id TEXT PRIMARY KEY,
  library_entry_id TEXT NOT NULL REFERENCES library_entries(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK(kind IN ('image','emoji')),
  uri TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS library_tags (
  library_entry_id TEXT NOT NULL REFERENCES library_entries(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY(library_entry_id, tag_id)
);

CREATE TABLE IF NOT EXISTS library_timer_configs (
  library_entry_id TEXT PRIMARY KEY REFERENCES library_entries(id) ON DELETE CASCADE,
  active INTEGER NOT NULL DEFAULT 0,
  repetitions INTEGER NOT NULL DEFAULT 1 CHECK(repetitions BETWEEN 1 AND 10)
);

CREATE TABLE IF NOT EXISTS library_timer_phases (
  id TEXT PRIMARY KEY,
  library_entry_id TEXT NOT NULL REFERENCES library_entries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL CHECK(duration_seconds BETWEEN 5 AND 600),
  color_hex TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS training_units (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  weekday TEXT NOT NULL CHECK(weekday IN ('Mo','Di','Mi','Do','Fr','Sa','So')),
  iso_year INTEGER NOT NULL,
  iso_week INTEGER NOT NULL,
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE RESTRICT,
  duration_minutes INTEGER NOT NULL CHECK(duration_minutes IN (45,60,90,120)),
  status TEXT NOT NULL CHECK(status IN ('geplant','durchgeführt','ausgefallen')) DEFAULT 'geplant',
  title TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_units_week ON training_units(iso_year, iso_week);
CREATE INDEX IF NOT EXISTS idx_units_date ON training_units(date);
CREATE INDEX IF NOT EXISTS idx_units_group_date ON training_units(group_id, date);

CREATE TABLE IF NOT EXISTS training_blocks (
  id TEXT PRIMARY KEY,
  training_unit_id TEXT NOT NULL REFERENCES training_units(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES block_categories(id) ON DELETE RESTRICT,
  duration_minutes INTEGER NOT NULL CHECK(duration_minutes >= 0),
  icon_emoji TEXT,
  note TEXT,
  source TEXT NOT NULL CHECK(source IN ('library','custom')),
  source_library_entry_id TEXT REFERENCES library_entries(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_blocks_unit ON training_blocks(training_unit_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_blocks_category ON training_blocks(category_id);

CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY,
  training_unit_id TEXT NOT NULL REFERENCES training_units(id) ON DELETE CASCADE,
  athlete_id TEXT NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  present INTEGER,
  recorded_at TEXT,
  UNIQUE(training_unit_id, athlete_id)
);
CREATE INDEX IF NOT EXISTS idx_att_unit ON attendance_records(training_unit_id);
CREATE INDEX IF NOT EXISTS idx_att_athlete ON attendance_records(athlete_id);

CREATE TABLE IF NOT EXISTS trainers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  color_hex TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS training_unit_trainers (
  training_unit_id TEXT NOT NULL REFERENCES training_units(id) ON DELETE CASCADE,
  trainer_id TEXT NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  assigned_at TEXT NOT NULL,
  PRIMARY KEY(training_unit_id, trainer_id)
);
CREATE INDEX IF NOT EXISTS idx_unit_trainers_trainer ON training_unit_trainers(trainer_id);

CREATE TABLE IF NOT EXISTS exams_tournaments (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('Pruefung','Wettkampf')),
  label TEXT NOT NULL,
  date TEXT NOT NULL,
  location TEXT,
  description TEXT,
  examiner_name TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_termin_date ON exams_tournaments(date, type);

CREATE TABLE IF NOT EXISTS termin_phases (
  id TEXT PRIMARY KEY,
  termin_id TEXT NOT NULL REFERENCES exams_tournaments(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  name TEXT NOT NULL,
  duration_weeks INTEGER NOT NULL CHECK(duration_weeks IN (1,2,3,4,6,8)),
  focus_topic TEXT
);

CREATE TABLE IF NOT EXISTS termin_criteria (
  id TEXT PRIMARY KEY,
  termin_id TEXT NOT NULL REFERENCES exams_tournaments(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  text TEXT NOT NULL,
  fulfilled INTEGER NOT NULL DEFAULT 0,
  fulfilled_at TEXT
);

CREATE TABLE IF NOT EXISTS termin_athlete_assignments (
  termin_id TEXT NOT NULL REFERENCES exams_tournaments(id) ON DELETE CASCADE,
  athlete_id TEXT NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  assigned_at TEXT NOT NULL,
  PRIMARY KEY(termin_id, athlete_id)
);

CREATE TABLE IF NOT EXISTS termin_target_belts (
  termin_id TEXT NOT NULL REFERENCES exams_tournaments(id) ON DELETE CASCADE,
  belt_rank_id TEXT NOT NULL REFERENCES belt_ranks(id) ON DELETE RESTRICT,
  PRIMARY KEY(termin_id, belt_rank_id)
);

CREATE TABLE IF NOT EXISTS ai_config (
  id TEXT PRIMARY KEY CHECK(id='default'),
  provider TEXT NOT NULL CHECK(provider IN ('Claude','OpenAI','Custom')) DEFAULT 'Claude',
  model TEXT NOT NULL DEFAULT 'claude-sonnet-4-6',
  api_key_cipher TEXT,
  api_key_iv TEXT,
  custom_endpoint_url TEXT,
  last_connection_test_at TEXT,
  last_connection_test_status TEXT CHECK(last_connection_test_status IN ('success','error') OR last_connection_test_status IS NULL),
  last_connection_test_error TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_function_toggles (
  function_id TEXT PRIMARY KEY CHECK(function_id IN ('einheit','phasenplan','dashboard','progress','variation','bibliothek')),
  enabled INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS ai_recommendations (
  id TEXT PRIMARY KEY,
  context TEXT NOT NULL CHECK(context IN ('dashboard','termin','einheit','progress','variation','bibliothek')),
  context_ref_id TEXT,
  generated_at TEXT NOT NULL,
  valid_until TEXT,
  headline TEXT NOT NULL,
  body TEXT NOT NULL,
  action_label TEXT,
  action_target TEXT,
  status TEXT NOT NULL CHECK(status IN ('pending','accepted','dismissed')) DEFAULT 'pending'
);
CREATE INDEX IF NOT EXISTS idx_ai_recs_context ON ai_recommendations(context, status, generated_at DESC);

CREATE TABLE IF NOT EXISTS alert_thresholds (
  kind TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS app_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;
