# Umsetzungsplan: Migration auf Supabase

**Stand:** 2026-05-31 · **Status:** Plan, noch nicht umgesetzt

Dieses Dokument beschreibt die vollständige Umstellung der Taekwondo-Trainer-App von der
aktuellen Lösung (sql.js + Google-Drive-Sync) auf eine **Supabase-Instanz**, mit
**Trainer-Authentifizierung über Supabase Auth** und **Datenzugriff über die
Supabase-API-Mappings (PostgREST / supabase-js)**.

---

## 1. Getroffene Entscheidungen (Grundlage des Plans)

| Thema | Entscheidung | Konsequenz |
|---|---|---|
| **Mandantenmodell** | Mehrere Trainer, je persönlicher Account, **alle dürfen alles sehen/bearbeiten** | RLS = „authentifiziert ⇒ Vollzugriff". Keine `owner_id`/`club_id`-Spalten nötig. Ein gemeinsamer Datenbestand. |
| **Offline** | **Online-first + Lese-Cache** | `sql.js` als Datenbank entfällt. Der bestehende zustand-Store wird zum Lese-Cache; Schreibvorgänge gehen direkt an die Supabase-API (write-through). |
| **KI-Funktionen** | **Komplett entfernen** | `src/ai/*`, `keyStore`, Tabellen `ai_config` / `ai_function_toggles` / `ai_recommendations` und zugehörige UI werden gelöscht. |
| **Auth** | **Supabase Auth (GoTrue)** | Beantwortet die Kern-Frage: Ja, die Trainer-Anmeldung wird direkt an den Supabase-Auth-Service gebunden. Siehe §4. |

---

## 2. Analyse des Ist-Zustands

**Architektur heute (rein clientseitig, synchron):**

```
React-Komponenten (15 Feature-Seiten)
        │  synchron, 127 direkte Aufrufe
        ▼
repos.ts  (groupsRepo, athletesRepo, unitsRepo, … – synchrones CRUD)
        │  query() / run() / transaction()
        ▼
db.ts     (sql.js – SQLite im RAM)
        │  export() → Uint8Array
        ├──► IndexedDB (lokale Persistenz)
        └──► driveSync.ts → Google Drive (ganze .db-Datei als Blob, OAuth via GIS)
```

- **`src/state/dataStore.ts`** (zustand) hält Top-Level-Listen (`athletes`, `groups`,
  `units`, `library`, `termine`, `trainers`, …), befüllt durch `loadAll()`. Detailseiten
  rufen Repos zusätzlich **direkt und synchron** auf (z. B. `blocksRepo.byUnit(id)`,
  `goalsRepo.byAthlete(id)`, `statsRepo.*`).
- **Kern-Herausforderung der Migration:** Alle Repo-Aufrufe sind **synchron**, die
  Supabase-API ist **asynchron**. 127 Aufrufstellen in 15 Dateien sind betroffen.
- **Statistiken** (`statsRepo`) werden heute per SQL-Aggregation berechnet (JOINs,
  `SUM`, `FILTER`). Diese müssen ersetzt werden (clientseitige Derivation über den Cache
  oder Postgres-Views/RPC).

**Strategie zur Auflösung der Sync/Async-Herausforderung:**
Der zustand-Store wird zum **alleinigen Lese-Cache**. Beim Start (nach Login) werden alle
Sammlungen einmal asynchron aus Supabase geladen. Komponenten **lesen synchron aus dem
Cache**; **Schreibvorgänge** rufen async die Supabase-API und aktualisieren danach den
Cache. Aggregationen (`statsRepo`) werden als **reine clientseitige Funktionen** über die
Cache-Arrays neu implementiert. Damit bleiben die meisten Komponenten render-synchron.

---

## 3. Entitäten → Postgres-Tabellen

Das bestehende SQLite-Schema (`src/storage/schema.ts`) wird nahezu 1:1 nach Postgres
übersetzt. Generelle Typ-Regeln:

- `TEXT`-PK (UUID-Strings) → **`uuid`** (Client liefert die ID via `crypto.randomUUID()`).
- `INTEGER` 0/1 → **`boolean`**.
- ISO-Text-Zeitstempel → **`timestamptz`** (`created_at`/`updated_at` mit `default now()`),
  reine Datumsfelder → **`date`**.
- `CHECK(... IN (...))` bleiben als CHECK-Constraints erhalten (inkl. deutscher Werte wie
  `'durchgeführt'`). Indizes und `UNIQUE`-Constraints werden übernommen.
- `updated_at` wird per **Trigger** automatisch gesetzt (statt im Repo-Code).

### Zu übernehmende Tabellen (gemeinsamer Datenbestand)

**Stammdaten / Referenz**
- `groups`, `belt_ranks`, `belt_rank_contents`, `focus_areas`, `block_categories`
- `trainers` – **Domänen-Entität** (zuweisbare Übungsleiter), **nicht** identisch mit
  Auth-Usern. Bleibt erhalten. Optional später Spalte `auth_user_id uuid references auth.users` zur Verknüpfung; für RLS nicht erforderlich.

**Athleten**
- `athletes`, `goals`, `graduation_history`

**Planung**
- `training_units`, `training_blocks`, `training_unit_trainers`, `attendance_records`

**Bibliothek**
- `library_entries`, `library_steps`, `library_materials`, `library_media`,
  `tags`, `library_tags`, `library_timer_configs`, `library_timer_phases`

**Prüfungen / Wettkämpfe**
- `exams_tournaments`, `termin_phases`, `termin_criteria`,
  `termin_athlete_assignments`, `termin_target_belts`

**App-Status**
- `alert_thresholds`, `app_state`, `settings`
  (Hinweis: alle `drive.*`-Keys in `settings` werden obsolet und entfernt.)

### Zu entfernende Tabellen
- `ai_config`, `ai_function_toggles`, `ai_recommendations` (KI raus)
- `schema_meta` (Versionierung übernimmt Supabase Migrations)

---

## 4. Authentifizierung & Sicherheit (RLS)

**Auth-Service:** Supabase Auth (GoTrue). Empfehlung: **E-Mail + Passwort** (alternativ
Magic-Link). **Public Sign-up deaktivieren** und Trainer per Einladung im Supabase-Dashboard
anlegen → so kann sich nicht jeder registrieren.

**App-Gate:** Eine `AuthGate`-Komponente prüft die Session (`supabase.auth.getSession()` +
`onAuthStateChange`). Ohne Session → Login-Screen; mit Session → App + Daten-Hydration.

**RLS (Row Level Security):** Auf **allen** Daten-Tabellen aktiviert. Da alle
authentifizierten Trainer alles dürfen, lautet die Policy einheitlich:

```sql
alter table <tabelle> enable row level security;
create policy "authenticated full access" on <tabelle>
  for all to authenticated
  using (true) with check (true);
```

Der **anon key** wird im Frontend verwendet (sicher, da RLS den Zugriff erzwingt und
anon ohne Login nichts sieht). Der **service-role key** wird **niemals** ins Frontend
eingebettet.

---

## 5. Ziel-Architektur

```
React-Komponenten
   │  Reads: synchron aus Cache        Writes: async
   ▼                                      │
zustand-Store (Lese-Cache)  ◄─────────────┤  nach Write: Cache aktualisieren
   ▲ Hydration beim Start                 ▼
   └──────────────── supabaseRepos.ts (async, supabase-js .from(...))
                            │
                            ▼
                   supabaseClient.ts  ──►  Supabase (PostgREST-API + Auth)
```

---

## 6. Phasenplan (dateigenau)

### Phase 0 — Supabase-Projekt & Tooling
- Supabase-Projekt anlegen (oder bestehende Instanz nutzen), `supabase`-CLI initialisieren
  (`supabase/`-Ordner ist bereits vorhanden, aber leer).
- `.env` / Vite-Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (nicht committen;
  `credantials.txt` aus dem Repo entfernen — liegt aktuell ungeschützt im Wurzelverzeichnis).
- `npm i @supabase/supabase-js` · `sql.js` + `@types/sql.js` später entfernen.

### Phase 1 — Schema-Migration
- `supabase/migrations/0001_init.sql`: Postgres-Übersetzung aus §3 inkl. Indizes,
  Constraints, `updated_at`-Trigger.
- `supabase/migrations/0002_rls.sql`: RLS + Policies aus §4 für alle Tabellen.
- Seed (Gurtgrade, Schwerpunkte, Kategorien) aus `src/storage/seed.ts` nach
  `supabase/seed.sql` portieren.

### Phase 2 — Client & Auth-Gate
- `src/lib/supabaseClient.ts`: `createClient(url, anonKey)`.
- `src/features/auth/AuthGate.tsx` + `LoginPage.tsx`: Session-Handling, Login/Logout.
- `src/App.tsx`: Bootstrap so umbauen, dass zuerst Auth geprüft wird, dann Daten geladen
  werden (Login-Screen statt der heutigen reinen Storage-Initialisierung).

### Phase 3 — Async-Repo-Schicht
- `src/data/repos.ts` **neu**: spiegelt die API von `src/storage/repos.ts`, aber jede
  Methode ist `async` und nutzt `supabase.from('tabelle')…`. snake_case⇄camelCase-Mapping
  bleibt erhalten. Transaktionen (z. B. `graduationRepo.add`, `setSteps`, `setPhases`,
  `setTargetBelts`, `setTimer`) werden als mehrstufige Aufrufe oder **Postgres-RPC**
  (`supabase.rpc`) umgesetzt, wo Atomarität wichtig ist.

### Phase 4 — Cache & Derivations
- `src/state/dataStore.ts` umbauen: `loadAll()`/`reload()` werden **async** und laden aus
  Supabase. Optional **Realtime** (`supabase.channel`) für geräteübergreifende Aktualität.
- `statsRepo` als reine clientseitige Funktionen über die Cache-Arrays neu schreiben
  (`weekFocusDistribution`, `unitFocusDistribution`, `weekStatusCount`,
  `athleteAttendanceRates`, `terminReadiness`). Alternativ als Postgres-Views.
- Detail-Sammlungen (Blöcke, Goals, Kriterien, Anwesenheit, Lib-Steps/-Timer …): entweder
  vollständig in den Cache laden (kleiner Datenbestand, ein Verein) **oder** pro Detailseite
  via `useEffect` async nachladen.

### Phase 5 — Feature-Seiten umstellen (15 Dateien)
Synchrone Repo-Reads → Cache-Reads; synchrone Writes → `await` + Cache-Refresh.
Betroffen (nach Aufrufdichte): `EinheitEditorPage`, `AthletProfilPage`,
`TerminDetailPage`, `EintragDetailPage`, `EinstellungenPage`, `ErfassungsPage`,
`AuswertungPage`, `EinheitRunPage`/`EinheitHandoutPage`, `DashboardPage`,
`AnwesenheitPage`, `PlanungPage`, `TerminListePage`, `BibliothekListePage`,
`AthletenListePage`. Pattern: Buttons/Aktionen werden `async`, kurze Lade-/Speicher-States;
**Dirty-Flag-Save-Pattern (A.04.04.01) bleibt** erhalten.

### Phase 6 — KI entfernen
- Löschen: `src/ai/` (AIProvider, ClaudeProvider, OpenAIProvider, factory),
  `src/security/keyStore.ts`.
- Aus `dataStore`/Typen: `aiConfig`, `aiToggles`, `AiRecommendation`, `aiConfigRepo`,
  `recommendationsRepo` entfernen.
- UI: KI-Abschnitte in `EinstellungenPage.tsx` und ggf. KI-Empfehlungen im Dashboard
  entfernen.

### Phase 7 — Altsystem entfernen
- Löschen: `src/storage/db.ts`, `schema.ts`, `seed.ts`, `repos.ts`, `driveSync.ts`,
  `bootstrap.ts` (nach Umzug der noch benötigten Logik).
- `package.json`: `sql.js`, `@types/sql.js` entfernen. Google-Drive-/GIS-Code & dessen
  Settings-UI entfernen.

### Phase 8 — Einmalige Datenübernahme
- Falls bestehende lokale Daten erhalten bleiben sollen: Migrationsskript, das die aktuelle
  sql.js-DB (Export aus IndexedDB) ausliest und per supabase-js in die neuen Tabellen
  schreibt. Andernfalls: nur Seed-Daten.

### Phase 9 — Abschluss
- `INSTALL.md` / `BEDIENUNG.md` aktualisieren (Supabase-Setup, Login, kein Drive mehr).
- `CLAUDE.md` aktualisieren (Repo ist nicht mehr „specs-only"; neue Architektur).
- Manuelle Tests pro Feature-Seite (CRUD + Login/Logout + zweites Gerät).

---

## 7. Risiken & offene Punkte
- **Sync→Async-Umbau** ist der größte Aufwand (15 Seiten, 127 Stellen). Risiko: Render-Logik,
  die heute synchron Daten erwartet. Mitigation: vollständige Cache-Hydration vor App-Render.
- **Atomare Mehrtabellen-Writes** (z. B. Graduierung aktualisiert Athleten-Gurt) → als RPC
  absichern.
- **`credantials.txt`** liegt unverschlüsselt im Repo-Root → entfernen & `.gitignore`.
- **Realtime** optional, aber empfehlenswert, da mehrere Trainer denselben Bestand teilen.
- **Public-Signup** deaktivieren, sonst kann sich jeder einen Account anlegen und alles sehen.

## 8. Aufwand (grob)
| Phase | Aufwand |
|---|---|
| 0–1 Setup + Schema/RLS | klein–mittel |
| 2 Auth-Gate | klein |
| 3 Async-Repos | mittel |
| 4 Cache + Stats | mittel |
| 5 Feature-Seiten | **groß** |
| 6 KI entfernen | klein |
| 7 Altsystem entfernen | klein |
| 8 Datenübernahme | klein (optional) |
