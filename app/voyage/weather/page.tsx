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
type OpType = 'cargo' | 'sts' | 'bunkering' | 'anchor' | 'transit' | 'crane' | 'custom';

interface Forecast {
  id: string;
  label: string;     // time / day
  wind: number;      // kt
  gust: number;      // kt
  waveHs: number;    // m
  swell: number;     // m
}

interface WeatherData {
  vesselName: string;
  location: string;
  opType: OpType;
  maxWind: number;
  maxWave: number;
  maxSwell: number;
  forecasts: Forecast[];
}

// default operating limits by operation (indicative)
const OP_LIMITS: Record<OpType, { label: string; wind: number; wave: number; swell: number }> = {
  cargo: { label: 'Cargo Ops (alongside)', wind: 25, wave: 1.5, swell: 1.0 },
  sts: { label: 'STS Transfer', wind: 20, wave: 1.5, swell: 1.0 },
  bunkering: { label: 'Bunkering', wind: 22, wave: 1.5, swell: 1.0 },
  anchor: { label: 'At Anchor (holding)', wind: 40, wave: 3.0, swell: 2.5 },
  transit: { label: 'Coastal / Channel Transit', wind: 34, wave: 4.0, swell: 3.0 },
  crane: { label: 'Heavy-lift / Crane', wind: 16, wave: 1.0, swell: 0.5 },
  custom: { label: 'Custom', wind: 25, wave: 2.0, swell: 1.5 },
};

const BEAUFORT: { f: number; kt: string; desc: string; sea: string }[] = [
  { f: 0, kt: '<1', desc: 'Calm', sea: 'Mirror' },
  { f: 1, kt: '1–3', desc: 'Light air', sea: 'Ripples' },
  { f: 2, kt: '4–6', desc: 'Light breeze', sea: 'Small wavelets' },
  { f: 3, kt: '7–10', desc: 'Gentle breeze', sea: 'Large wavelets' },
  { f: 4, kt: '11–16', desc: 'Moderate breeze', sea: 'Small waves' },
  { f: 5, kt: '17–21', desc: 'Fresh breeze', sea: 'Moderate waves' },
  { f: 6, kt: '22–27', desc: 'Strong breeze', sea: 'Large waves, white foam' },
  { f: 7, kt: '28–33', desc: 'Near gale', sea: 'Sea heaps up, foam streaks' },
  { f: 8, kt: '34–40', desc: 'Gale', sea: 'Moderately high waves' },
  { f: 9, kt: '41–47', desc: 'Strong gale', sea: 'High waves, dense foam' },
  { f: 10, kt: '48–55', desc: 'Storm', sea: 'Very high waves' },
  { f: 11, kt: '56–63', desc: 'Violent storm', sea: 'Exceptionally high waves' },
  { f: 12, kt: '64+', desc: 'Hurricane', sea: 'Air filled with foam & spray' },
];

function newForecast(label = ''): Forecast {
  return { id: genId(), label, wind: 0, gust: 0, waveHs: 0, swell: 0 };
}

const DEFAULT_DATA: WeatherData = {
  vesselName: '', location: '', opType: 'cargo',
  maxWind: OP_LIMITS.cargo.wind, maxWave: OP_LIMITS.cargo.wave, maxSwell: OP_LIMITS.cargo.swell,
  forecasts: [newForecast('00:00'), newForecast('06:00'), newForecast('12:00'), newForecast('18:00')],
};

// ============================================================
// CALC
// ============================================================
function rowState(f: Forecast, d: WeatherData): 'ok' | 'marginal' | 'nogo' {
  const checks = [
    { v: f.wind, lim: d.maxWind },
    { v: f.waveHs, lim: d.maxWave },
    { v: f.swell, lim: d.maxSwell },
  ];
  let worst: 'ok' | 'marginal' | 'nogo' = 'ok';
  checks.forEach((c) => {
    if (c.lim <= 0) return;
    if (c.v > c.lim) worst = 'nogo';
    else if (c.v > c.lim * 0.85 && worst !== 'nogo') worst = 'marginal';
  });
  return worst;
}

const STATE_META: Record<string, { label: string; color: string; bg: string }> = {
  ok: { label: '✓ GO', color: '#4caf76', bg: 'rgba(76,175,118,.12)' },
  marginal: { label: '⚠ MARGINAL', color: '#e8b85a', bg: 'rgba(232,184,90,.12)' },
  nogo: { label: '✕ NO-GO', color: '#ff6b6b', bg: 'rgba(255,107,107,.14)' },
};

// ============================================================
// STYLES
// ============================================================
const card: React.CSSProperties = { background: '#111c13', border: '1px solid rgba(200,168,75,.18)', padding: '20px 18px', borderRadius: 4, marginBottom: 16 };
const sectionTitle: React.CSSProperties = { fontFamily: rj, fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid rgba(200,168,75,.12)' };
const labelS: React.CSSProperties = { display: 'block', fontFamily: rj, fontSize: 10, letterSpacing: '.5px', textTransform: 'uppercase', color: '#7a8a72', fontWeight: 600, marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', background: '#0c1610', border: '1px solid rgba(200,168,75,.2)', color: '#f5f0e8', padding: '7px 9px', fontFamily: rj, fontSize: 12.5, fontWeight: 500, borderRadius: 3, boxSizing: 'border-box' };
const numCell: React.CSSProperties = { ...inputStyle, padding: '5px 7px', fontSize: 12, textAlign: 'right' };
const ghostBtn: React.CSSProperties = { background: 'transparent', color: '#c8a84b', border: '1px solid rgba(200,168,75,.4)', padding: '8px 14px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };
const goldBtn: React.CSSProperties = { background: '#c8a84b', color: '#08100a', border: 'none', padding: '8px 16px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };

// ============================================================
// COMPONENT
// ============================================================
export default function WeatherPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingId = searchParams.get('id');

  const [data, setData] = useState<WeatherData>(DEFAULT_DATA);
  const [recordId, setRecordId] = useState<string | null>(existingId);
  const [recordName, setRecordName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [showBeaufort, setShowBeaufort] = useState(false);

  useEffect(() => {
    if (existingId) {
      const saved = loadItem<WeatherData>('weather', existingId);
      if (saved) { setData({ ...DEFAULT_DATA, ...saved.data }); setRecordName(saved.name); }
    }
  }, [existingId]);

  function update<K extends keyof WeatherData>(key: K, value: WeatherData[K]) { setData((p) => ({ ...p, [key]: value })); }
  function num(v: string): number { return parseFloat(v) || 0; }
  function setOp(op: OpType) {
    const l = OP_LIMITS[op];
    setData((p) => ({ ...p, opType: op, maxWind: l.wind, maxWave: l.wave, maxSwell: l.swell }));
  }
  function updF(id: string, patch: Partial<Forecast>) { setData((p) => ({ ...p, forecasts: p.forecasts.map((f) => (f.id === id ? { ...f, ...patch } : f)) })); }
  function addF() { setData((p) => ({ ...p, forecasts: [...p.forecasts, newForecast()] })); }
  function delF(id: string) { setData((p) => ({ ...p, forecasts: p.forecasts.filter((f) => f.id !== id) })); }

  const analysed = useMemo(() => data.forecasts.map((f) => ({ f, st: rowState(f, data) })), [data]);
  const summary = useMemo(() => {
    const go = analysed.filter((x) => x.st === 'ok').length;
    const marginal = analysed.filter((x) => x.st === 'marginal').length;
    const nogo = analysed.filter((x) => x.st === 'nogo').length;
    // find first GO window
    const firstGo = analysed.find((x) => x.st === 'ok');
    return { go, marginal, nogo, firstGo: firstGo ? firstGo.f.label : null };
  }, [analysed]);

  function handleSave() {
    const name = recordName.trim() || `${data.vesselName || 'Vessel'} — ${OP_LIMITS[data.opType].label}`;
    const id = recordId || genId();
    saveItem('weather', name, data, id);
    setRecordId(id); setRecordName(name); setSaveMsg('✓ Saved'); setShowSave(false);
    setTimeout(() => setSaveMsg(''), 3000);
  }
  function handleReset() {
    if (!confirm('Reset all fields?')) return;
    setData(DEFAULT_DATA); setRecordId(null); setRecordName(''); router.replace('/voyage/weather');
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>
          ⚓ Voyage Hub · Weather Windows
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Weather <em style={g}>Windows</em>
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          Set the limits for an operation, paste in your forecast, and see which periods are GO, marginal
          or no-go. You enter the forecast — no live data — and the limits are indicative defaults.
        </p>
      </div>

      {/* Disclaimer */}
      <div style={{ ...card, background: 'rgba(232,184,90,.06)', borderColor: 'rgba(232,184,90,.3)', padding: '12px 16px' }}>
        <div style={{ fontFamily: rj, fontSize: 12, color: '#e8c87a', lineHeight: 1.5 }}>
          ⚠ <b>Planning aid only.</b> Use an official forecast (your weather routing provider, national met service)
          and the actual terminal / charter-party limits. The Master&apos;s judgement governs every operation.
        </div>
      </div>

      {/* Action bar */}
      <div className="action-bar" style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => setShowSave(true)} style={goldBtn}>💾 Save</button>
        <button onClick={() => window.print()} style={ghostBtn}>🖨️ Print / PDF</button>
        <button onClick={handleReset} style={{ ...ghostBtn, color: '#ff8a8a', borderColor: 'rgba(255,138,138,.3)' }}>🗑️ Reset</button>
        {saveMsg && <span style={{ color: '#4caf76', fontFamily: rj, fontSize: 12, fontWeight: 600 }}>{saveMsg}</span>}
        {recordName && <span style={{ color: '#7a8a72', fontFamily: rj, fontSize: 11, marginLeft: 'auto' }}>📂 {recordName}</span>}
      </div>

      {showSave && (
        <div style={{ ...card, background: 'rgba(200,168,75,.05)', borderColor: 'rgba(200,168,75,.4)' }}>
          <label style={labelS}>Name</label>
          <input type="text" value={recordName} onChange={(e) => setRecordName(e.target.value)} placeholder="e.g. STS window — 14 Jul" style={{ ...inputStyle, marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{ ...goldBtn, padding: '8px 14px', letterSpacing: '1px' }}>Save</button>
            <button onClick={() => setShowSave(false)} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* Operation + limits */}
      <div style={card}>
        <div style={sectionTitle}>1. Operation &amp; Limits</div>
        <div className="we-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 12 }}>
          <div><label style={labelS}>Vessel</label><input style={inputStyle} value={data.vesselName} onChange={(e) => update('vesselName', e.target.value)} placeholder="MV NEURONAI" /></div>
          <div><label style={labelS}>Location</label><input style={inputStyle} value={data.location} onChange={(e) => update('location', e.target.value)} placeholder="Singapore OPL / berth 5" /></div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelS}>Operation Type (sets indicative limits)</label>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {(Object.keys(OP_LIMITS) as OpType[]).map((k) => (
              <button key={k} onClick={() => setOp(k)} style={chip(data.opType === k)}>{OP_LIMITS[k].label}</button>
            ))}
          </div>
        </div>
        <div className="we-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          <div><label style={labelS}>Max Wind (kt)</label><input style={inputStyle} type="number" value={data.maxWind || ''} onChange={(e) => update('maxWind', num(e.target.value))} placeholder="25" /></div>
          <div><label style={labelS}>Max Wave Hs (m)</label><input style={inputStyle} type="number" step="0.1" value={data.maxWave || ''} onChange={(e) => update('maxWave', num(e.target.value))} placeholder="1.5" /></div>
          <div><label style={labelS}>Max Swell (m)</label><input style={inputStyle} type="number" step="0.1" value={data.maxSwell || ''} onChange={(e) => update('maxSwell', num(e.target.value))} placeholder="1.0" /></div>
        </div>
      </div>

      {/* Summary */}
      <div style={{ ...card, background: 'linear-gradient(135deg,rgba(200,168,75,.08),transparent)', borderColor: 'rgba(200,168,75,.4)' }}>
        <div className="we-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          <KPI label="GO periods" value={String(summary.go)} color="#4caf76" />
          <KPI label="Marginal" value={String(summary.marginal)} color="#e8b85a" />
          <KPI label="No-Go" value={String(summary.nogo)} color={summary.nogo > 0 ? '#ff6b6b' : '#4caf76'} />
          <KPI label="First GO" value={summary.firstGo || '—'} color="#c8a84b" />
        </div>
      </div>

      {/* Forecast table */}
      <div style={card}>
        <div style={sectionTitle}>2. Forecast (you enter)</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
            <thead>
              <tr style={{ color: '#7a8a72', fontFamily: rj, fontSize: 9.5, letterSpacing: '.5px', textTransform: 'uppercase' }}>
                <th style={{ ...thd, textAlign: 'left' }}>Time / Day</th>
                <th style={thd}>Wind kt</th>
                <th style={thd}>Gust kt</th>
                <th style={thd}>Wave Hs m</th>
                <th style={thd}>Swell m</th>
                <th style={{ ...thd, textAlign: 'center' }}>Window</th>
                <th style={{ ...thd, width: 28 }}></th>
              </tr>
            </thead>
            <tbody>
              {analysed.map(({ f, st }) => {
                const sm = STATE_META[st];
                return (
                  <tr key={f.id} style={{ borderTop: '1px solid rgba(200,168,75,.08)', background: sm.bg }}>
                    <td style={{ padding: '4px 6px' }}><input style={{ ...inputStyle, padding: '5px 7px', fontSize: 12 }} value={f.label} onChange={(e) => updF(f.id, { label: e.target.value })} placeholder="00:00" /></td>
                    <td style={{ padding: '4px 4px' }}><input style={numCell} type="number" value={f.wind || ''} onChange={(e) => updF(f.id, { wind: num(e.target.value) })} placeholder="0" /></td>
                    <td style={{ padding: '4px 4px' }}><input style={numCell} type="number" value={f.gust || ''} onChange={(e) => updF(f.id, { gust: num(e.target.value) })} placeholder="0" /></td>
                    <td style={{ padding: '4px 4px' }}><input style={numCell} type="number" step="0.1" value={f.waveHs || ''} onChange={(e) => updF(f.id, { waveHs: num(e.target.value) })} placeholder="0" /></td>
                    <td style={{ padding: '4px 4px' }}><input style={numCell} type="number" step="0.1" value={f.swell || ''} onChange={(e) => updF(f.id, { swell: num(e.target.value) })} placeholder="0" /></td>
                    <td style={{ padding: '4px 6px', textAlign: 'center' }}><span style={{ fontFamily: rj, fontSize: 10.5, fontWeight: 700, color: sm.color, whiteSpace: 'nowrap' }}>{sm.label}</span></td>
                    <td style={{ padding: '4px 4px', textAlign: 'center' }}><button onClick={() => delF(f.id)} style={{ background: 'transparent', border: 'none', color: '#ff8a8a', cursor: 'pointer', fontSize: 12 }}>✕</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <button onClick={addF} style={{ ...ghostBtn, marginTop: 12, fontSize: 10 }}>+ Add Period</button>
        <p style={{ fontSize: 10, color: '#7a8a72', fontFamily: rj, marginTop: 8 }}>Marginal = within 15% of a limit. No-Go = any of wind / wave / swell exceeds its limit.</p>
      </div>

      {/* Beaufort reference */}
      <div style={card}>
        <div style={{ ...sectionTitle, cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }} onClick={() => setShowBeaufort(!showBeaufort)}>
          <span>🌬️ Beaufort &amp; Sea State Reference</span>
          <span style={{ color: '#c8a84b' }}>{showBeaufort ? '▲' : '▼'}</span>
        </div>
        {showBeaufort && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480, fontFamily: rj }}>
              <thead>
                <tr style={{ color: '#7a8a72', fontSize: 9.5, letterSpacing: '.5px', textTransform: 'uppercase' }}>
                  <th style={{ ...thd, textAlign: 'left' }}>Force</th>
                  <th style={{ ...thd, textAlign: 'left' }}>Wind kt</th>
                  <th style={{ ...thd, textAlign: 'left' }}>Description</th>
                  <th style={{ ...thd, textAlign: 'left' }}>Sea</th>
                </tr>
              </thead>
              <tbody>
                {BEAUFORT.map((b) => (
                  <tr key={b.f} style={{ borderTop: '1px solid rgba(200,168,75,.08)' }}>
                    <td style={{ padding: '6px', color: '#c8a84b', fontWeight: 700 }}>{b.f}</td>
                    <td style={{ padding: '6px', color: '#f5f0e8' }}>{b.kt}</td>
                    <td style={{ padding: '6px', color: '#b0c0a4' }}>{b.desc}</td>
                    <td style={{ padding: '6px', color: '#7a8a72', fontSize: 11.5 }}>{b.sea}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 720px) {
          .we-g3 { grid-template-columns: 1fr !important; }
          .we-kpis { grid-template-columns: 1fr 1fr !important; }
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

function chip(active: boolean): React.CSSProperties {
  return { padding: '5px 12px', background: active ? '#c8a84b' : 'transparent', color: active ? '#08100a' : '#7a8a72', border: `1px solid ${active ? '#c8a84b' : 'rgba(200,168,75,.25)'}`, fontFamily: rj, fontSize: 10, letterSpacing: '.5px', fontWeight: 700, cursor: 'pointer', borderRadius: 4, whiteSpace: 'nowrap' };
}
function KPI({ label: l, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: '#0c1610', border: '1px solid rgba(200,168,75,.2)', borderRadius: 4, padding: '12px 10px', textAlign: 'center' }}>
      <div style={{ fontFamily: rj, fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: '#7a8a72', fontWeight: 700 }}>{l}</div>
      <div style={{ fontFamily: lb, fontSize: 22, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
    </div>
  );
}
