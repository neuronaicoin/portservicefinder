// ============================================================
// Contextual internal links for a blog post: real port pages for the ports the post is
// about, and Voyage Hub tools that match its topic. Only ports that findPort() resolves
// to a real port page are linked, so no link here can 404.
// ============================================================
import type { BlogPost } from '@/app/data/blog';
import { ALL_PORTS, findPort, type PortRef } from '@/lib/ports';

export type ContextLink = { href: string; label: string; note: string };

// Port names that are also ordinary words or are shared with non-port meanings.
const AMBIGUOUS = new Set([
  'victoria', 'hamilton', 'newcastle', 'sydney', 'mobile', 'portland', 'salvador', 'albany', 'global', 'gibraltar strait',
  'bar', 'split', 'male', 'moroni', 'praia', 'colon', 'kiel', 'sale', 'nice', 'grand', 'cork', 'santos dumont', 'georgetown',
  'kingston', 'richmond', 'cambridge', 'wilmington', 'charleston', 'jacksonville', 'savannah', 'manzanillo', 'progreso',
]);

const NAME_COUNT = ALL_PORTS.reduce((m, p) => m.set(p.name.toLowerCase(), (m.get(p.name.toLowerCase()) || 0) + 1), new Map<string, number>());
const SCANNABLE = ALL_PORTS.filter(
  (p) => p.name.length >= 5 && NAME_COUNT.get(p.name.toLowerCase()) === 1 && !AMBIGUOUS.has(p.name.toLowerCase()),
).sort((a, b) => b.name.length - a.name.length);

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Real ports a post is about: its featured port first, then port names in its title and keywords. */
export function portsForPost(post: BlogPost, limit = 3): PortRef[] {
  const found: PortRef[] = [];
  const add = (p: PortRef | null) => {
    if (p && !found.some((f) => f.slug === p.slug)) found.push(p);
  };
  if (post.featuredPort) {
    add(findPort(post.featuredPort));
    for (const part of post.featuredPort.split(/[\/,()&]| and /)) {
      const name = part.trim();
      if (name.length >= 3) add(findPort(name));
    }
  }
  const haystack = [post.title, ...(post.keywords || [])].join(' | ');
  for (const p of SCANNABLE) {
    if (found.length >= limit) break;
    if (new RegExp(`(^|[^A-Za-z\\u00C0-\\u024F])${escapeRe(p.name)}([^A-Za-z\\u00C0-\\u024F]|$)`).test(haystack)) add(p);
  }
  return found.slice(0, limit);
}

/** The port page a post belongs to (for breadcrumbs), only when featuredPort is a real port. */
export function breadcrumbPort(post: BlogPost): PortRef | null {
  if (!post.featuredPort) return null;
  return findPort(post.featuredPort) || findPort(post.featuredPort.split(/[\/(]/)[0].trim());
}

const TOOLS: { test: RegExp; link: ContextLink }[] = [
  { test: /laytime|demurrage|notice of readiness|statement of facts/, link: { href: '/voyage/laytime', label: 'Laytime and demurrage calculator', note: 'Turn a statement of facts into a laytime statement' } },
  { test: /disbursement|\bpda\b|\bfda\b|port cost|agency fee|port call cost/, link: { href: '/voyage/disbursement', label: 'Disbursement tracker', note: 'Compare the proforma estimate with the final account' } },
  { test: /letter of protest|notice of readiness|\bnor\b/, link: { href: '/voyage/documents', label: 'NOR, SOF and LOP generator', note: 'Draft standard port documents in the browser' } },
  { test: /crew change|seafarer|\bmlc\b|crew welfare|rest hours/, link: { href: '/voyage/mlc', label: 'MLC rest hours check', note: 'Plan watches and rest hours around a crew change' } },
  { test: /holiday/, link: { href: '/voyage/holidays', label: 'Port holidays calendar', note: 'Public holidays by port for SHEX and overtime planning' } },
  { test: /bunker/, link: { href: '/voyage/bunker-prices', label: 'Bunker price tracker', note: 'Compare bunker prices between ports' } },
  { test: /\bcii\b|carbon intensity|imo net.zero|decarboni/, link: { href: '/voyage/cii', label: 'CII calculator', note: 'Estimate a ship’s carbon intensity rating' } },
  { test: /port state control|\bpsc\b|detention/, link: { href: '/voyage/psc', label: 'PSC Sentry', note: 'MoU search and deficiency codes' } },
  { test: /draft survey/, link: { href: '/voyage/draft', label: 'Draft survey calculator', note: 'Cargo weight from draft readings' } },
  { test: /drydock|dry dock|ship repair|shipyard/, link: { href: '/voyage/drydock', label: 'Drydock planner', note: 'Survey cycle and repair scope planning' } },
  { test: /congestion|waiting time/, link: { href: '/voyage/congestion', label: 'Port congestion tracker', note: 'Agent reports and berth estimates' } },
  { test: /chandler|provision|ship stores|spare parts|spares/, link: { href: '/voyage/spares', label: 'Spares inventory', note: 'Track critical spares and suppliers' } },
  { test: /canal|strait|transit|distance|routing|route/, link: { href: '/voyage/distance', label: 'Port distance calculator', note: 'Port-to-port distance and ETA' } },
  { test: /time charter|hire statement|\btce\b/, link: { href: '/voyage/hire', label: 'Hire statement calculator', note: 'Time charter hire with bunkers' } },
];

export function isProviderPost(post: BlogPost): boolean {
  return /for providers/i.test(post.featuredPort || '') || post.category === 'business' || post.category === 'starting-a-business';
}

/** 3 to 5 contextual links: port pages, matching tools, then a sensible default. */
export function contextLinksForPost(post: BlogPost): ContextLink[] {
  const links: ContextLink[] = [];
  for (const p of portsForPost(post, 3)) {
    links.push({ href: `/ports/${p.slug}`, label: `${p.name} port page`, note: `Ship agents, chandlers and marine services in ${p.name}, ${p.country}` });
  }
  const topic = [post.title, ...(post.keywords || []), ...(post.tags || [])].join(' ').toLowerCase();
  // Provider-facing posts link to listing pages rather than operator tools.
  let tools = isProviderPost(post) ? 2 : 0;
  for (const t of TOOLS) {
    if (tools >= 2 || links.length >= 5) break;
    if (t.test.test(topic) && !links.some((l) => l.href === t.link.href)) {
      links.push(t.link);
      tools++;
    }
  }
  const defaults: ContextLink[] = isProviderPost(post)
    ? [
        { href: '/for-providers', label: 'How listing works', note: 'How provider profiles appear to vessel operators' },
        { href: '/providers', label: 'Browse provider profiles', note: 'See how other companies present their services' },
        { href: '/voyage', label: 'Voyage Hub', note: 'Free browser-based tools for operators and crews' },
      ]
    : [
        { href: '/providers', label: 'Search providers by port', note: 'Ship agents, chandlers and marine services, free to search' },
        { href: '/voyage', label: 'Voyage Hub', note: 'Free browser-based maritime tools, no signup' },
        { href: '/request-quote', label: 'Request a quote', note: 'Send one request to providers at a port' },
      ];
  for (const d of defaults) {
    if (links.length >= 3) break;
    if (!links.some((l) => l.href === d.href)) links.push(d);
  }
  return links.slice(0, 5);
}
