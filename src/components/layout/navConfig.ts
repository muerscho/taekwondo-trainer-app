export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  primary: boolean;
}

export const NAV: NavItem[] = [
  { id: 'dashboard',    label: 'Dashboard',        icon: '🏠', path: '/dashboard',    primary: true },
  { id: 'planung',      label: 'Planung',          icon: '📅', path: '/planung',      primary: true },
  { id: 'athleten',     label: 'Athleten',         icon: '👥', path: '/athleten',     primary: true },
  { id: 'anwesenheit',  label: 'Anwesenheit',      icon: '✓',  path: '/anwesenheit',  primary: true },
  { id: 'bibliothek',   label: 'Bibliothek',       icon: '📚', path: '/bibliothek',   primary: true },
  { id: 'pruefungen',   label: 'Prüfungen',        icon: '🎓', path: '/pruefungen',   primary: false },
  { id: 'auswertung',   label: 'Auswertung',       icon: '📊', path: '/auswertung',   primary: false },
  { id: 'einstellungen', label: 'Einstellungen',   icon: '⚙️', path: '/einstellungen', primary: false }
];
