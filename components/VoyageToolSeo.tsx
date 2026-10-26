import Link from 'next/link';
import { VOYAGE_SEO } from '@/lib/voyage-seo';
import { siteConfig } from '@/lib/site-config';

// Server component: SEO / answer-engine content rendered below each Voyage Hub tool.

function jsonLd(obj: unknown) {
  return { __html: JSON.stringify(obj).replace(/</g, '\\u003c') };
}

const h2: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 20,
  fontWeight: 700,
  color: 'var(--ink)',
  margin: '0 0 12px',
  lineHeight: 1.3,
};

const body: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: 15,
  lineHeight: 1.7,
  color: 'var(--ink2)',
};

const block: React.CSSProperties = { marginBottom: 32 };

export function VoyageToolSeo({ slug }: { slug: string }) {
  const seo = VOYAGE_SEO[slug];
  if (!seo) return null;

  const base = siteConfig.url;
  const url = `${base}/voyage/${slug}`;
  const related = seo.related
    .map((s) => ({ slug: s, entry: VOYAGE_SEO[s] }))
    .filter((r) => r.entry);

  const ld: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${base}/` },
        { '@type': 'ListItem', position: 2, name: 'Voyage Hub', item: `${base}/voyage` },
        { '@type': 'ListItem', position: 3, name: seo.name, item: url },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: seo.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];
  if (seo.category !== 'hub') {
    ld.unshift({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: seo.name,
      description: seo.description,
      url,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      publisher: { '@type': 'Organization', name: siteConfig.name, url: base },
    });
  }

  return (
    <section
      aria-labelledby="voyage-tool-about"
      className="vts"
      style={{
        maxWidth: 900,
        margin: '56px auto 0',
        padding: '32px 0 8px',
        borderTop: '1px solid var(--line)',
        color: 'var(--ink)',
      }}
    >
      {ld.map((obj, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={jsonLd(obj)} />
      ))}

      <nav aria-label="Breadcrumb" style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--ink3)', marginBottom: 20 }}>
        <Link href="/" style={{ color: 'var(--ink3)' }}>Home</Link>
        <span aria-hidden="true"> / </span>
        <Link href="/voyage" style={{ color: 'var(--ink3)' }}>Voyage Hub</Link>
        <span aria-hidden="true"> / </span>
        <span style={{ color: 'var(--ink2)' }}>{seo.name}</span>
      </nav>

      <div style={block}>
        <h2 id="voyage-tool-about" style={h2}>About this tool</h2>
        <p style={{ ...body, margin: 0 }}>{seo.intro}</p>
      </div>

      <div style={block}>
        <h2 style={h2}>How to use it</h2>
        <ol style={{ ...body, margin: 0, paddingLeft: 22 }}>
          {seo.howTo.map((step) => (
            <li key={step} style={{ marginBottom: 6, paddingLeft: 4 }}>{step}</li>
          ))}
        </ol>
      </div>

      <div style={block}>
        <h2 style={h2}>Frequently asked questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {seo.faq.map((f) => (
            <details
              key={f.q}
              className="vts-faq"
              style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12 }}
            >
              <summary
                style={{
                  cursor: 'pointer',
                  padding: '12px 16px',
                  minHeight: 44,
                  display: 'flex',
                  alignItems: 'center',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--ink)',
                  lineHeight: 1.4,
                }}
              >
                {f.q}
              </summary>
              <p style={{ ...body, margin: 0, padding: '0 16px 14px' }}>{f.a}</p>
            </details>
          ))}
        </div>
      </div>

      {related.length > 0 && (
        <div style={block}>
          <h2 style={h2}>Related tools</h2>
          <ul
            className="vts-related"
            style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}
          >
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/voyage/${r.slug}`}
                  style={{
                    display: 'block',
                    minHeight: 44,
                    padding: '12px 16px',
                    background: 'var(--card)',
                    border: '1px solid var(--line)',
                    borderRadius: 12,
                    textDecoration: 'none',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 15,
                    fontWeight: 600,
                    color: 'var(--acc)',
                  }}
                >
                  {r.entry.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--ink3)', margin: '0 0 8px' }}>
        Free, no signup. Your data stays in your browser.
      </p>

      <style>{`
        .vts-faq summary::-webkit-details-marker { display: none; }
        .vts-faq summary { list-style: none; }
        .vts-faq summary::after { content: '+'; margin-left: auto; padding-left: 12px; color: var(--ink3); font-weight: 400; }
        .vts-faq[open] summary::after { content: '\\2212'; }
        .vts a:focus-visible, .vts summary:focus-visible { outline: 2px solid var(--acc); outline-offset: 2px; }
        @media (max-width: 560px) {
          .vts-related { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

export default VoyageToolSeo;
