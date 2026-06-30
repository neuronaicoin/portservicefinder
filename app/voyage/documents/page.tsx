'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { saveItem, loadItem, genId } from '@/lib/voyage-storage';

const lb = "'Libre Bodoni', serif";
const rj = "'Rajdhani', sans-serif";
const g = { color: '#c8a84b', fontStyle: 'italic' };

// ============================================================
// DOC TYPES
// ============================================================
type DocType = 'NOR' | 'SOF' | 'LOP' | 'LOI' | 'MLOP' | 'NAGO' | 'MR' | 'NOT';

interface DocInfo {
  key: DocType;
  name: string;
  fullName: string;
  icon: string;
  desc: string;
}

const DOC_TYPES: DocInfo[] = [
  {
    key: 'NOR',
    name: 'NOR',
    fullName: 'Notice of Readiness',
    icon: '📋',
    desc: 'Standard NOR for loading/discharge port — tendered by master to charterer/receiver.',
  },
  {
    key: 'SOF',
    name: 'SOF',
    fullName: 'Statement of Facts',
    icon: '📊',
    desc: 'Chronological record of port operations — loading/discharge events.',
  },
  {
    key: 'LOP',
    name: 'LOP',
    fullName: 'Letter of Protest',
    icon: '⚠️',
    desc: 'Formal protest for delays, damages, short delivery, or contractual breaches.',
  },
  {
    key: 'LOI',
    name: 'LOI',
    fullName: 'Letter of Indemnity',
    icon: '🤝',
    desc: 'Indemnity for cargo release without B/L, change of destination, etc.',
  },
  {
    key: 'MLOP',
    name: 'Master LOP',
    fullName: 'Master Letter of Protest',
    icon: '⚓',
    desc: 'Master protest re: cargo quality, quantity, port operations, or weather damage.',
  },
  {
    key: 'NAGO',
    name: 'NAGO',
    fullName: 'Notice of Apparent Good Order',
    icon: '✅',
    desc: 'Receiver/agent acknowledgment that cargo received in apparent good order.',
  },
  {
    key: 'MR',
    name: "Mate's Receipt",
    fullName: "Mate's Receipt",
    icon: '📝',
    desc: 'Acknowledgment of cargo received on board — issued before B/L.',
  },
  {
    key: 'NOT',
    name: 'NOT',
    fullName: 'Notice of Tender',
    icon: '📨',
    desc: 'Notice tendering cargo for loading/discharge per charter party terms.',
  },
];

interface DocData {
  docType: DocType;

  // Common fields
  vesselName: string;
  imo: string;
  flag: string;
  callSign: string;
  master: string;
  port: string;
  berth: string;
  charterer: string;
  receiver: string;
  agent: string;
  recipient: string;
  recipientAddress: string;

  // Date / Time
  documentDate: string;
  documentTime: string;
  reference: string;

  // Cargo
  cargoQty: string;
  cargoType: string;
  blNumber: string;

  // Voyage
  voyageNo: string;
  cpDate: string;

  // Custom fields per doc type
  norReason: string; // why NOR was tendered (anchored, alongside, etc.)
  norOperation: 'loading' | 'discharging';

  sofEvents: string;

  lopReason: string;
  lopDetails: string;
  lopDamageEstimate: string;
  lopReservation: string;

  loiPurpose: string;
  loiDetails: string;

  notes: string;
}

const DEFAULT_DATA: DocData = {
  docType: 'NOR',
  vesselName: '',
  imo: '',
  flag: '',
  callSign: '',
  master: '',
  port: '',
  berth: '',
  charterer: '',
  receiver: '',
  agent: '',
  recipient: '',
  recipientAddress: '',
  documentDate: '',
  documentTime: '',
  reference: '',
  cargoQty: '',
  cargoType: '',
  blNumber: '',
  voyageNo: '',
  cpDate: '',
  norReason: 'anchored at port limits',
  norOperation: 'loading',
  sofEvents: '',
  lopReason: '',
  lopDetails: '',
  lopDamageEstimate: '',
  lopReservation: '',
  loiPurpose: '',
  loiDetails: '',
  notes: '',
};

// ============================================================
// TEMPLATE GENERATORS
// ============================================================
function generateDoc(d: DocData): string {
  const dt = d.documentDate
    ? new Date(d.documentDate + (d.documentTime ? `T${d.documentTime}` : 'T12:00')).toLocaleString('en-GB', {
        dateStyle: 'long',
        timeStyle: 'short',
      })
    : '[DATE / TIME]';

  const dtShort = d.documentDate
    ? new Date(d.documentDate).toLocaleDateString('en-GB', { dateStyle: 'long' })
    : '[DATE]';

  const ref = d.reference || `REF/${(d.vesselName || 'VESSEL').replace(/\s+/g, '')}/${new Date().getFullYear()}/${Math.floor(Math.random() * 1000)}`;

  switch (d.docType) {
    case 'NOR':
      return `M/V "${d.vesselName || '[VESSEL NAME]'}"
${d.imo ? `IMO No: ${d.imo}` : ''}
${d.flag ? `Flag: ${d.flag}` : ''}
${d.callSign ? `Call Sign: ${d.callSign}` : ''}

Reference: ${ref}
Date: ${dt}
Port: ${d.port || '[PORT]'}${d.berth ? `, Berth: ${d.berth}` : ''}

NOTICE OF READINESS
═══════════════════════════════════════════════════

To: ${d.recipient || '[CHARTERER / SHIPPER / RECEIVER]'}
${d.recipientAddress ? d.recipientAddress + '\n' : ''}
${d.charterer ? `Charterer: ${d.charterer}\n` : ''}${d.receiver ? `Receiver: ${d.receiver}\n` : ''}${d.agent ? `Agent: ${d.agent}\n` : ''}
Dear Sirs,

In accordance with the Charter Party dated ${d.cpDate || '[CP DATE]'}, please be advised that:

The above-named vessel under my command has arrived at ${d.port || '[PORT]'} on ${dt} and is in all respects ready to commence ${d.norOperation === 'loading' ? 'LOADING' : 'DISCHARGING'} of ${d.cargoQty || '[QUANTITY]'} ${d.cargoType ? `MT of ${d.cargoType}` : 'MT of cargo'}${d.norOperation === 'loading' ? ' on board' : ' from the holds'}.

The vessel is ${d.norReason || 'anchored at port limits'} and the master tenders this NOTICE OF READINESS to commence laytime in accordance with the Charter Party terms and conditions.

The vessel's holds are clean${d.norOperation === 'loading' ? ', dry, and ready to receive cargo' : ', cargo is in apparent good order'}.${d.voyageNo ? ` Voyage No.: ${d.voyageNo}` : ''}

This Notice is tendered without prejudice to any rights under the Charter Party.

Yours faithfully,

____________________
${d.master || 'Master'}
Master, M/V "${d.vesselName || '[VESSEL NAME]'}"

ACKNOWLEDGMENT:
Received by: _______________________________
Position/Title: _____________________________
Date/Time of Receipt: _______________________
Signature: _________________________________`;

    case 'SOF':
      return `M/V "${d.vesselName || '[VESSEL NAME]'}"
${d.imo ? `IMO: ${d.imo}` : ''}
Voyage: ${d.voyageNo || '[VOYAGE NO.]'}
Port: ${d.port || '[PORT]'}${d.berth ? `, Berth: ${d.berth}` : ''}

STATEMENT OF FACTS
═══════════════════════════════════════════════════

Cargo: ${d.cargoQty || '[QUANTITY]'} MT ${d.cargoType || '[TYPE]'}
B/L Number: ${d.blNumber || '[BL NO.]'}
Charter Party Date: ${d.cpDate || '[CP DATE]'}
Charterer: ${d.charterer || '[CHARTERER]'}
${d.receiver ? `Receiver: ${d.receiver}` : ''}
Agent: ${d.agent || '[AGENT]'}

CHRONOLOGY OF EVENTS:

${d.sofEvents || `[Add events in chronological order, e.g.:]

DD-MM-YYYY HH:MM    Pilot boarded
DD-MM-YYYY HH:MM    All fast at berth
DD-MM-YYYY HH:MM    NOR tendered
DD-MM-YYYY HH:MM    NOR accepted
DD-MM-YYYY HH:MM    Commenced loading
DD-MM-YYYY HH:MM    Stopped - heavy rain
DD-MM-YYYY HH:MM    Resumed loading
DD-MM-YYYY HH:MM    Completed loading
DD-MM-YYYY HH:MM    Documents signed
DD-MM-YYYY HH:MM    Pilot on board outbound
DD-MM-YYYY HH:MM    Vessel sailed`}

The above is a true record of events.

Date: ${dtShort}

Master:                          Charterer's Representative:

________________________         ________________________
${d.master || 'Master'}                            Name:
M/V "${d.vesselName || '[VESSEL NAME]'}"           Title:
                                  Date/Time:`;

    case 'LOP':
      return `M/V "${d.vesselName || '[VESSEL NAME]'}"
${d.imo ? `IMO: ${d.imo}` : ''}

Reference: ${ref}
Date: ${dt}
Port: ${d.port || '[PORT]'}${d.berth ? `, Berth: ${d.berth}` : ''}

LETTER OF PROTEST
═══════════════════════════════════════════════════

To: ${d.recipient || '[ADDRESSEE]'}
${d.recipientAddress ? d.recipientAddress + '\n' : ''}
Dear Sirs,

The Master of the above-named vessel hereby PROTESTS against:

${d.lopReason || '[STATE NATURE OF PROTEST: e.g., delay in commencement of loading / damage to cargo / short delivery / etc.]'}

DETAILS:
${d.lopDetails || '[Provide factual details, dates, times, quantities, etc.]'}

${d.lopDamageEstimate ? `ESTIMATED DAMAGE/LOSS: ${d.lopDamageEstimate}\n` : ''}
${d.lopReservation || `The Master reserves all rights of the Owners under the Charter Party and applicable law. This protest is issued without prejudice to any further protest or claim that may be made.

All rights and remedies are expressly reserved, including but not limited to claims for demurrage, off-hire, damages, costs, and consequential losses.`}

We require your written acknowledgment of receipt.

Yours faithfully,

____________________
${d.master || 'Master'}
Master, M/V "${d.vesselName || '[VESSEL NAME]'}"

ACKNOWLEDGMENT (without prejudice):
Received by: _______________________________
Date/Time: _________________________________
Signature: _________________________________
Position/Title: _____________________________

[ ] Received but contents NOT accepted
[ ] Received and acknowledged`;

    case 'LOI':
      return `M/V "${d.vesselName || '[VESSEL NAME]'}"
${d.imo ? `IMO: ${d.imo}` : ''}

Reference: ${ref}
Date: ${dt}

LETTER OF INDEMNITY
═══════════════════════════════════════════════════

To: The Master and Owners of M/V "${d.vesselName || '[VESSEL NAME]'}"
${d.recipientAddress ? d.recipientAddress + '\n' : ''}
Re: ${d.cargoQty || '[QTY]'} MT of ${d.cargoType || '[CARGO]'} shipped at ${d.port || '[PORT]'} ${d.cpDate ? `under Charter Party dated ${d.cpDate}` : ''}
${d.blNumber ? `Bill(s) of Lading: ${d.blNumber}` : ''}

Dear Sirs,

We, ${d.charterer || '[CHARTERER / SHIPPER NAME]'}, hereby request you to:

${d.loiPurpose || '[STATE PURPOSE: e.g., "Deliver the above-mentioned cargo to [Receiver] without presentation of the original Bills of Lading" / "Discharge the cargo at [alternative port]" / "Mix cargo from different B/Ls"]'}

${d.loiDetails ? '\nDETAILS:\n' + d.loiDetails + '\n' : ''}
In consideration of your complying with our above request, we hereby agree as follows:

1. To indemnify you, your servants and agents, and to hold all of you harmless in respect of any liability, loss, damage or expense of whatsoever nature which you may sustain by reason of compliance with our request.

2. In the event of any proceedings being commenced against you or your servants or agents in connection with our request, to provide you or them on demand with sufficient funds to defend the same.

3. If, in connection with the request, the vessel or other property belonging to you should be arrested or detained, to provide on demand such bail or security as may be required.

4. As soon as all original Bills of Lading shall have arrived and/or come into our possession, to deliver the same to you, whereupon our liability hereunder shall cease.

5. The liability of each and every person under this Indemnity shall be joint and several and shall not be conditional upon you proceeding first against any person.

6. This Indemnity shall be governed by and construed in accordance with English Law, and any disputes shall be submitted to the exclusive jurisdiction of the High Court of Justice in London.

Yours faithfully,

For and on behalf of ${d.charterer || '[COMPANY NAME]'}

____________________
Name:
Title:
Date: ${dtShort}

[Counter-signature by Bank may be required for certain LOI types]`;

    case 'MLOP':
      return `M/V "${d.vesselName || '[VESSEL NAME]'}"
${d.imo ? `IMO: ${d.imo}` : ''}

Reference: ${ref}
Date: ${dt}
Port: ${d.port || '[PORT]'}${d.berth ? `, Berth: ${d.berth}` : ''}

MASTER'S LETTER OF PROTEST
═══════════════════════════════════════════════════

To Whom It May Concern,

I, ${d.master || '[MASTER NAME]'}, Master of the above-named vessel, hereby formally protest against:

${d.lopReason || '[STATE PROTEST NATURE]'}

DETAILS AND CIRCUMSTANCES:
${d.lopDetails || '[Detailed factual account of the situation, including dates, times, conditions, observations]'}

VESSEL'S CONDITION & PARTICULARS:
- Vessel: M/V "${d.vesselName || '[VESSEL]'}"
- IMO: ${d.imo || '[IMO]'}
- Flag: ${d.flag || '[FLAG]'}
- Master: ${d.master || '[NAME]'}
- Port: ${d.port || '[PORT]'}
- Date/Time of incident: ${dt}
${d.cargoQty ? `- Cargo: ${d.cargoQty} MT ${d.cargoType || ''}` : ''}

${d.lopReservation || `The Master, on behalf of the Owners, reserves all rights and remedies arising from this matter. This protest is made without prejudice and all rights are expressly reserved, including but not limited to:

• Right to claim damages and/or compensation
• Right to deduct from or claim against demurrage/freight
• Right to invoke off-hire provisions
• Right to pursue legal action in appropriate forum
• Right to issue further protests as circumstances develop`}

This Master's Protest is logged in the Vessel's Official Log Book.

Signed at: ${d.port || '[PORT]'}
Date: ${dtShort}

____________________
${d.master || 'Master'}
Master, M/V "${d.vesselName || '[VESSEL NAME]'}"
(Ship's Stamp)

Witnessed by:
Chief Officer: _______________
Date: _______________`;

    case 'NAGO':
      return `M/V "${d.vesselName || '[VESSEL NAME]'}"
${d.imo ? `IMO: ${d.imo}` : ''}

Reference: ${ref}
Date: ${dt}
Port: ${d.port || '[DISCHARGE PORT]'}

NOTICE OF APPARENT GOOD ORDER
═══════════════════════════════════════════════════

To: Master, M/V "${d.vesselName || '[VESSEL NAME]'}"
Owners and Carriers

Dear Sirs,

We, ${d.receiver || '[RECEIVER]'}, hereby acknowledge receipt of the following cargo from the above-named vessel at ${d.port || '[PORT]'}:

Cargo Description: ${d.cargoType || '[CARGO TYPE]'}
Quantity: ${d.cargoQty || '[QUANTITY]'} MT
Bill(s) of Lading: ${d.blNumber || '[BL NO.]'}
${d.voyageNo ? `Voyage: ${d.voyageNo}` : ''}

The above cargo has been received in APPARENT GOOD ORDER AND CONDITION, save as may be specifically noted hereunder:

[List exceptions, if any:]

[  ] No exceptions noted
[  ] Exceptions noted below:

_______________________________________________
_______________________________________________
_______________________________________________

This Notice is issued without prejudice to any rights to issue further notices or claims should latent defects, shortage, or damage be subsequently discovered.

Date of Discharge: ${dtShort}
Place: ${d.port || '[PORT]'}

For and on behalf of ${d.receiver || '[RECEIVER]'}:

____________________
Name:
Title:
Signature:
Stamp:`;

    case 'MR':
      return `M/V "${d.vesselName || '[VESSEL NAME]'}"
${d.imo ? `IMO: ${d.imo}` : ''}

Reference: ${ref}
Date: ${dt}
Port: ${d.port || '[LOAD PORT]'}${d.berth ? `, Berth: ${d.berth}` : ''}

MATE'S RECEIPT
═══════════════════════════════════════════════════

Received on board the above-named vessel at ${d.port || '[PORT]'}, the following cargo in apparent good order and condition unless otherwise stated below:

Shipper: ${d.charterer || '[SHIPPER]'}
${d.receiver ? `Consignee: ${d.receiver}` : ''}
Port of Loading: ${d.port || '[PORT]'}
Port of Discharge: [DISCHARGE PORT]
${d.voyageNo ? `Voyage: ${d.voyageNo}` : ''}

CARGO PARTICULARS:

Description: ${d.cargoType || '[CARGO]'}
Quantity: ${d.cargoQty || '[QUANTITY]'} MT
Marks & Numbers: [_______________]
Stowage: [Hold(s) _______________]

REMARKS / NOTATIONS (if any):

[Note any visible damage, shortage, exceptions:]

___________________________________________________

[  ] Said to weigh
[  ] Shipper's weight, quantity & quality unknown
[  ] Quality as per supplier's certificate
[  ] All other terms as per Charter Party

This Mate's Receipt is issued subject to the terms of the Bill of Lading to follow.

Date of Loading: ${dtShort}

____________________
Chief Officer / Mate
M/V "${d.vesselName || '[VESSEL]'}"

____________________
Shipper / Agent
Name: ${d.agent || '_____________'}
Date:`;

    case 'NOT':
      return `M/V "${d.vesselName || '[VESSEL NAME]'}"
${d.imo ? `IMO: ${d.imo}` : ''}

Reference: ${ref}
Date: ${dt}
Port: ${d.port || '[PORT]'}

NOTICE OF TENDER
═══════════════════════════════════════════════════

To: ${d.recipient || '[CHARTERER / RECEIVER]'}
${d.recipientAddress ? d.recipientAddress + '\n' : ''}
${d.charterer ? `Charterer: ${d.charterer}\n` : ''}${d.receiver ? `Receiver: ${d.receiver}\n` : ''}${d.agent ? `Agent: ${d.agent}\n` : ''}
Dear Sirs,

In accordance with the Charter Party dated ${d.cpDate || '[CP DATE]'}, please be advised that:

We hereby TENDER the cargo of ${d.cargoQty || '[QTY]'} MT of ${d.cargoType || '[CARGO TYPE]'} for ${d.norOperation === 'loading' ? 'loading on board' : 'discharge from'} M/V "${d.vesselName || '[VESSEL]'}" at ${d.port || '[PORT]'}${d.berth ? `, ${d.berth}` : ''}.

The vessel is fully ready in all respects to commence ${d.norOperation === 'loading' ? 'loading' : 'discharge'} operations from the time stated above.

This tender is issued without prejudice to all rights under the Charter Party.

Acknowledgment of receipt of this Notice is requested.

Yours faithfully,

____________________
${d.master || 'Master'} / Authorized Agent
M/V "${d.vesselName || '[VESSEL NAME]'}"

ACKNOWLEDGMENT:
Received by: _______________________________
Date/Time: _________________________________
Signature/Stamp: ___________________________`;

    default:
      return '[Document type not implemented]';
  }
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
export default function DocumentGeneratorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingId = searchParams.get('id');

  const [data, setData] = useState<DocData>(DEFAULT_DATA);
  const [recordId, setRecordId] = useState<string | null>(existingId);
  const [recordName, setRecordName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [view, setView] = useState<'input' | 'preview'>('input');

  useEffect(() => {
    if (existingId) {
      const saved = loadItem<DocData>('documents', existingId);
      if (saved) {
        setData(saved.data);
        setRecordName(saved.name);
      }
    }
  }, [existingId]);

  function update<K extends keyof DocData>(key: K, value: DocData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    const name = recordName.trim() || `${data.docType} — ${data.vesselName || 'Vessel'}`;
    const id = recordId || genId();
    saveItem('documents', name, data, id);
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
    router.replace('/voyage/documents');
  }
  function handlePrint() {
    window.print();
  }
  function handleCopy() {
    const doc = generateDoc(data);
    navigator.clipboard
      .writeText(doc)
      .then(() => {
        setSaveMsg('✓ Copied to clipboard');
        setTimeout(() => setSaveMsg(''), 3000);
      })
      .catch(() => {
        setSaveMsg('⚠ Copy failed');
        setTimeout(() => setSaveMsg(''), 3000);
      });
  }
  function handleEmail() {
    const docInfo = DOC_TYPES.find((d) => d.key === data.docType);
    const subject = `${docInfo?.fullName} — ${data.vesselName || 'Vessel'} — ${data.port || 'Port'}`;
    const body = generateDoc(data);
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  const currentDocInfo = DOC_TYPES.find((d) => d.key === data.docType);
  const generatedDoc = generateDoc(data);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>
          📝 Voyage Hub · Document Generator
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Maritime <em style={g}>Documents</em> Generator
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          Generate professional NOR, SOF, LOP, LOI, Master Protest, and other essential maritime
          documents. Auto-filled, editable, ready to print or email.
        </p>
      </div>

      {/* Action Bar */}
      <div className="action-bar" style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => setView(view === 'input' ? 'preview' : 'input')}
          style={{
            background: view === 'preview' ? 'transparent' : '#c8a84b',
            color: view === 'preview' ? '#c8a84b' : '#08100a',
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
          {view === 'input' ? '📄 Preview Document' : '✏️ Edit'}
        </button>
        <button onClick={() => setShowSave(true)} style={ghostBtn}>💾 Save</button>
        <button onClick={handleCopy} style={ghostBtn}>📋 Copy</button>
        <button onClick={handleEmail} style={ghostBtn}>✉️ Email</button>
        <button onClick={handlePrint} style={ghostBtn}>🖨️ Print / PDF</button>
        <button onClick={handleReset} style={{ ...ghostBtn, color: '#ff8a8a', borderColor: 'rgba(255,138,138,.3)' }}>🗑️ Reset</button>
        {saveMsg && <span style={{ color: '#4caf76', fontFamily: rj, fontSize: 12, fontWeight: 600 }}>{saveMsg}</span>}
        {recordName && <span style={{ color: '#7a8a72', fontFamily: rj, fontSize: 11, marginLeft: 'auto' }}>📂 {recordName}</span>}
      </div>

      {/* Save Dialog */}
      {showSave && (
        <div style={{ ...card, background: 'rgba(200,168,75,.05)', borderColor: 'rgba(200,168,75,.4)' }}>
          <label style={label}>Name</label>
          <input
            type="text"
            value={recordName}
            onChange={(e) => setRecordName(e.target.value)}
            placeholder={`e.g. ${data.docType} — ${data.vesselName || 'Vessel'}`}
            style={{ ...inputStyle, marginBottom: 10 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{ background: '#c8a84b', color: '#08100a', border: 'none', padding: '8px 14px', fontFamily: rj, fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 3 }}>
              Save
            </button>
            <button onClick={() => setShowSave(false)} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {view === 'input' ? (
        <>
          {/* Doc Type Selector */}
          <div style={card}>
            <div style={sectionTitle}>1. Select Document Type</div>
            <div className="doc-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              {DOC_TYPES.map((doc) => (
                <button
                  key={doc.key}
                  onClick={() => update('docType', doc.key)}
                  style={{
                    background: data.docType === doc.key ? 'rgba(200,168,75,.15)' : '#0c1610',
                    border: `1px solid ${data.docType === doc.key ? '#c8a84b' : 'rgba(200,168,75,.18)'}`,
                    padding: '14px 12px',
                    cursor: 'pointer',
                    borderRadius: 4,
                    textAlign: 'left',
                    fontFamily: rj,
                    color: '#f5f0e8',
                  }}
                >
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{doc.icon}</div>
                  <div style={{ fontFamily: lb, fontSize: 13, fontWeight: 700, color: data.docType === doc.key ? '#c8a84b' : '#f5f0e8', marginBottom: 3 }}>
                    {doc.name}
                  </div>
                  <div style={{ fontSize: 10, color: '#7a8a72', lineHeight: 1.3 }}>{doc.fullName}</div>
                </button>
              ))}
            </div>
            <p style={{ fontSize: 12, color: '#b0c0a4', marginTop: 14, fontFamily: rj, lineHeight: 1.5 }}>
              {currentDocInfo?.icon} <strong style={{ color: '#c8a84b' }}>{currentDocInfo?.fullName}</strong>: {currentDocInfo?.desc}
            </p>
          </div>

          {/* Vessel & Port Info */}
          <div style={card}>
            <div style={sectionTitle}>2. Vessel Information</div>
            <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              <div>
                <label style={label}>Vessel Name *</label>
                <input style={inputStyle} type="text" value={data.vesselName} onChange={(e) => update('vesselName', e.target.value)} placeholder="MV NEURONAI" />
              </div>
              <div>
                <label style={label}>IMO Number</label>
                <input style={inputStyle} type="text" value={data.imo} onChange={(e) => update('imo', e.target.value)} placeholder="9876543" />
              </div>
              <div>
                <label style={label}>Master / Captain</label>
                <input style={inputStyle} type="text" value={data.master} onChange={(e) => update('master', e.target.value)} placeholder="Capt. John Smith" />
              </div>
            </div>
            <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 12 }}>
              <div>
                <label style={label}>Flag</label>
                <input style={inputStyle} type="text" value={data.flag} onChange={(e) => update('flag', e.target.value)} placeholder="Marshall Islands" />
              </div>
              <div>
                <label style={label}>Call Sign</label>
                <input style={inputStyle} type="text" value={data.callSign} onChange={(e) => update('callSign', e.target.value)} placeholder="V7AB123" />
              </div>
              <div>
                <label style={label}>Voyage No.</label>
                <input style={inputStyle} type="text" value={data.voyageNo} onChange={(e) => update('voyageNo', e.target.value)} placeholder="V-2026-005" />
              </div>
            </div>
          </div>

          {/* Port & Date */}
          <div style={card}>
            <div style={sectionTitle}>3. Port & Date Information</div>
            <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              <div>
                <label style={label}>Port *</label>
                <input style={inputStyle} type="text" value={data.port} onChange={(e) => update('port', e.target.value)} placeholder="Tubarão, Brazil" />
              </div>
              <div>
                <label style={label}>Berth (optional)</label>
                <input style={inputStyle} type="text" value={data.berth} onChange={(e) => update('berth', e.target.value)} placeholder="Berth No. 5" />
              </div>
              <div>
                <label style={label}>Reference No.</label>
                <input style={inputStyle} type="text" value={data.reference} onChange={(e) => update('reference', e.target.value)} placeholder="auto-generated" />
              </div>
            </div>
            <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 12 }}>
              <div>
                <label style={label}>Document Date *</label>
                <input style={inputStyle} type="date" value={data.documentDate} onChange={(e) => update('documentDate', e.target.value)} />
              </div>
              <div>
                <label style={label}>Document Time (UTC)</label>
                <input style={inputStyle} type="time" value={data.documentTime} onChange={(e) => update('documentTime', e.target.value)} />
              </div>
              <div>
                <label style={label}>CP Date</label>
                <input style={inputStyle} type="date" value={data.cpDate} onChange={(e) => update('cpDate', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Parties */}
          <div style={card}>
            <div style={sectionTitle}>4. Parties</div>
            <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              <div>
                <label style={label}>Charterer / Shipper</label>
                <input style={inputStyle} type="text" value={data.charterer} onChange={(e) => update('charterer', e.target.value)} placeholder="ABC Shipping Co." />
              </div>
              <div>
                <label style={label}>Receiver / Consignee</label>
                <input style={inputStyle} type="text" value={data.receiver} onChange={(e) => update('receiver', e.target.value)} placeholder="XYZ Steel Mills" />
              </div>
              <div>
                <label style={label}>Local Agent</label>
                <input style={inputStyle} type="text" value={data.agent} onChange={(e) => update('agent', e.target.value)} placeholder="Singapore Maritime Agency" />
              </div>
            </div>
            <div className="g2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginTop: 12 }}>
              <div>
                <label style={label}>Recipient of This Document</label>
                <input style={inputStyle} type="text" value={data.recipient} onChange={(e) => update('recipient', e.target.value)} placeholder="ABC Charterer" />
              </div>
              <div>
                <label style={label}>Recipient Address</label>
                <input style={inputStyle} type="text" value={data.recipientAddress} onChange={(e) => update('recipientAddress', e.target.value)} placeholder="Address (city, country)" />
              </div>
            </div>
          </div>

          {/* Cargo */}
          {['NOR', 'SOF', 'LOI', 'NAGO', 'MR', 'NOT', 'MLOP'].includes(data.docType) && (
            <div style={card}>
              <div style={sectionTitle}>5. Cargo Information</div>
              <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                <div>
                  <label style={label}>Cargo Type</label>
                  <input style={inputStyle} type="text" value={data.cargoType} onChange={(e) => update('cargoType', e.target.value)} placeholder="Iron Ore" />
                </div>
                <div>
                  <label style={label}>Quantity (MT)</label>
                  <input style={inputStyle} type="text" value={data.cargoQty} onChange={(e) => update('cargoQty', e.target.value)} placeholder="170,000" />
                </div>
                <div>
                  <label style={label}>B/L Number</label>
                  <input style={inputStyle} type="text" value={data.blNumber} onChange={(e) => update('blNumber', e.target.value)} placeholder="BL-2026-001" />
                </div>
              </div>
            </div>
          )}

          {/* NOR-specific */}
          {(data.docType === 'NOR' || data.docType === 'NOT') && (
            <div style={card}>
              <div style={sectionTitle}>6. NOR / Tender Details</div>
              <div className="g2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
                <div>
                  <label style={label}>Operation</label>
                  <select style={inputStyle} value={data.norOperation} onChange={(e) => update('norOperation', e.target.value as 'loading' | 'discharging')}>
                    <option value="loading">Loading</option>
                    <option value="discharging">Discharging</option>
                  </select>
                </div>
                <div>
                  <label style={label}>Vessel Status (NOR only)</label>
                  <select style={inputStyle} value={data.norReason} onChange={(e) => update('norReason', e.target.value)}>
                    <option>anchored at port limits</option>
                    <option>alongside berth</option>
                    <option>at anchorage</option>
                    <option>at pilot station</option>
                    <option>at customary waiting area</option>
                    <option>at outer anchorage</option>
                    <option>off port limits</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* SOF events */}
          {data.docType === 'SOF' && (
            <div style={card}>
              <div style={sectionTitle}>6. Statement of Facts — Events</div>
              <label style={label}>Chronological Events (one per line)</label>
              <textarea
                value={data.sofEvents}
                onChange={(e) => update('sofEvents', e.target.value)}
                placeholder={`14-01-2026 06:00    Pilot boarded at pilot station\n14-01-2026 07:30    All fast at berth 5\n14-01-2026 08:00    NOR tendered\n14-01-2026 10:00    NOR accepted\n14-01-2026 12:00    Commenced loading\n15-01-2026 18:00    Stopped due to heavy rain\n15-01-2026 22:00    Resumed loading\n17-01-2026 14:00    Completed loading\n17-01-2026 16:00    Documents signed\n17-01-2026 17:30    Pilot on board outbound\n17-01-2026 18:30    Vessel sailed`}
                rows={12}
                style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 12, resize: 'vertical', minHeight: 200 }}
              />
            </div>
          )}

          {/* LOP-specific */}
          {(data.docType === 'LOP' || data.docType === 'MLOP') && (
            <div style={card}>
              <div style={sectionTitle}>6. Protest Details</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={label}>Nature of Protest (one line)</label>
                  <input
                    style={inputStyle}
                    type="text"
                    value={data.lopReason}
                    onChange={(e) => update('lopReason', e.target.value)}
                    placeholder="Delay in commencement of loading"
                  />
                </div>
                <div>
                  <label style={label}>Detailed Account</label>
                  <textarea
                    value={data.lopDetails}
                    onChange={(e) => update('lopDetails', e.target.value)}
                    placeholder="Vessel arrived at port on 14 Jan 2026 at 06:00 LT and tendered NOR at 08:00 LT. Despite repeated communications with charterer, loading did not commence until 16 Jan 2026 at 14:00 LT — a delay of 54 hours beyond the customary..."
                    rows={6}
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }}
                  />
                </div>
                <div>
                  <label style={label}>Estimated Damage / Loss (optional)</label>
                  <input
                    style={inputStyle}
                    type="text"
                    value={data.lopDamageEstimate}
                    onChange={(e) => update('lopDamageEstimate', e.target.value)}
                    placeholder="USD 84,000 (demurrage + bunker)"
                  />
                </div>
                <div>
                  <label style={label}>Reservation Clause (optional — leave blank for standard)</label>
                  <textarea
                    value={data.lopReservation}
                    onChange={(e) => update('lopReservation', e.target.value)}
                    placeholder="Leave blank for standard reservation clause"
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* LOI-specific */}
          {data.docType === 'LOI' && (
            <div style={card}>
              <div style={sectionTitle}>6. Indemnity Details</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={label}>Purpose of Indemnity</label>
                  <textarea
                    value={data.loiPurpose}
                    onChange={(e) => update('loiPurpose', e.target.value)}
                    placeholder="Deliver the above-mentioned cargo to [Receiver Name] without presentation of the original Bills of Lading."
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
                <div>
                  <label style={label}>Additional Details</label>
                  <textarea
                    value={data.loiDetails}
                    onChange={(e) => update('loiDetails', e.target.value)}
                    placeholder="Specific circumstances, B/L numbers, etc."
                    rows={4}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
                <div style={{ padding: '10px 12px', background: 'rgba(255,138,138,.06)', border: '1px solid rgba(255,138,138,.2)', borderRadius: 3, fontSize: 11.5, color: '#ff8a8a', fontFamily: rj, lineHeight: 1.5 }}>
                  ⚠ <strong>Important:</strong> LOI templates are starting points. Consult P&I Club / lawyer
                  before issuing. Bank counter-signature often required.
                </div>
              </div>
            </div>
          )}

          {/* Quick Preview */}
          <div style={{ ...card, background: 'linear-gradient(135deg,rgba(200,168,75,.08),transparent)', borderColor: 'rgba(200,168,75,.4)' }}>
            <div style={sectionTitle}>⚡ Document Ready</div>
            <p style={{ fontSize: 12, color: '#b0c0a4', marginBottom: 12 }}>
              Click <strong style={{ color: '#c8a84b' }}>Preview Document</strong> above to see the full text, then Print, Copy, or Email.
            </p>
            <button
              onClick={() => setView('preview')}
              style={{
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
              📄 Preview Document →
            </button>
          </div>
        </>
      ) : (
        // ============================================================
        // PREVIEW VIEW
        // ============================================================
        <div>
          <div
            className="doc-preview"
            style={{
              ...card,
              background: '#0c1610',
              borderColor: 'rgba(200,168,75,.3)',
              padding: '32px 28px',
            }}
          >
            <pre
              style={{
                fontFamily: '"Courier New", monospace',
                fontSize: 12,
                color: '#f5f0e8',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                margin: 0,
              }}
            >
              {generatedDoc}
            </pre>
          </div>

          <div style={{ ...card, background: 'rgba(122,138,114,.05)', borderColor: 'rgba(122,138,114,.15)' }}>
            <div style={{ fontFamily: rj, fontSize: 10.5, color: '#7a8a72', letterSpacing: '.5px', lineHeight: 1.7 }}>
              💡 <strong style={{ color: '#c8a84b' }}>Tips:</strong>
              <br />
              • Click <strong>📋 Copy</strong> to paste into your email client.
              <br />
              • Click <strong>✉️ Email</strong> to open your mail app with this document pre-filled.
              <br />
              • Click <strong>🖨️ Print / PDF</strong> for hard copy or PDF.
              <br />• Templates are professional starting points. Review legal language before issuing.
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 720px) {
          .g3, .g2 { grid-template-columns: 1fr !important; }
          .doc-grid { grid-template-columns: repeat(2,1fr) !important; }
          .action-bar button { font-size: 10px !important; padding: 7px 10px !important; }
        }
        @media print {
          @page { size: A4; margin: 14mm; }
          body { background: white !important; color: black !important; }
          nav, footer, .action-bar, [style*="position: sticky"], .doc-preview ~ * { display: none !important; }
          .doc-preview { border: none !important; background: white !important; padding: 0 !important; }
          .doc-preview pre { color: black !important; font-size: 11pt !important; }
        }
      `}</style>
    </div>
  );
}
