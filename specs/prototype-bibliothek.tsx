import { useState, useEffect, useRef } from "react";

const C = {
  primary: "#1e3a5f", bg: "#f3f4f6", card: "#fff",
  muted: "#6b7280", border: "#e5e7eb",
};

// ── Mock-Daten ─────────────────────────────────────────────────────────────────
const KATEGORIEN = ["Alle", "Technik", "Kondition", "Spiel", "Poomsae", "Sparring", "Aufwärmen", "Dehnen"];
const NIVEAU     = ["Alle", "Anfänger", "Mittelstufe", "Fortgeschritten"];
const SCHWERPUNKTE = {
  Technik: "#8b5cf6", Kondition: "#22c55e", Spiel: "#f59e0b",
  Poomsae: "#3b82f6", Sparring: "#ef4444", Aufwärmen: "#ec4899", Dehnen: "#14b8a6",
};

const INIT_EINTRAEGE = [
  {
    id: 1, typ: "Übung", titel: "Dollyo-Chagi Kombination",
    kategorie: "Technik", niveau: "Mittelstufe",
    beschreibung: "Dreifache Rundkick-Kombination mit Gewichtsverlagerung. Fördert Hüftrotation, Gleichgewicht und Schlagkraft.",
    schritte: [
      "Ausgangsstellung: Kampfposition einnehmen, Gewicht auf hinterem Bein.",
      "1. Dollyo-Chagi mit dem vorderen Bein, Hüfte durchdrehen.",
      "Schnell absetzen und Standbein wechseln.",
      "2. Dollyo-Chagi mit dem anderen Bein, höher ansetzen.",
      "3. Springender Dollyo-Chagi (Twio Dollyo-Chagi) als Abschluss.",
      "Cool-down: 3 Sekunden Gleichgewichtshalten nach dem letzten Kick.",
    ],
    material: ["Zielpad (Mittelhalter)", "Kampfsport-Matte", "Mundschutz (bei Partnerübung)"],
    youtube: "dQw4w9WgXcQ",
    bilder: ["🦵", "⚡", "🎯"],
    timer: { aktiv: true, phasen: [
      { name: "Vorbereitung", dauer: 10, farbe: "#f59e0b" },
      { name: "Übung",        dauer: 30, farbe: "#22c55e" },
      { name: "Pause",        dauer: 15, farbe: "#3b82f6" },
    ], wiederholungen: 5 },
    tags: ["Kick", "Kombination", "Wettkampf"],
  },
  {
    id: 2, typ: "Spiel", titel: "Reaktions-Tag",
    kategorie: "Spiel", niveau: "Anfänger",
    beschreibung: "Spielerisches Aufwärmspiel zur Schulung von Reaktionsschnelligkeit und Beweglichkeit. Geeignet für alle Altersgruppen.",
    schritte: [
      "Alle Spieler verteilen sich in der Halle.",
      "Ein Spieler ist 'es' und trägt eine Weste oder ein Band.",
      "Ziel: Schulter der anderen Spieler berühren (nicht Körper).",
      "Berührte Spieler erstarren für 5 Sekunden in Kampfposition.",
      "Variante: Nur Kicks als Berührung erlaubt (kontrolliert, kein Kontakt).",
      "Nach 3 Minuten wechselt 'es'.",
    ],
    material: ["Weste oder Markierungsband", "Markierungshütchen für Spielfeld"],
    youtube: "",
    bilder: ["🏃", "🎮", "👥"],
    timer: { aktiv: true, phasen: [
      { name: "Spielzeit", dauer: 180, farbe: "#22c55e" },
      { name: "Pause",     dauer: 30,  farbe: "#3b82f6" },
    ], wiederholungen: 3 },
    tags: ["Reaktion", "Spiel", "Aufwärmen", "Jugend"],
  },
  {
    id: 3, typ: "Workout", titel: "Kampfsport-Intervall HIIT",
    kategorie: "Kondition", niveau: "Fortgeschritten",
    beschreibung: "Hochintensives Intervalltraining mit kampfsportspezifischen Übungen. Steigert Ausdauer, Schnelligkeit und Explosivkraft.",
    schritte: [
      "5 min Aufwärmen: Seilspringen und leichtes Schattenboxen.",
      "Block 1 – Kicks: 30s Ap-Chagi schnell / 15s Pause × 4",
      "Block 2 – Kombos: 30s 3-Schritt-Kombo / 15s Pause × 4",
      "Block 3 – Boden: 30s Burpees mit Kick / 15s Pause × 4",
      "Block 4 – Sprünge: 30s Twio Chagi / 15s Pause × 4",
      "5 min Cool-down: Dehnen aller Hauptmuskelgruppen.",
    ],
    material: ["Springseil", "Matte", "Zielpad (optional)", "Stoppuhr / Timer"],
    youtube: "Wuy8OT6OJJQ",
    bilder: ["💪", "🔥", "⏱"],
    timer: { aktiv: true, phasen: [
      { name: "Aufwärmen",  dauer: 300, farbe: "#f59e0b" },
      { name: "Arbeit",     dauer: 30,  farbe: "#ef4444" },
      { name: "Pause",      dauer: 15,  farbe: "#3b82f6" },
      { name: "Cool-down",  dauer: 300, farbe: "#14b8a6" },
    ], wiederholungen: 16 },
    tags: ["HIIT", "Kondition", "Fortgeschritten"],
  },
  {
    id: 4, typ: "Übung", titel: "Taegeuk 1 – Schritt für Schritt",
    kategorie: "Poomsae", niveau: "Anfänger",
    beschreibung: "Systematisches Erlernen von Taegeuk Il-Jang. Aufgebaut in 4 Lernabschnitte mit Einzeltechnik-Fokus.",
    schritte: [
      "Abschnitt 1: Bereitschaftsstellung (Joonbi) und erste 2 Bewegungen üben.",
      "Schritt 1: Linksschritt rückwärts – tiefer Block (Arae-Makgi).",
      "Schritt 2: Rechter Vorwärtsschritt – gerader Fauststoß (Momtong-Jireugi).",
      "Abschnitt 2: Bewegungen 3–6 isoliert üben.",
      "Abschnitt 3: Verbindung von Abschnitt 1 + 2, Reihenfolge sichern.",
      "Abschnitt 4: Komplette Form durchführen, auf Haltung und Spannung achten.",
      "Wiederholung: Form 3× komplett mit Kihap an den richtigen Stellen.",
    ],
    material: ["Markierungsband für Richtungslinien"],
    youtube: "LZJ_oBRy4hU",
    bilder: ["🥋", "📐", "⭐"],
    timer: { aktiv: false, phasen: [], wiederholungen: 3 },
    tags: ["Poomsae", "Grundlage", "Anfänger"],
  },
  {
    id: 5, typ: "Übung", titel: "Partnerübung – Ap-Chagi Abwehr",
    kategorie: "Sparring", niveau: "Mittelstufe",
    beschreibung: "Grundlegende Verteidigungstechnik gegen frontalen Tritt. Schult Timing, Distanz und Abwehrreflexe.",
    schritte: [
      "Partner A und B stehen im Abstand von einer Armlänge gegenüber.",
      "Partner A greift mit kontrolliertem Ap-Chagi an (langsam).",
      "Partner B weicht rückwärts aus und blockt mit Arae-Makgi.",
      "Rollenwechsel nach 10 Wiederholungen.",
      "Steigerung: Tempo erhöhen, Distanz variieren.",
      "Fortgeschritten: Partner A variiert zwischen Ap-Chagi und Dollyo-Chagi.",
    ],
    material: ["Schienbeinschützer", "Kampfsport-Matte", "Mundschutz"],
    youtube: "",
    bilder: ["🤼", "🛡", "👊"],
    timer: { aktiv: true, phasen: [
      { name: "Übungsrunde", dauer: 45, farbe: "#ef4444" },
      { name: "Wechsel",     dauer: 10, farbe: "#f59e0b" },
    ], wiederholungen: 6 },
    tags: ["Sparring", "Abwehr", "Partner"],
  },
];

// ── Hilfsfunktionen ──────────────────────────────────────────────────────────
const fmtSek = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const typColor = (typ) => ({ Übung: "#3b82f6", Workout: "#ef4444", Spiel: "#f59e0b" }[typ] || C.muted);

// ── UI-Bausteine ─────────────────────────────────────────────────────────────
function Card({ children, style, onClick }) {
  return <div onClick={onClick} style={{ background: C.card, borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", cursor: onClick ? "pointer" : "default", ...style }}>{children}</div>;
}
function Badge({ label, color }) {
  return <span style={{ background: color + "22", color, borderRadius: 6, padding: "2px 7px", fontSize: 11, fontWeight: 600 }}>{label}</span>;
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

// ── Intervall-Timer ──────────────────────────────────────────────────────────
function IntervallTimer({ timer }) {
  const [laufend, setLaufend]     = useState(false);
  const [phaseIdx, setPhaseIdx]   = useState(0);
  const [restSek, setRestSek]     = useState(timer.phasen[0]?.dauer || 0);
  const [runde, setRunde]         = useState(1);
  const [fertig, setFertig]       = useState(false);
  const ref = useRef(null);

  const phase = timer.phasen[phaseIdx] || timer.phasen[0];
  const gesamtPhasen = timer.phasen.length * timer.wiederholungen;
  const aktuelleGesamtPhase = (runde - 1) * timer.phasen.length + phaseIdx + 1;
  const fortPct = Math.round((aktuelleGesamtPhase / gesamtPhasen) * 100);

  useEffect(() => {
    if (!laufend || fertig) return;
    ref.current = setInterval(() => {
      setRestSek(prev => {
        if (prev <= 1) {
          // Nächste Phase
          const nextPhaseIdx = (phaseIdx + 1) % timer.phasen.length;
          const nextRunde = nextPhaseIdx === 0 ? runde + 1 : runde;
          if (nextPhaseIdx === 0 && runde >= timer.wiederholungen) {
            setLaufend(false); setFertig(true);
            return 0;
          }
          setPhaseIdx(nextPhaseIdx);
          setRunde(nextRunde);
          return timer.phasen[nextPhaseIdx].dauer;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [laufend, phaseIdx, runde, fertig]);

  const reset = () => {
    clearInterval(ref.current);
    setLaufend(false); setPhaseIdx(0); setRunde(1);
    setRestSek(timer.phasen[0]?.dauer || 0); setFertig(false);
  };

  const ringPct = restSek / (phase?.dauer || 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Ring */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0" }}>
        <svg width="160" height="160" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="80" cy="80" r="68" fill="none" stroke={C.border} strokeWidth="10" />
          <circle cx="80" cy="80" r="68" fill="none" stroke={phase?.farbe || C.primary} strokeWidth="10"
            strokeDasharray={`${2 * Math.PI * 68}`}
            strokeDashoffset={`${2 * Math.PI * 68 * (1 - ringPct)}`}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }} />
        </svg>
        <div style={{ marginTop: -100, textAlign: "center", zIndex: 1 }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: C.primary, fontVariantNumeric: "tabular-nums" }}>{fmtSek(restSek)}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: phase?.farbe || C.primary, marginTop: 2 }}>{fertig ? "✓ Fertig!" : phase?.name}</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Runde {runde} / {timer.wiederholungen}</div>
        </div>
      </div>

      {/* Fortschritt */}
      <div style={{ background: C.border, borderRadius: 8, height: 8 }}>
        <div style={{ width: `${fortPct}%`, background: C.primary, borderRadius: 8, height: 8, transition: "width 0.5s" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted }}>
        <span>Phase {aktuelleGesamtPhase} / {gesamtPhasen}</span>
        <span>{fortPct}%</span>
      </div>

      {/* Phasen-Übersicht */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        {timer.phasen.map((p, i) => (
          <div key={i} style={{ background: phaseIdx === i && !fertig ? p.farbe : p.farbe + "33", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 600, color: phaseIdx === i && !fertig ? "#fff" : p.farbe }}>
            {p.name} · {fmtSek(p.dauer)}
          </div>
        ))}
      </div>

      {/* Steuerung */}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={reset}
          style={{ flex: 1, background: "#f3f4f6", border: "none", borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          ↺ Reset
        </button>
        <button onClick={() => { if (fertig) { reset(); return; } setLaufend(p => !p); }}
          style={{ flex: 2, background: fertig ? "#22c55e" : laufend ? "#ef4444" : C.primary, color: "#fff", border: "none", borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
          {fertig ? "Nochmal" : laufend ? "⏸ Pause" : "▶ Start"}
        </button>
      </div>
    </div>
  );
}

// ── Eintrag Detail ───────────────────────────────────────────────────────────
const DETAIL_TABS = [
  { id: "uebersicht", label: "Übersicht" },
  { id: "anleitung",  label: "Anleitung" },
  { id: "media",      label: "Medien" },
  { id: "timer",      label: "Timer" },
];

function EintragDetail({ eintrag: init, onBack, onSave }) {
  const [e, setE]     = useState({ ...init, schritte: [...init.schritte], material: [...init.material], tags: [...init.tags], timer: { ...init.timer, phasen: init.timer.phasen.map(p => ({...p})) } });
  const [tab, setTab] = useState("uebersicht");
  const [dirty, setDirty] = useState(false);
  const spColor = SCHWERPUNKTE[e.kategorie] || C.muted;

  const update = (updated) => { setE(updated); setDirty(true); };

  const tabs = init.timer.aktiv
    ? DETAIL_TABS
    : DETAIL_TABS.filter(t => t.id !== "timer");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <BackBtn onBack={onBack} label="← Bibliothek" />

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.primary}, #1e5799)`, borderRadius: 12, padding: 16, color: "#fff", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
          <Badge label={e.typ} color={typColor(e.typ)} />
          <Badge label={e.kategorie} color={spColor} />
          <Badge label={e.niveau} color="#94a3b8" />
        </div>
        <div style={{ fontWeight: 800, fontSize: 18 }}>{e.titel}</div>
        <div style={{ fontSize: 13, opacity: 0.85, marginTop: 6, lineHeight: 1.5 }}>{e.beschreibung}</div>
        <div style={{ display: "flex", gap: 5, marginTop: 10, flexWrap: "wrap" }}>
          {e.tags.map(t => <span key={t} style={{ background: "rgba(255,255,255,0.2)", borderRadius: 6, padding: "2px 8px", fontSize: 10 }}>#{t}</span>)}
        </div>
      </div>

      <TabBar tabs={tabs} active={tab} onChange={setTab} />

      {/* Tab: Übersicht */}
      {tab === "uebersicht" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Emojis als Bildplatzhalter */}
          <div style={{ display: "flex", gap: 8 }}>
            {e.bilder.map((b, i) => (
              <div key={i} style={{ flex: 1, background: spColor + "22", borderRadius: 10, height: 80, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>{b}</div>
            ))}
          </div>

          {/* Kurzinfos */}
          <Card>
            {[
              ["Typ", e.typ],
              ["Kategorie", e.kategorie],
              ["Niveau", e.niveau],
              ["Schritte", `${e.schritte.length} Schritte`],
              ["Material", `${e.material.length} Positionen`],
              ["Timer", e.timer.aktiv ? `${e.timer.phasen.length} Phasen · ${e.timer.wiederholungen}× Wdh.` : "Kein Timer"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: `1px solid ${C.border}`, paddingBottom: 8, marginBottom: 8 }}>
                <span style={{ color: C.muted }}>{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </Card>

          {/* Material */}
          <Card>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.primary, marginBottom: 10 }}>🧰 Materialliste</div>
            {e.material.length === 0
              ? <div style={{ color: "#9ca3af", fontSize: 13 }}>Kein Material erforderlich.</div>
              : e.material.map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 8, borderBottom: i < e.material.length - 1 ? `1px solid ${C.border}` : "none", marginBottom: i < e.material.length - 1 ? 8 : 0 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: spColor + "33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>✓</div>
                  <span style={{ fontSize: 13 }}>{m}</span>
                </div>
              ))
            }
          </Card>
        </div>
      )}

      {/* Tab: Anleitung */}
      {tab === "anleitung" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Card>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.primary, marginBottom: 12 }}>📋 Schritt-für-Schritt Anleitung</div>
            {e.schritte.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1, paddingTop: 4, fontSize: 13, lineHeight: 1.6 }}>{s}</div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* Tab: Medien */}
      {tab === "media" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Bildbereich */}
          <Card>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.primary, marginBottom: 10 }}>🖼 Bilder</div>
            <div style={{ display: "flex", gap: 8 }}>
              {e.bilder.map((b, i) => (
                <div key={i} style={{ flex: 1, background: spColor + "22", borderRadius: 10, height: 90, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: 32, gap: 4 }}>
                  {b}
                  <span style={{ fontSize: 9, color: C.muted }}>Bild {i + 1}</span>
                </div>
              ))}
              <div style={{ flex: 1, background: "#f3f4f6", borderRadius: 10, height: 90, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: 24, gap: 4, cursor: "pointer", border: `2px dashed ${C.border}` }}>
                <span>➕</span>
                <span style={{ fontSize: 9, color: C.muted }}>Hinzufügen</span>
              </div>
            </div>
          </Card>

          {/* YouTube */}
          <Card>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.primary, marginBottom: 10 }}>▶️ Video</div>
            {e.youtube ? (
              <div>
                <div style={{ borderRadius: 10, overflow: "hidden", background: "#000", position: "relative" }}>
                  <iframe
                    width="100%" height="200"
                    src={`https://www.youtube.com/embed/${e.youtube}`}
                    title="YouTube Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ display: "block" }}
                  />
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <input value={`https://youtube.com/watch?v=${e.youtube}`} readOnly
                    style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", fontSize: 12, color: C.muted, background: "#f9fafb" }} />
                  <button onClick={() => update({ ...e, youtube: "" })}
                    style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 8, padding: "7px 10px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                    Entfernen
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ background: "#f3f4f6", borderRadius: 10, height: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, border: `2px dashed ${C.border}` }}>
                  <span style={{ fontSize: 28 }}>▶️</span>
                  <span style={{ fontSize: 12, color: C.muted }}>Kein Video hinterlegt</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input placeholder="YouTube Video-ID oder URL einfügen"
                    style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 12 }}
                    onBlur={ev => {
                      const val = ev.target.value.trim();
                      const match = val.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                      if (match) update({ ...e, youtube: match[1] });
                      else if (val.length === 11) update({ ...e, youtube: val });
                    }} />
                  <button style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "8px 12px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>▶</button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab: Timer */}
      {tab === "timer" && e.timer.aktiv && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.primary, marginBottom: 4 }}>⏱ Intervall-Timer</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>
              {e.timer.phasen.length} Phasen · {e.timer.wiederholungen} Wiederholungen ·{" "}
              {fmtSek(e.timer.phasen.reduce((s, p) => s + p.dauer, 0) * e.timer.wiederholungen)} Gesamtzeit
            </div>
            <IntervallTimer timer={e.timer} />
          </Card>

          {/* Timer konfigurieren */}
          <Card>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.primary, marginBottom: 10 }}>⚙️ Timer konfigurieren</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>Wiederholungen</div>
            <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
              {[1, 2, 3, 4, 5, 6, 8, 10].map(n => (
                <button key={n} onClick={() => update({ ...e, timer: { ...e.timer, wiederholungen: n } })}
                  style={{ border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 12, fontWeight: 600, cursor: "pointer", background: e.timer.wiederholungen === n ? C.primary : "#f3f4f6", color: e.timer.wiederholungen === n ? "#fff" : "#374151" }}>
                  {n}×
                </button>
              ))}
            </div>
            {e.timer.phasen.map((p, i) => (
              <div key={i} style={{ borderLeft: `4px solid ${p.farbe}`, paddingLeft: 10, marginBottom: 12 }}>
                <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 5, color: p.farbe }}>{p.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>Dauer</span>
                  <input type="range" min="5" max="600" step="5" value={p.dauer}
                    onChange={ev => {
                      const phs = e.timer.phasen.map((ph, idx) => idx === i ? { ...ph, dauer: Number(ev.target.value) } : ph);
                      update({ ...e, timer: { ...e.timer, phasen: phs } });
                    }} style={{ flex: 1 }} />
                  <span style={{ fontWeight: 700, fontSize: 13, minWidth: 44, textAlign: "right" }}>{fmtSek(p.dauer)}</span>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {dirty && (
        <button onClick={() => { onSave(e); setDirty(false); }}
          style={{ marginTop: 14, background: C.primary, color: "#fff", border: "none", borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          Änderungen speichern
        </button>
      )}
    </div>
  );
}

// ── Neuer Eintrag ────────────────────────────────────────────────────────────
function NeuerEintrag({ onBack, onAdd }) {
  const [form, setForm] = useState({
    typ: "Übung", titel: "", kategorie: "Technik", niveau: "Anfänger",
    beschreibung: "", schritte: [""], material: [""], tags: [],
    youtube: "", bilder: ["🏋", "⚡", "🎯"],
    timer: { aktiv: false, phasen: [
      { name: "Arbeit", dauer: 30, farbe: "#22c55e" },
      { name: "Pause",  dauer: 15, farbe: "#3b82f6" },
    ], wiederholungen: 4 },
  });
  const valid = form.titel.trim() && form.beschreibung.trim();

  const addSchritt  = () => setForm(p => ({ ...p, schritte: [...p.schritte, ""] }));
  const addMaterial = () => setForm(p => ({ ...p, material: [...p.material, ""] }));
  const [neuerTag, setNeuerTag] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <BackBtn onBack={onBack} label="← Bibliothek" />
      <Card style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: C.primary }}>Neuen Eintrag anlegen</div>

        {/* Typ */}
        <div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Typ *</div>
          <div style={{ display: "flex", gap: 6 }}>
            {["Übung", "Workout", "Spiel"].map(t => (
              <button key={t} onClick={() => setForm(p => ({ ...p, typ: t }))}
                style={{ flex: 1, border: "none", borderRadius: 8, padding: "8px", fontSize: 12, fontWeight: 600, cursor: "pointer", background: form.typ === t ? typColor(t) : "#f3f4f6", color: form.typ === t ? "#fff" : "#374151" }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Titel */}
        <div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Titel *</div>
          <input value={form.titel} onChange={e => setForm(p => ({ ...p, titel: e.target.value }))}
            placeholder="Name der Übung / des Workouts"
            style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 13, boxSizing: "border-box" }} />
        </div>

        {/* Kategorie & Niveau */}
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Kategorie</div>
            <select value={form.kategorie} onChange={e => setForm(p => ({ ...p, kategorie: e.target.value }))}
              style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 13 }}>
              {KATEGORIEN.filter(k => k !== "Alle").map(k => <option key={k}>{k}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Niveau</div>
            <select value={form.niveau} onChange={e => setForm(p => ({ ...p, niveau: e.target.value }))}
              style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 13 }}>
              {NIVEAU.filter(n => n !== "Alle").map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {/* Beschreibung */}
        <div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Beschreibung *</div>
          <textarea value={form.beschreibung} onChange={e => setForm(p => ({ ...p, beschreibung: e.target.value }))}
            placeholder="Kurze Beschreibung…" rows={3}
            style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 13, resize: "none", boxSizing: "border-box", fontFamily: "system-ui" }} />
        </div>

        {/* Timer */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div onClick={() => setForm(p => ({ ...p, timer: { ...p.timer, aktiv: !p.timer.aktiv } }))}
            style={{ width: 42, height: 24, borderRadius: 12, background: form.timer.aktiv ? "#22c55e" : C.border, position: "relative", cursor: "pointer", transition: "background 0.2s" }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: form.timer.aktiv ? 21 : 3, transition: "left 0.2s" }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Intervall-Timer aktivieren</span>
        </div>

        {/* Tags */}
        <div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Tags</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 6 }}>
            {form.tags.map(t => (
              <span key={t} style={{ background: C.primary + "22", color: C.primary, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                onClick={() => setForm(p => ({ ...p, tags: p.tags.filter(x => x !== t) }))}>
                #{t} ×
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <input value={neuerTag} onChange={e => setNeuerTag(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && neuerTag.trim()) { setForm(p => ({ ...p, tags: [...p.tags, neuerTag.trim()] })); setNeuerTag(""); } }}
              placeholder="Tag eingeben + Enter"
              style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", fontSize: 13 }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onBack} style={{ flex: 1, background: "#f3f4f6", border: "none", borderRadius: 10, padding: 11, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Abbrechen</button>
          <button onClick={() => valid && onAdd({ ...form, id: Date.now() })} disabled={!valid}
            style={{ flex: 2, background: valid ? C.primary : "#9ca3af", color: "#fff", border: "none", borderRadius: 10, padding: 11, fontWeight: 700, fontSize: 13, cursor: valid ? "pointer" : "default" }}>
            Anlegen
          </button>
        </div>
      </Card>
    </div>
  );
}

// ── Bibliothek Hauptkomponente (export) ───────────────────────────────────────
export function Bibliothek() {
  const [eintraege, setEintraege] = useState(INIT_EINTRAEGE);
  const [view, setView]           = useState("liste");
  const [sel, setSel]             = useState(null);
  const [katFilter, setKatFilter] = useState("Alle");
  const [niveauFilter, setNiveauFilter] = useState("Alle");
  const [suche, setSuche]         = useState("");

  const save = (updated) => { setEintraege(p => p.map(e => e.id === updated.id ? updated : e)); setView("liste"); };
  const add  = (neu)     => { setEintraege(p => [neu, ...p]); setView("liste"); };

  if (view === "detail" && sel) return <EintragDetail eintrag={sel} onBack={() => setView("liste")} onSave={save} />;
  if (view === "neu")           return <NeuerEintrag  onBack={() => setView("liste")} onAdd={add} />;

  const gefiltert = eintraege
    .filter(e => katFilter   === "Alle" || e.kategorie === katFilter)
    .filter(e => niveauFilter === "Alle" || e.niveau    === niveauFilter)
    .filter(e => e.titel.toLowerCase().includes(suche.toLowerCase()) || e.tags.some(t => t.toLowerCase().includes(suche.toLowerCase())));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Suche */}
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: C.muted }}>🔍</span>
        <input value={suche} onChange={e => setSuche(e.target.value)}
          placeholder="Übung, Workout oder Tag suchen…"
          style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 10px 9px 32px", fontSize: 13, background: C.card, boxSizing: "border-box", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }} />
      </div>

      {/* Kategorie-Filter */}
      <div style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 2 }}>
        {KATEGORIEN.map(k => (
          <button key={k} onClick={() => setKatFilter(k)}
            style={{ border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", flexShrink: 0, background: katFilter === k ? (SCHWERPUNKTE[k] || C.primary) : C.card, color: katFilter === k ? "#fff" : "#374151", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
            {k}
          </button>
        ))}
      </div>

      {/* Niveau-Filter */}
      <div style={{ display: "flex", gap: 5 }}>
        {NIVEAU.map(n => (
          <button key={n} onClick={() => setNiveauFilter(n)}
            style={{ border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", background: niveauFilter === n ? C.primary : C.card, color: niveauFilter === n ? "#fff" : "#374151", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
            {n}
          </button>
        ))}
      </div>

      {/* Anzahl */}
      <div style={{ fontSize: 12, color: C.muted }}>{gefiltert.length} Einträge gefunden</div>

      {/* Eintrags-Karten */}
      {gefiltert.length === 0
        ? <div style={{ textAlign: "center", color: "#9ca3af", padding: 32 }}>Keine Einträge gefunden.</div>
        : gefiltert.map(e => {
          const spColor = SCHWERPUNKTE[e.kategorie] || C.muted;
          return (
            <div key={e.id} onClick={() => { setSel(e); setView("detail"); }}
              style={{ background: C.card, borderRadius: 12, padding: "13px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", cursor: "pointer", borderLeft: `4px solid ${spColor}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 5, marginBottom: 5, flexWrap: "wrap" }}>
                    <Badge label={e.typ} color={typColor(e.typ)} />
                    <Badge label={e.kategorie} color={spColor} />
                    <Badge label={e.niveau} color="#94a3b8" />
                    {e.timer.aktiv && <Badge label="⏱ Timer" color="#8b5cf6" />}
                    {e.youtube && <Badge label="▶ Video" color="#ef4444" />}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{e.titel}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 4, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {e.beschreibung}
                  </div>
                  <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                    {e.tags.map(t => <span key={t} style={{ fontSize: 10, color: C.muted }}>#{t}</span>)}
                  </div>
                </div>
                <div style={{ fontSize: 28, flexShrink: 0 }}>{e.bilder[0]}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <span style={{ fontSize: 11, color: C.muted }}>{e.schritte.length} Schritte · {e.material.length} Material</span>
                <span style={{ fontSize: 13, color: "#9ca3af" }}>›</span>
              </div>
            </div>
          );
        })
      }

      <button onClick={() => setView("neu")} style={{ background: C.primary, color: "#fff", border: "none", borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
        + Neuen Eintrag anlegen
      </button>
    </div>
  );
}

// ── App-Shell ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard",   label: "Dashboard",  icon: "🏠" },
  { id: "planung",     label: "Planung",    icon: "📅" },
  { id: "athleten",    label: "Athleten",   icon: "🥋" },
  { id: "bibliothek",  label: "Bibliothek", icon: "📚" },
  { id: "auswertung",  label: "Auswertung", icon: "📊" },
];
const ALL_NAV = [
  { id: "dashboard",    label: "Dashboard",   icon: "🏠" },
  { id: "planung",      label: "Planung",     icon: "📅" },
  { id: "athleten",     label: "Athleten",    icon: "🥋" },
  { id: "anwesenheit",  label: "Anwesenheit", icon: "✅" },
  { id: "pruefungen",   label: "Prüfungen",   icon: "🏆" },
  { id: "bibliothek",   label: "Bibliothek",  icon: "📚" },
  { id: "auswertung",   label: "Auswertung",  icon: "📊" },
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
  const [active, setActive]     = useState("bibliothek");
  const [menuOpen, setMenuOpen] = useState(false);
  const current = ALL_NAV.find(n => n.id === active) || ALL_NAV[5];

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
        {active === "bibliothek" ? <Bibliothek /> : <Placeholder title={current.label} />}
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
