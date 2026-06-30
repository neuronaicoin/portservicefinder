'use client';
import { useState, useMemo } from 'react';
import { VISA_COUNTRIES, REQ_META, type VisaCountry, type Requirement } from '@/lib/visa-data';

const lb = "'Libre Bodoni', serif";
const rj = "'Rajdhani', sans-serif";
const g = { color: '#c8a84b', fontStyle: 'italic' } as React.CSSProperties;

const card: React.CSSProperties = { background: '#111c13', border: '1px solid rgba(200,168,75,.18)', padding: '20px 18px', borderRadius: 4, marginBottom: 16 };
const sectionTitle: React.CSSProperties = { fontFamily: rj, fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid rgba(200,168,75,.12)' };
const labelS: React.CSSProperties = { display: 'block', fontFamily: rj, fontSize: 10, letterSpacing: '.5px', textTransform: 'uppercase', color: '#7a8a72', fontWeight: 600, marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', background: '#0c1610', border: '1px solid rgba(200,168,75,.2)', color: '#f5f0e8', padding: '8px 10px', fontFamily: rj, fontSize: 13, fontWeight: 500, borderRadius: 3, boxSizing: 'border-box' };
const ghostBtn: React.CSSProperties = { background: 'transparent', color: '#c8a84b', border: '1px solid rgba(200,168,75,.4)', padding: '8px 14px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };

function ReqPill({ label, req }: { label: string; req: Requirement }) {
  const m = REQ_META[req];
  return (
    <div style={{ background: '#0c1610', border: `1px solid ${m.color}40`, borderRadius: 4, padding: '10px 12px', textAlign: 'center', flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: rj, fontSize: 9, letterSpacing: '.5px', textTransform: 'uppercase', color: '#7a8a72', fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: rj, fontSize: 12, fontWeight: 700, color: m.color, lineHeight: 1.2 }}>{m.label}</div>
    </div>
  );
}

export default function VisaPage() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return VISA_COUNTRIES;
    return VISA_COUNTRIES.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  }, [query]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>
          ⚓ Voyage Hub · Visa Requirements
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Visa <em style={g}>Requirements</em>
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          Seafarer visa &amp; documentation guidance for major maritime countries — shore leave, crew change
          and airport transit. General reference only; rules vary by nationality and change often.
        </p>
      </div>

      {/* Disclaimer */}
      <div style={{ ...card, background: 'rgba(255,138,138,.06)', borderColor: 'rgba(255,138,138,.3)', padding: '12px 16px' }}>
        <div style={{ fontFamily: rj, fontSize: 12, color: '#ffb0b0', lineHeight: 1.5 }}>
          ⚠ <b>General guidance only.</b> Visa requirements depend on the seafarer&apos;s nationality, the vessel&apos;s flag and
          the purpose of entry, and change frequently. <b>Always confirm with the local agent and the relevant
          embassy/consulate before any crew change, shore leave or transit.</b>
        </div>
      </div>

      {/* Action + legend */}
      <div className="action-bar" style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => window.print()} style={ghostBtn}>🖨️ Print / PDF</button>
      </div>
      <div style={{ ...card, padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', fontFamily: rj, fontSize: 11.5, color: '#b0c0a4' }}>
          <span style={{ color: '#c8a84b', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontSize: 10 }}>Legend:</span>
          {(Object.keys(REQ_META) as Requirement[]).map((k) => (
            <span key={k}><b style={{ color: REQ_META[k].color }}>●</b> {REQ_META[k].label}</span>
          ))}
        </div>
      </div>

      {/* Search */}
      <div style={card}>
        <label style={labelS}>Search country</label>
        <input style={inputStyle} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. United States, Schengen, UAE..." />
        <div style={{ marginTop: 8, fontFamily: rj, fontSize: 11, color: '#7a8a72' }}>{filtered.length} countries</div>
      </div>

      {/* Country cards */}
      {filtered.map((c) => {
        const open = selected === c.code;
        return (
          <div key={c.code} style={{ ...card, borderColor: open ? 'rgba(200,168,75,.5)' : 'rgba(200,168,75,.18)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setSelected(open ? null : c.code)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24 }}>{c.flag}</span>
                <div style={{ fontFamily: lb, fontSize: 17, fontWeight: 700, color: '#f5f0e8' }}>{c.name}</div>
              </div>
              <span style={{ fontFamily: rj, fontSize: 11, color: '#c8a84b' }}>{open ? '▲' : '▼'}</span>
            </div>

            <div className="visa-pills" style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              <ReqPill label="Shore Leave" req={c.shoreLeave} />
              <ReqPill label="Sign On/Off" req={c.signOnOff} />
              <ReqPill label="Airport Transit" req={c.transit} />
            </div>

            {open && (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px dashed rgba(200,168,75,.18)' }}>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontFamily: rj, fontSize: 9, color: '#c8a84b', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>Typical Documents</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {c.docs.map((d) => (
                      <span key={d} style={{ fontSize: 11, background: '#0c1610', color: '#b0c0a4', padding: '3px 9px', borderRadius: 3, fontFamily: rj, border: '1px solid rgba(200,168,75,.12)' }}>{d}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: rj, fontSize: 9, color: '#c8a84b', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: 5 }}>Notes</div>
                  <p style={{ fontFamily: rj, fontSize: 12.5, color: '#b0c0a4', lineHeight: 1.6 }}>{c.notes}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div style={{ ...card, textAlign: 'center', color: '#7a8a72', fontFamily: rj }}>No country matches your search.</div>
      )}

      {/* Reference */}
      <div style={{ ...card, background: 'rgba(122,138,114,.05)', borderColor: 'rgba(122,138,114,.15)' }}>
        <div style={sectionTitle}>📖 Seafarer Entry Basics</div>
        <ul style={{ fontSize: 11.5, color: '#b0c0a4', lineHeight: 1.7, paddingLeft: 18, fontFamily: rj }}>
          <li>The IMO FAL Convention encourages shore leave for seafarers regardless of nationality, but each state applies its own immigration rules.</li>
          <li>A valid <b style={{ color: '#c8a84b' }}>Seafarer&apos;s Identity Document / discharge book</b> plus passport is the baseline everywhere.</li>
          <li>&quot;Shore leave&quot; (visiting port while the ship is alongside) is usually easier than &quot;sign-on/off&quot; (joining/leaving via the country) or &quot;airport transit&quot;.</li>
          <li>The US (C1/D) and Australia (MCV) require a visa in advance for essentially all foreign crew — plan early.</li>
          <li>This is orientation only. The agent and the embassy/consulate give the binding answer for a specific nationality and date.</li>
        </ul>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .visa-pills { flex-direction: column !important; }
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
