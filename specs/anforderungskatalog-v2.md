# Anforderungskatalog – TKD Trainer App
**Version 3.0 | Stand: März 2026**

---

## Nummerierungsschema

| Ebene | Format | Beschreibung |
|---|---|---|
| Bereich | **A.XX** | Hauptbereich der App |
| Anforderung | **A.XX.YY** | Einzelne Anforderung im Bereich |
| Detail | **A.XX.YY.ZZ** | Umsetzungsspezifikation |

---

## A.01 – Navigation & App-Struktur

### A.01.01 – Hauptnavigation
- **A.01.01.01** Persistente Bottom-Navigation mit bis zu 8 Schnellzugriffspunkten (scrollbar).
- **A.01.01.02** Drawer-Menü (☰) für Zugriff auf alle Hauptbereiche.
- **A.01.01.03** Aktiver Bereich visuell hervorgehoben (Farbe + Schriftgewicht).
- **A.01.01.04** Header zeigt Bereichsname, Icon und Unterbereich kontextuell.

### A.01.02 – Hauptbereiche
- **A.01.02.01** Dashboard
- **A.01.02.02** Planung
- **A.01.02.03** Athleten
- **A.01.02.04** Anwesenheit
- **A.01.02.05** Prüfungen & Wettkämpfe
- **A.01.02.06** Bibliothek
- **A.01.02.07** Auswertung
- **A.01.02.08** Einstellungen

### A.01.03 – Technische Anforderungen
- **A.01.03.01** Die App unterstützt drei Geräteklassen mit angepasstem Layout (Responsive Design):
  - **A.01.03.01a** Mobile (iOS & Android): Single-Column-Layout, Bottom-Navigation, max. 480 px.
  - **A.01.03.01b** Tablet (768–1024 px): Zwei-Spalten-Layout, Sidebar-Navigation links, Hauptinhalt rechts.
  - **A.01.03.01c** Desktop (> 1024 px): Drei-Spalten-Layout möglich (Sidebar, Inhalt, Detailpanel), persistente Navigation links, erweiterter Informationsgehalt je Ansicht.
- **A.01.03.02** Navigation passt sich der Geräteklasse an:
  - Mobile: Bottom-Navigation + Drawer-Menü.
  - Tablet/Desktop: Persistente Sidebar-Navigation (kollabierbar).
- **A.01.03.03** Alle Kernfunktionen sind auf allen Geräteklassen vollständig nutzbar – kein Feature nur mobil.
- **A.01.03.04** Touch- und Maus-/Tastaturinteraktion werden gleichwertig unterstützt.
- **A.01.03.05** Tabellen, Matrizen (z. B. Anwesenheitsverlauf) und Diagramme nutzen auf größeren Bildschirmen den verfügbaren Platz aus.
- **A.01.03.06** Offline-Nutzung für alle Kernfunktionen auf allen Geräteklassen.
- **A.01.03.07** Cloud-Sync für Datensicherung und geräteübergreifende Nutzung.
- **A.01.03.08** Einheitliche Design Tokens (Farben, Radien, Schatten) in allen Bereichen und Breakpoints.
- **A.01.03.09** Toast-Benachrichtigungen bei bereichsübergreifenden Aktionen.

---

## A.02 – Dashboard

### A.02.01 – Datums- & Kontextanzeige
- **A.02.01.01** Aktuelles Datum (Wochentag, Tag, Monat, Jahr) als Kontext oben angezeigt.

### A.02.02 – KI-Empfehlung
- **A.02.02.01** Täglich bis zu 4 KI-Empfehlungen, navigierbar per Punkt-Indikator.
- **A.02.02.02** Empfehlungen basieren auf: Schwerpunktabweichung, Terminnähe, Trainingshistorie.
- **A.02.02.03** Aktionsbuttons: „Nächste" und „Umsetzen" direkt in der Karte.

### A.02.03 – Schnellzugriff
- **A.02.03.01** 4 Schnellzugriff-Buttons: Neue Einheit, Anwesenheit, Neuer Athlet, Auswertung.
- **A.02.03.02** Direktnavigation zum jeweiligen Bereich per Tap.

### A.02.04 – Wochenübersicht
- **A.02.04.01** Alle Einheiten der aktuellen Woche mit Tag, Datum, Gruppe, Dauer, Schwerpunkten.
- **A.02.04.02** Mini-Fortschrittsleiste: durchgeführt / geplant / ausgefallen.
- **A.02.04.03** Zähler: X von Y Einheiten durchgeführt.
- **A.02.04.04** Statusfarbkodierung: Grün = durchgeführt, Blau = geplant, Rot = ausgefallen.

### A.02.05 – Schwerpunkt-Kompaktansicht
- **A.02.05.01** Donut-Diagramm mit Ist-Verteilung der aktuellen Periode.
- **A.02.05.02** Soll/Ist-Balken je Schwerpunkt mit Sollwert-Marker.
- **A.02.05.03** Abweichungsanzeige: Pfeil + Prozentwert, farbkodiert.

### A.02.06 – Terminvorschau
- **A.02.06.01** Nächste Prüfungen und Wettkämpfe mit Countdown (Tage), Bereitschaftsbalken und Athletenanzahl.
- **A.02.06.02** Dringlichkeits-Badge bei < 21 Tagen.
- **A.02.06.03** Farbdifferenzierung: Blau = Prüfung, Rot = Wettkampf.

### A.02.07 – Schwerpunkt-Trendlinie
- **A.02.07.01** Liniendiagramm der letzten 4 Kalenderwochen für die 3 Hauptschwerpunkte.
- **A.02.07.02** Legende mit Farbzuordnung.

### A.02.08 – Athleten-Alerts
- **A.02.08.01** Farbkodierte Hinweiskarten bei Auffälligkeiten: Anwesenheit < 60 %, fehlende Ziele.
- **A.02.08.02** Direktlink zur Athletenverwaltung.

---

## A.03 – Trainingsplanung

### A.03.01 – Mehrwochenplan
- **A.03.01.01** Kalenderwochen-Übersicht mit Einheiten, mind. 12 Wochen voraus.
- **A.03.01.02** Schwerpunkt-Soll/Ist-Kompaktbalken als Kopfbereich mit Sollwert-Marker.
- **A.03.01.03** Mini-Zeitstrahl auf Einheitskarte: Blöcke proportional zur Dauer, farbig nach Kategorie.
- **A.03.01.04** Leere Kalenderwochen mit Hinweistext dargestellt.

### A.03.02 – Trainingseinheit erstellen
- **A.03.02.01** Neue Einheit per „+ Einheit"-Button je Kalenderwoche.
- **A.03.02.02** Pflichtfelder: Wochentag, Gruppe, Dauer.
- **A.03.02.03** Dauer wählbar: 45 / 60 / 90 / 120 min.
- **A.03.02.04** Status: geplant / durchgeführt / ausgefallen – editierbar, farbkodiert.

### A.03.03 – Einheit mit Blöcken aufbauen
- **A.03.03.01** Einheit besteht aus sortierbaren Inhaltsblöcken.
- **A.03.03.02** Drei Wege zum Hinzufügen eines Blocks:
  - **A.03.03.02a** Einzeln aus Bibliothek (Bottom-Sheet mit Suche & Kategoriefilter).
  - **A.03.03.02b** Mehrere aus Bibliothek (Mehrfachauswahl, alle auf einmal übernehmen).
  - **A.03.03.02c** Individuell erstellen (Titel, Kategorie, Dauer, Icon, Notiz).
- **A.03.03.03** Blöcke per ▲▼ in der Reihenfolge verschiebbar.
- **A.03.03.04** Jeder Block editierbar und löschbar.
- **A.03.03.05** Block zeigt Herkunft: 📚 Bibliothek oder ✏️ Individuell.
- **A.03.03.06** Optionale Notiz je Block (Hinweis zur Durchführung).

### A.03.04 – Zeitmanagement der Einheit
- **A.03.04.01** Gesamtdauer der Blöcke wird live summiert und angezeigt.
- **A.03.04.02** Puffer (geplante Dauer minus belegte Dauer) wird angezeigt.
- **A.03.04.03** Warnung bei Überschreitung der geplanten Dauer (roter Balken).
- **A.03.04.04** Farbiger Zeitbalken visualisiert Blockverteilung innerhalb der Einheit.

### A.03.05 – Schwerpunkte aus Blöcken ableiten
- **A.03.05.01** Schwerpunkte werden automatisch aus den Block-Kategorien abgeleitet.
- **A.03.05.02** Abgeleitete Schwerpunkte werden als Badges angezeigt.
- **A.03.05.03** Soll/Ist-Balken aktualisiert sich live bei Änderungen.

### A.03.06 – Einheit in Bibliothek speichern
- **A.03.06.01** Fertige Einheit mit Blöcken per Button in Bibliothek übernehmen.
- **A.03.06.02** Eigener Titel für den Bibliothekseintrag vergebar.
- **A.03.06.03** Vorschau: Blockanzahl, Gesamtdauer, Kategorien vor dem Speichern.
- **A.03.06.04** Toast-Bestätigung nach erfolgreichem Speichern.
- **A.03.06.05** In Bibliothek gespeicherte Einheiten erhalten Badge „📅 Aus Planung".

### A.03.07 – KI-Unterstützung Planung
- **A.03.07.01** KI-Vorschlag für Einheitsstruktur (aufklappbar, nicht aufdringlich).
- **A.03.07.02** KI berücksichtigt Schwerpunkt, Gruppe, Gurtgrad und aktive Periodisierungsphase.
- **A.03.07.03** Vorschlag übernehmbar, verwerfbar oder manuell anpassbar.

### A.03.08 – Löschen
- **A.03.08.01** Einheit löschbar mit Bestätigungsdialog.

---

## A.04 – Athletenverwaltung

### A.04.01 – Athletenliste
- **A.04.01.01** Suchfeld (Name-Suche in Echtzeit).
- **A.04.01.02** Gruppenfilter (Alle / Erwachsene / Jugend / Fortgeschrittene).
- **A.04.01.03** KPI-Banner: Anzahl Athleten, Ø Anwesenheit, Anzahl < 60 %.
- **A.04.01.04** Athletenkarte: Avatar mit Gurtfarbe, Name, Alter, Gruppe, Gurtgrad-Badge, Termin- und Ziel-Badge, Anwesenheitsquote farbkodiert.

### A.04.02 – Athletenprofil (4 Tabs)

**Tab Profil:**
- **A.04.02.01** Stammdaten: Name, Geburtsdatum, Alter (automatisch), Gruppe (editierbar), Gurtgrad.
- **A.04.02.02** Nächste Graduierungsstufe automatisch angezeigt (Von → Nach).
- **A.04.02.03** Trainer-Notiz: Freitextfeld je Athlet.

**Tab Graduierung:**
- **A.04.02.04** Vollständiger Graduierungsverlauf (Datum, Von → Nach, Bewertung).
- **A.04.02.05** Neue Graduierung eintragbar: Datum, Zielgurtgrad, Bewertung (Bestanden / Gut / Sehr gut / Nicht bestanden).
- **A.04.02.06** Eintragen aktualisiert den aktuellen Gurtgrad.
- **A.04.02.07** Graduierungen einzeln löschbar.

**Tab Termine:**
- **A.04.02.08** Zuweisung zu Prüfungen und Wettkämpfen per Tap (bidirektional).
- **A.04.02.09** Zugewiesene Termine mit Typ-Badge und Datum angezeigt.

**Tab Ziele:**
- **A.04.02.10** Ziele frei definierbar (Freitext).
- **A.04.02.11** Ziele abhakbar (Durchstreichung bei Erreichen).
- **A.04.02.12** Fortschrittsbalken: X von Y Zielen erreicht.
- **A.04.02.13** Ziele löschbar.

### A.04.03 – Neuer Athlet
- **A.04.03.01** Formular: Name, Geburtsdatum, Gruppe, Startgurtgrad.
- **A.04.03.02** Validierung: Name und Datum sind Pflichtfelder.

### A.04.04 – Speicherverhalten
- **A.04.04.01** Speichern-Button erscheint nur bei tatsächlichen Änderungen (Dirty-Flag).

---

## A.05 – Anwesenheitsverwaltung

### A.05.01 – Tabs
- **A.05.01.01** Tab „Einheiten" – Erfassung je Trainingseinheit.
- **A.05.01.02** Tab „Verlauf" – Tabellarische Matrix-Übersicht.
- **A.05.01.03** Tab „Statistik" – Auswertung und Vergleiche.
- **A.05.01.04** Gruppenfilter in allen drei Tabs verfügbar.

### A.05.02 – Einheitenansicht
- **A.05.02.01** Liste aller Einheiten mit Datum, Gruppe, Dauer, Schwerpunkt, Erfassungsstatus, Quote-Badge.
- **A.05.02.02** Farbiger Schwerpunkt-Punkt als Spalten-Indikator.
- **A.05.02.03** Tap auf Einheit öffnet Erfassungsansicht.
- **A.05.02.04** Neue Einheit anlegen: Datum, Wochentag, Gruppe, Dauer, Schwerpunkt.

### A.05.03 – Erfassungsansicht (Einheit)
- **A.05.03.01** Header: Datum, Tag, Gruppe, Dauer, Schwerpunkt-Badge.
- **A.05.03.02** Live-KPIs: Anwesend, Abwesend, Quote (%).
- **A.05.03.03** Schnellaktionen: „Alle anwesend" / „Alle abwesend".
- **A.05.03.04** Athletenliste: Tap togglet Status, farbiges Feedback (grün / grau).
- **A.05.03.05** Nur Athleten der zugehörigen Gruppe werden angezeigt.

### A.05.04 – Verlaufsansicht
- **A.05.04.01** Matrix: Athleten (Zeilen) × bis zu 6 neueste Einheiten (Spalten).
- **A.05.04.02** Zellen farbkodiert: ✓ grün, ✗ rot, · nicht erfasst (grau).
- **A.05.04.03** Jede Zelle direkt per Tap editierbar.
- **A.05.04.04** Schwerpunkt-Farbpunkt als Spalten-Header-Indikator.
- **A.05.04.05** Gesamtquote pro Athlet in letzter Spalte, farbkodiert.

### A.05.05 – Statistik
- **A.05.05.01** KPI-Banner: Ø Gesamt, ≥ 80 %, 60–79 %, < 60 %.
- **A.05.05.02** Gruppenvergleich mit Balkenanzeige.
- **A.05.05.03** Athleten-Ranking nach Quote (absteigend), mit eigenem Gruppenfilter.
- **A.05.05.04** Fortschrittsbalken je Athlet mit Gurtgrad-Badge.

### A.05.06 – Persistenz
- **A.05.06.01** Anwesenheitsdaten dauerhaft gespeichert.
- **A.05.06.02** Quote im Athletenprofil wird automatisch synchronisiert.

---

## A.06 – Prüfungen & Wettkämpfe

### A.06.01 – Terminübersicht
- **A.06.01.01** Filterung: Alle / 🎓 Prüfungen / 🏅 Wettkämpfe.
- **A.06.01.02** Visueller Zeitstrahl, nach Datum sortiert.
- **A.06.01.03** Terminkarte: Typ, Titel, Datum, Ort, Countdown, Bereitschaftsbalken, Phasenbadges, Athletenanzahl.
- **A.06.01.04** Neuen Termin anlegen.

### A.06.02 – Termin anlegen
- **A.06.02.01** Pflichtfelder: Typ, Bezeichnung, Datum.
- **A.06.02.02** Optionale Felder: Ort, Prüfer (nur bei Prüfung), Beschreibung, Notizen.
- **A.06.02.03** Zielgurtgrade (Mehrfachauswahl, nur bei Prüfungstyp sichtbar).
- **A.06.02.04** Phasenvorlage wird automatisch je nach Typ geladen.

### A.06.03 – Termindetail (4 Tabs)

**Tab Übersicht:**
- **A.06.03.01** Alle Felder angezeigt, KPI-Banner: Tage, Wochen Plan, Athleten, Kriterien-Quote.
- **A.06.03.02** Bereitschaftsbalken (Kriterien erfüllt %).
- **A.06.03.03** KI-Analyse: 3-stufig kontextabhängig (> 30 Tage / 14–30 / < 14 Tage).

**Tab Phasenplan:**
- **A.06.03.04** Proportionaler Timeline-Balken mit Phasennamen und Farbkodierung.
- **A.06.03.05** Jede Phase editierbar: Name, Dauer (1/2/3/4/6/8 Wochen), Fokus-Thema.
- **A.06.03.06** Phase hinzufügen / löschen (mind. 1 Phase).
- **A.06.03.07** Vorlage laden: Standardphasen je Typ (Prüfung / Wettkampf).

**Tab Athleten:**
- **A.06.03.08** Alle Athleten mit Gurtgrad und Gruppe, Zuweisung per Tap.
- **A.06.03.09** Zugewiesene Athleten mit farblichem Rahmen und Badge markiert.

**Tab Kriterien:**
- **A.06.03.10** Kriterien abhakbar (Durchstreichung), löschbar, erweiterbar.
- **A.06.03.11** Fortschrittsbalken: X / Y Kriterien erfüllt + Bereitschafts-%.

### A.06.04 – Termin löschen
- **A.06.04.01** Löschbar mit Bestätigungsdialog.

### A.06.05 – Speicherverhalten
- **A.06.05.01** Speichern-Button erscheint nur bei tatsächlichen Änderungen.

---

## A.07 – Bibliothek

### A.07.01 – Eintragsliste
- **A.07.01.01** Suchfeld (Titel und Tags durchsucht).
- **A.07.01.02** Kategorie-Filter (scrollbar): Technik, Kondition, Spiel, Poomsae, Sparring, Aufwärmen, Dehnen.
- **A.07.01.03** Niveau-Filter: Anfänger / Mittelstufe / Fortgeschritten.
- **A.07.01.04** Anzahl gefundener Einträge angezeigt.
- **A.07.01.05** Eintrags-Karte: Typ-Badge, Kategorie-Badge, Niveau-Badge, Timer-Badge (wenn aktiv), Video-Badge (wenn vorhanden), Herkunfts-Badge (📅 Aus Planung).

### A.07.02 – Eintragstypen
- **A.07.02.01** Übung (blau), Workout (rot), Spiel (gelb) – farblich unterschieden.

### A.07.03 – Eintrag erstellen
- **A.07.03.01** Typ, Titel, Kategorie, Niveau, Beschreibung (Pflichtfelder).
- **A.07.03.02** Tags frei vergebar (Eingabe + Enter).
- **A.07.03.03** Timer-Toggle: Intervall-Timer aktivierbar/deaktivierbar beim Anlegen.

### A.07.04 – Eintragsdetail (4 Tabs)

**Tab Übersicht:**
- **A.07.04.01** Bildvorschau (Emoji-Platzhalter, + Hinzufügen-Button).
- **A.07.04.02** Kurzinfos: Typ, Kategorie, Niveau, Schritte, Material, Timer-Status.
- **A.07.04.03** Materialliste mit Abhak-Optik.

**Tab Anleitung:**
- **A.07.04.04** Nummerierte Schritt-für-Schritt Anleitung.
- **A.07.04.05** Kreisförmige Schrittnummern als visuelle Führung.

**Tab Medien:**
- **A.07.04.06** Bildbereich mit Hinzufügen-Button für weitere Bilder.
- **A.07.04.07** YouTube-Video einbettbar via Video-ID oder vollständiger URL.
- **A.07.04.08** Eingebettetes Video via iFrame abspielbar direkt in der App.
- **A.07.04.09** Video entfernbar, neue URL eingebar.

**Tab Timer** (nur wenn aktiviert):
- **A.07.04.10** Animierter Ring-Countdown mit Farbwechsel je Phase.
- **A.07.04.11** Phasenwechsel automatisch mit Zeitanzeige.
- **A.07.04.12** Gesamtfortschrittsbalken (Phase X / Gesamtphasen).
- **A.07.04.13** Wiederholungsanzeige (Runde X / Y).
- **A.07.04.14** Start / Pause / Reset Steuerung.
- **A.07.04.15** Wiederholungsanzahl konfigurierbar: 1–10×.
- **A.07.04.16** Phasendauer per Slider konfigurierbar (5–600 Sekunden).
- **A.07.04.17** Gesamtzeit der Session wird angezeigt (Phasen × Wiederholungen).

---

## A.08 – Planung × Bibliothek (Bidirektionale Verbindung)

### A.08.01 – Richtung: Planung → Bibliothek
- **A.08.01.01** Einzelnen Bibliotheks-Eintrag per Bottom-Sheet zur Einheit hinzufügen.
- **A.08.01.02** Mehrere Bibliotheks-Einträge gleichzeitig auswählen und übernehmen (Mehrfachauswahl-Modus).
- **A.08.01.03** Individuellen Block direkt in der Einheit erstellen (ohne Bibliotheksbezug).
- **A.08.01.04** Fertige Einheit in Bibliothek speichern: Titel vergeben, Vorschau, Bestätigung.

### A.08.02 – Richtung: Bibliothek → Planung
- **A.08.02.01** Jeder Bibliothekseintrag hat einen „📅 Planen"-Button in der Listenansicht.
- **A.08.02.02** Detailansicht zeigt vollständigen Inhalt (Schritte, Material) vor der Planung.
- **A.08.02.03** Zwei Planungsmodi wählbar:
  - **A.08.02.03a** „Als Vorlage": Eintrag als Basis-Block einer neuen Einheit – Wochentag, Gruppe, Dauer direkt konfigurierbar, sofort in Planung eintragen.
  - **A.08.02.03b** „Kombinieren & anpassen": Eintrag als erster Block in bestehende Einheit einfügen, dort weiter ausbauen.

### A.08.03 – Gemeinsame Regeln
- **A.08.03.01** Bottom-Sheet Picker enthält Suche und Kategoriefilter.
- **A.08.03.02** Toast-Bestätigung bei allen bereichsübergreifenden Aktionen.
- **A.08.03.03** Herkunfts-Badge auf allen übernommenen Einträgen.
- **A.08.03.04** „Zuletzt in Bibliothek gespeichert"-Sektion in Planungsübersicht.

---

## A.09 – Einstellungen

### A.09.01 – Hauptmenü
- **A.09.01.01** Vier Bereiche: Schwerpunkte & Gewichtung, Gurtgrade & Prüfungsinhalte, Gruppen, KI-Konfiguration.
- **A.09.01.02** App-Info: Version, KI-Standard, Datenspeicherung.

### A.09.02 – Schwerpunkte & Gewichtung
- **A.09.02.01** Schwerpunkte anlegen, umbenennen, löschen.
- **A.09.02.02** Gewichtung per Slider (0–100 %), Summe sichtbar.
- **A.09.02.03** Visueller Gesamtbalken zeigt Verteilung proportional und farbig.
- **A.09.02.04** Anzeige: nicht verteilter Restanteil.
- **A.09.02.05** Farbwahl per Farbpalette (10 Farben).
- **A.09.02.06** Warnung bei Summe > 100 % (roter Indikator).

### A.09.03 – Gurtgrade & Prüfungsinhalte
- **A.09.03.01** Gurtgrade anlegen, bearbeiten, sortieren.
- **A.09.03.02** Je Gurtgrad konfigurierbar: Bezeichnung, Farbname, Pflicht-Poomsae, Techniken, Theoriethemen.
- **A.09.03.03** Detailansicht mit Live-Vorschau des Gurt-Badges.
- **A.09.03.04** Alle Felder frei editierbar (kein fest vorgegebener Inhalt).
- **A.09.03.05** Standard: 10. Kup bis 2. Dan vorbelegt, vollständig anpassbar.

### A.09.04 – Gruppen
- **A.09.04.01** Gruppen anlegen, bearbeiten, löschen.
- **A.09.04.02** Felder: Name, Level (Einsteiger / Fortgeschritten / Erwachsene), Mindestalter, Höchstalter.

### A.09.05 – KI-Konfiguration
- **A.09.05.01** KI-Provider auswählbar: Claude (Anthropic) Standard, OpenAI, Custom.
- **A.09.05.02** Modell je Provider auswählbar (Dropdown-Liste).
- **A.09.05.03** API-Key Eingabe mit Sichtbarkeits-Toggle (Auge-Icon).
- **A.09.05.04** Sicherheitshinweis: verschlüsselt gespeichert, nie im Klartext übertragen.
- **A.09.05.05** Verbindungstest-Button mit 3-stufigem Feedback: Laden / Erfolg / Fehler.
- **A.09.05.06** Sechs KI-Funktionen einzeln aktivierbar/deaktivierbar:
  - Einheitsvorschläge, Phasenplan-Generierung, Dashboard-Empfehlung,
  - Progressionsempfehlung, Variationslogik, Bibliotheksvorschläge.

---

## A.10 – Auswertung

### A.10.01 – Tabs
- **A.10.01.01** Tab Schwerpunkte, Tab Anwesenheit, Tab Ziele.
- **A.10.01.02** Export-Leiste (PDF / CSV) mit Bestätigungs-Feedback in allen Tabs.

### A.10.02 – Tab Schwerpunkte
- **A.10.02.01** Zeitraumfilter: 4 / 8 / 12 Wochen.
- **A.10.02.02** Donut-Diagramm mit Ist-Verteilung (SVG, animiert).
- **A.10.02.03** Soll/Ist-Balken mit Sollwert-Marker und Abweichungsfärbung.
- **A.10.02.04** Trendlinie: Einheiten pro Woche als Sparkline (SVG).

### A.10.03 – Tab Anwesenheit
- **A.10.03.01** Gruppenfilter.
- **A.10.03.02** KPI-Banner: Ø Quote, Anzahl ≥ 80 %, Anzahl < 60 %.
- **A.10.03.03** Heatmap je Athlet: letzte 12 Einheiten als grüne/rote Balken.
- **A.10.03.04** Gruppenvergleich mit Balkenanzeige.

### A.10.04 – Tab Ziele & Prüfungen
- **A.10.04.01** KPI: Ziele gesamt, erreicht, offen.
- **A.10.04.02** Fortschrittsbalken je Athlet (Ziele X/Y).
- **A.10.04.03** Prüfungsbereitschaft: Kriterien-Erfüllungsgrad als Balken + Status-Badges.
- **A.10.04.04** KI-Analyse mit konkreter Handlungsempfehlung.

---

## A.11 – KI-System (übergreifend)

### A.11.01 – Funktionen
- **A.11.01.01** Einheitsvorschlag: Aufbau (Aufwärmen / Hauptteil / Abschluss) je Schwerpunkt.
- **A.11.01.02** Phasenplan: Automatische Generierung je Termintyp und Datum.
- **A.11.01.03** Progressionsempfehlung bei erkannter Stagnation.
- **A.11.01.04** Variationslogik: Wiederholungen vermeiden.
- **A.11.01.05** Dashboard-Empfehlung (täglich, bis zu 4, navigierbar).
- **A.11.01.06** KI-Analyse in Termindetail (3-stufig nach Terminnähe).
- **A.11.01.07** Bibliotheksvorschläge für neue Inhalte.

### A.11.02 – Feedback-Loop
- **A.11.02.01** Trainer bewertet KI-Vorschläge (Umsetzen / Verwerfen).
- **A.11.02.02** Bewertungen fließen in zukünftige Vorschläge ein.
- **A.11.02.03** KI analysiert Trainingshistorie zur Langzeitoptimierung.

### A.11.03 – Wissenschaftliche Prinzipien (Taekwondo)
- **A.11.03.01** Progressive Überlastung.
- **A.11.03.02** Periodisierung nach Wettkampf-/Prüfungskalender.
- **A.11.03.03** Spezifität am Gruppen- und Terminprofil.
- **A.11.03.04** Regeneration: Warnung bei zu geringen Erholungsphasen.
- **A.11.03.05** Variation: Abwechslung über Wochen sichergestellt.

---

## Offene Punkte / Nächste Ausbaustufen

| ID | Thema | Priorität |
|---|---|---|
| O.01 | Alle Prototypen zur vollständigen App zusammenführen | Hoch |
| O.02 | Datenpersistenz (lokale DB + Cloud-Sync) implementieren | Hoch |
| O.03 | Echte KI-Anbindung (Claude API) in Prototyp integrieren | Hoch |
| O.04 | Bibliothek: Bilder-Upload (native Kamera / Galerie) | Mittel |
| O.05 | Export-Funktionen PDF/CSV (native Implementierung) | Mittel |
| O.06 | Push-Benachrichtigungen für Terminerinnerungen | Mittel |
| O.07 | Prüfungsbereitschafts-Checkliste je Athlet (abhakbar) | Mittel |
| O.08 | Schwerpunkt-Gewichtung je Gruppe (unterschiedliche Profile) | Mittel |
| O.09 | Timer: Audio-Signal bei Phasenwechsel | Niedrig |
| O.10 | Bibliothek: KI-generierte Vorschläge für neue Inhalte | Niedrig |
