import type { Metadata } from 'next';
import { getListedProviders, getListingStats } from '@/lib/providers-db';
import { BLOG_POSTS } from '@/app/data/blog';
import { PSC_US_ZONES, pscRate } from '@/lib/psc-us';
import { XApp, type FeedItem, type XProvider } from './XApp';

// Private preview of the X-style app. Not indexed; every real page and URL stays as it is.
export const metadata: Metadata = { title: 'PortServiceFinder', robots: { index: false, follow: false } };
export const revalidate = 600;

const tag = (s: string) => '#' + s.replace(/[^A-Za-z0-9]/g, '');

export default async function XPreview() {
  const [all, stats] = await Promise.all([getListedProviders(), getListingStats()]);
  const providers: XProvider[] = all.map((p) => ({
    s: p.slug, n: p.name, t: p.type, tl: p.typeLabel, c: p.country, f: p.flag,
    p: p.ports.map((x) => x.slug), sv: p.svc, b: (p.bio || '').slice(0, 220),
    wa: p.whatsapp || '', ph: p.phone || '', em: p.email || '', w: p.website || '',
    cl: p.claimed, j: p.joinedAt,
  }));

  const items: FeedItem[] = [];
  const members = all.filter((p) => p.claimed).sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));
  for (const p of members.slice(0, 30)) {
    const ports = p.ports.slice(0, 3);
    const where = ports.length ? ports.map((x) => tag(x.name)).join(' ') : tag(p.country);
    items.push({
      id: 'm-' + p.id, kind: 'member', at: p.joinedAt, author: p.name, handle: p.slug, badge: true,
      text: `Just joined PortServiceFinder 👋\n${p.typeLabel} in ${where} ${p.flag}`.trim(),
      sub: p.bio ? p.bio.slice(0, 160) : undefined, href: p.slug,
    });
  }
  const posts = [...BLOG_POSTS].sort((a, b) => (b.publishedDate || '').localeCompare(a.publishedDate || '')).slice(0, 24);
  for (const b of posts) {
    items.push({
      id: 'b-' + b.slug, kind: 'guide', at: (b.publishedDate || '2026-01-01') + 'T09:00:00Z', author: 'PortServiceFinder', handle: 'portservicefinder', badge: true,
      text: `📘 ${b.title}${b.featuredPort ? '\n\n' + tag(b.featuredPort) : ''}`, sub: b.excerpt, href: `/blog/${b.slug}`,
    });
  }
  [...PSC_US_ZONES].sort((a, b) => b.detentions - a.detentions).slice(0, 5).forEach((z, i) => {
    items.push({
      id: 'psc-' + i, kind: 'data', at: `2026-11-2${7 - i}T08:00:00Z`, author: 'PSF Data', handle: 'psfdata', badge: true,
      text: `⚓ ${z.zone}: ${z.detentions} ships detained after ${z.exams.toLocaleString('en-US')} port state control exams in 2025 (${pscRate(z).toFixed(2)}%).\n\nSource: U.S. Coast Guard #PortStateControl`,
      href: '/psc-detentions',
    });
  });
  items.sort((a, b) => b.at.localeCompare(a.at));

  const trending: [string, number][] = [['port-said', 65], ['tianjin', 43], ['suez', 39], ['st-petersburg', 39], ['singapore', 34], ['istanbul', 26]];
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('psfx_theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.psfx=t}catch(e){document.documentElement.dataset.psfx='dark'}" }} />
      <XApp items={items} providers={providers} trending={trending} listed={stats.total} joined={stats.last30} />
    </>
  );
}
