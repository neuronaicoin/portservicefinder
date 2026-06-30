'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { saveItem, loadItem, genId } from '@/lib/voyage-storage';

const lb = "'Libre Bodoni', serif";
const rj = "'Rajdhani', sans-serif";
const g = { color: '#c8a84b', fontStyle: 'italic' } as React.CSSProperties;

// ============================================================
// TYPES
// ============================================================
interface WeightItem {
  id: string;
  label: string;
  weight: number;   // MT
  lcg: number;      // m from midship (+ forward)
  vcg: number;      // m above keel (KG of item)
  fsm: number;      // free surface moment (t·m) — tanks only
}

interface StabData {
  vesselName: string;
  imo: string;
  condition: string;        // e.g. "Departure laden"
  // hydrostatics (from stability book at approx draft)
  lbp: number;
  lightship: number;        // MT
  lightshipLcg: number;     // m
  lightshipVcg: number;     // m (KG)
  km: number;               // transverse metacentre above keel (m)
  mtc: number;              // moment to change trim 1 cm (t·m)
  tpc: number;              // tonnes per cm
  lcf: number;              // m from midship
  // deadweight items
  items: WeightItem[];
}

function newItem(label = ''): WeightItem {
  return { id: genId(), label, weight: 0, lcg: 0, vcg: 0, fsm: 0 };
}

const DEFAULT_ITEMS = ['Cargo Hold 1', 'Cargo Hold 2', 'Cargo Hold 3', 'VLSFO Bunkers', 'MGO Bunkers', 'Fresh Water', 'Ballast Water', 'Constant'];

const DEFAULT_DATA: StabData = {
  vesselName: '', imo: '', condition: 'Departure',
  lbp: 0, lightship: 0, lightshipLcg: 0, lightshipVcg: 0, km: 0, mtc: 0, tpc: 0, lcf: 0,
  items: DEFAULT_ITEMS.map((l) => newItem(l)),
};

const IMO_MIN_GM = 0.15; // m — IMO intact stability minimum initial GM

// ============================================================
// CALC
// ============================================================
function calc(d: StabData) {
  // build full weight list including lightship
  const rows = [
    { weight: d.lightship, lcg: d.lightshipLcg, vcg: d.lightshipVcg, fsm: 0 },
    ...d.items.map((i) => ({ weight: i.weight, lcg: i.lcg, vcg: i.vcg, fsm: i.fsm })),
  ];

  const totalWeight = rows.reduce((s, r) => s + (r.weight || 0), 0);
  const momentLong = rows.reduce((s, r) => s + (r.weight || 0) * (r.lcg || 0), 0);
  const momentVert = rows.reduce((s, r) => s + (r.weight || 0) * (r.vcg || 0), 0);
  const totalFsm = rows.reduce((s, r) => s + (r.fsm || 0), 0);

  const displacement = totalWeight;
  const lcg = displacement > 0 ? momentLong / displacement : 0;
  const kgSolid = displacement > 0 ? momentVert / displacement : 0;

  // free surface correction
  const fsCorrection = displacement > 0 ? totalFsm / displacement : 0;
  const kgFluid = kgSolid + fsCorrection;

  // GM
  const gmSolid = d.km > 0 ? d.km - kgSolid : 0;
  const gmFluid = d.km > 0 ? d.km - kgFluid : 0;

  // trim — needs LCB but as a quick check we compare LCG vs LCF.
  // Approx trimming moment ~ displacement × (LCG - LCF). Trim(cm) = moment / MTC.
  // (Simplified: assumes vessel near even keel; for indicative use only.)
  const trimMoment = displacement * (lcg - d.lcf);
  const trimCm = d.mtc > 0 ? trimMoment / d.mtc : 0;
  const trimM = trimCm / 100;
  // positive trimMoment (LCG fwd of LCF) -> trim by head; we present accordingly

  return { displacement, lcg, kgSolid, kgFluid, fsCorrection, gmSolid, gmFluid, totalFsm, trimM };
}

function fmt(n: number, dec = 2): string {
  if (!isFinite(n)) return '–';
  return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

// ============================================================
// STYLES
// ============================================================
const card: React.CSSProperties = { background: '#111c13', border: '1px solid rgba(200,168,75,.18)', padding: '20px 18px', borderRadius: 4, marginBottom: 16 };
const sectionTitle: React.CSSProperties = { fontFamily: rj, fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid rgba(200,168,75,.12)' };
const labelS: React.CSSProperties = { display: 'block', fontFamily: rj, fontSize: 10, letterSpacing: '.5px', textTransform: 'uppercase', color: '#7a8a72', fontWeight: 600, marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', background: '#0c1610', border: '1px solid rgba(200,168,75,.2)', color: '#f5f0e8', padding: '7px 9px', fontFamily: rj, fontSize: 12.5, fontWeight: 500, borderRadius: 3, boxSizing: 'border-box' };
const numCell: React.CSSProperties = { ...inputStyle, padding: '5px 7px', fontSize: 12, textAlign: 'right' };
const ghostBtn: React.CSSProperties = { background: 'transparent', color: '#c8a84b', border: '1px solid rgba(200,168,75,.4)', padding: '8px 14px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };
const goldBtn: React.CSSProperties = { background: '#c8a84b', color: '#08100a', border: 'none', padding: '8px 16px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };

// ============================================================
// COMPONENT
// ============================================================
export default function StabilityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingId = searchParams.get('id');

  const [data, setData] = useState<StabData>(DEFAULT_DATA);
  const [recordId, setRecordId] = useState<string | null>(existingId);
  const [recordName, setRecordName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (existingId) {
      const saved = loadItem<StabData>('stability', existingId);
      if (saved) { setData(saved.data); setRecordName(saved.name); }
    }
  }, [existingId]);

  function update<K extends keyof StabData>(key: K, value: StabData[K]) { setData((p) => ({ ...p, [key]: value })); }
  function num(v: string): number { return parseFloat(v) || 0; }
  function updItem(id: string, patch: Partial<WeightItem>) {
    setData((p) => ({ ...p, items: p.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));
  }
  function addItem() { setData((p) => ({ ...p, items: [...p.items, newItem()] })); }
  function delItem(id: string) { setData((p) => ({ ...p, items: p.items.filter((i) => i.id !== id) })); }

  const c = useMemo(() => calc(data), [data]);

  const gmOk = c.gmFluid >= IMO_MIN_GM;
  const gmNegative = data.km > 0 && c.gmFluid < 0;

  function handleSave() {
    const name = recordName.trim() || `${data.vesselName || 'Vessel'} — ${data.condition || 'Stability'}`;
    const id = recordId || genId();
    saveItem('stability', name, data, id);
    setRecordId(id); setRecordName(name); setSaveMsg('✓ Saved'); setShowSave(false);
    setTimeout(() => setSaveMsg(''), 3000);
  }
  function handleReset() {
    if (!confirm('Reset all fields?')) return;
    setData(DEFAULT_DATA); setRecordId(null); setRecordName(''); router.replace('/voyage/stability');
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>
          ⚓ Voyage Hub · Stability Check
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Stability <em style={g}>Check</em>
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          A quick KG / GM and trim estimate from a weight summary. For indicative checks only — the
          vessel&apos;s approved loading computer and stability book always govern the actual condition.
        </p>
      </div>

      {/* Disclaimer */}
      <div style={{ ...card, background: 'rgba(255,138,138,.06)', borderColor: 'rgba(255,138,138,.3)', padding: '12px 16px' }}>
        <div style={{ fontFamily: rj, fontSize: 12, color: '#ffb0b0', lineHeight: 1.5 }}>
          ⚠ <b>Indicative only.</b> This tool does not replace the approved loading instrument or stability
          booklet. Do not load, ballast or sail on the basis of these numbers alone.
        </div>
      </div>

      {/* Action bar */}
      <div className="action-bar" style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => setShowSave(true)} style={goldBtn}>💾 Save</button>
        <button onClick={() => window.print()} style={ghostBtn}>🖨️ Print / PDF</button>
        <button onClick={handleReset} style={{ ...ghostBtn, color: '#ff8a8a', borderColor: 'rgba(255,138,138,.3)' }}>🗑️ Reset</button>
        {saveMsg && <span style={{ color: '#4caf76', fontFamily: rj, fontSize: 12, fontWeight: 600 }}>{saveMsg}</span>}
        {recordName && <span style={{ color: '#7a8a72', fontFamily: rj, fontSize: 11, marginLeft: 'auto' }}>📂 {recordName}</span>}
      </div>

      {showSave && (
        <div style={{ ...card, background: 'rgba(200,168,75,.05)', borderColor: 'rgba(200,168,75,.4)' }}>
          <label style={labelS}>Name</label>
          <input type="text" value={recordName} onChange={(e) => setRecordName(e.target.value)} placeholder="e.g. MV NEURONAI — Departure laden" style={{ ...inputStyle, marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{ ...goldBtn, padding: '8px 14px', letterSpacing: '1px' }}>Save</button>
            <button onClick={() => setShowSave(false)} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* 1. Vessel + hydrostatics */}
      <div style={card}>
        <div style={sectionTitle}>1. Vessel &amp; Hydrostatics (from stability book)</div>
        <div className="st-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 12 }}>
          <div><label style={labelS}>Vessel</label><input style={inputStyle} value={data.vesselName} onChange={(e) => update('vesselName', e.target.value)} placeholder="MV NEURONAI" /></div>
          <div><label style={labelS}>IMO</label><input style={inputStyle} value={data.imo} onChange={(e) => update('imo', e.target.value)} placeholder="9876543" /></div>
          <div><label style={labelS}>Condition</label><input style={inputStyle} value={data.condition} onChange={(e) => update('condition', e.target.value)} placeholder="Departure laden" /></div>
        </div>
        <div className="st-g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 12 }}>
          <div><label style={labelS}>Lightship (MT)</label><input style={inputStyle} type="number" value={data.lightship || ''} onChange={(e) => update('lightship', num(e.target.value))} placeholder="12000" /></div>
          <div><label style={labelS}>Lightship LCG (m)</label><input style={inputStyle} type="number" step="0.01" value={data.lightshipLcg || ''} onChange={(e) => update('lightshipLcg', num(e.target.value))} placeholder="-2.5" /></div>
          <div><label style={labelS}>Lightship VCG/KG (m)</label><input style={inputStyle} type="number" step="0.01" value={data.lightshipVcg || ''} onChange={(e) => update('lightshipVcg', num(e.target.value))} placeholder="8.2" /></div>
          <div><label style={labelS}>KM (m)</label><input style={inputStyle} type="number" step="0.01" value={data.km || ''} onChange={(e) => update('km', num(e.target.value))} placeholder="9.8" /></div>
        </div>
        <div className="st-g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          <div><label style={labelS}>LBP (m)</label><input style={inputStyle} type="number" step="0.01" value={data.lbp || ''} onChange={(e) => update('lbp', num(e.target.value))} placeholder="225" /></div>
          <div><label style={labelS}>MTC (t·m/cm)</label><input style={inputStyle} type="number" value={data.mtc || ''} onChange={(e) => update('mtc', num(e.target.value))} placeholder="950" /></div>
          <div><label style={labelS}>TPC (t/cm)</label><input style={inputStyle} type="number" step="0.1" value={data.tpc || ''} onChange={(e) => update('tpc', num(e.target.value))} placeholder="72.5" /></div>
          <div><label style={labelS}>LCF (m)</label><input style={inputStyle} type="number" step="0.01" value={data.lcf || ''} onChange={(e) => update('lcf', num(e.target.value))} placeholder="-1.5" /></div>
        </div>
        <p style={{ fontSize: 10, color: '#7a8a72', fontFamily: rj, marginTop: 10 }}>LCG/LCF: + forward of midship, − aft. VCG/KG/KM measured above keel.</p>
      </div>

      {/* 2. Weight items */}
      <div style={card}>
        <div style={sectionTitle}>2. Deadweight Items</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
            <thead>
              <tr style={{ color: '#7a8a72', fontFamily: rj, fontSize: 9.5, letterSpacing: '.5px', textTransform: 'uppercase' }}>
                <th style={{ ...thd, textAlign: 'left' }}>Item</th>
                <th style={thd}>Weight (MT)</th>
                <th style={thd}>LCG (m)</th>
                <th style={thd}>VCG (m)</th>
                <th style={thd}>FSM (t·m)</th>
                <th style={{ ...thd, width: 28 }}></th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((it) => (
                <tr key={it.id} style={{ borderTop: '1px solid rgba(200,168,75,.08)' }}>
                  <td style={{ padding: '4px 6px' }}><input style={{ ...inputStyle, padding: '5px 7px', fontSize: 12 }} value={it.label} onChange={(e) => updItem(it.id, { label: e.target.value })} placeholder="Item" /></td>
                  <td style={{ padding: '4px 4px' }}><input style={numCell} type="number" value={it.weight || ''} onChange={(e) => updItem(it.id, { weight: num(e.target.value) })} placeholder="0" /></td>
                  <td style={{ padding: '4px 4px' }}><input style={numCell} type="number" step="0.01" value={it.lcg || ''} onChange={(e) => updItem(it.id, { lcg: num(e.target.value) })} placeholder="0" /></td>
                  <td style={{ padding: '4px 4px' }}><input style={numCell} type="number" step="0.01" value={it.vcg || ''} onChange={(e) => updItem(it.id, { vcg: num(e.target.value) })} placeholder="0" /></td>
                  <td style={{ padding: '4px 4px' }}><input style={numCell} type="number" value={it.fsm || ''} onChange={(e) => updItem(it.id, { fsm: num(e.target.value) })} placeholder="0" /></td>
                  <td style={{ padding: '4px 4px', textAlign: 'center' }}><button onClick={() => delItem(it.id)} style={{ background: 'transparent', border: 'none', color: '#ff8a8a', cursor: 'pointer', fontSize: 12 }}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={addItem} style={{ ...ghostBtn, marginTop: 12, fontSize: 10 }}>+ Add Item</button>
        <p style={{ fontSize: 10, color: '#7a8a72', fontFamily: rj, marginTop: 8 }}>FSM = free-surface moment of slack tanks (t·m); leave 0 for solids/pressed-up tanks.</p>
      </div>

      {/* RESULTS */}
      {data.km > 0 && c.displacement > 0 && (
        <div style={{ ...card, background: 'linear-gradient(135deg,rgba(200,168,75,.08),transparent)', borderColor: gmNegative ? 'rgba(255,138,138,.6)' : 'rgba(200,168,75,.4)' }}>
          <div style={sectionTitle}>⚡ Result</div>

          <div className="st-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
            <KPI label="Displacement" value={fmt(c.displacement, 0)} sub="MT" color="#f5f0e8" />
            <KPI label="KG (fluid)" value={fmt(c.kgFluid, 3)} sub="m" color="#f5f0e8" />
            <KPI label="GM (fluid)" value={fmt(c.gmFluid, 3)} sub="m" color={gmNegative ? '#ff8a8a' : gmOk ? '#4caf76' : '#e8b85a'} big />
            <KPI label="Trim (approx)" value={`${fmt(Math.abs(c.trimM), 2)}`} sub={c.trimM > 0.001 ? 'm head' : c.trimM < -0.001 ? 'm aft' : 'even'} color="#c8a84b" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0 }}>
            <RowR label="Total LCG" value={`${fmt(c.lcg, 3)} m`} />
            <RowR label="KG (solid)" value={`${fmt(c.kgSolid, 3)} m`} />
            <RowR label="Free surface correction" value={`${fmt(c.fsCorrection, 3)} m`} color={c.fsCorrection > 0.05 ? '#e8b85a' : undefined} />
            <RowR label="GM (solid)" value={`${fmt(c.gmSolid, 3)} m`} />
            <RowR label="KM (input)" value={`${fmt(data.km, 3)} m`} />
          </div>

          {/* GM verdict */}
          <div style={{ marginTop: 14, padding: '14px 16px', background: '#0c1610', border: `1px solid ${gmNegative ? 'rgba(255,138,138,.6)' : gmOk ? 'rgba(76,175,118,.5)' : 'rgba(232,184,90,.5)'}`, borderRadius: 4 }}>
            {gmNegative ? (
              <div style={{ fontFamily: rj, color: '#ff8a8a', fontSize: 13.5, lineHeight: 1.5 }}>
                ❌ <b>NEGATIVE GM ({fmt(c.gmFluid, 3)} m)</b> — the vessel would be unstable / loll. Do not proceed. Lower the KG (ballast down, strike down weight) and recheck on the loading computer.
              </div>
            ) : gmOk ? (
              <div style={{ fontFamily: rj, color: '#4caf76', fontSize: 13.5, lineHeight: 1.5 }}>
                ✅ <b>GM {fmt(c.gmFluid, 3)} m</b> — above the IMO minimum initial GM of {IMO_MIN_GM.toFixed(2)} m. Still verify the full intact-stability criteria (GZ curve, areas, angle of max GZ) on the approved instrument.
              </div>
            ) : (
              <div style={{ fontFamily: rj, color: '#e8b85a', fontSize: 13.5, lineHeight: 1.5 }}>
                ⚠ <b>GM {fmt(c.gmFluid, 3)} m</b> — below the IMO minimum initial GM of {IMO_MIN_GM.toFixed(2)} m. Tender / stiff issues likely. Recheck on the loading computer before any operation.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Methodology */}
      <div style={{ ...card, background: 'rgba(122,138,114,.05)', borderColor: 'rgba(122,138,114,.15)' }}>
        <div style={sectionTitle}>📖 Method &amp; Limits</div>
        <ul style={{ fontSize: 11.5, color: '#b0c0a4', lineHeight: 1.7, paddingLeft: 18, fontFamily: rj }}>
          <li>Displacement = Σ weights (lightship + items). KG = Σ(weight × VCG) ÷ displacement.</li>
          <li>Free-surface correction = Σ FSM ÷ displacement, added to KG to give fluid KG.</li>
          <li><b style={{ color: '#c8a84b' }}>GM = KM − KG</b>. IMO intact stability requires initial GM ≥ {IMO_MIN_GM.toFixed(2)} m (plus full GZ-curve criteria).</li>
          <li>Trim here is a simplified LCG-vs-LCF estimate (MTC method) and assumes near-even keel — not a substitute for the hydrostatic trim solution.</li>
          <li>GZ curve, weather criterion, grain/timber and damage-stability checks are <b>not</b> calculated. Use the approved loading instrument.</li>
        </ul>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .st-g3, .st-g4 { grid-template-columns: 1fr 1fr !important; }
          .st-kpis { grid-template-columns: 1fr 1fr !important; }
          .action-bar button { font-size: 10px !important; padding: 7px 10px !important; }
        }
        @media print {
          @page { size: A4; margin: 12mm; }
          body { background: white !important; color: black !important; }
          nav, footer, .action-bar { display: none !important; }
        }
      `}</style>
    </div>
  );
}

const thd: React.CSSProperties = { padding: '6px 6px', textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap' };

function KPI({ label: l, value, sub, color, big }: { label: string; value: string; sub?: string; color: string; big?: boolean }) {
  return (
    <div style={{ background: '#0c1610', border: '1px solid rgba(200,168,75,.2)', borderRadius: 4, padding: '12px 10px', textAlign: 'center' }}>
      <div style={{ fontFamily: rj, fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: '#7a8a72', fontWeight: 700 }}>{l}</div>
      <div style={{ fontFamily: lb, fontSize: big ? 28 : 22, fontWeight: 700, color, marginTop: 4 }}>{value} {sub && <span style={{ fontSize: 11, color: '#7a8a72' }}>{sub}</span>}</div>
    </div>
  );
}
function RowR({ label: l, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px dashed rgba(200,168,75,.1)', fontFamily: rj, fontSize: 13 }}>
      <span style={{ color: '#7a8a72' }}>{l}</span>
      <span style={{ color: color || '#f5f0e8', fontWeight: 600 }}>{value}</span>
    </div>
  );
}
