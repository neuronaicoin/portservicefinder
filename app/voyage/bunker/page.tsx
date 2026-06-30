'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { saveItem, loadItem, genId } from '@/lib/voyage-storage';

const lb = "'Libre Bodoni', serif";
const rj = "'Rajdhani', sans-serif";
const g = { color: '#c8a84b', fontStyle: 'italic' };

// ============================================================
// FORM DATA INTERFACE
// ============================================================
interface BunkerData {
  // Voyage Info
  vesselName: string;
  imo: string;
  voyageFrom: string;
  voyageTo: string;
  voyageStart: string;
  voyageEnd: string;
  vesselType: string;
  charterType: 'time' | 'voyage';

  // Charter Party Warranties
  cpSpeedLaden: number;
  cpSpeedBallast: number;
  cpConsMeLaden: number;
  cpConsMeBallast: number;
  cpConsAe: number;
  cpFuelType: string;
  weatherCriteriaBf: number;
  weatherCriteriaSs: number;

  // Total Voyage Data
  totalDays: number;
  totalDistance: number;
  ladenOrBallast: 'laden' | 'ballast';
  actualAvgSpeed: number;
  actualConsMe: number;
  actualConsAe: number;

  // Weather Analysis
  goodWeatherHours: number;
  badWeatherHours: number;
  adverseCurrentHours: number;

  // Off-hire
  offHireHours: number;
  hireRate: number; // $/day

  // Bunker Prices
  bunkerPriceMain: number; // $/MT for ME fuel
  bunkerPriceAe: number; // $/MT for AE fuel

  // Notes
  notes: string;
}

const DEFAULT_DATA: BunkerData = {
  vesselName: '',
  imo: '',
  voyageFrom: '',
  voyageTo: '',
  voyageStart: '',
  voyageEnd: '',
  vesselType: 'Bulk Carrier',
  charterType: 'time',

  cpSpeedLaden: 12.5,
  cpSpeedBallast: 13.0,
  cpConsMeLaden: 28,
  cpConsMeBallast: 24,
  cpConsAe: 2.5,
  cpFuelType: 'VLSFO',
  weatherCriteriaBf: 4,
  weatherCriteriaSs: 3,

  totalDays: 0,
  totalDistance: 0,
  ladenOrBallast: 'laden',
  actualAvgSpeed: 0,
  actualConsMe: 0,
  actualConsAe: 0,

  goodWeatherHours: 0,
  badWeatherHours: 0,
  adverseCurrentHours: 0,

  offHireHours: 0,
  hireRate: 18000,

  bunkerPriceMain: 580,
  bunkerPriceAe: 720,

  notes: '',
};

// ============================================================
// CALCULATIONS
// ============================================================
function calculate(d: BunkerData) {
  const cpSpeed = d.ladenOrBallast === 'laden' ? d.cpSpeedLaden : d.cpSpeedBallast;
  const cpConsMe = d.ladenOrBallast === 'laden' ? d.cpConsMeLaden : d.cpConsMeBallast;

  const totalHours = d.totalDays * 24;
  const goodPct = totalHours > 0 ? (d.goodWeatherHours / totalHours) * 100 : 0;
  const badPct = totalHours > 0 ? (d.badWeatherHours / totalHours) * 100 : 0;

  const goodWeatherDays = d.goodWeatherHours / 24;
  const badWeatherDays = d.badWeatherHours / 24;

  // Speed claim (good weather only - REQ method)
  const speedDeficit = cpSpeed - d.actualAvgSpeed; // positive = under-performed
  const speedDeficitPct = cpSpeed > 0 ? (speedDeficit / cpSpeed) * 100 : 0;

  // Time lost due to speed deficit in good weather
  // If vessel had performed at CP speed during good weather, voyage would be shorter
  let speedClaimHours = 0;
  if (speedDeficit > 0 && d.actualAvgSpeed > 0 && goodWeatherDays > 0) {
    // Distance covered in good weather (approx)
    const distGoodWeather = d.actualAvgSpeed * d.goodWeatherHours;
    const cpTimeForSameDistance = distGoodWeather / cpSpeed;
    speedClaimHours = d.goodWeatherHours - cpTimeForSameDistance;
  }

  // Fuel claim (good weather only)
  const fuelDeficit = d.actualConsMe - cpConsMe; // positive = over-consumed
  const fuelDeficitPct = cpConsMe > 0 ? (fuelDeficit / cpConsMe) * 100 : 0;

  let fuelExcessMt = 0;
  if (fuelDeficit > 0 && goodWeatherDays > 0) {
    fuelExcessMt = fuelDeficit * goodWeatherDays;
  }
  const fuelClaimValue = fuelExcessMt * d.bunkerPriceMain;

  // Speed claim value (lost time × hire rate)
  const speedClaimValue = (speedClaimHours / 24) * d.hireRate;

  // Off-hire
  const offHireDays = d.offHireHours / 24;
  const offHireValue = offHireDays * d.hireRate;

  // Total bunker consumed
  const totalMeConsumed = d.actualConsMe * d.totalDays;
  const totalAeConsumed = d.actualConsAe * d.totalDays;
  const totalBunkerCost = totalMeConsumed * d.bunkerPriceMain + totalAeConsumed * d.bunkerPriceAe;

  // Net claim
  const totalClaim = fuelClaimValue + speedClaimValue + offHireValue;

  // Performance index
  const overallPerformance =
    cpSpeed > 0 && cpConsMe > 0
      ? (d.actualAvgSpeed / cpSpeed) * 100 - (d.actualConsMe / cpConsMe) * 100
      : 0;

  return {
    cpSpeed,
    cpConsMe,
    totalHours,
    goodPct,
    badPct,
    goodWeatherDays,
    badWeatherDays,
    speedDeficit,
    speedDeficitPct,
    speedClaimHours,
    speedClaimValue,
    fuelDeficit,
    fuelDeficitPct,
    fuelExcessMt,
    fuelClaimValue,
    offHireDays,
    offHireValue,
    totalMeConsumed,
    totalAeConsumed,
    totalBunkerCost,
    totalClaim,
    overallPerformance,
  };
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
const input: React.CSSProperties = {
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
const grid2: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 12,
  marginBottom: 12,
};
const grid3: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: 12,
  marginBottom: 12,
};

// ============================================================
// COMPONENT
// ============================================================
export default function BunkerCalculatorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingId = searchParams.get('id');

  const [data, setData] = useState<BunkerData>(DEFAULT_DATA);
  const [recordId, setRecordId] = useState<string | null>(existingId);
  const [recordName, setRecordName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [view, setView] = useState<'input' | 'report'>('input');

  // Load if id present
  useEffect(() => {
    if (existingId) {
      const saved = loadItem<BunkerData>('bunker', existingId);
      if (saved) {
        setData(saved.data);
        setRecordName(saved.name);
      }
    }
  }, [existingId]);

  const calc = useMemo(() => calculate(data), [data]);

  function update<K extends keyof BunkerData>(key: K, value: BunkerData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    const name = recordName.trim() || `${data.vesselName || 'Untitled'} — ${data.voyageFrom || '?'} → ${data.voyageTo || '?'}`;
    const id = recordId || genId();
    saveItem('bunker', name, data, id);
    setRecordId(id);
    setRecordName(name);
    setSaveMsg('✓ Saved to My Saved');
    setShowSave(false);
    setTimeout(() => setSaveMsg(''), 3000);
  }

  function handleReset() {
    if (!confirm('Clear all fields and start over?')) return;
    setData(DEFAULT_DATA);
    setRecordId(null);
    setRecordName('');
    router.replace('/voyage/bunker');
  }

  function handlePrint() {
    window.print();
  }

  function fmt(n: number, decimals = 2): string {
    if (!isFinite(n)) return '–';
    return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }
  function fmtMoney(n: number): string {
    if (!isFinite(n)) return '$0';
    const sign = n < 0 ? '-' : '';
    const abs = Math.abs(n);
    return `${sign}$${abs.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>
          ⛽ Voyage Hub · Bunker Calculator
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Charter Party <em style={g}>Performance</em> Analysis
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          Compare actual vessel performance vs charter party warranties. Calculate speed claim, fuel
          overconsumption claim, and off-hire amounts using REQ-method (good weather period only).
        </p>
      </div>

      {/* Action Bar */}
      <div className="action-bar" style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => setView(view === 'input' ? 'report' : 'input')}
          style={{
            background: view === 'report' ? 'transparent' : '#c8a84b',
            color: view === 'report' ? '#c8a84b' : '#08100a',
            border: '1px solid #c8a84b',
            padding: '8px 16px',
            fontFamily: rj,
            fontSize: 11,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            fontWeight: 700,
            cursor: 'pointer',
            borderRadius: 4,
          }}
        >
          {view === 'input' ? '📊 View Report' : '✏️ Edit Inputs'}
        </button>
        <button
          onClick={() => setShowSave(true)}
          style={{
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
          }}
        >
          💾 Save
        </button>
        <button
          onClick={handlePrint}
          style={{
            background: 'transparent',
            color: '#7a8a72',
            border: '1px solid rgba(200,168,75,.2)',
            padding: '8px 14px',
            fontFamily: rj,
            fontSize: 11,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            fontWeight: 700,
            cursor: 'pointer',
            borderRadius: 4,
          }}
        >
          🖨️ Print / PDF
        </button>
        <button
          onClick={handleReset}
          style={{
            background: 'transparent',
            color: '#ff8a8a',
            border: '1px solid rgba(255,138,138,.3)',
            padding: '8px 14px',
            fontFamily: rj,
            fontSize: 11,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            fontWeight: 700,
            cursor: 'pointer',
            borderRadius: 4,
          }}
        >
          🗑️ Reset
        </button>
        {saveMsg && <span style={{ color: '#4caf76', fontFamily: rj, fontSize: 12, fontWeight: 600 }}>{saveMsg}</span>}
        {recordName && <span style={{ color: '#7a8a72', fontFamily: rj, fontSize: 11, marginLeft: 'auto' }}>📂 {recordName}</span>}
      </div>

      {/* Save Dialog */}
      {showSave && (
        <div style={{ ...card, background: 'rgba(200,168,75,.05)', borderColor: 'rgba(200,168,75,.4)', marginBottom: 16 }}>
          <label style={label}>Name for this analysis</label>
          <input
            type="text"
            value={recordName}
            onChange={(e) => setRecordName(e.target.value)}
            placeholder="e.g. MV NEURONAI — Singapore→Rotterdam Jan 2026"
            style={{ ...input, marginBottom: 10 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{ background: '#c8a84b', color: '#08100a', border: 'none', padding: '8px 14px', fontFamily: rj, fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 3 }}>
              Save
            </button>
            <button onClick={() => setShowSave(false)} style={{ background: 'transparent', color: '#7a8a72', border: '1px solid rgba(200,168,75,.2)', padding: '8px 14px', fontFamily: rj, fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 3 }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {view === 'input' ? (
        // ====================================
        // INPUT VIEW
        // ====================================
        <div>
          {/* 1. Voyage Info */}
          <div style={card}>
            <div style={sectionTitle}>1. Voyage Information</div>
            <div className="form-grid-3" style={grid3}>
              <div>
                <label style={label}>Vessel Name</label>
                <input style={input} type="text" value={data.vesselName} onChange={(e) => update('vesselName', e.target.value)} placeholder="MV NEURONAI" />
              </div>
              <div>
                <label style={label}>IMO Number</label>
                <input style={input} type="text" value={data.imo} onChange={(e) => update('imo', e.target.value)} placeholder="9876543" />
              </div>
              <div>
                <label style={label}>Vessel Type</label>
                <select style={input} value={data.vesselType} onChange={(e) => update('vesselType', e.target.value)}>
                  <option>Bulk Carrier</option>
                  <option>Container Ship</option>
                  <option>Tanker (Oil)</option>
                  <option>Tanker (Chemical)</option>
                  <option>Tanker (Product)</option>
                  <option>Tanker (Gas/LPG)</option>
                  <option>Tanker (LNG)</option>
                  <option>General Cargo</option>
                  <option>RoRo</option>
                  <option>Passenger</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div className="form-grid-2" style={grid2}>
              <div>
                <label style={label}>From Port</label>
                <input style={input} type="text" value={data.voyageFrom} onChange={(e) => update('voyageFrom', e.target.value)} placeholder="Singapore" />
              </div>
              <div>
                <label style={label}>To Port</label>
                <input style={input} type="text" value={data.voyageTo} onChange={(e) => update('voyageTo', e.target.value)} placeholder="Rotterdam" />
              </div>
            </div>
            <div className="form-grid-3" style={grid3}>
              <div>
                <label style={label}>Voyage Start (Sailed)</label>
                <input style={input} type="date" value={data.voyageStart} onChange={(e) => update('voyageStart', e.target.value)} />
              </div>
              <div>
                <label style={label}>Voyage End (Arrived)</label>
                <input style={input} type="date" value={data.voyageEnd} onChange={(e) => update('voyageEnd', e.target.value)} />
              </div>
              <div>
                <label style={label}>Charter Type</label>
                <select style={input} value={data.charterType} onChange={(e) => update('charterType', e.target.value as 'time' | 'voyage')}>
                  <option value="time">Time Charter</option>
                  <option value="voyage">Voyage Charter</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Charter Party Warranties */}
          <div style={card}>
            <div style={sectionTitle}>2. Charter Party Warranties</div>
            <p style={{ fontSize: 11, color: '#7a8a72', marginBottom: 12 }}>
              Values stated in the charter party — speed and consumption guaranteed by owner.
            </p>
            <div className="form-grid-3" style={grid3}>
              <div>
                <label style={label}>CP Speed (Laden) — kts</label>
                <input style={input} type="number" step="0.1" value={data.cpSpeedLaden} onChange={(e) => update('cpSpeedLaden', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <label style={label}>CP Speed (Ballast) — kts</label>
                <input style={input} type="number" step="0.1" value={data.cpSpeedBallast} onChange={(e) => update('cpSpeedBallast', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <label style={label}>Main Fuel Type</label>
                <select style={input} value={data.cpFuelType} onChange={(e) => update('cpFuelType', e.target.value)}>
                  <option>VLSFO</option>
                  <option>HFO</option>
                  <option>ULSFO</option>
                  <option>LSMGO</option>
                  <option>MGO</option>
                  <option>LNG</option>
                  <option>Methanol</option>
                </select>
              </div>
            </div>
            <div className="form-grid-3" style={grid3}>
              <div>
                <label style={label}>CP ME Cons. (Laden) — MT/day</label>
                <input style={input} type="number" step="0.1" value={data.cpConsMeLaden} onChange={(e) => update('cpConsMeLaden', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <label style={label}>CP ME Cons. (Ballast) — MT/day</label>
                <input style={input} type="number" step="0.1" value={data.cpConsMeBallast} onChange={(e) => update('cpConsMeBallast', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <label style={label}>CP AE Cons. — MT/day (MGO)</label>
                <input style={input} type="number" step="0.1" value={data.cpConsAe} onChange={(e) => update('cpConsAe', parseFloat(e.target.value) || 0)} />
              </div>
            </div>
            <div className="form-grid-2" style={grid2}>
              <div>
                <label style={label}>Weather Criteria — BF (max)</label>
                <input style={input} type="number" step="1" value={data.weatherCriteriaBf} onChange={(e) => update('weatherCriteriaBf', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <label style={label}>Weather Criteria — Sea State (max)</label>
                <input style={input} type="number" step="1" value={data.weatherCriteriaSs} onChange={(e) => update('weatherCriteriaSs', parseFloat(e.target.value) || 0)} />
              </div>
            </div>
          </div>

          {/* 3. Actual Performance */}
          <div style={card}>
            <div style={sectionTitle}>3. Actual Voyage Performance</div>
            <p style={{ fontSize: 11, color: '#7a8a72', marginBottom: 12 }}>
              From ship&apos;s noon reports — actual averages for this voyage.
            </p>
            <div className="form-grid-3" style={grid3}>
              <div>
                <label style={label}>Total Voyage Days</label>
                <input style={input} type="number" step="0.1" value={data.totalDays || ''} onChange={(e) => update('totalDays', parseFloat(e.target.value) || 0)} placeholder="25.4" />
              </div>
              <div>
                <label style={label}>Total Distance — nm</label>
                <input style={input} type="number" step="1" value={data.totalDistance || ''} onChange={(e) => update('totalDistance', parseFloat(e.target.value) || 0)} placeholder="8432" />
              </div>
              <div>
                <label style={label}>Voyage Condition</label>
                <select style={input} value={data.ladenOrBallast} onChange={(e) => update('ladenOrBallast', e.target.value as 'laden' | 'ballast')}>
                  <option value="laden">Laden</option>
                  <option value="ballast">Ballast</option>
                </select>
              </div>
            </div>
            <div className="form-grid-3" style={grid3}>
              <div>
                <label style={label}>Actual Avg Speed — kts</label>
                <input style={input} type="number" step="0.01" value={data.actualAvgSpeed || ''} onChange={(e) => update('actualAvgSpeed', parseFloat(e.target.value) || 0)} placeholder="11.78" />
              </div>
              <div>
                <label style={label}>Actual ME Cons. — MT/day</label>
                <input style={input} type="number" step="0.01" value={data.actualConsMe || ''} onChange={(e) => update('actualConsMe', parseFloat(e.target.value) || 0)} placeholder="30.4" />
              </div>
              <div>
                <label style={label}>Actual AE Cons. — MT/day</label>
                <input style={input} type="number" step="0.01" value={data.actualConsAe || ''} onChange={(e) => update('actualConsAe', parseFloat(e.target.value) || 0)} placeholder="2.7" />
              </div>
            </div>
          </div>

          {/* 4. Weather Analysis */}
          <div style={card}>
            <div style={sectionTitle}>4. Weather Analysis</div>
            <p style={{ fontSize: 11, color: '#7a8a72', marginBottom: 12 }}>
              Good weather = within CP criteria (BF ≤ {data.weatherCriteriaBf}, SS ≤ {data.weatherCriteriaSs}). Used for REQ-method claim calculation.
            </p>
            <div className="form-grid-3" style={grid3}>
              <div>
                <label style={label}>Good Weather Hours</label>
                <input style={input} type="number" step="1" value={data.goodWeatherHours || ''} onChange={(e) => update('goodWeatherHours', parseFloat(e.target.value) || 0)} placeholder="412" />
              </div>
              <div>
                <label style={label}>Bad Weather Hours</label>
                <input style={input} type="number" step="1" value={data.badWeatherHours || ''} onChange={(e) => update('badWeatherHours', parseFloat(e.target.value) || 0)} placeholder="197" />
              </div>
              <div>
                <label style={label}>Adverse Current Hours</label>
                <input style={input} type="number" step="1" value={data.adverseCurrentHours || ''} onChange={(e) => update('adverseCurrentHours', parseFloat(e.target.value) || 0)} placeholder="38" />
              </div>
            </div>
            <div style={{ padding: '8px 12px', background: 'rgba(200,168,75,.05)', border: '1px solid rgba(200,168,75,.15)', fontFamily: rj, fontSize: 11, color: '#b0c0a4', borderRadius: 3 }}>
              Total hours: <strong style={{ color: '#f5f0e8' }}>{fmt(calc.totalHours, 0)}h</strong> · Good: <strong style={{ color: '#4caf76' }}>{fmt(calc.goodPct, 1)}%</strong> · Bad: <strong style={{ color: '#ff8a8a' }}>{fmt(calc.badPct, 1)}%</strong>
              {data.goodWeatherHours + data.badWeatherHours > calc.totalHours + 1 && (
                <div style={{ color: '#ff8a8a', marginTop: 4 }}>⚠ Weather hours exceed total voyage hours — please check</div>
              )}
            </div>
          </div>

          {/* 5. Off-hire & Hire Rate */}
          <div style={card}>
            <div style={sectionTitle}>5. Off-hire & Commercial</div>
            <div className="form-grid-3" style={grid3}>
              <div>
                <label style={label}>Off-hire Hours</label>
                <input style={input} type="number" step="0.5" value={data.offHireHours || ''} onChange={(e) => update('offHireHours', parseFloat(e.target.value) || 0)} placeholder="4" />
              </div>
              <div>
                <label style={label}>Hire Rate — $/day</label>
                <input style={input} type="number" step="100" value={data.hireRate || ''} onChange={(e) => update('hireRate', parseFloat(e.target.value) || 0)} placeholder="18000" />
              </div>
              <div>
                <label style={label}>Charter Type</label>
                <input style={{ ...input, opacity: 0.6 }} type="text" value={data.charterType === 'time' ? 'Time Charter' : 'Voyage Charter'} disabled />
              </div>
            </div>
          </div>

          {/* 6. Bunker Prices */}
          <div style={card}>
            <div style={sectionTitle}>6. Bunker Prices</div>
            <div className="form-grid-2" style={grid2}>
              <div>
                <label style={label}>{data.cpFuelType} Price — $/MT</label>
                <input style={input} type="number" step="1" value={data.bunkerPriceMain || ''} onChange={(e) => update('bunkerPriceMain', parseFloat(e.target.value) || 0)} placeholder="580" />
              </div>
              <div>
                <label style={label}>MGO Price — $/MT (for AE)</label>
                <input style={input} type="number" step="1" value={data.bunkerPriceAe || ''} onChange={(e) => update('bunkerPriceAe', parseFloat(e.target.value) || 0)} placeholder="720" />
              </div>
            </div>
          </div>

          {/* 7. Notes */}
          <div style={card}>
            <div style={sectionTitle}>7. Notes</div>
            <textarea
              value={data.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="Any additional remarks for the report..."
              rows={3}
              style={{ ...input, minHeight: 70, resize: 'vertical', fontFamily: rj }}
            />
          </div>

          {/* Quick Summary */}
          <div style={{ ...card, background: 'linear-gradient(135deg,rgba(200,168,75,.08),transparent)', borderColor: 'rgba(200,168,75,.4)' }}>
            <div style={sectionTitle}>⚡ Quick Result Preview</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 14 }}>
              <KpiBox label="Speed Claim" value={fmtMoney(calc.speedClaimValue)} color={calc.speedClaimValue > 0 ? '#ff8a8a' : '#4caf76'} sub={calc.speedDeficit > 0 ? `-${fmt(calc.speedDeficit, 2)} kts` : 'OK'} />
              <KpiBox label="Fuel Claim" value={fmtMoney(calc.fuelClaimValue)} color={calc.fuelClaimValue > 0 ? '#ff8a8a' : '#4caf76'} sub={calc.fuelDeficit > 0 ? `+${fmt(calc.fuelDeficit, 2)} MT/day` : 'OK'} />
              <KpiBox label="Off-hire" value={fmtMoney(calc.offHireValue)} color={calc.offHireValue > 0 ? '#ff8a8a' : '#4caf76'} sub={`${fmt(calc.offHireDays, 2)} days`} />
              <KpiBox label="Total Claim" value={fmtMoney(calc.totalClaim)} color="#c8a84b" sub="Owner pays" big />
            </div>
            <button
              onClick={() => setView('report')}
              style={{
                marginTop: 16,
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
              📊 View Full Report →
            </button>
          </div>
        </div>
      ) : (
        // ====================================
        // REPORT VIEW
        // ====================================
        <ReportView data={data} calc={calc} fmt={fmt} fmtMoney={fmtMoney} />
      )}

      <style>{`
        @media (max-width: 720px) {
          .form-grid-2, .form-grid-3 { grid-template-columns: 1fr !important; }
          .action-bar button { font-size: 10px !important; padding: 7px 10px !important; }
        }
        @media print {
          @page { size: A4; margin: 14mm; }
          body { background: white !important; color: black !important; }
          nav, footer, .action-bar, .vh-nav, [style*="position: sticky"] { display: none !important; }
        }
      `}</style>
    </div>
  );
}

// ============================================================
// KPI Box
// ============================================================
function KpiBox({ label, value, color, sub, big }: { label: string; value: string; color: string; sub?: string; big?: boolean }) {
  return (
    <div style={{ background: '#0c1610', padding: '12px 14px', border: '1px solid rgba(200,168,75,.15)', borderRadius: 3 }}>
      <div style={{ fontFamily: rj, fontSize: 10, color: '#7a8a72', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6, fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontFamily: lb, fontSize: big ? 22 : 18, fontWeight: 700, color, lineHeight: 1.1 }}>{value}</div>
      {sub && (
        <div style={{ fontFamily: rj, fontSize: 10.5, color: '#b0c0a4', marginTop: 4, fontWeight: 500 }}>{sub}</div>
      )}
    </div>
  );
}

// ============================================================
// REPORT VIEW
// ============================================================
function ReportView({ data, calc, fmt, fmtMoney }: { data: BunkerData; calc: ReturnType<typeof calculate>; fmt: (n: number, d?: number) => string; fmtMoney: (n: number) => string }) {
  const reportRow: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px dashed rgba(200,168,75,.1)',
    fontFamily: rj,
    fontSize: 13,
  };
  return (
    <div className="report-area">
      {/* Report Header */}
      <div style={{ ...card, background: 'linear-gradient(135deg,rgba(200,168,75,.08),transparent)', borderColor: '#c8a84b', textAlign: 'center', padding: '24px 20px' }}>
        <div style={{ fontFamily: rj, fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 12 }}>
          ⚓ Charter Party Performance Report
        </div>
        <h2 style={{ fontFamily: lb, fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
          {data.vesselName || 'Vessel Name'}
        </h2>
        <div style={{ fontSize: 13, color: '#b0c0a4', marginBottom: 6 }}>
          {data.voyageFrom || '—'} → {data.voyageTo || '—'}
        </div>
        <div style={{ fontSize: 11, color: '#7a8a72', fontFamily: rj }}>
          {data.voyageStart} {data.voyageEnd && `to ${data.voyageEnd}`} · {data.vesselType} · {data.charterType === 'time' ? 'Time Charter' : 'Voyage Charter'}
        </div>
        {data.imo && <div style={{ fontSize: 11, color: '#7a8a72', fontFamily: rj, marginTop: 4 }}>IMO: {data.imo}</div>}
      </div>

      {/* Charter Party Warranties */}
      <div style={card}>
        <div style={sectionTitle}>📋 Charter Party Warranties</div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Speed (Laden / Ballast)</span>
          <strong>{fmt(data.cpSpeedLaden, 1)} / {fmt(data.cpSpeedBallast, 1)} kts</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>ME Consumption (Laden / Ballast)</span>
          <strong>{fmt(data.cpConsMeLaden, 1)} / {fmt(data.cpConsMeBallast, 1)} MT/day {data.cpFuelType}</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>AE Consumption</span>
          <strong>{fmt(data.cpConsAe, 2)} MT/day MGO</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Weather Criteria</span>
          <strong>BF ≤ {data.weatherCriteriaBf}, Sea State ≤ {data.weatherCriteriaSs}</strong>
        </div>
        <div style={{ ...reportRow, borderBottom: 'none' }}>
          <span style={{ color: '#7a8a72' }}>Voyage Condition</span>
          <strong style={{ textTransform: 'capitalize' }}>{data.ladenOrBallast}</strong>
        </div>
      </div>

      {/* Actual Performance */}
      <div style={card}>
        <div style={sectionTitle}>📈 Actual Performance</div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Total Voyage Days</span>
          <strong>{fmt(data.totalDays, 2)} days ({fmt(calc.totalHours, 0)} hours)</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Total Distance</span>
          <strong>{fmt(data.totalDistance, 0)} nm</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Actual Average Speed</span>
          <strong style={{ color: calc.speedDeficit > 0 ? '#ff8a8a' : '#4caf76' }}>
            {fmt(data.actualAvgSpeed, 2)} kts ({calc.speedDeficit > 0 ? '-' : '+'}{fmt(Math.abs(calc.speedDeficitPct), 1)}%)
          </strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Actual ME Consumption</span>
          <strong style={{ color: calc.fuelDeficit > 0 ? '#ff8a8a' : '#4caf76' }}>
            {fmt(data.actualConsMe, 2)} MT/day ({calc.fuelDeficit > 0 ? '+' : ''}{fmt(calc.fuelDeficitPct, 1)}%)
          </strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Actual AE Consumption</span>
          <strong>{fmt(data.actualConsAe, 2)} MT/day</strong>
        </div>
        <div style={{ ...reportRow, borderBottom: 'none' }}>
          <span style={{ color: '#7a8a72' }}>Total Bunker Consumed</span>
          <strong>
            {fmt(calc.totalMeConsumed, 1)} MT {data.cpFuelType} + {fmt(calc.totalAeConsumed, 1)} MT MGO
          </strong>
        </div>
      </div>

      {/* Weather Analysis */}
      <div style={card}>
        <div style={sectionTitle}>🌊 Weather Analysis</div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Good Weather Hours / Days</span>
          <strong style={{ color: '#4caf76' }}>{fmt(data.goodWeatherHours, 0)}h / {fmt(calc.goodWeatherDays, 2)} days ({fmt(calc.goodPct, 1)}%)</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Bad Weather Hours / Days</span>
          <strong style={{ color: '#ff8a8a' }}>{fmt(data.badWeatherHours, 0)}h / {fmt(calc.badWeatherDays, 2)} days ({fmt(calc.badPct, 1)}%)</strong>
        </div>
        <div style={{ ...reportRow, borderBottom: 'none' }}>
          <span style={{ color: '#7a8a72' }}>Adverse Current Hours</span>
          <strong>{fmt(data.adverseCurrentHours, 0)}h</strong>
        </div>
      </div>

      {/* SPEED CLAIM */}
      <div style={{ ...card, borderColor: calc.speedClaimValue > 0 ? 'rgba(255,138,138,.3)' : 'rgba(76,175,118,.3)' }}>
        <div style={sectionTitle}>⏱️ Speed Claim (Good Weather Period)</div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>CP Warranted Speed</span>
          <strong>{fmt(calc.cpSpeed, 2)} kts</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Actual Speed</span>
          <strong>{fmt(data.actualAvgSpeed, 2)} kts</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Speed Deficit</span>
          <strong style={{ color: calc.speedDeficit > 0 ? '#ff8a8a' : '#4caf76' }}>
            {calc.speedDeficit > 0 ? '−' : '+'}{fmt(Math.abs(calc.speedDeficit), 2)} kts
          </strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Time Lost in Good Weather</span>
          <strong>{fmt(calc.speedClaimHours, 2)} hours ({fmt(calc.speedClaimHours / 24, 3)} days)</strong>
        </div>
        <div style={{ ...reportRow, borderBottom: 'none', borderTop: '1px solid rgba(200,168,75,.2)', paddingTop: 12, marginTop: 6 }}>
          <span style={{ color: '#c8a84b', fontWeight: 700 }}>SPEED CLAIM VALUE</span>
          <strong style={{ color: calc.speedClaimValue > 0 ? '#ff8a8a' : '#4caf76', fontSize: 16 }}>{fmtMoney(calc.speedClaimValue)}</strong>
        </div>
      </div>

      {/* FUEL CLAIM */}
      <div style={{ ...card, borderColor: calc.fuelClaimValue > 0 ? 'rgba(255,138,138,.3)' : 'rgba(76,175,118,.3)' }}>
        <div style={sectionTitle}>⛽ Fuel Overconsumption Claim (Good Weather)</div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>CP ME Consumption</span>
          <strong>{fmt(calc.cpConsMe, 2)} MT/day</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Actual ME Consumption</span>
          <strong>{fmt(data.actualConsMe, 2)} MT/day</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Overconsumption per Day</span>
          <strong style={{ color: calc.fuelDeficit > 0 ? '#ff8a8a' : '#4caf76' }}>
            {calc.fuelDeficit > 0 ? '+' : ''}{fmt(calc.fuelDeficit, 2)} MT/day
          </strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Good Weather Days</span>
          <strong>{fmt(calc.goodWeatherDays, 2)} days</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Excess Fuel in Good Weather</span>
          <strong>{fmt(calc.fuelExcessMt, 2)} MT × ${fmt(data.bunkerPriceMain, 0)}/MT</strong>
        </div>
        <div style={{ ...reportRow, borderBottom: 'none', borderTop: '1px solid rgba(200,168,75,.2)', paddingTop: 12, marginTop: 6 }}>
          <span style={{ color: '#c8a84b', fontWeight: 700 }}>FUEL CLAIM VALUE</span>
          <strong style={{ color: calc.fuelClaimValue > 0 ? '#ff8a8a' : '#4caf76', fontSize: 16 }}>{fmtMoney(calc.fuelClaimValue)}</strong>
        </div>
      </div>

      {/* OFF-HIRE */}
      <div style={card}>
        <div style={sectionTitle}>⏸️ Off-hire</div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Off-hire Hours</span>
          <strong>{fmt(data.offHireHours, 1)} hours ({fmt(calc.offHireDays, 3)} days)</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Hire Rate</span>
          <strong>{fmtMoney(data.hireRate)}/day</strong>
        </div>
        <div style={{ ...reportRow, borderBottom: 'none', borderTop: '1px solid rgba(200,168,75,.2)', paddingTop: 12, marginTop: 6 }}>
          <span style={{ color: '#c8a84b', fontWeight: 700 }}>OFF-HIRE VALUE</span>
          <strong style={{ color: calc.offHireValue > 0 ? '#ff8a8a' : '#4caf76', fontSize: 16 }}>{fmtMoney(calc.offHireValue)}</strong>
        </div>
      </div>

      {/* TOTAL */}
      <div style={{ ...card, background: 'linear-gradient(135deg,rgba(200,168,75,.12),transparent)', borderColor: '#c8a84b', padding: '24px 20px' }}>
        <div style={{ ...sectionTitle, borderBottom: 'none', textAlign: 'center', fontSize: 13 }}>💰 Total Claim Summary</div>
        <div style={reportRow}>
          <span>Speed Claim</span>
          <strong style={{ color: calc.speedClaimValue > 0 ? '#ff8a8a' : '#4caf76' }}>{fmtMoney(calc.speedClaimValue)}</strong>
        </div>
        <div style={reportRow}>
          <span>Fuel Overconsumption Claim</span>
          <strong style={{ color: calc.fuelClaimValue > 0 ? '#ff8a8a' : '#4caf76' }}>{fmtMoney(calc.fuelClaimValue)}</strong>
        </div>
        <div style={reportRow}>
          <span>Off-hire</span>
          <strong style={{ color: calc.offHireValue > 0 ? '#ff8a8a' : '#4caf76' }}>{fmtMoney(calc.offHireValue)}</strong>
        </div>
        <div style={{ ...reportRow, borderBottom: 'none', borderTop: '2px solid #c8a84b', paddingTop: 14, marginTop: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>NET CLAIM POSITION</span>
          <strong style={{ fontFamily: lb, fontSize: 24, color: calc.totalClaim > 0 ? '#ff8a8a' : '#4caf76' }}>{fmtMoney(calc.totalClaim)}</strong>
        </div>
        <p style={{ fontSize: 11, color: '#7a8a72', marginTop: 14, textAlign: 'center', fontStyle: 'italic' }}>
          {calc.totalClaim > 0 ? '→ Owner pays (vessel underperformed)' : calc.totalClaim < 0 ? '→ Charterer credit' : '→ Balanced performance'}
        </p>
      </div>

      {/* Methodology */}
      <div style={{ ...card, background: 'rgba(122,138,114,.05)', borderColor: 'rgba(122,138,114,.15)' }}>
        <div style={sectionTitle}>📖 Methodology Notes</div>
        <ul style={{ fontSize: 12, color: '#b0c0a4', lineHeight: 1.7, paddingLeft: 18, marginBottom: 0 }}>
          <li>Claims calculated using <strong style={{ color: '#c8a84b' }}>REQ-method</strong> (Good Weather Period only).</li>
          <li>Weather criteria as per charter party: BF ≤ {data.weatherCriteriaBf}, Sea State ≤ {data.weatherCriteriaSs}.</li>
          <li>Adverse currents not counted as good weather for speed claim.</li>
          <li>BIMCO/INTERTANKO methodology references.</li>
          <li>Independent verification recommended before submission to charterer/owner.</li>
        </ul>
      </div>

      {data.notes && (
        <div style={card}>
          <div style={sectionTitle}>📝 Notes</div>
          <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{data.notes}</p>
        </div>
      )}

      <div style={{ marginTop: 20, padding: '14px 16px', background: 'rgba(200,168,75,.04)', border: '1px solid rgba(200,168,75,.12)', borderRadius: 4, textAlign: 'center', fontFamily: rj, fontSize: 11, color: '#7a8a72', letterSpacing: '.5px' }}>
        Generated by PortServiceFinder Voyage Hub · portservicefinder.com/voyage
      </div>
    </div>
  );
}
