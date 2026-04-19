export const C = {
  primary: '#1e3a5f',
  primaryDark: '#162a45',
  bg: '#f5f6f8',
  surface: '#ffffff',
  text: '#1f2937',
  textMuted: '#6b7280',
  border: '#e5e7eb',
  borderStrong: '#d1d5db',

  success: '#10b981',
  warn: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',

  exam: '#3b82f6',
  competition: '#ef4444',

  statusPlanned: '#3b82f6',
  statusDone: '#10b981',
  statusCancelled: '#ef4444',
} as const;

export const BP = { mobile: 480, tablet: 768, desktop: 1024 } as const;

export const RADII = { sm: 6, md: 10, lg: 14, xl: 20, pill: 999 } as const;

export const SHADOWS = {
  card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  cardHover: '0 4px 12px rgba(0,0,0,0.08)',
  modal: '0 20px 50px rgba(0,0,0,0.2)'
} as const;

export type BeltDefaultId =
  | 'g10' | 'g9' | 'g8' | 'g7' | 'g6' | 'g5' | 'g4' | 'g3' | 'g2' | 'g1'
  | 'd1' | 'd2';

export interface BeltDef {
  id: BeltDefaultId;
  label: string;
  colorName: string;
  bg: string;
  border: string;
  fg?: string;
  sort: number;
  isDan: boolean;
}

export const GURTGRADE_DEFAULT: BeltDef[] = [
  { id: 'g10', label: '10. Kup', colorName: 'Weiß',         bg: '#ffffff', border: '#d1d5db', fg: '#374151', sort: 0, isDan: false },
  { id: 'g9',  label: '9. Kup',  colorName: 'Weiß-Gelb',    bg: '#fef9c3', border: '#facc15', fg: '#78350f', sort: 1, isDan: false },
  { id: 'g8',  label: '8. Kup',  colorName: 'Gelb',         bg: '#fde047', border: '#facc15', fg: '#78350f', sort: 2, isDan: false },
  { id: 'g7',  label: '7. Kup',  colorName: 'Gelb-Grün',    bg: '#bef264', border: '#84cc16', fg: '#365314', sort: 3, isDan: false },
  { id: 'g6',  label: '6. Kup',  colorName: 'Grün',         bg: '#22c55e', border: '#16a34a', fg: '#ffffff', sort: 4, isDan: false },
  { id: 'g5',  label: '5. Kup',  colorName: 'Grün-Blau',    bg: '#38bdf8', border: '#0284c7', fg: '#ffffff', sort: 5, isDan: false },
  { id: 'g4',  label: '4. Kup',  colorName: 'Blau',         bg: '#3b82f6', border: '#1e40af', fg: '#ffffff', sort: 6, isDan: false },
  { id: 'g3',  label: '3. Kup',  colorName: 'Blau-Rot',     bg: '#a78bfa', border: '#7c3aed', fg: '#ffffff', sort: 7, isDan: false },
  { id: 'g2',  label: '2. Kup',  colorName: 'Rot',          bg: '#ef4444', border: '#b91c1c', fg: '#ffffff', sort: 8, isDan: false },
  { id: 'g1',  label: '1. Kup',  colorName: 'Rot-Schwarz',  bg: '#7f1d1d', border: '#450a0a', fg: '#ffffff', sort: 9, isDan: false },
  { id: 'd1',  label: '1. Dan',  colorName: 'Schwarz',      bg: '#111827', border: '#000000', fg: '#fbbf24', sort: 10, isDan: true },
  { id: 'd2',  label: '2. Dan',  colorName: 'Schwarz',      bg: '#111827', border: '#000000', fg: '#fbbf24', sort: 11, isDan: true }
];

export interface FocusAreaDef {
  id: string;
  name: string;
  color: string;
  weight: number;
  sort: number;
}

export const SCHWERPUNKTE_DEFAULT: FocusAreaDef[] = [
  { id: 'kyorugi',   name: 'Kyorugi',           color: '#ef4444', weight: 25, sort: 0 },
  { id: 'poomsae',   name: 'Poomsae',           color: '#8b5cf6', weight: 20, sort: 1 },
  { id: 'kondition', name: 'Kondition',         color: '#f59e0b', weight: 20, sort: 2 },
  { id: 'technik',   name: 'Technik',           color: '#3b82f6', weight: 20, sort: 3 },
  { id: 'theorie',   name: 'Theorie',           color: '#10b981', weight: 5,  sort: 4 },
  { id: 'sv',        name: 'Selbstverteidigung', color: '#64748b', weight: 10, sort: 5 }
];

export const BLOCK_KATEGORIEN_DEFAULT = [
  { id: 'aufwaermen', name: 'Aufwärmen', mapTo: 'kondition', sort: 0 },
  { id: 'technik',    name: 'Technik',   mapTo: 'technik',   sort: 1 },
  { id: 'kondition',  name: 'Kondition', mapTo: 'kondition', sort: 2 },
  { id: 'poomsae',    name: 'Poomsae',   mapTo: 'poomsae',   sort: 3 },
  { id: 'sparring',   name: 'Sparring',  mapTo: 'kyorugi',   sort: 4 },
  { id: 'spiel',      name: 'Spiel',     mapTo: 'kondition', sort: 5 },
  { id: 'dehnen',     name: 'Dehnen',    mapTo: 'kondition', sort: 6 },
  { id: 'theorie',    name: 'Theorie',   mapTo: 'theorie',   sort: 7 },
  { id: 'sv',         name: 'Selbstverteidigung', mapTo: 'sv', sort: 8 }
];

export const TYP_FARBEN = {
  Übung:   '#3b82f6',
  Workout: '#ef4444',
  Spiel:   '#f59e0b'
} as const;

export const LIBRARY_TYPEN = ['Übung', 'Workout', 'Spiel'] as const;
export const LIBRARY_NIVEAUS = ['Anfänger', 'Mittelstufe', 'Fortgeschritten'] as const;
export const GROUP_LEVELS = ['Einsteiger', 'Fortgeschritten', 'Erwachsene'] as const;
export const UNIT_STATUS = ['geplant', 'durchgeführt', 'ausgefallen'] as const;
export const UNIT_DURATIONS = [45, 60, 90, 120] as const;
export const GRADING_EVALS = ['Bestanden', 'Gut', 'Sehr gut', 'Nicht bestanden'] as const;
export const PHASE_DURATIONS = [1, 2, 3, 4, 6, 8] as const;
export const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as const;
