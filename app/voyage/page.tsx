'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { countAll } from '@/lib/voyage-storage';

const lb = "'Libre Bodoni', serif";
const rj = "'Rajdhani', sans-serif";
const g = { color: '#c8a84b', fontStyle: 'italic' };

interface Tool {
  href: string;
  icon: string;
  title: string;
  desc: string;
  status?: 'ready' | 'soon' | 'beta' | 'ai';
}

interface Category {
  title: string;
  desc: string;
  icon: string;
  tools: Tool[];
}

const CATEGORIES: Category[] = [
  {
    title: 'Voyage Planning',
    desc: 'Plan routes, calculate distances, estimate fuel and time.',
    icon: '🗺️',
    tools: [
      { href: '/voyage/planner', icon: '🧭', title: 'AI Route Optimizer', desc: 'Best route with weather, fuel & constraints.', status: 'ai' },
      { href: '/voyage/distance', icon: '📏', title: 'Distance Calculator', desc: 'Port-to-port distance & ETA in seconds.', status: 'ready' },
      { href: '/voyage/bunker-plan', icon: '⛽', title: 'Bunker Planner', desc: 'ROB management — delivery to redelivery.', status: 'ready' },
      { href: '/voyage/weather', icon: '🌊', title: 'Weather Windows', desc: 'Best departure time for your route.', status: 'soon' },
    ],
  },
  {
    title: 'Performance & Claims',
    desc: 'Track voyages, analyze performance, generate claim reports.',
    icon: '📊',
    tools: [
      { href: '/voyage/tracker', icon: '📈', title: 'Voyage Tracker', desc: 'Daily reports + auto performance analysis.', status: 'ready' },
      { href: '/voyage/bunker', icon: '⚡', title: 'CP Performance', desc: 'CP vs Actual — speed & consumption claims.', status: 'ready' },
      { href: '/voyage/noon', icon: '📝', title: 'Noon Report Manager', desc: 'Auto-process daily noon reports.', status: 'soon' },
      { href: '/voyage/claims', icon: '⚖️', title: 'Claims Center', desc: 'Demurrage, off-hire, speed/consumption.', status: 'soon' },
    ],
  },
  {
    title: 'Port Operations',
    desc: 'Everything about ports — info, tides, agents, congestion.',
    icon: '🏴',
    tools: [
      { href: '/voyage/ports', icon: '🌍', title: 'Port Database', desc: '3,700+ ports worldwide with full specs.', status: 'ready' },
      { href: '/voyage/tide', icon: '🌊', title: 'Tide Tables', desc: 'Tides, currents, berthing windows.', status: 'soon' },
      { href: '/voyage/disbursement', icon: '💰', title: 'Disbursement Tracker', desc: 'DA estimate vs final cost tracker.', status: 'soon' },
      { href: '/voyage/congestion', icon: '⚓', title: 'Port Congestion', desc: 'Live waiting times from AIS data.', status: 'soon' },
      { href: '/voyage/holidays', icon: '📅', title: 'Holidays Calendar', desc: 'Per-port holidays for SHEX calc.', status: 'soon' },
    ],
  },
  {
    title: 'Compliance & Safety',
    desc: 'Stay compliant — CII, EU ETS, PSC, MARPOL, MLC.',
    icon: '🛂',
    tools: [
      { href: '/voyage/cii', icon: '🌍', title: 'CII Calculator', desc: 'Carbon Intensity Indicator — A to E rating.', status: 'ready' },
      { href: '/voyage/ets', icon: '🌫️', title: 'EU ETS / FuelEU', desc: 'Allowance cost & FuelEU compliance.', status: 'ready' },
      { href: '/voyage/psc', icon: '🔍', title: 'PSC Sentry', desc: 'MoU search, deficiency codes, CIC tracker.', status: 'ready' },
      { href: '/voyage/marpol', icon: '🛢️', title: 'MARPOL Tracker', desc: 'Annex I-VI compliance & records.', status: 'soon' },
      { href: '/voyage/incidents', icon: '⚠️', title: 'Incident Log', desc: 'Near miss & accident reporting.', status: 'soon' },
      { href: '/voyage/drills', icon: '🚨', title: 'Drill Tracker', desc: 'SOLAS-mandated drill schedule & log.', status: 'soon' },
    ],
  },
  {
    title: 'Charter & Commercial',
    desc: 'Charter party, hire, TCE, freight calculations.',
    icon: '📋',
    tools: [
      { href: '/voyage/tce', icon: '💵', title: 'TCE Calculator', desc: 'Time charter equivalent + Worldscale.', status: 'ready' },
      { href: '/voyage/laytime', icon: '⏱️', title: 'Laytime / Demurrage', desc: 'Auto SoF & demurrage statements.', status: 'ready' },
      { href: '/voyage/hire', icon: '📊', title: 'Hire Statement', desc: 'Time charter hire calc + bunker.', status: 'ready' },
      { href: '/voyage/cp', icon: '📜', title: 'CP Manager (AI)', desc: 'Upload CP — AI extracts terms.', status: 'ai' },
    ],
  },
  {
    title: 'Cargo & Stowage',
    desc: 'Cargo planning, stowage, draft survey, lashing.',
    icon: '📦',
    tools: [
      { href: '/voyage/draft', icon: '⚓', title: 'Draft Survey', desc: 'Cargo weight from draft readings.', status: 'ready' },
      { href: '/voyage/cargo', icon: '📦', title: 'Cargo Database', desc: '300+ stowage factors + compatibility.', status: 'soon' },
      { href: '/voyage/stability', icon: '⚖️', title: 'Stability Check', desc: 'Quick trim & stability calculator.', status: 'soon' },
      { href: '/voyage/lashing', icon: '🔗', title: 'Lashing Calculator', desc: 'Heavy weather cargo securing.', status: 'soon' },
    ],
  },
  {
    title: 'Crew & HR',
    desc: 'Crew management, certificates, MLC compliance.',
    icon: '👥',
    tools: [
      { href: '/voyage/crew', icon: '👥', title: 'Crew Matrix', desc: 'Rank, contract, certificates tracking.', status: 'soon' },
      { href: '/voyage/mlc', icon: '📋', title: 'MLC Compliance', desc: 'Rest hours, wages, complaint handling.', status: 'soon' },
      { href: '/voyage/wages', icon: '💵', title: 'Wage Calculator', desc: 'ITF benchmarks by rank/nationality.', status: 'soon' },
      { href: '/voyage/visa', icon: '🛂', title: 'Visa Requirements', desc: 'Crew visa per nationality + port.', status: 'soon' },
    ],
  },
  {
    title: 'Vessel & Maintenance',
    desc: 'Vessel database, maintenance, drydock, spares.',
    icon: '🔧',
    tools: [
      { href: '/voyage/vessel', icon: '🚢', title: 'Vessel Database', desc: 'Search by IMO — particulars & history.', status: 'ready' },
      { href: '/voyage/drydock', icon: '🏗️', title: 'Drydock Planner', desc: '5-yearly survey + shipyard finder.', status: 'soon' },
      { href: '/voyage/maintenance', icon: '🔧', title: 'PMS Mini', desc: 'Maintenance schedule + work orders.', status: 'soon' },
      { href: '/voyage/spares', icon: '📦', title: 'Spares Inventory', desc: 'Critical spares & supplier tracking.', status: 'soon' },
    ],
  },
  {
    title: 'Documents & Records',
    desc: 'Auto-generate maritime documents and reports.',
    icon: '📄',
    tools: [
      { href: '/voyage/documents', icon: '📝', title: 'Document Generator', desc: 'NOR, SOF, LOI, LOP — auto-fill.', status: 'ready' },
      { href: '/voyage/vault', icon: '🗄️', title: 'Document Vault', desc: 'Certificates with expiry alerts.', status: 'soon' },
      { href: '/voyage/photos', icon: '📸', title: 'Photo Archive', desc: 'GPS-tagged vessel photos.', status: 'soon' },
      { href: '/voyage/diary', icon: '📖', title: 'Voyage Diary', desc: 'Ops log + shareable summaries.', status: 'soon' },
    ],
  },
  {
    title: 'AI & Intelligence',
    desc: 'AI-powered tools — your maritime co-pilot.',
    icon: '🤖',
    tools: [
      { href: '/voyage/assistant', icon: '🤖', title: 'AI Assistant', desc: 'Ask anything: CP, weather, regulations.', status: 'ai' },
      { href: '/voyage/cp', icon: '📜', title: 'AI CP Reader', desc: 'Upload CP — AI extracts key terms.', status: 'ai' },
      { href: '/voyage/email-ai', icon: '✉️', title: 'Email Assistant', desc: 'AI drafts demurrage, LOP, etc.', status: 'ai' },
      { href: '/voyage/insights', icon: '💡', title: 'Smart Insights', desc: 'AI analyzes your voyage trends.', status: 'ai' },
    ],
  },
  {
    title: 'Fleet Operations',
    desc: 'Multi-vessel dashboard, team collaboration.',
    icon: '🎛️',
    tools: [
      { href: '/voyage/fleet', icon: '🎛️', title: 'Fleet Dashboard', desc: 'All vessels — one screen.', status: 'soon' },
      { href: '/voyage/ops', icon: '💬', title: 'Ops Chat', desc: 'Vessel-office secure messaging.', status: 'soon' },
      { href: '/voyage/contacts', icon: '📇', title: 'Contact Book', desc: 'Agents, surveyors, P&I — organized.', status: 'soon' },
      { href: '/voyage/emergency', icon: '🚨', title: 'Emergency Reference', desc: 'Quick cards & contacts.', status: 'soon' },
    ],
  },
  {
    title: 'Market & News',
    desc: 'Bunker prices, indices, news, vessel marketplace.',
    icon: '📰',
    tools: [
      { href: '/voyage/bunker-prices', icon: '⛽', title: 'Bunker Price Index', desc: 'Live prices — 50+ ports.', status: 'soon' },
      { href: '/voyage/indices', icon: '📈', title: 'Market Indices', desc: 'BDI, BCI, BPI, BSI tracker.', status: 'soon' },
      { href: '/voyage/news', icon: '📰', title: 'Maritime News', desc: 'AI-summarized industry news.', status: 'soon' },
      { href: '/voyage/marketplace', icon: '🚢', title: 'Vessel Marketplace', desc: 'S&P, demolition, newbuilds.', status: 'soon' },
    ],
  },
];

const statusBadge = (status?: string) => {
  if (status === 'ai') return { label: 'AI', color: '#c8a84b', bg: 'rgba(200,168,75,.18)' };
  if (status === 'ready') return { label: 'LIVE', color: '#4caf76', bg: 'rgba(76,175,118,.15)' };
  if (status === 'beta') return { label: 'BETA', color: '#5aa6e8', bg: 'rgba(90,166,232,.15)' };
  if (status === 'soon') return { label: 'SOON', color: '#7a8a72', bg: 'rgba(122,138,114,.12)' };
  return null;
};

export default function VoyageHubPage() {
  const [savedCount, setSavedCount] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    setSavedCount(countAll());
  }, []);

  const totalTools = CATEGORIES.reduce((sum, c) => sum + c.tools.length, 0);
  const readyTools = CATEGORIES.reduce(
    (sum, c) => sum + c.tools.filter((t) => t.status === 'ready' || t.status === 'ai').length,
    0
  );

  const filteredCategories =
    activeCategory === 'all' ? CATEGORIES : CATEGORIES.filter((c) => c.title === activeCategory);

  return (
    <div>
      {/* HERO */}
      <section
        style={{
          padding: '40px 0 30px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(200,168,75,.1)',
          marginBottom: 32,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '5px 14px',
            background: 'rgba(200,168,75,.12)',
            border: '1px solid rgba(200,168,75,.35)',
            color: '#c8a84b',
            fontFamily: rj,
            fontSize: 10,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          ⚓ Voyage Hub · 100% Free
        </div>
        <h1
          style={{
            fontFamily: lb,
            fontSize: 'clamp(28px,4vw,52px)',
            fontWeight: 700,
            lineHeight: 1.05,
            marginBottom: 16,
          }}
        >
          Maritime <em style={g}>Tools</em> for Operators & Captains
        </h1>
        <p
          style={{
            fontSize: 14,
            color: '#b0c0a4',
            lineHeight: 1.7,
            maxWidth: 700,
            margin: '0 auto 22px',
          }}
        >
          {totalTools}+ professional tools — voyage planning, performance analysis, compliance, AI
          assistant. No signup. Your data stays in your browser.
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 24,
            flexWrap: 'wrap',
            marginTop: 22,
            fontFamily: rj,
            fontSize: 12,
            color: '#7a8a72',
            letterSpacing: '.5px',
          }}
        >
          <span>
            <strong style={{ color: '#4caf76', fontSize: 18, fontFamily: lb, fontWeight: 700 }}>{readyTools}</strong>{' '}
            tools live
          </span>
          <span>
            <strong style={{ color: '#c8a84b', fontSize: 18, fontFamily: lb, fontWeight: 700 }}>{totalTools}</strong>{' '}
            tools total
          </span>
          {savedCount > 0 && (
            <Link
              href="/voyage/saved"
              style={{
                color: '#c8a84b',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              💾 {savedCount} saved item{savedCount !== 1 ? 's' : ''}
            </Link>
          )}
        </div>
      </section>

      {/* CATEGORY FILTER */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 28,
          justifyContent: 'center',
        }}
      >
        <button
          onClick={() => setActiveCategory('all')}
          style={{
            padding: '7px 14px',
            background: activeCategory === 'all' ? '#c8a84b' : 'transparent',
            color: activeCategory === 'all' ? '#08100a' : '#7a8a72',
            border: `1px solid ${activeCategory === 'all' ? '#c8a84b' : 'rgba(200,168,75,.25)'}`,
            fontFamily: rj,
            fontSize: 11,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            fontWeight: 700,
            cursor: 'pointer',
            borderRadius: 4,
          }}
        >
          All Tools
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.title}
            onClick={() => setActiveCategory(cat.title)}
            style={{
              padding: '7px 14px',
              background: activeCategory === cat.title ? '#c8a84b' : 'transparent',
              color: activeCategory === cat.title ? '#08100a' : '#7a8a72',
              border: `1px solid ${
                activeCategory === cat.title ? '#c8a84b' : 'rgba(200,168,75,.25)'
              }`,
              fontFamily: rj,
              fontSize: 11,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              fontWeight: 700,
              cursor: 'pointer',
              borderRadius: 4,
            }}
          >
            {cat.icon} {cat.title}
          </button>
        ))}
      </div>

      {/* CATEGORIES */}
      {filteredCategories.map((cat) => (
        <section key={cat.title} style={{ marginBottom: 40 }}>
          <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 26 }}>{cat.icon}</span>
            <div>
              <h2 style={{ fontFamily: lb, fontSize: 22, fontWeight: 700, lineHeight: 1.1 }}>
                {cat.title}
              </h2>
              <p style={{ fontSize: 12, color: '#7a8a72', marginTop: 3 }}>{cat.desc}</p>
            </div>
          </div>

          <div
            className="tool-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4,1fr)',
              gap: 12,
            }}
          >
            {cat.tools.map((tool) => {
              const badge = statusBadge(tool.status);
              const isLive = tool.status === 'ready' || tool.status === 'ai';
              return (
                <Link
                  key={tool.title}
                  href={isLive ? tool.href : '#'}
                  onClick={(e) => {
                    if (!isLive) e.preventDefault();
                  }}
                  style={{ textDecoration: 'none', opacity: isLive ? 1 : 0.55, cursor: isLive ? 'pointer' : 'default' }}
                >
                  <div
                    className={isLive ? 'tool-card-live' : ''}
                    style={{
                      background: '#111c13',
                      border: '1px solid rgba(200,168,75,.15)',
                      padding: '16px 14px',
                      height: '100%',
                      position: 'relative',
                      transition: 'all .25s ease',
                      borderRadius: 4,
                    }}
                  >
                    {badge && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          fontSize: 8,
                          background: badge.bg,
                          color: badge.color,
                          padding: '2px 6px',
                          borderRadius: 3,
                          fontFamily: rj,
                          fontWeight: 700,
                          letterSpacing: '1px',
                          border: `1px solid ${badge.color}40`,
                        }}
                      >
                        {badge.label}
                      </div>
                    )}
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{tool.icon}</div>
                    <div
                      style={{
                        fontFamily: lb,
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: '#f5f0e8',
                        marginBottom: 5,
                        lineHeight: 1.2,
                      }}
                    >
                      {tool.title}
                    </div>
                    <div style={{ fontSize: 11, color: '#b0c0a4', lineHeight: 1.5 }}>{tool.desc}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      {/* INFO BAR */}
      <section
        style={{
          marginTop: 30,
          padding: '24px 20px',
          background: 'rgba(200,168,75,.04)',
          border: '1px solid rgba(200,168,75,.15)',
          borderRadius: 6,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: rj,
            fontSize: 10,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#c8a84b',
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          💡 How Voyage Hub Works
        </div>
        <p
          style={{
            fontSize: 12.5,
            color: '#b0c0a4',
            lineHeight: 1.7,
            maxWidth: 720,
            margin: '0 auto',
          }}
        >
          All tools are <strong style={{ color: '#c8a84b' }}>100% free</strong> and require no signup.
          Your data is stored <strong>locally in your browser</strong> — nothing leaves your device
          unless you explicitly share or export it. Tools marked <strong style={{ color: '#4caf76' }}>LIVE</strong> are
          ready to use. Tools marked <strong style={{ color: '#7a8a72' }}>SOON</strong> are coming
          in upcoming updates.
        </p>
      </section>

      <style>{`
        @media (max-width: 1024px) {
          .tool-grid { grid-template-columns: repeat(3,1fr) !important; }
        }
        @media (max-width: 720px) {
          .tool-grid { grid-template-columns: repeat(2,1fr) !important; gap: 8px !important; }
        }
        @media (max-width: 420px) {
          .tool-grid { grid-template-columns: 1fr !important; }
        }
        .tool-card-live:hover {
          border-color: #c8a84b !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(200,168,75,.15);
        }
      `}</style>
    </div>
  );
}
