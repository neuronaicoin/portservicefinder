'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { saveItem, loadItem, genId } from '@/lib/voyage-storage';

const lb = 'var(--font-display)';
const rj = 'var(--font-ui)';
const g = { color: 'var(--acc)' } as React.CSSProperties;

// ============================================================
// Tidal height by the Rule of Twelfths between a known HW and LW.
// Fraction of range risen after each hour of a ~6h tide:
//   1/12, 2/12, 3/12, 3/12, 2/12, 1/12  (cumulative below)
// We interpolate continuously using a cosine curve (smooth,
// equivalent in spirit to the rule of twelfths) for any minute.
// ============================================================

interface TideEvent {
  id: string;
  type: 'HW' | 'LW';
  time: string;   // HH:MM
  height: number; // m (chart datum)
}

interface TideData {
  port: string;
  date: string;
  chartDatumNote: string;
  events: TideEvent[];
  // UKC requirement
  draft: number;
  requiredUkc: number;
  chartedDepth: number; // depth at chart datum at the spot
}

function newEvent(type: 'HW' | 'LW' = 'HW'): TideEvent {
  return { id: genId(), type, time: '', height: 0 };
}

const DEFAULT_DATA: TideData = {
  port: '', date: '', chartDatumNote: '',
  events: [newEvent('LW'), newEvent('HW'), newEvent('LW'), newEvent('HW')],
  draft: 0, requiredUkc: 0, chartedDepth: 0,
};

// time helpers
function toMin(t: string): number | null {
  if (!t || !/^\d{1,2}:\d{2}$/.test(t)) return null;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function fromMin(m: number): string {
  m = ((m % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60), mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

// height of tide at a given minute, given sorted events
function heightAt(min: number, events: { t: number; h: number }[]): number | null {
  if (events.length < 2) return null;
  // find bracketing pair
  for (let i = 0; i < events.length - 1; i++) {
    const a = events[i], b = events[i + 1];
    if (min >= a.t && min <= b.t) {
      const dur = b.t - a.t;
      if (dur <= 0) return a.h;
      const frac = (min - a.t) / dur;
      // cosine interpolation between consecutive HW/LW
      const cos = (1 - Math.cos(Math.PI * frac)) / 2; // 0..1 smooth
      return a.h + (b.h - a.h) * cos;
    }
  }
  return null;
}

// ============================================================
// STYLES
// ============================================================
const card: React.CSSProperties = { background: 'var(--card)', border: '1px solid color-mix(in srgb, var(--acc) 18%, transparent)', padding: '20px 18px', borderRadius: 4, marginBottom: 16 };
const sectionTitle: React.CSSProperties = { fontFamily: rj, fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--acc)', fontWeight: 700, marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid color-mix(in srgb, var(--acc) 12%, transparent)' };
const labelS: React.CSSProperties = { display: 'block', fontFamily: rj, fontSize: 10, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--ink3)', fontWeight: 600, marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', background: 'var(--bg2)', border: '1px solid color-mix(in srgb, var(--acc) 20%, transparent)', color: 'var(--ink)', padding: '7px 9px', fontFamily: rj, fontSize: 12.5, fontWeight: 500, borderRadius: 3, boxSizing: 'border-box' };
const ghostBtn: React.CSSProperties = { background: 'transparent', color: 'var(--acc)', border: '1px solid color-mix(in srgb, var(--acc) 40%, transparent)', padding: '8px 14px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };
const goldBtn: React.CSSProperties = { background: 'var(--acc)', color: 'var(--bg)', border: 'none', padding: '8px 16px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };

function fmt(n: number, dec = 2): string {
  if (!isFinite(n)) return '–';
  return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

// ============================================================
// COMPONENT
// ============================================================
export default function TidePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingId = searchParams.get('id');

  const [data, setData] = useState<TideData>(DEFAULT_DATA);
  const [recordId, setRecordId] = useState<string | null>(existingId);
  const [recordName, setRecordName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [queryTime, setQueryTime] = useState('');

  useEffect(() => {
    if (existingId) {
      const saved = loadItem<TideData>('tide', existingId);
      if (saved) { setData({ ...DEFAULT_DATA, ...saved.data }); setRecordName(saved.name); }
    }
  }, [existingId]);

  function update<K extends keyof TideData>(key: K, value: TideData[K]) { setData((p) => ({ ...p, [key]: value })); }
  function num(v: string): number { return parseFloat(v) || 0; }
  function updEvent(id: string, patch: Partial<TideEvent>) { setData((p) => ({ ...p, events: p.events.map((e) => (e.id === id ? { ...e, ...patch } : e)) })); }
  function addEvent() { setData((p) => ({ ...p, events: [...p.events, newEvent()] })); }
  function delEvent(id: string) { setData((p) => ({ ...p, events: p.events.filter((e) => e.id !== id) })); }

  // sorted valid events
  const sorted = useMemo(() => {
    return data.events
      .map((e) => ({ t: toMin(e.time), h: e.height, type: e.type }))
      .filter((e): e is { t: number; h: number; type: 'HW' | 'LW' } => e.t != null)
      .sort((a, b) => a.t - b.t);
  }, [data.events]);

  // height available = charted depth + tide height; required = draft + UKC
  const required = data.draft + data.requiredUkc;

  // query a single time
  const queryMin = toMin(queryTime);
  const queryHeight = queryMin != null ? heightAt(queryMin, sorted) : null;
  const queryAvailable = queryHeight != null ? data.chartedDepth + queryHeight : null;
  const queryOk = queryAvailable != null ? queryAvailable >= required : null;

  // build a window: scan the day in 10-min steps, find periods where available >= required
  const windows = useMemo(() => {
    if (sorted.length < 2 || required <= 0) return [];
    const start = sorted[0].t, end = sorted[sorted.length - 1].t;
    const res: { from: number; to: number }[] = [];
    let curStart: number | null = null;
    for (let m = start; m <= end; m += 10) {
      const h = heightAt(m, sorted);
      const avail = h != null ? data.chartedDepth + h : null;
      const ok = avail != null && avail >= required;
      if (ok && curStart == null) curStart = m;
      if (!ok && curStart != null) { res.push({ from: curStart, to: m - 10 }); curStart = null; }
    }
    if (curStart != null) res.push({ from: curStart, to: end });
    return res;
  }, [sorted, required, data.chartedDepth]);

  // chart points for mini graph
  const chartPts = useMemo(() => {
    if (sorted.length < 2) return [];
    const start = sorted[0].t, end = sorted[sorted.length - 1].t;
    const pts: { m: number; h: number }[] = [];
    for (let m = start; m <= end; m += 15) {
      const h = heightAt(m, sorted);
      if (h != null) pts.push({ m, h });
    }
    return pts;
  }, [sorted]);

  function handleSave() {
    const name = recordName.trim() || `${data.port || 'Port'} — ${data.date || 'Tide'}`;
    const id = recordId || genId();
    saveItem('tide', name, data, id);
    setRecordId(id); setRecordName(name); setSaveMsg('✓ Saved'); setShowSave(false);
    setTimeout(() => setSaveMsg(''), 3000);
  }
  function handleReset() {
    if (!confirm('Reset all fields?')) return;
    setData(DEFAULT_DATA); setRecordId(null); setRecordName(''); router.replace('/voyage/tide');
  }

  // chart dims
  const W = 600, H = 140, pad = 24;
  const heights = chartPts.map((p) => p.h);
  const minH = Math.min(0, ...heights), maxH = Math.max(1, ...heights);
  const tMin = sorted.length ? sorted[0].t : 0, tMax = sorted.length ? sorted[sorted.length - 1].t : 1;
  function px(m: number) { return pad + ((m - tMin) / Math.max(1, tMax - tMin)) * (W - 2 * pad); }
  function py(h: number) { return H - pad - ((h - minH) / Math.max(0.1, maxH - minH)) * (H - 2 * pad); }
  const pathD = chartPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${px(p.m).toFixed(1)} ${py(p.h).toFixed(1)}`).join(' ');

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--acc)', fontWeight: 700, marginBottom: 8 }}>
          ⚓ Voyage Hub · Tide Calculator
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Tide <em style={g}>Calculator</em>
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.6, maxWidth: 720 }}>
          Enter the day&apos;s HW/LW from your tide table; the tool interpolates the height of tide at any time
          and finds the window where you have enough water for your draft and under-keel clearance.
        </p>
      </div>

      {/* Disclaimer */}
      <div style={{ ...card, background: 'color-mix(in srgb, var(--warn) 6%, transparent)', borderColor: 'color-mix(in srgb, var(--warn) 30%, transparent)', padding: '12px 16px' }}>
        <div style={{ fontFamily: rj, fontSize: 12, color: 'var(--warn)', lineHeight: 1.5 }}>
          ⚠ <b>Interpolation aid only.</b> Use official predictions (Admiralty TotalTide / ATT, NOAA, hydrographic
          office). This uses a smooth curve between HW/LW and ignores surge, met effects and secondary-port corrections.
        </div>
      </div>

      {/* Action bar */}
      <div className="action-bar" style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => setShowSave(true)} style={goldBtn}>💾 Save</button>
        <button onClick={() => window.print()} style={ghostBtn}>🖨️ Print / PDF</button>
        <button onClick={handleReset} style={{ ...ghostBtn, color: 'var(--bad)', borderColor: 'color-mix(in srgb, var(--bad) 30%, transparent)' }}>🗑️ Reset</button>
        {saveMsg && <span style={{ color: 'var(--ok)', fontFamily: rj, fontSize: 12, fontWeight: 600 }}>{saveMsg}</span>}
        {recordName && <span style={{ color: 'var(--ink3)', fontFamily: rj, fontSize: 11, marginLeft: 'auto' }}>📂 {recordName}</span>}
      </div>

      {showSave && (
        <div style={{ ...card, background: 'color-mix(in srgb, var(--acc) 5%, transparent)', borderColor: 'color-mix(in srgb, var(--acc) 40%, transparent)' }}>
          <label style={labelS}>Name</label>
          <input type="text" value={recordName} onChange={(e) => setRecordName(e.target.value)} placeholder="e.g. Hamburg — 14 Jul" style={{ ...inputStyle, marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{ ...goldBtn, padding: '8px 14px', letterSpacing: '1px' }}>Save</button>
            <button onClick={() => setShowSave(false)} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* Port + events */}
      <div style={card}>
        <div style={sectionTitle}>1. HW / LW from Tide Table</div>
        <div className="ti-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 12 }}>
          <div><label style={labelS}>Port</label><input style={inputStyle} value={data.port} onChange={(e) => update('port', e.target.value)} placeholder="Hamburg" /></div>
          <div><label style={labelS}>Date</label><input style={inputStyle} type="date" value={data.date} onChange={(e) => update('date', e.target.value)} /></div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 360 }}>
            <thead>
              <tr style={{ color: 'var(--ink3)', fontFamily: rj, fontSize: 9.5, letterSpacing: '.5px', textTransform: 'uppercase' }}>
                <th style={{ ...thd, textAlign: 'left' }}>Type</th>
                <th style={thd}>Time (HH:MM)</th>
                <th style={thd}>Height (m)</th>
                <th style={{ ...thd, width: 28 }}></th>
              </tr>
            </thead>
            <tbody>
              {data.events.map((e) => (
                <tr key={e.id} style={{ borderTop: '1px solid color-mix(in srgb, var(--acc) 8%, transparent)' }}>
                  <td style={{ padding: '4px 6px' }}>
                    <select style={{ ...inputStyle, padding: '5px 7px', fontSize: 12 }} value={e.type} onChange={(ev) => updEvent(e.id, { type: ev.target.value as 'HW' | 'LW' })}>
                      <option value="HW">HW</option>
                      <option value="LW">LW</option>
                    </select>
                  </td>
                  <td style={{ padding: '4px 4px' }}><input style={{ ...inputStyle, padding: '5px 7px', fontSize: 12, textAlign: 'center' }} value={e.time} onChange={(ev) => updEvent(e.id, { time: ev.target.value })} placeholder="04:30" /></td>
                  <td style={{ padding: '4px 4px' }}><input style={{ ...inputStyle, padding: '5px 7px', fontSize: 12, textAlign: 'right' }} type="number" step="0.01" value={e.height || ''} onChange={(ev) => updEvent(e.id, { height: num(ev.target.value) })} placeholder="0.0" /></td>
                  <td style={{ padding: '4px 4px', textAlign: 'center' }}><button onClick={() => delEvent(e.id)} style={{ background: 'transparent', border: 'none', color: 'var(--bad)', cursor: 'pointer', fontSize: 12 }}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={addEvent} style={{ ...ghostBtn, marginTop: 12, fontSize: 10 }}>+ Add HW/LW</button>
        <p style={{ fontSize: 10, color: 'var(--ink3)', fontFamily: rj, marginTop: 8 }}>Enter in chronological order. Heights are above chart datum.</p>
      </div>

      {/* Tide curve */}
      {chartPts.length > 1 && (
        <div style={card}>
          <div style={sectionTitle}>📈 Tide Curve</div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
            {/* required-water line (as tide height needed) */}
            <path d={pathD} fill="none" stroke="var(--info)" strokeWidth={2} />
            {/* fill under curve */}
            <path d={`${pathD} L ${px(tMax)} ${H - pad} L ${px(tMin)} ${H - pad} Z`} fill="color-mix(in srgb, var(--info) 12%, transparent)" />
            {/* HW/LW markers */}
            {sorted.map((e, i) => (
              <g key={i}>
                <circle cx={px(e.t)} cy={py(e.h)} r={3} fill={e.type === 'HW' ? 'var(--ok)' : 'var(--warn)'} />
                <text x={px(e.t)} y={py(e.h) - 6} fill="var(--ink2)" fontSize={8} fontFamily={rj} textAnchor="middle">{e.type} {fmt(e.h, 1)}</text>
              </g>
            ))}
            <text x={pad} y={H - 6} fill="var(--ink3)" fontSize={8} fontFamily={rj}>{fromMin(tMin)}</text>
            <text x={W - pad} y={H - 6} fill="var(--ink3)" fontSize={8} fontFamily={rj} textAnchor="end">{fromMin(tMax)}</text>
          </svg>
        </div>
      )}

      {/* UKC requirement */}
      <div style={card}>
        <div style={sectionTitle}>2. Under-Keel Clearance Check</div>
        <div className="ti-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 12 }}>
          <div><label style={labelS}>Draft (m)</label><input style={inputStyle} type="number" step="0.01" value={data.draft || ''} onChange={(e) => update('draft', num(e.target.value))} placeholder="12.5" /></div>
          <div><label style={labelS}>Required UKC (m)</label><input style={inputStyle} type="number" step="0.01" value={data.requiredUkc || ''} onChange={(e) => update('requiredUkc', num(e.target.value))} placeholder="1.0" /></div>
          <div><label style={labelS}>Charted Depth (m, CD)</label><input style={inputStyle} type="number" step="0.01" value={data.chartedDepth || ''} onChange={(e) => update('chartedDepth', num(e.target.value))} placeholder="11.0" /></div>
        </div>
        <div style={{ padding: '10px 12px', background: 'color-mix(in srgb, var(--acc) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--acc) 15%, transparent)', borderRadius: 3, fontFamily: rj, fontSize: 12, color: 'var(--ink2)' }}>
          Water needed = draft + UKC = <b style={{ color: 'var(--acc)' }}>{fmt(required, 2)} m</b>. Available = charted depth + height of tide.
          {data.chartedDepth > 0 && <> Min tide height required = <b style={{ color: 'var(--acc)' }}>{fmt(required - data.chartedDepth, 2)} m</b>.</>}
        </div>
      </div>

      {/* Query a time */}
      <div style={card}>
        <div style={sectionTitle}>3. Height at a Given Time</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 140 }}>
            <label style={labelS}>Time (HH:MM)</label>
            <input style={inputStyle} value={queryTime} onChange={(e) => setQueryTime(e.target.value)} placeholder="09:15" />
          </div>
          {queryHeight != null && (
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontFamily: rj, fontSize: 13 }}>
              <span style={{ color: 'var(--ink3)' }}>Tide height: <b style={{ color: 'var(--info)' }}>{fmt(queryHeight, 2)} m</b></span>
              {queryAvailable != null && <span style={{ color: 'var(--ink3)' }}>Total water: <b style={{ color: 'var(--ink)' }}>{fmt(queryAvailable, 2)} m</b></span>}
              {queryOk != null && required > 0 && (
                <span style={{ color: queryOk ? 'var(--ok)' : 'var(--bad)', fontWeight: 700 }}>{queryOk ? '✓ Sufficient' : '✕ Insufficient'}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Windows */}
      {required > 0 && data.chartedDepth > 0 && (
        <div style={{ ...card, background: 'linear-gradient(135deg,color-mix(in srgb, var(--acc) 8%, transparent),transparent)', borderColor: 'color-mix(in srgb, var(--acc) 40%, transparent)' }}>
          <div style={sectionTitle}>⚡ Tidal Windows (enough water)</div>
          {windows.length === 0 ? (
            <div style={{ fontFamily: rj, fontSize: 13, color: 'var(--bad)' }}>
              ✕ No period within the entered HW/LW range provides {fmt(required, 2)} m of water. Wait for a higher tide or reduce draft.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {windows.map((w, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg2)', border: '1px solid color-mix(in srgb, var(--ok) 40%, transparent)', borderRadius: 4, fontFamily: rj }}>
                  <span style={{ color: 'var(--ok)', fontWeight: 700, fontSize: 14 }}>✓ {fromMin(w.from)} – {fromMin(w.to)}</span>
                  <span style={{ color: 'var(--ink3)', fontSize: 12 }}>{Math.round((w.to - w.from) / 60 * 10) / 10} h window</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reference */}
      <div style={{ ...card, background: 'color-mix(in srgb, var(--ink3) 5%, transparent)', borderColor: 'color-mix(in srgb, var(--ink3) 15%, transparent)' }}>
        <div style={sectionTitle}>📖 Method &amp; Sources</div>
        <ul style={{ fontSize: 11.5, color: 'var(--ink2)', lineHeight: 1.7, paddingLeft: 18, fontFamily: rj }}>
          <li>Height is interpolated with a smooth cosine curve between each HW and LW — close to the <b style={{ color: 'var(--acc)' }}>rule of twelfths</b> but continuous for any minute.</li>
          <li>Total water = charted depth (at chart datum) + height of tide. Window = where total water ≥ draft + required UKC.</li>
          <li>Official sources: <a href="https://www.admiralty.co.uk/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--info)' }}>Admiralty (ATT / TotalTide)</a>, <a href="https://tidesandcurrents.noaa.gov/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--info)' }}>NOAA Tides &amp; Currents</a>, your hydrographic office.</li>
          <li>Surge, barometric &amp; wind effects and secondary-port time/height differences are NOT applied — use official predictions for decisions.</li>
        </ul>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .ti-g3 { grid-template-columns: 1fr !important; }
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

const thd: React.CSSProperties = { padding: '6px 6px', textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap' };
