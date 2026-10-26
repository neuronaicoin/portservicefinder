import type { MetadataRoute } from 'next';
import fs from 'node:fs';
import path from 'node:path';
import { BLOG_POSTS } from './data/blog';
import { SERVICE_CATEGORIES } from '@/lib/services-config';
import { getListedProviders, getActivePorts, providerOffers } from '@/lib/providers-db';
import { directoryEntry, guidesFor } from '@/lib/port-content';
import { ALL_PORTS } from '@/lib/ports';
import { siteConfig } from '@/lib/site-config';

// rebuilt every hour: new companies and ports appear without a deploy
export const revalidate = 3600;

const STATIC: [string, MetadataRoute.Sitemap[number]['changeFrequency'], number][] = [
  ['/', 'daily', 1],
  ['/providers', 'daily', 0.9],
  ['/ports', 'daily', 0.9],
  ['/for-providers', 'weekly', 0.9],
  ['/for-providers/signup', 'monthly', 0.8],
  ['/blog', 'daily', 0.8],
  ['/voyage', 'weekly', 0.8],
  ['/request-quote', 'monthly', 0.6],
  ['/pricing', 'monthly', 0.6],
  ['/about', 'monthly', 0.5],
  ['/faq', 'monthly', 0.6],
  ['/contact', 'monthly', 0.4],
  ['/listing-rules', 'yearly', 0.3],
  ['/terms', 'yearly', 0.2],
  ['/privacy', 'yearly', 0.2],
  ['/refund-policy', 'yearly', 0.2],
];

/** The Voyage Hub tool pages (every folder under app/voyage with a page). */
function voyageTools(): string[] {
  try {
    const dir = path.join(process.cwd(), 'app', 'voyage');
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && fs.existsSync(path.join(dir, d.name, 'page.tsx')) && d.name !== 'saved')
      .map((d) => d.name)
      .sort();
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const now = new Date();
  const [providers, active] = await Promise.all([getListedProviders(), getActivePorts()]);
  const out: MetadataRoute.Sitemap = STATIC.map(([p, changeFrequency, priority]) => ({ url: `${base}${p === '/' ? '' : p}`, lastModified: now, changeFrequency, priority }));

  for (const t of voyageTools()) out.push({ url: `${base}/voyage/${t}`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 });

  // company pages
  for (const p of providers) out.push({ url: `${base}/providers/${p.slug}`, lastModified: new Date(p.joinedAt), changeFrequency: 'weekly', priority: 0.8 });

  // port pages worth indexing: companies listed, port facts or a guide (same rule as the page itself)
  const activeSet = new Set(active.map((p) => p.slug));
  for (const port of ALL_PORTS) {
    if (activeSet.has(port.slug) || directoryEntry(port) || guidesFor(port, 1).length)
      out.push({ url: `${base}/ports/${port.slug}`, lastModified: now, changeFrequency: activeSet.has(port.slug) ? 'daily' : 'weekly', priority: activeSet.has(port.slug) ? 0.8 : 0.5 });
  }
  // port × service pages with at least one company
  for (const a of active) {
    const here = providers.filter((p) => p.ports.some((x) => x.slug === a.slug));
    for (const c of SERVICE_CATEGORIES) if (here.some((p) => providerOffers(p, c))) out.push({ url: `${base}/ports/${a.slug}/${c.slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 });
  }

  for (const b of BLOG_POSTS) {
    const d = new Date(String((b as { updatedDate?: string }).updatedDate || b.publishedDate));
    out.push({ url: `${base}/blog/${b.slug}`, lastModified: Number.isNaN(d.getTime()) ? now : d, changeFrequency: 'monthly', priority: 0.6 });
  }
  return out;
}
