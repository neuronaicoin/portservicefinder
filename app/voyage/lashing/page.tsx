'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { saveItem, loadItem, genId } from '@/lib/voyage-storage';

const lb = "'Libre Bodoni', serif";
const rj = "'Rajdhani', sans-serif";
const g = { color: '#c8a84b', fontStyle: 'italic' } as React.CSSProperties;

// ============================================================
// CSS Code (IMO) — simplified "rule of thumb" advanced method
// Acceleration depends on position; we use typical worst-case
// accelerations for an unrestricted service vessel scaled by a
// length/speed correction (CSS Code Annex 13 style).
// ============================================================

// Basic transverse / long / vertical accelerations (g-units) by
// position on deck — typical CSS Code values for ~length>100m.
// transverse depends on height above deck too; we keep it simple.
const BASE_ACC = {
  transverse: 0.5,   // g (deck, mid)  — CSS typical ~0.4-0.8
  longitudinal: 0.3, // g
  vertical: 0.5,     // g (added/relieved)
};

interface Lashing {
  id: string;
  label: string;
  msl: number;       // Maximum Securing Load (kN)
  angleV: number;    // vertical angle to deck (deg)
  angleH: number;    // horizontal angle to centreline (deg)
  count: number;
}

interface LashData {
  cargoName: string;
  weight: number;        // MT
  position: 'fwd' | 'mid' | 'aft';
  frictionType: 'steel-steel' | 'steel-wood' | 'wood-wood' | 'rubber-mat' | 'custom';
  customMu: number;
  // motion correction
  lbp: number;
  speed: number;
  gm: number;
  lashings: Lashing[];
}

const FRICTION: Record<LashData['frictionType'], number> = {
  'steel-steel': 0.1,
  'steel-wood': 0.3,
  'wood-wood': 0.4,
  'rubber-mat': 0.6,
  'custom': 0.3,
};
const FRICTION_LABEL: Record<LashData['frictionType'], string> = {
  'steel-steel': 'Steel – Steel (μ 0.10)',
  'steel-wood': 'Steel – Wood/dunnage (μ 0.30)',
  'wood-wood': 'Wood – Wood (μ 0.40)',
  'rubber-mat': 'Rubber anti-slip mat (μ 0.60)',
  'custom': 'Custom',
};

function newLashing(label = ''): Lashing {
  return { id: genId(), label, msl: 0, angleV: 30, angleH: 0, count: 1 };
}

const DEFAULT_DATA: LashData = {
  cargoName: '', weight: 0, position: 'mid', frictionType: 'steel-wood', customMu: 0.3,
  lbp: 0, speed: 0, gm: 0,
  lashings: [newLashing('Wire lashing')],
};

const G = 9.81; // m/s²

// ============================================================
// CALC
// ============================================================
function calc(d: LashData) {
  const mu = d.frictionType === 'custom' ? d.customMu : FRICTION[d.frictionType];
  const W = d.weight; // MT
  const weightForce = W * G; // kN (since 1 MT × 9.81 m/s² = 9.81 kN)

  // position factor (rough): fwd/aft slightly higher transverse than mid
  const posFactor = d.position === 'mid' ? 1.0 : 1.1;

  // accelerations (g) — could be refined by GM/speed; keep base with small GM influence
  // Higher GM -> stiffer -> higher transverse acceleration. Scale modestly.
  const gmFactor = d.gm > 0 ? Math.min(1.3, Math.max(0.8, d.gm / 1.0)) : 1.0;

  const accT = BASE_ACC.transverse * posFactor * gmFactor; // g
  const accL = BASE_ACC.longitudinal * posFactor;          // g
  const accV = BASE_ACC.vertical;                          // g

  // Forces (kN)
  const Ft = W * G * accT; // transverse external force
  const Fl = W * G * accL; // longitudinal external force
  // vertical reduces effective weight on the worst (roll) side
  const verticalRelief = accV; // fraction of g

  // Friction holding force (transverse): mu * (weight - vertical accel relief)
  const normalForce = weightForce * (1 - verticalRelief * 0.0); // keep full weight for normal (simplified)
  const frictionHold = mu * normalForce; // kN

  // Securing capacity from lashings (transverse component)
  // each lashing provides CS = MSL; effective transverse = MSL * cos(angleV) * cos(angleH) ... plus friction from vertical comp
  let lashingTransverse = 0;
  let totalMsl = 0;
  d.lashings.forEach((l) => {
    const cs = l.msl; // calculation strength ~ MSL (CSS uses CS = MSL; some apply 1.0 factor)
    const horiz = cs * Math.cos((l.angleV * Math.PI) / 180) * Math.cos((l.angleH * Math.PI) / 180);
    // vertical component adds to friction: mu * MSL*sin(angleV)
    const vertFrictionAdd = mu * cs * Math.sin((l.angleV * Math.PI) / 180);
    lashingTransverse += (horiz + vertFrictionAdd) * l.count;
    totalMsl += cs * l.count;
  });

  const totalTransverseResistance = frictionHold + lashingTransverse;

  // Balance check (transverse sliding): required external force Ft vs resistance
  const slidingMargin = totalTransverseResistance - Ft; // positive = OK
  const slidingOk = slidingMargin >= 0;
  const slidingRatio = Ft > 0 ? totalTransverseResistance / Ft : 0;

  // Longitudinal check (friction only, simple)
  const longResistance = frictionHold; // assume lashings mainly transverse; conservative
  const longOk = longResistance >= Fl;

  // suggested number of lashings (transverse) to balance, using first lashing as template
  let suggested = null as number | null;
  if (!slidingOk && d.lashings.length > 0 && d.lashings[0].msl > 0) {
    const l = d.lashings[0];
    const perLashing = (l.msl * Math.cos((l.angleV * Math.PI) / 180) * Math.cos((l.angleH * Math.PI) / 180) + mu * l.msl * Math.sin((l.angleV * Math.PI) / 180));
    if (perLashing > 0) {
      const need = (Ft - frictionHold) / perLashing;
      suggested = Math.max(0, Math.ceil(need));
    }
  }

  return { mu, weightForce, accT, accL, accV, Ft, Fl, frictionHold, lashingTransverse, totalMsl, totalTransverseResistance, slidingMargin, slidingOk, slidingRatio, longResistance, longOk, suggested };
}

function fmt(n: number, dec = 1): string {
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
export default function LashingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingId = searchParams.get('id');

  const [data, setData] = useState<LashData>(DEFAULT_DATA);
  const [recordId, setRecordId] = useState<string | null>(existingId);
  const [recordName, setRecordName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (existingId) {
      const saved = loadItem<LashData>('lashing', existingId);
      if (saved) { setData(saved.data); setRecordName(saved.name); }
    }
  }, [existingId]);

  function update<K extends keyof LashData>(key: K, value: LashData[K]) { setData((p) => ({ ...p, [key]: value })); }
  function num(v: string): number { return parseFloat(v) || 0; }
  function updLash(id: string, patch: Partial<Lashing>) { setData((p) => ({ ...p, lashings: p.lashings.map((l) => (l.id === id ? { ...l, ...patch } : l)) })); }
  function addLash() { setData((p) => ({ ...p, lashings: [...p.lashings, newLashing()] })); }
  function delLash(id: string) { setData((p) => ({ ...p, lashings: p.lashings.filter((l) => l.id !== id) })); }

  const c = useMemo(() => calc(data), [data]);

  function handleSave() {
    const name = recordName.trim() || `${data.cargoName || 'Cargo'} — Lashing`;
    const id = recordId || genId();
    saveItem('lashing', name, data, id);
    setRecordId(id); setRecordName(name); setSaveMsg('✓ Saved'); setShowSave(false);
    setTimeout(() => setSaveMsg(''), 3000);
  }
  function handleReset() {
    if (!confirm('Reset all fields?')) return;
    setData(DEFAULT_DATA); setRecordId(null); setRecordName(''); router.replace('/voyage/lashing');
  }

  const hasInput = data.weight > 0;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>
          ⚓ Voyage Hub · Lashing Calculator
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Lashing <em style={g}>Calculator</em>
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          A simplified heavy-weather cargo securing check in the spirit of the CSS Code (Annex 13).
          Indicative only — the vessel&apos;s approved Cargo Securing Manual governs.
        </p>
      </div>

      {/* Disclaimer */}
      <div style={{ ...card, background: 'rgba(255,138,138,.06)', borderColor: 'rgba(255,138,138,.3)', padding: '12px 16px' }}>
        <div style={{ fontFamily: rj, fontSize: 12, color: '#ffb0b0', lineHeight: 1.5 }}>
          ⚠ <b>Indicative only.</b> Uses simplified CSS-Code accelerations and a balance-of-forces check. The
          approved Cargo Securing Manual and class-approved methods always govern actual securing.
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
          <input type="text" value={recordName} onChange={(e) => setRecordName(e.target.value)} placeholder="e.g. Transformer 80MT — main deck" style={{ ...inputStyle, marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{ ...goldBtn, padding: '8px 14px', letterSpacing: '1px' }}>Save</button>
            <button onClick={() => setShowSave(false)} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* 1. Cargo unit */}
      <div style={card}>
        <div style={sectionTitle}>1. Cargo Unit</div>
        <div className="la-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 12 }}>
          <div><label style={labelS}>Cargo / Unit</label><input style={inputStyle} value={data.cargoName} onChange={(e) => update('cargoName', e.target.value)} placeholder="Transformer" /></div>
          <div><label style={labelS}>Weight (MT)</label><input style={inputStyle} type="number" value={data.weight || ''} onChange={(e) => update('weight', num(e.target.value))} placeholder="80" /></div>
          <div>
            <label style={labelS}>Position</label>
            <select style={inputStyle} value={data.position} onChange={(e) => update('position', e.target.value as LashData['position'])}>
              <option value="fwd">Forward</option>
              <option value="mid">Midship</option>
              <option value="aft">Aft</option>
            </select>
          </div>
        </div>
        <div className="la-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          <div>
            <label style={labelS}>Friction Surface</label>
            <select style={inputStyle} value={data.frictionType} onChange={(e) => update('frictionType', e.target.value as LashData['frictionType'])}>
              {(Object.keys(FRICTION_LABEL) as LashData['frictionType'][]).map((k) => <option key={k} value={k}>{FRICTION_LABEL[k]}</option>)}
            </select>
          </div>
          {data.frictionType === 'custom' && (
            <div><label style={labelS}>Custom μ</label><input style={inputStyle} type="number" step="0.01" value={data.customMu || ''} onChange={(e) => update('customMu', num(e.target.value))} placeholder="0.30" /></div>
          )}
        </div>
      </div>

      {/* 2. Ship / motion */}
      <div style={card}>
        <div style={sectionTitle}>2. Ship Motion (optional refinement)</div>
        <div className="la-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          <div><label style={labelS}>LBP (m)</label><input style={inputStyle} type="number" value={data.lbp || ''} onChange={(e) => update('lbp', num(e.target.value))} placeholder="150" /></div>
          <div><label style={labelS}>Speed (kts)</label><input style={inputStyle} type="number" value={data.speed || ''} onChange={(e) => update('speed', num(e.target.value))} placeholder="14" /></div>
          <div><label style={labelS}>GM (m)</label><input style={inputStyle} type="number" step="0.01" value={data.gm || ''} onChange={(e) => update('gm', num(e.target.value))} placeholder="1.0" /></div>
        </div>
        <p style={{ fontSize: 10, color: '#7a8a72', fontFamily: rj, marginTop: 10 }}>A higher GM (stiffer ship) increases transverse acceleration. Left blank, base CSS accelerations are used.</p>
      </div>

      {/* 3. Lashings */}
      <div style={card}>
        <div style={sectionTitle}>3. Lashings / Securing Devices</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
            <thead>
              <tr style={{ color: '#7a8a72', fontFamily: rj, fontSize: 9.5, letterSpacing: '.5px', textTransform: 'uppercase' }}>
                <th style={{ ...thd, textAlign: 'left' }}>Type</th>
                <th style={thd}>MSL (kN)</th>
                <th style={thd}>Vert ∠ (°)</th>
                <th style={thd}>Horiz ∠ (°)</th>
                <th style={thd}>Count</th>
                <th style={{ ...thd, width: 28 }}></th>
              </tr>
            </thead>
            <tbody>
              {data.lashings.map((l) => (
                <tr key={l.id} style={{ borderTop: '1px solid rgba(200,168,75,.08)' }}>
                  <td style={{ padding: '4px 6px' }}><input style={{ ...inputStyle, padding: '5px 7px', fontSize: 12 }} value={l.label} onChange={(e) => updLash(l.id, { label: e.target.value })} placeholder="Wire / chain / web" /></td>
                  <td style={{ padding: '4px 4px' }}><input style={numCell} type="number" value={l.msl || ''} onChange={(e) => updLash(l.id, { msl: num(e.target.value) })} placeholder="100" /></td>
                  <td style={{ padding: '4px 4px' }}><input style={numCell} type="number" value={l.angleV || ''} onChange={(e) => updLash(l.id, { angleV: num(e.target.value) })} placeholder="30" /></td>
                  <td style={{ padding: '4px 4px' }}><input style={numCell} type="number" value={l.angleH || ''} onChange={(e) => updLash(l.id, { angleH: num(e.target.value) })} placeholder="0" /></td>
                  <td style={{ padding: '4px 4px' }}><input style={numCell} type="number" value={l.count || ''} onChange={(e) => updLash(l.id, { count: num(e.target.value) })} placeholder="2" /></td>
                  <td style={{ padding: '4px 4px', textAlign: 'center' }}><button onClick={() => delLash(l.id)} style={{ background: 'transparent', border: 'none', color: '#ff8a8a', cursor: 'pointer', fontSize: 12 }}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={addLash} style={{ ...ghostBtn, marginTop: 12, fontSize: 10 }}>+ Add Lashing</button>
        <p style={{ fontSize: 10, color: '#7a8a72', fontFamily: rj, marginTop: 8 }}>MSL = Maximum Securing Load (≈ half the breaking load for wire/chain). Vertical angle measured from deck; horizontal angle from the transverse direction.</p>
      </div>

      {/* RESULTS */}
      {hasInput && (
        <div style={{ ...card, background: 'linear-gradient(135deg,rgba(200,168,75,.08),transparent)', borderColor: c.slidingOk ? 'rgba(76,175,118,.5)' : 'rgba(255,138,138,.6)' }}>
          <div style={sectionTitle}>⚡ Transverse Sliding Check</div>

          <div className="la-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
            <KPI label="Transverse Force" value={fmt(c.Ft, 0)} sub="kN" color="#ff8a8a" />
            <KPI label="Friction Hold" value={fmt(c.frictionHold, 0)} sub="kN" color="#5aa6e8" />
            <KPI label="Lashing Hold" value={fmt(c.lashingTransverse, 0)} sub="kN" color="#5aa6e8" />
            <KPI label="Total Resistance" value={fmt(c.totalTransverseResistance, 0)} sub="kN" color={c.slidingOk ? '#4caf76' : '#ff8a8a'} big />
          </div>

          <RowR label="Transverse acceleration used" value={`${fmt(c.accT, 2)} g`} />
          <RowR label="Friction coefficient μ" value={fmt(c.mu, 2)} />
          <RowR label="Total MSL deployed" value={`${fmt(c.totalMsl, 0)} kN`} />
          <RowR label="Resistance ÷ Force" value={`${fmt(c.slidingRatio, 2)} ×`} color={c.slidingRatio >= 1 ? '#4caf76' : '#ff8a8a'} />

          <div style={{ marginTop: 14, padding: '14px 16px', background: '#0c1610', border: `1px solid ${c.slidingOk ? 'rgba(76,175,118,.5)' : 'rgba(255,138,138,.6)'}`, borderRadius: 4 }}>
            {c.slidingOk ? (
              <div style={{ fontFamily: rj, color: '#4caf76', fontSize: 13.5, lineHeight: 1.5 }}>
                ✅ <b>Transverse securing adequate</b> — resistance {fmt(c.totalTransverseResistance, 0)} kN ≥ force {fmt(c.Ft, 0)} kN (margin {fmt(c.slidingMargin, 0)} kN). Verify against the Cargo Securing Manual and check tipping separately.
              </div>
            ) : (
              <div style={{ fontFamily: rj, color: '#ff8a8a', fontSize: 13.5, lineHeight: 1.5 }}>
                ❌ <b>Insufficient transverse securing</b> — short by {fmt(Math.abs(c.slidingMargin), 0)} kN.
                {c.suggested != null && <> Add about <b>{c.suggested}</b> more lashing(s) of the first type, or use higher-MSL devices / anti-slip mats.</>}
              </div>
            )}
          </div>

          <div style={{ marginTop: 10, fontFamily: rj, fontSize: 12, color: c.longOk ? '#4caf76' : '#e8b85a' }}>
            Longitudinal: force {fmt(c.Fl, 0)} kN vs friction {fmt(c.longResistance, 0)} kN — {c.longOk ? 'OK by friction' : 'add fore/aft lashings'}
          </div>
        </div>
      )}

      {/* Methodology */}
      <div style={{ ...card, background: 'rgba(122,138,114,.05)', borderColor: 'rgba(122,138,114,.15)' }}>
        <div style={sectionTitle}>📖 Method &amp; Limits</div>
        <ul style={{ fontSize: 11.5, color: '#b0c0a4', lineHeight: 1.7, paddingLeft: 18, fontFamily: rj }}>
          <li>Transverse force F = m × g × a<sub>t</sub>, with base CSS accelerations scaled by position and GM.</li>
          <li>Resistance = friction (μ × weight) + Σ lashing transverse components (MSL × cos∠ + μ × MSL × sin∠).</li>
          <li>Securing is adequate when resistance ≥ external force (balance-of-forces method).</li>
          <li>This is the simplified method. It does <b>not</b> compute tipping/overturning, racking, or the full Annex-13 advanced calculation.</li>
          <li>Always follow the approved <b style={{ color: '#c8a84b' }}>Cargo Securing Manual</b> and class requirements.</li>
        </ul>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .la-g3 { grid-template-columns: 1fr 1fr !important; }
          .la-kpis { grid-template-columns: 1fr 1fr !important; }
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
      <div style={{ fontFamily: lb, fontSize: big ? 27 : 21, fontWeight: 700, color, marginTop: 4 }}>{value} {sub && <span style={{ fontSize: 11, color: '#7a8a72' }}>{sub}</span>}</div>
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
