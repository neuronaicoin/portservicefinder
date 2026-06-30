'use client';
import { useState, useMemo } from 'react';
import { COUNTRIES, WEEKEND_LABEL, WEEKEND_DAYS, type Holiday } from '@/lib/holidays-data';

const lb = "'Libre Bodoni', serif";
const rj = "'Rajdhani', sans-serif";
const g = { color: '#c8a84b', fontStyle: 'italic' } as React.CSSProperties;

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
  padding: '8px 10px',
  fontFamily: rj,
  fontSize: 13,
  fontWeight: 500,
  borderRadius: 3,
  boxSizing: 'border-box',
};

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function parseDate(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}
function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function prettyDate(s: string): string {
  const d = parseDate(s);
  if (!d) return s;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function HolidaysPage() {
  const [countryCode, setCountryCode] = useState('TR');
  const [laytimeBasis, setLaytimeBasis] = useState<'SHEX' | 'SHINC' | 'FHEX'>('SHEX');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const country = useMemo(() => COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0], [countryCode]);

  const holidaySet = useMemo(() => {
    const m = new Map<string, Holiday>();
    country.holidays.forEach((h) => m.set(h.date, h));
    return m;
  }, [country]);

  const weekendDays = WEEKEND_DAYS[country.weekend];

  // Laytime day counter
  const counter = useMemo(() => {
    const from = parseDate(fromDate);
    const to = parseDate(toDate);
    if (!from || !to || to < from) return null;

    let total = 0;
    let weekendCount = 0;
    let holidayCount = 0;
    let workingDays = 0;
    const excludedList: { date: string; reason: string }[] = [];

    const cur = new Date(from);
    while (cur <= to) {
      total++;
      const ds = fmtDate(cur);
      const dow = cur.getDay();
      const isWeekend = weekendDays.includes(dow);
      const hol = holidaySet.get(ds);

      let excluded = false;
      let reason = '';

      if (laytimeBasis === 'SHINC') {
        // Sundays & Holidays INCLUDED — everything counts
        excluded = false;
      } else if (laytimeBasis === 'FHEX') {
        // Fridays & Holidays EXcluded (used in some regions)
        if (dow === 5) { excluded = true; reason = 'Friday'; }
        else if (hol) { excluded = true; reason = hol.name; }
      } else {
        // SHEX — Sundays/weekend & Holidays EXcluded
        if (isWeekend) { excluded = true; reason = DOW[dow]; }
        else if (hol) { excluded = true; reason = hol.name; }
      }

      if (excluded) {
        if (reason === DOW[dow] || reason === 'Friday') weekendCount++;
        else holidayCount++;
        excludedList.push({ date: ds, reason });
      } else {
        workingDays++;
      }
      cur.setDate(cur.getDate() + 1);
    }

    return { total, weekendCount, holidayCount, workingDays, excludedList };
  }, [fromDate, toDate, weekendDays, holidaySet, laytimeBasis]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>
          ⚓ Voyage Hub · Holidays Calendar
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Holidays <em style={g}>Calendar</em>
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          Public holidays for major maritime hub countries plus a SHEX / SHINC laytime day-counter.
          2026 dates — religious and movable holidays are approximate, always confirm with the local agent.
        </p>
      </div>

      {/* Country selector */}
      <div style={card}>
        <div style={sectionTitle}>🌍 Select Country / Port</div>
        <div className="hol-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          <div>
            <label style={label}>Country</label>
            <select style={inputStyle} value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={label}>Weekend (non-working)</label>
            <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', color: '#c8a84b', fontWeight: 700 }}>
              {WEEKEND_LABEL[country.weekend]}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 12, fontFamily: rj, fontSize: 11.5, color: '#7a8a72' }}>
          <span style={{ color: '#c8a84b', letterSpacing: '1px', textTransform: 'uppercase', fontSize: 10, fontWeight: 700 }}>Hub ports:</span>{' '}
          {country.ports.join(' · ')}
        </div>
      </div>

      {/* Laytime counter */}
      <div style={{ ...card, background: 'linear-gradient(135deg,rgba(200,168,75,.08),transparent)', borderColor: 'rgba(200,168,75,.4)' }}>
        <div style={sectionTitle}>⏱️ Laytime Day Counter</div>
        <div className="hol-grid3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          <div>
            <label style={label}>Basis</label>
            <select style={inputStyle} value={laytimeBasis} onChange={(e) => setLaytimeBasis(e.target.value as 'SHEX' | 'SHINC' | 'FHEX')}>
              <option value="SHEX">SHEX — Sundays/Holidays excepted</option>
              <option value="SHINC">SHINC — Sundays/Holidays included</option>
              <option value="FHEX">FHEX — Fridays/Holidays excepted</option>
            </select>
          </div>
          <div>
            <label style={label}>Laytime Commences</label>
            <input style={inputStyle} type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div>
            <label style={label}>Laytime Ends</label>
            <input style={inputStyle} type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
        </div>

        {counter && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginTop: 16 }} className="hol-kpis">
              <KPI label="Total Days" value={String(counter.total)} color="#f5f0e8" />
              <KPI label="Weekend" value={String(counter.weekendCount)} color="#7a8a72" />
              <KPI label="Holidays" value={String(counter.holidayCount)} color="#ff8a8a" />
              <KPI label={laytimeBasis === 'SHINC' ? 'Counting Days' : 'Working Days'} value={String(counter.workingDays)} color="#c8a84b" big />
            </div>

            {counter.excludedList.length > 0 && laytimeBasis !== 'SHINC' && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 9, color: '#c8a84b', fontFamily: rj, letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
                  Excepted Days ({counter.excludedList.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {counter.excludedList.map((x) => (
                    <span key={x.date} style={{ fontSize: 10.5, background: '#0c1610', color: '#b0c0a4', padding: '3px 8px', borderRadius: 3, fontFamily: rj, border: '1px solid rgba(200,168,75,.12)' }}>
                      {prettyDate(x.date)} — {x.reason}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {laytimeBasis === 'SHINC' && (
              <p style={{ fontSize: 11, color: '#7a8a72', fontFamily: rj, marginTop: 12 }}>
                SHINC — every day counts as laytime, including Sundays and holidays.
              </p>
            )}
          </>
        )}
        {!counter && (fromDate || toDate) && (
          <p style={{ fontSize: 11.5, color: '#ff8a8a', fontFamily: rj, marginTop: 12 }}>
            Enter a valid start and end date (end on or after start).
          </p>
        )}
      </div>

      {/* Holiday list */}
      <div style={card}>
        <div style={sectionTitle}>📅 {country.flag} {country.name} — 2026 Public Holidays</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0 }}>
          {country.holidays.map((h) => {
            const d = parseDate(h.date);
            const dow = d ? d.getDay() : -1;
            const onWeekend = weekendDays.includes(dow);
            return (
              <div key={h.date + h.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px dashed rgba(200,168,75,.1)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, minWidth: 0 }}>
                  <span style={{ fontFamily: rj, fontSize: 12.5, color: '#c8a84b', fontWeight: 700, whiteSpace: 'nowrap' }}>{prettyDate(h.date)}</span>
                  <span style={{ fontFamily: rj, fontSize: 10, color: '#7a8a72' }}>{d ? DOW[dow] : ''}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, textAlign: 'right' }}>
                  <span style={{ fontFamily: rj, fontSize: 12.5, color: '#f5f0e8' }}>{h.name}</span>
                  {h.approx && <span title="Movable / religious — confirm with agent" style={{ fontSize: 8.5, background: 'rgba(232,184,90,.14)', color: '#e8b85a', padding: '1px 5px', borderRadius: 3, fontFamily: rj, fontWeight: 700, letterSpacing: '.5px', border: '1px solid rgba(232,184,90,.3)', whiteSpace: 'nowrap' }}>APPROX</span>}
                  {onWeekend && <span style={{ fontSize: 8.5, color: '#7a8a72', fontFamily: rj, whiteSpace: 'nowrap' }}>(weekend)</span>}
                </div>
              </div>
            );
          })}
        </div>
        <p style={{ fontSize: 10.5, color: '#7a8a72', fontFamily: rj, marginTop: 12, lineHeight: 1.5 }}>
          <b style={{ color: '#e8b85a' }}>APPROX</b> = religious or movable holiday (Eid, Lunar New Year, Easter, etc.) — exact date may shift by ±1 day. Confirm with the local agent before finalising any laytime statement.
        </p>
      </div>

      {/* Reference */}
      <div style={{ ...card, background: 'rgba(122,138,114,.05)', borderColor: 'rgba(122,138,114,.15)' }}>
        <div style={sectionTitle}>📖 Laytime Terms</div>
        <ul style={{ fontSize: 11.5, color: '#b0c0a4', lineHeight: 1.7, paddingLeft: 18, fontFamily: rj }}>
          <li><b style={{ color: '#c8a84b' }}>SHEX</b> — Sundays &amp; Holidays Excepted. Weekend days and public holidays do not count as laytime.</li>
          <li><b style={{ color: '#c8a84b' }}>SHINC</b> — Sundays &amp; Holidays Included. Every day counts, including weekends and holidays.</li>
          <li><b style={{ color: '#c8a84b' }}>FHEX</b> — Fridays &amp; Holidays Excepted (used where Friday is the weekly holiday).</li>
          <li>&quot;<b>EIU</b>&quot; (Even If Used) vs &quot;<b>UU</b>&quot; (Unless Used) clauses change whether time actually worked on an excepted day still counts — check the charter party wording.</li>
          <li>This counter uses whole calendar days. For hour/minute precision and SoF events, use the Laytime / Demurrage tool.</li>
        </ul>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .hol-grid { grid-template-columns: 1fr !important; }
          .hol-grid3 { grid-template-columns: 1fr !important; }
          .hol-kpis { grid-template-columns: 1fr 1fr !important; }
        }
        @media print {
          @page { size: A4; margin: 14mm; }
          body { background: white !important; color: black !important; }
          nav, footer { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function KPI({ label: l, value, color, big }: { label: string; value: string; color: string; big?: boolean }) {
  return (
    <div style={{ background: '#0c1610', border: '1px solid rgba(200,168,75,.2)', borderRadius: 4, padding: '12px 10px', textAlign: 'center' }}>
      <div style={{ fontFamily: rj, fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: '#7a8a72', fontWeight: 700 }}>{l}</div>
      <div style={{ fontFamily: lb, fontSize: big ? 28 : 22, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
    </div>
  );
}
