import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Voyage Hub — Free Maritime Tools | PortServiceFinder',
  description:
    'The Voyage Hub — free maritime tools for vessel operators, charterers, ship managers and crew. No signup, runs in your browser.',
  robots: { index: true, follow: true },
};

export default function VoyageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#08100a', color: '#f5f0e8' }}>
      {/* TOP BAR */}
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
              whiteSpace: 'nowrap',
              textDecoration: 'none',
            }}
          >
            ⚓ Voyage Hub
          </Link>
        </div>

        <span
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: 10,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontWeight: 700,
            color: '#4caf76',
            background: 'rgba(76,175,118,.12)',
            border: '1px solid rgba(76,175,118,.3)',
            padding: '5px 12px',
            borderRadius: 4,
          }}
        >
          ✓ Free · No Signup
        </span>
      </div>

      {/* CONTENT AREA — artik gercek sayfa icerigi render ediliyor */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 20px 60px' }}>
        {children}
      </main>

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
        · Free forever
      </footer>
    </div>
  );
}
