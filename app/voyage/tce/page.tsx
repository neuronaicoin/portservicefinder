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
interface PortCost {
  id: string;
  name: string;
  cost: number;
  days: number;
}

interface TCEData {
  // Voyage Info
  vesselName: string;
  vesselType: string;
  dwt: number;

  // Charter Type
  freightStructure: 'lumpsum' | 'per_mt' | 'ws';

  // Freight
  cargoQty: number; // MT
  freightRate: number; // $/MT or lumpsum or WS rate
  wsFlatRate: number; // Worldscale flat (e.g. $20.50/MT for that route in WS100)
  commission: number; // % (broker + address)
  demurrageEarned: number; // $ (from previous voyage if any)

  // Distance & Speed (Laden + Ballast)
  ballastDistance: number; // nm — sailing to load port
  ladenDistance: number; // nm — load to discharge
  vesselSpeed: number; // kts
  consumptionAtSea: number; // MT/day at this speed
  consumptionAtPort: number; // MT/day at port (AE only typically)
  consumptionAtAnchor: number; // MT/day

  // Bunker Prices
  bunkerPrice: number; // $/MT main fuel
  bunkerPriceAe: number; // $/MT for AE/MGO
  
  // Port Costs
  ports: PortCost[];

  // Canal Costs
  canalCost: number; // $ (Suez/Panama)
  canalName: string;
  canalDays: number;

  // Other Costs
  miscCost: number; // hull insurance, war risk, ECA fees, etc.

  // Time Charter Comparison
  hireRate: number; // $/day (for TC comparison)
  hireDays: number; // total days under TC

  notes: string;
}

const DEFAULT_DATA: TCEData = {
  vesselName: '',
  vesselType: 'Bulk Carrier',
  dwt: 76000,

  freightStructure: 'per_mt',

  cargoQty: 0,
  freightRate: 0,
  wsFlatRate: 0,
  commission: 5,
  demurrageEarned: 0,

  ballastDistance: 0,
  ladenDistance: 0,
  vesselSpeed: 12.5,
  consumptionAtSea: 28,
  consumptionAtPort: 4,
  consumptionAtAnchor: 3,

  bunkerPrice: 580,
  bunkerPriceAe: 720,

  ports: [],

  canalCost: 0,
  canalName: '',
  canalDays: 0,

  miscCost: 0,

  hireRate: 18000,
  hireDays: 0,

  notes: '',
};

// ============================================================
// CALCULATIONS
// ============================================================
function calculate(d: TCEData) {
  // === DAYS ===
  const ballastSeaDays = d.vesselSpeed > 0 ? d.ballastDistance / (d.vesselSpeed * 24) : 0;
  const ladenSeaDays = d.vesselSpeed > 0 ? d.ladenDistance / (d.vesselSpeed * 24) : 0;
  const seaDays = ballastSeaDays + ladenSeaDays;
  const portDays = d.ports.reduce((s, p) => s + p.days, 0);
  const totalDays = seaDays + portDays + d.canalDays;

  // === FUEL ===
  const seaFuel = seaDays * d.consumptionAtSea;
  const portFuel = portDays * d.consumptionAtPort;
  const canalFuel = d.canalDays * d.consumptionAtSea * 0.5; // canal slow speed

  const totalMainFuel = seaFuel + canalFuel;
  const totalAeFuel = portFuel + (seaDays + d.canalDays) * 2.5; // typical AE

  const bunkerCost = totalMainFuel * d.bunkerPrice + totalAeFuel * d.bunkerPriceAe;

  // === REVENUE ===
  let grossFreight = 0;
  switch (d.freightStructure) {
    case 'lumpsum':
      grossFreight = d.freightRate; // freightRate IS the lump sum
      break;
    case 'per_mt':
      grossFreight = d.freightRate * d.cargoQty;
      break;
    case 'ws':
      // WS rate × Flat × Cargo / 100
      grossFreight = (d.freightRate / 100) * d.wsFlatRate * d.cargoQty;
      break;
  }

  const commissionAmount = (grossFreight * d.commission) / 100;
  const netFreight = grossFreight - commissionAmount + d.demurrageEarned;

  // === COSTS ===
  const totalPortCost = d.ports.reduce((s, p) => s + p.cost, 0);
  const totalVoyageCost = bunkerCost + totalPortCost + d.canalCost + d.miscCost;

  // === PROFIT & TCE ===
  const netVoyageResult = netFreight - totalVoyageCost;
  const tce = totalDays > 0 ? netVoyageResult / totalDays : 0;

  // === TC COMPARISON ===
  const tcRevenue = d.hireRate * (d.hireDays || totalDays);
  const tcNetVoyageResult = tcRevenue; // assumed all costs paid by charterer
  const tcVsVoyageDiff = tcNetVoyageResult - netVoyageResult;

  return {
    ballastSeaDays,
    ladenSeaDays,
    seaDays,
    portDays,
    totalDays,
    seaFuel,
    portFuel,
    canalFuel,
    totalMainFuel,
    totalAeFuel,
    bunkerCost,
    grossFreight,
    commissionAmount,
    netFreight,
    totalPortCost,
    totalVoyageCost,
    netVoyageResult,
    tce,
    tcRevenue,
    tcVsVoyageDiff,
    profitMargin: grossFreight > 0 ? (netVoyageResult / grossFreight) * 100 : 0,
  };
}

function fmt(n: number, dec = 2): string {
  if (!isFinite(n)) return '–';
  return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function fmtMoney(n: number): string {
  if (!isFinite(n)) return '$0';
  const sign = n < 0 ? '-' : '';
  return `${sign}$${Math.round(Math.abs(n)).toLocaleString('en-US')}`;
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
export default function TCECalculatorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingId = searchParams.get('id');

  const [data, setData] = useState<TCEData>(DEFAULT_DATA);
  const [recordId, setRecordId] = useState<string | null>(existingId);
  const [recordName, setRecordName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [view, setView] = useState<'input' | 'report'>('input');

  useEffect(() => {
    if (existingId) {
      const saved = loadItem<TCEData>('tce', existingId);
      if (saved) {
        setData(saved.data);
        setRecordName(saved.name);
      }
    }
  }, [existingId]);

  const calc = useMemo(() => calculate(data), [data]);

  function update<K extends keyof TCEData>(key: K, value: TCEData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function addPort() {
    update('ports', [...data.ports, { id: genId(), name: '', cost: 0, days: 0 }]);
  }
  function updatePort(id: string, updates: Partial<PortCost>) {
    update('ports', data.ports.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }
  function deletePort(id: string) {
    update('ports', data.ports.filter((p) => p.id !== id));
  }

  function handleSave() {
    const name = recordName.trim() || `${data.vesselName || 'Voyage'} — TCE`;
    const id = recordId || genId();
    saveItem('tce', name, data, id);
    setRecordId(id);
    setRecordName(name);
    setSaveMsg('✓ Saved');
    setShowSave(false);
    setTimeout(() => setSaveMsg(''), 3000);
  }
  function handleReset() {
    if (!confirm('Reset all fields?')) return;
    setData(DEFAULT_DATA);
    setRecordId(null);
    setRecordName('');
    router.replace('/voyage/tce');
  }
  function handlePrint() {
    window.print();
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>
          💵 Voyage Hub · TCE Calculator
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Time Charter <em style={g}>Equivalent</em> & Voyage Estimation
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          Calculate TCE for voyage charters, compare with time charter rates, and analyze profit per
          day. Supports lump sum, $/MT, and Worldscale freight structures.
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
          {view === 'input' ? '📊 View Report' : '✏️ Edit'}
        </button>
        <button onClick={() => setShowSave(true)} style={ghostBtn}>💾 Save</button>
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
            placeholder="e.g. MV NEURONAI — Tubarão/Qingdao Voyage"
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

      {view === 'input' ? (
        <>
          {/* 1. Vessel */}
          <div style={card}>
            <div style={sectionTitle}>1. Vessel Information</div>
            <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              <div>
                <label style={label}>Vessel Name</label>
                <input style={inputStyle} type="text" value={data.vesselName} onChange={(e) => update('vesselName', e.target.value)} placeholder="MV NEURONAI" />
              </div>
              <div>
                <label style={label}>Vessel Type</label>
                <select style={inputStyle} value={data.vesselType} onChange={(e) => update('vesselType', e.target.value)}>
                  <option>Bulk Carrier</option>
                  <option>Container Ship</option>
                  <option>Tanker (Oil)</option>
                  <option>Tanker (Product)</option>
                  <option>Tanker (Chemical)</option>
                  <option>Tanker (LNG)</option>
                  <option>Tanker (LPG)</option>
                  <option>General Cargo</option>
                  <option>RoRo</option>
                </select>
              </div>
              <div>
                <label style={label}>DWT</label>
                <input style={inputStyle} type="number" step="100" value={data.dwt || ''} onChange={(e) => update('dwt', parseFloat(e.target.value) || 0)} placeholder="76000" />
              </div>
            </div>
          </div>

          {/* 2. Freight Structure */}
          <div style={card}>
            <div style={sectionTitle}>2. Freight Structure</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              {[
                { v: 'per_mt', l: '$/MT (Per Tonne)' },
                { v: 'lumpsum', l: 'Lump Sum' },
                { v: 'ws', l: 'Worldscale (WS)' },
              ].map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => update('freightStructure', opt.v as 'lumpsum' | 'per_mt' | 'ws')}
                  style={{
                    background: data.freightStructure === opt.v ? '#c8a84b' : 'transparent',
                    color: data.freightStructure === opt.v ? '#08100a' : '#7a8a72',
                    border: `1px solid ${data.freightStructure === opt.v ? '#c8a84b' : 'rgba(200,168,75,.25)'}`,
                    padding: '7px 14px',
                    fontFamily: rj,
                    fontSize: 11,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    cursor: 'pointer',
                    borderRadius: 3,
                  }}
                >
                  {opt.l}
                </button>
              ))}
            </div>

            <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              <div>
                <label style={label}>Cargo Quantity — MT</label>
                <input style={inputStyle} type="number" step="100" value={data.cargoQty || ''} onChange={(e) => update('cargoQty', parseFloat(e.target.value) || 0)} placeholder="170000" />
              </div>
              <div>
                <label style={label}>
                  {data.freightStructure === 'lumpsum' && 'Lump Sum Freight — $'}
                  {data.freightStructure === 'per_mt' && 'Freight Rate — $/MT'}
                  {data.freightStructure === 'ws' && 'WS Rate (e.g. 75 = WS75)'}
                </label>
                <input style={inputStyle} type="number" step="0.01" value={data.freightRate || ''} onChange={(e) => update('freightRate', parseFloat(e.target.value) || 0)} placeholder={data.freightStructure === 'lumpsum' ? '1500000' : data.freightStructure === 'per_mt' ? '25.50' : '75'} />
              </div>
              <div>
                <label style={label}>
                  {data.freightStructure === 'ws' ? 'WS Flat Rate — $/MT' : 'Commission — %'}
                </label>
                {data.freightStructure === 'ws' ? (
                  <input style={inputStyle} type="number" step="0.01" value={data.wsFlatRate || ''} onChange={(e) => update('wsFlatRate', parseFloat(e.target.value) || 0)} placeholder="22.50" />
                ) : (
                  <input style={inputStyle} type="number" step="0.5" value={data.commission || ''} onChange={(e) => update('commission', parseFloat(e.target.value) || 0)} placeholder="5" />
                )}
              </div>
            </div>

            {data.freightStructure === 'ws' && (
              <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 12 }}>
                <div>
                  <label style={label}>Commission — %</label>
                  <input style={inputStyle} type="number" step="0.5" value={data.commission || ''} onChange={(e) => update('commission', parseFloat(e.target.value) || 0)} placeholder="5" />
                </div>
              </div>
            )}

            <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginTop: 12 }}>
              <div>
                <label style={label}>Demurrage Earned — $ (optional)</label>
                <input style={inputStyle} type="number" step="1000" value={data.demurrageEarned || ''} onChange={(e) => update('demurrageEarned', parseFloat(e.target.value) || 0)} placeholder="0" />
              </div>
            </div>

            {/* Quick Preview */}
            <div style={{ marginTop: 14, padding: '10px 12px', background: 'rgba(76,175,118,.05)', border: '1px solid rgba(76,175,118,.2)', borderRadius: 3, fontSize: 12, fontFamily: rj, color: '#b0c0a4' }}>
              💰 Gross Freight: <strong style={{ color: '#4caf76' }}>{fmtMoney(calc.grossFreight)}</strong>
              {' · '}Commission ({data.commission}%): <strong style={{ color: '#ff8a8a' }}>-{fmtMoney(calc.commissionAmount)}</strong>
              {' · '}Net: <strong style={{ color: '#c8a84b' }}>{fmtMoney(calc.netFreight)}</strong>
            </div>
          </div>

          {/* 3. Distance & Speed */}
          <div style={card}>
            <div style={sectionTitle}>3. Distance, Speed & Consumption</div>
            <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              <div>
                <label style={label}>Ballast Distance — nm</label>
                <input style={inputStyle} type="number" step="10" value={data.ballastDistance || ''} onChange={(e) => update('ballastDistance', parseFloat(e.target.value) || 0)} placeholder="0" />
                <span style={{ fontSize: 10, color: '#7a8a72', fontFamily: rj }}>Sailing to load port</span>
              </div>
              <div>
                <label style={label}>Laden Distance — nm</label>
                <input style={inputStyle} type="number" step="10" value={data.ladenDistance || ''} onChange={(e) => update('ladenDistance', parseFloat(e.target.value) || 0)} placeholder="8432" />
              </div>
              <div>
                <label style={label}>Speed — kts</label>
                <input style={inputStyle} type="number" step="0.1" value={data.vesselSpeed || ''} onChange={(e) => update('vesselSpeed', parseFloat(e.target.value) || 0)} placeholder="12.5" />
              </div>
            </div>
            <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 12 }}>
              <div>
                <label style={label}>Consumption at Sea — MT/day</label>
                <input style={inputStyle} type="number" step="0.1" value={data.consumptionAtSea || ''} onChange={(e) => update('consumptionAtSea', parseFloat(e.target.value) || 0)} placeholder="28" />
              </div>
              <div>
                <label style={label}>Consumption at Port — MT/day</label>
                <input style={inputStyle} type="number" step="0.1" value={data.consumptionAtPort || ''} onChange={(e) => update('consumptionAtPort', parseFloat(e.target.value) || 0)} placeholder="4" />
              </div>
              <div>
                <label style={label}>Consumption at Anchor — MT/day</label>
                <input style={inputStyle} type="number" step="0.1" value={data.consumptionAtAnchor || ''} onChange={(e) => update('consumptionAtAnchor', parseFloat(e.target.value) || 0)} placeholder="3" />
              </div>
            </div>
            <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginTop: 12 }}>
              <div>
                <label style={label}>Main Bunker Price — $/MT</label>
                <input style={inputStyle} type="number" step="1" value={data.bunkerPrice || ''} onChange={(e) => update('bunkerPrice', parseFloat(e.target.value) || 0)} placeholder="580" />
              </div>
              <div>
                <label style={label}>AE/MGO Price — $/MT</label>
                <input style={inputStyle} type="number" step="1" value={data.bunkerPriceAe || ''} onChange={(e) => update('bunkerPriceAe', parseFloat(e.target.value) || 0)} placeholder="720" />
              </div>
            </div>

            <div style={{ marginTop: 14, padding: '10px 12px', background: 'rgba(200,168,75,.05)', border: '1px solid rgba(200,168,75,.15)', borderRadius: 3, fontSize: 12, fontFamily: rj, color: '#b0c0a4' }}>
              ⏱️ Sea Days: <strong style={{ color: '#f5f0e8' }}>{fmt(calc.seaDays, 2)}</strong>
              {' · '}⛽ Main Fuel: <strong style={{ color: '#f5f0e8' }}>{fmt(calc.totalMainFuel, 1)} MT</strong>
              {' · '}💰 Bunker Cost: <strong style={{ color: '#c8a84b' }}>{fmtMoney(calc.bunkerCost)}</strong>
            </div>
          </div>

          {/* 4. Ports */}
          <div style={card}>
            <div style={sectionTitle}>4. Port Costs & Time</div>
            <p style={{ fontSize: 11, color: '#7a8a72', marginBottom: 12, fontFamily: rj }}>
              Add each port call with disbursement cost and stay duration.
            </p>

            {data.ports.length === 0 ? (
              <div style={{ padding: '20px 14px', textAlign: 'center', border: '1px dashed rgba(200,168,75,.25)', borderRadius: 3, color: '#7a8a72', fontSize: 12 }}>
                No ports added yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.ports.map((p) => (
                  <div key={p.id} style={{ background: '#0c1610', border: '1px solid rgba(200,168,75,.15)', padding: '10px 12px', borderRadius: 3 }}>
                    <div className="port-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 10, alignItems: 'end' }}>
                      <div>
                        <label style={label}>Port Name</label>
                        <input type="text" value={p.name} onChange={(e) => updatePort(p.id, { name: e.target.value })} placeholder="Tubarão" style={inputStyle} />
                      </div>
                      <div>
                        <label style={label}>Cost — $</label>
                        <input type="number" step="100" value={p.cost || ''} onChange={(e) => updatePort(p.id, { cost: parseFloat(e.target.value) || 0 })} placeholder="35000" style={inputStyle} />
                      </div>
                      <div>
                        <label style={label}>Days at Port</label>
                        <input type="number" step="0.1" value={p.days || ''} onChange={(e) => updatePort(p.id, { days: parseFloat(e.target.value) || 0 })} placeholder="4" style={inputStyle} />
                      </div>
                      <button
                        onClick={() => deletePort(p.id)}
                        style={{ background: 'transparent', border: '1px solid rgba(255,138,138,.3)', color: '#ff8a8a', padding: '8px 10px', fontFamily: rj, fontSize: 11, cursor: 'pointer', borderRadius: 3 }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={addPort}
              style={{
                marginTop: 12,
                background: 'transparent',
                color: '#c8a84b',
                border: '1px solid rgba(200,168,75,.4)',
                padding: '7px 14px',
                fontFamily: rj,
                fontSize: 11,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                fontWeight: 700,
                cursor: 'pointer',
                borderRadius: 3,
              }}
            >
              + Add Port
            </button>

            {data.ports.length > 0 && (
              <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(255,138,138,.05)', border: '1px solid rgba(255,138,138,.2)', borderRadius: 3, fontSize: 12, fontFamily: rj, color: '#b0c0a4' }}>
                🏴 Total Port Cost: <strong style={{ color: '#ff8a8a' }}>{fmtMoney(calc.totalPortCost)}</strong>
                {' · '}Port Days: <strong style={{ color: '#f5f0e8' }}>{fmt(calc.portDays, 1)}</strong>
              </div>
            )}
          </div>

          {/* 5. Canal */}
          <div style={card}>
            <div style={sectionTitle}>5. Canal & Other Costs</div>
            <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              <div>
                <label style={label}>Canal Name</label>
                <select style={inputStyle} value={data.canalName} onChange={(e) => update('canalName', e.target.value)}>
                  <option value="">None</option>
                  <option>Suez Canal</option>
                  <option>Panama Canal</option>
                  <option>Bosphorus / Dardanelles</option>
                  <option>Kiel Canal</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label style={label}>Canal Fee — $</label>
                <input style={inputStyle} type="number" step="1000" value={data.canalCost || ''} onChange={(e) => update('canalCost', parseFloat(e.target.value) || 0)} placeholder="480000" />
              </div>
              <div>
                <label style={label}>Canal Transit Days</label>
                <input style={inputStyle} type="number" step="0.5" value={data.canalDays || ''} onChange={(e) => update('canalDays', parseFloat(e.target.value) || 0)} placeholder="1" />
              </div>
            </div>
            <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(1,1fr)', gap: 12, marginTop: 12 }}>
              <div>
                <label style={label}>Other Costs — $ (insurance, war risk, ECA, etc.)</label>
                <input style={inputStyle} type="number" step="100" value={data.miscCost || ''} onChange={(e) => update('miscCost', parseFloat(e.target.value) || 0)} placeholder="8000" />
              </div>
            </div>
          </div>

          {/* 6. TC Comparison */}
          <div style={card}>
            <div style={sectionTitle}>6. Time Charter Comparison (Optional)</div>
            <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
              <div>
                <label style={label}>TC Hire Rate — $/day</label>
                <input style={inputStyle} type="number" step="100" value={data.hireRate || ''} onChange={(e) => update('hireRate', parseFloat(e.target.value) || 0)} placeholder="18000" />
              </div>
              <div>
                <label style={label}>TC Days (leave 0 = same as voyage days)</label>
                <input style={inputStyle} type="number" step="1" value={data.hireDays || ''} onChange={(e) => update('hireDays', parseFloat(e.target.value) || 0)} placeholder="0" />
              </div>
            </div>
          </div>

          {/* 7. Notes */}
          <div style={card}>
            <div style={sectionTitle}>7. Notes</div>
            <textarea
              value={data.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="Additional remarks..."
              rows={3}
              style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }}
            />
          </div>

          {/* Quick Preview */}
          {calc.totalDays > 0 && calc.grossFreight > 0 && (
            <div style={{ ...card, background: 'linear-gradient(135deg,rgba(200,168,75,.08),transparent)', borderColor: 'rgba(200,168,75,.4)' }}>
              <div style={sectionTitle}>⚡ Quick Result Preview</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px,1fr))', gap: 14 }}>
                <KpiBox label="Total Days" value={fmt(calc.totalDays, 1)} color="#f5f0e8" sub={`${fmt(calc.seaDays, 1)} sea + ${fmt(calc.portDays, 1)} port`} />
                <KpiBox label="Net Revenue" value={fmtMoney(calc.netFreight)} color="#4caf76" sub="After commission" />
                <KpiBox label="Total Costs" value={fmtMoney(calc.totalVoyageCost)} color="#ff8a8a" sub="Bunker + Port + Canal + Misc" />
                <KpiBox label="TCE / Day" value={fmtMoney(calc.tce)} color="#c8a84b" sub={calc.tce > data.hireRate ? '↑ Above TC' : '↓ Below TC'} big />
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
          )}
        </>
      ) : (
        <ReportView data={data} calc={calc} />
      )}

      <style>{`
        @media (max-width: 720px) {
          .g3 { grid-template-columns: 1fr !important; }
          .port-grid { grid-template-columns: 1fr !important; }
          .action-bar button { font-size: 10px !important; padding: 7px 10px !important; }
        }
        @media print {
          @page { size: A4; margin: 14mm; }
          body { background: white !important; color: black !important; }
          nav, footer, .action-bar, [style*="position: sticky"] { display: none !important; }
        }
      `}</style>
    </div>
  );
}

// ============================================================
// REPORT VIEW
// ============================================================
function ReportView({ data, calc }: { data: TCEData; calc: ReturnType<typeof calculate> }) {
  const reportRow: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px dashed rgba(200,168,75,.1)',
    fontFamily: rj,
    fontSize: 13,
  };

  const profitable = calc.netVoyageResult > 0;

  return (
    <div>
      {/* Header */}
      <div style={{ ...card, background: 'linear-gradient(135deg,rgba(200,168,75,.08),transparent)', borderColor: '#c8a84b', textAlign: 'center', padding: '24px 20px' }}>
        <div style={{ fontFamily: rj, fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 12 }}>
          💵 Voyage Estimation & TCE Report
        </div>
        <h2 style={{ fontFamily: lb, fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
          {data.vesselName || 'Vessel'}
        </h2>
        <div style={{ fontSize: 13, color: '#b0c0a4', marginBottom: 4 }}>
          {data.vesselType} · {data.dwt > 0 && `${data.dwt.toLocaleString()} DWT`}
        </div>
        {data.cargoQty > 0 && (
          <div style={{ fontSize: 11, color: '#7a8a72', fontFamily: rj, marginTop: 4 }}>
            Cargo: {data.cargoQty.toLocaleString()} MT
          </div>
        )}
      </div>

      {/* TCE Hero */}
      <div
        style={{
          ...card,
          background: `linear-gradient(135deg, ${profitable ? 'rgba(76,175,118,.12)' : 'rgba(255,138,138,.12)'}, transparent)`,
          borderColor: profitable ? 'rgba(76,175,118,.4)' : 'rgba(255,138,138,.4)',
          textAlign: 'center',
          padding: '32px 20px',
        }}
      >
        <div style={{ fontFamily: rj, fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#7a8a72', fontWeight: 700, marginBottom: 8 }}>
          Time Charter Equivalent (TCE)
        </div>
        <div style={{ fontFamily: lb, fontSize: 48, fontWeight: 700, color: profitable ? '#4caf76' : '#ff8a8a', lineHeight: 1, marginBottom: 8 }}>
          {fmtMoney(calc.tce)}<span style={{ fontSize: 16, color: '#7a8a72' }}>/day</span>
        </div>
        <div style={{ fontFamily: rj, fontSize: 12, color: '#b0c0a4' }}>
          {profitable ? '✅ Profitable voyage' : '⚠ Loss-making voyage'}
          {' · '}Margin: {fmt(calc.profitMargin, 1)}%
        </div>
      </div>

      {/* Days Breakdown */}
      <div style={card}>
        <div style={sectionTitle}>⏱️ Time Analysis</div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Ballast Sea Days</span>
          <strong>{fmt(calc.ballastSeaDays, 2)} days</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Laden Sea Days</span>
          <strong>{fmt(calc.ladenSeaDays, 2)} days</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Port Days</span>
          <strong>{fmt(calc.portDays, 2)} days</strong>
        </div>
        {data.canalDays > 0 && (
          <div style={reportRow}>
            <span style={{ color: '#7a8a72' }}>Canal Transit Days</span>
            <strong>{fmt(data.canalDays, 2)} days</strong>
          </div>
        )}
        <div style={{ ...reportRow, borderBottom: 'none', borderTop: '2px solid rgba(200,168,75,.3)', paddingTop: 12, marginTop: 6 }}>
          <span style={{ color: '#c8a84b', fontWeight: 700, fontSize: 14 }}>TOTAL VOYAGE DAYS</span>
          <strong style={{ fontFamily: lb, fontSize: 18 }}>{fmt(calc.totalDays, 2)} days</strong>
        </div>
      </div>

      {/* Revenue */}
      <div style={card}>
        <div style={sectionTitle}>💰 Revenue</div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Freight Structure</span>
          <strong>
            {data.freightStructure === 'lumpsum' && 'Lump Sum'}
            {data.freightStructure === 'per_mt' && '$/MT'}
            {data.freightStructure === 'ws' && `Worldscale ${data.freightRate} (Flat $${data.wsFlatRate})`}
          </strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Gross Freight</span>
          <strong>{fmtMoney(calc.grossFreight)}</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Commission ({data.commission}%)</span>
          <strong style={{ color: '#ff8a8a' }}>-{fmtMoney(calc.commissionAmount)}</strong>
        </div>
        {data.demurrageEarned > 0 && (
          <div style={reportRow}>
            <span style={{ color: '#7a8a72' }}>Demurrage Earned</span>
            <strong style={{ color: '#4caf76' }}>+{fmtMoney(data.demurrageEarned)}</strong>
          </div>
        )}
        <div style={{ ...reportRow, borderBottom: 'none', borderTop: '2px solid #4caf76', paddingTop: 12, marginTop: 6 }}>
          <span style={{ color: '#4caf76', fontWeight: 700, fontSize: 14 }}>NET FREIGHT</span>
          <strong style={{ fontFamily: lb, fontSize: 18, color: '#4caf76' }}>{fmtMoney(calc.netFreight)}</strong>
        </div>
      </div>

      {/* Costs */}
      <div style={card}>
        <div style={sectionTitle}>💸 Costs Breakdown</div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Main Fuel ({fmt(calc.totalMainFuel, 1)} MT × ${data.bunkerPrice})</span>
          <strong>{fmtMoney(calc.totalMainFuel * data.bunkerPrice)}</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>AE Fuel ({fmt(calc.totalAeFuel, 1)} MT × ${data.bunkerPriceAe})</span>
          <strong>{fmtMoney(calc.totalAeFuel * data.bunkerPriceAe)}</strong>
        </div>

        {data.ports.map((p) => (
          <div key={p.id} style={reportRow}>
            <span style={{ color: '#7a8a72' }}>Port: {p.name || 'Unnamed'}</span>
            <strong>{fmtMoney(p.cost)}</strong>
          </div>
        ))}

        {data.canalCost > 0 && (
          <div style={reportRow}>
            <span style={{ color: '#7a8a72' }}>{data.canalName || 'Canal'} Transit</span>
            <strong>{fmtMoney(data.canalCost)}</strong>
          </div>
        )}

        {data.miscCost > 0 && (
          <div style={reportRow}>
            <span style={{ color: '#7a8a72' }}>Other Costs (insurance, war risk, etc.)</span>
            <strong>{fmtMoney(data.miscCost)}</strong>
          </div>
        )}

        <div style={{ ...reportRow, borderBottom: 'none', borderTop: '2px solid #ff8a8a', paddingTop: 12, marginTop: 6 }}>
          <span style={{ color: '#ff8a8a', fontWeight: 700, fontSize: 14 }}>TOTAL COSTS</span>
          <strong style={{ fontFamily: lb, fontSize: 18, color: '#ff8a8a' }}>{fmtMoney(calc.totalVoyageCost)}</strong>
        </div>
      </div>

      {/* P&L */}
      <div
        style={{
          ...card,
          background: profitable ? 'linear-gradient(135deg,rgba(76,175,118,.08),transparent)' : 'linear-gradient(135deg,rgba(255,138,138,.08),transparent)',
          borderColor: profitable ? 'rgba(76,175,118,.4)' : 'rgba(255,138,138,.4)',
        }}
      >
        <div style={sectionTitle}>📊 Profit & Loss</div>
        <div style={reportRow}>
          <span>Net Revenue</span>
          <strong style={{ color: '#4caf76' }}>{fmtMoney(calc.netFreight)}</strong>
        </div>
        <div style={reportRow}>
          <span>Total Costs</span>
          <strong style={{ color: '#ff8a8a' }}>-{fmtMoney(calc.totalVoyageCost)}</strong>
        </div>
        <div style={{ ...reportRow, borderBottom: 'none', borderTop: '2px solid', borderTopColor: profitable ? '#4caf76' : '#ff8a8a', paddingTop: 14, marginTop: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>
            {profitable ? 'PROFIT' : 'LOSS'}
          </span>
          <strong style={{ fontFamily: lb, fontSize: 24, color: profitable ? '#4caf76' : '#ff8a8a' }}>{fmtMoney(calc.netVoyageResult)}</strong>
        </div>
        <p style={{ fontSize: 12, color: '#b0c0a4', marginTop: 10, fontStyle: 'italic', textAlign: 'center' }}>
          Margin: {fmt(calc.profitMargin, 1)}% of gross freight
        </p>
      </div>

      {/* TC Comparison */}
      {data.hireRate > 0 && (
        <div style={card}>
          <div style={sectionTitle}>⚖️ Voyage vs Time Charter Comparison</div>
          <div style={reportRow}>
            <span style={{ color: '#7a8a72' }}>TC Hire Rate</span>
            <strong>{fmtMoney(data.hireRate)}/day</strong>
          </div>
          <div style={reportRow}>
            <span style={{ color: '#7a8a72' }}>TC Total Revenue (same days)</span>
            <strong>{fmtMoney(calc.tcRevenue)}</strong>
          </div>
          <div style={reportRow}>
            <span style={{ color: '#7a8a72' }}>Voyage Net Result</span>
            <strong>{fmtMoney(calc.netVoyageResult)}</strong>
          </div>
          <div style={{ ...reportRow, borderBottom: 'none', borderTop: '2px solid #c8a84b', paddingTop: 12, marginTop: 6 }}>
            <span style={{ color: '#c8a84b', fontWeight: 700 }}>
              {calc.tcVsVoyageDiff > 0 ? 'TC would be BETTER' : 'VOYAGE is BETTER'}
            </span>
            <strong style={{ fontFamily: lb, fontSize: 18, color: calc.tcVsVoyageDiff > 0 ? '#ff8a8a' : '#4caf76' }}>
              {calc.tcVsVoyageDiff > 0 ? '+' : ''}{fmtMoney(calc.tcVsVoyageDiff)}
            </strong>
          </div>
          <p style={{ fontSize: 11.5, color: '#7a8a72', marginTop: 10, fontStyle: 'italic' }}>
            {calc.tcVsVoyageDiff > 0
              ? `Time charter would yield ${fmtMoney(Math.abs(calc.tcVsVoyageDiff))} more for the same period.`
              : `Voyage charter yields ${fmtMoney(Math.abs(calc.tcVsVoyageDiff))} more than TC equivalent. TCE: ${fmtMoney(calc.tce)}/day > Hire ${fmtMoney(data.hireRate)}/day.`}
          </p>
        </div>
      )}

      {/* Notes */}
      {data.notes && (
        <div style={card}>
          <div style={sectionTitle}>📝 Notes</div>
          <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{data.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 20, padding: '14px 16px', background: 'rgba(200,168,75,.04)', border: '1px solid rgba(200,168,75,.12)', borderRadius: 4, textAlign: 'center', fontFamily: rj, fontSize: 11, color: '#7a8a72', letterSpacing: '.5px' }}>
        Generated by PortServiceFinder Voyage Hub · portservicefinder.com/voyage
        <br />
        <span style={{ fontSize: 10, marginTop: 4, display: 'inline-block' }}>
          Estimate only — actual results depend on weather, market, port performance.
        </span>
      </div>
    </div>
  );
}

// ============================================================
// KPI BOX
// ============================================================
function KpiBox({ label, value, color, sub, big }: { label: string; value: string; color: string; sub?: string; big?: boolean }) {
  return (
    <div
      style={{
        background: '#0c1610',
        padding: '12px 14px',
        border: '1px solid rgba(200,168,75,.15)',
        borderRadius: 3,
      }}
    >
      <div
        style={{
          fontFamily: rj,
          fontSize: 10,
          color: '#7a8a72',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: 6,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div style={{ fontFamily: lb, fontSize: big ? 22 : 17, fontWeight: 700, color, lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontFamily: rj, fontSize: 10.5, color: '#b0c0a4', marginTop: 4, fontWeight: 500 }}>
          {sub}
        </div>
      )}
    </div>
  );
}
