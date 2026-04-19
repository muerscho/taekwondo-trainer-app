import { useState } from "react";

// ── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  primary: "#1e3a5f",
  bg:      "#f3f4f6",
  card:    "#fff",
  muted:   "#6b7280",
  border:  "#e5e7eb",
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

const GRUPPEN = ["Erwachsene", "Jugend", "Fortgeschrittene"];

const TERMINE = [
  { id: "t1", typ: "Pruefung",  label: "Kup-Prüfung (6.–4. Kup)", datum: "12.04.2026", color: "#3b82f6" },
  { id: "t2", typ: "Wettkampf", label: "Stadtmeisterschaft",        datum: "03.05.2026", color: "#ef4444" },
  { id: "t3", typ: "Pruefung",  label: "Dan-Prüfung 1. Dan",        datum: "15.06.2026", color: "#3b82f6" },
];

const BEWERTUNGEN = ["Bestanden", "Gut", "Sehr gut", "Nicht bestanden"];

const INIT_ATHLETEN = [
  {
    id: 1, name: "Max Mustermann", geb: "2005-03-12", gurtId: "g4", gruppe: "Erwachsene",
    anwesenheit: 82, termine: ["t1", "t2"],
    ziele: [
      { id: 1, text: "Wettkampf Kyorugi Kategorie A", erreicht: false },
      { id: 2, text: "Dollyo-Chagi Technik verbessern", erreicht: true },
    ],
    graduierungen: [
      { id: 1, datum: "2021-09-10", von: "g6", nach: "g5", note: "Gut" },
      { id: 2, datum: "2022-11-05", von: "g5", nach: "g4", note: "Sehr gut" },
    ],
    notiz: "Sehr motiviert, Fokus auf Wettkampfvorbereitung.",
  },
  {
    id: 2, name: "Lena Schmidt", geb: "2010-07-22", gurtId: "g7", gruppe: "Jugend",
    anwesenheit: 91, termine: ["t1"],
    ziele: [
      { id: 1, text: "Taegeuk 2 fehlerfrei durchführen", erreicht: false },
    ],
    graduierungen: [
      { id: 1, datum: "2023-11-05", von: "g8", nach: "g7", note: "Sehr gut" },
    ],
    notiz: "",
  },
  {
    id: 3, name: "Jonas Weber", geb: "2001-11-03", gurtId: "g1", gruppe: "Fortgeschrittene",
    anwesenheit: 76, termine: ["t3"],
    ziele: [
      { id: 1, text: "Dan-Prüfung bestehen",          erreicht: false },
      { id: 2, text: "Koryo Poomsae meistern",        erreicht: false },
      { id: 3, text: "Bruchtest Vorbereitung",        erreicht: true  },
    ],
    graduierungen: [
      { id: 1, datum: "2022-04-01", von: "g3", nach: "g2", note: "Gut" },
      { id: 2, datum: "2023-06-18", von: "g2", nach: "g1", note: "Bestanden" },
    ],
    notiz: "Candidate für 1. Dan – intensive Vorbereitung läuft.",
  },
  {
    id: 4, name: "Sara Bauer", geb: "2008-05-17", gurtId: "g6", gruppe: "Jugend",
    anwesenheit: 68, termine: [],
    ziele: [],
    graduierungen: [],
    notiz: "",
  },
  {
    id: 5, name: "Tom Fischer", geb: "2003-09-01", gurtId: "g3", gruppe: "Erwachsene",
    anwesenheit: 55, termine: ["t2"],
    ziele: [
      { id: 1, text: "Anwesenheit auf 70 % steigern", erreicht: false },
    ],
    graduierungen: [
      { id: 1, datum: "2023-03-12", von: "g4", nach: "g3", note: "Bestanden" },
    ],
    notiz: "Unregelmäßige Teilnahme – Gespräch vereinbaren.",
  },
  {
    id: 6, name: "Mia Krause", geb: "2012-01-14", gurtId: "g9", gruppe: "Jugend",
    anwesenheit: 88, termine: [],
    ziele: [
      { id: 1, text: "Saju-Jirugi sauber beherrschen", erreicht: true },
    ],
    graduierungen: [],
    notiz: "Sehr talentiert, empfehlen für nächste Prüfung.",
  },
];

// ── Hilfsfunktionen ───────────────────────────────────────────────────────────
const gurtById   = (id) => GURTGRADE.find(g => g.id === id) || GURTGRADE[0];
const terminById = (id) => TERMINE.find(t => t.id === id);
const alter      = (geb) => {
  const d = new Date(geb), now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) a--;
  return a;
};
const anwColor = (q) => q >= 80 ? "#22c55e" : q >= 60 ? "#f59e0b" : "#ef4444";
const nextGurt = (id) => {
  const idx = GURTGRADE.findIndex(g => g.id === id);
  return idx >= 0 && idx < GURTGRADE.length - 1 ? GURTGRADE[idx + 1] : null;
};

// ── UI-Bausteine ──────────────────────────────────────────────────────────────
function Card({ children, style }) {
  return <div style={{ background: C.card, borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", ...style }}>{children}</div>;
}

function GurtBadge({ gurtId, small }) {
  const g = gurtById(gurtId);
  return (
    <span style={{ background: g.hex, border: `2px solid ${g.border}`, color: g.textColor || "#1f2937", borderRadius: 6, padding: small ? "1px 7px" : "3px 10px", fontSize: small ? 10 : 12, fontWeight: 700 }}>
      {g.kup}
    </span>
  );
}

function Badge({ label, color }) {
  return <span style={{ background: color + "22", color, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{label}</span>;
}

function BackBtn({ onBack, label = "← Zurück" }) {
  return (
    <button onClick={onBack} style={{ background: "none", border: "none", color: C.primary, fontWeight: 700, fontSize: 14, cursor: "pointer", padding: 0, marginBottom: 12 }}>
      {label}
    </button>
  );
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

// ── Tab: Stammdaten ───────────────────────────────────────────────────────────
function TabStamm({ a, onChange }) {
  const gurt  = gurtById(a.gurtId);
  const next  = nextGurt(a.gurtId);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Card>
        {[
          ["Name",        a.name],
          ["Geburtsdatum", a.geb],
          ["Alter",       `${alter(a.geb)} Jahre`],
          ["Aktueller Gurt", `${gurt.kup} – ${gurt.farbe}`],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: `1px solid ${C.border}`, paddingBottom: 8, marginBottom: 8 }}>
            <span style={{ color: C.muted }}>{k}</span>
            <span style={{ fontWeight: 600 }}>{v}</span>
          </div>
        ))}
        {/* Gruppe */}
        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Gruppe</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {GRUPPEN.map(g => (
              <button key={g} onClick={() => onChange({ ...a, gruppe: g })}
                style={{ border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", background: a.gruppe === g ? C.primary : "#f3f4f6", color: a.gruppe === g ? "#fff" : "#374151" }}>
                {g}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {next && (
        <Card style={{ background: "#f0f9ff", borderRadius: 10 }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Nächste Graduierungsstufe</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <GurtBadge gurtId={a.gurtId} />
            <span style={{ fontSize: 16, color: C.muted }}>→</span>
            <GurtBadge gurtId={next.id} />
            <span style={{ fontSize: 12, color: C.muted }}>{next.farbe}</span>
          </div>
        </Card>
      )}

      {/* Notiz */}
      <Card>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Trainer-Notiz</div>
        <textarea
          value={a.notiz}
          onChange={e => onChange({ ...a, notiz: e.target.value })}
          placeholder="Notizen zum Athleten…"
          rows={3}
          style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 13, resize: "none", boxSizing: "border-box", fontFamily: "system-ui" }}
        />
      </Card>
    </div>
  );
}

// ── Tab: Graduierung ──────────────────────────────────────────────────────────
function TabGraduierung({ a, onChange }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ datum: "", von: a.gurtId, nach: "", note: "" });

  const addGrad = () => {
    if (!form.datum || !form.nach) return;
    const neu = { id: Date.now(), ...form };
    onChange({ ...a, gurtId: form.nach, graduierungen: [...a.graduierungen, neu] });
    setShowForm(false);
    setForm({ datum: "", von: form.nach, nach: "", note: "" });
  };

  const delGrad = (id) => onChange({ ...a, graduierungen: a.graduierungen.filter(g => g.id !== id) });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Card>
        <div style={{ fontWeight: 700, fontSize: 13, color: C.primary, marginBottom: 10 }}>Graduierungsverlauf</div>
        {a.graduierungen.length === 0
          ? <div style={{ color: "#9ca3af", fontSize: 13 }}>Noch keine Einträge</div>
          : [...a.graduierungen].reverse().map((g, i) => (
            <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 10, borderBottom: i < a.graduierungen.length - 1 ? `1px solid ${C.border}` : "none", marginBottom: i < a.graduierungen.length - 1 ? 10 : 0 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{g.datum}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <GurtBadge gurtId={g.von} small />
                  <span style={{ fontSize: 12, color: C.muted }}>→</span>
                  <GurtBadge gurtId={g.nach} small />
                </div>
              </div>
              {g.note && <Badge label={g.note} color="#22c55e" />}
              <button onClick={() => delGrad(g.id)} style={{ background: "none", border: "none", color: "#ef4444", fontSize: 16, cursor: "pointer", padding: 0 }}>×</button>
            </div>
          ))
        }
      </Card>

      {!showForm
        ? <button onClick={() => setShowForm(true)} style={{ background: C.primary, color: "#fff", border: "none", borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            + Neue Graduierung eintragen
          </button>
        : (
          <Card>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.primary, marginBottom: 12 }}>Neue Graduierung</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Datum</div>
                <input type="date" value={form.datum} onChange={e => setForm(p => ({ ...p, datum: e.target.value }))}
                  style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 13, boxSizing: "border-box" }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Neuer Gurtgrad</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {GURTGRADE.map(g => (
                    <button key={g.id} onClick={() => setForm(p => ({ ...p, nach: g.id }))}
                      style={{ background: form.nach === g.id ? C.primary : g.hex, border: `2px solid ${form.nach === g.id ? C.primary : g.border}`, color: form.nach === g.id ? "#fff" : (g.textColor || "#1f2937"), borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                      {g.kup}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Bewertung</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {BEWERTUNGEN.map(n => (
                    <button key={n} onClick={() => setForm(p => ({ ...p, note: n }))}
                      style={{ border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", background: form.note === n ? "#22c55e" : "#f3f4f6", color: form.note === n ? "#fff" : "#374151" }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setShowForm(false)} style={{ flex: 1, background: "#f3f4f6", border: "none", borderRadius: 10, padding: 10, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Abbrechen</button>
                <button onClick={addGrad} disabled={!form.datum || !form.nach}
                  style={{ flex: 2, background: !form.datum || !form.nach ? "#9ca3af" : C.primary, color: "#fff", border: "none", borderRadius: 10, padding: 10, fontWeight: 700, fontSize: 13, cursor: !form.datum || !form.nach ? "default" : "pointer" }}>
                  Speichern
                </button>
              </div>
            </div>
          </Card>
        )
      }
    </div>
  );
}

// ── Tab: Termine ──────────────────────────────────────────────────────────────
function TabTermine({ a, onChange }) {
  const toggle = (tid) => onChange({
    ...a,
    termine: a.termine.includes(tid) ? a.termine.filter(x => x !== tid) : [...a.termine, tid],
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Athlet einem Termin zuordnen oder entfernen.</div>
      {TERMINE.map(t => {
        const aktiv = a.termine.includes(t.id);
        return (
          <div key={t.id} onClick={() => toggle(t.id)}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, border: `2px solid ${aktiv ? t.color : C.border}`, background: aktiv ? t.color + "11" : "#f9fafb", cursor: "pointer" }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, border: `2px solid ${aktiv ? t.color : "#d1d5db"}`, background: aktiv ? t.color : C.card, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", fontWeight: 700, flexShrink: 0 }}>
              {aktiv ? "✓" : ""}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{t.label}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                {t.datum} · <Badge label={t.typ === "Pruefung" ? "Prüfung" : "Wettkampf"} color={t.color} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Tab: Ziele ────────────────────────────────────────────────────────────────
function TabZiele({ a, onChange }) {
  const [neuesZiel, setNeuesZiel] = useState("");

  const addZiel = () => {
    if (!neuesZiel.trim()) return;
    onChange({ ...a, ziele: [...a.ziele, { id: Date.now(), text: neuesZiel.trim(), erreicht: false }] });
    setNeuesZiel("");
  };
  const toggleZiel  = (id) => onChange({ ...a, ziele: a.ziele.map(z => z.id === id ? { ...z, erreicht: !z.erreicht } : z) });
  const deleteZiel  = (id) => onChange({ ...a, ziele: a.ziele.filter(z => z.id !== id) });
  const erreichtPct = a.ziele.length > 0 ? Math.round((a.ziele.filter(z => z.erreicht).length / a.ziele.length) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {a.ziele.length > 0 && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
            <span style={{ fontWeight: 600 }}>Fortschritt</span>
            <span style={{ fontWeight: 700, color: erreichtPct === 100 ? "#22c55e" : C.primary }}>{erreichtPct}%</span>
          </div>
          <div style={{ background: C.border, borderRadius: 8, height: 8 }}>
            <div style={{ width: `${erreichtPct}%`, background: erreichtPct === 100 ? "#22c55e" : "#3b82f6", borderRadius: 8, height: 8, transition: "width 0.4s" }} />
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>
            {a.ziele.filter(z => z.erreicht).length} von {a.ziele.length} Zielen erreicht
          </div>
        </Card>
      )}

      <Card>
        <div style={{ fontWeight: 700, fontSize: 13, color: C.primary, marginBottom: 10 }}>Trainingsziele</div>
        {a.ziele.length === 0 && <div style={{ color: "#9ca3af", fontSize: 13, marginBottom: 8 }}>Noch keine Ziele definiert.</div>}
        {a.ziele.map(z => (
          <div key={z.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, paddingBottom: 10, borderBottom: `1px solid ${C.border}`, marginBottom: 10 }}>
            <button onClick={() => toggleZiel(z.id)}
              style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${z.erreicht ? "#22c55e" : "#d1d5db"}`, background: z.erreicht ? "#22c55e" : C.card, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 700, flexShrink: 0, cursor: "pointer", marginTop: 1 }}>
              {z.erreicht ? "✓" : ""}
            </button>
            <span style={{ flex: 1, fontSize: 13, textDecoration: z.erreicht ? "line-through" : "none", color: z.erreicht ? "#9ca3af" : "#1f2937" }}>{z.text}</span>
            <button onClick={() => deleteZiel(z.id)} style={{ background: "none", border: "none", color: "#ef4444", fontSize: 16, cursor: "pointer", padding: 0 }}>×</button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <input value={neuesZiel} onChange={e => setNeuesZiel(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addZiel()}
            placeholder="Neues Ziel eingeben…"
            style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 13 }} />
          <button onClick={addZiel} style={{ background: C.primary, color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>+</button>
        </div>
      </Card>
    </div>
  );
}

// ── Athletenprofil ────────────────────────────────────────────────────────────
const PROF_TABS = [
  { id: "stamm",       label: "Profil"      },
  { id: "graduierung", label: "Graduierung" },
  { id: "termine",     label: "Termine"     },
  { id: "ziele",       label: "Ziele"       },
];

function AthletProfil({ athlet, onBack, onSave }) {
  const [a, setA]     = useState({ ...athlet, ziele: [...athlet.ziele], graduierungen: [...athlet.graduierungen], termine: [...athlet.termine] });
  const [tab, setTab] = useState("stamm");
  const [dirty, setDirty] = useState(false);

  const update = (updated) => { setA(updated); setDirty(true); };
  const g = gurtById(a.gurtId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <BackBtn onBack={onBack} label="← Athleten" />

      {/* Profilkopf */}
      <div style={{ background: `linear-gradient(135deg, ${C.primary}, #2563eb)`, borderRadius: 12, padding: 16, color: "#fff", display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
        <div style={{ background: g.hex, border: `3px solid ${g.border}`, borderRadius: "50%", width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>🥋</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 17 }}>{a.name}</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>{alter(a.geb)} Jahre · {a.gruppe}</div>
          <div style={{ marginTop: 6, display: "flex", gap: 6, alignItems: "center" }}>
            <GurtBadge gurtId={a.gurtId} />
            {a.termine.length > 0 && <Badge label={`${a.termine.length} Termin${a.termine.length > 1 ? "e" : ""}`} color="#93c5fd" />}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: anwColor(a.anwesenheit) }}>{a.anwesenheit}%</div>
          <div style={{ fontSize: 10, opacity: 0.75 }}>Anwesenheit</div>
        </div>
      </div>

      <TabBar tabs={PROF_TABS} active={tab} onChange={setTab} />

      {tab === "stamm"       && <TabStamm       a={a} onChange={update} />}
      {tab === "graduierung" && <TabGraduierung a={a} onChange={update} />}
      {tab === "termine"     && <TabTermine     a={a} onChange={update} />}
      {tab === "ziele"       && <TabZiele       a={a} onChange={update} />}

      {dirty && (
        <button onClick={() => { onSave(a); setDirty(false); }}
          style={{ marginTop: 14, background: C.primary, color: "#fff", border: "none", borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          Änderungen speichern
        </button>
      )}
    </div>
  );
}

// ── Neuer Athlet ──────────────────────────────────────────────────────────────
function NeuerAthlet({ onBack, onAdd }) {
  const [form, setForm] = useState({ name: "", geb: "", gurtId: "g10", gruppe: "Jugend" });
  const valid = form.name.trim() && form.geb;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <BackBtn onBack={onBack} label="← Athleten" />
      <Card style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: C.primary }}>Neuen Athleten anlegen</div>

        <div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Name *</div>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="Vor- und Nachname"
            style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 13, boxSizing: "border-box" }} />
        </div>

        <div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Geburtsdatum *</div>
          <input type="date" value={form.geb} onChange={e => setForm(p => ({ ...p, geb: e.target.value }))}
            style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 13, boxSizing: "border-box" }} />
        </div>

        <div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Gruppe *</div>
          <div style={{ display: "flex", gap: 6 }}>
            {GRUPPEN.map(g => (
              <button key={g} onClick={() => setForm(p => ({ ...p, gruppe: g }))}
                style={{ flex: 1, border: "none", borderRadius: 8, padding: "7px", fontSize: 12, fontWeight: 600, cursor: "pointer", background: form.gruppe === g ? C.primary : "#f3f4f6", color: form.gruppe === g ? "#fff" : "#374151" }}>
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Startgurtgrad *</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {GURTGRADE.map(g => (
              <button key={g.id} onClick={() => setForm(p => ({ ...p, gurtId: g.id }))}
                style={{ background: form.gurtId === g.id ? C.primary : g.hex, border: `2px solid ${form.gurtId === g.id ? C.primary : g.border}`, color: form.gurtId === g.id ? "#fff" : (g.textColor || "#1f2937"), borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                {g.kup}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button onClick={onBack} style={{ flex: 1, background: "#f3f4f6", border: "none", borderRadius: 10, padding: 11, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Abbrechen</button>
          <button onClick={() => valid && onAdd({ ...form, id: Date.now(), anwesenheit: 0, termine: [], ziele: [], graduierungen: [], notiz: "" })}
            disabled={!valid}
            style={{ flex: 2, background: valid ? C.primary : "#9ca3af", color: "#fff", border: "none", borderRadius: 10, padding: 11, fontWeight: 700, fontSize: 13, cursor: valid ? "pointer" : "default" }}>
            Athlet anlegen
          </button>
        </div>
      </Card>
    </div>
  );
}

// ── Athleten Hauptkomponente (export) ─────────────────────────────────────────
export function Athleten() {
  const [athleten, setAthletен] = useState(INIT_ATHLETEN);
  const [view, setView]         = useState("liste"); // liste | profil | neu
  const [sel, setSel]           = useState(null);
  const [filter, setFilter]     = useState("Alle");
  const [suche, setSuche]       = useState("");

  const save = (updated) => {
    setAthletен(p => p.map(a => a.id === updated.id ? updated : a));
    setView("liste");
  };
  const add = (neu) => {
    setAthletен(p => [...p, neu]);
    setView("liste");
  };

  if (view === "profil" && sel) return <AthletProfil athlet={sel} onBack={() => setView("liste")} onSave={save} />;
  if (view === "neu")           return <NeuerAthlet  onBack={() => setView("liste")} onAdd={add} />;

  const gefiltert = athleten
    .filter(a => filter === "Alle" || a.gruppe === filter)
    .filter(a => a.name.toLowerCase().includes(suche.toLowerCase()));

  // Statistik
  const schnitt = Math.round(gefiltert.reduce((s, a) => s + a.anwesenheit, 0) / (gefiltert.length || 1));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Suche */}
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: C.muted }}>🔍</span>
        <input value={suche} onChange={e => setSuche(e.target.value)}
          placeholder="Athlet suchen…"
          style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 10px 9px 32px", fontSize: 13, background: C.card, boxSizing: "border-box", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }} />
      </div>

      {/* Gruppenfilter */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {["Alle", ...GRUPPEN].map(g => (
          <button key={g} onClick={() => setFilter(g)}
            style={{ border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", background: filter === g ? C.primary : C.card, color: filter === g ? "#fff" : "#374151", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
            {g}
          </button>
        ))}
      </div>

      {/* KPI-Zeile */}
      <Card style={{ display: "flex", justifyContent: "space-around", padding: "12px 14px" }}>
        {[
          [gefiltert.length, "Athleten"],
          [`${schnitt}%`,    "Ø Anwesenheit", anwColor(schnitt)],
          [gefiltert.filter(a => a.anwesenheit < 60).length, "< 60 %", "#ef4444"],
        ].map(([v, l, col]) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: col || C.primary }}>{v}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </Card>

      {/* Athletenliste */}
      {gefiltert.length === 0
        ? <div style={{ textAlign: "center", color: "#9ca3af", padding: 24 }}>Keine Athleten gefunden.</div>
        : gefiltert.map(a => {
          const g = gurtById(a.gurtId);
          return (
            <div key={a.id} onClick={() => { setSel(a); setView("profil"); }}
              style={{ background: C.card, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", cursor: "pointer" }}>
              {/* Avatar mit Gurtfarbe */}
              <div style={{ background: g.hex, border: `3px solid ${g.border}`, borderRadius: "50%", width: 46, height: 46, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🥋</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{a.name}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>{alter(a.geb)} J. · {a.gruppe}</div>
                <div style={{ marginTop: 5, display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
                  <GurtBadge gurtId={a.gurtId} small />
                  {a.termine.length > 0 && <Badge label={`${a.termine.length} Termin${a.termine.length > 1 ? "e" : ""}`} color="#3b82f6" />}
                  {a.ziele.length > 0 && <Badge label={`${a.ziele.filter(z => z.erreicht).length}/${a.ziele.length} Ziele`} color="#8b5cf6" />}
                </div>
              </div>
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: anwColor(a.anwesenheit) }}>{a.anwesenheit}%</div>
                <div style={{ fontSize: 9, color: C.muted }}>Anwes.</div>
              </div>
              <div style={{ fontSize: 16, color: "#9ca3af" }}>›</div>
            </div>
          );
        })
      }

      <button onClick={() => setView("neu")} style={{ background: C.primary, color: "#fff", border: "none", borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
        + Athlet hinzufügen
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
  const [active, setActive]     = useState("athleten");
  const [menuOpen, setMenuOpen] = useState(false);
  const current = ALL_NAV.find(n => n.id === active) || NAV_ITEMS[2];

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
        {active === "athleten" ? <Athleten /> : <Placeholder title={current.label} />}
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
