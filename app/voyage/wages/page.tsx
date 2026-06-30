'use client';
import { useState, useEffect, useMemo } from 'react';
import { saveItem, loadItem, genId } from '@/lib/voyage-storage';

const lb = "'Libre Bodoni', serif";
const rj = "'Rajdhani', sans-serif";
const g = { color: '#c8a84b', fontStyle: 'italic' } as React.CSSProperties;

// ============================================================
// TYPES
// ============================================================
interface CrewWage {
  id: string;
  name: string;
  rank: string;
  basicWage: number;       // monthly basic
  guaranteedOtHours: number;
  otRate: number;          // per hour
  extraOtHours: number;    // worked above guaranteed
  leavePay: number;        // monthly
  subsistence: number;     // monthly allowance
  seniority: number;       // monthly bonus
  contractMonths: number;
}

interface WageData {
  vesselName: string;
  currency: string;
  crew: CrewWage[];
}

// Indicative reference basic-wage anchors (USD/month) — ILO/ITF-style
// ballpark figures for ORIENTATION ONLY. Real CBA/ITF tables govern.
const REF_RANKS: { rank: string; basic: number }[] = [
  { rank: 'Master', basic: 4500 },
  { rank: 'Chief Officer', basic: 3200 },
  { rank: '2nd Officer', basic: 2200 },
  { rank: '3rd Officer', basic: 1900 },
  { rank: 'Chief Engineer', basic: 4300 },
  { rank: '2nd Engineer', basic: 3100 },
  { rank: '3rd Engineer', basic: 2100 },
  { rank: '4th Engineer', basic: 1800 },
  { rank: 'ETO', basic: 2200 },
  { rank: 'Bosun', basic: 1500 },
  { rank: 'AB (Able Seaman)', basic: 1200 },
  { rank: 'OS (Ordinary Seaman)', basic: 1000 },
  { rank: 'Oiler / Motorman', basic: 1200 },
  { rank: 'Wiper', basic: 1000 },
  { rank: 'Cook', basic: 1400 },
  { rank: 'Messman', basic: 950 },
];

function newCrew(): CrewWage {
  return { id: genId(), name: '', rank: '', basicWage: 0, guaranteedOtHours: 103, otRate: 0, extraOtHours: 0, leavePay: 0, subsistence: 0, seniority: 0, contractMonths: 6 };
}

const DEFAULT_DATA: WageData = { vesselName: '', currency: 'USD', crew: [newCrew()] };

// ============================================================
// CALC
// ============================================================
function crewMonthly(c: CrewWage) {
  const guaranteedOt = c.guaranteedOtHours * c.otRate;
  const extraOt = c.extraOtHours * c.otRate;
  const monthly = c.basicWage + guaranteedOt + extraOt + c.leavePay + c.subsistence + c.seniority;
  return { guaranteedOt, extraOt, monthly, contract: monthly * c.contractMonths };
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
const ghostBtn: React.CSSProperties = { background: 'transparent', color: '#c8a84b', border: '1px solid rgba(200,168,75,.4)', padding: '8px 14px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };
const goldBtn: React.CSSProperties = { background: '#c8a84b', color: '#08100a', border: 'none', padding: '8px 16px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };

const STORAGE_KEY = 'wages';
const SINGLETON_ID = 'wagecalc';

// ============================================================
// COMPONENT
// ============================================================
export default function WagesPage() {
  const [data, setData] = useState<WageData>(DEFAULT_DATA);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    try {
      const saved = loadItem<WageData>(STORAGE_KEY, SINGLETON_ID);
      if (saved && saved.data && Array.isArray(saved.data.crew) && saved.data.crew.length) setData({ ...DEFAULT_DATA, ...saved.data });
    } catch { /* ignore */ }
  }, []);

  function persist(next: WageData) {
    setData(next);
    try { saveItem(STORAGE_KEY, 'Wage Calculator', next, SINGLETON_ID); setSaveMsg('✓ Saved'); setTimeout(() => setSaveMsg(''), 2000); } catch { /* ignore */ }
  }
  function update<K extends keyof WageData>(key: K, value: WageData[K]) { persist({ ...data, [key]: value }); }
  function num(v: string): number { return parseFloat(v) || 0; }
  function updCrew(id: string, patch: Partial<CrewWage>) { persist({ ...data, crew: data.crew.map((c) => (c.id === id ? { ...c, ...patch } : c)) }); }
  function addCrew() { persist({ ...data, crew: [...data.crew, newCrew()] }); }
  function delCrew(id: string) { if (data.crew.length <= 1) return; persist({ ...data, crew: data.crew.filter((c) => c.id !== id) }); }

  function applyRef(id: string, rank: string) {
    const ref = REF_RANKS.find((r) => r.rank === rank);
    updCrew(id, { rank, basicWage: ref ? ref.basic : 0 });
  }

  const totals = useMemo(() => {
    let monthly = 0, contract = 0;
    data.crew.forEach((c) => { const m = crewMonthly(c); monthly += m.monthly; contract += m.contract; });
    return { monthly, contract, count: data.crew.length };
  }, [data.crew]);

  const cur = data.currency || 'USD';

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>
          ⚓ Voyage Hub · Wage Calculator
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Wage <em style={g}>Calculator</em>
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          Build a crew wage bill — basic, guaranteed and extra overtime, leave and allowances, per month
          and per contract. Reference figures are indicative; your CBA / ITF table governs actual wages.
        </p>
      </div>

      {/* Disclaimer */}
      <div style={{ ...card, background: 'rgba(232,184,90,.06)', borderColor: 'rgba(232,184,90,.3)', padding: '12px 16px' }}>
        <div style={{ fontFamily: rj, fontSize: 12, color: '#e8c87a', lineHeight: 1.5 }}>
          ⚠ <b>Reference figures are indicative ballpark values for orientation only.</b> Always use the applicable
          collective bargaining agreement (CBA), ITF/IBF rate table or the seafarer&apos;s employment agreement.
        </div>
      </div>

      {/* Vessel + currency */}
      <div style={card}>
        <div className="wg-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          <div><label style={labelS}>Vessel</label><input style={inputStyle} value={data.vesselName} onChange={(e) => update('vesselName', e.target.value)} placeholder="MV NEURONAI" /></div>
          <div>
            <label style={labelS}>Currency</label>
            <select style={inputStyle} value={data.currency} onChange={(e) => update('currency', e.target.value)}>
              {['USD', 'EUR', 'GBP', 'PHP', 'INR'].map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="action-bar" style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={addCrew} style={goldBtn}>+ Add Crew</button>
        <button onClick={() => window.print()} style={ghostBtn}>🖨️ Print / PDF</button>
        {saveMsg && <span style={{ color: '#4caf76', fontFamily: rj, fontSize: 12, fontWeight: 600 }}>{saveMsg}</span>}
      </div>

      {/* Totals */}
      <div style={{ ...card, background: 'linear-gradient(135deg,rgba(200,168,75,.08),transparent)', borderColor: 'rgba(200,168,75,.4)' }}>
        <div className="wg-totals" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          <KPI label="Crew" value={String(totals.count)} color="#f5f0e8" />
          <KPI label="Monthly Wage Bill" value={`${cur} ${fmt(totals.monthly, 0)}`} color="#c8a84b" big />
          <KPI label="Total Contract Cost" value={`${cur} ${fmt(totals.contract, 0)}`} color="#4caf76" big />
        </div>
      </div>

      {/* Crew cards */}
      {data.crew.map((c, i) => {
        const m = crewMonthly(c);
        return (
          <div key={c.id} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontFamily: lb, fontSize: 15, fontWeight: 700, color: '#c8a84b' }}>{c.name || c.rank || `Crew ${i + 1}`}</div>
              {data.crew.length > 1 && <button onClick={() => delCrew(c.id)} style={{ background: 'transparent', border: 'none', color: '#ff8a8a', fontFamily: rj, fontSize: 11, cursor: 'pointer' }}>Remove</button>}
            </div>

            <div className="wg-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 10 }}>
              <div><label style={labelS}>Name</label><input style={inputStyle} value={c.name} onChange={(e) => updCrew(c.id, { name: e.target.value })} placeholder="J. Cruz" /></div>
              <div>
                <label style={labelS}>Rank</label>
                <input style={inputStyle} list="rank-list" value={c.rank} onChange={(e) => applyRef(c.id, e.target.value)} placeholder="AB (Able Seaman)" />
                <datalist id="rank-list">{REF_RANKS.map((r) => <option key={r.rank} value={r.rank} />)}</datalist>
              </div>
              <div><label style={labelS}>Contract (months)</label><input style={inputStyle} type="number" value={c.contractMonths || ''} onChange={(e) => updCrew(c.id, { contractMonths: num(e.target.value) })} placeholder="6" /></div>
            </div>

            <div className="wg-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 10 }}>
              <div><label style={labelS}>Basic ({cur}/mo)</label><input style={inputStyle} type="number" value={c.basicWage || ''} onChange={(e) => updCrew(c.id, { basicWage: num(e.target.value) })} placeholder="1200" /></div>
              <div><label style={labelS}>OT Rate ({cur}/h)</label><input style={inputStyle} type="number" step="0.01" value={c.otRate || ''} onChange={(e) => updCrew(c.id, { otRate: num(e.target.value) })} placeholder="7.50" /></div>
              <div><label style={labelS}>Guar. OT (h/mo)</label><input style={inputStyle} type="number" value={c.guaranteedOtHours || ''} onChange={(e) => updCrew(c.id, { guaranteedOtHours: num(e.target.value) })} placeholder="103" /></div>
              <div><label style={labelS}>Extra OT (h/mo)</label><input style={inputStyle} type="number" value={c.extraOtHours || ''} onChange={(e) => updCrew(c.id, { extraOtHours: num(e.target.value) })} placeholder="0" /></div>
            </div>

            <div className="wg-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 12 }}>
              <div><label style={labelS}>Leave Pay ({cur}/mo)</label><input style={inputStyle} type="number" value={c.leavePay || ''} onChange={(e) => updCrew(c.id, { leavePay: num(e.target.value) })} placeholder="0" /></div>
              <div><label style={labelS}>Subsistence ({cur}/mo)</label><input style={inputStyle} type="number" value={c.subsistence || ''} onChange={(e) => updCrew(c.id, { subsistence: num(e.target.value) })} placeholder="0" /></div>
              <div><label style={labelS}>Seniority ({cur}/mo)</label><input style={inputStyle} type="number" value={c.seniority || ''} onChange={(e) => updCrew(c.id, { seniority: num(e.target.value) })} placeholder="0" /></div>
            </div>

            {/* breakdown */}
            <div style={{ background: '#0c1610', border: '1px solid rgba(200,168,75,.15)', borderRadius: 3, padding: '10px 12px' }}>
              <Line label="Basic" value={`${cur} ${fmt(c.basicWage)}`} />
              <Line label={`Guaranteed OT (${c.guaranteedOtHours}h)`} value={`${cur} ${fmt(m.guaranteedOt)}`} />
              {c.extraOtHours > 0 && <Line label={`Extra OT (${c.extraOtHours}h)`} value={`${cur} ${fmt(m.extraOt)}`} />}
              {c.leavePay > 0 && <Line label="Leave pay" value={`${cur} ${fmt(c.leavePay)}`} />}
              {c.subsistence > 0 && <Line label="Subsistence" value={`${cur} ${fmt(c.subsistence)}`} />}
              {c.seniority > 0 && <Line label="Seniority" value={`${cur} ${fmt(c.seniority)}`} />}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, marginTop: 4, borderTop: '1px solid rgba(200,168,75,.3)', fontFamily: rj }}>
                <span style={{ color: '#c8a84b', fontWeight: 700, fontSize: 13 }}>Monthly</span>
                <span style={{ color: '#c8a84b', fontWeight: 700, fontSize: 15, fontFamily: lb }}>{cur} {fmt(m.monthly)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontFamily: rj, fontSize: 11.5 }}>
                <span style={{ color: '#7a8a72' }}>Full contract ({c.contractMonths} mo)</span>
                <span style={{ color: '#4caf76', fontWeight: 700 }}>{cur} {fmt(m.contract)}</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Reference */}
      <div style={{ ...card, background: 'rgba(122,138,114,.05)', borderColor: 'rgba(122,138,114,.15)' }}>
        <div style={sectionTitle}>📖 Notes</div>
        <ul style={{ fontSize: 11.5, color: '#b0c0a4', lineHeight: 1.7, paddingLeft: 18, fontFamily: rj }}>
          <li>Monthly = basic + guaranteed OT + extra OT + leave pay + subsistence + seniority.</li>
          <li>Guaranteed overtime is a fixed monthly amount (commonly ~103 h) regardless of hours worked; extra OT is paid on top for hours above the guarantee.</li>
          <li>Picking a rank fills an indicative basic wage — overwrite it with the real CBA/ITF figure.</li>
          <li>This tool does not compute social contributions, taxes, or allotments. The seafarer&apos;s employment agreement and CBA govern.</li>
        </ul>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .wg-g3 { grid-template-columns: 1fr 1fr !important; }
          .wg-totals { grid-template-columns: 1fr !important; }
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

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontFamily: rj, fontSize: 12 }}>
      <span style={{ color: '#7a8a72' }}>{label}</span>
      <span style={{ color: '#f5f0e8' }}>{value}</span>
    </div>
  );
}
function KPI({ label: l, value, color, big }: { label: string; value: string; color: string; big?: boolean }) {
  return (
    <div style={{ background: '#0c1610', border: '1px solid rgba(200,168,75,.2)', borderRadius: 4, padding: '12px 10px', textAlign: 'center' }}>
      <div style={{ fontFamily: rj, fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: '#7a8a72', fontWeight: 700 }}>{l}</div>
      <div style={{ fontFamily: lb, fontSize: big ? 20 : 24, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
    </div>
  );
}
