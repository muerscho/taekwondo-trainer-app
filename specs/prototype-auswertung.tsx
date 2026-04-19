import { useState } from "react";

// ── Shared Design Tokens (identisch zur Haupt-App) ────────────────────────────
const COLOR_PRIMARY  = "#1e3a5f";
const COLOR_BG       = "#f3f4f6";
const COLOR_CARD     = "#fff";
const COLOR_MUTED    = "#6b7280";
const COLOR_BORDER   = "#e5e7eb";

// ── Mock-Daten ────────────────────────────────────────────────────────────────
const SCHWERPUNKTE = [
  { name: "Kyorugi",           color: "#ef4444", soll: 40 },
  { name: "Poomsae",           color: "#3b82f6", soll: 30 },
  { name: "Kondition",         color: "#22c55e", soll: 20 },
  { name: "Theorie",           color: "#f59e0b", soll: 10 },
];

// Ist-Werte je Zeitraum
const SP_DATA = {
  "4W":  [38, 32, 18, 12],
  "8W":  [35, 28, 25, 12],
  "12W": [42, 27, 22,  9],
};

const ATHLETEN = [
  { id: 1, name: "Max Mustermann", gruppe: "Erwachsene",      anw: [true,true,false,true,true,true,false,true,true,true,false,true], ziele: 2, zielErreicht: 1 },
  { id: 2, name: "Lena Schmidt",   gruppe: "Jugend",           anw: [true,true,true,true,true,true,true,false,true,true,true,true],  ziele: 1, zielErreicht: 1 },
  { id: 3, name: "Jonas Weber",    gruppe: "Fortgeschrittene", anw: [true,false,true,true,false,true,true,true,false,true,true,false], ziele: 3, zielErreicht: 1 },
  { id: 4, name: "Sara Bauer",     gruppe: "Jugend",           anw: [true,false,false,true,true,false,true,false,true,true,false,true], ziele: 0, zielErreicht: 0 },
  { id: 5, name: "Tom Fischer",    gruppe: "Erwachsene",       anw: [false,true,false,false,true,true,false,false,true,false,true,false], ziele: 1, zielErreicht: 0 },
  { id: 6, name: "Mia Krause",     gruppe: "Jugend",           anw: [true,true,true,true,false,true,true,true,true,false,true,true], ziele: 2, zielErreicht: 2 },
];

const EINHEITEN_PRO_WOCHE = [3, 3, 2, 3, 3, 3, 2, 3, 3, 3, 2, 3]; // 12 Wochen
const WOCHEN_LABEL = ["KW10","KW11","KW12","KW13","KW14","KW15","KW16","KW17","KW18","KW19","KW20","KW21"];

const PRUEFUNGEN = [
  { label: "Kup-Prüfung (6.–4. Kup)", datum: "12.04.2026", athleten: 2, bestanden: 2, kriterien: 4, erfuellt: 3 },
  { label: "Dan-Prüfung 1. Dan",       datum: "15.06.2026", athleten: 1, bestanden: 0, kriterien: 5, erfuellt: 2 },
];

const ZEITRAEUME = ["4W", "8W", "12W"];
const ZEITRAUM_LABEL = { "4W": "4 Wochen", "8W": "8 Wochen", "12W": "12 Wochen" };
const GRUPPEN = ["Alle", "Erwachsene", "Jugend", "Fortgeschrittene"];

// ── UI-Bausteine ──────────────────────────────────────────────────────────────
function Card({ children, style }) {
  return <div style={{ background: COLOR_CARD, borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", ...style }}>{children}</div>;
}

function SectionTitle({ children }) {
  return <div style={{ fontWeight: 800, fontSize: 14, color: COLOR_PRIMARY, marginBottom: 10 }}>{children}</div>;
}

function Badge({ label, color }) {
  return <span style={{ background: color + "22", color, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{label}</span>;
}

function KPIBlock({ value, label, color }) {
  return (
    <div style={{ textAlign: "center", flex: 1 }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: color || COLOR_PRIMARY }}>{value}</div>
      <div style={{ fontSize: 10, color: COLOR_MUTED, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", background: COLOR_CARD, borderRadius: 10, padding: 4, gap: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: 14 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          style={{ flex: 1, border: "none", borderRadius: 8, padding: "8px 0", fontSize: 12, fontWeight: 600, cursor: "pointer", background: active === t.id ? COLOR_PRIMARY : "none", color: active === t.id ? "#fff" : COLOR_MUTED }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

function HorizontalBar({ wert, max, color, label, soll }) {
  const pct = Math.round((wert / max) * 100);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ color: Math.abs(wert - soll) > 5 ? "#ef4444" : "#22c55e" }}>
          {wert}% <span style={{ color: COLOR_MUTED, fontWeight: 400 }}>/ Soll {soll}%</span>
        </span>
      </div>
      <div style={{ position: "relative", background: COLOR_BORDER, borderRadius: 8, height: 12 }}>
        <div style={{ width: `${pct}%`, background: color, borderRadius: 8, height: 12, transition: "width 0.5s" }} />
        {/* Soll-Marker */}
        <div style={{ position: "absolute", top: -2, bottom: -2, left: `${soll}%`, width: 2, background: "#374151", borderRadius: 2 }} />
      </div>
    </div>
  );
}

// ── Bereich: Schwerpunkte ─────────────────────────────────────────────────────
function AuswertungSchwerpunkte() {
  const [zeitraum, setZeitraum] = useState("8W");
  const [gruppe, setGruppe] = useState("Alle");
  const istWerte = SP_DATA[zeitraum];

  // Kuchendiagramm (SVG)
  const radius = 54, cx = 64, cy = 64;
  let startAngle = -90;
  const slices = SCHWERPUNKTE.map((s, i) => {
    const angle = (istWerte[i] / 100) * 360;
    const rad1 = (startAngle * Math.PI) / 180;
    const rad2 = ((startAngle + angle) * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(rad1);
    const y1 = cy + radius * Math.sin(rad1);
    const x2 = cx + radius * Math.cos(rad2);
    const y2 = cy + radius * Math.sin(rad2);
    const large = angle > 180 ? 1 : 0;
    const path = `M${cx},${cy} L${x1},${y1} A${radius},${radius} 0 ${large},1 ${x2},${y2} Z`;
    startAngle += angle;
    return { ...s, path, ist: istWerte[i] };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Filter */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {ZEITRAEUME.map(z => (
          <button key={z} onClick={() => setZeitraum(z)}
            style={{ border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", background: zeitraum === z ? COLOR_PRIMARY : COLOR_CARD, color: zeitraum === z ? "#fff" : "#374151", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
            {ZEITRAUM_LABEL[z]}
          </button>
        ))}
      </div>

      {/* Donut + Legende */}
      <Card style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <svg width="128" height="128" style={{ flexShrink: 0 }}>
          {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} />)}
          <circle cx={cx} cy={cy} r={32} fill={COLOR_CARD} />
          <text x={cx} y={cy - 6} textAnchor="middle" fontSize="11" fill={COLOR_MUTED}>Ist</text>
          <text x={cx} y={cy + 10} textAnchor="middle" fontSize="13" fontWeight="bold" fill={COLOR_PRIMARY}>{zeitraum}</text>
        </svg>
        <div style={{ flex: 1 }}>
          {slices.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, flex: 1 }}>{s.name}</span>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{s.ist}%</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Balken Soll/Ist */}
      <Card>
        <SectionTitle>Soll / Ist Vergleich</SectionTitle>
        {SCHWERPUNKTE.map((s, i) => (
          <HorizontalBar key={i} label={s.name} wert={istWerte[i]} soll={s.soll} max={100} color={s.color} />
        ))}
        <div style={{ fontSize: 11, color: COLOR_MUTED, marginTop: 6 }}>▏ = Sollwert</div>
      </Card>

      {/* Trendverlauf (Sparklines) */}
      <Card>
        <SectionTitle>Trend – Einheiten pro Woche</SectionTitle>
        <svg width="100%" height="80" viewBox="0 0 320 80" preserveAspectRatio="none">
          {/* Grid */}
          {[1,2,3].map(i => <line key={i} x1="0" y1={i * 20} x2="320" y2={i * 20} stroke={COLOR_BORDER} strokeWidth="1" />)}
          {/* Linie */}
          <polyline
            points={EINHEITEN_PRO_WOCHE.map((v, i) => `${(i / 11) * 310 + 5},${70 - v * 18}`).join(" ")}
            fill="none" stroke={COLOR_PRIMARY} strokeWidth="2" strokeLinejoin="round" />
          {/* Punkte */}
          {EINHEITEN_PRO_WOCHE.map((v, i) => (
            <circle key={i} cx={(i / 11) * 310 + 5} cy={70 - v * 18} r="4" fill={COLOR_PRIMARY} />
          ))}
        </svg>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          {WOCHEN_LABEL.filter((_, i) => i % 3 === 0).map(l => (
            <span key={l} style={{ fontSize: 9, color: COLOR_MUTED }}>{l}</span>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Bereich: Anwesenheit ──────────────────────────────────────────────────────
function AuswertungAnwesenheit() {
  const [gruppe, setGruppe] = useState("Alle");

  const gefiltert = gruppe === "Alle" ? ATHLETEN : ATHLETEN.filter(a => a.gruppe === gruppe);
  const quoten = gefiltert.map(a => Math.round((a.anw.filter(Boolean).length / a.anw.length) * 100));
  const schnitt = Math.round(quoten.reduce((s, v) => s + v, 0) / quoten.length);

  const qColor = (q) => q >= 80 ? "#22c55e" : q >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Gruppe Filter */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {GRUPPEN.map(g => (
          <button key={g} onClick={() => setGruppe(g)}
            style={{ border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", background: gruppe === g ? COLOR_PRIMARY : COLOR_CARD, color: gruppe === g ? "#fff" : "#374151", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
            {g}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <Card style={{ display: "flex", justifyContent: "space-around" }}>
        <KPIBlock value={`${schnitt}%`} label="Ø Gruppe" color={qColor(schnitt)} />
        <KPIBlock value={quoten.filter(q => q >= 80).length} label="≥ 80 %" color="#22c55e" />
        <KPIBlock value={quoten.filter(q => q < 60).length} label="< 60 %" color="#ef4444" />
      </Card>

      {/* Athleten-Liste */}
      <Card>
        <SectionTitle>Anwesenheitsquoten</SectionTitle>
        {gefiltert.map((a, i) => {
          const q = quoten[i];
          return (
            <div key={a.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                <span>{a.name}</span>
                <span style={{ color: qColor(q) }}>{q}%</span>
              </div>
              {/* Mini-Heatmap der letzten 12 Einheiten */}
              <div style={{ display: "flex", gap: 3 }}>
                {a.anw.map((v, j) => (
                  <div key={j} style={{ flex: 1, height: 10, borderRadius: 3, background: v ? "#22c55e" : "#fee2e2" }} title={`Einheit ${j + 1}: ${v ? "Anwesend" : "Abwesend"}`} />
                ))}
              </div>
            </div>
          );
        })}
        <div style={{ fontSize: 11, color: COLOR_MUTED, marginTop: 4 }}>🟩 Anwesend · 🟥 Abwesend (letzte 12 Einheiten)</div>
      </Card>

      {/* Gruppenvergleich */}
      <Card>
        <SectionTitle>Gruppenvergleich</SectionTitle>
        {["Erwachsene", "Jugend", "Fortgeschrittene"].map(g => {
          const ath = ATHLETEN.filter(a => a.gruppe === g);
          const avg = Math.round(ath.reduce((s, a) => s + (a.anw.filter(Boolean).length / a.anw.length) * 100, 0) / ath.length);
          return (
            <div key={g} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                <span>{g}</span><span style={{ color: qColor(avg) }}>{avg}%</span>
              </div>
              <div style={{ background: COLOR_BORDER, borderRadius: 8, height: 10 }}>
                <div style={{ width: `${avg}%`, background: qColor(avg), borderRadius: 8, height: 10, transition: "width 0.5s" }} />
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

// ── Bereich: Ziele & Prüfungen ────────────────────────────────────────────────
function AuswertungZiele() {
  const gesamt = ATHLETEN.reduce((s, a) => s + a.ziele, 0);
  const erreicht = ATHLETEN.reduce((s, a) => s + a.zielErreicht, 0);
  const offen = gesamt - erreicht;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Ziel KPIs */}
      <Card style={{ display: "flex", justifyContent: "space-around" }}>
        <KPIBlock value={gesamt}   label="Ziele gesamt" />
        <KPIBlock value={erreicht} label="Erreicht"     color="#22c55e" />
        <KPIBlock value={offen}    label="Offen"        color="#f59e0b" />
      </Card>

      {/* Ziele je Athlet */}
      <Card>
        <SectionTitle>Ziele je Athlet</SectionTitle>
        {ATHLETEN.map(a => {
          const pct = a.ziele > 0 ? Math.round((a.zielErreicht / a.ziele) * 100) : 0;
          return (
            <div key={a.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                <span>{a.name}</span>
                <span style={{ color: COLOR_MUTED, fontWeight: 400, fontSize: 12 }}>{a.zielErreicht}/{a.ziele} Ziele</span>
              </div>
              {a.ziele > 0 ? (
                <div style={{ background: COLOR_BORDER, borderRadius: 8, height: 10 }}>
                  <div style={{ width: `${pct}%`, background: pct === 100 ? "#22c55e" : "#3b82f6", borderRadius: 8, height: 10, transition: "width 0.5s" }} />
                </div>
              ) : (
                <div style={{ fontSize: 11, color: "#9ca3af" }}>Keine Ziele definiert</div>
              )}
            </div>
          );
        })}
      </Card>

      {/* Prüfungsbereitschaft */}
      <Card>
        <SectionTitle>Prüfungen & Wettkämpfe</SectionTitle>
        {PRUEFUNGEN.map((p, i) => {
          const bereit = Math.round((p.erfuellt / p.kriterien) * 100);
          return (
            <div key={i} style={{ borderBottom: i < PRUEFUNGEN.length - 1 ? `1px solid ${COLOR_BORDER}` : "none", paddingBottom: 12, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{p.label}</div>
              <div style={{ fontSize: 12, color: COLOR_MUTED, marginBottom: 8 }}>{p.datum} · {p.athleten} Athlet{p.athleten > 1 ? "en" : ""}</div>
              {/* Kriterien */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span>Kriterien erfüllt</span>
                <span style={{ fontWeight: 700, color: bereit >= 80 ? "#22c55e" : "#f59e0b" }}>{p.erfuellt}/{p.kriterien}</span>
              </div>
              <div style={{ background: COLOR_BORDER, borderRadius: 8, height: 10, marginBottom: 8 }}>
                <div style={{ width: `${bereit}%`, background: bereit >= 80 ? "#22c55e" : "#f59e0b", borderRadius: 8, height: 10, transition: "width 0.5s" }} />
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {p.bestanden > 0 && <Badge label={`${p.bestanden} bestanden`} color="#22c55e" />}
                {p.bestanden === 0 && <Badge label="Ausstehend" color="#f59e0b" />}
                <Badge label={`${bereit}% bereit`} color={bereit >= 80 ? "#22c55e" : "#ef4444"} />
              </div>
            </div>
          );
        })}
      </Card>

      {/* KI-Hinweis */}
      <div style={{ background: `linear-gradient(135deg, ${COLOR_PRIMARY}, #2563eb)`, borderRadius: 12, padding: "12px 14px", color: "#fff" }}>
        <div style={{ fontSize: 11, opacity: 0.75, marginBottom: 4 }}>🤖 KI-Analyse</div>
        <div style={{ fontSize: 12 }}>Jonas Weber erfüllt erst 2 von 5 Dan-Kriterien. Empfehlung: Poomsae-Anteil in den nächsten 4 Wochen auf 40 % erhöhen.</div>
      </div>
    </div>
  );
}

// ── Haupt-Auswertung ──────────────────────────────────────────────────────────
const TABS = [
  { id: "schwerpunkte", label: "Schwerpunkte" },
  { id: "anwesenheit",  label: "Anwesenheit"  },
  { id: "ziele",        label: "Ziele"        },
];

// Export-Komponente wird in echter App mit nativer PDF/CSV-Lib ersetzt
function ExportBar() {
  const [exported, setExported] = useState(null);
  const trigger = (typ) => { setExported(typ); setTimeout(() => setExported(null), 2000); };
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
      {["PDF", "CSV"].map(t => (
        <button key={t} onClick={() => trigger(t)}
          style={{ flex: 1, background: exported === t ? "#22c55e" : COLOR_CARD, color: exported === t ? "#fff" : COLOR_PRIMARY, border: `1px solid ${exported === t ? "#22c55e" : COLOR_BORDER}`, borderRadius: 8, padding: "8px", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}>
          {exported === t ? `✓ ${t} exportiert` : `⬇ ${t}`}
        </button>
      ))}
    </div>
  );
}

// ── App-Shell (identisch zur Haupt-App) ──────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard",   label: "Dashboard",  icon: "🏠" },
  { id: "planung",     label: "Planung",    icon: "📅" },
  { id: "athleten",    label: "Athleten",   icon: "🥋" },
  { id: "anwesenheit", label: "Anwesenheit",icon: "✅" },
  { id: "auswertung",  label: "Auswertung", icon: "📊" },
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
  const [active, setActive] = useState("auswertung");
  const [tab, setTab] = useState("schwerpunkte");
  const [menuOpen, setMenuOpen] = useState(false);
  const current = NAV_ITEMS.find(n => n.id === active) || { label: "Auswertung", icon: "📊" };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: COLOR_BG, minHeight: "100vh", maxWidth: 420, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ background: COLOR_PRIMARY, color: "#fff", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontSize: 11, opacity: 0.65 }}>Taekwondo</div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>{current.icon} {current.label}</div>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer" }}>☰</button>
      </div>

      {/* Drawer */}
      {menuOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, display: "flex" }}>
          <div style={{ background: COLOR_PRIMARY, width: 240, padding: "24px 0", display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 16, padding: "0 20px 16px" }}>🥋 TKD Trainer</div>
            {[...NAV_ITEMS, { id: "pruefungen", label: "Prüfungen", icon: "🏆" }, { id: "bibliothek", label: "Bibliothek", icon: "📚" }, { id: "einstellungen", label: "Einstellungen", icon: "⚙️" }].map(n => (
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
        {active === "auswertung" ? (
          <>
            <TabBar tabs={TABS} active={tab} onChange={setTab} />
            <ExportBar />
            {tab === "schwerpunkte" && <AuswertungSchwerpunkte />}
            {tab === "anwesenheit"  && <AuswertungAnwesenheit />}
            {tab === "ziele"        && <AuswertungZiele />}
          </>
        ) : (
          <Placeholder title={current.label} />
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 420, background: COLOR_CARD, borderTop: `1px solid ${COLOR_BORDER}`, display: "flex", justifyContent: "space-around", padding: "8px 0", zIndex: 50 }}>
        {NAV_ITEMS.map(n => (
          <button key={n.id} onClick={() => setActive(n.id)}
            style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer", color: active === n.id ? COLOR_PRIMARY : "#9ca3af" }}>
            <span style={{ fontSize: 20 }}>{n.icon}</span>
            <span style={{ fontSize: 9, fontWeight: active === n.id ? 700 : 400 }}>{n.label}</span>
          </button>
        ))}
      </div>
      <div style={{ height: 70 }} />
    </div>
  );
}
