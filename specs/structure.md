# Strukturplan – Taekwondo Trainer-App

## Navigation (Hauptbereiche)

```
App
├── Dashboard
├── Planung
│   ├── Wochenplan
│   ├── Mehrwochenplan
│   └── Trainingseinheit (Detail)
├── Athleten
│   ├── Athletenliste
│   └── Athletenprofil
├── Gruppen
│   ├── Gruppenliste
│   └── Gruppendetail
├── Prüfungen & Wettkämpfe
│   ├── Termine
│   └── Vorbereitungsplan
├── Bibliothek
│   ├── Übungen / Drills
│   └── Poomsae / Kombinationen
├── Auswertung
│   ├── Schwerpunktverteilung
│   ├── Zielerreichung
│   └── Anwesenheit
└── Einstellungen
    ├── Schwerpunkte & Gewichtung
    ├── Gurtgrade & Prüfungsinhalte
    ├── Trainingsziele
    └── KI-Konfiguration
```

---

## Datenmodell (Kernentitäten)

| Entität | Wichtigste Felder |
|---|---|
| **Athlet** | Name, Geburtsdatum, Gurtgrad, Gruppe(n), Ziele |
| **Gruppe** | Name, Level, Schwerpunktgewichtung |
| **Trainingseinheit** | Datum, Dauer, Gruppe, Schwerpunkte, Inhalte, Status |
| **Schwerpunkt** | Name, Gewichtung, Farbe |
| **Inhalt / Übung** | Name, Kategorie, Gurtgrad, Intensität, Dauer |
| **Gurtgrad** | Bezeichnung, Prüfungsinhalte (konfigurierbar) |
| **Prüfungstermin** | Datum, Gurtgrad, Athleten, Vorbereitungsplan |
| **Wettkampftermin** | Datum, Kategorie, Athleten, Periodisierungsplan |
| **Ziel** | Beschreibung, Zeitraum, Priorität, Messbarkeit |
| **KI-Konfiguration** | Provider, Modell, API-Key |

---

## Seitenstruktur (Detail)

### Dashboard
- Nächste Trainingseinheiten (diese Woche)
- Anstehende Prüfungen & Wettkämpfe
- Schwerpunkt-Soll/Ist (kompakt)
- KI-Hinweis / Empfehlung des Tages

### Trainingseinheit (Detail)
- Kopf: Datum, Dauer, Gruppe
- Schwerpunkte dieser Einheit
- Inhalte (Aufwärmen → Hauptteil → Abschluss)
- KI-Vorschlag-Button
- Nachbereitung: Bewertung, Notizen

### Athletenprofil
- Stammdaten & Gurtgrad
- Anwesenheitshistorie
- Aktuelle Ziele & Fortschritt
- Prüfungsbereitschaft (Kriterien-Checkliste)

### Prüfungs- / Wettkampfvorbereitung
- Zieldatum
- Automatisch generierter Phasenplan (KI)
- Trainingswochen mit Fokus je Phase
- Beteiligte Athleten & Status

### Einstellungen → Gurtgrade
- Liste aller Gurtgrade (frei anpassbar)
- Je Gurtgrad: Pflichtinhalte, Poomsae, Techniken, Theorie
- Kriterien für Prüfungsbereitschaft konfigurierbar

### Einstellungen → KI-Konfiguration
- Provider auswählen (Claude, OpenAI, Custom)
- Modell auswählen
- API-Key eingeben (verschlüsselt gespeichert)
- Verbindungstest

---

## Technischer Stack (Empfehlung)

| Bereich | Technologie |
|---|---|
| Frontend | React Native (iOS + Android) |
| State Management | Zustand / Redux |
| Lokale DB | SQLite (Offline-Fähigkeit) |
| Cloud-Sync | Supabase oder Firebase |
| KI-Anbindung | Abstraktes Provider-Interface (Claude als Default) |
| Export | react-native-pdf / CSV-Generator |
