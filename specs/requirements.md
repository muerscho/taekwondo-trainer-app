# Anforderungskatalog – Taekwondo Trainer-App

## 1. Zielgruppen & Gruppenmanagement

- Unterscheidung zwischen **Einsteiger/Jugend** und **Erwachsene/Fortgeschrittene**
- Gruppen individuell konfigurierbar (Name, Level, Alter, Erfahrung)
- Mehrere Gruppen parallel verwaltbar

---

## 2. Athletenverwaltung

- Individuelle Athletenprofile (Name, Alter, Gurtgrad, Wettkampfklasse)
- Anwesenheitsverfolgung pro Einheit
- Fortschrittshistorie pro Athlet
- Zuweisung zu Gruppen (auch Mehrfachzuweisung möglich)

---

## 3. Trainingsplanung

- Erstellung von Trainingseinheiten mit variabler Dauer (z. B. 60, 90, 120 min)
- Mehrere Einheiten pro Woche planbar
- Wochenplan- und Mehrwochenplan-Ansicht
- Zuweisung von Einheiten zu Gruppen

---

## 4. Schwerpunkte & Gewichtung (Taekwondo-spezifisch)

- Frei konfigurierbare Trainingsschwerpunkte, z. B.:
  - Poomsae, Kyorugi, Technik, Kondition, Sparring, Selbstverteidigung, Theorie
- Gewichtung pro Schwerpunkt festlegbar (z. B. Poomsae 30 %, Kyorugi 40 % …)
- Automatische **gleichmäßige Verteilung** der Schwerpunkte über einen definierten Zeitraum
- Auswertung: Ist-Soll-Vergleich der Schwerpunktverteilung

---

## 5. Trainingsziele

- Individuelle Ziele pro Gruppe oder Athlet definierbar
- Ziele mit Zeitraum, Priorität und Messbarkeit versehen
- Fortschrittsverfolgung über Zeit

---

## 6. Prüfungs- & Wettkampfplanung

- **Gurtprüfungen (Kup/Dan)** als Zieldatum planbar
  - Prüfungsinhalte je Gurtgrad hinterlegbar (Techniken, Poomsae, Theorie)
  - Automatische Rückplanung: Trainingsphasen bis zur Prüfung
  - Bereitschaftsanzeige pro Athlet (Kriterien erfüllbar konfigurierbar)
- **Wettkampfvorbereitung** planbar
  - Turnier- / Wettkampftermine erfassbar
  - Periodisierung auf Wettkampfdatum (Aufbau → Intensiv → Tapering)
  - Gewichtsklassen und Kategorie hinterlegbar

---

## 7. Wissenschaftliche Trainingsprinzipien (Taekwondo)

- **Progressive Überlastung** – schrittweise Steigerung von Intensität/Volumen
- **Periodisierung** – Wellen- oder Blockstruktur angepasst an Prüfungs-/Wettkampftermine
- **Spezifität** – Inhalte am Wettkampf- oder Prüfungsprofil ausrichten
- **Regeneration** – Warnung bei zu geringen Erholungsphasen
- **Variation** – Abwechslung in Methoden und Inhalten

---

## 8. KI-Unterstützung

- **Standard-KI: Claude (Anthropic)** – für den initialen Betrieb
- **KI-Konfiguration**: Anbieter, Modell und API-Key in den Einstellungen austauschbar (z. B. OpenAI, eigenes Modell)
- KI-Funktionen:
  - Inhaltsvorschläge basierend auf Schwerpunkt, Gruppe, Gurtgrad und Phase
  - Progressionsempfehlungen bei Stagnation
  - Variationslogik zur Vermeidung von Wiederholungen
  - Prüfungsvorbereitungsplan auf Basis von Gurtgrad und Zeitraum
  - Feedback-Schleife: Trainer bewertet Einheiten → KI lernt Präferenzen
  - Langzeitoptimierung der Trainingspläne auf Basis der Historie

---

## 9. Inhalts-Bibliothek (Taekwondo-spezifisch)

- Übungen, Drills, Poomsae, Kyorugi-Kombinationen, Konditionseinheiten
- Kategorisierung nach Schwerpunkt, Gurtgrad, Dauer, Intensität
- Eigene Inhalte erstellbar und bearbeitbar
- KI-generierte Vorschläge ergänzbar und bewertbar

---

## 10. Auswertung & Berichte

- Schwerpunktverteilung über Zeitraum als Diagramm
- Zielerreichungs-Dashboard
- Prüfungsbereitschaft pro Athlet
- Anwesenheitsstatistiken
- Exportfunktion (PDF / CSV)

---

## 11. Technische Anforderungen

- Mobile-first (iOS & Android)
- Offline-Nutzung für Kernfunktionen
- Datensicherung / Cloud-Sync
- KI-Anbieter in Einstellungen konfigurierbar (Provider, Modell, API-Key)
- Einfache, schnelle Bedienung im Trainingsalltag
