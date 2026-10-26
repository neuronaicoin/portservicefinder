import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import {
  BLOG_POSTS,
  BLOG_CATEGORY_GROUPS,
  getCategoryGroup,
  getReadingTime,
  getUpdatedDate,
  formatBlogDate,
} from '../data/blog';

export const metadata: Metadata = {
  title: 'Maritime Guides for Operators and Providers',
  description:
    'Practical guides for vessel operators, ship managers and marine service providers: port guides, ship agency, disbursement accounts, crew change and regulations.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Maritime Guides for Operators and Providers',
    description:
      'Port guides and practical maritime guides for vessel operators, ship managers, ship agents, shipchandlers and marine service companies.',
    url: '/blog',
    siteName: 'PortServiceFinder',
    type: 'website',
  },
};

type Props = { searchParams: Promise<{ category?: string | string[] }> };

const CSS = `
.bl-wrap{max-width:1120px;margin:0 auto;padding:36px 16px 0}
.bl-head h1{font-family:var(--font-display);font-size:clamp(30px,5vw,44px);line-height:1.1;font-weight:700;letter-spacing:-0.02em;color:var(--ink);margin:0 0 12px}
.bl-head p{font-size:18px;line-height:1.6;color:var(--ink2);margin:0;max-width:680px}
.bl-filters{display:flex;flex-wrap:wrap;gap:8px;margin:26px 0 28px}
.bl-chip{display:inline-flex;align-items:center;min-height:40px;padding:0 14px;border-radius:999px;border:1px solid var(--line);background:var(--card);color:var(--ink2);font-size:14px;font-weight:600;text-decoration:none}
.bl-chip:hover{border-color:var(--acc);color:var(--acc)}
.bl-chip.on{background:var(--acc);border-color:var(--acc);color:var(--on-acc)}
.bl-chip .n{font-weight:500;opacity:.75;margin-left:6px}
.bl-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.bl-card{display:flex;flex-direction:column;gap:8px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:20px;text-decoration:none;color:inherit;transition:border-color .15s}
.bl-card:hover{border-color:var(--acc)}
.bl-card .c{font-size:12px;font-weight:600;color:var(--ink3)}
.bl-card h2{font-size:17px;line-height:1.35;font-weight:650;color:var(--ink);margin:0}
.bl-card p{font-size:14px;line-height:1.55;color:var(--ink2);margin:0;flex:1}
.bl-card .m{font-size:13px;color:var(--ink3)}
.bl-lead{grid-column:span 2}
.bl-lead h2{font-size:22px}
.bl-lead p{font-size:15px}
.bl-count{font-size:14px;color:var(--ink3);margin:0 0 14px}
@media(max-width:900px){.bl-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:600px){.bl-grid{grid-template-columns:1fr}.bl-lead{grid-column:auto}.bl-head p{font-size:16px}}
`;

export default async function BlogIndexPage({ searchParams }: Props) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.category) ? sp.category[0] : sp.category;
  const active = BLOG_CATEGORY_GROUPS.find((g) => g.key === raw) || null;

  const sorted = [...BLOG_POSTS].sort(
    (a, b) => getUpdatedDate(b).localeCompare(getUpdatedDate(a)) || b.publishedDate.localeCompare(a.publishedDate),
  );
  const posts = active ? sorted.filter((p) => active.categories.includes(p.category)) : sorted;
  const counts = new Map(BLOG_CATEGORY_GROUPS.map((g) => [g.key, sorted.filter((p) => g.categories.includes(p.category)).length]));

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh', fontFamily: 'var(--font-ui)' }}>
      <style>{CSS}</style>
      <SiteHeader />

      <main className="bl-wrap">
        <header className="bl-head">
          <h1>{active ? active.label : 'Maritime guides'}</h1>
          <p>
            Practical guides for vessel operators, ship managers and marine service providers: port guides, ship agency,
            disbursement accounts, crew change, supplies and the regulations that affect port calls.
          </p>
        </header>

        <nav className="bl-filters" aria-label="Guide categories">
          <Link href="/blog" className={`bl-chip${active ? '' : ' on'}`} aria-current={active ? undefined : 'page'}>
            All<span className="n">{sorted.length}</span>
          </Link>
          {BLOG_CATEGORY_GROUPS.filter((g) => (counts.get(g.key) || 0) > 0).map((g) => (
            <Link
              key={g.key}
              href={`/blog?category=${g.key}`}
              className={`bl-chip${active?.key === g.key ? ' on' : ''}`}
              aria-current={active?.key === g.key ? 'page' : undefined}
            >
              {g.label}<span className="n">{counts.get(g.key)}</span>
            </Link>
          ))}
        </nav>

        {active && <p className="bl-count">{posts.length} guides</p>}

        <div className="bl-grid">
          {posts.map((post, i) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className={`bl-card${!active && i < 2 ? ' bl-lead' : ''}`}>
              <span className="c">
                {getCategoryGroup(post.category).label}
                {post.featuredPort && !/^(global|for providers|for operators|operations)$/i.test(post.featuredPort) ? ` · ${post.featuredPort}` : ''}
              </span>
              <h2>{post.title}</h2>
              <p>{post.excerpt.length > 180 ? post.excerpt.slice(0, 177).replace(/\s+\S*$/, '') + '...' : post.excerpt}</p>
              <span className="m">
                {formatBlogDate(getUpdatedDate(post))} · {getReadingTime(post)} min read
              </span>
            </Link>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
