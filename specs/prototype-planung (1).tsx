import { useState } from "react";

// ── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  primary: "#1e3a5f",
  bg:      "#f3f4f6",
  card:    "#fff",
  muted:   "#6b7280",
  border:  "#e5e7eb",
};

// ── Mock-Daten ────────────────────────────────────────────────────────────────
const SCHWERPUNKT_LISTE = [
  { name: "Kyorugi",           color: "#ef4444" },
  { name: "Poomsae",           color: "#3b82f6" },
  { name: "Kondition",         color: "#22c55e" },
  { name: "Theorie",           color: "#f59e0b" },
  { name: "Technik",           color: "#8b5cf6" },
  { name: "Selbstverteidigung",color: "#ec4899" },
];

const SCHWERPUNKTE_SOLL = [
  { name: "Kyorugi",   color: "#ef4444", soll: 40, ist: 35 },
  { name: "Poomsae",   color: "#3b82f6", soll: 30, ist: 28 },
  { name: "Kondition", color: "#22c55e", soll: 20, ist: 25 },
  { name: "Theorie",   color: "#f59e0b", soll: 10, ist: 12 },
];

const GRUPPEN  = ["Erwachsene", "Jugend", "Fortgeschrittene"];
const TAGE     = ["Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const DAUERN   = [45, 60, 90, 120];
const STATUS   = ["geplant", "durchgeführt", "ausgefallen"];
const STATUS_COLOR = { geplant: "#3b82f6", "durchgeführt": "#22c55e", ausgefallen: "#ef4444" };

const KI_VORSCHLAEGE = {
  Kyorugi:    "15 min Aufwärmen mit Schritttechniken → 40 min Angriffs-/Verteidigungskombinationen (3-Schritt) → 25 min freies Sparring → 10 min Cool-down.",
  Poomsae:    "10 min Aufwärmen → 20 min Einzeltechniken aus Pflicht-Poomsae → 25 min Poomsae-Durchläufe → 10 min Korrekturen & Cool-down.",
  Kondition:  "10 min Aufwärmen → 30 min Intervalltraining (Kicks & Sprünge) → 20 min Kraftausdauer → 10 min Dehnen.",
  Theorie:    "5 min Rückblick letzte Einheit → 30 min Regelwerk / Koreanische Begriffe → 15 min Q&A → 10 min Praxis-Demo.",
  Technik:    "10 min Aufwärmen → 35 min Einzeltechnik-Analyse (Zeitlupe) → 20 min Wiederholung im Partner → 10 min Cool-down.",
  Selbstverteidigung: "10 min Aufwärmen → 40 min Selbstverteidigungs-Szenarien → 20 min Partnerübungen → 10 min Reflexion.",
};

const INIT_WOCHEN = [
  {
    kw: "KW 13", von: "24.03.", bis: "30.03.",
    einheiten: [
      { id: 1, tag: "Mo", datum: "24.03.", gruppe: "Erwachsene",       dauer: 90, schwerpunkte: ["Kyorugi"],           status: "geplant" },
      { id: 2, tag: "Mi", datum: "26.03.", gruppe: "Jugend",           dauer: 60, schwerpunkte: ["Poomsae"],           status: "geplant" },
      { id: 3, tag: "Fr", datum: "28.03.", gruppe: "Erwachsene",       dauer: 90, schwerpunkte: ["Kondition"],         status: "durchgeführt" },
    ],
  },
  {
    kw: "KW 14", von: "31.03.", bis: "06.04.",
    einheiten: [
      { id: 4, tag: "Mo", datum: "31.03.", gruppe: "Erwachsene",       dauer: 90, schwerpunkte: ["Poomsae", "Technik"], status: "geplant" },
      { id: 5, tag: "Fr", datum: "04.04.", gruppe: "Jugend",           dauer: 60, schwerpunkte: ["Kyorugi"],           status: "geplant" },
    ],
  },
  {
    kw: "KW 15", von: "07.04.", bis: "13.04.",
    einheiten: [
      { id: 6, tag: "Di", datum: "08.04.", gruppe: "Fortgeschrittene", dauer: 90, schwerpunkte: ["Kyorugi", "Kondition"], status: "geplant" },
      { id: 7, tag: "Do", datum: "10.04.", gruppe: "Jugend",           dauer: 60, schwerpunkte: ["Poomsae"],           status: "ausgefallen" },
    ],
  },
  {
    kw: "KW 16", von: "14.04.", bis: "20.04.",
    einheiten: [],
  },
];

// ── UI-Bausteine ──────────────────────────────────────────────────────────────
function Card({ children, style }) {
  return <div style={{ background: C.card, borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", ...style }}>{children}</div>;
}

function Badge({ label, color }) {
  return (
    <span style={{ background: color + "22", color, borderRadius: 6, padding: "2px 7px", fontSize: 11, fontWeight: 600 }}>
      {label}
    </span>
  );
}

function ProgressBar({ soll, ist, color }) {
  return (
    <div style={{ position: "relative", background: C.border, borderRadius: 6, height: 10 }}>
      <div style={{ width: `${ist}%`, background: color, borderRadius: 6, height: 10, transition: "width 0.4s" }} />
      <div style={{ position: "absolute", top: -2, bottom: -2, left: `${soll}%`, width: 2, background: "#374151", borderRadius: 2 }} />
    </div>
  );
}

function BackBtn({ onBack, label = "← Zurück" }) {
  return (
    <button onClick={onBack}
      style={{ background: "none", border: "none", color: C.primary, fontWeight: 700, fontSize: 14, cursor: "pointer", padding: 0, marginBottom: 12 }}>
      {label}
    </button>
  );
}

// ── Schwerpunkt-Übersicht ─────────────────────────────────────────────────────
function SchwerpunktUebersicht({ wochen }) {
  // Ist-Werte aus tatsächlichen Einheiten berechnen
  const alle = wochen.flatMap(w => w.einheiten);
  const counts = {};
  SCHWERPUNKT_LISTE.forEach(s => counts[s.name] = 0);
  alle.forEach(e => e.schwerpunkte.forEach(sp => counts[sp]++));
  const total = Object.values(counts).reduce((s, v) => s + v, 0) || 1;

  return (
    <Card>
      <div style={{ fontWeight: 700, fontSize: 13, color: C.primary, marginBottom: 10 }}>
        Schwerpunktverteilung – Mehrwochenplan
      </div>
      {SCHWERPUNKTE_SOLL.map(s => {
        const istReal = Math.round((counts[s.name] / total) * 100);
        const diff = istReal - s.soll;
        return (
          <div key={s.name} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, marginBottom: 3 }}>
              <span>{s.name}</span>
              <span style={{ color: Math.abs(diff) > 5 ? "#ef4444" : "#22c55e", fontSize: 11 }}>
                {diff > 0 ? "▲" : "▼"} {Math.abs(diff)}% Abw. · Ist {istReal}%
              </span>
            </div>
            <ProgressBar soll={s.soll} ist={istReal} color={s.color} />
          </div>
        );
      })}
      <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>▏ = Sollwert</div>
    </Card>
  );
}

// ── Einheit Formular (shared für neu & bearbeiten) ────────────────────────────
function EinheitFormular({ initial, onSave, onCancel, title }) {
  const [form, setForm] = useState({ ...initial });
  const [kiAngezeigt, setKiAngezeigt] = useState(false);

  const toggleSp = (sp) => setForm(p => ({
    ...p,
    schwerpunkte: p.schwerpunkte.includes(sp)
      ? p.schwerpunkte.filter(x => x !== sp)
      : [...p.schwerpunkte, sp],
  }));

  const kiVorschlag = form.schwerpunkte.length > 0
    ? KI_VORSCHLAEGE[form.schwerpunkte[0]] || "Kein Vorschlag verfügbar."
    : null;

  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: C.primary }}>{title}</div>

      {/* Wochentag */}
      <div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Wochentag</div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {TAGE.map(t => (
            <button key={t} onClick={() => setForm(p => ({ ...p, tag: t }))}
              style={{ padding: "5px 11px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, background: form.tag === t ? C.primary : "#f3f4f6", color: form.tag === t ? "#fff" : "#374151" }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Gruppe */}
      <div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Gruppe</div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {GRUPPEN.map(g => (
            <button key={g} onClick={() => setForm(p => ({ ...p, gruppe: g }))}
              style={{ padding: "5px 11px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, background: form.gruppe === g ? C.primary : "#f3f4f6", color: form.gruppe === g ? "#fff" : "#374151" }}>
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Dauer */}
      <div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Dauer</div>
        <div style={{ display: "flex", gap: 5 }}>
          {DAUERN.map(d => (
            <button key={d} onClick={() => setForm(p => ({ ...p, dauer: d }))}
              style={{ padding: "5px 11px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, background: form.dauer === d ? C.primary : "#f3f4f6", color: form.dauer === d ? "#fff" : "#374151" }}>
              {d} min
            </button>
          ))}
        </div>
      </div>

      {/* Schwerpunkte */}
      <div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Schwerpunkte</div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {SCHWERPUNKT_LISTE.map(s => {
            const aktiv = form.schwerpunkte.includes(s.name);
            return (
              <button key={s.name} onClick={() => toggleSp(s.name)}
                style={{ padding: "5px 11px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, background: aktiv ? s.color : "#f3f4f6", color: aktiv ? "#fff" : "#374151" }}>
                {s.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status (nur beim Bearbeiten) */}
      {"status" in initial && (
        <div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Status</div>
          <div style={{ display: "flex", gap: 5 }}>
            {STATUS.map(s => (
              <button key={s} onClick={() => setForm(p => ({ ...p, status: s }))}
                style={{ flex: 1, padding: "5px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 11, background: form.status === s ? STATUS_COLOR[s] : "#f3f4f6", color: form.status === s ? "#fff" : "#374151" }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* KI-Vorschlag */}
      {kiVorschlag && (
        <div style={{ background: "linear-gradient(135deg, #1e3a5f, #2563eb)", borderRadius: 10, padding: "12px 14px", color: "#fff" }}>
          <div style={{ fontSize: 11, opacity: 0.75, marginBottom: 4 }}>🤖 KI-Vorschlag – {form.schwerpunkte[0]}</div>
          {kiAngezeigt
            ? <div style={{ fontSize: 12 }}>{kiVorschlag}</div>
            : <button onClick={() => setKiAngezeigt(true)}
                style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                Vorschlag anzeigen
              </button>
          }
          {kiAngezeigt && (
            <button onClick={() => setKiAngezeigt(false)}
              style={{ marginTop: 8, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 8, padding: "5px 10px", fontSize: 11, cursor: "pointer" }}>
              Verbergen
            </button>
          )}
        </div>
      )}

      {/* Aktionen */}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onCancel}
          style={{ flex: 1, background: "#f3f4f6", border: "none", borderRadius: 10, padding: 11, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
          Abbrechen
        </button>
        <button onClick={() => onSave(form)}
          disabled={form.schwerpunkte.length === 0}
          style={{ flex: 2, background: form.schwerpunkte.length === 0 ? "#9ca3af" : C.primary, color: "#fff", border: "none", borderRadius: 10, padding: 11, fontWeight: 700, fontSize: 13, cursor: form.schwerpunkte.length === 0 ? "default" : "pointer" }}>
          Speichern
        </button>
      </div>
    </Card>
  );
}

// ── Einheit Detail / Bearbeiten ───────────────────────────────────────────────
function EinheitDetail({ einheit, onBack, onSave, onDelete }) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <BackBtn onBack={onBack} />

      <EinheitFormular
        title="Trainingseinheit bearbeiten"
        initial={{ ...einheit }}
        onSave={onSave}
        onCancel={onBack}
      />

      {/* Löschen */}
      {!showDelete
        ? <button onClick={() => setShowDelete(true)}
            style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 10, padding: 11, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            Einheit löschen
          </button>
        : <Card style={{ background: "#fff5f5" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#dc2626", marginBottom: 10 }}>Einheit wirklich löschen?</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowDelete(false)}
                style={{ flex: 1, background: "#f3f4f6", border: "none", borderRadius: 8, padding: 10, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                Abbrechen
              </button>
              <button onClick={onDelete}
                style={{ flex: 2, background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, padding: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                Ja, löschen
              </button>
            </div>
          </Card>
      }
    </div>
  );
}

// ── Neue Einheit ──────────────────────────────────────────────────────────────
function NeueEinheit({ onBack, onAdd }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <BackBtn onBack={onBack} />
      <EinheitFormular
        title="Neue Einheit anlegen"
        initial={{ tag: "Mo", gruppe: "Erwachsene", dauer: 90, schwerpunkte: [] }}
        onSave={onAdd}
        onCancel={onBack}
      />
    </div>
  );
}

// ── Planungsübersicht ─────────────────────────────────────────────────────────
function PlanungUebersicht({ wochen, onEinheitClick, onNeuClick }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SchwerpunktUebersicht wochen={wochen} />

      {wochen.map((w, wi) => (
        <div key={wi}>
          {/* KW-Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{w.kw} </span>
              <span style={{ fontWeight: 400, fontSize: 12, color: C.muted }}>{w.von} – {w.bis}</span>
            </div>
            <button onClick={() => onNeuClick(wi)}
              style={{ background: C.primary, color: "#fff", border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              + Einheit
            </button>
          </div>

          {/* Einheiten */}
          {w.einheiten.length === 0
            ? <div style={{ background: C.card, borderRadius: 10, padding: "14px", textAlign: "center", color: "#9ca3af", fontSize: 13, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                Keine Einheiten – + Einheit hinzufügen
              </div>
            : w.einheiten.map(e => (
                <div key={e.id} onClick={() => onEinheitClick(e, wi)}
                  style={{ background: C.card, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", cursor: "pointer", marginBottom: 8, borderLeft: `4px solid ${STATUS_COLOR[e.status]}` }}>
                  {/* Tag-Block */}
                  <div style={{ background: C.primary, color: "#fff", borderRadius: 8, width: 42, textAlign: "center", padding: "4px 0", flexShrink: 0 }}>
                    <div style={{ fontSize: 10 }}>{e.tag}</div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{e.datum}</div>
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{e.gruppe} · {e.dauer} min</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {e.schwerpunkte.map(sp => {
                        const s = SCHWERPUNKT_LISTE.find(x => x.name === sp);
                        return <Badge key={sp} label={sp} color={s ? s.color : C.muted} />;
                      })}
                      <Badge label={e.status} color={STATUS_COLOR[e.status]} />
                    </div>
                  </div>
                  <div style={{ fontSize: 16, color: "#9ca3af" }}>›</div>
                </div>
              ))
          }
        </div>
      ))}
    </div>
  );
}

// ── Planung (Hauptkomponente – direkt exportierbar) ───────────────────────────
export function Planung() {
  const [wochen, setWochen] = useState(INIT_WOCHEN);
  const [view, setView]     = useState("liste"); // liste | detail | neu
  const [selEinheit, setSelEinheit] = useState(null);
  const [selKwIdx, setSelKwIdx]     = useState(null);

  const openDetail = (einheit, kwIdx) => { setSelEinheit(einheit); setSelKwIdx(kwIdx); setView("detail"); };
  const openNeu    = (kwIdx)          => { setSelKwIdx(kwIdx); setView("neu"); };

  const saveEinheit = (updated) => {
    setWochen(prev => prev.map((w, i) => i === selKwIdx
      ? { ...w, einheiten: w.einheiten.map(e => e.id === updated.id ? updated : e) }
      : w
    ));
    setView("liste");
  };

  const deleteEinheit = () => {
    setWochen(prev => prev.map((w, i) => i === selKwIdx
      ? { ...w, einheiten: w.einheiten.filter(e => e.id !== selEinheit.id) }
      : w
    ));
    setView("liste");
  };

  const addEinheit = (neu) => {
    setWochen(prev => prev.map((w, i) => i === selKwIdx
      ? { ...w, einheiten: [...w.einheiten, { ...neu, id: Date.now(), datum: "–", status: "geplant" }] }
      : w
    ));
    setView("liste");
  };

  if (view === "detail") return <EinheitDetail einheit={selEinheit} onBack={() => setView("liste")} onSave={saveEinheit} onDelete={deleteEinheit} />;
  if (view === "neu")    return <NeueEinheit onBack={() => setView("liste")} onAdd={addEinheit} />;

  return <PlanungUebersicht wochen={wochen} onEinheitClick={openDetail} onNeuClick={openNeu} />;
}

// ── App-Shell ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard",   label: "Dashboard",   icon: "🏠" },
  { id: "planung",     label: "Planung",     icon: "📅" },
  { id: "athleten",    label: "Athleten",    icon: "🥋" },
  { id: "anwesenheit", label: "Anwesenheit", icon: "✅" },
  { id: "auswertung",  label: "Auswertung",  icon: "📊" },
];

const ALL_NAV = [
  ...NAV_ITEMS,
  { id: "pruefungen",    label: "Prüfungen",    icon: "🏆" },
  { id: "bibliothek",    label: "Bibliothek",   icon: "📚" },
  { id: "einstellungen", label: "Einstellungen",icon: "⚙️" },
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
  const [active, setActive]   = useState("planung");
  const [menuOpen, setMenuOpen] = useState(false);
  const current = ALL_NAV.find(n => n.id === active) || NAV_ITEMS[1];

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: C.bg, minHeight: "100vh", maxWidth: 420, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ background: C.primary, color: "#fff", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontSize: 11, opacity: 0.65 }}>Taekwondo</div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>{current.icon} {current.label}</div>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer" }}>☰</button>
      </div>

      {/* Drawer */}
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

      {/* Content */}
      <div style={{ padding: 16 }}>
        {active === "planung" ? <Planung /> : <Placeholder title={current.label} />}
      </div>

      {/* Bottom Nav */}
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
