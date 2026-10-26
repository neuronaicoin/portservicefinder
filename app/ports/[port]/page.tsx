import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { ProviderCard } from '@/components/providers/ProviderCard';
import { getListedProviders, getProvidersForPortSlug, providerOffers } from '@/lib/providers-db';
import { ALL_PORTS, legacySlug, portBySlug, type PortRef } from '@/lib/ports';
import { countryPorts, directoryEntry, guidesFor } from '@/lib/port-content';
import { SERVICE_CATEGORIES } from '@/lib/services-config';
import { siteConfig } from '@/lib/site-config';
import { PORT_CSS } from '@/lib/port-css';

export const revalidate = 300;

/** A port by slug; an old slug (accents dropped) moves to the new one. */
function resolve(slug: string): PortRef | null | 'moved' {
  const p = portBySlug(slug);
  if (p) return p;
  return ALL_PORTS.some((x) => legacySlug(x.name) === slug) ? 'moved' : null;
}

export async function generateMetadata({ params }: { params: Promise<{ port: string }> }): Promise<Metadata> {
  const { port: slug } = await params;
  const port = resolve(slug);
  if (!port || port === 'moved') return { title: 'Port not found', robots: { index: false } };
  const providers = await getProvidersForPortSlug(port.slug);
  const dir = directoryEntry(port);
  const guides = guidesFor(port);
  const n = providers.length;
  const title = `Ship Agents & Marine Services in ${port.name}, ${port.country}`;
  const description = n
    ? `${n} ${n === 1 ? 'company' : 'companies'} at ${port.name}, ${port.country}: ship agents, shipchandlers and marine services. Contact them directly, free, no commission.`
    : `Ship agents, shipchandlers and marine services at ${port.name}, ${port.country}${dir ? `: port facts, pilotage and VHF` : ''}. Free for vessel operators. Providers list free.`;
  return {
    title,
    description: description.slice(0, 165),
    alternates: { canonical: `/ports/${port.slug}` },
    openGraph: { title: `${port.name} ship agents & marine services`, description, url: `/ports/${port.slug}` },
    // a port page with nothing on it yet stays out of search results until it has
    ...(n === 0 && !dir && guides.length === 0 ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function PortPage({ params }: { params: Promise<{ port: string }> }) {
  const { port: slug } = await params;
  const port = resolve(slug);
  if (port === 'moved') permanentRedirect(`/ports/${ALL_PORTS.find((x) => legacySlug(x.name) === slug)!.slug}`);
  if (!port) notFound();
  const [providers, all] = await Promise.all([getProvidersForPortSlug(port.slug), getListedProviders()]);
  const dir = directoryEntry(port);
  const guides = guidesFor(port);
  const others = countryPorts(port);
  const busy = new Set(all.flatMap((p) => p.ports.map((x) => x.slug)));
  const otherPorts = [...others.filter((p) => busy.has(p.slug)), ...others.filter((p) => !busy.has(p.slug))].slice(0, 16);
  const inCountry = providers.length === 0 ? all.filter((p) => p.country === port.country).slice(0, 6) : [];
  const groups: [string, string, typeof providers][] = [
    ['agent', 'Ship agents', providers.filter((p) => p.type === 'agent')],
    ['chandler', 'Shipchandlers', providers.filter((p) => p.type === 'chandler')],
    ['service', 'Marine services', providers.filter((p) => p.type === 'service')],
  ];
  const cats = SERVICE_CATEGORIES.map((c) => ({ c, n: providers.filter((p) => providerOffers(p, c)).length })).filter((x) => x.n > 0);
  const now = Date.now();
  const url = `${siteConfig.url}/ports/${port.slug}`;

  const faq = [
    {
      q: `How do I find a ship agent in ${port.name}?`,
      a: providers.some((p) => p.type === 'agent')
        ? `This page lists the ship agents at ${port.name} on PortServiceFinder. Open a company to see the ports it covers and contact it directly by email, phone or WhatsApp.`
        : `No ship agent has listed ${port.name} on PortServiceFinder yet. Check the other ports of ${port.country} below, or ask for quotes through our request form.`,
    },
    { q: `Is it free to contact providers in ${port.name}?`, a: 'Yes. Vessel operators contact companies directly and PortServiceFinder takes no commission on any job.' },
    ...(dir
      ? [
          { q: `Is pilotage compulsory in ${port.name}?`, a: `Pilotage at ${port.name} is ${dir.pilotage}. Port control and VTS work on ${dir.vhf}. Always confirm with the local agent and current notices.` },
          { q: `What is the maximum draft at ${port.name}?`, a: `Typically about ${dir.maxDraftM} m, depending on the berth and terminal. Your agent confirms the figure for your berth.` },
        ]
      : []),
    { q: `I provide marine services in ${port.name}. How do I get listed?`, a: 'Create your company listing for the ports you serve. Listing is free during our launch period; after it, $49.90 a month or $499.90 a year.' },
  ];

  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `Ship agents and marine services in ${port.name}, ${port.country}`,
      url,
      about: { '@type': 'Place', name: `Port of ${port.name}`, address: { '@type': 'PostalAddress', addressCountry: port.country }, ...(dir ? { geo: { '@type': 'GeoCoordinates', latitude: dir.lat, longitude: dir.lon } } : {}) },
      ...(providers.length
        ? { mainEntity: { '@type': 'ItemList', numberOfItems: providers.length, itemListElement: providers.slice(0, 50).map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.name, url: `${siteConfig.url}/providers/${p.slug}` })) } }
        : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteConfig.url}/` },
        { '@type': 'ListItem', position: 2, name: 'Ports', item: `${siteConfig.url}/ports` },
        { '@type': 'ListItem', position: 3, name: port.name, item: url },
      ],
    },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ];

  return (
    <div className="pt">
      <style>{PORT_CSS}</style>
      {ld.map((o, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(o).replace(/</g, '\\u003c') }} />
      ))}
      <SiteHeader />
      <main className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link> › <Link href="/ports">Ports</Link> › <span>{port.name}</span>
        </nav>
        <h1>
          {port.flag} Ship agents and marine services in {port.name}, {port.country}
        </h1>
        <p className="lead">
          {providers.length
            ? `${providers.length} ${providers.length === 1 ? 'company is' : 'companies are'} listed at ${port.name}: ${groups.filter((g) => g[2].length).map((g) => `${g[2].length} ${g[1].toLowerCase()}`).join(', ')}. Contact them directly, free.`
            : `No company has listed ${port.name} yet. Operators: see nearby ports below. Providers: your company can be the first one here.`}
        </p>

        {dir && (
          <section className="card facts" aria-label="Port facts">
            <h2>{port.name} at a glance</h2>
            <dl>
              <div>
                <dt>UN/LOCODE</dt>
                <dd>{dir.locode}</dd>
              </div>
              <div>
                <dt>Max draft (typical)</dt>
                <dd>{dir.maxDraftM} m</dd>
              </div>
              <div>
                <dt>Pilotage</dt>
                <dd style={{ textTransform: 'capitalize' }}>{dir.pilotage}</dd>
              </div>
              <div>
                <dt>VHF</dt>
                <dd>{dir.vhf}</dd>
              </div>
              <div>
                <dt>Working hours</dt>
                <dd>{dir.working}</dd>
              </div>
              <div>
                <dt>Time zone</dt>
                <dd>{dir.timezone}</dd>
              </div>
            </dl>
            <p className="note">{dir.notes}</p>
            <p className="tiny">Reference only: confirm current details with your agent, the port authority and notices to mariners.</p>
          </section>
        )}

        {groups
          .filter((g) => g[2].length > 0)
          .map(([k, label, list]) => (
            <section key={k} className="sec">
              <h2>
                {label} in {port.name} <span>({list.length})</span>
              </h2>
              <div className="grid">
                {list.map((p) => (
                  <ProviderCard key={p.id} p={p} now={now} />
                ))}
              </div>
            </section>
          ))}

        {inCountry.length > 0 && (
          <section className="sec">
            <h2>Companies elsewhere in {port.country}</h2>
            <div className="grid">
              {inCountry.map((p) => (
                <ProviderCard key={p.id} p={p} now={now} />
              ))}
            </div>
          </section>
        )}

        <section className="card join">
          <div>
            <h2>{providers.length ? `Work in ${port.name}? Join ${providers.length === 1 ? 'the company' : `the ${providers.length} companies`} listed here.` : `Be the first company listed in ${port.name}.`}</h2>
            <p>Operators search by port. Your listing appears here and on its own company page you can share. Free during our launch period.</p>
          </div>
          <Link href="/for-providers/signup" className="btn gold">
            List your company free
          </Link>
        </section>

        {cats.length > 0 && (
          <section className="sec">
            <h2>Services available in {port.name}</h2>
            <div className="links">
              {cats.map(({ c, n }) => (
                <Link key={c.slug} href={`/ports/${port.slug}/${c.slug}`}>
                  {c.label} <span>({n})</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {guides.length > 0 && (
          <section className="sec">
            <h2>Guides for {port.name}</h2>
            <div className="links col">
              {guides.map((g) => (
                <Link key={g.slug} href={`/blog/${g.slug}`}>
                  {g.title}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="sec">
          <h2>Questions about {port.name}</h2>
          <dl className="faq">
            {faq.map((f) => (
              <div key={f.q}>
                <dt>{f.q}</dt>
                <dd>{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {otherPorts.length > 0 && (
          <section className="sec">
            <h2>Other ports in {port.country}</h2>
            <div className="links">
              {otherPorts.map((p) => (
                <Link key={p.slug} href={`/ports/${p.slug}`}>
                  {p.name}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
