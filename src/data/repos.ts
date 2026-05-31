// Async Datenzugriffs-Schicht über die Supabase-API (PostgREST via supabase-js).
// Spiegelt bewusst die Signaturen von src/storage/repos.ts, gibt aber Promises zurück.
//
// Phase 3 der Supabase-Migration: additiv – wird in Phase 4/5 verdrahtet.
// Hinweise:
//   * created_at/updated_at werden von DB-Defaults + Trigger gepflegt -> nicht senden.
//   * Booleans/Datumswerte kommen aus Postgres bereits korrekt typisiert zurück.
//   * statsRepo wird NICHT hier gespiegelt -> in Phase 4 als clientseitige Derivation.
//   * KI-Repos (aiConfig/recommendations) entfallen ersatzlos (KI entfernt).

import { supabase } from '@/lib/supabaseClient';
import { uuid, nowIso, weekdayOf, isoWeek } from '@/domain/derivations';
import type {
  Athlete, Group, BeltRank, FocusArea, BlockCategory, Goal, Graduation,
  TrainingUnit, TrainingBlock, AttendanceRecord,
  LibraryEntry, LibraryStep, LibraryMaterial, LibraryTimerConfig, LibraryTimerPhase,
  Termin, TerminPhase, TerminCriterion, TerminAthleteAssignment, TerminTargetBelt,
  UnitStatus, UnitDuration, GroupLevel,
  LibraryTyp, LibraryNiveau, TerminTyp, GradingEval,
  Trainer, TrainingUnitTrainer
} from '@/domain/types';

// --- kleiner Helfer: Fehler werfen statt still schlucken -------------------
function check<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

// ===========================================================================
// Mapper row(snake_case) -> Domain(camelCase)
// ===========================================================================
const toGroup = (r: any): Group => ({
  id: r.id, name: r.name, level: r.level, minAge: r.min_age, maxAge: r.max_age,
  sortOrder: r.sort_order, createdAt: r.created_at, updatedAt: r.updated_at
});
const toBelt = (r: any): BeltRank => ({
  id: r.id, label: r.label, colorName: r.color_name, colorHex: r.color_hex,
  colorBorderHex: r.color_border_hex, textColorHex: r.text_color_hex,
  sortOrder: r.sort_order, isDan: r.is_dan, createdAt: r.created_at, updatedAt: r.updated_at
});
const toFocus = (r: any): FocusArea => ({
  id: r.id, name: r.name, colorHex: r.color_hex, weightPercent: r.weight_percent,
  sortOrder: r.sort_order, isMain: r.is_main, createdAt: r.created_at, updatedAt: r.updated_at
});
const toCategory = (r: any): BlockCategory => ({
  id: r.id, name: r.name, focusAreaId: r.focus_area_id, sortOrder: r.sort_order
});
const toAthlete = (r: any): Athlete => ({
  id: r.id, name: r.name, birthDate: r.birth_date, groupId: r.group_id,
  beltRankId: r.belt_rank_id, trainerNote: r.trainer_note ?? null,
  createdAt: r.created_at, updatedAt: r.updated_at
});
const toGoal = (r: any): Goal => ({
  id: r.id, athleteId: r.athlete_id, text: r.text, achieved: r.achieved,
  achievedAt: r.achieved_at, sortOrder: r.sort_order, createdAt: r.created_at, updatedAt: r.updated_at
});
const toGraduation = (r: any): Graduation => ({
  id: r.id, athleteId: r.athlete_id, date: r.date, fromBeltRankId: r.from_belt_rank_id,
  toBeltRankId: r.to_belt_rank_id, evaluation: r.evaluation, createdAt: r.created_at
});
const toUnit = (r: any): TrainingUnit => ({
  id: r.id, date: r.date, weekday: r.weekday, isoYear: r.iso_year, isoWeek: r.iso_week,
  groupId: r.group_id, durationMinutes: r.duration_minutes, status: r.status,
  title: r.title ?? null, createdAt: r.created_at, updatedAt: r.updated_at
});
const toBlock = (r: any): TrainingBlock => ({
  id: r.id, trainingUnitId: r.training_unit_id, sortOrder: r.sort_order, title: r.title,
  categoryId: r.category_id, durationMinutes: r.duration_minutes, iconEmoji: r.icon_emoji ?? null,
  note: r.note ?? null, source: r.source, sourceLibraryEntryId: r.source_library_entry_id ?? null,
  createdAt: r.created_at, updatedAt: r.updated_at
});
const toTrainer = (r: any): Trainer => ({
  id: r.id, name: r.name, role: r.role, colorHex: r.color_hex, active: r.active,
  sortOrder: r.sort_order, createdAt: r.created_at, updatedAt: r.updated_at
});
const toAttendance = (r: any): AttendanceRecord => ({
  id: r.id, trainingUnitId: r.training_unit_id, athleteId: r.athlete_id,
  present: r.present, recordedAt: r.recorded_at
});
const toLib = (r: any): LibraryEntry => ({
  id: r.id, type: r.type, title: r.title, categoryId: r.category_id, niveau: r.niveau,
  description: r.description ?? null, youtubeVideoId: r.youtube_video_id ?? null,
  durationMinutes: r.duration_minutes, source: r.source,
  createdFromUnitId: r.created_from_unit_id ?? null, createdAt: r.created_at, updatedAt: r.updated_at
});
const toTermin = (r: any): Termin => ({
  id: r.id, type: r.type, label: r.label, date: r.date, location: r.location ?? null,
  description: r.description ?? null, examinerName: r.examiner_name ?? null,
  notes: r.notes ?? null, createdAt: r.created_at, updatedAt: r.updated_at
});

// ===========================================================================
// Stammdaten
// ===========================================================================
export const groupsRepo = {
  async list(): Promise<Group[]> {
    const rows = check(await supabase.from('groups').select('*').order('sort_order').order('name'));
    return rows.map(toGroup);
  },
  async get(id: string): Promise<Group | null> {
    const rows = check(await supabase.from('groups').select('*').eq('id', id).limit(1));
    return rows[0] ? toGroup(rows[0]) : null;
  },
  async upsert(input: { id?: string; name: string; level: GroupLevel; minAge: number; maxAge: number; sortOrder?: number }): Promise<Group> {
    const id = input.id ?? uuid();
    const existing = input.id ? await this.get(id) : null;
    const row = {
      id, name: input.name, level: input.level, min_age: input.minAge, max_age: input.maxAge,
      sort_order: input.sortOrder ?? existing?.sortOrder ?? 0
    };
    if (existing) {
      return toGroup(check(await supabase.from('groups').update(row).eq('id', id).select().single()));
    }
    return toGroup(check(await supabase.from('groups').insert(row).select().single()));
  },
  async remove(id: string): Promise<void> { check(await supabase.from('groups').delete().eq('id', id)); }
};

export const beltRanksRepo = {
  async list(): Promise<BeltRank[]> {
    return check(await supabase.from('belt_ranks').select('*').order('sort_order')).map(toBelt);
  },
  async get(id: string): Promise<BeltRank | null> {
    const rows = check(await supabase.from('belt_ranks').select('*').eq('id', id).limit(1));
    return rows[0] ? toBelt(rows[0]) : null;
  },
  async upsert(b: Partial<BeltRank> & { label: string; colorHex: string; colorBorderHex: string }): Promise<BeltRank> {
    const id = b.id ?? uuid();
    const exists = b.id ? await this.get(id) : null;
    const row = {
      id, label: b.label, color_name: b.colorName ?? exists?.colorName ?? b.label,
      color_hex: b.colorHex, color_border_hex: b.colorBorderHex,
      text_color_hex: b.textColorHex ?? exists?.textColorHex ?? null,
      sort_order: b.sortOrder ?? exists?.sortOrder ?? 0, is_dan: b.isDan ?? exists?.isDan ?? false
    };
    if (exists) return toBelt(check(await supabase.from('belt_ranks').update(row).eq('id', id).select().single()));
    return toBelt(check(await supabase.from('belt_ranks').insert(row).select().single()));
  },
  async remove(id: string): Promise<void> { check(await supabase.from('belt_ranks').delete().eq('id', id)); }
};

export const focusAreasRepo = {
  async list(): Promise<FocusArea[]> {
    return check(await supabase.from('focus_areas').select('*').order('sort_order')).map(toFocus);
  },
  async upsert(f: Partial<FocusArea> & { name: string; colorHex: string; weightPercent: number }): Promise<FocusArea> {
    const id = f.id ?? uuid();
    const exists = f.id ? check(await supabase.from('focus_areas').select('*').eq('id', id).limit(1))[0] : null;
    const row = {
      id, name: f.name, color_hex: f.colorHex, weight_percent: f.weightPercent,
      sort_order: f.sortOrder ?? exists?.sort_order ?? 0, is_main: f.isMain ?? exists?.is_main ?? true
    };
    if (exists) return toFocus(check(await supabase.from('focus_areas').update(row).eq('id', id).select().single()));
    return toFocus(check(await supabase.from('focus_areas').insert(row).select().single()));
  },
  async remove(id: string): Promise<void> { check(await supabase.from('focus_areas').delete().eq('id', id)); }
};

export const blockCategoriesRepo = {
  async list(): Promise<BlockCategory[]> {
    return check(await supabase.from('block_categories').select('*').order('sort_order').order('name')).map(toCategory);
  },
  async upsert(c: Partial<BlockCategory> & { name: string }): Promise<BlockCategory> {
    const id = c.id ?? uuid();
    const exists = c.id ? check(await supabase.from('block_categories').select('*').eq('id', id).limit(1))[0] : null;
    const row = { id, name: c.name, focus_area_id: c.focusAreaId ?? exists?.focus_area_id ?? null, sort_order: c.sortOrder ?? exists?.sort_order ?? 0 };
    if (exists) return toCategory(check(await supabase.from('block_categories').update(row).eq('id', id).select().single()));
    return toCategory(check(await supabase.from('block_categories').insert(row).select().single()));
  },
  async remove(id: string): Promise<void> { check(await supabase.from('block_categories').delete().eq('id', id)); }
};

// ===========================================================================
// Athleten
// ===========================================================================
export const athletesRepo = {
  async list(): Promise<Athlete[]> {
    return check(await supabase.from('athletes').select('*').order('name')).map(toAthlete);
  },
  async byGroup(groupId: string): Promise<Athlete[]> {
    return check(await supabase.from('athletes').select('*').eq('group_id', groupId).order('name')).map(toAthlete);
  },
  async get(id: string): Promise<Athlete | null> {
    const rows = check(await supabase.from('athletes').select('*').eq('id', id).limit(1));
    return rows[0] ? toAthlete(rows[0]) : null;
  },
  async upsert(a: Partial<Athlete> & { name: string; birthDate: string; groupId: string; beltRankId: string }): Promise<Athlete> {
    const id = a.id ?? uuid();
    const exists = a.id ? await this.get(id) : null;
    const row = { id, name: a.name, birth_date: a.birthDate, group_id: a.groupId, belt_rank_id: a.beltRankId, trainer_note: a.trainerNote ?? null };
    if (exists) return toAthlete(check(await supabase.from('athletes').update(row).eq('id', id).select().single()));
    return toAthlete(check(await supabase.from('athletes').insert(row).select().single()));
  },
  async remove(id: string): Promise<void> { check(await supabase.from('athletes').delete().eq('id', id)); }
};

export const goalsRepo = {
  async byAthlete(athleteId: string): Promise<Goal[]> {
    return check(await supabase.from('goals').select('*').eq('athlete_id', athleteId).order('sort_order').order('created_at')).map(toGoal);
  },
  async add(athleteId: string, text: string): Promise<Goal> {
    const current = await this.byAthlete(athleteId);
    const sortOrder = current.reduce((m, g) => Math.max(m, g.sortOrder), -1) + 1;
    const row = { id: uuid(), athlete_id: athleteId, text, achieved: false, achieved_at: null, sort_order: sortOrder };
    return toGoal(check(await supabase.from('goals').insert(row).select().single()));
  },
  async toggle(id: string): Promise<void> {
    const cur: any = check(await supabase.from('goals').select('achieved').eq('id', id).single());
    const achieved = !cur.achieved;
    check(await supabase.from('goals').update({ achieved, achieved_at: achieved ? nowIso() : null }).eq('id', id));
  },
  async remove(id: string): Promise<void> { check(await supabase.from('goals').delete().eq('id', id)); }
};

export const graduationRepo = {
  async byAthlete(athleteId: string): Promise<Graduation[]> {
    return check(await supabase.from('graduation_history').select('*').eq('athlete_id', athleteId).order('date', { ascending: false })).map(toGraduation);
  },
  async add(g: { athleteId: string; date: string; fromBeltRankId: string; toBeltRankId: string; evaluation: GradingEval }): Promise<void> {
    // Mehrschrittig (keine echte Transaktion via REST). Bei Bedarf später als RPC absichern.
    check(await supabase.from('graduation_history').insert({
      id: uuid(), athlete_id: g.athleteId, date: g.date,
      from_belt_rank_id: g.fromBeltRankId, to_belt_rank_id: g.toBeltRankId, evaluation: g.evaluation
    }));
    if (g.evaluation !== 'Nicht bestanden') {
      check(await supabase.from('athletes').update({ belt_rank_id: g.toBeltRankId }).eq('id', g.athleteId));
    }
  },
  async remove(id: string): Promise<void> { check(await supabase.from('graduation_history').delete().eq('id', id)); }
};

// ===========================================================================
// Planung
// ===========================================================================
export const unitsRepo = {
  async list(): Promise<TrainingUnit[]> {
    return check(await supabase.from('training_units').select('*').order('date')).map(toUnit);
  },
  async byWeek(year: number, week: number): Promise<TrainingUnit[]> {
    return check(await supabase.from('training_units').select('*').eq('iso_year', year).eq('iso_week', week).order('date')).map(toUnit);
  },
  async byGroup(groupId: string): Promise<TrainingUnit[]> {
    return check(await supabase.from('training_units').select('*').eq('group_id', groupId).order('date')).map(toUnit);
  },
  async get(id: string): Promise<TrainingUnit | null> {
    const rows = check(await supabase.from('training_units').select('*').eq('id', id).limit(1));
    return rows[0] ? toUnit(rows[0]) : null;
  },
  async upsert(u: Partial<TrainingUnit> & { date: string; groupId: string; durationMinutes: UnitDuration; status?: UnitStatus }): Promise<TrainingUnit> {
    const id = u.id ?? uuid();
    const wd = weekdayOf(u.date); const { year, week } = isoWeek(u.date);
    const exists = u.id ? await this.get(id) : null;
    const row = {
      id, date: u.date, weekday: wd, iso_year: year, iso_week: week, group_id: u.groupId,
      duration_minutes: u.durationMinutes, status: u.status ?? exists?.status ?? 'geplant', title: u.title ?? null
    };
    if (exists) return toUnit(check(await supabase.from('training_units').update(row).eq('id', id).select().single()));
    return toUnit(check(await supabase.from('training_units').insert(row).select().single()));
  },
  async remove(id: string): Promise<void> { check(await supabase.from('training_units').delete().eq('id', id)); }
};

export const blocksRepo = {
  async byUnit(unitId: string): Promise<TrainingBlock[]> {
    return check(await supabase.from('training_blocks').select('*').eq('training_unit_id', unitId).order('sort_order')).map(toBlock);
  },
  async upsert(b: Partial<TrainingBlock> & { trainingUnitId: string; title: string; categoryId: string; durationMinutes: number; source: 'library' | 'custom' }): Promise<TrainingBlock> {
    const id = b.id ?? uuid();
    const exists = b.id ? check(await supabase.from('training_blocks').select('*').eq('id', id).limit(1))[0] : null;
    let sortOrder = b.sortOrder ?? exists?.sort_order;
    if (sortOrder === undefined) {
      const sibs = await this.byUnit(b.trainingUnitId);
      sortOrder = sibs.reduce((m, s) => Math.max(m, s.sortOrder), -1) + 1;
    }
    const row = {
      id, training_unit_id: b.trainingUnitId, sort_order: sortOrder, title: b.title,
      category_id: b.categoryId, duration_minutes: b.durationMinutes, icon_emoji: b.iconEmoji ?? null,
      note: b.note ?? null, source: b.source, source_library_entry_id: b.sourceLibraryEntryId ?? null
    };
    if (exists) return toBlock(check(await supabase.from('training_blocks').update(row).eq('id', id).select().single()));
    return toBlock(check(await supabase.from('training_blocks').insert(row).select().single()));
  },
  async move(id: string, direction: 'up' | 'down'): Promise<void> {
    const row = check(await supabase.from('training_blocks').select('*').eq('id', id).limit(1))[0];
    if (!row) return;
    const siblings = await this.byUnit(row.training_unit_id);
    const idx = siblings.findIndex((s) => s.id === id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= siblings.length) return;
    const other = siblings[swapIdx];
    check(await supabase.from('training_blocks').update({ sort_order: other.sortOrder }).eq('id', id));
    check(await supabase.from('training_blocks').update({ sort_order: siblings[idx].sortOrder }).eq('id', other.id));
  },
  async remove(id: string): Promise<void> { check(await supabase.from('training_blocks').delete().eq('id', id)); }
};

export const trainersRepo = {
  async list(activeOnly = false): Promise<Trainer[]> {
    let q = supabase.from('trainers').select('*');
    if (activeOnly) q = q.eq('active', true);
    return check(await q.order('sort_order').order('name')).map(toTrainer);
  },
  async get(id: string): Promise<Trainer | null> {
    const rows = check(await supabase.from('trainers').select('*').eq('id', id).limit(1));
    return rows[0] ? toTrainer(rows[0]) : null;
  },
  async upsert(t: Partial<Trainer> & { name: string }): Promise<Trainer> {
    const id = t.id ?? uuid();
    const exists = t.id ? await this.get(id) : null;
    const row = {
      id, name: t.name, role: t.role ?? null, color_hex: t.colorHex ?? null,
      active: t.active ?? exists?.active ?? true, sort_order: t.sortOrder ?? exists?.sortOrder ?? 0
    };
    if (exists) return toTrainer(check(await supabase.from('trainers').update(row).eq('id', id).select().single()));
    return toTrainer(check(await supabase.from('trainers').insert(row).select().single()));
  },
  async remove(id: string): Promise<void> { check(await supabase.from('trainers').delete().eq('id', id)); },
  async byUnit(unitId: string): Promise<TrainingUnitTrainer[]> {
    return check(await supabase.from('training_unit_trainers').select('*').eq('training_unit_id', unitId))
      .map((r: any) => ({ trainingUnitId: r.training_unit_id, trainerId: r.trainer_id, assignedAt: r.assigned_at }));
  },
  async toggleAssignment(unitId: string, trainerId: string): Promise<void> {
    const existing = check(await supabase.from('training_unit_trainers').select('*').eq('training_unit_id', unitId).eq('trainer_id', trainerId).limit(1))[0];
    if (existing) check(await supabase.from('training_unit_trainers').delete().eq('training_unit_id', unitId).eq('trainer_id', trainerId));
    else check(await supabase.from('training_unit_trainers').insert({ training_unit_id: unitId, trainer_id: trainerId, assigned_at: nowIso() }));
  }
};

export const attendanceRepo = {
  async byUnit(unitId: string): Promise<AttendanceRecord[]> {
    return check(await supabase.from('attendance_records').select('*').eq('training_unit_id', unitId)).map(toAttendance);
  },
  async set(unitId: string, athleteId: string, present: boolean | null): Promise<void> {
    const existing = check(await supabase.from('attendance_records').select('id').eq('training_unit_id', unitId).eq('athlete_id', athleteId).limit(1))[0];
    if (existing) check(await supabase.from('attendance_records').update({ present, recorded_at: nowIso() }).eq('id', existing.id));
    else check(await supabase.from('attendance_records').insert({ id: uuid(), training_unit_id: unitId, athlete_id: athleteId, present, recorded_at: nowIso() }));
  },
  async athleteRate(athleteId: string): Promise<{ total: number; present: number; rate: number }> {
    const rows = check(await supabase.from('attendance_records').select('present').eq('athlete_id', athleteId).not('present', 'is', null));
    const total = rows.length;
    const present = rows.filter((r: any) => r.present === true).length;
    return { total, present, rate: total ? Math.round((present / total) * 100) : 0 };
  }
};

// ===========================================================================
// Bibliothek
// ===========================================================================
export const libraryRepo = {
  async list(): Promise<LibraryEntry[]> {
    return check(await supabase.from('library_entries').select('*').order('title')).map(toLib);
  },
  async get(id: string): Promise<LibraryEntry | null> {
    const rows = check(await supabase.from('library_entries').select('*').eq('id', id).limit(1));
    return rows[0] ? toLib(rows[0]) : null;
  },
  async upsert(e: Partial<LibraryEntry> & { type: LibraryTyp; title: string; categoryId: string; niveau: LibraryNiveau }): Promise<LibraryEntry> {
    const id = e.id ?? uuid();
    const exists = e.id ? await this.get(id) : null;
    const row = {
      id, type: e.type, title: e.title, category_id: e.categoryId, niveau: e.niveau,
      description: e.description ?? null, youtube_video_id: e.youtubeVideoId ?? null,
      duration_minutes: e.durationMinutes ?? 0, source: e.source ?? exists?.source ?? 'manual',
      created_from_unit_id: e.createdFromUnitId ?? exists?.createdFromUnitId ?? null
    };
    if (exists) return toLib(check(await supabase.from('library_entries').update(row).eq('id', id).select().single()));
    return toLib(check(await supabase.from('library_entries').insert(row).select().single()));
  },
  async remove(id: string): Promise<void> { check(await supabase.from('library_entries').delete().eq('id', id)); },

  async steps(entryId: string): Promise<LibraryStep[]> {
    return check(await supabase.from('library_steps').select('*').eq('library_entry_id', entryId).order('step_number'))
      .map((r: any) => ({ id: r.id, libraryEntryId: r.library_entry_id, stepNumber: r.step_number, text: r.text }));
  },
  async setSteps(entryId: string, steps: { stepNumber: number; text: string }[]): Promise<void> {
    check(await supabase.from('library_steps').delete().eq('library_entry_id', entryId));
    if (steps.length) check(await supabase.from('library_steps').insert(steps.map((s) => ({ id: uuid(), library_entry_id: entryId, step_number: s.stepNumber, text: s.text }))));
  },
  async materials(entryId: string): Promise<LibraryMaterial[]> {
    return check(await supabase.from('library_materials').select('*').eq('library_entry_id', entryId).order('sort_order'))
      .map((r: any) => ({ id: r.id, libraryEntryId: r.library_entry_id, text: r.text, sortOrder: r.sort_order }));
  },
  async setMaterials(entryId: string, materials: string[]): Promise<void> {
    check(await supabase.from('library_materials').delete().eq('library_entry_id', entryId));
    if (materials.length) check(await supabase.from('library_materials').insert(materials.map((t, i) => ({ id: uuid(), library_entry_id: entryId, text: t, sort_order: i }))));
  },
  async timer(entryId: string): Promise<{ config: LibraryTimerConfig | null; phases: LibraryTimerPhase[] }> {
    const c = check(await supabase.from('library_timer_configs').select('*').eq('library_entry_id', entryId).limit(1))[0];
    const p = check(await supabase.from('library_timer_phases').select('*').eq('library_entry_id', entryId).order('sort_order'))
      .map((r: any) => ({ id: r.id, libraryEntryId: r.library_entry_id, name: r.name, durationSeconds: r.duration_seconds, colorHex: r.color_hex, sortOrder: r.sort_order }));
    return { config: c ? { libraryEntryId: c.library_entry_id, active: c.active, repetitions: c.repetitions } : null, phases: p };
  },
  async setTimer(entryId: string, config: { active: boolean; repetitions: number }, phases: Array<{ name: string; durationSeconds: number; colorHex: string }>): Promise<void> {
    check(await supabase.from('library_timer_configs').upsert({ library_entry_id: entryId, active: config.active, repetitions: config.repetitions }));
    check(await supabase.from('library_timer_phases').delete().eq('library_entry_id', entryId));
    if (phases.length) check(await supabase.from('library_timer_phases').insert(phases.map((p, i) => ({ id: uuid(), library_entry_id: entryId, name: p.name, duration_seconds: p.durationSeconds, color_hex: p.colorHex, sort_order: i }))));
  }
};

// ===========================================================================
// Prüfungen / Wettkämpfe
// ===========================================================================
export const termineRepo = {
  async list(): Promise<Termin[]> {
    return check(await supabase.from('exams_tournaments').select('*').order('date')).map(toTermin);
  },
  async get(id: string): Promise<Termin | null> {
    const rows = check(await supabase.from('exams_tournaments').select('*').eq('id', id).limit(1));
    return rows[0] ? toTermin(rows[0]) : null;
  },
  async upsert(t: Partial<Termin> & { type: TerminTyp; label: string; date: string }): Promise<Termin> {
    const id = t.id ?? uuid();
    const exists = t.id ? await this.get(id) : null;
    const row = {
      id, type: t.type, label: t.label, date: t.date, location: t.location ?? null,
      description: t.description ?? null, examiner_name: t.examinerName ?? null, notes: t.notes ?? null
    };
    if (exists) return toTermin(check(await supabase.from('exams_tournaments').update(row).eq('id', id).select().single()));
    return toTermin(check(await supabase.from('exams_tournaments').insert(row).select().single()));
  },
  async remove(id: string): Promise<void> { check(await supabase.from('exams_tournaments').delete().eq('id', id)); },

  async phases(terminId: string): Promise<TerminPhase[]> {
    return check(await supabase.from('termin_phases').select('*').eq('termin_id', terminId).order('sort_order'))
      .map((r: any) => ({ id: r.id, terminId: r.termin_id, sortOrder: r.sort_order, name: r.name, durationWeeks: r.duration_weeks, focusTopic: r.focus_topic }));
  },
  async setPhases(terminId: string, phases: Array<{ name: string; durationWeeks: number; focusTopic?: string | null }>): Promise<void> {
    check(await supabase.from('termin_phases').delete().eq('termin_id', terminId));
    if (phases.length) check(await supabase.from('termin_phases').insert(phases.map((p, i) => ({ id: uuid(), termin_id: terminId, sort_order: i, name: p.name, duration_weeks: p.durationWeeks, focus_topic: p.focusTopic ?? null }))));
  },
  async criteria(terminId: string): Promise<TerminCriterion[]> {
    return check(await supabase.from('termin_criteria').select('*').eq('termin_id', terminId).order('sort_order'))
      .map((r: any) => ({ id: r.id, terminId: r.termin_id, sortOrder: r.sort_order, text: r.text, fulfilled: r.fulfilled, fulfilledAt: r.fulfilled_at }));
  },
  async addCriterion(terminId: string, text: string): Promise<void> {
    const cur = await this.criteria(terminId);
    const sortOrder = cur.reduce((m, c) => Math.max(m, c.sortOrder), -1) + 1;
    check(await supabase.from('termin_criteria').insert({ id: uuid(), termin_id: terminId, sort_order: sortOrder, text, fulfilled: false, fulfilled_at: null }));
  },
  async toggleCriterion(id: string): Promise<void> {
    const cur: any = check(await supabase.from('termin_criteria').select('fulfilled').eq('id', id).single());
    const fulfilled = !cur.fulfilled;
    check(await supabase.from('termin_criteria').update({ fulfilled, fulfilled_at: fulfilled ? nowIso() : null }).eq('id', id));
  },
  async removeCriterion(id: string): Promise<void> { check(await supabase.from('termin_criteria').delete().eq('id', id)); },
  async assignees(terminId: string): Promise<TerminAthleteAssignment[]> {
    return check(await supabase.from('termin_athlete_assignments').select('*').eq('termin_id', terminId))
      .map((r: any) => ({ terminId: r.termin_id, athleteId: r.athlete_id, assignedAt: r.assigned_at }));
  },
  async toggleAssignee(terminId: string, athleteId: string): Promise<void> {
    const existing = check(await supabase.from('termin_athlete_assignments').select('termin_id').eq('termin_id', terminId).eq('athlete_id', athleteId).limit(1))[0];
    if (existing) check(await supabase.from('termin_athlete_assignments').delete().eq('termin_id', terminId).eq('athlete_id', athleteId));
    else check(await supabase.from('termin_athlete_assignments').insert({ termin_id: terminId, athlete_id: athleteId, assigned_at: nowIso() }));
  },
  async targetBelts(terminId: string): Promise<TerminTargetBelt[]> {
    return check(await supabase.from('termin_target_belts').select('*').eq('termin_id', terminId))
      .map((r: any) => ({ terminId: r.termin_id, beltRankId: r.belt_rank_id }));
  },
  async setTargetBelts(terminId: string, beltIds: string[]): Promise<void> {
    check(await supabase.from('termin_target_belts').delete().eq('termin_id', terminId));
    if (beltIds.length) check(await supabase.from('termin_target_belts').insert(beltIds.map((b) => ({ termin_id: terminId, belt_rank_id: b }))));
  }
};

// ===========================================================================
// App-Status / Einstellungen (key/value)
// ===========================================================================
export const appStateRepo = {
  async get(key: string): Promise<string | null> {
    const rows = check(await supabase.from('app_state').select('value').eq('key', key).limit(1));
    return rows[0] ? (rows[0].value as string) : null;
  },
  async set(key: string, value: string): Promise<void> {
    check(await supabase.from('app_state').upsert({ key, value }));
  }
};

export const settingsRepo = {
  async get(key: string): Promise<string | null> {
    const rows = check(await supabase.from('settings').select('value').eq('key', key).limit(1));
    return rows[0] ? (rows[0].value as string) : null;
  },
  async set(key: string, value: string): Promise<void> {
    check(await supabase.from('settings').upsert({ key, value }));
  }
};

// ===========================================================================
// Bulk-Loader für die Cache-Hydration (Phase 4). Jeder Loader liest EINE Tabelle
// komplett und mappt nach Domain. Der zustand-Store ruft diese beim Start (loadAll)
// und gezielt nach Schreibvorgängen (reload) auf.
// ===========================================================================
export const dataLoaders = {
  athletes: async () => check(await supabase.from('athletes').select('*').order('name')).map(toAthlete),
  groups: async () => check(await supabase.from('groups').select('*').order('sort_order').order('name')).map(toGroup),
  beltRanks: async () => check(await supabase.from('belt_ranks').select('*').order('sort_order')).map(toBelt),
  focusAreas: async () => check(await supabase.from('focus_areas').select('*').order('sort_order')).map(toFocus),
  blockCategories: async () => check(await supabase.from('block_categories').select('*').order('sort_order').order('name')).map(toCategory),
  units: async () => check(await supabase.from('training_units').select('*').order('date')).map(toUnit),
  library: async () => check(await supabase.from('library_entries').select('*').order('title')).map(toLib),
  termine: async () => check(await supabase.from('exams_tournaments').select('*').order('date')).map(toTermin),
  trainers: async () => check(await supabase.from('trainers').select('*').order('sort_order').order('name')).map(toTrainer),
  blocks: async () => check(await supabase.from('training_blocks').select('*').order('sort_order')).map(toBlock),
  attendance: async () => check(await supabase.from('attendance_records').select('*')).map(toAttendance),
  goals: async () => check(await supabase.from('goals').select('*').order('sort_order').order('created_at')).map(toGoal),
  graduations: async () => check(await supabase.from('graduation_history').select('*').order('date', { ascending: false })).map(toGraduation),
  unitTrainers: async () => check(await supabase.from('training_unit_trainers').select('*'))
    .map((r: any) => ({ trainingUnitId: r.training_unit_id, trainerId: r.trainer_id, assignedAt: r.assigned_at })),
  terminPhases: async () => check(await supabase.from('termin_phases').select('*').order('sort_order'))
    .map((r: any) => ({ id: r.id, terminId: r.termin_id, sortOrder: r.sort_order, name: r.name, durationWeeks: r.duration_weeks, focusTopic: r.focus_topic })),
  terminCriteria: async () => check(await supabase.from('termin_criteria').select('*').order('sort_order'))
    .map((r: any) => ({ id: r.id, terminId: r.termin_id, sortOrder: r.sort_order, text: r.text, fulfilled: r.fulfilled, fulfilledAt: r.fulfilled_at })),
  terminAssignees: async () => check(await supabase.from('termin_athlete_assignments').select('*'))
    .map((r: any) => ({ terminId: r.termin_id, athleteId: r.athlete_id, assignedAt: r.assigned_at })),
  terminTargetBelts: async () => check(await supabase.from('termin_target_belts').select('*'))
    .map((r: any) => ({ terminId: r.termin_id, beltRankId: r.belt_rank_id })),
  libSteps: async () => check(await supabase.from('library_steps').select('*').order('step_number'))
    .map((r: any) => ({ id: r.id, libraryEntryId: r.library_entry_id, stepNumber: r.step_number, text: r.text })),
  libMaterials: async () => check(await supabase.from('library_materials').select('*').order('sort_order'))
    .map((r: any) => ({ id: r.id, libraryEntryId: r.library_entry_id, text: r.text, sortOrder: r.sort_order })),
  libTimerConfigs: async () => check(await supabase.from('library_timer_configs').select('*'))
    .map((r: any) => ({ libraryEntryId: r.library_entry_id, active: r.active, repetitions: r.repetitions })),
  libTimerPhases: async () => check(await supabase.from('library_timer_phases').select('*').order('sort_order'))
    .map((r: any) => ({ id: r.id, libraryEntryId: r.library_entry_id, name: r.name, durationSeconds: r.duration_seconds, colorHex: r.color_hex, sortOrder: r.sort_order }))
};

export type SliceKey = keyof typeof dataLoaders;
