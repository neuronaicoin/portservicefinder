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
interface MarpolData {
  vesselName: string;
  imo: string;
  area: 'normal' | 'eca' | 'special' | 'med';
  // Annex I — Oil
  orb1LastDate: string;
  orb2LastDate: string;
  sludgeRob: number;
  bilgeRob: number;
  ows15ppm: boolean;
  oilRecordChecks: Record<string, boolean>;
  // Annex IV — Sewage
  sewageTreatment: 'plant' | 'tank' | 'comminuter';
  sewageRetention: number; // m3
  sewageChecks: Record<string, boolean>;
  // Annex V — Garbage
  grbLastDate: string;
  garbageChecks: Record<string, boolean>;
  // Annex VI — Air
  fuelSulphur: number; // % m/m
  bdnOnBoard: boolean;
  airChecks: Record<string, boolean>;
  notes: string;
}

const ANNEX1_CHECKS = [
  'ORB Part I up to date & signed',
  'ORB Part II (if applicable) up to date',
  'OWS / 15 ppm alarm operational & sealed',
  'IOPP certificate valid',
  'Sludge tank not overfilled',
  'Oil filtering equipment tested',
];
const ANNEX4_CHECKS = [
  'Sewage treatment plant operational',
  'ISPP certificate valid',
  'Discharge only >3 nm (comminuted) / >12 nm (untreated)',
  'No discharge in port/special areas',
];
const ANNEX5_CHECKS = [
  'Garbage Record Book up to date',
  'Garbage Management Plan on board',
  'Placards displayed',
  'No plastics discharged at sea',
  'Category segregation maintained',
];
const ANNEX6_CHECKS = [
  'Fuel sulphur within area limit',
  'Bunker Delivery Notes (BDN) retained 3 yrs',
  'Fuel changeover log for ECA',
  'IAPP certificate valid',
  'SEEMP Part I/II/III on board',
  'EEXI / CII documentation',
  'Ozone-depleting substances record',
];

function emptyChecks(keys: string[]): Record<string, boolean> {
  const o: Record<string, boolean> = {};
  keys.forEach((k) => (o[k] = false));
  return o;
}

const DEFAULT_DATA: MarpolData = {
  vesselName: '', imo: '', area: 'normal',
  orb1LastDate: '', orb2LastDate: '', sludgeRob: 0, bilgeRob: 0, ows15ppm: true,
  oilRecordChecks: emptyChecks(ANNEX1_CHECKS),
  sewageTreatment: 'plant', sewageRetention: 0, sewageChecks: emptyChecks(ANNEX4_CHECKS),
  grbLastDate: '', garbageChecks: emptyChecks(ANNEX5_CHECKS),
  fuelSulphur: 0.5, bdnOnBoard: true, airChecks: emptyChecks(ANNEX6_CHECKS),
  notes: '',
};

const AREA_META: Record<MarpolData['area'], { label: string; sulphur: number; note: string }> = {
  normal: { label: 'Normal waters', sulphur: 0.5, note: 'Global cap 0.50% sulphur. Standard discharge distances apply.' },
  eca: { label: 'Emission Control Area (ECA)', sulphur: 0.1, note: 'SOx ECA: max 0.10% sulphur fuel. NOx Tier III for newbuilds. Log fuel changeover.' },
  special: { label: 'Special Area (Annex I/V)', sulphur: 0.5, note: 'Stricter oil & garbage discharge rules. Generally no garbage discharge; oil ≤15 ppm only outside.' },
  med: { label: 'Mediterranean SOx ECA (2025)', sulphur: 0.1, note: 'Med Sea is a SOx ECA from May 2025 — max 0.10% sulphur fuel.' },
};

// ============================================================
// STYLES
// ============================================================
const card: React.CSSProperties = { background: '#111c13', border: '1px solid rgba(200,168,75,.18)', padding: '20px 18px', borderRadius: 4, marginBottom: 16 };
const sectionTitle: React.CSSProperties = { fontFamily: rj, fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid rgba(200,168,75,.12)' };
const labelS: React.CSSProperties = { display: 'block', fontFamily: rj, fontSize: 10, letterSpacing: '.5px', textTransform: 'uppercase', color: '#7a8a72', fontWeight: 600, marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', background: '#0c1610', border: '1px solid rgba(200,168,75,.2)', color: '#f5f0e8', padding: '7px 9px', fontFamily: rj, fontSize: 12.5, fontWeight: 500, borderRadius: 3, boxSizing: 'border-box' };
const ghostBtn: React.CSSProperties = { background: 'transparent', color: '#c8a84b', border: '1px solid rgba(200,168,75,.4)', padding: '8px 14px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };
const goldBtn: React.CSSProperties = { background: '#c8a84b', color: '#08100a', border: 'none', padding: '8px 16px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };

function daysSince(dateStr: string): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return null;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.round((now.getTime() - d.getTime()) / 86400000);
}

// ============================================================
// COMPONENT
// ============================================================
export default function MarpolPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingId = searchParams.get('id');

  const [data, setData] = useState<MarpolData>(DEFAULT_DATA);
  const [recordId, setRecordId] = useState<string | null>(existingId);
  const [recordName, setRecordName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (existingId) {
      const saved = loadItem<MarpolData>('marpol', existingId);
      if (saved) { setData({ ...DEFAULT_DATA, ...saved.data }); setRecordName(saved.name); }
    }
  }, [existingId]);

  function update<K extends keyof MarpolData>(key: K, value: MarpolData[K]) { setData((p) => ({ ...p, [key]: value })); }
  function num(v: string): number { return parseFloat(v) || 0; }
  function toggleCheck(group: 'oilRecordChecks' | 'sewageChecks' | 'garbageChecks' | 'airChecks', key: string) {
    setData((p) => ({ ...p, [group]: { ...p[group], [key]: !p[group][key] } }));
  }

  const area = AREA_META[data.area];
  const sulphurOk = data.fuelSulphur <= area.sulphur + 1e-9;

  const compliance = useMemo(() => {
    const all = [
      ...Object.values(data.oilRecordChecks),
      ...Object.values(data.sewageChecks),
      ...Object.values(data.garbageChecks),
      ...Object.values(data.airChecks),
    ];
    const done = all.filter(Boolean).length;
    return { done, total: all.length, pct: all.length ? Math.round((done / all.length) * 100) : 0 };
  }, [data]);

  function handleSave() {
    const name = recordName.trim() || `${data.vesselName || 'Vessel'} — MARPOL`;
    const id = recordId || genId();
    saveItem('marpol', name, data, id);
    setRecordId(id); setRecordName(name); setSaveMsg('✓ Saved'); setShowSave(false);
    setTimeout(() => setSaveMsg(''), 3000);
  }
  function handleReset() {
    if (!confirm('Reset all fields?')) return;
    setData(DEFAULT_DATA); setRecordId(null); setRecordName(''); router.replace('/voyage/marpol');
  }

  const orb1Days = daysSince(data.orb1LastDate);
  const grbDays = daysSince(data.grbLastDate);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>
          ⚓ Voyage Hub · MARPOL Tracker
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          MARPOL <em style={g}>Tracker</em>
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          A self-check for MARPOL Annexes I, IV, V and VI — record books, discharge rules and the
          fuel sulphur limit for your current area. A compliance aid, not a substitute for the Convention text.
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
          <input type="text" value={recordName} onChange={(e) => setRecordName(e.target.value)} placeholder="e.g. MV NEURONAI — MARPOL self-check" style={{ ...inputStyle, marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{ ...goldBtn, padding: '8px 14px', letterSpacing: '1px' }}>Save</button>
            <button onClick={() => setShowSave(false)} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* Vessel + area */}
      <div style={card}>
        <div style={sectionTitle}>Vessel &amp; Current Area</div>
        <div className="mp-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          <div><label style={labelS}>Vessel</label><input style={inputStyle} value={data.vesselName} onChange={(e) => update('vesselName', e.target.value)} placeholder="MV NEURONAI" /></div>
          <div><label style={labelS}>IMO</label><input style={inputStyle} value={data.imo} onChange={(e) => update('imo', e.target.value)} placeholder="9876543" /></div>
          <div>
            <label style={labelS}>Current Area</label>
            <select style={inputStyle} value={data.area} onChange={(e) => update('area', e.target.value as MarpolData['area'])}>
              {(Object.keys(AREA_META) as MarpolData['area'][]).map((k) => <option key={k} value={k}>{AREA_META[k].label}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(200,168,75,.05)', border: '1px solid rgba(200,168,75,.15)', borderRadius: 3, fontFamily: rj, fontSize: 12, color: '#b0c0a4' }}>
          📍 {area.note} · Sulphur limit: <b style={{ color: '#c8a84b' }}>{area.sulphur.toFixed(2)}% m/m</b>
        </div>
      </div>

      {/* Compliance summary */}
      {compliance.total > 0 && (
        <div style={{ ...card, background: 'linear-gradient(135deg,rgba(200,168,75,.08),transparent)', borderColor: 'rgba(200,168,75,.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontFamily: rj, fontSize: 12, color: '#7a8a72' }}>
            <span>Self-check completion</span>
            <span style={{ color: compliance.pct === 100 ? '#4caf76' : '#c8a84b', fontWeight: 700 }}>{compliance.done}/{compliance.total} · {compliance.pct}%</span>
          </div>
          <div style={{ height: 10, background: '#0c1610', borderRadius: 5, overflow: 'hidden', border: '1px solid rgba(200,168,75,.2)' }}>
            <div style={{ width: `${compliance.pct}%`, height: '100%', background: compliance.pct === 100 ? '#4caf76' : 'linear-gradient(90deg,#c8a84b,#4caf76)' }} />
          </div>
        </div>
      )}

      {/* Annex I */}
      <div style={card}>
        <div style={sectionTitle}>🛢️ Annex I — Oil</div>
        <div className="mp-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={labelS}>ORB Part I — last entry</label>
            <input style={inputStyle} type="date" value={data.orb1LastDate} onChange={(e) => update('orb1LastDate', e.target.value)} />
            {orb1Days != null && <span style={{ fontSize: 10, color: orb1Days > 7 ? '#ff8a8a' : '#7a8a72', fontFamily: rj }}>{orb1Days} days ago{orb1Days > 7 ? ' ⚠' : ''}</span>}
          </div>
          <div><label style={labelS}>Sludge ROB (m³)</label><input style={inputStyle} type="number" step="0.1" value={data.sludgeRob || ''} onChange={(e) => update('sludgeRob', num(e.target.value))} placeholder="12.5" /></div>
          <div><label style={labelS}>Bilge ROB (m³)</label><input style={inputStyle} type="number" step="0.1" value={data.bilgeRob || ''} onChange={(e) => update('bilgeRob', num(e.target.value))} placeholder="8.0" /></div>
        </div>
        <Checklist keys={ANNEX1_CHECKS} state={data.oilRecordChecks} onToggle={(k) => toggleCheck('oilRecordChecks', k)} />
      </div>

      {/* Annex IV */}
      <div style={card}>
        <div style={sectionTitle}>🚽 Annex IV — Sewage</div>
        <div className="mp-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={labelS}>System</label>
            <select style={inputStyle} value={data.sewageTreatment} onChange={(e) => update('sewageTreatment', e.target.value as MarpolData['sewageTreatment'])}>
              <option value="plant">Treatment plant</option>
              <option value="comminuter">Comminuter / disinfection</option>
              <option value="tank">Holding tank only</option>
            </select>
          </div>
          <div><label style={labelS}>Retention ROB (m³)</label><input style={inputStyle} type="number" step="0.1" value={data.sewageRetention || ''} onChange={(e) => update('sewageRetention', num(e.target.value))} placeholder="5.0" /></div>
        </div>
        <Checklist keys={ANNEX4_CHECKS} state={data.sewageChecks} onToggle={(k) => toggleCheck('sewageChecks', k)} />
      </div>

      {/* Annex V */}
      <div style={card}>
        <div style={sectionTitle}>🗑️ Annex V — Garbage</div>
        <div style={{ marginBottom: 14, maxWidth: 240 }}>
          <label style={labelS}>Garbage Record Book — last entry</label>
          <input style={inputStyle} type="date" value={data.grbLastDate} onChange={(e) => update('grbLastDate', e.target.value)} />
          {grbDays != null && <span style={{ fontSize: 10, color: grbDays > 14 ? '#ff8a8a' : '#7a8a72', fontFamily: rj }}>{grbDays} days ago{grbDays > 14 ? ' ⚠' : ''}</span>}
        </div>
        <Checklist keys={ANNEX5_CHECKS} state={data.garbageChecks} onToggle={(k) => toggleCheck('garbageChecks', k)} />
      </div>

      {/* Annex VI */}
      <div style={card}>
        <div style={sectionTitle}>💨 Annex VI — Air</div>
        <div className="mp-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={labelS}>In-use Fuel Sulphur (% m/m)</label>
            <input style={{ ...inputStyle, borderColor: sulphurOk ? 'rgba(200,168,75,.2)' : 'rgba(255,138,138,.5)' }} type="number" step="0.01" value={data.fuelSulphur || ''} onChange={(e) => update('fuelSulphur', num(e.target.value))} placeholder="0.10" />
            <span style={{ fontSize: 10.5, color: sulphurOk ? '#4caf76' : '#ff8a8a', fontFamily: rj, fontWeight: 600 }}>
              {sulphurOk ? `✓ within ${area.sulphur.toFixed(2)}% limit` : `⚠ exceeds ${area.sulphur.toFixed(2)}% limit for this area`}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: rj, fontSize: 12.5, color: data.bdnOnBoard ? '#4caf76' : '#ff8a8a', padding: '7px 0' }}>
              <input type="checkbox" checked={data.bdnOnBoard} onChange={(e) => update('bdnOnBoard', e.target.checked)} style={{ width: 16, height: 16, accentColor: '#c8a84b' }} />
              BDN samples retained on board
            </label>
          </div>
        </div>
        <Checklist keys={ANNEX6_CHECKS} state={data.airChecks} onToggle={(k) => toggleCheck('airChecks', k)} />
      </div>

      {/* Notes */}
      <div style={card}>
        <div style={sectionTitle}>Notes</div>
        <textarea value={data.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Discharge events, area transitions, deficiencies to rectify..." rows={3} style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} />
      </div>

      {/* Reference */}
      <div style={{ ...card, background: 'rgba(122,138,114,.05)', borderColor: 'rgba(122,138,114,.15)' }}>
        <div style={sectionTitle}>📖 Quick Reference</div>
        <ul style={{ fontSize: 11.5, color: '#b0c0a4', lineHeight: 1.7, paddingLeft: 18, fontFamily: rj }}>
          <li><b style={{ color: '#c8a84b' }}>Annex I</b> — oil ≤15 ppm via OWS; no discharge in special areas; ORB entries for every oil transfer/operation.</li>
          <li><b style={{ color: '#c8a84b' }}>Annex IV</b> — treated sewage &gt;3 nm, untreated &gt;12 nm at ≥4 kts; nothing in port/special areas.</li>
          <li><b style={{ color: '#c8a84b' }}>Annex V</b> — garbage generally prohibited at sea; food waste only &gt;12 nm comminuted; never any plastics.</li>
          <li><b style={{ color: '#c8a84b' }}>Annex VI</b> — global sulphur cap 0.50%; ECA/Med SOx 0.10%; keep BDNs 3 years, log fuel changeover.</li>
          <li>This is a self-check aid. The MARPOL Convention, your SMS procedures and flag/class requirements govern.</li>
        </ul>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .mp-g3 { grid-template-columns: 1fr 1fr !important; }
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

function Checklist({ keys, state, onToggle }: { keys: string[]; state: Record<string, boolean>; onToggle: (k: string) => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0 }}>
      {keys.map((k) => {
        const checked = !!state[k];
        return (
          <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px dashed rgba(200,168,75,.1)', cursor: 'pointer', fontFamily: rj, fontSize: 12.5, color: checked ? '#f5f0e8' : '#b0c0a4' }}>
            <input type="checkbox" checked={checked} onChange={() => onToggle(k)} style={{ width: 16, height: 16, accentColor: '#4caf76', flexShrink: 0 }} />
            <span style={{ textDecoration: checked ? 'none' : 'none' }}>{checked ? '✓ ' : ''}{k}</span>
          </label>
        );
      })}
    </div>
  );
}
