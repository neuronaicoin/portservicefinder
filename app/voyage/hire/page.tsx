'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { saveItem, loadItem, genId } from '@/lib/voyage-storage';

const lb = "'Libre Bodoni', serif";
const rj = "'Rajdhani', sans-serif";
const g = { color: '#c8a84b', fontStyle: 'italic' } as React.CSSProperties;

interface OffHire {
  id: string;
  reason: string;
  from: string;
  to: string;
}

interface OtherItem {
  id: string;
  label: string;
  amount: number;
  dir: 'add' | 'deduct';
}

interface HireData {
  vesselName: string;
  imo: string;
  owner: string;
  charterer: string;
  cpDate: string;
  voyageNo: string;
  statementNo: string;
  delivery: string;
  redelivery: string;
  hireRate: number;
  cveMonthly: number;
  addressCommPct: number;
  brokeragePct: number;
  delVlsfoQty: number;
  delVlsfoPrice: number;
  delMgoQty: number;
  delMgoPrice: number;
  redVlsfoQty: number;
  redVlsfoPrice: number;
  redMgoQty: number;
  redMgoPrice: number;
  offHires: OffHire[];
  others: OtherItem[];
  paid: number;
  notes: string;
}

const DEFAULT_DATA: HireData = {
  vesselName: '',
  imo: '',
  owner: '',
  charterer: '',
  cpDate: '',
  voyageNo: '',
  statementNo: '1',
  delivery: '',
  redelivery: '',
  hireRate: 0,
  cveMonthly: 1500,
  addressCommPct: 3.75,
  brokeragePct: 1.25,
  delVlsfoQty: 0,
  delVlsfoPrice: 0,
  delMgoQty: 0,
  delMgoPrice: 0,
  redVlsfoQty: 0,
  redVlsfoPrice: 0,
  redMgoQty: 0,
  redMgoPrice: 0,
  offHires: [],
  others: [],
  paid: 0,
  notes: '',
};

function hoursBetween(a: string, b: string): number {
  if (!a || !b) return 0;
  const t1 = new Date(a).getTime();
  const t2 = new Date(b).getTime();
  if (isNaN(t1) || isNaN(t2)) return 0;
  return (t2 - t1) / 3600000;
}

function calculate(d: HireData) {
  const grossHours = hoursBetween(d.delivery, d.redelivery);
  const offHireHours = d.offHires.reduce((s, o) => s + Math.max(0, hoursBetween(o.from, o.to)), 0);
  const onHireHours = Math.max(0, grossHours - offHireHours);

  const grossDays = grossHours / 24;
  const offHireDays = offHireHours / 24;
  const onHireDays = onHireHours / 24;

  const hireNet = onHireDays * d.hireRate;
  const offHireDeduction = offHireDays * d.hireRate;

  const cve = (d.cveMonthly / 30) * onHireDays;

  const commBase = hireNet + cve;
  const addrComm = commBase * (d.addressCommPct / 100);
  const brokerage = commBase * (d.brokeragePct / 100);
  const totalComm = addrComm + brokerage;

  const bunkerDelivery = d.delVlsfoQty * d.delVlsfoPrice + d.delMgoQty * d.delMgoPrice;
  const bunkerRedelivery = d.redVlsfoQty * d.redVlsfoPrice + d.redMgoQty * d.redMgoPrice;

  const otherAdj = d.others.reduce((s, o) => s + o.amount * (o.dir === 'add' ? 1 : -1), 0);

  const totalDue = hireNet + bunkerDelivery - cve - totalComm - bunkerRedelivery + otherAdj;
  const balance = totalDue - d.paid;

  return {
    grossDays,
    offHireDays,
    onHireDays,
    hireNet,
    offHireDeduction,
    cve,
    addrComm,
    brokerage,
    totalComm,
    bunkerDelivery,
    bunkerRedelivery,
    otherAdj,
    totalDue,
    balance,
  };
}

function fmt(n: number, dec = 2): string {
  if (!isFinite(n)) return '–';
  return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function money(n: number): string {
  return (n < 0 ? '-$' : '$') + fmt(Math.abs(n), 2);
}

const card: React.CSSProperties = {
  background: '#111c13',
  border: '1px solid rgba(200,168,75,.18)',
  padding: '20px 18px',
  borderRadius: 4,
  marginBottom: 16,
};
const sectionTitle: React.CSSProperties = {
  fontFamily: rj,
  fontSize: 11,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: '#c8a84b',
  fontWeight: 700,
  marginBottom: 14,
  paddingBottom: 8,
  borderBottom: '1px solid rgba(200,168,75,.12)',
};
const label: React.CSSProperties = {
  display: 'block',
  fontFamily: rj,
  fontSize: 10,
  letterSpacing: '.5px',
  textTransform: 'uppercase',
  color: '#7a8a72',
  fontWeight: 600,
  marginBottom: 4,
};
const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0c1610',
  border: '1px solid rgba(200,168,75,.2)',
  color: '#f5f0e8',
  padding: '7px 9px',
  fontFamily: rj,
  fontSize: 12.5,
  fontWeight: 500,
  borderRadius: 3,
  boxSizing: 'border-box',
};
const ghostBtn: React.CSSProperties = {
  background: 'transparent',
  color: '#c8a84b',
  border: '1px solid rgba(200,168,75,.4)',
  padding: '8px 14px',
  fontFamily: rj,
  fontSize: 11,
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  fontWeight: 700,
  cursor: 'pointer',
  borderRadius: 4,
};
const goldBtn: React.CSSProperties = {
  background: '#c8a84b',
  color: '#08100a',
  border: 'none',
  padding: '8px 16px',
  fontFamily: rj,
  fontSize: 11,
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  fontWeight: 700,
  cursor: 'pointer',
  borderRadius: 4,
};
const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 0',
  borderBottom: '1px dashed rgba(200,168,75,.1)',
  fontFamily: rj,
  fontSize: 13,
};

export default function HireStatementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingId = searchParams.get('id');

  const [data, setData] = useState<HireData>(DEFAULT_DATA);
  const [recordId, setRecordId] = useState<string | null>(existingId);
  const [recordName, setRecordName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (existingId) {
      const saved = loadItem<HireData>('hire', existingId);
      if (saved) {
        setData(saved.data);
        setRecordName(saved.name);
      }
    }
  }, [existingId]);

  const calc = useMemo(() => calculate(data), [data]);

  function update<K extends keyof HireData>(key: K, value: HireData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }
  function num(v: string): number {
    return parseFloat(v) || 0;
  }

  function addOffHire() {
    setData((p) => ({ ...p, offHires: [...p.offHires, { id: genId(), reason: '', from: '', to: '' }] }));
  }
  function updOffHire(id: string, key: keyof OffHire, value: string) {
    setData((p) => ({ ...p, offHires: p.offHires.map((o) => (o.id === id ? { ...o, [key]: value } : o)) }));
  }
  function delOffHire(id: string) {
    setData((p) => ({ ...p, offHires: p.offHires.filter((o) => o.id !== id) }));
  }

  function addOther() {
    setData((p) => ({ ...p, others: [...p.others, { id: genId(), label: '', amount: 0, dir: 'deduct' }] }));
  }
  function updOther<K extends keyof OtherItem>(id: string, key: K, value: OtherItem[K]) {
    setData((p) => ({ ...p, others: p.others.map((o) => (o.id === id ? { ...o, [key]: value } : o)) }));
  }
  function delOther(id: string) {
    setData((p) => ({ ...p, others: p.others.filter((o) => o.id !== id) }));
  }

  function handleSave() {
    const name = recordName.trim() || `${data.vesselName || 'Vessel'} — Hire #${data.statementNo || '1'}`;
    const id = recordId || genId();
    saveItem('hire', name, data, id);
    setRecordId(id);
    setRecordName(name);
    setSaveMsg('✓ Saved');
    setShowSave(false);
    setTimeout(() => setSaveMsg(''), 3000);
  }

  function handleReset() {
    if (!confirm('Reset all fields?')) return;
    setData(DEFAULT_DATA);
    setRecordId(null);
    setRecordName('');
    router.replace('/voyage/hire');
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>
          ⚓ Voyage Hub · Hire Statement
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Hire <em style={g}>Statement</em>
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          Time charter hire calculation — on-hire / off-hire periods, bunkers on delivery and
          redelivery, CVE, commissions, and balance due. Always reconcile against the charter party.
        </p>
      </div>

      <div className="action-bar" style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => setShowSave(true)} style={goldBtn}>💾 Save</button>
        <button onClick={handlePrint} style={ghostBtn}>🖨️ Print / PDF</button>
        <button onClick={handleReset} style={{ ...ghostBtn, color: '#ff8a8a', borderColor: 'rgba(255,138,138,.3)' }}>🗑️ Reset</button>
        {saveMsg && <span style={{ color: '#4caf76', fontFamily: rj, fontSize: 12, fontWeight: 600 }}>{saveMsg}</span>}
        {recordName && <span style={{ color: '#7a8a72', fontFamily: rj, fontSize: 11, marginLeft: 'auto' }}>📂 {recordName}</span>}
      </div>

      {showSave && (
        <div style={{ ...card, background: 'rgba(200,168,75,.05)', borderColor: 'rgba(200,168,75,.4)' }}>
          <label style={label}>Name</label>
          <input type="text" value={recordName} onChange={(e) => setRecordName(e.target.value)} placeholder="e.g. MV NEURONAI — Q1 Hire Statement" style={{ ...inputStyle, marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{ ...goldBtn, padding: '8px 14px', letterSpacing: '1px' }}>Save</button>
            <button onClick={() => setShowSave(false)} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      <div style={card}>
        <div style={sectionTitle}>1. Vessel &amp; Charter</div>
        <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          <div>
            <label style={label}>Vessel Name</label>
            <input style={inputStyle} type="text" value={data.vesselName} onChange={(e) => update('vesselName', e.target.value)} placeholder="MV NEURONAI" />
          </div>
          <div>
            <label style={label}>IMO</label>
            <input style={inputStyle} type="text" value={data.imo} onChange={(e) => update('imo', e.target.value)} placeholder="9876543" />
          </div>
          <div>
            <label style={label}>CP Date</label>
            <input style={inputStyle} type="date" value={data.cpDate} onChange={(e) => update('cpDate', e.target.value)} />
          </div>
        </div>
        <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginTop: 12 }}>
          <div>
            <label style={label}>Owner / Disponent Owner</label>
            <input style={inputStyle} type="text" value={data.owner} onChange={(e) => update('owner', e.target.value)} placeholder="ABC Shipping Ltd" />
          </div>
          <div>
            <label style={label}>Charterer</label>
            <input style={inputStyle} type="text" value={data.charterer} onChange={(e) => update('charterer', e.target.value)} placeholder="XYZ Chartering" />
          </div>
        </div>
        <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginTop: 12 }}>
          <div>
            <label style={label}>Voyage No.</label>
            <input style={inputStyle} type="text" value={data.voyageNo} onChange={(e) => update('voyageNo', e.target.value)} placeholder="V-01" />
          </div>
          <div>
            <label style={label}>Statement No.</label>
            <input style={inputStyle} type="text" value={data.statementNo} onChange={(e) => update('statementNo', e.target.value)} placeholder="1" />
          </div>
        </div>
      </div>

      <div style={card}>
        <div style={sectionTitle}>2. Hire Period</div>
        <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          <div>
            <label style={label}>Delivery (On-Hire)</label>
            <input style={inputStyle} type="datetime-local" value={data.delivery} onChange={(e) => update('delivery', e.target.value)} />
          </div>
          <div>
            <label style={label}>Redelivery (Off-Hire)</label>
            <input style={inputStyle} type="datetime-local" value={data.redelivery} onChange={(e) => update('redelivery', e.target.value)} />
          </div>
        </div>
        <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(1,1fr)', gap: 12, marginTop: 12 }}>
          <div>
            <label style={label}>Hire Rate — USD / day</label>
            <input style={inputStyle} type="number" step="0.01" value={data.hireRate || ''} onChange={(e) => update('hireRate', num(e.target.value))} placeholder="15000" />
          </div>
        </div>
        <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(200,168,75,.05)', border: '1px solid rgba(200,168,75,.15)', borderRadius: 3, fontSize: 12, fontFamily: rj, color: '#b0c0a4' }}>
          Gross period: <strong style={{ color: '#f5f0e8' }}>{fmt(calc.grossDays, 4)} days</strong>
          {calc.offHireDays > 0 && (
            <>
              {' · '}Off-hire: <strong style={{ color: '#ff8a8a' }}>{fmt(calc.offHireDays, 4)} d</strong>
              {' · '}On-hire: <strong style={{ color: '#4caf76' }}>{fmt(calc.onHireDays, 4)} d</strong>
            </>
          )}
        </div>
      </div>

      <div style={card}>
        <div style={sectionTitle}>3. Off-Hire Periods</div>
        {data.offHires.length === 0 && (
          <p style={{ fontSize: 11.5, color: '#7a8a72', fontFamily: rj, marginBottom: 12, lineHeight: 1.5 }}>
            No off-hire. Add periods (breakdown, deviation, detention) to deduct from hire.
          </p>
        )}
        {data.offHires.map((o, i) => {
          const h = Math.max(0, hoursBetween(o.from, o.to));
          return (
            <div key={o.id} style={{ background: '#0c1610', border: '1px solid rgba(200,168,75,.15)', padding: 12, borderRadius: 3, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontFamily: rj, fontSize: 11, color: '#ff8a8a', fontWeight: 700, letterSpacing: '.5px' }}>
                  Off-Hire #{i + 1} — {fmt(h / 24, 3)} d ({fmt(h, 1)} h)
                </span>
                <button onClick={() => delOffHire(o.id)} style={{ background: 'transparent', border: 'none', color: '#ff8a8a', fontFamily: rj, fontSize: 11, cursor: 'pointer', letterSpacing: '.5px' }}>Delete</button>
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={label}>Reason</label>
                <input style={inputStyle} type="text" value={o.reason} onChange={(e) => updOffHire(o.id, 'reason', e.target.value)} placeholder="ME breakdown / deviation" />
              </div>
              <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
                <div>
                  <label style={label}>From</label>
                  <input style={inputStyle} type="datetime-local" value={o.from} onChange={(e) => updOffHire(o.id, 'from', e.target.value)} />
                </div>
                <div>
                  <label style={label}>To</label>
                  <input style={inputStyle} type="datetime-local" value={o.to} onChange={(e) => updOffHire(o.id, 'to', e.target.value)} />
                </div>
              </div>
            </div>
          );
        })}
        <button onClick={addOffHire} style={{ ...ghostBtn, width: '100%' }}>+ Add Off-Hire Period</button>
      </div>

      <div style={card}>
        <div style={sectionTitle}>4. Bunkers on Delivery (Charterer pays Owner)</div>
        <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          <div>
            <label style={label}>VLSFO Qty — MT</label>
            <input style={inputStyle} type="number" step="0.1" value={data.delVlsfoQty || ''} onChange={(e) => update('delVlsfoQty', num(e.target.value))} placeholder="350" />
          </div>
          <div>
            <label style={label}>VLSFO Price — $/MT</label>
            <input style={inputStyle} type="number" step="0.01" value={data.delVlsfoPrice || ''} onChange={(e) => update('delVlsfoPrice', num(e.target.value))} placeholder="580" />
          </div>
        </div>
        <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginTop: 12 }}>
          <div>
            <label style={label}>MGO Qty — MT</label>
            <input style={inputStyle} type="number" step="0.1" value={data.delMgoQty || ''} onChange={(e) => update('delMgoQty', num(e.target.value))} placeholder="80" />
          </div>
          <div>
            <label style={label}>MGO Price — $/MT</label>
            <input style={inputStyle} type="number" step="0.01" value={data.delMgoPrice || ''} onChange={(e) => update('delMgoPrice', num(e.target.value))} placeholder="780" />
          </div>
        </div>
        <div style={{ marginTop: 10, padding: '6px 12px', background: '#0c1610', border: '1px solid rgba(200,168,75,.2)', borderRadius: 3, fontSize: 12, color: '#4caf76', fontFamily: rj, fontWeight: 700, textAlign: 'right' }}>
          Bunker on Delivery: {money(calc.bunkerDelivery)}
        </div>
      </div>

      <div style={card}>
        <div style={sectionTitle}>5. Bunkers on Redelivery (Owner pays Charterer)</div>
        <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          <div>
            <label style={label}>VLSFO Qty — MT</label>
            <input style={inputStyle} type="number" step="0.1" value={data.redVlsfoQty || ''} onChange={(e) => update('redVlsfoQty', num(e.target.value))} placeholder="350" />
          </div>
          <div>
            <label style={label}>VLSFO Price — $/MT</label>
            <input style={inputStyle} type="number" step="0.01" value={data.redVlsfoPrice || ''} onChange={(e) => update('redVlsfoPrice', num(e.target.value))} placeholder="580" />
          </div>
        </div>
        <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginTop: 12 }}>
          <div>
            <label style={label}>MGO Qty — MT</label>
            <input style={inputStyle} type="number" step="0.1" value={data.redMgoQty || ''} onChange={(e) => update('redMgoQty', num(e.target.value))} placeholder="80" />
          </div>
          <div>
            <label style={label}>MGO Price — $/MT</label>
            <input style={inputStyle} type="number" step="0.01" value={data.redMgoPrice || ''} onChange={(e) => update('redMgoPrice', num(e.target.value))} placeholder="780" />
          </div>
        </div>
        <div style={{ marginTop: 10, padding: '6px 12px', background: '#0c1610', border: '1px solid rgba(200,168,75,.2)', borderRadius: 3, fontSize: 12, color: '#ff8a8a', fontFamily: rj, fontWeight: 700, textAlign: 'right' }}>
          Bunker on Redelivery: {money(calc.bunkerRedelivery)}
        </div>
      </div>

      <div style={card}>
        <div style={sectionTitle}>6. Commissions &amp; CVE</div>
        <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          <div>
            <label style={label}>CVE / Victualling — $/month</label>
            <input style={inputStyle} type="number" step="0.01" value={data.cveMonthly || ''} onChange={(e) => update('cveMonthly', num(e.target.value))} placeholder="1500" />
            <span style={{ fontSize: 9.5, color: '#7a8a72', fontFamily: rj }}>Pro-rated on on-hire days</span>
          </div>
          <div>
            <label style={label}>Address Commission — %</label>
            <input style={inputStyle} type="number" step="0.01" value={data.addressCommPct || ''} onChange={(e) => update('addressCommPct', num(e.target.value))} placeholder="3.75" />
          </div>
          <div>
            <label style={label}>Brokerage — %</label>
            <input style={inputStyle} type="number" step="0.01" value={data.brokeragePct || ''} onChange={(e) => update('brokeragePct', num(e.target.value))} placeholder="1.25" />
          </div>
        </div>
        <p style={{ fontSize: 10.5, color: '#7a8a72', fontFamily: rj, marginTop: 10 }}>
          Commission applied on hire (on-hire) + CVE.
        </p>
      </div>

      <div style={card}>
        <div style={sectionTitle}>7. Other Adjustments</div>
        {data.others.length === 0 && (
          <p style={{ fontSize: 11.5, color: '#7a8a72', fontFamily: rj, marginBottom: 12, lineHeight: 1.5 }}>
            Add claims, owner&apos;s DA, speed/consumption settlements, advances, etc.
          </p>
        )}
        {data.others.map((o, i) => (
          <div key={o.id} style={{ background: '#0c1610', border: '1px solid rgba(200,168,75,.15)', padding: 12, borderRadius: 3, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontFamily: rj, fontSize: 11, color: '#c8a84b', fontWeight: 700, letterSpacing: '.5px' }}>Item #{i + 1}</span>
              <button onClick={() => delOther(o.id)} style={{ background: 'transparent', border: 'none', color: '#ff8a8a', fontFamily: rj, fontSize: 11, cursor: 'pointer', letterSpacing: '.5px' }}>Delete</button>
            </div>
            <div className="g3" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.4fr', gap: 10 }}>
              <div>
                <label style={label}>Label</label>
                <input style={inputStyle} type="text" value={o.label} onChange={(e) => updOther(o.id, 'label', e.target.value)} placeholder="Speed/cons claim" />
              </div>
              <div>
                <label style={label}>Amount — $</label>
                <input style={inputStyle} type="number" step="0.01" value={o.amount || ''} onChange={(e) => updOther(o.id, 'amount', num(e.target.value))} placeholder="0" />
              </div>
              <div>
                <label style={label}>Direction</label>
                <select style={inputStyle} value={o.dir} onChange={(e) => updOther(o.id, 'dir', e.target.value as OtherItem['dir'])}>
                  <option value="deduct">Deduct (owner owes)</option>
                  <option value="add">Add (charterer owes)</option>
                </select>
              </div>
            </div>
          </div>
        ))}
        <button onClick={addOther} style={{ ...ghostBtn, width: '100%' }}>+ Add Adjustment</button>
      </div>

      <div style={card}>
        <div style={sectionTitle}>8. Payments Received</div>
        <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(1,1fr)', gap: 12 }}>
          <div>
            <label style={label}>Hire already paid by charterer — $</label>
            <input style={inputStyle} type="number" step="0.01" value={data.paid || ''} onChange={(e) => update('paid', num(e.target.value))} placeholder="0" />
            <span style={{ fontSize: 9.5, color: '#7a8a72', fontFamily: rj }}>Sum of installments paid to date</span>
          </div>
        </div>
      </div>

      <div style={{ ...card, background: 'linear-gradient(135deg,rgba(200,168,75,.08),transparent)', borderColor: 'rgba(200,168,75,.4)' }}>
        <div style={sectionTitle}>⚡ Hire Statement Summary</div>

        <div style={rowStyle}>
          <span style={{ color: '#7a8a72' }}>Hire — on-hire {fmt(calc.onHireDays, 3)} d × ${fmt(data.hireRate, 2)}</span>
          <strong>{money(calc.hireNet)}</strong>
        </div>
        {calc.offHireDeduction > 0 && (
          <div style={rowStyle}>
            <span style={{ color: '#7a8a72' }}>Off-hire deducted ({fmt(calc.offHireDays, 3)} d)</span>
            <strong style={{ color: '#ff8a8a' }}>-{money(calc.offHireDeduction)}</strong>
          </div>
        )}
        <div style={rowStyle}>
          <span style={{ color: '#7a8a72' }}>(+) Bunkers on delivery</span>
          <strong style={{ color: '#4caf76' }}>{money(calc.bunkerDelivery)}</strong>
        </div>
        <div style={rowStyle}>
          <span style={{ color: '#7a8a72' }}>(−) Bunkers on redelivery</span>
          <strong style={{ color: '#ff8a8a' }}>-{money(calc.bunkerRedelivery)}</strong>
        </div>
        <div style={rowStyle}>
          <span style={{ color: '#7a8a72' }}>(−) CVE / victualling</span>
          <strong style={{ color: '#ff8a8a' }}>-{money(calc.cve)}</strong>
        </div>
        <div style={rowStyle}>
          <span style={{ color: '#7a8a72' }}>(−) Address comm. {fmt(data.addressCommPct, 2)}%</span>
          <strong style={{ color: '#ff8a8a' }}>-{money(calc.addrComm)}</strong>
        </div>
        <div style={rowStyle}>
          <span style={{ color: '#7a8a72' }}>(−) Brokerage {fmt(data.brokeragePct, 2)}%</span>
          <strong style={{ color: '#ff8a8a' }}>-{money(calc.brokerage)}</strong>
        </div>
        {data.others.map((o) => (
          <div key={o.id} style={rowStyle}>
            <span style={{ color: '#7a8a72' }}>{o.dir === 'add' ? '(+)' : '(−)'} {o.label || 'Adjustment'}</span>
            <strong style={{ color: o.dir === 'add' ? '#4caf76' : '#ff8a8a' }}>
              {o.dir === 'add' ? '' : '-'}{money(o.amount)}
            </strong>
          </div>
        ))}

        <div style={{ ...rowStyle, borderTop: '2px solid #c8a84b', paddingTop: 14, marginTop: 10, borderBottom: 'none' }}>
          <span style={{ color: '#c8a84b', fontWeight: 700, fontSize: 14 }}>TOTAL DUE TO OWNER</span>
          <strong style={{ fontFamily: lb, fontSize: 22, color: '#c8a84b' }}>{money(calc.totalDue)}</strong>
        </div>
        {data.paid > 0 && (
          <div style={rowStyle}>
            <span style={{ color: '#7a8a72' }}>Less: hire paid</span>
            <strong style={{ color: '#ff8a8a' }}>-{money(data.paid)}</strong>
          </div>
        )}

        <div style={{ marginTop: 14, padding: '14px 16px', background: '#0c1610', border: `1px solid ${calc.balance >= 0 ? 'rgba(200,168,75,.5)' : 'rgba(76,175,118,.5)'}`, borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#7a8a72', fontWeight: 700 }}>
            {calc.balance >= 0 ? 'Balance Due from Charterer' : 'Balance Due to Charterer'}
          </div>
          <div style={{ fontFamily: lb, fontSize: 30, fontWeight: 700, color: calc.balance >= 0 ? '#c8a84b' : '#4caf76', marginTop: 4 }}>
            {money(Math.abs(calc.balance))}
          </div>
        </div>

        <div style={{ marginTop: 12, fontSize: 11, color: '#7a8a72', fontFamily: rj, lineHeight: 1.5 }}>
          Owner {data.owner || '—'} · Charterer {data.charterer || '—'}
          {data.cpDate && <> · CP {data.cpDate}</>}
        </div>
      </div>

      <div style={card}>
        <div style={sectionTitle}>Notes</div>
        <textarea value={data.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Settlement terms, disputed items, payment instructions..." rows={3} style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} />
      </div>

      <style>{`
        @media (max-width: 720px) {
          .g3 { grid-template-columns: 1fr !important; }
          .action-bar button { font-size: 10px !important; padding: 7px 10px !important; }
        }
        @media print {
          @page { size: A4; margin: 14mm; }
          body { background: white !important; color: black !important; }
          nav, footer, .action-bar, [style*="position: sticky"] { display: none !important; }
        }
      `}</style>
    </div>
  );
}
