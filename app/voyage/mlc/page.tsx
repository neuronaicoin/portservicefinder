'use client';
import { useState, useEffect, useMemo } from 'react';
import { saveItem, loadItem, genId } from '@/lib/voyage-storage';

const lb = 'var(--font-display)';
const rj = 'var(--font-ui)';
const g = { color: 'var(--acc)' } as React.CSSProperties;

// ============================================================
// MLC 2006 / STCW rest-hour limits
//  - min 10 h rest in any 24 h
//  - min 77 h rest in any 7-day period
//  - rest may be split into max 2 periods, one ≥6 h, gaps ≤14 h
// (this tool checks the two main numeric limits per day/week)
// ============================================================

interface CrewMember {
  id: string;
  name: string;
  rank: string;
  // 7 days × 24 hours, true = WORK, false = rest
  grid: boolean[][]; // [day][hour]
}

interface MlcData {
  vesselName: string;
  imo: string;
  weekStart: string;
  crew: CrewMember[];
  checks: Record<string, boolean>;
  notes: string;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MLC_CHECKS = [
  'SEA (Seafarer Employment Agreement) signed & on board',
  'Rest hours recorded daily & signed',
  'Wages paid monthly, account statement issued',
  'No seafarer under 16; night-work limits for under-18',
  'On-board complaint procedure posted',
  'Medical certificate valid for all crew',
  'Accommodation & catering standards met',
  'Repatriation cover / financial security in place',
];

function emptyGrid(): boolean[][] {
  return Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => false));
}
function newCrew(name = '', rank = ''): CrewMember {
  return { id: genId(), name, rank, grid: emptyGrid() };
}

function emptyChecks(): Record<string, boolean> {
  const o: Record<string, boolean> = {};
  MLC_CHECKS.forEach((k) => (o[k] = false));
  return o;
}

const DEFAULT_DATA: MlcData = {
  vesselName: '', imo: '', weekStart: '', crew: [newCrew('', 'Master')], checks: emptyChecks(), notes: '',
};

// ============================================================
// CALC — rest-hour compliance
// ============================================================
function analyseCrew(c: CrewMember) {
  // per day rest hours = 24 - sum(work hours that day)
  const dailyRest = c.grid.map((day) => 24 - day.filter(Boolean).length);
  const dailyWork = c.grid.map((day) => day.filter(Boolean).length);

  // weekly rest = sum of daily rest over the 7 days
  const weeklyRest = dailyRest.reduce((s, r) => s + r, 0);

  // violations
  const dayRestViol = dailyRest.map((r) => r < 10);       // <10h rest/24h
  const dayWorkViol = dailyWork.map((w) => w > 14);       // >14h work/24h
  const weekViol = weeklyRest < 77;

  // rest split: max 2 rest periods/day, one of which >= 6h
  const restBlocksViol = c.grid.map((day) => {
    const blocks: number[] = [];
    let cur = 0;
    for (let h = 0; h < 24; h++) {
      if (!day[h]) cur++; else { if (cur > 0) blocks.push(cur); cur = 0; }
    }
    if (cur > 0) blocks.push(cur);
    if (blocks.length === 0) return false;
    const longest = Math.max(...blocks);
    return blocks.length > 2 || longest < 6;
  });

  const anyViolation = dayRestViol.some(Boolean) || dayWorkViol.some(Boolean) || weekViol;

  return { dailyRest, dailyWork, weeklyRest, dayRestViol, dayWorkViol, weekViol, restBlocksViol, anyViolation };
}

// ============================================================
// STYLES
// ============================================================
const card: React.CSSProperties = { background: 'var(--card)', border: '1px solid color-mix(in srgb, var(--acc) 18%, transparent)', padding: '20px 18px', borderRadius: 4, marginBottom: 16 };
const sectionTitle: React.CSSProperties = { fontFamily: rj, fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--acc)', fontWeight: 700, marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid color-mix(in srgb, var(--acc) 12%, transparent)' };
const labelS: React.CSSProperties = { display: 'block', fontFamily: rj, fontSize: 10, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--ink3)', fontWeight: 600, marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', background: 'var(--bg2)', border: '1px solid color-mix(in srgb, var(--acc) 20%, transparent)', color: 'var(--ink)', padding: '7px 9px', fontFamily: rj, fontSize: 12.5, fontWeight: 500, borderRadius: 3, boxSizing: 'border-box' };
const ghostBtn: React.CSSProperties = { background: 'transparent', color: 'var(--acc)', border: '1px solid color-mix(in srgb, var(--acc) 40%, transparent)', padding: '8px 14px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };
const goldBtn: React.CSSProperties = { background: 'var(--acc)', color: 'var(--bg)', border: 'none', padding: '8px 16px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };

const STORAGE_KEY = 'mlc';
const SINGLETON_ID = 'mlctracker';

// ============================================================
// COMPONENT
// ============================================================
export default function MlcPage() {
  const [data, setData] = useState<MlcData>(DEFAULT_DATA);
  const [saveMsg, setSaveMsg] = useState('');
  const [activeCrew, setActiveCrew] = useState(0);

  useEffect(() => {
    try {
      const saved = loadItem<MlcData>(STORAGE_KEY, SINGLETON_ID);
      if (saved && saved.data && Array.isArray(saved.data.crew) && saved.data.crew.length) {
        setData({ ...DEFAULT_DATA, ...saved.data });
      }
    } catch { /* ignore */ }
  }, []);

  function persist(next: MlcData) {
    setData(next);
    try { saveItem(STORAGE_KEY, 'MLC Rest Hours', next, SINGLETON_ID); setSaveMsg('✓ Saved'); setTimeout(() => setSaveMsg(''), 2000); } catch { /* ignore */ }
  }
  function update<K extends keyof MlcData>(key: K, value: MlcData[K]) { persist({ ...data, [key]: value }); }

  function addCrew() {
    const next = { ...data, crew: [...data.crew, newCrew()] };
    persist(next); setActiveCrew(next.crew.length - 1);
  }
  function updCrew(id: string, patch: Partial<CrewMember>) {
    persist({ ...data, crew: data.crew.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  }
  function delCrew(id: string) {
    if (data.crew.length <= 1) return;
    const idx = data.crew.findIndex((c) => c.id === id);
    persist({ ...data, crew: data.crew.filter((c) => c.id !== id) });
    setActiveCrew(Math.max(0, idx - 1));
  }
  function toggleHour(crewId: string, day: number, hour: number) {
    persist({
      ...data,
      crew: data.crew.map((c) => {
        if (c.id !== crewId) return c;
        const grid = c.grid.map((d) => [...d]);
        grid[day][hour] = !grid[day][hour];
        return { ...c, grid };
      }),
    });
  }
  function fillDay(crewId: string, day: number, work: boolean) {
    persist({
      ...data,
      crew: data.crew.map((c) => {
        if (c.id !== crewId) return c;
        const grid = c.grid.map((d) => [...d]);
        grid[day] = Array.from({ length: 24 }, () => work);
        return { ...c, grid };
      }),
    });
  }
  function toggleCheck(key: string) {
    persist({ ...data, checks: { ...data.checks, [key]: !data.checks[key] } });
  }

  const crew = data.crew[activeCrew] || data.crew[0];
  const analysis = useMemo(() => crew ? analyseCrew(crew) : null, [crew]);

  const fleetViolations = useMemo(() => data.crew.filter((c) => analyseCrew(c).anyViolation).length, [data.crew]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--acc)', fontWeight: 700, marginBottom: 8 }}>
          ⚓ Voyage Hub · MLC Compliance
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          MLC <em style={g}>Compliance</em>
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.6, maxWidth: 720 }}>
          Rest-hours grid per crew member with automatic MLC 2006 / STCW checks (min 10 h rest in 24 h,
          min 77 h in any week), plus an MLC self-check. A working aid — official rest-hour records govern.
        </p>
      </div>

      {/* Vessel */}
      <div style={card}>
        <div className="mlc-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          <div><label style={labelS}>Vessel</label><input style={inputStyle} value={data.vesselName} onChange={(e) => update('vesselName', e.target.value)} placeholder="MV OCEAN PIONEER" /></div>
          <div><label style={labelS}>IMO</label><input style={inputStyle} value={data.imo} onChange={(e) => update('imo', e.target.value)} placeholder="9876543" /></div>
          <div><label style={labelS}>Week Starting (Mon)</label><input style={inputStyle} type="date" value={data.weekStart} onChange={(e) => update('weekStart', e.target.value)} /></div>
        </div>
      </div>

      <div className="action-bar" style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => window.print()} style={ghostBtn}>🖨️ Print / PDF</button>
        {saveMsg && <span style={{ color: 'var(--ok)', fontFamily: rj, fontSize: 12, fontWeight: 600 }}>{saveMsg}</span>}
        {fleetViolations > 0 && <span style={{ fontFamily: rj, fontSize: 12, color: 'var(--bad)', fontWeight: 700, marginLeft: 'auto' }}>⚠ {fleetViolations} crew with violations</span>}
      </div>

      {/* Crew tabs */}
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 16 }}>
        {data.crew.map((c, i) => {
          const v = analyseCrew(c).anyViolation;
          return (
            <button key={c.id} onClick={() => setActiveCrew(i)} style={{
              padding: '6px 12px', background: activeCrew === i ? 'var(--acc)' : 'transparent',
              color: activeCrew === i ? 'var(--bg)' : v ? 'var(--bad)' : 'var(--ink3)',
              border: `1px solid ${activeCrew === i ? 'var(--acc)' : v ? 'color-mix(in srgb, var(--bad) 40%, transparent)' : 'color-mix(in srgb, var(--acc) 25%, transparent)'}`,
              fontFamily: rj, fontSize: 11, fontWeight: 700, cursor: 'pointer', borderRadius: 4, whiteSpace: 'nowrap',
            }}>
              {v && '⚠ '}{c.name || c.rank || `Crew ${i + 1}`}
            </button>
          );
        })}
        <button onClick={addCrew} style={{ ...ghostBtn, padding: '6px 12px', fontSize: 10 }}>+ Add Crew</button>
      </div>

      {/* Active crew grid */}
      {crew && analysis && (
        <div style={card}>
          <div className="mlc-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr) auto', gap: 12, marginBottom: 14, alignItems: 'end' }}>
            <div><label style={labelS}>Name</label><input style={inputStyle} value={crew.name} onChange={(e) => updCrew(crew.id, { name: e.target.value })} placeholder="J. Smith" /></div>
            <div><label style={labelS}>Rank</label><input style={inputStyle} value={crew.rank} onChange={(e) => updCrew(crew.id, { rank: e.target.value })} placeholder="2nd Officer" /></div>
            {data.crew.length > 1 && <button onClick={() => delCrew(crew.id)} style={{ ...ghostBtn, color: 'var(--bad)', borderColor: 'color-mix(in srgb, var(--bad) 30%, transparent)' }}>Remove</button>}
          </div>

          <p style={{ fontFamily: rj, fontSize: 11, color: 'var(--ink3)', marginBottom: 10 }}>
            Tap an hour cell to toggle <b style={{ color: 'var(--bad)' }}>work</b> (red) / rest (dark). Use the row buttons to fill a whole day.
          </p>

          {/* Grid */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', fontFamily: rj, fontSize: 9 }}>
              <thead>
                <tr>
                  <th style={{ padding: 2, position: 'sticky', left: 0, background: 'var(--card)' }}></th>
                  {Array.from({ length: 24 }, (_, h) => (
                    <th key={h} style={{ padding: '2px 0', color: 'var(--ink3)', fontWeight: 600, width: 16, textAlign: 'center', fontSize: 8 }}>{h}</th>
                  ))}
                  <th style={{ padding: '2px 6px', color: 'var(--ink3)', fontWeight: 700, textAlign: 'right' }}>Rest</th>
                  <th style={{ padding: '2px 4px' }}></th>
                </tr>
              </thead>
              <tbody>
                {DAYS.map((dname, di) => {
                  const restViol = analysis.dayRestViol[di];
                  const workViol = analysis.dayWorkViol[di];
                  const viol = restViol || workViol;
                  return (
                    <tr key={di}>
                      <td style={{ padding: '2px 6px 2px 0', color: viol ? 'var(--bad)' : 'var(--ink2)', fontWeight: 700, position: 'sticky', left: 0, background: 'var(--card)', whiteSpace: 'nowrap' }}>{dname}</td>
                      {crew.grid[di].map((work, hi) => (
                        <td key={hi} onClick={() => toggleHour(crew.id, di, hi)} style={{
                          width: 16, height: 18, cursor: 'pointer',
                          background: work ? 'var(--bad)' : 'var(--bg2)',
                          border: '1px solid color-mix(in srgb, var(--acc) 12%, transparent)',
                        }} title={`${dname} ${hi}:00 — ${work ? 'work' : 'rest'}`} />
                      ))}
                      <td style={{ padding: '2px 6px', textAlign: 'right', fontWeight: 700, color: restViol ? 'var(--bad)' : 'var(--ink)', whiteSpace: 'nowrap' }}>
                        {analysis.dailyRest[di]}h{restViol ? ' ⚠' : ''}
                      </td>
                      <td style={{ padding: '2px 2px', whiteSpace: 'nowrap' }}>
                        <button onClick={() => fillDay(crew.id, di, true)} title="All work" style={fillBtn('var(--bad)')}>W</button>
                        <button onClick={() => fillDay(crew.id, di, false)} title="All rest" style={fillBtn('var(--line)')}>R</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* verdict */}
          <div style={{ marginTop: 14, padding: '14px 16px', background: 'var(--bg2)', border: `1px solid ${analysis.anyViolation ? 'color-mix(in srgb, var(--bad) 60%, transparent)' : 'color-mix(in srgb, var(--ok) 50%, transparent)'}`, borderRadius: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
              <span style={{ fontFamily: rj, fontSize: 12, color: 'var(--ink3)' }}>Weekly rest: <b style={{ color: analysis.weekViol ? 'var(--bad)' : 'var(--ok)' }}>{analysis.weeklyRest}h</b> / min 77h</span>
              <span style={{ fontFamily: rj, fontSize: 12, color: 'var(--ink3)' }}>Min daily rest: <b style={{ color: Math.min(...analysis.dailyRest) < 10 ? 'var(--bad)' : 'var(--ok)' }}>{Math.min(...analysis.dailyRest)}h</b> / min 10h</span>
            </div>
            {analysis.anyViolation ? (
              <div style={{ fontFamily: rj, color: 'var(--bad)', fontSize: 13, lineHeight: 1.5 }}>
                ❌ <b>Rest-hour violation(s) detected.</b>
                {analysis.weekViol && ' Weekly rest below 77h.'}
                {analysis.dayRestViol.some(Boolean) && ` Days below 10h rest: ${DAYS.filter((_, i) => analysis.dayRestViol[i]).join(', ')}.`}
                {analysis.dayWorkViol.some(Boolean) && ` Days above 14h work: ${DAYS.filter((_, i) => analysis.dayWorkViol[i]).join(', ')}.`}
              </div>
            ) : (
              <div style={{ fontFamily: rj, color: 'var(--ok)', fontSize: 13 }}>✅ Within MLC daily (10h) and weekly (77h) rest limits.</div>
            )}
          </div>
        </div>
      )}

      {/* MLC self-check */}
      <div style={card}>
        <div style={sectionTitle}>📋 MLC Self-Check</div>
        {MLC_CHECKS.map((k) => {
          const checked = !!data.checks[k];
          return (
            <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px dashed color-mix(in srgb, var(--acc) 10%, transparent)', cursor: 'pointer', fontFamily: rj, fontSize: 12.5, color: checked ? 'var(--ink)' : 'var(--ink2)' }}>
              <input type="checkbox" checked={checked} onChange={() => toggleCheck(k)} style={{ width: 16, height: 16, accentColor: 'var(--ok)', flexShrink: 0 }} />
              <span>{checked ? '✓ ' : ''}{k}</span>
            </label>
          );
        })}
      </div>

      {/* Notes */}
      <div style={card}>
        <div style={sectionTitle}>Notes</div>
        <textarea value={data.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Non-conformities, complaints, corrective actions, wage notes..." rows={3} style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} />
      </div>

      {/* Reference */}
      <div style={{ ...card, background: 'color-mix(in srgb, var(--ink3) 5%, transparent)', borderColor: 'color-mix(in srgb, var(--ink3) 15%, transparent)' }}>
        <div style={sectionTitle}>📖 MLC Rest-Hour Limits</div>
        <ul style={{ fontSize: 11.5, color: 'var(--ink2)', lineHeight: 1.7, paddingLeft: 18, fontFamily: rj }}>
          <li>Minimum <b style={{ color: 'var(--acc)' }}>10 hours rest</b> in any 24-hour period.</li>
          <li>Minimum <b style={{ color: 'var(--acc)' }}>77 hours rest</b> in any 7-day period.</li>
          <li>Rest may be in no more than 2 periods, one of at least 6 hours, and intervals between rest periods not exceeding 14 hours.</li>
          <li>Equivalent limit: maximum 14 hours work in 24 h / 72 hours work in 7 days.</li>
          <li>This grid checks the two main numeric limits. Official IMO/ILO rest-hour record forms and your SMS govern.</li>
        </ul>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .mlc-g3 { grid-template-columns: 1fr !important; }
          .action-bar button { font-size: 10px !important; padding: 7px 10px !important; }
        }
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
          body { background: white !important; color: black !important; }
          nav, footer, .action-bar { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function fillBtn(bg: string): React.CSSProperties {
  return { background: bg, color: 'var(--ink)', border: 'none', width: 16, height: 16, fontSize: 8, fontFamily: rj, fontWeight: 700, cursor: 'pointer', borderRadius: 2, marginLeft: 2 };
}
