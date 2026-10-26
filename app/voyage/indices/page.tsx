'use client';
import { useState, useEffect, useMemo } from 'react';
import { saveItem, loadItem, genId } from '@/lib/voyage-storage';

const lb = 'var(--font-display)';
const rj = 'var(--font-ui)';
const g = { color: 'var(--acc)' } as React.CSSProperties;

// ============================================================
// TYPES
// ============================================================
type IndexKey = 'BDI' | 'BCI' | 'BPI' | 'BSI' | 'BHSI' | 'CUSTOM';

interface Reading {
  id: string;
  index: IndexKey;
  customLabel: string;
  date: string;
  value: number;
}

interface IndicesData {
  readings: Reading[];
  activeIndex: IndexKey;
}

const INDEX_META: Record<IndexKey, { label: string; full: string; color: string }> = {
  BDI: { label: 'BDI', full: 'Baltic Dry Index', color: 'var(--acc)' },
  BCI: { label: 'BCI', full: 'Capesize', color: 'var(--info)' },
  BPI: { label: 'BPI', full: 'Panamax', color: 'var(--ok)' },
  BSI: { label: 'BSI', full: 'Supramax', color: 'var(--warn)' },
  BHSI: { label: 'BHSI', full: 'Handysize', color: 'var(--ok)' },
  CUSTOM: { label: 'Custom', full: 'Your route / rate', color: 'var(--bad)' },
};

function newReading(index: IndexKey = 'BDI'): Reading {
  return { id: genId(), index, customLabel: '', date: new Date().toISOString().slice(0, 10), value: 0 };
}

const DEFAULT_DATA: IndicesData = { readings: [], activeIndex: 'BDI' };

// ============================================================
// STYLES
// ============================================================
const card: React.CSSProperties = { background: 'var(--card)', border: '1px solid color-mix(in srgb, var(--acc) 18%, transparent)', padding: '20px 18px', borderRadius: 4, marginBottom: 16 };
const sectionTitle: React.CSSProperties = { fontFamily: rj, fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--acc)', fontWeight: 700, marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid color-mix(in srgb, var(--acc) 12%, transparent)' };
const labelS: React.CSSProperties = { display: 'block', fontFamily: rj, fontSize: 10, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--ink3)', fontWeight: 600, marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', background: 'var(--bg2)', border: '1px solid color-mix(in srgb, var(--acc) 20%, transparent)', color: 'var(--ink)', padding: '7px 9px', fontFamily: rj, fontSize: 12.5, fontWeight: 500, borderRadius: 3, boxSizing: 'border-box' };
const ghostBtn: React.CSSProperties = { background: 'transparent', color: 'var(--acc)', border: '1px solid color-mix(in srgb, var(--acc) 40%, transparent)', padding: '8px 14px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };
const goldBtn: React.CSSProperties = { background: 'var(--acc)', color: 'var(--bg)', border: 'none', padding: '8px 16px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };

const STORAGE_KEY = 'indices';
const SINGLETON_ID = 'indicestracker';

function fmt(n: number, dec = 0): string {
  if (!isFinite(n)) return '–';
  return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

// ============================================================
// COMPONENT
// ============================================================
export default function IndicesPage() {
  const [data, setData] = useState<IndicesData>(DEFAULT_DATA);
  const [saveMsg, setSaveMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Reading | null>(null);

  useEffect(() => {
    try {
      const saved = loadItem<IndicesData>(STORAGE_KEY, SINGLETON_ID);
      if (saved && saved.data && Array.isArray(saved.data.readings)) setData({ ...DEFAULT_DATA, ...saved.data });
    } catch { /* ignore */ }
  }, []);

  function persist(next: IndicesData) {
    setData(next);
    try { saveItem(STORAGE_KEY, 'Market Indices', next, SINGLETON_ID); setSaveMsg('✓ Saved'); setTimeout(() => setSaveMsg(''), 2000); } catch { /* ignore */ }
  }
  function update<K extends keyof IndicesData>(key: K, value: IndicesData[K]) { persist({ ...data, [key]: value }); }
  function num(v: string): number { return parseFloat(v) || 0; }

  function openNew() { setEditing(newReading(data.activeIndex)); setShowForm(true); }
  function openEdit(r: Reading) { setEditing({ ...r }); setShowForm(true); }
  function saveReading() {
    if (!editing) return;
    const exists = data.readings.some((x) => x.id === editing.id);
    persist({ ...data, readings: exists ? data.readings.map((x) => (x.id === editing.id ? editing : x)) : [...data.readings, editing] });
    setShowForm(false); setEditing(null);
  }
  function delReading(id: string) {
    if (!confirm('Delete this reading?')) return;
    persist({ ...data, readings: data.readings.filter((x) => x.id !== id) });
  }

  // series for active index, sorted by date ascending
  const series = useMemo(() => {
    return data.readings
      .filter((r) => r.index === data.activeIndex)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [data.readings, data.activeIndex]);

  const latest = series[series.length - 1];
  const prev = series[series.length - 2];
  const change = latest && prev ? latest.value - prev.value : 0;
  const changePct = latest && prev && prev.value !== 0 ? (change / prev.value) * 100 : 0;
  const high = series.length ? Math.max(...series.map((r) => r.value)) : 0;
  const low = series.length ? Math.min(...series.map((r) => r.value)) : 0;

  const meta = INDEX_META[data.activeIndex];

  // chart
  const W = 600, H = 160, pad = 30;
  const vals = series.map((r) => r.value);
  const minV = vals.length ? Math.min(...vals) : 0;
  const maxV = vals.length ? Math.max(...vals) : 1;
  function px(i: number) { return pad + (series.length <= 1 ? 0 : (i / (series.length - 1)) * (W - 2 * pad)); }
  function py(v: number) { return H - pad - ((v - minV) / Math.max(1, maxV - minV)) * (H - 2 * pad); }
  const pathD = series.map((r, i) => `${i === 0 ? 'M' : 'L'} ${px(i).toFixed(1)} ${py(r.value).toFixed(1)}`).join(' ');

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--acc)', fontWeight: 700, marginBottom: 8 }}>
          ⚓ Voyage Hub · Market Indices
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Market <em style={g}>Indices</em>
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.6, maxWidth: 720 }}>
          Track the Baltic dry indices (or your own route rate) over time — log the daily figure and the
          tool charts the trend and the day-on-day change. You enter the values — no live feed.
        </p>
      </div>

      {/* Info */}
      <div style={{ ...card, background: 'color-mix(in srgb, var(--info) 6%, transparent)', borderColor: 'color-mix(in srgb, var(--info) 30%, transparent)', padding: '12px 16px' }}>
        <div style={{ fontFamily: rj, fontSize: 12, color: 'var(--info)', lineHeight: 1.5 }}>
          💡 The Baltic Exchange publishes BDI/BCI/BPI/BSI/BHSI each business day. Log the figure here to build
          your own trend. <a href="https://www.balticexchange.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--info)', fontWeight: 700 }}>Baltic Exchange ↗</a>
        </div>
      </div>

      <div className="action-bar" style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={openNew} style={goldBtn}>+ Add Reading</button>
        <button onClick={() => window.print()} style={ghostBtn}>🖨️ Print / PDF</button>
        {saveMsg && <span style={{ color: 'var(--ok)', fontFamily: rj, fontSize: 12, fontWeight: 600 }}>{saveMsg}</span>}
      </div>

      {/* Index selector */}
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 16 }}>
        {(Object.keys(INDEX_META) as IndexKey[]).map((k) => {
          const m = INDEX_META[k];
          const active = data.activeIndex === k;
          return (
            <button key={k} onClick={() => update('activeIndex', k)} style={{
              padding: '7px 14px', background: active ? m.color : 'transparent',
              color: active ? 'var(--bg)' : m.color, border: `1px solid ${m.color}66`,
              fontFamily: rj, fontSize: 11, fontWeight: 700, cursor: 'pointer', borderRadius: 4, whiteSpace: 'nowrap',
            }}>{m.label}</button>
          );
        })}
      </div>

      {/* Form */}
      {showForm && editing && (
        <div style={{ ...card, borderColor: 'color-mix(in srgb, var(--acc) 50%, transparent)' }}>
          <div style={sectionTitle}>{data.readings.some((x) => x.id === editing.id) ? 'Edit Reading' : 'New Reading'}</div>
          <div className="ix-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={labelS}>Index</label>
              <select style={inputStyle} value={editing.index} onChange={(e) => setEditing({ ...editing, index: e.target.value as IndexKey })}>
                {(Object.keys(INDEX_META) as IndexKey[]).map((k) => <option key={k} value={k}>{INDEX_META[k].label} — {INDEX_META[k].full}</option>)}
              </select>
            </div>
            <div><label style={labelS}>Date</label><input style={inputStyle} type="date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} /></div>
            <div><label style={labelS}>Value</label><input style={inputStyle} type="number" value={editing.value || ''} onChange={(e) => setEditing({ ...editing, value: num(e.target.value) })} placeholder="1450" /></div>
          </div>
          {editing.index === 'CUSTOM' && (
            <div style={{ marginBottom: 10 }}><label style={labelS}>Custom Label</label><input style={inputStyle} value={editing.customLabel} onChange={(e) => setEditing({ ...editing, customLabel: e.target.value })} placeholder="Tubarão→Qingdao TCE $/day" /></div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={saveReading} style={{ ...goldBtn, padding: '8px 18px' }} disabled={editing.value <= 0}>Save Reading</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* Current value */}
      {latest && (
        <div style={{ ...card, background: 'linear-gradient(135deg,color-mix(in srgb, var(--acc) 8%, transparent),transparent)', borderColor: 'color-mix(in srgb, var(--acc) 40%, transparent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontFamily: rj, fontSize: 11, color: 'var(--ink3)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700 }}>
                {meta.label} — {data.activeIndex === 'CUSTOM' && latest.customLabel ? latest.customLabel : meta.full}
              </div>
              <div style={{ fontFamily: lb, fontSize: 38, fontWeight: 700, color: meta.color, lineHeight: 1.1 }}>{fmt(latest.value)}</div>
              <div style={{ fontFamily: rj, fontSize: 11, color: 'var(--ink3)' }}>as of {latest.date}</div>
            </div>
            {prev && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: rj, fontSize: 16, fontWeight: 700, color: change >= 0 ? 'var(--ok)' : 'var(--bad)' }}>
                  {change >= 0 ? '▲' : '▼'} {fmt(Math.abs(change))} ({fmt(Math.abs(changePct), 1)}%)
                </div>
                <div style={{ fontFamily: rj, fontSize: 10, color: 'var(--ink3)' }}>vs {prev.date}</div>
              </div>
            )}
          </div>

          {series.length > 1 && (
            <div style={{ marginTop: 16 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
                <path d={`${pathD} L ${px(series.length - 1)} ${H - pad} L ${px(0)} ${H - pad} Z`} fill={`${meta.color}1a`} />
                <path d={pathD} fill="none" stroke={meta.color} strokeWidth={2} />
                {series.map((r, i) => <circle key={r.id} cx={px(i)} cy={py(r.value)} r={2.5} fill={meta.color} />)}
                <text x={pad} y={H - 8} fill="var(--ink3)" fontSize={8} fontFamily={rj}>{series[0].date}</text>
                <text x={W - pad} y={H - 8} fill="var(--ink3)" fontSize={8} fontFamily={rj} textAnchor="end">{latest.date}</text>
                <text x={pad} y={py(maxV) - 3} fill="var(--ink3)" fontSize={8} fontFamily={rj}>{fmt(maxV)}</text>
                <text x={pad} y={py(minV) + 10} fill="var(--ink3)" fontSize={8} fontFamily={rj}>{fmt(minV)}</text>
              </svg>
              <div style={{ display: 'flex', gap: 18, marginTop: 8, fontFamily: rj, fontSize: 11, color: 'var(--ink3)' }}>
                <span>High: <b style={{ color: 'var(--ok)' }}>{fmt(high)}</b></span>
                <span>Low: <b style={{ color: 'var(--bad)' }}>{fmt(low)}</b></span>
                <span>Readings: <b style={{ color: 'var(--ink)' }}>{series.length}</b></span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Log */}
      {series.length === 0 && !showForm && (
        <div style={{ ...card, textAlign: 'center', color: 'var(--ink3)', fontFamily: rj }}>
          No {meta.label} readings yet. Tap <b style={{ color: 'var(--acc)' }}>+ Add Reading</b> to start the trend.
        </div>
      )}

      {series.length > 0 && (
        <div style={card}>
          <div style={sectionTitle}>{meta.label} History</div>
          {[...series].reverse().map((r, idx, arr) => {
            const prevR = arr[idx + 1];
            const d = prevR ? r.value - prevR.value : 0;
            return (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px dashed color-mix(in srgb, var(--acc) 10%, transparent)', fontFamily: rj }}>
                <span style={{ color: 'var(--ink2)', fontSize: 12.5 }}>{r.date}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {prevR && <span style={{ fontSize: 11, color: d >= 0 ? 'var(--ok)' : 'var(--bad)' }}>{d >= 0 ? '▲' : '▼'} {fmt(Math.abs(d))}</span>}
                  <span style={{ color: meta.color, fontWeight: 700, fontSize: 14, minWidth: 60, textAlign: 'right' }}>{fmt(r.value)}</span>
                  <button onClick={() => openEdit(r)} style={miniBtn('var(--acc)')}>Edit</button>
                  <button onClick={() => delReading(r.id)} style={miniBtn('var(--bad)')}>✕</button>
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Reference */}
      <div style={{ ...card, background: 'color-mix(in srgb, var(--ink3) 5%, transparent)', borderColor: 'color-mix(in srgb, var(--ink3) 15%, transparent)' }}>
        <div style={sectionTitle}>📖 The Baltic Indices</div>
        <ul style={{ fontSize: 11.5, color: 'var(--ink2)', lineHeight: 1.7, paddingLeft: 18, fontFamily: rj }}>
          <li><b style={{ color: 'var(--acc)' }}>BDI</b> — composite dry-bulk index (Capesize, Panamax, Supramax weighted).</li>
          <li><b style={{ color: 'var(--info)' }}>BCI / BPI / BSI / BHSI</b> — Capesize, Panamax, Supramax, Handysize sub-indices.</li>
          <li>Use <b>Custom</b> to track your own route TCE or freight rate alongside the published indices.</li>
          <li>Figures are published each London business day by the Baltic Exchange — enter them manually here.</li>
        </ul>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .ix-g3 { grid-template-columns: 1fr !important; }
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
