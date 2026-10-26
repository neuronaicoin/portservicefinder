'use client';
import { useState, useEffect, useMemo } from 'react';
import { saveItem, loadItem, genId } from '@/lib/voyage-storage';

const lb = 'var(--font-display)';
const rj = 'var(--font-ui)';
const g = { color: 'var(--acc)' } as React.CSSProperties;

// ============================================================
// TYPES
// ============================================================
type Fuel = 'VLSFO' | 'LSMGO' | 'HSFO' | 'B24' | 'LNG';

interface PriceEntry {
  id: string;
  port: string;
  date: string;
  fuel: Fuel;
  price: number;   // $/MT
  supplier: string;
  notes: string;
}

interface BunkerData {
  entries: PriceEntry[];
  // stem planning
  stemQty: number;       // MT
  stemFuel: Fuel;
}

const FUELS: Fuel[] = ['VLSFO', 'LSMGO', 'HSFO', 'B24', 'LNG'];
const FUEL_COLOR: Record<Fuel, string> = {
  VLSFO: 'var(--acc)', LSMGO: 'var(--info)', HSFO: 'var(--warn)', B24: 'var(--ok)', LNG: 'var(--ok)',
};

function newEntry(fuel: Fuel = 'VLSFO'): PriceEntry {
  return { id: genId(), port: '', date: new Date().toISOString().slice(0, 10), fuel, price: 0, supplier: '', notes: '' };
}

const DEFAULT_DATA: BunkerData = { entries: [], stemQty: 0, stemFuel: 'VLSFO' };

// ============================================================
// STYLES
// ============================================================
const card: React.CSSProperties = { background: 'var(--card)', border: '1px solid color-mix(in srgb, var(--acc) 18%, transparent)', padding: '20px 18px', borderRadius: 4, marginBottom: 16 };
const sectionTitle: React.CSSProperties = { fontFamily: rj, fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--acc)', fontWeight: 700, marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid color-mix(in srgb, var(--acc) 12%, transparent)' };
const labelS: React.CSSProperties = { display: 'block', fontFamily: rj, fontSize: 10, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--ink3)', fontWeight: 600, marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', background: 'var(--bg2)', border: '1px solid color-mix(in srgb, var(--acc) 20%, transparent)', color: 'var(--ink)', padding: '7px 9px', fontFamily: rj, fontSize: 12.5, fontWeight: 500, borderRadius: 3, boxSizing: 'border-box' };
const ghostBtn: React.CSSProperties = { background: 'transparent', color: 'var(--acc)', border: '1px solid color-mix(in srgb, var(--acc) 40%, transparent)', padding: '8px 14px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };
const goldBtn: React.CSSProperties = { background: 'var(--acc)', color: 'var(--bg)', border: 'none', padding: '8px 16px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };

const STORAGE_KEY = 'bunkerprices';
const SINGLETON_ID = 'bunkertracker';

function fmt(n: number, dec = 2): string {
  if (!isFinite(n)) return '–';
  return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

// ============================================================
// COMPONENT
// ============================================================
export default function BunkerPricesPage() {
  const [data, setData] = useState<BunkerData>(DEFAULT_DATA);
  const [saveMsg, setSaveMsg] = useState('');
  const [fuelFilter, setFuelFilter] = useState<'all' | Fuel>('all');
  const [editing, setEditing] = useState<PriceEntry | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    try {
      const saved = loadItem<BunkerData>(STORAGE_KEY, SINGLETON_ID);
      if (saved && saved.data && Array.isArray(saved.data.entries)) setData({ ...DEFAULT_DATA, ...saved.data });
    } catch { /* ignore */ }
  }, []);

  function persist(next: BunkerData) {
    setData(next);
    try { saveItem(STORAGE_KEY, 'Bunker Price Tracker', next, SINGLETON_ID); setSaveMsg('✓ Saved'); setTimeout(() => setSaveMsg(''), 2000); } catch { /* ignore */ }
  }
  function update<K extends keyof BunkerData>(key: K, value: BunkerData[K]) { persist({ ...data, [key]: value }); }
  function num(v: string): number { return parseFloat(v) || 0; }

  function openNew() { setEditing(newEntry(data.stemFuel)); setShowForm(true); }
  function openEdit(e: PriceEntry) { setEditing({ ...e }); setShowForm(true); }
  function saveEntry() {
    if (!editing) return;
    const exists = data.entries.some((x) => x.id === editing.id);
    persist({ ...data, entries: exists ? data.entries.map((x) => (x.id === editing.id ? editing : x)) : [...data.entries, editing] });
    setShowForm(false); setEditing(null);
  }
  function delEntry(id: string) {
    if (!confirm('Delete this price entry?')) return;
    persist({ ...data, entries: data.entries.filter((x) => x.id !== id) });
  }

  // latest price per port for the stem fuel — cheapest first
  const comparison = useMemo(() => {
    const byPort: Record<string, PriceEntry> = {};
    data.entries
      .filter((e) => e.fuel === data.stemFuel && e.price > 0)
      .forEach((e) => {
        const key = e.port.trim().toLowerCase() || '—';
        if (!byPort[key] || e.date > byPort[key].date) byPort[key] = e;
      });
    return Object.values(byPort).sort((a, b) => a.price - b.price);
  }, [data.entries, data.stemFuel]);

  const cheapest = comparison[0];
  const dearest = comparison[comparison.length - 1];
  const spread = cheapest && dearest ? dearest.price - cheapest.price : 0;
  const stemSaving = spread * (data.stemQty || 0);

  const visible = useMemo(() => {
    return data.entries
      .filter((e) => fuelFilter === 'all' || e.fuel === fuelFilter)
      .sort((a, b) => (b.date).localeCompare(a.date));
  }, [data.entries, fuelFilter]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--acc)', fontWeight: 700, marginBottom: 8 }}>
          ⚓ Voyage Hub · Bunker Price Tracker
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Bunker <em style={g}>Price Tracker</em>
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.6, maxWidth: 720 }}>
          Log bunker quotes by port and fuel grade, compare ports for your next stem, and see how much a
          cheaper port saves. You enter the prices — no live feed.
        </p>
      </div>

      {/* Info */}
      <div style={{ ...card, background: 'color-mix(in srgb, var(--info) 6%, transparent)', borderColor: 'color-mix(in srgb, var(--info) 30%, transparent)', padding: '12px 16px' }}>
        <div style={{ fontFamily: rj, fontSize: 12, color: 'var(--info)', lineHeight: 1.5 }}>
          💡 Get quotes from your broker / supplier or a price service (Ship &amp; Bunker, Bunkerworld), enter them here,
          and the tracker ranks ports and estimates the stem-cost difference.
        </div>
      </div>

      <div className="action-bar" style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={openNew} style={goldBtn}>+ Add Price</button>
        <button onClick={() => window.print()} style={ghostBtn}>🖨️ Print / PDF</button>
        {saveMsg && <span style={{ color: 'var(--ok)', fontFamily: rj, fontSize: 12, fontWeight: 600 }}>{saveMsg}</span>}
      </div>

      {/* Stem planning */}
      <div style={card}>
        <div style={sectionTitle}>Stem Planning</div>
        <div className="bk-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          <div>
            <label style={labelS}>Fuel Grade to Compare</label>
            <select style={inputStyle} value={data.stemFuel} onChange={(e) => update('stemFuel', e.target.value as Fuel)}>
              {FUELS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div><label style={labelS}>Stem Quantity (MT)</label><input style={inputStyle} type="number" value={data.stemQty || ''} onChange={(e) => update('stemQty', num(e.target.value))} placeholder="800" /></div>
        </div>
      </div>

      {/* Comparison */}
      {comparison.length > 0 && (
        <div style={{ ...card, background: 'linear-gradient(135deg,color-mix(in srgb, var(--acc) 8%, transparent),transparent)', borderColor: 'color-mix(in srgb, var(--acc) 40%, transparent)' }}>
          <div style={sectionTitle}>⚡ {data.stemFuel} — Port Comparison (latest per port)</div>
          <div className="bk-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
            <KPI label="Cheapest" value={cheapest ? `$${fmt(cheapest.price, 0)}` : '—'} sub={cheapest?.port} color="var(--ok)" />
            <KPI label="Spread" value={`$${fmt(spread, 0)}`} sub="per MT" color="var(--warn)" />
            <KPI label="Stem Saving" value={data.stemQty > 0 ? `$${fmt(stemSaving, 0)}` : '—'} sub={data.stemQty > 0 ? `on ${data.stemQty} MT` : 'set qty'} color="var(--acc)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {comparison.map((e, i) => {
              const isLow = i === 0;
              const stemCost = e.price * (data.stemQty || 0);
              return (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg2)', border: `1px solid ${isLow ? 'color-mix(in srgb, var(--ok) 40%, transparent)' : 'color-mix(in srgb, var(--acc) 12%, transparent)'}`, borderRadius: 3, fontFamily: rj }}>
                  <span style={{ color: 'var(--ink)', fontWeight: 600, fontSize: 13 }}>{isLow && '🏆 '}{e.port || '—'} <span style={{ color: 'var(--ink3)', fontWeight: 400, fontSize: 11 }}>· {e.date}</span></span>
                  <span style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    {data.stemQty > 0 && <span style={{ color: 'var(--ink3)', fontSize: 11 }}>${fmt(stemCost, 0)}</span>}
                    <span style={{ color: isLow ? 'var(--ok)' : 'var(--acc)', fontWeight: 700, fontSize: 14 }}>${fmt(e.price, 0)}/MT</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && editing && (
        <div style={{ ...card, borderColor: 'color-mix(in srgb, var(--acc) 50%, transparent)' }}>
          <div style={sectionTitle}>{data.entries.some((x) => x.id === editing.id) ? 'Edit Price' : 'New Price'}</div>
          <div className="bk-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 10 }}>
            <div><label style={labelS}>Port</label><input style={inputStyle} value={editing.port} onChange={(e) => setEditing({ ...editing, port: e.target.value })} placeholder="Singapore" /></div>
            <div><label style={labelS}>Date</label><input style={inputStyle} type="date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} /></div>
            <div>
              <label style={labelS}>Fuel</label>
              <select style={inputStyle} value={editing.fuel} onChange={(e) => setEditing({ ...editing, fuel: e.target.value as Fuel })}>
                {FUELS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div><label style={labelS}>Price ($/MT)</label><input style={inputStyle} type="number" value={editing.price || ''} onChange={(e) => setEditing({ ...editing, price: num(e.target.value) })} placeholder="600" /></div>
          </div>
          <div className="bk-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 12 }}>
            <div><label style={labelS}>Supplier</label><input style={inputStyle} value={editing.supplier} onChange={(e) => setEditing({ ...editing, supplier: e.target.value })} placeholder="Broker / supplier" /></div>
            <div><label style={labelS}>Notes</label><input style={inputStyle} value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} placeholder="Validity, barge, terms..." /></div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={saveEntry} style={{ ...goldBtn, padding: '8px 18px' }} disabled={!editing.port || editing.price <= 0}>Save Price</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* PSF cross-sell */}
      <div style={{ ...card, background: 'color-mix(in srgb, var(--acc) 5%, transparent)', borderColor: 'color-mix(in srgb, var(--acc) 30%, transparent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontFamily: rj, fontSize: 12.5, color: 'var(--ink2)' }}>⛽ <b style={{ color: 'var(--acc)' }}>Find bunker suppliers &amp; barges on PortServiceFinder.</b></div>
        <a href="/" style={{ ...ghostBtn, textDecoration: 'none', display: 'inline-block' }}>Search Suppliers →</a>
      </div>

      {/* Filter + log */}
      {data.entries.length > 0 && (
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 14 }}>
          <button onClick={() => setFuelFilter('all')} style={chip(fuelFilter === 'all')}>All fuels</button>
          {FUELS.map((f) => <button key={f} onClick={() => setFuelFilter(f)} style={chip(fuelFilter === f)}>{f}</button>)}
        </div>
      )}

      {data.entries.length === 0 && !showForm && (
        <div style={{ ...card, textAlign: 'center', color: 'var(--ink3)', fontFamily: rj }}>
          No prices yet. Tap <b style={{ color: 'var(--acc)' }}>+ Add Price</b> to start tracking bunker quotes.
        </div>
      )}

      {visible.map((e) => (
        <div key={e.id} style={{ ...card, padding: '12px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 9, background: `${FUEL_COLOR[e.fuel]}22`, color: FUEL_COLOR[e.fuel], padding: '2px 8px', borderRadius: 3, fontFamily: rj, fontWeight: 700, letterSpacing: '.5px' }}>{e.fuel}</span>
                <span style={{ fontFamily: lb, fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{e.port}</span>
                <span style={{ fontFamily: rj, fontSize: 11, color: 'var(--ink3)' }}>{e.date}</span>
              </div>
              {(e.supplier || e.notes) && <div style={{ fontFamily: rj, fontSize: 11, color: 'var(--ink3)', marginTop: 3 }}>{e.supplier}{e.supplier && e.notes ? ' · ' : ''}{e.notes}</div>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontFamily: lb, fontSize: 18, fontWeight: 700, color: 'var(--acc)' }}>${fmt(e.price, 0)}<span style={{ fontSize: 11, color: 'var(--ink3)' }}>/MT</span></span>
              <button onClick={() => openEdit(e)} style={miniBtn('var(--acc)')}>Edit</button>
              <button onClick={() => delEntry(e.id)} style={miniBtn('var(--bad)')}>✕</button>
            </div>
          </div>
        </div>
      ))}

      <style>{`
        @media (max-width: 720px) {
          .bk-g3 { grid-template-columns: 1fr 1fr !important; }
          .bk-kpis { grid-template-columns: 1fr !important; }
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
  return { padding: '5px 12px', background: active ? 'var(--acc)' : 'transparent', color: active ? 'var(--bg)' : 'var(--ink3)', border: `1px solid ${active ? 'var(--acc)' : 'color-mix(in srgb, var(--acc) 25%, transparent)'}`, fontFamily: rj, fontSize: 10, letterSpacing: '.5px', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };
}
function miniBtn(color: string): React.CSSProperties {
  return { background: 'transparent', border: 'none', color, fontFamily: rj, fontSize: 10.5, cursor: 'pointer', letterSpacing: '.5px', textTransform: 'uppercase', fontWeight: 700, padding: 0 };
}
function KPI({ label: l, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid color-mix(in srgb, var(--acc) 20%, transparent)', borderRadius: 4, padding: '12px 10px', textAlign: 'center' }}>
      <div style={{ fontFamily: rj, fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--ink3)', fontWeight: 700 }}>{l}</div>
      <div style={{ fontFamily: lb, fontSize: 22, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontFamily: rj, fontSize: 10, color: 'var(--ink3)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
