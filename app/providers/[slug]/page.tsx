import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { ProviderAvatar } from '@/components/home/ProviderAvatar';
import { ContactActions } from '@/components/providers/ContactActions';
import { ShareListing } from '@/components/providers/ShareListing';
import { getListedProviders, getProviderBySlug, initials, providerOffers, type ListedProvider } from '@/lib/providers-db';
import { CHANDLER_CATEGORIES, MARINE_SERVICES } from '@/lib/ports';
import { SERVICE_CATEGORIES } from '@/lib/services-config';
import { siteConfig } from '@/lib/site-config';

export const revalidate = 300;

const LABEL: Record<string, string> = Object.fromEntries([...MARINE_SERVICES, ...CHANDLER_CATEGORIES].map((s) => [s.key, s.label]));

/** What the company offers, in words (its categories, else its type). */
function services(p: ListedProvider): string[] {
  if (p.type === 'agent') return ['Ship agency'];
  if (p.type === 'chandler') return ['Ship supply (chandlery)', ...p.svc.filter((s) => s !== 'chandler').map((s) => LABEL[s]).filter(Boolean)];
  const out = p.svc.map((s) => LABEL[s]).filter(Boolean);
  return out.length ? out : ['Marine services'];
}

const placeOf = (p: ListedProvider) => (p.ports[0] ? `${p.ports[0].name}, ${p.country}` : p.country);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProviderBySlug(slug);
  if (!p) return { title: 'Company not found', robots: { index: false } };
  const svc = services(p);
  const ports = p.ports.map((x) => x.name);
  const title = `${p.name}: ${svc[0]} in ${ports.slice(0, 2).join(' & ') || p.country}`;
  const description = `${p.name} is a ${p.typeLabel.toLowerCase()} in ${p.country} serving ${ports.slice(0, 4).join(', ')}${ports.length > 4 ? ' and more' : ''}. ${svc.slice(0, 3).join(', ')}. Contact them directly, free.`.slice(0, 165);
  return {
    title,
    description,
    alternates: { canonical: `/providers/${p.slug}` },
    openGraph: { title: `${p.name} on PortServiceFinder`, description, url: `/providers/${p.slug}`, type: 'profile' },
    twitter: { card: 'summary_large_image', title: `${p.name} on PortServiceFinder`, description },
  };
}

export default async function ProviderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProviderBySlug(slug);
  if (!p) notFound();
  const all = await getListedProviders();
  const svc = services(p);
  const place = placeOf(p);
  const url = `${siteConfig.url}/providers/${p.slug}`;
  const joined = new Date(p.joinedAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const portSlugs = new Set(p.ports.map((x) => x.slug));
  const nearby = all.filter((o) => o.id !== p.id && o.ports.some((x) => portSlugs.has(x.slug))).slice(0, 6);
  const sameCountry = nearby.length < 3 ? all.filter((o) => o.id !== p.id && o.country === p.country && !nearby.includes(o)).slice(0, 6 - nearby.length) : [];
  const cats = SERVICE_CATEGORIES.filter((c) => providerOffers(p, c));
  const mainPort = p.ports[0];

  const faq = [
    { q: `Which ports does ${p.name} serve?`, a: `${p.name} lists ${p.ports.map((x) => x.name).join(', ')} in ${p.country}.` },
    { q: `What services does ${p.name} offer?`, a: `${svc.join(', ')}.${p.bio ? ` In their words: ${p.bio.slice(0, 220)}${p.bio.length > 220 ? '…' : ''}` : ''}` },
    { q: `How do I contact ${p.name}?`, a: `Use the contact buttons on this page${p.email ? ' to email' : ''}${p.phone ? ', call' : ''}${p.whatsapp ? ' or message them on WhatsApp' : ''}. You deal with the company directly; PortServiceFinder takes no commission.` },
    { q: `Is ${p.name} verified?`, a: `${p.name} created this listing itself on PortServiceFinder in ${joined}. As with any new supplier, check references, certificates and insurance before you appoint them.` },
  ];

  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `${url}#company`,
      name: p.name,
      description: p.bio || `${p.typeLabel} in ${place}.`,
      url,
      ...(p.website ? { sameAs: [/^https?:/i.test(p.website) ? p.website : `https://${p.website}`] } : {}),
      ...(p.phone ? { telephone: p.phone } : {}),
      ...(p.email ? { email: p.email } : {}),
      address: { '@type': 'PostalAddress', addressCountry: p.country, ...(p.address ? { streetAddress: p.address } : {}), ...(mainPort ? { addressLocality: mainPort.name } : {}) },
      areaServed: p.ports.map((x) => ({ '@type': 'Place', name: `Port of ${x.name}, ${x.country}` })),
      knowsAbout: svc,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteConfig.url}/` },
        { '@type': 'ListItem', position: 2, name: 'Providers', item: `${siteConfig.url}/providers` },
        ...(mainPort ? [{ '@type': 'ListItem', position: 3, name: mainPort.name, item: `${siteConfig.url}/ports/${mainPort.slug}` }] : []),
        { '@type': 'ListItem', position: mainPort ? 4 : 3, name: p.name, item: url },
      ],
    },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ];

  return (
    <div className="pp">
      <style>{CSS}</style>
      {ld.map((o, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(o).replace(/</g, '\\u003c') }} />
      ))}
      <SiteHeader />
      <main className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link> › <Link href="/providers">Providers</Link>
          {mainPort && (
            <>
              {' '}
              › <Link href={`/ports/${mainPort.slug}`}>{mainPort.name}</Link>
            </>
          )}{' '}
          › <span>{p.name}</span>
        </nav>

        <header className="head">
          <ProviderAvatar text={initials(p.name)} size={68} />
          <div style={{ minWidth: 0 }}>
            <h1>{p.name}</h1>
            <p className="meta">
              {p.flag} {place} · {p.typeLabel} · Joined {joined}
            </p>
          </div>
        </header>

        <section className="card m-only">
          <ContactActions providerId={p.id} name={p.name} phone={p.phone} email={p.email} whatsapp={p.whatsapp} website={p.website} />
        </section>

        <div className="cols">
          <div className="main">
            <section className="card">
              <h2>About {p.name}</h2>
              <p className="bio">{p.bio || `${p.name} is a ${p.typeLabel.toLowerCase()} serving ${p.ports.map((x) => x.name).join(', ')} in ${p.country}.`}</p>
              {p.contactPerson && <p className="small">Contact person: {p.contactPerson}</p>}
              {p.address && <p className="small">Address: {p.address}</p>}
            </section>

            <section className="card">
              <h2>Services</h2>
              <div className="chips">
                {svc.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
            </section>

            <section className="card">
              <h2>Ports served</h2>
              <div className="chips">
                {p.ports.map((x) => (
                  <Link key={x.slug} href={`/ports/${x.slug}`}>
                    {x.flag} {x.name}
                  </Link>
                ))}
              </div>
              {cats.length > 0 && mainPort && (
                <p className="small" style={{ marginTop: 12 }}>
                  Also listed under:{' '}
                  {cats.slice(0, 4).map((c, i) => (
                    <span key={c.slug}>
                      {i > 0 && ', '}
                      <Link href={`/ports/${mainPort.slug}/${c.slug}`}>
                        {c.label} in {mainPort.name}
                      </Link>
                    </span>
                  ))}
                </p>
              )}
            </section>

            <section className="card">
              <h2>Questions about {p.name}</h2>
              <dl className="faq">
                {faq.map((f) => (
                  <div key={f.q}>
                    <dt>{f.q}</dt>
                    <dd>{f.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          <aside className="side">
            <section className="card d-only">
              <h2>Contact</h2>
              <ContactActions providerId={p.id} name={p.name} phone={p.phone} email={p.email} whatsapp={p.whatsapp} website={p.website} />
              <p className="small" style={{ marginTop: 10 }}>
                Direct contact, no commission. Mention PortServiceFinder when you get in touch.
              </p>
            </section>

            <section className="card">
              <h2>Share this company</h2>
              <ShareListing url={url} name={p.name} place={place} service={svc[0]} />
              <details className="owner">
                <summary>Is this your company? Share your listing</summary>
                <ShareListing url={url} name={p.name} place={place} service={svc[0]} owner />
              </details>
            </section>

            {(nearby.length > 0 || sameCountry.length > 0) && (
              <section className="card">
                <h2>{nearby.length ? `Other companies in ${mainPort?.name || p.country}` : `Other companies in ${p.country}`}</h2>
                {[...nearby, ...sameCountry].map((o) => (
                  <Link key={o.id} href={`/providers/${o.slug}`} className="mini">
                    <ProviderAvatar text={initials(o.name)} size={34} />
                    <span>
                      <b>{o.name}</b>
                      <small>
                        {o.typeLabel} · {o.ports[0]?.name}
                      </small>
                    </span>
                  </Link>
                ))}
              </section>
            )}

            <section className="card cta">
              <h2>Run a marine service company?</h2>
              <p className="small">Get your own company page and appear on every port you serve. Free during our launch period.</p>
              <Link href="/for-providers/signup" className="btn gold">
                List your company free
              </Link>
            </section>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

const CSS = `
.pp{background:var(--bg);min-height:100vh}
.pp .wrap{max-width:1200px;margin:0 auto;padding:0 20px}
.pp .crumbs{font-size:13.5px;color:var(--ink3);padding-top:18px}
.pp .crumbs a{color:var(--ink3);text-decoration:none}.pp .crumbs a:hover{color:var(--acc)}
.pp .head{display:flex;gap:18px;align-items:center;padding:22px 0 20px}
.pp h1{font-size:clamp(26px,4vw,36px);margin:0;letter-spacing:-0.03em;line-height:1.15;font-weight:800;overflow-wrap:anywhere}
.pp .meta{color:var(--ink2);margin:6px 0 0;font-size:15px}
.pp .cols{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(0,1fr);gap:18px;align-items:start}
.pp .main,.pp .side{display:grid;gap:14px;min-width:0}
.pp .card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px 20px}
.pp h2{font-size:16px;margin:0 0 12px;font-weight:700}
.pp .bio{color:var(--ink2);line-height:1.7;margin:0;white-space:pre-line;font-size:15.5px}
.pp .small{color:var(--ink3);font-size:13.5px;line-height:1.55;margin:8px 0 0}
.pp .small a{color:var(--acc);text-decoration:none}
.pp .chips{display:flex;flex-wrap:wrap;gap:8px}
.pp .chips span,.pp .chips a{border:1px solid var(--line);border-radius:9px;padding:6px 11px;font-size:14px;background:var(--bg);color:var(--ink);text-decoration:none}
.pp .chips a:hover{border-color:var(--acc);color:var(--acc)}
.pp .faq{margin:0;display:grid;gap:14px}.pp .faq dt{font-weight:650}.pp .faq dd{margin:4px 0 0;color:var(--ink2);line-height:1.6}
.pp .mini{display:flex;gap:10px;align-items:center;padding:9px 0;border-bottom:1px solid var(--line);text-decoration:none;color:inherit}
.pp .mini:last-child{border-bottom:0}.pp .mini b{display:block;font-size:14px}.pp .mini small{color:var(--ink3);font-size:12.5px}
.pp .owner{margin-top:14px;border-top:1px solid var(--line);padding-top:12px}
.pp .owner summary{cursor:pointer;font-weight:600;color:var(--acc);font-size:14px;margin-bottom:10px}
.pp .btn{display:inline-flex;margin-top:12px;background:var(--acc);color:var(--on-acc);padding:11px 16px;border-radius:10px;font-weight:650;text-decoration:none}
.pp .cta{background:linear-gradient(135deg,color-mix(in srgb,var(--acc) 10%,var(--card)),var(--card))}
.pp .m-only{display:none}
@media (max-width:900px){.pp .cols{grid-template-columns:1fr}.pp .m-only{display:block;margin-bottom:14px}.pp .d-only{display:none}}
@media (max-width:520px){.pp .wrap{padding:0 16px}.pp .head{gap:14px}.pp .card{padding:16px}}
`;
