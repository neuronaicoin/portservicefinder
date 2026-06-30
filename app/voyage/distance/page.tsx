'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { saveItem, loadItem, genId } from '@/lib/voyage-storage';
import {
  PORTS_SORTED,
  searchPorts,
  haversineDistance,
  initialBearing,
  bearingToCompass,
  type PortCoord,
} from '@/lib/ports-data';

const lb = "'Libre Bodoni', serif";
const rj = "'Rajdhani', sans-serif";
const g = { color: '#c8a84b', fontStyle: 'italic' };

interface DistData {
  fromPort: string;
  toPort: string;
  fromLat: number;
  fromLon: number;
  toLat: number;
  toLon: number;
  speeds: number[];
  consumptionRate: number; // MT/day at base speed
  baseSpeed: number;
  bunkerPrice: number;
  portStayDays: number;
  customDistance: number; // 0 = use calculated, else override
  notes: string;
}

const DEFAULT_DATA: DistData = {
  fromPort: '',
  toPort: '',
  fromLat: 0,
  fromLon: 0,
  toLat: 0,
  toLon: 0,
  speeds: [10, 12, 14, 16],
  consumptionRate: 28,
  baseSpeed: 12.5,
  bunkerPrice: 580,
  portStayDays: 0,
  customDistance: 0,
  notes: '',
};

// Approximate consumption scaling (cube law approximation)
function consumptionAtSpeed(baseRate: number, baseSpeed: number, targetSpeed: number): number {
  if (baseSpeed === 0) return 0;
  const ratio = targetSpeed / baseSpeed;
  return baseRate * Math.pow(ratio, 3);
}

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

export default function DistanceCalculatorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingId = searchParams.get('id');

  const [data, setData] = useState<DistData>(DEFAULT_DATA);
  const [recordId, setRecordId] = useState<string | null>(existingId);
  const [recordName, setRecordName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [showFromDD, setShowFromDD] = useState(false);
  const [showToDD, setShowToDD] = useState(false);

  // Load saved
  useEffect(() => {
    if (existingId) {
      const saved = loadItem<DistData>('distance', existingId);
      if (saved) {
        setData(saved.data);
        setRecordName(saved.name);
        setFromQuery(saved.data.fromPort);
        setToQuery(saved.data.toPort);
      }
    }
  }, [existingId]);

  // Calculate distance
  const calc = useMemo(() => {
    const greatCircleDist =
      data.fromLat && data.toLat
        ? haversineDistance(data.fromLat, data.fromLon, data.toLat, data.toLon)
        : 0;

    const distance = data.customDistance > 0 ? data.customDistance : greatCircleDist;

    const bearing =
      data.fromLat && data.toLat
        ? initialBearing(data.fromLat, data.fromLon, data.toLat, data.toLon)
        : 0;
    const compass = data.fromLat && data.toLat ? bearingToCompass(bearing) : '—';

    // Speed table
    const speedRows = data.speeds.map((speed) => {
      const days = speed > 0 ? distance / (speed * 24) : 0;
      const totalDays = days + data.portStayDays;
      const cons = consumptionAtSpeed(data.consumptionRate, data.baseSpeed, speed);
      const totalFuel = cons * days;
      const fuelCost = totalFuel * data.bunkerPrice;
      return {
        speed,
        days,
        totalDays,
        consPerDay: cons,
        totalFuel,
        fuelCost,
      };
    });

    return {
      greatCircleDist,
      distance,
      bearing,
      compass,
      speedRows,
      isOverride: data.customDistance > 0,
    };
  }, [data]);

  function update<K extends keyof DistData>(key: K, value: DistData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function selectFromPort(p: PortCoord) {
    setData((prev) => ({ ...prev, fromPort: `${p.name}, ${p.country}`, fromLat: p.lat, fromLon: p.lon }));
    setFromQuery(`${p.name}, ${p.country}`);
    setShowFromDD(false);
  }
  function selectToPort(p: PortCoord) {
    setData((prev) => ({ ...prev, toPort: `${p.name}, ${p.country}`, toLat: p.lat, toLon: p.lon }));
    setToQuery(`${p.name}, ${p.country}`);
    setShowToDD(false);
  }

  function handleSave() {
    const name = recordName.trim() || `${data.fromPort || '?'} → ${data.toPort || '?'}`;
    const id = recordId || genId();
    saveItem('distance', name, data, id);
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
    setFromQuery('');
    setToQuery('');
    router.replace('/voyage/distance');
  }

  function handleSwap() {
    const tmp = { name: data.fromPort, lat: data.fromLat, lon: data.fromLon, q: fromQuery };
    setData((prev) => ({
      ...prev,
      fromPort: prev.toPort,
      fromLat: prev.toLat,
      fromLon: prev.toLon,
      toPort: tmp.name,
      toLat: tmp.lat,
      toLon: tmp.lon,
    }));
    setFromQuery(toQuery);
    setToQuery(tmp.q);
  }

  function handlePrint() {
    window.print();
  }

  function fmt(n: number, d = 2): string {
    if (!isFinite(n)) return '–';
    return n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  function fmtMoney(n: number): string {
    if (!isFinite(n)) return '$0';
    return `$${Math.round(n).toLocaleString('en-US')}`;
  }

  const fromResults = useMemo(() => searchPorts(fromQuery), [fromQuery]);
  const toResults = useMemo(() => searchPorts(toQuery), [toQuery]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontFamily: rj,
            fontSize: 10,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#c8a84b',
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          📏 Voyage Hub · Distance Calculator
        </div>
        <h1
          style={{
            fontFamily: lb,
            fontSize: 'clamp(22px,3vw,32px)',
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: 8,
          }}
        >
          Port-to-Port <em style={g}>Distance</em> & ETA
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          Great circle distance, voyage time at multiple speeds, fuel needed, and approximate cost.
          150+ major ports in database — or enter custom coordinates.
        </p>
      </div>

      {/* Action Bar */}
      <div
        className="action-bar"
        style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap', alignItems: 'center' }}
      >
        <button
          onClick={() => setShowSave(true)}
          style={{
            background: '#c8a84b',
            color: '#08100a',
            border: 'none',
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
        {saveMsg && (
          <span style={{ color: '#4caf76', fontFamily: rj, fontSize: 12, fontWeight: 600 }}>
            {saveMsg}
          </span>
        )}
        {recordName && (
          <span
            style={{ color: '#7a8a72', fontFamily: rj, fontSize: 11, marginLeft: 'auto' }}
          >
            📂 {recordName}
          </span>
        )}
      </div>

      {/* Save Dialog */}
      {showSave && (
        <div
          style={{
            ...card,
            background: 'rgba(200,168,75,.05)',
            borderColor: 'rgba(200,168,75,.4)',
          }}
        >
          <label style={label}>Name for this calculation</label>
          <input
            type="text"
            value={recordName}
            onChange={(e) => setRecordName(e.target.value)}
            placeholder="e.g. Singapore → Rotterdam"
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
            <button
              onClick={() => setShowSave(false)}
              style={{
                background: 'transparent',
                color: '#7a8a72',
                border: '1px solid rgba(200,168,75,.2)',
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
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Port Selection */}
      <div style={card}>
        <div style={sectionTitle}>1. Select Ports</div>

        <div className="port-grid" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'end' }}>
          {/* FROM */}
          <div style={{ position: 'relative' }}>
            <label style={label}>From Port</label>
            <input
              type="text"
              value={fromQuery}
              onChange={(e) => {
                setFromQuery(e.target.value);
                setShowFromDD(true);
              }}
              onFocus={() => setShowFromDD(true)}
              onBlur={() => setTimeout(() => setShowFromDD(false), 200)}
              placeholder="Type port name or country..."
              style={inputStyle}
            />
            {showFromDD && fromResults.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#0c1610',
                  border: '1px solid rgba(200,168,75,.3)',
                  borderRadius: 3,
                  maxHeight: 240,
                  overflowY: 'auto',
                  zIndex: 50,
                  marginTop: 2,
                }}
              >
                {fromResults.map((p) => (
                  <div
                    key={`${p.name}_${p.lat}`}
                    onMouseDown={() => selectFromPort(p)}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(200,168,75,.08)',
                      fontFamily: rj,
                      fontSize: 12,
                    }}
                  >
                    <div style={{ color: '#f5f0e8', fontWeight: 600 }}>{p.name}</div>
                    <div style={{ color: '#7a8a72', fontSize: 10 }}>
                      {p.country} {p.unlocode ? `· ${p.unlocode}` : ''} · {fmt(p.lat, 2)}, {fmt(p.lon, 2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SWAP BUTTON */}
          <button
            onClick={handleSwap}
            title="Swap from and to"
            style={{
              background: 'transparent',
              border: '1px solid rgba(200,168,75,.3)',
              color: '#c8a84b',
              padding: '8px 12px',
              fontFamily: rj,
              fontSize: 16,
              cursor: 'pointer',
              borderRadius: 3,
              height: 36,
              marginBottom: 0,
            }}
          >
            ⇄
          </button>

          {/* TO */}
          <div style={{ position: 'relative' }}>
            <label style={label}>To Port</label>
            <input
              type="text"
              value={toQuery}
              onChange={(e) => {
                setToQuery(e.target.value);
                setShowToDD(true);
              }}
              onFocus={() => setShowToDD(true)}
              onBlur={() => setTimeout(() => setShowToDD(false), 200)}
              placeholder="Type port name or country..."
              style={inputStyle}
            />
            {showToDD && toResults.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#0c1610',
                  border: '1px solid rgba(200,168,75,.3)',
                  borderRadius: 3,
                  maxHeight: 240,
                  overflowY: 'auto',
                  zIndex: 50,
                  marginTop: 2,
                }}
              >
                {toResults.map((p) => (
                  <div
                    key={`${p.name}_${p.lat}`}
                    onMouseDown={() => selectToPort(p)}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(200,168,75,.08)',
                      fontFamily: rj,
                      fontSize: 12,
                    }}
                  >
                    <div style={{ color: '#f5f0e8', fontWeight: 600 }}>{p.name}</div>
                    <div style={{ color: '#7a8a72', fontSize: 10 }}>
                      {p.country} {p.unlocode ? `· ${p.unlocode}` : ''} · {fmt(p.lat, 2)}, {fmt(p.lon, 2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Custom coords (advanced) */}
        <details style={{ marginTop: 14 }}>
          <summary
            style={{
              fontFamily: rj,
              fontSize: 11,
              color: '#7a8a72',
              cursor: 'pointer',
              letterSpacing: '.5px',
            }}
          >
            ▸ Advanced: enter custom coordinates or override distance
          </summary>
          <div className="adv-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginTop: 12 }}>
            <div>
              <label style={label}>From Lat</label>
              <input
                type="number"
                step="0.0001"
                value={data.fromLat || ''}
                onChange={(e) => update('fromLat', parseFloat(e.target.value) || 0)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={label}>From Lon</label>
              <input
                type="number"
                step="0.0001"
                value={data.fromLon || ''}
                onChange={(e) => update('fromLon', parseFloat(e.target.value) || 0)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={label}>To Lat</label>
              <input
                type="number"
                step="0.0001"
                value={data.toLat || ''}
                onChange={(e) => update('toLat', parseFloat(e.target.value) || 0)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={label}>To Lon</label>
              <input
                type="number"
                step="0.0001"
                value={data.toLon || ''}
                onChange={(e) => update('toLon', parseFloat(e.target.value) || 0)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={label}>Override Dist (nm)</label>
              <input
                type="number"
                step="1"
                value={data.customDistance || ''}
                onChange={(e) => update('customDistance', parseFloat(e.target.value) || 0)}
                placeholder="0 = auto"
                style={inputStyle}
              />
            </div>
          </div>
          <p style={{ fontSize: 10.5, color: '#7a8a72', marginTop: 6, fontStyle: 'italic' }}>
            Great circle distance is theoretical (rhumb line / canal routing may differ). Use
            override for actual sea route distance.
          </p>
        </details>
      </div>

      {/* RESULT — Distance & Bearing */}
      {calc.distance > 0 && (
        <div
          style={{
            ...card,
            background: 'linear-gradient(135deg,rgba(200,168,75,.08),transparent)',
            borderColor: 'rgba(200,168,75,.4)',
          }}
        >
          <div style={sectionTitle}>📏 Distance Result</div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: 14,
            }}
          >
            <KpiBox
              label="Distance"
              value={`${fmt(calc.distance, 0)} nm`}
              sub={calc.isOverride ? 'Custom override' : 'Great circle'}
              color="#c8a84b"
              big
            />
            <KpiBox
              label="In KM"
              value={`${fmt(calc.distance * 1.852, 0)} km`}
              sub={`${fmt(calc.distance * 1.151, 0)} miles`}
              color="#f5f0e8"
            />
            <KpiBox
              label="Initial Bearing"
              value={`${fmt(calc.bearing, 1)}°`}
              sub={calc.compass}
              color="#f5f0e8"
            />
            {calc.isOverride && calc.greatCircleDist > 0 && (
              <KpiBox
                label="GC Distance"
                value={`${fmt(calc.greatCircleDist, 0)} nm`}
                sub={`+${fmt(((calc.distance - calc.greatCircleDist) / calc.greatCircleDist) * 100, 1)}% routing`}
                color="#7a8a72"
              />
            )}
          </div>
        </div>
      )}

      {/* 2. Voyage Parameters */}
      <div style={card}>
        <div style={sectionTitle}>2. Voyage Parameters</div>
        <div className="param-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          <div>
            <label style={label}>Base Speed — kts</label>
            <input
              type="number"
              step="0.1"
              value={data.baseSpeed || ''}
              onChange={(e) => update('baseSpeed', parseFloat(e.target.value) || 0)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={label}>Cons @ Base — MT/day</label>
            <input
              type="number"
              step="0.1"
              value={data.consumptionRate || ''}
              onChange={(e) => update('consumptionRate', parseFloat(e.target.value) || 0)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={label}>Bunker Price — $/MT</label>
            <input
              type="number"
              step="1"
              value={data.bunkerPrice || ''}
              onChange={(e) => update('bunkerPrice', parseFloat(e.target.value) || 0)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={label}>Port Stay — days</label>
            <input
              type="number"
              step="0.5"
              value={data.portStayDays || ''}
              onChange={(e) => update('portStayDays', parseFloat(e.target.value) || 0)}
              style={inputStyle}
            />
          </div>
        </div>
        <p style={{ fontSize: 10.5, color: '#7a8a72', marginTop: 10, fontStyle: 'italic' }}>
          Fuel scales with speed using cube law (cons ∝ speed³). Adjust speeds below to compare.
        </p>
      </div>

      {/* 3. Speed table */}
      <div style={card}>
        <div style={sectionTitle}>3. Speed / ETA / Fuel Table</div>
        <div style={{ marginBottom: 14 }}>
          <label style={label}>Speeds to compare (comma-separated, kts)</label>
          <input
            type="text"
            defaultValue={data.speeds.join(', ')}
            onBlur={(e) => {
              const arr = e.target.value
                .split(',')
                .map((x) => parseFloat(x.trim()))
                .filter((x) => isFinite(x) && x > 0)
                .slice(0, 8);
              if (arr.length > 0) update('speeds', arr);
            }}
            placeholder="10, 12, 14, 16"
            style={inputStyle}
          />
        </div>

        {calc.distance > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: rj, fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(200,168,75,.3)' }}>
                  <th style={th}>Speed (kts)</th>
                  <th style={th}>Sea Days</th>
                  <th style={th}>Total Days</th>
                  <th style={th}>Cons (MT/day)</th>
                  <th style={th}>Total Fuel (MT)</th>
                  <th style={th}>Fuel Cost</th>
                </tr>
              </thead>
              <tbody>
                {calc.speedRows.map((row) => (
                  <tr key={row.speed} style={{ borderBottom: '1px solid rgba(200,168,75,.1)' }}>
                    <td style={{ ...td, color: '#c8a84b', fontWeight: 700 }}>{fmt(row.speed, 1)}</td>
                    <td style={td}>{fmt(row.days, 2)}</td>
                    <td style={td}>{fmt(row.totalDays, 2)}</td>
                    <td style={td}>{fmt(row.consPerDay, 2)}</td>
                    <td style={td}>{fmt(row.totalFuel, 1)}</td>
                    <td style={{ ...td, color: '#f5f0e8', fontWeight: 600 }}>{fmtMoney(row.fuelCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: '#7a8a72', fontSize: 12 }}>
            Select two ports above to see calculation results.
          </div>
        )}
      </div>

      {/* 4. Notes */}
      <div style={card}>
        <div style={sectionTitle}>4. Notes</div>
        <textarea
          value={data.notes}
          onChange={(e) => update('notes', e.target.value)}
          placeholder="Additional remarks..."
          rows={3}
          style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }}
        />
      </div>

      <div
        style={{
          marginTop: 16,
          padding: '12px 14px',
          background: 'rgba(200,168,75,.04)',
          border: '1px solid rgba(200,168,75,.12)',
          borderRadius: 4,
          fontFamily: rj,
          fontSize: 11,
          color: '#7a8a72',
          lineHeight: 1.6,
        }}
      >
        💡 <strong style={{ color: '#c8a84b' }}>Note:</strong> Great circle distance is the
        theoretical shortest path. Actual sea routes vary by canal usage (Suez/Panama), traffic
        separation schemes, weather routing, and navigational restrictions. For commercial use,
        add 5–15% routing margin or use the override field with actual distance from your nautical
        publication.
      </div>

      <style>{`
        @media (max-width: 720px) {
          .port-grid { grid-template-columns: 1fr !important; }
          .port-grid > button { order: 99; margin: 0 auto; }
          .adv-grid { grid-template-columns: 1fr 1fr !important; }
          .param-grid { grid-template-columns: 1fr 1fr !important; }
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

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 8px',
  fontSize: 10.5,
  letterSpacing: '1px',
  textTransform: 'uppercase',
  color: '#c8a84b',
  fontWeight: 700,
};
const td: React.CSSProperties = {
  padding: '10px 8px',
  color: '#b0c0a4',
};

function KpiBox({
  label,
  value,
  color,
  sub,
  big,
}: {
  label: string;
  value: string;
  color: string;
  sub?: string;
  big?: boolean;
}) {
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
      <div style={{ fontFamily: lb, fontSize: big ? 24 : 18, fontWeight: 700, color, lineHeight: 1.1 }}>
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
