'use client';
import { useState, useEffect, useMemo } from 'react';
import { saveItem, loadItem, genId } from '@/lib/voyage-storage';

const lb = "'Libre Bodoni', serif";
const rj = "'Rajdhani', sans-serif";
const g = { color: '#c8a84b', fontStyle: 'italic' } as React.CSSProperties;

// ============================================================
// TYPES
// ============================================================
type IType = 'nearmiss' | 'accident' | 'injury' | 'pollution' | 'equipment' | 'security' | 'cargo' | 'other';
type Severity = 'low' | 'medium' | 'high' | 'critical';
type Status = 'open' | 'investigating' | 'closed';

interface Incident {
  id: string;
  date: string;
  time: string;
  type: IType;
  severity: Severity;
  location: string;
  description: string;
  immediateAction: string;
  rootCause: string;
  corrective: string;
  status: Status;
  reportedBy: string;
  anonymous: boolean;
}

const TYPE_META: Record<IType, { label: string; icon: string }> = {
  nearmiss: { label: 'Near Miss', icon: '⚠️' },
  accident: { label: 'Accident', icon: '💥' },
  injury: { label: 'Personal Injury', icon: '🩹' },
  pollution: { label: 'Pollution', icon: '🛢️' },
  equipment: { label: 'Equipment Failure', icon: '🔧' },
  security: { label: 'Security', icon: '🛡️' },
  cargo: { label: 'Cargo Damage', icon: '📦' },
  other: { label: 'Other', icon: '📋' },
};

const SEV_META: Record<Severity, { label: string; color: string; bg: string }> = {
  low: { label: 'LOW', color: '#4caf76', bg: 'rgba(76,175,118,.14)' },
  medium: { label: 'MEDIUM', color: '#e8b85a', bg: 'rgba(232,184,90,.14)' },
  high: { label: 'HIGH', color: '#ff8a8a', bg: 'rgba(255,138,138,.14)' },
  critical: { label: 'CRITICAL', color: '#ff6b6b', bg: 'rgba(255,107,107,.2)' },
};

const STATUS_META: Record<Status, { label: string; color: string; bg: string }> = {
  open: { label: 'OPEN', color: '#ff8a8a', bg: 'rgba(255,138,138,.14)' },
  investigating: { label: 'INVESTIGATING', color: '#5aa6e8', bg: 'rgba(90,166,232,.14)' },
  closed: { label: 'CLOSED', color: '#4caf76', bg: 'rgba(76,175,118,.14)' },
};

// ============================================================
// STYLES
// ============================================================
const card: React.CSSProperties = { background: '#111c13', border: '1px solid rgba(200,168,75,.18)', padding: '20px 18px', borderRadius: 4, marginBottom: 16 };
const sectionTitle: React.CSSProperties = { fontFamily: rj, fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid rgba(200,168,75,.12)' };
const labelS: React.CSSProperties = { display: 'block', fontFamily: rj, fontSize: 10, letterSpacing: '.5px', textTransform: 'uppercase', color: '#7a8a72', fontWeight: 600, marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', background: '#0c1610', border: '1px solid rgba(200,168,75,.2)', color: '#f5f0e8', padding: '7px 9px', fontFamily: rj, fontSize: 12.5, fontWeight: 500, borderRadius: 3, boxSizing: 'border-box' };
const ghostBtn: React.CSSProperties = { background: 'transparent', color: '#c8a84b', border: '1px solid rgba(200,168,75,.4)', padding: '8px 14px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };
const goldBtn: React.CSSProperties = { background: '#c8a84b', color: '#08100a', border: 'none', padding: '8px 16px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };

const STORAGE_KEY = 'incidents';
const SINGLETON_ID = 'incidentlog';

// ============================================================
// COMPONENT
// ============================================================
export default function IncidentLogPage() {
  const [items, setItems] = useState<Incident[]>([]);
  const [editing, setEditing] = useState<Incident | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | IType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all');

  useEffect(() => {
    try {
      const saved = loadItem<{ items: Incident[] }>(STORAGE_KEY, SINGLETON_ID);
      if (saved && Array.isArray(saved.data.items)) setItems(saved.data.items);
    } catch { /* ignore */ }
  }, []);

  function persist(next: Incident[]) {
    setItems(next);
    try {
      saveItem(STORAGE_KEY, 'Incident Log', { items: next }, SINGLETON_ID);
      setSaveMsg('✓ Saved'); setTimeout(() => setSaveMsg(''), 2000);
    } catch { /* ignore */ }
  }

  function emptyIncident(): Incident {
    const now = new Date();
    return { id: genId(), date: now.toISOString().slice(0, 10), time: now.toTimeString().slice(0, 5), type: 'nearmiss', severity: 'low', location: '', description: '', immediateAction: '', rootCause: '', corrective: '', status: 'open', reportedBy: '', anonymous: false };
  }
  function openNew() { setEditing(emptyIncident()); setShowForm(true); }
  function openEdit(it: Incident) { setEditing({ ...it }); setShowForm(true); }
  function saveIncident() {
    if (!editing) return;
    const exists = items.some((i) => i.id === editing.id);
    persist(exists ? items.map((i) => (i.id === editing.id ? editing : i)) : [editing, ...items]);
    setShowForm(false); setEditing(null);
  }
  function deleteIncident(id: string) {
    if (!confirm('Delete this incident record?')) return;
    persist(items.filter((i) => i.id !== id));
  }

  const summary = useMemo(() => {
    const open = items.filter((i) => i.status !== 'closed').length;
    const high = items.filter((i) => i.severity === 'high' || i.severity === 'critical').length;
    const nearmiss = items.filter((i) => i.type === 'nearmiss').length;
    return { total: items.length, open, high, nearmiss };
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((i) => typeFilter === 'all' || i.type === typeFilter)
      .filter((i) => statusFilter === 'all' || i.status === statusFilter)
      .filter((i) => !q || [i.location, i.description, i.rootCause, i.corrective].some((f) => f.toLowerCase().includes(q)))
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  }, [items, query, typeFilter, statusFilter]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>
          ⚓ Voyage Hub · Incident Log
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Incident <em style={g}>Log</em>
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          Record near misses, accidents and equipment failures with root cause and corrective action.
          Reporting near misses is the cheapest safety investment a ship makes. Stored in your browser.
        </p>
      </div>

      {/* Action bar */}
      <div className="action-bar" style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={openNew} style={goldBtn}>+ Report Incident</button>
        <button onClick={() => window.print()} style={ghostBtn}>🖨️ Print / PDF</button>
        {saveMsg && <span style={{ color: '#4caf76', fontFamily: rj, fontSize: 12, fontWeight: 600 }}>{saveMsg}</span>}
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="inc-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
          <KPI label="Total" value={String(summary.total)} color="#f5f0e8" />
          <KPI label="Open" value={String(summary.open)} color={summary.open > 0 ? '#ff8a8a' : '#4caf76'} />
          <KPI label="High / Critical" value={String(summary.high)} color={summary.high > 0 ? '#ff6b6b' : '#4caf76'} />
          <KPI label="Near Misses" value={String(summary.nearmiss)} color="#5aa6e8" />
        </div>
      )}

      {/* Form */}
      {showForm && editing && (
        <div style={{ ...card, borderColor: 'rgba(200,168,75,.5)' }}>
          <div style={sectionTitle}>{items.some((i) => i.id === editing.id) ? 'Edit Incident' : 'Report Incident'}</div>
          <div className="inc-g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 10 }}>
            <div><label style={labelS}>Date</label><input style={inputStyle} type="date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} /></div>
            <div><label style={labelS}>Time</label><input style={inputStyle} type="time" value={editing.time} onChange={(e) => setEditing({ ...editing, time: e.target.value })} /></div>
            <div>
              <label style={labelS}>Type</label>
              <select style={inputStyle} value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value as IType })}>
                {(Object.keys(TYPE_META) as IType[]).map((k) => <option key={k} value={k}>{TYPE_META[k].label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelS}>Severity</label>
              <select style={inputStyle} value={editing.severity} onChange={(e) => setEditing({ ...editing, severity: e.target.value as Severity })}>
                {(Object.keys(SEV_META) as Severity[]).map((k) => <option key={k} value={k}>{SEV_META[k].label}</option>)}
              </select>
            </div>
          </div>
          <div className="inc-g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 10 }}>
            <div><label style={labelS}>Location</label><input style={inputStyle} value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} placeholder="Engine room / main deck / at berth" /></div>
            <div>
              <label style={labelS}>Status</label>
              <select style={inputStyle} value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as Status })}>
                {(Object.keys(STATUS_META) as Status[]).map((k) => <option key={k} value={k}>{STATUS_META[k].label}</option>)}
              </select>
            </div>
          </div>
          <Area label="Description — what happened" value={editing.description} onChange={(v) => setEditing({ ...editing, description: v })} placeholder="Describe the sequence of events..." />
          <Area label="Immediate Action Taken" value={editing.immediateAction} onChange={(v) => setEditing({ ...editing, immediateAction: v })} placeholder="What was done right away to make safe..." />
          <Area label="Root Cause (5-why / category)" value={editing.rootCause} onChange={(v) => setEditing({ ...editing, rootCause: v })} placeholder="Why did it happen? Underlying cause, not just the trigger." />
          <Area label="Corrective / Preventive Action" value={editing.corrective} onChange={(v) => setEditing({ ...editing, corrective: v })} placeholder="What will prevent recurrence? Owner & due date." />
          <div className="inc-g4" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginBottom: 12 }}>
            <div><label style={labelS}>Reported By</label><input style={inputStyle} value={editing.reportedBy} onChange={(e) => setEditing({ ...editing, reportedBy: e.target.value })} placeholder="Name / rank" disabled={editing.anonymous} /></div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: rj, fontSize: 12.5, color: editing.anonymous ? '#5aa6e8' : '#7a8a72', padding: '7px 0' }}>
                <input type="checkbox" checked={editing.anonymous} onChange={(e) => setEditing({ ...editing, anonymous: e.target.checked, reportedBy: e.target.checked ? '' : editing.reportedBy })} style={{ width: 16, height: 16, accentColor: '#5aa6e8' }} />
                Anonymous
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={saveIncident} style={{ ...goldBtn, padding: '8px 18px' }} disabled={!editing.description}>Save Record</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filters */}
      {items.length > 0 && (
        <div style={card}>
          <div style={{ marginBottom: 12 }}>
            <label style={labelS}>Search</label>
            <input style={inputStyle} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="location, description, root cause..." />
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 8 }}>
            <button onClick={() => setTypeFilter('all')} style={chip(typeFilter === 'all')}>All types</button>
            {(Object.keys(TYPE_META) as IType[]).map((k) => <button key={k} onClick={() => setTypeFilter(k)} style={chip(typeFilter === k)}>{TYPE_META[k].icon} {TYPE_META[k].label}</button>)}
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            <button onClick={() => setStatusFilter('all')} style={chip(statusFilter === 'all')}>All status</button>
            {(Object.keys(STATUS_META) as Status[]).map((k) => <button key={k} onClick={() => setStatusFilter(k)} style={chip(statusFilter === k)}>{STATUS_META[k].label}</button>)}
          </div>
        </div>
      )}

      {/* List */}
      {items.length === 0 && !showForm && (
        <div style={{ ...card, textAlign: 'center', color: '#7a8a72', fontFamily: rj }}>
          No incidents logged. Tap <b style={{ color: '#c8a84b' }}>+ Report Incident</b> to start. Reporting near misses prevents accidents.
        </div>
      )}
      {items.length > 0 && filtered.length === 0 && (
        <div style={{ ...card, textAlign: 'center', color: '#7a8a72', fontFamily: rj }}>No incidents match your filters.</div>
      )}

      {filtered.map((it) => {
        const tm = TYPE_META[it.type];
        const sm = SEV_META[it.severity];
        const stm = STATUS_META[it.status];
        return (
          <div key={it.id} style={{ ...card, borderColor: it.severity === 'critical' ? 'rgba(255,107,107,.5)' : it.status === 'open' ? 'rgba(255,138,138,.3)' : 'rgba(200,168,75,.18)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 18 }}>{tm.icon}</span>
                <div>
                  <div style={{ fontFamily: lb, fontSize: 15, fontWeight: 700, color: '#f5f0e8' }}>{tm.label}</div>
                  <div style={{ fontFamily: rj, fontSize: 10.5, color: '#7a8a72' }}>{it.date} {it.time}{it.location && ` · ${it.location}`}{it.anonymous ? ' · anonymous' : it.reportedBy ? ` · ${it.reportedBy}` : ''}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={badge(sm.color, sm.bg)}>{sm.label}</span>
                <span style={badge(stm.color, stm.bg)}>{stm.label}</span>
              </div>
            </div>

            {it.description && <p style={{ fontFamily: rj, fontSize: 12.5, color: '#b0c0a4', lineHeight: 1.55, marginBottom: 8 }}>{it.description}</p>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
              {it.immediateAction && <Field title="Immediate action" text={it.immediateAction} />}
              {it.rootCause && <Field title="Root cause" text={it.rootCause} />}
              {it.corrective && <Field title="Corrective action" text={it.corrective} />}
            </div>

            <div style={{ display: 'flex', gap: 14, marginTop: 10, paddingTop: 8, borderTop: '1px dashed rgba(200,168,75,.12)' }}>
              <button onClick={() => openEdit(it)} style={miniBtn('#c8a84b')}>Edit</button>
              <button onClick={() => deleteIncident(it.id)} style={miniBtn('#ff8a8a')}>Delete</button>
            </div>
          </div>
        );
      })}

      <style>{`
        @media (max-width: 720px) {
          .inc-g4 { grid-template-columns: 1fr 1fr !important; }
          .inc-summary { grid-template-columns: 1fr 1fr !important; }
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

function Area({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={labelS}>{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={2} style={{ ...inputStyle, minHeight: 52, resize: 'vertical' }} />
    </div>
  );
}
function Field({ title, text }: { title: string; text: string }) {
  return (
    <div style={{ background: '#0c1610', border: '1px solid rgba(200,168,75,.1)', borderRadius: 3, padding: '7px 10px' }}>
      <div style={{ fontFamily: rj, fontSize: 9, color: '#c8a84b', letterSpacing: '.5px', textTransform: 'uppercase', fontWeight: 700, marginBottom: 2 }}>{title}</div>
      <div style={{ fontFamily: rj, fontSize: 12, color: '#b0c0a4', lineHeight: 1.5 }}>{text}</div>
    </div>
  );
}
function chip(active: boolean): React.CSSProperties {
  return { padding: '5px 11px', background: active ? '#c8a84b' : 'transparent', color: active ? '#08100a' : '#7a8a72', border: `1px solid ${active ? '#c8a84b' : 'rgba(200,168,75,.25)'}`, fontFamily: rj, fontSize: 10, letterSpacing: '.5px', fontWeight: 700, cursor: 'pointer', borderRadius: 4, whiteSpace: 'nowrap' };
}
function badge(color: string, bg: string): React.CSSProperties {
  return { fontSize: 9, background: bg, color, padding: '2px 8px', borderRadius: 3, fontFamily: rj, fontWeight: 700, letterSpacing: '.5px', border: `1px solid ${color}40`, whiteSpace: 'nowrap' };
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
