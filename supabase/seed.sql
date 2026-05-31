-- Seed-Daten – portiert aus src/storage/seed.ts + src/design/tokens.ts.
-- Idempotent via "on conflict do nothing". KI-Seeds (ai_config/ai_function_toggles)
-- wurden bewusst entfernt. Gruppen erhalten stabile Slug-IDs (statt Zufalls-UUID).

-- Gurtgrade ---------------------------------------------------------------
insert into public.belt_ranks (id,label,color_name,color_hex,color_border_hex,text_color_hex,sort_order,is_dan) values
  ('g10','10. Kup','Weiß',        '#ffffff','#d1d5db','#374151', 0,false),
  ('g9', '9. Kup', 'Weiß-Gelb',   '#fef9c3','#facc15','#78350f', 1,false),
  ('g8', '8. Kup', 'Gelb',        '#fde047','#facc15','#78350f', 2,false),
  ('g7', '7. Kup', 'Gelb-Grün',   '#bef264','#84cc16','#365314', 3,false),
  ('g6', '6. Kup', 'Grün',        '#22c55e','#16a34a','#ffffff', 4,false),
  ('g5', '5. Kup', 'Grün-Blau',   '#38bdf8','#0284c7','#ffffff', 5,false),
  ('g4', '4. Kup', 'Blau',        '#3b82f6','#1e40af','#ffffff', 6,false),
  ('g3', '3. Kup', 'Blau-Rot',    '#a78bfa','#7c3aed','#ffffff', 7,false),
  ('g2', '2. Kup', 'Rot',         '#ef4444','#b91c1c','#ffffff', 8,false),
  ('g1', '1. Kup', 'Rot-Schwarz', '#7f1d1d','#450a0a','#ffffff', 9,false),
  ('d1', '1. Dan', 'Schwarz',     '#111827','#000000','#fbbf24',10,true),
  ('d2', '2. Dan', 'Schwarz',     '#111827','#000000','#fbbf24',11,true)
on conflict (id) do nothing;

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
