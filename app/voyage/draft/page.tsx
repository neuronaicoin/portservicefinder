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
interface SurveyReading {
  // 6-point drafts (m)
  forwardPort: number;
  forwardStbd: number;
  midPort: number;
  midStbd: number;
  aftPort: number;
  aftStbd: number;

  // Distance corrections (m) - if marks not at perpendiculars
  forwardCorr: number; // negative if FP mark forward of forward perp
  midCorr: number; // typically 0
  aftCorr: number; // negative if AP mark aft of aft perp

  // Hydrometer
  density: number; // observed density (t/m³)
  densityTemp: number; // observed temperature
}

interface Deductibles {
  // Bunker tanks (MT)
  hfo: number;
  vlsfo: number;
  mgo: number;
  lubeOil: number;
  
  // Fresh water (MT)
  freshWater: number;
  ballastWater: number;
  
  // Other
  sludge: number;
  bilgeWater: number;
  
  // Constants
  shipConstant: number; // from light-ship survey
}

interface DraftData {
  // Vessel
  vesselName: string;
  imo: string;
  port: string;
  date: string;
  time: string;
  surveyType: 'loading' | 'discharging' | 'in_voyage';
  cargoType: string;

  // Vessel constants
  lbp: number; // Length between perpendiculars (m)
  tpc: number; // Tonnes per cm at observed draft
  mtc: number; // Moment to trim 1cm
  lcf: number; // Longitudinal Centre of Flotation from midship (negative = aft of mid)

  // INITIAL Survey (arrival / before loading)
  initial: SurveyReading;
  initialDeductibles: Deductibles;

  // FINAL Survey (departure / after loading)
  final: SurveyReading;
  finalDeductibles: Deductibles;

  // BL (Bill of Lading) for comparison
  blQty: number;

  notes: string;
}

const DEFAULT_READING: SurveyReading = {
  forwardPort: 0,
  forwardStbd: 0,
  midPort: 0,
  midStbd: 0,
  aftPort: 0,
  aftStbd: 0,
  forwardCorr: 0,
  midCorr: 0,
  aftCorr: 0,
  density: 1.025,
  densityTemp: 15,
};

const DEFAULT_DEDUCT: Deductibles = {
  hfo: 0,
  vlsfo: 0,
  mgo: 0,
  lubeOil: 0,
  freshWater: 0,
  ballastWater: 0,
  sludge: 0,
  bilgeWater: 0,
  shipConstant: 0,
};

const DEFAULT_DATA: DraftData = {
  vesselName: '',
  imo: '',
  port: '',
  date: '',
  time: '',
  surveyType: 'loading',
  cargoType: '',
  lbp: 0,
  tpc: 0,
  mtc: 0,
  lcf: 0,
  initial: { ...DEFAULT_READING },
  initialDeductibles: { ...DEFAULT_DEDUCT },
  final: { ...DEFAULT_READING },
  finalDeductibles: { ...DEFAULT_DEDUCT },
  blQty: 0,
  notes: '',
};

// ============================================================
// CALCULATIONS — Per IMO/ISO Draft Survey Method
// ============================================================
interface SurveyResult {
  fwdMean: number; // Mean of forward port + stbd
  midMean: number;
  aftMean: number;
  // Corrected drafts (perpendiculars)
  fwdCorrected: number;
  midCorrected: number;
  aftCorrected: number;
  // Apparent trim
  apparentTrim: number;
  // Mean of forward + aft (apparent mean)
  meanFwdAft: number;
  // Quarter mean = (FWD + AFT + 6×MID) / 8
  quarterMean: number;
  // Hog/sag deflection
  hogSag: number;
  // True mean draft
  trueMeanDraft: number;
  // Trim correction (1st and 2nd)
  firstTrimCorr: number;
  secondTrimCorr: number;
  // Total trim correction
  trimCorrection: number;
  // Final draft for displacement
  finalDraftForDispl: number;
  // Displacement (uncorrected for density)
  displacementInWater: number;
  // Density correction
  densityCorrection: number;
  // Corrected displacement (in actual seawater density)
  correctedDisplacement: number;
}

function calculateSurvey(r: SurveyReading, lbp: number, tpc: number, mtc: number, lcf: number): SurveyResult {
  // Mean draft per location (port + stbd / 2)
  const fwdMean = (r.forwardPort + r.forwardStbd) / 2;
  const midMean = (r.midPort + r.midStbd) / 2;
  const aftMean = (r.aftPort + r.aftStbd) / 2;

  // Correct for distance between draft mark and perpendicular
  const fwdCorrected = fwdMean + r.forwardCorr;
  const midCorrected = midMean + r.midCorr;
  const aftCorrected = aftMean + r.aftCorr;

  // Apparent trim
  const apparentTrim = aftCorrected - fwdCorrected;

  // Mean of forward and aft
  const meanFwdAft = (fwdCorrected + aftCorrected) / 2;

  // Quarter mean (more accurate)
  const quarterMean = (fwdCorrected + 6 * midCorrected + aftCorrected) / 8;

  // Hog/sag = mid - (fwd+aft)/2
  const hogSag = midCorrected - meanFwdAft;

  // True mean draft (use quarter mean)
  const trueMeanDraft = quarterMean;

  // 1st Trim Correction = (Trim × LCF × TPC × 100) / LBP
  // LCF is in meters from midship, positive = forward
  // For TPC in t/cm and trim in m
  const firstTrimCorr = lbp > 0 ? (apparentTrim * lcf * tpc * 100) / lbp : 0;

  // 2nd Trim Correction = (Trim² × 50 × dM/dz) / LBP — simplified
  // We use approximation: (Trim² × MTC × 50) / LBP — typical method
  const secondTrimCorr = lbp > 0 ? (apparentTrim * apparentTrim * 50 * mtc) / lbp : 0;

  const trimCorrection = firstTrimCorr + secondTrimCorr;

  // Final draft for displacement
  const finalDraftForDispl = trueMeanDraft;

  // Displacement (would need hydrostatic tables — we use simplified approximation)
  // For accurate work, displacement comes from vessel's hydrostatic curves
  // Here we provide a placeholder method — user can override
  // Approximation: displacement ≈ 100 × draft × TPC (very rough)
  const displacementInWater = finalDraftForDispl * 100 * tpc + trimCorrection;

  // Density correction (observed - 1.025) ratio
  const densityCorrection = displacementInWater * ((r.density - 1.025) / 1.025);

  const correctedDisplacement = displacementInWater + densityCorrection;

  return {
    fwdMean,
    midMean,
    aftMean,
    fwdCorrected,
    midCorrected,
    aftCorrected,
    apparentTrim,
    meanFwdAft,
    quarterMean,
    hogSag,
    trueMeanDraft,
    firstTrimCorr,
    secondTrimCorr,
    trimCorrection,
    finalDraftForDispl,
    displacementInWater,
    densityCorrection,
    correctedDisplacement,
  };
}

function totalDeductibles(d: Deductibles): number {
  return d.hfo + d.vlsfo + d.mgo + d.lubeOil + d.freshWater + d.ballastWater + d.sludge + d.bilgeWater + d.shipConstant;
}

function calculate(d: DraftData) {
  const initialResult = calculateSurvey(d.initial, d.lbp, d.tpc, d.mtc, d.lcf);
  const finalResult = calculateSurvey(d.final, d.lbp, d.tpc, d.mtc, d.lcf);

  const initialDeductTotal = totalDeductibles(d.initialDeductibles);
  const finalDeductTotal = totalDeductibles(d.finalDeductibles);

  // Net cargo = (Final displ - Final deduct) - (Initial displ - Initial deduct)
  const initialNet = initialResult.correctedDisplacement - initialDeductTotal;
  const finalNet = finalResult.correctedDisplacement - finalDeductTotal;

  const cargoQty = d.surveyType === 'loading' ? finalNet - initialNet : initialNet - finalNet;

  const blDifference = d.blQty > 0 ? cargoQty - d.blQty : 0;
  const blDifferencePct = d.blQty > 0 ? (blDifference / d.blQty) * 100 : 0;

  return {
    initialResult,
    finalResult,
    initialDeductTotal,
    finalDeductTotal,
    initialNet,
    finalNet,
    cargoQty,
    blDifference,
    blDifferencePct,
  };
}

function fmt(n: number, dec = 2): string {
  if (!isFinite(n)) return '–';
  return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
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
  fontSize: 10,
  letterSpacing: '.5px',
  textTransform: 'uppercase',
  color: '#7a8a72',
  fontWeight: 600,
  marginBottom: 4,
};
const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0c1610',
  border: '1px solid rgba(200,168,75,.2)',
  color: '#f5f0e8',
  padding: '7px 9px',
  fontFamily: rj,
  fontSize: 12.5,
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
export default function DraftSurveyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingId = searchParams.get('id');

  const [data, setData] = useState<DraftData>(DEFAULT_DATA);
  const [recordId, setRecordId] = useState<string | null>(existingId);
  const [recordName, setRecordName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (existingId) {
      const saved = loadItem<DraftData>('draft', existingId);
      if (saved) {
        setData(saved.data);
        setRecordName(saved.name);
      }
    }
  }, [existingId]);

  const calc = useMemo(() => calculate(data), [data]);

  function update<K extends keyof DraftData>(key: K, value: DraftData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function updateInitial<K extends keyof SurveyReading>(key: K, value: SurveyReading[K]) {
    setData((prev) => ({ ...prev, initial: { ...prev.initial, [key]: value } }));
  }
  function updateFinal<K extends keyof SurveyReading>(key: K, value: SurveyReading[K]) {
    setData((prev) => ({ ...prev, final: { ...prev.final, [key]: value } }));
  }
  function updateInitialDeduct<K extends keyof Deductibles>(key: K, value: Deductibles[K]) {
    setData((prev) => ({ ...prev, initialDeductibles: { ...prev.initialDeductibles, [key]: value } }));
  }
  function updateFinalDeduct<K extends keyof Deductibles>(key: K, value: Deductibles[K]) {
    setData((prev) => ({ ...prev, finalDeductibles: { ...prev.finalDeductibles, [key]: value } }));
  }

  function handleSave() {
    const name = recordName.trim() || `${data.vesselName || 'Vessel'} — ${data.port || 'Port'} — ${data.surveyType}`;
    const id = recordId || genId();
    saveItem('draft', name, data, id);
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
    router.replace('/voyage/draft');
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>
          ⚓ Voyage Hub · Draft Survey Calculator
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Draft <em style={g}>Survey</em> Calculator
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          Calculate cargo weight from draft readings — full 6-point survey with trim, hog/sag,
          density corrections, and deductibles. Compatible with IMO/ISO standard methods.
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
          <input type="text" value={recordName} onChange={(e) => setRecordName(e.target.value)} placeholder="e.g. MV NEURONAI — Tubarão Loading Survey" style={{ ...inputStyle, marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{ background: '#c8a84b', color: '#08100a', border: 'none', padding: '8px 14px', fontFamily: rj, fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 3 }}>
              Save
            </button>
            <button onClick={() => setShowSave(false)} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* 1. Vessel Info */}
      <div style={card}>
        <div style={sectionTitle}>1. Survey Information</div>
        <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          <div>
            <label style={label}>Vessel Name</label>
            <input style={inputStyle} type="text" value={data.vesselName} onChange={(e) => update('vesselName', e.target.value)} placeholder="MV NEURONAI" />
          </div>
          <div>
            <label style={label}>IMO</label>
            <input style={inputStyle} type="text" value={data.imo} onChange={(e) => update('imo', e.target.value)} placeholder="9876543" />
          </div>
          <div>
            <label style={label}>Port</label>
            <input style={inputStyle} type="text" value={data.port} onChange={(e) => update('port', e.target.value)} placeholder="Tubarão" />
          </div>
        </div>
        <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 12 }}>
          <div>
            <label style={label}>Date</label>
            <input style={inputStyle} type="date" value={data.date} onChange={(e) => update('date', e.target.value)} />
          </div>
          <div>
            <label style={label}>Time (Local)</label>
            <input style={inputStyle} type="time" value={data.time} onChange={(e) => update('time', e.target.value)} />
          </div>
          <div>
            <label style={label}>Survey Type</label>
            <select style={inputStyle} value={data.surveyType} onChange={(e) => update('surveyType', e.target.value as DraftData['surveyType'])}>
              <option value="loading">Loading</option>
              <option value="discharging">Discharging</option>
              <option value="in_voyage">In Voyage (Reference)</option>
            </select>
          </div>
        </div>
        <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(1,1fr)', gap: 12, marginTop: 12 }}>
          <div>
            <label style={label}>Cargo Type</label>
            <input style={inputStyle} type="text" value={data.cargoType} onChange={(e) => update('cargoType', e.target.value)} placeholder="Iron Ore Fines" />
          </div>
        </div>
      </div>

      {/* 2. Vessel Constants */}
      <div style={card}>
        <div style={sectionTitle}>2. Vessel Constants</div>
        <p style={{ fontSize: 11, color: '#7a8a72', marginBottom: 12, fontFamily: rj, lineHeight: 1.5 }}>
          Get these from vessel&apos;s <strong style={{ color: '#c8a84b' }}>Hydrostatic Tables</strong>{' '}
          (from Stability Book) at the approximate mean draft.
        </p>
        <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          <div>
            <label style={label}>LBP — m</label>
            <input style={inputStyle} type="number" step="0.01" value={data.lbp || ''} onChange={(e) => update('lbp', parseFloat(e.target.value) || 0)} placeholder="225.0" />
            <span style={{ fontSize: 9.5, color: '#7a8a72', fontFamily: rj }}>Length between perp.</span>
          </div>
          <div>
            <label style={label}>TPC — t/cm</label>
            <input style={inputStyle} type="number" step="0.01" value={data.tpc || ''} onChange={(e) => update('tpc', parseFloat(e.target.value) || 0)} placeholder="72.5" />
            <span style={{ fontSize: 9.5, color: '#7a8a72', fontFamily: rj }}>Tonnes per cm</span>
          </div>
          <div>
            <label style={label}>MTC — t·m</label>
            <input style={inputStyle} type="number" step="1" value={data.mtc || ''} onChange={(e) => update('mtc', parseFloat(e.target.value) || 0)} placeholder="950" />
            <span style={{ fontSize: 9.5, color: '#7a8a72', fontFamily: rj }}>Moment to trim 1 cm</span>
          </div>
          <div>
            <label style={label}>LCF — m</label>
            <input style={inputStyle} type="number" step="0.01" value={data.lcf || ''} onChange={(e) => update('lcf', parseFloat(e.target.value) || 0)} placeholder="-1.50" />
            <span style={{ fontSize: 9.5, color: '#7a8a72', fontFamily: rj }}>From midship (+ fwd)</span>
          </div>
        </div>
      </div>

      {/* INITIAL SURVEY */}
      <div style={card}>
        <div style={sectionTitle}>3. Initial Survey (Before {data.surveyType === 'loading' ? 'Loading' : 'Discharging'})</div>

        {/* Draft Readings */}
        <h4 style={{ fontFamily: rj, fontSize: 11, color: '#c8a84b', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>
          📏 Draft Readings (meters)
        </h4>
        <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 14 }}>
          <DraftPair
            label="Forward (FP)"
            port={data.initial.forwardPort}
            stbd={data.initial.forwardStbd}
            corr={data.initial.forwardCorr}
            onPort={(v) => updateInitial('forwardPort', v)}
            onStbd={(v) => updateInitial('forwardStbd', v)}
            onCorr={(v) => updateInitial('forwardCorr', v)}
          />
          <DraftPair
            label="Midship (MP)"
            port={data.initial.midPort}
            stbd={data.initial.midStbd}
            corr={data.initial.midCorr}
            onPort={(v) => updateInitial('midPort', v)}
            onStbd={(v) => updateInitial('midStbd', v)}
            onCorr={(v) => updateInitial('midCorr', v)}
          />
          <DraftPair
            label="Aft (AP)"
            port={data.initial.aftPort}
            stbd={data.initial.aftStbd}
            corr={data.initial.aftCorr}
            onPort={(v) => updateInitial('aftPort', v)}
            onStbd={(v) => updateInitial('aftStbd', v)}
            onCorr={(v) => updateInitial('aftCorr', v)}
          />
        </div>

        {/* Density */}
        <h4 style={{ fontFamily: rj, fontSize: 11, color: '#c8a84b', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10, fontWeight: 700, marginTop: 14 }}>
          💧 Sea Water Density
        </h4>
        <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={label}>Observed Density — t/m³</label>
            <input style={inputStyle} type="number" step="0.0001" value={data.initial.density || ''} onChange={(e) => updateInitial('density', parseFloat(e.target.value) || 0)} placeholder="1.0250" />
          </div>
          <div>
            <label style={label}>Water Temp — °C</label>
            <input style={inputStyle} type="number" step="0.1" value={data.initial.densityTemp || ''} onChange={(e) => updateInitial('densityTemp', parseFloat(e.target.value) || 0)} placeholder="15.0" />
          </div>
        </div>

        {/* Deductibles */}
        <h4 style={{ fontFamily: rj, fontSize: 11, color: '#c8a84b', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10, fontWeight: 700, marginTop: 14 }}>
          ⚙️ Deductibles (Initial — MT)
        </h4>
        <DeductibleInputs values={data.initialDeductibles} onUpdate={updateInitialDeduct} />

        {/* Results preview */}
        <div style={{ marginTop: 14, padding: '10px 12px', background: 'rgba(200,168,75,.05)', border: '1px solid rgba(200,168,75,.15)', borderRadius: 3, fontSize: 12, fontFamily: rj, color: '#b0c0a4' }}>
          📏 Mean Draft: <strong style={{ color: '#f5f0e8' }}>{fmt(calc.initialResult.trueMeanDraft, 3)} m</strong>
          {' · '}Trim: <strong style={{ color: '#f5f0e8' }}>{fmt(calc.initialResult.apparentTrim, 3)} m {calc.initialResult.apparentTrim > 0 ? 'by aft' : 'by fwd'}</strong>
          {' · '}Hog/Sag: <strong style={{ color: calc.initialResult.hogSag > 0 ? '#ff8a8a' : '#4caf76' }}>{fmt(calc.initialResult.hogSag * 1000, 1)} mm {calc.initialResult.hogSag > 0 ? '(sag)' : '(hog)'}</strong>
          <br />
          📊 Displacement: <strong style={{ color: '#c8a84b' }}>{fmt(calc.initialResult.correctedDisplacement, 1)} MT</strong>
          {' · '}Deductibles: <strong style={{ color: '#ff8a8a' }}>-{fmt(calc.initialDeductTotal, 1)} MT</strong>
          {' · '}Net: <strong style={{ color: '#4caf76' }}>{fmt(calc.initialNet, 1)} MT</strong>
        </div>
      </div>

      {/* FINAL SURVEY */}
      <div style={card}>
        <div style={sectionTitle}>4. Final Survey (After {data.surveyType === 'loading' ? 'Loading' : 'Discharging'})</div>

        <h4 style={{ fontFamily: rj, fontSize: 11, color: '#c8a84b', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>
          📏 Draft Readings (meters)
        </h4>
        <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 14 }}>
          <DraftPair
            label="Forward (FP)"
            port={data.final.forwardPort}
            stbd={data.final.forwardStbd}
            corr={data.final.forwardCorr}
            onPort={(v) => updateFinal('forwardPort', v)}
            onStbd={(v) => updateFinal('forwardStbd', v)}
            onCorr={(v) => updateFinal('forwardCorr', v)}
          />
          <DraftPair
            label="Midship (MP)"
            port={data.final.midPort}
            stbd={data.final.midStbd}
            corr={data.final.midCorr}
            onPort={(v) => updateFinal('midPort', v)}
            onStbd={(v) => updateFinal('midStbd', v)}
            onCorr={(v) => updateFinal('midCorr', v)}
          />
          <DraftPair
            label="Aft (AP)"
            port={data.final.aftPort}
            stbd={data.final.aftStbd}
            corr={data.final.aftCorr}
            onPort={(v) => updateFinal('aftPort', v)}
            onStbd={(v) => updateFinal('aftStbd', v)}
            onCorr={(v) => updateFinal('aftCorr', v)}
          />
        </div>

        <h4 style={{ fontFamily: rj, fontSize: 11, color: '#c8a84b', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10, fontWeight: 700, marginTop: 14 }}>
          💧 Sea Water Density
        </h4>
        <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={label}>Observed Density — t/m³</label>
            <input style={inputStyle} type="number" step="0.0001" value={data.final.density || ''} onChange={(e) => updateFinal('density', parseFloat(e.target.value) || 0)} placeholder="1.0250" />
          </div>
          <div>
            <label style={label}>Water Temp — °C</label>
            <input style={inputStyle} type="number" step="0.1" value={data.final.densityTemp || ''} onChange={(e) => updateFinal('densityTemp', parseFloat(e.target.value) || 0)} placeholder="15.0" />
          </div>
        </div>

        <h4 style={{ fontFamily: rj, fontSize: 11, color: '#c8a84b', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10, fontWeight: 700, marginTop: 14 }}>
          ⚙️ Deductibles (Final — MT)
        </h4>
        <DeductibleInputs values={data.finalDeductibles} onUpdate={updateFinalDeduct} />

        <div style={{ marginTop: 14, padding: '10px 12px', background: 'rgba(200,168,75,.05)', border: '1px solid rgba(200,168,75,.15)', borderRadius: 3, fontSize: 12, fontFamily: rj, color: '#b0c0a4' }}>
          📏 Mean Draft: <strong style={{ color: '#f5f0e8' }}>{fmt(calc.finalResult.trueMeanDraft, 3)} m</strong>
          {' · '}Trim: <strong style={{ color: '#f5f0e8' }}>{fmt(calc.finalResult.apparentTrim, 3)} m {calc.finalResult.apparentTrim > 0 ? 'by aft' : 'by fwd'}</strong>
          {' · '}Hog/Sag: <strong style={{ color: calc.finalResult.hogSag > 0 ? '#ff8a8a' : '#4caf76' }}>{fmt(calc.finalResult.hogSag * 1000, 1)} mm {calc.finalResult.hogSag > 0 ? '(sag)' : '(hog)'}</strong>
          <br />
          📊 Displacement: <strong style={{ color: '#c8a84b' }}>{fmt(calc.finalResult.correctedDisplacement, 1)} MT</strong>
          {' · '}Deductibles: <strong style={{ color: '#ff8a8a' }}>-{fmt(calc.finalDeductTotal, 1)} MT</strong>
          {' · '}Net: <strong style={{ color: '#4caf76' }}>{fmt(calc.finalNet, 1)} MT</strong>
        </div>
      </div>

      {/* 5. B/L Comparison */}
      <div style={card}>
        <div style={sectionTitle}>5. Bill of Lading Comparison (Optional)</div>
        <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(1,1fr)', gap: 12 }}>
          <div>
            <label style={label}>B/L Quantity — MT (optional, for comparison)</label>
            <input style={inputStyle} type="number" step="0.1" value={data.blQty || ''} onChange={(e) => update('blQty', parseFloat(e.target.value) || 0)} placeholder="170000.0" />
          </div>
        </div>
      </div>

      {/* RESULTS */}
      {data.lbp > 0 && data.tpc > 0 && (
        <div style={{ ...card, background: 'linear-gradient(135deg,rgba(200,168,75,.08),transparent)', borderColor: 'rgba(200,168,75,.4)' }}>
          <div style={sectionTitle}>⚡ CARGO QUANTITY RESULT</div>

          <div style={rowStyle}>
            <span style={{ color: '#7a8a72' }}>Initial Survey Net (Light Vessel)</span>
            <strong>{fmt(calc.initialNet, 1)} MT</strong>
          </div>
          <div style={rowStyle}>
            <span style={{ color: '#7a8a72' }}>Final Survey Net (Loaded Vessel)</span>
            <strong>{fmt(calc.finalNet, 1)} MT</strong>
          </div>

          <div style={{ ...rowStyle, borderTop: '2px solid #c8a84b', paddingTop: 14, marginTop: 10, borderBottom: 'none' }}>
            <span style={{ color: '#c8a84b', fontWeight: 700, fontSize: 14 }}>
              CARGO {data.surveyType === 'loading' ? 'LOADED' : 'DISCHARGED'}
            </span>
            <strong style={{ fontFamily: lb, fontSize: 28, color: '#c8a84b' }}>{fmt(calc.cargoQty, 1)} MT</strong>
          </div>

          {data.blQty > 0 && (
            <>
              <div style={{ ...rowStyle, marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(200,168,75,.2)' }}>
                <span style={{ color: '#7a8a72' }}>Bill of Lading Quantity</span>
                <strong>{fmt(data.blQty, 1)} MT</strong>
              </div>
              <div style={rowStyle}>
                <span style={{ color: '#7a8a72' }}>Difference</span>
                <strong style={{ color: Math.abs(calc.blDifferencePct) <= 0.5 ? '#4caf76' : '#ff8a8a' }}>
                  {calc.blDifference > 0 ? '+' : ''}{fmt(calc.blDifference, 1)} MT ({calc.blDifferencePct > 0 ? '+' : ''}{fmt(calc.blDifferencePct, 3)}%)
                </strong>
              </div>
              <div style={{ ...rowStyle, borderBottom: 'none' }}>
                <span style={{ color: '#7a8a72' }}>Status</span>
                <strong style={{ color: Math.abs(calc.blDifferencePct) <= 0.5 ? '#4caf76' : '#ff8a8a' }}>
                  {Math.abs(calc.blDifferencePct) <= 0.5 ? '✓ Within typical tolerance (±0.5%)' : '⚠ Outside typical tolerance'}
                </strong>
              </div>
            </>
          )}
        </div>
      )}

      {/* Methodology */}
      <div style={{ ...card, background: 'rgba(122,138,114,.05)', borderColor: 'rgba(122,138,114,.15)' }}>
        <div style={sectionTitle}>📖 Methodology</div>
        <ul style={{ fontSize: 11.5, color: '#b0c0a4', lineHeight: 1.7, paddingLeft: 18 }}>
          <li>Quarter-mean draft method: <strong style={{ color: '#c8a84b' }}>(F + 6×M + A) / 8</strong></li>
          <li>1st Trim Correction: <strong style={{ color: '#c8a84b' }}>(Trim × LCF × TPC × 100) / LBP</strong></li>
          <li>2nd Trim Correction: <strong style={{ color: '#c8a84b' }}>(Trim² × 50 × MTC) / LBP</strong></li>
          <li>Density Correction: <strong style={{ color: '#c8a84b' }}>Displacement × (Density - 1.025) / 1.025</strong></li>
          <li>Hog/Sag: difference between mid draft and (F+A)/2</li>
          <li>For commercial use, displacement <em>must</em> be read from vessel&apos;s actual hydrostatic tables — this tool uses linear approximation.</li>
        </ul>
      </div>

      {/* Notes */}
      <div style={card}>
        <div style={sectionTitle}>Notes</div>
        <textarea
          value={data.notes}
          onChange={(e) => update('notes', e.target.value)}
          placeholder="Survey conditions, weather, surveyor observations..."
          rows={3}
          style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }}
        />
      </div>

      <style>{`
        @media (max-width: 720px) {
          .g3 { grid-template-columns: 1fr !important; }
          .draft-grid { grid-template-columns: 1fr 1fr !important; }
          .deduct-grid { grid-template-columns: 1fr 1fr !important; }
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
// DRAFT PAIR (Port + Stbd at one location)
// ============================================================
function DraftPair({
  label: lbl,
  port,
  stbd,
  corr,
  onPort,
  onStbd,
  onCorr,
}: {
  label: string;
  port: number;
  stbd: number;
  corr: number;
  onPort: (v: number) => void;
  onStbd: (v: number) => void;
  onCorr: (v: number) => void;
}) {
  return (
    <div style={{ background: '#0c1610', border: '1px solid rgba(200,168,75,.15)', padding: 12, borderRadius: 3 }}>
      <div style={{ fontFamily: rj, fontSize: 11, color: '#c8a84b', fontWeight: 700, letterSpacing: '.5px', marginBottom: 8 }}>
        {lbl}
      </div>
      <div className="draft-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <div>
          <label style={label}>Port</label>
          <input type="number" step="0.001" value={port || ''} onChange={(e) => onPort(parseFloat(e.target.value) || 0)} style={inputStyle} placeholder="0.000" />
        </div>
        <div>
          <label style={label}>Stbd</label>
          <input type="number" step="0.001" value={stbd || ''} onChange={(e) => onStbd(parseFloat(e.target.value) || 0)} style={inputStyle} placeholder="0.000" />
        </div>
      </div>
      <div style={{ marginTop: 6 }}>
        <label style={label}>Mark Distance Corr (m)</label>
        <input type="number" step="0.001" value={corr || ''} onChange={(e) => onCorr(parseFloat(e.target.value) || 0)} style={inputStyle} placeholder="0.000" />
      </div>
    </div>
  );
}

// ============================================================
// DEDUCTIBLE INPUTS
// ============================================================
function DeductibleInputs({ values, onUpdate }: { values: Deductibles; onUpdate: <K extends keyof Deductibles>(key: K, value: Deductibles[K]) => void }) {
  const fields: { key: keyof Deductibles; label: string }[] = [
    { key: 'hfo', label: 'HFO' },
    { key: 'vlsfo', label: 'VLSFO' },
    { key: 'mgo', label: 'MGO/AE' },
    { key: 'lubeOil', label: 'Lube Oil' },
    { key: 'freshWater', label: 'Fresh Water' },
    { key: 'ballastWater', label: 'Ballast Water' },
    { key: 'sludge', label: 'Sludge' },
    { key: 'bilgeWater', label: 'Bilge Water' },
    { key: 'shipConstant', label: 'Ship Constant' },
  ];

  const total = totalDeductibles(values);

  return (
    <>
      <div className="deduct-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {fields.map((f) => (
          <div key={f.key}>
            <label style={label}>{f.label} — MT</label>
            <input
              style={inputStyle}
              type="number"
              step="0.1"
              value={values[f.key] || ''}
              onChange={(e) => onUpdate(f.key, parseFloat(e.target.value) || 0)}
              placeholder="0.0"
            />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10, padding: '6px 12px', background: '#0c1610', border: '1px solid rgba(200,168,75,.2)', borderRadius: 3, fontSize: 12, color: '#c8a84b', fontFamily: rj, fontWeight: 700, textAlign: 'right' }}>
        Total Deductibles: {fmt(total, 1)} MT
      </div>
    </>
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
