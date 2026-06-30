'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

/* ============================================================
   Hire Statement — Time Charter hire calculation
   /voyage/hire
   ============================================================ */

type OffHire = {
  id: string;
  reason: string;
  from: string; // datetime-local
  to: string;   // datetime-local
  // off-hire bunker consumed (charterer not liable) — optional
  bunkerVlsfo: string;
  bunkerMgo: string;
};

type HireState = {
  // header
  vessel: string;
  imo: string;
  charterer: string;
  owner: string;
  cpDate: string;
  voyageNo: string;
  statementNo: string;

  // on-hire period
  deliveryDate: string;   // datetime-local
  redeliveryDate: string; // datetime-local
  hireRate: string;       // $/day

  // commissions / CVE
  cveRate: string;        // $/month (lumpsum CVE) e.g. 1500
  addressCommPct: string; // %
  brokeragePct: string;   // %

  // bunkers on delivery (charterer buys from owner -> charterer owes owner)
  delVlsfoQty: string;
  delVlsfoPrice: string;
  delMgoQty: string;
  delMgoPrice: string;

  // bunkers on redelivery (owner buys from charterer -> owner owes charterer)
  redVlsfoQty: string;
  redVlsfoPrice: string;
  redMgoQty: string;
  redMgoPrice: string;

  // off-hire
  offHires: OffHire[];

  // other deductions (claims, advances, ports paid by charterer etc.)
  otherLabel1: string;
  otherAmount1: string; // + owner owes charterer / - charterer owes owner. Sign handled by direction
  otherDir1: 'deduct' | 'add';
  otherLabel2: string;
  otherAmount2: string;
  otherDir2: 'deduct' | 'add';

  // payments already made by charterer
  paid: string;
};

const todayLocal = () => {
  const d = new Date();
  d.setSeconds(0, 0);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
};

const blank = (): HireState => ({
  vessel: '',
  imo: '',
  charterer: '',
  owner: '',
  cpDate: '',
  voyageNo: '',
  statementNo: '1',
  deliveryDate: todayLocal(),
  redeliveryDate: todayLocal(),
  hireRate: '',
  cveRate: '1500',
  addressCommPct: '3.75',
  brokeragePct: '1.25',
  delVlsfoQty: '',
  delVlsfoPrice: '',
  delMgoQty: '',
  delMgoPrice: '',
  redVlsfoQty: '',
  redVlsfoPrice: '',
  redMgoQty: '',
  redMgoPrice: '',
  offHires: [],
  otherLabel1: '',
  otherAmount1: '',
  otherDir1: 'deduct',
  otherLabel2: '',
  otherAmount2: '',
  otherDir2: 'deduct',
  paid: '',
});

const C = {
  bg: '#0a2540',
  card: '#0f2f52',
  card2: '#13395f',
  border: '#1d4a78',
  ink: '#e8eef5',
  sub: '#93a7be',
  gold: '#fbbf24',
  green: '#34d399',
  red: '#f87171',
  blue: '#60a5fa',
};

const n = (v: string) => {
  const x = parseFloat(v);
  return isNaN(x) ? 0 : x;
};

const fmt = (v: number, dp = 2) =>
  v.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });

const money = (v: number) =>
  (v < 0 ? '-$' : '$') + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const hoursBetween = (a: string, b: string) => {
  if (!a || !b) return 0;
  const t1 = new Date(a).getTime();
  const t2 = new Date(b).getTime();
  if (isNaN(t1) || isNaN(t2)) return 0;
  return (t2 - t1) / 3600000;
};

export default function HireStatementPage() {
  const [s, setS] = useState<HireState>(blank);
  const [savedList, setSavedList] = useState<{ id: string; name: string }[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  // load saved list + URL id
  useEffect(() => {
    try {
      const idx = JSON.parse(localStorage.getItem('psf_hire_index') || '[]');
      setSavedList(Array.isArray(idx) ? idx : []);
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      if (id) {
        const raw = localStorage.getItem('psf_hire_' + id);
        if (raw) {
          setS(JSON.parse(raw));
          setCurrentId(id);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const set = useCallback(<K extends keyof HireState>(k: K, v: HireState[K]) => {
    setS((p) => ({ ...p, [k]: v }));
  }, []);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(''), 2200);
  };

  /* ---------- Off-hire helpers ---------- */
  const addOffHire = () => {
    setS((p) => ({
      ...p,
      offHires: [
        ...p.offHires,
        { id: Math.random().toString(36).slice(2, 9), reason: '', from: todayLocal(), to: todayLocal(), bunkerVlsfo: '', bunkerMgo: '' },
      ],
    }));
  };
  const updOffHire = (id: string, k: keyof OffHire, v: string) => {
    setS((p) => ({ ...p, offHires: p.offHires.map((o) => (o.id === id ? { ...o, [k]: v } : o)) }));
  };
  const delOffHire = (id: string) => {
    setS((p) => ({ ...p, offHires: p.offHires.filter((o) => o.id !== id) }));
  };

  /* ---------- Calculations ---------- */
  const calc = useMemo(() => {
    const grossHours = hoursBetween(s.deliveryDate, s.redeliveryDate);
    const offHireHours = s.offHires.reduce((sum, o) => sum + Math.max(0, hoursBetween(o.from, o.to)), 0);
    const onHireHours = Math.max(0, grossHours - offHireHours);

    const grossDays = grossHours / 24;
    const offHireDays = offHireHours / 24;
    const onHireDays = onHireHours / 24;

    const rate = n(s.hireRate);
    const hireGross = (grossDays) * rate;            // if no off-hire deducted
    const offHireDeduction = offHireDays * rate;
    const hireNet = onHireDays * rate;               // hire actually owed for on-hire time

    // CVE: $/month -> pro-rata on ON-HIRE days (30-day month convention)
    const cveMonthly = n(s.cveRate);
    const cve = (cveMonthly / 30) * onHireDays;

    // commission on (hire net + cve) — standard: addr comm + brokerage
    const commBase = hireNet + cve;
    const addrComm = commBase * (n(s.addressCommPct) / 100);
    const brokerage = commBase * (n(s.brokeragePct) / 100);
    const totalComm = addrComm + brokerage;

    // Bunkers on delivery: charterer OWES owner
    const delV = n(s.delVlsfoQty) * n(s.delVlsfoPrice);
    const delM = n(s.delMgoQty) * n(s.delMgoPrice);
    const bunkerDelivery = delV + delM;

    // Bunkers on redelivery: owner OWES charterer
    const redV = n(s.redVlsfoQty) * n(s.redVlsfoPrice);
    const redM = n(s.redMgoQty) * n(s.redMgoPrice);
    const bunkerRedelivery = redV + redM;

    const netBunkerToOwner = bunkerDelivery - bunkerRedelivery; // + charterer owes owner

    // other adjustments
    const o1 = n(s.otherAmount1) * (s.otherDir1 === 'deduct' ? -1 : 1);
    const o2 = n(s.otherAmount2) * (s.otherDir2 === 'deduct' ? -1 : 1);
    const otherAdj = o1 + o2; // + increases amount charterer owes owner

    // Amount charterer owes owner (gross of payments):
    //   hire (on-hire) + bunker delivery - CVE - commissions - bunker redelivery + other
    const totalDue =
      hireNet
      + bunkerDelivery
      - cve
      - totalComm
      - bunkerRedelivery
      + otherAdj;

    const paid = n(s.paid);
    const balance = totalDue - paid;

    return {
      grossHours, offHireHours, onHireHours,
      grossDays, offHireDays, onHireDays,
      rate, hireGross, offHireDeduction, hireNet,
      cve, addrComm, brokerage, totalComm,
      bunkerDelivery, bunkerRedelivery, netBunkerToOwner,
      delV, delM, redV, redM,
      otherAdj, totalDue, paid, balance,
    };
  }, [s]);

  /* ---------- Save / Load / Reset ---------- */
  const save = () => {
    try {
      const id = currentId || Math.random().toString(36).slice(2, 9);
      const name = (s.vessel || 'Hire') + ' #' + (s.statementNo || '1');
      localStorage.setItem('psf_hire_' + id, JSON.stringify(s));
      const idx = JSON.parse(localStorage.getItem('psf_hire_index') || '[]') as { id: string; name: string }[];
      const next = idx.filter((x) => x.id !== id);
      next.unshift({ id, name });
      localStorage.setItem('psf_hire_index', JSON.stringify(next));
      setSavedList(next);
      setCurrentId(id);
      const url = new URL(window.location.href);
      url.searchParams.set('id', id);
      window.history.replaceState({}, '', url.toString());
      showToast('Saved');
    } catch {
      showToast('Save failed — storage unavailable');
    }
  };

  const load = (id: string) => {
    try {
      const raw = localStorage.getItem('psf_hire_' + id);
      if (raw) {
        setS(JSON.parse(raw));
        setCurrentId(id);
        const url = new URL(window.location.href);
        url.searchParams.set('id', id);
        window.history.replaceState({}, '', url.toString());
        showToast('Loaded');
      }
    } catch {
      showToast('Load failed');
    }
  };

  const remove = (id: string) => {
    localStorage.removeItem('psf_hire_' + id);
    const next = savedList.filter((x) => x.id !== id);
    localStorage.setItem('psf_hire_index', JSON.stringify(next));
    setSavedList(next);
    if (currentId === id) {
      setCurrentId(null);
      const url = new URL(window.location.href);
      url.searchParams.delete('id');
      window.history.replaceState({}, '', url.toString());
    }
  };

  const reset = () => {
    if (confirm('Clear this statement and start fresh?')) {
      setS(blank());
      setCurrentId(null);
      const url = new URL(window.location.href);
      url.searchParams.delete('id');
      window.history.replaceState({}, '', url.toString());
    }
  };

  const doPrint = () => window.print();

  /* ---------- Small UI helpers ---------- */
  const Field = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <span style={{ display: 'block', fontSize: 12, color: C.sub, marginBottom: 5, fontWeight: 600 }}>{label}</span>
      {children}
      {hint && <span style={{ display: 'block', fontSize: 11, color: C.sub, marginTop: 3 }}>{hint}</span>}
    </label>
  );

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    background: C.bg,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    color: C.ink,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const Section = ({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) => (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, marginBottom: 16 }}>
      <h3 style={{ margin: '0 0 14px', fontSize: 15, color: C.gold, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>{icon}</span> {title}
      </h3>
      {children}
    </div>
  );

  const Row = ({ children, cols = 2 }: { children: React.ReactNode; cols?: number }) => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>{children}</div>
  );

  const StatLine = ({ label, value, color = C.ink, strong = false }: { label: string; value: string; color?: string; strong?: boolean }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${C.border}`, fontSize: strong ? 15 : 13.5 }}>
      <span style={{ color: C.sub }}>{label}</span>
      <span style={{ color, fontWeight: strong ? 800 : 600, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.ink, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: #fff !important; }
        }
        .print-only { display: none; }
        input::placeholder { color: #5a7494; }
        input:focus, select:focus { border-color: ${C.gold} !important; }
        @media (max-width: 640px) {
          .grid-2 { grid-template-columns: 1fr 1fr !important; }
          .hire-cols { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '20px 16px 80px' }}>
        {/* Header */}
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: C.gold, fontWeight: 700, letterSpacing: 0.5 }}>📋 CHARTER &amp; COMMERCIAL</div>
            <h1 style={{ margin: '4px 0 0', fontSize: 26, fontWeight: 800 }}>Hire Statement</h1>
            <p style={{ margin: '4px 0 0', color: C.sub, fontSize: 13.5 }}>
              Time charter hire, bunkers on delivery/redelivery, off-hire &amp; commissions.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={save} style={btn(C.gold, C.bg)}>💾 Save</button>
            <button onClick={doPrint} style={btn(C.blue, C.bg)}>🖨️ Print / PDF</button>
            <button onClick={reset} style={btn('transparent', C.sub, C.border)}>↺ Reset</button>
          </div>
        </div>

        {/* Saved list */}
        {savedList.length > 0 && (
          <div className="no-print" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {savedList.map((x) => (
              <span key={x.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: currentId === x.id ? C.card2 : C.card, border: `1px solid ${currentId === x.id ? C.gold : C.border}`, borderRadius: 20, padding: '5px 8px 5px 12px', fontSize: 12.5 }}>
                <button onClick={() => load(x.id)} style={{ background: 'none', border: 'none', color: C.ink, cursor: 'pointer', fontSize: 12.5 }}>{x.name}</button>
                <button onClick={() => remove(x.id)} style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>×</button>
              </span>
            ))}
          </div>
        )}

        <div className="hire-cols" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16, alignItems: 'start' }}>
          {/* LEFT: inputs */}
          <div>
            <Section icon="🚢" title="Vessel & Charter">
              <Row>
                <Field label="Vessel"><input style={inputStyle} value={s.vessel} onChange={(e) => set('vessel', e.target.value)} placeholder="MV NEURONAI" /></Field>
                <Field label="IMO"><input style={inputStyle} value={s.imo} onChange={(e) => set('imo', e.target.value)} placeholder="9876543" /></Field>
              </Row>
              <Row>
                <Field label="Owner / Disponent Owner"><input style={inputStyle} value={s.owner} onChange={(e) => set('owner', e.target.value)} placeholder="ABC Shipping Ltd" /></Field>
                <Field label="Charterer"><input style={inputStyle} value={s.charterer} onChange={(e) => set('charterer', e.target.value)} placeholder="XYZ Chartering" /></Field>
              </Row>
              <Row cols={3}>
                <Field label="CP Date"><input type="date" style={inputStyle} value={s.cpDate} onChange={(e) => set('cpDate', e.target.value)} /></Field>
                <Field label="Voyage No."><input style={inputStyle} value={s.voyageNo} onChange={(e) => set('voyageNo', e.target.value)} placeholder="V-01" /></Field>
                <Field label="Statement No."><input style={inputStyle} value={s.statementNo} onChange={(e) => set('statementNo', e.target.value)} placeholder="1" /></Field>
              </Row>
            </Section>

            <Section icon="⏱️" title="Hire Period">
              <Row>
                <Field label="Delivery (on-hire)"><input type="datetime-local" style={inputStyle} value={s.deliveryDate} onChange={(e) => set('deliveryDate', e.target.value)} /></Field>
                <Field label="Redelivery (off-hire)"><input type="datetime-local" style={inputStyle} value={s.redeliveryDate} onChange={(e) => set('redeliveryDate', e.target.value)} /></Field>
              </Row>
              <Field label="Hire Rate (USD / day)" hint="Daily hire as per charter party.">
                <input type="number" style={inputStyle} value={s.hireRate} onChange={(e) => set('hireRate', e.target.value)} placeholder="15000" />
              </Field>
              <div style={{ fontSize: 12.5, color: C.sub, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px' }}>
                Gross period: <b style={{ color: C.ink }}>{fmt(calc.grossDays, 4)} days</b> ({fmt(calc.grossHours, 1)} h)
                {calc.offHireHours > 0 && <> · Off-hire <b style={{ color: C.red }}>{fmt(calc.offHireDays, 4)} d</b> · On-hire <b style={{ color: C.green }}>{fmt(calc.onHireDays, 4)} d</b></>}
              </div>
            </Section>

            <Section icon="⏸️" title="Off-Hire Periods">
              {s.offHires.length === 0 && <p style={{ color: C.sub, fontSize: 13, margin: '0 0 12px' }}>No off-hire. Add periods (breakdown, deviation, detention) to deduct from hire.</p>}
              {s.offHires.map((o, i) => {
                const h = Math.max(0, hoursBetween(o.from, o.to));
                return (
                  <div key={o.id} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12, marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <b style={{ fontSize: 13, color: C.red }}>Off-hire #{i + 1} — {fmt(h / 24, 3)} d ({fmt(h, 1)} h)</b>
                      <button onClick={() => delOffHire(o.id)} style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: 13 }}>Delete</button>
                    </div>
                    <Field label="Reason"><input style={inputStyle} value={o.reason} onChange={(e) => updOffHire(o.id, 'reason', e.target.value)} placeholder="ME breakdown / deviation" /></Field>
                    <Row>
                      <Field label="From"><input type="datetime-local" style={inputStyle} value={o.from} onChange={(e) => updOffHire(o.id, 'from', e.target.value)} /></Field>
                      <Field label="To"><input type="datetime-local" style={inputStyle} value={o.to} onChange={(e) => updOffHire(o.id, 'to', e.target.value)} /></Field>
                    </Row>
                  </div>
                );
              })}
              <button onClick={addOffHire} style={{ ...btn(C.card2, C.gold, C.border), width: '100%' }}>+ Add Off-Hire Period</button>
            </Section>

            <Section icon="⛽" title="Bunkers on Delivery (charterer pays owner)">
              <Row cols={2}>
                <Field label="VLSFO Qty (MT)"><input type="number" style={inputStyle} value={s.delVlsfoQty} onChange={(e) => set('delVlsfoQty', e.target.value)} placeholder="350" /></Field>
                <Field label="VLSFO Price ($/MT)"><input type="number" style={inputStyle} value={s.delVlsfoPrice} onChange={(e) => set('delVlsfoPrice', e.target.value)} placeholder="580" /></Field>
              </Row>
              <Row cols={2}>
                <Field label="MGO Qty (MT)"><input type="number" style={inputStyle} value={s.delMgoQty} onChange={(e) => set('delMgoQty', e.target.value)} placeholder="80" /></Field>
                <Field label="MGO Price ($/MT)"><input type="number" style={inputStyle} value={s.delMgoPrice} onChange={(e) => set('delMgoPrice', e.target.value)} placeholder="780" /></Field>
              </Row>
              <div style={{ fontSize: 13, color: C.green, fontWeight: 700 }}>Bunker on delivery: {money(calc.bunkerDelivery)}</div>
            </Section>

            <Section icon="⛽" title="Bunkers on Redelivery (owner pays charterer)">
              <Row cols={2}>
                <Field label="VLSFO Qty (MT)"><input type="number" style={inputStyle} value={s.redVlsfoQty} onChange={(e) => set('redVlsfoQty', e.target.value)} placeholder="350" /></Field>
                <Field label="VLSFO Price ($/MT)"><input type="number" style={inputStyle} value={s.redVlsfoPrice} onChange={(e) => set('redVlsfoPrice', e.target.value)} placeholder="580" /></Field>
              </Row>
              <Row cols={2}>
                <Field label="MGO Qty (MT)"><input type="number" style={inputStyle} value={s.redMgoQty} onChange={(e) => set('redMgoQty', e.target.value)} placeholder="80" /></Field>
                <Field label="MGO Price ($/MT)"><input type="number" style={inputStyle} value={s.redMgoPrice} onChange={(e) => set('redMgoPrice', e.target.value)} placeholder="780" /></Field>
              </Row>
              <div style={{ fontSize: 13, color: C.red, fontWeight: 700 }}>Bunker on redelivery: {money(calc.bunkerRedelivery)}</div>
            </Section>

            <Section icon="📉" title="Commissions & CVE">
              <Field label="CVE / Victualling (USD / month)" hint="Lumpsum, pro-rated on on-hire days (30-day month).">
                <input type="number" style={inputStyle} value={s.cveRate} onChange={(e) => set('cveRate', e.target.value)} placeholder="1500" />
              </Field>
              <Row>
                <Field label="Address Commission (%)"><input type="number" style={inputStyle} value={s.addressCommPct} onChange={(e) => set('addressCommPct', e.target.value)} placeholder="3.75" /></Field>
                <Field label="Brokerage (%)"><input type="number" style={inputStyle} value={s.brokeragePct} onChange={(e) => set('brokeragePct', e.target.value)} placeholder="1.25" /></Field>
              </Row>
              <div style={{ fontSize: 12, color: C.sub }}>Commission applied on hire (on-hire) + CVE.</div>
            </Section>

            <Section icon="±" title="Other Adjustments">
              <Row cols={3}>
                <Field label="Item 1 label"><input style={inputStyle} value={s.otherLabel1} onChange={(e) => set('otherLabel1', e.target.value)} placeholder="Owner's port DA" /></Field>
                <Field label="Amount ($)"><input type="number" style={inputStyle} value={s.otherAmount1} onChange={(e) => set('otherAmount1', e.target.value)} placeholder="0" /></Field>
                <Field label="Direction">
                  <select style={inputStyle} value={s.otherDir1} onChange={(e) => set('otherDir1', e.target.value as 'deduct' | 'add')}>
                    <option value="deduct">Deduct (owner owes)</option>
                    <option value="add">Add (charterer owes)</option>
                  </select>
                </Field>
              </Row>
              <Row cols={3}>
                <Field label="Item 2 label"><input style={inputStyle} value={s.otherLabel2} onChange={(e) => set('otherLabel2', e.target.value)} placeholder="Speed/cons claim" /></Field>
                <Field label="Amount ($)"><input type="number" style={inputStyle} value={s.otherAmount2} onChange={(e) => set('otherAmount2', e.target.value)} placeholder="0" /></Field>
                <Field label="Direction">
                  <select style={inputStyle} value={s.otherDir2} onChange={(e) => set('otherDir2', e.target.value as 'deduct' | 'add')}>
                    <option value="deduct">Deduct (owner owes)</option>
                    <option value="add">Add (charterer owes)</option>
                  </select>
                </Field>
              </Row>
            </Section>

            <Section icon="💳" title="Payments Received">
              <Field label="Hire already paid by charterer ($)" hint="Sum of installments paid to date.">
                <input type="number" style={inputStyle} value={s.paid} onChange={(e) => set('paid', e.target.value)} placeholder="0" />
              </Field>
            </Section>
          </div>

          {/* RIGHT: statement */}
          <div style={{ position: 'sticky', top: 16 }}>
            <div style={{ background: C.card, border: `1px solid ${C.gold}`, borderRadius: 14, padding: 20 }}>
              <div style={{ textAlign: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: 1 }}>HIRE STATEMENT</div>
                <div style={{ fontSize: 17, fontWeight: 800, marginTop: 2 }}>{s.vessel || 'Vessel'}</div>
                <div style={{ fontSize: 12, color: C.sub }}>
                  {s.voyageNo && <>Voyage {s.voyageNo} · </>}Statement #{s.statementNo || '1'}
                </div>
              </div>

              <StatLine label={`Hire — on-hire ${fmt(calc.onHireDays, 3)} d × $${fmt(calc.rate, 2)}`} value={money(calc.hireNet)} />
              {calc.offHireDeduction > 0 && (
                <StatLine label={`Off-hire deducted (${fmt(calc.offHireDays, 3)} d)`} value={'-' + money(calc.offHireDeduction)} color={C.red} />
              )}
              <StatLine label="(+) Bunkers on delivery" value={money(calc.bunkerDelivery)} color={C.green} />
              <StatLine label="(−) Bunkers on redelivery" value={'-' + money(calc.bunkerRedelivery)} color={C.red} />
              <StatLine label="(−) CVE / victualling" value={'-' + money(calc.cve)} color={C.red} />
              <StatLine label={`(−) Address comm. ${s.addressCommPct || 0}%`} value={'-' + money(calc.addrComm)} color={C.red} />
              <StatLine label={`(−) Brokerage ${s.brokeragePct || 0}%`} value={'-' + money(calc.brokerage)} color={C.red} />
              {n(s.otherAmount1) !== 0 && (
                <StatLine label={`${s.otherDir1 === 'add' ? '(+)' : '(−)'} ${s.otherLabel1 || 'Item 1'}`} value={(s.otherDir1 === 'add' ? '' : '-') + money(n(s.otherAmount1))} color={s.otherDir1 === 'add' ? C.green : C.red} />
              )}
              {n(s.otherAmount2) !== 0 && (
                <StatLine label={`${s.otherDir2 === 'add' ? '(+)' : '(−)'} ${s.otherLabel2 || 'Item 2'}`} value={(s.otherDir2 === 'add' ? '' : '-') + money(n(s.otherAmount2))} color={s.otherDir2 === 'add' ? C.green : C.red} />
              )}

              <div style={{ height: 8 }} />
              <StatLine label="TOTAL DUE TO OWNER" value={money(calc.totalDue)} color={C.gold} strong />
              {calc.paid > 0 && <StatLine label="Less: hire paid" value={'-' + money(calc.paid)} color={C.red} />}

              <div style={{ marginTop: 12, background: C.bg, border: `1px solid ${calc.balance >= 0 ? C.gold : C.green}`, borderRadius: 10, padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, letterSpacing: 0.5 }}>
                  {calc.balance >= 0 ? 'BALANCE DUE FROM CHARTERER' : 'BALANCE DUE TO CHARTERER'}
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: calc.balance >= 0 ? C.gold : C.green, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
                  {money(Math.abs(calc.balance))}
                </div>
              </div>

              <div style={{ marginTop: 12, fontSize: 11.5, color: C.sub, lineHeight: 1.5 }}>
                Owner {s.owner || '—'} · Charterer {s.charterer || '—'}
                {s.cpDate && <> · CP {s.cpDate}</>}
              </div>
            </div>

            <div className="no-print" style={{ marginTop: 12, fontSize: 11.5, color: C.sub, lineHeight: 1.55, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
              <b style={{ color: C.gold }}>How it's calculated</b><br />
              Hire = on-hire days × daily rate (off-hire deducted). Bunkers on delivery are added (charterer buys owner's bunkers); bunkers on redelivery are deducted (owner buys back). CVE pro-rated on on-hire days. Commissions apply to hire + CVE. Always reconcile against the charter party — this is a working estimate, not legal advice.
            </div>
          </div>
        </div>

        {/* Print-only clean statement */}
        <div className="print-only" style={{ color: '#111', marginTop: 24 }}>
          <h2 style={{ margin: '0 0 4px' }}>HIRE STATEMENT — {s.vessel}</h2>
          <p style={{ margin: 0, fontSize: 13 }}>
            Owner: {s.owner} · Charterer: {s.charterer} · Voyage {s.voyageNo} · Statement #{s.statementNo} · CP {s.cpDate}
          </p>
          <p style={{ margin: '4px 0', fontSize: 13 }}>
            Delivery {s.deliveryDate} → Redelivery {s.redeliveryDate} · On-hire {fmt(calc.onHireDays, 3)} d @ ${fmt(calc.rate, 2)}/day
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 8 }}>
            <tbody>
              {[
                [`Hire — on-hire ${fmt(calc.onHireDays, 3)} d`, money(calc.hireNet)],
                ['Bunkers on delivery', money(calc.bunkerDelivery)],
                ['Bunkers on redelivery', '-' + money(calc.bunkerRedelivery)],
                ['CVE / victualling', '-' + money(calc.cve)],
                [`Address commission ${s.addressCommPct}%`, '-' + money(calc.addrComm)],
                [`Brokerage ${s.brokeragePct}%`, '-' + money(calc.brokerage)],
                ['Total due to owner', money(calc.totalDue)],
                ['Hire paid', '-' + money(calc.paid)],
                ['BALANCE', money(calc.balance)],
              ].map(([k, v], i) => (
                <tr key={i} style={{ borderBottom: '1px solid #ccc' }}>
                  <td style={{ padding: '6px 4px' }}>{k}</td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: i >= 6 ? 800 : 400 }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {toast && (
        <div className="no-print" style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: C.gold, color: C.bg, padding: '10px 20px', borderRadius: 24, fontWeight: 700, fontSize: 13.5, boxShadow: '0 8px 24px rgba(0,0,0,.4)' }}>
          {toast}
        </div>
      )}
    </div>
  );
}

function btn(bg: string, fg: string, border?: string): React.CSSProperties {
  return {
    padding: '9px 14px',
    background: bg,
    color: fg,
    border: `1px solid ${border || bg}`,
    borderRadius: 9,
    fontSize: 13.5,
    fontWeight: 700,
    cursor: 'pointer',
  };
}
