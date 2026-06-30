'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { saveItem, loadItem, genId } from '@/lib/voyage-storage';

const lb = "'Libre Bodoni', serif";
const rj = "'Rajdhani', sans-serif";
const g = { color: '#c8a84b', fontStyle: 'italic' };

// ============================================================
// FUEL DATA (IMO / EU Regulation)
// ============================================================
// CO2 emission factors (g CO2 / g fuel) — IMO MEPC.364(79)
// LCV (Lower Calorific Value) MJ/kg — EU FuelEU Maritime
interface FuelType {
  key: string;
  name: string;
  co2Factor: number; // g CO2 / g fuel (Tank-to-Wake)
  lcv: number; // MJ/kg
  wtwFactor: number; // Well-to-Wake gCO2eq/MJ — FuelEU
}

const FUELS: FuelType[] = [
  { key: 'HFO', name: 'HFO (Heavy Fuel Oil)', co2Factor: 3.114, lcv: 40.5, wtwFactor: 91.7 },
  { key: 'VLSFO', name: 'VLSFO (0.5% sulphur)', co2Factor: 3.114, lcv: 40.5, wtwFactor: 91.7 },
  { key: 'ULSFO', name: 'ULSFO (0.1% sulphur)', co2Factor: 3.114, lcv: 40.5, wtwFactor: 91.4 },
  { key: 'LSMGO', name: 'LSMGO (Marine Gas Oil)', co2Factor: 3.206, lcv: 42.7, wtwFactor: 94.4 },
  { key: 'MGO', name: 'MGO (Marine Gas Oil)', co2Factor: 3.206, lcv: 42.7, wtwFactor: 94.4 },
  { key: 'MDO', name: 'MDO (Marine Diesel Oil)', co2Factor: 3.206, lcv: 42.7, wtwFactor: 94.4 },
  { key: 'LNG', name: 'LNG (Liquefied Natural Gas)', co2Factor: 2.75, lcv: 50.0, wtwFactor: 76.4 },
  { key: 'LPG_P', name: 'LPG (Propane)', co2Factor: 3.0, lcv: 46.0, wtwFactor: 76.3 },
  { key: 'LPG_B', name: 'LPG (Butane)', co2Factor: 3.03, lcv: 45.8, wtwFactor: 76.3 },
  { key: 'METHANOL_F', name: 'Methanol (Fossil)', co2Factor: 1.375, lcv: 19.9, wtwFactor: 99.1 },
  { key: 'METHANOL_BIO', name: 'Methanol (Bio)', co2Factor: 1.375, lcv: 19.9, wtwFactor: 13.0 },
  { key: 'B30', name: 'B30 Biofuel Blend', co2Factor: 2.18, lcv: 41.0, wtwFactor: 63.0 },
  { key: 'B100', name: 'B100 Biofuel (FAME)', co2Factor: 0, lcv: 37.2, wtwFactor: 13.0 },
  { key: 'AMMONIA', name: 'Ammonia (Green)', co2Factor: 0, lcv: 18.6, wtwFactor: 14.0 },
  { key: 'HYDROGEN', name: 'Hydrogen (Green)', co2Factor: 0, lcv: 120, wtwFactor: 6.0 },
];

// ============================================================
// CII REFERENCE LINES (IMO MEPC.353(78))
// Simplified formula: CII_ref = a × Capacity^(-c)
// Capacity = DWT for most, GT for some
// ============================================================
interface VesselTypeData {
  key: string;
  name: string;
  a: number;
  c: number;
  capacityType: 'DWT' | 'GT';
  minSize: number;
}

const VESSEL_TYPES: VesselTypeData[] = [
  { key: 'BULK', name: 'Bulk Carrier', a: 4745, c: 0.622, capacityType: 'DWT', minSize: 5000 },
  { key: 'TANKER', name: 'Tanker (Crude/Product)', a: 5247, c: 0.610, capacityType: 'DWT', minSize: 5000 },
  { key: 'CONTAINER', name: 'Container Ship', a: 1984, c: 0.489, capacityType: 'DWT', minSize: 5000 },
  { key: 'GAS', name: 'Gas Carrier', a: 8104, c: 0.639, capacityType: 'DWT', minSize: 5000 },
  { key: 'LNG', name: 'LNG Carrier', a: 9.827, c: 0.0, capacityType: 'GT', minSize: 5000 },
  { key: 'GENERAL', name: 'General Cargo', a: 31948, c: 0.792, capacityType: 'DWT', minSize: 5000 },
  { key: 'REFRIG', name: 'Refrigerated Cargo', a: 4600, c: 0.5, capacityType: 'DWT', minSize: 5000 },
  { key: 'COMBI', name: 'Combination Carrier', a: 5119, c: 0.622, capacityType: 'DWT', minSize: 5000 },
  { key: 'RORO_CARGO', name: 'Ro-Ro Cargo Ship', a: 10952, c: 0.629, capacityType: 'GT', minSize: 5000 },
  { key: 'RORO_PAX', name: 'Ro-Ro Passenger Ship', a: 902, c: 0.381, capacityType: 'GT', minSize: 5000 },
  { key: 'CRUISE', name: 'Cruise Passenger Ship', a: 930, c: 0.383, capacityType: 'GT', minSize: 5000 },
  { key: 'VEHICLE', name: 'Vehicle Carrier', a: 5739, c: 0.631, capacityType: 'GT', minSize: 5000 },
];

// CII reduction factors per year (% reduction from 2019 baseline)
const CII_REDUCTION: Record<number, number> = {
  2023: 0.05,
  2024: 0.07,
  2025: 0.09,
  2026: 0.11,
  2027: 0.135,
  2028: 0.16,
  2029: 0.185,
  2030: 0.21,
};

// CII rating thresholds (vector multipliers d1-d4 from MEPC.339(76))
// Simplified average across vessel types — actual values vary slightly
const RATING_THRESHOLDS = {
  A: 0.86,
  B: 0.94,
  C: 1.07,
  D: 1.19,
};

// ============================================================
// EU ETS PHASE-IN
// ============================================================
const ETS_PHASE_IN: Record<number, number> = {
  2024: 0.4,
  2025: 0.7,
  2026: 1.0,
  2027: 1.0,
};

// ============================================================
// FUELEU MARITIME REDUCTION (vs 2020 baseline of 91.16)
// ============================================================
const FUELEU_BASELINE = 91.16; // gCO2eq/MJ
const FUELEU_REDUCTION: Record<number, number> = {
  2025: 0.02,
  2026: 0.02,
  2027: 0.02,
  2028: 0.02,
  2029: 0.02,
  2030: 0.06,
  2035: 0.145,
  2040: 0.31,
  2045: 0.62,
  2050: 0.80,
};

const FUELEU_PENALTY = 2400; // EUR per tonne VLSFO-equivalent

// ============================================================
// TYPES
// ============================================================
interface FuelEntry {
  id: string;
  fuelType: string;
  consumption: number; // MT
}

interface CIIData {
  // Vessel
  vesselName: string;
  imo: string;
  vesselType: string;
  dwt: number;
  gt: number;

  // Period & Voyage
  reportingYear: number;
  voyageDistance: number; // nm (or annual for CII)
  annualDistance: number; // nm — for CII calc
  cargoCarried: number; // tonnes (for transport work)

  // Fuels used (this voyage / period)
  fuels: FuelEntry[];

  // EU ETS specific
  voyageType: 'EU_EU' | 'EU_NONEU_FROM_EU' | 'EU_NONEU_TO_EU' | 'EU_PORT_STAY' | 'NON_EU';
  euaPrice: number; // €/tonne CO2

  // FuelEU
  applyFuelEU: boolean;

  notes: string;
}

const DEFAULT_DATA: CIIData = {
  vesselName: '',
  imo: '',
  vesselType: 'BULK',
  dwt: 76000,
  gt: 42500,
  reportingYear: 2026,
  voyageDistance: 0,
  annualDistance: 60000,
  cargoCarried: 0,
  fuels: [{ id: 'init', fuelType: 'VLSFO', consumption: 0 }],
  voyageType: 'EU_EU',
  euaPrice: 78,
  applyFuelEU: true,
  notes: '',
};

// ============================================================
// CALCULATIONS
// ============================================================
function calculate(d: CIIData) {
  // Total CO2 emissions from all fuels
  let totalCo2Mt = 0; // metric tonnes CO2 (Tank-to-Wake)
  let totalEnergyMJ = 0;
  let totalWtwCo2eqG = 0; // g CO2eq (Well-to-Wake)

  const fuelBreakdown: { fuel: FuelType | undefined; mt: number; co2Mt: number; energyMJ: number; wtwCo2eqG: number }[] = [];

  for (const f of d.fuels) {
    const fuel = FUELS.find((x) => x.key === f.fuelType);
    if (!fuel || !f.consumption) continue;

    const co2Mt = (f.consumption * fuel.co2Factor) / 1; // f.consumption MT × factor = MT CO2
    const energyMJ = f.consumption * 1000 * fuel.lcv; // kg × MJ/kg = MJ
    const wtwCo2eqG = energyMJ * fuel.wtwFactor; // g CO2eq

    totalCo2Mt += co2Mt;
    totalEnergyMJ += energyMJ;
    totalWtwCo2eqG += wtwCo2eqG;

    fuelBreakdown.push({ fuel, mt: f.consumption, co2Mt, energyMJ, wtwCo2eqG });
  }

  // ====================
  // CII CALCULATION
  // ====================
  const vType = VESSEL_TYPES.find((v) => v.key === d.vesselType);
  let ciiRef = 0;
  let attainedCII = 0;
  let requiredCII = 0;
  let ciiRatio = 0;
  let ciiGrade: 'A' | 'B' | 'C' | 'D' | 'E' = 'C';
  let annualCo2Mt = 0;
  let annualTransportWork = 0;

  if (vType && d.annualDistance > 0) {
    const capacity = vType.capacityType === 'DWT' ? d.dwt : d.gt;

    // CII Reference line
    ciiRef = vType.a * Math.pow(capacity, -vType.c);

    // Required CII (year-adjusted)
    const reduction = CII_REDUCTION[d.reportingYear] || 0.11;
    requiredCII = ciiRef * (1 - reduction);

    // Estimate annual emissions: scale voyage CO2 to full year by distance
    // If voyageDistance > 0, use it. Otherwise, treat fuels as annual.
    const distanceFactor = d.voyageDistance > 0 ? d.annualDistance / d.voyageDistance : 1;
    annualCo2Mt = totalCo2Mt * distanceFactor;

    // Transport work = DWT × distance (g CO2 / DWT.nm)
    annualTransportWork = capacity * d.annualDistance;
    if (annualTransportWork > 0) {
      attainedCII = (annualCo2Mt * 1_000_000) / annualTransportWork; // gCO2 / DWT.nm
      ciiRatio = attainedCII / requiredCII;

      if (ciiRatio < RATING_THRESHOLDS.A) ciiGrade = 'A';
      else if (ciiRatio < RATING_THRESHOLDS.B) ciiGrade = 'B';
      else if (ciiRatio < RATING_THRESHOLDS.C) ciiGrade = 'C';
      else if (ciiRatio < RATING_THRESHOLDS.D) ciiGrade = 'D';
      else ciiGrade = 'E';
    }
  }

  // ====================
  // EU ETS CALCULATION
  // ====================
  let etsCoveragePct = 0;
  switch (d.voyageType) {
    case 'EU_EU':
      etsCoveragePct = 1.0;
      break;
    case 'EU_NONEU_FROM_EU':
    case 'EU_NONEU_TO_EU':
      etsCoveragePct = 0.5;
      break;
    case 'EU_PORT_STAY':
      etsCoveragePct = 0.5;
      break;
    case 'NON_EU':
      etsCoveragePct = 0;
      break;
  }

  const etsPhaseIn = ETS_PHASE_IN[d.reportingYear] || 1.0;
  const etsCoveredCo2 = totalCo2Mt * etsCoveragePct * etsPhaseIn;
  const etsCost = etsCoveredCo2 * d.euaPrice;

  // ====================
  // FUELEU CALCULATION
  // ====================
  let fuelEuActualIntensity = 0;
  let fuelEuRequiredIntensity = 0;
  let fuelEuCompliance = 0;
  let fuelEuPenalty = 0;
  let fuelEuStatus: 'compliant' | 'deficit' | 'na' = 'na';

  if (d.applyFuelEU && totalEnergyMJ > 0) {
    fuelEuActualIntensity = totalWtwCo2eqG / totalEnergyMJ;

    const reduction = FUELEU_REDUCTION[d.reportingYear] || 0.02;
    fuelEuRequiredIntensity = FUELEU_BASELINE * (1 - reduction);

    fuelEuCompliance = fuelEuRequiredIntensity - fuelEuActualIntensity;

    if (fuelEuCompliance < 0) {
      // Penalty: compliance deficit converted to VLSFO equivalent
      const deficitMJ = -fuelEuCompliance * totalEnergyMJ;
      const vlsfoEquivKg = deficitMJ / 40.5; // VLSFO LCV
      const vlsfoEquivMt = vlsfoEquivKg / 1000;
      fuelEuPenalty = vlsfoEquivMt * FUELEU_PENALTY;
      fuelEuStatus = 'deficit';
    } else {
      fuelEuStatus = 'compliant';
    }
  }

  return {
    fuelBreakdown,
    totalCo2Mt,
    totalEnergyMJ,
    totalWtwCo2eqG,
    annualCo2Mt,
    annualTransportWork,
    ciiRef,
    requiredCII,
    attainedCII,
    ciiRatio,
    ciiGrade,
    etsCoveragePct,
    etsPhaseIn,
    etsCoveredCo2,
    etsCost,
    fuelEuActualIntensity,
    fuelEuRequiredIntensity,
    fuelEuCompliance,
    fuelEuPenalty,
    fuelEuStatus,
  };
}

// Helpers
function fmt(n: number, dec = 2): string {
  if (!isFinite(n)) return '–';
  return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function fmtMoney(n: number, cur = '€'): string {
  if (!isFinite(n)) return cur + '0';
  return `${cur}${Math.round(n).toLocaleString('en-US')}`;
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

const GRADE_COLORS: Record<string, string> = {
  A: '#4caf76',
  B: '#7ec47d',
  C: '#c8a84b',
  D: '#e89c5a',
  E: '#ff8a8a',
};

// ============================================================
// COMPONENT
// ============================================================
export default function CIICalculatorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingId = searchParams.get('id');

  const [data, setData] = useState<CIIData>(DEFAULT_DATA);
  const [recordId, setRecordId] = useState<string | null>(existingId);
  const [recordName, setRecordName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [view, setView] = useState<'input' | 'report'>('input');

  useEffect(() => {
    if (existingId) {
      const saved = loadItem<CIIData>('cii', existingId);
      if (saved) {
        setData(saved.data);
        setRecordName(saved.name);
      }
    }
  }, [existingId]);

  const calc = useMemo(() => calculate(data), [data]);

  function update<K extends keyof CIIData>(key: K, value: CIIData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function addFuel() {
    update('fuels', [...data.fuels, { id: genId(), fuelType: 'VLSFO', consumption: 0 }]);
  }
  function updateFuel(id: string, updates: Partial<FuelEntry>) {
    update('fuels', data.fuels.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  }
  function deleteFuel(id: string) {
    if (data.fuels.length <= 1) return;
    update('fuels', data.fuels.filter((f) => f.id !== id));
  }

  function handleSave() {
    const name = recordName.trim() || `${data.vesselName || 'Vessel'} — CII ${data.reportingYear}`;
    const id = recordId || genId();
    saveItem('cii', name, data, id);
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
    router.replace('/voyage/cii');
  }
  function handlePrint() {
    window.print();
  }

  const vType = VESSEL_TYPES.find((v) => v.key === data.vesselType);
  const capacity = vType?.capacityType === 'DWT' ? data.dwt : data.gt;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>
          🌍 Voyage Hub · Compliance Calculator
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          CII · EU ETS · <em style={g}>FuelEU</em> Maritime
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          Carbon Intensity Indicator (A–E rating), EU ETS allowance cost, and FuelEU Maritime
          compliance. Based on IMO MEPC, EU regulation 2023/957, and FuelEU Regulation 2023/1805.
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
            placeholder={`e.g. ${data.vesselName || 'Vessel'} CII ${data.reportingYear}`}
            style={{ ...inputStyle, marginBottom: 10 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleSave}
              style={{
                background: '#c8a84b',
                color: '#08100a',
                border: 'none',
                padding: '8px 14px',
                fontFamily: rj,
                fontSize: 11,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                fontWeight: 700,
                cursor: 'pointer',
                borderRadius: 3,
              }}
            >
              Save
            </button>
            <button onClick={() => setShowSave(false)} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {view === 'input' ? (
        <>
          {/* 1. Vessel Info */}
          <div style={card}>
            <div style={sectionTitle}>1. Vessel Information</div>
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
                <label style={label}>Reporting Year</label>
                <select style={inputStyle} value={data.reportingYear} onChange={(e) => update('reportingYear', parseInt(e.target.value))}>
                  {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 12 }}>
              <div>
                <label style={label}>Vessel Type</label>
                <select style={inputStyle} value={data.vesselType} onChange={(e) => update('vesselType', e.target.value)}>
                  {VESSEL_TYPES.map((v) => (
                    <option key={v.key} value={v.key}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={label}>DWT (Deadweight)</label>
                <input style={inputStyle} type="number" step="100" value={data.dwt || ''} onChange={(e) => update('dwt', parseFloat(e.target.value) || 0)} placeholder="76000" />
              </div>
              <div>
                <label style={label}>GT (Gross Tonnage)</label>
                <input style={inputStyle} type="number" step="100" value={data.gt || ''} onChange={(e) => update('gt', parseFloat(e.target.value) || 0)} placeholder="42500" />
              </div>
            </div>
            <p style={{ fontSize: 10.5, color: '#7a8a72', marginTop: 8, fontFamily: rj }}>
              CII uses <strong style={{ color: '#c8a84b' }}>{vType?.capacityType}</strong> for {vType?.name} ({capacity ? capacity.toLocaleString() : '0'})
            </p>
          </div>

          {/* 2. Distance & Cargo */}
          <div style={card}>
            <div style={sectionTitle}>2. Distance & Cargo</div>
            <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              <div>
                <label style={label}>Voyage Distance — nm (this voyage)</label>
                <input style={inputStyle} type="number" step="1" value={data.voyageDistance || ''} onChange={(e) => update('voyageDistance', parseFloat(e.target.value) || 0)} placeholder="8432" />
                <span style={{ fontSize: 10, color: '#7a8a72', fontFamily: rj }}>
                  Leave 0 for full-year analysis
                </span>
              </div>
              <div>
                <label style={label}>Annual Distance — nm</label>
                <input style={inputStyle} type="number" step="1000" value={data.annualDistance || ''} onChange={(e) => update('annualDistance', parseFloat(e.target.value) || 0)} placeholder="60000" />
                <span style={{ fontSize: 10, color: '#7a8a72', fontFamily: rj }}>
                  For CII annual rating
                </span>
              </div>
              <div>
                <label style={label}>Cargo Carried — tonnes (optional)</label>
                <input style={inputStyle} type="number" step="1000" value={data.cargoCarried || ''} onChange={(e) => update('cargoCarried', parseFloat(e.target.value) || 0)} placeholder="75000" />
              </div>
            </div>
          </div>

          {/* 3. Fuel Consumption */}
          <div style={card}>
            <div style={sectionTitle}>3. Fuel Consumption</div>
            <p style={{ fontSize: 11, color: '#7a8a72', marginBottom: 12, fontFamily: rj }}>
              Add all fuels consumed during the voyage/period (Metric Tonnes). System automatically
              applies IMO CO2 factors and EU FuelEU well-to-wake values.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.fuels.map((f) => {
                const fuel = FUELS.find((x) => x.key === f.fuelType);
                return (
                  <div
                    key={f.id}
                    style={{
                      background: '#0c1610',
                      border: '1px solid rgba(200,168,75,.15)',
                      padding: '10px 12px',
                      borderRadius: 3,
                    }}
                  >
                    <div className="fuel-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 10, alignItems: 'center' }}>
                      <select
                        value={f.fuelType}
                        onChange={(e) => updateFuel(f.id, { fuelType: e.target.value })}
                        style={inputStyle}
                      >
                        {FUELS.map((x) => (
                          <option key={x.key} value={x.key}>
                            {x.name}
                          </option>
                        ))}
                      </select>
                      <div>
                        <input
                          type="number"
                          step="0.1"
                          value={f.consumption || ''}
                          onChange={(e) => updateFuel(f.id, { consumption: parseFloat(e.target.value) || 0 })}
                          placeholder="MT"
                          style={inputStyle}
                        />
                      </div>
                      <button
                        onClick={() => deleteFuel(f.id)}
                        disabled={data.fuels.length <= 1}
                        style={{
                          background: 'transparent',
                          border: '1px solid rgba(255,138,138,.3)',
                          color: '#ff8a8a',
                          padding: '6px 10px',
                          fontFamily: rj,
                          fontSize: 11,
                          cursor: data.fuels.length <= 1 ? 'not-allowed' : 'pointer',
                          opacity: data.fuels.length <= 1 ? 0.4 : 1,
                          borderRadius: 3,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    {fuel && f.consumption > 0 && (
                      <div style={{ fontSize: 10.5, color: '#7a8a72', marginTop: 6, fontFamily: rj }}>
                        → CO2: <strong style={{ color: '#f5f0e8' }}>{fmt(f.consumption * fuel.co2Factor, 1)} MT</strong> · Energy: <strong style={{ color: '#f5f0e8' }}>{fmt(f.consumption * fuel.lcv, 0)} GJ</strong>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              onClick={addFuel}
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
              + Add Fuel
            </button>
          </div>

          {/* 4. EU ETS */}
          <div style={card}>
            <div style={sectionTitle}>4. EU ETS Maritime</div>
            <p style={{ fontSize: 11, color: '#7a8a72', marginBottom: 12, fontFamily: rj }}>
              Applicable for vessels &gt;5,000 GT calling at EU/EEA ports. Phase-in: {(ETS_PHASE_IN[data.reportingYear] || 1) * 100}% of CO2 in {data.reportingYear}.
            </p>
            <div className="g3" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <div>
                <label style={label}>Voyage Type (EU Coverage)</label>
                <select style={inputStyle} value={data.voyageType} onChange={(e) => update('voyageType', e.target.value as CIIData['voyageType'])}>
                  <option value="EU_EU">EU-EU voyage (100% coverage)</option>
                  <option value="EU_NONEU_FROM_EU">EU → non-EU (50% coverage)</option>
                  <option value="EU_NONEU_TO_EU">non-EU → EU (50% coverage)</option>
                  <option value="EU_PORT_STAY">EU port stay only (50% port emissions)</option>
                  <option value="NON_EU">Non-EU voyage (0% — no ETS)</option>
                </select>
              </div>
              <div>
                <label style={label}>Current EUA Price — €/tCO2</label>
                <input style={inputStyle} type="number" step="0.1" value={data.euaPrice || ''} onChange={(e) => update('euaPrice', parseFloat(e.target.value) || 0)} placeholder="78" />
                <span style={{ fontSize: 10, color: '#7a8a72', fontFamily: rj }}>
                  Check ember-climate.org for live
                </span>
              </div>
            </div>
          </div>

          {/* 5. FuelEU */}
          <div style={card}>
            <div style={sectionTitle}>5. FuelEU Maritime</div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: rj, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={data.applyFuelEU} onChange={(e) => update('applyFuelEU', e.target.checked)} style={{ cursor: 'pointer' }} />
              <span style={{ color: '#f5f0e8' }}>Apply FuelEU Maritime regulation (2025+)</span>
            </label>
            <p style={{ fontSize: 11, color: '#7a8a72', marginTop: 8, fontFamily: rj }}>
              Baseline: {FUELEU_BASELINE} gCO2eq/MJ (2020) · {data.reportingYear} target reduction: {((FUELEU_REDUCTION[data.reportingYear] || 0.02) * 100).toFixed(1)}% · Penalty: €{FUELEU_PENALTY}/MT VLSFO-eq
            </p>
          </div>

          {/* 6. Notes */}
          <div style={card}>
            <div style={sectionTitle}>6. Notes</div>
            <textarea
              value={data.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="Additional remarks..."
              rows={3}
              style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }}
            />
          </div>

          {/* Quick Preview */}
          {calc.totalCo2Mt > 0 && (
            <div style={{ ...card, background: 'linear-gradient(135deg,rgba(200,168,75,.08),transparent)', borderColor: 'rgba(200,168,75,.4)' }}>
              <div style={sectionTitle}>⚡ Quick Result Preview</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px,1fr))', gap: 14 }}>
                <KpiBox label="Total CO2" value={fmt(calc.totalCo2Mt, 1) + ' MT'} color="#f5f0e8" sub="Tank-to-Wake" />
                <KpiBox
                  label="CII Rating"
                  value={calc.ciiGrade}
                  color={GRADE_COLORS[calc.ciiGrade]}
                  sub={calc.attainedCII > 0 ? `${fmt(calc.attainedCII, 2)} gCO2/dwt.nm` : 'No data'}
                  big
                />
                <KpiBox label="EU ETS Cost" value={fmtMoney(calc.etsCost)} color="#c8a84b" sub={`${fmt(calc.etsCoveredCo2, 1)} tCO2 covered`} />
                {data.applyFuelEU && (
                  <KpiBox
                    label="FuelEU"
                    value={calc.fuelEuStatus === 'compliant' ? '✓ OK' : calc.fuelEuStatus === 'deficit' ? fmtMoney(calc.fuelEuPenalty) : '–'}
                    color={calc.fuelEuStatus === 'compliant' ? '#4caf76' : '#ff8a8a'}
                    sub={calc.fuelEuStatus === 'compliant' ? 'Compliant' : 'Penalty due'}
                  />
                )}
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
          .fuel-grid { grid-template-columns: 1fr !important; }
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
function ReportView({ data, calc }: { data: CIIData; calc: ReturnType<typeof calculate> }) {
  const vType = VESSEL_TYPES.find((v) => v.key === data.vesselType);
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
      {/* Header */}
      <div style={{ ...card, background: 'linear-gradient(135deg,rgba(200,168,75,.08),transparent)', borderColor: '#c8a84b', textAlign: 'center', padding: '24px 20px' }}>
        <div style={{ fontFamily: rj, fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 12 }}>
          🌍 Compliance Report · {data.reportingYear}
        </div>
        <h2 style={{ fontFamily: lb, fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
          {data.vesselName || 'Vessel Name'}
        </h2>
        <div style={{ fontSize: 13, color: '#b0c0a4', marginBottom: 4 }}>
          {vType?.name} · {data.dwt > 0 && `${data.dwt.toLocaleString()} DWT`} {data.gt > 0 && `· ${data.gt.toLocaleString()} GT`}
        </div>
        {data.imo && <div style={{ fontSize: 11, color: '#7a8a72', fontFamily: rj }}>IMO: {data.imo}</div>}
      </div>

      {/* CO2 Summary */}
      <div style={card}>
        <div style={sectionTitle}>🔥 Fuel & CO2 Summary</div>
        {calc.fuelBreakdown.map((fb) => (
          <div key={fb.fuel?.key} style={reportRow}>
            <span style={{ color: '#7a8a72' }}>{fb.fuel?.name}</span>
            <strong>
              {fmt(fb.mt, 2)} MT → {fmt(fb.co2Mt, 2)} MT CO2
            </strong>
          </div>
        ))}
        <div style={{ ...reportRow, borderBottom: 'none', borderTop: '2px solid rgba(200,168,75,.3)', paddingTop: 12, marginTop: 6 }}>
          <span style={{ color: '#c8a84b', fontWeight: 700, fontSize: 14 }}>TOTAL CO2 (Tank-to-Wake)</span>
          <strong style={{ fontFamily: lb, fontSize: 18 }}>{fmt(calc.totalCo2Mt, 2)} MT</strong>
        </div>
      </div>

      {/* CII Rating */}
      <div
        style={{
          ...card,
          background: `linear-gradient(135deg, ${GRADE_COLORS[calc.ciiGrade]}15, transparent)`,
          borderColor: `${GRADE_COLORS[calc.ciiGrade]}66`,
        }}
      >
        <div style={sectionTitle}>📊 CII Rating — {data.reportingYear}</div>

        {/* Grade Badge */}
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div
            style={{
              display: 'inline-block',
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: GRADE_COLORS[calc.ciiGrade],
              color: '#08100a',
              fontFamily: lb,
              fontSize: 56,
              fontWeight: 700,
              lineHeight: '100px',
              boxShadow: `0 4px 20px ${GRADE_COLORS[calc.ciiGrade]}66`,
            }}
          >
            {calc.ciiGrade}
          </div>
          <div style={{ fontFamily: rj, fontSize: 12, color: '#7a8a72', marginTop: 12, letterSpacing: '1px' }}>
            {calc.ciiGrade === 'A' && 'SUPERIOR — Best performance'}
            {calc.ciiGrade === 'B' && 'GOOD — Better than required'}
            {calc.ciiGrade === 'C' && 'AVERAGE — Compliant'}
            {calc.ciiGrade === 'D' && 'BELOW AVERAGE — Action plan required'}
            {calc.ciiGrade === 'E' && 'INFERIOR — Major corrective action needed'}
          </div>
        </div>

        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Reference CII (vessel type baseline)</span>
          <strong>{fmt(calc.ciiRef, 2)} gCO2/{vType?.capacityType.toLowerCase()}.nm</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Required CII ({data.reportingYear} target)</span>
          <strong>{fmt(calc.requiredCII, 2)} gCO2/{vType?.capacityType.toLowerCase()}.nm</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Attained CII</span>
          <strong style={{ color: GRADE_COLORS[calc.ciiGrade] }}>
            {fmt(calc.attainedCII, 2)} gCO2/{vType?.capacityType.toLowerCase()}.nm
          </strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Performance Ratio (Attained/Required)</span>
          <strong style={{ color: GRADE_COLORS[calc.ciiGrade] }}>{fmt(calc.ciiRatio, 3)}</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Annual CO2 (estimated)</span>
          <strong>{fmt(calc.annualCo2Mt, 0)} MT/year</strong>
        </div>
        <div style={{ ...reportRow, borderBottom: 'none' }}>
          <span style={{ color: '#7a8a72' }}>Annual Distance</span>
          <strong>{fmt(data.annualDistance, 0)} nm</strong>
        </div>

        {/* Rating Scale */}
        <div style={{ marginTop: 16, padding: '12px', background: 'rgba(0,0,0,.2)', borderRadius: 3 }}>
          <div style={{ fontFamily: rj, fontSize: 10.5, color: '#7a8a72', marginBottom: 8, letterSpacing: '.5px' }}>
            RATING THRESHOLDS (Ratio = Attained / Required)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 4 }}>
            {(['A', 'B', 'C', 'D', 'E'] as const).map((grade) => (
              <div
                key={grade}
                style={{
                  background: calc.ciiGrade === grade ? GRADE_COLORS[grade] : 'transparent',
                  color: calc.ciiGrade === grade ? '#08100a' : GRADE_COLORS[grade],
                  border: `1px solid ${GRADE_COLORS[grade]}`,
                  padding: '8px 4px',
                  textAlign: 'center',
                  fontFamily: rj,
                  fontSize: 11,
                  fontWeight: 700,
                  borderRadius: 2,
                }}
              >
                {grade} ·{' '}
                {grade === 'A' && '<0.86'}
                {grade === 'B' && '0.86-0.94'}
                {grade === 'C' && '0.94-1.07'}
                {grade === 'D' && '1.07-1.19'}
                {grade === 'E' && '>1.19'}
              </div>
            ))}
          </div>
        </div>

        {(calc.ciiGrade === 'D' || calc.ciiGrade === 'E') && (
          <div style={{ marginTop: 14, padding: '12px 14px', background: 'rgba(255,138,138,.08)', border: '1px solid rgba(255,138,138,.3)', borderRadius: 3 }}>
            <div style={{ fontFamily: rj, fontSize: 11, fontWeight: 700, color: '#ff8a8a', marginBottom: 6, letterSpacing: '.5px' }}>
              ⚠ CORRECTIVE ACTION REQUIRED
            </div>
            <div style={{ fontSize: 11.5, color: '#b0c0a4', lineHeight: 1.6 }}>
              {calc.ciiGrade === 'D' &&
                'Vessel rated D for 3 consecutive years requires a corrective action plan in the SEEMP Part III. Consider: slow steaming, hull/propeller cleaning, energy-saving devices, fuel switching.'}
              {calc.ciiGrade === 'E' &&
                'Vessel rated E requires immediate corrective action plan. Risk of being unable to call at certain ports. Major actions: speed reduction, fuel switching (LNG/biofuel/methanol), retrofitting EGCS/wind-assist.'}
            </div>
          </div>
        )}
      </div>

      {/* EU ETS */}
      {calc.etsCoveragePct > 0 && (
        <div style={card}>
          <div style={sectionTitle}>💶 EU ETS Maritime — {data.reportingYear}</div>
          <div style={reportRow}>
            <span style={{ color: '#7a8a72' }}>Voyage Type</span>
            <strong>{data.voyageType.replace(/_/g, ' ')}</strong>
          </div>
          <div style={reportRow}>
            <span style={{ color: '#7a8a72' }}>EU Coverage</span>
            <strong>{(calc.etsCoveragePct * 100).toFixed(0)}%</strong>
          </div>
          <div style={reportRow}>
            <span style={{ color: '#7a8a72' }}>Phase-in ({data.reportingYear})</span>
            <strong>{(calc.etsPhaseIn * 100).toFixed(0)}%</strong>
          </div>
          <div style={reportRow}>
            <span style={{ color: '#7a8a72' }}>CO2 Covered by ETS</span>
            <strong>{fmt(calc.etsCoveredCo2, 2)} MT</strong>
          </div>
          <div style={reportRow}>
            <span style={{ color: '#7a8a72' }}>EUA Allowances Needed</span>
            <strong>{fmt(calc.etsCoveredCo2, 0)} EUAs</strong>
          </div>
          <div style={reportRow}>
            <span style={{ color: '#7a8a72' }}>Current EUA Price</span>
            <strong>€{fmt(data.euaPrice, 2)}/tonne</strong>
          </div>
          <div style={{ ...reportRow, borderBottom: 'none', borderTop: '2px solid #c8a84b', paddingTop: 14, marginTop: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#c8a84b' }}>EU ETS COST (this voyage)</span>
            <strong style={{ fontFamily: lb, fontSize: 22 }}>{fmtMoney(calc.etsCost)}</strong>
          </div>
          {data.cargoCarried > 0 && (
            <p style={{ fontSize: 11, color: '#7a8a72', marginTop: 8, fontFamily: rj, textAlign: 'right' }}>
              = €{(calc.etsCost / data.cargoCarried).toFixed(2)}/tonne cargo
            </p>
          )}
        </div>
      )}

      {/* FuelEU */}
      {data.applyFuelEU && (
        <div
          style={{
            ...card,
            background:
              calc.fuelEuStatus === 'compliant'
                ? 'linear-gradient(135deg,rgba(76,175,118,.06),transparent)'
                : calc.fuelEuStatus === 'deficit'
                ? 'linear-gradient(135deg,rgba(255,138,138,.06),transparent)'
                : undefined,
            borderColor:
              calc.fuelEuStatus === 'compliant'
                ? 'rgba(76,175,118,.4)'
                : calc.fuelEuStatus === 'deficit'
                ? 'rgba(255,138,138,.4)'
                : undefined,
          }}
        >
          <div style={sectionTitle}>🌫️ FuelEU Maritime — {data.reportingYear}</div>
          <div style={reportRow}>
            <span style={{ color: '#7a8a72' }}>Baseline (2020)</span>
            <strong>{FUELEU_BASELINE} gCO2eq/MJ</strong>
          </div>
          <div style={reportRow}>
            <span style={{ color: '#7a8a72' }}>Required Intensity ({data.reportingYear})</span>
            <strong>{fmt(calc.fuelEuRequiredIntensity, 2)} gCO2eq/MJ</strong>
          </div>
          <div style={reportRow}>
            <span style={{ color: '#7a8a72' }}>Actual Intensity (Well-to-Wake)</span>
            <strong style={{ color: calc.fuelEuStatus === 'compliant' ? '#4caf76' : '#ff8a8a' }}>
              {fmt(calc.fuelEuActualIntensity, 2)} gCO2eq/MJ
            </strong>
          </div>
          <div style={reportRow}>
            <span style={{ color: '#7a8a72' }}>Compliance Position</span>
            <strong style={{ color: calc.fuelEuStatus === 'compliant' ? '#4caf76' : '#ff8a8a' }}>
              {calc.fuelEuCompliance >= 0 ? '+' : ''}
              {fmt(calc.fuelEuCompliance, 2)} gCO2eq/MJ
            </strong>
          </div>
          <div style={{ ...reportRow, borderBottom: 'none', borderTop: '2px solid', borderTopColor: calc.fuelEuStatus === 'compliant' ? '#4caf76' : '#ff8a8a', paddingTop: 14, marginTop: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>
              {calc.fuelEuStatus === 'compliant' ? 'COMPLIANT' : 'PENALTY DUE'}
            </span>
            <strong style={{ fontFamily: lb, fontSize: 20, color: calc.fuelEuStatus === 'compliant' ? '#4caf76' : '#ff8a8a' }}>
              {calc.fuelEuStatus === 'compliant' ? '✓ €0' : fmtMoney(calc.fuelEuPenalty)}
            </strong>
          </div>
        </div>
      )}

      {/* Total Cost Summary */}
      <div style={{ ...card, background: 'linear-gradient(135deg,rgba(200,168,75,.12),transparent)', borderColor: '#c8a84b' }}>
        <div style={{ ...sectionTitle, borderBottom: 'none' }}>💰 Total Compliance Cost</div>
        <div style={reportRow}>
          <span>EU ETS Cost</span>
          <strong>{fmtMoney(calc.etsCost)}</strong>
        </div>
        {data.applyFuelEU && (
          <div style={reportRow}>
            <span>FuelEU Penalty</span>
            <strong style={{ color: calc.fuelEuPenalty > 0 ? '#ff8a8a' : '#4caf76' }}>{fmtMoney(calc.fuelEuPenalty)}</strong>
          </div>
        )}
        <div style={{ ...reportRow, borderBottom: 'none', borderTop: '2px solid #c8a84b', paddingTop: 14, marginTop: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>TOTAL COMPLIANCE COST</span>
          <strong style={{ fontFamily: lb, fontSize: 24, color: '#c8a84b' }}>
            {fmtMoney(calc.etsCost + (data.applyFuelEU ? calc.fuelEuPenalty : 0))}
          </strong>
        </div>
      </div>

      {/* Optimization Suggestions */}
      {(calc.ciiGrade === 'D' || calc.ciiGrade === 'E' || calc.fuelEuPenalty > 0) && (
        <div style={card}>
          <div style={sectionTitle}>💡 Optimization Suggestions</div>
          <ul style={{ fontSize: 12.5, color: '#b0c0a4', lineHeight: 1.8, paddingLeft: 18 }}>
            <li>
              <strong style={{ color: '#c8a84b' }}>Slow steaming:</strong> Reducing speed by 10% can reduce
              fuel by ~20% and CO2 proportionally. Most cost-effective short-term measure.
            </li>
            <li>
              <strong style={{ color: '#c8a84b' }}>Biofuel blend (B30):</strong> Reduces lifecycle CO2 by ~30%
              with minimal infrastructure change. ~10–20% premium on price.
            </li>
            <li>
              <strong style={{ color: '#c8a84b' }}>Hull / propeller cleaning:</strong> 3–8% fuel savings.
              Best ROI for older vessels.
            </li>
            <li>
              <strong style={{ color: '#c8a84b' }}>Weather routing:</strong> 2–5% fuel savings on long voyages.
            </li>
            <li>
              <strong style={{ color: '#c8a84b' }}>Trim optimization:</strong> 2–4% fuel savings via proper
              ballast and trim.
            </li>
            <li>
              <strong style={{ color: '#c8a84b' }}>LNG / methanol retrofit:</strong> Long-term solution.
              Methanol = ~10% TtW CO2 reduction; bio-methanol = up to 95%.
            </li>
            <li>
              <strong style={{ color: '#c8a84b' }}>Cold ironing at port:</strong> Eliminates port-stay emissions.
            </li>
          </ul>
        </div>
      )}

      {/* Methodology */}
      <div style={{ ...card, background: 'rgba(122,138,114,.05)', borderColor: 'rgba(122,138,114,.15)' }}>
        <div style={sectionTitle}>📖 Methodology</div>
        <ul style={{ fontSize: 11.5, color: '#b0c0a4', lineHeight: 1.7, paddingLeft: 18 }}>
          <li>CII based on <strong>IMO MEPC.353(78)</strong> and MEPC.339(76) rating system.</li>
          <li>CO2 emission factors per <strong>IMO MEPC.364(79)</strong> (Tank-to-Wake).</li>
          <li>EU ETS per <strong>Directive (EU) 2023/959</strong> — phase-in 40%/70%/100% in 2024/25/26.</li>
          <li>FuelEU per <strong>Regulation (EU) 2023/1805</strong>. WtW factors per Annex II.</li>
          <li>Calculations are <em>indicative</em>. Independent verification recommended for filing.</li>
          <li>EUA price varies daily — check live source (e.g., ember-climate.org).</li>
        </ul>
      </div>

      {data.notes && (
        <div style={card}>
          <div style={sectionTitle}>📝 Notes</div>
          <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{data.notes}</p>
        </div>
      )}

      <div
        style={{
          marginTop: 20,
          padding: '14px 16px',
          background: 'rgba(200,168,75,.04)',
          border: '1px solid rgba(200,168,75,.12)',
          borderRadius: 4,
          textAlign: 'center',
          fontFamily: rj,
          fontSize: 11,
          color: '#7a8a72',
          letterSpacing: '.5px',
        }}
      >
        Generated by PortServiceFinder Voyage Hub · portservicefinder.com/voyage
        <br />
        <span style={{ fontSize: 10, marginTop: 4, display: 'inline-block' }}>
          For regulatory filing, use approved verification body (DCS auditor / EU verifier).
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
      <div style={{ fontFamily: lb, fontSize: big ? 28 : 18, fontWeight: 700, color, lineHeight: 1.1 }}>
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
