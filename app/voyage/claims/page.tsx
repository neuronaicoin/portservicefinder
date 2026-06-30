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
type ClaimType = 'demurrage' | 'offhire' | 'speedcons' | 'other';
type ClaimStatus = 'draft' | 'submitted' | 'agreed' | 'paid' | 'disputed';

interface ClaimBase {
  id: string;
  type: ClaimType;
  title: string;
  status: ClaimStatus;
  eventDate: string;   // date the claim event ended (time-bar starts)
  timeBarDays: number; // CP time bar (e.g. 90)
  notes: string;
}

interface DemurrageClaim extends ClaimBase {
  type: 'demurrage';
  allowedLaytime: number;  // hours
  usedLaytime: number;     // hours
  demurrageRate: number;   // $/day
  despatchRate: number;    // $/day (0 = none; often half demurrage)
}
interface OffHireClaim extends ClaimBase {
  type: 'offhire';
  hours: number;
  hireRate: number;        // $/day
  bunkerValue: number;     // off-hire bunker $ (added to owner credit)
}
interface SpeedConsClaim extends ClaimBase {
  type: 'speedcons';
  gwDays: number;          // good weather days analysed
  // speed
  warrantedSpeed: number;
  actualSpeed: number;
  hireRate: number;        // $/day (for time value)
  // consumption
  warrantedCons: number;   // MT/day
  actualCons: number;      // MT/day
  bunkerPrice: number;     // $/MT
}
interface OtherClaim extends ClaimBase {
  type: 'other';
  amount: number;
  dir: 'owner' | 'charterer'; // who is owed
}

type Claim = DemurrageClaim | OffHireClaim | SpeedConsClaim | OtherClaim;

interface ClaimsData {
  vesselName: string;
  charterer: string;
  cpDate: string;
  claims: Claim[];
}

const DEFAULT_DATA: ClaimsData = {
  vesselName: '',
  charterer: '',
  cpDate: '',
  claims: [],
};

// ============================================================
// CALC
// ============================================================
// Positive result = CHARTERER owes OWNER. Negative = OWNER owes CHARTERER.
function claimValue(c: Claim): number {
  switch (c.type) {
    case 'demurrage': {
      const overHours = c.usedLaytime - c.allowedLaytime;
      if (overHours > 0) {
        // demurrage — charterer owes owner
        return (overHours / 24) * c.demurrageRate;
      } else {
        // despatch — owner owes charterer (negative)
        const savedHours = -overHours;
        return -((savedHours / 24) * c.despatchRate);
      }
    }
    case 'offhire': {
      // owner credits charterer (negative) for hire + bunker
      const hire = (c.hours / 24) * c.hireRate;
      return -(hire + c.bunkerValue);
    }
    case 'speedcons': {
      // owner owes charterer for excess consumption + time lost (both negative)
      const excessConsPerDay = c.actualCons - c.warrantedCons;
      const excessFuel = excessConsPerDay * c.gwDays;
      const fuelClaim = excessFuel > 0 ? excessFuel * c.bunkerPrice : 0;
      // time lost from underperformance
      let timeClaim = 0;
      if (c.actualSpeed > 0 && c.warrantedSpeed > 0 && c.actualSpeed < c.warrantedSpeed) {
        const distance = c.actualSpeed * 24 * c.gwDays; // nm covered in GW period
        const timeAtWarranted = distance / (c.warrantedSpeed * 24); // days it should have taken
        const timeLostDays = c.gwDays - timeAtWarranted; // extra days
        timeClaim = timeLostDays * c.hireRate;
      }
      return -(fuelClaim + timeClaim);
    }
    case 'other': {
      return c.dir === 'owner' ? Math.abs(c.amount) : -Math.abs(c.amount);
    }
  }
}

function timeBarStatus(c: ClaimBase): { daysLeft: number | null; deadline: string | null } {
  if (!c.eventDate || !c.timeBarDays) return { daysLeft: null, deadline: null };
  const ev = new Date(c.eventDate + 'T00:00:00');
  if (isNaN(ev.getTime())) return { daysLeft: null, deadline: null };
  const dl = new Date(ev);
  dl.setDate(dl.getDate() + c.timeBarDays);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const daysLeft = Math.round((dl.getTime() - now.getTime()) / 86400000);
  return { daysLeft, deadline: dl.toISOString().slice(0, 10) };
}

function fmt(n: number, dec = 2): string {
  if (!isFinite(n)) return '–';
  return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function money(n: number): string {
  return (n < 0 ? '-$' : '$') + fmt(Math.abs(n), 2);
}
function prettyDate(s: string | null): string {
  if (!s) return '—';
  const d = new Date(s + 'T00:00:00');
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ============================================================
// STYLES
// ============================================================
const card: React.CSSProperties = { background: '#111c13', border: '1px solid rgba(200,168,75,.18)', padding: '20px 18px', borderRadius: 4, marginBottom: 16 };
const sectionTitle: React.CSSProperties = { fontFamily: rj, fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid rgba(200,168,75,.12)' };
const label: React.CSSProperties = { display: 'block', fontFamily: rj, fontSize: 10, letterSpacing: '.5px', textTransform: 'uppercase', color: '#7a8a72', fontWeight: 600, marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', background: '#0c1610', border: '1px solid rgba(200,168,75,.2)', color: '#f5f0e8', padding: '7px 9px', fontFamily: rj, fontSize: 12.5, fontWeight: 500, borderRadius: 3, boxSizing: 'border-box' };
const ghostBtn: React.CSSProperties = { background: 'transparent', color: '#c8a84b', border: '1px solid rgba(200,168,75,.4)', padding: '8px 14px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };
const goldBtn: React.CSSProperties = { background: '#c8a84b', color: '#08100a', border: 'none', padding: '8px 16px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };

const STATUS_META: Record<ClaimStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'DRAFT', color: '#7a8a72', bg: 'rgba(122,138,114,.14)' },
  submitted: { label: 'SUBMITTED', color: '#5aa6e8', bg: 'rgba(90,166,232,.14)' },
  agreed: { label: 'AGREED', color: '#c8a84b', bg: 'rgba(200,168,75,.14)' },
  paid: { label: 'PAID', color: '#4caf76', bg: 'rgba(76,175,118,.14)' },
  disputed: { label: 'DISPUTED', color: '#ff8a8a', bg: 'rgba(255,138,138,.14)' },
};

const TYPE_META: Record<ClaimType, { label: string; icon: string }> = {
  demurrage: { label: 'Demurrage / Despatch', icon: '⏱️' },
  offhire: { label: 'Off-Hire', icon: '⏸️' },
  speedcons: { label: 'Speed / Consumption', icon: '⚡' },
  other: { label: 'Other / Cargo', icon: '📦' },
};

// ============================================================
// COMPONENT
// ============================================================
export default function ClaimsCenterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingId = searchParams.get('id');

  const [data, setData] = useState<ClaimsData>(DEFAULT_DATA);
  const [recordId, setRecordId] = useState<string | null>(existingId);
  const [recordName, setRecordName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [filter, setFilter] = useState<'all' | ClaimStatus>('all');

  useEffect(() => {
    if (existingId) {
      const saved = loadItem<ClaimsData>('claims', existingId);
      if (saved) { setData(saved.data); setRecordName(saved.name); }
    }
  }, [existingId]);

  function update<K extends keyof ClaimsData>(key: K, value: ClaimsData[K]) {
    setData((p) => ({ ...p, [key]: value }));
  }
  function num(v: string): number { return parseFloat(v) || 0; }

  function newClaim(type: ClaimType): Claim {
    const base = { id: genId(), type, title: '', status: 'draft' as ClaimStatus, eventDate: '', timeBarDays: 90, notes: '' };
    switch (type) {
      case 'demurrage': return { ...base, type, allowedLaytime: 0, usedLaytime: 0, demurrageRate: 0, despatchRate: 0 };
      case 'offhire': return { ...base, type, hours: 0, hireRate: 0, bunkerValue: 0 };
      case 'speedcons': return { ...base, type, gwDays: 0, warrantedSpeed: 0, actualSpeed: 0, hireRate: 0, warrantedCons: 0, actualCons: 0, bunkerPrice: 0 };
      case 'other': return { ...base, type, amount: 0, dir: 'owner' };
    }
  }
  function addClaim(type: ClaimType) {
    setData((p) => ({ ...p, claims: [...p.claims, newClaim(type)] }));
  }
  function updClaim(id: string, patch: Partial<Claim>) {
    setData((p) => ({ ...p, claims: p.claims.map((c) => (c.id === id ? { ...c, ...patch } as Claim : c)) }));
  }
  function delClaim(id: string) {
    setData((p) => ({ ...p, claims: p.claims.filter((c) => c.id !== id) }));
  }

  const netPosition = useMemo(() => data.claims.reduce((s, c) => s + claimValue(c), 0), [data.claims]);
  const visibleClaims = useMemo(() => filter === 'all' ? data.claims : data.claims.filter((c) => c.status === filter), [data.claims, filter]);

  const urgentCount = useMemo(() => data.claims.filter((c) => {
    if (c.status === 'paid' || c.status === 'agreed') return false;
    const t = timeBarStatus(c);
    return t.daysLeft != null && t.daysLeft <= 14;
  }).length, [data.claims]);

  function handleSave() {
    const name = recordName.trim() || `${data.vesselName || 'Vessel'} — Claims`;
    const id = recordId || genId();
    saveItem('claims', name, data, id);
    setRecordId(id); setRecordName(name); setSaveMsg('✓ Saved'); setShowSave(false);
    setTimeout(() => setSaveMsg(''), 3000);
  }
  function handleReset() {
    if (!confirm('Reset all fields?')) return;
    setData(DEFAULT_DATA); setRecordId(null); setRecordName(''); router.replace('/voyage/claims');
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>
          ⚓ Voyage Hub · Claims Center
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Claims <em style={g}>Center</em>
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          Track demurrage, off-hire, and speed/consumption claims in one register, with time-bar
          countdowns and a running net position. A working estimate — always reconcile against the charter party.
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
          <label style={label}>Name</label>
          <input type="text" value={recordName} onChange={(e) => setRecordName(e.target.value)} placeholder="e.g. MV NEURONAI — Voyage 12 Claims" style={{ ...inputStyle, marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{ ...goldBtn, padding: '8px 14px', letterSpacing: '1px' }}>Save</button>
            <button onClick={() => setShowSave(false)} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* Voyage info */}
      <div style={card}>
        <div style={sectionTitle}>Voyage Reference</div>
        <div className="claims-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          <div><label style={label}>Vessel</label><input style={inputStyle} value={data.vesselName} onChange={(e) => update('vesselName', e.target.value)} placeholder="MV NEURONAI" /></div>
          <div><label style={label}>Charterer</label><input style={inputStyle} value={data.charterer} onChange={(e) => update('charterer', e.target.value)} placeholder="ABC Chartering" /></div>
          <div><label style={label}>CP Date</label><input style={inputStyle} type="date" value={data.cpDate} onChange={(e) => update('cpDate', e.target.value)} /></div>
        </div>
      </div>

      {/* Net position + urgent */}
      <div style={{ ...card, background: 'linear-gradient(135deg,rgba(200,168,75,.08),transparent)', borderColor: 'rgba(200,168,75,.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#7a8a72', fontWeight: 700 }}>
              Net Position ({data.claims.length} claim{data.claims.length !== 1 ? 's' : ''})
            </div>
            <div style={{ fontFamily: lb, fontSize: 30, fontWeight: 700, color: netPosition >= 0 ? '#4caf76' : '#ff8a8a', marginTop: 2 }}>
              {money(Math.abs(netPosition))}
            </div>
            <div style={{ fontFamily: rj, fontSize: 11, color: '#7a8a72' }}>
              {netPosition >= 0 ? 'Charterer owes Owner' : 'Owner owes Charterer'}
            </div>
          </div>
          {urgentCount > 0 && (
            <div style={{ background: 'rgba(255,138,138,.12)', border: '1px solid rgba(255,138,138,.4)', borderRadius: 4, padding: '10px 14px', textAlign: 'center' }}>
              <div style={{ fontFamily: lb, fontSize: 22, fontWeight: 700, color: '#ff8a8a' }}>{urgentCount}</div>
              <div style={{ fontFamily: rj, fontSize: 9.5, color: '#ff8a8a', letterSpacing: '.5px', textTransform: 'uppercase', fontWeight: 700 }}>Time-bar ≤14d</div>
            </div>
          )}
        </div>
      </div>

      {/* Add buttons */}
      <div style={card}>
        <div style={sectionTitle}>➕ Add a Claim</div>
        <div className="claims-add" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {(Object.keys(TYPE_META) as ClaimType[]).map((t) => (
            <button key={t} onClick={() => addClaim(t)} style={{ ...ghostBtn, width: '100%', padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
              <span style={{ fontSize: 18 }}>{TYPE_META[t].icon}</span>
              <span style={{ fontSize: 9.5 }}>{TYPE_META[t].label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter */}
      {data.claims.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {(['all', 'draft', 'submitted', 'agreed', 'paid', 'disputed'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 12px', background: filter === f ? '#c8a84b' : 'transparent', color: filter === f ? '#08100a' : '#7a8a72', border: `1px solid ${filter === f ? '#c8a84b' : 'rgba(200,168,75,.25)'}`, fontFamily: rj, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 }}>
              {f === 'all' ? 'All' : STATUS_META[f].label}
            </button>
          ))}
        </div>
      )}

      {/* Claim cards */}
      {visibleClaims.length === 0 && (
        <div style={{ ...card, textAlign: 'center', color: '#7a8a72', fontFamily: rj }}>
          {data.claims.length === 0 ? 'No claims yet. Add one above to start the register.' : 'No claims match this filter.'}
        </div>
      )}

      {visibleClaims.map((c) => {
        const val = claimValue(c);
        const tb = timeBarStatus(c);
        const sm = STATUS_META[c.status];
        const urgent = tb.daysLeft != null && tb.daysLeft <= 14 && c.status !== 'paid' && c.status !== 'agreed';
        const expired = tb.daysLeft != null && tb.daysLeft < 0;
        return (
          <div key={c.id} style={{ ...card, borderColor: urgent ? 'rgba(255,138,138,.5)' : 'rgba(200,168,75,.18)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>{TYPE_META[c.type].icon}</span>
                <div>
                  <div style={{ fontFamily: lb, fontSize: 15, fontWeight: 700, color: '#f5f0e8' }}>{c.title || TYPE_META[c.type].label}</div>
                  <div style={{ fontFamily: rj, fontSize: 10, color: '#7a8a72', letterSpacing: '.5px' }}>{TYPE_META[c.type].label}</div>
                </div>
              </div>
              <button onClick={() => delClaim(c.id)} style={{ background: 'transparent', border: 'none', color: '#ff8a8a', fontFamily: rj, fontSize: 11, cursor: 'pointer', letterSpacing: '.5px' }}>Delete</button>
            </div>

            {/* common: title, status, event date, time bar */}
            <div className="claims-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 10 }}>
              <div><label style={label}>Claim Title</label><input style={inputStyle} value={c.title} onChange={(e) => updClaim(c.id, { title: e.target.value })} placeholder="e.g. Discharge demurrage" /></div>
              <div>
                <label style={label}>Status</label>
                <select style={inputStyle} value={c.status} onChange={(e) => updClaim(c.id, { status: e.target.value as ClaimStatus })}>
                  {(Object.keys(STATUS_META) as ClaimStatus[]).map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <span style={{ fontSize: 10, background: sm.bg, color: sm.color, padding: '4px 10px', borderRadius: 3, fontFamily: rj, fontWeight: 700, letterSpacing: '.5px', border: `1px solid ${sm.color}40` }}>{sm.label}</span>
              </div>
            </div>

            <div className="claims-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 10 }}>
              <div><label style={label}>Event End Date</label><input style={inputStyle} type="date" value={c.eventDate} onChange={(e) => updClaim(c.id, { eventDate: e.target.value })} /></div>
              <div><label style={label}>Time Bar (days)</label><input style={inputStyle} type="number" value={c.timeBarDays || ''} onChange={(e) => updClaim(c.id, { timeBarDays: num(e.target.value) })} placeholder="90" /></div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                {tb.daysLeft != null ? (
                  <div style={{ fontFamily: rj, fontSize: 11.5, color: expired ? '#ff8a8a' : urgent ? '#ff8a8a' : '#b0c0a4' }}>
                    {expired ? <b style={{ color: '#ff8a8a' }}>⚠ TIME-BARRED</b> : <>Deadline <b style={{ color: urgent ? '#ff8a8a' : '#c8a84b' }}>{prettyDate(tb.deadline)}</b> · <b style={{ color: urgent ? '#ff8a8a' : '#4caf76' }}>{tb.daysLeft}d left</b></>}
                  </div>
                ) : <span style={{ fontFamily: rj, fontSize: 10.5, color: '#7a8a72' }}>set event date for countdown</span>}
              </div>
            </div>

            {/* type-specific */}
            {c.type === 'demurrage' && (
              <div className="claims-g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                <div><label style={label}>Allowed Laytime (h)</label><input style={inputStyle} type="number" value={c.allowedLaytime || ''} onChange={(e) => updClaim(c.id, { allowedLaytime: num(e.target.value) })} placeholder="72" /></div>
                <div><label style={label}>Used Laytime (h)</label><input style={inputStyle} type="number" value={c.usedLaytime || ''} onChange={(e) => updClaim(c.id, { usedLaytime: num(e.target.value) })} placeholder="96" /></div>
                <div><label style={label}>Demurrage ($/day)</label><input style={inputStyle} type="number" value={c.demurrageRate || ''} onChange={(e) => updClaim(c.id, { demurrageRate: num(e.target.value) })} placeholder="20000" /></div>
                <div><label style={label}>Despatch ($/day)</label><input style={inputStyle} type="number" value={c.despatchRate || ''} onChange={(e) => updClaim(c.id, { despatchRate: num(e.target.value) })} placeholder="10000" /></div>
              </div>
            )}
            {c.type === 'offhire' && (
              <div className="claims-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                <div><label style={label}>Off-Hire (hours)</label><input style={inputStyle} type="number" value={c.hours || ''} onChange={(e) => updClaim(c.id, { hours: num(e.target.value) })} placeholder="6" /></div>
                <div><label style={label}>Hire Rate ($/day)</label><input style={inputStyle} type="number" value={c.hireRate || ''} onChange={(e) => updClaim(c.id, { hireRate: num(e.target.value) })} placeholder="18000" /></div>
                <div><label style={label}>Off-Hire Bunker ($)</label><input style={inputStyle} type="number" value={c.bunkerValue || ''} onChange={(e) => updClaim(c.id, { bunkerValue: num(e.target.value) })} placeholder="0" /></div>
              </div>
            )}
            {c.type === 'speedcons' && (
              <>
                <div className="claims-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 10 }}>
                  <div><label style={label}>Good Weather Days</label><input style={inputStyle} type="number" value={c.gwDays || ''} onChange={(e) => updClaim(c.id, { gwDays: num(e.target.value) })} placeholder="17" /></div>
                  <div><label style={label}>Hire Rate ($/day)</label><input style={inputStyle} type="number" value={c.hireRate || ''} onChange={(e) => updClaim(c.id, { hireRate: num(e.target.value) })} placeholder="18000" /></div>
                  <div><label style={label}>Bunker Price ($/MT)</label><input style={inputStyle} type="number" value={c.bunkerPrice || ''} onChange={(e) => updClaim(c.id, { bunkerPrice: num(e.target.value) })} placeholder="580" /></div>
                </div>
                <div className="claims-g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                  <div><label style={label}>Warr. Speed (kts)</label><input style={inputStyle} type="number" value={c.warrantedSpeed || ''} onChange={(e) => updClaim(c.id, { warrantedSpeed: num(e.target.value) })} placeholder="12.5" /></div>
                  <div><label style={label}>Actual Speed (kts)</label><input style={inputStyle} type="number" value={c.actualSpeed || ''} onChange={(e) => updClaim(c.id, { actualSpeed: num(e.target.value) })} placeholder="11.8" /></div>
                  <div><label style={label}>Warr. Cons (MT/d)</label><input style={inputStyle} type="number" value={c.warrantedCons || ''} onChange={(e) => updClaim(c.id, { warrantedCons: num(e.target.value) })} placeholder="28" /></div>
                  <div><label style={label}>Actual Cons (MT/d)</label><input style={inputStyle} type="number" value={c.actualCons || ''} onChange={(e) => updClaim(c.id, { actualCons: num(e.target.value) })} placeholder="30.4" /></div>
                </div>
              </>
            )}
            {c.type === 'other' && (
              <div className="claims-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
                <div><label style={label}>Amount ($)</label><input style={inputStyle} type="number" value={c.amount || ''} onChange={(e) => updClaim(c.id, { amount: num(e.target.value) })} placeholder="0" /></div>
                <div>
                  <label style={label}>Owed To</label>
                  <select style={inputStyle} value={c.dir} onChange={(e) => updClaim(c.id, { dir: e.target.value as 'owner' | 'charterer' })}>
                    <option value="owner">Owner (charterer pays)</option>
                    <option value="charterer">Charterer (owner pays)</option>
                  </select>
                </div>
              </div>
            )}

            {/* notes + value */}
            <div style={{ marginTop: 10 }}>
              <label style={label}>Notes</label>
              <input style={inputStyle} value={c.notes} onChange={(e) => updClaim(c.id, { notes: e.target.value })} placeholder="Reference, supporting docs, comments..." />
            </div>

            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed rgba(200,168,75,.18)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: rj, fontSize: 11, color: '#7a8a72', letterSpacing: '.5px', textTransform: 'uppercase' }}>
                {val >= 0 ? 'Charterer owes Owner' : 'Owner owes Charterer'}
              </span>
              <span style={{ fontFamily: lb, fontSize: 20, fontWeight: 700, color: val >= 0 ? '#4caf76' : '#ff8a8a' }}>{money(Math.abs(val))}</span>
            </div>
          </div>
        );
      })}

      {/* Reference */}
      <div style={{ ...card, background: 'rgba(122,138,114,.05)', borderColor: 'rgba(122,138,114,.15)' }}>
        <div style={sectionTitle}>📖 How Claims Are Calculated</div>
        <ul style={{ fontSize: 11.5, color: '#b0c0a4', lineHeight: 1.7, paddingLeft: 18, fontFamily: rj }}>
          <li><b style={{ color: '#c8a84b' }}>Demurrage</b> = (used − allowed laytime) ÷ 24 × rate. If laytime is saved, despatch is paid by owner (often half rate).</li>
          <li><b style={{ color: '#c8a84b' }}>Off-hire</b> = hours ÷ 24 × hire rate, plus off-hire bunker value — credited to charterer.</li>
          <li><b style={{ color: '#c8a84b' }}>Speed/Consumption</b> uses the good-weather period: excess fuel = (actual − warranted) × GW days × bunker price; time lost valued at hire rate.</li>
          <li><b style={{ color: '#ff8a8a' }}>Time bar</b> — most CPs require claims within a set period (often 90 days) with full supporting documents, or the claim is lost. The countdown starts from the event end date.</li>
          <li>Figures are working estimates. For hour/minute laytime precision, use the Laytime / Demurrage tool; for full CP performance, use CP Performance.</li>
        </ul>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .claims-g3, .claims-g4, .claims-add { grid-template-columns: 1fr 1fr !important; }
          .action-bar button { font-size: 10px !important; padding: 7px 10px !important; }
        }
        @media print {
          @page { size: A4; margin: 14mm; }
          body { background: white !important; color: black !important; }
          nav, footer, .action-bar { display: none !important; }
        }
      `}</style>
    </div>
  );
}
