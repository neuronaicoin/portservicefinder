'use client';
import { useState, useMemo } from 'react';
import { CARGOES, CARGO_CATEGORIES, M3MT_TO_FT3LT, type Cargo, type ImsbcGroup } from '@/lib/cargo-data';

const lb = 'var(--font-display)';
const rj = 'var(--font-ui)';
const g = { color: 'var(--acc)' } as React.CSSProperties;

// ============================================================
// STYLES
// ============================================================
const card: React.CSSProperties = {
  background: 'var(--card)',
  border: '1px solid color-mix(in srgb, var(--acc) 18%, transparent)',
  padding: '20px 18px',
  borderRadius: 4,
  marginBottom: 16,
};
const sectionTitle: React.CSSProperties = {
  fontFamily: rj,
  fontSize: 11,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: 'var(--acc)',
  fontWeight: 700,
  marginBottom: 14,
  paddingBottom: 8,
  borderBottom: '1px solid color-mix(in srgb, var(--acc) 12%, transparent)',
};
const label: React.CSSProperties = {
  display: 'block',
  fontFamily: rj,
  fontSize: 10,
  letterSpacing: '.5px',
  textTransform: 'uppercase',
  color: 'var(--ink3)',
  fontWeight: 600,
  marginBottom: 4,
};
const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg2)',
  border: '1px solid color-mix(in srgb, var(--acc) 20%, transparent)',
  color: 'var(--ink)',
  padding: '8px 10px',
  fontFamily: rj,
  fontSize: 13,
  fontWeight: 500,
  borderRadius: 3,
  boxSizing: 'border-box',
};

// ============================================================
// IMSBC group badge
// ============================================================
function groupBadge(group: ImsbcGroup): { label: string; color: string; bg: string; title: string } {
  switch (group) {
    case 'A':
      return { label: 'A', color: 'var(--bad)', bg: 'color-mix(in srgb, var(--bad) 14%, transparent)', title: 'Group A — may liquefy' };
    case 'B':
      return { label: 'B', color: 'var(--warn)', bg: 'color-mix(in srgb, var(--warn) 14%, transparent)', title: 'Group B — chemical hazard' };
    case 'A&B':
      return { label: 'A&B', color: 'var(--bad)', bg: 'color-mix(in srgb, var(--bad) 14%, transparent)', title: 'Group A&B — liquefies AND chemical hazard' };
    case 'C':
      return { label: 'C', color: 'var(--ok)', bg: 'color-mix(in srgb, var(--ok) 14%, transparent)', title: 'Group C — no special hazard' };
    default:
      return { label: 'GEN', color: 'var(--info)', bg: 'color-mix(in srgb, var(--info) 14%, transparent)', title: 'General / break bulk' };
  }
}

function fmt(n: number, dec = 2): string {
  if (!isFinite(n)) return '–';
  return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

// ============================================================
// COMPONENT
// ============================================================
export default function CargoDatabasePage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Cargo | null>(null);

  // Hold volume calculator
  const [calcMode, setCalcMode] = useState<'qty' | 'vol'>('qty');
  const [calcSf, setCalcSf] = useState('');
  const [calcQty, setCalcQty] = useState('');
  const [calcVol, setCalcVol] = useState('');
  const [brokenStowage, setBrokenStowage] = useState('0');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CARGOES.filter((c) => {
      if (category !== 'all' && c.category !== category) return false;
      if (groupFilter !== 'all' && c.group !== groupFilter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (c.unNo ? c.unNo.includes(q) : false) ||
        c.hazards.some((h) => h.toLowerCase().includes(q))
      );
    });
  }, [query, category, groupFilter]);

  // calculator
  const calcResult = useMemo(() => {
    const sf = parseFloat(calcSf) || 0;
    const bs = (parseFloat(brokenStowage) || 0) / 100;
    if (sf <= 0) return null;
    if (calcMode === 'qty') {
      const qty = parseFloat(calcQty) || 0;
      const grossVol = qty * sf * (1 + bs);
      return { kind: 'vol' as const, value: grossVol };
    } else {
      const vol = parseFloat(calcVol) || 0;
      const usableVol = vol / (1 + bs);
      const qty = sf > 0 ? usableVol / sf : 0;
      return { kind: 'qty' as const, value: qty };
    }
  }, [calcMode, calcSf, calcQty, calcVol, brokenStowage]);

  function useCargoInCalc(c: Cargo) {
    const midSf = (c.sfMin + c.sfMax) / 2;
    setCalcSf(midSf.toFixed(3));
    setSelected(c);
  }

  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = { A: 0, B: 0, 'A&B': 0, C: 0, GENERAL: 0 };
    CARGOES.forEach((c) => { counts[c.group] = (counts[c.group] || 0) + 1; });
    return counts;
  }, []);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--acc)', fontWeight: 700, marginBottom: 8 }}>
          ⚓ Voyage Hub · Cargo Database
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Cargo <em style={g}>Database</em>
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.6, maxWidth: 720 }}>
          Stowage factors, IMSBC groups, hazards and carriage notes for {CARGOES.length}+ solid bulk
          and break-bulk cargoes. Plus a hold-volume calculator. Always verify against the shipper&apos;s
          declaration and the vessel&apos;s cargo documents.
        </p>
      </div>

      {/* IMSBC legend */}
      <div style={{ ...card, padding: '14px 16px' }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', fontFamily: rj, fontSize: 11.5, color: 'var(--ink2)' }}>
          <span style={{ color: 'var(--acc)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontSize: 10 }}>IMSBC Groups:</span>
          <span><b style={{ color: 'var(--bad)' }}>A</b> — may liquefy ({groupCounts['A']})</span>
          <span><b style={{ color: 'var(--warn)' }}>B</b> — chemical hazard ({groupCounts['B']})</span>
          <span><b style={{ color: 'var(--bad)' }}>A&amp;B</b> — both ({groupCounts['A&B']})</span>
          <span><b style={{ color: 'var(--ok)' }}>C</b> — no special hazard ({groupCounts['C']})</span>
          <span><b style={{ color: 'var(--info)' }}>GEN</b> — break bulk ({groupCounts['GENERAL']})</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div style={card}>
        <div style={sectionTitle}>🔍 Search &amp; Filter</div>
        <div style={{ marginBottom: 12 }}>
          <label style={label}>Search — name, UN no, or hazard</label>
          <input style={inputStyle} type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. iron ore, nickel, 1942, liquefaction" />
        </div>
        <div className="cargo-filters" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
          <div>
            <label style={label}>Category</label>
            <select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">All categories</option>
              {CARGO_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={label}>IMSBC Group</label>
            <select style={inputStyle} value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)}>
              <option value="all">All groups</option>
              <option value="A">A — liquefiable</option>
              <option value="B">B — chemical hazard</option>
              <option value="A&B">A&amp;B — both</option>
              <option value="C">C — no special hazard</option>
              <option value="GENERAL">General / break bulk</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: 10, fontFamily: rj, fontSize: 11, color: 'var(--ink3)' }}>
          {filtered.length} cargo{filtered.length !== 1 ? 'es' : ''} shown
        </div>
      </div>

      {/* Cargo list */}
      <div className="cargo-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 16 }}>
        {filtered.map((c) => {
          const b = groupBadge(c.group);
          const isSel = selected?.name === c.name;
          return (
            <div
              key={c.name}
              onClick={() => setSelected(isSel ? null : c)}
              style={{
                background: isSel ? 'color-mix(in srgb, var(--acc) 6%, transparent)' : 'var(--card)',
                border: `1px solid ${isSel ? 'color-mix(in srgb, var(--acc) 50%, transparent)' : 'color-mix(in srgb, var(--acc) 15%, transparent)'}`,
                padding: '14px 14px',
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'all .2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ fontFamily: lb, fontSize: 15, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.2 }}>{c.name}</div>
                <span title={b.title} style={{ flexShrink: 0, fontSize: 10, background: b.bg, color: b.color, padding: '2px 7px', borderRadius: 3, fontFamily: rj, fontWeight: 700, letterSpacing: '.5px', border: `1px solid ${b.color}40` }}>
                  {b.label}
                </span>
              </div>
              <div style={{ fontFamily: rj, fontSize: 10.5, color: 'var(--ink3)', marginTop: 2, letterSpacing: '.5px' }}>{c.category}</div>

              <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 9, color: 'var(--ink3)', fontFamily: rj, letterSpacing: '.5px', textTransform: 'uppercase' }}>Stowage Factor</div>
                  <div style={{ fontFamily: rj, fontSize: 13, color: 'var(--acc)', fontWeight: 700 }}>{fmt(c.sfMin, 2)}–{fmt(c.sfMax, 2)} <span style={{ fontSize: 10, color: 'var(--ink3)' }}>m³/MT</span></div>
                  <div style={{ fontFamily: rj, fontSize: 10, color: 'var(--ink3)' }}>{fmt(c.sfMin * M3MT_TO_FT3LT, 1)}–{fmt(c.sfMax * M3MT_TO_FT3LT, 1)} ft³/LT</div>
                </div>
                {c.angleOfRepose != null && (
                  <div>
                    <div style={{ fontSize: 9, color: 'var(--ink3)', fontFamily: rj, letterSpacing: '.5px', textTransform: 'uppercase' }}>Angle of Repose</div>
                    <div style={{ fontFamily: rj, fontSize: 13, color: 'var(--ink)', fontWeight: 700 }}>~{c.angleOfRepose}°</div>
                  </div>
                )}
                {c.unNo && (
                  <div>
                    <div style={{ fontSize: 9, color: 'var(--ink3)', fontFamily: rj, letterSpacing: '.5px', textTransform: 'uppercase' }}>UN No.</div>
                    <div style={{ fontFamily: rj, fontSize: 13, color: 'var(--warn)', fontWeight: 700 }}>{c.unNo}</div>
                  </div>
                )}
              </div>

              {/* hazards */}
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 10 }}>
                {c.hazards.map((h) => (
                  <span key={h} style={{ fontSize: 9.5, background: 'var(--bg2)', color: 'var(--ink2)', padding: '2px 7px', borderRadius: 3, fontFamily: rj, border: '1px solid color-mix(in srgb, var(--acc) 12%, transparent)' }}>{h}</span>
                ))}
              </div>

              {/* expanded care */}
              {isSel && (
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed color-mix(in srgb, var(--acc) 18%, transparent)' }}>
                  <div style={{ fontSize: 9, color: 'var(--acc)', fontFamily: rj, letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: 5 }}>Carriage &amp; Care</div>
                  <p style={{ fontSize: 12, color: 'var(--ink2)', lineHeight: 1.6, fontFamily: rj }}>{c.care}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); useCargoInCalc(c); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }}
                    style={{ marginTop: 10, background: 'transparent', color: 'var(--acc)', border: '1px solid color-mix(in srgb, var(--acc) 40%, transparent)', padding: '6px 12px', fontFamily: rj, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 3 }}
                  >
                    ↓ Use in Hold Calculator
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ ...card, textAlign: 'center', color: 'var(--ink3)', fontFamily: rj }}>
          No cargo matches your search. Try a different name or clear filters.
        </div>
      )}

      {/* Hold Volume Calculator */}
      <div style={{ ...card, background: 'linear-gradient(135deg,color-mix(in srgb, var(--acc) 8%, transparent),transparent)', borderColor: 'color-mix(in srgb, var(--acc) 40%, transparent)' }}>
        <div style={sectionTitle}>⚖️ Hold Volume Calculator</div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <button
            onClick={() => setCalcMode('qty')}
            style={{ flex: 1, padding: '8px', background: calcMode === 'qty' ? 'var(--acc)' : 'transparent', color: calcMode === 'qty' ? 'var(--bg)' : 'var(--ink3)', border: `1px solid ${calcMode === 'qty' ? 'var(--acc)' : 'color-mix(in srgb, var(--acc) 25%, transparent)'}`, fontFamily: rj, fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 }}
          >
            Qty → Volume needed
          </button>
          <button
            onClick={() => setCalcMode('vol')}
            style={{ flex: 1, padding: '8px', background: calcMode === 'vol' ? 'var(--acc)' : 'transparent', color: calcMode === 'vol' ? 'var(--bg)' : 'var(--ink3)', border: `1px solid ${calcMode === 'vol' ? 'var(--acc)' : 'color-mix(in srgb, var(--acc) 25%, transparent)'}`, fontFamily: rj, fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 }}
          >
            Volume → Max cargo
          </button>
        </div>

        <div className="cargo-filters" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          <div>
            <label style={label}>Stowage Factor — m³/MT</label>
            <input style={inputStyle} type="number" step="0.001" value={calcSf} onChange={(e) => setCalcSf(e.target.value)} placeholder="0.450" />
            {selected && <span style={{ fontSize: 9.5, color: 'var(--ink3)', fontFamily: rj }}>from {selected.name} (avg)</span>}
          </div>
          {calcMode === 'qty' ? (
            <div>
              <label style={label}>Cargo Quantity — MT</label>
              <input style={inputStyle} type="number" step="1" value={calcQty} onChange={(e) => setCalcQty(e.target.value)} placeholder="170000" />
            </div>
          ) : (
            <div>
              <label style={label}>Available Hold Volume — m³</label>
              <input style={inputStyle} type="number" step="1" value={calcVol} onChange={(e) => setCalcVol(e.target.value)} placeholder="180000" />
            </div>
          )}
          <div>
            <label style={label}>Broken Stowage — %</label>
            <input style={inputStyle} type="number" step="1" value={brokenStowage} onChange={(e) => setBrokenStowage(e.target.value)} placeholder="0" />
            <span style={{ fontSize: 9.5, color: 'var(--ink3)', fontFamily: rj }}>void space allowance</span>
          </div>
        </div>

        {calcResult && (
          <div style={{ marginTop: 14, padding: '14px 16px', background: 'var(--bg2)', border: '1px solid color-mix(in srgb, var(--acc) 40%, transparent)', borderRadius: 4, textAlign: 'center' }}>
            <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink3)', fontWeight: 700 }}>
              {calcResult.kind === 'vol' ? 'Hold Volume Required' : 'Maximum Cargo Loadable'}
            </div>
            <div style={{ fontFamily: lb, fontSize: 30, fontWeight: 700, color: 'var(--acc)', marginTop: 4 }}>
              {fmt(calcResult.value, calcResult.kind === 'vol' ? 0 : 1)} <span style={{ fontSize: 16, color: 'var(--ink3)' }}>{calcResult.kind === 'vol' ? 'm³' : 'MT'}</span>
            </div>
            {calcResult.kind === 'vol' && (
              <div style={{ fontFamily: rj, fontSize: 11, color: 'var(--ink3)', marginTop: 4 }}>
                ≈ {fmt(calcResult.value * 35.3147, 0)} ft³
              </div>
            )}
          </div>
        )}

        <p style={{ fontSize: 10.5, color: 'var(--ink3)', fontFamily: rj, marginTop: 12, lineHeight: 1.5 }}>
          Volume needed = Quantity × SF × (1 + broken stowage). Max cargo = (Volume ÷ (1 + broken stowage)) ÷ SF.
          Broken stowage accounts for void space; for trimmed bulk it is near 0%, for bagged/break-bulk it can be 10–25%.
        </p>
      </div>

      {/* Reference */}
      <div style={{ ...card, background: 'color-mix(in srgb, var(--ink3) 5%, transparent)', borderColor: 'color-mix(in srgb, var(--ink3) 15%, transparent)' }}>
        <div style={sectionTitle}>📖 Reference Notes</div>
        <ul style={{ fontSize: 11.5, color: 'var(--ink2)', lineHeight: 1.7, paddingLeft: 18, fontFamily: rj }}>
          <li><b style={{ color: 'var(--bad)' }}>Group A</b> — cargoes that may liquefy if moisture exceeds the Transportable Moisture Limit (TML). Verify TML/MC certificate; carry out a can-test if in doubt.</li>
          <li><b style={{ color: 'var(--warn)' }}>Group B</b> — cargoes with a chemical hazard (self-heating, gas emission, oxygen depletion, oxidizing, corrosive, etc.).</li>
          <li><b style={{ color: 'var(--ok)' }}>Group C</b> — cargoes that are neither liquefiable nor chemically hazardous (but may still be dusty, heavy, or abrasive).</li>
          <li>Stowage factor (SF) is volume occupied per unit weight: m³/MT. Multiply by ~35.88 for ft³/LT.</li>
          <li>Figures are typical ranges from the IMSBC Code and standard references — the shipper&apos;s declaration and vessel cargo documents always govern.</li>
        </ul>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .cargo-grid { grid-template-columns: 1fr !important; }
          .cargo-filters { grid-template-columns: 1fr !important; }
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
