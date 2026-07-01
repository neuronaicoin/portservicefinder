'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { saveItem, loadItem, genId } from '@/lib/voyage-storage';
import { PORTS_SORTED, searchPorts, haversineDistance, initialBearing, bearingToCompass, type PortCoord } from '@/lib/ports-data';

const lb = "'Libre Bodoni', serif";
const rj = "'Rajdhani', sans-serif";
const g = { color: '#c8a84b', fontStyle: 'italic' } as React.CSSProperties;

// ============================================================
// TYPES
// ============================================================
interface Waypoint {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

interface Vessel {
  name: string;
  loa: number;
  beam: number;
  draft: number;
  serviceSpeed: number;   // kts
  ladenCons: number;      // MT/day at sea (main fuel)
  portCons: number;       // MT/day in port / idle
  robVlsfo: number;       // MT on departure
  robMgo: number;         // MT on departure
  fuelType: 'VLSFO' | 'HSFO' | 'LSMGO';
}

interface PlannerData {
  departure: PortCoord | null;
  arrival: PortCoord | null;
  waypoints: Waypoint[];
  vessel: Vessel;
  departureDate: string;   // ISO date
  departureTime: string;   // HH:MM
  seaMargin: number;       // % added to distance for weather/routing
}

const DEFAULT_VESSEL: Vessel = {
  name: '', loa: 0, beam: 0, draft: 0, serviceSpeed: 12,
  ladenCons: 0, portCons: 0, robVlsfo: 0, robMgo: 0, fuelType: 'VLSFO',
};

const DEFAULT_DATA: PlannerData = {
  departure: null, arrival: null, waypoints: [], vessel: DEFAULT_VESSEL,
  departureDate: new Date().toISOString().slice(0, 10), departureTime: '12:00', seaMargin: 5,
};

// Common routing waypoints operators add manually (canals, capes, straits)
const COMMON_WAYPOINTS: { name: string; lat: number; lon: number }[] = [
  { name: 'Panama Canal', lat: 9.08, lon: -79.68 },
  { name: 'Suez Canal', lat: 30.0, lon: 32.55 },
  { name: 'Cape of Good Hope', lat: -34.35, lon: 18.47 },
  { name: 'Cape Horn', lat: -55.98, lon: -67.27 },
  { name: 'Strait of Gibraltar', lat: 35.95, lon: -5.6 },
  { name: 'Strait of Malacca', lat: 2.5, lon: 101.3 },
  { name: 'Dover Strait', lat: 51.0, lon: 1.5 },
  { name: 'Bosphorus', lat: 41.1, lon: 29.06 },
  { name: 'Cape Verde', lat: 16.0, lon: -24.0 },
  { name: 'Canary Islands', lat: 28.1, lon: -15.4 },
  { name: 'Bab-el-Mandeb', lat: 12.58, lon: 43.33 },
  { name: 'Strait of Hormuz', lat: 26.57, lon: 56.25 },
];

// ============================================================
// CALC — legs, distance, days, ETA
// ============================================================
interface Leg {
  from: { name: string; lat: number; lon: number };
  to: { name: string; lat: number; lon: number };
  distance: number;   // nm (great circle)
  bearing: number;    // initial bearing
}

function buildLegs(d: PlannerData): Leg[] {
  const pts: { name: string; lat: number; lon: number }[] = [];
  if (d.departure) pts.push({ name: d.departure.name, lat: d.departure.lat, lon: d.departure.lon });
  d.waypoints.forEach((w) => pts.push({ name: w.name, lat: w.lat, lon: w.lon }));
  if (d.arrival) pts.push({ name: d.arrival.name, lat: d.arrival.lat, lon: d.arrival.lon });

  const legs: Leg[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    legs.push({
      from: a, to: b,
      distance: haversineDistance(a.lat, a.lon, b.lat, b.lon),
      bearing: initialBearing(a.lat, a.lon, b.lat, b.lon),
    });
  }
  return legs;
}

function fmt(n: number, dec = 0): string {
  if (!isFinite(n)) return '–';
  return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

function addHours(dateStr: string, timeStr: string, hours: number): Date | null {
  if (!dateStr) return null;
  const base = new Date(`${dateStr}T${timeStr || '00:00'}:00`);
  if (isNaN(base.getTime())) return null;
  return new Date(base.getTime() + hours * 3600 * 1000);
}

function fmtDateTime(d: Date | null): string {
  if (!d) return '–';
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
// PORT SEARCH INPUT (autocomplete)
// ============================================================
function PortSearch({ label, value, onSelect, placeholder }: { label: string; value: PortCoord | null; onSelect: (p: PortCoord | null) => void; placeholder?: string }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const results = useMemo(() => (q.trim().length >= 1 ? searchPorts(q).slice(0, 8) : []), [q]);

  return (
    <div style={{ position: 'relative' }}>
      <label style={labelS}>{label}</label>
      {value ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0c1610', border: '1px solid rgba(200,168,75,.3)', borderRadius: 3, padding: '7px 9px' }}>
          <span style={{ fontFamily: rj, fontSize: 12.5, color: '#f5f0e8' }}>{value.name} <span style={{ color: '#7a8a72' }}>· {value.country}{value.unlocode ? ` · ${value.unlocode}` : ''}</span></span>
          <button onClick={() => { onSelect(null); setQ(''); }} style={{ background: 'transparent', border: 'none', color: '#ff8a8a', cursor: 'pointer', fontSize: 13 }}>✕</button>
        </div>
      ) : (
        <>
          <input
            style={inputStyle}
            value={q}
            onChange={(e) => { setQ(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder || 'Search port...'}
          />
          {open && results.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20, background: '#0c1610', border: '1px solid rgba(200,168,75,.3)', borderRadius: 3, marginTop: 3, maxHeight: 240, overflowY: 'auto', boxShadow: '0 8px 20px rgba(0,0,0,.4)' }}>
              {results.map((p, i) => (
                <button
                  key={`${p.unlocode || p.name}-${i}`}
                  onClick={() => { onSelect(p); setQ(''); setOpen(false); }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(200,168,75,.08)', color: '#f5f0e8', padding: '8px 10px', fontFamily: rj, fontSize: 12.5, cursor: 'pointer' }}
                >
                  {p.name} <span style={{ color: '#7a8a72', fontSize: 11 }}>· {p.country}{p.unlocode ? ` · ${p.unlocode}` : ''}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================
// COMPONENT
// ============================================================
export default function VoyagePlannerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingId = searchParams.get('id');

  const [data, setData] = useState<PlannerData>(DEFAULT_DATA);
  const [recordId, setRecordId] = useState<string | null>(existingId);
  const [recordName, setRecordName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [wpPick, setWpPick] = useState('');

  useEffect(() => {
    if (existingId) {
      const saved = loadItem<PlannerData>('planner', existingId);
      if (saved) { setData({ ...DEFAULT_DATA, ...saved.data }); setRecordName(saved.name); }
    }
  }, [existingId]);

  function setVessel<K extends keyof Vessel>(key: K, value: Vessel[K]) {
    setData((p) => ({ ...p, vessel: { ...p.vessel, [key]: value } }));
  }
  function update<K extends keyof PlannerData>(key: K, value: PlannerData[K]) { setData((p) => ({ ...p, [key]: value })); }
  function num(v: string): number { return parseFloat(v) || 0; }

  function addWaypoint(name: string, lat: number, lon: number) {
    setData((p) => ({ ...p, waypoints: [...p.waypoints, { id: genId(), name, lat, lon }] }));
  }
  function addCommonWp(name: string) {
    const w = COMMON_WAYPOINTS.find((x) => x.name === name);
    if (w) addWaypoint(w.name, w.lat, w.lon);
    setWpPick('');
  }
  function delWaypoint(id: string) { setData((p) => ({ ...p, waypoints: p.waypoints.filter((w) => w.id !== id) })); }
  function moveWaypoint(id: string, dir: -1 | 1) {
    setData((p) => {
      const arr = [...p.waypoints];
      const i = arr.findIndex((w) => w.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= arr.length) return p;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...p, waypoints: arr };
    });
  }

  const legs = useMemo(() => buildLegs(data), [data]);
  const baseDistance = useMemo(() => legs.reduce((s, l) => s + l.distance, 0), [legs]);
  const distanceWithMargin = baseDistance * (1 + (data.seaMargin || 0) / 100);
  const speed = data.vessel.serviceSpeed > 0 ? data.vessel.serviceSpeed : 0;
  const seaHours = speed > 0 ? distanceWithMargin / speed : 0;
  const seaDays = seaHours / 24;
  const eta = addHours(data.departureDate, data.departureTime, seaHours);

  // fuel quick preview (full plan comes in Part 5)
  const fuelBurn = data.vessel.ladenCons * seaDays;
  const robTotal = data.vessel.robVlsfo + data.vessel.robMgo;
  const robOnArrival = data.vessel.robVlsfo - fuelBurn; // simplified (main fuel = VLSFO)

  function handleSave() {
    const name = recordName.trim() || `${data.departure?.name || 'From'} → ${data.arrival?.name || 'To'}`;
    const id = recordId || genId();
    saveItem('planner', name, data, id);
    setRecordId(id); setRecordName(name); setSaveMsg('✓ Saved'); setShowSave(false);
    setTimeout(() => setSaveMsg(''), 3000);
  }
  function handleReset() {
    if (!confirm('Reset the whole plan?')) return;
    setData(DEFAULT_DATA); setRecordId(null); setRecordName(''); router.replace('/voyage/planner');
  }

  const ready = data.departure && data.arrival && speed > 0;

  return (
    <div>
      {/* breadcrumb */}
      <div style={{ marginBottom: 16 }}>
        <a href="/voyage/operators" style={{ fontFamily: rj, fontSize: 11, color: '#7a8a72', textDecoration: 'none', letterSpacing: '.5px' }}>← Shore Office</a>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>
          🧭 Voyage Hub · Voyage Planner
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Voyage <em style={g}>Planner</em>
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          Plan a passage port-to-port with waypoints, distance, ETA, fuel and — once the route is set —
          a live weather &amp; current outlook along the track. Set up your route and vessel below.
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
          <label style={labelS}>Name</label>
          <input type="text" value={recordName} onChange={(e) => setRecordName(e.target.value)} placeholder="e.g. Santos → Amsterdam V-12" style={{ ...inputStyle, marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{ ...goldBtn, padding: '8px 14px', letterSpacing: '1px' }}>Save</button>
            <button onClick={() => setShowSave(false)} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* 1. Route */}
      <div style={card}>
        <div style={sectionTitle}>1. Route</div>
        <div className="pl-g2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 14 }}>
          <PortSearch label="Departure Port" value={data.departure} onSelect={(p) => update('departure', p)} placeholder="e.g. Santos" />
          <PortSearch label="Arrival Port" value={data.arrival} onSelect={(p) => update('arrival', p)} placeholder="e.g. Amsterdam" />
        </div>

        {/* Waypoints */}
        <div style={{ marginBottom: 8 }}>
          <label style={labelS}>Routing Waypoints (canals, capes, straits)</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={wpPick} onChange={(e) => addCommonWp(e.target.value)} style={{ ...inputStyle, maxWidth: 260 }}>
              <option value="">+ Add common waypoint…</option>
              {COMMON_WAYPOINTS.map((w) => <option key={w.name} value={w.name}>{w.name}</option>)}
            </select>
            <span style={{ fontFamily: rj, fontSize: 10.5, color: '#7a8a72' }}>Add points in the order the ship passes them.</span>
          </div>
        </div>

        {data.waypoints.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
            {data.waypoints.map((w, i) => (
              <div key={w.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0c1610', border: '1px solid rgba(200,168,75,.12)', borderRadius: 3, padding: '6px 10px' }}>
                <span style={{ fontFamily: rj, fontSize: 12, color: '#f5f0e8' }}>
                  <span style={{ color: '#c8a84b', fontWeight: 700 }}>{i + 1}.</span> {w.name} <span style={{ color: '#7a8a72', fontSize: 10.5 }}>({w.lat.toFixed(1)}, {w.lon.toFixed(1)})</span>
                </span>
                <span style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => moveWaypoint(w.id, -1)} disabled={i === 0} style={miniBtn(i === 0 ? '#3a4a38' : '#c8a84b')}>↑</button>
                  <button onClick={() => moveWaypoint(w.id, 1)} disabled={i === data.waypoints.length - 1} style={miniBtn(i === data.waypoints.length - 1 ? '#3a4a38' : '#c8a84b')}>↓</button>
                  <button onClick={() => delWaypoint(w.id)} style={miniBtn('#ff8a8a')}>✕</button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Vessel */}
      <div style={card}>
        <div style={sectionTitle}>2. Vessel &amp; Speed</div>
        <div className="pl-g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 10 }}>
          <div><label style={labelS}>Vessel Name</label><input style={inputStyle} value={data.vessel.name} onChange={(e) => setVessel('name', e.target.value)} placeholder="MV NEURONAI" /></div>
          <div><label style={labelS}>LOA (m)</label><input style={inputStyle} type="number" value={data.vessel.loa || ''} onChange={(e) => setVessel('loa', num(e.target.value))} placeholder="229" /></div>
          <div><label style={labelS}>Beam (m)</label><input style={inputStyle} type="number" value={data.vessel.beam || ''} onChange={(e) => setVessel('beam', num(e.target.value))} placeholder="32" /></div>
          <div><label style={labelS}>Draft (m)</label><input style={inputStyle} type="number" step="0.1" value={data.vessel.draft || ''} onChange={(e) => setVessel('draft', num(e.target.value))} placeholder="12.5" /></div>
        </div>
        <div className="pl-g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          <div><label style={labelS}>Service Speed (kts)</label><input style={inputStyle} type="number" step="0.1" value={data.vessel.serviceSpeed || ''} onChange={(e) => setVessel('serviceSpeed', num(e.target.value))} placeholder="12.5" /></div>
          <div><label style={labelS}>Sea Cons (MT/day)</label><input style={inputStyle} type="number" step="0.1" value={data.vessel.ladenCons || ''} onChange={(e) => setVessel('ladenCons', num(e.target.value))} placeholder="24" /></div>
          <div>
            <label style={labelS}>Main Fuel</label>
            <select style={inputStyle} value={data.vessel.fuelType} onChange={(e) => setVessel('fuelType', e.target.value as Vessel['fuelType'])}>
              <option value="VLSFO">VLSFO</option>
              <option value="HSFO">HSFO</option>
              <option value="LSMGO">LSMGO</option>
            </select>
          </div>
          <div><label style={labelS}>Sea Margin (%)</label><input style={inputStyle} type="number" value={data.seaMargin || ''} onChange={(e) => update('seaMargin', num(e.target.value))} placeholder="5" /></div>
        </div>
      </div>

      {/* 3. Departure + bunkers on board */}
      <div style={card}>
        <div style={sectionTitle}>3. Departure &amp; Bunkers ROB</div>
        <div className="pl-g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          <div><label style={labelS}>Departure Date</label><input style={inputStyle} type="date" value={data.departureDate} onChange={(e) => update('departureDate', e.target.value)} /></div>
          <div><label style={labelS}>Departure Time</label><input style={inputStyle} type="time" value={data.departureTime} onChange={(e) => update('departureTime', e.target.value)} /></div>
          <div><label style={labelS}>ROB VLSFO (MT)</label><input style={inputStyle} type="number" value={data.vessel.robVlsfo || ''} onChange={(e) => setVessel('robVlsfo', num(e.target.value))} placeholder="800" /></div>
          <div><label style={labelS}>ROB MGO (MT)</label><input style={inputStyle} type="number" value={data.vessel.robMgo || ''} onChange={(e) => setVessel('robMgo', num(e.target.value))} placeholder="90" /></div>
        </div>
      </div>

      {/* SUMMARY (preview — map, weather, full fuel report come next) */}
      {ready && (
        <div style={{ ...card, background: 'linear-gradient(135deg,rgba(200,168,75,.08),transparent)', borderColor: 'rgba(200,168,75,.4)' }}>
          <div style={sectionTitle}>⚡ Passage Summary</div>
          <div className="pl-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
            <KPI label="Distance" value={fmt(distanceWithMargin)} sub="nm" color="#c8a84b" big />
            <KPI label="Sea Time" value={fmt(seaDays, 1)} sub="days" color="#5aa6e8" big />
            <KPI label="ETA" value={eta ? eta.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '–'} sub={eta ? eta.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''} color="#4caf76" />
            <KPI label="Est. Fuel Burn" value={fmt(fuelBurn, 0)} sub={`MT ${data.vessel.fuelType}`} color="#e8b85a" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0 }}>
            <RowR label="Base great-circle distance" value={`${fmt(baseDistance)} nm`} />
            <RowR label={`With ${data.seaMargin}% sea margin`} value={`${fmt(distanceWithMargin)} nm`} />
            <RowR label="Service speed" value={`${data.vessel.serviceSpeed} kts`} />
            <RowR label="ETA (full)" value={fmtDateTime(eta)} />
            {robTotal > 0 && <RowR label="ROB on arrival (approx VLSFO)" value={`${fmt(robOnArrival, 0)} MT`} color={robOnArrival < 0 ? '#ff6b6b' : robOnArrival < data.vessel.robVlsfo * 0.1 ? '#e8b85a' : '#4caf76'} />}
          </div>

          {robTotal > 0 && robOnArrival < 0 && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(255,107,107,.1)', border: '1px solid rgba(255,107,107,.4)', borderRadius: 4, fontFamily: rj, fontSize: 12.5, color: '#ff8a8a' }}>
              ⚠ Departure bunkers are insufficient for this passage at the entered consumption. Plan a bunker stem or reduce speed.
            </div>
          )}

          {/* legs table */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontFamily: rj, fontSize: 10, color: '#c8a84b', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Legs</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460, fontFamily: rj }}>
                <thead>
                  <tr style={{ color: '#7a8a72', fontSize: 9.5, letterSpacing: '.5px', textTransform: 'uppercase' }}>
                    <th style={{ ...thd, textAlign: 'left' }}>From → To</th>
                    <th style={thd}>Distance</th>
                    <th style={thd}>Course</th>
                    <th style={thd}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {legs.map((l, i) => (
                    <tr key={i} style={{ borderTop: '1px solid rgba(200,168,75,.08)' }}>
                      <td style={{ padding: '6px', color: '#f5f0e8', fontSize: 12 }}>{l.from.name} → {l.to.name}</td>
                      <td style={{ padding: '6px', textAlign: 'right', color: '#b0c0a4', fontSize: 12 }}>{fmt(l.distance)} nm</td>
                      <td style={{ padding: '6px', textAlign: 'right', color: '#b0c0a4', fontSize: 12 }}>{fmt(l.bearing)}° {bearingToCompass(l.bearing)}</td>
                      <td style={{ padding: '6px', textAlign: 'right', color: '#b0c0a4', fontSize: 12 }}>{speed > 0 ? fmt(l.distance / speed / 24, 1) : '–'} d</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder for next parts */}
      {ready && (
        <div style={{ ...card, background: 'rgba(90,166,232,.05)', borderColor: 'rgba(90,166,232,.2)', textAlign: 'center' }}>
          <div style={{ fontFamily: rj, fontSize: 12.5, color: '#9fc6ef', lineHeight: 1.6 }}>
            🗺️ <b>Interactive map, weather &amp; current outlook, day-by-day scrubber and the full fuel report</b> load in the next steps of this planner.
          </div>
        </div>
      )}

      {!ready && (
        <div style={{ ...card, textAlign: 'center', color: '#7a8a72', fontFamily: rj }}>
          Select a departure port, an arrival port and a service speed to see the passage summary.
        </div>
      )}

      <style>{`
        @media (max-width: 720px) {
          .pl-g2 { grid-template-columns: 1fr !important; }
          .pl-g4 { grid-template-columns: 1fr 1fr !important; }
          .pl-kpis { grid-template-columns: 1fr 1fr !important; }
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

function miniBtn(color: string): React.CSSProperties {
  return { background: 'transparent', border: 'none', color, fontFamily: rj, fontSize: 13, cursor: 'pointer', fontWeight: 700, padding: '0 2px' };
}
function KPI({ label: l, value, sub, color, big }: { label: string; value: string; sub?: string; color: string; big?: boolean }) {
  return (
    <div style={{ background: '#0c1610', border: '1px solid rgba(200,168,75,.2)', borderRadius: 4, padding: '12px 10px', textAlign: 'center' }}>
      <div style={{ fontFamily: rj, fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: '#7a8a72', fontWeight: 700 }}>{l}</div>
      <div style={{ fontFamily: lb, fontSize: big ? 26 : 20, fontWeight: 700, color, marginTop: 4 }}>{value} {sub && <span style={{ fontSize: 11, color: '#7a8a72' }}>{sub}</span>}</div>
    </div>
  );
}
function RowR({ label: l, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px dashed rgba(200,168,75,.1)', fontFamily: rj, fontSize: 13 }}>
      <span style={{ color: '#7a8a72' }}>{l}</span>
      <span style={{ color: color || '#f5f0e8', fontWeight: 600 }}>{value}</span>
    </div>
  );
}
