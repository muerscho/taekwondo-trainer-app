import { useState, useEffect } from "react";

// ── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  primary:   "#1e3a5f",
  bg:        "#f3f4f6",
  card:      "#fff",
  muted:     "#6b7280",
  border:    "#e5e7eb",
  pruefung:  "#3b82f6",
  wettkampf: "#ef4444",
};

// ── Breakpoints ───────────────────────────────────────────────────────────────
const BP = { mobile: 480, tablet: 768, desktop: 1024 };
function useBreakpoint() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  if (w < BP.tablet)  return "mobile";
  if (w < BP.desktop) return "tablet";
  return "desktop";
}

// ── Mock-Daten ────────────────────────────────────────────────────────────────
const SCHWERPUNKTE = [
  { name: "Kyorugi",   color: "#ef4444", soll: 40, ist: 35 },
  { name: "Poomsae",   color: "#3b82f6", soll: 30, ist: 32 },
  { name: "Kondition", color: "#22c55e", soll: 20, ist: 25 },
  { name: "Theorie",   color: "#f59e0b", soll: 10, ist:  8 },
];

const WOCHE_EINHEITEN = [
  { id: 1, tag: "Mo", datum: "24.03.", gruppe: "Erwachsene",       dauer: 90, schwerpunkte: ["Kyorugi"],             status: "durchgeführt", statusColor: "#22c55e" },
  { id: 2, tag: "Mi", datum: "26.03.", gruppe: "Jugend",           dauer: 60, schwerpunkte: ["Poomsae"],             status: "geplant",       statusColor: "#3b82f6" },
  { id: 3, tag: "Fr", datum: "28.03.", gruppe: "Fortgeschrittene", dauer: 90, schwerpunkte: ["Kyorugi","Kondition"], status: "geplant",       statusColor: "#3b82f6" },
];

const TERMINE = [
  { id:"t1", typ:"Pruefung",  label:"Kup-Prüfung (6.–4. Kup)", datum:"2026-04-12", athleten:2, bereitPct:75 },
  { id:"t2", typ:"Wettkampf", label:"Stadtmeisterschaft",        datum:"2026-05-03", athleten:2, bereitPct:66 },
  { id:"t3", typ:"Pruefung",  label:"Dan-Prüfung 1. Dan",        datum:"2026-06-15", athleten:1, bereitPct:20 },
];

const ATHLETEN_ALERTS = [
  { name:"Tom Fischer", grund:"Anwesenheit < 60 %", anw:55, color:"#ef4444" },
  { name:"Sara Bauer",  grund:"Keine Ziele definiert", anw:68, color:"#f59e0b" },
];

const KI_EMPFEHLUNGEN = [
  "Kyorugi-Anteil liegt 5 % unter Soll. Nächste Einheit mit Kampfkombinationen stärken.",
  "Kup-Prüfung in 18 Tagen – Poomsae-Fokus in KW 14 erhöhen.",
  "Jonas Weber erfüllt erst 20 % der Dan-Kriterien. Intensivplan empfohlen.",
  "Konditionsanteil 5 % über Soll – in KW 15 zugunsten Technik reduzieren.",
];

const SCHNELLZUGRIFF = [
  { label:"Neue Einheit", icon:"➕", nav:"planung" },
  { label:"Anwesenheit",  icon:"✅", nav:"anwesenheit" },
  { label:"Neuer Athlet", icon:"🥋", nav:"athleten" },
  { label:"Auswertung",   icon:"📊", nav:"auswertung" },
];

const VERLAUF_WOCHEN = ["KW10","KW11","KW12","KW13"];
const VERLAUF_WERTE  = [
  { name:"Kyorugi",   color:"#ef4444", werte:[38,40,36,35] },
  { name:"Poomsae",   color:"#3b82f6", werte:[30,28,31,32] },
  { name:"Kondition", color:"#22c55e", werte:[22,20,24,25] },
];

const NAV_ITEMS = [
  { id:"dashboard",    label:"Dashboard",    icon:"🏠" },
  { id:"planung",      label:"Planung",      icon:"📅" },
  { id:"athleten",     label:"Athleten",     icon:"🥋" },
  { id:"anwesenheit",  label:"Anwesenheit",  icon:"✅" },
  { id:"pruefungen",   label:"Prüfungen",    icon:"🏆" },
  { id:"bibliothek",   label:"Bibliothek",   icon:"📚" },
  { id:"auswertung",   label:"Auswertung",   icon:"📊" },
  { id:"einstellungen",label:"Einstellungen",icon:"⚙️" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const tageBis  = (d) => Math.max(0, Math.ceil((new Date(d) - new Date()) / 86400000));
const fmtDatum = (iso) => { const [,m,d]=iso.split("-"); return `${d}.${m}.`; };
const anwColor = (q)  => q >= 80 ? "#22c55e" : q >= 60 ? "#f59e0b" : "#ef4444";
const typColor = (t)  => t === "Pruefung" ? C.pruefung : C.wettkampf;

// ── UI-Bausteine ──────────────────────────────────────────────────────────────
function Card({ children, style }) {
  return <div style={{ background:C.card, borderRadius:12, padding:16, boxShadow:"0 1px 4px rgba(0,0,0,0.07)", ...style }}>{children}</div>;
}
function Badge({ label, color }) {
  return <span style={{ background:color+"22", color, borderRadius:6, padding:"2px 7px", fontSize:11, fontWeight:600 }}>{label}</span>;
}
function SectionTitle({ children, action, onAction }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
      <div style={{ fontWeight:800, fontSize:14, color:C.primary }}>{children}</div>
      {action && <button onClick={onAction} style={{ background:"none", border:"none", color:C.pruefung, fontSize:12, fontWeight:600, cursor:"pointer", padding:0 }}>{action}</button>}
    </div>
  );
}
function ProgressBar({ soll, ist, color, h=8 }) {
  return (
    <div style={{ position:"relative", background:C.border, borderRadius:6, height:h }}>
      <div style={{ width:`${Math.min(ist,100)}%`, background:color, borderRadius:6, height:h, transition:"width .4s" }} />
      {soll && <div style={{ position:"absolute", top:-2, bottom:-2, left:`${soll}%`, width:2, background:"#374151", borderRadius:2 }} />}
    </div>
  );
}

// ── Widget: KI-Empfehlung ─────────────────────────────────────────────────────
function KiEmpfehlung({ compact }) {
  const [idx, setIdx] = useState(0);
  return (
    <div style={{ background:"linear-gradient(135deg,#1e3a5f,#2563eb)", borderRadius:12, padding:compact?"12px 14px":"14px 16px", color:"#fff" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ fontSize:11, opacity:.75, marginBottom:4 }}>🤖 KI-Empfehlung</div>
        <div style={{ display:"flex", gap:4 }}>
          {KI_EMPFEHLUNGEN.map((_,i) => (
            <div key={i} onClick={()=>setIdx(i)} style={{ width:6, height:6, borderRadius:"50%", background: idx===i?"#fff":"rgba(255,255,255,.35)", cursor:"pointer" }} />
          ))}
        </div>
      </div>
      <div style={{ fontSize:13, fontWeight:500, lineHeight:1.5 }}>{KI_EMPFEHLUNGEN[idx]}</div>
      <div style={{ display:"flex", gap:8, marginTop:10 }}>
        <button onClick={()=>setIdx((idx+1)%KI_EMPFEHLUNGEN.length)}
          style={{ background:"rgba(255,255,255,.2)", border:"none", color:"#fff", borderRadius:8, padding:"5px 12px", fontSize:12, cursor:"pointer", fontWeight:600 }}>
          Nächste ›
        </button>
        <button style={{ background:"rgba(255,255,255,.15)", border:"none", color:"#fff", borderRadius:8, padding:"5px 12px", fontSize:12, cursor:"pointer" }}>
          Umsetzen
        </button>
      </div>
    </div>
  );
}

// ── Widget: Schnellzugriff ────────────────────────────────────────────────────
function Schnellzugriff({ onNavigate, cols=4 }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols}, 1fr)`, gap:8 }}>
      {SCHNELLZUGRIFF.map(s => (
        <button key={s.label} onClick={()=>onNavigate(s.nav)}
          style={{ background:C.card, border:"none", borderRadius:12, padding:"12px 6px", display:"flex", flexDirection:"column", alignItems:"center", gap:5, boxShadow:"0 1px 4px rgba(0,0,0,0.07)", cursor:"pointer" }}>
          <span style={{ fontSize:22 }}>{s.icon}</span>
          <span style={{ fontSize:10, fontWeight:600, color:C.primary, textAlign:"center", lineHeight:1.2 }}>{s.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Widget: Diese Woche ───────────────────────────────────────────────────────
function DieseWoche({ onNavigate, compact }) {
  const SPFARBEN = { Kyorugi:"#ef4444", Poomsae:"#3b82f6", Kondition:"#22c55e", Theorie:"#f59e0b" };
  const done = WOCHE_EINHEITEN.filter(e=>e.status==="durchgeführt").length;
  return (
    <Card>
      <SectionTitle action="Zur Planung →" onAction={()=>onNavigate("planung")}>Diese Woche</SectionTitle>
      <div style={{ display:"flex", gap:4, marginBottom:8 }}>
        {WOCHE_EINHEITEN.map((e,i)=>(
          <div key={i} style={{ flex:1, height:4, borderRadius:4, background: e.status==="durchgeführt"?"#22c55e": e.status==="ausgefallen"?"#ef4444":C.border }} />
        ))}
      </div>
      <div style={{ fontSize:11, color:C.muted, marginBottom:12 }}>{done} / {WOCHE_EINHEITEN.length} Einheiten durchgeführt</div>
      {WOCHE_EINHEITEN.map(e=>(
        <div key={e.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, background:"#f9fafb", borderLeft:`4px solid ${e.statusColor}`, marginBottom:8 }}>
          <div style={{ background:C.primary, color:"#fff", borderRadius:8, width:compact?38:42, textAlign:"center", padding:"4px 0", flexShrink:0 }}>
            <div style={{ fontSize:9 }}>{e.tag}</div>
            <div style={{ fontSize:compact?10:12, fontWeight:700 }}>{e.datum}</div>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:600, fontSize:13 }}>{e.gruppe} · {e.dauer} min</div>
            <div style={{ display:"flex", gap:4, marginTop:3, flexWrap:"wrap" }}>
              {e.schwerpunkte.map(sp=><Badge key={sp} label={sp} color={SPFARBEN[sp]||C.muted} />)}
              <Badge label={e.status} color={e.statusColor} />
            </div>
          </div>
        </div>
      ))}
    </Card>
  );
}

// ── Widget: Schwerpunkte ──────────────────────────────────────────────────────
function SchwerpunktWidget({ onNavigate, expanded }) {
  const r=40, cx=50, cy=50;
  let start=-90;
  const slices = SCHWERPUNKTE.map(s=>{
    const angle=(s.ist/100)*360;
    const r1=(start*Math.PI)/180, r2=((start+angle)*Math.PI)/180;
    const x1=cx+r*Math.cos(r1), y1=cy+r*Math.sin(r1);
    const x2=cx+r*Math.cos(r2), y2=cy+r*Math.sin(r2);
    const path=`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${angle>180?1:0},1 ${x2},${y2} Z`;
    start+=angle;
    return {...s, path};
  });

  return (
    <Card>
      <SectionTitle action="Details →" onAction={()=>onNavigate("auswertung")}>Schwerpunkte</SectionTitle>
      <div style={{ display:"flex", alignItems:"center", gap:16 }}>
        <svg width={expanded?120:100} height={expanded?120:100} style={{ flexShrink:0 }}>
          {slices.map((s,i)=><path key={i} d={s.path} fill={s.color} />)}
          <circle cx={cx} cy={cy} r={22} fill={C.card} />
          <text x={cx} y={cy+4} textAnchor="middle" fontSize="9" fill={C.muted} fontWeight="bold">IST</text>
        </svg>
        <div style={{ flex:1 }}>
          {SCHWERPUNKTE.map(s=>{
            const diff=s.ist-s.soll;
            return (
              <div key={s.name} style={{ marginBottom:8 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, fontWeight:600, marginBottom:3 }}>
                  <span>{s.name}</span>
                  <span style={{ color:Math.abs(diff)>5?"#ef4444":"#22c55e" }}>{diff>0?"▲":"▼"}{Math.abs(diff)}%</span>
                </div>
                <ProgressBar soll={s.soll} ist={s.ist} color={s.color} h={expanded?10:7} />
              </div>
            );
          })}
          <div style={{ fontSize:9, color:C.muted }}>▏ = Sollwert</div>
        </div>
      </div>
      {/* Auf größeren Screens: Tabelle zusätzlich */}
      {expanded && (
        <div style={{ marginTop:14, display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
          {SCHWERPUNKTE.map(s=>(
            <div key={s.name} style={{ background:s.color+"11", borderRadius:8, padding:"8px 10px", textAlign:"center" }}>
              <div style={{ fontSize:18, fontWeight:800, color:s.color }}>{s.ist}%</div>
              <div style={{ fontSize:10, color:C.muted }}>{s.name}</div>
              <div style={{ fontSize:10, color:C.muted }}>Soll {s.soll}%</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── Widget: Termine ───────────────────────────────────────────────────────────
function TermineWidget({ onNavigate, showAll }) {
  const liste = showAll ? TERMINE : TERMINE.slice(0,2);
  return (
    <Card>
      <SectionTitle action="Alle →" onAction={()=>onNavigate("pruefungen")}>Nächste Termine</SectionTitle>
      {liste.map(t=>{
        const color=typColor(t.typ);
        const tage=tageBis(t.datum);
        return (
          <div key={t.id} onClick={()=>onNavigate("pruefungen")}
            style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, background:"#f9fafb", borderLeft:`4px solid ${color}`, marginBottom:8, cursor:"pointer" }}>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", gap:5, marginBottom:3 }}>
                <Badge label={t.typ==="Pruefung"?"Prüfung":"Wettkampf"} color={color} />
                {tage<21 && <Badge label="Bald!" color="#ef4444" />}
              </div>
              <div style={{ fontWeight:700, fontSize:13 }}>{t.label}</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{t.athleten} Athleten</div>
              <div style={{ marginTop:5 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, marginBottom:2 }}>
                  <span style={{ color:C.muted }}>Bereitschaft</span>
                  <span style={{ fontWeight:700, color:t.bereitPct>=80?"#22c55e":"#f59e0b" }}>{t.bereitPct}%</span>
                </div>
                <ProgressBar ist={t.bereitPct} color={t.bereitPct>=80?"#22c55e":"#f59e0b"} h={5} />
              </div>
            </div>
            <div style={{ textAlign:"center", flexShrink:0 }}>
              <div style={{ fontSize:20, fontWeight:800, color:tage<21?"#ef4444":color }}>{tage}</div>
              <div style={{ fontSize:9, color:C.muted }}>Tage</div>
            </div>
          </div>
        );
      })}
    </Card>
  );
}

// ── Widget: Trend ─────────────────────────────────────────────────────────────
function TrendWidget({ expanded }) {
  const H=80, W=expanded?400:300, pad=8;
  return (
    <Card>
      <SectionTitle>Trend (letzte 4 Wochen)</SectionTitle>
      <svg width="100%" height={H+20} viewBox={`0 0 ${W} ${H+20}`} preserveAspectRatio="none">
        {[25,50].map(v=><line key={v} x1={pad} y1={H-(v/50)*H} x2={W-pad} y2={H-(v/50)*H} stroke={C.border} strokeWidth="1" />)}
        {VERLAUF_WOCHEN.map((kw,i)=>(
          <text key={kw} x={pad+(i/(VERLAUF_WOCHEN.length-1))*(W-2*pad)} y={H+14} textAnchor="middle" fontSize="9" fill={C.muted}>{kw}</text>
        ))}
        {VERLAUF_WERTE.map(s=>{
          const pts=s.werte.map((v,i)=>`${pad+(i/(s.werte.length-1))*(W-2*pad)},${H-(v/50)*H}`).join(" ");
          return (
            <g key={s.name}>
              <polyline points={pts} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" />
              {s.werte.map((v,i)=>(
                <circle key={i} cx={pad+(i/(s.werte.length-1))*(W-2*pad)} cy={H-(v/50)*H} r="3.5" fill={s.color} />
              ))}
            </g>
          );
        })}
      </svg>
      <div style={{ display:"flex", gap:12, marginTop:4, flexWrap:"wrap" }}>
        {VERLAUF_WERTE.map(s=>(
          <div key={s.name} style={{ display:"flex", alignItems:"center", gap:4 }}>
            <div style={{ width:10, height:10, borderRadius:3, background:s.color }} />
            <span style={{ fontSize:11, color:C.muted }}>{s.name}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Widget: Alerts ────────────────────────────────────────────────────────────
function AlertsWidget({ onNavigate }) {
  if (!ATHLETEN_ALERTS.length) return null;
  return (
    <Card>
      <SectionTitle action="Athleten →" onAction={()=>onNavigate("athleten")}>⚠️ Hinweise</SectionTitle>
      {ATHLETEN_ALERTS.map((a,i)=>(
        <div key={i} style={{ background:a.color+"11", border:`1px solid ${a.color}44`, borderRadius:10, padding:"10px 12px", display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:a.color, flexShrink:0 }} />
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:13 }}>{a.name}</div>
            <div style={{ fontSize:11, color:C.muted }}>{a.grund}</div>
          </div>
          <Badge label={`${a.anw}%`} color={a.color} />
        </div>
      ))}
    </Card>
  );
}

// ── Widget: KPI-Leiste (nur Tablet/Desktop) ───────────────────────────────────
function KpiLeiste() {
  const done = WOCHE_EINHEITEN.filter(e=>e.status==="durchgeführt").length;
  const naechster = [...TERMINE].sort((a,b)=>new Date(a.datum)-new Date(b.datum))[0];
  const spAbw = SCHWERPUNKTE.filter(s=>Math.abs(s.ist-s.soll)>5).length;
  const kpis = [
    { v:done+"/"+WOCHE_EINHEITEN.length, l:"Einheiten diese Woche", icon:"📅", color:C.primary },
    { v:tageBis(naechster.datum)+"d",    l:"Nächster Termin",        icon:"🏆", color:typColor(naechster.typ) },
    { v:ATHLETEN_ALERTS.length,          l:"Athleten-Hinweise",      icon:"⚠️", color:"#f59e0b" },
    { v:spAbw,                           l:"Schwerpunkte off-track",  icon:"🎯", color:spAbw>0?"#ef4444":"#22c55e" },
  ];
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
      {kpis.map(k=>(
        <Card key={k.l} style={{ padding:"14px 16px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ fontSize:24 }}>{k.icon}</div>
            <div>
              <div style={{ fontSize:22, fontWeight:800, color:k.color }}>{k.v}</div>
              <div style={{ fontSize:11, color:C.muted }}>{k.l}</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export function Dashboard({ onNavigate = ()=>{} }) {
  const bp = useBreakpoint();
  const heute = new Date().toLocaleDateString("de-DE", { weekday:"long", day:"2-digit", month:"long", year:"numeric" });

  // ── Mobile Layout ─────────────────────────────────────────────────────────
  if (bp === "mobile") {
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        <div style={{ fontSize:12, color:C.muted }}>{heute}</div>
        <KiEmpfehlung />
        <Schnellzugriff onNavigate={onNavigate} cols={4} />
        <DieseWoche onNavigate={onNavigate} compact />
        <SchwerpunktWidget onNavigate={onNavigate} />
        <TermineWidget onNavigate={onNavigate} />
        <TrendWidget />
        <AlertsWidget onNavigate={onNavigate} />
      </div>
    );
  }

  // ── Tablet Layout (2 Spalten) ──────────────────────────────────────────────
  if (bp === "tablet") {
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:13, color:C.muted }}>{heute}</div>
        </div>
        <KiEmpfehlung />
        <Schnellzugriff onNavigate={onNavigate} cols={4} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          {/* Linke Spalte */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <DieseWoche onNavigate={onNavigate} />
            <AlertsWidget onNavigate={onNavigate} />
          </div>
          {/* Rechte Spalte */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <SchwerpunktWidget onNavigate={onNavigate} expanded />
            <TermineWidget onNavigate={onNavigate} showAll />
          </div>
        </div>
        <TrendWidget expanded />
      </div>
    );
  }

  // ── Desktop Layout (3 Bereiche) ────────────────────────────────────────────
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {/* Kopfzeile */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontWeight:800, fontSize:20, color:C.primary }}>Dashboard</div>
          <div style={{ fontSize:13, color:C.muted, marginTop:2 }}>{heute}</div>
        </div>
        <KiEmpfehlung />
      </div>

      {/* KPI-Leiste */}
      <KpiLeiste />

      {/* Drei-Spalten Grid */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:20 }}>
        {/* Spalte 1 */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <DieseWoche onNavigate={onNavigate} />
          <AlertsWidget onNavigate={onNavigate} />
        </div>
        {/* Spalte 2 */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <SchwerpunktWidget onNavigate={onNavigate} expanded />
          <TrendWidget expanded />
        </div>
        {/* Spalte 3 */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <TermineWidget onNavigate={onNavigate} showAll />
          <Card>
            <SectionTitle>Schnellzugriff</SectionTitle>
            <Schnellzugriff onNavigate={onNavigate} cols={2} />
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Navigation ────────────────────────────────────────────────────────────────
function Placeholder({ title }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:300, color:"#9ca3af" }}>
      <div style={{ fontSize:40, marginBottom:12 }}>🚧</div>
      <div style={{ fontSize:16, fontWeight:600 }}>{title}</div>
      <div style={{ fontSize:13, marginTop:4 }}>In Haupt-App integriert</div>
    </div>
  );
}

export default function App() {
  const [active, setActive]     = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bp = useBreakpoint();
  const current = NAV_ITEMS.find(n=>n.id===active) || NAV_ITEMS[0];

  const isMobile  = bp === "mobile";
  const isTablet  = bp === "tablet";
  const isDesktop = bp === "desktop";

  return (
    <div style={{ fontFamily:"system-ui, sans-serif", background:C.bg, minHeight:"100vh", display:"flex", flexDirection:"column" }}>

      {/* ── Header ── */}
      <div style={{ background:C.primary, color:"#fff", padding:"0 20px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          {/* Sidebar-Toggle auf Tablet/Desktop */}
          {!isMobile && (
            <button onClick={()=>setSidebarOpen(p=>!p)}
              style={{ background:"none", border:"none", color:"#fff", fontSize:18, cursor:"pointer", padding:"4px 6px", borderRadius:6, opacity:.8 }}>
              ☰
            </button>
          )}
          <div>
            <div style={{ fontSize:11, opacity:.65, lineHeight:1 }}>Taekwondo</div>
            <div style={{ fontSize:16, fontWeight:700, lineHeight:1.2 }}>{current.icon} {current.label}</div>
          </div>
        </div>
        {/* Rechte Seite Header */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {isDesktop && (
            <div style={{ fontSize:12, color:"rgba(255,255,255,.7)", background:"rgba(255,255,255,.1)", borderRadius:8, padding:"4px 12px" }}>
              🔍 Suchen…
            </div>
          )}
          {isMobile && (
            <button onClick={()=>setSidebarOpen(p=>!p)}
              style={{ background:"none", border:"none", color:"#fff", fontSize:22, cursor:"pointer" }}>☰</button>
          )}
        </div>
      </div>

      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

        {/* ── Sidebar (Tablet/Desktop) ── */}
        {!isMobile && sidebarOpen && (
          <div style={{ width: isDesktop ? 220 : 64, background:C.primary, display:"flex", flexDirection:"column", paddingTop:12, flexShrink:0, transition:"width .2s" }}>
            {NAV_ITEMS.map(n=>(
              <button key={n.id} onClick={()=>setActive(n.id)}
                style={{ background: active===n.id?"rgba(255,255,255,.15)":"none", border:"none", color:"#fff", padding: isDesktop?"10px 20px":"10px 0", display:"flex", alignItems:"center", gap:12, cursor:"pointer", textAlign:"left", justifyContent: isDesktop?"flex-start":"center" }}>
                <span style={{ fontSize:18, flexShrink:0 }}>{n.icon}</span>
                {isDesktop && <span style={{ fontSize:13, fontWeight: active===n.id?700:400 }}>{n.label}</span>}
              </button>
            ))}
          </div>
        )}

        {/* ── Drawer Mobile ── */}
        {isMobile && sidebarOpen && (
          <div style={{ position:"fixed", inset:0, zIndex:100, display:"flex" }}>
            <div style={{ background:C.primary, width:240, padding:"24px 0", display:"flex", flexDirection:"column", gap:2 }}>
              <div style={{ color:"#fff", fontWeight:700, fontSize:16, padding:"0 20px 16px" }}>🥋 TKD Trainer</div>
              {NAV_ITEMS.map(n=>(
                <button key={n.id} onClick={()=>{ setActive(n.id); setSidebarOpen(false); }}
                  style={{ background: active===n.id?"rgba(255,255,255,.15)":"none", border:"none", color:"#fff", textAlign:"left", padding:"12px 20px", fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", gap:10 }}>
                  <span>{n.icon}</span><span>{n.label}</span>
                </button>
              ))}
            </div>
            <div style={{ flex:1, background:"rgba(0,0,0,.4)" }} onClick={()=>setSidebarOpen(false)} />
          </div>
        )}

        {/* ── Hauptinhalt ── */}
        <div style={{ flex:1, overflowY:"auto", padding: isDesktop?"28px 32px": isTablet?"20px 24px":"16px" }}>
          {active==="dashboard"
            ? <Dashboard onNavigate={(id)=>setActive(id)} />
            : <Placeholder title={current.label} />
          }
        </div>
      </div>

      {/* ── Bottom Nav (nur Mobile) ── */}
      {isMobile && (
        <div style={{ background:C.card, borderTop:`1px solid ${C.border}`, display:"flex", justifyContent:"space-around", padding:"8px 0", flexShrink:0 }}>
          {NAV_ITEMS.slice(0,5).map(n=>(
            <button key={n.id} onClick={()=>setActive(n.id)}
              style={{ background:"none", border:"none", display:"flex", flexDirection:"column", alignItems:"center", gap:2, cursor:"pointer", color: active===n.id?C.primary:"#9ca3af" }}>
              <span style={{ fontSize:20 }}>{n.icon}</span>
              <span style={{ fontSize:9, fontWeight: active===n.id?700:400 }}>{n.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
