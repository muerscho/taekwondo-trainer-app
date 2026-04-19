import { AiProvider } from '@/domain/types';

export interface AiCallContext {
  locale: 'de';
}

export interface EinheitVorschlag {
  titel: string;
  bloecke: Array<{ titel: string; kategorie: string; minuten: number; notiz?: string }>;
  begruendung: string;
}

export interface KIEmpfehlung {
  headline: string;
  body: string;
  actionLabel?: string;
  actionTarget?: string;
}

export interface PhaseVorschlag {
  name: string;
  wochen: number;
  fokus: string;
}

export interface AIProviderConfig {
  apiKey: string;
  model: string;
  baseUrl?: string;
  providerId: AiProvider;
}

export abstract class AIProvider {
  constructor(protected cfg: AIProviderConfig) {}

  abstract testConnection(): Promise<{ ok: boolean; error?: string }>;
  abstract text(prompt: string, systemPrompt?: string): Promise<string>;

  async suggestEinheit(ctx: { gruppe: string; gurtgrad: string; schwerpunkt: string; dauer: number }): Promise<EinheitVorschlag> {
    const sys = 'Du bist Assistent für Taekwondo-Trainer. Antworte nur mit validem JSON im definierten Schema. Deutsch.';
    const prompt = `Erstelle eine ${ctx.dauer}-minütige Trainingseinheit für Gruppe "${ctx.gruppe}" auf Gurtgrad "${ctx.gurtgrad}" mit Schwerpunkt "${ctx.schwerpunkt}". JSON-Schema: { "titel": string, "bloecke": [{ "titel": string, "kategorie": "Aufwärmen"|"Technik"|"Kondition"|"Poomsae"|"Sparring"|"Spiel"|"Dehnen"|"Theorie"|"Selbstverteidigung", "minuten": number, "notiz"?: string }], "begruendung": string }`;
    const raw = await this.text(prompt, sys);
    return parseJson<EinheitVorschlag>(raw);
  }

  async suggestPhases(ctx: { terminTyp: 'Pruefung' | 'Wettkampf'; wochenBisZiel: number }): Promise<PhaseVorschlag[]> {
    const sys = 'Erstelle Periodisierungs-Phasen für Taekwondo, Antwort als JSON-Array. Deutsch.';
    const prompt = `Generiere Phasen für ${ctx.terminTyp}, Vorbereitung über ${ctx.wochenBisZiel} Wochen. JSON-Array: [{ "name": string, "wochen": 1|2|3|4|6|8, "fokus": string }]`;
    const raw = await this.text(prompt, sys);
    return parseJson<PhaseVorschlag[]>(raw);
  }

  async dashboardRecommendation(ctx: { schwerpunktSollIst: Array<{ name: string; soll: number; ist: number }>; anzahlAthletenLowAnw: number }): Promise<KIEmpfehlung[]> {
    const sys = 'Liefere kurze, konkrete Tagesempfehlungen für einen Taekwondo-Trainer, JSON-Array, max. 4 Einträge. Deutsch.';
    const prompt = `Basis: Schwerpunkt-Abweichungen = ${JSON.stringify(ctx.schwerpunktSollIst)}, Athleten mit niedriger Anwesenheit = ${ctx.anzahlAthletenLowAnw}. JSON-Array: [{ "headline": string (max 60 Zeichen), "body": string (max 160 Zeichen), "actionLabel"?: string, "actionTarget"?: string }]`;
    const raw = await this.text(prompt, sys);
    return parseJson<KIEmpfehlung[]>(raw);
  }

  async terminAnalyse(ctx: { terminTyp: string; tage: number; kriterienErfuellt: number; kriterienTotal: number; anzahlAthleten: number }): Promise<string> {
    const sys = 'Antworte als knapper Freitext (max 3 Sätze). Deutsch. Taekwondo-Kontext.';
    const prompt = `${ctx.terminTyp}, ${ctx.tage} Tage bis zum Termin, ${ctx.kriterienErfuellt}/${ctx.kriterienTotal} Kriterien erfüllt, ${ctx.anzahlAthleten} Athleten gemeldet. Gib eine Analyse und eine konkrete Handlungsempfehlung.`;
    return this.text(prompt, sys);
  }
}

function parseJson<T>(raw: string): T {
  const cleaned = raw.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '');
  const start = cleaned.indexOf('{') >= 0 ? Math.min(
    cleaned.indexOf('{') === -1 ? Infinity : cleaned.indexOf('{'),
    cleaned.indexOf('[') === -1 ? Infinity : cleaned.indexOf('[')
  ) : cleaned.indexOf('[');
  const end = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
  const slice = start >= 0 && end >= 0 ? cleaned.slice(start, end + 1) : cleaned;
  return JSON.parse(slice) as T;
}
