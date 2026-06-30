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
    title: 'Cargo & Stowage',
    desc: 'Cargo planning, stowage, draft survey and lashing.',
    icon: '📦',
    tools: [
      { href: '/voyage/draft', icon: '⚓', title: 'Draft Survey', desc: 'Cargo weight from draft readings.', status: 'ready' },
      { href: '/voyage/cargo', icon: '📦', title: 'Cargo Database', desc: '68 cargoes — stowage factors + hazards.', status: 'ready' },
      { href: '/voyage/stability', icon: '⚖️', title: 'Stability Check', desc: 'Quick trim & stability calculator.', status: 'ready' },
      { href: '/voyage/lashing', icon: '🔗', title: 'Lashing Calculator', desc: 'Heavy weather cargo securing.', status: 'ready' },
    ],
  },
  {
    title: 'Compliance & Safety',
    desc: 'MARPOL, drills, incidents and PSC preparation.',
    icon: '🛂',
    tools: [
      { href: '/voyage/psc', icon: '🔍', title: 'PSC Sentry', desc: 'MoU search, deficiency codes, CIC tracker.', status: 'ready' },
      { href: '/voyage/marpol', icon: '🛢️', title: 'MARPOL Tracker', desc: 'Annex I-VI compliance & records.', status: 'ready' },
      { href: '/voyage/incidents', icon: '⚠️', title: 'Incident Log', desc: 'Near miss & accident reporting.', status: 'ready' },
      { href: '/voyage/drills', icon: '🚨', title: 'Drill Tracker', desc: 'SOLAS-mandated drill schedule & log.', status: 'ready' },
      { href: '/voyage/emergency', icon: '🆘', title: 'Emergency Reference', desc: 'First-action cards, signals, contacts.', status: 'ready' },
    ],
  },
  {
    title: 'Crew & Certificates',
    desc: 'Rest hours, wages, visas and document tracking.',
    icon: '👥',
    tools: [
      { href: '/voyage/mlc', icon: '📋', title: 'MLC Compliance', desc: 'Rest hours grid + MLC self-check.', status: 'ready' },
      { href: '/voyage/wages', icon: '💵', title: 'Wage Calculator', desc: 'Crew wage bill — basic, OT, allowances.', status: 'ready' },
      { href: '/voyage/visa', icon: '🛂', title: 'Visa Requirements', desc: 'Crew visa per nationality + port.', status: 'ready' },
      { href: '/voyage/vault', icon: '🗄️', title: 'Document Vault', desc: 'Certificates with expiry alerts.', status: 'ready' },
      { href: '/voyage/documents', icon: '📝', title: 'Document Generator', desc: 'NOR, SOF, LOI, LOP — auto-fill.', status: 'ready' },
    ],
  },
  {
    title: 'Vessel & Maintenance',
    desc: 'Drydock, planned maintenance and spares.',
    icon: '🔧',
    tools: [
      { href: '/voyage/drydock', icon: '🏗️', title: 'Drydock Planner', desc: 'Survey cycle + scope & cost estimator.', status: 'ready' },
      { href: '/voyage/maintenance', icon: '🔧', title: 'PMS Mini', desc: 'Running-hours + calendar maintenance.', status: 'ready' },
      { href: '/voyage/spares', icon: '📦', title: 'Spares Inventory', desc: 'Critical spares & supplier tracking.', status: 'ready' },
    ],
  },
  {
    title: 'Port & Passage',
    desc: 'Ports, tides, weather and local holidays.',
    icon: '🏴',
    tools: [
      { href: '/voyage/ports', icon: '🌍', title: 'Port Database', desc: 'Major hub ports + PSC history links.', status: 'ready' },
      { href: '/voyage/tide', icon: '🌊', title: 'Tide Calculator', desc: 'HW/LW interpolation + UKC windows.', status: 'ready' },
      { href: '/voyage/weather', icon: '🌬️', title: 'Weather Windows', desc: 'Operation limits vs forecast — GO / no-go.', status: 'ready' },
      { href: '/voyage/holidays', icon: '📅', title: 'Holidays Calendar', desc: 'Per-port holidays for SHEX calc.', status: 'ready' },
      { href: '/voyage/distance', icon: '📏', title: 'Distance Calculator', desc: 'Port-to-port distance & ETA.', status: 'ready' },
    ],
  },
  {
    title: 'Records & Log',
    desc: 'Voyage diary, evidence photos and contacts.',
    icon: '📖',
    tools: [
      { href: '/voyage/diary', icon: '📖', title: 'Voyage Diary', desc: 'Ops log + shareable summaries.', status: 'ready' },
      { href: '/voyage/photos', icon: '📸', title: 'Photo Reference Log', desc: 'Index evidence photos for claims.', status: 'ready' },
      { href: '/voyage/contacts', icon: '📇', title: 'Contact Book', desc: 'Agents, surveyors, P&I — organized.', status: 'ready' },
    ],
  },
];

const statusBadge = (status?: string) => {
  if (status === 'ai') return { label: 'AI', color: '#c8a84b', bg: 'rgba(200,168,75,.18)' };
  if (status === 'ready') return { label: 'FREE', color: '#4caf76', bg: 'rgba(76,175,118,.15)' };
  if (status === 'beta') return { label: 'BETA', color: '#5aa6e8', bg: 'rgba(90,166,232,.15)' };
  if (status === 'soon') return { label: 'SOON', color: '#7a8a72', bg: 'rgba(122,138,114,.12)' };
  return null;
};

export default function ShipPage() {
  const [savedCount, setSavedCount] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  useEffect(() => { setSavedCount(countAll()); }, []);

  const totalTools = CATEGORIES.reduce((sum, c) => sum + c.tools.length, 0);
  const readyTools = CATEGORIES.reduce((sum, c) => sum + c.tools.filter((t) => t.status === 'ready' || t.status === 'ai').length, 0);
  const filteredCategories = activeCategory === 'all' ? CATEGORIES : CATEGORIES.filter((c) => c.title === activeCategory);

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <Link href="/voyage" style={{ fontFamily: rj, fontSize: 11, color: '#7a8a72', textDecoration: 'none', letterSpacing: '.5px' }}>← Voyage Hub</Link>
      </div>

      {/* HERO */}
      <section style={{ padding: '20px 0 26px', borderBottom: '1px solid rgba(200,168,75,.1)', marginBottom: 28 }}>
        <div style={{ display: 'inline-block', padding: '5px 14px', background: 'rgba(76,175,118,.12)', border: '1px solid rgba(76,175,118,.4)', color: '#4caf76', fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>
          ⚓ Ship Side · Always Free
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(26px,3.5vw,42px)', fontWeight: 700, lineHeight: 1.08, marginBottom: 12 }}>
          Tools for Every <em style={g}>Vessel</em> &amp; Seafarer
        </h1>
        <p style={{ fontSize: 14, color: '#b0c0a4', lineHeight: 1.7, maxWidth: 680 }}>
          Cargo, safety, compliance, certificates and deck tools — built for life on board and free forever.
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

      {/* FREE-FOREVER NOTE */}
      <section style={{ marginTop: 20, padding: '24px 20px', background: 'rgba(76,175,118,.05)', border: '1px solid rgba(76,175,118,.25)', borderRadius: 8, textAlign: 'center' }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#4caf76', fontWeight: 700, marginBottom: 8 }}>💚 Free Forever for Seafarers</div>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.7, maxWidth: 680, margin: '0 auto' }}>
          Every Ship Side tool is and will stay <strong style={{ color: '#4caf76' }}>completely free</strong>, with no signup and no account.
          Your data is stored locally in your browser — nothing leaves the ship unless you choose to export or share it.
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
