# TKD Trainer – Taekwondo Trainer PWA

Progressive Web App zur Trainingsplanung, Athletenverwaltung, Prüfungs- und Wettkampforganisation für Taekwondo-Trainer. Offline-first, SQLite im Browser, Google Drive Sync, pluggable AI (Claude / OpenAI / Custom).

## Dokumentation

- [INSTALL.md](INSTALL.md) — Installation, Google Cloud Setup, Deployment, PWA-Install
- [BEDIENUNG.md](BEDIENUNG.md) — Detaillierte Bedienungsanleitung aller Bereiche

## Schnellstart

```bash
npm install
npm run dev
```

Öffnet den Dev-Server unter `http://localhost:5173`.

## Stack

- **Frontend**: React 18 + TypeScript + Vite + React Router + Zustand
- **PWA**: `vite-plugin-pwa` (Workbox)
- **Lokaler Speicher**: SQLite via `sql.js` → Blob in IndexedDB
- **Cloud**: Google Drive API v3 (Scope `drive.file`) mit täglichem Archivierungs-Job
- **Verschlüsselung**: WebCrypto AES-GCM (API-Keys)
- **KI**: Abstract Provider + Claude / OpenAI / Custom (OpenAI-kompatibel)

## Projektstruktur

```
src/
├── domain/        # Typen, Berechnungen, Formatter
├── design/        # Tokens, Global Styles
├── storage/       # SQLite, Repos, Drive Sync, Bootstrap
├── security/      # Verschlüsselter Key Store
├── ai/            # Provider-Abstraktion
├── state/         # Zustand Stores
├── hooks/
├── components/
│   ├── layout/    # AppShell, Sidebar, BottomNav, Drawer, Header
│   └── ui/        # Card, Badge, BeltBadge, Donut, SollIstBar, ...
└── features/
    ├── dashboard/
    ├── planung/
    ├── athleten/
    ├── anwesenheit/
    ├── pruefungen/
    ├── bibliothek/
    ├── auswertung/
    └── einstellungen/
```
