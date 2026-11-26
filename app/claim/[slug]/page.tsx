import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { getProviderBySlug } from '@/lib/providers-db';
import { claimToken, maskEmail } from '@/lib/claim';
import { ClaimForm } from './ClaimForm';

export const metadata: Metadata = { title: 'Activate your free company page | PortServiceFinder', robots: { index: false } };

export default async function ClaimPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ t?: string }> }) {
  const { slug } = await params;
  const { t = '' } = await searchParams;
  const p = await getProviderBySlug(slug);
  if (!p) notFound();
  if (p.claimed) redirect(`/providers/${p.slug}`);
  const valid = !!p.email && t === claimToken(p.slug, p.email);
  const place = p.ports[0] ? `${p.ports[0].name}, ${p.country}` : p.country;
  return (
    <>
      <SiteHeader />
      <main className="cl-wrap">
        <div className="cl-card">
          <p className="cl-kicker">{valid ? 'One last click' : 'Is this your company?'}</p>
          <h1>{p.flag} {p.name}</h1>
          <p className="cl-place">{p.typeLabel} · {place}</p>
          <ul className="cl-list">
            <li>Shown on the <b>{p.ports[0]?.name || p.country}</b> port page and on every service page you cover</li>
            <li>Ship operators and managers contact you directly (email, phone, WhatsApp)</li>
            <li>Free during launch, no commission, no contract</li>
          </ul>
          {p.email ? (
            <ClaimForm slug={p.slug} t={t} mode={valid ? 'confirm' : 'send'} masked={maskEmail(p.email)} />
          ) : (
            <p><Link href={`/for-providers/signup?claim=${encodeURIComponent(p.slug)}`}>Create your free page</Link></p>
          )}
          <p className="cl-small"><Link href={`/providers/${p.slug}`}>View the current page</Link></p>
        </div>
      </main>
      <SiteFooter />
      <style>{`
        .cl-wrap{display:flex;justify-content:center;padding:40px 16px;background:var(--bg)}
        .cl-card{width:100%;max-width:520px;background:var(--card,#101a33);border:1px solid var(--line,#24304d);border-radius:16px;padding:28px}
        .cl-kicker{color:#d6b25e;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:.06em;margin:0 0 8px}
        .cl-card h1{font-size:26px;line-height:1.2;margin:0 0 6px;color:var(--ink);overflow-wrap:anywhere}
        .cl-place{color:var(--muted,#8a97a8);margin:0 0 16px}
        .cl-list{margin:0 0 20px;padding-left:18px;color:var(--ink);line-height:1.6;font-size:15px}
        .cl-form{display:flex;flex-direction:column;gap:12px}
        .cl-form label{display:flex;flex-direction:column;gap:6px;font-size:13px;color:var(--muted,#8a97a8)}
        .cl-form input{padding:11px 12px;border-radius:10px;border:1px solid var(--line,#24304d);background:var(--bg);color:var(--ink);font-size:15px}
        .cl-form button{padding:14px;border:0;border-radius:10px;background:#d6b25e;color:#0d1030;font-weight:800;font-size:16px;cursor:pointer;overflow-wrap:anywhere}
        .cl-form button:disabled{opacity:.6}
        .cl-ok{color:#3ecf8e;font-weight:600}
        .cl-err{color:#ff6b6b;margin:0}
        .cl-small{font-size:12px;color:var(--muted,#8a97a8);margin:12px 0 0}
      `}</style>
    </>
  );
}
