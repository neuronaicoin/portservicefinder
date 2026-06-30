'use client';
import { useState, useEffect, useMemo } from 'react';
import { saveItem, loadItem, genId } from '@/lib/voyage-storage';

const lb = "'Libre Bodoni', serif";
const rj = "'Rajdhani', sans-serif";
const g = { color: '#c8a84b', fontStyle: 'italic' } as React.CSSProperties;

// ============================================================
// TYPES
// ============================================================
type IntervalType = 'hours' | 'days';

interface Task {
  id: string;
  equipment: string;
  task: string;
  intervalType: IntervalType;
  interval: number;           // hours or days
  // last done reference
  lastDate: string;           // for day-based
  lastHours: number;          // running hours at last done (for hour-based)
  critical: boolean;
  notes: string;
}

interface Equipment {
  id: string;
  name: string;
  currentHours: number;
}

interface PmsData {
  vesselName: string;
  imo: string;
  equipment: Equipment[];
  tasks: Task[];
}

const DEFAULT_EQUIP: Equipment[] = [
  { id: genId(), name: 'Main Engine', currentHours: 0 },
  { id: genId(), name: 'Aux Engine 1', currentHours: 0 },
  { id: genId(), name: 'Aux Engine 2', currentHours: 0 },
];

function newTask(): Task {
  return { id: genId(), equipment: '', task: '', intervalType: 'hours', interval: 500, lastDate: '', lastHours: 0, critical: false, notes: '' };
}

const DEFAULT_DATA: PmsData = {
  vesselName: '', imo: '', equipment: DEFAULT_EQUIP, tasks: [],
};

// ============================================================
// CALC
// ============================================================
function taskStatus(t: Task, equipment: Equipment[]) {
  if (t.intervalType === 'hours') {
    const eq = equipment.find((e) => e.name === t.equipment);
    if (!eq) return { kind: 'hours' as const, dueIn: null as number | null, state: 'unset' as const, detail: 'link equipment' };
    const dueAtHours = t.lastHours + t.interval;
    const remaining = dueAtHours - eq.currentHours;
    let state: 'overdue' | 'soon' | 'ok' = 'ok';
    if (remaining < 0) state = 'overdue';
    else if (remaining <= t.interval * 0.1) state = 'soon';
    return { kind: 'hours' as const, dueIn: remaining, state, detail: `due at ${dueAtHours.toLocaleString()} h (now ${eq.currentHours.toLocaleString()} h)` };
  } else {
    if (!t.lastDate) return { kind: 'days' as const, dueIn: null as number | null, state: 'unset' as const, detail: 'set last date' };
    const ld = new Date(t.lastDate + 'T00:00:00');
    if (isNaN(ld.getTime())) return { kind: 'days' as const, dueIn: null, state: 'unset' as const, detail: 'invalid date' };
    const due = new Date(ld); due.setDate(due.getDate() + t.interval);
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const remaining = Math.round((due.getTime() - now.getTime()) / 86400000);
    let state: 'overdue' | 'soon' | 'ok' = 'ok';
    if (remaining < 0) state = 'overdue';
    else if (remaining <= Math.max(3, t.interval * 0.1)) state = 'soon';
    return { kind: 'days' as const, dueIn: remaining, state, detail: `due ${due.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}` };
  }
}

// ============================================================
// STYLES
// ============================================================
const card: React.CSSProperties = { background: '#111c13', border: '1px solid rgba(200,168,75,.18)', padding: '20px 18px', borderRadius: 4, marginBottom: 16 };
const sectionTitle: React.CSSProperties = { fontFamily: rj, fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid rgba(200,168,75,.12)' };
const labelS: React.CSSProperties = { display: 'block', fontFamily: rj, fontSize: 10, letterSpacing: '.5px', textTransform: 'uppercase', color: '#7a8a72', fontWeight: 600, marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', background: '#0c1610', border: '1px solid rgba(200,168,75,.2)', color: '#f5f0e8', padding: '7px 9px', fontFamily: rj, fontSize: 12.5, fontWeight: 500, borderRadius: 3, boxSizing: 'border-box' };
const ghostBtn: React.CSSProperties = { background: 'transparent', color: '#c8a84b', border: '1px solid rgba(200,168,75,.4)', padding: '8px 14px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };
const goldBtn: React.CSSProperties = { background: '#c8a84b', color: '#08100a', border: 'none', padding: '8px 16px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };

const STORAGE_KEY = 'pms';
const SINGLETON_ID = 'pmsmini';

const STATE_META: Record<string, { label: string; color: string; bg: string }> = {
  overdue: { label: 'OVERDUE', color: '#ff6b6b', bg: 'rgba(255,107,107,.16)' },
  soon: { label: 'DUE SOON', color: '#e8b85a', bg: 'rgba(232,184,90,.14)' },
  ok: { label: 'OK', color: '#4caf76', bg: 'rgba(76,175,118,.14)' },
  unset: { label: 'SET UP', color: '#7a8a72', bg: 'rgba(122,138,114,.14)' },
};

// ============================================================
// COMPONENT
// ============================================================
export default function PmsPage() {
  const [data, setData] = useState<PmsData>(DEFAULT_DATA);
  const [saveMsg, setSaveMsg] = useState('');
  const [tab, setTab] = useState<'tasks' | 'equipment'>('tasks');
  const [filter, setFilter] = useState<'all' | 'overdue' | 'soon'>('all');
  const [editing, setEditing] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    try {
      const saved = loadItem<PmsData>(STORAGE_KEY, SINGLETON_ID);
      if (saved && saved.data && Array.isArray(saved.data.equipment)) setData({ ...DEFAULT_DATA, ...saved.data });
    } catch { /* ignore */ }
  }, []);

  function persist(next: PmsData) {
    setData(next);
    try { saveItem(STORAGE_KEY, 'PMS Mini', next, SINGLETON_ID); setSaveMsg('✓ Saved'); setTimeout(() => setSaveMsg(''), 2000); } catch { /* ignore */ }
  }
  function update<K extends keyof PmsData>(key: K, value: PmsData[K]) { persist({ ...data, [key]: value }); }
  function num(v: string): number { return parseFloat(v) || 0; }

  // equipment
  function addEquip() { persist({ ...data, equipment: [...data.equipment, { id: genId(), name: '', currentHours: 0 }] }); }
  function updEquip(id: string, patch: Partial<Equipment>) { persist({ ...data, equipment: data.equipment.map((e) => (e.id === id ? { ...e, ...patch } : e)) }); }
  function delEquip(id: string) { persist({ ...data, equipment: data.equipment.filter((e) => e.id !== id) }); }

  // tasks
  function openNew() { setEditing(newTask()); setShowForm(true); }
  function openEdit(t: Task) { setEditing({ ...t }); setShowForm(true); }
  function saveTask() {
    if (!editing) return;
    const exists = data.tasks.some((t) => t.id === editing.id);
    persist({ ...data, tasks: exists ? data.tasks.map((t) => (t.id === editing.id ? editing : t)) : [...data.tasks, editing] });
    setShowForm(false); setEditing(null);
  }
  function delTask(id: string) {
    if (!confirm('Delete this task?')) return;
    persist({ ...data, tasks: data.tasks.filter((t) => t.id !== id) });
  }
  function completeTask(t: Task) {
    // reset last reference to "now"
    const eq = data.equipment.find((e) => e.name === t.equipment);
    const patch: Partial<Task> = t.intervalType === 'hours'
      ? { lastHours: eq ? eq.currentHours : t.lastHours }
      : { lastDate: new Date().toISOString().slice(0, 10) };
    persist({ ...data, tasks: data.tasks.map((x) => (x.id === t.id ? { ...x, ...patch } : x)) });
  }

  const statuses = useMemo(() => data.tasks.map((t) => ({ t, st: taskStatus(t, data.equipment) })), [data.tasks, data.equipment]);
  const summary = useMemo(() => {
    const overdue = statuses.filter((x) => x.st.state === 'overdue').length;
    const soon = statuses.filter((x) => x.st.state === 'soon').length;
    return { overdue, soon, total: data.tasks.length };
  }, [statuses, data.tasks]);

  const visible = useMemo(() => {
    return statuses
      .filter((x) => filter === 'all' || x.st.state === filter)
      .sort((a, b) => {
        const order: Record<string, number> = { overdue: 0, soon: 1, ok: 2, unset: 3 };
        return order[a.st.state] - order[b.st.state];
      });
  }, [statuses, filter]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>
          ⚓ Voyage Hub · PMS Mini
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          PMS <em style={g}>Mini</em>
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          A lightweight planned-maintenance tracker — running-hours and calendar tasks with automatic
          due dates. A working aid, not a class-approved PMS.
        </p>
      </div>

      {/* Vessel */}
      <div style={card}>
        <div className="pms-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          <div><label style={labelS}>Vessel</label><input style={inputStyle} value={data.vesselName} onChange={(e) => update('vesselName', e.target.value)} placeholder="MV NEURONAI" /></div>
          <div><label style={labelS}>IMO</label><input style={inputStyle} value={data.imo} onChange={(e) => update('imo', e.target.value)} placeholder="9876543" /></div>
        </div>
      </div>

      <div className="action-bar" style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={openNew} style={goldBtn}>+ Add Task</button>
        <button onClick={() => window.print()} style={ghostBtn}>🖨️ Print / PDF</button>
        {saveMsg && <span style={{ color: '#4caf76', fontFamily: rj, fontSize: 12, fontWeight: 600 }}>{saveMsg}</span>}
      </div>

      {/* Summary */}
      <div className="pms-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
        <KPI label="Overdue" value={String(summary.overdue)} color={summary.overdue > 0 ? '#ff6b6b' : '#4caf76'} />
        <KPI label="Due Soon" value={String(summary.soon)} color={summary.soon > 0 ? '#e8b85a' : '#4caf76'} />
        <KPI label="Total Tasks" value={String(summary.total)} color="#c8a84b" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setTab('tasks')} style={tabBtn(tab === 'tasks')}>🔧 Tasks</button>
        <button onClick={() => setTab('equipment')} style={tabBtn(tab === 'equipment')}>⚙️ Equipment Hours</button>
      </div>

      {/* Task form */}
      {showForm && editing && tab === 'tasks' && (
        <div style={{ ...card, borderColor: 'rgba(200,168,75,.5)' }}>
          <div style={sectionTitle}>{data.tasks.some((t) => t.id === editing.id) ? 'Edit Task' : 'New Task'}</div>
          <div className="pms-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={labelS}>Equipment</label>
              <input style={inputStyle} list="equip-list" value={editing.equipment} onChange={(e) => setEditing({ ...editing, equipment: e.target.value })} placeholder="Main Engine" />
              <datalist id="equip-list">{data.equipment.map((e) => <option key={e.id} value={e.name} />)}</datalist>
            </div>
            <div><label style={labelS}>Task</label><input style={inputStyle} value={editing.task} onChange={(e) => setEditing({ ...editing, task: e.target.value })} placeholder="Renew fuel injectors" /></div>
          </div>
          <div className="pms-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={labelS}>Interval Type</label>
              <select style={inputStyle} value={editing.intervalType} onChange={(e) => setEditing({ ...editing, intervalType: e.target.value as IntervalType })}>
                <option value="hours">Running Hours</option>
                <option value="days">Calendar Days</option>
              </select>
            </div>
            <div><label style={labelS}>Interval ({editing.intervalType === 'hours' ? 'hours' : 'days'})</label><input style={inputStyle} type="number" value={editing.interval || ''} onChange={(e) => setEditing({ ...editing, interval: num(e.target.value) })} placeholder={editing.intervalType === 'hours' ? '500' : '90'} /></div>
            {editing.intervalType === 'hours' ? (
              <div><label style={labelS}>Hours at Last Done</label><input style={inputStyle} type="number" value={editing.lastHours || ''} onChange={(e) => setEditing({ ...editing, lastHours: num(e.target.value) })} placeholder="12000" /></div>
            ) : (
              <div><label style={labelS}>Last Done Date</label><input style={inputStyle} type="date" value={editing.lastDate} onChange={(e) => setEditing({ ...editing, lastDate: e.target.value })} /></div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: rj, fontSize: 12.5, color: editing.critical ? '#ff8a8a' : '#7a8a72' }}>
              <input type="checkbox" checked={editing.critical} onChange={(e) => setEditing({ ...editing, critical: e.target.checked })} style={{ width: 16, height: 16, accentColor: '#ff8a8a' }} /> Critical equipment
            </label>
          </div>
          <div style={{ marginBottom: 12 }}><label style={labelS}>Notes</label><input style={inputStyle} value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} placeholder="Spares, procedure ref, class item..." /></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={saveTask} style={{ ...goldBtn, padding: '8px 18px' }} disabled={!editing.task}>Save Task</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* TASKS TAB */}
      {tab === 'tasks' && (
        <>
          {data.tasks.length > 0 && (
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 14 }}>
              <button onClick={() => setFilter('all')} style={chip(filter === 'all')}>All</button>
              <button onClick={() => setFilter('overdue')} style={chip(filter === 'overdue')}>Overdue</button>
              <button onClick={() => setFilter('soon')} style={chip(filter === 'soon')}>Due Soon</button>
            </div>
          )}

          {data.tasks.length === 0 && !showForm && (
            <div style={{ ...card, textAlign: 'center', color: '#7a8a72', fontFamily: rj }}>
              No tasks yet. Tap <b style={{ color: '#c8a84b' }}>+ Add Task</b> to build your maintenance plan.
            </div>
          )}

          {visible.map(({ t, st }) => {
            const sm = STATE_META[st.state];
            return (
              <div key={t.id} style={{ ...card, padding: '14px 16px', borderColor: st.state === 'overdue' ? 'rgba(255,107,107,.4)' : 'rgba(200,168,75,.18)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 200 }}>
                    <div style={{ fontFamily: lb, fontSize: 14.5, fontWeight: 700, color: '#f5f0e8' }}>
                      {t.critical && '🔴 '}{t.task || 'Task'}
                    </div>
                    <div style={{ fontFamily: rj, fontSize: 11, color: '#7a8a72', marginTop: 2 }}>
                      {t.equipment || 'no equipment'} · every {t.interval} {t.intervalType === 'hours' ? 'h' : 'days'}
                    </div>
                    <div style={{ fontFamily: rj, fontSize: 11, color: '#b0c0a4', marginTop: 3 }}>{st.detail}</div>
                    {t.notes && <div style={{ fontFamily: rj, fontSize: 11, color: '#7a8a72', marginTop: 3 }}>{t.notes}</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {st.dueIn != null && (
                        <span style={{ fontFamily: rj, fontSize: 12, color: st.state === 'overdue' ? '#ff6b6b' : st.state === 'soon' ? '#e8b85a' : '#4caf76', fontWeight: 700 }}>
                          {st.kind === 'hours'
                            ? (st.dueIn < 0 ? `${Math.abs(st.dueIn).toLocaleString()}h over` : `${st.dueIn.toLocaleString()}h left`)
                            : (st.dueIn < 0 ? `${Math.abs(st.dueIn)}d over` : `${st.dueIn}d left`)}
                        </span>
                      )}
                      <span style={{ fontSize: 9, background: sm.bg, color: sm.color, padding: '3px 9px', borderRadius: 3, fontFamily: rj, fontWeight: 700, letterSpacing: '.5px', border: `1px solid ${sm.color}40`, whiteSpace: 'nowrap' }}>{sm.label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => completeTask(t)} style={miniBtn('#4caf76')}>✓ Done now</button>
                      <button onClick={() => openEdit(t)} style={miniBtn('#c8a84b')}>Edit</button>
                      <button onClick={() => delTask(t.id)} style={miniBtn('#ff8a8a')}>Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* EQUIPMENT TAB */}
      {tab === 'equipment' && (
        <div style={card}>
          <div style={sectionTitle}>⚙️ Running Hours</div>
          <p style={{ fontFamily: rj, fontSize: 11, color: '#7a8a72', marginBottom: 12 }}>Update current running hours; hour-based tasks recalculate automatically.</p>
          {data.equipment.map((e) => (
            <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 10, marginBottom: 10, alignItems: 'end' }}>
              <div><label style={labelS}>Equipment</label><input style={inputStyle} value={e.name} onChange={(ev) => updEquip(e.id, { name: ev.target.value })} placeholder="Main Engine" /></div>
              <div><label style={labelS}>Current Hours</label><input style={inputStyle} type="number" value={e.currentHours || ''} onChange={(ev) => updEquip(e.id, { currentHours: num(ev.target.value) })} placeholder="12500" /></div>
              <button onClick={() => delEquip(e.id)} style={{ ...ghostBtn, color: '#ff8a8a', borderColor: 'rgba(255,138,138,.3)', padding: '8px 12px' }}>✕</button>
            </div>
          ))}
          <button onClick={addEquip} style={{ ...ghostBtn, marginTop: 8, fontSize: 10 }}>+ Add Equipment</button>
        </div>
      )}

      <style>{`
        @media (max-width: 720px) {
          .pms-g3 { grid-template-columns: 1fr !important; }
          .pms-summary { grid-template-columns: 1fr !important; }
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

function tabBtn(active: boolean): React.CSSProperties {
  return { flex: 1, padding: '10px', background: active ? '#c8a84b' : 'transparent', color: active ? '#08100a' : '#7a8a72', border: `1px solid ${active ? '#c8a84b' : 'rgba(200,168,75,.25)'}`, fontFamily: rj, fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };
}
function chip(active: boolean): React.CSSProperties {
  return { padding: '5px 12px', background: active ? '#c8a84b' : 'transparent', color: active ? '#08100a' : '#7a8a72', border: `1px solid ${active ? '#c8a84b' : 'rgba(200,168,75,.25)'}`, fontFamily: rj, fontSize: 10, letterSpacing: '.5px', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };
}
function miniBtn(color: string): React.CSSProperties {
  return { background: 'transparent', border: 'none', color, fontFamily: rj, fontSize: 10.5, cursor: 'pointer', letterSpacing: '.5px', textTransform: 'uppercase', fontWeight: 700, padding: 0 };
}
function KPI({ label: l, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: '#0c1610', border: '1px solid rgba(200,168,75,.2)', borderRadius: 4, padding: '12px 10px', textAlign: 'center' }}>
      <div style={{ fontFamily: rj, fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: '#7a8a72', fontWeight: 700 }}>{l}</div>
      <div style={{ fontFamily: lb, fontSize: 24, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
    </div>
  );
}
