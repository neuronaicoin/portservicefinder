import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { ProviderCard } from '@/components/providers/ProviderCard';
import { getListedProviders, getListingStats, providerOffers } from '@/lib/providers-db';
import { FLAG } from '@/lib/ports';
import { getServiceBySlug } from '@/lib/services-config';

export const revalidate = 300;

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || '';

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const sp = await searchParams;
  const filtered = !!(one(sp.country) || one(sp.type) || one(sp.service));
  return {
    title: 'Marine Service Providers: Ship Agents, Chandlers & Repairs',
    description: 'Every ship agent, shipchandler and marine service company listed on PortServiceFinder, newest first. Filter by country and service and contact them directly.',
    alternates: { canonical: '/providers' },
    // filtered views are the same companies in another order: keep only the main list in search results
    ...(filtered ? { robots: { index: false, follow: true } } : {}),
  };
}

const TYPES: [string, string][] = [
  ['', 'All types'],
  ['agent', 'Ship agents'],
  ['chandler', 'Shipchandlers'],
  ['service', 'Marine services'],
];

export default async function ProvidersPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const country = one(sp.country);
  const type = one(sp.type);
  const service = getServiceBySlug(one(sp.service));
  const [all, stats] = await Promise.all([getListedProviders(), getListingStats()]);
  const countries = [...new Set(all.map((p) => p.country))].sort((a, b) => a.localeCompare(b));
  const list = all.filter((p) => (!country || p.country === country) && (!type || p.type === type) && (!service || providerOffers(p, service)));
  const now = Date.now();
  const q = (patch: Record<string, string>) => {
    const u = new URLSearchParams({ ...(country ? { country } : {}), ...(type ? { type } : {}), ...(service ? { service: service.slug } : {}), ...patch });
    for (const [k, v] of [...u.entries()]) if (!v) u.delete(k);
    const s = u.toString();
    return `/providers${s ? `?${s}` : ''}`;
  };

  return (
    <div className="pl">
      <style>{CSS}</style>
      <SiteHeader />
      <main className="wrap">
        <h1>Marine service providers</h1>
        <p className="lead">
          {stats.total} companies listed{stats.last30 > 0 ? `, ${stats.last30} of them joined in the last 30 days` : ''}. Contact any of them directly; PortServiceFinder takes no commission.
        </p>
        <div className="filters">
          <div className="seg">
            {TYPES.map(([k, label]) => (
              <Link key={k || 'all'} href={q({ type: k })} className={type === k ? 'on' : ''}>
                {label}
              </Link>
            ))}
          </div>
          {countries.length > 1 && (
            <div className="countries">
              <Link href={q({ country: '' })} className={!country ? 'on' : ''}>
                All countries
              </Link>
              {countries.map((c) => (
                <Link key={c} href={q({ country: c })} className={country === c ? 'on' : ''}>
                  {FLAG[c] || ''} {c}
                </Link>
              ))}
            </div>
          )}
          {service && (
            <p className="note">
              Showing: {service.label} ·{' '}
              <Link href={q({ service: '' })}>clear</Link>
            </p>
          )}
        </div>
        {list.length === 0 ? (
          <div className="empty">
            <p>No companies match these filters yet.</p>
            <Link href="/for-providers/signup" className="btn">
              Be the first: list your company free
            </Link>
          </div>
        ) : (
          <div className="grid">
            {list.map((p) => (
              <ProviderCard key={p.id} p={p} now={now} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

const CSS = `
.pl{background:var(--bg);min-height:100vh}
.pl .wrap{max-width:1200px;margin:0 auto;padding:28px 20px 0}
.pl h1{font-size:clamp(28px,4vw,40px);margin:0;letter-spacing:-0.03em;font-weight:800}
.pl .lead{color:var(--ink2);font-size:16.5px;margin:10px 0 20px;max-width:760px;line-height:1.55}
.pl .filters{display:grid;gap:12px;margin-bottom:18px}
.pl .seg,.pl .countries{display:flex;flex-wrap:wrap;gap:8px}
.pl .seg a,.pl .countries a{border:1px solid var(--line);background:var(--card);border-radius:999px;padding:7px 13px;font-size:14px;color:var(--ink2);text-decoration:none}
.pl .seg a.on,.pl .countries a.on{background:var(--acc);border-color:var(--acc);color:var(--on-acc);font-weight:600}
.pl .note{margin:0;color:var(--ink3);font-size:14px}.pl .note a{color:var(--acc)}
.pl .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.pl .empty{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:28px;text-align:center;color:var(--ink2)}
.pl .btn{display:inline-flex;margin-top:8px;background:var(--acc);color:var(--on-acc);padding:11px 16px;border-radius:10px;font-weight:650;text-decoration:none}
@media (max-width:960px){.pl .grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:620px){.pl .grid{grid-template-columns:1fr}.pl .wrap{padding:22px 16px 0}.pl .countries{flex-wrap:nowrap;overflow-x:auto;padding-bottom:4px}.pl .countries a{white-space:nowrap}}
`;
