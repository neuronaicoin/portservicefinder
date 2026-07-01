import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Voyage Hub — Coming Soon | PortServiceFinder',
  description:
    'The Voyage Hub — free maritime tools for vessel operators, charterers, and captains — is coming soon.',
  robots: { index: false, follow: false },
};

export default function VoyageLayout({ children: _children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#08100a', color: '#f5f0e8' }}>
      {/* TOP BAR — locked (Coming Soon) */}
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
          <span
            style={{
              color: '#c8a84b',
              fontFamily: "'Libre Bodoni', serif",
              fontSize: 16,
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            ⚓ Voyage Hub
          </span>
        </div>

        <span
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: 10,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontWeight: 700,
            color: '#7a8a72',
            background: 'rgba(122,138,114,.12)',
            border: '1px solid rgba(122,138,114,.3)',
            padding: '5px 12px',
            borderRadius: 4,
          }}
        >
          🔒 Coming Soon
        </span>
      </div>

      {/* CONTENT AREA — locked: show Coming Soon for ALL voyage routes */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 20px 60px' }}>
        <div style={{ minHeight: '55vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '50px 20px' }}>
          <div style={{ textAlign: 'center', maxWidth: 560 }}>
            <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(200,168,75,.12)', border: '1px solid rgba(200,168,75,.35)', color: '#c8a84b', fontFamily: "'Rajdhani', sans-serif", fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, marginBottom: 24 }}>
              🔒 Coming Soon
            </div>
            <div style={{ fontSize: 64, marginBottom: 20 }}>⚓</div>
            <h1 style={{ fontFamily: "'Libre Bodoni', serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 18, color: '#f5f0e8' }}>
              Voyage Hub is <em style={{ color: '#c8a84b', fontStyle: 'italic' }}>almost ready</em>
            </h1>
            <p style={{ fontSize: 15, color: '#b0c0a4', lineHeight: 1.7, marginBottom: 14 }}>
              We&apos;re putting the finishing touches on a full suite of free maritime tools —
              voyage planning, performance analysis, compliance and more — for operators, charterers and crew.
            </p>
            <p style={{ fontSize: 13, color: '#7a8a72', fontFamily: "'Rajdhani', sans-serif", lineHeight: 1.6, marginBottom: 30 }}>
              Check back soon. In the meantime, explore the main directory of verified maritime service providers.
            </p>
            <Link href="/" style={{ display: 'inline-block', background: '#c8a84b', color: '#08100a', border: 'none', padding: '12px 26px', fontFamily: "'Rajdhani', sans-serif", fontSize: 12, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, borderRadius: 4, textDecoration: 'none' }}>
              ← Back to PortServiceFinder
            </Link>
          </div>
        </div>
        {/* Original tool pages are kept in the codebase but hidden while locked:
            {children} is intentionally not rendered. */}
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
        · Coming Soon
      </footer>
    </div>
  );
}
