-- Row Level Security – Phase 1 der Supabase-Migration.
--
-- Mandantenmodell (festgelegt): mehrere Trainer mit je eigenem Account, aber ALLE
-- authentifizierten Trainer dürfen ALLES sehen und bearbeiten -> ein gemeinsamer
-- Datenbestand. Daher pro Tabelle eine einheitliche Policy:
--   for all to authenticated using (true) with check (true)
--
-- Der anon-Key (Frontend) sieht ohne Login nichts, da RLS aktiv ist und keine
-- anon-Policy existiert. Der service-role-Key umgeht RLS und darf NIE ins Frontend.

begin;

do $$
declare
  t text;
begin
  for t in
    select tablename
    from pg_tables
    where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security;', t);
    -- bestehende Policy gleichen Namens entfernen (idempotent bei erneutem Lauf)
    execute format('drop policy if exists "authenticated full access" on public.%I;', t);
    execute format(
      'create policy "authenticated full access" on public.%I '
      || 'for all to authenticated using (true) with check (true);', t);
  end loop;
end;
$$;

commit;
