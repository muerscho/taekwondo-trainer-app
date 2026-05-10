# Feature: Detailansicht / Live-Modus einer Trainingseinheit — offene Fragen

> Bitte unter jeder Frage in der Zeile `**Antwort:**` antworten. Mehrfachauswahl in eckigen Klammern markieren (z. B. `[x] A`).

## Kurzbeschreibung des Features

Eine neue Ansicht für eine bereits geplante `TrainingUnit` mit zwei Aufgaben:

1. **Handout-Modus** — übersichtliche Detailansicht für den Trainer mit allen Blöcken, Zeiten, Kurzbeschreibungen, benötigtem Material; Videos/externe Inhalte nur als Link.
2. **Live-Modus** — startet die Einheit, läuft im Vollbild, mit zwei Timern (Gesamt + aktueller Abschnitt) und Buttons „Nächster Trainingsabschnitt" / „Zurück".

---

## A · Architektur / Einstieg

### A1. Eine View oder zwei?

Soll Handout (Read-only) und Live-Modus dieselbe Komponente sein (zwei Modi `view` ↔ `run`), oder zwei separate Routen/Komponenten?

- [ ] eine Komponente, zwei Modi
- [ x] zwei separate Routen (`/einheit/:id/handout`, `/einheit/:id/run`)

**Antwort:**eine Komponente, zwei Modi

---

### A2. Einstieg — von wo aus erreichbar?

- [ ] Button im `EinheitEditorPage` (z. B. „📋 Ansicht / ▶ Starten")
- [ ] Direkt von der Einheitskarte in `PlanungPage`
- [x ] Beides
- [ ] Sonstiger Ort: ___________

**Antwort:**

---

### A3. Verhältnis zum bestehenden Editor

Beim Klick auf eine Einheit in der Wochenübersicht: Was soll Default sein?

- [ ] Default = neue Detailansicht; „Bearbeiten" als Aktion daraus
- [x ] Default bleibt der Editor; Detailansicht über extra Button

**Antwort:**

---

## B · Block-Inhalte (kritisch wegen Datenmodell)

> Hintergrund: Ein `TrainingBlock` hat aktuell nur `title`, `note`, `iconEmoji`, `durationMinutes`. Material, Schritte, Video, Timer-Phasen leben **am `LibraryEntry`** (über `sourceLibraryEntryId` verknüpft). Custom-Blöcke (`source: 'custom'`) haben aktuell keine eigenen Schritte/Material/Video.

### B1. Custom-Blöcke

- [ x] Ok so, custom-Blöcke zeigen nur Titel/Notiz/Dauer/Icon (kein Schema-Ausbau)
- [ ] Custom-Blöcke sollen ebenfalls eigene Schritte/Material/Video haben können — Schema erweitern

**Antwort:**

---

### B2. Library-gebundene Blöcke — Quelle der Inhalte

Wenn ein Block aus der Bibliothek stammt: Wie kommen Beschreibung/Schritte/Material/Video in die Detailansicht?

- [ x] **Live-Lookup** über `sourceLibraryEntryId` — immer aktuell, ändert sich, wenn der Library-Eintrag geändert wird
- [ ] **Snapshot** — Inhalte werden beim Hinzufügen in den Block kopiert und sind danach unabhängig

**Antwort:**

---

### B3. Aggregierte Materialliste

Soll am Anfang der Ansicht eine **gesammelte Materialliste über alle Blöcke** stehen ("Was du vorbereiten musst"), zusätzlich zur Anzeige pro Block?

- [ x] Ja, oben aggregiert + zusätzlich pro Block
- [ ] Nein, nur pro Block
- [ ] Nur oben aggregiert (nicht pro Block)

**Antwort:**

---

### B4. Externe Links

Aktuell ist nur `youtubeVideoId` modelliert. Wollen wir generische URLs (Vimeo, Drive, Webseite, …) pro Block bzw. Library-Eintrag erlauben?

- [x ] Nur YouTube (Status quo)
- [ ] Generische URL-Liste pro Library-Eintrag — Schema erweitern
- [ ] Generische URL-Liste auch pro Block

**Antwort:**

---

## C · Live-Timer-Verhalten

### C1. Timer-Richtung pro Block

- [x ] **Countdown** — zählt von Soll-Dauer runter; bei 0 Warnton + zählt rot weiter ins Minus
- [ ] **Stoppuhr** — zählt hoch von 0; Soll-Dauer als Marker
- [ ] Beides nebeneinander

**Antwort:**

---

### C2. Pause-Button?

- [ x] Ja, Start/Pause/Weiter
- [ ] Nein, nur Start → Nächster → Zurück → Beenden

**Antwort:**

---

### C3. Verhalten von „Nächster Trainingsabschnitt"

- [x ] Beendet den laufenden Block sofort (auch vor Ablauf), merkt tatsächliche Dauer
- [ ] Funktioniert nur, wenn Block-Soll-Zeit erreicht ist
- [ ] Beendet sofort, speichert aber keine Ist-Zeit

**Antwort:**

---

### C4. Akustisches Signal

- [ ] Ja, Gong/Ton bei Block-Ende (oder beim Wechsel)
- [ x] Nein, nur visuell

**Antwort:**

---

### C5. Verhalten von „Zurück"

- [ ] Vorheriger Block startet komplett neu (Timer reset)
- [ x] Nur Sprung im Plan; Gesamttimer läuft weiter

**Antwort:**

---

## D · Persistenz & Statusübergang

### D1. Tatsächliche Block-Zeiten speichern?

Sollen Ist-Zeiten je Block in der DB landen (für spätere Auswertung Soll/Ist)?

- [ ] Ja, in DB persistieren — Schema-Erweiterung (z. B. `actualSeconds` an `TrainingBlock` oder neue Tabelle `TrainingBlockExecution`)
- [ x] Nein, nur flüchtiger UI-Zustand während des Live-Modus

**Antwort:**

---

### D2. Beim Beenden der Einheit

- [ ] Status automatisch auf `durchgeführt` setzen
- [ x] Trainer wählt: durchgeführt / abgebrochen
- [ ] Direkt weiter zur Anwesenheitserfassung springen
- [ ] Nur Toast „Einheit beendet", Status bleibt unverändert

**Antwort:**

---

### D3. Wiederaufnahme nach Tab-Reload

Wenn der Browser-Tab während laufender Einheit geschlossen / neu geladen wird:

- [x ] Zustand wiederherstellen (in localStorage / DB persistieren) und beim erneuten Öffnen Hinweis „Laufende Einheit fortsetzen?"
- [ ] Verloren — Trainer muss neu starten

**Antwort:** Zustand nur im localStorage speichern

---

## E · Vollbild & Devices

### E1. Vollbild-Mechanismus

- [ ] **Browser-Fullscreen-API** (`element.requestFullscreen()`) — echtes OS-Vollbild
- [ ] Nur **visuell vollflächig** (App-Shell + Sidebar/Bottom-Nav ausblenden), kein OS-Fullscreen
- [x ] Beides — Trainer kann zusätzlich auf OS-Vollbild umschalten

**Antwort:**

---

### E2. Wake-Lock (Screen-Lock verhindern)

Auf Mobilgeräten geht der Bildschirm sonst nach Inaktivität aus.

- [ x] Ja, Wake-Lock-API aktivieren während Live-Modus
- [ ] Nein, ignorieren

**Antwort:**

---

### E3. Geräteklassen (CLAUDE.md verlangt alle drei)

Sind besondere Layoutregeln für Mobile/Tablet im Live-Modus gewünscht?

- [x ] Ein Layout für alle (skaliert)
- [ ] Mobile: Hochformat-optimiert, Tablet/Desktop: breite Anzeige
- [ ] Querformat empfehlen / erzwingen auf Mobile

**Antwort:**

---

## F · Sonstiges

### F1. Drucken / PDF-Export des Handouts

- [ ] Muss (Print-CSS / PDF-Export)
- [ x] Nice-to-have, später
- [ ] Nicht nötig

**Antwort:**

---

### F2. Anzeige im Handout — was muss rein?

(Mehrfachauswahl)

- [ x] Titel, Datum, Gruppe, Gesamtdauer, Status
- [ x] Schwerpunkt-Verteilung (Donut/Balken)
- [ x] Zeitstrahl (`TimelineBlocks`)
- [ x] Liste aller Blöcke mit: Reihenfolge, Titel, Dauer, Kategorie/Schwerpunkt, Notiz
- [ x] Pro Block: Beschreibung aus Library
- [ x] Pro Block: Schritt-für-Schritt-Anleitung
- [ x] Pro Block: Material
- [ x] Pro Block: Video-Link (Verlinkung, kein eingebetteter Player)
- [ x] Aggregierte Materialliste oben
- [ x] Trainer-Hinweise / globale Notiz zur Einheit
- [ ] Sonstiges: ___________

**Antwort:**

---

### F3. Was zeigt der Live-Modus pro Block?

(Mehrfachauswahl)

- [ x] Großer Timer (verbleibend / verstrichen)
- [ x] Block-Titel + Icon
- [ x] Kurzbeschreibung
- [ x] Schritt-für-Schritt-Anleitung
- [ x] Material
- [ x] Video-Link (Klick öffnet neuen Tab)
- [ x] Vorschau auf nächsten Block
- [ x] Fortschritt der Gesamteinheit (z. B. Block 3/8)
- [ ] Sonstiges: ___________

**Antwort:**

---

### F4. Sonstige Hinweise / Wünsche

Bitte für die App noch ergänzen, dass bei einem Reload der Seite , zum Beispiel durch Wischen nach unten am Handy , dass die Seite zwar neu geladen werden darf aber es sollen die Daten nicht vom Google Drive Speicher neu geholt werden. Die Sychronisation der Drive Daten soll nur per Einstellungs-Menu möglich sein.
