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
type LegType = 'sea' | 'port' | 'canal' | 'anchorage' | 'bunker_stop';

interface VoyageLeg {
  id: string;
  type: LegType;
  name: string;
  distance: number; // nm (for sea/canal)
  speed: number; // kts (for sea)
  days: number; // for port/anchorage
  consumptionMe: number; // MT/day
  consumptionAe: number; // MT/day
  bunkerLifted: number; // MT lifted at this leg (if bunker stop)
  bunkerPrice: number; // $/MT
  notes: string;
}

interface BunkerPlanData {
  // Vessel
  vesselName: string;
  vesselType: string;

  // Charter
  charterType: 'time' | 'voyage';
  voyageFrom: string;
  voyageTo: string;

  // ROB on Delivery (Kiraya giriş)
  robInitialMe: number;
  robInitialAe: number;
  robInitialUlsfo: number; // ECA fuel
  fuelTypeMain: string;

  // Target ROB on Redelivery (Kiradan çıkış)
  robTargetMe: number;
  robTargetAe: number;
  robTargetUlsfo: number;

  // Legs
  legs: VoyageLeg[];

  // Safety
  reserveMarginPct: number;
  weatherMarginPct: number;

  // Default prices for unspecified legs
  defaultPriceMe: number;
  defaultPriceAe: number;

  // Tank capacity
  tankCapacityMe: number;
  tankCapacityAe: number;

  notes: string;
}

const DEFAULT_DATA: BunkerPlanData = {
  vesselName: '',
  vesselType: 'Bulk Carrier',
  charterType: 'time',
  voyageFrom: '',
  voyageTo: '',
  robInitialMe: 350,
  robInitialAe: 80,
  robInitialUlsfo: 0,
  fuelTypeMain: 'VLSFO',
  robTargetMe: 350,
  robTargetAe: 80,
  robTargetUlsfo: 0,
  legs: [],
  reserveMarginPct: 10,
  weatherMarginPct: 5,
  defaultPriceMe: 580,
  defaultPriceAe: 720,
  tankCapacityMe: 1500,
  tankCapacityAe: 200,
  notes: '',
};

// ============================================================
// CALCULATIONS
// ============================================================
function calculate(d: BunkerPlanData) {
  let totalSeaDays = 0;
  let totalPortDays = 0;
  let totalCanalDays = 0;
  let totalAnchorDays = 0;
  let totalDistance = 0;
  let totalMeConsumed = 0;
  let totalAeConsumed = 0;
  let totalBunkerLifted = 0;
  let totalBunkerCost = 0;

  // Running ROB tracker
  let runningRobMe = d.robInitialMe;
  let runningRobAe = d.robInitialAe;
  let minRobMe = d.robInitialMe;
  let minRobAe = d.robInitialAe;

  const legBreakdown = d.legs.map((leg) => {
    let legDays = 0;
    let legMeCons = 0;
    let legAeCons = 0;

    if (leg.type === 'sea' || leg.type === 'canal') {
      legDays = leg.speed > 0 ? leg.distance / (leg.speed * 24) : 0;
      if (leg.type === 'sea') totalSeaDays += legDays;
      if (leg.type === 'canal') totalCanalDays += legDays;
      totalDistance += leg.distance;
    } else {
      legDays = leg.days;
      if (leg.type === 'port') totalPortDays += legDays;
      if (leg.type === 'anchorage') totalAnchorDays += legDays;
    }

    legMeCons = legDays * leg.consumptionMe;
    legAeCons = legDays * leg.consumptionAe;

    totalMeConsumed += legMeCons;
    totalAeConsumed += legAeCons;

    // Update running ROB
    runningRobMe -= legMeCons;
    runningRobAe -= legAeCons;

    // Add lifted bunker (if bunker stop)
    if (leg.bunkerLifted > 0) {
      runningRobMe += leg.bunkerLifted;
      totalBunkerLifted += leg.bunkerLifted;
      totalBunkerCost += leg.bunkerLifted * (leg.bunkerPrice || d.defaultPriceMe);
    }

    minRobMe = Math.min(minRobMe, runningRobMe);
    minRobAe = Math.min(minRobAe, runningRobAe);

    return {
      ...leg,
      computedDays: legDays,
      computedMeCons: legMeCons,
      computedAeCons: legAeCons,
      runningRobMe,
      runningRobAe,
    };
  });

  const totalDays = totalSeaDays + totalPortDays + totalCanalDays + totalAnchorDays;

  // Total bunker needed (= total consumption)
  const meNeeded = totalMeConsumed;
  const aeNeeded = totalAeConsumed;

  // Net bunker required = consumed + target ROB - initial ROB
  const meDeficit = meNeeded + d.robTargetMe - d.robInitialMe;
  const aeDeficit = aeNeeded + d.robTargetAe - d.robInitialAe;

  // After bunker lifted, net deficit
  const meDeficitAfterLift = Math.max(0, meDeficit - totalBunkerLifted);

  // Safety reserve
  const meSafetyReserve = meNeeded * ((d.reserveMarginPct + d.weatherMarginPct) / 100);
  const aeSafetyReserve = aeNeeded * ((d.reserveMarginPct + d.weatherMarginPct) / 100);

  // Required bunker WITH safety
  const meRequiredWithSafety = meDeficit + meSafetyReserve;
  const aeRequiredWithSafety = aeDeficit + aeSafetyReserve;

  // Tank capacity check
  const meMaxPossibleLift = Math.max(0, d.tankCapacityMe - d.robInitialMe);
  const meAtRiskOfShortage = minRobMe < (d.robInitialMe * 0.05); // less than 5% reserve

  // Final ROB at end
  const finalRobMe = runningRobMe;
  const finalRobAe = runningRobAe;

  // Total voyage cost (if all bunker bought at default price)
  const totalVoyageBunkerCost = (meNeeded * d.defaultPriceMe) + (aeNeeded * d.defaultPriceAe);

  return {
    legBreakdown,
    totalDays,
    totalSeaDays,
    totalPortDays,
    totalCanalDays,
    totalAnchorDays,
    totalDistance,
    totalMeConsumed,
    totalAeConsumed,
    meNeeded,
    aeNeeded,
    meDeficit,
    aeDeficit,
    meDeficitAfterLift,
    meSafetyReserve,
    aeSafetyReserve,
    meRequiredWithSafety,
    aeRequiredWithSafety,
    meMaxPossibleLift,
    meAtRiskOfShortage,
    finalRobMe,
    finalRobAe,
    minRobMe,
    minRobAe,
    totalBunkerLifted,
    totalBunkerCost,
    totalVoyageBunkerCost,
    runningRobMe,
    runningRobAe,
  };
}

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

const LEG_ICONS: Record<LegType, string> = {
  sea: '🌊',
  port: '🏴',
  canal: '🚢',
  anchorage: '⚓',
  bunker_stop: '⛽',
};

const LEG_LABELS: Record<LegType, string> = {
  sea: 'Sea Leg',
  port: 'Port Stay',
  canal: 'Canal Transit',
  anchorage: 'Anchorage',
  bunker_stop: 'Bunker Stop',
};

// ============================================================
// COMPONENT
// ============================================================
export default function BunkerPlannerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingId = searchParams.get('id');

  const [data, setData] = useState<BunkerPlanData>(DEFAULT_DATA);
  const [recordId, setRecordId] = useState<string | null>(existingId);
  const [recordName, setRecordName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (existingId) {
      const saved = loadItem<BunkerPlanData>('bunker', existingId); // re-use 'bunker' key namespace
      if (saved) {
        setData(saved.data);
        setRecordName(saved.name);
      }
    }
  }, [existingId]);

  const calc = useMemo(() => calculate(data), [data]);

  function update<K extends keyof BunkerPlanData>(key: K, value: BunkerPlanData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function addLeg(type: LegType = 'sea') {
    const newLeg: VoyageLeg = {
      id: genId(),
      type,
      name: '',
      distance: type === 'sea' || type === 'canal' ? 1000 : 0,
      speed: type === 'sea' ? 12.5 : type === 'canal' ? 8 : 0,
      days: type === 'port' ? 3 : type === 'anchorage' ? 2 : type === 'bunker_stop' ? 0.5 : 0,
      consumptionMe: type === 'sea' || type === 'canal' ? 28 : type === 'port' || type === 'anchorage' ? 0 : 0,
      consumptionAe: type === 'sea' || type === 'canal' ? 2.5 : type === 'port' || type === 'anchorage' ? 3 : 2,
      bunkerLifted: 0,
      bunkerPrice: data.defaultPriceMe,
      notes: '',
    };
    update('legs', [...data.legs, newLeg]);
  }

  function updateLeg(id: string, updates: Partial<VoyageLeg>) {
    update('legs', data.legs.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  }

  function deleteLeg(id: string) {
    if (!confirm('Delete this leg?')) return;
    update('legs', data.legs.filter((l) => l.id !== id));
  }

  function moveLeg(id: string, direction: 'up' | 'down') {
    const idx = data.legs.findIndex((l) => l.id === id);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === data.legs.length - 1) return;
    const newLegs = [...data.legs];
    const swap = direction === 'up' ? idx - 1 : idx + 1;
    [newLegs[idx], newLegs[swap]] = [newLegs[swap], newLegs[idx]];
    update('legs', newLegs);
  }

  function handleSave() {
    const name = recordName.trim() || `${data.vesselName || 'Vessel'} — ${data.voyageFrom || '?'}→${data.voyageTo || '?'}`;
    const id = recordId || genId();
    saveItem('bunker', name, data, id);
    setRecordId(id);
    setRecordName(name);
    setSaveMsg('✓ Saved');
    setShowSave(false);
    setTimeout(() => setSaveMsg(''), 3000);
  }

  function handleReset() {
    if (!confirm('Reset all fields and remove all legs?')) return;
    setData(DEFAULT_DATA);
    setRecordId(null);
    setRecordName('');
    router.replace('/voyage/bunker-plan');
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>
          ⛽ Voyage Hub · Bunker Planner
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Bunker <em style={g}>Planner</em> & ROB Management
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          Plan voyage bunker requirements — from ROB on delivery to redelivery target. Add legs (sea,
          port, canal, anchorage, bunker stops) and see total fuel needed with safety margins.
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
          <input type="text" value={recordName} onChange={(e) => setRecordName(e.target.value)} placeholder="e.g. MV NEURONAI — Singapore→Rotterdam Bunker Plan" style={{ ...inputStyle, marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{ background: '#c8a84b', color: '#08100a', border: 'none', padding: '8px 14px', fontFamily: rj, fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 3 }}>
              Save
            </button>
            <button onClick={() => setShowSave(false)} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* 1. Vessel & Charter */}
      <div style={card}>
        <div style={sectionTitle}>1. Vessel & Charter</div>
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
              <option>Tanker (LNG)</option>
              <option>General Cargo</option>
            </select>
          </div>
          <div>
            <label style={label}>Charter Type</label>
            <select style={inputStyle} value={data.charterType} onChange={(e) => update('charterType', e.target.value as 'time' | 'voyage')}>
              <option value="time">Time Charter</option>
              <option value="voyage">Voyage Charter</option>
            </select>
          </div>
        </div>
        <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 12 }}>
          <div>
            <label style={label}>From (Delivery)</label>
            <input style={inputStyle} type="text" value={data.voyageFrom} onChange={(e) => update('voyageFrom', e.target.value)} placeholder="Singapore" />
          </div>
          <div>
            <label style={label}>To (Redelivery)</label>
            <input style={inputStyle} type="text" value={data.voyageTo} onChange={(e) => update('voyageTo', e.target.value)} placeholder="Hamburg" />
          </div>
          <div>
            <label style={label}>Main Fuel Type</label>
            <select style={inputStyle} value={data.fuelTypeMain} onChange={(e) => update('fuelTypeMain', e.target.value)}>
              <option>VLSFO</option>
              <option>HFO</option>
              <option>ULSFO</option>
              <option>LSMGO</option>
              <option>LNG</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. ROB on Delivery */}
      <div style={card}>
        <div style={sectionTitle}>2. ROB on Delivery (Kiraya Giriş)</div>
        <p style={{ fontSize: 11.5, color: '#7a8a72', marginBottom: 12, fontFamily: rj }}>
          Bunker quantities on board when charter starts.
        </p>
        <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          <div>
            <label style={label}>{data.fuelTypeMain} on board — MT</label>
            <input style={inputStyle} type="number" step="0.1" value={data.robInitialMe || ''} onChange={(e) => update('robInitialMe', parseFloat(e.target.value) || 0)} placeholder="350" />
          </div>
          <div>
            <label style={label}>MGO/AE on board — MT</label>
            <input style={inputStyle} type="number" step="0.1" value={data.robInitialAe || ''} onChange={(e) => update('robInitialAe', parseFloat(e.target.value) || 0)} placeholder="80" />
          </div>
          <div>
            <label style={label}>ULSFO/ECA fuel — MT</label>
            <input style={inputStyle} type="number" step="0.1" value={data.robInitialUlsfo || ''} onChange={(e) => update('robInitialUlsfo', parseFloat(e.target.value) || 0)} placeholder="0" />
          </div>
        </div>
      </div>

      {/* 3. Target ROB on Redelivery */}
      <div style={card}>
        <div style={sectionTitle}>3. Target ROB on Redelivery (Kiradan Çıkış)</div>
        <p style={{ fontSize: 11.5, color: '#7a8a72', marginBottom: 12, fontFamily: rj }}>
          Bunker quantities required when redelivering vessel (typically same as on delivery for TC).
        </p>
        <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          <div>
            <label style={label}>{data.fuelTypeMain} required — MT</label>
            <input style={inputStyle} type="number" step="0.1" value={data.robTargetMe || ''} onChange={(e) => update('robTargetMe', parseFloat(e.target.value) || 0)} placeholder="350" />
          </div>
          <div>
            <label style={label}>MGO/AE required — MT</label>
            <input style={inputStyle} type="number" step="0.1" value={data.robTargetAe || ''} onChange={(e) => update('robTargetAe', parseFloat(e.target.value) || 0)} placeholder="80" />
          </div>
          <div>
            <label style={label}>ULSFO required — MT</label>
            <input style={inputStyle} type="number" step="0.1" value={data.robTargetUlsfo || ''} onChange={(e) => update('robTargetUlsfo', parseFloat(e.target.value) || 0)} placeholder="0" />
          </div>
        </div>
        <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(200,168,75,.05)', border: '1px solid rgba(200,168,75,.15)', borderRadius: 3, fontSize: 11, color: '#b0c0a4', fontFamily: rj }}>
          💡 <strong>Tip:</strong> For Time Charter, target ROB usually equals delivery ROB. For Voyage
          Charter, only sailing buffer needed (e.g. 30 MT minimum).
        </div>
      </div>

      {/* 4. Voyage Legs */}
      <div style={card}>
        <div style={sectionTitle}>4. Voyage Plan (Add Legs in Order)</div>
        <p style={{ fontSize: 11.5, color: '#7a8a72', marginBottom: 12, fontFamily: rj }}>
          Add each part of the voyage — sea legs, port stays, canal transits, bunker stops.
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          <button onClick={() => addLeg('sea')} style={addBtn}>🌊 + Sea Leg</button>
          <button onClick={() => addLeg('port')} style={addBtn}>🏴 + Port Stay</button>
          <button onClick={() => addLeg('canal')} style={addBtn}>🚢 + Canal</button>
          <button onClick={() => addLeg('anchorage')} style={addBtn}>⚓ + Anchorage</button>
          <button onClick={() => addLeg('bunker_stop')} style={addBtn}>⛽ + Bunker Stop</button>
        </div>

        {data.legs.length === 0 ? (
          <div style={{ padding: 30, textAlign: 'center', color: '#7a8a72', border: '1px dashed rgba(200,168,75,.2)', borderRadius: 4 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
            <p style={{ fontSize: 12 }}>No legs added yet. Click a button above to add the first leg.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {calc.legBreakdown.map((leg, idx) => (
              <LegCard
                key={leg.id}
                leg={leg}
                index={idx + 1}
                onUpdate={(updates) => updateLeg(leg.id, updates)}
                onDelete={() => deleteLeg(leg.id)}
                onMoveUp={() => moveLeg(leg.id, 'up')}
                onMoveDown={() => moveLeg(leg.id, 'down')}
                isFirst={idx === 0}
                isLast={idx === data.legs.length - 1}
                fuelType={data.fuelTypeMain}
              />
            ))}
          </div>
        )}
      </div>

      {/* 5. Safety Margins */}
      <div style={card}>
        <div style={sectionTitle}>5. Safety Margins</div>
        <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          <div>
            <label style={label}>Reserve Margin — %</label>
            <input style={inputStyle} type="number" step="1" value={data.reserveMarginPct || ''} onChange={(e) => update('reserveMarginPct', parseFloat(e.target.value) || 0)} placeholder="10" />
            <span style={{ fontSize: 10, color: '#7a8a72', fontFamily: rj }}>Mandatory safety reserve</span>
          </div>
          <div>
            <label style={label}>Weather Margin — %</label>
            <input style={inputStyle} type="number" step="1" value={data.weatherMarginPct || ''} onChange={(e) => update('weatherMarginPct', parseFloat(e.target.value) || 0)} placeholder="5" />
            <span style={{ fontSize: 10, color: '#7a8a72', fontFamily: rj }}>Adverse weather buffer</span>
          </div>
        </div>
      </div>

      {/* 6. Tank Capacity & Default Prices */}
      <div style={card}>
        <div style={sectionTitle}>6. Tank Capacity & Default Prices</div>
        <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          <div>
            <label style={label}>{data.fuelTypeMain} Tank Capacity — MT</label>
            <input style={inputStyle} type="number" step="10" value={data.tankCapacityMe || ''} onChange={(e) => update('tankCapacityMe', parseFloat(e.target.value) || 0)} placeholder="1500" />
          </div>
          <div>
            <label style={label}>MGO/AE Tank Capacity — MT</label>
            <input style={inputStyle} type="number" step="10" value={data.tankCapacityAe || ''} onChange={(e) => update('tankCapacityAe', parseFloat(e.target.value) || 0)} placeholder="200" />
          </div>
        </div>
        <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginTop: 12 }}>
          <div>
            <label style={label}>Default {data.fuelTypeMain} Price — $/MT</label>
            <input style={inputStyle} type="number" step="1" value={data.defaultPriceMe || ''} onChange={(e) => update('defaultPriceMe', parseFloat(e.target.value) || 0)} placeholder="580" />
          </div>
          <div>
            <label style={label}>Default MGO/AE Price — $/MT</label>
            <input style={inputStyle} type="number" step="1" value={data.defaultPriceAe || ''} onChange={(e) => update('defaultPriceAe', parseFloat(e.target.value) || 0)} placeholder="720" />
          </div>
        </div>
      </div>

      {/* RESULTS */}
      {data.legs.length > 0 && (
        <>
          {/* Quick Summary */}
          <div style={{ ...card, background: 'linear-gradient(135deg,rgba(200,168,75,.08),transparent)', borderColor: 'rgba(200,168,75,.4)' }}>
            <div style={sectionTitle}>⚡ Voyage Summary</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px,1fr))', gap: 14 }}>
              <KpiBox label="Total Days" value={fmt(calc.totalDays, 1)} color="#f5f0e8" sub={`${fmt(calc.totalSeaDays, 1)} sea + ${fmt(calc.totalPortDays + calc.totalAnchorDays, 1)} port`} />
              <KpiBox label="Distance" value={`${fmt(calc.totalDistance, 0)} nm`} color="#f5f0e8" sub="Total" />
              <KpiBox label={`${data.fuelTypeMain} Need`} value={`${fmt(calc.meNeeded, 1)} MT`} color="#c8a84b" sub="Consumption" />
              <KpiBox label="MGO/AE Need" value={`${fmt(calc.aeNeeded, 1)} MT`} color="#c8a84b" sub="Consumption" />
            </div>
          </div>

          {/* Bunker Requirement */}
          <div style={card}>
            <div style={sectionTitle}>💰 Bunker Required to Lift</div>

            <div style={{ ...rowStyle }}>
              <span style={{ color: '#7a8a72' }}>Initial ROB ({data.fuelTypeMain})</span>
              <strong>{fmt(data.robInitialMe, 1)} MT</strong>
            </div>
            <div style={rowStyle}>
              <span style={{ color: '#7a8a72' }}>Total Consumption ({data.fuelTypeMain})</span>
              <strong style={{ color: '#ff8a8a' }}>-{fmt(calc.meNeeded, 1)} MT</strong>
            </div>
            {calc.totalBunkerLifted > 0 && (
              <div style={rowStyle}>
                <span style={{ color: '#7a8a72' }}>Already Planned (Bunker Stops)</span>
                <strong style={{ color: '#4caf76' }}>+{fmt(calc.totalBunkerLifted, 1)} MT</strong>
              </div>
            )}
            <div style={rowStyle}>
              <span style={{ color: '#7a8a72' }}>Target ROB on Redelivery</span>
              <strong>{fmt(data.robTargetMe, 1)} MT</strong>
            </div>
            <div style={{ ...rowStyle, borderTop: '2px solid #c8a84b', paddingTop: 12, marginTop: 10, borderBottom: 'none' }}>
              <span style={{ color: '#c8a84b', fontWeight: 700, fontSize: 14 }}>
                {data.fuelTypeMain} TO LIFT (without safety)
              </span>
              <strong style={{ fontFamily: lb, fontSize: 22, color: '#c8a84b' }}>
                {fmt(Math.max(0, calc.meDeficit - calc.totalBunkerLifted), 1)} MT
              </strong>
            </div>
            <div style={{ ...rowStyle, borderBottom: 'none', paddingTop: 12 }}>
              <span style={{ color: '#c8a84b', fontWeight: 700, fontSize: 14 }}>
                {data.fuelTypeMain} TO LIFT (with safety +{data.reserveMarginPct + data.weatherMarginPct}%)
              </span>
              <strong style={{ fontFamily: lb, fontSize: 22, color: '#4caf76' }}>
                {fmt(Math.max(0, calc.meDeficit - calc.totalBunkerLifted + calc.meSafetyReserve), 1)} MT
              </strong>
            </div>
          </div>

          {/* MGO requirement */}
          <div style={card}>
            <div style={sectionTitle}>💧 MGO/AE Required</div>
            <div style={rowStyle}>
              <span style={{ color: '#7a8a72' }}>Initial ROB (AE)</span>
              <strong>{fmt(data.robInitialAe, 1)} MT</strong>
            </div>
            <div style={rowStyle}>
              <span style={{ color: '#7a8a72' }}>Total AE Consumption</span>
              <strong style={{ color: '#ff8a8a' }}>-{fmt(calc.aeNeeded, 1)} MT</strong>
            </div>
            <div style={rowStyle}>
              <span style={{ color: '#7a8a72' }}>Target ROB AE</span>
              <strong>{fmt(data.robTargetAe, 1)} MT</strong>
            </div>
            <div style={{ ...rowStyle, borderBottom: 'none', borderTop: '2px solid #c8a84b', paddingTop: 12, marginTop: 6 }}>
              <span style={{ color: '#c8a84b', fontWeight: 700 }}>MGO TO LIFT (with safety)</span>
              <strong style={{ fontFamily: lb, fontSize: 18, color: '#4caf76' }}>
                {fmt(Math.max(0, calc.aeDeficit + calc.aeSafetyReserve), 1)} MT
              </strong>
            </div>
          </div>

          {/* Final ROB at Voyage End */}
          <div style={{ ...card, background: calc.finalRobMe >= data.robTargetMe ? 'linear-gradient(135deg,rgba(76,175,118,.05),transparent)' : 'linear-gradient(135deg,rgba(255,138,138,.05),transparent)', borderColor: calc.finalRobMe >= data.robTargetMe ? 'rgba(76,175,118,.4)' : 'rgba(255,138,138,.4)' }}>
            <div style={sectionTitle}>🏁 Final ROB Projection</div>
            <div style={rowStyle}>
              <span style={{ color: '#7a8a72' }}>Final {data.fuelTypeMain} (without new lifts)</span>
              <strong style={{ color: calc.finalRobMe >= data.robTargetMe ? '#4caf76' : '#ff8a8a' }}>
                {fmt(calc.finalRobMe, 1)} MT
                {calc.finalRobMe < data.robTargetMe && ' ⚠'}
              </strong>
            </div>
            <div style={rowStyle}>
              <span style={{ color: '#7a8a72' }}>Final MGO/AE (without new lifts)</span>
              <strong style={{ color: calc.finalRobAe >= data.robTargetAe ? '#4caf76' : '#ff8a8a' }}>
                {fmt(calc.finalRobAe, 1)} MT
                {calc.finalRobAe < data.robTargetAe && ' ⚠'}
              </strong>
            </div>
            <div style={rowStyle}>
              <span style={{ color: '#7a8a72' }}>Minimum ROB during voyage</span>
              <strong style={{ color: calc.minRobMe > 0 ? '#4caf76' : '#ff8a8a' }}>
                {fmt(calc.minRobMe, 1)} MT
                {calc.minRobMe <= 0 && ' ❌ FUEL SHORTAGE!'}
              </strong>
            </div>
            <div style={{ ...rowStyle, borderBottom: 'none' }}>
              <span style={{ color: '#7a8a72' }}>Tank Capacity Check</span>
              <strong style={{ color: data.robInitialMe + calc.meDeficit <= data.tankCapacityMe ? '#4caf76' : '#ff8a8a' }}>
                Max lift possible: {fmt(calc.meMaxPossibleLift, 0)} MT
              </strong>
            </div>
          </div>

          {/* Cost */}
          <div style={{ ...card, background: 'linear-gradient(135deg,rgba(200,168,75,.12),transparent)', borderColor: '#c8a84b' }}>
            <div style={{ ...sectionTitle, borderBottom: 'none' }}>💵 Total Bunker Cost</div>
            <div style={rowStyle}>
              <span style={{ color: '#7a8a72' }}>{data.fuelTypeMain} Cost ({fmt(calc.meNeeded, 1)} MT × ${data.defaultPriceMe})</span>
              <strong>{fmtMoney(calc.meNeeded * data.defaultPriceMe)}</strong>
            </div>
            <div style={rowStyle}>
              <span style={{ color: '#7a8a72' }}>MGO/AE Cost ({fmt(calc.aeNeeded, 1)} MT × ${data.defaultPriceAe})</span>
              <strong>{fmtMoney(calc.aeNeeded * data.defaultPriceAe)}</strong>
            </div>
            <div style={{ ...rowStyle, borderTop: '2px solid #c8a84b', paddingTop: 14, marginTop: 6, borderBottom: 'none' }}>
              <span style={{ color: '#c8a84b', fontWeight: 700, fontSize: 16 }}>TOTAL VOYAGE BUNKER COST</span>
              <strong style={{ fontFamily: lb, fontSize: 24, color: '#c8a84b' }}>
                {fmtMoney(calc.totalVoyageBunkerCost)}
              </strong>
            </div>
          </div>

          {/* Warnings */}
          {(calc.meAtRiskOfShortage || calc.finalRobMe < data.robTargetMe || calc.minRobMe < 0) && (
            <div style={{ ...card, background: 'rgba(255,138,138,.06)', borderColor: 'rgba(255,138,138,.4)' }}>
              <div style={{ fontFamily: rj, fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#ff8a8a', fontWeight: 700, marginBottom: 10 }}>
                ⚠ Warnings
              </div>
              <ul style={{ fontSize: 12.5, color: '#b0c0a4', lineHeight: 1.7, paddingLeft: 18 }}>
                {calc.minRobMe <= 0 && (
                  <li>
                    <strong style={{ color: '#ff8a8a' }}>FUEL SHORTAGE!</strong> Minimum ROB during voyage goes to {fmt(calc.minRobMe, 1)} MT. Add a bunker stop before this point.
                  </li>
                )}
                {calc.finalRobMe < data.robTargetMe && calc.minRobMe > 0 && (
                  <li>
                    Final ROB ({fmt(calc.finalRobMe, 1)} MT) below target ({fmt(data.robTargetMe, 1)} MT) — need to lift more bunker.
                  </li>
                )}
                {calc.meAtRiskOfShortage && (
                  <li>Low reserve risk — minimum ROB very low during voyage.</li>
                )}
                {data.robInitialMe + calc.meDeficit > data.tankCapacityMe && (
                  <li>
                    <strong>Tank capacity exceeded:</strong> Need {fmt(calc.meDeficit, 1)} MT but only {fmt(calc.meMaxPossibleLift, 1)} MT free. Plan multiple bunker stops.
                  </li>
                )}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Notes */}
      <div style={card}>
        <div style={sectionTitle}>Notes</div>
        <textarea
          value={data.notes}
          onChange={(e) => update('notes', e.target.value)}
          placeholder="Additional remarks, charter terms, etc."
          rows={3}
          style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }}
        />
      </div>

      <style>{`
        @media (max-width: 720px) {
          .g3 { grid-template-columns: 1fr !important; }
          .leg-grid { grid-template-columns: 1fr !important; }
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
// LEG CARD
// ============================================================
function LegCard({
  leg,
  index,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  fuelType,
}: {
  leg: VoyageLeg & { computedDays: number; computedMeCons: number; computedAeCons: number; runningRobMe: number; runningRobAe: number };
  index: number;
  onUpdate: (updates: Partial<VoyageLeg>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  fuelType: string;
}) {
  return (
    <div style={{ background: '#0c1610', border: '1px solid rgba(200,168,75,.18)', borderRadius: 4, padding: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
        <div
          style={{
            background: 'rgba(200,168,75,.15)',
            color: '#c8a84b',
            padding: '4px 10px',
            borderRadius: 3,
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          #{index}
        </div>
        <div style={{ fontSize: 20 }}>{LEG_ICONS[leg.type]}</div>
        <select
          value={leg.type}
          onChange={(e) => onUpdate({ type: e.target.value as LegType })}
          style={{
            background: '#0c1610',
            border: '1px solid rgba(200,168,75,.2)',
            color: '#f5f0e8',
            padding: '4px 8px',
            fontFamily: rj,
            fontSize: 12,
            borderRadius: 3,
            cursor: 'pointer',
          }}
        >
          {Object.entries(LEG_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <input
          type="text"
          value={leg.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Leg name (e.g. Singapore → Suez)"
          style={{ ...inputStyle, flex: 1, minWidth: 150 }}
        />
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={onMoveUp} disabled={isFirst} style={moveBtn(isFirst)}>↑</button>
          <button onClick={onMoveDown} disabled={isLast} style={moveBtn(isLast)}>↓</button>
          <button
            onClick={onDelete}
            style={{ background: 'transparent', border: '1px solid rgba(255,138,138,.3)', color: '#ff8a8a', padding: '4px 10px', fontFamily: rj, fontSize: 11, cursor: 'pointer', borderRadius: 3 }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Inputs based on type */}
      <div className="leg-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        {(leg.type === 'sea' || leg.type === 'canal') && (
          <>
            <div>
              <label style={label}>Distance — nm</label>
              <input style={inputStyle} type="number" step="1" value={leg.distance || ''} onChange={(e) => onUpdate({ distance: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label style={label}>Speed — kts</label>
              <input style={inputStyle} type="number" step="0.1" value={leg.speed || ''} onChange={(e) => onUpdate({ speed: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label style={label}>ME Cons — MT/day</label>
              <input style={inputStyle} type="number" step="0.1" value={leg.consumptionMe || ''} onChange={(e) => onUpdate({ consumptionMe: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label style={label}>AE Cons — MT/day</label>
              <input style={inputStyle} type="number" step="0.1" value={leg.consumptionAe || ''} onChange={(e) => onUpdate({ consumptionAe: parseFloat(e.target.value) || 0 })} />
            </div>
          </>
        )}

        {(leg.type === 'port' || leg.type === 'anchorage') && (
          <>
            <div>
              <label style={label}>Days</label>
              <input style={inputStyle} type="number" step="0.1" value={leg.days || ''} onChange={(e) => onUpdate({ days: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label style={label}>ME Cons — MT/day</label>
              <input style={inputStyle} type="number" step="0.1" value={leg.consumptionMe || ''} onChange={(e) => onUpdate({ consumptionMe: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label style={label}>AE Cons — MT/day</label>
              <input style={inputStyle} type="number" step="0.1" value={leg.consumptionAe || ''} onChange={(e) => onUpdate({ consumptionAe: parseFloat(e.target.value) || 0 })} />
            </div>
          </>
        )}

        {leg.type === 'bunker_stop' && (
          <>
            <div>
              <label style={label}>Days at Port</label>
              <input style={inputStyle} type="number" step="0.1" value={leg.days || ''} onChange={(e) => onUpdate({ days: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label style={label}>{fuelType} Lifted — MT</label>
              <input style={inputStyle} type="number" step="0.1" value={leg.bunkerLifted || ''} onChange={(e) => onUpdate({ bunkerLifted: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label style={label}>Price — $/MT</label>
              <input style={inputStyle} type="number" step="1" value={leg.bunkerPrice || ''} onChange={(e) => onUpdate({ bunkerPrice: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label style={label}>AE Cons during stop</label>
              <input style={inputStyle} type="number" step="0.1" value={leg.consumptionAe || ''} onChange={(e) => onUpdate({ consumptionAe: parseFloat(e.target.value) || 0 })} />
            </div>
          </>
        )}
      </div>

      {/* Computed values */}
      <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(200,168,75,.05)', border: '1px solid rgba(200,168,75,.15)', borderRadius: 3, fontSize: 11, fontFamily: rj, color: '#b0c0a4' }}>
        ⏱️ <strong style={{ color: '#f5f0e8' }}>{fmt(leg.computedDays, 2)} days</strong>
        {' · '}⛽ {fuelType}: <strong style={{ color: '#f5f0e8' }}>{fmt(leg.computedMeCons, 1)} MT</strong>
        {' · '}AE: <strong style={{ color: '#f5f0e8' }}>{fmt(leg.computedAeCons, 1)} MT</strong>
        {' · '}🏁 ROB after: <strong style={{ color: leg.runningRobMe > 0 ? '#4caf76' : '#ff8a8a' }}>{fmt(leg.runningRobMe, 1)} MT</strong>
        {leg.bunkerLifted > 0 && (
          <span style={{ color: '#4caf76', fontWeight: 700 }}> {' · '}+{fmt(leg.bunkerLifted, 0)} MT lifted ({fmtMoney(leg.bunkerLifted * (leg.bunkerPrice || 0))})</span>
        )}
      </div>
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================
const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 0',
  borderBottom: '1px dashed rgba(200,168,75,.1)',
  fontFamily: rj,
  fontSize: 13,
};

const addBtn: React.CSSProperties = {
  background: 'transparent',
  color: '#c8a84b',
  border: '1px solid rgba(200,168,75,.3)',
  padding: '7px 12px',
  fontFamily: rj,
  fontSize: 11,
  letterSpacing: '.5px',
  fontWeight: 600,
  cursor: 'pointer',
  borderRadius: 3,
};

const moveBtn = (disabled: boolean): React.CSSProperties => ({
  background: 'transparent',
  border: '1px solid rgba(200,168,75,.2)',
  color: disabled ? '#7a8a72' : '#c8a84b',
  padding: '4px 8px',
  fontFamily: rj,
  fontSize: 12,
  cursor: disabled ? 'not-allowed' : 'pointer',
  borderRadius: 3,
  opacity: disabled ? 0.4 : 1,
});

function KpiBox({ label, value, color, sub }: { label: string; value: string; color: string; sub?: string }) {
  return (
    <div style={{ background: '#0c1610', padding: '12px 14px', border: '1px solid rgba(200,168,75,.15)', borderRadius: 3 }}>
      <div style={{ fontFamily: rj, fontSize: 10, color: '#7a8a72', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6, fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontFamily: lb, fontSize: 18, fontWeight: 700, color, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontFamily: rj, fontSize: 10.5, color: '#b0c0a4', marginTop: 4, fontWeight: 500 }}>{sub}</div>}
    </div>
  );
}
