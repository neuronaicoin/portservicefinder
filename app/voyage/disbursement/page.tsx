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
interface DAItem {
  id: string;
  label: string;
  estimate: number;
  proforma: number;
  final: number;
}

interface PortCall {
  id: string;
  port: string;
  agent: string;
  callType: 'load' | 'discharge' | 'bunker' | 'transit' | 'repair' | 'other';
  arrival: string;
  departure: string;
  items: DAItem[];
}

interface DAData {
  vesselName: string;
  imo: string;
  voyageNo: string;
  currency: string;
  tolerancePct: number; // flag items deviating more than this
  calls: PortCall[];
}

const DEFAULT_ITEM_LABELS = [
  'Port Dues', 'Pilotage', 'Towage / Tugs', 'Mooring / Unmooring', 'Agency Fee',
  'Berth Hire / Quay', 'Fresh Water', 'Garbage Removal', 'Customs / Immigration',
  'Cash to Master', 'Surveys / Inspections', 'Launch / Boat Hire', 'Sundries',
];

function newItem(label = ''): DAItem {
  return { id: genId(), label, estimate: 0, proforma: 0, final: 0 };
}
function newCall(): PortCall {
  return {
    id: genId(), port: '', agent: '', callType: 'load', arrival: '', departure: '',
    items: DEFAULT_ITEM_LABELS.map((l) => newItem(l)),
  };
}

const DEFAULT_DATA: DAData = {
  vesselName: '', imo: '', voyageNo: '', currency: 'USD', tolerancePct: 15, calls: [],
};

// ============================================================
// CALC
// ============================================================
function callTotals(c: PortCall) {
  const est = c.items.reduce((s, i) => s + (i.estimate || 0), 0);
  const pro = c.items.reduce((s, i) => s + (i.proforma || 0), 0);
  const fin = c.items.reduce((s, i) => s + (i.final || 0), 0);
  return { est, pro, fin };
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
const label: React.CSSProperties = { display: 'block', fontFamily: rj, fontSize: 10, letterSpacing: '.5px', textTransform: 'uppercase', color: '#7a8a72', fontWeight: 600, marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', background: '#0c1610', border: '1px solid rgba(200,168,75,.2)', color: '#f5f0e8', padding: '7px 9px', fontFamily: rj, fontSize: 12.5, fontWeight: 500, borderRadius: 3, boxSizing: 'border-box' };
const numCell: React.CSSProperties = { ...inputStyle, padding: '5px 7px', fontSize: 12, textAlign: 'right' };
const ghostBtn: React.CSSProperties = { background: 'transparent', color: '#c8a84b', border: '1px solid rgba(200,168,75,.4)', padding: '8px 14px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };
const goldBtn: React.CSSProperties = { background: '#c8a84b', color: '#08100a', border: 'none', padding: '8px 16px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };

const CALL_LABEL: Record<PortCall['callType'], string> = { load: 'Loading', discharge: 'Discharge', bunker: 'Bunker', transit: 'Transit', repair: 'Repair', other: 'Other' };

// ============================================================
// COMPONENT
// ============================================================
export default function DisbursementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingId = searchParams.get('id');

  const [data, setData] = useState<DAData>(DEFAULT_DATA);
  const [recordId, setRecordId] = useState<string | null>(existingId);
  const [recordName, setRecordName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [openCall, setOpenCall] = useState<string | null>(null);

  useEffect(() => {
    if (existingId) {
      const saved = loadItem<DAData>('disbursement', existingId);
      if (saved) { setData(saved.data); setRecordName(saved.name); }
    }
  }, [existingId]);

  function update<K extends keyof DAData>(key: K, value: DAData[K]) { setData((p) => ({ ...p, [key]: value })); }
  function num(v: string): number { return parseFloat(v) || 0; }

  function addCall() {
    const c = newCall();
    setOpenCall(c.id);
    setData((p) => ({ ...p, calls: [...p.calls, c] }));
  }
  function updCall(id: string, patch: Partial<PortCall>) {
    setData((p) => ({ ...p, calls: p.calls.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  }
  function delCall(id: string) {
    setData((p) => ({ ...p, calls: p.calls.filter((c) => c.id !== id) }));
  }
  function updItem(callId: string, itemId: string, patch: Partial<DAItem>) {
    setData((p) => ({
      ...p,
      calls: p.calls.map((c) => c.id === callId ? { ...c, items: c.items.map((i) => i.id === itemId ? { ...i, ...patch } : i) } : c),
    }));
  }
  function addItem(callId: string) {
    setData((p) => ({ ...p, calls: p.calls.map((c) => c.id === callId ? { ...c, items: [...c.items, newItem()] } : c) }));
  }
  function delItem(callId: string, itemId: string) {
    setData((p) => ({ ...p, calls: p.calls.map((c) => c.id === callId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c) }));
  }

  const grand = useMemo(() => {
    let est = 0, pro = 0, fin = 0;
    data.calls.forEach((c) => { const t = callTotals(c); est += t.est; pro += t.pro; fin += t.fin; });
    return { est, pro, fin };
  }, [data.calls]);

  function handleSave() {
    const name = recordName.trim() || `${data.vesselName || 'Vessel'} — DA ${data.voyageNo || ''}`;
    const id = recordId || genId();
    saveItem('disbursement', name, data, id);
    setRecordId(id); setRecordName(name); setSaveMsg('✓ Saved'); setShowSave(false);
    setTimeout(() => setSaveMsg(''), 3000);
  }
  function handleReset() {
    if (!confirm('Reset all fields?')) return;
    setData(DEFAULT_DATA); setRecordId(null); setRecordName(''); router.replace('/voyage/disbursement');
  }

  const cur = data.currency || 'USD';

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>
          ⚓ Voyage Hub · Disbursement Tracker
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Disbursement <em style={g}>Tracker</em>
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          Compare estimate, pro-forma and final DA for every port call. Spot variances item-by-item
          before you settle the agent&apos;s account.
        </p>
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
          <label style={label}>Name</label>
          <input type="text" value={recordName} onChange={(e) => setRecordName(e.target.value)} placeholder="e.g. MV NEURONAI — Voyage 12 DAs" style={{ ...inputStyle, marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{ ...goldBtn, padding: '8px 14px', letterSpacing: '1px' }}>Save</button>
            <button onClick={() => setShowSave(false)} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* Voyage info */}
      <div style={card}>
        <div style={sectionTitle}>Voyage Reference</div>
        <div className="da-g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          <div><label style={label}>Vessel</label><input style={inputStyle} value={data.vesselName} onChange={(e) => update('vesselName', e.target.value)} placeholder="MV NEURONAI" /></div>
          <div><label style={label}>IMO</label><input style={inputStyle} value={data.imo} onChange={(e) => update('imo', e.target.value)} placeholder="9876543" /></div>
          <div><label style={label}>Voyage No.</label><input style={inputStyle} value={data.voyageNo} onChange={(e) => update('voyageNo', e.target.value)} placeholder="V-12" /></div>
          <div>
            <label style={label}>Currency</label>
            <select style={inputStyle} value={data.currency} onChange={(e) => update('currency', e.target.value)}>
              {['USD', 'EUR', 'GBP', 'SGD', 'AED', 'TRY', 'BRL', 'CNY'].map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginTop: 12, maxWidth: 240 }}>
          <label style={label}>Variance Flag Threshold (%)</label>
          <input style={inputStyle} type="number" value={data.tolerancePct || ''} onChange={(e) => update('tolerancePct', num(e.target.value))} placeholder="15" />
        </div>
      </div>

      {/* Grand totals */}
      {data.calls.length > 0 && (
        <div style={{ ...card, background: 'linear-gradient(135deg,rgba(200,168,75,.08),transparent)', borderColor: 'rgba(200,168,75,.4)' }}>
          <div style={sectionTitle}>💰 Voyage DA Summary ({data.calls.length} call{data.calls.length !== 1 ? 's' : ''})</div>
          <div className="da-totals" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            <Tot label="Estimate" value={grand.est} cur={cur} color="#7a8a72" />
            <Tot label="Pro-forma" value={grand.pro} cur={cur} color="#5aa6e8" />
            <Tot label="Final DA" value={grand.fin} cur={cur} color="#c8a84b" />
            <Tot label="Final vs Pro-forma" value={grand.fin - grand.pro} cur={cur} signed color={grand.fin > grand.pro ? '#ff8a8a' : '#4caf76'} pct={grand.pro > 0 ? ((grand.fin - grand.pro) / grand.pro) * 100 : null} />
          </div>
        </div>
      )}

      {/* Port calls */}
      {data.calls.map((c, ci) => {
        const t = callTotals(c);
        const open = openCall === c.id;
        const diff = t.fin - t.pro;
        const diffPct = t.pro > 0 ? (diff / t.pro) * 100 : 0;
        return (
          <div key={c.id} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setOpenCall(open ? null : c.id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: lb, fontSize: 16, fontWeight: 700, color: '#c8a84b' }}>{c.port || `Port Call ${ci + 1}`}</span>
                <span style={{ fontSize: 9.5, background: 'rgba(122,138,114,.14)', color: '#b0c0a4', padding: '2px 7px', borderRadius: 3, fontFamily: rj, fontWeight: 700 }}>{CALL_LABEL[c.callType]}</span>
                {c.agent && <span style={{ fontFamily: rj, fontSize: 11, color: '#7a8a72' }}>· {c.agent}</span>}
                {t.fin > 0 && (
                  <span style={{ fontFamily: rj, fontSize: 12, color: diff > 0 ? '#ff8a8a' : '#4caf76' }}>
                    Final {cur} {fmt(t.fin, 0)} ({diff >= 0 ? '+' : ''}{fmt(diffPct, 1)}%)
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontFamily: rj, fontSize: 11, color: '#c8a84b' }}>{open ? '▲' : '▼'}</span>
                <button onClick={(e) => { e.stopPropagation(); delCall(c.id); }} style={{ background: 'transparent', border: 'none', color: '#ff8a8a', fontFamily: rj, fontSize: 11, cursor: 'pointer' }}>✕</button>
              </div>
            </div>

            {open && (
              <div style={{ marginTop: 14 }}>
                <div className="da-g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
                  <div><label style={label}>Port</label><input style={inputStyle} value={c.port} onChange={(e) => updCall(c.id, { port: e.target.value })} placeholder="Singapore" /></div>
                  <div><label style={label}>Agent</label><input style={inputStyle} value={c.agent} onChange={(e) => updCall(c.id, { agent: e.target.value })} placeholder="ABC Agency" /></div>
                  <div>
                    <label style={label}>Call Type</label>
                    <select style={inputStyle} value={c.callType} onChange={(e) => updCall(c.id, { callType: e.target.value as PortCall['callType'] })}>
                      {(Object.keys(CALL_LABEL) as PortCall['callType'][]).map((k) => <option key={k} value={k}>{CALL_LABEL[k]}</option>)}
                    </select>
                  </div>
                </div>
                <div className="da-g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 14 }}>
                  <div><label style={label}>Arrival</label><input style={inputStyle} type="date" value={c.arrival} onChange={(e) => updCall(c.id, { arrival: e.target.value })} /></div>
                  <div><label style={label}>Departure</label><input style={inputStyle} type="date" value={c.departure} onChange={(e) => updCall(c.id, { departure: e.target.value })} /></div>
                </div>

                {/* DA items table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
                    <thead>
                      <tr style={{ color: '#7a8a72', fontFamily: rj, fontSize: 9.5, letterSpacing: '.5px', textTransform: 'uppercase' }}>
                        <th style={{ ...thd, textAlign: 'left' }}>Item</th>
                        <th style={thd}>Estimate</th>
                        <th style={thd}>Pro-forma</th>
                        <th style={thd}>Final</th>
                        <th style={thd}>Δ vs PF</th>
                        <th style={{ ...thd, width: 30 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {c.items.map((it) => {
                        const d = it.final - it.proforma;
                        const dpct = it.proforma > 0 ? (d / it.proforma) * 100 : (it.final > 0 ? 100 : 0);
                        const flagged = it.final > 0 && it.proforma > 0 && Math.abs(dpct) > data.tolerancePct;
                        return (
                          <tr key={it.id} style={{ borderTop: '1px solid rgba(200,168,75,.08)' }}>
                            <td style={{ padding: '4px 6px' }}>
                              <input style={{ ...inputStyle, padding: '5px 7px', fontSize: 12 }} value={it.label} onChange={(e) => updItem(c.id, it.id, { label: e.target.value })} placeholder="Item" />
                            </td>
                            <td style={{ padding: '4px 4px' }}><input style={numCell} type="number" value={it.estimate || ''} onChange={(e) => updItem(c.id, it.id, { estimate: num(e.target.value) })} placeholder="0" /></td>
                            <td style={{ padding: '4px 4px' }}><input style={numCell} type="number" value={it.proforma || ''} onChange={(e) => updItem(c.id, it.id, { proforma: num(e.target.value) })} placeholder="0" /></td>
                            <td style={{ padding: '4px 4px' }}><input style={{ ...numCell, borderColor: flagged ? 'rgba(255,138,138,.5)' : 'rgba(200,168,75,.2)' }} type="number" value={it.final || ''} onChange={(e) => updItem(c.id, it.id, { final: num(e.target.value) })} placeholder="0" /></td>
                            <td style={{ padding: '4px 6px', textAlign: 'right', fontFamily: rj, fontSize: 11.5, color: d > 0 ? '#ff8a8a' : d < 0 ? '#4caf76' : '#7a8a72', whiteSpace: 'nowrap' }}>
                              {it.final || it.proforma ? <>{d >= 0 ? '+' : ''}{fmt(d, 0)}{flagged && ' ⚠'}</> : '—'}
                            </td>
                            <td style={{ padding: '4px 4px', textAlign: 'center' }}>
                              <button onClick={() => delItem(c.id, it.id)} style={{ background: 'transparent', border: 'none', color: '#ff8a8a', cursor: 'pointer', fontSize: 12 }}>✕</button>
                            </td>
                          </tr>
                        );
                      })}
                      <tr style={{ borderTop: '2px solid rgba(200,168,75,.4)' }}>
                        <td style={{ padding: '8px 6px', fontFamily: rj, fontWeight: 700, color: '#c8a84b', fontSize: 12, letterSpacing: '.5px', textTransform: 'uppercase' }}>Total {cur}</td>
                        <td style={tdTot}>{fmt(t.est, 0)}</td>
                        <td style={tdTot}>{fmt(t.pro, 0)}</td>
                        <td style={{ ...tdTot, color: '#c8a84b' }}>{fmt(t.fin, 0)}</td>
                        <td style={{ ...tdTot, color: diff > 0 ? '#ff8a8a' : '#4caf76' }}>{diff >= 0 ? '+' : ''}{fmt(diff, 0)}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <button onClick={() => addItem(c.id)} style={{ ...ghostBtn, marginTop: 12, fontSize: 10 }}>+ Add Line Item</button>
              </div>
            )}
          </div>
        );
      })}

      <button onClick={addCall} style={{ ...goldBtn, width: '100%', padding: '12px', marginBottom: 16 }}>+ Add Port Call</button>

      {/* Reference */}
      <div style={{ ...card, background: 'rgba(122,138,114,.05)', borderColor: 'rgba(122,138,114,.15)' }}>
        <div style={sectionTitle}>📖 About Disbursement Accounts</div>
        <ul style={{ fontSize: 11.5, color: '#b0c0a4', lineHeight: 1.7, paddingLeft: 18, fontFamily: rj }}>
          <li><b style={{ color: '#7a8a72' }}>Estimate</b> — your own budget figure set before the call.</li>
          <li><b style={{ color: '#5aa6e8' }}>Pro-forma DA</b> — the agent&apos;s advance estimate, usually paid before arrival.</li>
          <li><b style={{ color: '#c8a84b' }}>Final DA</b> — the agent&apos;s actual account after the call, with supporting vouchers.</li>
          <li>Items where the final exceeds pro-forma by more than your threshold are flagged <b style={{ color: '#ff8a8a' }}>⚠</b> — ask the agent for vouchers before settling.</li>
          <li>Keep all vouchers; query large variances in writing within the agency agreement&apos;s time limit.</li>
        </ul>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .da-g4, .da-totals { grid-template-columns: 1fr 1fr !important; }
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
const tdTot: React.CSSProperties = { padding: '8px 6px', textAlign: 'right', fontFamily: rj, fontWeight: 700, color: '#f5f0e8', fontSize: 12.5 };

function Tot({ label: l, value, cur, color, signed, pct }: { label: string; value: number; cur: string; color: string; signed?: boolean; pct?: number | null }) {
  return (
    <div style={{ background: '#0c1610', border: '1px solid rgba(200,168,75,.2)', borderRadius: 4, padding: '12px 10px', textAlign: 'center' }}>
      <div style={{ fontFamily: rj, fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: '#7a8a72', fontWeight: 700 }}>{l}</div>
      <div style={{ fontFamily: lb, fontSize: 19, fontWeight: 700, color, marginTop: 4 }}>
        {signed && value > 0 ? '+' : ''}{cur} {fmt(value, 0)}
      </div>
      {pct != null && <div style={{ fontFamily: rj, fontSize: 10.5, color }}>{pct >= 0 ? '+' : ''}{fmt(pct, 1)}%</div>}
    </div>
  );
}
