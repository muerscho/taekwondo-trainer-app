export type UUID = string;
export type IsoDate = string;
export type IsoDateTime = string;

export type GroupLevel = 'Einsteiger' | 'Fortgeschritten' | 'Erwachsene';
export type UnitStatus = 'geplant' | 'durchgeführt' | 'ausgefallen';
export type UnitDuration = 45 | 60 | 90 | 120;
export type LibraryTyp = 'Übung' | 'Workout' | 'Spiel';
export type LibraryNiveau = 'Anfänger' | 'Mittelstufe' | 'Fortgeschritten';
export type BlockSource = 'library' | 'custom';
export type LibrarySource = 'manual' | 'from_planning';
export type TerminTyp = 'Pruefung' | 'Wettkampf';
export type GradingEval = 'Bestanden' | 'Gut' | 'Sehr gut' | 'Nicht bestanden';
export type Weekday = 'Mo' | 'Di' | 'Mi' | 'Do' | 'Fr' | 'Sa' | 'So';
export type AiProvider = 'Claude' | 'OpenAI' | 'Custom';
export type AiFunctionId = 'einheit' | 'phasenplan' | 'dashboard' | 'progress' | 'variation' | 'bibliothek';
export type AiRecContext = 'dashboard' | 'termin' | 'einheit' | 'progress' | 'variation' | 'bibliothek';

export interface Group {
  id: UUID;
  name: string;
  level: GroupLevel;
  minAge: number;
  maxAge: number;
  sortOrder: number;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface BeltRank {
  id: UUID;
  label: string;
  colorName: string;
  colorHex: string;
  colorBorderHex: string;
  textColorHex: string | null;
  sortOrder: number;
  isDan: boolean;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface BeltRankContent {
  id: UUID;
  beltRankId: UUID;
  kind: 'poomsae' | 'technik' | 'theorie';
  text: string;
  sortOrder: number;
}

export interface FocusArea {
  id: UUID;
  name: string;
  colorHex: string;
  weightPercent: number;
  sortOrder: number;
  isMain: boolean;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface BlockCategory {
  id: UUID;
  name: string;
  focusAreaId: UUID | null;
  sortOrder: number;
}

export interface Athlete {
  id: UUID;
  name: string;
  birthDate: IsoDate;
  groupId: UUID;
  beltRankId: UUID;
  trainerNote: string | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface Goal {
  id: UUID;
  athleteId: UUID;
  text: string;
  achieved: boolean;
  achievedAt: IsoDateTime | null;
  sortOrder: number;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface Graduation {
  id: UUID;
  athleteId: UUID;
  date: IsoDate;
  fromBeltRankId: UUID;
  toBeltRankId: UUID;
  evaluation: GradingEval;
  createdAt: IsoDateTime;
}

export interface TrainingUnit {
  id: UUID;
  date: IsoDate;
  weekday: Weekday;
  isoYear: number;
  isoWeek: number;
  groupId: UUID;
  durationMinutes: UnitDuration;
  status: UnitStatus;
  title: string | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface TrainingBlock {
  id: UUID;
  trainingUnitId: UUID;
  sortOrder: number;
  title: string;
  categoryId: UUID;
  durationMinutes: number;
  iconEmoji: string | null;
  note: string | null;
  source: BlockSource;
  sourceLibraryEntryId: UUID | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface AttendanceRecord {
  id: UUID;
  trainingUnitId: UUID;
  athleteId: UUID;
  present: boolean | null;
  recordedAt: IsoDateTime | null;
}

export interface LibraryEntry {
  id: UUID;
  type: LibraryTyp;
  title: string;
  categoryId: UUID;
  niveau: LibraryNiveau;
  description: string | null;
  youtubeVideoId: string | null;
  durationMinutes: number;
  source: LibrarySource;
  createdFromUnitId: UUID | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface LibraryStep {
  id: UUID;
  libraryEntryId: UUID;
  stepNumber: number;
  text: string;
}

export interface LibraryMaterial {
  id: UUID;
  libraryEntryId: UUID;
  text: string;
  sortOrder: number;
}

export interface LibraryMedia {
  id: UUID;
  libraryEntryId: UUID;
  kind: 'image' | 'emoji';
  uri: string;
  sortOrder: number;
}

export interface LibraryTag {
  id: UUID;
  name: string;
}

export interface LibraryTimerConfig {
  libraryEntryId: UUID;
  active: boolean;
  repetitions: number;
}

export interface LibraryTimerPhase {
  id: UUID;
  libraryEntryId: UUID;
  name: string;
  durationSeconds: number;
  colorHex: string;
  sortOrder: number;
}

export interface Termin {
  id: UUID;
  type: TerminTyp;
  label: string;
  date: IsoDate;
  location: string | null;
  description: string | null;
  examinerName: string | null;
  notes: string | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface TerminPhase {
  id: UUID;
  terminId: UUID;
  sortOrder: number;
  name: string;
  durationWeeks: number;
  focusTopic: string | null;
}

export interface TerminCriterion {
  id: UUID;
  terminId: UUID;
  sortOrder: number;
  text: string;
  fulfilled: boolean;
  fulfilledAt: IsoDateTime | null;
}

export interface TerminAthleteAssignment {
  terminId: UUID;
  athleteId: UUID;
  assignedAt: IsoDateTime;
}

export interface TerminTargetBelt {
  terminId: UUID;
  beltRankId: UUID;
}

export interface AiConfig {
  id: 'default';
  provider: AiProvider;
  model: string;
  apiKeyCipher: string | null;
  apiKeyIv: string | null;
  customEndpointUrl: string | null;
  lastConnectionTestAt: IsoDateTime | null;
  lastConnectionTestStatus: 'success' | 'error' | null;
  lastConnectionTestError: string | null;
  updatedAt: IsoDateTime;
}

export interface AiFunctionToggle {
  functionId: AiFunctionId;
  enabled: boolean;
}

export interface AiRecommendation {
  id: UUID;
  context: AiRecContext;
  contextRefId: UUID | null;
  generatedAt: IsoDateTime;
  validUntil: IsoDateTime | null;
  headline: string;
  body: string;
  actionLabel: string | null;
  actionTarget: string | null;
  status: 'pending' | 'accepted' | 'dismissed';
}

export interface AlertThreshold {
  kind: 'low_attendance' | 'no_goals' | 'exam_risk';
  value: string;
}

export interface SyncState {
  isOnline: boolean;
  lastSyncAt: IsoDateTime | null;
  dirty: boolean;
  driveConnected: boolean;
  driveUserEmail: string | null;
}

export interface ToastMessage {
  id: string;
  kind: 'info' | 'success' | 'warn' | 'error';
  text: string;
}
