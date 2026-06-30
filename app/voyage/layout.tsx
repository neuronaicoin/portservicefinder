import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Voyage Hub — Free Maritime Tools | PortServiceFinder',
  description:
    'Professional voyage planning, performance analysis, bunker calculations, port database, CII/EU ETS compliance, and 40+ free tools for vessel operators, charterers, and captains.',
  keywords:
    'voyage planner, bunker calculator, charter party performance, CII calculator, EU ETS, maritime tools, port state control, vessel performance',
  openGraph: {
    title: 'Voyage Hub — Free Maritime Tools',
    description: 'Professional tools for vessel operators, charterers, and captains. 100% free.',
    type: 'website',
  },
};

export default function VoyageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#08100a', color: '#f5f0e8' }}>
      {/* TOP BAR — sticky, with back button */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(8,16,10,.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(200,168,75,.2)',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
          <Link
            href="/"
            style={{
              color: '#7a8a72',
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 11,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
            }}
          >
            ← Home
          </Link>
          <Link
            href="/voyage"
            style={{
              color: '#c8a84b',
              fontFamily: "'Libre Bodoni', serif",
              fontSize: 16,
              fontWeight: 700,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            ⚓ Voyage Hub
          </Link>
        </div>

        <div className="vh-nav" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/voyage" className="vh-link" style={tabStyle}>
            All Tools
          </Link>
          <Link href="/voyage/saved" className="vh-link" style={tabStyle}>
            💾 My Saved
          </Link>
        </div>
      </div>

      {/* CONTENT AREA */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 20px 60px' }}>{children}</main>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: '1px solid rgba(200,168,75,.12)',
          padding: '24px 20px',
          textAlign: 'center',
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 11,
          color: '#7a8a72',
          letterSpacing: '.5px',
        }}
      >
        Voyage Hub by{' '}
        <Link href="/" style={{ color: '#c8a84b', textDecoration: 'none' }}>
          PortServiceFinder
        </Link>{' '}
        · 100% Free · Built by mariners, for mariners
        <br />
        <span style={{ fontSize: 10, marginTop: 6, display: 'inline-block' }}>
          Data stored locally in your browser — no signup required
        </span>
      </footer>

      <style>{`
        @media (max-width: 720px) {
          .vh-nav .vh-link {
            font-size: 10px !important;
            padding: 4px 8px !important;
          }
        }
        .vh-link {
          transition: background .2s ease, color .2s ease;
        }
        .vh-link:hover {
          background: rgba(200,168,75,.15) !important;
          color: #c8a84b !important;
        }
      `}</style>
    </div>
  );
}

const tabStyle: React.CSSProperties = {
  color: '#7a8a72',
  fontFamily: "'Rajdhani', sans-serif",
  fontSize: 11,
  letterSpacing: '1px',
  textTransform: 'uppercase',
  fontWeight: 600,
  textDecoration: 'none',
  padding: '5px 10px',
  border: '1px solid rgba(200,168,75,.2)',
  borderRadius: 4,
};
