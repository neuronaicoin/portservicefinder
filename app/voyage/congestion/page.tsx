'use client';
import { useState, useEffect, useMemo } from 'react';
import { saveItem, loadItem, genId } from '@/lib/voyage-storage';

const lb = "'Libre Bodoni', serif";
const rj = "'Rajdhani', sans-serif";
const g = { color: '#c8a84b', fontStyle: 'italic' } as React.CSSProperties;

// ============================================================
// TYPES
// ============================================================
interface CongReport {
  id: string;
  port: string;
  date: string;
  waiting: number;      // vessels waiting
  avgWaitDays: number;  // average wait (days)
  berthsFree: number;
  source: string;       // agent / observation
  notes: string;
}

interface CongData {
  reports: CongReport[];
  // my vessel berth estimate
  myEta: string;
  myPort: string;
}

function newReport(): CongReport {
  return { id: genId(), port: '', date: new Date().toISOString().slice(0, 10), waiting: 0, avgWaitDays: 0, berthsFree: 0, source: '', notes: '' };
}

const DEFAULT_DATA: CongData = { reports: [], myEta: '', myPort: '' };

function congestionLevel(days: number): { label: string; color: string; bg: string } {
  if (days <= 0) return { label: 'No data', color: '#7a8a72', bg: 'rgba(122,138,114,.12)' };
  if (days < 1) return { label: 'CLEAR', color: '#4caf76', bg: 'rgba(76,175,118,.12)' };
  if (days < 3) return { label: 'LIGHT', color: '#8bc34a', bg: 'rgba(139,195,74,.12)' };
  if (days < 7) return { label: 'MODERATE', color: '#e8b85a', bg: 'rgba(232,184,90,.12)' };
  if (days < 14) return { label: 'HEAVY', color: '#ff8a8a', bg: 'rgba(255,138,138,.12)' };
  return { label: 'SEVERE', color: '#ff6b6b', bg: 'rgba(255,107,107,.14)' };
}

function addDays(dateStr: string, days: number): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + Math.round(days));
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
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

const STORAGE_KEY = 'congestion';
const SINGLETON_ID = 'congtracker';

// ============================================================
// COMPONENT
// ============================================================
export default function CongestionPage() {
  const [data, setData] = useState<CongData>(DEFAULT_DATA);
  const [saveMsg, setSaveMsg] = useState('');
  const [editing, setEditing] = useState<CongReport | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    try {
      const saved = loadItem<CongData>(STORAGE_KEY, SINGLETON_ID);
      if (saved && saved.data && Array.isArray(saved.data.reports)) setData({ ...DEFAULT_DATA, ...saved.data });
    } catch { /* ignore */ }
  }, []);

  function persist(next: CongData) {
    setData(next);
    try { saveItem(STORAGE_KEY, 'Port Congestion', next, SINGLETON_ID); setSaveMsg('✓ Saved'); setTimeout(() => setSaveMsg(''), 2000); } catch { /* ignore */ }
  }
  function update<K extends keyof CongData>(key: K, value: CongData[K]) { persist({ ...data, [key]: value }); }
  function num(v: string): number { return parseFloat(v) || 0; }

  function openNew() { setEditing(newReport()); setShowForm(true); }
  function openEdit(r: CongReport) { setEditing({ ...r }); setShowForm(true); }
  function saveReport() {
    if (!editing) return;
    const exists = data.reports.some((x) => x.id === editing.id);
    persist({ ...data, reports: exists ? data.reports.map((x) => (x.id === editing.id ? editing : x)) : [...data.reports, editing] });
    setShowForm(false); setEditing(null);
  }
  function delReport(id: string) {
    if (!confirm('Delete this report?')) return;
    persist({ ...data, reports: data.reports.filter((x) => x.id !== id) });
  }

  // latest per port, sorted by wait desc
  const latestByPort = useMemo(() => {
    const byPort: Record<string, CongReport> = {};
    data.reports.forEach((r) => {
      const key = r.port.trim().toLowerCase() || '—';
      if (!byPort[key] || r.date > byPort[key].date) byPort[key] = r;
    });
    return Object.values(byPort).sort((a, b) => b.avgWaitDays - a.avgWaitDays);
  }, [data.reports]);

  // my vessel berth estimate — use latest report for myPort
  const myPortReport = useMemo(() => {
    if (!data.myPort.trim()) return null;
    const key = data.myPort.trim().toLowerCase();
    return latestByPort.find((r) => r.port.trim().toLowerCase() === key) || null;
  }, [data.myPort, latestByPort]);

  const estBerth = myPortReport && data.myEta ? addDays(data.myEta, myPortReport.avgWaitDays) : '';

  const allReportsForPortSorted = useMemo(() => {
    return [...data.reports].sort((a, b) => (b.date + b.port).localeCompare(a.date + a.port));
  }, [data.reports]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>
          ⚓ Voyage Hub · Port Congestion
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Port <em style={g}>Congestion</em>
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          Log congestion from agent reports and your own observations — vessels waiting and average wait —
          then estimate your berthing date from your ETA. You enter the data; no live AIS feed.
        </p>
      </div>

      {/* Info */}
      <div style={{ ...card, background: 'rgba(90,166,232,.06)', borderColor: 'rgba(90,166,232,.3)', padding: '12px 16px' }}>
        <div style={{ fontFamily: rj, fontSize: 12, color: '#9fc6ef', lineHeight: 1.5 }}>
          💡 Ask your agent for the waiting count and average waiting time, log it here, and the tool ranks ports
          and projects when your ship is likely to get a berth.
        </div>
      </div>

      <div className="action-bar" style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={openNew} style={goldBtn}>+ Add Report</button>
        <button onClick={() => window.print()} style={ghostBtn}>🖨️ Print / PDF</button>
        {saveMsg && <span style={{ color: '#4caf76', fontFamily: rj, fontSize: 12, fontWeight: 600 }}>{saveMsg}</span>}
      </div>

      {/* My vessel estimate */}
      <div style={card}>
        <div style={sectionTitle}>My Berthing Estimate</div>
        <div className="cg-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          <div><label style={labelS}>My Port</label><input style={inputStyle} value={data.myPort} onChange={(e) => update('myPort', e.target.value)} placeholder="Santos" /></div>
          <div><label style={labelS}>My ETA</label><input style={inputStyle} type="date" value={data.myEta} onChange={(e) => update('myEta', e.target.value)} /></div>
        </div>
        {myPortReport && data.myEta ? (
          <div style={{ marginTop: 12, padding: '12px 14px', background: '#0c1610', border: '1px solid rgba(200,168,75,.3)', borderRadius: 4 }}>
            <div style={{ fontFamily: rj, fontSize: 12, color: '#b0c0a4', lineHeight: 1.6 }}>
              Latest for <b style={{ color: '#c8a84b' }}>{myPortReport.port}</b> ({myPortReport.date}): {myPortReport.waiting} waiting, avg <b style={{ color: '#e8b85a' }}>{myPortReport.avgWaitDays} days</b>.
            </div>
            <div style={{ fontFamily: lb, fontSize: 17, fontWeight: 700, color: '#4caf76', marginTop: 6 }}>
              Estimated berth: {estBerth}
            </div>
          </div>
        ) : (
          <p style={{ fontFamily: rj, fontSize: 11, color: '#7a8a72', marginTop: 10 }}>Enter a port that has a report below, plus your ETA, to project a berthing date.</p>
        )}
      </div>

      {/* Form */}
      {showForm && editing && (
        <div style={{ ...card, borderColor: 'rgba(200,168,75,.5)' }}>
          <div style={sectionTitle}>{data.reports.some((x) => x.id === editing.id) ? 'Edit Report' : 'New Congestion Report'}</div>
          <div className="cg-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 10 }}>
            <div><label style={labelS}>Port</label><input style={inputStyle} value={editing.port} onChange={(e) => setEditing({ ...editing, port: e.target.value })} placeholder="Santos" /></div>
            <div><label style={labelS}>Date</label><input style={inputStyle} type="date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} /></div>
          </div>
          <div className="cg-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 10 }}>
            <div><label style={labelS}>Vessels Waiting</label><input style={inputStyle} type="number" value={editing.waiting || ''} onChange={(e) => setEditing({ ...editing, waiting: num(e.target.value) })} placeholder="18" /></div>
            <div><label style={labelS}>Avg Wait (days)</label><input style={inputStyle} type="number" step="0.1" value={editing.avgWaitDays || ''} onChange={(e) => setEditing({ ...editing, avgWaitDays: num(e.target.value) })} placeholder="5.5" /></div>
            <div><label style={labelS}>Berths Free</label><input style={inputStyle} type="number" value={editing.berthsFree || ''} onChange={(e) => setEditing({ ...editing, berthsFree: num(e.target.value) })} placeholder="0" /></div>
          </div>
          <div className="cg-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 12 }}>
            <div><label style={labelS}>Source</label><input style={inputStyle} value={editing.source} onChange={(e) => setEditing({ ...editing, source: e.target.value })} placeholder="Agent / own observation" /></div>
            <div><label style={labelS}>Notes</label><input style={inputStyle} value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} placeholder="Weather, strikes, tide windows..." /></div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={saveReport} style={{ ...goldBtn, padding: '8px 18px' }} disabled={!editing.port}>Save Report</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* Port ranking */}
      {latestByPort.length > 0 && (
        <div style={card}>
          <div style={sectionTitle}>⚡ Congestion by Port (latest)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {latestByPort.map((r) => {
              const lvl = congestionLevel(r.avgWaitDays);
              return (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: lvl.bg, border: `1px solid ${lvl.color}40`, borderRadius: 4, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <span style={{ fontFamily: lb, fontSize: 15, fontWeight: 700, color: '#f5f0e8' }}>{r.port}</span>
                    <span style={{ fontFamily: rj, fontSize: 11, color: '#7a8a72', marginLeft: 8 }}>{r.date}{r.source ? ` · ${r.source}` : ''}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: rj }}>
                    <span style={{ fontSize: 12, color: '#b0c0a4' }}>🚢 {r.waiting} waiting</span>
                    <span style={{ fontSize: 13, color: '#f5f0e8', fontWeight: 700 }}>{r.avgWaitDays}d avg</span>
                    <span style={{ fontSize: 9, background: `${lvl.color}22`, color: lvl.color, padding: '3px 9px', borderRadius: 3, fontWeight: 700, letterSpacing: '.5px', border: `1px solid ${lvl.color}40` }}>{lvl.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All reports log */}
      {data.reports.length === 0 && !showForm && (
        <div style={{ ...card, textAlign: 'center', color: '#7a8a72', fontFamily: rj }}>
          No reports yet. Tap <b style={{ color: '#c8a84b' }}>+ Add Report</b> to log congestion.
        </div>
      )}

      {data.reports.length > 0 && (
        <div style={card}>
          <div style={sectionTitle}>Report History ({data.reports.length})</div>
          {allReportsForPortSorted.map((r) => {
            const lvl = congestionLevel(r.avgWaitDays);
            return (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px dashed rgba(200,168,75,.1)', fontFamily: rj, gap: 10, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0 }}>
                  <span style={{ color: '#f5f0e8', fontSize: 12.5, fontWeight: 600 }}>{r.port}</span>
                  <span style={{ color: '#7a8a72', fontSize: 11, marginLeft: 8 }}>{r.date}</span>
                  {r.notes && <div style={{ color: '#7a8a72', fontSize: 11 }}>{r.notes}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 11, color: '#b0c0a4' }}>{r.waiting} / {r.avgWaitDays}d</span>
                  <span style={{ fontSize: 9, color: lvl.color, fontWeight: 700 }}>{lvl.label}</span>
                  <button onClick={() => openEdit(r)} style={miniBtn('#c8a84b')}>Edit</button>
                  <button onClick={() => delReport(r.id)} style={miniBtn('#ff8a8a')}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Note */}
      <div style={{ ...card, background: 'rgba(122,138,114,.05)', borderColor: 'rgba(122,138,114,.15)' }}>
        <div style={sectionTitle}>📖 Congestion Bands</div>
        <ul style={{ fontSize: 11.5, color: '#b0c0a4', lineHeight: 1.7, paddingLeft: 18, fontFamily: rj }}>
          <li><b style={{ color: '#4caf76' }}>Clear / Light</b> &lt; 3 days · <b style={{ color: '#e8b85a' }}>Moderate</b> 3–7 days · <b style={{ color: '#ff8a8a' }}>Heavy</b> 7–14 days · <b style={{ color: '#ff6b6b' }}>Severe</b> &gt; 14 days average wait.</li>
          <li>Berth estimate = your ETA + the latest average wait for that port. It is an indication only.</li>
          <li>Congestion shifts daily with weather, labour and cargo flow — refresh the figure from your agent before relying on it.</li>
        </ul>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .cg-g3 { grid-template-columns: 1fr !important; }
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

function miniBtn(color: string): React.CSSProperties {
  return { background: 'transparent', border: 'none', color, fontFamily: rj, fontSize: 10.5, cursor: 'pointer', letterSpacing: '.5px', textTransform: 'uppercase', fontWeight: 700, padding: 0 };
}
