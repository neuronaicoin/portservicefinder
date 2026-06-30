'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { saveItem, loadItem, genId } from '@/lib/voyage-storage';

const lb = "'Libre Bodoni', serif";
const rj = "'Rajdhani', sans-serif";
const g = { color: '#c8a84b', fontStyle: 'italic' };

// ============================================================
// TYPES
// ============================================================
interface NoonReport {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM UTC
  lat: number;
  lon: number;
  latDir: 'N' | 'S';
  lonDir: 'E' | 'W';
  distanceRun: number; // nm last 24h
  avgSpeed: number; // kts
  meCons: number; // MT/day
  aeCons: number; // MT/day
  rob: number; // MT main fuel ROB
  robAe: number; // MT AE fuel ROB
  bfScale: number; // 0-12 Beaufort
  seaState: number; // 0-9
  swell: number; // meters
  windDir: string;
  currentDir: string;
  currentSpeed: number;
  weatherCondition: 'good' | 'moderate' | 'bad';
  status: 'sailing' | 'anchored' | 'port' | 'canal' | 'drifting';
  notes: string;
}

interface VoyageData {
  // Setup
  vesselName: string;
  imo: string;
  voyageNo: string;
  vesselType: string;
  portFrom: string;
  portTo: string;
  etd: string;
  etaOriginal: string;
  totalDistance: number;
  cargo: string;
  cargoQty: number;
  ladenOrBallast: 'laden' | 'ballast';

  // CP
  cpSpeed: number;
  cpMe: number;
  cpAe: number;
  cpFuelType: string;
  weatherCriteriaBf: number;
  weatherCriteriaSs: number;

  // Bunker
  robInitialMe: number;
  robInitialAe: number;
  bunkerPriceMe: number;
  bunkerPriceAe: number;

  // Reports
  reports: NoonReport[];

  notes: string;
}

const DEFAULT_DATA: VoyageData = {
  vesselName: '',
  imo: '',
  voyageNo: '',
  vesselType: 'Bulk Carrier',
  portFrom: '',
  portTo: '',
  etd: '',
  etaOriginal: '',
  totalDistance: 0,
  cargo: '',
  cargoQty: 0,
  ladenOrBallast: 'laden',
  cpSpeed: 12.5,
  cpMe: 28,
  cpAe: 2.5,
  cpFuelType: 'VLSFO',
  weatherCriteriaBf: 4,
  weatherCriteriaSs: 3,
  robInitialMe: 0,
  robInitialAe: 0,
  bunkerPriceMe: 580,
  bunkerPriceAe: 720,
  reports: [],
  notes: '',
};

// ============================================================
// CALCULATIONS
// ============================================================
function calculate(d: VoyageData) {
  const sorted = [...d.reports].sort((a, b) => `${a.date}T${a.time || '12:00'}`.localeCompare(`${b.date}T${b.time || '12:00'}`));

  const reportCount = sorted.length;
  const totalDistanceRun = sorted.reduce((s, r) => s + (r.distanceRun || 0), 0);

  // Voyage days from reports
  let voyageDays = 0;
  if (sorted.length >= 2) {
    const first = new Date(`${sorted[0].date}T${sorted[0].time || '12:00'}`);
    const last = new Date(`${sorted[sorted.length - 1].date}T${sorted[sorted.length - 1].time || '12:00'}`);
    voyageDays = (last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24);
  }

  // Average speed across all reports
  const avgSpeedAll = sorted.length > 0 ? sorted.reduce((s, r) => s + (r.avgSpeed || 0), 0) / sorted.length : 0;

  // Average ME/AE consumption
  const avgMe = sorted.length > 0 ? sorted.reduce((s, r) => s + (r.meCons || 0), 0) / sorted.length : 0;
  const avgAe = sorted.length > 0 ? sorted.reduce((s, r) => s + (r.aeCons || 0), 0) / sorted.length : 0;

  // Total fuel consumed (sum of daily × 1 day assumption, or actual day-to-day)
  let totalMeConsumed = 0;
  let totalAeConsumed = 0;
  for (const r of sorted) {
    totalMeConsumed += r.meCons || 0;
    totalAeConsumed += r.aeCons || 0;
  }

  // Current ROB (last report)
  const lastRob = sorted.length > 0 ? sorted[sorted.length - 1].rob : d.robInitialMe;
  const lastRobAe = sorted.length > 0 ? sorted[sorted.length - 1].robAe : d.robInitialAe;

  // Weather analysis
  const goodWeatherReports = sorted.filter((r) => r.weatherCondition === 'good').length;
  const moderateWeatherReports = sorted.filter((r) => r.weatherCondition === 'moderate').length;
  const badWeatherReports = sorted.filter((r) => r.weatherCondition === 'bad').length;

  // Days in good weather (approximate — 1 day per report)
  const goodWeatherDays = goodWeatherReports;
  const badWeatherDays = badWeatherReports + moderateWeatherReports * 0.5;

  // Performance metrics
  const speedVsCP = d.cpSpeed > 0 ? ((avgSpeedAll - d.cpSpeed) / d.cpSpeed) * 100 : 0;
  const meVsCP = d.cpMe > 0 ? ((avgMe - d.cpMe) / d.cpMe) * 100 : 0;

  // Distance remaining
  const distanceRemaining = Math.max(0, d.totalDistance - totalDistanceRun);
  const distanceCompletePct = d.totalDistance > 0 ? (totalDistanceRun / d.totalDistance) * 100 : 0;

  // Predicted ETA (based on avg speed)
  let predictedEtaText = '—';
  let predictedEtaIso = '';
  if (distanceRemaining > 0 && avgSpeedAll > 0 && sorted.length > 0) {
    const remainingHours = distanceRemaining / avgSpeedAll;
    const lastReport = sorted[sorted.length - 1];
    const lastDt = new Date(`${lastReport.date}T${lastReport.time || '12:00'}`);
    const predicted = new Date(lastDt.getTime() + remainingHours * 60 * 60 * 1000);
    predictedEtaIso = predicted.toISOString();
    predictedEtaText = predicted.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
  }

  // Bunker cost so far
  const bunkerCostMe = totalMeConsumed * d.bunkerPriceMe;
  const bunkerCostAe = totalAeConsumed * d.bunkerPriceAe;
  const totalBunkerCost = bunkerCostMe + bunkerCostAe;

  // Estimated remaining bunker need
  let estRemainingFuel = 0;
  if (distanceRemaining > 0 && avgSpeedAll > 0 && avgMe > 0) {
    const remainingDays = distanceRemaining / (avgSpeedAll * 24);
    estRemainingFuel = remainingDays * avgMe;
  }
  const fuelSufficient = estRemainingFuel < lastRob;

  return {
    sorted,
    reportCount,
    totalDistanceRun,
    voyageDays,
    avgSpeedAll,
    avgMe,
    avgAe,
    totalMeConsumed,
    totalAeConsumed,
    lastRob,
    lastRobAe,
    goodWeatherReports,
    badWeatherReports,
    moderateWeatherReports,
    goodWeatherDays,
    badWeatherDays,
    speedVsCP,
    meVsCP,
    distanceRemaining,
    distanceCompletePct,
    predictedEtaText,
    predictedEtaIso,
    bunkerCostMe,
    bunkerCostAe,
    totalBunkerCost,
    estRemainingFuel,
    fuelSufficient,
  };
}

// Helpers
function fmt(n: number, dec = 2): string {
  if (!isFinite(n)) return '–';
  return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function fmtMoney(n: number): string {
  if (!isFinite(n)) return '$0';
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

// ============================================================
// STYLES
// ============================================================
const card: React.CSSProperties = {
  background: '#111c13',
  border: '1px solid rgba(200,168,75,.18)',
  padding: '20px 18px',
  borderRadius: 4,
  marginBottom: 16,
};
const sectionTitle: React.CSSProperties = {
  fontFamily: rj,
  fontSize: 11,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: '#c8a84b',
  fontWeight: 700,
  marginBottom: 14,
  paddingBottom: 8,
  borderBottom: '1px solid rgba(200,168,75,.12)',
};
const label: React.CSSProperties = {
  display: 'block',
  fontFamily: rj,
  fontSize: 10.5,
  letterSpacing: '.5px',
  textTransform: 'uppercase',
  color: '#7a8a72',
  fontWeight: 600,
  marginBottom: 5,
};
const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0c1610',
  border: '1px solid rgba(200,168,75,.2)',
  color: '#f5f0e8',
  padding: '8px 10px',
  fontFamily: rj,
  fontSize: 13,
  fontWeight: 500,
  borderRadius: 3,
};
const ghostBtn: React.CSSProperties = {
  background: 'transparent',
  color: '#c8a84b',
  border: '1px solid rgba(200,168,75,.4)',
  padding: '8px 14px',
  fontFamily: rj,
  fontSize: 11,
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  fontWeight: 700,
  cursor: 'pointer',
  borderRadius: 4,
};

// ============================================================
// COMPONENT
// ============================================================
export default function VoyageTrackerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingId = searchParams.get('id');

  const [data, setData] = useState<VoyageData>(DEFAULT_DATA);
  const [recordId, setRecordId] = useState<string | null>(existingId);
  const [recordName, setRecordName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [tab, setTab] = useState<'setup' | 'reports' | 'analysis'>('setup');

  useEffect(() => {
    if (existingId) {
      const saved = loadItem<VoyageData>('tracker', existingId);
      if (saved) {
        setData(saved.data);
        setRecordName(saved.name);
        if (saved.data.reports.length > 0) setTab('reports');
      }
    }
  }, [existingId]);

  const calc = useMemo(() => calculate(data), [data]);

  function update<K extends keyof VoyageData>(key: K, value: VoyageData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function addReport() {
    const last = data.reports[data.reports.length - 1];
    const newR: NoonReport = {
      id: genId(),
      date: '',
      time: '12:00',
      lat: 0,
      lon: 0,
      latDir: 'N',
      lonDir: 'E',
      distanceRun: 0,
      avgSpeed: 0,
      meCons: data.cpMe,
      aeCons: data.cpAe,
      rob: last?.rob || data.robInitialMe,
      robAe: last?.robAe || data.robInitialAe,
      bfScale: 0,
      seaState: 0,
      swell: 0,
      windDir: '',
      currentDir: '',
      currentSpeed: 0,
      weatherCondition: 'good',
      status: 'sailing',
      notes: '',
    };
    update('reports', [...data.reports, newR]);
  }

  function updateReport(id: string, updates: Partial<NoonReport>) {
    update(
      'reports',
      data.reports.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  }

  function deleteReport(id: string) {
    if (!confirm('Delete this noon report?')) return;
    update('reports', data.reports.filter((r) => r.id !== id));
  }

  function handleSave() {
    const name = recordName.trim() || `${data.vesselName || 'Vessel'} — ${data.portFrom || '?'}→${data.portTo || '?'}`;
    const id = recordId || genId();
    saveItem('tracker', name, data, id);
    setRecordId(id);
    setRecordName(name);
    setSaveMsg('✓ Saved');
    setShowSave(false);
    setTimeout(() => setSaveMsg(''), 3000);
  }

  function handleReset() {
    if (!confirm('Reset entire voyage? All reports will be deleted.')) return;
    setData(DEFAULT_DATA);
    setRecordId(null);
    setRecordName('');
    router.replace('/voyage/tracker');
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>
          📈 Voyage Hub · Voyage Tracker
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Voyage <em style={g}>Performance</em> Tracker
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          Set up your voyage, add daily noon reports, and get automatic performance analysis vs
          Charter Party warranties. Predicted ETA updates with each report.
        </p>
      </div>

      {/* Action Bar */}
      <div className="action-bar" style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => setShowSave(true)} style={{ background: '#c8a84b', color: '#08100a', border: 'none', padding: '8px 16px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 }}>
          💾 Save
        </button>
        <button onClick={handlePrint} style={ghostBtn}>🖨️ Print / PDF</button>
        <button onClick={handleReset} style={{ ...ghostBtn, color: '#ff8a8a', borderColor: 'rgba(255,138,138,.3)' }}>🗑️ Reset</button>
        {saveMsg && <span style={{ color: '#4caf76', fontFamily: rj, fontSize: 12, fontWeight: 600 }}>{saveMsg}</span>}
        {recordName && <span style={{ color: '#7a8a72', fontFamily: rj, fontSize: 11, marginLeft: 'auto' }}>📂 {recordName}</span>}
      </div>

      {/* Save Dialog */}
      {showSave && (
        <div style={{ ...card, background: 'rgba(200,168,75,.05)', borderColor: 'rgba(200,168,75,.4)' }}>
          <label style={label}>Name</label>
          <input
            type="text"
            value={recordName}
            onChange={(e) => setRecordName(e.target.value)}
            placeholder="e.g. MV NEURONAI — Tubarão→Qingdao Jan 2026"
            style={{ ...inputStyle, marginBottom: 10 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{ background: '#c8a84b', color: '#08100a', border: 'none', padding: '8px 14px', fontFamily: rj, fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 3 }}>
              Save
            </button>
            <button onClick={() => setShowSave(false)} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* Tab Selector */}
      <div className="vt-tabs" style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
        {[
          { key: 'setup' as const, label: '⚙️ Voyage Setup', icon: '⚙️' },
          { key: 'reports' as const, label: `📝 Noon Reports (${data.reports.length})`, icon: '📝' },
          { key: 'analysis' as const, label: '📊 Analysis', icon: '📊' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              background: tab === t.key ? '#c8a84b' : 'transparent',
              color: tab === t.key ? '#08100a' : '#7a8a72',
              border: `1px solid ${tab === t.key ? '#c8a84b' : 'rgba(200,168,75,.25)'}`,
              padding: '9px 16px',
              fontFamily: rj,
              fontSize: 12,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              fontWeight: 700,
              cursor: 'pointer',
              borderRadius: 3,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ====== SETUP TAB ====== */}
      {tab === 'setup' && (
        <>
          {/* 1. Voyage Info */}
          <div style={card}>
            <div style={sectionTitle}>1. Voyage Information</div>
            <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              <div>
                <label style={label}>Vessel Name</label>
                <input style={inputStyle} type="text" value={data.vesselName} onChange={(e) => update('vesselName', e.target.value)} placeholder="MV NEURONAI" />
              </div>
              <div>
                <label style={label}>IMO Number</label>
                <input style={inputStyle} type="text" value={data.imo} onChange={(e) => update('imo', e.target.value)} placeholder="9876543" />
              </div>
              <div>
                <label style={label}>Voyage No.</label>
                <input style={inputStyle} type="text" value={data.voyageNo} onChange={(e) => update('voyageNo', e.target.value)} placeholder="V-2026-005" />
              </div>
            </div>
            <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 12 }}>
              <div>
                <label style={label}>From Port</label>
                <input style={inputStyle} type="text" value={data.portFrom} onChange={(e) => update('portFrom', e.target.value)} placeholder="Tubarão" />
              </div>
              <div>
                <label style={label}>To Port</label>
                <input style={inputStyle} type="text" value={data.portTo} onChange={(e) => update('portTo', e.target.value)} placeholder="Qingdao" />
              </div>
              <div>
                <label style={label}>Total Distance — nm</label>
                <input style={inputStyle} type="number" step="1" value={data.totalDistance || ''} onChange={(e) => update('totalDistance', parseFloat(e.target.value) || 0)} placeholder="11500" />
              </div>
            </div>
            <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 12 }}>
              <div>
                <label style={label}>ETD (Sailed)</label>
                <input style={inputStyle} type="datetime-local" value={data.etd} onChange={(e) => update('etd', e.target.value)} />
              </div>
              <div>
                <label style={label}>Original ETA</label>
                <input style={inputStyle} type="datetime-local" value={data.etaOriginal} onChange={(e) => update('etaOriginal', e.target.value)} />
              </div>
              <div>
                <label style={label}>Vessel Type</label>
                <select style={inputStyle} value={data.vesselType} onChange={(e) => update('vesselType', e.target.value)}>
                  <option>Bulk Carrier</option>
                  <option>Container Ship</option>
                  <option>Tanker (Oil)</option>
                  <option>Tanker (Product)</option>
                  <option>Tanker (LNG)</option>
                  <option>General Cargo</option>
                  <option>RoRo</option>
                </select>
              </div>
            </div>
            <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 12 }}>
              <div>
                <label style={label}>Cargo Type</label>
                <input style={inputStyle} type="text" value={data.cargo} onChange={(e) => update('cargo', e.target.value)} placeholder="Iron Ore" />
              </div>
              <div>
                <label style={label}>Cargo Quantity — MT</label>
                <input style={inputStyle} type="number" step="100" value={data.cargoQty || ''} onChange={(e) => update('cargoQty', parseFloat(e.target.value) || 0)} placeholder="170000" />
              </div>
              <div>
                <label style={label}>Condition</label>
                <select style={inputStyle} value={data.ladenOrBallast} onChange={(e) => update('ladenOrBallast', e.target.value as 'laden' | 'ballast')}>
                  <option value="laden">Laden</option>
                  <option value="ballast">Ballast</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. CP Terms */}
          <div style={card}>
            <div style={sectionTitle}>2. Charter Party Warranties</div>
            <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              <div>
                <label style={label}>CP Speed — kts</label>
                <input style={inputStyle} type="number" step="0.1" value={data.cpSpeed || ''} onChange={(e) => update('cpSpeed', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <label style={label}>CP ME Cons. — MT/day</label>
                <input style={inputStyle} type="number" step="0.1" value={data.cpMe || ''} onChange={(e) => update('cpMe', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <label style={label}>CP AE Cons. — MT/day</label>
                <input style={inputStyle} type="number" step="0.1" value={data.cpAe || ''} onChange={(e) => update('cpAe', parseFloat(e.target.value) || 0)} />
              </div>
            </div>
            <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 12 }}>
              <div>
                <label style={label}>Main Fuel Type</label>
                <select style={inputStyle} value={data.cpFuelType} onChange={(e) => update('cpFuelType', e.target.value)}>
                  <option>VLSFO</option>
                  <option>HFO</option>
                  <option>ULSFO</option>
                  <option>LSMGO</option>
                  <option>MGO</option>
                  <option>LNG</option>
                </select>
              </div>
              <div>
                <label style={label}>Weather Criteria — BF</label>
                <input style={inputStyle} type="number" step="1" value={data.weatherCriteriaBf || ''} onChange={(e) => update('weatherCriteriaBf', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <label style={label}>Weather Criteria — Sea State</label>
                <input style={inputStyle} type="number" step="1" value={data.weatherCriteriaSs || ''} onChange={(e) => update('weatherCriteriaSs', parseFloat(e.target.value) || 0)} />
              </div>
            </div>
          </div>

          {/* 3. ROB Initial */}
          <div style={card}>
            <div style={sectionTitle}>3. Initial Bunker ROB</div>
            <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
              <div>
                <label style={label}>ROB Main Fuel — MT</label>
                <input style={inputStyle} type="number" step="0.1" value={data.robInitialMe || ''} onChange={(e) => update('robInitialMe', parseFloat(e.target.value) || 0)} placeholder="850" />
              </div>
              <div>
                <label style={label}>ROB AE/MGO — MT</label>
                <input style={inputStyle} type="number" step="0.1" value={data.robInitialAe || ''} onChange={(e) => update('robInitialAe', parseFloat(e.target.value) || 0)} placeholder="120" />
              </div>
            </div>
            <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginTop: 12 }}>
              <div>
                <label style={label}>{data.cpFuelType} Price — $/MT</label>
                <input style={inputStyle} type="number" step="1" value={data.bunkerPriceMe || ''} onChange={(e) => update('bunkerPriceMe', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <label style={label}>AE/MGO Price — $/MT</label>
                <input style={inputStyle} type="number" step="1" value={data.bunkerPriceAe || ''} onChange={(e) => update('bunkerPriceAe', parseFloat(e.target.value) || 0)} />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div style={card}>
            <div style={sectionTitle}>4. Voyage Notes</div>
            <textarea
              value={data.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="Any special instructions, charter terms, etc."
              rows={3}
              style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }}
            />
          </div>

          {/* Continue */}
          {data.vesselName && data.portFrom && data.portTo && (
            <div style={{ ...card, background: 'linear-gradient(135deg,rgba(200,168,75,.08),transparent)', borderColor: 'rgba(200,168,75,.4)' }}>
              <div style={sectionTitle}>✅ Setup Complete</div>
              <p style={{ fontSize: 12, color: '#b0c0a4', marginBottom: 12 }}>
                Ready to start logging daily noon reports.
              </p>
              <button
                onClick={() => setTab('reports')}
                style={{
                  background: '#c8a84b',
                  color: '#08100a',
                  border: 'none',
                  padding: '10px 22px',
                  fontFamily: rj,
                  fontSize: 12,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  cursor: 'pointer',
                  borderRadius: 4,
                }}
              >
                📝 Add Noon Reports →
              </button>
            </div>
          )}
        </>
      )}

      {/* ====== REPORTS TAB ====== */}
      {tab === 'reports' && (
        <>
          {/* Add Report Button */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontFamily: lb, fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                  Noon Reports ({data.reports.length})
                </h3>
                <p style={{ fontSize: 12, color: '#7a8a72' }}>
                  Add daily reports as voyage progresses. Each report updates the analysis.
                </p>
              </div>
              <button
                onClick={addReport}
                style={{
                  background: '#c8a84b',
                  color: '#08100a',
                  border: 'none',
                  padding: '10px 18px',
                  fontFamily: rj,
                  fontSize: 11,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  cursor: 'pointer',
                  borderRadius: 4,
                }}
              >
                + Add Noon Report
              </button>
            </div>

            {data.reports.length > 0 && (
              <div
                style={{
                  marginTop: 14,
                  padding: '10px 12px',
                  background: 'rgba(200,168,75,.05)',
                  border: '1px solid rgba(200,168,75,.15)',
                  borderRadius: 3,
                  fontSize: 12,
                  fontFamily: rj,
                  color: '#b0c0a4',
                }}
              >
                ⏱️ Days: <strong style={{ color: '#f5f0e8' }}>{fmt(calc.voyageDays, 1)}</strong>
                {' · '}📏 Distance: <strong style={{ color: '#f5f0e8' }}>{fmt(calc.totalDistanceRun, 0)} nm</strong>
                {' · '}⚡ Avg Speed: <strong style={{ color: '#f5f0e8' }}>{fmt(calc.avgSpeedAll, 2)} kts</strong>
                {' · '}⛽ ROB: <strong style={{ color: '#f5f0e8' }}>{fmt(calc.lastRob, 1)} MT</strong>
              </div>
            )}
          </div>

          {/* Reports List */}
          {data.reports.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#7a8a72', border: '1px dashed rgba(200,168,75,.2)', borderRadius: 4 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📝</div>
              <h3 style={{ fontFamily: lb, fontSize: 16, fontWeight: 700, marginBottom: 6, color: '#f5f0e8' }}>
                No noon reports yet
              </h3>
              <p style={{ fontSize: 12 }}>Click <strong style={{ color: '#c8a84b' }}>+ Add Noon Report</strong> to start tracking.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[...data.reports]
                .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
                .map((r, idx) => (
                  <ReportCard
                    key={r.id}
                    report={r}
                    index={idx + 1}
                    cpSpeed={data.cpSpeed}
                    cpMe={data.cpMe}
                    onUpdate={(updates) => updateReport(r.id, updates)}
                    onDelete={() => deleteReport(r.id)}
                  />
                ))}
            </div>
          )}
        </>
      )}

      {/* ====== ANALYSIS TAB ====== */}
      {tab === 'analysis' && (
        <AnalysisView data={data} calc={calc} />
      )}

      <style>{`
        @media (max-width: 720px) {
          .g3 { grid-template-columns: 1fr !important; }
          .action-bar button { font-size: 10px !important; padding: 7px 10px !important; }
          .vt-tabs button { font-size: 10.5px !important; padding: 8px 12px !important; }
          .report-grid { grid-template-columns: 1fr !important; }
        }
        @media print {
          @page { size: A4; margin: 14mm; }
          body { background: white !important; color: black !important; }
          nav, footer, .action-bar, .vt-tabs, [style*="position: sticky"] { display: none !important; }
        }
      `}</style>
    </div>
  );
}

// ============================================================
// REPORT CARD
// ============================================================
function ReportCard({
  report,
  index,
  cpSpeed,
  cpMe,
  onUpdate,
  onDelete,
}: {
  report: NoonReport;
  index: number;
  cpSpeed: number;
  cpMe: number;
  onUpdate: (updates: Partial<NoonReport>) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  const speedColor = report.avgSpeed > 0
    ? (report.avgSpeed >= cpSpeed * 0.95 ? '#4caf76' : '#ff8a8a')
    : '#7a8a72';
  const meColor = report.meCons > 0
    ? (report.meCons <= cpMe * 1.05 ? '#4caf76' : '#ff8a8a')
    : '#7a8a72';

  return (
    <div
      style={{
        background: '#111c13',
        border: '1px solid rgba(200,168,75,.18)',
        borderRadius: 4,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '12px 16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          background: 'rgba(0,0,0,.2)',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            background: 'rgba(200,168,75,.15)',
            color: '#c8a84b',
            padding: '4px 12px',
            borderRadius: 3,
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: 14,
            minWidth: 40,
            textAlign: 'center',
          }}
        >
          #{index}
        </div>
        <div style={{ flex: 1, minWidth: 100 }}>
          <div style={{ fontFamily: rj, fontSize: 12.5, color: '#f5f0e8', fontWeight: 600 }}>
            {report.date || 'No date set'} {report.time && `· ${report.time} UTC`}
          </div>
          <div style={{ fontSize: 10.5, color: '#7a8a72', marginTop: 2 }}>
            {report.status?.toUpperCase()} · {report.weatherCondition?.toUpperCase()} weather
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, fontSize: 11, fontFamily: rj }}>
          <div>
            <span style={{ color: '#7a8a72' }}>Speed</span>{' '}
            <strong style={{ color: speedColor }}>{fmt(report.avgSpeed, 1)} kts</strong>
          </div>
          <div>
            <span style={{ color: '#7a8a72' }}>ME</span>{' '}
            <strong style={{ color: meColor }}>{fmt(report.meCons, 1)}</strong>
          </div>
          <div>
            <span style={{ color: '#7a8a72' }}>ROB</span>{' '}
            <strong style={{ color: '#f5f0e8' }}>{fmt(report.rob, 0)}</strong>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,138,138,.3)',
            color: '#ff8a8a',
            padding: '4px 10px',
            fontFamily: rj,
            fontSize: 10,
            cursor: 'pointer',
            borderRadius: 3,
          }}
        >
          ✕
        </button>
        <span style={{ color: '#7a8a72', fontSize: 14 }}>{expanded ? '▾' : '▸'}</span>
      </div>

      {/* Detail */}
      {expanded && (
        <div style={{ padding: '16px 16px 12px' }}>
          {/* Row 1: Date / Time / Status */}
          <div className="report-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            <div>
              <label style={label}>Date</label>
              <input type="date" value={report.date} onChange={(e) => onUpdate({ date: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={label}>Time (UTC)</label>
              <input type="time" value={report.time} onChange={(e) => onUpdate({ time: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={label}>Status</label>
              <select value={report.status} onChange={(e) => onUpdate({ status: e.target.value as NoonReport['status'] })} style={inputStyle}>
                <option value="sailing">Sailing</option>
                <option value="anchored">Anchored</option>
                <option value="drifting">Drifting</option>
                <option value="canal">Canal Transit</option>
                <option value="port">In Port</option>
              </select>
            </div>
            <div>
              <label style={label}>Weather</label>
              <select value={report.weatherCondition} onChange={(e) => onUpdate({ weatherCondition: e.target.value as 'good' | 'moderate' | 'bad' })} style={inputStyle}>
                <option value="good">✓ Good (CP)</option>
                <option value="moderate">~ Moderate</option>
                <option value="bad">✗ Bad</option>
              </select>
            </div>
          </div>

          {/* Row 2: Position */}
          <div className="report-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginTop: 10 }}>
            <div>
              <label style={label}>Latitude</label>
              <div style={{ display: 'flex', gap: 4 }}>
                <input type="number" step="0.0001" value={report.lat || ''} onChange={(e) => onUpdate({ lat: parseFloat(e.target.value) || 0 })} style={inputStyle} placeholder="0.0000" />
                <select value={report.latDir} onChange={(e) => onUpdate({ latDir: e.target.value as 'N' | 'S' })} style={{ ...inputStyle, width: 50 }}>
                  <option value="N">N</option>
                  <option value="S">S</option>
                </select>
              </div>
            </div>
            <div>
              <label style={label}>Longitude</label>
              <div style={{ display: 'flex', gap: 4 }}>
                <input type="number" step="0.0001" value={report.lon || ''} onChange={(e) => onUpdate({ lon: parseFloat(e.target.value) || 0 })} style={inputStyle} placeholder="0.0000" />
                <select value={report.lonDir} onChange={(e) => onUpdate({ lonDir: e.target.value as 'E' | 'W' })} style={{ ...inputStyle, width: 50 }}>
                  <option value="E">E</option>
                  <option value="W">W</option>
                </select>
              </div>
            </div>
            <div>
              <label style={label}>Distance Run (24h) — nm</label>
              <input type="number" step="1" value={report.distanceRun || ''} onChange={(e) => onUpdate({ distanceRun: parseFloat(e.target.value) || 0 })} style={inputStyle} placeholder="288" />
            </div>
            <div>
              <label style={label}>Avg Speed — kts</label>
              <input type="number" step="0.01" value={report.avgSpeed || ''} onChange={(e) => onUpdate({ avgSpeed: parseFloat(e.target.value) || 0 })} style={inputStyle} placeholder="12.0" />
            </div>
          </div>

          {/* Row 3: Consumption */}
          <div className="report-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginTop: 10 }}>
            <div>
              <label style={label}>ME Cons. — MT/day</label>
              <input type="number" step="0.1" value={report.meCons || ''} onChange={(e) => onUpdate({ meCons: parseFloat(e.target.value) || 0 })} style={inputStyle} />
            </div>
            <div>
              <label style={label}>AE Cons. — MT/day</label>
              <input type="number" step="0.1" value={report.aeCons || ''} onChange={(e) => onUpdate({ aeCons: parseFloat(e.target.value) || 0 })} style={inputStyle} />
            </div>
            <div>
              <label style={label}>ROB Main — MT</label>
              <input type="number" step="0.1" value={report.rob || ''} onChange={(e) => onUpdate({ rob: parseFloat(e.target.value) || 0 })} style={inputStyle} />
            </div>
            <div>
              <label style={label}>ROB AE — MT</label>
              <input type="number" step="0.1" value={report.robAe || ''} onChange={(e) => onUpdate({ robAe: parseFloat(e.target.value) || 0 })} style={inputStyle} />
            </div>
          </div>

          {/* Row 4: Weather */}
          <div className="report-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginTop: 10 }}>
            <div>
              <label style={label}>Beaufort Scale (0–12)</label>
              <input type="number" min="0" max="12" step="1" value={report.bfScale || ''} onChange={(e) => onUpdate({ bfScale: parseFloat(e.target.value) || 0 })} style={inputStyle} />
            </div>
            <div>
              <label style={label}>Sea State (0–9)</label>
              <input type="number" min="0" max="9" step="1" value={report.seaState || ''} onChange={(e) => onUpdate({ seaState: parseFloat(e.target.value) || 0 })} style={inputStyle} />
            </div>
            <div>
              <label style={label}>Swell — m</label>
              <input type="number" step="0.1" value={report.swell || ''} onChange={(e) => onUpdate({ swell: parseFloat(e.target.value) || 0 })} style={inputStyle} />
            </div>
            <div>
              <label style={label}>Wind Direction</label>
              <input type="text" value={report.windDir} onChange={(e) => onUpdate({ windDir: e.target.value })} placeholder="NE" style={inputStyle} />
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginTop: 10 }}>
            <label style={label}>Notes</label>
            <textarea
              value={report.notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="Any remarks for this 24h period..."
              rows={2}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 50 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ANALYSIS VIEW
// ============================================================
function AnalysisView({ data, calc }: { data: VoyageData; calc: ReturnType<typeof calculate> }) {
  if (data.reports.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', border: '1px dashed rgba(200,168,75,.2)', borderRadius: 4, color: '#7a8a72' }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>📊</div>
        <h3 style={{ fontFamily: lb, fontSize: 16, fontWeight: 700, marginBottom: 6, color: '#f5f0e8' }}>
          No analysis available yet
        </h3>
        <p style={{ fontSize: 12 }}>Add at least one noon report to see analysis.</p>
      </div>
    );
  }

  const reportRow: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px dashed rgba(200,168,75,.1)',
    fontFamily: rj,
    fontSize: 13,
  };

  return (
    <div>
      {/* Voyage Header */}
      <div style={{ ...card, background: 'linear-gradient(135deg,rgba(200,168,75,.08),transparent)', borderColor: '#c8a84b', textAlign: 'center', padding: '24px 20px' }}>
        <div style={{ fontFamily: rj, fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 10 }}>
          📈 Voyage Performance Analysis
        </div>
        <h2 style={{ fontFamily: lb, fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{data.vesselName || 'Vessel'}</h2>
        <div style={{ fontSize: 13, color: '#b0c0a4', marginBottom: 4 }}>
          {data.portFrom} → {data.portTo} · {data.cargo || '—'}
        </div>
        <div style={{ fontSize: 11, color: '#7a8a72', fontFamily: rj }}>
          {data.voyageNo} · {data.vesselType} · {data.ladenOrBallast.toUpperCase()}
        </div>
      </div>

      {/* Progress */}
      <div style={card}>
        <div style={sectionTitle}>🗺️ Voyage Progress</div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: rj, fontSize: 11, color: '#b0c0a4', marginBottom: 6 }}>
            <span>{fmt(calc.totalDistanceRun, 0)} nm completed</span>
            <span>{fmt(calc.distanceRemaining, 0)} nm to go</span>
          </div>
          <div style={{ height: 14, background: '#0c1610', border: '1px solid rgba(200,168,75,.2)', borderRadius: 7, overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min(100, calc.distanceCompletePct)}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #4caf76, #c8a84b)',
                transition: 'width .3s ease',
              }}
            />
          </div>
          <div style={{ textAlign: 'center', fontFamily: rj, fontSize: 12, color: '#c8a84b', fontWeight: 700, marginTop: 8, letterSpacing: '.5px' }}>
            {fmt(calc.distanceCompletePct, 1)}% Complete
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px,1fr))', gap: 14 }}>
          <KpiBox label="Reports" value={fmt(calc.reportCount, 0)} color="#f5f0e8" sub="noon reports" />
          <KpiBox label="Voyage Days" value={fmt(calc.voyageDays, 1)} color="#f5f0e8" sub="elapsed" />
          <KpiBox label="Avg Speed" value={fmt(calc.avgSpeedAll, 2) + ' kts'} color={calc.avgSpeedAll >= data.cpSpeed * 0.95 ? '#4caf76' : '#ff8a8a'} sub={calc.speedVsCP >= 0 ? `+${fmt(calc.speedVsCP, 1)}%` : `${fmt(calc.speedVsCP, 1)}%`} />
          <KpiBox label="Predicted ETA" value={calc.predictedEtaText} color="#c8a84b" sub="based on avg speed" />
        </div>
      </div>

      {/* Performance vs CP */}
      <div style={card}>
        <div style={sectionTitle}>⚡ Performance vs Charter Party</div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>CP Speed</span>
          <strong>{fmt(data.cpSpeed, 2)} kts</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Actual Avg Speed</span>
          <strong style={{ color: calc.avgSpeedAll >= data.cpSpeed * 0.95 ? '#4caf76' : '#ff8a8a' }}>
            {fmt(calc.avgSpeedAll, 2)} kts ({calc.speedVsCP > 0 ? '+' : ''}{fmt(calc.speedVsCP, 1)}%)
          </strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>CP ME Consumption</span>
          <strong>{fmt(data.cpMe, 2)} MT/day</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Actual Avg ME Consumption</span>
          <strong style={{ color: calc.avgMe <= data.cpMe * 1.05 ? '#4caf76' : '#ff8a8a' }}>
            {fmt(calc.avgMe, 2)} MT/day ({calc.meVsCP > 0 ? '+' : ''}{fmt(calc.meVsCP, 1)}%)
          </strong>
        </div>
        <div style={{ ...reportRow, borderBottom: 'none' }}>
          <span style={{ color: '#7a8a72' }}>Actual Avg AE Consumption</span>
          <strong>{fmt(calc.avgAe, 2)} MT/day</strong>
        </div>
      </div>

      {/* Weather */}
      <div style={card}>
        <div style={sectionTitle}>🌊 Weather Analysis</div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Good Weather Reports</span>
          <strong style={{ color: '#4caf76' }}>{calc.goodWeatherReports} reports</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Moderate Weather Reports</span>
          <strong style={{ color: '#e89c5a' }}>{calc.moderateWeatherReports} reports</strong>
        </div>
        <div style={{ ...reportRow, borderBottom: 'none' }}>
          <span style={{ color: '#7a8a72' }}>Bad Weather Reports</span>
          <strong style={{ color: '#ff8a8a' }}>{calc.badWeatherReports} reports</strong>
        </div>
      </div>

      {/* Bunker */}
      <div style={card}>
        <div style={sectionTitle}>⛽ Bunker Status</div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Total {data.cpFuelType} Consumed</span>
          <strong>{fmt(calc.totalMeConsumed, 1)} MT</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Total AE/MGO Consumed</span>
          <strong>{fmt(calc.totalAeConsumed, 1)} MT</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Bunker Cost (so far)</span>
          <strong>{fmtMoney(calc.totalBunkerCost)}</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Current ROB {data.cpFuelType}</span>
          <strong style={{ color: calc.fuelSufficient ? '#4caf76' : '#ff8a8a' }}>{fmt(calc.lastRob, 1)} MT</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Current ROB AE</span>
          <strong>{fmt(calc.lastRobAe, 1)} MT</strong>
        </div>
        <div style={{ ...reportRow, borderBottom: 'none' }}>
          <span style={{ color: '#7a8a72' }}>Estimated Fuel Needed (Remaining)</span>
          <strong style={{ color: calc.fuelSufficient ? '#4caf76' : '#ff8a8a' }}>
            {fmt(calc.estRemainingFuel, 1)} MT {calc.fuelSufficient ? '✓ Sufficient' : '⚠ Short!'}
          </strong>
        </div>
      </div>

      {/* Reports table */}
      <div style={card}>
        <div style={sectionTitle}>📋 All Reports (Chronological)</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: rj, fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(200,168,75,.3)' }}>
                <th style={th}>Date</th>
                <th style={th}>Position</th>
                <th style={th}>Dist 24h</th>
                <th style={th}>Speed</th>
                <th style={th}>ME</th>
                <th style={th}>ROB</th>
                <th style={th}>WX</th>
                <th style={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {calc.sorted.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid rgba(200,168,75,.08)' }}>
                  <td style={td}>{r.date} {r.time}</td>
                  <td style={td}>
                    {r.lat ? `${fmt(r.lat, 2)}°${r.latDir}` : '—'} {r.lon ? `${fmt(r.lon, 2)}°${r.lonDir}` : ''}
                  </td>
                  <td style={td}>{fmt(r.distanceRun, 0)}</td>
                  <td style={td}>{fmt(r.avgSpeed, 1)}</td>
                  <td style={td}>{fmt(r.meCons, 1)}</td>
                  <td style={td}>{fmt(r.rob, 0)}</td>
                  <td style={td}>
                    {r.weatherCondition === 'good' && '✓'}
                    {r.weatherCondition === 'moderate' && '~'}
                    {r.weatherCondition === 'bad' && '✗'} BF{r.bfScale}
                  </td>
                  <td style={{ ...td, fontSize: 10 }}>{r.status?.toUpperCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 20, padding: '14px 16px', background: 'rgba(200,168,75,.04)', border: '1px solid rgba(200,168,75,.12)', borderRadius: 4, textAlign: 'center', fontFamily: rj, fontSize: 11, color: '#7a8a72' }}>
        Generated by PortServiceFinder Voyage Hub · portservicefinder.com/voyage
      </div>
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================
const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 6px',
  fontSize: 10,
  letterSpacing: '.5px',
  textTransform: 'uppercase',
  color: '#c8a84b',
  fontWeight: 700,
};
const td: React.CSSProperties = {
  padding: '8px 6px',
  color: '#b0c0a4',
};

function KpiBox({ label, value, color, sub }: { label: string; value: string; color: string; sub?: string }) {
  return (
    <div style={{ background: '#0c1610', padding: '12px 14px', border: '1px solid rgba(200,168,75,.15)', borderRadius: 3 }}>
      <div style={{ fontFamily: rj, fontSize: 10, color: '#7a8a72', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6, fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontFamily: lb, fontSize: 17, fontWeight: 700, color, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontFamily: rj, fontSize: 10.5, color: '#b0c0a4', marginTop: 4, fontWeight: 500 }}>{sub}</div>}
    </div>
  );
}
