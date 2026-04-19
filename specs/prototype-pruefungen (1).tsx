import { useState } from "react";

// ── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  primary: "#1e3a5f",
  bg:      "#f3f4f6",
  card:    "#fff",
  muted:   "#6b7280",
  border:  "#e5e7eb",
  pruefung: "#3b82f6",
  wettkampf: "#ef4444",
};

// ── Mock-Daten ─────────────────────────────────────────────────────────────────
const GURTGRADE = [
  { id: "g10", kup: "10. Kup", farbe: "Weiß",        hex: "#f9fafb", border: "#d1d5db" },
  { id: "g9",  kup: "9. Kup",  farbe: "Weiß-Gelb",   hex: "#fef9c3", border: "#fbbf24" },
  { id: "g8",  kup: "8. Kup",  farbe: "Gelb",         hex: "#fef08a", border: "#eab308" },
  { id: "g7",  kup: "7. Kup",  farbe: "Gelb-Grün",   hex: "#dcfce7", border: "#22c55e" },
  { id: "g6",  kup: "6. Kup",  farbe: "Grün",         hex: "#bbf7d0", border: "#16a34a" },
  { id: "g5",  kup: "5. Kup",  farbe: "Grün-Blau",   hex: "#bfdbfe", border: "#3b82f6" },
  { id: "g4",  kup: "4. Kup",  farbe: "Blau",         hex: "#93c5fd", border: "#1d4ed8" },
  { id: "g3",  kup: "3. Kup",  farbe: "Blau-Rot",    hex: "#fecaca", border: "#ef4444" },
  { id: "g2",  kup: "2. Kup",  farbe: "Rot",          hex: "#fca5a5", border: "#dc2626" },
  { id: "g1",  kup: "1. Kup",  farbe: "Rot-Schwarz",  hex: "#374151", border: "#111827", textColor: "#fff" },
  { id: "d1",  kup: "1. Dan",  farbe: "Schwarz",      hex: "#111827", border: "#111827", textColor: "#fff" },
  { id: "d2",  kup: "2. Dan",  farbe: "Schwarz",      hex: "#111827", border: "#111827", textColor: "#fff" },
];

const ATHLETEN = [
  { id: 1, name: "Max Mustermann", gurtId: "g4", gruppe: "Erwachsene" },
  { id: 2, name: "Lena Schmidt",   gurtId: "g7", gruppe: "Jugend" },
  { id: 3, name: "Jonas Weber",    gurtId: "g1", gruppe: "Fortgeschrittene" },
  { id: 4, name: "Sara Bauer",     gurtId: "g6", gruppe: "Jugend" },
  { id: 5, name: "Tom Fischer",    gurtId: "g3", gruppe: "Erwachsene" },
  { id: 6, name: "Mia Krause",     gurtId: "g9", gruppe: "Jugend" },
];

const PHASEN_VORLAGEN = {
  Pruefung:  [
    { name: "Grundlagen auffrischen", wochen: 2, fokus: "Technik, Poomsae" },
    { name: "Intensivphase",          wochen: 3, fokus: "Prüfungsinhalte, Kondition" },
    { name: "Feinschliff",            wochen: 1, fokus: "Poomsae, Theorie" },
  ],
  Wettkampf: [
    { name: "Aufbauphase",  wochen: 3, fokus: "Kyorugi-Kombinationen" },
    { name: "Intensivphase",wochen: 3, fokus: "Sparring, Taktik" },
    { name: "Tapering",     wochen: 1, fokus: "Leichte Einheiten, Regeneration" },
  ],
};

const PHASEN_FARBEN = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6"];

const INIT_TERMINE = [
  {
    id: "t1", typ: "Pruefung", label: "Kup-Prüfung (6.–4. Kup)",
    datum: "2026-04-12", beschreibung: "Prüfung für 6., 5. und 4. Kup",
    ort: "Vereinshalle", prueferName: "Master Kim",
    zielGurtIds: ["g6", "g5", "g4"],
    athletenIds: [1, 2],
    phasen: [
      { id: 1, name: "Grundlagen auffrischen", wochen: 2, fokus: "Technik, Poomsae" },
      { id: 2, name: "Intensivphase",          wochen: 3, fokus: "Prüfungsinhalte, Kondition" },
      { id: 3, name: "Feinschliff",            wochen: 1, fokus: "Poomsae, Theorie" },
    ],
    kriterien: [
      { id: 1, text: "Pflicht-Poomsae fehlerfrei", erfuellt: true  },
      { id: 2, text: "Grundtechniken sauber",      erfuellt: true  },
      { id: 3, text: "Theoriefragen bestehen",     erfuellt: false },
      { id: 4, text: "Mindeststunden erfüllt",     erfuellt: true  },
    ],
    notizen: "Anmeldeschluss: 01.04.2026",
  },
  {
    id: "t2", typ: "Wettkampf", label: "Stadtmeisterschaft",
    datum: "2026-05-03", beschreibung: "Kyorugi & Poomsae Kategorien",
    ort: "Sporthalle Nord", prueferName: "",
    zielGurtIds: [],
    athletenIds: [1, 5],
    phasen: [
      { id: 1, name: "Aufbauphase",   wochen: 3, fokus: "Kyorugi-Kombinationen" },
      { id: 2, name: "Intensivphase", wochen: 3, fokus: "Sparring, Taktik" },
      { id: 3, name: "Tapering",      wochen: 1, fokus: "Leichte Einheiten, Regeneration" },
    ],
    kriterien: [
      { id: 1, text: "Gewichtsklasse einhalten", erfuellt: true  },
      { id: 2, text: "Regelwerk kennen",         erfuellt: true  },
      { id: 3, text: "Kampftaktik festlegen",    erfuellt: false },
    ],
    notizen: "Anmeldeschluss: 20.04.2026",
  },
  {
    id: "t3", typ: "Pruefung", label: "Dan-Prüfung 1. Dan",
    datum: "2026-06-15", beschreibung: "Verbandsprüfung 1. Dan",
    ort: "Verbandshalle", prueferName: "Grand Master Park",
    zielGurtIds: ["d1"],
    athletenIds: [3],
    phasen: [
      { id: 1, name: "Aufbauphase",   wochen: 4, fokus: "Alle Poomsae, Selbstverteidigung" },
      { id: 2, name: "Intensivphase", wochen: 4, fokus: "Kyorugi, Bruchtest" },
      { id: 3, name: "Tapering",      wochen: 2, fokus: "Theorie, mentale Vorbereitung" },
    ],
    kriterien: [
      { id: 1, text: "Alle Kup-Poomsae",     erfuellt: true  },
      { id: 2, text: "Koryo & Keumgang",      erfuellt: false },
      { id: 3, text: "Bruchtest bestehen",    erfuellt: false },
      { id: 4, text: "Schriftliche Prüfung",  erfuellt: false },
      { id: 5, text: "Kampf bestehen",        erfuellt: false },
    ],
    notizen: "Anmeldung über Verband erforderlich",
  },
];

// ── Hilfsfunktionen ───────────────────────────────────────────────────────────
const gurtById   = (id) => GURTGRADE.find(g => g.id === id) || GURTGRADE[0];
const tageBis    = (datum) => Math.max(0, Math.ceil((new Date(datum) - new Date()) / 86400000));
const fmtDatum   = (iso) => { const [y,m,d] = iso.split("-"); return `${d}.${m}.${y}`; };
const typColor   = (typ) => typ === "Pruefung" ? C.pruefung : C.wettkampf;
const typLabel   = (typ) => typ === "Pruefung" ? "🎓 Prüfung" : "🏅 Wettkampf";

// ── UI-Bausteine ──────────────────────────────────────────────────────────────
function Card({ children, style }) {
  return <div style={{ background: C.card, borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", ...style }}>{children}</div>;
}
function Badge({ label, color }) {
  return <span style={{ background: color + "22", color, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{label}</span>;
}
function GurtBadge({ gurtId, small }) {
  const g = gurtById(gurtId);
  return <span style={{ background: g.hex, border: `2px solid ${g.border}`, color: g.textColor || "#1f2937", borderRadius: 6, padding: small ? "1px 7px" : "3px 10px", fontSize: small ? 10 : 12, fontWeight: 700 }}>{g.kup}</span>;
}
function BackBtn({ onBack, label = "← Zurück" }) {
  return <button onClick={onBack} style={{ background: "none", border: "none", color: C.primary, fontWeight: 700, fontSize: 14, cursor: "pointer", padding: 0, marginBottom: 12 }}>{label}</button>;
}
function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", background: C.card, borderRadius: 10, padding: 4, gap: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: 14 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          style={{ flex: 1, border: "none", borderRadius: 8, padding: "7px 0", fontSize: 11, fontWeight: 600, cursor: "pointer", background: active === t.id ? C.primary : "none", color: active === t.id ? "#fff" : C.muted }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ── Tab: Übersicht ────────────────────────────────────────────────────────────
function TabUebersicht({ t, onChange }) {
  const color = typColor(t.typ);
  const tage  = tageBis(t.datum);
  const gesamtW = t.phasen.reduce((s, p) => s + p.wochen, 0);
  const erfuellt = t.kriterien.filter(k => k.erfuellt).length;
  const bereitPct = Math.round((erfuellt / (t.kriterien.length || 1)) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Card style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          ["Typ",         typLabel(t.typ)],
          ["Datum",       fmtDatum(t.datum)],
          ["Ort",         t.ort || "–"],
          ["Beschreibung",t.beschreibung],
          ...(t.typ === "Pruefung" ? [["Prüfer", t.prueferName || "–"]] : []),
          ["Notizen",     t.notizen || "–"],
        ].map(([k, v]) => (
          <div key={k} style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>{k}</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{v}</div>
          </div>
        ))}
        {t.typ === "Pruefung" && t.zielGurtIds.length > 0 && (
          <div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Zielgurtgrade</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {t.zielGurtIds.map(gid => <GurtBadge key={gid} gurtId={gid} />)}
            </div>
          </div>
        )}
      </Card>

      {/* Bereitschaftsanzeige */}
      <Card>
        <div style={{ fontWeight: 700, fontSize: 13, color: C.primary, marginBottom: 8 }}>Bereitschaft</div>
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 12 }}>
          {[
            [tage,        "Tage",         color],
            [gesamtW,     "Wochen Plan",  C.primary],
            [`${bereitPct}%`, "Kriterien",bereitPct >= 80 ? "#22c55e" : "#f59e0b"],
          ].map(([v, l, c]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: c }}>{v}</div>
              <div style={{ fontSize: 10, color: C.muted }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ background: C.border, borderRadius: 8, height: 10 }}>
          <div style={{ width: `${bereitPct}%`, background: bereitPct >= 80 ? "#22c55e" : "#f59e0b", borderRadius: 8, height: 10, transition: "width 0.4s" }} />
        </div>
      </Card>

      {/* KI-Analyse */}
      <div style={{ background: `linear-gradient(135deg, ${C.primary}, #2563eb)`, borderRadius: 12, padding: "12px 14px", color: "#fff" }}>
        <div style={{ fontSize: 11, opacity: 0.75, marginBottom: 4 }}>🤖 KI-Analyse</div>
        <div style={{ fontSize: 12 }}>
          {tage > 30
            ? `Noch ${tage} Tage – Trainingsplan deckt alle Phasen ab. Empfehlung: Konditionsanteil in der nächsten Woche erhöhen.`
            : tage > 14
            ? `Noch ${tage} Tage – Fokus auf Prüfungsinhalte legen. Kein neues Material einführen.`
            : `Nur noch ${tage} Tage! Ausschließlich Wiederholung und Regeneration – maximale mentale Vorbereitung.`
          }
        </div>
      </div>
    </div>
  );
}

// ── Tab: Phasenplan ───────────────────────────────────────────────────────────
function TabPhasenplan({ t, onChange }) {
  const [showNeu, setShowNeu] = useState(false);
  const [neuPhase, setNeuPhase] = useState({ name: "", wochen: 2, fokus: "" });
  const gesamtW = t.phasen.reduce((s, p) => s + p.wochen, 0);

  const updatePhase = (id, field, val) => onChange({
    ...t, phasen: t.phasen.map(p => p.id === id ? { ...p, [field]: val } : p)
  });
  const deletePhase = (id) => onChange({ ...t, phasen: t.phasen.filter(p => p.id !== id) });
  const addPhase = () => {
    if (!neuPhase.name.trim()) return;
    onChange({ ...t, phasen: [...t.phasen, { ...neuPhase, id: Date.now() }] });
    setNeuPhase({ name: "", wochen: 2, fokus: "" });
    setShowNeu(false);
  };

  const applyVorlage = () => {
    const vorlage = PHASEN_VORLAGEN[t.typ] || PHASEN_VORLAGEN.Pruefung;
    onChange({ ...t, phasen: vorlage.map((p, i) => ({ ...p, id: Date.now() + i })) });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Timeline-Balken */}
      <Card>
        <div style={{ fontWeight: 700, fontSize: 13, color: C.primary, marginBottom: 10 }}>
          Phasenverlauf · {gesamtW} Wochen gesamt
        </div>
        <div style={{ display: "flex", gap: 2, borderRadius: 8, overflow: "hidden", height: 22, marginBottom: 8 }}>
          {t.phasen.map((p, i) => {
            const w = Math.round((p.wochen / gesamtW) * 100);
            return (
              <div key={p.id} style={{ width: `${w}%`, background: PHASEN_FARBEN[i % PHASEN_FARBEN.length], display: "flex", alignItems: "center", justifyContent: "center", minWidth: 4 }}>
                <span style={{ fontSize: 9, color: "#fff", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", padding: "0 3px" }}>{p.name}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {t.phasen.map((p, i) => (
            <Badge key={p.id} label={`${p.name}: ${p.wochen}W`} color={PHASEN_FARBEN[i % PHASEN_FARBEN.length]} />
          ))}
        </div>
      </Card>

      {/* Phasen editierbar */}
      {t.phasen.map((p, i) => {
        const color = PHASEN_FARBEN[i % PHASEN_FARBEN.length];
        return (
          <Card key={p.id} style={{ borderLeft: `4px solid ${color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color }}>Phase {i + 1}: {p.name}</div>
              {t.phasen.length > 1 && (
                <button onClick={() => deletePhase(p.id)} style={{ background: "none", border: "none", color: "#ef4444", fontSize: 16, cursor: "pointer", padding: 0 }}>×</button>
              )}
            </div>
            {/* Name */}
            <input value={p.name} onChange={e => updatePhase(p.id, "name", e.target.value)}
              style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", fontSize: 12, marginBottom: 8, boxSizing: "border-box" }} />
            {/* Dauer */}
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Dauer (Wochen)</div>
            <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
              {[1, 2, 3, 4, 6, 8].map(w => (
                <button key={w} onClick={() => updatePhase(p.id, "wochen", w)}
                  style={{ border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 12, fontWeight: 600, cursor: "pointer", background: p.wochen === w ? color : "#f3f4f6", color: p.wochen === w ? "#fff" : "#374151" }}>
                  {w}W
                </button>
              ))}
            </div>
            {/* Fokus */}
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Fokus-Thema</div>
            <input value={p.fokus} onChange={e => updatePhase(p.id, "fokus", e.target.value)}
              style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", fontSize: 12, boxSizing: "border-box" }} />
          </Card>
        );
      })}

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={applyVorlage}
          style={{ flex: 1, background: "#f3f4f6", border: "none", borderRadius: 10, padding: 10, fontWeight: 600, fontSize: 12, cursor: "pointer", color: C.primary }}>
          🔄 Vorlage laden
        </button>
        <button onClick={() => setShowNeu(true)}
          style={{ flex: 2, background: C.primary, color: "#fff", border: "none", borderRadius: 10, padding: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          + Phase hinzufügen
        </button>
      </div>

      {showNeu && (
        <Card>
          <div style={{ fontWeight: 700, fontSize: 13, color: C.primary, marginBottom: 10 }}>Neue Phase</div>
          <input value={neuPhase.name} onChange={e => setNeuPhase(p => ({ ...p, name: e.target.value }))}
            placeholder="Phasenname" style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
            {[1, 2, 3, 4, 6].map(w => (
              <button key={w} onClick={() => setNeuPhase(p => ({ ...p, wochen: w }))}
                style={{ border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 12, fontWeight: 600, cursor: "pointer", background: neuPhase.wochen === w ? C.primary : "#f3f4f6", color: neuPhase.wochen === w ? "#fff" : "#374151" }}>
                {w}W
              </button>
            ))}
          </div>
          <input value={neuPhase.fokus} onChange={e => setNeuPhase(p => ({ ...p, fokus: e.target.value }))}
            placeholder="Fokus-Thema" style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowNeu(false)} style={{ flex: 1, background: "#f3f4f6", border: "none", borderRadius: 8, padding: 9, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Abbrechen</button>
            <button onClick={addPhase} style={{ flex: 2, background: C.primary, color: "#fff", border: "none", borderRadius: 8, padding: 9, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Speichern</button>
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Tab: Athleten ─────────────────────────────────────────────────────────────
function TabAthleten({ t, onChange }) {
  const toggle = (aid) => onChange({
    ...t, athletenIds: t.athletenIds.includes(aid)
      ? t.athletenIds.filter(x => x !== aid)
      : [...t.athletenIds, aid],
  });
  const color = typColor(t.typ);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>
        {t.athletenIds.length} von {ATHLETEN.length} Athleten zugewiesen
      </div>
      {ATHLETEN.map(a => {
        const aktiv = t.athletenIds.includes(a.id);
        return (
          <div key={a.id} onClick={() => toggle(a.id)}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 12, border: `2px solid ${aktiv ? color : C.border}`, background: aktiv ? color + "11" : "#f9fafb", cursor: "pointer" }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, border: `2px solid ${aktiv ? color : "#d1d5db"}`, background: aktiv ? color : C.card, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", fontWeight: 700, flexShrink: 0 }}>
              {aktiv ? "✓" : ""}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{a.name}</div>
              <div style={{ display: "flex", gap: 5, marginTop: 3, alignItems: "center" }}>
                <GurtBadge gurtId={a.gurtId} small />
                <span style={{ fontSize: 11, color: C.muted }}>{a.gruppe}</span>
              </div>
            </div>
            {aktiv && <Badge label="Zugewiesen" color={color} />}
          </div>
        );
      })}
    </div>
  );
}

// ── Tab: Kriterien ────────────────────────────────────────────────────────────
function TabKriterien({ t, onChange }) {
  const [neuesKrit, setNeuesKrit] = useState("");
  const erfuellt  = t.kriterien.filter(k => k.erfuellt).length;
  const pct       = Math.round((erfuellt / (t.kriterien.length || 1)) * 100);
  const color     = typColor(t.typ);

  const toggleK  = (id) => onChange({ ...t, kriterien: t.kriterien.map(k => k.id === id ? { ...k, erfuellt: !k.erfuellt } : k) });
  const deleteK  = (id) => onChange({ ...t, kriterien: t.kriterien.filter(k => k.id !== id) });
  const addK     = () => {
    if (!neuesKrit.trim()) return;
    onChange({ ...t, kriterien: [...t.kriterien, { id: Date.now(), text: neuesKrit.trim(), erfuellt: false }] });
    setNeuesKrit("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Fortschritt */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
          <span>Kriterien erfüllt</span>
          <span style={{ color: pct >= 80 ? "#22c55e" : "#f59e0b" }}>{erfuellt} / {t.kriterien.length}</span>
        </div>
        <div style={{ background: C.border, borderRadius: 8, height: 10, marginBottom: 6 }}>
          <div style={{ width: `${pct}%`, background: pct >= 80 ? "#22c55e" : "#f59e0b", borderRadius: 8, height: 10, transition: "width 0.4s" }} />
        </div>
        <div style={{ fontSize: 11, color: C.muted }}>{pct}% Bereitschaft</div>
      </Card>

      {/* Liste */}
      <Card>
        <div style={{ fontWeight: 700, fontSize: 13, color: C.primary, marginBottom: 10 }}>
          Bestehens-Kriterien
        </div>
        {t.kriterien.length === 0 && <div style={{ color: "#9ca3af", fontSize: 13 }}>Noch keine Kriterien definiert.</div>}
        {t.kriterien.map((k) => (
          <div key={k.id} style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 10, borderBottom: `1px solid ${C.border}`, marginBottom: 10 }}>
            <button onClick={() => toggleK(k.id)}
              style={{ width: 24, height: 24, borderRadius: 6, border: `2px solid ${k.erfuellt ? "#22c55e" : "#d1d5db"}`, background: k.erfuellt ? "#22c55e" : C.card, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", fontWeight: 700, flexShrink: 0, cursor: "pointer" }}>
              {k.erfuellt ? "✓" : ""}
            </button>
            <span style={{ flex: 1, fontSize: 13, textDecoration: k.erfuellt ? "line-through" : "none", color: k.erfuellt ? "#9ca3af" : "#1f2937" }}>{k.text}</span>
            <button onClick={() => deleteK(k.id)} style={{ background: "none", border: "none", color: "#ef4444", fontSize: 16, cursor: "pointer", padding: 0 }}>×</button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <input value={neuesKrit} onChange={e => setNeuesKrit(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addK()}
            placeholder="Neues Kriterium…"
            style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 13 }} />
          <button onClick={addK} style={{ background: C.primary, color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>+</button>
        </div>
      </Card>
    </div>
  );
}

// ── Termin Detail ─────────────────────────────────────────────────────────────
const DETAIL_TABS = [
  { id: "uebersicht", label: "Übersicht" },
  { id: "phasen",     label: "Phasenplan" },
  { id: "athleten",   label: "Athleten" },
  { id: "kriterien",  label: "Kriterien" },
];

function TerminDetail({ termin: initTermin, onBack, onSave, onDelete }) {
  const [t, setT]         = useState({ ...initTermin, phasen: [...initTermin.phasen], kriterien: [...initTermin.kriterien], athletenIds: [...initTermin.athletenIds] });
  const [tab, setTab]     = useState("uebersicht");
  const [dirty, setDirty] = useState(false);
  const [showDel, setShowDel] = useState(false);

  const update = (updated) => { setT(updated); setDirty(true); };
  const color  = typColor(t.typ);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <BackBtn onBack={onBack} label="← Termine" />

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${color}cc, ${color})`, borderRadius: 12, padding: 16, color: "#fff", marginBottom: 14 }}>
        <div style={{ fontSize: 11, opacity: 0.8 }}>{typLabel(t.typ)}</div>
        <div style={{ fontWeight: 800, fontSize: 17, marginTop: 2 }}>{t.label}</div>
        <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>{fmtDatum(t.datum)} · {t.ort || "–"}</div>
        <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
          {[
            [tageBis(t.datum),                         "Tage"],
            [t.phasen.reduce((s,p)=>s+p.wochen,0),    "Wochen"],
            [t.athletenIds.length,                      "Athleten"],
            [t.kriterien.filter(k=>k.erfuellt).length + "/" + t.kriterien.length, "Kriterien"],
          ].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{v}</div>
              <div style={{ fontSize: 9, opacity: 0.75 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <TabBar tabs={DETAIL_TABS} active={tab} onChange={setTab} />

      {tab === "uebersicht" && <TabUebersicht t={t} onChange={update} />}
      {tab === "phasen"     && <TabPhasenplan t={t} onChange={update} />}
      {tab === "athleten"   && <TabAthleten   t={t} onChange={update} />}
      {tab === "kriterien"  && <TabKriterien  t={t} onChange={update} />}

      {dirty && (
        <button onClick={() => { onSave(t); setDirty(false); }}
          style={{ marginTop: 14, background: C.primary, color: "#fff", border: "none", borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          Änderungen speichern
        </button>
      )}

      {!showDel
        ? <button onClick={() => setShowDel(true)} style={{ marginTop: 8, background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 10, padding: 11, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            Termin löschen
          </button>
        : <Card style={{ marginTop: 8, background: "#fff5f5" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#dc2626", marginBottom: 10 }}>Termin wirklich löschen?</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowDel(false)} style={{ flex: 1, background: "#f3f4f6", border: "none", borderRadius: 8, padding: 10, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Abbrechen</button>
              <button onClick={onDelete} style={{ flex: 2, background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, padding: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Ja, löschen</button>
            </div>
          </Card>
      }
    </div>
  );
}

// ── Neuer Termin ──────────────────────────────────────────────────────────────
function NeuerTermin({ onBack, onAdd }) {
  const [form, setForm] = useState({ typ: "Pruefung", label: "", datum: "", ort: "", beschreibung: "", prueferName: "", notizen: "", zielGurtIds: [], athletenIds: [], phasen: [], kriterien: [] });
  const valid = form.label.trim() && form.datum;

  const toggleGurt = (gid) => setForm(p => ({ ...p, zielGurtIds: p.zielGurtIds.includes(gid) ? p.zielGurtIds.filter(x => x !== gid) : [...p.zielGurtIds, gid] }));

  const handleAdd = () => {
    if (!valid) return;
    const vorlage = PHASEN_VORLAGEN[form.typ] || [];
    onAdd({ ...form, id: "t" + Date.now(), phasen: vorlage.map((p, i) => ({ ...p, id: i + 1 })) });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <BackBtn onBack={onBack} label="← Termine" />
      <Card style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: C.primary }}>Neuen Termin anlegen</div>

        {/* Typ */}
        <div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Typ *</div>
          <div style={{ display: "flex", gap: 6 }}>
            {[["Pruefung","🎓 Prüfung"], ["Wettkampf","🏅 Wettkampf"]].map(([v, l]) => (
              <button key={v} onClick={() => setForm(p => ({ ...p, typ: v }))}
                style={{ flex: 1, border: "none", borderRadius: 8, padding: "8px", fontSize: 13, fontWeight: 600, cursor: "pointer", background: form.typ === v ? typColor(v) : "#f3f4f6", color: form.typ === v ? "#fff" : "#374151" }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Label */}
        <div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Bezeichnung *</div>
          <input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
            placeholder="z. B. Kup-Prüfung 4.–2. Kup"
            style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 13, boxSizing: "border-box" }} />
        </div>

        {/* Datum & Ort */}
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Datum *</div>
            <input type="date" value={form.datum} onChange={e => setForm(p => ({ ...p, datum: e.target.value }))}
              style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 13, boxSizing: "border-box" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Ort</div>
            <input value={form.ort} onChange={e => setForm(p => ({ ...p, ort: e.target.value }))}
              placeholder="Halle / Adresse"
              style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 13, boxSizing: "border-box" }} />
          </div>
        </div>

        {/* Prüfer (nur bei Prüfung) */}
        {form.typ === "Pruefung" && (
          <div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Prüfer</div>
            <input value={form.prueferName} onChange={e => setForm(p => ({ ...p, prueferName: e.target.value }))}
              placeholder="Name des Prüfers"
              style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 13, boxSizing: "border-box" }} />
          </div>
        )}

        {/* Zielgurtgrade (nur bei Prüfung) */}
        {form.typ === "Pruefung" && (
          <div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Zielgurtgrade</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {GURTGRADE.map(g => {
                const aktiv = form.zielGurtIds.includes(g.id);
                return (
                  <button key={g.id} onClick={() => toggleGurt(g.id)}
                    style={{ background: aktiv ? C.primary : g.hex, border: `2px solid ${aktiv ? C.primary : g.border}`, color: aktiv ? "#fff" : (g.textColor || "#1f2937"), borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                    {g.kup}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Notizen */}
        <div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Notizen</div>
          <textarea value={form.notizen} onChange={e => setForm(p => ({ ...p, notizen: e.target.value }))}
            placeholder="Anmeldeschluss, Hinweise…" rows={2}
            style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 13, resize: "none", boxSizing: "border-box", fontFamily: "system-ui" }} />
        </div>

        <div style={{ fontSize: 11, color: C.muted }}>Phasenplan & Kriterien können nach dem Anlegen konfiguriert werden. Standardvorlage wird automatisch geladen.</div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onBack} style={{ flex: 1, background: "#f3f4f6", border: "none", borderRadius: 10, padding: 11, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Abbrechen</button>
          <button onClick={handleAdd} disabled={!valid}
            style={{ flex: 2, background: valid ? C.primary : "#9ca3af", color: "#fff", border: "none", borderRadius: 10, padding: 11, fontWeight: 700, fontSize: 13, cursor: valid ? "pointer" : "default" }}>
            Termin anlegen
          </button>
        </div>
      </Card>
    </div>
  );
}

// ── Terminliste (Hauptkomponente, export) ──────────────────────────────────────
export function Pruefungen() {
  const [termine, setTermine]   = useState(INIT_TERMINE);
  const [view, setView]         = useState("liste");
  const [sel, setSel]           = useState(null);
  const [filter, setFilter]     = useState("Alle");

  const save   = (updated) => { setTermine(p => p.map(t => t.id === updated.id ? updated : t)); setView("liste"); };
  const add    = (neu)     => { setTermine(p => [...p, neu]); setView("liste"); };
  const del    = ()        => { setTermine(p => p.filter(t => t.id !== sel.id)); setView("liste"); };

  if (view === "detail" && sel) return <TerminDetail termin={sel} onBack={() => setView("liste")} onSave={save} onDelete={del} />;
  if (view === "neu")           return <NeuerTermin  onBack={() => setView("liste")} onAdd={add} />;

  const gefiltert = filter === "Alle" ? termine : termine.filter(t => t.typ === filter);
  const naechster = [...termine].sort((a, b) => new Date(a.datum) - new Date(b.datum))[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Filter */}
      <div style={{ display: "flex", gap: 6 }}>
        {[["Alle","Alle"], ["Pruefung","🎓 Prüfungen"], ["Wettkampf","🏅 Wettkämpfe"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            style={{ border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", background: filter === v ? C.primary : C.card, color: filter === v ? "#fff" : "#374151", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
            {l}
          </button>
        ))}
      </div>

      {/* Zeitstrahl */}
      <Card>
        <div style={{ fontWeight: 700, fontSize: 13, color: C.primary, marginBottom: 12 }}>Zeitstrahl</div>
        <div style={{ position: "relative", paddingLeft: 20 }}>
          <div style={{ position: "absolute", left: 7, top: 0, bottom: 0, width: 2, background: C.border, borderRadius: 2 }} />
          {[...termine].sort((a,b) => new Date(a.datum) - new Date(b.datum)).map(t => {
            const color = typColor(t.typ);
            const tage  = tageBis(t.datum);
            return (
              <div key={t.id} onClick={() => { setSel(t); setView("detail"); }}
                style={{ display: "flex", gap: 10, marginBottom: 14, cursor: "pointer" }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: color, border: "2px solid #fff", boxShadow: `0 0 0 2px ${color}`, flexShrink: 0, marginTop: 2, marginLeft: -9 }} />
                <div style={{ flex: 1, background: "#f9fafb", borderRadius: 10, padding: "9px 12px", border: `1px solid ${color}22` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{t.label}</div>
                    <div style={{ background: color + "22", color, borderRadius: 6, padding: "2px 7px", fontSize: 11, fontWeight: 700, flexShrink: 0, marginLeft: 6 }}>{tage}d</div>
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{fmtDatum(t.datum)} · {t.athletenIds.length} Athleten</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Terminkarten */}
      {gefiltert.map(t => {
        const color  = typColor(t.typ);
        const tage   = tageBis(t.datum);
        const gesamtW = t.phasen.reduce((s, p) => s + p.wochen, 0);
        const erfuellt = t.kriterien.filter(k => k.erfuellt).length;
        const bereit = Math.round((erfuellt / (t.kriterien.length || 1)) * 100);
        return (
          <div key={t.id} onClick={() => { setSel(t); setView("detail"); }}
            style={{ background: C.card, borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", cursor: "pointer", borderLeft: `4px solid ${color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 10, color, fontWeight: 700, marginBottom: 2 }}>{typLabel(t.typ).toUpperCase()}</div>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{t.label}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color }}>{tage}</div>
                <div style={{ fontSize: 9, color: C.muted }}>Tage</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>
              {fmtDatum(t.datum)} · {t.ort || "–"} · {gesamtW}W Plan · {t.athletenIds.length} Athleten
            </div>
            {t.typ === "Pruefung" && t.zielGurtIds.length > 0 && (
              <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                {t.zielGurtIds.map(gid => <GurtBadge key={gid} gurtId={gid} small />)}
              </div>
            )}
            {/* Bereitschaftsbalken */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                <span style={{ color: C.muted }}>Bereitschaft</span>
                <span style={{ fontWeight: 700, color: bereit >= 80 ? "#22c55e" : "#f59e0b" }}>{bereit}%</span>
              </div>
              <div style={{ background: C.border, borderRadius: 6, height: 6 }}>
                <div style={{ width: `${bereit}%`, background: bereit >= 80 ? "#22c55e" : "#f59e0b", borderRadius: 6, height: 6, transition: "width 0.4s" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {t.phasen.map((p, i) => <Badge key={p.id} label={p.name} color={PHASEN_FARBEN[i % PHASEN_FARBEN.length]} />)}
            </div>
            <div style={{ textAlign: "right", color: "#9ca3af", fontSize: 13, marginTop: 6 }}>›</div>
          </div>
        );
      })}

      <button onClick={() => setView("neu")} style={{ background: C.primary, color: "#fff", border: "none", borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
        + Termin hinzufügen
      </button>
    </div>
  );
}

// ── App-Shell ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard",   label: "Dashboard",   icon: "🏠" },
  { id: "planung",     label: "Planung",     icon: "📅" },
  { id: "athleten",    label: "Athleten",    icon: "🥋" },
  { id: "anwesenheit", label: "Anwesenheit", icon: "✅" },
  { id: "pruefungen",  label: "Prüfungen",   icon: "🏆" },
];
const ALL_NAV = [
  ...NAV_ITEMS,
  { id: "auswertung",   label: "Auswertung",   icon: "📊" },
  { id: "bibliothek",   label: "Bibliothek",   icon: "📚" },
  { id: "einstellungen",label: "Einstellungen",icon: "⚙️" },
];

function Placeholder({ title }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, color: "#9ca3af" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🚧</div>
      <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: 13, marginTop: 4 }}>In Haupt-App integriert</div>
    </div>
  );
}

export default function App() {
  const [active, setActive]     = useState("pruefungen");
  const [menuOpen, setMenuOpen] = useState(false);
  const current = ALL_NAV.find(n => n.id === active) || NAV_ITEMS[4];

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: C.bg, minHeight: "100vh", maxWidth: 420, margin: "0 auto" }}>
      <div style={{ background: C.primary, color: "#fff", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontSize: 11, opacity: 0.65 }}>Taekwondo</div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>{current.icon} {current.label}</div>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer" }}>☰</button>
      </div>

      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex" }}>
          <div style={{ background: C.primary, width: 240, padding: "24px 0", display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 16, padding: "0 20px 16px" }}>🥋 TKD Trainer</div>
            {ALL_NAV.map(n => (
              <button key={n.id} onClick={() => { setActive(n.id); setMenuOpen(false); }}
                style={{ background: active === n.id ? "rgba(255,255,255,0.15)" : "none", border: "none", color: "#fff", textAlign: "left", padding: "12px 20px", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                <span>{n.icon}</span><span>{n.label}</span>
              </button>
            ))}
          </div>
          <div style={{ flex: 1, background: "rgba(0,0,0,0.4)" }} onClick={() => setMenuOpen(false)} />
        </div>
      )}

      <div style={{ padding: 16 }}>
        {active === "pruefungen" ? <Pruefungen /> : <Placeholder title={current.label} />}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 420, background: C.card, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-around", padding: "8px 0", zIndex: 50 }}>
        {NAV_ITEMS.map(n => (
          <button key={n.id} onClick={() => setActive(n.id)}
            style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer", color: active === n.id ? C.primary : "#9ca3af" }}>
            <span style={{ fontSize: 20 }}>{n.icon}</span>
            <span style={{ fontSize: 9, fontWeight: active === n.id ? 700 : 400 }}>{n.label}</span>
          </button>
        ))}
      </div>
      <div style={{ height: 70 }} />
    </div>
  );
}
