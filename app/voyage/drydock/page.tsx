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
interface SurveyItem {
  key: string;
  name: string;
  intervalMonths: number;
  note: string;
}

const SURVEYS: SurveyItem[] = [
  { key: 'special', name: 'Special Survey (Class Renewal)', intervalMonths: 60, note: 'Every 5 years' },
  { key: 'intermediate', name: 'Intermediate Survey', intervalMonths: 30, note: 'Between 2nd & 3rd annual (≈2.5 yrs)' },
  { key: 'drydock1', name: 'Bottom / Dry-dock Survey', intervalMonths: 36, note: '2 in 5 yrs, max 36 months apart' },
  { key: 'annual', name: 'Annual Survey', intervalMonths: 12, note: 'Within ±3 months of anniversary' },
  { key: 'tailshaft', name: 'Tail Shaft Survey', intervalMonths: 60, note: 'Typically 5 yrs (oil-lubed)' },
  { key: 'boiler', name: 'Boiler Survey', intervalMonths: 30, note: '≈2.5 yrs' },
  { key: 'iopp', name: 'IOPP / MARPOL Renewal', intervalMonths: 60, note: '5 yrs with annual endorsement' },
  { key: 'safcon', name: 'Safety Construction / Equipment', intervalMonths: 60, note: '5 yrs with annual/intermediate' },
];

interface ScopeItem {
  id: string;
  label: string;
  done: boolean;
  cost: number;
}

interface DryDockData {
  vesselName: string;
  imo: string;
  // anchor dates
  lastSpecialDate: string;
  lastDrydockDate: string;
  buildDate: string;
  // project
  shipyard: string;
  plannedStart: string;
  durationDays: number;
  yardDayRate: number;
  scope: ScopeItem[];
  notes: string;
}

const DEFAULT_SCOPE = [
  'Hull blasting & painting', 'Anchor & chain ranging', 'Sea chest / valves overhaul',
  'Propeller polishing', 'Tail shaft draw (if due)', 'Tank cleaning & inspection',
  'Steel renewal', 'ME / AE overhaul', 'Rudder & bearing clearance',
  'Cathodic protection / anodes', 'UTM (thickness measurement)', 'Class survey items',
];

function newScope(label = ''): ScopeItem { return { id: genId(), label, done: false, cost: 0 }; }

const DEFAULT_DATA: DryDockData = {
  vesselName: '', imo: '', lastSpecialDate: '', lastDrydockDate: '', buildDate: '',
  shipyard: '', plannedStart: '', durationDays: 14, yardDayRate: 0,
  scope: DEFAULT_SCOPE.map((l) => newScope(l)), notes: '',
};

// ============================================================
// CALC
// ============================================================
function addMonths(dateStr: string, months: number): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return null;
  const r = new Date(d);
  r.setMonth(r.getMonth() + months);
  return r;
}
function daysUntil(d: Date): number {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 86400000);
}
function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmt(n: number, dec = 0): string {
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

// ============================================================
// COMPONENT
// ============================================================
export default function DryDockPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingId = searchParams.get('id');

  const [data, setData] = useState<DryDockData>(DEFAULT_DATA);
  const [recordId, setRecordId] = useState<string | null>(existingId);
  const [recordName, setRecordName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (existingId) {
      const saved = loadItem<DryDockData>('drydock', existingId);
      if (saved) { setData({ ...DEFAULT_DATA, ...saved.data }); setRecordName(saved.name); }
    }
  }, [existingId]);

  function update<K extends keyof DryDockData>(key: K, value: DryDockData[K]) { setData((p) => ({ ...p, [key]: value })); }
  function num(v: string): number { return parseFloat(v) || 0; }
  function updScope(id: string, patch: Partial<ScopeItem>) { setData((p) => ({ ...p, scope: p.scope.map((s) => (s.id === id ? { ...s, ...patch } : s)) })); }
  function addScope() { setData((p) => ({ ...p, scope: [...p.scope, newScope()] })); }
  function delScope(id: string) { setData((p) => ({ ...p, scope: p.scope.filter((s) => s.id !== id) })); }

  // survey due dates — anchor each to relevant last date
  const surveyStatus = useMemo(() => {
    return SURVEYS.map((s) => {
      let anchor = '';
      if (s.key === 'drydock1') anchor = data.lastDrydockDate || data.lastSpecialDate;
      else anchor = data.lastSpecialDate;
      const due = addMonths(anchor, s.intervalMonths);
      const dueIn = due ? daysUntil(due) : null;
      let state: 'overdue' | 'soon' | 'ok' | 'unset' = 'unset';
      if (due == null) state = 'unset';
      else if (dueIn != null && dueIn < 0) state = 'overdue';
      else if (dueIn != null && dueIn <= 180) state = 'soon';
      else state = 'ok';
      return { s, due, dueIn, state };
    });
  }, [data.lastSpecialDate, data.lastDrydockDate]);

  const scopeCost = useMemo(() => data.scope.reduce((s, i) => s + (i.cost || 0), 0), [data.scope]);
  const yardCost = useMemo(() => data.durationDays * data.yardDayRate, [data.durationDays, data.yardDayRate]);
  const totalCost = scopeCost + yardCost;
  const scopeDone = data.scope.filter((s) => s.done).length;

  function handleSave() {
    const name = recordName.trim() || `${data.vesselName || 'Vessel'} — Drydock`;
    const id = recordId || genId();
    saveItem('drydock', name, data, id);
    setRecordId(id); setRecordName(name); setSaveMsg('✓ Saved'); setShowSave(false);
    setTimeout(() => setSaveMsg(''), 3000);
  }
  function handleReset() {
    if (!confirm('Reset all fields?')) return;
    setData(DEFAULT_DATA); setRecordId(null); setRecordName(''); router.replace('/voyage/drydock');
  }

  const STATE_META: Record<string, { label: string; color: string; bg: string }> = {
    overdue: { label: 'OVERDUE', color: '#ff6b6b', bg: 'rgba(255,107,107,.16)' },
    soon: { label: 'DUE ≤6 MO', color: '#e8b85a', bg: 'rgba(232,184,90,.14)' },
    ok: { label: 'OK', color: '#4caf76', bg: 'rgba(76,175,118,.14)' },
    unset: { label: 'SET DATE', color: '#7a8a72', bg: 'rgba(122,138,114,.14)' },
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>
          ⚓ Voyage Hub · Drydock Planner
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Drydock <em style={g}>Planner</em>
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          Track the 5-year class survey cycle, plan the docking scope and estimate the cost. Survey
          windows are indicative — your class society&apos;s survey status always governs.
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
          <label style={labelS}>Name</label>
          <input type="text" value={recordName} onChange={(e) => setRecordName(e.target.value)} placeholder="e.g. MV NEURONAI — DD 2027" style={{ ...inputStyle, marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{ ...goldBtn, padding: '8px 14px', letterSpacing: '1px' }}>Save</button>
            <button onClick={() => setShowSave(false)} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* Vessel + anchor dates */}
      <div style={card}>
        <div style={sectionTitle}>1. Vessel &amp; Survey Anchor Dates</div>
        <div className="dd-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 12 }}>
          <div><label style={labelS}>Vessel</label><input style={inputStyle} value={data.vesselName} onChange={(e) => update('vesselName', e.target.value)} placeholder="MV NEURONAI" /></div>
          <div><label style={labelS}>IMO</label><input style={inputStyle} value={data.imo} onChange={(e) => update('imo', e.target.value)} placeholder="9876543" /></div>
        </div>
        <div className="dd-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          <div><label style={labelS}>Last Special Survey</label><input style={inputStyle} type="date" value={data.lastSpecialDate} onChange={(e) => update('lastSpecialDate', e.target.value)} /></div>
          <div><label style={labelS}>Last Dry-dock</label><input style={inputStyle} type="date" value={data.lastDrydockDate} onChange={(e) => update('lastDrydockDate', e.target.value)} /></div>
          <div><label style={labelS}>Build Date</label><input style={inputStyle} type="date" value={data.buildDate} onChange={(e) => update('buildDate', e.target.value)} /></div>
        </div>
      </div>

      {/* Survey schedule */}
      <div style={card}>
        <div style={sectionTitle}>2. Class Survey Schedule</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0 }}>
          {surveyStatus.map(({ s, due, dueIn, state }) => {
            const sm = STATE_META[state];
            return (
              <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '11px 0', borderBottom: '1px dashed rgba(200,168,75,.1)', flexWrap: 'wrap' }}>
                <div style={{ minWidth: 200 }}>
                  <div style={{ fontFamily: rj, fontSize: 13, fontWeight: 700, color: '#f5f0e8' }}>{s.name}</div>
                  <div style={{ fontFamily: rj, fontSize: 10, color: '#7a8a72' }}>{s.note}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'right', fontFamily: rj, fontSize: 11 }}>
                    {due ? (
                      <>
                        <div style={{ color: '#b0c0a4' }}>Due {fmtDate(due)}</div>
                        <div style={{ color: state === 'overdue' ? '#ff6b6b' : state === 'soon' ? '#e8b85a' : '#4caf76' }}>
                          {dueIn != null && (dueIn < 0 ? `${Math.abs(Math.round(dueIn / 30))} mo overdue` : `in ${Math.round(dueIn / 30)} mo`)}
                        </div>
                      </>
                    ) : <div style={{ color: '#7a8a72' }}>set anchor date</div>}
                  </div>
                  <span style={{ fontSize: 9, background: sm.bg, color: sm.color, padding: '3px 9px', borderRadius: 3, fontFamily: rj, fontWeight: 700, letterSpacing: '.5px', border: `1px solid ${sm.color}40`, whiteSpace: 'nowrap', minWidth: 78, textAlign: 'center' }}>{sm.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Project plan */}
      <div style={card}>
        <div style={sectionTitle}>3. Docking Project</div>
        <div className="dd-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 12 }}>
          <div><label style={labelS}>Shipyard</label><input style={inputStyle} value={data.shipyard} onChange={(e) => update('shipyard', e.target.value)} placeholder="e.g. Tuzla / Sembcorp" /></div>
          <div><label style={labelS}>Planned Start</label><input style={inputStyle} type="date" value={data.plannedStart} onChange={(e) => update('plannedStart', e.target.value)} /></div>
        </div>
        <div className="dd-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          <div><label style={labelS}>Duration (days)</label><input style={inputStyle} type="number" value={data.durationDays || ''} onChange={(e) => update('durationDays', num(e.target.value))} placeholder="14" /></div>
          <div><label style={labelS}>Yard Day Rate ($/day)</label><input style={inputStyle} type="number" value={data.yardDayRate || ''} onChange={(e) => update('yardDayRate', num(e.target.value))} placeholder="15000" /></div>
        </div>
        <div style={{ marginTop: 10, padding: '10px 12px', background: 'rgba(200,168,75,.05)', border: '1px solid rgba(200,168,75,.15)', borderRadius: 3, fontFamily: rj, fontSize: 12, color: '#b0c0a4' }}>
          🔎 Need a shipyard? <a href="/" style={{ color: '#c8a84b', fontWeight: 700 }}>Find repair & drydock providers on PortServiceFinder →</a>
        </div>
      </div>

      {/* Scope + cost */}
      <div style={card}>
        <div style={sectionTitle}>4. Scope of Work &amp; Cost</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
            <thead>
              <tr style={{ color: '#7a8a72', fontFamily: rj, fontSize: 9.5, letterSpacing: '.5px', textTransform: 'uppercase' }}>
                <th style={{ ...thd, textAlign: 'left', width: 40 }}>Done</th>
                <th style={{ ...thd, textAlign: 'left' }}>Item</th>
                <th style={thd}>Est. Cost ($)</th>
                <th style={{ ...thd, width: 28 }}></th>
              </tr>
            </thead>
            <tbody>
              {data.scope.map((s) => (
                <tr key={s.id} style={{ borderTop: '1px solid rgba(200,168,75,.08)' }}>
                  <td style={{ padding: '4px 6px', textAlign: 'center' }}>
                    <input type="checkbox" checked={s.done} onChange={() => updScope(s.id, { done: !s.done })} style={{ width: 16, height: 16, accentColor: '#4caf76' }} />
                  </td>
                  <td style={{ padding: '4px 6px' }}><input style={{ ...inputStyle, padding: '5px 7px', fontSize: 12, textDecoration: s.done ? 'line-through' : 'none', color: s.done ? '#7a8a72' : '#f5f0e8' }} value={s.label} onChange={(e) => updScope(s.id, { label: e.target.value })} placeholder="Work item" /></td>
                  <td style={{ padding: '4px 4px' }}><input style={{ ...inputStyle, padding: '5px 7px', fontSize: 12, textAlign: 'right' }} type="number" value={s.cost || ''} onChange={(e) => updScope(s.id, { cost: num(e.target.value) })} placeholder="0" /></td>
                  <td style={{ padding: '4px 4px', textAlign: 'center' }}><button onClick={() => delScope(s.id)} style={{ background: 'transparent', border: 'none', color: '#ff8a8a', cursor: 'pointer', fontSize: 12 }}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={addScope} style={{ ...ghostBtn, marginTop: 12, fontSize: 10 }}>+ Add Work Item</button>

        {/* cost summary */}
        <div className="dd-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginTop: 16 }}>
          <KPI label="Scope Done" value={`${scopeDone}/${data.scope.length}`} color="#4caf76" />
          <KPI label="Yard Cost" value={`$${fmt(yardCost)}`} color="#5aa6e8" />
          <KPI label="Work Items" value={`$${fmt(scopeCost)}`} color="#5aa6e8" />
          <KPI label="Total Estimate" value={`$${fmt(totalCost)}`} color="#c8a84b" big />
        </div>
      </div>

      {/* Notes */}
      <div style={card}>
        <div style={sectionTitle}>Notes</div>
        <textarea value={data.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Spec deviations, owner-supplied items, class attendance, critical path..." rows={3} style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} />
      </div>

      {/* Reference */}
      <div style={{ ...card, background: 'rgba(122,138,114,.05)', borderColor: 'rgba(122,138,114,.15)' }}>
        <div style={sectionTitle}>📖 Survey Cycle Basics</div>
        <ul style={{ fontSize: 11.5, color: '#b0c0a4', lineHeight: 1.7, paddingLeft: 18, fontFamily: rj }}>
          <li>Class works on a <b style={{ color: '#c8a84b' }}>5-year cycle</b>: Special Survey at the end, Annual surveys each year, an Intermediate around year 2.5.</li>
          <li>Two bottom/dry-dock inspections in 5 years, with a maximum of <b style={{ color: '#c8a84b' }}>36 months</b> between them.</li>
          <li>Underwater inspection in lieu of dry-docking (UWILD) may be accepted for some ships — check class.</li>
          <li>Dates here are anchored to the last special survey / dry-dock you enter; the class survey status report is authoritative.</li>
        </ul>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .dd-g3 { grid-template-columns: 1fr !important; }
          .dd-kpis { grid-template-columns: 1fr 1fr !important; }
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

function KPI({ label: l, value, color, big }: { label: string; value: string; color: string; big?: boolean }) {
  return (
    <div style={{ background: '#0c1610', border: '1px solid rgba(200,168,75,.2)', borderRadius: 4, padding: '12px 10px', textAlign: 'center' }}>
      <div style={{ fontFamily: rj, fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: '#7a8a72', fontWeight: 700 }}>{l}</div>
      <div style={{ fontFamily: lb, fontSize: big ? 24 : 19, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
    </div>
  );
}
