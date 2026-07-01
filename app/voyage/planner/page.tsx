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
  mgoSeaCons: number;     // aux MGO MT/day at sea
}

interface PlannerData {
  departure: PortCoord | null;
  arrival: PortCoord | null;
  waypoints: Waypoint[];
  vessel: Vessel;
  departureDate: string;   // ISO date
  departureTime: string;   // HH:MM
  seaMargin: number;       // % added to distance for weather/routing
  portDays: number;        // days in port at arrival (for MGO/aux burn)
}

const DEFAULT_VESSEL: Vessel = {
  name: '', loa: 0, beam: 0, draft: 0, serviceSpeed: 12,
  ladenCons: 0, portCons: 0, robVlsfo: 0, robMgo: 0, fuelType: 'VLSFO', mgoSeaCons: 0,
};

const DEFAULT_DATA: PlannerData = {
  departure: null, arrival: null, waypoints: [], vessel: DEFAULT_VESSEL,
  departureDate: new Date().toISOString().slice(0, 10), departureTime: '12:00', seaMargin: 5, portDays: 0,
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
// GEODESY — great-circle interpolation for daily positions
// ============================================================
function toRad(d: number) { return (d * Math.PI) / 180; }
function toDeg(r: number) { return (r * 180) / Math.PI; }

// intermediate point at fraction f (0..1) along great circle A->B
function interpGC(lat1: number, lon1: number, lat2: number, lon2: number, f: number): [number, number] {
  const φ1 = toRad(lat1), λ1 = toRad(lon1), φ2 = toRad(lat2), λ2 = toRad(lon2);
  const Δφ = φ2 - φ1, Δλ = λ2 - λ1;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const δ = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  if (δ === 0) return [lat1, lon1];
  const A = Math.sin((1 - f) * δ) / Math.sin(δ);
  const B = Math.sin(f * δ) / Math.sin(δ);
  const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
  const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
  const z = A * Math.sin(φ1) + B * Math.sin(φ2);
  const φi = Math.atan2(z, Math.sqrt(x * x + y * y));
  const λi = Math.atan2(y, x);
  return [toDeg(φi), ((toDeg(λi) + 540) % 360) - 180];
}

interface RoutePoint { lat: number; lon: number; }
interface DailyPos {
  day: number;          // 0,1,2...
  date: Date;
  lat: number;
  lon: number;
  cumDist: number;      // nm covered
  remainingDist: number;
}

// densify the route into many small segments for smooth drawing
function densifyRoute(pts: RoutePoint[], stepNm = 60): RoutePoint[] {
  if (pts.length < 2) return pts;
  const out: RoutePoint[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    const d = haversineDistance(a.lat, a.lon, b.lat, b.lon);
    const steps = Math.max(1, Math.round(d / stepNm));
    for (let s = 0; s < steps; s++) {
      const [la, lo] = interpGC(a.lat, a.lon, b.lat, b.lon, s / steps);
      out.push({ lat: la, lon: lo });
    }
  }
  out.push({ lat: pts[pts.length - 1].lat, lon: pts[pts.length - 1].lon });
  return out;
}

// compute a position at a given cumulative distance along the ordered points
function positionAtDistance(pts: RoutePoint[], targetNm: number): RoutePoint {
  if (pts.length === 0) return { lat: 0, lon: 0 };
  if (pts.length === 1 || targetNm <= 0) return pts[0];
  let acc = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    const d = haversineDistance(a.lat, a.lon, b.lat, b.lon);
    if (acc + d >= targetNm) {
      const f = d > 0 ? (targetNm - acc) / d : 0;
      const [la, lo] = interpGC(a.lat, a.lon, b.lat, b.lon, f);
      return { lat: la, lon: lo };
    }
    acc += d;
  }
  return pts[pts.length - 1];
}



// ============================================================
// OPEN-METEO — marine weather + current along the route
// Free, no API key, CORS-enabled. Forecast horizon ~16 days.
// Marine API: wave height/direction/period + ocean current.
// Forecast API: wind speed/direction (10m).
// ============================================================
interface DayWeather {
  day: number;
  available: boolean;       // within forecast horizon & data returned
  windSpeed: number;        // kt
  windDir: number;          // deg
  waveHs: number;           // m
  waveDir: number;          // deg
  wavePeriod: number;       // s
  currentSpeed: number;     // kt
  currentDir: number;       // deg
  note: string;
}

function degToCompass(d: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(((d % 360) / 22.5)) % 16];
}

// weather severity 0..3 for colour coding (based on wind & wave)
function severity(w: DayWeather): 0 | 1 | 2 | 3 {
  if (!w.available) return 0;
  const wind = w.windSpeed, hs = w.waveHs;
  if (wind >= 34 || hs >= 4) return 3;        // gale / rough
  if (wind >= 22 || hs >= 2.5) return 2;      // strong breeze / moderate
  if (wind >= 11 || hs >= 1.25) return 1;     // moderate
  return 0;                                   // calm
}
const SEV_COLOR = ['#4caf76', '#8bc34a', '#e8b85a', '#ff6b6b'];

// fetch one point's forecast for a specific date (returns midday value)
async function fetchPointWeather(lat: number, lon: number, dateISO: string): Promise<Partial<DayWeather>> {
  const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}&daily=wave_height_max,wave_direction_dominant,wave_period_max&hourly=ocean_current_velocity,ocean_current_direction&start_date=${dateISO}&end_date=${dateISO}&timezone=UTC`;
  const windUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}&daily=wind_speed_10m_max,wind_direction_10m_dominant&wind_speed_unit=kn&start_date=${dateISO}&end_date=${dateISO}&timezone=UTC`;

  const out: Partial<DayWeather> = {};
  try {
    const [mRes, wRes] = await Promise.all([fetch(marineUrl), fetch(windUrl)]);
    if (mRes.ok) {
      const m = await mRes.json();
      if (m.daily) {
        out.waveHs = m.daily.wave_height_max?.[0] ?? 0;
        out.waveDir = m.daily.wave_direction_dominant?.[0] ?? 0;
        out.wavePeriod = m.daily.wave_period_max?.[0] ?? 0;
      }
      if (m.hourly && Array.isArray(m.hourly.ocean_current_velocity)) {
        // take midday (index 12) if present, else first non-null
        const vArr = m.hourly.ocean_current_velocity;
        const dArr = m.hourly.ocean_current_direction || [];
        const idx = vArr.length > 12 ? 12 : 0;
        const vMs = vArr[idx];
        if (vMs != null) { out.currentSpeed = vMs * 1.94384; out.currentDir = dArr[idx] ?? 0; } // m/s -> kt
      }
    }
    if (wRes.ok) {
      const w = await wRes.json();
      if (w.daily) {
        out.windSpeed = w.daily.wind_speed_10m_max?.[0] ?? 0;
        out.windDir = w.daily.wind_direction_10m_dominant?.[0] ?? 0;
      }
    }
    out.available = out.waveHs != null || out.windSpeed != null;
  } catch (e) {
    out.available = false;
  }
  return out;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// ============================================================
// LEAFLET MAP — real world map + GEBCO bathymetry + route
// Leaflet is loaded from CDN at runtime to avoid SSR issues.
// ============================================================
declare global {
  interface Window { L?: any; }
}

function loadLeaflet(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') { reject('no window'); return; }
    if (window.L) { resolve(window.L); return; }
    // CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(link);
    }
    // JS
    const existing = document.getElementById('leaflet-js') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(window.L));
      return;
    }
    const script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    script.onload = () => resolve(window.L);
    script.onerror = () => reject('leaflet failed');
    document.head.appendChild(script);
  });
}

interface MapProps {
  departure: PortCoord | null;
  arrival: PortCoord | null;
  waypoints: Waypoint[];
  densified: RoutePoint[];
  dailyPositions: DailyPos[];
  weather: DayWeather[];
  activeDay: number | null;   // which day's ship position to highlight
}

function RouteMap({ departure, arrival, waypoints, densified, dailyPositions, weather, activeDay }: MapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapObj = useRef<any>(null);
  const layerGroup = useRef<any>(null);
  const shipMarker = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState('');

  // init map once
  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then((L) => {
      if (cancelled || !mapRef.current || mapObj.current) return;
      const map = L.map(mapRef.current, {
        center: [20, 0], zoom: 2, worldCopyJump: true, minZoom: 2, maxZoom: 12,
        attributionControl: true,
      });
      // Base: dark ocean-friendly tiles (Carto dark) — good contrast for the gold route
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO', subdomains: 'abcd', maxZoom: 20,
      }).addTo(map);
      // Bathymetry overlay: GEBCO shaded relief (shows sea depth when zoomed) — WMS
      try {
        L.tileLayer.wms('https://wms.gebco.net/mapserv?', {
          layers: 'GEBCO_LATEST', format: 'image/png', transparent: true,
          opacity: 0.45, attribution: 'GEBCO',
        }).addTo(map);
      } catch (e) { /* bathymetry optional */ }

      mapObj.current = map;
      layerGroup.current = L.layerGroup().addTo(map);
      setReady(true);
    }).catch(() => setErr('Map could not load (check your connection).'));
    return () => {
      cancelled = true;
      if (mapObj.current) { mapObj.current.remove(); mapObj.current = null; }
    };
  }, []);

  // redraw route when inputs change
  useEffect(() => {
    if (!ready || !mapObj.current || !window.L) return;
    const L = window.L;
    const lg = layerGroup.current;
    lg.clearLayers();

    const latlngs = densified.map((p) => [p.lat, p.lon]);
    if (latlngs.length >= 2) {
      // route line (gold)
      L.polyline(latlngs, { color: '#c8a84b', weight: 3, opacity: 0.9 }).addTo(lg);
    }

    const portIcon = (color: string, label: string) => L.divIcon({
      className: '', html: `<div style="background:${color};color:#08100a;font-family:${rj};font-size:10px;font-weight:700;padding:2px 6px;border-radius:3px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.4)">${label}</div>`,
      iconSize: [0, 0], iconAnchor: [0, 0],
    });

    if (departure) L.marker([departure.lat, departure.lon], { icon: portIcon('#4caf76', '● ' + departure.name) }).addTo(lg);
    if (arrival) L.marker([arrival.lat, arrival.lon], { icon: portIcon('#ff8a8a', '◉ ' + arrival.name) }).addTo(lg);
    waypoints.forEach((w) => L.marker([w.lat, w.lon], { icon: portIcon('#5aa6e8', '◇ ' + w.name) }).addTo(lg));

    // weather-coloured segments between consecutive daily positions (if weather loaded)
    if (weather.length > 0) {
      for (let i = 0; i < dailyPositions.length - 1; i++) {
        const a = dailyPositions[i], b = dailyPositions[i + 1];
        const w = weather.find((x) => x.day === a.day);
        const sev = w ? severity(w) : 0;
        const col = w && w.available ? SEV_COLOR[sev] : '#5a6b52';
        L.polyline([[a.lat, a.lon], [b.lat, b.lon]], { color: col, weight: 5, opacity: 0.85 }).addTo(lg);
      }
    }

    // daily dots (coloured by weather severity when available)
    dailyPositions.forEach((dp) => {
      const w = weather.find((x) => x.day === dp.day);
      const sev = w ? severity(w) : 0;
      const col = w && w.available ? SEV_COLOR[sev] : '#e8b85a';
      const tip = w && w.available
        ? `Day ${dp.day}: ${w.windSpeed.toFixed(0)}kt, Hs ${w.waveHs.toFixed(1)}m`
        : (w && w.note ? `Day ${dp.day}: ${w.note}` : `Day ${dp.day}`);
      L.circleMarker([dp.lat, dp.lon], { radius: 4, color: col, fillColor: col, fillOpacity: 0.9, weight: 1 })
        .bindTooltip(tip, { direction: 'top', offset: [0, -4] })
        .addTo(lg);
    });

    // fit bounds
    if (latlngs.length >= 2) {
      try { mapObj.current.fitBounds(L.latLngBounds(latlngs).pad(0.2)); } catch (e) { /* noop */ }
    }
  }, [ready, densified, departure, arrival, waypoints, dailyPositions, weather]);

  // ship marker for active day
  useEffect(() => {
    if (!ready || !mapObj.current || !window.L) return;
    const L = window.L;
    if (shipMarker.current) { mapObj.current.removeLayer(shipMarker.current); shipMarker.current = null; }
    if (activeDay == null) return;
    const dp = dailyPositions.find((d) => d.day === activeDay);
    if (!dp) return;
    const icon = L.divIcon({
      className: '', html: `<div style="font-size:22px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.6))">🚢</div>`,
      iconSize: [24, 24], iconAnchor: [12, 12],
    });
    shipMarker.current = L.marker([dp.lat, dp.lon], { icon, zIndexOffset: 1000 }).addTo(mapObj.current);
  }, [ready, activeDay, dailyPositions]);

  return (
    <div style={{ position: 'relative' }}>
      <div ref={mapRef} style={{ width: '100%', height: 420, borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(200,168,75,.2)', background: '#0c1610' }} />
      {err && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: rj, fontSize: 12, color: '#ff8a8a', background: 'rgba(12,22,16,.9)', borderRadius: 6 }}>{err}</div>}
      {!ready && !err && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: rj, fontSize: 12, color: '#7a8a72' }}>Loading map…</div>}
    </div>
  );
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
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [weather, setWeather] = useState<DayWeather[]>([]);
  const [wxLoading, setWxLoading] = useState(false);
  const [wxError, setWxError] = useState('');
  const [wxFetched, setWxFetched] = useState(false);

  async function fetchWeatherAlongRoute() {
    if (dailyPositions.length === 0) return;
    setWxLoading(true); setWxError(''); setWxFetched(false);
    const HORIZON_DAYS = 16;
    const results: DayWeather[] = [];
    try {
      // sequential-ish but capped; fetch each day's position
      for (const dp of dailyPositions) {
        const base: DayWeather = { day: dp.day, available: false, windSpeed: 0, windDir: 0, waveHs: 0, waveDir: 0, wavePeriod: 0, currentSpeed: 0, currentDir: 0, note: '' };
        // beyond forecast horizon -> mark unavailable, skip fetch
        const daysFromNow = (dp.date.getTime() - Date.now()) / 86400000;
        if (daysFromNow > HORIZON_DAYS) {
          base.note = 'Beyond forecast horizon';
          results.push(base);
          continue;
        }
        if (daysFromNow < -1) {
          base.note = 'Past date';
          results.push(base);
          continue;
        }
        const w = await fetchPointWeather(dp.lat, dp.lon, isoDate(dp.date));
        const merged: DayWeather = { ...base, ...w, day: dp.day } as DayWeather;
        merged.available = !!w.available;
        results.push(merged);
      }
      // build notes: describe worsening/improving vs previous
      for (let i = 0; i < results.length; i++) {
        const cur = results[i];
        if (!cur.available) continue;
        const sev = severity(cur);
        const label = sev === 3 ? 'gale / rough seas' : sev === 2 ? 'strong winds, moderate seas' : sev === 1 ? 'moderate conditions' : 'calm';
        let trend = '';
        const prev = results[i - 1];
        if (prev && prev.available) {
          const ps = severity(prev);
          if (sev > ps) trend = ' — worsening';
          else if (sev < ps) trend = ' — improving';
        }
        cur.note = `${cur.windSpeed.toFixed(0)}kt ${degToCompass(cur.windDir)}, Hs ${cur.waveHs.toFixed(1)}m — ${label}${trend}`;
      }
      setWeather(results);
      setWxFetched(true);
    } catch (e) {
      setWxError('Weather could not be loaded. Check your connection and try again.');
    } finally {
      setWxLoading(false);
    }
  }



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

  // ordered route points (departure -> waypoints -> arrival)
  const routePoints = useMemo<RoutePoint[]>(() => {
    const pts: RoutePoint[] = [];
    if (data.departure) pts.push({ lat: data.departure.lat, lon: data.departure.lon });
    data.waypoints.forEach((w) => pts.push({ lat: w.lat, lon: w.lon }));
    if (data.arrival) pts.push({ lat: data.arrival.lat, lon: data.arrival.lon });
    return pts;
  }, [data.departure, data.arrival, data.waypoints]);

  const densified = useMemo(() => densifyRoute(routePoints, 50), [routePoints]);

  // daily positions along the route (day 0 = departure)
  const dailyPositions = useMemo<DailyPos[]>(() => {
    if (routePoints.length < 2 || speed <= 0) return [];
    const totalDays = Math.ceil(seaDays);
    const nmPerDay = speed * 24;
    const out: DailyPos[] = [];
    for (let day = 0; day <= totalDays; day++) {
      const cum = Math.min(day * nmPerDay, distanceWithMargin);
      const pos = positionAtDistance(routePoints, cum);
      const dt = addHours(data.departureDate, data.departureTime, day * 24);
      out.push({ day, date: dt || new Date(), lat: pos.lat, lon: pos.lon, cumDist: cum, remainingDist: distanceWithMargin - cum });
    }
    return out;
  }, [routePoints, speed, seaDays, distanceWithMargin, data.departureDate, data.departureTime]);

  // clear weather if route/date/speed changes materially
  useEffect(() => { setWeather([]); setWxFetched(false); }, [routePoints, data.departureDate, data.vessel.serviceSpeed]);

  // fuel quick preview (full plan comes in Part 5)
  const fuelBurn = data.vessel.ladenCons * seaDays;
  const robTotal = data.vessel.robVlsfo + data.vessel.robMgo;
  const robOnArrival = data.vessel.robVlsfo - fuelBurn; // simplified (main fuel = VLSFO)

  // ---- FULL FUEL PLAN ----
  const fuelPlan = useMemo(() => {
    const seaMain = data.vessel.ladenCons * seaDays;            // main fuel (VLSFO/HSFO/LSMGO) at sea
    const seaMgo = data.vessel.mgoSeaCons * seaDays;            // aux MGO at sea
    const portMgo = data.vessel.portCons * (data.portDays || 0); // MGO/idle at port
    const mainType = data.vessel.fuelType;

    // main fuel drawn from VLSFO ROB unless main fuel is LSMGO
    let vlsfoUsed = 0, mgoUsed = 0;
    if (mainType === 'LSMGO') {
      mgoUsed = seaMain + seaMgo + portMgo;
    } else {
      vlsfoUsed = seaMain;
      mgoUsed = seaMgo + portMgo;
    }
    const vlsfoArr = data.vessel.robVlsfo - vlsfoUsed;
    const mgoArr = data.vessel.robMgo - mgoUsed;

    return { seaMain, seaMgo, portMgo, vlsfoUsed, mgoUsed, vlsfoArr, mgoArr, mainType };
  }, [data.vessel, seaDays, data.portDays]);

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
        <div className="pl-g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 10 }}>
          <div><label style={labelS}>Departure Date</label><input style={inputStyle} type="date" value={data.departureDate} onChange={(e) => update('departureDate', e.target.value)} /></div>
          <div><label style={labelS}>Departure Time</label><input style={inputStyle} type="time" value={data.departureTime} onChange={(e) => update('departureTime', e.target.value)} /></div>
          <div><label style={labelS}>ROB VLSFO (MT)</label><input style={inputStyle} type="number" value={data.vessel.robVlsfo || ''} onChange={(e) => setVessel('robVlsfo', num(e.target.value))} placeholder="800" /></div>
          <div><label style={labelS}>ROB MGO (MT)</label><input style={inputStyle} type="number" value={data.vessel.robMgo || ''} onChange={(e) => setVessel('robMgo', num(e.target.value))} placeholder="90" /></div>
        </div>
        <div className="pl-g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          <div><label style={labelS}>Aux MGO at Sea (MT/day)</label><input style={inputStyle} type="number" step="0.1" value={data.vessel.mgoSeaCons || ''} onChange={(e) => setVessel('mgoSeaCons', num(e.target.value))} placeholder="1.5" /></div>
          <div><label style={labelS}>Port/Idle Cons (MT/day)</label><input style={inputStyle} type="number" step="0.1" value={data.vessel.portCons || ''} onChange={(e) => setVessel('portCons', num(e.target.value))} placeholder="3" /></div>
          <div><label style={labelS}>Port Days at Arrival</label><input style={inputStyle} type="number" step="0.5" value={data.portDays || ''} onChange={(e) => update('portDays', num(e.target.value))} placeholder="2" /></div>
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

      {/* MAP */}
      {ready && routePoints.length >= 2 && (
        <div style={card}>
          <div style={sectionTitle}>🗺️ Route Map</div>
          <RouteMap
            departure={data.departure}
            arrival={data.arrival}
            waypoints={data.waypoints}
            densified={densified}
            dailyPositions={dailyPositions}
            weather={weather}
            activeDay={activeDay}
          />

          {/* Weather load bar */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 12 }}>
            <button onClick={fetchWeatherAlongRoute} disabled={wxLoading} style={{ ...goldBtn, opacity: wxLoading ? 0.6 : 1 }}>
              {wxLoading ? '⏳ Loading weather…' : wxFetched ? '🔄 Refresh Weather' : '🌦️ Load Weather & Current'}
            </button>
            {wxError && <span style={{ fontFamily: rj, fontSize: 12, color: '#ff8a8a' }}>{wxError}</span>}
            {wxFetched && !wxError && (
              <span style={{ fontFamily: rj, fontSize: 11, color: '#7a8a72' }}>
                Data: Open-Meteo · forecast horizon ~16 days
              </span>
            )}
          </div>

          {/* Weather legend */}
          {wxFetched && (
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 10, fontFamily: rj, fontSize: 10.5, color: '#b0c0a4' }}>
              <span><b style={{ color: SEV_COLOR[0] }}>●</b> Calm</span>
              <span><b style={{ color: SEV_COLOR[1] }}>●</b> Moderate</span>
              <span><b style={{ color: SEV_COLOR[2] }}>●</b> Strong / rough</span>
              <span><b style={{ color: SEV_COLOR[3] }}>●</b> Gale</span>
              <span><b style={{ color: '#5a6b52' }}>●</b> Beyond forecast</span>
            </div>
          )}
          {/* day scrubber (positions only for now; weather arrives next part) */}
          {dailyPositions.length > 1 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={labelS}>Move the ship along the route</label>
                <span style={{ fontFamily: rj, fontSize: 11, color: '#c8a84b', fontWeight: 700 }}>
                  {activeDay == null ? 'Drag to preview' : `Day ${activeDay}`}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={dailyPositions.length - 1}
                value={activeDay ?? 0}
                onChange={(e) => setActiveDay(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: '#c8a84b' }}
              />
              {activeDay != null && (() => {
                const dp = dailyPositions[activeDay];
                const w = weather.find((x) => x.day === dp.day);
                const sev = w ? severity(w) : 0;
                return (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ padding: '10px 14px', background: '#0c1610', border: '1px solid rgba(200,168,75,.2)', borderRadius: 4, display: 'flex', gap: 18, flexWrap: 'wrap', fontFamily: rj, fontSize: 12, color: '#b0c0a4' }}>
                      <span>📅 <b style={{ color: '#f5f0e8' }}>{dp.date.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })}</b></span>
                      <span>📍 <b style={{ color: '#f5f0e8' }}>{dp.lat.toFixed(2)}°, {dp.lon.toFixed(2)}°</b></span>
                      <span>➡️ Covered <b style={{ color: '#c8a84b' }}>{fmt(dp.cumDist)} nm</b></span>
                      <span>⛳ Remaining <b style={{ color: '#5aa6e8' }}>{fmt(dp.remainingDist)} nm</b></span>
                    </div>
                    {w && w.available ? (
                      <div style={{ marginTop: 8, padding: '12px 14px', background: '#0c1610', border: `1px solid ${SEV_COLOR[sev]}55`, borderRadius: 4 }}>
                        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontFamily: rj, fontSize: 12.5 }}>
                          <span style={{ color: '#7a8a72' }}>🌬️ Wind <b style={{ color: '#f5f0e8' }}>{w.windSpeed.toFixed(0)} kt {degToCompass(w.windDir)}</b></span>
                          <span style={{ color: '#7a8a72' }}>🌊 Wave Hs <b style={{ color: '#f5f0e8' }}>{w.waveHs.toFixed(1)} m {degToCompass(w.waveDir)}</b></span>
                          {w.wavePeriod > 0 && <span style={{ color: '#7a8a72' }}>⏱️ Period <b style={{ color: '#f5f0e8' }}>{w.wavePeriod.toFixed(0)} s</b></span>}
                          {w.currentSpeed > 0 && <span style={{ color: '#7a8a72' }}>🌀 Current <b style={{ color: '#5aa6e8' }}>{w.currentSpeed.toFixed(1)} kt {degToCompass(w.currentDir)}</b></span>}
                        </div>
                        {w.note && <div style={{ marginTop: 6, fontFamily: rj, fontSize: 12, color: SEV_COLOR[sev], fontWeight: 600 }}>{w.note}</div>}
                      </div>
                    ) : wxFetched ? (
                      <div style={{ marginTop: 8, padding: '10px 14px', background: '#0c1610', border: '1px solid rgba(122,138,114,.3)', borderRadius: 4, fontFamily: rj, fontSize: 12, color: '#7a8a72' }}>
                        {w?.note || 'No forecast for this day'} — beyond the ~16-day forecast horizon or no marine data at this point.
                      </div>
                    ) : (
                      <div style={{ marginTop: 8, fontFamily: rj, fontSize: 11, color: '#7a8a72' }}>
                        Tap <b style={{ color: '#c8a84b' }}>Load Weather</b> above to see wind, waves and current for this position.
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}


      {/* FULL FUEL PLAN */}
      {ready && (
        <div style={card}>
          <div style={sectionTitle}>⛽ Fuel Plan</div>
          <div className="pl-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
            <KPI label="Main at Sea" value={fmt(fuelPlan.seaMain, 0)} sub={`MT ${fuelPlan.mainType}`} color="#c8a84b" />
            <KPI label="Aux MGO at Sea" value={fmt(fuelPlan.seaMgo, 1)} sub="MT" color="#5aa6e8" />
            <KPI label="Port MGO" value={fmt(fuelPlan.portMgo, 1)} sub="MT" color="#5aa6e8" />
            <KPI label="Total Burn" value={fmt(fuelPlan.seaMain + fuelPlan.seaMgo + fuelPlan.portMgo, 0)} sub="MT" color="#e8b85a" big />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0, marginBottom: 14 }}>
            <RowR label={`VLSFO ROB on departure`} value={`${fmt(data.vessel.robVlsfo, 0)} MT`} />
            <RowR label="VLSFO consumed" value={`${fmt(fuelPlan.vlsfoUsed, 0)} MT`} />
            <RowR label="VLSFO on arrival" value={`${fmt(fuelPlan.vlsfoArr, 0)} MT`} color={fuelPlan.vlsfoArr < 0 ? '#ff6b6b' : fuelPlan.vlsfoArr < data.vessel.robVlsfo * 0.1 ? '#e8b85a' : '#4caf76'} />
            <RowR label="MGO ROB on departure" value={`${fmt(data.vessel.robMgo, 0)} MT`} />
            <RowR label="MGO consumed" value={`${fmt(fuelPlan.mgoUsed, 1)} MT`} />
            <RowR label="MGO on arrival" value={`${fmt(fuelPlan.mgoArr, 1)} MT`} color={fuelPlan.mgoArr < 0 ? '#ff6b6b' : fuelPlan.mgoArr < data.vessel.robMgo * 0.15 ? '#e8b85a' : '#4caf76'} />
          </div>

          {(fuelPlan.vlsfoArr < 0 || fuelPlan.mgoArr < 0) && (
            <div style={{ padding: '10px 14px', background: 'rgba(255,107,107,.1)', border: '1px solid rgba(255,107,107,.4)', borderRadius: 4, fontFamily: rj, fontSize: 12.5, color: '#ff8a8a' }}>
              ⚠ Bunkers insufficient for this passage. Plan a stem before departure or en route, or reduce speed to cut consumption.
            </div>
          )}

          {/* Daily fuel burn-down mini chart */}
          {dailyPositions.length > 1 && data.vessel.ladenCons > 0 && (() => {
            const W = 600, H = 120, pad = 26;
            const nmPerDay = speed * 24;
            const dailyMain = data.vessel.ladenCons; // per day
            const startROB = fuelPlan.mainType === 'LSMGO' ? data.vessel.robMgo : data.vessel.robVlsfo;
            const pts = dailyPositions.map((dp) => {
              const burned = Math.min(startROB, (dp.cumDist / Math.max(1, nmPerDay)) * dailyMain);
              return { day: dp.day, rob: Math.max(0, startROB - burned) };
            });
            const maxR = Math.max(startROB, 1);
            const px = (i: number) => pad + (i / Math.max(1, pts.length - 1)) * (W - 2 * pad);
            const py = (v: number) => H - pad - (v / maxR) * (H - 2 * pad);
            const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${px(i).toFixed(1)} ${py(p.rob).toFixed(1)}`).join(' ');
            return (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontFamily: rj, fontSize: 10, color: '#c8a84b', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
                  {fuelPlan.mainType} ROB burn-down
                </div>
                <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
                  <path d={`${d} L ${px(pts.length - 1)} ${H - pad} L ${px(0)} ${H - pad} Z`} fill="rgba(200,168,75,.12)" />
                  <path d={d} fill="none" stroke="#c8a84b" strokeWidth={2} />
                  <text x={pad} y={H - 8} fill="#7a8a72" fontSize={8} fontFamily={rj}>Day 0</text>
                  <text x={W - pad} y={H - 8} fill="#7a8a72" fontSize={8} fontFamily={rj} textAnchor="end">Day {pts[pts.length - 1].day}</text>
                  <text x={pad} y={py(maxR) + 8} fill="#7a8a72" fontSize={8} fontFamily={rj}>{fmt(maxR, 0)} MT</text>
                </svg>
              </div>
            );
          })()}
        </div>
      )}

      {/* WEATHER OUTLOOK TABLE */}
      {ready && wxFetched && weather.length > 0 && (
        <div style={card}>
          <div style={sectionTitle}>🌦️ Weather Outlook Along the Route</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520, fontFamily: rj }}>
              <thead>
                <tr style={{ color: '#7a8a72', fontSize: 9.5, letterSpacing: '.5px', textTransform: 'uppercase' }}>
                  <th style={{ ...thd, textAlign: 'left' }}>Day / Date</th>
                  <th style={thd}>Wind</th>
                  <th style={thd}>Wave Hs</th>
                  <th style={thd}>Current</th>
                  <th style={{ ...thd, textAlign: 'left', paddingLeft: 12 }}>Outlook</th>
                </tr>
              </thead>
              <tbody>
                {weather.map((w) => {
                  const dp = dailyPositions.find((d) => d.day === w.day);
                  const sev = severity(w);
                  return (
                    <tr key={w.day} style={{ borderTop: '1px solid rgba(200,168,75,.08)' }}>
                      <td style={{ padding: '6px', color: '#f5f0e8', fontSize: 12 }}>
                        <b>Day {w.day}</b> {dp ? dp.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : ''}
                      </td>
                      {w.available ? (
                        <>
                          <td style={{ padding: '6px', textAlign: 'right', color: '#b0c0a4', fontSize: 12 }}>{w.windSpeed.toFixed(0)} kt {degToCompass(w.windDir)}</td>
                          <td style={{ padding: '6px', textAlign: 'right', color: '#b0c0a4', fontSize: 12 }}>{w.waveHs.toFixed(1)} m</td>
                          <td style={{ padding: '6px', textAlign: 'right', color: '#5aa6e8', fontSize: 12 }}>{w.currentSpeed > 0 ? `${w.currentSpeed.toFixed(1)} kt ${degToCompass(w.currentDir)}` : '–'}</td>
                          <td style={{ padding: '6px 6px 6px 12px', color: SEV_COLOR[sev], fontSize: 11.5, fontWeight: 600 }}>{w.note}</td>
                        </>
                      ) : (
                        <td colSpan={4} style={{ padding: '6px 6px 6px 12px', color: '#7a8a72', fontSize: 11.5 }}>{w.note || 'No forecast'}</td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI SUMMARY (Pro placeholder) */}
      {ready && (
        <div style={{ ...card, background: 'linear-gradient(135deg,rgba(200,168,75,.06),transparent)', borderColor: 'rgba(200,168,75,.3)' }}>
          <div style={sectionTitle}>🤖 AI Voyage Summary</div>
          <p style={{ fontFamily: rj, fontSize: 12.5, color: '#b0c0a4', lineHeight: 1.6, marginBottom: 12 }}>
            Let AI read this entire plan — route, distance, ETA, fuel and the weather outlook — and write an
            operator-ready summary with routing advice, weather risk flags and a bunker recommendation.
          </p>
          <button
            onClick={() => alert('AI Voyage Summary is a Pro feature — coming soon. It will analyse this plan and produce routing advice, weather risk flags and a bunker recommendation.')}
            style={{ ...goldBtn, opacity: 0.85 }}
          >
            ✨ Generate AI Summary — Pro (coming soon)
          </button>
        </div>
      )}

      {/* PRINTABLE PERFORMANCE SUMMARY */}
      {ready && (
        <div style={card}>
          <div style={sectionTitle}>📋 Voyage Performance Summary</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0, fontFamily: rj, fontSize: 12.5 }}>
            <RowR label="Vessel" value={data.vessel.name || '—'} />
            <RowR label="Route" value={`${data.departure?.name || '—'} → ${data.arrival?.name || '—'}${data.waypoints.length ? ` via ${data.waypoints.map((w) => w.name).join(', ')}` : ''}`} />
            <RowR label="Departure" value={fmtDateTime(addHours(data.departureDate, data.departureTime, 0))} />
            <RowR label="ETA" value={fmtDateTime(eta)} />
            <RowR label="Distance (with margin)" value={`${fmt(distanceWithMargin)} nm`} />
            <RowR label="Sea time" value={`${fmt(seaDays, 1)} days at ${data.vessel.serviceSpeed} kts`} />
            <RowR label="Total fuel burn" value={`${fmt(fuelPlan.seaMain + fuelPlan.seaMgo + fuelPlan.portMgo, 0)} MT`} />
            <RowR label={`${fuelPlan.mainType} on arrival`} value={`${fmt(fuelPlan.mainType === 'LSMGO' ? fuelPlan.mgoArr : fuelPlan.vlsfoArr, 0)} MT`} />
            <RowR label="MGO on arrival" value={`${fmt(fuelPlan.mgoArr, 1)} MT`} />
            {wxFetched && weather.some((w) => severity(w) >= 3) && (
              <RowR label="Weather risk" value={`Gale-force conditions expected on ${weather.filter((w) => severity(w) >= 3).map((w) => `Day ${w.day}`).join(', ')}`} color="#ff8a8a" />
            )}
          </div>
          <p style={{ fontFamily: rj, fontSize: 10.5, color: '#7a8a72', marginTop: 12, lineHeight: 1.5 }}>
            Indicative planning figures. Distances are great-circle via your waypoints (not a navigated track); weather is Open-Meteo forecast (~16-day horizon). Always plan the actual passage with approved charts, routing and the vessel&apos;s own data.
          </p>
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
