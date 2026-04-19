import { useState } from "react";

const C = {
  primary: "#1e3a5f", bg: "#f3f4f6", card: "#fff",
  muted: "#6b7280", border: "#e5e7eb",
};

const SCHWERPUNKT_FARBEN = {
  Kyorugi: "#ef4444", Poomsae: "#3b82f6", Kondition: "#22c55e",
  Technik: "#8b5cf6", Theorie: "#f59e0b", Sparring: "#ef4444",
  Aufwärmen: "#ec4899", Dehnen: "#14b8a6", Spiel: "#f59e0b",
};
const KATEGORIEN = ["Technik","Kondition","Spiel","Poomsae","Sparring","Aufwärmen","Dehnen"];
const GRUPPEN    = ["Erwachsene","Jugend","Fortgeschrittene"];
const TAGE       = ["Mo","Di","Mi","Do","Fr","Sa"];
const DAUERN     = [45, 60, 90, 120];

const INIT_BIBLIOTHEK = [
  { id: "b1", typ: "Übung",   titel: "Dollyo-Chagi Kombination", kategorie: "Technik",   niveau: "Mittelstufe",    dauer: 20, emoji: "🦵",
    beschreibung: "Dreifache Rundkick-Kombination mit Gewichtsverlagerung.",
    schritte: ["Kampfposition","1. Dollyo-Chagi vorwärts","Standbein wechseln","2. Dollyo-Chagi Gegenseite","Springender Abschluss"],
    material: ["Zielpad","Matte"], tags: ["Kick","Kombination","Wettkampf"] },
  { id: "b2", typ: "Spiel",   titel: "Reaktions-Tag",            kategorie: "Spiel",     niveau: "Anfänger",       dauer: 15, emoji: "🏃",
    beschreibung: "Spielerisches Aufwärmspiel zur Reaktionsschulung.",
    schritte: ["Alle verteilen","Einer ist 'es'","Schultern berühren","Erstarren 5 Sek.","Wechsel nach 3 Min."],
    material: ["Markierungsband","Hütchen"], tags: ["Reaktion","Spiel","Jugend"] },
  { id: "b3", typ: "Workout", titel: "Kampfsport HIIT",          kategorie: "Kondition", niveau: "Fortgeschritten", dauer: 45, emoji: "💪",
    beschreibung: "Hochintensives Intervalltraining mit kampfsportspezifischen Übungen.",
    schritte: ["5 min Aufwärmen","Block 1: Ap-Chagi 4×","Block 2: Kombos 4×","Block 3: Burpees 4×","Cool-down"],
    material: ["Springseil","Matte","Stoppuhr"], tags: ["HIIT","Kondition"] },
  { id: "b4", typ: "Übung",   titel: "Taegeuk 1",                kategorie: "Poomsae",   niveau: "Anfänger",       dauer: 30, emoji: "🥋",
    beschreibung: "Systematisches Erlernen von Taegeuk Il-Jang.",
    schritte: ["Bereitschaftsstellung","Abschnitt 1–2","Abschnitt 3–6","Verbindung","3× komplett"],
    material: ["Markierungsband"], tags: ["Poomsae","Grundlage"] },
  { id: "b5", typ: "Übung",   titel: "Ap-Chagi Abwehr Partner", kategorie: "Sparring",  niveau: "Mittelstufe",    dauer: 25, emoji: "🤼",
    beschreibung: "Verteidigungstechnik gegen frontalen Tritt.",
    schritte: ["Partnerabstand","A greift an","B weicht aus","10× Rollenwechsel","Tempo steigern"],
    material: ["Schienbeinschützer","Mundschutz"], tags: ["Sparring","Abwehr"] },
  { id: "b6", typ: "Übung",   titel: "Dynamisches Aufwärmen",   kategorie: "Aufwärmen", niveau: "Anfänger",       dauer: 10, emoji: "🔥",
    beschreibung: "Strukturiertes Aufwärmprogramm für den gesamten Körper.",
    schritte: ["3 min Laufen","Hüftkreisen","Beinpendeln","Knieheben","Sprints"],
    material: [], tags: ["Aufwärmen"] },
];

const INIT_WOCHEN = [
  { kw: "KW 13", von: "24.03.", bis: "30.03.", einheiten: [
    { id: "e1", tag: "Mo", datum: "24.03.", gruppe: "Erwachsene", dauer: 90, status: "geplant", blocks: [
      { id: "bl1", typ: "bibliothek", refId: "b6", titel: "Dynamisches Aufwärmen",   emoji: "🔥", dauer: 10, kategorie: "Aufwärmen" },
      { id: "bl2", typ: "bibliothek", refId: "b1", titel: "Dollyo-Chagi Kombination",emoji: "🦵", dauer: 20, kategorie: "Technik" },
      { id: "bl3", typ: "custom",     refId: null,  titel: "Freies Sparring",          emoji: "⚡", dauer: 25, kategorie: "Sparring", notiz: "Kontrollierter Kontakt" },
    ]},
    { id: "e2", tag: "Mi", datum: "26.03.", gruppe: "Jugend", dauer: 60, status: "geplant", blocks: [
      { id: "bl4", typ: "bibliothek", refId: "b6", titel: "Dynamisches Aufwärmen", emoji: "🔥", dauer: 10, kategorie: "Aufwärmen" },
      { id: "bl5", typ: "bibliothek", refId: "b4", titel: "Taegeuk 1",              emoji: "🥋", dauer: 30, kategorie: "Poomsae" },
    ]},
  ]},
  { kw: "KW 14", von: "31.03.", bis: "06.04.", einheiten: [
    { id: "e3", tag: "Mo", datum: "31.03.", gruppe: "Fortgeschrittene", dauer: 90, status: "geplant", blocks: [] },
  ]},
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const spColor  = (k) => SCHWERPUNKT_FARBEN[k] || C.muted;
const typColor = (t) => ({ Übung: "#3b82f6", Workout: "#ef4444", Spiel: "#f59e0b" }[t] || C.muted);
const genId    = ()  => "id_" + Date.now() + "_" + Math.random().toString(36).slice(2,6);
const fmtMin   = (m) => m >= 60 ? `${Math.floor(m/60)}h ${m%60>0?m%60+"min":""}`.trim() : `${m} min`;

// ── UI ────────────────────────────────────────────────────────────────────────
function Card({ children, style, onClick }) {
  return <div onClick={onClick} style={{ background: C.card, borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", cursor: onClick?"pointer":"default", ...style }}>{children}</div>;
}
function Badge({ label, color }) {
  return <span style={{ background: color+"22", color, borderRadius: 6, padding: "2px 7px", fontSize: 11, fontWeight: 600 }}>{label}</span>;
}
function BackBtn({ onBack, label="← Zurück" }) {
  return <button onClick={onBack} style={{ background:"none", border:"none", color:C.primary, fontWeight:700, fontSize:14, cursor:"pointer", padding:0, marginBottom:12 }}>{label}</button>;
}
function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display:"flex", background:C.card, borderRadius:10, padding:4, gap:2, boxShadow:"0 1px 4px rgba(0,0,0,0.07)", marginBottom:14 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          style={{ flex:1, border:"none", borderRadius:8, padding:"7px 0", fontSize:11, fontWeight:600, cursor:"pointer", background: active===t.id ? C.primary:"none", color: active===t.id ? "#fff":C.muted }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}
function Toast({ msg }) {
  if (!msg) return null;
  return <div style={{ background:"#16a34a", color:"#fff", borderRadius:10, padding:"10px 14px", fontSize:13, fontWeight:600 }}>✓ {msg}</div>;
}

// ── Bibliotheks-Picker (Bottom Sheet) ─────────────────────────────────────────
function BibliothekPicker({ bibliothek, onSelect, onClose, multiSelect=false }) {
  const [suche, setSuche]     = useState("");
  const [kat, setKat]         = useState("Alle");
  const [selected, setSelected] = useState([]);

  const gefiltert = bibliothek
    .filter(e => kat==="Alle" || e.kategorie===kat)
    .filter(e => e.titel.toLowerCase().includes(suche.toLowerCase()));

  const toggle = (b) => setSelected(p => p.find(x=>x.id===b.id) ? p.filter(x=>x.id!==b.id) : [...p,b]);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"flex-end" }}>
      <div style={{ background:C.bg, width:"100%", maxWidth:420, margin:"0 auto", borderRadius:"16px 16px 0 0", maxHeight:"82vh", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"14px 16px 0", background:C.card, borderRadius:"16px 16px 0 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <div style={{ fontWeight:700, fontSize:15, color:C.primary }}>📚 Aus Bibliothek wählen</div>
            <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:C.muted }}>×</button>
          </div>
          {multiSelect && <div style={{ fontSize:11, color:"#8b5cf6", marginBottom:8 }}>Mehrfachauswahl möglich · {selected.length} gewählt</div>}
          <input value={suche} onChange={e=>setSuche(e.target.value)} placeholder="Suchen…"
            style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 10px", fontSize:13, boxSizing:"border-box", marginBottom:8 }} />
          <div style={{ display:"flex", gap:5, overflowX:"auto", paddingBottom:8 }}>
            {["Alle",...KATEGORIEN].map(k => (
              <button key={k} onClick={() => setKat(k)}
                style={{ border:"none", borderRadius:8, padding:"4px 10px", fontSize:11, fontWeight:600, cursor:"pointer", flexShrink:0, background: kat===k ? (spColor(k)||C.primary):"#f3f4f6", color: kat===k?"#fff":"#374151" }}>
                {k}
              </button>
            ))}
          </div>
        </div>
        <div style={{ overflowY:"auto", padding:"10px 16px", flex:1 }}>
          {gefiltert.map(b => {
            const isSelected = !!selected.find(x=>x.id===b.id);
            return (
              <div key={b.id} onClick={() => multiSelect ? toggle(b) : onSelect([b])}
                style={{ background: isSelected ? "#eff6ff" : C.card, borderRadius:10, padding:"11px 13px", marginBottom:8, display:"flex", alignItems:"center", gap:10, cursor:"pointer", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:`2px solid ${isSelected?"#3b82f6":C.border}`, borderLeft:`4px solid ${spColor(b.kategorie)}` }}>
                {multiSelect && (
                  <div style={{ width:20, height:20, borderRadius:6, border:`2px solid ${isSelected?"#3b82f6":"#d1d5db"}`, background: isSelected?"#3b82f6":C.card, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"#fff", fontWeight:700, flexShrink:0 }}>
                    {isSelected ? "✓" : ""}
                  </div>
                )}
                <span style={{ fontSize:22, flexShrink:0 }}>{b.emoji}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:13 }}>{b.titel}</div>
                  <div style={{ fontSize:11, color:C.muted }}>{b.kategorie} · {b.niveau} · {b.dauer} min</div>
                  <div style={{ display:"flex", gap:4, marginTop:3, flexWrap:"wrap" }}>
                    {b.tags.slice(0,3).map(t => <span key={t} style={{ fontSize:10, color:C.muted }}>#{t}</span>)}
                  </div>
                </div>
                {!multiSelect && <div style={{ fontSize:20, color:C.primary, fontWeight:700 }}>+</div>}
              </div>
            );
          })}
        </div>
        {multiSelect && selected.length > 0 && (
          <div style={{ padding:"12px 16px", background:C.card, borderTop:`1px solid ${C.border}` }}>
            <button onClick={() => onSelect(selected)}
              style={{ width:"100%", background:C.primary, color:"#fff", border:"none", borderRadius:10, padding:12, fontWeight:700, fontSize:14, cursor:"pointer" }}>
              {selected.length} Eintrag{selected.length>1?"e":""} übernehmen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Block Formular ────────────────────────────────────────────────────────────
function BlockFormular({ block, onSave, onCancel }) {
  const [form, setForm] = useState(block || { titel:"", kategorie:"Technik", dauer:15, emoji:"📋", notiz:"", typ:"custom", refId:null });
  const EMOJIS = ["📋","🦵","💪","🏃","🎯","🤼","🛡","⚡","🔥","🥋","🏋","🎮","👊","⭐","🔄"];
  return (
    <Card style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ fontWeight:700, fontSize:13, color:C.primary }}>{block ? "Block bearbeiten":"Individuellen Block"}</div>
      <input value={form.titel} onChange={e=>setForm(p=>({...p,titel:e.target.value}))} placeholder="Titel"
        style={{ border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 10px", fontSize:13 }} />
      <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
        {KATEGORIEN.map(k => (
          <button key={k} onClick={()=>setForm(p=>({...p,kategorie:k}))}
            style={{ border:"none", borderRadius:8, padding:"4px 9px", fontSize:11, fontWeight:600, cursor:"pointer", background: form.kategorie===k ? spColor(k):"#f3f4f6", color: form.kategorie===k?"#fff":"#374151" }}>
            {k}
          </button>
        ))}
      </div>
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <span style={{ fontSize:12, color:C.muted }}>Dauer (min)</span>
        <input type="number" min="1" max="120" value={form.dauer} onChange={e=>setForm(p=>({...p,dauer:Number(e.target.value)}))}
          style={{ width:64, border:`1px solid ${C.border}`, borderRadius:8, padding:"7px 10px", fontSize:13 }} />
      </div>
      <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
        {EMOJIS.map(em => (
          <button key={em} onClick={()=>setForm(p=>({...p,emoji:em}))}
            style={{ background: form.emoji===em ? C.primary+"22":"#f3f4f6", border:`2px solid ${form.emoji===em?C.primary:"transparent"}`, borderRadius:8, padding:"3px 5px", fontSize:16, cursor:"pointer" }}>
            {em}
          </button>
        ))}
      </div>
      <input value={form.notiz||""} onChange={e=>setForm(p=>({...p,notiz:e.target.value}))} placeholder="Notiz (optional)"
        style={{ border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 10px", fontSize:13 }} />
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={onCancel} style={{ flex:1, background:"#f3f4f6", border:"none", borderRadius:8, padding:10, fontWeight:600, fontSize:13, cursor:"pointer" }}>Abbrechen</button>
        <button onClick={() => form.titel.trim() && onSave(form)}
          style={{ flex:2, background: form.titel.trim()?C.primary:"#9ca3af", color:"#fff", border:"none", borderRadius:8, padding:10, fontWeight:700, fontSize:13, cursor: form.titel.trim()?"pointer":"default" }}>
          Speichern
        </button>
      </div>
    </Card>
  );
}

// ── Block Karte ───────────────────────────────────────────────────────────────
function BlockKarte({ block, idx, total, onDelete, onEdit, onMove }) {
  const color = spColor(block.kategorie);
  return (
    <div style={{ background:C.card, borderRadius:10, padding:"10px 12px", borderLeft:`4px solid ${color}`, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", marginBottom:8 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:20, flexShrink:0 }}>{block.emoji||"📋"}</span>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", gap:5, alignItems:"center", marginBottom:2, flexWrap:"wrap" }}>
            <span style={{ fontWeight:700, fontSize:13 }}>{block.titel}</span>
            {block.typ==="bibliothek" && <Badge label="📚" color="#3b82f6" />}
            {block.typ==="custom"     && <Badge label="✏️" color="#8b5cf6" />}
          </div>
          <div style={{ fontSize:11, color:C.muted }}>{block.kategorie} · {block.dauer} min</div>
          {block.notiz && <div style={{ fontSize:10, color:C.muted, fontStyle:"italic", marginTop:1 }}>„{block.notiz}"</div>}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
          <button onClick={() => onMove(idx,-1)} disabled={idx===0} style={{ background:"none", border:"none", fontSize:12, cursor: idx===0?"default":"pointer", opacity: idx===0?0.3:1, padding:0 }}>▲</button>
          <button onClick={() => onMove(idx,1)} disabled={idx===total-1} style={{ background:"none", border:"none", fontSize:12, cursor: idx===total-1?"default":"pointer", opacity: idx===total-1?0.3:1, padding:0 }}>▼</button>
        </div>
        <button onClick={onEdit} style={{ background:"#f3f4f6", border:"none", borderRadius:8, padding:"5px 8px", fontSize:12, cursor:"pointer" }}>✏️</button>
        <button onClick={onDelete} style={{ background:"#fee2e2", border:"none", borderRadius:8, padding:"5px 8px", fontSize:12, cursor:"pointer" }}>🗑</button>
      </div>
    </div>
  );
}

// ── Einheit Detail ────────────────────────────────────────────────────────────
function EinheitDetail({ einheit:init, onBack, onSave, onSaveZurBibliothek }) {
  const [e, setE]             = useState({ ...init, blocks:[...init.blocks.map(b=>({...b}))] });
  const [picker, setPicker]   = useState(null); // null | "single" | "multi"
  const [blockForm, setBlockForm] = useState(false);
  const [editBlock, setEditBlock] = useState(null);
  const [saveBib, setSaveBib] = useState(false);
  const [bibTitel, setBibTitel] = useState(init.titel||"Einheit "+init.tag);

  const gesamtDauer = e.blocks.reduce((s,b)=>s+b.dauer,0);
  const puffer = e.dauer - gesamtDauer;
  const abgeleiteteSP = [...new Set(e.blocks.map(b=>b.kategorie))];

  const addFromBib = (bibs) => {
    const newBlocks = bibs.map(b => ({ id:genId(), typ:"bibliothek", refId:b.id, titel:b.titel, emoji:b.emoji, dauer:b.dauer, kategorie:b.kategorie }));
    setE(p=>({...p, blocks:[...p.blocks,...newBlocks]}));
    setPicker(null);
  };

  const saveBlock = (form) => {
    if (editBlock) setE(p=>({...p, blocks:p.blocks.map(b=>b.id===editBlock.id?{...b,...form}:b)}));
    else setE(p=>({...p, blocks:[...p.blocks,{...form,id:genId()}]}));
    setEditBlock(null); setBlockForm(false);
  };

  const moveBlock = (idx,dir) => {
    const arr=[...e.blocks]; const tgt=idx+dir;
    if(tgt<0||tgt>=arr.length) return;
    [arr[idx],arr[tgt]]=[arr[tgt],arr[idx]];
    setE(p=>({...p,blocks:arr}));
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
      <BackBtn onBack={onBack} label="← Planung" />

      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${C.primary},#2563eb)`, borderRadius:12, padding:16, color:"#fff", marginBottom:14 }}>
        <div style={{ fontWeight:800, fontSize:16 }}>{e.tag} · {e.datum}</div>
        <div style={{ fontSize:13, opacity:0.85, marginTop:2 }}>{e.gruppe} · {e.dauer} min geplant</div>
        <div style={{ display:"flex", gap:16, marginTop:10 }}>
          {[[e.blocks.length,"Blöcke"],[`${gesamtDauer} min`,"Belegt"],[`${Math.max(0,puffer)} min`, puffer<0?"⚠️ Überzogen":"Puffer"]].map(([v,l])=>(
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontSize:18, fontWeight:800 }}>{v}</div>
              <div style={{ fontSize:9, opacity:0.75 }}>{l}</div>
            </div>
          ))}
        </div>
        {/* Zeitbalken */}
        <div style={{ marginTop:10 }}>
          <div style={{ display:"flex", gap:1, height:10, borderRadius:6, overflow:"hidden", background:"rgba(255,255,255,0.2)" }}>
            {e.blocks.map(b => (
              <div key={b.id} title={b.titel} style={{ flex:b.dauer, background:spColor(b.kategorie), opacity:0.9, minWidth:2 }} />
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, marginTop:2, opacity:0.7 }}>
            <span>0</span><span>{e.dauer} min</span>
          </div>
        </div>
      </div>

      {/* Schwerpunkte */}
      {abgeleiteteSP.length>0 && (
        <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:12 }}>
          {abgeleiteteSP.map(s=><Badge key={s} label={s} color={spColor(s)} />)}
        </div>
      )}

      {/* Block-Formular */}
      {(blockForm||editBlock) ? (
        <BlockFormular block={editBlock} onSave={saveBlock} onCancel={()=>{setBlockForm(false);setEditBlock(null);}} />
      ) : (
        <>
          {e.blocks.length===0 && (
            <div style={{ background:"#f0f9ff", border:`2px dashed #93c5fd`, borderRadius:10, padding:20, textAlign:"center", color:"#3b82f6", fontSize:13, marginBottom:12 }}>
              Noch keine Inhalte. Füge Blöcke hinzu.
            </div>
          )}

          {e.blocks.map((b,i) => (
            <BlockKarte key={b.id} block={b} idx={i} total={e.blocks.length}
              onMove={moveBlock}
              onDelete={()=>setE(p=>({...p,blocks:p.blocks.filter(x=>x.id!==b.id)}))}
              onEdit={()=>{setEditBlock(b);setBlockForm(true);}}
            />
          ))}

          {/* Hinzufügen */}
          <div style={{ display:"flex", gap:6, marginTop:4 }}>
            <button onClick={()=>setPicker("single")}
              style={{ flex:1, background:"#eff6ff", color:"#3b82f6", border:`1px solid #93c5fd`, borderRadius:10, padding:"9px 6px", fontWeight:700, fontSize:11, cursor:"pointer" }}>
              📚 Einzeln
            </button>
            <button onClick={()=>setPicker("multi")}
              style={{ flex:1, background:"#f5f3ff", color:"#8b5cf6", border:`1px solid #c4b5fd`, borderRadius:10, padding:"9px 6px", fontWeight:700, fontSize:11, cursor:"pointer" }}>
              📚 Mehrere
            </button>
            <button onClick={()=>{setEditBlock(null);setBlockForm(true);}}
              style={{ flex:1, background:"#fefce8", color:"#ca8a04", border:`1px solid #fde68a`, borderRadius:10, padding:"9px 6px", fontWeight:700, fontSize:11, cursor:"pointer" }}>
              ✏️ Individuell
            </button>
          </div>

          {/* In Bibliothek */}
          {e.blocks.length>0 && (
            <div style={{ marginTop:8 }}>
              {!saveBib
                ? <button onClick={()=>setSaveBib(true)}
                    style={{ width:"100%", background:"#f0fdf4", color:"#16a34a", border:`1px solid #86efac`, borderRadius:10, padding:10, fontWeight:700, fontSize:12, cursor:"pointer" }}>
                    📥 In Bibliothek speichern
                  </button>
                : <Card>
                    <div style={{ fontWeight:700, fontSize:13, color:C.primary, marginBottom:8 }}>In Bibliothek speichern</div>
                    <input value={bibTitel} onChange={ev=>setBibTitel(ev.target.value)}
                      style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 10px", fontSize:13, boxSizing:"border-box", marginBottom:8 }} />
                    <div style={{ fontSize:11, color:C.muted, marginBottom:10 }}>{e.blocks.length} Blöcke · {gesamtDauer} min · {abgeleiteteSP.join(", ")}</div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={()=>setSaveBib(false)} style={{ flex:1, background:"#f3f4f6", border:"none", borderRadius:8, padding:9, fontWeight:600, fontSize:13, cursor:"pointer" }}>Abbrechen</button>
                      <button onClick={()=>{ onSaveZurBibliothek({titel:bibTitel,blocks:e.blocks,gesamtDauer,kategorien:abgeleiteteSP}); setSaveBib(false); }}
                        style={{ flex:2, background:"#16a34a", color:"#fff", border:"none", borderRadius:8, padding:9, fontWeight:700, fontSize:13, cursor:"pointer" }}>
                        Speichern
                      </button>
                    </div>
                  </Card>
              }
            </div>
          )}

          <button onClick={()=>onSave(e)}
            style={{ marginTop:8, background:C.primary, color:"#fff", border:"none", borderRadius:10, padding:12, fontWeight:700, fontSize:14, cursor:"pointer" }}>
            Einheit speichern
          </button>
        </>
      )}

      {picker && (
        <BibliothekPicker
          bibliothek={INIT_BIBLIOTHEK}
          multiSelect={picker==="multi"}
          onSelect={addFromBib}
          onClose={()=>setPicker(null)}
        />
      )}
    </div>
  );
}

// ── Trainingseinheit aus Bibliothek planen ────────────────────────────────────
function PlanungAusBibliothek({ eintrag, onBack, onPlanAdd, onEintragVorlage }) {
  const [mode, setMode] = useState(null); // null | "vorlage" | "kombinieren"
  // Vorlage-Modus: Eintrag als Basis
  const [form, setForm] = useState({ tag:"Mo", gruppe:"Erwachsene", dauer:90, datum:"–" });

  if (mode==="vorlage") {
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        <BackBtn onBack={()=>setMode(null)} label="← Zurück" />
        <Card>
          <div style={{ fontWeight:700, fontSize:14, color:C.primary, marginBottom:12 }}>Als Vorlage planen</div>
          <div style={{ background:spColor(eintrag.kategorie)+"11", borderRadius:10, padding:"10px 12px", borderLeft:`4px solid ${spColor(eintrag.kategorie)}`, marginBottom:12 }}>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <span style={{ fontSize:24 }}>{eintrag.emoji}</span>
              <div>
                <div style={{ fontWeight:700, fontSize:13 }}>{eintrag.titel}</div>
                <div style={{ fontSize:11, color:C.muted }}>{eintrag.kategorie} · {eintrag.dauer} min</div>
              </div>
            </div>
          </div>
          <div style={{ display:"flex", gap:5, marginBottom:10, flexWrap:"wrap" }}>
            {TAGE.map(t=>(
              <button key={t} onClick={()=>setForm(p=>({...p,tag:t}))}
                style={{ border:"none", borderRadius:8, padding:"5px 10px", fontSize:12, fontWeight:600, cursor:"pointer", background: form.tag===t?C.primary:"#f3f4f6", color: form.tag===t?"#fff":"#374151" }}>
                {t}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", gap:5, marginBottom:10, flexWrap:"wrap" }}>
            {GRUPPEN.map(g=>(
              <button key={g} onClick={()=>setForm(p=>({...p,gruppe:g}))}
                style={{ border:"none", borderRadius:8, padding:"5px 10px", fontSize:12, fontWeight:600, cursor:"pointer", background: form.gruppe===g?C.primary:"#f3f4f6", color: form.gruppe===g?"#fff":"#374151" }}>
                {g}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", gap:5, marginBottom:14 }}>
            {DAUERN.map(d=>(
              <button key={d} onClick={()=>setForm(p=>({...p,dauer:d}))}
                style={{ border:"none", borderRadius:8, padding:"5px 10px", fontSize:12, fontWeight:600, cursor:"pointer", background: form.dauer===d?C.primary:"#f3f4f6", color: form.dauer===d?"#fff":"#374151" }}>
                {d} min
              </button>
            ))}
          </div>
          <button onClick={()=>onPlanAdd({ ...form, id:genId(), status:"geplant",
            blocks:[{ id:genId(), typ:"bibliothek", refId:eintrag.id, titel:eintrag.titel, emoji:eintrag.emoji, dauer:eintrag.dauer, kategorie:eintrag.kategorie }]
          })}
            style={{ width:"100%", background:C.primary, color:"#fff", border:"none", borderRadius:10, padding:12, fontWeight:700, fontSize:14, cursor:"pointer" }}>
            In Planung eintragen
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <BackBtn onBack={onBack} label="← Bibliothek" />

      {/* Eintrag-Header */}
      <div style={{ background:`linear-gradient(135deg,${C.primary},#2563eb)`, borderRadius:12, padding:16, color:"#fff" }}>
        <div style={{ display:"flex", gap:8, marginBottom:6, flexWrap:"wrap" }}>
          <Badge label={eintrag.typ} color={typColor(eintrag.typ)} />
          <Badge label={eintrag.kategorie} color={spColor(eintrag.kategorie)} />
          <Badge label={eintrag.niveau} color="#94a3b8" />
        </div>
        <div style={{ fontWeight:800, fontSize:17 }}>{eintrag.titel}</div>
        <div style={{ fontSize:13, opacity:0.85, marginTop:4 }}>{eintrag.beschreibung}</div>
        <div style={{ display:"flex", gap:16, marginTop:10 }}>
          {[[`${eintrag.dauer} min`,"Dauer"],[eintrag.schritte.length,"Schritte"],[eintrag.material.length,"Material"]].map(([v,l])=>(
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontSize:16, fontWeight:800 }}>{v}</div>
              <div style={{ fontSize:9, opacity:0.75 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Zwei Wege */}
      <div style={{ fontWeight:700, fontSize:13, color:C.primary }}>Wie möchtest du diesen Eintrag verwenden?</div>

      <button onClick={()=>setMode("vorlage")}
        style={{ background:C.card, border:`2px solid #3b82f6`, borderRadius:12, padding:"14px 16px", textAlign:"left", cursor:"pointer", boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
        <div style={{ fontWeight:700, fontSize:14, color:"#3b82f6", marginBottom:4 }}>📋 Als Vorlage verwenden</div>
        <div style={{ fontSize:12, color:C.muted }}>Diesen Eintrag direkt als Basis einer neuen Trainingseinheit planen. Schnell und unkompliziert.</div>
      </button>

      <button onClick={()=>onEintragVorlage(eintrag)}
        style={{ background:C.card, border:`2px solid #8b5cf6`, borderRadius:12, padding:"14px 16px", textAlign:"left", cursor:"pointer", boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
        <div style={{ fontWeight:700, fontSize:14, color:"#8b5cf6", marginBottom:4 }}>🧩 Kombinieren & anpassen</div>
        <div style={{ fontSize:12, color:C.muted }}>Diesen Eintrag als ersten Block einer Einheit übernehmen und mit weiteren Inhalten kombinieren.</div>
      </button>

      {/* Schritte-Vorschau */}
      <Card>
        <div style={{ fontWeight:700, fontSize:13, color:C.primary, marginBottom:8 }}>Inhalt</div>
        {eintrag.schritte.map((s,i)=>(
          <div key={i} style={{ display:"flex", gap:10, marginBottom:8 }}>
            <div style={{ width:22, height:22, borderRadius:"50%", background:C.primary, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0 }}>{i+1}</div>
            <div style={{ fontSize:12, lineHeight:1.5, paddingTop:2 }}>{s}</div>
          </div>
        ))}
      </Card>

      {eintrag.material.length>0 && (
        <Card>
          <div style={{ fontWeight:700, fontSize:13, color:C.primary, marginBottom:8 }}>🧰 Material</div>
          {eintrag.material.map((m,i)=>(
            <div key={i} style={{ display:"flex", gap:8, fontSize:13, paddingBottom:6, borderBottom: i<eintrag.material.length-1?`1px solid ${C.border}`:"none", marginBottom: i<eintrag.material.length-1?6:0 }}>
              <span>✓</span><span>{m}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ── Bibliothek ────────────────────────────────────────────────────────────────
function Bibliothek({ extraEintraege, onEintragPlan }) {
  const [suche, setSuche]   = useState("");
  const [kat, setKat]       = useState("Alle");
  const [sel, setSel]       = useState(null);
  const [view, setView]     = useState("liste"); // liste | detail

  const alle = [...INIT_BIBLIOTHEK, ...extraEintraege];
  const gefiltert = alle
    .filter(e=>kat==="Alle"||e.kategorie===kat)
    .filter(e=>e.titel.toLowerCase().includes(suche.toLowerCase()));

  if (view==="detail"&&sel) {
    return (
      <PlanungAusBibliothek
        eintrag={sel}
        onBack={()=>{setSel(null);setView("liste");}}
        onPlanAdd={(einheit)=>{ onEintragPlan(einheit, sel); setSel(null); setView("liste"); }}
        onEintragVorlage={(eintrag)=>{ onEintragPlan(null, eintrag, "kombinieren"); setSel(null); setView("liste"); }}
      />
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ position:"relative" }}>
        <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:14, color:C.muted }}>🔍</span>
        <input value={suche} onChange={e=>setSuche(e.target.value)} placeholder="Suchen…"
          style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:10, padding:"9px 10px 9px 32px", fontSize:13, background:C.card, boxSizing:"border-box" }} />
      </div>
      <div style={{ display:"flex", gap:5, overflowX:"auto" }}>
        {["Alle",...KATEGORIEN].map(k=>(
          <button key={k} onClick={()=>setKat(k)}
            style={{ border:"none", borderRadius:8, padding:"5px 10px", fontSize:11, fontWeight:600, cursor:"pointer", flexShrink:0, background: kat===k?(spColor(k)||C.primary):C.card, color: kat===k?"#fff":"#374151", boxShadow:"0 1px 3px rgba(0,0,0,0.07)" }}>
            {k}
          </button>
        ))}
      </div>
      <div style={{ fontSize:12, color:C.muted }}>{gefiltert.length} Einträge</div>
      {gefiltert.map(b=>(
        <div key={b.id} onClick={()=>{setSel(b);setView("detail");}}
          style={{ background:C.card, borderRadius:10, padding:"12px 13px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", cursor:"pointer", borderLeft:`4px solid ${spColor(b.kategorie)}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:24, flexShrink:0 }}>{b.emoji||"📋"}</span>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", gap:4, marginBottom:3, flexWrap:"wrap" }}>
                <Badge label={b.typ||"Workout"} color={typColor(b.typ)} />
                <Badge label={b.kategorie} color={spColor(b.kategorie)} />
                {b.vonPlanung && <Badge label="📅 Aus Planung" color="#f59e0b" />}
              </div>
              <div style={{ fontWeight:700, fontSize:13 }}>{b.titel}</div>
              <div style={{ fontSize:11, color:C.muted }}>{b.niveau||"Alle"} · {b.dauer} min</div>
            </div>
            <div style={{ background:"#eff6ff", color:"#3b82f6", borderRadius:8, padding:"5px 10px", fontSize:11, fontWeight:700, flexShrink:0 }}>
              📅 Planen
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Planung ───────────────────────────────────────────────────────────────────
function Planung({ wochen, setWochen, bibSaved, onSaveZurBibliothek, pendingBlock }) {
  const [view, setView]   = useState("liste");
  const [sel, setSel]     = useState(null);
  const [selKw, setSelKw] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null),3000); };

  const openEinheit = (e,kwIdx) => {
    let einheit = e;
    // Wenn pending (aus Bibliothek kombinieren), Block vorbelegen
    if (pendingBlock && e.id===pendingBlock.einheitId) {
      einheit = { ...e, blocks:[pendingBlock.block,...e.blocks] };
    }
    setSel(einheit); setSelKw(kwIdx); setView("detail");
  };

  const saveEinheit = (updated) => {
    setWochen(prev=>prev.map((w,i)=>i===selKw?{...w,einheiten:w.einheiten.map(e=>e.id===updated.id?updated:e)}:w));
    setView("liste");
  };

  const saveZurBib = (data) => {
    onSaveZurBibliothek(data);
    showToast(`„${data.titel}" in Bibliothek gespeichert`);
    setView("liste");
  };

  if (view==="detail"&&sel) {
    return <EinheitDetail einheit={sel} onBack={()=>setView("liste")} onSave={saveEinheit} onSaveZurBibliothek={saveZurBib} />;
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <Toast msg={toast} />
      {wochen.map((w,wi)=>(
        <div key={wi}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <div style={{ fontWeight:700, fontSize:15 }}>{w.kw} <span style={{ fontWeight:400, fontSize:12, color:C.muted }}>{w.von} – {w.bis}</span></div>
            <button style={{ background:C.primary, color:"#fff", border:"none", borderRadius:8, padding:"5px 12px", fontSize:12, fontWeight:700, cursor:"pointer" }}>+ Einheit</button>
          </div>
          {w.einheiten.map(e=>{
            const gesamtMin=e.blocks.reduce((s,b)=>s+b.dauer,0);
            const kats=[...new Set(e.blocks.map(b=>b.kategorie))];
            return (
              <div key={e.id} onClick={()=>openEinheit(e,wi)}
                style={{ background:C.card, borderRadius:10, padding:"12px 14px", marginBottom:8, boxShadow:"0 1px 4px rgba(0,0,0,0.07)", cursor:"pointer", borderLeft:`4px solid ${e.blocks.length>0?"#22c55e":C.border}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ background:C.primary, color:"#fff", borderRadius:8, width:42, textAlign:"center", padding:"4px 0", flexShrink:0 }}>
                    <div style={{ fontSize:10 }}>{e.tag}</div>
                    <div style={{ fontSize:12, fontWeight:700 }}>{e.datum}</div>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:13, marginBottom:4 }}>{e.gruppe} · {e.dauer} min</div>
                    <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                      {e.blocks.length>0
                        ? <><Badge label={`${e.blocks.length} Blöcke`} color="#22c55e" /><Badge label={`${gesamtMin} min`} color="#3b82f6" />{kats.slice(0,2).map(k=><Badge key={k} label={k} color={spColor(k)} />)}</>
                        : <Badge label="Leer" color="#9ca3af" />
                      }
                    </div>
                    {e.blocks.length>0 && (
                      <div style={{ display:"flex", gap:1, marginTop:5, height:5, borderRadius:3, overflow:"hidden" }}>
                        {e.blocks.map(b=><div key={b.id} style={{ flex:b.dauer, background:spColor(b.kategorie), minWidth:2 }} />)}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize:16, color:"#9ca3af" }}>›</div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      {bibSaved.length>0 && (
        <Card>
          <div style={{ fontWeight:700, fontSize:13, color:C.primary, marginBottom:8 }}>📥 Zuletzt in Bibliothek</div>
          {bibSaved.map((b,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8, paddingBottom:8, borderBottom: i<bibSaved.length-1?`1px solid ${C.border}`:"none", marginBottom: i<bibSaved.length-1?8:0 }}>
              <span>📚</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:13 }}>{b.titel}</div>
                <div style={{ fontSize:11, color:C.muted }}>{b.blocks.length} Blöcke · {b.gesamtDauer} min</div>
              </div>
              <Badge label="Gespeichert" color="#22c55e" />
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id:"planung",    label:"Planung",    icon:"📅" },
  { id:"bibliothek", label:"Bibliothek", icon:"📚" },
];
const ALL_NAV = [
  { id:"dashboard",    label:"Dashboard",   icon:"🏠" },
  { id:"planung",      label:"Planung",     icon:"📅" },
  { id:"athleten",     label:"Athleten",    icon:"🥋" },
  { id:"anwesenheit",  label:"Anwesenheit", icon:"✅" },
  { id:"pruefungen",   label:"Prüfungen",   icon:"🏆" },
  { id:"bibliothek",   label:"Bibliothek",  icon:"📚" },
  { id:"auswertung",   label:"Auswertung",  icon:"📊" },
  { id:"einstellungen",label:"Einstellungen",icon:"⚙️" },
];

function Placeholder({ title }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:300, color:"#9ca3af" }}>
      <div style={{ fontSize:40, marginBottom:12 }}>🚧</div>
      <div style={{ fontSize:16, fontWeight:600 }}>{title}</div>
    </div>
  );
}

export default function App() {
  const [active, setActive]     = useState("planung");
  const [menuOpen, setMenuOpen] = useState(false);
  const [wochen, setWochen]     = useState(INIT_WOCHEN);
  const [bibSaved, setBibSaved] = useState([]);
  const [toast, setToast]       = useState(null);
  // pending: Aus Bibliothek "Kombinieren" -> öffnet Planung mit vorbeladenem Block
  const [pending, setPending]   = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null),3000); };

  const onSaveZurBibliothek = (data) => {
    const neu = { id:genId(), typ:"Workout", titel:data.titel, kategorie:data.kategorien[0]||"Technik",
      niveau:"Alle", dauer:data.gesamtDauer, emoji:"📅", beschreibung:`Trainingseinheit – ${data.blocks.length} Blöcke.`,
      schritte:data.blocks.map(b=>`${b.dauer} min – ${b.titel}`), material:[], tags:data.kategorien, vonPlanung:true };
    setBibSaved(p=>[neu,...p]);
  };

  // Aus Bibliothek: Einheit direkt anlegen (Vorlage-Modus)
  const onEintragPlan = (fertigeEinheit, eintrag, mode) => {
    if (mode==="kombinieren") {
      // Neuen Block vorbereiten, in erste Einheit einfügen
      const newBlock = { id:genId(), typ:"bibliothek", refId:eintrag.id, titel:eintrag.titel, emoji:eintrag.emoji, dauer:eintrag.dauer, kategorie:eintrag.kategorie };
      // Füge Block zur ersten Einheit in KW13 ein und navigiere
      setWochen(prev=>prev.map((w,wi)=>wi===0?{...w,einheiten:w.einheiten.map((e,ei)=>ei===0?{...e,blocks:[newBlock,...e.blocks]}:e)}:w));
      showToast(`„${eintrag.titel}" zu Mo KW13 hinzugefügt`);
      setActive("planung");
    } else if (fertigeEinheit) {
      // Vorlage: neue Einheit in KW13 eintragen
      setWochen(prev=>prev.map((w,wi)=>wi===0?{...w,einheiten:[...w.einheiten,fertigeEinheit]}:w));
      showToast(`Einheit aus „${eintrag.titel}" in KW13 geplant`);
      setActive("planung");
    }
  };

  const current = ALL_NAV.find(n=>n.id===active) || ALL_NAV[1];

  return (
    <div style={{ fontFamily:"system-ui, sans-serif", background:C.bg, minHeight:"100vh", maxWidth:420, margin:"0 auto" }}>
      <div style={{ background:C.primary, color:"#fff", padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <div>
          <div style={{ fontSize:11, opacity:0.65 }}>Taekwondo</div>
          <div style={{ fontSize:17, fontWeight:700 }}>{current.icon} {current.label}</div>
        </div>
        <button onClick={()=>setMenuOpen(!menuOpen)} style={{ background:"none", border:"none", color:"#fff", fontSize:22, cursor:"pointer" }}>☰</button>
      </div>

      {menuOpen && (
        <div style={{ position:"fixed", inset:0, zIndex:100, display:"flex" }}>
          <div style={{ background:C.primary, width:240, padding:"24px 0", display:"flex", flexDirection:"column", gap:2 }}>
            <div style={{ color:"#fff", fontWeight:700, fontSize:16, padding:"0 20px 16px" }}>🥋 TKD Trainer</div>
            {ALL_NAV.map(n=>(
              <button key={n.id} onClick={()=>{ setActive(n.id); setMenuOpen(false); }}
                style={{ background: active===n.id?"rgba(255,255,255,0.15)":"none", border:"none", color:"#fff", textAlign:"left", padding:"12px 20px", fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", gap:10 }}>
                <span>{n.icon}</span><span>{n.label}</span>
              </button>
            ))}
          </div>
          <div style={{ flex:1, background:"rgba(0,0,0,0.4)" }} onClick={()=>setMenuOpen(false)} />
        </div>
      )}

      <div style={{ padding:16 }}>
        {toast && <Toast msg={toast} />}
        {active==="planung"    && <Planung wochen={wochen} setWochen={setWochen} bibSaved={bibSaved} onSaveZurBibliothek={onSaveZurBibliothek} pendingBlock={pending} />}
        {active==="bibliothek" && <Bibliothek extraEintraege={bibSaved} onEintragPlan={onEintragPlan} />}
        {!["planung","bibliothek"].includes(active) && <Placeholder title={current.label} />}
      </div>

      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:420, background:C.card, borderTop:`1px solid ${C.border}`, display:"flex", justifyContent:"space-around", padding:"8px 0", zIndex:50 }}>
        {ALL_NAV.map(n=>(
          <button key={n.id} onClick={()=>setActive(n.id)}
            style={{ background:"none", border:"none", display:"flex", flexDirection:"column", alignItems:"center", gap:2, cursor:"pointer", color: active===n.id?C.primary:"#9ca3af", minWidth:0 }}>
            <span style={{ fontSize:18 }}>{n.icon}</span>
            <span style={{ fontSize:8, fontWeight: active===n.id?700:400 }}>{n.label}</span>
          </button>
        ))}
      </div>
      <div style={{ height:70 }} />
    </div>
  );
}
