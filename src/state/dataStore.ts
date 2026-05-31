import { create } from 'zustand';
import * as api from '@/data/repos';
import { dataLoaders, type SliceKey } from '@/data/repos';
import type {
  Athlete, Group, BeltRank, FocusArea, BlockCategory, Goal, Graduation,
  TrainingUnit, TrainingBlock, AttendanceRecord, TrainingUnitTrainer,
  LibraryEntry, LibraryStep, LibraryMaterial, LibraryTimerConfig, LibraryTimerPhase,
  Termin, TerminPhase, TerminCriterion, TerminAthleteAssignment, TerminTargetBelt,
  Trainer, GroupLevel, UnitDuration, UnitStatus, LibraryTyp, LibraryNiveau,
  TerminTyp, GradingEval
} from '@/domain/types';

// ===========================================================================
// Voll-Mirror-Cache (Phase 4): der Store spiegelt alle Tabellen aus Supabase.
// Reads erfolgen synchron aus dem Cache, Writes asynchron über die Supabase-API
// (src/data/repos.ts) mit gezieltem Reload der betroffenen Slices.
// ===========================================================================

interface DataStore {
  ready: boolean;
  athletes: Athlete[];
  groups: Group[];
  beltRanks: BeltRank[];
  focusAreas: FocusArea[];
  blockCategories: BlockCategory[];
  units: TrainingUnit[];
  library: LibraryEntry[];
  termine: Termin[];
  trainers: Trainer[];
  blocks: TrainingBlock[];
  attendance: AttendanceRecord[];
  goals: Goal[];
  graduations: Graduation[];
  unitTrainers: TrainingUnitTrainer[];
  terminPhases: TerminPhase[];
  terminCriteria: TerminCriterion[];
  terminAssignees: TerminAthleteAssignment[];
  terminTargetBelts: TerminTargetBelt[];
  libSteps: LibraryStep[];
  libMaterials: LibraryMaterial[];
  libTimerConfigs: LibraryTimerConfig[];
  libTimerPhases: LibraryTimerPhase[];
  loadAll: () => Promise<void>;
  reload: (key?: SliceKey) => Promise<void>;
}

const EMPTY = {
  athletes: [], groups: [], beltRanks: [], focusAreas: [], blockCategories: [],
  units: [], library: [], termine: [], trainers: [], blocks: [], attendance: [],
  goals: [], graduations: [], unitTrainers: [], terminPhases: [], terminCriteria: [],
  terminAssignees: [], terminTargetBelts: [], libSteps: [], libMaterials: [],
  libTimerConfigs: [], libTimerPhases: []
};

export const useData = create<DataStore>((set) => ({
  ready: false,
  ...EMPTY,
  loadAll: async () => {
    const keys = Object.keys(dataLoaders) as SliceKey[];
    const entries = await Promise.all(keys.map(async (k) => [k, await dataLoaders[k]()] as const));
    set({ ...Object.fromEntries(entries), ready: true } as Partial<DataStore>);
  },
  reload: async (key) => {
    if (!key) { await useData.getState().loadAll(); return; }
    await reloadSlices([key]);
  }
}));

const get = () => useData.getState();

async function reloadSlices(keys: SliceKey[]): Promise<void> {
  const entries = await Promise.all(keys.map(async (k) => [k, await dataLoaders[k]()] as const));
  useData.setState(Object.fromEntries(entries) as Partial<DataStore>);
}

const bySortOrder = <T extends { sortOrder: number }>(a: T, b: T) => a.sortOrder - b.sortOrder;

// ===========================================================================
// Hybrid-Repos: synchrone Reads aus dem Cache, asynchrone Writes via Supabase.
// Signaturen entsprechen denen der bisherigen storage/repos.ts (Reads) – nur
// Writes geben jetzt Promises zurück und müssen mit await aufgerufen werden.
// ===========================================================================

export const groupsRepo = {
  list: (): Group[] => get().groups,
  get: (id: string): Group | null => get().groups.find((g) => g.id === id) ?? null,
  upsert: async (input: { id?: string; name: string; level: GroupLevel; minAge: number; maxAge: number; sortOrder?: number }) => {
    const r = await api.groupsRepo.upsert(input); await reloadSlices(['groups']); return r;
  },
  remove: async (id: string) => { await api.groupsRepo.remove(id); await reloadSlices(['groups']); }
};

export const beltRanksRepo = {
  list: (): BeltRank[] => get().beltRanks,
  get: (id: string): BeltRank | null => get().beltRanks.find((b) => b.id === id) ?? null,
  upsert: async (b: Partial<BeltRank> & { label: string; colorHex: string; colorBorderHex: string }) => {
    const r = await api.beltRanksRepo.upsert(b); await reloadSlices(['beltRanks']); return r;
  },
  remove: async (id: string) => { await api.beltRanksRepo.remove(id); await reloadSlices(['beltRanks']); }
};

export const focusAreasRepo = {
  list: (): FocusArea[] => get().focusAreas,
  upsert: async (f: Partial<FocusArea> & { name: string; colorHex: string; weightPercent: number }) => {
    const r = await api.focusAreasRepo.upsert(f); await reloadSlices(['focusAreas']); return r;
  },
  remove: async (id: string) => { await api.focusAreasRepo.remove(id); await reloadSlices(['focusAreas', 'blockCategories']); }
};

export const blockCategoriesRepo = {
  list: (): BlockCategory[] => get().blockCategories,
  upsert: async (c: Partial<BlockCategory> & { name: string }) => {
    const r = await api.blockCategoriesRepo.upsert(c); await reloadSlices(['blockCategories']); return r;
  },
  remove: async (id: string) => { await api.blockCategoriesRepo.remove(id); await reloadSlices(['blockCategories']); }
};

export const athletesRepo = {
  list: (): Athlete[] => get().athletes,
  byGroup: (groupId: string): Athlete[] => get().athletes.filter((a) => a.groupId === groupId),
  get: (id: string): Athlete | null => get().athletes.find((a) => a.id === id) ?? null,
  upsert: async (a: Partial<Athlete> & { name: string; birthDate: string; groupId: string; beltRankId: string }) => {
    const r = await api.athletesRepo.upsert(a); await reloadSlices(['athletes']); return r;
  },
  remove: async (id: string) => {
    await api.athletesRepo.remove(id);
    await reloadSlices(['athletes', 'goals', 'graduations', 'attendance', 'terminAssignees']);
  }
};

export const goalsRepo = {
  byAthlete: (athleteId: string): Goal[] => get().goals.filter((g) => g.athleteId === athleteId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt)),
  add: async (athleteId: string, text: string) => { const r = await api.goalsRepo.add(athleteId, text); await reloadSlices(['goals']); return r; },
  toggle: async (id: string) => { await api.goalsRepo.toggle(id); await reloadSlices(['goals']); },
  remove: async (id: string) => { await api.goalsRepo.remove(id); await reloadSlices(['goals']); }
};

export const graduationRepo = {
  byAthlete: (athleteId: string): Graduation[] => get().graduations.filter((g) => g.athleteId === athleteId)
    .sort((a, b) => b.date.localeCompare(a.date)),
  add: async (g: { athleteId: string; date: string; fromBeltRankId: string; toBeltRankId: string; evaluation: GradingEval }) => {
    await api.graduationRepo.add(g); await reloadSlices(['graduations', 'athletes']);
  },
  remove: async (id: string) => { await api.graduationRepo.remove(id); await reloadSlices(['graduations']); }
};

export const unitsRepo = {
  list: (): TrainingUnit[] => get().units,
  byWeek: (year: number, week: number): TrainingUnit[] => get().units.filter((u) => u.isoYear === year && u.isoWeek === week),
  byGroup: (groupId: string): TrainingUnit[] => get().units.filter((u) => u.groupId === groupId),
  get: (id: string): TrainingUnit | null => get().units.find((u) => u.id === id) ?? null,
  upsert: async (u: Partial<TrainingUnit> & { date: string; groupId: string; durationMinutes: UnitDuration; status?: UnitStatus }) => {
    const r = await api.unitsRepo.upsert(u); await reloadSlices(['units']); return r;
  },
  remove: async (id: string) => {
    await api.unitsRepo.remove(id);
    await reloadSlices(['units', 'blocks', 'attendance', 'unitTrainers']);
  }
};

export const blocksRepo = {
  byUnit: (unitId: string): TrainingBlock[] => get().blocks.filter((b) => b.trainingUnitId === unitId).sort(bySortOrder),
  upsert: async (b: Partial<TrainingBlock> & { trainingUnitId: string; title: string; categoryId: string; durationMinutes: number; source: 'library' | 'custom' }) => {
    const r = await api.blocksRepo.upsert(b); await reloadSlices(['blocks']); return r;
  },
  move: async (id: string, direction: 'up' | 'down') => { await api.blocksRepo.move(id, direction); await reloadSlices(['blocks']); },
  remove: async (id: string) => { await api.blocksRepo.remove(id); await reloadSlices(['blocks']); }
};

export const trainersRepo = {
  list: (activeOnly = false): Trainer[] => activeOnly ? get().trainers.filter((t) => t.active) : get().trainers,
  get: (id: string): Trainer | null => get().trainers.find((t) => t.id === id) ?? null,
  byUnit: (unitId: string): TrainingUnitTrainer[] => get().unitTrainers.filter((t) => t.trainingUnitId === unitId),
  upsert: async (t: Partial<Trainer> & { name: string }) => { const r = await api.trainersRepo.upsert(t); await reloadSlices(['trainers']); return r; },
  remove: async (id: string) => { await api.trainersRepo.remove(id); await reloadSlices(['trainers', 'unitTrainers']); },
  toggleAssignment: async (unitId: string, trainerId: string) => { await api.trainersRepo.toggleAssignment(unitId, trainerId); await reloadSlices(['unitTrainers']); }
};

export const attendanceRepo = {
  byUnit: (unitId: string): AttendanceRecord[] => get().attendance.filter((r) => r.trainingUnitId === unitId),
  athleteRate: (athleteId: string): { total: number; present: number; rate: number } => {
    const recs = get().attendance.filter((r) => r.athleteId === athleteId && r.present !== null);
    const total = recs.length; const present = recs.filter((r) => r.present === true).length;
    return { total, present, rate: total ? Math.round((present / total) * 100) : 0 };
  },
  set: async (unitId: string, athleteId: string, present: boolean | null) => { await api.attendanceRepo.set(unitId, athleteId, present); await reloadSlices(['attendance']); },
  setMany: async (unitId: string, entries: Array<{ athleteId: string; present: boolean | null }>) => {
    for (const e of entries) await api.attendanceRepo.set(unitId, e.athleteId, e.present);
    await reloadSlices(['attendance']);
  }
};

export const libraryRepo = {
  list: (): LibraryEntry[] => get().library,
  get: (id: string): LibraryEntry | null => get().library.find((e) => e.id === id) ?? null,
  steps: (entryId: string): LibraryStep[] => get().libSteps.filter((s) => s.libraryEntryId === entryId).sort((a, b) => a.stepNumber - b.stepNumber),
  materials: (entryId: string): LibraryMaterial[] => get().libMaterials.filter((m) => m.libraryEntryId === entryId).sort(bySortOrder),
  timer: (entryId: string): { config: LibraryTimerConfig | null; phases: LibraryTimerPhase[] } => ({
    config: get().libTimerConfigs.find((c) => c.libraryEntryId === entryId) ?? null,
    phases: get().libTimerPhases.filter((p) => p.libraryEntryId === entryId).sort(bySortOrder)
  }),
  upsert: async (e: Partial<LibraryEntry> & { type: LibraryTyp; title: string; categoryId: string; niveau: LibraryNiveau }) => {
    const r = await api.libraryRepo.upsert(e); await reloadSlices(['library']); return r;
  },
  remove: async (id: string) => { await api.libraryRepo.remove(id); await reloadSlices(['library', 'blocks']); },
  setSteps: async (entryId: string, steps: { stepNumber: number; text: string }[]) => { await api.libraryRepo.setSteps(entryId, steps); await reloadSlices(['libSteps']); },
  setMaterials: async (entryId: string, materials: string[]) => { await api.libraryRepo.setMaterials(entryId, materials); await reloadSlices(['libMaterials']); },
  setTimer: async (entryId: string, config: { active: boolean; repetitions: number }, phases: Array<{ name: string; durationSeconds: number; colorHex: string }>) => {
    await api.libraryRepo.setTimer(entryId, config, phases); await reloadSlices(['libTimerConfigs', 'libTimerPhases']);
  }
};

export const termineRepo = {
  list: (): Termin[] => get().termine,
  get: (id: string): Termin | null => get().termine.find((t) => t.id === id) ?? null,
  phases: (terminId: string): TerminPhase[] => get().terminPhases.filter((p) => p.terminId === terminId).sort(bySortOrder),
  criteria: (terminId: string): TerminCriterion[] => get().terminCriteria.filter((c) => c.terminId === terminId).sort(bySortOrder),
  assignees: (terminId: string): TerminAthleteAssignment[] => get().terminAssignees.filter((a) => a.terminId === terminId),
  targetBelts: (terminId: string): TerminTargetBelt[] => get().terminTargetBelts.filter((b) => b.terminId === terminId),
  upsert: async (t: Partial<Termin> & { type: TerminTyp; label: string; date: string }) => { const r = await api.termineRepo.upsert(t); await reloadSlices(['termine']); return r; },
  remove: async (id: string) => { await api.termineRepo.remove(id); await reloadSlices(['termine', 'terminPhases', 'terminCriteria', 'terminAssignees', 'terminTargetBelts']); },
  setPhases: async (terminId: string, phases: Array<{ name: string; durationWeeks: number; focusTopic?: string | null }>) => { await api.termineRepo.setPhases(terminId, phases); await reloadSlices(['terminPhases']); },
  addCriterion: async (terminId: string, text: string) => { await api.termineRepo.addCriterion(terminId, text); await reloadSlices(['terminCriteria']); },
  toggleCriterion: async (id: string) => { await api.termineRepo.toggleCriterion(id); await reloadSlices(['terminCriteria']); },
  removeCriterion: async (id: string) => { await api.termineRepo.removeCriterion(id); await reloadSlices(['terminCriteria']); },
  toggleAssignee: async (terminId: string, athleteId: string) => { await api.termineRepo.toggleAssignee(terminId, athleteId); await reloadSlices(['terminAssignees']); },
  setTargetBelts: async (terminId: string, beltIds: string[]) => { await api.termineRepo.setTargetBelts(terminId, beltIds); await reloadSlices(['terminTargetBelts']); }
};

// ===========================================================================
// Statistiken: reine synchrone Derivationen über den Cache (ersetzen die
// frühere SQL-Aggregation in storage/repos.ts statsRepo).
// ===========================================================================
type FocusDistRow = { focusAreaId: string; name: string; colorHex: string; minutes: number };

export const statsRepo = {
  weekFocusDistribution: (isoYear: number, isoWeek: number): FocusDistRow[] => {
    const { focusAreas, blockCategories, blocks, units } = get();
    const weekUnitIds = new Set(units.filter((u) => u.isoYear === isoYear && u.isoWeek === isoWeek).map((u) => u.id));
    const catToFa = new Map(blockCategories.map((c) => [c.id, c.focusAreaId]));
    const minutes: Record<string, number> = {};
    for (const b of blocks) {
      if (!weekUnitIds.has(b.trainingUnitId)) continue;
      const faId = catToFa.get(b.categoryId);
      if (!faId) continue;
      minutes[faId] = (minutes[faId] ?? 0) + b.durationMinutes;
    }
    return [...focusAreas].sort(bySortOrder).map((fa) => ({ focusAreaId: fa.id, name: fa.name, colorHex: fa.colorHex, minutes: minutes[fa.id] ?? 0 }));
  },
  unitFocusDistribution: (unitId: string): FocusDistRow[] => {
    const { focusAreas, blockCategories, blocks } = get();
    const catToFa = new Map(blockCategories.map((c) => [c.id, c.focusAreaId]));
    const minutes: Record<string, number> = {};
    for (const b of blocks) {
      if (b.trainingUnitId !== unitId) continue;
      const faId = catToFa.get(b.categoryId);
      if (!faId) continue;
      minutes[faId] = (minutes[faId] ?? 0) + b.durationMinutes;
    }
    return [...focusAreas].sort(bySortOrder)
      .filter((fa) => minutes[fa.id] !== undefined)
      .map((fa) => ({ focusAreaId: fa.id, name: fa.name, colorHex: fa.colorHex, minutes: minutes[fa.id] }));
  },
  weekStatusCount: (isoYear: number, isoWeek: number): { planned: number; done: number; cancelled: number } => {
    const wk = get().units.filter((u) => u.isoYear === isoYear && u.isoWeek === isoWeek);
    return {
      planned: wk.filter((u) => u.status === 'geplant').length,
      done: wk.filter((u) => u.status === 'durchgeführt').length,
      cancelled: wk.filter((u) => u.status === 'ausgefallen').length
    };
  },
  athleteAttendanceRates: (): { athleteId: string; total: number; present: number; rate: number }[] => {
    const acc: Record<string, { total: number; present: number }> = {};
    for (const r of get().attendance) {
      if (r.present === null) continue;
      const a = (acc[r.athleteId] ??= { total: 0, present: 0 });
      a.total++; if (r.present === true) a.present++;
    }
    return Object.entries(acc).map(([athleteId, v]) => ({ athleteId, total: v.total, present: v.present, rate: v.total ? Math.round((v.present / v.total) * 100) : 0 }));
  },
  terminReadiness: (terminId: string): { total: number; fulfilled: number; pct: number } => {
    const crit = get().terminCriteria.filter((c) => c.terminId === terminId);
    const total = crit.length; const fulfilled = crit.filter((c) => c.fulfilled).length;
    return { total, fulfilled, pct: total ? Math.round((fulfilled / total) * 100) : 0 };
  }
};
