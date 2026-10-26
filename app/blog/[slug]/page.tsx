import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import {
  BLOG_POSTS,
  getBlogPost,
  getRelatedPosts,
  getReadingTime,
  getUpdatedDate,
  getWordCount,
  getCategoryGroup,
  formatBlogDate,
  type BlogPost,
} from '@/app/data/blog';
import { renderMarkdown, extractFaqs, absoluteUrl } from '../markdown';
import { breadcrumbPort, contextLinksForPost, isProviderPost } from '../context-links';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** <title> text without the brand suffix (the root layout adds it), kept near 60 characters. */
function seoTitle(post: BlogPost): string {
  if (post.seoTitle) return post.seoTitle;
  const t = post.title.replace(/\s+/g, ' ').trim();
  if (t.length <= 60) return t;
  const first = t.split(/: | — | - | \(/)[0].trim();
  if (first.length >= 20 && first.length <= 70) return first;
  const words = t.split(' ');
  let out = '';
  for (const w of words) {
    if ((out + ' ' + w).trim().length > 58) break;
    out = (out + ' ' + w).trim();
  }
  return out.replace(/[\s,:;—-]+(and|or|the|a|an|of|for|to|in|with)?$/i, '').trim();
}

function jsonLd(obj: object) {
  return { __html: JSON.stringify(obj).replace(/</g, '\\u003c') };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) {
    return { title: 'Guide not found', robots: { index: false, follow: true } };
  }
  const description = post.metaDescription || post.excerpt;
  const path = `/blog/${post.slug}`;
  return {
    title: seoTitle(post),
    description,
    keywords: post.keywords,
    authors: [{ name: 'PortServiceFinder', url: absoluteUrl('/about') }],
    alternates: { canonical: path },
    openGraph: {
      title: post.title,
      description,
      url: path,
      type: 'article',
      siteName: 'PortServiceFinder',
      publishedTime: post.publishedDate,
      modifiedTime: getUpdatedDate(post),
      authors: ['PortServiceFinder'],
      tags: post.keywords,
    },
    twitter: { card: 'summary_large_image', title: post.title, description },
  };
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

const CSS = `
.bp-wrap{max-width:720px;margin:0 auto;padding:28px 16px 0}
.bp-crumbs{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:13px;color:var(--ink3);margin-bottom:22px;min-width:0}
.bp-crumbs a{color:var(--ink3);text-decoration:none;padding:6px 0}
.bp-crumbs a:hover{color:var(--acc)}
.bp-crumbs .cur{color:var(--ink2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;min-width:0;flex:1 1 160px}
.bp-label{font-size:13px;font-weight:600;color:var(--ink3);margin-bottom:10px}
.bp-title{font-family:var(--font-display);font-size:clamp(28px,5vw,40px);line-height:1.15;font-weight:700;letter-spacing:-0.02em;color:var(--ink);margin:0 0 16px}
.bp-excerpt{font-size:19px;line-height:1.6;color:var(--ink2);margin:0 0 20px}
.bp-meta{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:14px;color:var(--ink3);padding-bottom:22px;border-bottom:1px solid var(--line)}
.bp-meta strong{color:var(--ink2);font-weight:600}
.bp-toc{margin:28px 0 8px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px 20px}
.bp-toc h2{font-size:15px;font-weight:650;color:var(--ink);margin:0 0 10px}
.bp-toc ol{margin:0;padding-left:20px;display:grid;gap:6px}
.bp-toc a{color:var(--ink2);text-decoration:none;font-size:15px;line-height:1.45}
.bp-toc a:hover{color:var(--acc);text-decoration:underline}
.bp-body{font-family:var(--font-ui);font-size:18px;line-height:1.7;color:var(--ink);overflow-wrap:break-word}
.bp-body>*:first-child{margin-top:28px}
.bp-body p{margin:0 0 1.15em}
.bp-body h2{font-family:var(--font-display);font-size:clamp(23px,3.4vw,28px);line-height:1.25;font-weight:700;letter-spacing:-0.01em;color:var(--ink);margin:2.2em 0 .6em;scroll-margin-top:84px}
.bp-body h3{font-size:20px;line-height:1.35;font-weight:650;color:var(--ink);margin:1.7em 0 .5em;scroll-margin-top:84px}
.bp-body h4{font-size:18px;font-weight:650;margin:1.4em 0 .4em}
.bp-body ul,.bp-body ol{margin:0 0 1.2em;padding-left:1.4em}
.bp-body li{margin:0 0 .45em;padding-left:.2em}
.bp-body li::marker{color:var(--ink3)}
.bp-body a{color:var(--acc);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:3px}
.bp-body a:hover{color:var(--acc-h)}
.bp-body strong{font-weight:650;color:var(--ink)}
.bp-body code{font-size:.9em;background:var(--bg2);border:1px solid var(--line);border-radius:6px;padding:1px 5px}
.bp-body hr{border:0;border-top:1px solid var(--line);margin:2em 0}
.bp-body blockquote{margin:1.4em 0;padding:4px 0 4px 18px;border-left:3px solid var(--line);color:var(--ink2)}
.bp-body .bp-q{margin:1.6em 0 .4em;font-weight:650}
.bp-table{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:1.5em 0 1.8em;border:1px solid var(--line);border-radius:12px;background:var(--card)}
.bp-table table{width:100%;border-collapse:collapse;font-size:15px;line-height:1.5;min-width:520px}
.bp-table th{text-align:left;font-weight:650;color:var(--ink);background:var(--bg2);padding:10px 14px;border-bottom:1px solid var(--line);vertical-align:bottom}
.bp-table td{padding:10px 14px;border-bottom:1px solid var(--line);color:var(--ink2);vertical-align:top}
.bp-table tr:last-child td{border-bottom:0}
.bp-box{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:20px}
.bp-box h2{font-size:18px;font-weight:650;color:var(--ink);margin:0 0 12px}
.bp-links{list-style:none;margin:0;padding:0;display:grid;gap:4px}
.bp-links a{display:block;padding:10px 0;text-decoration:none;border-bottom:1px solid var(--line)}
.bp-links li:last-child a{border-bottom:0}
.bp-links .t{color:var(--acc);font-weight:600;font-size:16px}
.bp-links .n{display:block;color:var(--ink3);font-size:14px;margin-top:2px}
.bp-cta{display:grid;gap:12px;margin-top:20px}
.bp-cta .bp-box p{color:var(--ink2);font-size:15px;line-height:1.6;margin:0 0 14px}
.bp-btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 18px;border-radius:10px;font-weight:600;font-size:15px;text-decoration:none}
.bp-btn.pri{background:var(--acc);color:var(--on-acc)}
.bp-btn.pri:hover{background:var(--acc-h)}
.bp-btn.sec{border:1px solid var(--line);color:var(--ink)}
.bp-btn.sec:hover{border-color:var(--acc);color:var(--acc)}
.bp-related{max-width:1080px;margin:56px auto 0;padding:0 16px}
.bp-related h2{font-family:var(--font-display);font-size:24px;font-weight:700;color:var(--ink);margin:0 0 16px}
.bp-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
.bp-card{display:flex;flex-direction:column;gap:8px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px;text-decoration:none;color:inherit;transition:border-color .15s}
.bp-card:hover{border-color:var(--acc)}
.bp-card .c{font-size:12px;font-weight:600;color:var(--ink3)}
.bp-card h3{font-size:16px;line-height:1.35;font-weight:650;color:var(--ink);margin:0}
.bp-card p{font-size:14px;line-height:1.55;color:var(--ink2);margin:0;flex:1}
.bp-card .m{font-size:13px;color:var(--ink3)}
@media(max-width:960px){.bp-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:560px){.bp-grid{grid-template-columns:1fr}.bp-body{font-size:17px}.bp-excerpt{font-size:17px}.bp-wrap{padding-top:18px}}
`;

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const path = `/blog/${post.slug}`;
  const url = absoluteUrl(path);
  const { html, headings } = renderMarkdown(post.content);
  const toc = headings.filter((h) => h.level === 2);
  const faqs = extractFaqs(post.content);
  const related = getRelatedPosts(post, 4);
  const port = breadcrumbPort(post);
  const links = contextLinksForPost(post);
  const providerPost = isProviderPost(post);
  const readingTime = getReadingTime(post);
  const updated = getUpdatedDate(post);
  const group = getCategoryGroup(post.category);

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Guides', path: '/blog' },
    ...(port ? [{ name: port.name, path: `/ports/${port.slug}` }] : []),
    { name: post.title, path },
  ];

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: post.title.length > 110 ? post.title.slice(0, 107) + '...' : post.title,
    description: post.metaDescription || post.excerpt,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    datePublished: post.publishedDate,
    dateModified: updated,
    author: { '@type': 'Organization', name: 'PortServiceFinder', url: absoluteUrl('/about') },
    publisher: {
      '@type': 'Organization',
      name: 'PortServiceFinder',
      url: absoluteUrl('/'),
      logo: { '@type': 'ImageObject', url: absoluteUrl('/icon-512.png') },
    },
    image: absoluteUrl('/og-image.png'),
    keywords: post.keywords?.join(', '),
    articleSection: group.label,
    wordCount: getWordCount(post),
    timeRequired: `PT${readingTime}M`,
    inLanguage: 'en',
    isAccessibleForFree: true,
    ...(port ? { about: { '@type': 'Place', name: `${port.name}, ${port.country}`, url: absoluteUrl(`/ports/${port.slug}`) } } : {}),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };

  const faqSchema =
    faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer },
          })),
        }
      : null;

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh', fontFamily: 'var(--font-ui)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(articleSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbSchema)} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqSchema)} />}
      <style>{CSS}</style>

      <SiteHeader />

      <main>
        <div className="bp-wrap">
          <nav aria-label="Breadcrumb" className="bp-crumbs">
            {crumbs.slice(0, -1).map((c) => (
              <span key={c.path} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                <Link href={c.path}>{c.name}</Link>
                <span aria-hidden="true">/</span>
              </span>
            ))}
            <span className="cur" aria-current="page">{post.title}</span>
          </nav>

          <article>
            <header>
              <div className="bp-label">
                <Link href={`/blog?category=${group.key}`} style={{ color: 'inherit', textDecoration: 'none' }}>{group.label}</Link>
                {port ? <> · <Link href={`/ports/${port.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{port.flag} {port.name}</Link></> : null}
              </div>
              <h1 className="bp-title">{post.title}</h1>
              {post.excerpt && <p className="bp-excerpt">{post.excerpt}</p>}
              <div className="bp-meta">
                <span>By <strong>PortServiceFinder</strong></span>
                <span>Published <time dateTime={post.publishedDate}>{formatBlogDate(post.publishedDate)}</time></span>
                {updated !== post.publishedDate && (
                  <span>Updated <time dateTime={updated}>{formatBlogDate(updated)}</time></span>
                )}
                <span>{readingTime} min read</span>
              </div>
            </header>

            {toc.length >= 3 && (
              <nav className="bp-toc" aria-label="In this guide">
                <h2>In this guide</h2>
                <ol>
                  {toc.map((h) => (
                    <li key={h.id}><a href={`#${h.id}`}>{h.text}</a></li>
                  ))}
                </ol>
              </nav>
            )}

            <div className="bp-body" dangerouslySetInnerHTML={{ __html: html }} />
          </article>

          {links.length > 0 && (
            <aside className="bp-box" style={{ marginTop: 40 }} aria-label="Related pages">
              <h2>Useful pages for this topic</h2>
              <ul className="bp-links">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>
                      <span className="t">{l.label}</span>
                      <span className="n">{l.note}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}

          <section className="bp-cta" aria-label="Next steps">
            {providerPost ? (
              <>
                <div className="bp-box">
                  <h2>List your company where operators search</h2>
                  <p>
                    Operators search PortServiceFinder by port and service and contact providers directly, with no commission.
                    Listing is free during our launch period. After the launch period, listings will cost $49.90/month or $499.90/year.
                  </p>
                  <Link href="/for-providers/signup" className="bp-btn pri gold">List your company free</Link>
                </div>
                <div className="bp-box">
                  <h2>Need a provider yourself?</h2>
                  <p>Search ship agents, shipchandlers and marine service companies at 1,200+ ports. Free for vessel operators.</p>
                  <Link href="/providers" className="bp-btn sec">Search providers</Link>
                </div>
              </>
            ) : (
              <>
                <div className="bp-box">
                  <h2>{port ? `Find providers in ${port.name}` : 'Find a provider for your next port call'}</h2>
                  <p>
                    Search ship agents, shipchandlers and marine service companies at 1,200+ ports and contact them directly.
                    Free for vessel operators. No commission, ever.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    <Link href={port ? `/ports/${port.slug}` : '/providers'} className="bp-btn pri">
                      {port ? `Search ${port.name}` : 'Search providers'}
                    </Link>
                    <Link href="/request-quote" className="bp-btn sec">Request a quote</Link>
                  </div>
                </div>
                <div className="bp-box">
                  <h2>Are you a marine service provider?</h2>
                  <p>
                    List your company so operators can find you at the ports you serve. Listing is free during our launch period.
                    After the launch period, listings will cost $49.90/month or $499.90/year.
                  </p>
                  <Link href="/for-providers/signup" className="bp-btn pri gold">List your company free</Link>
                </div>
              </>
            )}
          </section>
        </div>

        {related.length > 0 && (
          <section className="bp-related" aria-label="Related guides">
            <h2>Related guides</h2>
            <div className="bp-grid">
              {related.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`} className="bp-card">
                  <span className="c">{getCategoryGroup(r.category).label}</span>
                  <h3>{r.title}</h3>
                  <p>{r.excerpt.length > 140 ? r.excerpt.slice(0, 137).replace(/\s+\S*$/, '') + '...' : r.excerpt}</p>
                  <span className="m">{getReadingTime(r)} min read</span>
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
