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
type EventType =
  | 'NOR_TENDERED'
  | 'NOR_ACCEPTED'
  | 'LAYTIME_COMMENCED'
  | 'COMMENCED_LOADING'
  | 'COMMENCED_DISCHARGE'
  | 'COMPLETED_LOADING'
  | 'COMPLETED_DISCHARGE'
  | 'STOPPED'
  | 'RESUMED'
  | 'WAITING_BERTH'
  | 'ALL_FAST'
  | 'PILOT_BOARDED'
  | 'ANCHORED'
  | 'CUSTOM';

interface TimeEvent {
  id: string;
  type: EventType;
  description: string;
  datetime: string; // ISO string
  counts: boolean; // does this time count against laytime?
  excludedReason?: string; // why excluded (e.g. weather, holiday, SHEX)
}

interface LaytimeData {
  // Voyage info
  vesselName: string;
  voyage: string;
  port: string;
  operation: 'loading' | 'discharging' | 'both';
  cargoQty: number;
  cargoType: string;

  // CP Terms
  allowedLaytimeHours: number; // total hours allowed
  laytimeTerms: 'SHEX' | 'SHINC' | 'FHEX' | 'CUSTOM';
  norConditions: 'WIPON' | 'WIBON' | 'WIFPON' | 'BERTH';
  reversible: boolean;

  // Rates
  demurrageRate: number; // $/day
  despatchRate: number; // $/day (usually 50% of demurrage)
  despatchType: 'half' | 'full' | 'none';

  // Time bar
  timeBarDays: number; // for claim submission

  // Events
  events: TimeEvent[];

  notes: string;
}

const DEFAULT_DATA: LaytimeData = {
  vesselName: '',
  voyage: '',
  port: '',
  operation: 'loading',
  cargoQty: 0,
  cargoType: '',
  allowedLaytimeHours: 72, // 3 days default
  laytimeTerms: 'SHEX',
  norConditions: 'WIPON',
  reversible: false,
  demurrageRate: 25000,
  despatchRate: 12500,
  despatchType: 'half',
  timeBarDays: 90,
  events: [],
  notes: '',
};

const EVENT_LABELS: Record<EventType, string> = {
  NOR_TENDERED: 'NOR Tendered',
  NOR_ACCEPTED: 'NOR Accepted',
  LAYTIME_COMMENCED: 'Laytime Commenced',
  COMMENCED_LOADING: 'Commenced Loading',
  COMMENCED_DISCHARGE: 'Commenced Discharge',
  COMPLETED_LOADING: 'Completed Loading',
  COMPLETED_DISCHARGE: 'Completed Discharge',
  STOPPED: 'Operations Stopped',
  RESUMED: 'Operations Resumed',
  WAITING_BERTH: 'Waiting for Berth',
  ALL_FAST: 'All Fast at Berth',
  PILOT_BOARDED: 'Pilot Boarded',
  ANCHORED: 'Anchored',
  CUSTOM: 'Custom Event',
};

// ============================================================
// CALCULATIONS
// ============================================================
function calculateLaytime(d: LaytimeData) {
  const sortedEvents = [...d.events]
    .filter((e) => e.datetime)
    .sort((a, b) => a.datetime.localeCompare(b.datetime));

  // Find laytime start (NOR accepted or laytime commenced)
  const startEvt =
    sortedEvents.find((e) => e.type === 'LAYTIME_COMMENCED') ||
    sortedEvents.find((e) => e.type === 'NOR_ACCEPTED');

  // Find completion event
  const endEvt =
    sortedEvents.find((e) => e.type === 'COMPLETED_LOADING') ||
    sortedEvents.find((e) => e.type === 'COMPLETED_DISCHARGE');

  if (!startEvt || !endEvt) {
    return {
      sortedEvents,
      laytimeStart: null,
      laytimeEnd: null,
      totalHours: 0,
      countedHours: 0,
      excludedHours: 0,
      countedDays: 0,
      allowedDays: d.allowedLaytimeHours / 24,
      balance: 0, // negative = on demurrage, positive = despatch saved
      isDemurrage: false,
      claimAmount: 0,
      loadingRate: 0,
    };
  }

  const startMs = new Date(startEvt.datetime).getTime();
  const endMs = new Date(endEvt.datetime).getTime();
  const totalMs = endMs - startMs;
  const totalHours = totalMs / (1000 * 60 * 60);

  // Calculate excluded time from "STOPPED" → "RESUMED" pairs and excluded events
  let excludedHours = 0;
  let lastStopMs: number | null = null;

  for (const evt of sortedEvents) {
    const evtMs = new Date(evt.datetime).getTime();
    if (evtMs < startMs || evtMs > endMs) continue;

    if (evt.type === 'STOPPED' && evt.counts === false) {
      lastStopMs = evtMs;
    } else if (evt.type === 'RESUMED' && lastStopMs !== null) {
      excludedHours += (evtMs - lastStopMs) / (1000 * 60 * 60);
      lastStopMs = null;
    }
  }

  // If stopped but never resumed → exclude until end event
  if (lastStopMs !== null) {
    excludedHours += (endMs - lastStopMs) / (1000 * 60 * 60);
  }

  const countedHours = Math.max(0, totalHours - excludedHours);
  const countedDays = countedHours / 24;
  const allowedDays = d.allowedLaytimeHours / 24;
  const balance = allowedDays - countedDays; // positive = despatch, negative = demurrage

  const isDemurrage = balance < 0;
  const demurrageDays = isDemurrage ? Math.abs(balance) : 0;
  const despatchDays = !isDemurrage ? balance : 0;

  let claimAmount = 0;
  if (isDemurrage) {
    claimAmount = demurrageDays * d.demurrageRate; // owner gets paid
  } else if (d.despatchType === 'half') {
    claimAmount = despatchDays * d.despatchRate; // charterer gets paid
  } else if (d.despatchType === 'full') {
    claimAmount = despatchDays * d.demurrageRate; // full rate despatch
  }

  // Loading rate (MT/day) for reference
  const loadingRate = countedDays > 0 ? d.cargoQty / countedDays : 0;

  return {
    sortedEvents,
    laytimeStart: startEvt.datetime,
    laytimeEnd: endEvt.datetime,
    totalHours,
    countedHours,
    excludedHours,
    countedDays,
    allowedDays,
    balance,
    isDemurrage,
    demurrageDays,
    despatchDays,
    claimAmount,
    loadingRate,
  };
}

// Format hours as Hh Mm
function fmtDuration(hours: number): string {
  if (!isFinite(hours) || hours === 0) return '0h';
  const sign = hours < 0 ? '-' : '';
  const abs = Math.abs(hours);
  const d = Math.floor(abs / 24);
  const h = Math.floor(abs % 24);
  const m = Math.round((abs - Math.floor(abs)) * 60);
  if (d > 0) return `${sign}${d}d ${h}h ${m}m`;
  return `${sign}${h}h ${m}m`;
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

// ============================================================
// COMPONENT
// ============================================================
export default function LaytimeCalculatorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingId = searchParams.get('id');

  const [data, setData] = useState<LaytimeData>(DEFAULT_DATA);
  const [recordId, setRecordId] = useState<string | null>(existingId);
  const [recordName, setRecordName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [view, setView] = useState<'input' | 'report'>('input');

  // Load saved data
  useEffect(() => {
    if (existingId) {
      const saved = loadItem<LaytimeData>('laytime', existingId);
      if (saved) {
        setData(saved.data);
        setRecordName(saved.name);
      }
    }
  }, [existingId]);

  const calc = useMemo(() => calculateLaytime(data), [data]);

  function update<K extends keyof LaytimeData>(key: K, value: LaytimeData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  // Event management
  function addEvent(type: EventType = 'CUSTOM') {
    const newEvent: TimeEvent = {
      id: genId(),
      type,
      description: EVENT_LABELS[type],
      datetime: '',
      counts: !['STOPPED', 'WAITING_BERTH'].includes(type),
      excludedReason: '',
    };
    update('events', [...data.events, newEvent]);
  }

  function updateEvent(id: string, updates: Partial<TimeEvent>) {
    update(
      'events',
      data.events.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  }

  function deleteEvent(id: string) {
    update(
      'events',
      data.events.filter((e) => e.id !== id)
    );
  }

  function addStandardSequence() {
    const now = new Date();
    const fmt = (d: Date) => d.toISOString().slice(0, 16);
    const t0 = new Date(now);
    const t1 = new Date(now.getTime() + 6 * 3600 * 1000);
    const t2 = new Date(now.getTime() + 12 * 3600 * 1000);
    const t3 = new Date(now.getTime() + 60 * 3600 * 1000);

    update('events', [
      ...data.events,
      {
        id: genId(),
        type: 'NOR_TENDERED',
        description: 'NOR Tendered',
        datetime: fmt(t0),
        counts: true,
      },
      {
        id: genId(),
        type: 'NOR_ACCEPTED',
        description: 'NOR Accepted',
        datetime: fmt(t1),
        counts: true,
      },
      {
        id: genId(),
        type: data.operation === 'loading' ? 'COMMENCED_LOADING' : 'COMMENCED_DISCHARGE',
        description: data.operation === 'loading' ? 'Commenced Loading' : 'Commenced Discharge',
        datetime: fmt(t2),
        counts: true,
      },
      {
        id: genId(),
        type: data.operation === 'loading' ? 'COMPLETED_LOADING' : 'COMPLETED_DISCHARGE',
        description: data.operation === 'loading' ? 'Completed Loading' : 'Completed Discharge',
        datetime: fmt(t3),
        counts: true,
      },
    ]);
  }

  function handleSave() {
    const name = recordName.trim() || `${data.vesselName || 'Untitled'} — ${data.port || '?'}`;
    const id = recordId || genId();
    saveItem('laytime', name, data, id);
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
    router.replace('/voyage/laytime');
  }

  function handlePrint() {
    window.print();
  }

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
          ⏱️ Voyage Hub · Laytime Calculator
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
          Laytime, Demurrage & <em style={g}>Despatch</em>
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          Track NOR, loading/discharge events, allowed laytime, and auto-calculate demurrage or
          despatch. Supports SHEX, SHINC, WIPON, and standard charter party terms.
        </p>
      </div>

      {/* Action Bar */}
      <div
        className="action-bar"
        style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap', alignItems: 'center' }}
      >
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
          {view === 'input' ? '📊 View Statement' : '✏️ Edit'}
        </button>
        <button onClick={() => setShowSave(true)} style={ghostBtn}>
          💾 Save
        </button>
        <button onClick={handlePrint} style={ghostBtn}>
          🖨️ Print / PDF
        </button>
        <button onClick={handleReset} style={{ ...ghostBtn, color: '#ff8a8a', borderColor: 'rgba(255,138,138,.3)' }}>
          🗑️ Reset
        </button>
        {saveMsg && (
          <span style={{ color: '#4caf76', fontFamily: rj, fontSize: 12, fontWeight: 600 }}>
            {saveMsg}
          </span>
        )}
        {recordName && (
          <span style={{ color: '#7a8a72', fontFamily: rj, fontSize: 11, marginLeft: 'auto' }}>
            📂 {recordName}
          </span>
        )}
      </div>

      {/* Save Dialog */}
      {showSave && (
        <div style={{ ...card, background: 'rgba(200,168,75,.05)', borderColor: 'rgba(200,168,75,.4)' }}>
          <label style={label}>Name</label>
          <input
            type="text"
            value={recordName}
            onChange={(e) => setRecordName(e.target.value)}
            placeholder="e.g. MV NEURONAI — Tubarão Loading"
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
            <button onClick={() => setShowSave(false)} style={ghostBtn}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {view === 'input' ? (
        // ====================================
        // INPUT VIEW
        // ====================================
        <>
          {/* 1. Voyage Info */}
          <div style={card}>
            <div style={sectionTitle}>1. Port Operation Information</div>
            <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              <div>
                <label style={label}>Vessel Name</label>
                <input
                  style={inputStyle}
                  type="text"
                  value={data.vesselName}
                  onChange={(e) => update('vesselName', e.target.value)}
                  placeholder="MV NEURONAI"
                />
              </div>
              <div>
                <label style={label}>Voyage Number</label>
                <input
                  style={inputStyle}
                  type="text"
                  value={data.voyage}
                  onChange={(e) => update('voyage', e.target.value)}
                  placeholder="V-2026-005"
                />
              </div>
              <div>
                <label style={label}>Port</label>
                <input
                  style={inputStyle}
                  type="text"
                  value={data.port}
                  onChange={(e) => update('port', e.target.value)}
                  placeholder="Tubarão, Brazil"
                />
              </div>
            </div>
            <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 12 }}>
              <div>
                <label style={label}>Operation</label>
                <select
                  style={inputStyle}
                  value={data.operation}
                  onChange={(e) => update('operation', e.target.value as 'loading' | 'discharging' | 'both')}
                >
                  <option value="loading">Loading</option>
                  <option value="discharging">Discharging</option>
                  <option value="both">Both (Reversible)</option>
                </select>
              </div>
              <div>
                <label style={label}>Cargo Type</label>
                <input
                  style={inputStyle}
                  type="text"
                  value={data.cargoType}
                  onChange={(e) => update('cargoType', e.target.value)}
                  placeholder="Iron Ore"
                />
              </div>
              <div>
                <label style={label}>Cargo Quantity — MT</label>
                <input
                  style={inputStyle}
                  type="number"
                  step="100"
                  value={data.cargoQty || ''}
                  onChange={(e) => update('cargoQty', parseFloat(e.target.value) || 0)}
                  placeholder="170000"
                />
              </div>
            </div>
          </div>

          {/* 2. CP Terms */}
          <div style={card}>
            <div style={sectionTitle}>2. Charter Party Terms</div>
            <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              <div>
                <label style={label}>Allowed Laytime — hours</label>
                <input
                  style={inputStyle}
                  type="number"
                  step="0.5"
                  value={data.allowedLaytimeHours || ''}
                  onChange={(e) => update('allowedLaytimeHours', parseFloat(e.target.value) || 0)}
                  placeholder="72"
                />
                <span style={{ fontSize: 10, color: '#7a8a72', fontFamily: rj }}>
                  = {fmt(data.allowedLaytimeHours / 24, 2)} days
                </span>
              </div>
              <div>
                <label style={label}>Laytime Terms</label>
                <select
                  style={inputStyle}
                  value={data.laytimeTerms}
                  onChange={(e) => update('laytimeTerms', e.target.value as LaytimeData['laytimeTerms'])}
                >
                  <option value="SHEX">SHEX (Sundays/Holidays Excluded)</option>
                  <option value="SHINC">SHINC (Sundays/Holidays Included)</option>
                  <option value="FHEX">FHEX (Fridays/Holidays Excluded)</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>
              <div>
                <label style={label}>NOR Conditions</label>
                <select
                  style={inputStyle}
                  value={data.norConditions}
                  onChange={(e) => update('norConditions', e.target.value as LaytimeData['norConditions'])}
                >
                  <option value="WIPON">WIPON (Whether In Port Or Not)</option>
                  <option value="WIBON">WIBON (Whether In Berth Or Not)</option>
                  <option value="WIFPON">WIFPON (Whether In Free Pratique Or Not)</option>
                  <option value="BERTH">Berth Charter (At berth only)</option>
                </select>
              </div>
            </div>
            <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 12 }}>
              <div>
                <label style={label}>Demurrage Rate — $/day</label>
                <input
                  style={inputStyle}
                  type="number"
                  step="100"
                  value={data.demurrageRate || ''}
                  onChange={(e) => update('demurrageRate', parseFloat(e.target.value) || 0)}
                  placeholder="25000"
                />
              </div>
              <div>
                <label style={label}>Despatch Rate</label>
                <select
                  style={inputStyle}
                  value={data.despatchType}
                  onChange={(e) => update('despatchType', e.target.value as 'half' | 'full' | 'none')}
                >
                  <option value="half">Half Demurrage (50%)</option>
                  <option value="full">Full Demurrage (100%)</option>
                  <option value="none">No Despatch</option>
                </select>
              </div>
              <div>
                <label style={label}>Time Bar — days</label>
                <input
                  style={inputStyle}
                  type="number"
                  step="1"
                  value={data.timeBarDays || ''}
                  onChange={(e) => update('timeBarDays', parseFloat(e.target.value) || 0)}
                  placeholder="90"
                />
              </div>
            </div>
            {data.despatchType !== 'none' && (
              <p style={{ fontSize: 11, color: '#7a8a72', marginTop: 8, fontFamily: rj }}>
                Despatch rate: <strong style={{ color: '#c8a84b' }}>
                  {fmtMoney(data.despatchType === 'half' ? data.demurrageRate / 2 : data.demurrageRate)}/day
                </strong>
              </p>
            )}
          </div>

          {/* 3. Events Timeline */}
          <div style={card}>
            <div style={sectionTitle}>3. Statement of Facts / Events</div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <button
                onClick={addStandardSequence}
                style={{
                  background: 'rgba(200,168,75,.12)',
                  color: '#c8a84b',
                  border: '1px solid rgba(200,168,75,.4)',
                  padding: '7px 12px',
                  fontFamily: rj,
                  fontSize: 11,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  cursor: 'pointer',
                  borderRadius: 3,
                }}
              >
                ⚡ Add Standard Sequence
              </button>
              <button
                onClick={() => addEvent('NOR_TENDERED')}
                style={addBtn}
              >
                + NOR
              </button>
              <button onClick={() => addEvent('COMMENCED_LOADING')} style={addBtn}>
                + Commenced
              </button>
              <button onClick={() => addEvent('STOPPED')} style={addBtn}>
                + Stopped
              </button>
              <button onClick={() => addEvent('RESUMED')} style={addBtn}>
                + Resumed
              </button>
              <button onClick={() => addEvent('COMPLETED_LOADING')} style={addBtn}>
                + Completed
              </button>
              <button onClick={() => addEvent('CUSTOM')} style={addBtn}>
                + Custom
              </button>
            </div>

            {data.events.length === 0 ? (
              <div
                style={{
                  padding: '24px 14px',
                  textAlign: 'center',
                  border: '1px dashed rgba(200,168,75,.25)',
                  borderRadius: 4,
                  color: '#7a8a72',
                  fontSize: 12,
                }}
              >
                No events yet. Click <strong style={{ color: '#c8a84b' }}>&quot;Add Standard Sequence&quot;</strong> for a quick start, or add individual events above.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[...data.events]
                  .sort((a, b) => (a.datetime || '').localeCompare(b.datetime || ''))
                  .map((evt) => (
                    <div
                      key={evt.id}
                      style={{
                        background: '#0c1610',
                        border: `1px solid ${evt.counts ? 'rgba(200,168,75,.18)' : 'rgba(255,138,138,.2)'}`,
                        padding: 12,
                        borderRadius: 3,
                      }}
                    >
                      <div className="evt-grid" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr auto', gap: 10, alignItems: 'center' }}>
                        <select
                          value={evt.type}
                          onChange={(e) => {
                            const newType = e.target.value as EventType;
                            updateEvent(evt.id, {
                              type: newType,
                              description: EVENT_LABELS[newType],
                            });
                          }}
                          style={{ ...inputStyle, width: 'auto' }}
                        >
                          {Object.entries(EVENT_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>
                              {v}
                            </option>
                          ))}
                        </select>
                        <input
                          type="datetime-local"
                          value={evt.datetime}
                          onChange={(e) => updateEvent(evt.id, { datetime: e.target.value })}
                          style={inputStyle}
                        />
                        <input
                          type="text"
                          value={evt.description}
                          onChange={(e) => updateEvent(evt.id, { description: e.target.value })}
                          placeholder="Description"
                          style={inputStyle}
                        />
                        <button
                          onClick={() => deleteEvent(evt.id)}
                          style={{
                            background: 'transparent',
                            border: '1px solid rgba(255,138,138,.3)',
                            color: '#ff8a8a',
                            padding: '6px 10px',
                            fontFamily: rj,
                            fontSize: 11,
                            cursor: 'pointer',
                            borderRadius: 3,
                          }}
                        >
                          ✕
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: 12, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            cursor: 'pointer',
                            fontFamily: rj,
                            fontSize: 11,
                            color: evt.counts ? '#4caf76' : '#ff8a8a',
                            fontWeight: 600,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={evt.counts}
                            onChange={(e) => updateEvent(evt.id, { counts: e.target.checked })}
                            style={{ cursor: 'pointer' }}
                          />
                          {evt.counts ? '✓ Time COUNTS against laytime' : '✕ Time EXCLUDED (stoppage)'}
                        </label>
                        {!evt.counts && (
                          <input
                            type="text"
                            value={evt.excludedReason || ''}
                            onChange={(e) => updateEvent(evt.id, { excludedReason: e.target.value })}
                            placeholder="Reason (weather, SHEX, breakdown...)"
                            style={{ ...inputStyle, flex: 1, minWidth: 200, fontSize: 11 }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* 4. Notes */}
          <div style={card}>
            <div style={sectionTitle}>4. Notes / Remarks</div>
            <textarea
              value={data.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="Additional notes for the statement..."
              rows={3}
              style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }}
            />
          </div>

          {/* Quick Preview */}
          {calc.laytimeStart && calc.laytimeEnd && (
            <div
              style={{
                ...card,
                background: 'linear-gradient(135deg,rgba(200,168,75,.08),transparent)',
                borderColor: 'rgba(200,168,75,.4)',
              }}
            >
              <div style={sectionTitle}>⚡ Quick Result Preview</div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))',
                  gap: 14,
                }}
              >
                <KpiBox label="Allowed" value={fmt(calc.allowedDays, 2) + ' days'} color="#f5f0e8" sub={`${data.allowedLaytimeHours} hours`} />
                <KpiBox label="Used (Counted)" value={fmt(calc.countedDays, 2) + ' days'} color="#f5f0e8" sub={fmtDuration(calc.countedHours)} />
                <KpiBox
                  label={calc.isDemurrage ? 'Demurrage' : 'Despatch Saved'}
                  value={fmt(Math.abs(calc.balance), 2) + ' days'}
                  color={calc.isDemurrage ? '#ff8a8a' : '#4caf76'}
                  sub={calc.isDemurrage ? '(over allowed)' : '(under allowed)'}
                />
                <KpiBox
                  label={calc.isDemurrage ? 'Demurrage Due' : 'Despatch Due'}
                  value={fmtMoney(calc.claimAmount)}
                  color="#c8a84b"
                  sub={calc.isDemurrage ? 'Charterer pays' : 'Charterer earns'}
                  big
                />
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
                📊 View Full Statement →
              </button>
            </div>
          )}
        </>
      ) : (
        // ====================================
        // REPORT VIEW
        // ====================================
        <ReportView data={data} calc={calc} />
      )}

      <style>{`
        @media (max-width: 720px) {
          .g3 { grid-template-columns: 1fr !important; }
          .evt-grid { grid-template-columns: 1fr !important; }
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
function ReportView({ data, calc }: { data: LaytimeData; calc: ReturnType<typeof calculateLaytime> }) {
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
          ⏱️ Statement of Facts & Laytime Calculation
        </div>
        <h2 style={{ fontFamily: lb, fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
          {data.vesselName || 'Vessel Name'}
        </h2>
        <div style={{ fontSize: 13, color: '#b0c0a4', marginBottom: 4 }}>
          {data.port || '—'} · {data.operation === 'loading' ? 'LOADING' : data.operation === 'discharging' ? 'DISCHARGING' : 'BOTH'} · {data.cargoType || '—'}
        </div>
        <div style={{ fontSize: 11, color: '#7a8a72', fontFamily: rj }}>
          {data.cargoQty > 0 && `Cargo: ${data.cargoQty.toLocaleString()} MT · `}
          Voyage {data.voyage || '—'}
        </div>
      </div>

      {/* CP Terms */}
      <div style={card}>
        <div style={sectionTitle}>📋 Charter Party Terms</div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Allowed Laytime</span>
          <strong>{data.allowedLaytimeHours} hours ({fmt(calc.allowedDays, 2)} days)</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Laytime Terms</span>
          <strong>{data.laytimeTerms}</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>NOR Conditions</span>
          <strong>{data.norConditions}</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Demurrage Rate</span>
          <strong>{fmtMoney(data.demurrageRate)}/day</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Despatch Rate</span>
          <strong>
            {data.despatchType === 'none' ? 'None' : fmtMoney(data.despatchType === 'half' ? data.demurrageRate / 2 : data.demurrageRate) + '/day'}
            {data.despatchType !== 'none' && ` (${data.despatchType === 'half' ? '50%' : '100%'})`}
          </strong>
        </div>
        <div style={{ ...reportRow, borderBottom: 'none' }}>
          <span style={{ color: '#7a8a72' }}>Time Bar for Claim</span>
          <strong>{data.timeBarDays} days from completion</strong>
        </div>
      </div>

      {/* Events Timeline */}
      <div style={card}>
        <div style={sectionTitle}>📅 Statement of Facts (Events Timeline)</div>
        {calc.sortedEvents.length === 0 ? (
          <p style={{ color: '#7a8a72', fontSize: 12, textAlign: 'center', padding: 20 }}>
            No events recorded
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: rj, fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(200,168,75,.3)' }}>
                <th style={th}>Date / Time</th>
                <th style={th}>Event</th>
                <th style={th}>Description</th>
                <th style={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {calc.sortedEvents.map((evt) => (
                <tr key={evt.id} style={{ borderBottom: '1px solid rgba(200,168,75,.08)' }}>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>
                    {evt.datetime ? new Date(evt.datetime).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                  </td>
                  <td style={{ ...td, color: '#c8a84b', fontWeight: 600 }}>{EVENT_LABELS[evt.type]}</td>
                  <td style={td}>{evt.description}</td>
                  <td style={{ ...td, color: evt.counts ? '#4caf76' : '#ff8a8a', fontSize: 10.5, fontWeight: 600 }}>
                    {evt.counts ? '✓ COUNTS' : `✕ EXCLUDED${evt.excludedReason ? ` (${evt.excludedReason})` : ''}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Calculation Summary */}
      <div
        style={{
          ...card,
          background: calc.isDemurrage
            ? 'linear-gradient(135deg,rgba(255,138,138,.06),transparent)'
            : 'linear-gradient(135deg,rgba(76,175,118,.06),transparent)',
          borderColor: calc.isDemurrage ? 'rgba(255,138,138,.4)' : 'rgba(76,175,118,.4)',
        }}
      >
        <div style={sectionTitle}>⏱️ Laytime Calculation Summary</div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Laytime Commenced</span>
          <strong>{calc.laytimeStart ? new Date(calc.laytimeStart).toLocaleString('en-GB') : '—'}</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Laytime Completed</span>
          <strong>{calc.laytimeEnd ? new Date(calc.laytimeEnd).toLocaleString('en-GB') : '—'}</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Total Elapsed Time</span>
          <strong>{fmtDuration(calc.totalHours)}</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Time Excluded</span>
          <strong style={{ color: '#7a8a72' }}>{fmtDuration(calc.excludedHours)}</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Time Counted</span>
          <strong>{fmtDuration(calc.countedHours)} ({fmt(calc.countedDays, 3)} days)</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Allowed Laytime</span>
          <strong>{fmt(calc.allowedDays, 2)} days</strong>
        </div>
        <div style={reportRow}>
          <span style={{ color: '#7a8a72' }}>Loading Rate Achieved</span>
          <strong>{calc.loadingRate > 0 ? `${fmt(calc.loadingRate, 0)} MT/day` : '—'}</strong>
        </div>
        <div style={{ ...reportRow, borderBottom: 'none', borderTop: '2px solid', borderTopColor: calc.isDemurrage ? '#ff8a8a' : '#4caf76', paddingTop: 14, marginTop: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>
            {calc.isDemurrage ? 'TIME ON DEMURRAGE' : 'TIME SAVED (DESPATCH)'}
          </span>
          <strong style={{ fontFamily: lb, fontSize: 20, color: calc.isDemurrage ? '#ff8a8a' : '#4caf76' }}>
            {fmt(Math.abs(calc.balance), 3)} days
          </strong>
        </div>
      </div>

      {/* Claim Amount */}
      <div
        style={{
          ...card,
          background: 'linear-gradient(135deg,rgba(200,168,75,.12),transparent)',
          borderColor: '#c8a84b',
          padding: '24px 20px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            ...sectionTitle,
            borderBottom: 'none',
            textAlign: 'center',
            fontSize: 13,
            marginBottom: 12,
          }}
        >
          💰 {calc.isDemurrage ? 'Demurrage Due (Charterer Pays Owner)' : 'Despatch Due (Owner Pays Charterer)'}
        </div>
        <div style={{ fontFamily: lb, fontSize: 36, fontWeight: 700, color: '#c8a84b', marginBottom: 8 }}>
          {fmtMoney(calc.claimAmount)}
        </div>
        <p style={{ fontSize: 12, color: '#b0c0a4', fontFamily: rj }}>
          {calc.isDemurrage
            ? `${fmt(Math.abs(calc.balance), 3)} days × ${fmtMoney(data.demurrageRate)}/day`
            : `${fmt(calc.balance, 3)} days × ${fmtMoney(data.despatchType === 'half' ? data.demurrageRate / 2 : data.demurrageRate)}/day`}
        </p>
        {calc.laytimeEnd && (
          <p style={{ fontSize: 11, color: '#ff8a8a', fontFamily: rj, marginTop: 10, fontWeight: 600 }}>
            ⚠ Time bar:{' '}
            {new Date(new Date(calc.laytimeEnd).getTime() + data.timeBarDays * 24 * 3600 * 1000).toLocaleDateString('en-GB')}
            {' '}({data.timeBarDays} days from completion)
          </p>
        )}
      </div>

      {/* Notes */}
      {data.notes && (
        <div style={card}>
          <div style={sectionTitle}>📝 Notes</div>
          <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{data.notes}</p>
        </div>
      )}

      {/* Footer */}
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
        Generated by PortServiceFinder Voyage Hub · portservicefinder.com/voyage<br />
        <span style={{ fontSize: 10, marginTop: 4, display: 'inline-block' }}>
          For commercial purposes, verify calculation with independent SoF and legal review.
        </span>
      </div>
    </div>
  );
}

// ============================================================
// SHARED STYLES & COMPONENTS
// ============================================================
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
const addBtn: React.CSSProperties = {
  background: 'transparent',
  color: '#7a8a72',
  border: '1px solid rgba(200,168,75,.2)',
  padding: '7px 11px',
  fontFamily: rj,
  fontSize: 10.5,
  letterSpacing: '.5px',
  fontWeight: 600,
  cursor: 'pointer',
  borderRadius: 3,
};
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
      <div style={{ fontFamily: lb, fontSize: big ? 22 : 18, fontWeight: 700, color, lineHeight: 1.1 }}>
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
