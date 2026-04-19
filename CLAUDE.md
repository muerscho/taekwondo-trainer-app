# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository status

This is a **specification-only** repository — no application code, build tooling, `package.json`, or tests exist yet. Everything currently lives under `specs/`. Before adding runtime code, confirm with the user whether the implementation should be scaffolded here or in a sibling repo.

## What's in `specs/`

- `anforderungskatalog-v2.md` — the authoritative requirements document (Version 3.0, März 2026). Uses a hierarchical ID scheme: `A.XX` = area, `A.XX.YY` = requirement, `A.XX.YY.ZZ` = detail. When making decisions about behavior, cite the ID so changes are traceable back to the spec.
- `requirements.md` + `structure.md` — earlier, higher-level overview (v1). The v3 `anforderungskatalog-v2.md` supersedes these where they conflict; treat v1 as background context only.
- `prototype-*.tsx` — single-file React mockups, one per app area (dashboard, planung, athleten, pruefungen, bibliothek, auswertung, einstellungen). They are **design references**, not runnable components: inline styles, hard-coded mock data, self-contained `useBreakpoint` hooks, and no imports from a shared codebase. Duplicates like `prototype-auswertung (1).tsx` are re-exports from the prototyping tool — check modification dates and diff when unsure which is canonical.

## Domain & language conventions

The app is a **Taekwondo trainer / coach tool** (training planning, athlete management, belt exams, tournaments, AI-assisted session suggestions). The spec and UI copy are in **German**; match that language when writing user-facing strings or requirement references. Key domain terms that recur and should be preserved verbatim:

- **Schwerpunkte** — training focus areas (Kyorugi, Poomsae, Kondition, Technik, Theorie, Selbstverteidigung). Each has a fixed color in the design tokens.
- **Gurtgrade** — belt ranks, 10. Kup → 1. Dan+. Each rank has a canonical hex/border color used across all prototypes.
- **Einheit** — a single training session; built from ordered **Blöcke** (blocks).
- **Prüfung** (belt exam, blue) vs. **Wettkampf** (tournament, red) — consistently color-differentiated.
- **Soll/Ist** — target vs. actual distribution of training focus; appears in dashboards and planning views.

## Cross-cutting rules from the spec

These recur across multiple areas and are easy to miss if you only read one section:

- **Responsive, three device classes** (A.01.03.01): Mobile (< 768 px, bottom nav), Tablet (768–1024 px, sidebar), Desktop (> 1024 px, three-column). **All features must work on all device classes** — no mobile-only features.
- **Offline-first** (A.01.03.06) with cloud sync (A.01.03.07). Local persistence is a hard requirement, not an optimization.
- **AI provider is pluggable** (A.08 / A.11): Claude is the default, but provider, model, and API key are user-configurable in settings. Any AI integration must go through an abstract provider interface, not call Anthropic SDKs directly from feature code.
- **Dirty-flag save pattern** (A.04.04.01): Save buttons only appear when there are actual changes. Apply this pattern to any new edit screen.
- **Design tokens are shared**: colors (`C.primary = #1e3a5f`, etc.), breakpoints (`BP.mobile=480, tablet=768, desktop=1024`), and the belt/Schwerpunkt palettes are duplicated across every prototype. When implementation starts, these should be extracted into a single shared tokens module — don't re-derive them per screen.

## Recommended tech stack (from `structure.md`)

Not yet chosen definitively, but the spec recommends: React Native (iOS + Android + responsive web), Zustand or Redux, SQLite for offline, Supabase/Firebase for sync, abstract AI provider interface. The prototypes are written as React (web) components using inline styles — treat them as visual truth, not architectural truth.

## Working with the prototypes

- They are self-contained and will not compile in a project without a React + JSX setup. Don't try to `tsc` them in isolation.
- When a spec requirement (e.g., `A.02.05.01` donut chart) is ambiguous, the matching prototype is usually the tiebreaker for layout/interaction. Cross-reference both.
- Mock data in prototypes (athletes, Termine, Einheiten) is **illustrative only** — don't treat field shapes as the final data model. The entity table in `structure.md` §Datenmodell is closer to canonical.
