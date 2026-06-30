'use client';
import { useState, useMemo } from 'react';
import { DIRECTORY_PORTS, REGIONS, type Port, type Region } from '@/lib/port-directory';

const lb = "'Libre Bodoni', serif";
const rj = "'Rajdhani', sans-serif";
const g = { color: '#c8a84b', fontStyle: 'italic' } as React.CSSProperties;

const card: React.CSSProperties = { background: '#111c13', border: '1px solid rgba(200,168,75,.18)', padding: '20px 18px', borderRadius: 4, marginBottom: 16 };
const sectionTitle: React.CSSProperties = { fontFamily: rj, fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid rgba(200,168,75,.12)' };
const labelS: React.CSSProperties = { display: 'block', fontFamily: rj, fontSize: 10, letterSpacing: '.5px', textTransform: 'uppercase', color: '#7a8a72', fontWeight: 600, marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', background: '#0c1610', border: '1px solid rgba(200,168,75,.2)', color: '#f5f0e8', padding: '8px 10px', fontFamily: rj, fontSize: 13, fontWeight: 500, borderRadius: 3, boxSizing: 'border-box' };
const ghostBtn: React.CSSProperties = { background: 'transparent', color: '#c8a84b', border: '1px solid rgba(200,168,75,.4)', padding: '8px 14px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };

const PILOT_META: Record<Port['pilotage'], { label: string; color: string }> = {
  compulsory: { label: 'Compulsory', color: '#ff8a8a' },
  recommended: { label: 'Recommended', color: '#e8b85a' },
  optional: { label: 'Optional', color: '#4caf76' },
};

export default function PortsPage() {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<'all' | Region>('all');
  const [open, setOpen] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DIRECTORY_PORTS
      .filter((p) => region === 'all' || p.region === region)
      .filter((p) => !q || [p.name, p.country, p.locode].some((f) => f.toLowerCase().includes(q)))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [query, region]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>
          ⚓ Voyage Hub · Port Database
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Port <em style={g}>Database</em>
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          Quick reference for major hub ports — draft, terminals, pilotage and VHF, plus direct links to
          PSC inspection history and local service providers. Always confirm details with the agent.
        </p>
      </div>

      {/* Disclaimer */}
      <div style={{ ...card, background: 'rgba(232,184,90,.06)', borderColor: 'rgba(232,184,90,.3)', padding: '12px 16px' }}>
        <div style={{ fontFamily: rj, fontSize: 12, color: '#e8c87a', lineHeight: 1.5 }}>
          ⚠ <b>Reference only.</b> Drafts, restrictions, VHF channels and working hours change. Confirm against
          the current Notices to Mariners, port authority and your agent before arrival.
        </div>
      </div>

      {/* Action */}
      <div className="action-bar" style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => window.print()} style={ghostBtn}>🖨️ Print / PDF</button>
      </div>

      {/* Search + region */}
      <div style={card}>
        <label style={labelS}>Search port</label>
        <input style={inputStyle} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. Singapore, Rotterdam, SGSIN, Türkiye..." />
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 12 }}>
          <button onClick={() => setRegion('all')} style={chip(region === 'all')}>All regions</button>
          {REGIONS.map((r) => <button key={r} onClick={() => setRegion(r)} style={chip(region === r)}>{r}</button>)}
        </div>
        <div style={{ marginTop: 10, fontFamily: rj, fontSize: 11, color: '#7a8a72' }}>{filtered.length} ports</div>
      </div>

      {/* Port cards */}
      {filtered.map((p) => {
        const isOpen = open === p.id;
        const pm = PILOT_META[p.pilotage];
        return (
          <div key={p.id} style={{ ...card, borderColor: isOpen ? 'rgba(200,168,75,.5)' : 'rgba(200,168,75,.18)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: 10 }} onClick={() => setOpen(isOpen ? null : p.id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <span style={{ fontSize: 22 }}>{p.flag}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: lb, fontSize: 16, fontWeight: 700, color: '#f5f0e8' }}>{p.name}</div>
                  <div style={{ fontFamily: rj, fontSize: 11, color: '#7a8a72' }}>{p.country} · {p.locode} · {p.region}</div>
                </div>
              </div>
              <span style={{ fontFamily: rj, fontSize: 11, color: '#c8a84b' }}>{isOpen ? '▲' : '▼'}</span>
            </div>

            {/* quick facts row */}
            <div style={{ display: 'flex', gap: 14, marginTop: 12, flexWrap: 'wrap', fontFamily: rj, fontSize: 11.5, color: '#b0c0a4' }}>
              {p.maxDraftM > 0 && <span>🌊 Max draft <b style={{ color: '#f5f0e8' }}>{p.maxDraftM} m</b></span>}
              {p.maxLoaM > 0 && <span>📏 LOA <b style={{ color: '#f5f0e8' }}>{p.maxLoaM} m</b></span>}
              <span>🧭 Pilotage <b style={{ color: pm.color }}>{pm.label}</b></span>
              <span>📻 {p.vhf}</span>
            </div>

            {isOpen && (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px dashed rgba(200,168,75,.18)' }}>
                <div className="port-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 12 }}>
                  <Fact label="Coordinates" value={`${p.lat.toFixed(3)}, ${p.lon.toFixed(3)}`} />
                  <Fact label="Timezone" value={p.timezone} />
                  <Fact label="Working hours" value={p.working} />
                  <Fact label="Pilotage" value={pm.label} />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontFamily: rj, fontSize: 9, color: '#c8a84b', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>Terminals</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {p.terminals.map((t) => <span key={t} style={{ fontSize: 11, background: '#0c1610', color: '#b0c0a4', padding: '3px 9px', borderRadius: 3, fontFamily: rj, border: '1px solid rgba(200,168,75,.12)' }}>{t}</span>)}
                  </div>
                </div>

                <p style={{ fontFamily: rj, fontSize: 12.5, color: '#b0c0a4', lineHeight: 1.6, marginBottom: 14 }}>{p.notes}</p>

                {/* PSC history deep-links */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontFamily: rj, fontSize: 9, color: '#c8a84b', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>PSC Inspection History (official sources)</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <a href="https://www.equasis.org/" target="_blank" rel="noopener noreferrer" style={linkBtn}>Equasis ↗</a>
                    <a href="https://parismou.org/inspection-search/inspection-search" target="_blank" rel="noopener noreferrer" style={linkBtn}>Paris MoU ↗</a>
                    <a href="https://apcis.tmou.org/public/" target="_blank" rel="noopener noreferrer" style={linkBtn}>Tokyo MoU (APCIS) ↗</a>
                    <a href="https://gisis.imo.org/" target="_blank" rel="noopener noreferrer" style={linkBtn}>IMO GISIS ↗</a>
                  </div>
                  <p style={{ fontFamily: rj, fontSize: 10, color: '#7a8a72', marginTop: 6 }}>Search by vessel IMO on these official databases. (Bulk download / scraping is not permitted — these are direct links to the public search portals.)</p>
                </div>

                {/* cross-links */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <a href="/" style={goldLink}>🔎 Find providers in this port (PSF) →</a>
                  <a href="/voyage/holidays" style={linkBtn}>Holidays →</a>
                  <a href="/voyage/visa" style={linkBtn}>Visa →</a>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div style={{ ...card, textAlign: 'center', color: '#7a8a72', fontFamily: rj }}>No port matches your search.</div>
      )}

      {/* Note */}
      <div style={{ ...card, background: 'rgba(122,138,114,.05)', borderColor: 'rgba(122,138,114,.15)' }}>
        <div style={sectionTitle}>📖 About PSC History Links</div>
        <ul style={{ fontSize: 11.5, color: '#b0c0a4', lineHeight: 1.7, paddingLeft: 18, fontFamily: rj }}>
          <li>Port State Control inspection records are <b style={{ color: '#c8a84b' }}>public</b> via Equasis, the Paris &amp; Tokyo MoU databases and IMO GISIS.</li>
          <li>Search by the ship&apos;s <b>IMO number</b> to see past inspections, deficiencies and any detentions.</li>
          <li>These buttons open the official public search portals directly — no data is copied or stored here.</li>
          <li>Use the history to prepare for likely PSC focus areas before arrival at a given MoU region.</li>
        </ul>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .port-grid { grid-template-columns: 1fr !important; }
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

const linkBtn: React.CSSProperties = { display: 'inline-block', background: '#0c1610', color: '#5aa6e8', border: '1px solid rgba(90,166,232,.3)', padding: '6px 11px', borderRadius: 3, fontFamily: rj, fontSize: 11, fontWeight: 700, textDecoration: 'none', cursor: 'pointer' };
const goldLink: React.CSSProperties = { display: 'inline-block', background: 'rgba(200,168,75,.1)', color: '#c8a84b', border: '1px solid rgba(200,168,75,.4)', padding: '6px 11px', borderRadius: 3, fontFamily: rj, fontSize: 11, fontWeight: 700, textDecoration: 'none', cursor: 'pointer' };

function chip(active: boolean): React.CSSProperties {
  return { padding: '5px 12px', background: active ? '#c8a84b' : 'transparent', color: active ? '#08100a' : '#7a8a72', border: `1px solid ${active ? '#c8a84b' : 'rgba(200,168,75,.25)'}`, fontFamily: rj, fontSize: 10, letterSpacing: '.5px', fontWeight: 700, cursor: 'pointer', borderRadius: 4, whiteSpace: 'nowrap' };
}
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#0c1610', border: '1px solid rgba(200,168,75,.12)', borderRadius: 3, padding: '8px 10px' }}>
      <div style={{ fontFamily: rj, fontSize: 9, color: '#7a8a72', letterSpacing: '.5px', textTransform: 'uppercase', fontWeight: 700 }}>{label}</div>
      <div style={{ fontFamily: rj, fontSize: 12.5, color: '#f5f0e8', fontWeight: 600, marginTop: 2 }}>{value}</div>
    </div>
  );
}
