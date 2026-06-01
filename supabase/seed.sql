-- Seed-Daten – portiert aus src/storage/seed.ts + src/design/tokens.ts.
-- Idempotent via "on conflict do nothing". KI-Seeds (ai_config/ai_function_toggles)
-- wurden bewusst entfernt. Gruppen erhalten stabile Slug-IDs (statt Zufalls-UUID).

-- Gurtgrade ---------------------------------------------------------------
-- Verschoben nach supabase/migrations/0003_seed_belt_ranks.sql
-- (Braun-Gurt-System, 10. Kup … 1. Kup + 1.–5. Dan). Dort einzige Quelle.

-- Schwerpunkte ------------------------------------------------------------
insert into public.focus_areas (id,name,color_hex,weight_percent,sort_order,is_main) values
  ('kyorugi',  'Kyorugi',            '#ef4444',25,0,true),
  ('poomsae',  'Poomsae',            '#8b5cf6',20,1,true),
  ('kondition','Kondition',          '#f59e0b',20,2,true),
  ('technik',  'Technik',            '#3b82f6',20,3,true),
  ('theorie',  'Theorie',            '#10b981', 5,4,true),
  ('sv',       'Selbstverteidigung', '#64748b',10,5,true)
on conflict (id) do nothing;

-- Block-Kategorien --------------------------------------------------------
insert into public.block_categories (id,name,focus_area_id,sort_order) values
  ('aufwaermen','Aufwärmen',          'kondition',0),
  ('technik',   'Technik',            'technik',  1),
  ('kondition', 'Kondition',          'kondition',2),
  ('poomsae',   'Poomsae',            'poomsae',  3),
  ('sparring',  'Sparring',           'kyorugi',  4),
  ('spiel',     'Spiel',              'kondition',5),
  ('dehnen',    'Dehnen',             'kondition',6),
  ('theorie',   'Theorie',            'theorie',  7),
  ('sv',        'Selbstverteidigung', 'sv',       8)
on conflict (id) do nothing;

-- Standard-Gruppen --------------------------------------------------------
insert into public.groups (id,name,level,min_age,max_age,sort_order) values
  ('grp-einsteiger','Einsteiger', 'Einsteiger',      6,14,0),
  ('grp-jugend',    'Jugend',     'Fortgeschritten',10,17,1),
  ('grp-erwachsene','Erwachsene', 'Erwachsene',     18,99,2)
on conflict (id) do nothing;

-- Schwellenwerte ----------------------------------------------------------
insert into public.alert_thresholds (kind,value) values
  ('low_attendance','60'),
  ('no_goals','1')
on conflict (kind) do nothing;
