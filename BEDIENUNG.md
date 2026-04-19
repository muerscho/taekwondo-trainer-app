# Bedienungsanleitung – TKD Trainer PWA

Diese Anleitung führt durch alle acht Hauptbereiche der App und erklärt die wichtigsten Abläufe im Trainingsalltag.

Die App ist vollständig auf Deutsch, funktioniert auf Mobiltelefon, Tablet und Desktop, arbeitet **offline-fähig** und synchronisiert optional mit Google Drive.

---

## Inhaltsverzeichnis

1. [Grundlagen: Navigation und Layout](#1-grundlagen-navigation-und-layout)
2. [Dashboard](#2-dashboard)
3. [Planung](#3-planung)
4. [Athleten](#4-athleten)
5. [Anwesenheit](#5-anwesenheit)
6. [Prüfungen & Wettkämpfe](#6-prüfungen--wettkämpfe)
7. [Bibliothek](#7-bibliothek)
8. [Auswertung](#8-auswertung)
9. [Einstellungen](#9-einstellungen)
10. [Datensicherung und Synchronisation](#10-datensicherung-und-synchronisation)

---

## 1. Grundlagen: Navigation und Layout

- **Mobil (< 768 px)**: Unten fünf Hauptbereiche (Dashboard, Planung, Athleten, Anwesenheit, Bibliothek). Das Symbol **☰ Mehr** öffnet alle weiteren Bereiche (Prüfungen, Auswertung, Einstellungen).
- **Tablet (768–1024 px)** und **Desktop (> 1024 px)**: Seitennavigation links, auf Desktop zusätzlich mit Labels. Alle Bereiche sind direkt erreichbar.
- **Kopfzeile**: Zeigt den aktuellen Bereich, den heutigen Kalendertag und rechts ein **⚙️** für den Schnellsprung zu den Einstellungen.
- **Speichern**: Wo Daten bearbeitet werden, erscheint ein **Speichern-Button** nur dann, wenn tatsächlich Änderungen vorliegen („Dirty-Flag"-Muster).
- **Toasts**: Kurze Bestätigungen unten am Bildschirm.
- **Bestätigungsdialoge**: Destruktive Aktionen (Löschen) sind immer durch einen Dialog abgesichert.

---

## 2. Dashboard

Der Startbildschirm fasst den aktuellen Stand zusammen.

| Bereich | Aktion |
|---|---|
| **KPI-Banner** | Zeigt Anzahl geplant / durchgeführt / ausgefallen und Gesamtzahl der Athleten. |
| **Wochenübersicht** | Listet alle Einheiten der aktuellen KW. Tap auf eine Einheit öffnet den Editor. |
| **Schwerpunkte** | Donut-Diagramm der tatsächlichen Verteilung plus Soll/Ist-Balken je Schwerpunkt. Der kleine Strich im Balken ist der Soll-Wert. Die farbige Zahl rechts zeigt die Abweichung (grün ≤ 3 %, gelb zu viel, rot zu wenig). |
| **Nächste Termine** | Die drei nächsten Termine mit Countdown. Bei < 21 Tagen erscheint ein rotes Dringlichkeits-Badge. |
| **Trendlinie** | Minuten pro Woche für die drei Hauptschwerpunkte (4 Wochen). |
| **Athleten-Alerts** | Erscheint nur, wenn Athleten eine Anwesenheitsquote < 60 % haben. Tap auf die Kachel öffnet das Athletenprofil. |
| **Schnellzugriff** | Vier Buttons für Neue Einheit, Anwesenheit, Neuer Athlet, Auswertung. |

---

## 3. Planung

Die **Mehrwochen-Ansicht** zeigt 12 Kalenderwochen im Voraus.

### 3.1 Neue Einheit anlegen

1. Gewünschte KW wählen → **+ Einheit**.
2. Datum, Gruppe und Dauer (45 / 60 / 90 / 120 Minuten) festlegen.
3. **Anlegen** — die Einheit erscheint mit Status „geplant".

### 3.2 Einheit bearbeiten (Blöcke)

Tap auf eine Einheit öffnet den **Editor**:

- **Kopfbereich**: Titel (optional), Datum, Gruppe, Dauer, Status (geplant / durchgeführt / ausgefallen).
- **Zeitleiste**: Proportionale Visualisierung aller Blöcke. Überschreitet die Summe die Gesamtdauer, erscheint ein roter Rahmen.
- **Puffer-Anzeige**: „Belegt 60 / 90 min · Puffer +30 min" – bei negativem Puffer wird der Text rot.
- **Abgeleitete Schwerpunkte**: Automatische Badges anhand der Block-Kategorien und ihrer Schwerpunkt-Zuordnung (konfigurierbar in Einstellungen).

### 3.3 Blöcke hinzufügen (3 Wege)

- **📚 Aus Bibliothek**: Öffnet ein Bottom-Sheet mit Suche und Kategoriefilter. Mehrfachauswahl ist möglich — alle gewählten Einträge werden als Blöcke übernommen.
- **✏️ Individuell**: Neuer Block direkt mit Titel, Kategorie, Dauer, Emoji-Icon und optionaler Notiz.
- **✨ KI-Vorschlag**: Die konfigurierte KI (z. B. Claude) generiert anhand von Gruppe, Dauer und Schwerpunkt einen vollständigen Blockaufbau. Vorschlag kann komplett übernommen oder verworfen werden.

### 3.4 Blöcke sortieren und bearbeiten

- **▲ ▼** Pfeile zur Sortierung.
- **✏️** bearbeitet einen Block, **🗑** löscht ihn (mit Bestätigung).

### 3.5 Einheit in Bibliothek speichern

**💾 In Bibliothek speichern** öffnet einen Dialog mit Vorschau (Anzahl Blöcke, Dauer, Kategorien). Der neue Eintrag erhält automatisch das Badge **📅 Aus Planung**.

### 3.6 Einheit löschen

**🗑 Einheit löschen** am unteren Rand des Editors – Bestätigung erforderlich.

---

## 4. Athleten

### 4.1 Athletenliste

- **Suche** (Live) und **Gruppenfilter**.
- **KPI-Banner** zeigt Gesamt, Ø Anwesenheit und Anzahl der Athleten unter 60 %.
- **Neuer Athlet** (+): Pflichtfelder Name und Geburtsdatum, dazu Gruppe und Startgurtgrad.

### 4.2 Athletenprofil – vier Reiter

- **Profil**: Stammdaten + Gruppe, Gurtgrad. Alter wird automatisch berechnet. Trainer-Notiz als Freitext. Speichern erscheint nur bei Änderungen.
- **Graduierung**:
  - Neue Graduierung mit Datum, Zielgurtgrad und Bewertung eintragen.
  - Bei **„Bestanden"/„Gut"/„Sehr gut"** wird automatisch der aktuelle Gurtgrad des Athleten aktualisiert.
  - **„Nicht bestanden"** bleibt Historieneintrag ohne Änderung.
  - Einzelne Einträge können gelöscht werden.
- **Termine**: Alle angelegten Prüfungen/Wettkämpfe. Tap togglet die Zuweisung des Athleten.
- **Ziele**: Freitext-Ziele anlegen, per Enter bestätigen. Abhaken zeigt Durchstreichung. Ein Fortschrittsbalken zeigt X / Y erreicht.

---

## 5. Anwesenheit

Drei Reiter:

### 5.1 Einheiten

Chronologische Liste aller Einheiten (neueste zuerst) mit farbigem Schwerpunkt-Indikator und Quote-Badge. Noch nicht erfasst → neutraler Hinweis.

### 5.2 Verlauf (Matrix)

- Zeilen = Athleten, Spalten = letzte 6 Einheiten.
- **Ein Tap auf eine Zelle** wechselt zyklisch: grau (nicht erfasst) → grün (anwesend) → rot (abwesend) → grau …
- Letzte Spalte: Gesamtquote farbcodiert.

### 5.3 Statistik

- KPIs Ø Anwesenheit, Anzahl ≥ 80 %, 60–79 %, < 60 %.
- **Gruppenvergleich** mit Balkenanzeige.
- **Ranking** aller Athleten mit Gurtgrad-Badge und individueller Quote.

### 5.4 Einheit erfassen (Detailseite)

Erreichbar über Tap auf eine Einheit im Reiter „Einheiten". Dort:

- Schnellaktionen **Alle anwesend** / **Alle abwesend**.
- Tap auf einen Athleten togglet dessen Status. Die KPI-Kacheln (Anwesend / Abwesend / Quote) aktualisieren sich in Echtzeit.

---

## 6. Prüfungen & Wettkämpfe

### 6.1 Terminliste

Filter nach Alle / 🎓 Prüfungen / 🏅 Wettkämpfe. Jede Karte zeigt:

- Typ (farbcodiert), Titel, Datum, Ort,
- Countdown (bei < 21 Tagen rot),
- Bereitschaftsbalken (Anteil erfüllter Kriterien),
- Athletenanzahl.

**+ Neuer Termin**: Typ, Bezeichnung und Datum sind Pflicht. Abhängig vom Typ wird automatisch ein sinnvoller Phasenplan vorbelegt.

### 6.2 Termindetail – vier Reiter

- **Übersicht**: Alle Felder editierbar (Bezeichnung, Datum, Ort, Prüfer nur bei Prüfung, Beschreibung, Notizen), KPI-Banner (Tage bis Termin, Wochen Plan, Athletenanzahl, Kriterien-Quote).
- **Phasenplan**:
  - Jede Phase: Name, Dauer (1/2/3/4/6/8 Wochen), Fokus-Thema.
  - Hinzufügen / Entfernen möglich, mindestens eine Phase.
  - **Speichern** schreibt den kompletten Phasenplan.
- **Athleten**: Tap togglet Zuweisung. Farblicher Rahmen + Badge „Angemeldet".
- **Kriterien**: Kriterium hinzufügen (Enter), abhaken (Durchstreichen), löschen. Fortschrittsbalken zeigt Bereitschaft.

Termin löschen: Im Reiter „Übersicht" unten. Bestätigung erforderlich.

---

## 7. Bibliothek

Sammlung wiederverwendbarer Inhalte: Übungen, Workouts, Spiele.

### 7.1 Liste & Filter

- Titel-Suche.
- Kategorie- und Niveau-Filter.
- Karten zeigen Typ (blau/rot/gelb), Kategorie, Niveau, optional **⏱ Timer**, **▶ Video** und **📅 Aus Planung**.

### 7.2 Neuer Eintrag

**+ Neuer Eintrag** öffnet einen Dialog. Typ, Titel, Kategorie, Niveau und Dauer sind Pflichtfelder. Optional: Beschreibung, Intervall-Timer aktivieren. Wird der Timer aktiviert, erhält der Eintrag Standardphasen (30 s Arbeit / 15 s Pause, 3 Runden), die später im Detail angepasst werden können.

### 7.3 Eintragsdetail – vier Reiter

- **Übersicht**: Alle Stammdaten inklusive Materialliste (Enter zum Hinzufügen). Eintrag löschen unten.
- **Anleitung**: Nummerierte Schritte, beliebig ergänzbar und entfernbar; die Nummerierung rutscht automatisch nach.
- **Medien**: YouTube-Video einbetten (URL oder Video-ID). Das Video spielt direkt eingebettet.
- **Timer** (nur bei aktiviertem Timer): animierter Ring-Countdown mit Phasen-Farbwechsel, Start / Pause / Reset. Wiederholungen 1–10, Phasendauer 5–600 Sekunden.

---

## 8. Auswertung

Drei Reiter + Export-Leiste.

- **Schwerpunkte**: Zeitraumfilter 4 / 8 / 12 Wochen, Donut, Soll/Ist-Balken, Trendlinie.
- **Anwesenheit**: Gruppenfilter, KPI-Banner, Heatmap der letzten 12 Einheiten je Athlet.
- **Ziele & Prüfungen**: Gesamtanzahl / erreicht / offen, Fortschrittsbalken je Athlet, Prüfungsbereitschaft je Termin.

PDF- und CSV-Export werden in einer zukünftigen Version nachgeliefert.

---

## 9. Einstellungen

Fünf Reiter:

### 9.1 Schwerpunkte

- Hinzufügen, Umbenennen, Farbe per Color-Picker, Gewichtung per Slider (0–100 %).
- Summe aller Gewichtungen wird oben angezeigt — grüner Wert bei 100 %, roter Hinweis bei > 100 %, Angabe des nicht verteilten Anteils bei < 100 %.
- **Speichern** schreibt alle Änderungen.

### 9.2 Gurtgrade

- Liste aller Gurtgrade (Standard: 10. Kup bis 2. Dan vorbelegt).
- **Bearbeiten** öffnet einen Dialog mit Live-Vorschau. Bezeichnung, Farbname, Hintergrund-, Rahmen- und Schriftfarbe sind frei konfigurierbar.

### 9.3 Gruppen

- Name, Level (Einsteiger / Fortgeschritten / Erwachsene), Mindest- und Höchstalter.
- Neue Gruppen anlegen, bestehende bearbeiten, löschen (nur möglich, wenn keine Athleten zugewiesen sind).

### 9.4 KI

- Provider (Claude / OpenAI / Custom) und Modell wählen.
- API-Key eintragen (Sichtbarkeits-Toggle mit 👁).
- **🔌 Verbindung testen** gibt grün oder rot zurück.
- Einzelne KI-Funktionen an/aus: Einheitsvorschläge, Phasenplan-Generierung, Dashboard-Empfehlung, Progressionsempfehlung, Variationslogik, Bibliotheksvorschläge.

### 9.5 ☁ Cloud-Sync

- Google OAuth Client-ID eintragen (siehe Installationsanleitung).
- **🔗 Verbinden** startet den Login.
- **⬆ Jetzt sichern**, **⬇ Aus Drive laden**, **📦 Tagesarchiv anlegen**.
- Status zeigt letzte Upload-/Download-Zeit und ob die Verbindung aktiv ist.

---

## 10. Datensicherung und Synchronisation

- **Lokal**: Alle Daten liegen in IndexedDB und einer SQLite-Datei im Browser. Beim App-Schließen wird lokal persistiert.
- **Google Drive** (optional): Bei aktiver Verbindung wird die Datei automatisch beim Hintergrundwechsel des Tabs hochgeladen.
- **Tägliches Archiv**: Jeder erste Start pro Tag legt eine versionierte Kopie im Ordner `TKD-Trainer-Archive` auf Google Drive ab. Archive älter als 30 Tage werden automatisch gelöscht, mindestens 7 Archive bleiben erhalten.
- **Mehrgerätebetrieb**: Bei der Verbindung mit Drive wird die neueste Version heruntergeladen. Bei gleichzeitigen Änderungen auf zwei Geräten gilt „Last-Write-Wins". Wer Konflikte vermeiden möchte, sollte ein Gerät jeweils bewusst zum Master wählen.
- **Verschlüsselung**: API-Keys (für Claude/OpenAI) werden mit WebCrypto verschlüsselt. Der Schlüssel verbleibt nur auf dem Gerät — nach einem Wechsel muss der API-Key einmalig neu eingegeben werden.

Damit ist der typische Trainingsalltag abgedeckt:

1. **Morgens**: App öffnen → Dashboard zeigt die nächsten Einheiten und Auffälligkeiten.
2. **Vor dem Training**: Planung öffnen → Einheit öffnen → bei Bedarf KI-Vorschlag einbauen.
3. **Im Training**: Anwesenheit auf dem Smartphone erfassen (Single-Tap).
4. **Nach dem Training**: Status auf „durchgeführt", Notizen an Blöcken ergänzen.
5. **Abends**: Google Drive sichert automatisch.
