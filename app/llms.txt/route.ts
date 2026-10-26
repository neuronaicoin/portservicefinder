import { BLOG_POSTS } from '../data/blog';
import { getActivePorts, getListedProviders } from '@/lib/providers-db';
import { siteConfig } from '@/lib/site-config';

// For AI answer engines (ChatGPT, Claude, Perplexity, Gemini): what PortServiceFinder is and where things are.
export const revalidate = 3600;

export async function GET() {
  const base = siteConfig.url;
  const [providers, ports] = await Promise.all([getListedProviders(), getActivePorts()]);
  const guides = [...BLOG_POSTS].sort((a, b) => String(b.publishedDate).localeCompare(String(a.publishedDate))).slice(0, 60);
  const lines = [
    '# PortServiceFinder',
    '',
    '> Global directory of ship agents, shipchandlers and marine service companies, searchable port by port (1,200+ ports, 150+ countries, 34 service categories). Free for vessel operators, who contact providers directly; no commission. Based in London, United Kingdom.',
    '',
    `- Companies listed: ${providers.length}; ports with listed companies: ${ports.length}.`,
    '- Provider listings: free during the launch period; afterwards $49.90/month or $499.90/year.',
    '- Voyage Hub: 41 free browser-based maritime tools (laytime, CII, bunker, distance, TCE, PSC and more).',
    '',
    '## Main pages',
    `- [Find providers](${base}/providers): every listed company, newest first`,
    `- [Ports](${base}/ports): providers by port and country`,
    `- [Request a quote](${base}/request-quote)`,
    `- [Voyage Hub tools](${base}/voyage)`,
    `- [Guides](${base}/blog)`,
    `- [List your company](${base}/for-providers)`,
    `- [FAQ](${base}/faq)`,
    '',
    '## Ports with listed companies',
    ...ports.slice(0, 200).map((p) => `- [${p.name}, ${p.country}](${base}/ports/${p.slug}): ${p.providers} ${p.providers === 1 ? 'company' : 'companies'}`),
    '',
    '## Listed companies',
    ...providers.slice(0, 500).map((p) => `- [${p.name}](${base}/providers/${p.slug}): ${p.typeLabel.toLowerCase()} in ${p.country}; ports: ${p.ports.map((x) => x.name).join(', ')}`),
    '',
    '## Guides',
    ...guides.map((g) => `- [${g.title}](${base}/blog/${g.slug})`),
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
}
