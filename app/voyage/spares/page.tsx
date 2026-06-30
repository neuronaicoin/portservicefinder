'use client';
import { useState, useEffect, useMemo } from 'react';
import { saveItem, loadItem, genId } from '@/lib/voyage-storage';

const lb = "'Libre Bodoni', serif";
const rj = "'Rajdhani', sans-serif";
const g = { color: '#c8a84b', fontStyle: 'italic' } as React.CSSProperties;

// ============================================================
// TYPES
// ============================================================
type OrderStatus = 'none' | 'requested' | 'ordered' | 'received';

interface Spare {
  id: string;
  name: string;
  equipment: string;
  partNo: string;
  rob: number;        // current stock
  minStock: number;
  location: string;
  supplier: string;
  unitPrice: number;
  critical: boolean;  // class/SOLAS critical
  order: OrderStatus;
}

interface SparesData {
  vesselName: string;
  imo: string;
  spares: Spare[];
}

function newSpare(): Spare {
  return { id: genId(), name: '', equipment: '', partNo: '', rob: 0, minStock: 0, location: '', supplier: '', unitPrice: 0, critical: false, order: 'none' };
}

const DEFAULT_DATA: SparesData = { vesselName: '', imo: '', spares: [] };

const ORDER_META: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  none: { label: '—', color: '#7a8a72', bg: 'transparent' },
  requested: { label: 'REQUESTED', color: '#5aa6e8', bg: 'rgba(90,166,232,.14)' },
  ordered: { label: 'ORDERED', color: '#e8b85a', bg: 'rgba(232,184,90,.14)' },
  received: { label: 'RECEIVED', color: '#4caf76', bg: 'rgba(76,175,118,.14)' },
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

const STORAGE_KEY = 'spares';
const SINGLETON_ID = 'sparesinv';

function fmt(n: number, dec = 0): string {
  if (!isFinite(n)) return '–';
  return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

// ============================================================
// COMPONENT
// ============================================================
export default function SparesPage() {
  const [data, setData] = useState<SparesData>(DEFAULT_DATA);
  const [saveMsg, setSaveMsg] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'critical'>('all');
  const [editing, setEditing] = useState<Spare | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    try {
      const saved = loadItem<SparesData>(STORAGE_KEY, SINGLETON_ID);
      if (saved && saved.data && Array.isArray(saved.data.spares)) setData({ ...DEFAULT_DATA, ...saved.data });
    } catch { /* ignore */ }
  }, []);

  function persist(next: SparesData) {
    setData(next);
    try { saveItem(STORAGE_KEY, 'Spares Inventory', next, SINGLETON_ID); setSaveMsg('✓ Saved'); setTimeout(() => setSaveMsg(''), 2000); } catch { /* ignore */ }
  }
  function update<K extends keyof SparesData>(key: K, value: SparesData[K]) { persist({ ...data, [key]: value }); }
  function num(v: string): number { return parseFloat(v) || 0; }

  function openNew() { setEditing(newSpare()); setShowForm(true); }
  function openEdit(s: Spare) { setEditing({ ...s }); setShowForm(true); }
  function saveSpare() {
    if (!editing) return;
    const exists = data.spares.some((s) => s.id === editing.id);
    persist({ ...data, spares: exists ? data.spares.map((s) => (s.id === editing.id ? editing : s)) : [...data.spares, editing] });
    setShowForm(false); setEditing(null);
  }
  function delSpare(id: string) {
    if (!confirm('Delete this spare?')) return;
    persist({ ...data, spares: data.spares.filter((s) => s.id !== id) });
  }
  function quickAdjust(id: string, delta: number) {
    persist({ ...data, spares: data.spares.map((s) => (s.id === id ? { ...s, rob: Math.max(0, s.rob + delta) } : s)) });
  }
  function cycleOrder(id: string) {
    const order: OrderStatus[] = ['none', 'requested', 'ordered', 'received'];
    persist({ ...data, spares: data.spares.map((s) => {
      if (s.id !== id) return s;
      const idx = order.indexOf(s.order);
      const nextStatus = order[(idx + 1) % order.length];
      // if marking received, optionally bump ROB? keep manual.
      return { ...s, order: nextStatus };
    }) });
  }

  const isLow = (s: Spare) => s.minStock > 0 && s.rob < s.minStock;

  const summary = useMemo(() => {
    const low = data.spares.filter(isLow).length;
    const critLow = data.spares.filter((s) => s.critical && isLow(s)).length;
    const value = data.spares.reduce((sum, s) => sum + s.rob * (s.unitPrice || 0), 0);
    return { total: data.spares.length, low, critLow, value };
  }, [data.spares]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.spares
      .filter((s) => filter === 'all' || (filter === 'low' ? isLow(s) : s.critical))
      .filter((s) => !q || [s.name, s.equipment, s.partNo, s.supplier, s.location].some((f) => f.toLowerCase().includes(q)))
      .sort((a, b) => {
        const al = isLow(a) ? 0 : 1, bl = isLow(b) ? 0 : 1;
        if (al !== bl) return al - bl;
        return (a.equipment || '').localeCompare(b.equipment || '');
      });
  }, [data.spares, query, filter]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>
          ⚓ Voyage Hub · Spares Inventory
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Spares <em style={g}>Inventory</em>
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          Track critical spares, stock on board and minimum levels. Items below minimum are flagged for
          reorder. Stored in your browser.
        </p>
      </div>

      {/* Vessel */}
      <div style={card}>
        <div className="sp-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          <div><label style={labelS}>Vessel</label><input style={inputStyle} value={data.vesselName} onChange={(e) => update('vesselName', e.target.value)} placeholder="MV NEURONAI" /></div>
          <div><label style={labelS}>IMO</label><input style={inputStyle} value={data.imo} onChange={(e) => update('imo', e.target.value)} placeholder="9876543" /></div>
        </div>
      </div>

      <div className="action-bar" style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={openNew} style={goldBtn}>+ Add Spare</button>
        <button onClick={() => window.print()} style={ghostBtn}>🖨️ Print / PDF</button>
        {saveMsg && <span style={{ color: '#4caf76', fontFamily: rj, fontSize: 12, fontWeight: 600 }}>{saveMsg}</span>}
      </div>

      {/* Summary */}
      <div className="sp-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
        <KPI label="Items" value={String(summary.total)} color="#f5f0e8" />
        <KPI label="Below Min" value={String(summary.low)} color={summary.low > 0 ? '#ff8a8a' : '#4caf76'} />
        <KPI label="Critical Low" value={String(summary.critLow)} color={summary.critLow > 0 ? '#ff6b6b' : '#4caf76'} />
        <KPI label="Stock Value" value={`$${fmt(summary.value)}`} color="#c8a84b" />
      </div>

      {/* PSF cross-sell */}
      <div style={{ ...card, background: 'rgba(200,168,75,.05)', borderColor: 'rgba(200,168,75,.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontFamily: rj, fontSize: 12.5, color: '#b0c0a4' }}>🔎 Need to reorder? <b style={{ color: '#c8a84b' }}>Find chandlers & suppliers on PortServiceFinder.</b></div>
        <a href="/" style={{ ...ghostBtn, textDecoration: 'none', display: 'inline-block' }}>Search Suppliers →</a>
      </div>

      {/* Form */}
      {showForm && editing && (
        <div style={{ ...card, borderColor: 'rgba(200,168,75,.5)' }}>
          <div style={sectionTitle}>{data.spares.some((s) => s.id === editing.id) ? 'Edit Spare' : 'New Spare'}</div>
          <div className="sp-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 10 }}>
            <div><label style={labelS}>Part Name</label><input style={inputStyle} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Fuel injector" /></div>
            <div><label style={labelS}>Equipment</label><input style={inputStyle} value={editing.equipment} onChange={(e) => setEditing({ ...editing, equipment: e.target.value })} placeholder="Main Engine" /></div>
            <div><label style={labelS}>Part No.</label><input style={inputStyle} value={editing.partNo} onChange={(e) => setEditing({ ...editing, partNo: e.target.value })} placeholder="MAN-12345" /></div>
          </div>
          <div className="sp-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 10 }}>
            <div><label style={labelS}>ROB (stock)</label><input style={inputStyle} type="number" value={editing.rob || ''} onChange={(e) => setEditing({ ...editing, rob: num(e.target.value) })} placeholder="4" /></div>
            <div><label style={labelS}>Min Stock</label><input style={inputStyle} type="number" value={editing.minStock || ''} onChange={(e) => setEditing({ ...editing, minStock: num(e.target.value) })} placeholder="2" /></div>
            <div><label style={labelS}>Unit Price ($)</label><input style={inputStyle} type="number" value={editing.unitPrice || ''} onChange={(e) => setEditing({ ...editing, unitPrice: num(e.target.value) })} placeholder="1200" /></div>
            <div><label style={labelS}>Location</label><input style={inputStyle} value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} placeholder="Store 2, shelf B" /></div>
          </div>
          <div className="sp-g3" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginBottom: 10 }}>
            <div><label style={labelS}>Supplier</label><input style={inputStyle} value={editing.supplier} onChange={(e) => setEditing({ ...editing, supplier: e.target.value })} placeholder="MAN PrimeServ" /></div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: rj, fontSize: 12.5, color: editing.critical ? '#ff8a8a' : '#7a8a72', padding: '7px 0' }}>
                <input type="checkbox" checked={editing.critical} onChange={(e) => setEditing({ ...editing, critical: e.target.checked })} style={{ width: 16, height: 16, accentColor: '#ff8a8a' }} /> Critical spare
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={saveSpare} style={{ ...goldBtn, padding: '8px 18px' }} disabled={!editing.name}>Save Spare</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filters */}
      {data.spares.length > 0 && (
        <div style={card}>
          <div style={{ marginBottom: 12 }}>
            <label style={labelS}>Search</label>
            <input style={inputStyle} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="part name, equipment, part no, supplier..." />
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            <button onClick={() => setFilter('all')} style={chip(filter === 'all')}>All</button>
            <button onClick={() => setFilter('low')} style={chip(filter === 'low')}>Below Min</button>
            <button onClick={() => setFilter('critical')} style={chip(filter === 'critical')}>Critical</button>
          </div>
        </div>
      )}

      {/* List */}
      {data.spares.length === 0 && !showForm && (
        <div style={{ ...card, textAlign: 'center', color: '#7a8a72', fontFamily: rj }}>
          No spares yet. Tap <b style={{ color: '#c8a84b' }}>+ Add Spare</b> to build your inventory.
        </div>
      )}
      {data.spares.length > 0 && visible.length === 0 && (
        <div style={{ ...card, textAlign: 'center', color: '#7a8a72', fontFamily: rj }}>No spares match your filters.</div>
      )}

      {visible.map((s) => {
        const low = isLow(s);
        const om = ORDER_META[s.order];
        return (
          <div key={s.id} style={{ ...card, padding: '14px 16px', borderColor: low && s.critical ? 'rgba(255,107,107,.5)' : low ? 'rgba(255,138,138,.3)' : 'rgba(200,168,75,.18)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 200 }}>
                <div style={{ fontFamily: lb, fontSize: 14.5, fontWeight: 700, color: '#f5f0e8' }}>{s.critical && '🔴 '}{s.name}</div>
                <div style={{ fontFamily: rj, fontSize: 11, color: '#7a8a72', marginTop: 2, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {s.equipment && <span>{s.equipment}</span>}
                  {s.partNo && <span>· {s.partNo}</span>}
                  {s.location && <span>· 📍 {s.location}</span>}
                </div>
                {s.supplier && <div style={{ fontFamily: rj, fontSize: 10.5, color: '#7a8a72', marginTop: 2 }}>Supplier: {s.supplier}{s.unitPrice ? ` · $${fmt(s.unitPrice)}/unit` : ''}</div>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                  <button onClick={() => quickAdjust(s.id, -1)} style={adjBtn}>−</button>
                  <span style={{ fontFamily: lb, fontSize: 20, fontWeight: 700, color: low ? '#ff8a8a' : '#4caf76', minWidth: 30, textAlign: 'center' }}>{s.rob}</span>
                  <button onClick={() => quickAdjust(s.id, 1)} style={adjBtn}>+</button>
                </div>
                <div style={{ fontFamily: rj, fontSize: 10, color: '#7a8a72' }}>min {s.minStock}{low ? ' · ⚠ reorder' : ''}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 10, paddingTop: 8, borderTop: '1px dashed rgba(200,168,75,.12)', flexWrap: 'wrap' }}>
              <button onClick={() => cycleOrder(s.id)} style={{ fontSize: 9, background: om.bg, color: om.color, padding: '3px 10px', borderRadius: 3, fontFamily: rj, fontWeight: 700, letterSpacing: '.5px', border: `1px solid ${om.color}40`, cursor: 'pointer' }}>
                {s.order === 'none' ? '+ Set order status' : om.label}
              </button>
              <div style={{ display: 'flex', gap: 14 }}>
                <button onClick={() => openEdit(s)} style={miniBtn('#c8a84b')}>Edit</button>
                <button onClick={() => delSpare(s.id)} style={miniBtn('#ff8a8a')}>Delete</button>
              </div>
            </div>
          </div>
        );
      })}

      <style>{`
        @media (max-width: 720px) {
          .sp-g3 { grid-template-columns: 1fr 1fr !important; }
          .sp-summary { grid-template-columns: 1fr 1fr !important; }
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

const adjBtn: React.CSSProperties = { background: '#0c1610', border: '1px solid rgba(200,168,75,.25)', color: '#c8a84b', width: 26, height: 26, borderRadius: 3, fontSize: 16, fontWeight: 700, cursor: 'pointer', lineHeight: 1 };
function chip(active: boolean): React.CSSProperties {
  return { padding: '5px 12px', background: active ? '#c8a84b' : 'transparent', color: active ? '#08100a' : '#7a8a72', border: `1px solid ${active ? '#c8a84b' : 'rgba(200,168,75,.25)'}`, fontFamily: rj, fontSize: 10, letterSpacing: '.5px', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };
}
function miniBtn(color: string): React.CSSProperties {
  return { background: 'transparent', border: 'none', color, fontFamily: rj, fontSize: 10.5, cursor: 'pointer', letterSpacing: '.5px', textTransform: 'uppercase', fontWeight: 700, padding: 0 };
}
function KPI({ label: l, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: '#0c1610', border: '1px solid rgba(200,168,75,.2)', borderRadius: 4, padding: '12px 10px', textAlign: 'center' }}>
      <div style={{ fontFamily: rj, fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: '#7a8a72', fontWeight: 700 }}>{l}</div>
      <div style={{ fontFamily: lb, fontSize: 22, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
    </div>
  );
}
