import { useState } from "react";

// ── Konstanten ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "🏠" },
  { id: "planung", label: "Planung", icon: "📅" },
  { id: "athleten", label: "Athleten", icon: "🥋" },
  { id: "gruppen", label: "Anwesenheit", icon: "✅" },
  { id: "pruefungen", label: "Prüfungen", icon: "🏆" },
  { id: "bibliothek", label: "Bibliothek", icon: "📚" },
  { id: "auswertung", label: "Auswertung", icon: "📊" },
  { id: "einstellungen", label: "Einstellungen", icon: "⚙️" },
];

const GURTGRADE = [
  { id: "g10", kup: "10. Kup", farbe: "Weiß",       hex: "#f9fafb", border: "#d1d5db" },
  { id: "g9",  kup: "9. Kup",  farbe: "Weiß-Gelb",  hex: "#fef9c3", border: "#fbbf24" },
  { id: "g8",  kup: "8. Kup",  farbe: "Gelb",        hex: "#fef08a", border: "#eab308" },
  { id: "g7",  kup: "7. Kup",  farbe: "Gelb-Grün",  hex: "#dcfce7", border: "#22c55e" },
  { id: "g6",  kup: "6. Kup",  farbe: "Grün",        hex: "#bbf7d0", border: "#16a34a" },
  { id: "g5",  kup: "5. Kup",  farbe: "Grün-Blau",  hex: "#bfdbfe", border: "#3b82f6" },
  { id: "g4",  kup: "4. Kup",  farbe: "Blau",        hex: "#93c5fd", border: "#1d4ed8" },
  { id: "g3",  kup: "3. Kup",  farbe: "Blau-Rot",   hex: "#fecaca", border: "#ef4444" },
  { id: "g2",  kup: "2. Kup",  farbe: "Rot",         hex: "#fca5a5", border: "#dc2626" },
  { id: "g1",  kup: "1. Kup",  farbe: "Rot-Schwarz", hex: "#1f2937", border: "#111827", textColor: "#fff" },
  { id: "d1",  kup: "1. Dan",  farbe: "Schwarz",     hex: "#111827", border: "#111827", textColor: "#fff" },
  { id: "d2",  kup: "2. Dan",  farbe: "Schwarz",     hex: "#111827", border: "#111827", textColor: "#fff" },
];

const SCHWERPUNKTE_LIST = [
  { name: "Kyorugi", color: "#ef4444" },
  { name: "Poomsae", color: "#3b82f6" },
  { name: "Kondition", color: "#22c55e" },
  { name: "Theorie", color: "#f59e0b" },
  { name: "Technik", color: "#8b5cf6" },
  { name: "Selbstverteidigung", color: "#ec4899" },
];

const SCHWERPUNKTE_STATS = [
  { name: "Kyorugi", soll: 40, ist: 35, color: "#ef4444" },
  { name: "Poomsae", soll: 30, ist: 28, color: "#3b82f6" },
  { name: "Kondition", soll: 20, ist: 25, color: "#22c55e" },
  { name: "Theorie", soll: 10, ist: 12, color: "#f59e0b" },
];

const GRUPPEN = ["Erwachsene", "Jugend", "Fortgeschrittene"];
const TAGE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const DAUERN = [45, 60, 90, 120];

const INIT_ATHLETEN = [
  { id: 1, name: "Max Mustermann", geb: "2005-03-12", gurtId: "g4", gruppe: "Erwachsene", ziele: ["Wettkampf Kyorugi"], termine: ["t1", "t2"], anwesenheit: 82, graduierungen: [{ datum: "2023-06-10", von: "g5", nach: "g4", note: "Gut" }] },
  { id: 2, name: "Lena Schmidt",   geb: "2010-07-22", gurtId: "g7", gruppe: "Jugend",     ziele: ["Poomsae verbessern"], termine: ["t1"], anwesenheit: 91, graduierungen: [{ datum: "2023-11-05", von: "g8", nach: "g7", note: "Sehr gut" }] },
  { id: 3, name: "Jonas Weber",    geb: "2001-11-03", gurtId: "g1", gruppe: "Fortgeschrittene", ziele: ["Dan-Prüfung"], termine: ["t3"], anwesenheit: 76, graduierungen: [{ datum: "2024-02-18", von: "g2", nach: "g1", note: "Bestanden" }] },
  { id: 4, name: "Sara Bauer",     geb: "2008-05-17", gurtId: "g6", gruppe: "Jugend",     ziele: [], termine: [], anwesenheit: 68, graduierungen: [] },
  { id: 5, name: "Tom Fischer",    geb: "2003-09-01", gurtId: "g3", gruppe: "Erwachsene", ziele: [], termine: ["t2"], anwesenheit: 55, graduierungen: [] },
  { id: 6, name: "Mia Krause",     geb: "2012-01-14", gurtId: "g9", gruppe: "Jugend",     ziele: [], termine: [], anwesenheit: 88, graduierungen: [] },
];

const INIT_EINHEITEN_LOG = [
  { id: "e1", datum: "2026-03-17", gruppe: "Erwachsene", dauer: 90, schwerpunkt: "Kyorugi" },
  { id: "e2", datum: "2026-03-19", gruppe: "Jugend",     dauer: 60, schwerpunkt: "Poomsae" },
  { id: "e3", datum: "2026-03-21", gruppe: "Erwachsene", dauer: 90, schwerpunkt: "Kondition" },
];

const INIT_TERMINE = [
  {
    id: "t1", typ: "Pruefung", label: "Kup-Prüfung (6.–4. Kup)", datum: "2026-04-12",
    beschreibung: "Prüfung für 6., 5. und 4. Kup", zielGurtIds: ["g6", "g5", "g4"],
    athletenIds: [1, 2],
    phasen: [
      { name: "Grundlagen auffrischen", wochen: 2, fokus: "Technik, Poomsae" },
      { name: "Intensivphase", wochen: 3, fokus: "Prüfungsinhalte, Kondition" },
      { name: "Feinschliff", wochen: 1, fokus: "Poomsae, Theorie" },
    ],
    kriterien: ["Pflicht-Poomsae beherrschen", "Grundtechniken sauber", "Theoriefragen bestehen", "Mindeststunden erfüllt"],
    notizen: "Prüfer: Master Kim",
  },
  {
    id: "t2", typ: "Wettkampf", label: "Stadtmeisterschaft", datum: "2026-05-03",
    beschreibung: "Kyorugi & Poomsae Kategorien", zielGurtIds: [],
    athletenIds: [1],
    phasen: [
      { name: "Aufbauphase", wochen: 3, fokus: "Kyorugi-Kombinationen" },
      { name: "Intensivphase", wochen: 3, fokus: "Sparring, Taktik" },
      { name: "Tapering", wochen: 1, fokus: "Leichte Einheiten, Regeneration" },
    ],
    kriterien: ["Gewichtsklasse einhalten", "Regelwerk kennen", "Kampftaktik festlegen"],
    notizen: "Anmeldeschluss: 20.04.2026",
  },
  {
    id: "t3", typ: "Pruefung", label: "Dan-Prüfung", datum: "2026-06-15",
    beschreibung: "1. Dan Prüfung", zielGurtIds: ["d1"],
    athletenIds: [3],
    phasen: [
      { name: "Aufbauphase", wochen: 4, fokus: "Alle Poomsae, Selbstverteidigung" },
      { name: "Intensivphase", wochen: 4, fokus: "Kyorugi, Bruchtest" },
      { name: "Tapering", wochen: 2, fokus: "Theorie, mentale Vorbereitung" },
    ],
    kriterien: ["Alle Kup-Poomsae beherrschen", "Koryo & Keumgang", "Bruchtest", "Schriftliche Prüfung", "Kampf bestehen"],
    notizen: "Verbandsprüfung – Anmeldung über Verband",
  },
];

// ── Hilfsfunktionen ───────────────────────────────────────────────────────────
const gurtById = (id) => GURTGRADE.find(g => g.id === id) || GURTGRADE[0];
const alter = (geb) => {
  const d = new Date(geb), now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) a--;
  return a;
};
const tageBis = (datum) => {
  const diff = new Date(datum) - new Date();
  return Math.max(0, Math.ceil(diff / 86400000));
};
const formatDatum = (iso) => {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
};

// ── UI Bausteine ──────────────────────────────────────────────────────────────
function GurtBadge({ gurtId, small }) {
  const g = gurtById(gurtId);
  return (
    <span style={{ background: g.hex, border: `2px solid ${g.border}`, color: g.textColor || "#1f2937", borderRadius: 6, padding: small ? "1px 7px" : "3px 10px", fontSize: small ? 10 : 12, fontWeight: 700 }}>{g.kup}</span>
  );
}
function Badge({ label, color }) {
  return <span style={{ background: color + "22", color, borderRadius: 6, padding: "2px 7px", fontSize: 11, fontWeight: 600 }}>{label}</span>;
}
function ProgressBar({ soll, ist, color }) {
  return (
    <div style={{ background: "#e5e7eb", borderRadius: 6, height: 8 }}>
      <div style={{ width: `${ist}%`, background: color, borderRadius: 6, height: 8 }} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PRÜFUNGEN & WETTKÄMPFE
// ══════════════════════════════════════════════════════════════════════════════

function TerminDetail({ termin: initTermin, athleten, onBack, onSave }) {
  const [t, setT] = useState({ ...initTermin, phasen: [...initTermin.phasen], kriterien: [...initTermin.kriterien], athletenIds: [...initTermin.athletenIds] });
  const [tab, setTab] = useState("uebersicht");
  const [neuesKrit, setNeuesKrit] = useState("");

  const isPruefung = t.typ === "Pruefung";
  const tage = tageBis(t.datum);
  const gesamtWochen = t.phasen.reduce((s, p) => s + p.wochen, 0);

  const tabs = [
    { id: "uebersicht", label: "Übersicht" },
    { id: "phasen", label: "Phasenplan" },
    { id: "athleten", label: "Athleten" },
    { id: "kriterien", label: "Kriterien" },
  ];

  const toggleAthlet = (aid) => setT(p => ({
    ...p, athletenIds: p.athletenIds.includes(aid) ? p.athletenIds.filter(x => x !== aid) : [...p.athletenIds, aid]
  }));

  const addKrit = () => {
    if (!neuesKrit.trim()) return;
    setT(p => ({ ...p, kriterien: [...p.kriterien, neuesKrit.trim()] }));
    setNeuesKrit("");
  };

  const updatePhase = (i, field, val) => setT(p => ({
    ...p, phasen: p.phasen.map((ph, idx) => idx === i ? { ...ph, [field]: val } : ph)
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#1e3a5f", fontWeight: 700, fontSize: 14, cursor: "pointer", textAlign: "left", padding: 0 }}>← Termine</button>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${isPruefung ? "#1d4ed8, #3b82f6" : "#b91c1c, #ef4444"})`, borderRadius: 12, padding: 16, color: "#fff" }}>
        <div style={{ fontSize: 11, opacity: 0.75 }}>{isPruefung ? "🎓 Prüfung" : "🏅 Wettkampf"}</div>
        <div style={{ fontWeight: 700, fontSize: 16, marginTop: 2 }}>{t.label}</div>
        <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>{formatDatum(t.datum)}</div>
        <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{tage}</div>
            <div style={{ fontSize: 10, opacity: 0.75 }}>Tage</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{gesamtWochen}</div>
            <div style={{ fontSize: 10, opacity: 0.75 }}>Wochen Plan</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{t.athletenIds.length}</div>
            <div style={{ fontSize: 10, opacity: 0.75 }}>Athleten</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: "#fff", borderRadius: 10, padding: 4, gap: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
        {tabs.map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)}
            style={{ flex: 1, border: "none", borderRadius: 8, padding: "7px 0", fontSize: 11, fontWeight: 600, cursor: "pointer", background: tab === tb.id ? "#1e3a5f" : "none", color: tab === tb.id ? "#fff" : "#6b7280" }}>
            {tb.label}
          </button>
        ))}
      </div>

      {/* Tab: Übersicht */}
      {tab === "uebersicht" && (
        <div style={{ background: "#fff", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: 10 }}>
          {[["Typ", isPruefung ? "Prüfung" : "Wettkampf"], ["Datum", formatDatum(t.datum)], ["Beschreibung", t.beschreibung], ["Notizen", t.notizen]].map(([k, v]) => (
            <div key={k} style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: 8 }}>
              <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2 }}>{k}</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{v || "–"}</div>
            </div>
          ))}
          {isPruefung && t.zielGurtIds.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 6 }}>Zielgurtgrade</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {t.zielGurtIds.map(gid => <GurtBadge key={gid} gurtId={gid} />)}
              </div>
            </div>
          )}
          {/* KI Hinweis */}
          <div style={{ background: "linear-gradient(135deg, #1e3a5f, #2563eb)", borderRadius: 10, padding: 12, color: "#fff", marginTop: 4 }}>
            <div style={{ fontSize: 11, opacity: 0.75, marginBottom: 4 }}>🤖 KI-Analyse</div>
            <div style={{ fontSize: 12 }}>
              {tage > 30
                ? `Noch ${tage} Tage. Aktueller Trainingsplan deckt alle Phasen ab. Empfehlung: Konditionsanteil in KW 14 erhöhen.`
                : `Nur noch ${tage} Tage! Fokus auf Feinschliff und Regeneration legen. Kein neues Material einführen.`}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Phasenplan */}
      {tab === "phasen" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Timeline */}
          <div style={{ background: "#fff", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Phasenverlauf ({gesamtWochen} Wochen)</div>
            <div style={{ display: "flex", gap: 2, borderRadius: 8, overflow: "hidden", height: 24, marginBottom: 8 }}>
              {t.phasen.map((p, i) => {
                const colors = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b"];
                const w = Math.round((p.wochen / gesamtWochen) * 100);
                return (
                  <div key={i} style={{ width: `${w}%`, background: colors[i % colors.length], display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 9, color: "#fff", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", padding: "0 4px" }}>{p.name}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {t.phasen.map((p, i) => {
                const colors = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b"];
                return <Badge key={i} label={`${p.name}: ${p.wochen}W`} color={colors[i % colors.length]} />;
              })}
            </div>
          </div>

          {/* Phasen editierbar */}
          {t.phasen.map((p, i) => {
            const colors = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b"];
            return (
              <div key={i} style={{ background: "#fff", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", borderLeft: `4px solid ${colors[i % colors.length]}` }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: colors[i % colors.length] }}>Phase {i + 1}: {p.name}</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  {[1, 2, 3, 4, 6].map(w => (
                    <button key={w} onClick={() => updatePhase(i, "wochen", w)}
                      style={{ border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 12, fontWeight: 600, cursor: "pointer", background: p.wochen === w ? colors[i % colors.length] : "#f3f4f6", color: p.wochen === w ? "#fff" : "#374151" }}>
                      {w}W
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>Fokus</div>
                <input value={p.fokus} onChange={e => updatePhase(i, "fokus", e.target.value)}
                  style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 10px", fontSize: 12, boxSizing: "border-box" }} />
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Athleten */}
      {tab === "athleten" && (
        <div style={{ background: "#fff", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Athleten zuordnen</div>
          {athleten.map(a => {
            const aktiv = t.athletenIds.includes(a.id);
            return (
              <div key={a.id} onClick={() => toggleAthlet(a.id)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: `2px solid ${aktiv ? "#1e3a5f" : "#e5e7eb"}`, background: aktiv ? "#1e3a5f11" : "#f9fafb", cursor: "pointer" }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${aktiv ? "#1e3a5f" : "#d1d5db"}`, background: aktiv ? "#1e3a5f" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", flexShrink: 0, fontWeight: 700 }}>
                  {aktiv ? "✓" : ""}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{a.name}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 3, alignItems: "center" }}>
                    <GurtBadge gurtId={a.gurtId} small />
                    <span style={{ fontSize: 11, color: "#6b7280" }}>{a.gruppe}</span>
                  </div>
                </div>
                {aktiv && isPruefung && (
                  <div style={{ fontSize: 10, color: "#22c55e", fontWeight: 700 }}>✓ Zugewiesen</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Kriterien */}
      {tab === "kriterien" && (
        <div style={{ background: "#fff", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>Bestehens-Kriterien</div>
          {t.kriterien.map((k, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 8, borderBottom: "1px solid #f3f4f6" }}>
              <span style={{ fontSize: 14 }}>☑️</span>
              <span style={{ flex: 1, fontSize: 13 }}>{k}</span>
              <button onClick={() => setT(p => ({ ...p, kriterien: p.kriterien.filter((_, idx) => idx !== i) }))}
                style={{ background: "none", border: "none", color: "#ef4444", fontSize: 16, cursor: "pointer" }}>×</button>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8 }}>
            <input value={neuesKrit} onChange={e => setNeuesKrit(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addKrit()}
              placeholder="Neues Kriterium..." style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13 }} />
            <button onClick={addKrit} style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontWeight: 700, cursor: "pointer" }}>+</button>
          </div>
        </div>
      )}

      <button onClick={() => onSave(t)} style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
        Speichern
      </button>
    </div>
  );
}

function Pruefungen({ athleten }) {
  const [termine, setTermine] = useState(INIT_TERMINE);
  const [sel, setSel] = useState(null);
  const [filter, setFilter] = useState("Alle");

  const save = (updated) => {
    setTermine(p => p.map(t => t.id === updated.id ? updated : t));
    setSel(null);
  };

  if (sel) return <TerminDetail termin={sel} athleten={athleten} onBack={() => setSel(null)} onSave={save} />;

  const gefiltert = filter === "Alle" ? termine : termine.filter(t => (filter === "Pruefung" ? t.typ === "Pruefung" : t.typ === "Wettkampf"));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Filter */}
      <div style={{ display: "flex", gap: 6 }}>
        {[["Alle", "Alle"], ["Pruefung", "🎓 Prüfungen"], ["Wettkampf", "🏅 Wettkämpfe"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            style={{ border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", background: filter === v ? "#1e3a5f" : "#fff", color: filter === v ? "#fff" : "#374151", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
            {l}
          </button>
        ))}
      </div>

      {/* Timeline-Übersicht */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Zeitstrahl (nächste 3 Monate)</div>
        <div style={{ position: "relative", paddingLeft: 16 }}>
          <div style={{ position: "absolute", left: 6, top: 0, bottom: 0, width: 2, background: "#e5e7eb", borderRadius: 2 }} />
          {termine.map((t, i) => {
            const isPruefung = t.typ === "Pruefung";
            const color = isPruefung ? "#3b82f6" : "#ef4444";
            const tage = tageBis(t.datum);
            return (
              <div key={t.id} onClick={() => setSel(t)} style={{ display: "flex", gap: 12, marginBottom: 14, cursor: "pointer" }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: color, border: "2px solid #fff", boxShadow: `0 0 0 2px ${color}`, flexShrink: 0, marginTop: 2, marginLeft: -8 }} />
                <div style={{ flex: 1, background: "#f9fafb", borderRadius: 10, padding: "10px 12px", border: `1px solid ${color}22` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{t.label}</div>
                    <div style={{ background: color + "22", color, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>{tage}d</div>
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{formatDatum(t.datum)} · {t.athletenIds.length} Athleten</div>
                  <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                    {t.phasen.map((p, pi) => {
                      const colors = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b"];
                      return <Badge key={pi} label={`${p.name} ${p.wochen}W`} color={colors[pi % colors.length]} />;
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Karten */}
      {gefiltert.map(t => {
        const isPruefung = t.typ === "Pruefung";
        const color = isPruefung ? "#3b82f6" : "#ef4444";
        const tage = tageBis(t.datum);
        const gesamtW = t.phasen.reduce((s, p) => s + p.wochen, 0);
        return (
          <div key={t.id} onClick={() => setSel(t)}
            style={{ background: "#fff", borderRadius: 12, padding: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", cursor: "pointer", borderLeft: `4px solid ${color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 10, color, fontWeight: 700, marginBottom: 2 }}>{isPruefung ? "🎓 PRÜFUNG" : "🏅 WETTKAMPF"}</div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{t.label}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color }}>{tage}</div>
                <div style={{ fontSize: 9, color: "#9ca3af" }}>Tage</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>{formatDatum(t.datum)} · {gesamtW} Wochen Plan · {t.athletenIds.length} Athleten</div>
            {isPruefung && t.zielGurtIds.length > 0 && (
              <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                {t.zielGurtIds.map(gid => <GurtBadge key={gid} gurtId={gid} small />)}
              </div>
            )}
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {t.phasen.map((p, pi) => {
                const colors = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b"];
                return <Badge key={pi} label={p.name} color={colors[pi % colors.length]} />;
              })}
            </div>
            <div style={{ textAlign: "right", color: "#9ca3af", fontSize: 13, marginTop: 4 }}>›</div>
          </div>
        );
      })}

      <button style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
        + Termin hinzufügen
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ANWESENHEIT
// ══════════════════════════════════════════════════════════════════════════════
function Anwesenheit() {
  const [athleten, setAthletен] = useState(INIT_ATHLETEN);
  const [einheiten] = useState(INIT_EINHEITEN_LOG);
  const [selEinheit, setSelEinheit] = useState(einheiten[0].id);
  const [anwLog, setAnwLog] = useState({
    e1: { 1: true, 2: false, 3: true },
    e2: { 2: true, 4: true, 6: true },
    e3: { 1: true, 3: false, 5: true },
  });
  const [filter, setFilter] = useState("Alle");
  const [ansicht, setAnsicht] = useState("einheit"); // einheit | verlauf

  const einheit = einheiten.find(e => e.id === selEinheit);
  const log = anwLog[selEinheit] || {};

  const toggleAnw = (aid) => {
    setAnwLog(prev => ({
      ...prev,
      [selEinheit]: { ...prev[selEinheit], [aid]: !prev[selEinheit]?.[aid] }
    }));
  };

  const gruppenFilter = filter === "Alle" ? athleten : athleten.filter(a => a.gruppe === filter);
  const anwesend = Object.values(log).filter(Boolean).length;
  const gesamt = gruppenFilter.length;

  // Verlaufsansicht: alle Einheiten × alle Athleten
  const allAthleten = filter === "Alle" ? athleten : athleten.filter(a => a.gruppe === filter);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Ansicht-Toggle */}
      <div style={{ display: "flex", background: "#fff", borderRadius: 10, padding: 4, gap: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
        {[["einheit", "Einheit"], ["verlauf", "Verlauf"]].map(([v, l]) => (
          <button key={v} onClick={() => setAnsicht(v)}
            style={{ flex: 1, border: "none", borderRadius: 8, padding: "8px 0", fontSize: 13, fontWeight: 600, cursor: "pointer", background: ansicht === v ? "#1e3a5f" : "none", color: ansicht === v ? "#fff" : "#6b7280" }}>
            {l}
          </button>
        ))}
      </div>

      {/* Gruppen-Filter */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {["Alle", ...GRUPPEN].map(g => (
          <button key={g} onClick={() => setFilter(g)}
            style={{ border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", background: filter === g ? "#1e3a5f" : "#fff", color: filter === g ? "#fff" : "#374151", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
            {g}
          </button>
        ))}
      </div>

      {/* ── Einheitsansicht ── */}
      {ansicht === "einheit" && (
        <>
          {/* Einheit wählen */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {einheiten.map(e => (
              <button key={e.id} onClick={() => setSelEinheit(e.id)}
                style={{ background: selEinheit === e.id ? "#1e3a5f" : "#fff", color: selEinheit === e.id ? "#fff" : "#1f2937", border: "none", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{formatDatum(e.datum)}</div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>{e.gruppe} · {e.dauer} min · {e.schwerpunkt}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.75 }}>
                  {Object.values(anwLog[e.id] || {}).filter(Boolean).length} anw.
                </div>
              </button>
            ))}
          </div>

          {/* Statistik */}
          <div style={{ background: "linear-gradient(135deg, #1e3a5f, #2563eb)", borderRadius: 12, padding: "12px 16px", color: "#fff", display: "flex", justifyContent: "space-around" }}>
            {[
              ["Anwesend", anwesend, "#4ade80"],
              ["Abwesend", gesamt - anwesend, "#f87171"],
              ["Quote", `${gesamt > 0 ? Math.round((anwesend / gesamt) * 100) : 0}%`, "#fbbf24"],
            ].map(([l, v, c]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: c }}>{v}</div>
                <div style={{ fontSize: 10, opacity: 0.75 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Athletenliste zum Abhaken */}
          <div style={{ background: "#fff", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
              {einheit ? `${formatDatum(einheit.datum)} – ${einheit.gruppe}` : "Einheit"}
            </div>

            {/* Schnellaktionen */}
            <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
              <button onClick={() => {
                const ids = {};
                gruppenFilter.forEach(a => ids[a.id] = true);
                setAnwLog(p => ({ ...p, [selEinheit]: ids }));
              }} style={{ flex: 1, background: "#dcfce7", color: "#16a34a", border: "none", borderRadius: 8, padding: "7px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                ✓ Alle anwesend
              </button>
              <button onClick={() => setAnwLog(p => ({ ...p, [selEinheit]: {} }))}
                style={{ flex: 1, background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 8, padding: "7px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                ✗ Alle abwesend
              </button>
            </div>

            {gruppenFilter.map(a => {
              const anw = !!log[a.id];
              return (
                <div key={a.id} onClick={() => toggleAnw(a.id)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, border: `2px solid ${anw ? "#22c55e" : "#e5e7eb"}`, background: anw ? "#f0fdf4" : "#f9fafb", cursor: "pointer", transition: "all 0.15s" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, border: `2px solid ${anw ? "#22c55e" : "#d1d5db"}`, background: anw ? "#22c55e" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#fff", fontWeight: 700, flexShrink: 0 }}>
                    {anw ? "✓" : ""}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{a.name}</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 2 }}>
                      <GurtBadge gurtId={a.gurtId} small />
                      <span style={{ fontSize: 11, color: "#6b7280" }}>{a.gruppe}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: a.anwesenheit >= 80 ? "#22c55e" : a.anwesenheit >= 60 ? "#f59e0b" : "#ef4444" }}>
                    {a.anwesenheit}%
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Verlaufsansicht ── */}
      {ansicht === "verlauf" && (
        <div style={{ background: "#fff", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Anwesenheitsverlauf</div>
          {/* Header */}
          <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
            <div style={{ width: 110, fontSize: 10, color: "#9ca3af", fontWeight: 600 }}>Athlet</div>
            {einheiten.map(e => (
              <div key={e.id} style={{ flex: 1, textAlign: "center", fontSize: 9, color: "#6b7280", fontWeight: 700 }}>
                {formatDatum(e.datum).slice(0, 5)}
              </div>
            ))}
            <div style={{ width: 36, textAlign: "center", fontSize: 10, color: "#9ca3af", fontWeight: 600 }}>Ø</div>
          </div>
          {allAthleten.map(a => {
            const stimmen = einheiten.filter(e => anwLog[e.id]?.[a.id]).length;
            const quote = Math.round((stimmen / einheiten.length) * 100);
            return (
              <div key={a.id} style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 8 }}>
                <div style={{ width: 110, fontSize: 11, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
                {einheiten.map(e => {
                  const anw = !!anwLog[e.id]?.[a.id];
                  return (
                    <div key={e.id} onClick={() => { setSelEinheit(e.id); toggleAnw(a.id); }}
                      style={{ flex: 1, height: 28, borderRadius: 6, background: anw ? "#22c55e" : "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 13 }}>
                      {anw ? "✓" : "✗"}
                    </div>
                  );
                })}
                <div style={{ width: 36, textAlign: "center", fontSize: 12, fontWeight: 700, color: quote >= 80 ? "#22c55e" : quote >= 60 ? "#f59e0b" : "#ef4444" }}>
                  {quote}%
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ATHLETEN
// ══════════════════════════════════════════════════════════════════════════════
function AthletProfil({ athlet, termine, onBack, onSave }) {
  const [a, setA] = useState({ ...athlet, graduierungen: [...athlet.graduierungen], termine: [...athlet.termine], ziele: [...athlet.ziele] });
  const [tab, setTab] = useState("stamm");
  const [neuesZiel, setNeuesZiel] = useState("");
  const [neueGrad, setNeueGrad] = useState({ datum: "", von: athlet.gurtId, nach: "", note: "" });
  const [showGradForm, setShowGradForm] = useState(false);

  const gurt = gurtById(a.gurtId);
  const naechsterIdx = GURTGRADE.findIndex(g => g.id === a.gurtId) + 1;
  const naechster = GURTGRADE[naechsterIdx];

  const addZiel = () => { if (!neuesZiel.trim()) return; setA(p => ({ ...p, ziele: [...p.ziele, neuesZiel.trim()] })); setNeuesZiel(""); };
  const toggleTermin = (tid) => setA(p => ({ ...p, termine: p.termine.includes(tid) ? p.termine.filter(x => x !== tid) : [...p.termine, tid] }));
  const addGrad = () => {
    if (!neueGrad.datum || !neueGrad.nach) return;
    setA(p => ({ ...p, gurtId: neueGrad.nach, graduierungen: [...p.graduierungen, { ...neueGrad }] }));
    setShowGradForm(false);
  };

  const tabs = [{ id: "stamm", label: "Profil" }, { id: "graduierung", label: "Graduierung" }, { id: "termine", label: "Termine" }, { id: "ziele", label: "Ziele" }];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#1e3a5f", fontWeight: 700, fontSize: 14, cursor: "pointer", textAlign: "left", padding: 0 }}>← Athleten</button>
      <div style={{ background: "linear-gradient(135deg, #1e3a5f, #2563eb)", borderRadius: 12, padding: 16, color: "#fff", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "50%", width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🥋</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{a.name}</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>{alter(a.geb)} Jahre · {a.gruppe}</div>
          <div style={{ marginTop: 6 }}><GurtBadge gurtId={a.gurtId} /></div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{a.anwesenheit}%</div>
          <div style={{ fontSize: 10, opacity: 0.75 }}>Anwesenheit</div>
        </div>
      </div>
      <div style={{ display: "flex", background: "#fff", borderRadius: 10, padding: 4, gap: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
        {tabs.map(tb => <button key={tb.id} onClick={() => setTab(tb.id)} style={{ flex: 1, border: "none", borderRadius: 8, padding: "7px 0", fontSize: 12, fontWeight: 600, cursor: "pointer", background: tab === tb.id ? "#1e3a5f" : "none", color: tab === tb.id ? "#fff" : "#6b7280" }}>{tb.label}</button>)}
      </div>
      {tab === "stamm" && (
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: 10 }}>
          {[["Name", a.name], ["Geburtsdatum", a.geb], ["Alter", `${alter(a.geb)} Jahre`], ["Gruppe", a.gruppe], ["Aktueller Gurt", `${gurt.kup} – ${gurt.farbe}`]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: "1px solid #f3f4f6", paddingBottom: 8 }}>
              <span style={{ color: "#6b7280" }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
            </div>
          ))}
          {naechster && <div style={{ background: "#f0f9ff", borderRadius: 8, padding: 10, fontSize: 12 }}><span style={{ color: "#6b7280" }}>Nächste Graduierung: </span><span style={{ fontWeight: 700, color: "#1e3a5f" }}>{naechster.kup} – {naechster.farbe}</span></div>}
        </div>
      )}
      {tab === "graduierung" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Graduierungsverlauf</div>
            {a.graduierungen.length === 0 && <div style={{ color: "#9ca3af", fontSize: 13 }}>Noch keine Einträge</div>}
            {[...a.graduierungen].reverse().map((g, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 10, borderBottom: "1px solid #f3f4f6", marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{g.datum}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}><GurtBadge gurtId={g.von} small /><span style={{ fontSize: 12 }}>→</span><GurtBadge gurtId={g.nach} small /></div>
                </div>
                {g.note && <Badge label={g.note} color="#22c55e" />}
              </div>
            ))}
          </div>
          {!showGradForm ? (
            <button onClick={() => setShowGradForm(true)} style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>+ Neue Graduierung</button>
          ) : (
            <div style={{ background: "#fff", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Neue Graduierung</div>
              <input type="date" value={neueGrad.datum} onChange={e => setNeueGrad(p => ({ ...p, datum: e.target.value }))} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13 }} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {GURTGRADE.map(g => <button key={g.id} onClick={() => setNeueGrad(p => ({ ...p, nach: g.id }))} style={{ background: neueGrad.nach === g.id ? "#1e3a5f" : g.hex, border: `2px solid ${neueGrad.nach === g.id ? "#1e3a5f" : g.border}`, color: neueGrad.nach === g.id ? "#fff" : (g.textColor || "#1f2937"), borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{g.kup}</button>)}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {["Bestanden", "Gut", "Sehr gut"].map(n => <button key={n} onClick={() => setNeueGrad(p => ({ ...p, note: n }))} style={{ border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", background: neueGrad.note === n ? "#22c55e" : "#f3f4f6", color: neueGrad.note === n ? "#fff" : "#374151" }}>{n}</button>)}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setShowGradForm(false)} style={{ flex: 1, background: "#f3f4f6", border: "none", borderRadius: 10, padding: 10, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Abbrechen</button>
                <button onClick={addGrad} style={{ flex: 2, background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 10, padding: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Speichern</button>
              </div>
            </div>
          )}
        </div>
      )}
      {tab === "termine" && (
        <div style={{ background: "#fff", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Prüfungen & Wettkämpfe</div>
          {termine.map(t => {
            const aktiv = a.termine.includes(t.id);
            const color = t.typ === "Pruefung" ? "#3b82f6" : "#ef4444";
            return (
              <div key={t.id} onClick={() => toggleTermin(t.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, border: `2px solid ${aktiv ? color : "#e5e7eb"}`, background: aktiv ? color + "11" : "#f9fafb", cursor: "pointer" }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${aktiv ? color : "#d1d5db"}`, background: aktiv ? color : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 700 }}>{aktiv ? "✓" : ""}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>{formatDatum(t.datum)} · <Badge label={t.typ === "Pruefung" ? "Prüfung" : "Wettkampf"} color={color} /></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {tab === "ziele" && (
        <div style={{ background: "#fff", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>Trainingsziele</div>
          {a.ziele.length === 0 && <div style={{ color: "#9ca3af", fontSize: 13 }}>Noch keine Ziele</div>}
          {a.ziele.map((z, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 8, borderBottom: "1px solid #f3f4f6" }}>
              <span>🎯</span><span style={{ flex: 1, fontSize: 13 }}>{z}</span>
              <button onClick={() => setA(p => ({ ...p, ziele: p.ziele.filter((_, idx) => idx !== i) }))} style={{ background: "none", border: "none", color: "#ef4444", fontSize: 16, cursor: "pointer" }}>×</button>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8 }}>
            <input value={neuesZiel} onChange={e => setNeuesZiel(e.target.value)} onKeyDown={e => e.key === "Enter" && addZiel()} placeholder="Neues Ziel..." style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13 }} />
            <button onClick={addZiel} style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontWeight: 700, cursor: "pointer" }}>+</button>
          </div>
        </div>
      )}
      <button onClick={() => onSave(a)} style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Speichern</button>
    </div>
  );
}

function Athleten({ termine }) {
  const [athleten, setAthletен] = useState(INIT_ATHLETEN);
  const [sel, setSel] = useState(null);
  const [filter, setFilter] = useState("Alle");
  const save = (u) => { setAthletен(p => p.map(a => a.id === u.id ? u : a)); setSel(null); };
  if (sel) return <AthletProfil athlet={sel} termine={termine} onBack={() => setSel(null)} onSave={save} />;
  const gefiltert = filter === "Alle" ? athleten : athleten.filter(a => a.gruppe === filter);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {["Alle", ...GRUPPEN].map(g => <button key={g} onClick={() => setFilter(g)} style={{ border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", background: filter === g ? "#1e3a5f" : "#fff", color: filter === g ? "#fff" : "#374151", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>{g}</button>)}
      </div>
      {gefiltert.map(a => {
        const g = gurtById(a.gurtId);
        return (
          <div key={a.id} onClick={() => setSel(a)} style={{ background: "#fff", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", cursor: "pointer" }}>
            <div style={{ background: g.hex, border: `2px solid ${g.border}`, borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🥋</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{a.name}</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{alter(a.geb)} J. · {a.gruppe}</div>
              <div style={{ marginTop: 4, display: "flex", gap: 6, alignItems: "center" }}>
                <GurtBadge gurtId={a.gurtId} small />
                {a.termine.length > 0 && <Badge label={`${a.termine.length} Termin${a.termine.length > 1 ? "e" : ""}`} color="#3b82f6" />}
              </div>
            </div>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: a.anwesenheit >= 80 ? "#22c55e" : a.anwesenheit >= 60 ? "#f59e0b" : "#ef4444" }}>{a.anwesenheit}%</div>
              <div style={{ fontSize: 9, color: "#9ca3af" }}>Anwes.</div>
            </div>
            <div style={{ fontSize: 16, color: "#9ca3af" }}>›</div>
          </div>
        );
      })}
      <button style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>+ Athlet hinzufügen</button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PLANUNG
// ══════════════════════════════════════════════════════════════════════════════
const INIT_WOCHEN = [
  { kw: "KW 13", von: "24.03.", bis: "30.03.", einheiten: [
    { id: 1, tag: "Mo", datum: "24.03.", gruppe: "Erwachsene", dauer: 90, schwerpunkte: ["Kyorugi"], status: "geplant" },
    { id: 2, tag: "Mi", datum: "26.03.", gruppe: "Jugend", dauer: 60, schwerpunkte: ["Poomsae"], status: "geplant" },
    { id: 3, tag: "Fr", datum: "28.03.", gruppe: "Erwachsene", dauer: 90, schwerpunkte: ["Kondition"], status: "geplant" },
  ]},
  { kw: "KW 14", von: "31.03.", bis: "06.04.", einheiten: [
    { id: 4, tag: "Mo", datum: "31.03.", gruppe: "Erwachsene", dauer: 90, schwerpunkte: ["Poomsae", "Technik"], status: "geplant" },
    { id: 5, tag: "Fr", datum: "04.04.", gruppe: "Jugend", dauer: 60, schwerpunkte: ["Kyorugi"], status: "geplant" },
  ]},
];

function Planung() {
  const [wochen] = useState(INIT_WOCHEN);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Schwerpunkte – Mehrwochenplan</div>
        {SCHWERPUNKTE_STATS.map((s, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, marginBottom: 3 }}>
              <span>{s.name}</span>
              <span style={{ color: Math.abs(s.ist - s.soll) > 5 ? "#ef4444" : "#22c55e", fontSize: 11 }}>{s.ist > s.soll ? "▲" : "▼"} {Math.abs(s.ist - s.soll)}%</span>
            </div>
            <ProgressBar soll={s.soll} ist={s.ist} color={s.color} />
          </div>
        ))}
      </div>
      {wochen.map((w, wi) => (
        <div key={wi}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{w.kw} <span style={{ fontWeight: 400, fontSize: 12, color: "#6b7280" }}>{w.von} – {w.bis}</span></div>
            <button style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Einheit</button>
          </div>
          {w.einheiten.map(e => (
            <div key={e.id} style={{ background: "#fff", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: 8 }}>
              <div style={{ background: "#1e3a5f", color: "#fff", borderRadius: 8, width: 42, textAlign: "center", padding: "4px 0", flexShrink: 0 }}>
                <div style={{ fontSize: 10 }}>{e.tag}</div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{e.datum}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{e.gruppe} · {e.dauer} min</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {e.schwerpunkte.map(sp => { const s = SCHWERPUNKTE_LIST.find(x => x.name === sp); return <Badge key={sp} label={sp} color={s ? s.color : "#6b7280"} />; })}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
function Dashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "linear-gradient(135deg, #1e3a5f, #2563eb)", borderRadius: 12, padding: "14px 16px", color: "#fff" }}>
        <div style={{ fontSize: 11, opacity: 0.75, marginBottom: 4 }}>🤖 KI-Empfehlung</div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>Kyorugi-Anteil liegt unter dem Soll. Prüfung in 22 Tagen – Poomsae-Fokus erhöhen.</div>
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Diese Woche</div>
        {INIT_WOCHEN[0].einheiten.map((e, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: 8 }}>
            <div style={{ background: "#1e3a5f", color: "#fff", borderRadius: 8, width: 40, textAlign: "center", padding: "4px 0" }}>
              <div style={{ fontSize: 10 }}>{e.tag}</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{e.datum}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{e.gruppe}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{e.dauer} min · {e.schwerpunkte.join(", ")}</div>
            </div>
          </div>
        ))}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Anstehende Termine</div>
        {INIT_TERMINE.map((t, i) => {
          const color = t.typ === "Pruefung" ? "#3b82f6" : "#ef4444";
          return (
            <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: 8 }}>
              <div style={{ background: color, color: "#fff", borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 700 }}>{t.typ === "Pruefung" ? "Prüfung" : "Wettkampf"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{t.label}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{formatDatum(t.datum)}</div>
              </div>
              <div style={{ background: "#f3f4f6", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 700, color: "#1e3a5f" }}>{tageBis(t.datum)}d</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Placeholder({ title }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, color: "#9ca3af" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🚧</div>
      <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: 13, marginTop: 4 }}>Noch nicht umgesetzt</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [active, setActive] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const current = NAV_ITEMS.find(n => n.id === active);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#f3f4f6", minHeight: "100vh", maxWidth: 420, margin: "0 auto" }}>
      <div style={{ background: "#1e3a5f", color: "#fff", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontSize: 11, opacity: 0.65 }}>Taekwondo</div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>{current.icon} {current.label}</div>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer" }}>☰</button>
      </div>

      {menuOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, display: "flex" }}>
          <div style={{ background: "#1e3a5f", width: 240, padding: "24px 0", display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 16, padding: "0 20px 16px" }}>🥋 TKD Trainer</div>
            {NAV_ITEMS.map(n => (
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
        {active === "dashboard" && <Dashboard />}
        {active === "planung" && <Planung />}
        {active === "athleten" && <Athleten termine={INIT_TERMINE} />}
        {active === "gruppen" && <Anwesenheit />}
        {active === "pruefungen" && <Pruefungen athleten={INIT_ATHLETEN} />}
        {!["dashboard", "planung", "athleten", "gruppen", "pruefungen"].includes(active) && <Placeholder title={current.label} />}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 420, background: "#fff", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-around", padding: "8px 0", zIndex: 50 }}>
        {NAV_ITEMS.slice(0, 5).map(n => (
          <button key={n.id} onClick={() => setActive(n.id)}
            style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer", color: active === n.id ? "#1e3a5f" : "#9ca3af" }}>
            <span style={{ fontSize: 20 }}>{n.icon}</span>
            <span style={{ fontSize: 9, fontWeight: active === n.id ? 700 : 400 }}>{n.label}</span>
          </button>
        ))}
      </div>
      <div style={{ height: 70 }} />
    </div>
  );
}
