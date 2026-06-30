'use client';
import { useState, useEffect, useMemo } from 'react';
import { saveItem, loadItem, genId } from '@/lib/voyage-storage';

const lb = "'Libre Bodoni', serif";
const rj = "'Rajdhani', sans-serif";
const g = { color: '#c8a84b', fontStyle: 'italic' } as React.CSSProperties;

// ============================================================
// Photo Reference Log — records WHERE photos are stored and WHAT
// they show (damage, cargo, survey evidence). No files uploaded;
// this is an index so evidence can be found and cited later.
// ============================================================
type PhotoCat = 'damage' | 'cargo' | 'survey' | 'maintenance' | 'incident' | 'general';

interface PhotoRef {
  id: string;
  date: string;
  time: string;
  category: PhotoCat;
  subject: string;        // what it shows
  location: string;       // where on ship / position
  reference: string;      // file ref / folder / device / photo no.
  count: number;          // number of photos
  takenBy: string;
  notes: string;
}

interface PhotoData {
  vesselName: string;
  voyageName: string;
  photos: PhotoRef[];
}

const CAT_META: Record<PhotoCat, { label: string; icon: string; color: string }> = {
  damage: { label: 'Damage', icon: '🔨', color: '#ff8a8a' },
  cargo: { label: 'Cargo', icon: '📦', color: '#4caf76' },
  survey: { label: 'Survey', icon: '🔍', color: '#5aa6e8' },
  maintenance: { label: 'Maintenance', icon: '🔧', color: '#e8b85a' },
  incident: { label: 'Incident', icon: '⚠️', color: '#ff6b6b' },
  general: { label: 'General', icon: '📷', color: '#7a8a72' },
};

function newPhoto(): PhotoRef {
  const now = new Date();
  return { id: genId(), date: now.toISOString().slice(0, 10), time: now.toTimeString().slice(0, 5), category: 'general', subject: '', location: '', reference: '', count: 1, takenBy: '', notes: '' };
}

const DEFAULT_DATA: PhotoData = { vesselName: '', voyageName: '', photos: [] };

function prettyDate(s: string): string {
  if (!s) return '';
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

const STORAGE_KEY = 'photos';
const SINGLETON_ID = 'photolog';

// ============================================================
// COMPONENT
// ============================================================
export default function PhotosPage() {
  const [data, setData] = useState<PhotoData>(DEFAULT_DATA);
  const [saveMsg, setSaveMsg] = useState('');
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState<'all' | PhotoCat>('all');
  const [editing, setEditing] = useState<PhotoRef | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    try {
      const saved = loadItem<PhotoData>(STORAGE_KEY, SINGLETON_ID);
      if (saved && saved.data && Array.isArray(saved.data.photos)) setData({ ...DEFAULT_DATA, ...saved.data });
    } catch { /* ignore */ }
  }, []);

  function persist(next: PhotoData) {
    setData(next);
    try { saveItem(STORAGE_KEY, 'Photo Reference Log', next, SINGLETON_ID); setSaveMsg('✓ Saved'); setTimeout(() => setSaveMsg(''), 2000); } catch { /* ignore */ }
  }
  function update<K extends keyof PhotoData>(key: K, value: PhotoData[K]) { persist({ ...data, [key]: value }); }
  function num(v: string): number { return parseFloat(v) || 0; }

  function openNew() { setEditing(newPhoto()); setShowForm(true); }
  function openEdit(p: PhotoRef) { setEditing({ ...p }); setShowForm(true); }
  function savePhoto() {
    if (!editing) return;
    const exists = data.photos.some((x) => x.id === editing.id);
    persist({ ...data, photos: exists ? data.photos.map((x) => (x.id === editing.id ? editing : x)) : [...data.photos, editing] });
    setShowForm(false); setEditing(null);
  }
  function delPhoto(id: string) {
    if (!confirm('Delete this photo reference?')) return;
    persist({ ...data, photos: data.photos.filter((x) => x.id !== id) });
  }

  const summary = useMemo(() => {
    const totalShots = data.photos.reduce((s, p) => s + (p.count || 0), 0);
    const damage = data.photos.filter((p) => p.category === 'damage' || p.category === 'incident').length;
    return { records: data.photos.length, totalShots, damage };
  }, [data.photos]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.photos
      .filter((p) => catFilter === 'all' || p.category === catFilter)
      .filter((p) => !q || [p.subject, p.location, p.reference, p.takenBy, p.notes].some((f) => f.toLowerCase().includes(q)))
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  }, [data.photos, query, catFilter]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>
          ⚓ Voyage Hub · Photo Reference Log
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Photo <em style={g}>Reference Log</em>
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          Index your evidence photos — what each set shows, where it was taken and where the files are
          stored. No images are uploaded; this is a searchable register so you can cite evidence later.
        </p>
      </div>

      {/* Info */}
      <div style={{ ...card, background: 'rgba(90,166,232,.06)', borderColor: 'rgba(90,166,232,.3)', padding: '12px 16px' }}>
        <div style={{ fontFamily: rj, fontSize: 12, color: '#9fc6ef', lineHeight: 1.5 }}>
          💡 Keep the actual photo files in your usual secure location (ship server, email to office, cloud).
          Log the <b>file reference / folder / photo numbers</b> here so damage and cargo evidence is easy to find for claims and surveys.
        </div>
      </div>

      {/* Voyage */}
      <div style={card}>
        <div className="ph-g2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          <div><label style={labelS}>Vessel</label><input style={inputStyle} value={data.vesselName} onChange={(e) => update('vesselName', e.target.value)} placeholder="MV NEURONAI" /></div>
          <div><label style={labelS}>Voyage</label><input style={inputStyle} value={data.voyageName} onChange={(e) => update('voyageName', e.target.value)} placeholder="V-12" /></div>
        </div>
      </div>

      <div className="action-bar" style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={openNew} style={goldBtn}>+ Add Photo Reference</button>
        <button onClick={() => window.print()} style={ghostBtn}>🖨️ Print / PDF</button>
        {saveMsg && <span style={{ color: '#4caf76', fontFamily: rj, fontSize: 12, fontWeight: 600 }}>{saveMsg}</span>}
      </div>

      {/* Summary */}
      <div className="ph-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
        <KPI label="Records" value={String(summary.records)} color="#f5f0e8" />
        <KPI label="Total Photos" value={String(summary.totalShots)} color="#c8a84b" />
        <KPI label="Damage / Incident" value={String(summary.damage)} color={summary.damage > 0 ? '#ff8a8a' : '#4caf76'} />
      </div>

      {/* Form */}
      {showForm && editing && (
        <div style={{ ...card, borderColor: 'rgba(200,168,75,.5)' }}>
          <div style={sectionTitle}>{data.photos.some((x) => x.id === editing.id) ? 'Edit Reference' : 'New Photo Reference'}</div>
          <div className="ph-g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 10 }}>
            <div><label style={labelS}>Date</label><input style={inputStyle} type="date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} /></div>
            <div><label style={labelS}>Time</label><input style={inputStyle} type="time" value={editing.time} onChange={(e) => setEditing({ ...editing, time: e.target.value })} /></div>
            <div>
              <label style={labelS}>Category</label>
              <select style={inputStyle} value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value as PhotoCat })}>
                {(Object.keys(CAT_META) as PhotoCat[]).map((k) => <option key={k} value={k}>{CAT_META[k].label}</option>)}
              </select>
            </div>
            <div><label style={labelS}>No. of Photos</label><input style={inputStyle} type="number" value={editing.count || ''} onChange={(e) => setEditing({ ...editing, count: num(e.target.value) })} placeholder="1" /></div>
          </div>
          <div style={{ marginBottom: 10 }}><label style={labelS}>Subject — what it shows</label><input style={inputStyle} value={editing.subject} onChange={(e) => setEditing({ ...editing, subject: e.target.value })} placeholder="Hold 3 tank top corrosion / hatch coaming dent..." /></div>
          <div className="ph-g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 10 }}>
            <div><label style={labelS}>Location on Ship</label><input style={inputStyle} value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} placeholder="Cargo Hold 3, frame 45" /></div>
            <div><label style={labelS}>File Reference</label><input style={inputStyle} value={editing.reference} onChange={(e) => setEditing({ ...editing, reference: e.target.value })} placeholder="IMG_2210–2218 / folder/DD2027" /></div>
            <div><label style={labelS}>Taken By</label><input style={inputStyle} value={editing.takenBy} onChange={(e) => setEditing({ ...editing, takenBy: e.target.value })} placeholder="C/O" /></div>
          </div>
          <div style={{ marginBottom: 12 }}><label style={labelS}>Notes</label><input style={inputStyle} value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} placeholder="Sent to office, surveyor copy, claim ref..." /></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={savePhoto} style={{ ...goldBtn, padding: '8px 18px' }} disabled={!editing.subject}>Save Reference</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filters */}
      {data.photos.length > 0 && (
        <div style={card}>
          <div style={{ marginBottom: 12 }}>
            <label style={labelS}>Search</label>
            <input style={inputStyle} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="subject, location, file ref..." />
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            <button onClick={() => setCatFilter('all')} style={chip(catFilter === 'all')}>All</button>
            {(Object.keys(CAT_META) as PhotoCat[]).map((k) => <button key={k} onClick={() => setCatFilter(k)} style={chip(catFilter === k)}>{CAT_META[k].icon} {CAT_META[k].label}</button>)}
          </div>
        </div>
      )}

      {/* List */}
      {data.photos.length === 0 && !showForm && (
        <div style={{ ...card, textAlign: 'center', color: '#7a8a72', fontFamily: rj }}>
          No photo references yet. Tap <b style={{ color: '#c8a84b' }}>+ Add Photo Reference</b> to index your evidence.
        </div>
      )}

      {visible.map((p) => {
        const m = CAT_META[p.category];
        return (
          <div key={p.id} style={{ ...card, padding: '14px 16px', borderLeft: `3px solid ${m.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 9, background: `${m.color}22`, color: m.color, padding: '1px 7px', borderRadius: 3, fontFamily: rj, fontWeight: 700, letterSpacing: '.5px' }}>{m.icon} {m.label}</span>
                  <span style={{ fontFamily: rj, fontSize: 11, color: '#7a8a72' }}>{prettyDate(p.date)} {p.time}</span>
                  <span style={{ fontFamily: rj, fontSize: 11, color: '#c8a84b', fontWeight: 700 }}>📷 {p.count}</span>
                </div>
                <div style={{ fontFamily: lb, fontSize: 14.5, fontWeight: 700, color: '#f5f0e8', marginTop: 5 }}>{p.subject}</div>
                <div style={{ fontFamily: rj, fontSize: 11, color: '#b0c0a4', marginTop: 3, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {p.location && <span>📍 {p.location}</span>}
                  {p.reference && <span>🗂️ {p.reference}</span>}
                  {p.takenBy && <span>👤 {p.takenBy}</span>}
                </div>
                {p.notes && <div style={{ fontFamily: rj, fontSize: 11, color: '#7a8a72', marginTop: 3 }}>{p.notes}</div>}
              </div>
              <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                <button onClick={() => openEdit(p)} style={miniBtn('#c8a84b')}>Edit</button>
                <button onClick={() => delPhoto(p.id)} style={miniBtn('#ff8a8a')}>Delete</button>
              </div>
            </div>
          </div>
        );
      })}

      <style>{`
        @media (max-width: 720px) {
          .ph-g2 { grid-template-columns: 1fr !important; }
          .ph-g4 { grid-template-columns: 1fr 1fr !important; }
          .ph-summary { grid-template-columns: 1fr !important; }
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
