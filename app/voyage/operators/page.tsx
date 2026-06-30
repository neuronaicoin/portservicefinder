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
    title: 'Charter & Commercial',
    desc: 'Charter party, hire, TCE and freight calculations.',
    icon: '📋',
    tools: [
      { href: '/voyage/tce', icon: '💵', title: 'TCE Calculator', desc: 'Time charter equivalent + Worldscale.', status: 'ready' },
      { href: '/voyage/laytime', icon: '⏱️', title: 'Laytime / Demurrage', desc: 'Auto SoF & demurrage statements.', status: 'ready' },
      { href: '/voyage/hire', icon: '📊', title: 'Hire Statement', desc: 'Time charter hire calc + bunker.', status: 'ready' },
      { href: '/voyage/cp', icon: '📜', title: 'CP Manager (AI)', desc: 'Upload CP — AI extracts terms.', status: 'ai' },
    ],
  },
  {
    title: 'Voyage Planning',
    desc: 'Plan routes, calculate distances, estimate fuel and time.',
    icon: '🗺️',
    tools: [
      { href: '/voyage/planner', icon: '🧭', title: 'AI Route Optimizer', desc: 'Best route with weather, fuel & constraints.', status: 'ai' },
      { href: '/voyage/distance', icon: '📏', title: 'Distance Calculator', desc: 'Port-to-port distance & ETA in seconds.', status: 'ready' },
      { href: '/voyage/bunker-plan', icon: '⛽', title: 'Bunker Planner', desc: 'ROB management — delivery to redelivery.', status: 'ready' },
    ],
  },
  {
    title: 'Performance & Claims',
    desc: 'Track voyages, analyze performance, generate claim reports.',
    icon: '📊',
    tools: [
      { href: '/voyage/tracker', icon: '📈', title: 'Voyage Tracker', desc: 'Daily reports + auto performance analysis.', status: 'ready' },
      { href: '/voyage/bunker', icon: '⚡', title: 'CP Performance', desc: 'CP vs Actual — speed & consumption claims.', status: 'ready' },
      { href: '/voyage/noon', icon: '📝', title: 'Noon Report Manager', desc: 'Daily noon reports vs CP warranties.', status: 'ready' },
      { href: '/voyage/claims', icon: '⚖️', title: 'Claims Center', desc: 'Demurrage, off-hire, speed/consumption.', status: 'ready' },
    ],
  },
  {
    title: 'Cost & Market',
    desc: 'Disbursements, bunker prices, congestion and indices.',
    icon: '💰',
    tools: [
      { href: '/voyage/disbursement', icon: '💰', title: 'Disbursement Tracker', desc: 'DA estimate vs final cost tracker.', status: 'ready' },
      { href: '/voyage/bunker-prices', icon: '⛽', title: 'Bunker Price Tracker', desc: 'Compare ports + stem savings.', status: 'ready' },
      { href: '/voyage/indices', icon: '📈', title: 'Market Indices', desc: 'BDI, BCI, BPI, BSI tracker.', status: 'ready' },
      { href: '/voyage/congestion', icon: '⚓', title: 'Port Congestion', desc: 'Agent reports + berth estimate.', status: 'ready' },
    ],
  },
  {
    title: 'Fleet & Compliance',
    desc: 'Fleet overview plus emissions compliance.',
    icon: '🎛️',
    tools: [
      { href: '/voyage/fleet', icon: '🎛️', title: 'Fleet Dashboard', desc: 'All vessels — one screen.', status: 'ready' },
      { href: '/voyage/vessel', icon: '🚢', title: 'Vessel Database', desc: 'Search by IMO — particulars & history.', status: 'ready' },
      { href: '/voyage/cii', icon: '🌍', title: 'CII Calculator', desc: 'Carbon Intensity Indicator — A to E rating.', status: 'ready' },
      { href: '/voyage/ets', icon: '🌫️', title: 'EU ETS / FuelEU', desc: 'Allowance cost & FuelEU compliance.', status: 'ready' },
    ],
  },
  {
    title: 'AI & Intelligence',
    desc: 'AI-powered tools — your commercial co-pilot.',
    icon: '🤖',
    tools: [
      { href: '/voyage/assistant', icon: '🤖', title: 'AI Assistant', desc: 'Ask anything: CP, weather, regulations.', status: 'ai' },
      { href: '/voyage/email-ai', icon: '✉️', title: 'Email Assistant', desc: 'AI drafts demurrage, LOP, etc.', status: 'ai' },
      { href: '/voyage/insights', icon: '💡', title: 'Smart Insights', desc: 'AI analyzes your voyage trends.', status: 'ai' },
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

export default function OperatorsPage() {
  const [savedCount, setSavedCount] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  useEffect(() => { setSavedCount(countAll()); }, []);

  const totalTools = CATEGORIES.reduce((sum, c) => sum + c.tools.length, 0);
  const readyTools = CATEGORIES.reduce((sum, c) => sum + c.tools.filter((t) => t.status === 'ready' || t.status === 'ai').length, 0);
  const filteredCategories = activeCategory === 'all' ? CATEGORIES : CATEGORIES.filter((c) => c.title === activeCategory);

  return (
    <div>
      {/* breadcrumb back */}
      <div style={{ marginBottom: 18 }}>
        <Link href="/voyage" style={{ fontFamily: rj, fontSize: 11, color: '#7a8a72', textDecoration: 'none', letterSpacing: '.5px' }}>← Voyage Hub</Link>
      </div>

      {/* HERO */}
      <section style={{ padding: '20px 0 26px', borderBottom: '1px solid rgba(200,168,75,.1)', marginBottom: 28 }}>
        <div style={{ display: 'inline-block', padding: '5px 14px', background: 'rgba(200,168,75,.12)', border: '1px solid rgba(200,168,75,.35)', color: '#c8a84b', fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>
          🏢 Shore Office · Commercial
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(26px,3.5vw,42px)', fontWeight: 700, lineHeight: 1.08, marginBottom: 12 }}>
          For Operators, Owners &amp; <em style={g}>Charterers</em>
        </h1>
        <p style={{ fontSize: 14, color: '#b0c0a4', lineHeight: 1.7, maxWidth: 680 }}>
          The commercial desk in one place — chartering, claims, performance, fleet and market tools.
          No signup; your data stays in your browser.
        </p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 18, fontFamily: rj, fontSize: 12, color: '#7a8a72', letterSpacing: '.5px' }}>
          <span><strong style={{ color: '#4caf76', fontSize: 18, fontFamily: lb, fontWeight: 700 }}>{readyTools}</strong> tools live</span>
          <span><strong style={{ color: '#c8a84b', fontSize: 18, fontFamily: lb, fontWeight: 700 }}>{totalTools}</strong> tools total</span>
          {savedCount > 0 && <Link href="/voyage/saved" style={{ color: '#c8a84b', textDecoration: 'none', fontWeight: 700 }}>💾 {savedCount} saved</Link>}
        </div>
      </section>

      {/* CATEGORY FILTER */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28, justifyContent: 'center' }}>
        <button onClick={() => setActiveCategory('all')} style={filterStyle(activeCategory === 'all')}>All Tools</button>
        {CATEGORIES.map((cat) => (
          <button key={cat.title} onClick={() => setActiveCategory(cat.title)} style={filterStyle(activeCategory === cat.title)}>{cat.icon} {cat.title}</button>
        ))}
      </div>

      {/* CATEGORIES */}
      {filteredCategories.map((cat) => (
        <section key={cat.title} style={{ marginBottom: 40 }}>
          <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 26 }}>{cat.icon}</span>
            <div>
              <h2 style={{ fontFamily: lb, fontSize: 22, fontWeight: 700, lineHeight: 1.1 }}>{cat.title}</h2>
              <p style={{ fontSize: 12, color: '#7a8a72', marginTop: 3 }}>{cat.desc}</p>
            </div>
          </div>
          <div className="tool-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {cat.tools.map((tool) => renderTool(tool))}
          </div>
        </section>
      ))}

      {/* PRO TEASER */}
      <section style={{ marginTop: 20, padding: '24px 20px', background: 'rgba(200,168,75,.05)', border: '1px solid rgba(200,168,75,.2)', borderRadius: 8, textAlign: 'center' }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>✨ Pro — Coming Soon</div>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.7, maxWidth: 680, margin: '0 auto' }}>
          These commercial tools are free to use today. A <strong style={{ color: '#c8a84b' }}>Pro</strong> tier is coming for
          operators who want cloud sync across devices, multi-vessel fleets, exports and advanced AI — built on the same tools you already know.
        </p>
      </section>

      <FilterStyles />
    </div>
  );
}



function filterStyle(active: boolean): React.CSSProperties {
  return {
    padding: '7px 14px', background: active ? '#c8a84b' : 'transparent', color: active ? '#08100a' : '#7a8a72',
    border: `1px solid ${active ? '#c8a84b' : 'rgba(200,168,75,.25)'}`, fontFamily: rj, fontSize: 11,
    letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4,
  };
}

function renderTool(tool: Tool) {
  const badge = statusBadge(tool.status);
  const isLive = tool.status === 'ready' || tool.status === 'ai';
  return (
    <Link key={tool.title} href={isLive ? tool.href : '#'} onClick={(e) => { if (!isLive) e.preventDefault(); }} style={{ textDecoration: 'none', opacity: isLive ? 1 : 0.55, cursor: isLive ? 'pointer' : 'default' }}>
      <div className={isLive ? 'tool-card-live' : ''} style={{ background: '#111c13', border: '1px solid rgba(200,168,75,.15)', padding: '16px 14px', height: '100%', position: 'relative', transition: 'all .25s ease', borderRadius: 4 }}>
        {badge && (
          <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 8, background: badge.bg, color: badge.color, padding: '2px 6px', borderRadius: 3, fontFamily: rj, fontWeight: 700, letterSpacing: '1px', border: `1px solid ${badge.color}40` }}>{badge.label}</div>
        )}
        <div style={{ fontSize: 24, marginBottom: 8 }}>{tool.icon}</div>
        <div style={{ fontFamily: lb, fontSize: 13.5, fontWeight: 700, color: '#f5f0e8', marginBottom: 5, lineHeight: 1.2 }}>{tool.title}</div>
        <div style={{ fontSize: 11, color: '#b0c0a4', lineHeight: 1.5 }}>{tool.desc}</div>
      </div>
    </Link>
  );
}

function FilterStyles() {
  return (
    <style>{`
      @media (max-width: 1024px) { .tool-grid { grid-template-columns: repeat(3,1fr) !important; } }
      @media (max-width: 720px) { .tool-grid { grid-template-columns: repeat(2,1fr) !important; gap: 8px !important; } }
      @media (max-width: 420px) { .tool-grid { grid-template-columns: 1fr !important; } }
      .tool-card-live:hover { border-color: #c8a84b !important; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(200,168,75,.15); }
    `}</style>
  );
}
