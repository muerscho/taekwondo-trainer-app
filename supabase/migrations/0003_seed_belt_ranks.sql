-- Gurtgrade (belt_ranks) – Stammdaten-Seed.
-- 10. Kup (Weiß) … 1. Kup (Braun-Schwarz) sowie 1.–5. Dan (Schwarz).
-- Braun-Gurt-System: 1. Kup = Braun/Schwarz (abweichend von der älteren
-- Rot-Schwarz-Palette in seed.sql / tokens.ts – siehe README/Memo).
--
-- Idempotent: "on conflict (id) do update" legt fehlende Grade an und
-- korrigiert vorhandene (z. B. ein bereits per seed.sql eingespieltes
-- 1. Kup von Rot-Schwarz auf Braun). sort_order ist unique (idx_belt_sort),
-- daher fortlaufend 0–14.

begin;

insert into public.belt_ranks
  (id,  label,     color_name,    color_hex, color_border_hex, text_color_hex, sort_order, is_dan) values
  ('g10','10. Kup','Weiß',        '#ffffff','#d1d5db','#374151', 0, false),
  ('g9', '9. Kup', 'Weiß-Gelb',   '#fef9c3','#facc15','#78350f', 1, false),
  ('g8', '8. Kup', 'Gelb',        '#fde047','#facc15','#78350f', 2, false),
  ('g7', '7. Kup', 'Gelb-Grün',   '#bef264','#84cc16','#365314', 3, false),
  ('g6', '6. Kup', 'Grün',        '#22c55e','#16a34a','#ffffff', 4, false),
  ('g5', '5. Kup', 'Grün-Blau',   '#38bdf8','#0284c7','#ffffff', 5, false),
  ('g4', '4. Kup', 'Blau',        '#3b82f6','#1e40af','#ffffff', 6, false),
  ('g3', '3. Kup', 'Blau-Rot',    '#a78bfa','#7c3aed','#ffffff', 7, false),
  ('g2', '2. Kup', 'Rot',         '#ef4444','#b91c1c','#ffffff', 8, false),
  ('g1', '1. Kup', 'Braun-Schwarz','#5c4033','#3e2723','#ffffff', 9, false),
  ('d1', '1. Dan', 'Schwarz',     '#111827','#000000','#fbbf24',10, true),
  ('d2', '2. Dan', 'Schwarz',     '#111827','#000000','#fbbf24',11, true),
  ('d3', '3. Dan', 'Schwarz',     '#111827','#000000','#fbbf24',12, true),
  ('d4', '4. Dan', 'Schwarz',     '#111827','#000000','#fbbf24',13, true),
  ('d5', '5. Dan', 'Schwarz',     '#111827','#000000','#fbbf24',14, true)
on conflict (id) do update set
  label            = excluded.label,
  color_name       = excluded.color_name,
  color_hex        = excluded.color_hex,
  color_border_hex = excluded.color_border_hex,
  text_color_hex   = excluded.text_color_hex,
  sort_order       = excluded.sort_order,
  is_dan           = excluded.is_dan;

commit;
