import type { Metadata } from 'next';
import { getListedProviders, getListingStats } from '@/lib/providers-db';
import { BLOG_POSTS } from '@/app/data/blog';
import { PSC_US_ZONES, pscRate } from '@/lib/psc-us';
import { XApp, type FeedItem } from './XApp';

// Private preview of the X-style app shell. Not indexed; the real pages and URLs are unchanged.
export const metadata: Metadata = { title: 'Preview', robots: { index: false, follow: false } };
export const revalidate = 600;

export default async function XPreview() {
  const [all, stats] = await Promise.all([getListedProviders(), getListingStats()]);
  const members = all.filter((p) => p.claimed).sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));
  const items: FeedItem[] = [];
  for (const p of members.slice(0, 14)) {
    items.push({
      id: 'm-' + p.id, kind: 'member', at: p.joinedAt, author: p.name, handle: p.slug, initials: p.name.slice(0, 2).toUpperCase(),
      text: `Joined PortServiceFinder as a ${p.typeLabel.toLowerCase()} in ${p.ports.slice(0, 3).map((x) => x.name).join(', ') || p.country} ${p.flag}`,
      href: `/providers/${p.slug}`, cta: 'View company', tag: p.ports[0]?.name || p.country,
    });
  }
  const posts = [...BLOG_POSTS].sort((a, b) => (b.publishedDate || '').localeCompare(a.publishedDate || '')).slice(0, 14);
  for (const b of posts) {
    items.push({
      id: 'b-' + b.slug, kind: 'guide', at: (b.publishedDate || '2026-01-01') + 'T09:00:00Z', author: 'PortServiceFinder Guides', handle: 'guides', initials: 'PS',
      text: b.title, sub: b.excerpt, href: `/blog/${b.slug}`, cta: 'Read guide', tag: b.featuredPort || 'Guide',
    });
  }
  const top = [...PSC_US_ZONES].sort((a, b) => b.detentions - a.detentions).slice(0, 4);
  top.forEach((z, i) => {
    items.push({
      id: 'psc-' + i, kind: 'data', at: `2026-11-2${8 - i}T08:00:00Z`, author: 'PSC Data', handle: 'psc', initials: 'PSC',
      text: `${z.zone}: ${z.detentions} detentions from ${z.exams.toLocaleString('en-US')} port state control exams in 2025 (${pscRate(z).toFixed(2)}%). U.S. Coast Guard data.`,
      href: '/psc-detentions', cta: 'See all U.S. ports', tag: 'Port state control',
    });
  });
  items.sort((a, b) => b.at.localeCompare(a.at));
  const follow = members.slice(0, 4).map((p) => ({ name: p.name, slug: p.slug, sub: `${p.typeLabel} · ${p.ports[0]?.name || p.country}`, initials: p.name.slice(0, 2).toUpperCase() }));
  const trending = [['Port Said', 'port-said', 65], ['Tianjin', 'tianjin', 43], ['Suez', 'suez', 39], ['St. Petersburg', 'st-petersburg', 39], ['Singapore', 'singapore', 34], ['Istanbul', 'istanbul', 26]] as [string, string, number][];
  return <XApp items={items} follow={follow} trending={trending} listed={stats.total} joined={stats.last30} />;
}
