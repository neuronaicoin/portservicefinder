'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { countAll } from '@/lib/voyage-storage';

const lb = "'Libre Bodoni', serif";
const rj = "'Rajdhani', sans-serif";
const g = { color: '#c8a84b', fontStyle: 'italic' };

interface SideCard {
  href: string;
  badge: string;
  badgeColor: string;
  icon: string;
  title: string;
  tagline: string;
  bullets: string[];
  toolCount: number;
  cta: string;
}

const SIDES: SideCard[] = [
  {
    href: '/voyage/operators',
    badge: 'COMMERCIAL',
    badgeColor: '#c8a84b',
    icon: '🏢',
    title: 'Operator · Owner · Charterer',
    tagline: 'Charter, claims, performance and fleet — the commercial desk in one place.',
    bullets: [
      'TCE, laytime & demurrage, hire statements',
      'Voyage & fleet performance, CP vs actual',
      'Disbursements, bunker prices, market indices',
      'AI charter-party reader & email assistant',
    ],
    toolCount: 22,
    cta: 'Enter Shore Office',
  },
  {
    href: '/voyage/ship',
    badge: 'ALWAYS FREE',
    badgeColor: '#4caf76',
    icon: '⚓',
    title: 'Ship Side',
    tagline: 'Cargo, safety, compliance and deck tools — free for every vessel and seafarer.',
    bullets: [
      'Draft survey, stability, lashing, cargo database',
      'MARPOL, drills, incidents, PSC preparation',
      'Certificates, rest hours, drydock & maintenance',
      'Tides, weather windows, port database',
    ],
    toolCount: 25,
    cta: 'Enter Ship Side',
  },
];

export default function VoyageLandingPage() {
  const [savedCount, setSavedCount] = useState(0);
  useEffect(() => { setSavedCount(countAll()); }, []);

  return (
    <div>
      {/* HERO */}
      <section style={{ padding: '48px 0 36px', textAlign: 'center', borderBottom: '1px solid rgba(200,168,75,.1)', marginBottom: 40 }}>
        <div style={{ display: 'inline-block', padding: '5px 14px', background: 'rgba(200,168,75,.12)', border: '1px solid rgba(200,168,75,.35)', color: '#c8a84b', fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, marginBottom: 18 }}>
          ⚓ Voyage Hub · Free Maritime Tools
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(30px,4.5vw,56px)', fontWeight: 700, lineHeight: 1.04, marginBottom: 18 }}>
          The Maritime <em style={g}>Toolkit</em><br />for Shore &amp; Ship
        </h1>
        <p style={{ fontSize: 15, color: '#b0c0a4', lineHeight: 1.7, maxWidth: 660, margin: '0 auto 8px' }}>
          Professional tools for the whole voyage — from the chartering desk to the bridge.
          Pick your side to see the tools built for your role.
        </p>
        <p style={{ fontSize: 12.5, color: '#7a8a72', fontFamily: rj, letterSpacing: '.5px', marginTop: 14 }}>
          No signup · Your data stays in your browser · Built by maritime professionals
        </p>
      </section>

      {/* TWO CHOICE CARDS */}
      <div className="side-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20, marginBottom: 44 }}>
        {SIDES.map((s) => (
          <Link key={s.href} href={s.href} style={{ textDecoration: 'none' }}>
            <div className="side-card" style={{
              background: 'linear-gradient(165deg, #142016, #0f1a11)',
              border: `1px solid ${s.badgeColor}40`,
              borderRadius: 8,
              padding: '30px 26px',
              height: '100%',
              position: 'relative',
              transition: 'all .28s ease',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* badge */}
              <div style={{ position: 'absolute', top: 16, right: 16, fontSize: 9, background: `${s.badgeColor}22`, color: s.badgeColor, padding: '4px 10px', borderRadius: 4, fontFamily: rj, fontWeight: 700, letterSpacing: '1.5px', border: `1px solid ${s.badgeColor}55` }}>
                {s.badge}
              </div>

              <div style={{ fontSize: 44, marginBottom: 14 }}>{s.icon}</div>

              <h2 style={{ fontFamily: lb, fontSize: 'clamp(20px,2.4vw,26px)', fontWeight: 700, color: '#f5f0e8', lineHeight: 1.15, marginBottom: 10 }}>
                {s.title}
              </h2>

              <p style={{ fontSize: 13.5, color: '#b0c0a4', lineHeight: 1.6, marginBottom: 18 }}>
                {s.tagline}
              </p>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 22px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                {s.bullets.map((b) => (
                  <li key={b} style={{ fontFamily: rj, fontSize: 12.5, color: '#9fb094', lineHeight: 1.45, display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                    <span style={{ color: s.badgeColor, flexShrink: 0, fontWeight: 700 }}>›</span>
                    {b}
                  </li>
                ))}
              </ul>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid rgba(200,168,75,.12)' }}>
                <span style={{ fontFamily: rj, fontSize: 11, color: '#7a8a72', letterSpacing: '.5px' }}>
                  <strong style={{ color: s.badgeColor, fontSize: 16, fontFamily: lb }}>{s.toolCount}</strong> tools
                </span>
                <span className="side-cta" style={{ fontFamily: rj, fontSize: 12, color: s.badgeColor, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {s.cta} <span style={{ transition: 'transform .2s' }}>→</span>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* SAVED ITEMS */}
      {savedCount > 0 && (
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/voyage/saved" style={{ color: '#c8a84b', textDecoration: 'none', fontFamily: rj, fontSize: 13, fontWeight: 700 }}>
            💾 {savedCount} saved item{savedCount !== 1 ? 's' : ''} →
          </Link>
        </div>
      )}

      {/* SEO / AI-READABLE EXPLAINER */}
      <section style={{ marginTop: 20, padding: '28px 24px', background: 'rgba(200,168,75,.04)', border: '1px solid rgba(200,168,75,.15)', borderRadius: 8 }}>
        <h2 style={{ fontFamily: lb, fontSize: 20, fontWeight: 700, color: '#f5f0e8', marginBottom: 12, textAlign: 'center' }}>
          What is the <em style={g}>Voyage Hub</em>?
        </h2>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.8, maxWidth: 760, margin: '0 auto 14px', textAlign: 'center' }}>
          The Voyage Hub is a free suite of professional maritime tools covering the entire voyage cycle.
          The <strong style={{ color: '#c8a84b' }}>Shore Office</strong> side serves vessel operators, shipowners and
          charterers with chartering, laytime and demurrage, hire statements, voyage and fleet performance,
          disbursements, bunker prices and market indices. The <strong style={{ color: '#4caf76' }}>Ship Side</strong> serves
          vessels and seafarers with cargo and stowage, stability, lashing, MARPOL and safety compliance,
          drills, certificate tracking, drydock planning, tides and weather windows — and stays free forever.
        </p>
        <p style={{ fontSize: 12.5, color: '#7a8a72', lineHeight: 1.7, maxWidth: 760, margin: '0 auto', textAlign: 'center', fontFamily: rj }}>
          Every tool runs in your browser with no signup. Your data never leaves your device unless you choose to export or share it.
        </p>
      </section>

      <style>{`
        @media (max-width: 720px) {
          .side-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
        }
        .side-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 28px rgba(0,0,0,.35);
        }
        .side-card:hover .side-cta span:last-child {
          transform: translateX(4px);
        }
      `}</style>
    </div>
  );
}
