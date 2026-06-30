'use client';
import { useState, useEffect, useMemo } from 'react';
import { saveItem, loadItem, genId } from '@/lib/voyage-storage';

const lb = "'Libre Bodoni', serif";
const rj = "'Rajdhani', sans-serif";
const g = { color: '#c8a84b', fontStyle: 'italic' } as React.CSSProperties;

// ============================================================
// SOLAS / ISM drill schedule
// ============================================================
interface DrillType {
  key: string;
  name: string;
  icon: string;
  intervalDays: number;   // required interval
  ref: string;
}

const DRILL_TYPES: DrillType[] = [
  { key: 'fire', name: 'Fire Drill', icon: '🔥', intervalDays: 30, ref: 'SOLAS III/19.3 — monthly' },
  { key: 'abandon', name: 'Abandon Ship / Muster', icon: '🛟', intervalDays: 30, ref: 'SOLAS III/19.3 — monthly' },
  { key: 'lifeboat', name: 'Lifeboat Launching (on-load)', icon: '⛴️', intervalDays: 90, ref: 'SOLAS III/19.3.3 — every 3 months' },
  { key: 'rescueboat', name: 'Rescue Boat Launching', icon: '🚤', intervalDays: 30, ref: 'SOLAS III/19.3 — monthly (as far as practicable)' },
  { key: 'enclosed', name: 'Enclosed Space Entry & Rescue', icon: '🕳️', intervalDays: 60, ref: 'SOLAS III/19.3.3 — every 2 months' },
  { key: 'steering', name: 'Emergency Steering', icon: '🎛️', intervalDays: 90, ref: 'SOLAS V/26 — every 3 months' },
  { key: 'security', name: 'Security / ISPS Drill', icon: '🛡️', intervalDays: 90, ref: 'ISPS — at least every 3 months' },
  { key: 'pollution', name: 'Oil Pollution (SOPEP)', icon: '🛢️', intervalDays: 90, ref: 'Company SMS — typically quarterly' },
  { key: 'mob', name: 'Man Overboard', icon: '🆘', intervalDays: 90, ref: 'Company SMS — recommended quarterly' },
  { key: 'damage', name: 'Damage Control / Flooding', icon: '🌊', intervalDays: 180, ref: 'Company SMS / SOLAS — periodic' },
  { key: 'blackout', name: 'Blackout / Dead Ship', icon: '⚡', intervalDays: 180, ref: 'Company SMS — periodic' },
  { key: 'medical', name: 'Medical Emergency', icon: '🩺', intervalDays: 180, ref: 'Company SMS — periodic' },
];

interface DrillRecord {
  id: string;
  typeKey: string;
  date: string;
  participants: string;
  notes: string;
  performance: 'good' | 'satisfactory' | 'needs-improvement';
}

interface DrillData {
  vesselName: string;
  imo: string;
  records: DrillRecord[];
}

const DEFAULT_DATA: DrillData = { vesselName: '', imo: '', records: [] };

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
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

const STORAGE_KEY = 'drills';
const SINGLETON_ID = 'drilltracker';

const PERF_META: Record<DrillRecord['performance'], { label: string; color: string }> = {
  good: { label: 'Good', color: '#4caf76' },
  satisfactory: { label: 'Satisfactory', color: '#c8a84b' },
  'needs-improvement': { label: 'Needs improvement', color: '#ff8a8a' },
};

// ============================================================
// COMPONENT
// ============================================================
export default function DrillTrackerPage() {
  const [data, setData] = useState<DrillData>(DEFAULT_DATA);
  const [saveMsg, setSaveMsg] = useState('');
  const [logFor, setLogFor] = useState<DrillType | null>(null);
  const [logRec, setLogRec] = useState<DrillRecord | null>(null);

  useEffect(() => {
    try {
      const saved = loadItem<DrillData>(STORAGE_KEY, SINGLETON_ID);
      if (saved && saved.data) setData({ ...DEFAULT_DATA, ...saved.data });
    } catch { /* ignore */ }
  }, []);

  function persist(next: DrillData) {
    setData(next);
    try {
      saveItem(STORAGE_KEY, 'Drill Tracker', next, SINGLETON_ID);
      setSaveMsg('✓ Saved'); setTimeout(() => setSaveMsg(''), 2000);
    } catch { /* ignore */ }
  }
  function update<K extends keyof DrillData>(key: K, value: DrillData[K]) {
    const next = { ...data, [key]: value };
    setData(next);
    try { saveItem(STORAGE_KEY, 'Drill Tracker', next, SINGLETON_ID); } catch { /* ignore */ }
  }

  function openLog(dt: DrillType) {
    setLogFor(dt);
    setLogRec({ id: genId(), typeKey: dt.key, date: new Date().toISOString().slice(0, 10), participants: '', notes: '', performance: 'good' });
  }
  function saveLog() {
    if (!logRec) return;
    persist({ ...data, records: [logRec, ...data.records] });
    setLogFor(null); setLogRec(null);
  }
  function deleteRecord(id: string) {
    if (!confirm('Delete this drill record?')) return;
    persist({ ...data, records: data.records.filter((r) => r.id !== id) });
  }

  // status per drill type
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const status = useMemo(() => {
    return DRILL_TYPES.map((dt) => {
      const recs = data.records.filter((r) => r.typeKey === dt.key).sort((a, b) => b.date.localeCompare(a.date));
      const last = recs[0];
      let daysSince: number | null = null;
      let dueIn: number | null = null;
      let lastDate: string | null = null;
      if (last && last.date) {
        const ld = new Date(last.date + 'T00:00:00');
        if (!isNaN(ld.getTime())) {
          lastDate = last.date;
          daysSince = daysBetween(ld, today);
          const due = new Date(ld); due.setDate(due.getDate() + dt.intervalDays);
          dueIn = daysBetween(today, due);
        }
      }
      let state: 'overdue' | 'due-soon' | 'ok' | 'never' = 'never';
      if (last == null) state = 'never';
      else if (dueIn != null && dueIn < 0) state = 'overdue';
      else if (dueIn != null && dueIn <= 7) state = 'due-soon';
      else state = 'ok';
      return { dt, last, lastDate, daysSince, dueIn, state, count: recs.length };
    });
  }, [data.records, today]);

  const summary = useMemo(() => {
    const overdue = status.filter((s) => s.state === 'overdue').length;
    const dueSoon = status.filter((s) => s.state === 'due-soon').length;
    const never = status.filter((s) => s.state === 'never').length;
    return { overdue, dueSoon, never, total: data.records.length };
  }, [status, data.records]);

  const STATE_META: Record<string, { label: string; color: string; bg: string }> = {
    overdue: { label: 'OVERDUE', color: '#ff6b6b', bg: 'rgba(255,107,107,.16)' },
    'due-soon': { label: 'DUE SOON', color: '#e8b85a', bg: 'rgba(232,184,90,.14)' },
    ok: { label: 'OK', color: '#4caf76', bg: 'rgba(76,175,118,.14)' },
    never: { label: 'NOT LOGGED', color: '#7a8a72', bg: 'rgba(122,138,114,.14)' },
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>
          ⚓ Voyage Hub · Drill Tracker
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Drill <em style={g}>Tracker</em>
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          SOLAS-mandated drill schedule with next-due dates. Log each drill and the tracker flags what
          is overdue or coming up. Always follow your company SMS for exact intervals and content.
        </p>
      </div>

      {/* Vessel + action */}
      <div style={card}>
        <div className="dr-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          <div><label style={labelS}>Vessel</label><input style={inputStyle} value={data.vesselName} onChange={(e) => update('vesselName', e.target.value)} placeholder="MV NEURONAI" /></div>
          <div><label style={labelS}>IMO</label><input style={inputStyle} value={data.imo} onChange={(e) => update('imo', e.target.value)} placeholder="9876543" /></div>
        </div>
      </div>

      <div className="action-bar" style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => window.print()} style={ghostBtn}>🖨️ Print / PDF</button>
        {saveMsg && <span style={{ color: '#4caf76', fontFamily: rj, fontSize: 12, fontWeight: 600 }}>{saveMsg}</span>}
      </div>

      {/* Summary */}
      <div className="dr-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
        <KPI label="Overdue" value={String(summary.overdue)} color={summary.overdue > 0 ? '#ff6b6b' : '#4caf76'} />
        <KPI label="Due Soon" value={String(summary.dueSoon)} color={summary.dueSoon > 0 ? '#e8b85a' : '#4caf76'} />
        <KPI label="Not Logged" value={String(summary.never)} color="#7a8a72" />
        <KPI label="Total Drills" value={String(summary.total)} color="#c8a84b" />
      </div>

      {/* Log dialog */}
      {logFor && logRec && (
        <div style={{ ...card, borderColor: 'rgba(200,168,75,.5)' }}>
          <div style={sectionTitle}>{logFor.icon} Log: {logFor.name}</div>
          <div className="dr-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 10 }}>
            <div><label style={labelS}>Date</label><input style={inputStyle} type="date" value={logRec.date} onChange={(e) => setLogRec({ ...logRec, date: e.target.value })} /></div>
            <div>
              <label style={labelS}>Performance</label>
              <select style={inputStyle} value={logRec.performance} onChange={(e) => setLogRec({ ...logRec, performance: e.target.value as DrillRecord['performance'] })}>
                {(Object.keys(PERF_META) as DrillRecord['performance'][]).map((k) => <option key={k} value={k}>{PERF_META[k].label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}><label style={labelS}>Participants</label><input style={inputStyle} value={logRec.participants} onChange={(e) => setLogRec({ ...logRec, participants: e.target.value })} placeholder="All crew / deck dept / names" /></div>
          <div style={{ marginBottom: 12 }}><label style={labelS}>Notes / Scenario</label><textarea value={logRec.notes} onChange={(e) => setLogRec({ ...logRec, notes: e.target.value })} placeholder="Scenario, timings, deficiencies, lessons..." rows={2} style={{ ...inputStyle, minHeight: 52, resize: 'vertical' }} /></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={saveLog} style={{ ...goldBtn, padding: '8px 18px' }}>Save Drill</button>
            <button onClick={() => { setLogFor(null); setLogRec(null); }} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* Drill schedule */}
      <div style={card}>
        <div style={sectionTitle}>📅 Drill Schedule</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0 }}>
          {status.map((s) => {
            const sm = STATE_META[s.state];
            return (
              <div key={s.dt.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: '1px dashed rgba(200,168,75,.1)', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 220 }}>
                  <span style={{ fontSize: 18 }}>{s.dt.icon}</span>
                  <div>
                    <div style={{ fontFamily: rj, fontSize: 13.5, fontWeight: 700, color: '#f5f0e8' }}>{s.dt.name}</div>
                    <div style={{ fontFamily: rj, fontSize: 10, color: '#7a8a72' }}>{s.dt.ref}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'right', fontFamily: rj, fontSize: 11 }}>
                    {s.lastDate ? (
                      <>
                        <div style={{ color: '#b0c0a4' }}>Last: {s.lastDate} ({s.daysSince}d ago)</div>
                        <div style={{ color: s.state === 'overdue' ? '#ff6b6b' : s.state === 'due-soon' ? '#e8b85a' : '#4caf76' }}>
                          {s.dueIn != null && (s.dueIn < 0 ? `${Math.abs(s.dueIn)}d overdue` : `due in ${s.dueIn}d`)}
                        </div>
                      </>
                    ) : <div style={{ color: '#7a8a72' }}>No record yet</div>}
                  </div>
                  <span style={{ fontSize: 9, background: sm.bg, color: sm.color, padding: '3px 9px', borderRadius: 3, fontFamily: rj, fontWeight: 700, letterSpacing: '.5px', border: `1px solid ${sm.color}40`, whiteSpace: 'nowrap', minWidth: 84, textAlign: 'center' }}>{sm.label}</span>
                  <button onClick={() => openLog(s.dt)} style={{ ...goldBtn, padding: '6px 12px', fontSize: 10 }}>Log</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent records */}
      {data.records.length > 0 && (
        <div style={card}>
          <div style={sectionTitle}>📋 Drill History ({data.records.length})</div>
          {data.records.slice(0, 50).map((r) => {
            const dt = DRILL_TYPES.find((d) => d.key === r.typeKey);
            const pm = PERF_META[r.performance];
            return (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px dashed rgba(200,168,75,.1)' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: rj, fontSize: 12.5, color: '#f5f0e8', fontWeight: 600 }}>{dt?.icon} {dt?.name || r.typeKey} <span style={{ color: '#7a8a72', fontWeight: 400 }}>· {r.date}</span></div>
                  {r.participants && <div style={{ fontFamily: rj, fontSize: 11, color: '#7a8a72' }}>👥 {r.participants}</div>}
                  {r.notes && <div style={{ fontFamily: rj, fontSize: 11.5, color: '#b0c0a4', marginTop: 2, lineHeight: 1.5 }}>{r.notes}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: rj, fontSize: 10, color: pm.color, fontWeight: 700, whiteSpace: 'nowrap' }}>{pm.label}</span>
                  <button onClick={() => deleteRecord(r.id)} style={{ background: 'transparent', border: 'none', color: '#ff8a8a', cursor: 'pointer', fontSize: 12 }}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reference */}
      <div style={{ ...card, background: 'rgba(122,138,114,.05)', borderColor: 'rgba(122,138,114,.15)' }}>
        <div style={sectionTitle}>📖 Key SOLAS Intervals</div>
        <ul style={{ fontSize: 11.5, color: '#b0c0a4', lineHeight: 1.7, paddingLeft: 18, fontFamily: rj }}>
          <li>Fire &amp; abandon-ship drills: <b style={{ color: '#c8a84b' }}>monthly</b> (within 24 h of leaving port if &gt;25% of crew changed).</li>
          <li>Each lifeboat launched &amp; manoeuvred in water: <b style={{ color: '#c8a84b' }}>every 3 months</b>.</li>
          <li>Enclosed-space entry &amp; rescue drills: <b style={{ color: '#c8a84b' }}>every 2 months</b>.</li>
          <li>Emergency steering drills: <b style={{ color: '#c8a84b' }}>every 3 months</b> (SOLAS V/26).</li>
          <li>Intervals here are defaults — your company SMS, flag and ship type may require more. This is a tracking aid only.</li>
        </ul>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .dr-g3 { grid-template-columns: 1fr !important; }
          .dr-summary { grid-template-columns: 1fr 1fr !important; }
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

function KPI({ label: l, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: '#0c1610', border: '1px solid rgba(200,168,75,.2)', borderRadius: 4, padding: '12px 10px', textAlign: 'center' }}>
      <div style={{ fontFamily: rj, fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: '#7a8a72', fontWeight: 700 }}>{l}</div>
      <div style={{ fontFamily: lb, fontSize: 24, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
    </div>
  );
}
