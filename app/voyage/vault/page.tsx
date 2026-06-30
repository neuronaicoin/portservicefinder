'use client';
import { useState, useEffect, useMemo } from 'react';
import { saveItem, loadItem, genId } from '@/lib/voyage-storage';

const lb = "'Libre Bodoni', serif";
const rj = "'Rajdhani', sans-serif";
const g = { color: '#c8a84b', fontStyle: 'italic' } as React.CSSProperties;

// ============================================================
// TYPES
// ============================================================
type DocType = 'statutory' | 'class' | 'crew' | 'insurance' | 'other';

interface Doc {
  id: string;
  name: string;
  type: DocType;
  number: string;
  authority: string;
  issueDate: string;
  expiryDate: string;
  notes: string;
}

interface VaultData {
  vesselName: string;
  imo: string;
  docs: Doc[];
}

const TYPE_META: Record<DocType, { label: string; icon: string }> = {
  statutory: { label: 'Statutory', icon: '📜' },
  class: { label: 'Class', icon: '📐' },
  crew: { label: 'Crew', icon: '👤' },
  insurance: { label: 'Insurance', icon: '🛡️' },
  other: { label: 'Other', icon: '📄' },
};

const TEMPLATES: { name: string; type: DocType; authority: string }[] = [
  { name: 'Safety Management Certificate (SMC)', type: 'statutory', authority: 'Flag / RO' },
  { name: 'Document of Compliance (DOC)', type: 'statutory', authority: 'Flag / RO' },
  { name: 'International Ship Security Certificate (ISSC)', type: 'statutory', authority: 'Flag / RO' },
  { name: 'IOPP Certificate', type: 'statutory', authority: 'Flag / RO' },
  { name: 'IAPP Certificate', type: 'statutory', authority: 'Flag / RO' },
  { name: 'International Load Line Certificate', type: 'statutory', authority: 'Class' },
  { name: 'Safety Construction Certificate', type: 'statutory', authority: 'Class' },
  { name: 'Safety Equipment Certificate', type: 'statutory', authority: 'Class' },
  { name: 'Safety Radio Certificate', type: 'statutory', authority: 'Flag / RO' },
  { name: 'Maritime Labour Certificate (MLC)', type: 'statutory', authority: 'Flag / RO' },
  { name: 'Class Certificate (Hull & Machinery)', type: 'class', authority: 'Class society' },
  { name: 'P&I Certificate of Entry', type: 'insurance', authority: 'P&I Club' },
  { name: 'Hull & Machinery Insurance', type: 'insurance', authority: 'Underwriter' },
  { name: 'CLC / Bunker Convention Certificate', type: 'statutory', authority: 'Flag' },
];

function newDoc(name = '', type: DocType = 'statutory', authority = ''): Doc {
  return { id: genId(), name, type, number: '', authority, issueDate: '', expiryDate: '', notes: '' };
}

const DEFAULT_DATA: VaultData = { vesselName: '', imo: '', docs: [] };

// ============================================================
// CALC
// ============================================================
function daysToExpiry(expiry: string): number | null {
  if (!expiry) return null;
  const d = new Date(expiry + 'T00:00:00');
  if (isNaN(d.getTime())) return null;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 86400000);
}
function expiryState(days: number | null): 'expired' | 'critical' | 'warning' | 'ok' | 'none' {
  if (days == null) return 'none';
  if (days < 0) return 'expired';
  if (days <= 30) return 'critical';
  if (days <= 90) return 'warning';
  return 'ok';
}
function prettyDate(s: string): string {
  if (!s) return '—';
  const d = new Date(s + 'T00:00:00');
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
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

const STORAGE_KEY = 'vault';
const SINGLETON_ID = 'docvault';

const STATE_META: Record<string, { label: string; color: string; bg: string }> = {
  expired: { label: 'EXPIRED', color: '#ff6b6b', bg: 'rgba(255,107,107,.16)' },
  critical: { label: '≤30 DAYS', color: '#ff8a8a', bg: 'rgba(255,138,138,.14)' },
  warning: { label: '≤90 DAYS', color: '#e8b85a', bg: 'rgba(232,184,90,.14)' },
  ok: { label: 'VALID', color: '#4caf76', bg: 'rgba(76,175,118,.14)' },
  none: { label: 'NO DATE', color: '#7a8a72', bg: 'rgba(122,138,114,.14)' },
};

// ============================================================
// COMPONENT
// ============================================================
export default function VaultPage() {
  const [data, setData] = useState<VaultData>(DEFAULT_DATA);
  const [saveMsg, setSaveMsg] = useState('');
  const [filter, setFilter] = useState<'all' | DocType>('all');
  const [editing, setEditing] = useState<Doc | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    try {
      const saved = loadItem<VaultData>(STORAGE_KEY, SINGLETON_ID);
      if (saved && saved.data && Array.isArray(saved.data.docs)) setData({ ...DEFAULT_DATA, ...saved.data });
    } catch { /* ignore */ }
  }, []);

  function persist(next: VaultData) {
    setData(next);
    try { saveItem(STORAGE_KEY, 'Document Vault', next, SINGLETON_ID); setSaveMsg('✓ Saved'); setTimeout(() => setSaveMsg(''), 2000); } catch { /* ignore */ }
  }
  function update<K extends keyof VaultData>(key: K, value: VaultData[K]) { persist({ ...data, [key]: value }); }

  function openNew() { setEditing(newDoc()); setShowForm(true); setShowTemplates(false); }
  function openEdit(d: Doc) { setEditing({ ...d }); setShowForm(true); }
  function addTemplate(t: { name: string; type: DocType; authority: string }) {
    const d = newDoc(t.name, t.type, t.authority);
    persist({ ...data, docs: [...data.docs, d] });
    setShowTemplates(false);
    setEditing(d); setShowForm(true);
  }
  function saveDoc() {
    if (!editing) return;
    const exists = data.docs.some((d) => d.id === editing.id);
    persist({ ...data, docs: exists ? data.docs.map((d) => (d.id === editing.id ? editing : d)) : [...data.docs, editing] });
    setShowForm(false); setEditing(null);
  }
  function delDoc(id: string) {
    if (!confirm('Delete this document record?')) return;
    persist({ ...data, docs: data.docs.filter((d) => d.id !== id) });
  }

  const summary = useMemo(() => {
    let expired = 0, soon = 0;
    data.docs.forEach((d) => {
      const st = expiryState(daysToExpiry(d.expiryDate));
      if (st === 'expired') expired++;
      else if (st === 'critical' || st === 'warning') soon++;
    });
    return { total: data.docs.length, expired, soon };
  }, [data.docs]);

  const visible = useMemo(() => {
    return data.docs
      .filter((d) => filter === 'all' || d.type === filter)
      .map((d) => ({ d, days: daysToExpiry(d.expiryDate), st: expiryState(daysToExpiry(d.expiryDate)) }))
      .sort((a, b) => {
        const order: Record<string, number> = { expired: 0, critical: 1, warning: 2, ok: 3, none: 4 };
        if (order[a.st] !== order[b.st]) return order[a.st] - order[b.st];
        return (a.days ?? 1e9) - (b.days ?? 1e9);
      });
  }, [data.docs, filter]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>
          ⚓ Voyage Hub · Document Vault
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Document <em style={g}>Vault</em>
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          Track certificate validity and expiry dates with automatic alerts at 90 and 30 days. Records
          only — no files are uploaded. Stored in your browser.
        </p>
      </div>

      {/* Vessel */}
      <div style={card}>
        <div className="vt-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          <div><label style={labelS}>Vessel</label><input style={inputStyle} value={data.vesselName} onChange={(e) => update('vesselName', e.target.value)} placeholder="MV NEURONAI" /></div>
          <div><label style={labelS}>IMO</label><input style={inputStyle} value={data.imo} onChange={(e) => update('imo', e.target.value)} placeholder="9876543" /></div>
        </div>
      </div>

      <div className="action-bar" style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={openNew} style={goldBtn}>+ Add Document</button>
        <button onClick={() => { setShowTemplates(!showTemplates); setShowForm(false); }} style={ghostBtn}>📋 From Template</button>
        <button onClick={() => window.print()} style={ghostBtn}>🖨️ Print / PDF</button>
        {saveMsg && <span style={{ color: '#4caf76', fontFamily: rj, fontSize: 12, fontWeight: 600 }}>{saveMsg}</span>}
      </div>

      {/* Templates */}
      {showTemplates && (
        <div style={{ ...card, borderColor: 'rgba(200,168,75,.4)' }}>
          <div style={sectionTitle}>📋 Add from Template</div>
          <div className="vt-templates" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
            {TEMPLATES.map((t) => (
              <button key={t.name} onClick={() => addTemplate(t)} style={{ textAlign: 'left', background: '#0c1610', border: '1px solid rgba(200,168,75,.2)', color: '#f5f0e8', padding: '8px 12px', borderRadius: 3, fontFamily: rj, fontSize: 12, cursor: 'pointer' }}>
                {TYPE_META[t.type].icon} {t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="vt-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
        <KPI label="Documents" value={String(summary.total)} color="#f5f0e8" />
        <KPI label="Expired" value={String(summary.expired)} color={summary.expired > 0 ? '#ff6b6b' : '#4caf76'} />
        <KPI label="Expiring ≤90d" value={String(summary.soon)} color={summary.soon > 0 ? '#e8b85a' : '#4caf76'} />
      </div>

      {/* Form */}
      {showForm && editing && (
        <div style={{ ...card, borderColor: 'rgba(200,168,75,.5)' }}>
          <div style={sectionTitle}>{data.docs.some((d) => d.id === editing.id) ? 'Edit Document' : 'New Document'}</div>
          <div className="vt-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 10 }}>
            <div><label style={labelS}>Document Name</label><input style={inputStyle} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Safety Management Certificate" /></div>
            <div>
              <label style={labelS}>Type</label>
              <select style={inputStyle} value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value as DocType })}>
                {(Object.keys(TYPE_META) as DocType[]).map((k) => <option key={k} value={k}>{TYPE_META[k].label}</option>)}
              </select>
            </div>
            <div><label style={labelS}>Number</label><input style={inputStyle} value={editing.number} onChange={(e) => setEditing({ ...editing, number: e.target.value })} placeholder="Cert no." /></div>
          </div>
          <div className="vt-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 10 }}>
            <div><label style={labelS}>Issuing Authority</label><input style={inputStyle} value={editing.authority} onChange={(e) => setEditing({ ...editing, authority: e.target.value })} placeholder="Flag / Class / P&I" /></div>
            <div><label style={labelS}>Issue Date</label><input style={inputStyle} type="date" value={editing.issueDate} onChange={(e) => setEditing({ ...editing, issueDate: e.target.value })} /></div>
            <div><label style={labelS}>Expiry Date</label><input style={inputStyle} type="date" value={editing.expiryDate} onChange={(e) => setEditing({ ...editing, expiryDate: e.target.value })} /></div>
          </div>
          <div style={{ marginBottom: 12 }}><label style={labelS}>Notes</label><input style={inputStyle} value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} placeholder="Endorsement dates, conditions, where filed..." /></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={saveDoc} style={{ ...goldBtn, padding: '8px 18px' }} disabled={!editing.name}>Save Document</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filters */}
      {data.docs.length > 0 && (
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 14 }}>
          <button onClick={() => setFilter('all')} style={chip(filter === 'all')}>All</button>
          {(Object.keys(TYPE_META) as DocType[]).map((k) => <button key={k} onClick={() => setFilter(k)} style={chip(filter === k)}>{TYPE_META[k].icon} {TYPE_META[k].label}</button>)}
        </div>
      )}

      {/* List */}
      {data.docs.length === 0 && !showForm && !showTemplates && (
        <div style={{ ...card, textAlign: 'center', color: '#7a8a72', fontFamily: rj }}>
          No documents yet. Add one or use <b style={{ color: '#c8a84b' }}>From Template</b> for standard certificates.
        </div>
      )}

      {visible.map(({ d, days, st }) => {
        const sm = STATE_META[st];
        const tm = TYPE_META[d.type];
        return (
          <div key={d.id} style={{ ...card, padding: '14px 16px', borderColor: st === 'expired' ? 'rgba(255,107,107,.5)' : st === 'critical' ? 'rgba(255,138,138,.3)' : 'rgba(200,168,75,.18)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 200 }}>
                <div style={{ fontFamily: lb, fontSize: 14.5, fontWeight: 700, color: '#f5f0e8' }}>{tm.icon} {d.name}</div>
                <div style={{ fontFamily: rj, fontSize: 11, color: '#7a8a72', marginTop: 2, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {d.number && <span>No. {d.number}</span>}
                  {d.authority && <span>· {d.authority}</span>}
                </div>
                <div style={{ fontFamily: rj, fontSize: 11, color: '#b0c0a4', marginTop: 3 }}>
                  Issued {prettyDate(d.issueDate)} · Expires {prettyDate(d.expiryDate)}
                </div>
                {d.notes && <div style={{ fontFamily: rj, fontSize: 11, color: '#7a8a72', marginTop: 3 }}>{d.notes}</div>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 9, background: sm.bg, color: sm.color, padding: '3px 9px', borderRadius: 3, fontFamily: rj, fontWeight: 700, letterSpacing: '.5px', border: `1px solid ${sm.color}40`, whiteSpace: 'nowrap' }}>{sm.label}</span>
                {days != null && (
                  <div style={{ fontFamily: rj, fontSize: 11.5, color: sm.color, fontWeight: 700, marginTop: 4 }}>
                    {days < 0 ? `${Math.abs(days)}d expired` : `${days}d left`}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 10, paddingTop: 8, borderTop: '1px dashed rgba(200,168,75,.12)' }}>
              <button onClick={() => openEdit(d)} style={miniBtn('#c8a84b')}>Edit</button>
              <button onClick={() => delDoc(d.id)} style={miniBtn('#ff8a8a')}>Delete</button>
            </div>
          </div>
        );
      })}

      <style>{`
        @media (max-width: 720px) {
          .vt-g3 { grid-template-columns: 1fr !important; }
          .vt-summary { grid-template-columns: 1fr !important; }
          .vt-templates { grid-template-columns: 1fr !important; }
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
  return { padding: '5px 12px', background: active ? '#c8a84b' : 'transparent', color: active ? '#08100a' : '#7a8a72', border: `1px solid ${active ? '#c8a84b' : 'rgba(200,168,75,.25)'}`, fontFamily: rj, fontSize: 10, letterSpacing: '.5px', fontWeight: 700, cursor: 'pointer', borderRadius: 4, whiteSpace: 'nowrap' };
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
