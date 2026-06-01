-- 0004: Kategorie-Auswahl auf Schwerpunkte umstellen.
--
-- Bisher referenzierte category_id (training_blocks, library_entries) die interne,
-- in der App nicht verwaltbare Tabelle block_categories. Künftig zeigt category_id
-- direkt auf focus_areas (Schwerpunkte). Bestehende Daten werden über
-- block_categories.focus_area_id auf den jeweiligen Schwerpunkt umgemappt.
--
-- block_categories selbst bleibt als (jetzt ungenutzte) Tabelle erhalten, damit der
-- bestehende Daten-Loader nicht bricht und die Migration nicht-destruktiv ist.

begin;

-- 1) Bestehende Verweise von block_categories auf den zugehörigen Schwerpunkt umschreiben.
update public.training_blocks tb
   set category_id = bc.focus_area_id
  from public.block_categories bc
 where bc.id = tb.category_id
   and bc.focus_area_id is not null;

update public.library_entries le
   set category_id = bc.focus_area_id
  from public.block_categories bc
 where bc.id = le.category_id
   and bc.focus_area_id is not null;

-- 2) Sicherheitsnetz: alles, was sich nicht auf einen Schwerpunkt abbilden ließ
--    (z. B. block_categories ohne focus_area_id), auf den ersten Schwerpunkt setzen.
update public.training_blocks
   set category_id = (select id from public.focus_areas order by sort_order limit 1)
 where category_id not in (select id from public.focus_areas);

update public.library_entries
   set category_id = (select id from public.focus_areas order by sort_order limit 1)
 where category_id not in (select id from public.focus_areas);

-- 3) Alte Fremdschlüssel (auf block_categories) entfernen.
alter table public.training_blocks drop constraint if exists training_blocks_category_id_fkey;
alter table public.library_entries drop constraint if exists library_entries_category_id_fkey;

-- 4) Neue Fremdschlüssel auf focus_areas setzen.
alter table public.training_blocks
  add constraint training_blocks_category_id_fkey
  foreign key (category_id) references public.focus_areas(id) on delete restrict;

alter table public.library_entries
  add constraint library_entries_category_id_fkey
  foreign key (category_id) references public.focus_areas(id) on delete restrict;

commit;
