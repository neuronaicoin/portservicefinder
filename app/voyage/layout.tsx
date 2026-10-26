import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'Voyage Hub: 41 Free Maritime Tools for Operators and Crew',
  description:
    'Free maritime tools for vessel operators, charterers, ship managers and crew: laytime, CII, bunker, distance, TCE, PSC and more. No signup, runs in your browser.',
  alternates: { canonical: '/voyage' },
  robots: { index: true, follow: true },
};

export default function VoyageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      <SiteHeader />
      <div style={{ borderBottom: '1px solid var(--line)', background: 'var(--bg2)' }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            fontSize: 14,
          }}
        >
          <Link href="/voyage" style={{ color: 'var(--ink)', fontWeight: 700, textDecoration: 'none' }}>
            Voyage Hub
          </Link>
          <span style={{ color: 'var(--ok)', fontWeight: 600, fontSize: 13 }}>Free · No signup · Data stays in your browser</span>
        </div>
      </div>
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px 20px' }}>{children}</main>
      <SiteFooter />
    </div>
  );
}
