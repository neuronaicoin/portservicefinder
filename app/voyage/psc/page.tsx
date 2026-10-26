'use client';
import { useState, useMemo } from 'react';
import {
  DEFICIENCIES,
  DEFICIENCY_CATEGORIES,
  MOUS,
  PLATFORMS,
  CICS,
  ACTION_CODES,
  searchDeficiencies,
  type DeficiencyCode,
  type CIC,
} from '@/lib/psc-data';

const lb = 'var(--font-display)';
const rj = 'var(--font-ui)';
const g = { color: 'var(--acc)' };

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

const RISK_COLORS = {
  low: 'var(--ink3)',
  medium: 'var(--warn)',
  high: 'var(--bad)',
  very_high: '#d44',
};

const RISK_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  very_high: 'Very High',
};

type Tab = 'codes' | 'mous' | 'cics' | 'actions';

export default function PSCSentryPage() {
  const [tab, setTab] = useState<Tab>('codes');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [selectedDef, setSelectedDef] = useState<DeficiencyCode | null>(null);
  const [vesselImo, setVesselImo] = useState('');

  const filtered = useMemo(() => {
    let results = search ? searchDeficiencies(search) : DEFICIENCIES;
    if (filterCategory !== 'all') {
      results = results.filter((d) => d.category === filterCategory);
    }
    if (filterRisk !== 'all') {
      results = results.filter((d) => d.detentionRisk === filterRisk);
    }
    return results.slice(0, 50);
  }, [search, filterCategory, filterRisk]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--acc)', fontWeight: 700, marginBottom: 8 }}>
          🔍 Voyage Hub · PSC Sentry
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Port State <em style={g}>Control</em> Reference
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.6, maxWidth: 720 }}>
          Deficiency code database, MoU inspection databases, action codes, and concentrated
          inspection campaigns. Built from public sources: IMO MEPC/MSC, Paris/Tokyo MoU, Equasis, GISIS.
        </p>
      </div>

      {/* Tab Selector */}
      <div className="psc-tabs" style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
        {[
          { key: 'codes' as Tab, label: '🔢 Deficiency Codes', count: DEFICIENCIES.length },
          { key: 'mous' as Tab, label: '🌍 MoU Databases', count: MOUS.length + PLATFORMS.length },
          { key: 'cics' as Tab, label: '🎯 CIC Campaigns', count: CICS.length },
          { key: 'actions' as Tab, label: '⚙️ Action Codes', count: ACTION_CODES.length },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              background: tab === t.key ? 'var(--acc)' : 'transparent',
              color: tab === t.key ? 'var(--bg)' : 'var(--ink3)',
              border: `1px solid ${tab === t.key ? 'var(--acc)' : 'color-mix(in srgb, var(--acc) 25%, transparent)'}`,
              padding: '9px 16px',
              fontFamily: rj,
              fontSize: 12,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              fontWeight: 700,
              cursor: 'pointer',
              borderRadius: 3,
            }}
          >
            {t.label} <span style={{ fontSize: 10, opacity: 0.7 }}>({t.count})</span>
          </button>
        ))}
      </div>

      {/* ====== DEFICIENCY CODES TAB ====== */}
      {tab === 'codes' && (
        <>
          {selectedDef ? (
            <DeficiencyDetail def={selectedDef} onBack={() => setSelectedDef(null)} />
          ) : (
            <>
              {/* Search bar */}
              <div style={card}>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="🔍 Search by code (e.g. 07120), description (fire), or convention (SOLAS)..."
                  style={{
                    width: '100%',
                    background: 'var(--bg2)',
                    border: '1px solid color-mix(in srgb, var(--acc) 30%, transparent)',
                    color: 'var(--ink)',
                    padding: '12px 14px',
                    fontFamily: rj,
                    fontSize: 14,
                    borderRadius: 3,
                    marginBottom: 12,
                  }}
                />

                <div className="filters" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    style={{
                      background: 'var(--bg2)',
                      border: '1px solid color-mix(in srgb, var(--acc) 20%, transparent)',
                      color: 'var(--ink)',
                      padding: '7px 10px',
                      fontFamily: rj,
                      fontSize: 12,
                      borderRadius: 3,
                      cursor: 'pointer',
                    }}
                  >
                    <option value="all">All Categories ({DEFICIENCY_CATEGORIES.length})</option>
                    {DEFICIENCY_CATEGORIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} — {c.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filterRisk}
                    onChange={(e) => setFilterRisk(e.target.value)}
                    style={{
                      background: 'var(--bg2)',
                      border: '1px solid color-mix(in srgb, var(--acc) 20%, transparent)',
                      color: 'var(--ink)',
                      padding: '7px 10px',
                      fontFamily: rj,
                      fontSize: 12,
                      borderRadius: 3,
                      cursor: 'pointer',
                    }}
                  >
                    <option value="all">All Risk Levels</option>
                    <option value="very_high">Very High Detention Risk</option>
                    <option value="high">High Detention Risk</option>
                    <option value="medium">Medium Detention Risk</option>
                    <option value="low">Low Detention Risk</option>
                  </select>

                  {(search || filterCategory !== 'all' || filterRisk !== 'all') && (
                    <button
                      onClick={() => {
                        setSearch('');
                        setFilterCategory('all');
                        setFilterRisk('all');
                      }}
                      style={{
                        background: 'transparent',
                        border: '1px solid color-mix(in srgb, var(--bad) 30%, transparent)',
                        color: 'var(--bad)',
                        padding: '7px 12px',
                        fontFamily: rj,
                        fontSize: 11,
                        cursor: 'pointer',
                        borderRadius: 3,
                      }}
                    >
                      ✕ Clear
                    </button>
                  )}
                </div>

                <p style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 10, fontFamily: rj }}>
                  Showing <strong style={{ color: 'var(--acc)' }}>{filtered.length}</strong> of {DEFICIENCIES.length} most common deficiency codes.
                </p>
              </div>

              {/* Results list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filtered.map((def) => {
                  const cat = DEFICIENCY_CATEGORIES.find((c) => c.code === def.category);
                  return (
                    <button
                      key={def.code}
                      onClick={() => setSelectedDef(def)}
                      style={{
                        background: 'var(--card)',
                        border: '1px solid color-mix(in srgb, var(--acc) 15%, transparent)',
                        padding: '14px 16px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        borderRadius: 4,
                        fontFamily: rj,
                        color: 'var(--ink)',
                        transition: 'all .2s ease',
                      }}
                      className="def-row"
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                        <div
                          style={{
                            background: 'color-mix(in srgb, var(--acc) 12%, transparent)',
                            color: 'var(--acc)',
                            padding: '4px 10px',
                            borderRadius: 3,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: 13,
                            flexShrink: 0,
                          }}
                        >
                          {def.code}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: lb, fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
                            {def.description}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--ink3)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <span>📂 {cat?.name || def.category}</span>
                            <span>📜 {def.convention}</span>
                          </div>
                        </div>
                        <div
                          style={{
                            background: `${RISK_COLORS[def.detentionRisk]}15`,
                            border: `1px solid ${RISK_COLORS[def.detentionRisk]}80`,
                            color: RISK_COLORS[def.detentionRisk],
                            padding: '4px 10px',
                            borderRadius: 3,
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: '.5px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {RISK_LABELS[def.detentionRisk]}
                        </div>
                      </div>
                    </button>
                  );
                })}

                {filtered.length === 0 && (
                  <div style={{ padding: 30, textAlign: 'center', color: 'var(--ink3)', fontSize: 13 }}>
                    No deficiency codes match your search.
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* ====== MOU DATABASES TAB ====== */}
      {tab === 'mous' && (
        <>
          {/* Quick vessel search */}
          <div style={card}>
            <div style={sectionTitle}>🚢 Quick Vessel Lookup</div>
            <p style={{ fontSize: 12, color: 'var(--ink2)', marginBottom: 12, fontFamily: rj }}>
              Enter IMO number to generate one-click search links across all PSC databases.
            </p>
            <input
              type="text"
              value={vesselImo}
              onChange={(e) => setVesselImo(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 9876543 (7-digit IMO)"
              style={{
                width: '100%',
                background: 'var(--bg2)',
                border: '1px solid color-mix(in srgb, var(--acc) 30%, transparent)',
                color: 'var(--ink)',
                padding: '10px 12px',
                fontFamily: rj,
                fontSize: 14,
                borderRadius: 3,
                maxWidth: 320,
              }}
            />
            {vesselImo && vesselImo.length === 7 && (
              <p style={{ fontSize: 11, color: 'var(--ok)', marginTop: 8, fontFamily: rj, fontWeight: 600 }}>
                ✓ IMO {vesselImo} — links below will be customized
              </p>
            )}
          </div>

          {/* Aggregator platforms */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontFamily: lb, fontSize: 18, fontWeight: 700, marginBottom: 14, color: 'var(--acc)' }}>
              🌍 Aggregator Platforms
            </h2>
            <div className="mou-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
              {PLATFORMS.map((p) => (
                <a
                  key={p.key}
                  href={p.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    style={{
                      background: 'linear-gradient(135deg,color-mix(in srgb, var(--acc) 5%, transparent),transparent)',
                      border: '1px solid color-mix(in srgb, var(--acc) 30%, transparent)',
                      padding: '18px 16px',
                      borderRadius: 4,
                      height: '100%',
                      transition: 'all .2s ease',
                      cursor: 'pointer',
                    }}
                    className="mou-card"
                  >
                    <div style={{ fontSize: 26, marginBottom: 8 }}>{p.region2}</div>
                    <div style={{ fontFamily: lb, fontSize: 16, fontWeight: 700, color: 'var(--acc)', marginBottom: 4 }}>
                      {p.name}
                    </div>
                    <div style={{ fontFamily: rj, fontSize: 10, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
                      {p.region}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--ink2)', lineHeight: 1.5, marginBottom: 10 }}>
                      {p.description}
                    </p>
                    <div style={{ fontFamily: rj, fontSize: 10.5, color: 'var(--acc)', fontWeight: 700, letterSpacing: '.5px' }}>
                      Open → {p.homepage.replace('https://', '').split('/')[0]}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Regional MoUs */}
          <h2 style={{ fontFamily: lb, fontSize: 18, fontWeight: 700, marginBottom: 14, color: 'var(--acc)' }}>
            ⚓ Regional MoU Inspection Databases
          </h2>
          <div className="mou-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
            {MOUS.map((mou) => (
              <div
                key={mou.key}
                style={{
                  background: 'var(--card)',
                  border: '1px solid color-mix(in srgb, var(--acc) 15%, transparent)',
                  padding: '18px 16px',
                  borderRadius: 4,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 22 }}>{mou.region2}</span>
                  <div>
                    <div style={{ fontFamily: lb, fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{mou.name}</div>
                    <div style={{ fontFamily: rj, fontSize: 10, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {mou.region}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: 11.5, color: 'var(--ink2)', lineHeight: 1.5, marginBottom: 12 }}>
                  {mou.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <a
                    href={mou.inspectionSearch}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'color-mix(in srgb, var(--acc) 10%, transparent)',
                      border: '1px solid color-mix(in srgb, var(--acc) 40%, transparent)',
                      color: 'var(--acc)',
                      padding: '7px 10px',
                      fontFamily: rj,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '.5px',
                      textDecoration: 'none',
                      borderRadius: 3,
                      display: 'block',
                    }}
                  >
                    🔍 Inspection Search →
                  </a>
                  <a
                    href={mou.detentionList}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'color-mix(in srgb, var(--bad) 6%, transparent)',
                      border: '1px solid color-mix(in srgb, var(--bad) 25%, transparent)',
                      color: 'var(--bad)',
                      padding: '7px 10px',
                      fontFamily: rj,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '.5px',
                      textDecoration: 'none',
                      borderRadius: 3,
                      display: 'block',
                    }}
                  >
                    ⛔ Detention List →
                  </a>
                  {mou.flagPerformance && (
                    <a
                      href={mou.flagPerformance}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: 'transparent',
                        border: '1px solid color-mix(in srgb, var(--acc) 20%, transparent)',
                        color: 'var(--ink3)',
                        padding: '7px 10px',
                        fontFamily: rj,
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: '.5px',
                        textDecoration: 'none',
                        borderRadius: 3,
                        display: 'block',
                      }}
                    >
                      🏴 Flag Performance List →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ ...card, background: 'color-mix(in srgb, var(--ink3) 5%, transparent)', borderColor: 'color-mix(in srgb, var(--ink3) 15%, transparent)', marginTop: 20 }}>
            <div style={{ fontFamily: rj, fontSize: 10.5, color: 'var(--ink3)', letterSpacing: '.5px', lineHeight: 1.7 }}>
              💡 <strong style={{ color: 'var(--acc)' }}>How to use:</strong>
              <br />
              • Click any link → opens official MoU/database in new tab.
              <br />
              • Enter vessel name or IMO number on the destination page.
              <br />
              • Equasis is the most comprehensive (aggregates 5+ MoUs).
              <br />• GISIS requires free registration but is the IMO official source.
            </div>
          </div>
        </>
      )}

      {/* ====== CIC CAMPAIGNS TAB ====== */}
      {tab === 'cics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {CICS.map((cic) => (
            <CICCard key={`${cic.year}-${cic.topic}`} cic={cic} />
          ))}
          <div style={{ ...card, background: 'color-mix(in srgb, var(--ink3) 5%, transparent)', borderColor: 'color-mix(in srgb, var(--ink3) 15%, transparent)' }}>
            <div style={{ fontFamily: rj, fontSize: 10.5, color: 'var(--ink3)', letterSpacing: '.5px', lineHeight: 1.7 }}>
              💡 <strong style={{ color: 'var(--acc)' }}>About CIC:</strong> Each year, Paris MoU and Tokyo MoU
              run a joint Concentrated Inspection Campaign focused on a specific area. Vessels calling
              at member ports during the campaign period (Sep 1 – Nov 30) receive enhanced inspection
              on the chosen topic. Self-check checklists above help prepare.
            </div>
          </div>
        </div>
      )}

      {/* ====== ACTION CODES TAB ====== */}
      {tab === 'actions' && (
        <div style={card}>
          <div style={sectionTitle}>⚙️ PSC Action Codes Reference</div>
          <p style={{ fontSize: 12, color: 'var(--ink2)', marginBottom: 14, fontFamily: rj }}>
            Standard action codes used by PSC officers globally to indicate required corrective action.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ACTION_CODES.map((a) => (
              <div
                key={a.code}
                style={{
                  background: 'var(--bg2)',
                  border: '1px solid color-mix(in srgb, var(--acc) 15%, transparent)',
                  padding: '12px 14px',
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <div
                  style={{
                    background: a.code === '30' || a.code === '40' ? 'color-mix(in srgb, var(--bad) 15%, transparent)' : 'color-mix(in srgb, var(--acc) 12%, transparent)',
                    color: a.code === '30' || a.code === '40' ? 'var(--bad)' : 'var(--acc)',
                    padding: '6px 14px',
                    borderRadius: 3,
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: 14,
                    minWidth: 50,
                    textAlign: 'center',
                  }}
                >
                  {a.code}
                </div>
                <div style={{ fontFamily: rj, fontSize: 13, color: 'var(--ink)' }}>{a.desc}</div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 16,
              padding: '12px 14px',
              background: 'color-mix(in srgb, var(--bad) 5%, transparent)',
              border: '1px solid color-mix(in srgb, var(--bad) 20%, transparent)',
              borderRadius: 3,
              fontSize: 11.5,
              color: 'var(--bad)',
              fontFamily: rj,
              fontWeight: 600,
              lineHeight: 1.6,
            }}
          >
            ⚠ <strong>Codes 30 & 40</strong> = Detention / Refusal of Access. Major impact: notify
            Owner, Charterer, P&I Club, and Flag State immediately. Engage RO/Class for rectification plan.
          </div>
        </div>
      )}

      {/* Footer info */}
      <div style={{ marginTop: 20, padding: '14px 16px', background: 'color-mix(in srgb, var(--acc) 4%, transparent)', border: '1px solid color-mix(in srgb, var(--acc) 12%, transparent)', borderRadius: 4, fontFamily: rj, fontSize: 11, color: 'var(--ink3)', lineHeight: 1.7, letterSpacing: '.5px' }}>
        <strong style={{ color: 'var(--acc)' }}>Sources:</strong> IMO MEPC/MSC public deficiency code lists, Paris MoU and Tokyo MoU PSC manuals (public domain), Equasis methodology, GISIS Module 4.
        <br />
        <strong style={{ color: 'var(--acc)' }}>Disclaimer:</strong> This is a reference tool. Specific
        inspection outcomes depend on PSC officer assessment, vessel condition, and applicable regulations.
        Always consult the latest official MoU & flag state guidance.
      </div>

      <style>{`
        @media (max-width: 720px) {
          .mou-grid { grid-template-columns: 1fr !important; }
          .filters { flex-direction: column !important; }
          .filters select, .filters button { width: 100% !important; }
          .psc-tabs button { font-size: 10.5px !important; padding: 7px 11px !important; }
        }
        .def-row:hover { border-color: var(--acc) !important; transform: translateX(3px); }
        .mou-card:hover { border-color: var(--acc) !important; transform: translateY(-2px); box-shadow: 0 4px 12px color-mix(in srgb, var(--acc) 15%, transparent); }
      `}</style>
    </div>
  );
}

// ============================================================
// DEFICIENCY DETAIL VIEW
// ============================================================
function DeficiencyDetail({ def, onBack }: { def: DeficiencyCode; onBack: () => void }) {
  const cat = DEFICIENCY_CATEGORIES.find((c) => c.code === def.category);
  return (
    <div>
      <button
        onClick={onBack}
        style={{
          background: 'transparent',
          border: '1px solid color-mix(in srgb, var(--acc) 30%, transparent)',
          color: 'var(--acc)',
          padding: '8px 14px',
          fontFamily: rj,
          fontSize: 11,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          fontWeight: 700,
          cursor: 'pointer',
          borderRadius: 3,
          marginBottom: 16,
        }}
      >
        ← Back to list
      </button>

      <div style={{ ...card, padding: '24px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
          <div
            style={{
              background: 'color-mix(in srgb, var(--acc) 15%, transparent)',
              color: 'var(--acc)',
              padding: '8px 16px',
              borderRadius: 4,
              fontFamily: 'monospace',
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            {def.code}
          </div>
          <div
            style={{
              background: `${RISK_COLORS[def.detentionRisk]}15`,
              border: `1px solid ${RISK_COLORS[def.detentionRisk]}80`,
              color: RISK_COLORS[def.detentionRisk],
              padding: '6px 14px',
              borderRadius: 3,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '.5px',
            }}
          >
            {RISK_LABELS[def.detentionRisk]} Detention Risk
          </div>
        </div>

        <h2 style={{ fontFamily: lb, fontSize: 22, fontWeight: 700, lineHeight: 1.2, marginBottom: 18, color: 'var(--ink)' }}>
          {def.description}
        </h2>

        <DetailRow label="Category" value={`${def.category} — ${cat?.name || ''}`} />
        <DetailRow label="Subcategory" value={def.subcategory} />
        <DetailRow label="Regulation" value={def.convention} />
        <DetailRow label="Typical Action" value={def.typicalAction} highlight />
        <DetailRow label="Rectification" value={def.rectification} />
      </div>

      {/* Action Code helper */}
      <div style={{ ...card, background: 'color-mix(in srgb, var(--acc) 4%, transparent)' }}>
        <div style={sectionTitle}>⚙️ Most Common Actions for this Risk Level</div>
        <p style={{ fontSize: 12.5, color: 'var(--ink2)', lineHeight: 1.6 }}>
          {def.detentionRisk === 'very_high' && (
            <>
              <strong style={{ color: 'var(--bad)' }}>Code 30 — Detention</strong> is likely if not
              addressed before PSC inspection. Engage Flag/RO immediately. Notify Owner, Manager,
              Charterer, and P&I Club.
            </>
          )}
          {def.detentionRisk === 'high' && (
            <>
              <strong style={{ color: 'var(--warn)' }}>Code 17 or 21</strong> typical — rectify within
              14 days or before departure. Document rectification with photos and signed checklist.
            </>
          )}
          {def.detentionRisk === 'medium' && (
            <>
              <strong style={{ color: 'var(--warn)' }}>Code 17</strong> typical — rectify within 14 days.
              Inform DPA and update SMS records.
            </>
          )}
          {def.detentionRisk === 'low' && (
            <>
              <strong style={{ color: 'var(--ink3)' }}>Code 15 or 17</strong> — rectify at next port or
              within 14 days. Log in SMS non-conformity register.
            </>
          )}
        </p>
      </div>

      <div style={{ ...card, background: 'color-mix(in srgb, var(--ink3) 5%, transparent)', borderColor: 'color-mix(in srgb, var(--ink3) 15%, transparent)' }}>
        <div style={{ fontFamily: rj, fontSize: 11, color: 'var(--ink3)', lineHeight: 1.7 }}>
          📌 <strong style={{ color: 'var(--acc)' }}>Best practice:</strong> Document everything. Take
          photos before/after rectification. Maintain ISM non-conformity reports. Cross-check with
          class records. Notify Manager and DPA per ISM Code.
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      style={{
        padding: '12px 0',
        borderBottom: '1px dashed color-mix(in srgb, var(--acc) 12%, transparent)',
        display: 'grid',
        gridTemplateColumns: '160px 1fr',
        gap: 14,
      }}
      className="detail-row"
    >
      <div
        style={{
          fontFamily: rj,
          fontSize: 10.5,
          color: 'var(--ink3)',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 13, color: highlight ? 'var(--acc)' : 'var(--ink)', fontWeight: highlight ? 600 : 400, lineHeight: 1.6 }}>
        {value}
      </div>
    </div>
  );
}

// ============================================================
// CIC CARD
// ============================================================
function CICCard({ cic }: { cic: CIC }) {
  const now = new Date();
  const year = now.getFullYear();
  const isActive = cic.year === year;
  const isPast = cic.year < year;
  const isUpcoming = cic.year > year;

  let badgeColor = 'var(--ink3)';
  let badgeText = 'PAST';
  if (isActive) {
    badgeColor = 'var(--ok)';
    badgeText = 'ACTIVE';
  } else if (isUpcoming) {
    badgeColor = 'var(--acc)';
    badgeText = 'UPCOMING';
  }

  return (
    <div
      style={{
        ...card,
        background: isActive ? 'linear-gradient(135deg,color-mix(in srgb, var(--ok) 6%, transparent),transparent)' : undefined,
        borderColor: isActive ? 'color-mix(in srgb, var(--ok) 40%, transparent)' : undefined,
        padding: '20px 18px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontFamily: rj, fontSize: 11, color: 'var(--ink3)', letterSpacing: '1px', marginBottom: 4 }}>
            CIC {cic.year} · {cic.mous.join(' + ')}
          </div>
          <h3 style={{ fontFamily: lb, fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>
            {cic.topic}
          </h3>
          <div style={{ fontSize: 11.5, color: 'var(--acc)', fontFamily: rj, fontWeight: 600 }}>📅 {cic.period}</div>
        </div>
        <div
          style={{
            background: `${badgeColor}15`,
            border: `1px solid ${badgeColor}80`,
            color: badgeColor,
            padding: '5px 12px',
            borderRadius: 3,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '1px',
            whiteSpace: 'nowrap',
          }}
        >
          {badgeText}
        </div>
      </div>

      <p style={{ fontSize: 12.5, color: 'var(--ink2)', lineHeight: 1.6, marginBottom: 14 }}>
        <strong style={{ color: 'var(--acc)' }}>Focus:</strong> {cic.focus}
      </p>

      <div>
        <div style={{ fontFamily: rj, fontSize: 11, color: 'var(--acc)', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>
          ✓ Self-Check Checklist
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {cic.checklistItems.map((item, i) => (
            <li
              key={i}
              style={{
                fontSize: 12,
                color: 'var(--ink2)',
                paddingLeft: 24,
                position: 'relative',
                lineHeight: 1.5,
              }}
            >
              <span style={{ position: 'absolute', left: 0, top: 0, color: 'var(--acc)', fontWeight: 700 }}>☐</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
