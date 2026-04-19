import { useState } from "react";

// ── Konstanten ────────────────────────────────────────────────────────────────
const INIT_SCHWERPUNKTE = [
  { id: 1, name: "Kyorugi",          color: "#ef4444", gewichtung: 40 },
  { id: 2, name: "Poomsae",          color: "#3b82f6", gewichtung: 30 },
  { id: 3, name: "Kondition",        color: "#22c55e", gewichtung: 20 },
  { id: 4, name: "Theorie",          color: "#f59e0b", gewichtung: 10 },
  { id: 5, name: "Technik",          color: "#8b5cf6", gewichtung: 0  },
  { id: 6, name: "Selbstverteidigung", color: "#ec4899", gewichtung: 0 },
];

const INIT_GURTGRADE = [
  { id: "g10", kup: "10. Kup", farbe: "Weiß",        hex: "#f9fafb", border: "#d1d5db", poomsae: "Saju-Jirugi", techniken: "Grundhaltung, Fausttechnik", theorie: "Taekwondo-Geschichte" },
  { id: "g9",  kup: "9. Kup",  farbe: "Weiß-Gelb",   hex: "#fef9c3", border: "#fbbf24", poomsae: "Saju-Makgi",  techniken: "Blocktechniken", theorie: "Begrüßung & Etikette" },
  { id: "g8",  kup: "8. Kup",  farbe: "Gelb",         hex: "#fef08a", border: "#eab308", poomsae: "Taegeuk 1",   techniken: "Ap-Chagi", theorie: "Gürtelfarben" },
  { id: "g7",  kup: "7. Kup",  farbe: "Gelb-Grün",   hex: "#dcfce7", border: "#22c55e", poomsae: "Taegeuk 2",   techniken: "Dollyeo-Chagi", theorie: "Grundbegriffe Koreanisch" },
  { id: "g6",  kup: "6. Kup",  farbe: "Grün",         hex: "#bbf7d0", border: "#16a34a", poomsae: "Taegeuk 3",   techniken: "Yeop-Chagi", theorie: "WTF-Regeln Grundlagen" },
  { id: "g5",  kup: "5. Kup",  farbe: "Grün-Blau",   hex: "#bfdbfe", border: "#3b82f6", poomsae: "Taegeuk 4",   techniken: "Dwi-Chagi", theorie: "Wettkampfregeln" },
  { id: "g4",  kup: "4. Kup",  farbe: "Blau",         hex: "#93c5fd", border: "#1d4ed8", poomsae: "Taegeuk 5",   techniken: "Neriyo-Chagi", theorie: "Schiedsrichterzeichen" },
  { id: "g3",  kup: "3. Kup",  farbe: "Blau-Rot",    hex: "#fecaca", border: "#ef4444", poomsae: "Taegeuk 6",   techniken: "Twio Ap-Chagi", theorie: "Poomsae-Bedeutungen" },
  { id: "g2",  kup: "2. Kup",  farbe: "Rot",          hex: "#fca5a5", border: "#dc2626", poomsae: "Taegeuk 7",   techniken: "Twio Dollyo-Chagi", theorie: "Dan-System" },
  { id: "g1",  kup: "1. Kup",  farbe: "Rot-Schwarz",  hex: "#1f2937", border: "#111827", poomsae: "Taegeuk 8",   techniken: "Kombinations-Kicks", theorie: "Philosophie Taekwondo", textColor: "#fff" },
  { id: "d1",  kup: "1. Dan",  farbe: "Schwarz",      hex: "#111827", border: "#111827", poomsae: "Koryo",        techniken: "Freie Kombination", theorie: "Trainingsplanung", textColor: "#fff" },
  { id: "d2",  kup: "2. Dan",  farbe: "Schwarz",      hex: "#111827", border: "#111827", poomsae: "Keumgang",     techniken: "Fortgeschrittene Kicks", theorie: "Biomechanik", textColor: "#fff" },
];

const INIT_GRUPPEN = [
  { id: 1, name: "Erwachsene",      level: "Fortgeschritten", minAlter: 18, maxAlter: 99 },
  { id: 2, name: "Jugend",          level: "Einsteiger",      minAlter: 8,  maxAlter: 17 },
  { id: 3, name: "Fortgeschrittene", level: "Fortgeschritten", minAlter: 14, maxAlter: 99 },
];

const KI_PROVIDER = ["Claude (Anthropic)", "OpenAI", "Custom"];
const KI_MODELLE = {
  "Claude (Anthropic)": ["claude-sonnet-4-6", "claude-opus-4-6", "claude-haiku-4-5"],
  "OpenAI": ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
  "Custom": ["custom-model"],
};
const KI_FUNKTIONEN = [
  { id: "einheit",    label: "Einheitsvorschläge" },
  { id: "phasenplan", label: "Phasenplan-Generierung" },
  { id: "dashboard",  label: "Dashboard-Empfehlung" },
  { id: "progress",   label: "Progressionsempfehlung" },
  { id: "variation",  label: "Variationslogik" },
  { id: "bibliothek", label: "Bibliotheksvorschläge" },
];
const FARBEN = ["#ef4444","#f97316","#f59e0b","#22c55e","#14b8a6","#3b82f6","#6366f1","#8b5cf6","#ec4899","#64748b"];
const LEVEL = ["Einsteiger", "Fortgeschritten", "Erwachsene"];

// ── Hilfsfunktionen ───────────────────────────────────────────────────────────
function GurtBadge({ g, small }) {
  return (
    <span style={{ background: g.hex, border: `2px solid ${g.border}`, color: g.textColor || "#1f2937", borderRadius: 6, padding: small ? "1px 7px" : "3px 10px", fontSize: small ? 10 : 12, fontWeight: 700 }}>
      {g.kup}
    </span>
  );
}

function SectionHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontWeight: 800, fontSize: 16, color: "#1e3a5f" }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", ...style }}>
      {children}
    </div>
  );
}

function BackBtn({ onBack, label = "← Zurück" }) {
  return (
    <button onClick={onBack} style={{ background: "none", border: "none", color: "#1e3a5f", fontWeight: 700, fontSize: 14, cursor: "pointer", textAlign: "left", padding: 0, marginBottom: 4 }}>
      {label}
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SCHWERPUNKTE
// ══════════════════════════════════════════════════════════════════════════════
function Schwerpunkte() {
  const [liste, setListe] = useState(INIT_SCHWERPUNKTE);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", color: "#3b82f6", gewichtung: 0 });
  const [neuesFeld, setNeuesFeld] = useState(false);

  const gesamt = liste.reduce((s, x) => s + Number(x.gewichtung), 0);
  const offen = 100 - gesamt;

  const startEdit = (sp) => { setEditId(sp.id); setForm({ name: sp.name, color: sp.color, gewichtung: sp.gewichtung }); };
  const saveEdit = () => {
    setListe(p => p.map(sp => sp.id === editId ? { ...sp, ...form, gewichtung: Number(form.gewichtung) } : sp));
    setEditId(null);
  };
  const del = (id) => setListe(p => p.filter(sp => sp.id !== id));
  const addNeu = () => {
    if (!form.name.trim()) return;
    setListe(p => [...p, { id: Date.now(), name: form.name, color: form.color, gewichtung: Number(form.gewichtung) }]);
    setForm({ name: "", color: "#3b82f6", gewichtung: 0 });
    setNeuesFeld(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <SectionHeader title="Schwerpunkte & Gewichtung" sub="Definiere Trainingsschwerpunkte und deren prozentualen Anteil." />

      {/* Summen-Anzeige */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Gesamtgewichtung</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: gesamt === 100 ? "#22c55e" : gesamt > 100 ? "#ef4444" : "#f59e0b" }}>{gesamt} / 100 %</span>
        </div>
        <div style={{ background: "#e5e7eb", borderRadius: 8, height: 10, display: "flex", overflow: "hidden" }}>
          {liste.filter(s => s.gewichtung > 0).map(s => (
            <div key={s.id} style={{ width: `${Math.min(s.gewichtung, 100)}%`, background: s.color, transition: "width 0.3s" }} title={`${s.name}: ${s.gewichtung}%`} />
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {liste.filter(s => s.gewichtung > 0).map(s => (
            <span key={s.id} style={{ background: s.color + "22", color: s.color, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{s.name} {s.gewichtung}%</span>
          ))}
          {offen > 0 && <span style={{ background: "#f3f4f6", color: "#9ca3af", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>Nicht verteilt: {offen}%</span>}
        </div>
      </Card>

      {/* Liste */}
      {liste.map(sp => (
        <Card key={sp.id}>
          {editId === sp.id ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13 }} placeholder="Name" />
              <div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Farbe</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {FARBEN.map(c => (
                    <button key={c} onClick={() => setForm(p => ({ ...p, color: c }))}
                      style={{ width: 28, height: 28, borderRadius: 8, background: c, border: form.color === c ? "3px solid #1e3a5f" : "2px solid transparent", cursor: "pointer" }} />
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>Gewichtung</span>
                <input type="range" min="0" max="100" value={form.gewichtung} onChange={e => setForm(p => ({ ...p, gewichtung: e.target.value }))} style={{ flex: 1 }} />
                <span style={{ fontWeight: 700, fontSize: 14, minWidth: 36, textAlign: "right" }}>{form.gewichtung}%</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setEditId(null)} style={{ flex: 1, background: "#f3f4f6", border: "none", borderRadius: 8, padding: 10, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Abbrechen</button>
                <button onClick={saveEdit} style={{ flex: 2, background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 8, padding: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Speichern</button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 14, height: 36, borderRadius: 6, background: sp.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{sp.name}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{sp.gewichtung > 0 ? `${sp.gewichtung}% Gewichtung` : "Keine Gewichtung"}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => startEdit(sp)} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 12, cursor: "pointer" }}>✏️</button>
                <button onClick={() => del(sp.id)} style={{ background: "#fee2e2", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 12, cursor: "pointer" }}>🗑️</button>
              </div>
            </div>
          )}
        </Card>
      ))}

      {/* Neuer Schwerpunkt */}
      {!neuesFeld ? (
        <button onClick={() => setNeuesFeld(true)} style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          + Schwerpunkt hinzufügen
        </button>
      ) : (
        <Card>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Neuer Schwerpunkt</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13 }} placeholder="Name" />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {FARBEN.map(c => <button key={c} onClick={() => setForm(p => ({ ...p, color: c }))} style={{ width: 28, height: 28, borderRadius: 8, background: c, border: form.color === c ? "3px solid #1e3a5f" : "2px solid transparent", cursor: "pointer" }} />)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>Gewichtung</span>
              <input type="range" min="0" max="100" value={form.gewichtung} onChange={e => setForm(p => ({ ...p, gewichtung: e.target.value }))} style={{ flex: 1 }} />
              <span style={{ fontWeight: 700, fontSize: 14, minWidth: 36, textAlign: "right" }}>{form.gewichtung}%</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setNeuesFeld(false)} style={{ flex: 1, background: "#f3f4f6", border: "none", borderRadius: 8, padding: 10, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Abbrechen</button>
              <button onClick={addNeu} style={{ flex: 2, background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 8, padding: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Hinzufügen</button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// GURTGRADE
// ══════════════════════════════════════════════════════════════════════════════
function GurtgradeDetail({ g, onBack, onSave }) {
  const [form, setForm] = useState({ ...g });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <BackBtn onBack={onBack} label="← Gurtgrade" />
      {/* Vorschau */}
      <div style={{ background: form.hex, border: `3px solid ${form.border}`, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: form.textColor || "#1f2937" }}>{form.kup}</div>
          <div style={{ fontSize: 13, color: form.textColor || "#6b7280", opacity: 0.85 }}>{form.farbe}</div>
        </div>
        <div style={{ fontSize: 32 }}>🥋</div>
      </div>

      <Card style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          ["Bezeichnung (Kup/Dan)", "kup"],
          ["Farbname", "farbe"],
          ["Pflicht-Poomsae", "poomsae"],
          ["Techniken", "techniken"],
          ["Theoriethemen", "theorie"],
        ].map(([label, field]) => (
          <div key={field}>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{label}</div>
            <input value={form[field] || ""} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13, boxSizing: "border-box" }} />
          </div>
        ))}
      </Card>

      <button onClick={() => onSave(form)} style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
        Speichern
      </button>
    </div>
  );
}

function Gurtgrade() {
  const [liste, setListe] = useState(INIT_GURTGRADE);
  const [sel, setSel] = useState(null);

  const save = (updated) => { setListe(p => p.map(g => g.id === updated.id ? updated : g)); setSel(null); };

  if (sel) return <GurtgradeDetail g={sel} onBack={() => setSel(null)} onSave={save} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <SectionHeader title="Gurtgrade" sub="Konfiguriere Gurtgrade und deren Prüfungsinhalte." />
      {liste.map(g => (
        <div key={g.id} onClick={() => setSel(g)}
          style={{ background: "#fff", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", cursor: "pointer", borderLeft: `5px solid ${g.border}` }}>
          <div style={{ background: g.hex, border: `2px solid ${g.border}`, borderRadius: 8, width: 40, height: 40, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{g.kup}</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{g.farbe} · {g.poomsae}</div>
          </div>
          <div style={{ fontSize: 16, color: "#9ca3af" }}>›</div>
        </div>
      ))}
      <button style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
        + Gurtgrad hinzufügen
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// GRUPPEN
// ══════════════════════════════════════════════════════════════════════════════
function Gruppen() {
  const [liste, setListe] = useState(INIT_GRUPPEN);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", level: "Einsteiger", minAlter: 0, maxAlter: 99 });
  const [neuesFeld, setNeuesFeld] = useState(false);

  const startEdit = (g) => { setEditId(g.id); setForm({ name: g.name, level: g.level, minAlter: g.minAlter, maxAlter: g.maxAlter }); };
  const saveEdit = () => { setListe(p => p.map(g => g.id === editId ? { ...g, ...form } : g)); setEditId(null); };
  const del = (id) => setListe(p => p.filter(g => g.id !== id));
  const addNeu = () => {
    if (!form.name.trim()) return;
    setListe(p => [...p, { id: Date.now(), ...form }]);
    setForm({ name: "", level: "Einsteiger", minAlter: 0, maxAlter: 99 });
    setNeuesFeld(false);
  };

  const GruppeForm = ({ onSave, onCancel }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
        style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13 }} placeholder="Gruppenname" />
      <div>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Level</div>
        <div style={{ display: "flex", gap: 6 }}>
          {LEVEL.map(l => (
            <button key={l} onClick={() => setForm(p => ({ ...p, level: l }))}
              style={{ flex: 1, border: "none", borderRadius: 8, padding: "6px", fontSize: 11, fontWeight: 600, cursor: "pointer", background: form.level === l ? "#1e3a5f" : "#f3f4f6", color: form.level === l ? "#fff" : "#374151" }}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {[["Min. Alter", "minAlter"], ["Max. Alter", "maxAlter"]].map(([label, field]) => (
          <div key={field} style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{label}</div>
            <input type="number" value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: Number(e.target.value) }))}
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13, boxSizing: "border-box" }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onCancel} style={{ flex: 1, background: "#f3f4f6", border: "none", borderRadius: 8, padding: 10, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Abbrechen</button>
        <button onClick={onSave} style={{ flex: 2, background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 8, padding: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Speichern</button>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <SectionHeader title="Gruppen" sub="Trainingsgruppen verwalten und konfigurieren." />
      {liste.map(g => (
        <Card key={g.id}>
          {editId === g.id ? (
            <GruppeForm onSave={saveEdit} onCancel={() => setEditId(null)} />
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ background: "#1e3a5f22", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>👥</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{g.name}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{g.level} · {g.minAlter}–{g.maxAlter} Jahre</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => startEdit(g)} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 12, cursor: "pointer" }}>✏️</button>
                <button onClick={() => del(g.id)} style={{ background: "#fee2e2", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 12, cursor: "pointer" }}>🗑️</button>
              </div>
            </div>
          )}
        </Card>
      ))}
      {!neuesFeld ? (
        <button onClick={() => setNeuesFeld(true)} style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          + Gruppe hinzufügen
        </button>
      ) : (
        <Card>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Neue Gruppe</div>
          <GruppeForm onSave={addNeu} onCancel={() => setNeuesFeld(false)} />
        </Card>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// KI-KONFIGURATION
// ══════════════════════════════════════════════════════════════════════════════
function KiKonfiguration() {
  const [provider, setProvider] = useState("Claude (Anthropic)");
  const [modell, setModell] = useState("claude-sonnet-4-6");
  const [apiKey, setApiKey] = useState("sk-ant-•••••••••••••••••••••••");
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // null | "loading" | "ok" | "error"
  const [funktionen, setFunktionen] = useState({ einheit: true, phasenplan: true, dashboard: true, progress: true, variation: true, bibliothek: false });

  const testVerbindung = () => {
    setTestStatus("loading");
    setTimeout(() => setTestStatus("ok"), 1800);
  };

  const onProviderChange = (p) => {
    setProvider(p);
    setModell(KI_MODELLE[p][0]);
    setTestStatus(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <SectionHeader title="KI-Konfiguration" sub="Wähle Anbieter, Modell und konfiguriere KI-Funktionen." />

      {/* Provider */}
      <Card>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>KI-Anbieter</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {KI_PROVIDER.map(p => (
            <button key={p} onClick={() => onProviderChange(p)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, border: `2px solid ${provider === p ? "#1e3a5f" : "#e5e7eb"}`, background: provider === p ? "#1e3a5f11" : "#f9fafb", cursor: "pointer", textAlign: "left" }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${provider === p ? "#1e3a5f" : "#d1d5db"}`, background: provider === p ? "#1e3a5f" : "#fff", flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{p}</div>
                {p === "Claude (Anthropic)" && <div style={{ fontSize: 11, color: "#6b7280" }}>Standard – empfohlen</div>}
                {p === "Custom" && <div style={{ fontSize: 11, color: "#6b7280" }}>Eigener Endpunkt</div>}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Modell */}
      <Card>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Modell</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {KI_MODELLE[provider].map(m => (
            <button key={m} onClick={() => setModell(m)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, border: `2px solid ${modell === m ? "#1e3a5f" : "#e5e7eb"}`, background: modell === m ? "#1e3a5f11" : "#f9fafb", cursor: "pointer" }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${modell === m ? "#1e3a5f" : "#d1d5db"}`, background: modell === m ? "#1e3a5f" : "#fff", flexShrink: 0 }} />
              <span style={{ fontWeight: 600, fontSize: 13, fontFamily: "monospace" }}>{m}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* API Key */}
      <Card>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>API-Key</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input type={showKey ? "text" : "password"} value={apiKey} onChange={e => setApiKey(e.target.value)}
            style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13, fontFamily: "monospace" }} />
          <button onClick={() => setShowKey(p => !p)}
            style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 14, cursor: "pointer" }}>
            {showKey ? "🙈" : "👁"}
          </button>
        </div>
        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>Wird verschlüsselt gespeichert und nie im Klartext übertragen.</div>

        {/* Verbindungstest */}
        <button onClick={testVerbindung} disabled={testStatus === "loading"}
          style={{ marginTop: 12, width: "100%", background: testStatus === "ok" ? "#dcfce7" : testStatus === "error" ? "#fee2e2" : "#1e3a5f", color: testStatus === "ok" ? "#16a34a" : testStatus === "error" ? "#dc2626" : "#fff", border: "none", borderRadius: 8, padding: "10px", fontWeight: 700, fontSize: 13, cursor: testStatus === "loading" ? "default" : "pointer" }}>
          {testStatus === "loading" ? "⏳ Verbindung wird getestet…" : testStatus === "ok" ? "✓ Verbindung erfolgreich" : testStatus === "error" ? "✗ Verbindung fehlgeschlagen" : "Verbindung testen"}
        </button>
      </Card>

      {/* KI-Funktionen */}
      <Card>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>KI-Funktionen aktivieren</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {KI_FUNKTIONEN.map(f => (
            <div key={f.id} onClick={() => setFunktionen(p => ({ ...p, [f.id]: !p[f.id] }))}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, border: `2px solid ${funktionen[f.id] ? "#22c55e" : "#e5e7eb"}`, background: funktionen[f.id] ? "#f0fdf4" : "#f9fafb", cursor: "pointer" }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${funktionen[f.id] ? "#22c55e" : "#d1d5db"}`, background: funktionen[f.id] ? "#22c55e" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", fontWeight: 700, flexShrink: 0 }}>
                {funktionen[f.id] ? "✓" : ""}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{f.label}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// EINSTELLUNGEN HAUPTMENÜ
// ══════════════════════════════════════════════════════════════════════════════
const MENU_ITEMS = [
  { id: "schwerpunkte", icon: "🎯", label: "Schwerpunkte & Gewichtung",   sub: "Trainingsschwerpunkte und prozentuale Verteilung" },
  { id: "gurtgrade",    icon: "🥋", label: "Gurtgrade & Prüfungsinhalte", sub: "Kup-/Dan-Grade und zugehörige Prüfungsinhalte" },
  { id: "gruppen",      icon: "👥", label: "Gruppen",                      sub: "Trainingsgruppen verwalten" },
  { id: "ki",           icon: "🤖", label: "KI-Konfiguration",             sub: "Anbieter, Modell, API-Key und Funktionen" },
];

export default function App() {
  const [section, setSection] = useState(null);

  const current = MENU_ITEMS.find(m => m.id === section);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#f3f4f6", minHeight: "100vh", maxWidth: 420, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ background: "#1e3a5f", color: "#fff", padding: "14px 16px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ fontSize: 11, opacity: 0.65 }}>Taekwondo Trainer</div>
        <div style={{ fontSize: 17, fontWeight: 700 }}>
          {section ? `⚙️ ${current.label}` : "⚙️ Einstellungen"}
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {!section && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SectionHeader title="Einstellungen" sub="App-Konfiguration und Anpassungen" />
            {MENU_ITEMS.map(m => (
              <button key={m.id} onClick={() => setSection(m.id)}
                style={{ background: "#fff", border: "none", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", cursor: "pointer", textAlign: "left", width: "100%" }}>
                <div style={{ background: "#1e3a5f11", borderRadius: 10, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  {m.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1f2937" }}>{m.label}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{m.sub}</div>
                </div>
                <div style={{ fontSize: 18, color: "#9ca3af" }}>›</div>
              </button>
            ))}

            {/* App-Info */}
            <div style={{ marginTop: 8, background: "#fff", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "#6b7280" }}>App-Info</div>
              {[["Version", "1.0.0 (Prototyp)"], ["KI-Standard", "Claude (Anthropic)"], ["Datenspeicherung", "Lokal + Cloud-Sync"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, paddingBottom: 6, borderBottom: "1px solid #f3f4f6", marginBottom: 6 }}>
                  <span style={{ color: "#6b7280" }}>{k}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {section && (
          <div>
            <BackBtn onBack={() => setSection(null)} label="← Einstellungen" />
            <div style={{ marginTop: 12 }}>
              {section === "schwerpunkte" && <Schwerpunkte />}
              {section === "gurtgrade"    && <Gurtgrade />}
              {section === "gruppen"      && <Gruppen />}
              {section === "ki"           && <KiKonfiguration />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
