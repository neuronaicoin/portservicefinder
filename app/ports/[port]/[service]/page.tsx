import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { ProviderCard } from '@/components/providers/ProviderCard';
import { getListedProviders, getProvidersForPortSlug, providerOffers } from '@/lib/providers-db';
import { ALL_PORTS, legacySlug, portBySlug } from '@/lib/ports';
import { countryPorts } from '@/lib/port-content';
import { SERVICE_CATEGORIES, getServiceBySlug } from '@/lib/services-config';
import { siteConfig } from '@/lib/site-config';
import { PORT_CSS } from '@/lib/port-css';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ port: string; service: string }> }): Promise<Metadata> {
  const { port: slug, service: svcSlug } = await params;
  const port = portBySlug(slug);
  const cat = getServiceBySlug(svcSlug);
  if (!port || !cat) return { title: 'Not found', robots: { index: false } };
  const list = (await getProvidersForPortSlug(port.slug)).filter((p) => providerOffers(p, cat));
  const n = list.length;
  return {
    title: `${cat.label} in ${port.name}, ${port.country}`,
    description: (n
      ? `${n} ${cat.shortLabel.toLowerCase()} ${n === 1 ? 'provider' : 'providers'} at ${port.name}, ${port.country}. ${cat.description}. Contact them directly, free, no commission.`
      : `${cat.label} at ${port.name}, ${port.country}: ${cat.description.toLowerCase()}. See providers nearby and contact them directly.`
    ).slice(0, 165),
    alternates: { canonical: `/ports/${port.slug}/${cat.slug}` },
    // only combinations with at least one company are offered to search engines
    ...(n === 0 ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function PortServicePage({ params }: { params: Promise<{ port: string; service: string }> }) {
  const { port: slug, service: svcSlug } = await params;
  const cat = getServiceBySlug(svcSlug);
  if (!cat) notFound();
  const port = portBySlug(slug);
  if (!port) {
    const moved = ALL_PORTS.find((x) => legacySlug(x.name) === slug);
    if (moved) permanentRedirect(`/ports/${moved.slug}/${cat.slug}`);
    notFound();
  }
  const [atPort, all] = await Promise.all([getProvidersForPortSlug(port.slug), getListedProviders()]);
  const list = atPort.filter((p) => providerOffers(p, cat));
  const sameCountry = list.length < 3 ? all.filter((p) => p.country === port.country && providerOffers(p, cat) && !list.includes(p)).slice(0, 6) : [];
  const otherCats = SERVICE_CATEGORIES.filter((c) => c.slug !== cat.slug && atPort.some((p) => providerOffers(p, c)));
  const otherPorts = countryPorts(port)
    .filter((p) => all.some((x) => providerOffers(x, cat) && x.ports.some((y) => y.slug === p.slug)))
    .slice(0, 12);
  const now = Date.now();
  const url = `${siteConfig.url}/ports/${port.slug}/${cat.slug}`;

  const faq = [
    {
      q: `How do I find ${cat.shortLabel.toLowerCase()} services in ${port.name}?`,
      a: list.length
        ? `${list.length} ${list.length === 1 ? 'company offers' : 'companies offer'} ${cat.shortLabel.toLowerCase()} at ${port.name} on PortServiceFinder. Open a company, check the ports it covers and contact it directly.`
        : `No company has listed ${cat.shortLabel.toLowerCase()} at ${port.name} yet. ${sameCountry.length ? `Companies elsewhere in ${port.country} are shown on this page.` : 'Try the main port page or other ports in the country.'}`,
    },
    { q: `What does ${cat.label.toLowerCase()} include?`, a: cat.longDescription },
    { q: 'Do I pay PortServiceFinder anything?', a: 'No. Searching and contacting providers is free for vessel operators, and there is no commission on any job.' },
  ];

  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `${cat.label} in ${port.name}`,
      serviceType: cat.label,
      description: cat.longDescription,
      areaServed: { '@type': 'Place', name: `Port of ${port.name}, ${port.country}` },
      url,
      ...(list.length ? { provider: list.slice(0, 20).map((p) => ({ '@type': 'LocalBusiness', name: p.name, url: `${siteConfig.url}/providers/${p.slug}` })) } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteConfig.url}/` },
        { '@type': 'ListItem', position: 2, name: 'Ports', item: `${siteConfig.url}/ports` },
        { '@type': 'ListItem', position: 3, name: port.name, item: `${siteConfig.url}/ports/${port.slug}` },
        { '@type': 'ListItem', position: 4, name: cat.label, item: url },
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
          <Link href="/">Home</Link> › <Link href="/ports">Ports</Link> › <Link href={`/ports/${port.slug}`}>{port.name}</Link> › <span>{cat.label}</span>
        </nav>
        <h1>
          {cat.label} in {port.name}, {port.country}
        </h1>
        <p className="lead">{cat.longDescription}</p>

        {list.length > 0 ? (
          <section className="sec">
            <h2>
              {list.length} {list.length === 1 ? 'company' : 'companies'} at {port.name}
            </h2>
            <div className="grid">
              {list.map((p) => (
                <ProviderCard key={p.id} p={p} now={now} />
              ))}
            </div>
          </section>
        ) : (
          <section className="card">
            <h2>No {cat.shortLabel.toLowerCase()} company listed at {port.name} yet</h2>
            <p className="note">
              See the <Link href={`/ports/${port.slug}`}>{port.name} port page</Link> for every company there{sameCountry.length ? `, or the companies elsewhere in ${port.country} below` : ''}.
            </p>
          </section>
        )}

        {sameCountry.length > 0 && (
          <section className="sec">
            <h2>
              {cat.shortLabel} elsewhere in {port.country}
            </h2>
            <div className="grid">
              {sameCountry.map((p) => (
                <ProviderCard key={p.id} p={p} now={now} />
              ))}
            </div>
          </section>
        )}

        <section className="card join">
          <div>
            <h2>
              Offer {cat.shortLabel.toLowerCase()} in {port.name}?
            </h2>
            <p>List your company free during our launch period and appear on this page for operators searching {port.name}.</p>
          </div>
          <Link href="/for-providers/signup" className="btn gold">
            List your company free
          </Link>
        </section>

        {otherCats.length > 0 && (
          <section className="sec">
            <h2>More services in {port.name}</h2>
            <div className="links">
              {otherCats.map((c) => (
                <Link key={c.slug} href={`/ports/${port.slug}/${c.slug}`}>
                  {c.label}
                </Link>
              ))}
            </div>
          </section>
        )}

        {otherPorts.length > 0 && (
          <section className="sec">
            <h2>
              {cat.shortLabel} in other ports of {port.country}
            </h2>
            <div className="links">
              {otherPorts.map((p) => (
                <Link key={p.slug} href={`/ports/${p.slug}/${cat.slug}`}>
                  {p.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="sec">
          <h2>Questions</h2>
          <dl className="faq">
            {faq.map((f) => (
              <div key={f.q}>
                <dt>{f.q}</dt>
                <dd>{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
