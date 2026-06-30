'use client';
import { useState, useEffect, useMemo } from 'react';
import { saveItem, loadItem, genId } from '@/lib/voyage-storage';

const lb = "'Libre Bodoni', serif";
const rj = "'Rajdhani', sans-serif";
const g = { color: '#c8a84b', fontStyle: 'italic' } as React.CSSProperties;

// ============================================================
// TYPES
// ============================================================
type VStatus = 'sea' | 'port' | 'loading' | 'discharge' | 'anchor' | 'idle';
type Schedule = 'onschedule' | 'delayed' | 'ahead' | 'demurrage';

interface Vessel {
  id: string;
  name: string;
  imo: string;
  type: string;
  status: VStatus;
  schedule: Schedule;
  from: string;
  to: string;
  progress: number;      // %
  eta: string;           // date
  robVlsfo: number;
  robMgo: number;
  charterer: string;
  demurrage: number;     // current demurrage exposure $
  delayDays: number;     // +/- days vs schedule
  notes: string;
}

const STATUS_META: Record<VStatus, { label: string; icon: string; color: string }> = {
  sea: { label: 'At Sea', icon: '🌊', color: '#5aa6e8' },
  port: { label: 'In Port', icon: '🏴', color: '#c8a84b' },
  loading: { label: 'Loading', icon: '📥', color: '#4caf76' },
  discharge: { label: 'Discharge', icon: '📤', color: '#4caf76' },
  anchor: { label: 'At Anchor', icon: '⚓', color: '#b0c0a4' },
  idle: { label: 'Idle / Spot', icon: '⏸️', color: '#7a8a72' },
};

const SCHED_META: Record<Schedule, { label: string; color: string; bg: string }> = {
  onschedule: { label: 'ON SCHEDULE', color: '#4caf76', bg: 'rgba(76,175,118,.14)' },
  ahead: { label: 'AHEAD', color: '#4caf76', bg: 'rgba(76,175,118,.14)' },
  delayed: { label: 'DELAYED', color: '#ff8a8a', bg: 'rgba(255,138,138,.14)' },
  demurrage: { label: 'DEMURRAGE', color: '#e8b85a', bg: 'rgba(232,184,90,.14)' },
};

// ============================================================
// STYLES
// ============================================================
const card: React.CSSProperties = { background: '#111c13', border: '1px solid rgba(200,168,75,.18)', padding: '20px 18px', borderRadius: 4, marginBottom: 16 };
const sectionTitle: React.CSSProperties = { fontFamily: rj, fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid rgba(200,168,75,.12)' };
const label: React.CSSProperties = { display: 'block', fontFamily: rj, fontSize: 10, letterSpacing: '.5px', textTransform: 'uppercase', color: '#7a8a72', fontWeight: 600, marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', background: '#0c1610', border: '1px solid rgba(200,168,75,.2)', color: '#f5f0e8', padding: '7px 9px', fontFamily: rj, fontSize: 12.5, fontWeight: 500, borderRadius: 3, boxSizing: 'border-box' };
const ghostBtn: React.CSSProperties = { background: 'transparent', color: '#c8a84b', border: '1px solid rgba(200,168,75,.4)', padding: '8px 14px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };
const goldBtn: React.CSSProperties = { background: '#c8a84b', color: '#08100a', border: 'none', padding: '8px 16px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };

const STORAGE_KEY = 'fleet';
const SINGLETON_ID = 'fleetboard';

// ============================================================
// COMPONENT
// ============================================================
export default function FleetDashboardPage() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [editing, setEditing] = useState<Vessel | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | VStatus>('all');

  useEffect(() => {
    try {
      const saved = loadItem<{ vessels: Vessel[] }>(STORAGE_KEY, SINGLETON_ID);
      if (saved && Array.isArray(saved.data.vessels)) setVessels(saved.data.vessels);
    } catch { /* ignore */ }
  }, []);

  function persist(next: Vessel[]) {
    setVessels(next);
    try {
      saveItem(STORAGE_KEY, 'Fleet Dashboard', { vessels: next }, SINGLETON_ID);
      setSaveMsg('✓ Saved');
      setTimeout(() => setSaveMsg(''), 2000);
    } catch { /* ignore */ }
  }
  function num(v: string): number { return parseFloat(v) || 0; }

  function emptyVessel(): Vessel {
    return { id: genId(), name: '', imo: '', type: 'Bulk Carrier', status: 'sea', schedule: 'onschedule', from: '', to: '', progress: 0, eta: '', robVlsfo: 0, robMgo: 0, charterer: '', demurrage: 0, delayDays: 0, notes: '' };
  }
  function openNew() { setEditing(emptyVessel()); setShowForm(true); }
  function openEdit(v: Vessel) { setEditing({ ...v }); setShowForm(true); }
  function saveVessel() {
    if (!editing) return;
    const exists = vessels.some((v) => v.id === editing.id);
    persist(exists ? vessels.map((v) => (v.id === editing.id ? editing : v)) : [...vessels, editing]);
    setShowForm(false); setEditing(null);
  }
  function deleteVessel(id: string) {
    if (!confirm('Remove this vessel from the dashboard?')) return;
    persist(vessels.filter((v) => v.id !== id));
  }

  const summary = useMemo(() => {
    const atSea = vessels.filter((v) => v.status === 'sea' || v.status === 'anchor').length;
    const inPort = vessels.filter((v) => v.status === 'port' || v.status === 'loading' || v.status === 'discharge').length;
    const delayed = vessels.filter((v) => v.schedule === 'delayed').length;
    const totalDem = vessels.reduce((s, v) => s + (v.demurrage || 0), 0);
    return { total: vessels.length, atSea, inPort, delayed, totalDem };
  }, [vessels]);

  const filtered = useMemo(() => {
    return vessels
      .filter((v) => statusFilter === 'all' || v.status === statusFilter)
      .sort((a, b) => {
        const order: Record<Schedule, number> = { demurrage: 0, delayed: 1, onschedule: 2, ahead: 3 };
        return order[a.schedule] - order[b.schedule];
      });
  }, [vessels, statusFilter]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>
          ⚓ Voyage Hub · Fleet Dashboard
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Fleet <em style={g}>Dashboard</em>
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          All your vessels on one screen — status, voyage progress, ETA, ROB and demurrage exposure.
          Delayed and demurrage vessels float to the top. Stored in your browser.
        </p>
      </div>

      {/* Action bar */}
      <div className="action-bar" style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={openNew} style={goldBtn}>+ Add Vessel</button>
        <button onClick={() => window.print()} style={ghostBtn}>🖨️ Print / PDF</button>
        {saveMsg && <span style={{ color: '#4caf76', fontFamily: rj, fontSize: 12, fontWeight: 600 }}>{saveMsg}</span>}
      </div>

      {/* Summary */}
      {vessels.length > 0 && (
        <div className="fleet-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 16 }}>
          <KPI label="Vessels" value={String(summary.total)} color="#f5f0e8" />
          <KPI label="At Sea" value={String(summary.atSea)} color="#5aa6e8" />
          <KPI label="In Port" value={String(summary.inPort)} color="#c8a84b" />
          <KPI label="Delayed" value={String(summary.delayed)} color={summary.delayed > 0 ? '#ff8a8a' : '#4caf76'} />
          <KPI label="Demurrage" value={summary.totalDem > 0 ? `$${(summary.totalDem / 1000).toFixed(0)}k` : '$0'} color={summary.totalDem > 0 ? '#e8b85a' : '#4caf76'} />
        </div>
      )}

      {/* Form */}
      {showForm && editing && (
        <div style={{ ...card, borderColor: 'rgba(200,168,75,.5)' }}>
          <div style={sectionTitle}>{vessels.some((v) => v.id === editing.id) ? 'Edit Vessel' : 'Add Vessel'}</div>
          <div className="fleet-g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 10 }}>
            <div><label style={label}>Vessel Name</label><input style={inputStyle} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="MV NEURONAI" /></div>
            <div><label style={label}>IMO</label><input style={inputStyle} value={editing.imo} onChange={(e) => setEditing({ ...editing, imo: e.target.value })} placeholder="9876543" /></div>
            <div><label style={label}>Type</label><input style={inputStyle} value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })} placeholder="Bulk Carrier" /></div>
            <div><label style={label}>Charterer</label><input style={inputStyle} value={editing.charterer} onChange={(e) => setEditing({ ...editing, charterer: e.target.value })} placeholder="ABC Chartering" /></div>
          </div>
          <div className="fleet-g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={label}>Status</label>
              <select style={inputStyle} value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as VStatus })}>
                {(Object.keys(STATUS_META) as VStatus[]).map((k) => <option key={k} value={k}>{STATUS_META[k].label}</option>)}
              </select>
            </div>
            <div>
              <label style={label}>Schedule</label>
              <select style={inputStyle} value={editing.schedule} onChange={(e) => setEditing({ ...editing, schedule: e.target.value as Schedule })}>
                {(Object.keys(SCHED_META) as Schedule[]).map((k) => <option key={k} value={k}>{SCHED_META[k].label}</option>)}
              </select>
            </div>
            <div><label style={label}>From</label><input style={inputStyle} value={editing.from} onChange={(e) => setEditing({ ...editing, from: e.target.value })} placeholder="Tubarão" /></div>
            <div><label style={label}>To</label><input style={inputStyle} value={editing.to} onChange={(e) => setEditing({ ...editing, to: e.target.value })} placeholder="Qingdao" /></div>
          </div>
          <div className="fleet-g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 10 }}>
            <div><label style={label}>Progress (%)</label><input style={inputStyle} type="number" value={editing.progress || ''} onChange={(e) => setEditing({ ...editing, progress: num(e.target.value) })} placeholder="45" /></div>
            <div><label style={label}>ETA</label><input style={inputStyle} type="date" value={editing.eta} onChange={(e) => setEditing({ ...editing, eta: e.target.value })} /></div>
            <div><label style={label}>Delay (± days)</label><input style={inputStyle} type="number" step="0.1" value={editing.delayDays || ''} onChange={(e) => setEditing({ ...editing, delayDays: num(e.target.value) })} placeholder="0" /></div>
            <div><label style={label}>Demurrage ($)</label><input style={inputStyle} type="number" value={editing.demurrage || ''} onChange={(e) => setEditing({ ...editing, demurrage: num(e.target.value) })} placeholder="0" /></div>
          </div>
          <div className="fleet-g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 10 }}>
            <div><label style={label}>ROB VLSFO (MT)</label><input style={inputStyle} type="number" value={editing.robVlsfo || ''} onChange={(e) => setEditing({ ...editing, robVlsfo: num(e.target.value) })} placeholder="650" /></div>
            <div><label style={label}>ROB MGO (MT)</label><input style={inputStyle} type="number" value={editing.robMgo || ''} onChange={(e) => setEditing({ ...editing, robMgo: num(e.target.value) })} placeholder="80" /></div>
          </div>
          <div style={{ marginBottom: 12 }}><label style={label}>Notes</label><input style={inputStyle} value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} placeholder="Next port, agent, issues..." /></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={saveVessel} style={{ ...goldBtn, padding: '8px 18px' }} disabled={!editing.name}>Save Vessel</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filter */}
      {vessels.length > 0 && (
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 14 }}>
          <button onClick={() => setStatusFilter('all')} style={chip(statusFilter === 'all')}>All</button>
          {(Object.keys(STATUS_META) as VStatus[]).map((k) => (
            <button key={k} onClick={() => setStatusFilter(k)} style={chip(statusFilter === k)}>{STATUS_META[k].icon} {STATUS_META[k].label}</button>
          ))}
        </div>
      )}

      {/* Vessel cards */}
      {vessels.length === 0 && !showForm && (
        <div style={{ ...card, textAlign: 'center', color: '#7a8a72', fontFamily: rj }}>
          No vessels yet. Tap <b style={{ color: '#c8a84b' }}>+ Add Vessel</b> to build your fleet view.
        </div>
      )}

      {filtered.map((v) => {
        const sm = STATUS_META[v.status];
        const sch = SCHED_META[v.schedule];
        return (
          <div key={v.id} style={{ ...card, borderColor: v.schedule === 'delayed' ? 'rgba(255,138,138,.4)' : v.schedule === 'demurrage' ? 'rgba(232,184,90,.4)' : 'rgba(200,168,75,.18)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: lb, fontSize: 17, fontWeight: 700, color: '#f5f0e8' }}>{v.name}</span>
                  <span style={{ fontSize: 9, background: sch.bg, color: sch.color, padding: '2px 8px', borderRadius: 3, fontFamily: rj, fontWeight: 700, letterSpacing: '.5px', border: `1px solid ${sch.color}40` }}>{sch.label}</span>
                </div>
                <div style={{ fontFamily: rj, fontSize: 11, color: '#7a8a72', marginTop: 3, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {v.imo && <span>IMO {v.imo}</span>}
                  {v.type && <span>{v.type}</span>}
                  {v.charterer && <span>· {v.charterer}</span>}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: rj, fontSize: 12, color: sm.color, fontWeight: 700 }}>{sm.icon} {sm.label}</div>
                {v.eta && <div style={{ fontFamily: rj, fontSize: 11, color: '#b0c0a4' }}>ETA {v.eta}{v.delayDays ? ` (${v.delayDays > 0 ? '+' : ''}${v.delayDays}d)` : ''}</div>}
              </div>
            </div>

            {/* route + progress */}
            {(v.from || v.to) && (
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: rj, fontSize: 12, color: '#b0c0a4', marginBottom: 5 }}>
                  <span>{v.from || '—'} → {v.to || '—'}</span>
                  <span style={{ color: '#c8a84b', fontWeight: 700 }}>{v.progress}%</span>
                </div>
                <div style={{ height: 8, background: '#0c1610', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(200,168,75,.2)' }}>
                  <div style={{ width: `${Math.min(100, Math.max(0, v.progress))}%`, height: '100%', background: v.schedule === 'delayed' ? 'linear-gradient(90deg,#ff8a8a,#e8b85a)' : 'linear-gradient(90deg,#c8a84b,#4caf76)' }} />
                </div>
              </div>
            )}

            {/* stats row */}
            <div style={{ display: 'flex', gap: 18, marginTop: 12, flexWrap: 'wrap', fontFamily: rj, fontSize: 12 }}>
              {(v.robVlsfo > 0 || v.robMgo > 0) && (
                <span style={{ color: '#7a8a72' }}>⛽ ROB: <b style={{ color: '#f5f0e8' }}>{v.robVlsfo} VLSFO · {v.robMgo} MGO MT</b></span>
              )}
              {v.demurrage > 0 && (
                <span style={{ color: '#7a8a72' }}>💰 Demurrage: <b style={{ color: '#e8b85a' }}>${v.demurrage.toLocaleString('en-US')}</b></span>
              )}
            </div>

            {v.notes && <p style={{ fontFamily: rj, fontSize: 11, color: '#7a8a72', marginTop: 10, lineHeight: 1.5 }}>{v.notes}</p>}

            <div style={{ display: 'flex', gap: 14, marginTop: 12, paddingTop: 10, borderTop: '1px dashed rgba(200,168,75,.12)', flexWrap: 'wrap' }}>
              <button onClick={() => openEdit(v)} style={miniBtn('#c8a84b')}>Edit</button>
              <a href="/voyage/tracker" style={{ ...miniBtn('#5aa6e8'), textDecoration: 'none' }}>Tracker →</a>
              <a href="/voyage/noon" style={{ ...miniBtn('#5aa6e8'), textDecoration: 'none' }}>Noon →</a>
              <a href="/voyage/claims" style={{ ...miniBtn('#5aa6e8'), textDecoration: 'none' }}>Claims →</a>
              <button onClick={() => deleteVessel(v.id)} style={miniBtn('#ff8a8a')}>Remove</button>
            </div>
          </div>
        );
      })}

      <style>{`
        @media (max-width: 900px) { .fleet-summary { grid-template-columns: repeat(3,1fr) !important; } }
        @media (max-width: 720px) {
          .fleet-g4 { grid-template-columns: 1fr 1fr !important; }
          .fleet-summary { grid-template-columns: 1fr 1fr !important; }
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

function chip(active: boolean): React.CSSProperties {
  return { padding: '5px 11px', background: active ? '#c8a84b' : 'transparent', color: active ? '#08100a' : '#7a8a72', border: `1px solid ${active ? '#c8a84b' : 'rgba(200,168,75,.25)'}`, fontFamily: rj, fontSize: 10, letterSpacing: '.5px', fontWeight: 700, cursor: 'pointer', borderRadius: 4, whiteSpace: 'nowrap' };
}
function miniBtn(color: string): React.CSSProperties {
  return { background: 'transparent', border: 'none', color, fontFamily: rj, fontSize: 10.5, cursor: 'pointer', letterSpacing: '.5px', textTransform: 'uppercase', fontWeight: 700, padding: 0 };
}
function KPI({ label: l, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: '#0c1610', border: '1px solid rgba(200,168,75,.2)', borderRadius: 4, padding: '12px 10px', textAlign: 'center' }}>
      <div style={{ fontFamily: rj, fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: '#7a8a72', fontWeight: 700 }}>{l}</div>
      <div style={{ fontFamily: lb, fontSize: 24, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
    </div>
  );
}
