import { Weekday } from './types';

export function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

const WD: Weekday[] = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

export function weekdayOf(dateIso: string): Weekday {
  const d = new Date(dateIso + 'T00:00:00');
  const w = d.getDay();
  return w === 0 ? 'So' : WD[w];
}

export function isoWeek(dateIso: string): { year: number; week: number } {
  const d = new Date(dateIso + 'T00:00:00Z');
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - yearStart) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

export function ageYears(birthDateIso: string, ref = new Date()): number {
  const b = new Date(birthDateIso + 'T00:00:00');
  let age = ref.getFullYear() - b.getFullYear();
  const m = ref.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < b.getDate())) age--;
  return age;
}

export function daysUntil(targetIso: string, ref = new Date()): number {
  const t = new Date(targetIso + 'T00:00:00');
  const diff = t.getTime() - ref.getTime();
  return Math.ceil(diff / 86400000);
}

export function formatDate(dateIso: string, opts: { weekday?: boolean; year?: boolean } = {}): string {
  const d = new Date(dateIso + 'T00:00:00');
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const parts: string[] = [];
  if (opts.weekday) parts.push(weekdayOf(dateIso) + '.');
  parts.push(`${day}.${month}.${opts.year === false ? '' : year}`);
  return parts.join(' ');
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h}h ${m}min`;
}

export function formatTodayHeader(d = new Date()): string {
  const WL = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const ML = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  return `${WL[d.getDay()]}, ${d.getDate()}. ${ML[d.getMonth()]} ${d.getFullYear()}`;
}

export function startOfIsoWeek(dateIso: string): string {
  const d = new Date(dateIso + 'T00:00:00');
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - (day - 1));
  return d.toISOString().slice(0, 10);
}

export function abweichungProzent(ist: number, soll: number): number {
  return Math.round(ist - soll);
}

export function cx(...args: Array<string | false | null | undefined>): string {
  return args.filter(Boolean).join(' ');
}
