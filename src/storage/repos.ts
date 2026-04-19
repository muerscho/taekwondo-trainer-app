import { query, run, transaction } from './db';
import { uuid, nowIso, weekdayOf, isoWeek } from '@/domain/derivations';
import type {
  Athlete, Group, BeltRank, FocusArea, BlockCategory, Goal, Graduation,
  TrainingUnit, TrainingBlock, AttendanceRecord,
  LibraryEntry, LibraryStep, LibraryMaterial, LibraryMedia, LibraryTimerConfig, LibraryTimerPhase,
  Termin, TerminPhase, TerminCriterion, TerminAthleteAssignment, TerminTargetBelt,
  AiConfig, AiFunctionToggle, AiRecommendation, UnitStatus, UnitDuration, GroupLevel,
  LibraryTyp, LibraryNiveau, TerminTyp, GradingEval
} from '@/domain/types';

const rowToAthlete = (r: Record<string, unknown>): Athlete => ({
  id: r.id as string,
  name: r.name as string,
  birthDate: r.birth_date as string,
  groupId: r.group_id as string,
  beltRankId: r.belt_rank_id as string,
  trainerNote: (r.trainer_note as string | null) ?? null,
  createdAt: r.created_at as string,
  updatedAt: r.updated_at as string
});

export const groupsRepo = {
  list(): Group[] {
    return query<any>('SELECT * FROM groups ORDER BY sort_order, name').map((r) => ({
      id: r.id, name: r.name, level: r.level, minAge: r.min_age, maxAge: r.max_age,
      sortOrder: r.sort_order, createdAt: r.created_at, updatedAt: r.updated_at
    }));
  },
  get(id: string): Group | null { return this.list().find((g) => g.id === id) ?? null; },
  upsert(input: { id?: string; name: string; level: GroupLevel; minAge: number; maxAge: number; sortOrder?: number }): Group {
    const id = input.id ?? uuid(); const ts = nowIso();
    const existing = this.get(id);
    if (existing) {
      run('UPDATE groups SET name=?, level=?, min_age=?, max_age=?, sort_order=?, updated_at=? WHERE id=?',
        [input.name, input.level, input.minAge, input.maxAge, input.sortOrder ?? existing.sortOrder, ts, id]);
    } else {
      run('INSERT INTO groups(id,name,level,min_age,max_age,sort_order,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)',
        [id, input.name, input.level, input.minAge, input.maxAge, input.sortOrder ?? 0, ts, ts]);
    }
    return this.get(id)!;
  },
  remove(id: string): void { run('DELETE FROM groups WHERE id=?', [id]); }
};

export const beltRanksRepo = {
  list(): BeltRank[] {
    return query<any>('SELECT * FROM belt_ranks ORDER BY sort_order').map((r) => ({
      id: r.id, label: r.label, colorName: r.color_name, colorHex: r.color_hex,
      colorBorderHex: r.color_border_hex, textColorHex: r.text_color_hex,
      sortOrder: r.sort_order, isDan: !!r.is_dan, createdAt: r.created_at, updatedAt: r.updated_at
    }));
  },
  get(id: string): BeltRank | null { return this.list().find((b) => b.id === id) ?? null; },
  upsert(b: Partial<BeltRank> & { label: string; colorHex: string; colorBorderHex: string }): BeltRank {
    const id = b.id ?? uuid(); const ts = nowIso();
    const exists = this.get(id);
    if (exists) {
      run(`UPDATE belt_ranks SET label=?, color_name=?, color_hex=?, color_border_hex=?, text_color_hex=?, sort_order=?, is_dan=?, updated_at=? WHERE id=?`,
        [b.label, b.colorName ?? exists.colorName, b.colorHex, b.colorBorderHex, b.textColorHex ?? null, b.sortOrder ?? exists.sortOrder, (b.isDan ?? exists.isDan) ? 1 : 0, ts, id]);
    } else {
      run(`INSERT INTO belt_ranks(id,label,color_name,color_hex,color_border_hex,text_color_hex,sort_order,is_dan,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [id, b.label, b.colorName ?? b.label, b.colorHex, b.colorBorderHex, b.textColorHex ?? null, b.sortOrder ?? 0, b.isDan ? 1 : 0, ts, ts]);
    }
    return this.get(id)!;
  },
  remove(id: string): void { run('DELETE FROM belt_ranks WHERE id=?', [id]); }
};

export const focusAreasRepo = {
  list(): FocusArea[] {
    return query<any>('SELECT * FROM focus_areas ORDER BY sort_order').map((r) => ({
      id: r.id, name: r.name, colorHex: r.color_hex, weightPercent: r.weight_percent,
      sortOrder: r.sort_order, isMain: !!r.is_main, createdAt: r.created_at, updatedAt: r.updated_at
    }));
  },
  upsert(f: Partial<FocusArea> & { name: string; colorHex: string; weightPercent: number }): FocusArea {
    const id = f.id ?? uuid(); const ts = nowIso();
    const exists = this.list().find((x) => x.id === id);
    if (exists) {
      run(`UPDATE focus_areas SET name=?, color_hex=?, weight_percent=?, sort_order=?, is_main=?, updated_at=? WHERE id=?`,
        [f.name, f.colorHex, f.weightPercent, f.sortOrder ?? exists.sortOrder, (f.isMain ?? exists.isMain) ? 1 : 0, ts, id]);
    } else {
      run(`INSERT INTO focus_areas(id,name,color_hex,weight_percent,sort_order,is_main,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)`,
        [id, f.name, f.colorHex, f.weightPercent, f.sortOrder ?? 0, (f.isMain ?? true) ? 1 : 0, ts, ts]);
    }
    return this.list().find((x) => x.id === id)!;
  },
  remove(id: string): void { run('DELETE FROM focus_areas WHERE id=?', [id]); }
};

export const blockCategoriesRepo = {
  list(): BlockCategory[] {
    return query<any>('SELECT * FROM block_categories ORDER BY sort_order, name').map((r) => ({
      id: r.id, name: r.name, focusAreaId: r.focus_area_id, sortOrder: r.sort_order
    }));
  },
  upsert(c: Partial<BlockCategory> & { name: string }): BlockCategory {
    const id = c.id ?? uuid();
    const exists = this.list().find((x) => x.id === id);
    if (exists) run(`UPDATE block_categories SET name=?, focus_area_id=?, sort_order=? WHERE id=?`,
      [c.name, c.focusAreaId ?? exists.focusAreaId, c.sortOrder ?? exists.sortOrder, id]);
    else run(`INSERT INTO block_categories(id,name,focus_area_id,sort_order) VALUES (?,?,?,?)`,
      [id, c.name, c.focusAreaId ?? null, c.sortOrder ?? 0]);
    return this.list().find((x) => x.id === id)!;
  },
  remove(id: string): void { run('DELETE FROM block_categories WHERE id=?', [id]); }
};

export const athletesRepo = {
  list(): Athlete[] { return query<any>('SELECT * FROM athletes ORDER BY name').map(rowToAthlete); },
  byGroup(groupId: string): Athlete[] {
    return query<any>('SELECT * FROM athletes WHERE group_id=? ORDER BY name', [groupId]).map(rowToAthlete);
  },
  get(id: string): Athlete | null {
    const r = query<any>('SELECT * FROM athletes WHERE id=?', [id])[0];
    return r ? rowToAthlete(r) : null;
  },
  upsert(a: Partial<Athlete> & { name: string; birthDate: string; groupId: string; beltRankId: string }): Athlete {
    const id = a.id ?? uuid(); const ts = nowIso();
    const exists = this.get(id);
    if (exists) {
      run(`UPDATE athletes SET name=?, birth_date=?, group_id=?, belt_rank_id=?, trainer_note=?, updated_at=? WHERE id=?`,
        [a.name, a.birthDate, a.groupId, a.beltRankId, a.trainerNote ?? null, ts, id]);
    } else {
      run(`INSERT INTO athletes(id,name,birth_date,group_id,belt_rank_id,trainer_note,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)`,
        [id, a.name, a.birthDate, a.groupId, a.beltRankId, a.trainerNote ?? null, ts, ts]);
    }
    return this.get(id)!;
  },
  remove(id: string): void { run('DELETE FROM athletes WHERE id=?', [id]); }
};

export const goalsRepo = {
  byAthlete(athleteId: string): Goal[] {
    return query<any>('SELECT * FROM goals WHERE athlete_id=? ORDER BY sort_order, created_at', [athleteId]).map((r) => ({
      id: r.id, athleteId: r.athlete_id, text: r.text, achieved: !!r.achieved,
      achievedAt: r.achieved_at, sortOrder: r.sort_order, createdAt: r.created_at, updatedAt: r.updated_at
    }));
  },
  add(athleteId: string, text: string): Goal {
    const id = uuid(); const ts = nowIso();
    run(`INSERT INTO goals(id,athlete_id,text,achieved,achieved_at,sort_order,created_at,updated_at)
         VALUES (?,?,?,0,NULL,(SELECT COALESCE(MAX(sort_order),-1)+1 FROM goals WHERE athlete_id=?),?,?)`,
      [id, athleteId, text, athleteId, ts, ts]);
    return this.byAthlete(athleteId).find((g) => g.id === id)!;
  },
  toggle(id: string): void {
    const ts = nowIso();
    run(`UPDATE goals SET achieved = CASE achieved WHEN 1 THEN 0 ELSE 1 END, achieved_at = CASE achieved WHEN 1 THEN NULL ELSE ? END, updated_at=? WHERE id=?`, [ts, ts, id]);
  },
  remove(id: string): void { run('DELETE FROM goals WHERE id=?', [id]); }
};

export const graduationRepo = {
  byAthlete(athleteId: string): Graduation[] {
    return query<any>('SELECT * FROM graduation_history WHERE athlete_id=? ORDER BY date DESC', [athleteId]).map((r) => ({
      id: r.id, athleteId: r.athlete_id, date: r.date, fromBeltRankId: r.from_belt_rank_id,
      toBeltRankId: r.to_belt_rank_id, evaluation: r.evaluation, createdAt: r.created_at
    }));
  },
  add(g: { athleteId: string; date: string; fromBeltRankId: string; toBeltRankId: string; evaluation: GradingEval }): void {
    transaction(() => {
      const id = uuid(); const ts = nowIso();
      run(`INSERT INTO graduation_history(id,athlete_id,date,from_belt_rank_id,to_belt_rank_id,evaluation,created_at)
           VALUES (?,?,?,?,?,?,?)`, [id, g.athleteId, g.date, g.fromBeltRankId, g.toBeltRankId, g.evaluation, ts]);
      if (g.evaluation !== 'Nicht bestanden') {
        run(`UPDATE athletes SET belt_rank_id=?, updated_at=? WHERE id=?`, [g.toBeltRankId, ts, g.athleteId]);
      }
    });
  },
  remove(id: string): void { run('DELETE FROM graduation_history WHERE id=?', [id]); }
};

const rowToUnit = (r: Record<string, unknown>): TrainingUnit => ({
  id: r.id as string, date: r.date as string, weekday: r.weekday as any,
  isoYear: r.iso_year as number, isoWeek: r.iso_week as number, groupId: r.group_id as string,
  durationMinutes: r.duration_minutes as UnitDuration, status: r.status as UnitStatus,
  title: (r.title as string | null) ?? null, createdAt: r.created_at as string, updatedAt: r.updated_at as string
});

export const unitsRepo = {
  list(): TrainingUnit[] { return query<any>('SELECT * FROM training_units ORDER BY date').map(rowToUnit); },
  byWeek(year: number, week: number): TrainingUnit[] {
    return query<any>('SELECT * FROM training_units WHERE iso_year=? AND iso_week=? ORDER BY date', [year, week]).map(rowToUnit);
  },
  byGroup(groupId: string): TrainingUnit[] {
    return query<any>('SELECT * FROM training_units WHERE group_id=? ORDER BY date', [groupId]).map(rowToUnit);
  },
  get(id: string): TrainingUnit | null {
    const r = query<any>('SELECT * FROM training_units WHERE id=?', [id])[0];
    return r ? rowToUnit(r) : null;
  },
  upsert(u: Partial<TrainingUnit> & { date: string; groupId: string; durationMinutes: UnitDuration; status?: UnitStatus }): TrainingUnit {
    const id = u.id ?? uuid(); const ts = nowIso();
    const wd = weekdayOf(u.date); const { year, week } = isoWeek(u.date);
    const exists = this.get(id);
    if (exists) {
      run(`UPDATE training_units SET date=?, weekday=?, iso_year=?, iso_week=?, group_id=?, duration_minutes=?, status=?, title=?, updated_at=? WHERE id=?`,
        [u.date, wd, year, week, u.groupId, u.durationMinutes, u.status ?? exists.status, u.title ?? null, ts, id]);
    } else {
      run(`INSERT INTO training_units(id,date,weekday,iso_year,iso_week,group_id,duration_minutes,status,title,created_at,updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [id, u.date, wd, year, week, u.groupId, u.durationMinutes, u.status ?? 'geplant', u.title ?? null, ts, ts]);
    }
    return this.get(id)!;
  },
  remove(id: string): void { run('DELETE FROM training_units WHERE id=?', [id]); }
};

const rowToBlock = (r: Record<string, unknown>): TrainingBlock => ({
  id: r.id as string, trainingUnitId: r.training_unit_id as string, sortOrder: r.sort_order as number,
  title: r.title as string, categoryId: r.category_id as string, durationMinutes: r.duration_minutes as number,
  iconEmoji: (r.icon_emoji as string | null) ?? null, note: (r.note as string | null) ?? null,
  source: r.source as any, sourceLibraryEntryId: (r.source_library_entry_id as string | null) ?? null,
  createdAt: r.created_at as string, updatedAt: r.updated_at as string
});

export const blocksRepo = {
  byUnit(unitId: string): TrainingBlock[] {
    return query<any>('SELECT * FROM training_blocks WHERE training_unit_id=? ORDER BY sort_order', [unitId]).map(rowToBlock);
  },
  upsert(b: Partial<TrainingBlock> & { trainingUnitId: string; title: string; categoryId: string; durationMinutes: number; source: 'library' | 'custom' }): TrainingBlock {
    const id = b.id ?? uuid(); const ts = nowIso();
    const exists = query<any>('SELECT * FROM training_blocks WHERE id=?', [id])[0];
    if (exists) {
      run(`UPDATE training_blocks SET sort_order=?, title=?, category_id=?, duration_minutes=?, icon_emoji=?, note=?, source=?, source_library_entry_id=?, updated_at=? WHERE id=?`,
        [b.sortOrder ?? exists.sort_order, b.title, b.categoryId, b.durationMinutes, b.iconEmoji ?? null, b.note ?? null, b.source, b.sourceLibraryEntryId ?? null, ts, id]);
    } else {
      const maxSort = query<any>('SELECT COALESCE(MAX(sort_order),-1) AS m FROM training_blocks WHERE training_unit_id=?', [b.trainingUnitId])[0]?.m ?? -1;
      run(`INSERT INTO training_blocks(id,training_unit_id,sort_order,title,category_id,duration_minutes,icon_emoji,note,source,source_library_entry_id,created_at,updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [id, b.trainingUnitId, b.sortOrder ?? (maxSort + 1), b.title, b.categoryId, b.durationMinutes, b.iconEmoji ?? null, b.note ?? null, b.source, b.sourceLibraryEntryId ?? null, ts, ts]);
    }
    return rowToBlock(query<any>('SELECT * FROM training_blocks WHERE id=?', [id])[0]);
  },
  move(id: string, direction: 'up' | 'down'): void {
    const row = query<any>('SELECT * FROM training_blocks WHERE id=?', [id])[0]; if (!row) return;
    const siblings = this.byUnit(row.training_unit_id);
    const idx = siblings.findIndex((s) => s.id === id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= siblings.length) return;
    const other = siblings[swapIdx];
    const ts = nowIso();
    transaction(() => {
      run('UPDATE training_blocks SET sort_order=?, updated_at=? WHERE id=?', [other.sortOrder, ts, id]);
      run('UPDATE training_blocks SET sort_order=?, updated_at=? WHERE id=?', [siblings[idx].sortOrder, ts, other.id]);
    });
  },
  remove(id: string): void { run('DELETE FROM training_blocks WHERE id=?', [id]); }
};

export const attendanceRepo = {
  byUnit(unitId: string): AttendanceRecord[] {
    return query<any>('SELECT * FROM attendance_records WHERE training_unit_id=?', [unitId]).map((r) => ({
      id: r.id, trainingUnitId: r.training_unit_id, athleteId: r.athlete_id,
      present: r.present === null ? null : !!r.present, recordedAt: r.recorded_at
    }));
  },
  set(unitId: string, athleteId: string, present: boolean | null): void {
    const ts = nowIso();
    const existing = query<any>('SELECT id FROM attendance_records WHERE training_unit_id=? AND athlete_id=?', [unitId, athleteId])[0];
    if (existing) run(`UPDATE attendance_records SET present=?, recorded_at=? WHERE id=?`, [present === null ? null : present ? 1 : 0, ts, existing.id]);
    else run(`INSERT INTO attendance_records(id,training_unit_id,athlete_id,present,recorded_at) VALUES (?,?,?,?,?)`,
      [uuid(), unitId, athleteId, present === null ? null : present ? 1 : 0, ts]);
  },
  athleteRate(athleteId: string): { total: number; present: number; rate: number } {
    const r = query<any>(`SELECT SUM(CASE WHEN present=1 THEN 1 ELSE 0 END) AS p, COUNT(*) FILTER (WHERE present IS NOT NULL) AS t FROM attendance_records WHERE athlete_id=?`, [athleteId])[0];
    const total = (r?.t as number) ?? 0; const present = (r?.p as number) ?? 0;
    return { total, present, rate: total ? Math.round((present / total) * 100) : 0 };
  }
};

const rowToLib = (r: Record<string, unknown>): LibraryEntry => ({
  id: r.id as string, type: r.type as LibraryTyp, title: r.title as string,
  categoryId: r.category_id as string, niveau: r.niveau as LibraryNiveau,
  description: (r.description as string | null) ?? null, youtubeVideoId: (r.youtube_video_id as string | null) ?? null,
  durationMinutes: r.duration_minutes as number, source: r.source as any,
  createdFromUnitId: (r.created_from_unit_id as string | null) ?? null,
  createdAt: r.created_at as string, updatedAt: r.updated_at as string
});

export const libraryRepo = {
  list(): LibraryEntry[] { return query<any>('SELECT * FROM library_entries ORDER BY title').map(rowToLib); },
  get(id: string): LibraryEntry | null {
    const r = query<any>('SELECT * FROM library_entries WHERE id=?', [id])[0];
    return r ? rowToLib(r) : null;
  },
  upsert(e: Partial<LibraryEntry> & { type: LibraryTyp; title: string; categoryId: string; niveau: LibraryNiveau }): LibraryEntry {
    const id = e.id ?? uuid(); const ts = nowIso();
    const exists = this.get(id);
    if (exists) {
      run(`UPDATE library_entries SET type=?, title=?, category_id=?, niveau=?, description=?, youtube_video_id=?, duration_minutes=?, source=?, created_from_unit_id=?, updated_at=? WHERE id=?`,
        [e.type, e.title, e.categoryId, e.niveau, e.description ?? null, e.youtubeVideoId ?? null, e.durationMinutes ?? 0, e.source ?? exists.source, e.createdFromUnitId ?? exists.createdFromUnitId, ts, id]);
    } else {
      run(`INSERT INTO library_entries(id,type,title,category_id,niveau,description,youtube_video_id,duration_minutes,source,created_from_unit_id,created_at,updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [id, e.type, e.title, e.categoryId, e.niveau, e.description ?? null, e.youtubeVideoId ?? null, e.durationMinutes ?? 0, e.source ?? 'manual', e.createdFromUnitId ?? null, ts, ts]);
    }
    return this.get(id)!;
  },
  remove(id: string): void { run('DELETE FROM library_entries WHERE id=?', [id]); },
  steps(entryId: string): LibraryStep[] {
    return query<any>('SELECT * FROM library_steps WHERE library_entry_id=? ORDER BY step_number', [entryId])
      .map((r) => ({ id: r.id, libraryEntryId: r.library_entry_id, stepNumber: r.step_number, text: r.text }));
  },
  setSteps(entryId: string, steps: { stepNumber: number; text: string }[]): void {
    transaction(() => {
      run('DELETE FROM library_steps WHERE library_entry_id=?', [entryId]);
      for (const s of steps) run('INSERT INTO library_steps(id,library_entry_id,step_number,text) VALUES (?,?,?,?)', [uuid(), entryId, s.stepNumber, s.text]);
    });
  },
  materials(entryId: string): LibraryMaterial[] {
    return query<any>('SELECT * FROM library_materials WHERE library_entry_id=? ORDER BY sort_order', [entryId])
      .map((r) => ({ id: r.id, libraryEntryId: r.library_entry_id, text: r.text, sortOrder: r.sort_order }));
  },
  setMaterials(entryId: string, materials: string[]): void {
    transaction(() => {
      run('DELETE FROM library_materials WHERE library_entry_id=?', [entryId]);
      materials.forEach((t, i) => run('INSERT INTO library_materials(id,library_entry_id,text,sort_order) VALUES (?,?,?,?)', [uuid(), entryId, t, i]));
    });
  },
  timer(entryId: string): { config: LibraryTimerConfig | null; phases: LibraryTimerPhase[] } {
    const c = query<any>('SELECT * FROM library_timer_configs WHERE library_entry_id=?', [entryId])[0];
    const p = query<any>('SELECT * FROM library_timer_phases WHERE library_entry_id=? ORDER BY sort_order', [entryId])
      .map((r) => ({ id: r.id, libraryEntryId: r.library_entry_id, name: r.name, durationSeconds: r.duration_seconds, colorHex: r.color_hex, sortOrder: r.sort_order }));
    return { config: c ? { libraryEntryId: c.library_entry_id, active: !!c.active, repetitions: c.repetitions } : null, phases: p };
  },
  setTimer(entryId: string, config: { active: boolean; repetitions: number }, phases: Array<{ name: string; durationSeconds: number; colorHex: string }>): void {
    transaction(() => {
      run('INSERT OR REPLACE INTO library_timer_configs(library_entry_id,active,repetitions) VALUES (?,?,?)', [entryId, config.active ? 1 : 0, config.repetitions]);
      run('DELETE FROM library_timer_phases WHERE library_entry_id=?', [entryId]);
      phases.forEach((p, i) => run('INSERT INTO library_timer_phases(id,library_entry_id,name,duration_seconds,color_hex,sort_order) VALUES (?,?,?,?,?,?)',
        [uuid(), entryId, p.name, p.durationSeconds, p.colorHex, i]));
    });
  }
};

const rowToTermin = (r: Record<string, unknown>): Termin => ({
  id: r.id as string, type: r.type as TerminTyp, label: r.label as string, date: r.date as string,
  location: (r.location as string | null) ?? null, description: (r.description as string | null) ?? null,
  examinerName: (r.examiner_name as string | null) ?? null, notes: (r.notes as string | null) ?? null,
  createdAt: r.created_at as string, updatedAt: r.updated_at as string
});

export const termineRepo = {
  list(): Termin[] { return query<any>('SELECT * FROM exams_tournaments ORDER BY date').map(rowToTermin); },
  get(id: string): Termin | null {
    const r = query<any>('SELECT * FROM exams_tournaments WHERE id=?', [id])[0];
    return r ? rowToTermin(r) : null;
  },
  upsert(t: Partial<Termin> & { type: TerminTyp; label: string; date: string }): Termin {
    const id = t.id ?? uuid(); const ts = nowIso();
    const exists = this.get(id);
    if (exists) {
      run(`UPDATE exams_tournaments SET type=?, label=?, date=?, location=?, description=?, examiner_name=?, notes=?, updated_at=? WHERE id=?`,
        [t.type, t.label, t.date, t.location ?? null, t.description ?? null, t.examinerName ?? null, t.notes ?? null, ts, id]);
    } else {
      run(`INSERT INTO exams_tournaments(id,type,label,date,location,description,examiner_name,notes,created_at,updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [id, t.type, t.label, t.date, t.location ?? null, t.description ?? null, t.examinerName ?? null, t.notes ?? null, ts, ts]);
    }
    return this.get(id)!;
  },
  remove(id: string): void { run('DELETE FROM exams_tournaments WHERE id=?', [id]); },
  phases(terminId: string): TerminPhase[] {
    return query<any>('SELECT * FROM termin_phases WHERE termin_id=? ORDER BY sort_order', [terminId])
      .map((r) => ({ id: r.id, terminId: r.termin_id, sortOrder: r.sort_order, name: r.name, durationWeeks: r.duration_weeks, focusTopic: r.focus_topic }));
  },
  setPhases(terminId: string, phases: Array<{ name: string; durationWeeks: number; focusTopic?: string | null }>): void {
    transaction(() => {
      run('DELETE FROM termin_phases WHERE termin_id=?', [terminId]);
      phases.forEach((p, i) => run('INSERT INTO termin_phases(id,termin_id,sort_order,name,duration_weeks,focus_topic) VALUES (?,?,?,?,?,?)',
        [uuid(), terminId, i, p.name, p.durationWeeks, p.focusTopic ?? null]));
    });
  },
  criteria(terminId: string): TerminCriterion[] {
    return query<any>('SELECT * FROM termin_criteria WHERE termin_id=? ORDER BY sort_order', [terminId])
      .map((r) => ({ id: r.id, terminId: r.termin_id, sortOrder: r.sort_order, text: r.text, fulfilled: !!r.fulfilled, fulfilledAt: r.fulfilled_at }));
  },
  addCriterion(terminId: string, text: string): void {
    const id = uuid();
    const maxSort = query<any>('SELECT COALESCE(MAX(sort_order),-1) AS m FROM termin_criteria WHERE termin_id=?', [terminId])[0]?.m ?? -1;
    run('INSERT INTO termin_criteria(id,termin_id,sort_order,text,fulfilled,fulfilled_at) VALUES (?,?,?,?,0,NULL)',
      [id, terminId, maxSort + 1, text]);
  },
  toggleCriterion(id: string): void {
    const ts = nowIso();
    run(`UPDATE termin_criteria SET fulfilled = CASE fulfilled WHEN 1 THEN 0 ELSE 1 END, fulfilled_at = CASE fulfilled WHEN 1 THEN NULL ELSE ? END WHERE id=?`, [ts, id]);
  },
  removeCriterion(id: string): void { run('DELETE FROM termin_criteria WHERE id=?', [id]); },
  assignees(terminId: string): TerminAthleteAssignment[] {
    return query<any>('SELECT * FROM termin_athlete_assignments WHERE termin_id=?', [terminId])
      .map((r) => ({ terminId: r.termin_id, athleteId: r.athlete_id, assignedAt: r.assigned_at }));
  },
  toggleAssignee(terminId: string, athleteId: string): void {
    const existing = query<any>('SELECT * FROM termin_athlete_assignments WHERE termin_id=? AND athlete_id=?', [terminId, athleteId])[0];
    if (existing) run('DELETE FROM termin_athlete_assignments WHERE termin_id=? AND athlete_id=?', [terminId, athleteId]);
    else run('INSERT INTO termin_athlete_assignments(termin_id,athlete_id,assigned_at) VALUES (?,?,?)', [terminId, athleteId, nowIso()]);
  },
  targetBelts(terminId: string): TerminTargetBelt[] {
    return query<any>('SELECT * FROM termin_target_belts WHERE termin_id=?', [terminId])
      .map((r) => ({ terminId: r.termin_id, beltRankId: r.belt_rank_id }));
  },
  setTargetBelts(terminId: string, beltIds: string[]): void {
    transaction(() => {
      run('DELETE FROM termin_target_belts WHERE termin_id=?', [terminId]);
      for (const b of beltIds) run('INSERT INTO termin_target_belts(termin_id,belt_rank_id) VALUES (?,?)', [terminId, b]);
    });
  }
};

export const aiConfigRepo = {
  get(): AiConfig {
    const r = query<any>("SELECT * FROM ai_config WHERE id='default'")[0];
    return {
      id: 'default', provider: r.provider, model: r.model,
      apiKeyCipher: r.api_key_cipher, apiKeyIv: r.api_key_iv,
      customEndpointUrl: r.custom_endpoint_url,
      lastConnectionTestAt: r.last_connection_test_at,
      lastConnectionTestStatus: r.last_connection_test_status,
      lastConnectionTestError: r.last_connection_test_error,
      updatedAt: r.updated_at
    };
  },
  update(patch: Partial<AiConfig>): void {
    const ts = nowIso(); const cur = this.get();
    run(`UPDATE ai_config SET provider=?, model=?, api_key_cipher=?, api_key_iv=?, custom_endpoint_url=?, last_connection_test_at=?, last_connection_test_status=?, last_connection_test_error=?, updated_at=? WHERE id='default'`,
      [patch.provider ?? cur.provider, patch.model ?? cur.model,
       patch.apiKeyCipher ?? cur.apiKeyCipher, patch.apiKeyIv ?? cur.apiKeyIv,
       patch.customEndpointUrl ?? cur.customEndpointUrl,
       patch.lastConnectionTestAt ?? cur.lastConnectionTestAt,
       patch.lastConnectionTestStatus ?? cur.lastConnectionTestStatus,
       patch.lastConnectionTestError ?? cur.lastConnectionTestError, ts]);
  },
  toggles(): AiFunctionToggle[] {
    return query<any>('SELECT * FROM ai_function_toggles').map((r) => ({ functionId: r.function_id, enabled: !!r.enabled }));
  },
  setToggle(id: string, enabled: boolean): void {
    run(`UPDATE ai_function_toggles SET enabled=? WHERE function_id=?`, [enabled ? 1 : 0, id]);
  }
};

export const recommendationsRepo = {
  list(context?: string): AiRecommendation[] {
    const rows = context
      ? query<any>('SELECT * FROM ai_recommendations WHERE context=? ORDER BY generated_at DESC', [context])
      : query<any>('SELECT * FROM ai_recommendations ORDER BY generated_at DESC');
    return rows.map((r) => ({
      id: r.id, context: r.context, contextRefId: r.context_ref_id, generatedAt: r.generated_at,
      validUntil: r.valid_until, headline: r.headline, body: r.body,
      actionLabel: r.action_label, actionTarget: r.action_target, status: r.status
    }));
  },
  add(rec: Omit<AiRecommendation, 'id'>): AiRecommendation {
    const id = uuid();
    run(`INSERT INTO ai_recommendations(id,context,context_ref_id,generated_at,valid_until,headline,body,action_label,action_target,status) VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [id, rec.context, rec.contextRefId, rec.generatedAt, rec.validUntil, rec.headline, rec.body, rec.actionLabel, rec.actionTarget, rec.status]);
    return { id, ...rec };
  },
  updateStatus(id: string, status: 'accepted' | 'dismissed'): void {
    run(`UPDATE ai_recommendations SET status=? WHERE id=?`, [status, id]);
  }
};

export const statsRepo = {
  weekFocusDistribution(isoYear: number, isoWeek: number): { focusAreaId: string; name: string; colorHex: string; minutes: number }[] {
    return query<any>(`
      SELECT fa.id AS focusAreaId, fa.name, fa.color_hex AS colorHex, COALESCE(SUM(tb.duration_minutes),0) AS minutes
      FROM focus_areas fa
      LEFT JOIN block_categories bc ON bc.focus_area_id = fa.id
      LEFT JOIN training_blocks tb ON tb.category_id = bc.id
        AND tb.training_unit_id IN (SELECT id FROM training_units WHERE iso_year=? AND iso_week=?)
      GROUP BY fa.id
      ORDER BY fa.sort_order
    `, [isoYear, isoWeek]);
  },
  unitFocusDistribution(unitId: string): { focusAreaId: string; name: string; colorHex: string; minutes: number }[] {
    return query<any>(`
      SELECT fa.id AS focusAreaId, fa.name, fa.color_hex AS colorHex, COALESCE(SUM(tb.duration_minutes),0) AS minutes
      FROM training_blocks tb
      JOIN block_categories bc ON bc.id = tb.category_id
      JOIN focus_areas fa ON fa.id = bc.focus_area_id
      WHERE tb.training_unit_id=?
      GROUP BY fa.id
    `, [unitId]);
  },
  weekStatusCount(isoYear: number, isoWeek: number): { planned: number; done: number; cancelled: number } {
    const r = query<any>(`SELECT
      SUM(CASE WHEN status='geplant' THEN 1 ELSE 0 END) AS planned,
      SUM(CASE WHEN status='durchgeführt' THEN 1 ELSE 0 END) AS done,
      SUM(CASE WHEN status='ausgefallen' THEN 1 ELSE 0 END) AS cancelled
      FROM training_units WHERE iso_year=? AND iso_week=?`, [isoYear, isoWeek])[0];
    return { planned: r?.planned ?? 0, done: r?.done ?? 0, cancelled: r?.cancelled ?? 0 };
  },
  athleteAttendanceRates(): { athleteId: string; total: number; present: number; rate: number }[] {
    return query<any>(`SELECT athlete_id AS athleteId,
      COUNT(*) FILTER (WHERE present IS NOT NULL) AS total,
      SUM(CASE WHEN present=1 THEN 1 ELSE 0 END) AS present,
      CASE WHEN COUNT(*) FILTER (WHERE present IS NOT NULL)=0 THEN 0
           ELSE CAST(ROUND(100.0 * SUM(CASE WHEN present=1 THEN 1 ELSE 0 END) / COUNT(*) FILTER (WHERE present IS NOT NULL)) AS INTEGER) END AS rate
      FROM attendance_records GROUP BY athlete_id`);
  },
  terminReadiness(terminId: string): { total: number; fulfilled: number; pct: number } {
    const r = query<any>(`SELECT COUNT(*) AS total, SUM(fulfilled) AS f FROM termin_criteria WHERE termin_id=?`, [terminId])[0];
    const total = r?.total ?? 0, f = r?.f ?? 0;
    return { total, fulfilled: f, pct: total ? Math.round((f / total) * 100) : 0 };
  }
};

export const appStateRepo = {
  get(key: string): string | null {
    const r = query<any>('SELECT value FROM app_state WHERE key=?', [key])[0];
    return r ? (r.value as string) : null;
  },
  set(key: string, value: string): void {
    const ts = nowIso();
    run(`INSERT INTO app_state(key,value,updated_at) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at`, [key, value, ts]);
  }
};

export const settingsRepo = {
  get(key: string): string | null {
    const r = query<any>('SELECT value FROM settings WHERE key=?', [key])[0];
    return r ? (r.value as string) : null;
  },
  set(key: string, value: string): void {
    const ts = nowIso();
    run(`INSERT INTO settings(key,value,updated_at) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at`, [key, value, ts]);
  }
};
