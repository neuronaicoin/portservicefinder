import { ALL_PORTS, PORT_DATA, type PortRef } from './ports';
import { SERVICE_CATEGORIES, type ServiceCategory } from './services-config';

/**
 * Free-text search for the phone search sheet: "singapore bunker",
 * "amsterdam main engine", "ship chandler istanbul", "turkey diving".
 * Finds a port and/or country and a service in any order, with a few
 * everyday synonyms, and returns ready links.
 */

export type Hit = { href: string; title: string; sub: string; kind: 'match' | 'port' | 'country' | 'service'; port?: PortRef; country?: string; service?: string };

const norm = (s: string) =>
  s
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** extra words people type for each service slug */
const SYN: Record<string, string[]> = {
  'ship-agent': ['agent', 'agents', 'agency', 'acente', 'husbandry', 'port agent', 'shipping agent', 'protecting agent', 'clearance'],
  shipchandler: ['chandler', 'chandlers', 'chandlery', 'ship supply', 'supplies', 'provisions', 'provision', 'stores', 'bonded', 'kumanya'],
};

type SvcIdx = { cat: ServiceCategory; terms: string[] };
const SVC: SvcIdx[] = SERVICE_CATEGORIES.map((cat) => ({
  cat,
  terms: [...new Set([cat.label, cat.shortLabel, ...cat.keywords, ...(SYN[cat.slug] || []), ...(cat.svcKey ? [cat.svcKey] : []), cat.slug.replace(/-/g, ' ')].map(norm).filter(Boolean))],
}));

const PORTS = ALL_PORTS.map((p) => ({ p, n: norm(p.name) })).sort((a, b) => b.n.length - a.n.length);
const COUNTRIES = Object.keys(PORT_DATA)
  .map((c) => ({ c, n: norm(c) }))
  .sort((a, b) => b.n.length - a.n.length);

function findService(q: string): { cat: ServiceCategory; score: number }[] {
  if (!q) return [];
  const words = q.split(' ').filter((w) => w.length > 1);
  const out: { cat: ServiceCategory; score: number }[] = [];
  for (const s of SVC) {
    let score = 0;
    for (const t of s.terms) {
      if (` ${q} `.includes(` ${t} `)) score = Math.max(score, 10 + t.length);
      else if (t.startsWith(q) && q.length >= 3) score = Math.max(score, 6 + q.length);
    }
    if (!score) {
      const hit = words.filter((w) => w.length >= 3 && s.terms.some((t) => t.split(' ').some((tw) => tw.startsWith(w))));
      if (hit.length) score = hit.length * 3 + hit.join('').length / 10;
    }
    if (score) out.push({ cat: s.cat, score });
  }
  return out.sort((a, b) => b.score - a.score);
}

export function smartSearch(raw: string): Hit[] {
  let q = norm(raw);
  if (!q) return [];
  // a port named in the text (longest name first, so "port said" beats "said")
  let port: PortRef | undefined;
  for (const { p, n } of PORTS) {
    if (n.length >= 3 && ` ${q} `.includes(` ${n} `)) {
      port = p;
      q = ` ${q} `.replace(` ${n} `, ' ').trim();
      break;
    }
  }
  let country: string | undefined;
  for (const { c, n } of COUNTRIES) {
    if (` ${q} `.includes(` ${n} `)) {
      country = c;
      q = ` ${q} `.replace(` ${n} `, ' ').trim();
      break;
    }
  }
  if (port && country && port.country !== country) {
    const same = ALL_PORTS.find((x) => x.country === country && norm(x.name) === norm(port!.name));
    port = same || port;
  }
  const all = findService(q);
  const svc = all.filter((x) => x.score >= (all[0]?.score || 0) * 0.7);
  const hits: Hit[] = [];
  const best = svc[0]?.cat;

  if (port && best) {
    for (const s of svc.slice(0, 3))
      hits.push({ kind: 'match', href: `/ports/${port.slug}/${s.cat.slug}`, title: `${s.cat.label} in ${port.name}`, sub: `${port.flag} ${port.country}`, port, service: s.cat.slug });
  }
  if (port) {
    if (!best) {
      hits.push({ kind: 'match', href: `/ports/${port.slug}/ship-agent`, title: `Ship agents in ${port.name}`, sub: `${port.flag} ${port.country}`, port, service: 'ship-agent' });
      hits.push({ kind: 'match', href: `/ports/${port.slug}/shipchandler`, title: `Shipchandlers in ${port.name}`, sub: `${port.flag} ${port.country}`, port, service: 'shipchandler' });
      hits.push({ kind: 'match', href: `/ports/${port.slug}#marine-services`, title: `Marine services in ${port.name}`, sub: `${port.flag} ${port.country}`, port, service: 'marine-services' });
    }
    hits.push({ kind: 'port', href: `/ports/${port.slug}`, title: `All companies in ${port.name}`, sub: `${port.flag} ${port.country}`, port });
  } else if (country) {
    if (best) hits.push({ kind: 'match', href: `/providers?country=${encodeURIComponent(country)}&service=${best.slug}`, title: `${best.label} in ${country}`, sub: 'All ports in the country', country, service: best.slug });
    for (const p of ALL_PORTS.filter((x) => x.country === country).slice(0, 6))
      hits.push({ kind: 'port', href: best ? `/ports/${p.slug}/${best.slug}` : `/ports/${p.slug}`, title: best ? `${best.shortLabel} in ${p.name}` : p.name, sub: `${p.flag} ${p.country}`, port: p, service: best?.slug });
  } else {
    // no place named: ports whose name starts with what was typed, then services
    const words = norm(raw).split(' ');
    const portHits = PORTS.filter(({ n }) => words.some((w) => w.length >= 2 && (n.startsWith(w) || n.split(' ').some((x) => x.startsWith(w))))).slice(0, 5);
    for (const { p } of portHits) hits.push({ kind: 'port', href: best ? `/ports/${p.slug}/${best.slug}` : `/ports/${p.slug}`, title: best ? `${best.shortLabel} in ${p.name}` : p.name, sub: `${p.flag} ${p.country}`, port: p, service: best?.slug });
    const cHits = COUNTRIES.filter(({ n }) => words.some((w) => w.length >= 2 && n.startsWith(w))).slice(0, 3);
    for (const { c } of cHits) hits.push({ kind: 'country', href: best ? `/providers?country=${encodeURIComponent(c)}&service=${best.slug}` : `/providers?country=${encodeURIComponent(c)}`, title: best ? `${best.shortLabel} in ${c}` : `All companies in ${c}`, sub: `${PORT_DATA[c]?.length || 0} ports`, country: c });
    for (const s of svc.slice(0, 4)) hits.push({ kind: 'service', href: `/providers?service=${s.cat.slug}`, title: s.cat.label, sub: 'All ports worldwide', service: s.cat.slug });
  }
  const seen = new Set<string>();
  return hits.filter((h) => (seen.has(h.href) ? false : (seen.add(h.href), true))).slice(0, 8);
}

export const SEARCH_EXAMPLES = ['Singapore bunker', 'Amsterdam main engine', 'Istanbul ship chandler', 'Santos diving', 'Rotterdam agent'];
