'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { countAll } from '@/lib/voyage-storage';

const lb = 'var(--font-display)';
const rj = 'var(--font-ui)';

interface SideCard {
  href: string;
  badge: string;
  badgeColor: string;
  title: string;
  tagline: string;
  bullets: string[];
  toolCount: number;
  cta: string;
}

const SIDES: SideCard[] = [
  {
    href: '/voyage/operators',
    badge: 'Commercial',
    badgeColor: 'var(--acc)',
    title: 'Operator, owner, charterer',
    tagline: 'Charter, claims, performance and fleet tools for the commercial desk.',
    bullets: [
      'TCE, laytime & demurrage, hire statements',
      'Voyage & fleet performance, CP vs actual',
      'Disbursements, bunker prices, market indices',
      'CII, EU ETS and FuelEU compliance cost',
    ],
    toolCount: 16,
    cta: 'Open Shore Office tools',
  },
  {
    href: '/voyage/ship',
    badge: 'Always free',
    badgeColor: 'var(--ok)',
    title: 'Ship side',
    tagline: 'Cargo, safety, compliance and deck tools, free for every vessel and seafarer.',
    bullets: [
      'Draft survey, stability, lashing, cargo database',
      'MARPOL, drills, incidents, PSC preparation',
      'Certificates, rest hours, drydock & maintenance',
      'Tides, weather windows, port database',
    ],
    toolCount: 25,
    cta: 'Open Ship Side tools',
  },
];

export default function VoyageLandingPage() {
  const [savedCount, setSavedCount] = useState(0);
  useEffect(() => { setSavedCount(countAll()); }, []);

  return (
    <div>
      {/* HERO */}
      <section style={{ padding: '40px 0 32px', textAlign: 'center', borderBottom: '1px solid var(--line)', marginBottom: 36 }}>
        <div style={{ fontFamily: rj, fontSize: 13, fontWeight: 600, color: 'var(--ink3)', marginBottom: 14 }}>
          Voyage Hub: free maritime tools
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(28px,4.5vw,52px)', fontWeight: 700, lineHeight: 1.08, margin: '0 0 16px', color: 'var(--ink)' }}>
          Maritime tools for shore and ship
        </h1>
        <p style={{ fontSize: 16, color: 'var(--ink2)', lineHeight: 1.7, maxWidth: 660, margin: '0 auto 8px' }}>
          41 free calculators and logs for the whole voyage, from the chartering desk to the bridge.
          Pick your side to see the tools built for your role.
        </p>
        <p style={{ fontSize: 13, color: 'var(--ink3)', fontFamily: rj, marginTop: 14 }}>
          No signup. Your data stays in your browser.
        </p>
      </section>

      {/* TWO CHOICE CARDS */}
      <div className="side-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 20, marginBottom: 40 }}>
        {SIDES.map((s) => (
          <Link key={s.href} href={s.href} style={{ textDecoration: 'none' }}>
            <div className="side-card" style={{
              background: 'var(--card)',
              border: '1px solid var(--line)',
              borderRadius: 14,
              padding: '26px 24px',
              height: '100%',
              transition: 'border-color .2s ease, box-shadow .2s ease',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <div style={{ alignSelf: 'flex-start', fontSize: 12, background: `color-mix(in srgb, ${s.badgeColor} 12%, transparent)`, color: s.badgeColor, padding: '4px 10px', borderRadius: 999, fontFamily: rj, fontWeight: 600, marginBottom: 14 }}>
                {s.badge}
              </div>

              <h2 style={{ fontFamily: lb, fontSize: 'clamp(20px,2.4vw,26px)', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.2, margin: '0 0 10px' }}>
                {s.title}
              </h2>

              <p style={{ fontSize: 14.5, color: 'var(--ink2)', lineHeight: 1.6, margin: '0 0 16px' }}>
                {s.tagline}
              </p>

              <ul style={{ listStyle: 'disc', padding: '0 0 0 18px', margin: '0 0 22px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                {s.bullets.map((b) => (
                  <li key={b} style={{ fontFamily: rj, fontSize: 14, color: 'var(--ink2)', lineHeight: 1.5 }}>
                    {b}
                  </li>
                ))}
              </ul>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', paddingTop: 16, borderTop: '1px solid var(--line)' }}>
                <span style={{ fontFamily: rj, fontSize: 13, color: 'var(--ink3)' }}>
                  <strong style={{ color: 'var(--ink)', fontSize: 16, fontFamily: lb }}>{s.toolCount}</strong> tools
                </span>
                <span className="side-cta" style={{ fontFamily: rj, fontSize: 14, color: 'var(--acc)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, minHeight: 40 }}>
                  {s.cta} <span aria-hidden="true" style={{ transition: 'transform .2s' }}>→</span>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* SAVED ITEMS */}
      {savedCount > 0 && (
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link href="/voyage/saved" style={{ color: 'var(--acc)', textDecoration: 'none', fontFamily: rj, fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', minHeight: 40 }}>
            {savedCount} saved item{savedCount !== 1 ? 's' : ''} →
          </Link>
        </div>
      )}

      {/* SEO / AI-READABLE EXPLAINER */}
      <section style={{ maxWidth: 900, margin: '20px auto 0', padding: '26px 24px', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14 }}>
        <h2 style={{ fontFamily: lb, fontSize: 20, fontWeight: 700, color: 'var(--ink)', margin: '0 0 12px' }}>
          What is the Voyage Hub?
        </h2>
        <p style={{ fontSize: 15, color: 'var(--ink2)', lineHeight: 1.75, margin: '0 0 12px' }}>
          The Voyage Hub is a free set of maritime tools from PortServiceFinder covering the whole voyage.
          The <Link href="/voyage/operators" style={{ color: 'var(--acc)' }}>Shore Office</Link> side serves vessel operators, shipowners and
          charterers: TCE voyage estimates, laytime and demurrage, hire statements, charter party performance claims,
          bunker planning, disbursement accounts, CII and EU ETS costs, and a fleet dashboard.
          The <Link href="/voyage/ship" style={{ color: 'var(--acc)' }}>Ship Side</Link> serves masters, officers and crew: draft survey,
          stability and lashing checks, a bulk cargo database, PSC and MARPOL preparation, drills, MLC rest hours,
          certificate expiry, planned maintenance, tides and weather windows.
        </p>
        <p style={{ fontSize: 13.5, color: 'var(--ink3)', lineHeight: 1.7, margin: 0, fontFamily: rj }}>
          Every tool runs in your browser with no signup. Saved work stays on your device unless you export or share it.
        </p>
      </section>

      <style>{`
        @media (max-width: 720px) {
          .side-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
        }
        .side-card:hover {
          border-color: var(--acc) !important;
          box-shadow: var(--shadow);
        }
        .side-card:hover .side-cta span:last-child {
          transform: translateX(4px);
        }
      `}</style>
    </div>
  );
}
