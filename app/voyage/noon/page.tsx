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
interface NoonReport {
  id: string;
  date: string;          // date
  timeUtc: string;       // HH:MM
  status: 'sea' | 'port' | 'anchor' | 'canal' | 'drifting';
  // position
  lat: number;
  latDir: 'N' | 'S';
  lon: number;
  lonDir: 'E' | 'W';
  // run
  distance: number;      // nm last 24h (steaming)
  steamHours: number;    // hours steamed (default 24)
  avgSpeed: number;      // kts (auto if 0)
  slip: number;          // %
  rpm: number;
  // consumption
  meCons: number;        // MT VLSFO/24h
  aeCons: number;        // MT MGO/24h
  // ROB
  robVlsfo: number;
  robMgo: number;
  // weather
  bf: number;            // Beaufort
  seaState: number;
  swell: number;         // m
  windDir: string;
  current: number;       // kts (+ favourable / - adverse)
  notes: string;
}

interface NoonData {
  vesselName: string;
  imo: string;
  from: string;
  to: string;
  totalDistance: number;   // voyage total nm (for ETA/progress)
  cpSpeed: number;         // warranted kts
  cpMeCons: number;        // warranted MT/day VLSFO
  cpAeCons: number;        // warranted MT/day MGO
  reports: NoonReport[];
}

const DEFAULT_DATA: NoonData = {
  vesselName: '', imo: '', from: '', to: '', totalDistance: 0,
  cpSpeed: 0, cpMeCons: 0, cpAeCons: 0, reports: [],
};

function newReport(prev?: NoonReport): NoonReport {
  return {
    id: genId(),
    date: '', timeUtc: '12:00', status: 'sea',
    lat: 0, latDir: 'N', lon: 0, lonDir: 'E',
    distance: 0, steamHours: 24, avgSpeed: 0, slip: 0, rpm: 0,
    meCons: 0, aeCons: 0,
    robVlsfo: prev ? prev.robVlsfo : 0,
    robMgo: prev ? prev.robMgo : 0,
    bf: 0, seaState: 0, swell: 0, windDir: '', current: 0, notes: '',
  };
}

// ============================================================
// CALC
// ============================================================
function reportSpeed(r: NoonReport): number {
  if (r.avgSpeed > 0) return r.avgSpeed;
  const h = r.steamHours > 0 ? r.steamHours : 24;
  return r.distance > 0 ? r.distance / h : 0;
}

function isGoodWeather(r: NoonReport): boolean {
  // common good-weather definition: BF <= 4, sea state <= 3, swell <= 2m
  return r.bf <= 4 && r.seaState <= 3 && r.swell <= 2;
}

function calc(d: NoonData) {
  const seaReports = d.reports.filter((r) => r.status === 'sea' || r.status === 'canal' || r.status === 'drifting');
  const totalDist = d.reports.reduce((s, r) => s + (r.distance || 0), 0);
  const totalSteamH = d.reports.reduce((s, r) => s + (r.steamHours > 0 ? r.steamHours : (r.status === 'sea' ? 24 : 0)), 0);
  const totalMe = d.reports.reduce((s, r) => s + (r.meCons || 0), 0);
  const totalAe = d.reports.reduce((s, r) => s + (r.aeCons || 0), 0);
  const days = d.reports.length;

  const avgSpeed = totalSteamH > 0 ? totalDist / totalSteamH : 0;
  const avgMe = seaReports.length > 0 ? seaReports.reduce((s, r) => s + r.meCons, 0) / seaReports.length : 0;
  const avgAe = days > 0 ? totalAe / days : 0;

  const gwCount = d.reports.filter(isGoodWeather).length;
  const badCount = days - gwCount;

  const latestRob = d.reports.length > 0 ? d.reports[d.reports.length - 1] : null;

  // progress + ETA
  const progressPct = d.totalDistance > 0 ? Math.min(100, (totalDist / d.totalDistance) * 100) : 0;
  const remainingDist = Math.max(0, d.totalDistance - totalDist);
  const speedForEta = avgSpeed > 0 ? avgSpeed : d.cpSpeed;
  const remainingDays = speedForEta > 0 ? remainingDist / (speedForEta * 24) : 0;

  let predictedEta: string | null = null;
  if (d.reports.length > 0 && remainingDays > 0 && speedForEta > 0) {
    const last = d.reports[d.reports.length - 1];
    if (last.date) {
      const base = new Date(last.date + 'T' + (last.timeUtc || '12:00') + ':00Z');
      if (!isNaN(base.getTime())) {
        const eta = new Date(base.getTime() + remainingDays * 86400000);
        predictedEta = eta.toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
      }
    }
  }

  // vs CP
  const speedVsCp = d.cpSpeed > 0 ? ((avgSpeed - d.cpSpeed) / d.cpSpeed) * 100 : 0;
  const meVsCp = d.cpMeCons > 0 ? ((avgMe - d.cpMeCons) / d.cpMeCons) * 100 : 0;

  return { totalDist, totalSteamH, totalMe, totalAe, days, avgSpeed, avgMe, avgAe, gwCount, badCount, latestRob, progressPct, remainingDist, remainingDays, predictedEta, speedVsCp, meVsCp };
}

function fmt(n: number, dec = 1): string {
  if (!isFinite(n)) return '–';
  return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

// ============================================================
// STYLES
// ============================================================
const card: React.CSSProperties = { background: '#111c13', border: '1px solid rgba(200,168,75,.18)', padding: '20px 18px', borderRadius: 4, marginBottom: 16 };
const sectionTitle: React.CSSProperties = { fontFamily: rj, fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid rgba(200,168,75,.12)' };
const label: React.CSSProperties = { display: 'block', fontFamily: rj, fontSize: 10, letterSpacing: '.5px', textTransform: 'uppercase', color: '#7a8a72', fontWeight: 600, marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', background: '#0c1610', border: '1px solid rgba(200,168,75,.2)', color: '#f5f0e8', padding: '7px 9px', fontFamily: rj, fontSize: 12.5, fontWeight: 500, borderRadius: 3, boxSizing: 'border-box' };
const ghostBtn: React.CSSProperties = { background: 'transparent', color: '#c8a84b', border: '1px solid rgba(200,168,75,.4)', padding: '8px 14px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };
const goldBtn: React.CSSProperties = { background: '#c8a84b', color: '#08100a', border: 'none', padding: '8px 16px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };

const STATUS_LABEL: Record<NoonReport['status'], string> = { sea: 'At Sea', port: 'In Port', anchor: 'At Anchor', canal: 'Canal Transit', drifting: 'Drifting' };

// ============================================================
// COMPONENT
// ============================================================
export default function NoonReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingId = searchParams.get('id');

  const [data, setData] = useState<NoonData>(DEFAULT_DATA);
  const [recordId, setRecordId] = useState<string | null>(existingId);
  const [recordName, setRecordName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [tab, setTab] = useState<'reports' | 'analysis'>('reports');

  useEffect(() => {
    if (existingId) {
      const saved = loadItem<NoonData>('noon', existingId);
      if (saved) { setData(saved.data); setRecordName(saved.name); }
    }
  }, [existingId]);

  function update<K extends keyof NoonData>(key: K, value: NoonData[K]) { setData((p) => ({ ...p, [key]: value })); }
  function num(v: string): number { return parseFloat(v) || 0; }

  function addReport() {
    setData((p) => {
      const prev = p.reports[p.reports.length - 1];
      const r = newReport(prev);
      setOpenId(r.id);
      return { ...p, reports: [...p.reports, r] };
    });
  }
  function updReport(id: string, patch: Partial<NoonReport>) {
    setData((p) => ({ ...p, reports: p.reports.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
  }
  function delReport(id: string) {
    setData((p) => ({ ...p, reports: p.reports.filter((r) => r.id !== id) }));
  }

  const c = useMemo(() => calc(data), [data]);

  function handleSave() {
    const name = recordName.trim() || `${data.vesselName || 'Vessel'} — ${data.from || ''}→${data.to || ''}`;
    const id = recordId || genId();
    saveItem('noon', name, data, id);
    setRecordId(id); setRecordName(name); setSaveMsg('✓ Saved'); setShowSave(false);
    setTimeout(() => setSaveMsg(''), 3000);
  }
  function handleReset() {
    if (!confirm('Reset all fields?')) return;
    setData(DEFAULT_DATA); setRecordId(null); setRecordName(''); router.replace('/voyage/noon');
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>
          ⚓ Voyage Hub · Noon Report Manager
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Noon Report <em style={g}>Manager</em>
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          Log daily noon reports and see speed, consumption and ROB against charter-party warranties,
          with an updating ETA. For full performance/claim reports, use CP Performance.
        </p>
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
          <label style={label}>Name</label>
          <input type="text" value={recordName} onChange={(e) => setRecordName(e.target.value)} placeholder="e.g. MV NEURONAI — Tubarão→Qingdao" style={{ ...inputStyle, marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{ ...goldBtn, padding: '8px 14px', letterSpacing: '1px' }}>Save</button>
            <button onClick={() => setShowSave(false)} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* Voyage setup */}
      <div style={card}>
        <div style={sectionTitle}>Voyage Setup &amp; CP Warranties</div>
        <div className="noon-g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          <div><label style={label}>Vessel</label><input style={inputStyle} value={data.vesselName} onChange={(e) => update('vesselName', e.target.value)} placeholder="MV NEURONAI" /></div>
          <div><label style={label}>IMO</label><input style={inputStyle} value={data.imo} onChange={(e) => update('imo', e.target.value)} placeholder="9876543" /></div>
          <div><label style={label}>From</label><input style={inputStyle} value={data.from} onChange={(e) => update('from', e.target.value)} placeholder="Tubarão" /></div>
          <div><label style={label}>To</label><input style={inputStyle} value={data.to} onChange={(e) => update('to', e.target.value)} placeholder="Qingdao" /></div>
        </div>
        <div className="noon-g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: 12 }}>
          <div><label style={label}>Total Distance (nm)</label><input style={inputStyle} type="number" value={data.totalDistance || ''} onChange={(e) => update('totalDistance', num(e.target.value))} placeholder="11500" /></div>
          <div><label style={label}>CP Speed (kts)</label><input style={inputStyle} type="number" value={data.cpSpeed || ''} onChange={(e) => update('cpSpeed', num(e.target.value))} placeholder="12.5" /></div>
          <div><label style={label}>CP ME Cons (MT/d)</label><input style={inputStyle} type="number" value={data.cpMeCons || ''} onChange={(e) => update('cpMeCons', num(e.target.value))} placeholder="28" /></div>
          <div><label style={label}>CP AE Cons (MT/d)</label><input style={inputStyle} type="number" value={data.cpAeCons || ''} onChange={(e) => update('cpAeCons', num(e.target.value))} placeholder="2.5" /></div>
        </div>
      </div>

      {/* Progress strip */}
      {data.totalDistance > 0 && (
        <div style={{ ...card }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontFamily: rj, fontSize: 11, color: '#7a8a72' }}>
            <span>Progress: <b style={{ color: '#c8a84b' }}>{fmt(c.progressPct, 1)}%</b></span>
            <span>{fmt(c.totalDist, 0)} / {fmt(data.totalDistance, 0)} nm · {fmt(c.remainingDist, 0)} nm to go</span>
          </div>
          <div style={{ height: 10, background: '#0c1610', borderRadius: 5, overflow: 'hidden', border: '1px solid rgba(200,168,75,.2)' }}>
            <div style={{ width: `${c.progressPct}%`, height: '100%', background: 'linear-gradient(90deg,#c8a84b,#4caf76)', transition: 'width .3s ease' }} />
          </div>
          {c.predictedEta && <div style={{ marginTop: 8, fontFamily: rj, fontSize: 12, color: '#b0c0a4' }}>📅 Predicted ETA: <b style={{ color: '#c8a84b' }}>{c.predictedEta}</b> <span style={{ color: '#7a8a72' }}>(~{fmt(c.remainingDays, 1)} days at {fmt(c.avgSpeed > 0 ? c.avgSpeed : data.cpSpeed, 1)} kts)</span></div>}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setTab('reports')} style={{ flex: 1, padding: '10px', background: tab === 'reports' ? '#c8a84b' : 'transparent', color: tab === 'reports' ? '#08100a' : '#7a8a72', border: `1px solid ${tab === 'reports' ? '#c8a84b' : 'rgba(200,168,75,.25)'}`, fontFamily: rj, fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 }}>📝 Reports ({data.reports.length})</button>
        <button onClick={() => setTab('analysis')} style={{ flex: 1, padding: '10px', background: tab === 'analysis' ? '#c8a84b' : 'transparent', color: tab === 'analysis' ? '#08100a' : '#7a8a72', border: `1px solid ${tab === 'analysis' ? '#c8a84b' : 'rgba(200,168,75,.25)'}`, fontFamily: rj, fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 }}>📊 Analysis</button>
      </div>

      {/* REPORTS TAB */}
      {tab === 'reports' && (
        <>
          {data.reports.map((r, i) => {
            const sp = reportSpeed(r);
            const gw = isGoodWeather(r);
            const open = openId === r.id;
            const speedOk = data.cpSpeed > 0 ? sp >= data.cpSpeed - 0.1 : true;
            const consOk = data.cpMeCons > 0 ? r.meCons <= data.cpMeCons + 0.5 : true;
            return (
              <div key={r.id} style={{ ...card, padding: open ? '18px' : '12px 16px', marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setOpenId(open ? null : r.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: lb, fontSize: 14, fontWeight: 700, color: '#c8a84b' }}>Day {i + 1}</span>
                    <span style={{ fontFamily: rj, fontSize: 12, color: '#f5f0e8' }}>{r.date || 'no date'} {r.timeUtc} UTC</span>
                    <span style={{ fontSize: 9.5, background: 'rgba(122,138,114,.14)', color: '#b0c0a4', padding: '2px 7px', borderRadius: 3, fontFamily: rj, fontWeight: 700 }}>{STATUS_LABEL[r.status]}</span>
                    <span style={{ fontFamily: rj, fontSize: 12, color: speedOk ? '#4caf76' : '#ff8a8a' }}>{fmt(sp, 1)} kts</span>
                    <span style={{ fontFamily: rj, fontSize: 12, color: consOk ? '#4caf76' : '#ff8a8a' }}>ME {fmt(r.meCons, 1)}</span>
                    <span title={gw ? 'Good weather' : 'Adverse weather'} style={{ fontSize: 11 }}>{gw ? '🟢' : '🔴'} BF{r.bf}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); delReport(r.id); }} style={{ background: 'transparent', border: 'none', color: '#ff8a8a', fontFamily: rj, fontSize: 11, cursor: 'pointer' }}>✕</button>
                </div>

                {open && (
                  <div style={{ marginTop: 14 }}>
                    <div className="noon-g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 10 }}>
                      <div><label style={label}>Date</label><input style={inputStyle} type="date" value={r.date} onChange={(e) => updReport(r.id, { date: e.target.value })} /></div>
                      <div><label style={label}>Time UTC</label><input style={inputStyle} type="time" value={r.timeUtc} onChange={(e) => updReport(r.id, { timeUtc: e.target.value })} /></div>
                      <div>
                        <label style={label}>Status</label>
                        <select style={inputStyle} value={r.status} onChange={(e) => updReport(r.id, { status: e.target.value as NoonReport['status'] })}>
                          {(Object.keys(STATUS_LABEL) as NoonReport['status'][]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                        </select>
                      </div>
                      <div><label style={label}>Steam Hours</label><input style={inputStyle} type="number" value={r.steamHours || ''} onChange={(e) => updReport(r.id, { steamHours: num(e.target.value) })} placeholder="24" /></div>
                    </div>

                    {/* Position */}
                    <label style={label}>Position</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto', gap: 8, marginBottom: 10 }}>
                      <input style={inputStyle} type="number" step="0.001" value={r.lat || ''} onChange={(e) => updReport(r.id, { lat: num(e.target.value) })} placeholder="Lat 22.350" />
                      <select style={{ ...inputStyle, width: 60 }} value={r.latDir} onChange={(e) => updReport(r.id, { latDir: e.target.value as 'N' | 'S' })}><option>N</option><option>S</option></select>
                      <input style={inputStyle} type="number" step="0.001" value={r.lon || ''} onChange={(e) => updReport(r.id, { lon: num(e.target.value) })} placeholder="Lon 35.500" />
                      <select style={{ ...inputStyle, width: 60 }} value={r.lonDir} onChange={(e) => updReport(r.id, { lonDir: e.target.value as 'E' | 'W' })}><option>E</option><option>W</option></select>
                    </div>

                    {/* Run */}
                    <div className="noon-g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 10 }}>
                      <div><label style={label}>Distance 24h (nm)</label><input style={inputStyle} type="number" value={r.distance || ''} onChange={(e) => updReport(r.id, { distance: num(e.target.value) })} placeholder="288" /></div>
                      <div><label style={label}>Avg Speed (kts)</label><input style={inputStyle} type="number" step="0.1" value={r.avgSpeed || ''} onChange={(e) => updReport(r.id, { avgSpeed: num(e.target.value) })} placeholder="auto" /></div>
                      <div><label style={label}>Slip (%)</label><input style={inputStyle} type="number" value={r.slip || ''} onChange={(e) => updReport(r.id, { slip: num(e.target.value) })} placeholder="0" /></div>
                      <div><label style={label}>RPM</label><input style={inputStyle} type="number" value={r.rpm || ''} onChange={(e) => updReport(r.id, { rpm: num(e.target.value) })} placeholder="0" /></div>
                    </div>

                    {/* Consumption + ROB */}
                    <div className="noon-g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 10 }}>
                      <div><label style={label}>ME Cons (MT)</label><input style={inputStyle} type="number" step="0.1" value={r.meCons || ''} onChange={(e) => updReport(r.id, { meCons: num(e.target.value) })} placeholder="29.5" /></div>
                      <div><label style={label}>AE Cons (MT)</label><input style={inputStyle} type="number" step="0.1" value={r.aeCons || ''} onChange={(e) => updReport(r.id, { aeCons: num(e.target.value) })} placeholder="2.6" /></div>
                      <div><label style={label}>ROB VLSFO (MT)</label><input style={inputStyle} type="number" step="0.1" value={r.robVlsfo || ''} onChange={(e) => updReport(r.id, { robVlsfo: num(e.target.value) })} placeholder="921" /></div>
                      <div><label style={label}>ROB MGO (MT)</label><input style={inputStyle} type="number" step="0.1" value={r.robMgo || ''} onChange={(e) => updReport(r.id, { robMgo: num(e.target.value) })} placeholder="78" /></div>
                    </div>

                    {/* Weather */}
                    <div className="noon-g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 10 }}>
                      <div><label style={label}>Beaufort</label><input style={inputStyle} type="number" value={r.bf || ''} onChange={(e) => updReport(r.id, { bf: num(e.target.value) })} placeholder="4" /></div>
                      <div><label style={label}>Sea State</label><input style={inputStyle} type="number" value={r.seaState || ''} onChange={(e) => updReport(r.id, { seaState: num(e.target.value) })} placeholder="3" /></div>
                      <div><label style={label}>Swell (m)</label><input style={inputStyle} type="number" step="0.1" value={r.swell || ''} onChange={(e) => updReport(r.id, { swell: num(e.target.value) })} placeholder="1.5" /></div>
                      <div><label style={label}>Wind Dir</label><input style={inputStyle} value={r.windDir} onChange={(e) => updReport(r.id, { windDir: e.target.value })} placeholder="NE" /></div>
                      <div><label style={label}>Current (kts)</label><input style={inputStyle} type="number" step="0.1" value={r.current || ''} onChange={(e) => updReport(r.id, { current: num(e.target.value) })} placeholder="0.4" /></div>
                    </div>

                    <div><label style={label}>Notes</label><input style={inputStyle} value={r.notes} onChange={(e) => updReport(r.id, { notes: e.target.value })} placeholder="Master remarks, slow steaming, ME issues..." /></div>
                  </div>
                )}
              </div>
            );
          })}
          <button onClick={addReport} style={{ ...goldBtn, width: '100%', padding: '12px' }}>+ Add Noon Report</button>
        </>
      )}

      {/* ANALYSIS TAB */}
      {tab === 'analysis' && (
        <>
          {data.reports.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', color: '#7a8a72', fontFamily: rj }}>Add noon reports to see the analysis.</div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }} className="noon-kpis">
                <KPI label="Reports" value={String(c.days)} color="#f5f0e8" />
                <KPI label="Total Distance" value={fmt(c.totalDist, 0)} sub="nm" color="#c8a84b" />
                <KPI label="Avg Speed" value={fmt(c.avgSpeed, 2)} sub="kts" color={data.cpSpeed > 0 && c.avgSpeed < data.cpSpeed ? '#ff8a8a' : '#4caf76'} />
                <KPI label="Good Wx Days" value={`${c.gwCount}/${c.days}`} color="#4caf76" />
              </div>

              <div style={{ ...card, background: 'linear-gradient(135deg,rgba(200,168,75,.08),transparent)', borderColor: 'rgba(200,168,75,.4)' }}>
                <div style={sectionTitle}>⚡ Performance vs Charter Party</div>
                <Row label="Avg Speed" actual={`${fmt(c.avgSpeed, 2)} kts`} cp={data.cpSpeed > 0 ? `${fmt(data.cpSpeed, 1)} kts` : '—'} delta={data.cpSpeed > 0 ? c.speedVsCp : null} goodIfPositive />
                <Row label="Avg ME Cons (sea)" actual={`${fmt(c.avgMe, 1)} MT/d`} cp={data.cpMeCons > 0 ? `${fmt(data.cpMeCons, 1)} MT/d` : '—'} delta={data.cpMeCons > 0 ? c.meVsCp : null} goodIfPositive={false} />
                <Row label="Avg AE Cons" actual={`${fmt(c.avgAe, 1)} MT/d`} cp={data.cpAeCons > 0 ? `${fmt(data.cpAeCons, 1)} MT/d` : '—'} delta={null} />
                <Row label="Total ME Burned" actual={`${fmt(c.totalMe, 1)} MT`} cp="—" delta={null} />
                <Row label="Total AE Burned" actual={`${fmt(c.totalAe, 1)} MT`} cp="—" delta={null} />
                {c.latestRob && <Row label="Current ROB" actual={`VLSFO ${fmt(c.latestRob.robVlsfo, 1)} · MGO ${fmt(c.latestRob.robMgo, 1)} MT`} cp="—" delta={null} />}
              </div>

              {/* daily table */}
              <div style={card}>
                <div style={sectionTitle}>📋 Daily Log</div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: rj, fontSize: 11.5 }}>
                    <thead>
                      <tr style={{ color: '#7a8a72', textAlign: 'left' }}>
                        <th style={th}>Day</th><th style={th}>Date</th><th style={th}>Status</th><th style={th}>Dist</th><th style={th}>Speed</th><th style={th}>ME</th><th style={th}>AE</th><th style={th}>ROB VLSFO</th><th style={th}>Wx</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.reports.map((r, i) => {
                        const sp = reportSpeed(r);
                        const gw = isGoodWeather(r);
                        return (
                          <tr key={r.id} style={{ borderTop: '1px solid rgba(200,168,75,.1)', color: '#f5f0e8' }}>
                            <td style={td}>{i + 1}</td>
                            <td style={td}>{r.date || '—'}</td>
                            <td style={td}>{STATUS_LABEL[r.status]}</td>
                            <td style={td}>{fmt(r.distance, 0)}</td>
                            <td style={{ ...td, color: data.cpSpeed > 0 && sp < data.cpSpeed - 0.1 ? '#ff8a8a' : '#4caf76' }}>{fmt(sp, 1)}</td>
                            <td style={{ ...td, color: data.cpMeCons > 0 && r.meCons > data.cpMeCons + 0.5 ? '#ff8a8a' : '#f5f0e8' }}>{fmt(r.meCons, 1)}</td>
                            <td style={td}>{fmt(r.aeCons, 1)}</td>
                            <td style={td}>{fmt(r.robVlsfo, 1)}</td>
                            <td style={td}>{gw ? '🟢' : '🔴'} {r.bf}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}

      <style>{`
        @media (max-width: 720px) {
          .noon-g4 { grid-template-columns: 1fr 1fr !important; }
          .noon-kpis { grid-template-columns: 1fr 1fr !important; }
          .action-bar button { font-size: 10px !important; padding: 7px 10px !important; }
        }
        @media print {
          @page { size: A4 landscape; margin: 12mm; }
          body { background: white !important; color: black !important; }
          nav, footer, .action-bar { display: none !important; }
        }
      `}</style>
    </div>
  );
}

const th: React.CSSProperties = { padding: '6px 8px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', fontSize: 9.5, whiteSpace: 'nowrap' };
const td: React.CSSProperties = { padding: '6px 8px', whiteSpace: 'nowrap' };

function KPI({ label: l, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div style={{ background: '#0c1610', border: '1px solid rgba(200,168,75,.2)', borderRadius: 4, padding: '12px 10px', textAlign: 'center' }}>
      <div style={{ fontFamily: rj, fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: '#7a8a72', fontWeight: 700 }}>{l}</div>
      <div style={{ fontFamily: lb, fontSize: 22, fontWeight: 700, color, marginTop: 4 }}>{value} {sub && <span style={{ fontSize: 11, color: '#7a8a72' }}>{sub}</span>}</div>
    </div>
  );
}

function Row({ label: l, actual, cp, delta, goodIfPositive }: { label: string; actual: string; cp: string; delta: number | null; goodIfPositive?: boolean }) {
  let color = '#f5f0e8';
  if (delta != null && goodIfPositive != null) {
    const good = goodIfPositive ? delta >= 0 : delta <= 0;
    color = good ? '#4caf76' : '#ff8a8a';
  }
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px dashed rgba(200,168,75,.1)', fontFamily: rj, fontSize: 13 }}>
      <span style={{ color: '#7a8a72' }}>{l}</span>
      <span style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
        <span style={{ color: '#f5f0e8', fontWeight: 600 }}>{actual}</span>
        <span style={{ color: '#7a8a72', fontSize: 11 }}>CP {cp}</span>
        {delta != null && <span style={{ color, fontWeight: 700, minWidth: 56, textAlign: 'right' }}>{delta > 0 ? '+' : ''}{fmt(delta, 1)}%</span>}
      </span>
    </div>
  );
}
