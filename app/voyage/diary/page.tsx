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
type Category = 'operation' | 'port' | 'weather' | 'cargo' | 'crew' | 'maintenance' | 'incident' | 'note';

interface Entry {
  id: string;
  date: string;
  time: string;
  category: Category;
  title: string;
  body: string;
  location: string;
}

interface DiaryData {
  vesselName: string;
  voyageName: string;
  entries: Entry[];
}

const CAT_META: Record<Category, { label: string; icon: string; color: string }> = {
  operation: { label: 'Operation', icon: '⚙️', color: '#5aa6e8' },
  port: { label: 'Port', icon: '🏴', color: '#c8a84b' },
  weather: { label: 'Weather', icon: '🌊', color: '#5aa6e8' },
  cargo: { label: 'Cargo', icon: '📦', color: '#4caf76' },
  crew: { label: 'Crew', icon: '👥', color: '#8bc34a' },
  maintenance: { label: 'Maintenance', icon: '🔧', color: '#e8b85a' },
  incident: { label: 'Incident', icon: '⚠️', color: '#ff8a8a' },
  note: { label: 'Note', icon: '📝', color: '#7a8a72' },
};

function newEntry(): Entry {
  const now = new Date();
  return { id: genId(), date: now.toISOString().slice(0, 10), time: now.toTimeString().slice(0, 5), category: 'operation', title: '', body: '', location: '' };
}

const DEFAULT_DATA: DiaryData = { vesselName: '', voyageName: '', entries: [] };

function prettyDate(s: string): string {
  if (!s) return '';
  const d = new Date(s + 'T00:00:00');
  if (isNaN(d.getTime())) return s;
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

// ============================================================
// COMPONENT
// ============================================================
export default function DiaryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingId = searchParams.get('id');

  const [data, setData] = useState<DiaryData>(DEFAULT_DATA);
  const [recordId, setRecordId] = useState<string | null>(existingId);
  const [recordName, setRecordName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState<'all' | Category>('all');
  const [editing, setEditing] = useState<Entry | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [copyMsg, setCopyMsg] = useState('');

  useEffect(() => {
    if (existingId) {
      const saved = loadItem<DiaryData>('diary', existingId);
      if (saved) { setData({ ...DEFAULT_DATA, ...saved.data }); setRecordName(saved.name); }
    }
  }, [existingId]);

  function update<K extends keyof DiaryData>(key: K, value: DiaryData[K]) { setData((p) => ({ ...p, [key]: value })); }

  function openNew() { setEditing(newEntry()); setShowForm(true); }
  function openEdit(e: Entry) { setEditing({ ...e }); setShowForm(true); }
  function saveEntry() {
    if (!editing) return;
    const exists = data.entries.some((x) => x.id === editing.id);
    setData((p) => ({ ...p, entries: exists ? p.entries.map((x) => (x.id === editing.id ? editing : x)) : [...p.entries, editing] }));
    setShowForm(false); setEditing(null);
  }
  function delEntry(id: string) {
    if (!confirm('Delete this entry?')) return;
    setData((p) => ({ ...p, entries: p.entries.filter((x) => x.id !== id) }));
  }

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = data.entries
      .filter((e) => catFilter === 'all' || e.category === catFilter)
      .filter((e) => !q || [e.title, e.body, e.location].some((f) => f.toLowerCase().includes(q)))
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
    const groups: Record<string, Entry[]> = {};
    filtered.forEach((e) => { (groups[e.date] = groups[e.date] || []).push(e); });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [data.entries, query, catFilter]);

  function buildSummary(): string {
    const lines: string[] = [];
    lines.push(`${data.vesselName || 'Vessel'} — ${data.voyageName || 'Voyage'} — Operations Summary`);
    lines.push('');
    const sorted = [...data.entries].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    let lastDate = '';
    sorted.forEach((e) => {
      if (e.date !== lastDate) { lines.push(`\n${prettyDate(e.date)}`); lastDate = e.date; }
      const cat = CAT_META[e.category].label;
      lines.push(`  ${e.time} [${cat}] ${e.title}${e.location ? ` @ ${e.location}` : ''}${e.body ? ` — ${e.body}` : ''}`);
    });
    return lines.join('\n');
  }
  function copySummary() {
    const text = buildSummary();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => { setCopyMsg('✓ Copied'); setTimeout(() => setCopyMsg(''), 2000); }).catch(() => setCopyMsg('Copy failed'));
    }
  }

  function handleSave() {
    const name = recordName.trim() || `${data.vesselName || 'Vessel'} — ${data.voyageName || 'Diary'}`;
    const id = recordId || genId();
    saveItem('diary', name, data, id);
    setRecordId(id); setRecordName(name); setSaveMsg('✓ Saved'); setShowSave(false);
    setTimeout(() => setSaveMsg(''), 3000);
  }
  function handleReset() {
    if (!confirm('Reset all fields?')) return;
    setData(DEFAULT_DATA); setRecordId(null); setRecordName(''); router.replace('/voyage/diary');
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>
          ⚓ Voyage Hub · Voyage Diary
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Voyage <em style={g}>Diary</em>
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          A running operations log — timestamped entries by category, with a one-tap shareable summary
          for the office or charterer. Stored in your browser.
        </p>
      </div>

      {/* Action bar */}
      <div className="action-bar" style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={openNew} style={goldBtn}>+ New Entry</button>
        <button onClick={() => setShowSave(true)} style={ghostBtn}>💾 Save</button>
        <button onClick={copySummary} style={ghostBtn} disabled={data.entries.length === 0}>📋 Copy Summary</button>
        <button onClick={() => window.print()} style={ghostBtn}>🖨️ Print</button>
        <button onClick={handleReset} style={{ ...ghostBtn, color: '#ff8a8a', borderColor: 'rgba(255,138,138,.3)' }}>🗑️</button>
        {saveMsg && <span style={{ color: '#4caf76', fontFamily: rj, fontSize: 12, fontWeight: 600 }}>{saveMsg}</span>}
        {copyMsg && <span style={{ color: '#4caf76', fontFamily: rj, fontSize: 12, fontWeight: 600 }}>{copyMsg}</span>}
        {recordName && <span style={{ color: '#7a8a72', fontFamily: rj, fontSize: 11, marginLeft: 'auto' }}>📂 {recordName}</span>}
      </div>

      {showSave && (
        <div style={{ ...card, background: 'rgba(200,168,75,.05)', borderColor: 'rgba(200,168,75,.4)' }}>
          <label style={labelS}>Name</label>
          <input type="text" value={recordName} onChange={(e) => setRecordName(e.target.value)} placeholder="e.g. MV NEURONAI — Tubarão→Qingdao" style={{ ...inputStyle, marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{ ...goldBtn, padding: '8px 14px', letterSpacing: '1px' }}>Save</button>
            <button onClick={() => setShowSave(false)} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* Voyage info */}
      <div style={card}>
        <div className="di-g2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          <div><label style={labelS}>Vessel</label><input style={inputStyle} value={data.vesselName} onChange={(e) => update('vesselName', e.target.value)} placeholder="MV NEURONAI" /></div>
          <div><label style={labelS}>Voyage</label><input style={inputStyle} value={data.voyageName} onChange={(e) => update('voyageName', e.target.value)} placeholder="Tubarão → Qingdao V-12" /></div>
        </div>
      </div>

      {/* Form */}
      {showForm && editing && (
        <div style={{ ...card, borderColor: 'rgba(200,168,75,.5)' }}>
          <div style={sectionTitle}>{data.entries.some((x) => x.id === editing.id) ? 'Edit Entry' : 'New Entry'}</div>
          <div className="di-g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 10 }}>
            <div><label style={labelS}>Date</label><input style={inputStyle} type="date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} /></div>
            <div><label style={labelS}>Time</label><input style={inputStyle} type="time" value={editing.time} onChange={(e) => setEditing({ ...editing, time: e.target.value })} /></div>
            <div>
              <label style={labelS}>Category</label>
              <select style={inputStyle} value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value as Category })}>
                {(Object.keys(CAT_META) as Category[]).map((k) => <option key={k} value={k}>{CAT_META[k].label}</option>)}
              </select>
            </div>
            <div><label style={labelS}>Location</label><input style={inputStyle} value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} placeholder="At berth / 22°N 35°W" /></div>
          </div>
          <div style={{ marginBottom: 10 }}><label style={labelS}>Title</label><input style={inputStyle} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="NOR tendered / Loading commenced..." /></div>
          <div style={{ marginBottom: 12 }}><label style={labelS}>Details</label><textarea value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} placeholder="What happened, figures, who was involved..." rows={3} style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} /></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={saveEntry} style={{ ...goldBtn, padding: '8px 18px' }} disabled={!editing.title}>Save Entry</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filters */}
      {data.entries.length > 0 && (
        <div style={card}>
          <div style={{ marginBottom: 12 }}>
            <label style={labelS}>Search</label>
            <input style={inputStyle} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="title, details, location..." />
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            <button onClick={() => setCatFilter('all')} style={chip(catFilter === 'all')}>All</button>
            {(Object.keys(CAT_META) as Category[]).map((k) => <button key={k} onClick={() => setCatFilter(k)} style={chip(catFilter === k)}>{CAT_META[k].icon} {CAT_META[k].label}</button>)}
          </div>
        </div>
      )}

      {/* Timeline */}
      {data.entries.length === 0 && !showForm && (
        <div style={{ ...card, textAlign: 'center', color: '#7a8a72', fontFamily: rj }}>
          No entries yet. Tap <b style={{ color: '#c8a84b' }}>+ New Entry</b> to start the diary.
        </div>
      )}

      {grouped.map(([date, entries]) => (
        <div key={date} style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: rj, fontSize: 12, color: '#c8a84b', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10, paddingLeft: 4 }}>{prettyDate(date)}</div>
          {entries.map((e) => {
            const m = CAT_META[e.category];
            return (
              <div key={e.id} style={{ ...card, padding: '12px 16px', marginBottom: 8, borderLeft: `3px solid ${m.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: rj, fontSize: 11, color: '#7a8a72', fontWeight: 700 }}>{e.time}</span>
                      <span style={{ fontSize: 9, background: `${m.color}22`, color: m.color, padding: '1px 7px', borderRadius: 3, fontFamily: rj, fontWeight: 700, letterSpacing: '.5px' }}>{m.icon} {m.label}</span>
                      {e.location && <span style={{ fontFamily: rj, fontSize: 10.5, color: '#7a8a72' }}>📍 {e.location}</span>}
                    </div>
                    <div style={{ fontFamily: lb, fontSize: 14, fontWeight: 700, color: '#f5f0e8', marginTop: 4 }}>{e.title}</div>
                    {e.body && <div style={{ fontFamily: rj, fontSize: 12, color: '#b0c0a4', marginTop: 3, lineHeight: 1.55 }}>{e.body}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                    <button onClick={() => openEdit(e)} style={miniBtn('#c8a84b')}>Edit</button>
                    <button onClick={() => delEntry(e.id)} style={miniBtn('#ff8a8a')}>✕</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      <style>{`
        @media (max-width: 720px) {
          .di-g2 { grid-template-columns: 1fr !important; }
          .di-g4 { grid-template-columns: 1fr 1fr !important; }
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
