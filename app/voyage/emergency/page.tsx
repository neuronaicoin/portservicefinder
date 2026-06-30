'use client';
import { useState, useEffect } from 'react';
import { saveItem, loadItem } from '@/lib/voyage-storage';

const lb = "'Libre Bodoni', serif";
const rj = "'Rajdhani', sans-serif";
const g = { color: '#c8a84b', fontStyle: 'italic' } as React.CSSProperties;

// ============================================================
// Emergency quick reference. First-action prompts are memory aids
// only — the ship's SMS, muster list and SOLAS procedures govern.
// ============================================================

interface Contact {
  role: string;
  value: string;
}

interface EmergencyData {
  vesselName: string;
  callSign: string;
  mmsi: string;
  contacts: Contact[];
}

const DEFAULT_CONTACTS: Contact[] = [
  { role: 'DPA (Designated Person Ashore)', value: '' },
  { role: 'CSO (Company Security Officer)', value: '' },
  { role: 'Owner / Operator 24h', value: '' },
  { role: 'P&I Club / Correspondent', value: '' },
  { role: 'Flag State', value: '' },
  { role: 'Classification Society', value: '' },
  { role: 'Nearest MRCC / Coast Guard', value: '' },
  { role: 'Local Agent', value: '' },
  { role: 'Insurer (H&M)', value: '' },
  { role: 'Medical advice (e.g. CIRM / Radio Medico)', value: '' },
];

const DEFAULT_DATA: EmergencyData = { vesselName: '', callSign: '', mmsi: '', contacts: DEFAULT_CONTACTS };

const SIGNALS: { name: string; signal: string }[] = [
  { name: 'General Emergency', signal: '7 or more short blasts + 1 long blast on whistle & alarm' },
  { name: 'Fire', signal: 'Continuous ringing of alarm bells (per ship SMS) + announce location' },
  { name: 'Abandon Ship', signal: 'Verbal order by Master (no single signal) — never on the signal alone' },
  { name: 'Man Overboard', signal: '3 long blasts + shout "Man overboard", throw lifebuoy with light/smoke' },
];

interface EmergencyCard {
  key: string;
  title: string;
  icon: string;
  color: string;
  steps: string[];
}

const CARDS: EmergencyCard[] = [
  { key: 'fire', title: 'Fire', icon: '🔥', color: '#ff6b6b', steps: [
    'Raise alarm, announce location, sound fire alarm',
    'Muster, head count, don fire kit / BA sets',
    'Stop ventilation & fuel to the space; close openings',
    'Boundary cooling; first-aid firefighting if safe',
    'Inform Master / bridge; prepare fixed system if needed',
    'Send distress if not under control; log times',
  ] },
  { key: 'abandon', title: 'Abandon Ship', icon: '🛟', color: '#ff8a8a', steps: [
    'Only on Master\u2019s explicit order',
    'Send DISTRESS (DSC + Mayday); activate EPIRB/SART',
    'Muster at stations with lifejackets & immersion suits',
    'Take EPIRB, SART, portable VHF, extra clothing, water',
    'Launch survival craft to leeward; account for all persons',
    'Stay together; deploy sea anchor; conserve resources',
  ] },
  { key: 'mob', title: 'Man Overboard', icon: '🆘', color: '#5aa6e8', steps: [
    'Throw lifebuoy with light/smoke immediately',
    'Shout "Man overboard"; 3 long blasts',
    'Post lookout pointing at casualty; press MOB on GPS',
    'Williamson / Anderson turn as appropriate',
    'Inform Master/bridge; ready rescue boat & crew',
    'Broadcast urgency; log position & times',
  ] },
  { key: 'flooding', title: 'Flooding', icon: '🌊', color: '#5aa6e8', steps: [
    'Raise alarm; identify source & extent',
    'Close watertight doors / valves; isolate the space',
    'Start bilge/ballast pumps; sound tanks & bilges',
    'Shore up / plug ingress if safe; monitor list & trim',
    'Inform Master; check stability margin',
    'Prepare distress if uncontrolled; log actions',
  ] },
  { key: 'pollution', title: 'Pollution / Spill', icon: '🛢️', color: '#e8b85a', steps: [
    'Stop the operation / source immediately',
    'Raise alarm; deploy SOPEP equipment',
    'Contain on deck; close scuppers; absorbents',
    'Notify Master; make required reports (coastal state, flag, owner, P&I)',
    'Record in ORB; photograph evidence',
    'Do NOT use unauthorised dispersants',
  ] },
  { key: 'medical', title: 'Medical Emergency', icon: '🩺', color: '#8bc34a', steps: [
    'First aid; ensure airway, breathing, circulation',
    'Inform Master; consult ship medical guide',
    'Obtain TMAS / radio-medical advice',
    'Prepare casualty details, vitals, history',
    'Consider diversion / MEDEVAC if advised',
    'Log treatment, times and advice received',
  ] },
  { key: 'security', title: 'Security / Piracy', icon: '🛡️', color: '#c8a84b', steps: [
    'Raise alarm; activate SSAS (silent)',
    'Implement ship security plan; muster in citadel if applicable',
    'Increase speed, manoeuvre, use water/anti-boarding measures',
    'Send to UKMTO / regional reporting centre & owner/CSO',
    'Account for crew; lock down access',
    'Preserve evidence; log all events',
  ] },
];

// ============================================================
// STYLES
// ============================================================
const card: React.CSSProperties = { background: '#111c13', border: '1px solid rgba(200,168,75,.18)', padding: '20px 18px', borderRadius: 4, marginBottom: 16 };
const sectionTitle: React.CSSProperties = { fontFamily: rj, fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid rgba(200,168,75,.12)' };
const labelS: React.CSSProperties = { display: 'block', fontFamily: rj, fontSize: 10, letterSpacing: '.5px', textTransform: 'uppercase', color: '#7a8a72', fontWeight: 600, marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', background: '#0c1610', border: '1px solid rgba(200,168,75,.2)', color: '#f5f0e8', padding: '7px 9px', fontFamily: rj, fontSize: 12.5, fontWeight: 500, borderRadius: 3, boxSizing: 'border-box' };
const ghostBtn: React.CSSProperties = { background: 'transparent', color: '#c8a84b', border: '1px solid rgba(200,168,75,.4)', padding: '8px 14px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };

const STORAGE_KEY = 'emergency';
const SINGLETON_ID = 'emergencyref';

// ============================================================
// COMPONENT
// ============================================================
export default function EmergencyPage() {
  const [data, setData] = useState<EmergencyData>(DEFAULT_DATA);
  const [saveMsg, setSaveMsg] = useState('');
  const [active, setActive] = useState<string>('fire');

  useEffect(() => {
    try {
      const saved = loadItem<EmergencyData>(STORAGE_KEY, SINGLETON_ID);
      if (saved && saved.data && Array.isArray(saved.data.contacts)) setData({ ...DEFAULT_DATA, ...saved.data });
    } catch { /* ignore */ }
  }, []);

  function persist(next: EmergencyData) {
    setData(next);
    try { saveItem(STORAGE_KEY, 'Emergency Reference', next, SINGLETON_ID); setSaveMsg('✓ Saved'); setTimeout(() => setSaveMsg(''), 2000); } catch { /* ignore */ }
  }
  function update<K extends keyof EmergencyData>(key: K, value: EmergencyData[K]) { persist({ ...data, [key]: value }); }
  function updContact(i: number, value: string) {
    persist({ ...data, contacts: data.contacts.map((c, idx) => (idx === i ? { ...c, value } : c)) });
  }

  const activeCard = CARDS.find((c) => c.key === active) || CARDS[0];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>
          ⚓ Voyage Hub · Emergency Reference
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Emergency <em style={g}>Reference</em>
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          Quick first-action prompts, alarm signals and your emergency contacts on one printable page.
          A memory aid only — the ship&apos;s SMS, muster list and SOLAS procedures always govern.
        </p>
      </div>

      {/* Disclaimer */}
      <div style={{ ...card, background: 'rgba(255,138,138,.06)', borderColor: 'rgba(255,138,138,.3)', padding: '12px 16px' }}>
        <div style={{ fontFamily: rj, fontSize: 12, color: '#ffb0b0', lineHeight: 1.5 }}>
          ⚠ <b>Memory aid only.</b> Follow the ship&apos;s approved emergency procedures, muster list and the Master&apos;s
          orders. Fill in your real contacts below, then print and post near the bridge / ship&apos;s office.
        </div>
      </div>

      {/* Action bar */}
      <div className="action-bar" style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => window.print()} style={ghostBtn}>🖨️ Print / Post</button>
        {saveMsg && <span style={{ color: '#4caf76', fontFamily: rj, fontSize: 12, fontWeight: 600 }}>{saveMsg}</span>}
      </div>

      {/* Vessel */}
      <div style={card}>
        <div className="em-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          <div><label style={labelS}>Vessel</label><input style={inputStyle} value={data.vesselName} onChange={(e) => update('vesselName', e.target.value)} placeholder="MV NEURONAI" /></div>
          <div><label style={labelS}>Call Sign</label><input style={inputStyle} value={data.callSign} onChange={(e) => update('callSign', e.target.value)} placeholder="TCXX" /></div>
          <div><label style={labelS}>MMSI</label><input style={inputStyle} value={data.mmsi} onChange={(e) => update('mmsi', e.target.value)} placeholder="271000000" /></div>
        </div>
      </div>

      {/* Emergency cards */}
      <div style={card}>
        <div style={sectionTitle}>🚨 First Actions</div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 16 }}>
          {CARDS.map((c) => (
            <button key={c.key} onClick={() => setActive(c.key)} style={{
              padding: '6px 12px', background: active === c.key ? c.color : 'transparent',
              color: active === c.key ? '#08100a' : c.color, border: `1px solid ${c.color}66`,
              fontFamily: rj, fontSize: 11, fontWeight: 700, cursor: 'pointer', borderRadius: 4, whiteSpace: 'nowrap',
            }}>{c.icon} {c.title}</button>
          ))}
        </div>

        <div style={{ background: '#0c1610', border: `1px solid ${activeCard.color}40`, borderRadius: 4, padding: '16px 18px' }}>
          <div style={{ fontFamily: lb, fontSize: 17, fontWeight: 700, color: activeCard.color, marginBottom: 12 }}>{activeCard.icon} {activeCard.title} — First Actions</div>
          <ol style={{ margin: 0, paddingLeft: 22 }}>
            {activeCard.steps.map((s, i) => (
              <li key={i} style={{ fontFamily: rj, fontSize: 13, color: '#f5f0e8', lineHeight: 1.7, marginBottom: 4 }}>{s}</li>
            ))}
          </ol>
        </div>
      </div>

      {/* Print-all cards (hidden on screen, shown on print) */}
      <div className="print-all-cards" style={{ display: 'none' }}>
        {CARDS.map((c) => (
          <div key={c.key} style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: lb, fontSize: 15, fontWeight: 700, color: '#000', marginBottom: 6 }}>{c.icon} {c.title}</div>
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              {c.steps.map((s, i) => <li key={i} style={{ fontFamily: rj, fontSize: 12, color: '#000', lineHeight: 1.5 }}>{s}</li>)}
            </ol>
          </div>
        ))}
      </div>

      {/* Signals */}
      <div style={card}>
        <div style={sectionTitle}>📢 Alarm Signals</div>
        {SIGNALS.map((s) => (
          <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '9px 0', borderBottom: '1px dashed rgba(200,168,75,.1)', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: rj, fontSize: 13, color: '#c8a84b', fontWeight: 700, minWidth: 140 }}>{s.name}</span>
            <span style={{ fontFamily: rj, fontSize: 12, color: '#b0c0a4', flex: 1, textAlign: 'right', lineHeight: 1.4 }}>{s.signal}</span>
          </div>
        ))}
        <p style={{ fontFamily: rj, fontSize: 10.5, color: '#7a8a72', marginTop: 10 }}>Signals shown are common conventions — your ship&apos;s station bill defines the exact signals.</p>
      </div>

      {/* Distress format */}
      <div style={card}>
        <div style={sectionTitle}>📻 Distress / Urgency Format</div>
        <div style={{ background: '#0c1610', border: '1px solid rgba(255,138,138,.3)', borderRadius: 4, padding: '12px 14px', marginBottom: 10 }}>
          <div style={{ fontFamily: rj, fontSize: 11, color: '#ff8a8a', fontWeight: 700, letterSpacing: '1px', marginBottom: 6 }}>MAYDAY (grave & imminent danger)</div>
          <div style={{ fontFamily: rj, fontSize: 12.5, color: '#f5f0e8', lineHeight: 1.6 }}>
            &quot;MAYDAY, MAYDAY, MAYDAY — this is [vessel name ×3], call sign / MMSI. MAYDAY [vessel name]. Position [lat/long or bearing &amp; distance]. Nature of distress […]. Assistance required […]. Persons on board […]. Over.&quot;
          </div>
        </div>
        <div style={{ background: '#0c1610', border: '1px solid rgba(232,184,90,.3)', borderRadius: 4, padding: '12px 14px' }}>
          <div style={{ fontFamily: rj, fontSize: 11, color: '#e8b85a', fontWeight: 700, letterSpacing: '1px', marginBottom: 6 }}>PAN-PAN (urgency, no imminent danger)</div>
          <div style={{ fontFamily: rj, fontSize: 12.5, color: '#f5f0e8', lineHeight: 1.6 }}>
            &quot;PAN-PAN ×3 — All stations / [station], this is [vessel name ×3]. Position […]. Nature […]. Assistance / intentions […]. Over.&quot;
          </div>
        </div>
      </div>

      {/* Contacts */}
      <div style={card}>
        <div style={sectionTitle}>📞 Emergency Contacts</div>
        <p style={{ fontFamily: rj, fontSize: 11, color: '#7a8a72', marginBottom: 12 }}>Fill in your numbers — saved automatically and included when you print.</p>
        {data.contacts.map((c, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8, alignItems: 'center' }}>
            <span style={{ fontFamily: rj, fontSize: 12.5, color: '#b0c0a4', fontWeight: 600 }}>{c.role}</span>
            <input style={inputStyle} value={c.value} onChange={(e) => updContact(i, e.target.value)} placeholder="+90 ... / email / sat-phone" />
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 720px) {
          .em-g3 { grid-template-columns: 1fr !important; }
          .action-bar button { font-size: 10px !important; padding: 7px 10px !important; }
        }
        @media print {
          @page { size: A4; margin: 12mm; }
          body { background: white !important; color: black !important; }
          nav, footer, .action-bar { display: none !important; }
          .print-all-cards { display: block !important; }
        }
      `}</style>
    </div>
  );
}
