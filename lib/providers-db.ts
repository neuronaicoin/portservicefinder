// ============================================================
// LISTED COMPANIES — the real providers from the database, for the server-rendered pages
// (homepage "new on PortServiceFinder", provider profiles, port pages, sitemap).
//
// Every company that signed up is shown, except listings that were cancelled or expired and
// profiles not finished yet (no country or port).
// Read with the service key on the server only; contact details are what the company itself
// chose to publish when it listed.
// ============================================================
import { ALL_PORTS, FLAG, PROVIDER_TYPES, findPort, toSlug, type PortRef } from './ports';

export type ListedProvider = {
  id: string;
  slug: string;
  type: 'agent' | 'chandler' | 'service' | string;
  typeLabel: string;
  name: string;
  bio: string;
  country: string;
  flag: string;
  ports: PortRef[];
  svc: string[];
  phone: string;
  email: string;
  whatsapp: string;
  website: string;
  address: string;
  contactPerson: string;
  joinedAt: string; // ISO
};

const HIDDEN = new Set(['cancelled', 'canceled', 'expired', 'deleted', 'rejected', 'hidden']);

type Row = Record<string, unknown>;
const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

function toProvider(row: Row): Omit<ListedProvider, 'slug'> {
  const country = str(row.country);
  const ports = (Array.isArray(row.ports) ? row.ports : [])
    .map((p) => {
      const name = str(p);
      if (!name) return null;
      return findPort(name, country) || { name, country, slug: toSlug(name), flag: FLAG[country] || '' };
    })
    .filter((p): p is PortRef => !!p);
  const type = str(row.type) || 'service';
  return {
    id: String(row.id),
    type,
    typeLabel: PROVIDER_TYPES[type] || 'Marine services',
    name: str(row.name) || 'Unnamed company',
    bio: str(row.bio),
    country,
    flag: FLAG[country] || '',
    ports,
    svc: (Array.isArray(row.svc) ? row.svc : []).map(str).filter(Boolean),
    phone: str(row.phone),
    email: str(row.email),
    whatsapp: str(row.whatsapp) || str(row.phone),
    website: str(row.website),
    address: str(row.address),
    contactPerson: str(row.contact_person),
    joinedAt: str(row.created_at) || new Date(0).toISOString(),
  };
}

/** Slugs from names; a name used twice gets "-2", "-3" in joining order, so links stay stable. */
function withSlugs(list: Omit<ListedProvider, 'slug'>[]): ListedProvider[] {
  const seen = new Map<string, number>();
  return [...list]
    .sort((a, b) => a.joinedAt.localeCompare(b.joinedAt) || a.id.localeCompare(b.id))
    .map((p) => {
      const base = toSlug(p.name) || 'company';
      const n = (seen.get(base) || 0) + 1;
      seen.set(base, n);
      return { ...p, slug: n === 1 ? base : `${base}-${n}` };
    })
    .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));
}

async function fetchRows(): Promise<Row[]> {
  // Local previews without the database: a JSON file of rows (never set in production)
  if (process.env.PSF_PROVIDERS_FIXTURE) {
    const fs = await import('node:fs/promises');
    return JSON.parse(await fs.readFile(process.env.PSF_PROVIDERS_FIXTURE, 'utf8'));
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) return [];
  const { supabaseAdmin } = await import('./supabase');
  const { data, error } = await supabaseAdmin
    .from('providers')
    .select('id,type,name,bio,country,ports,svc,phone,email,whatsapp,website,address,contact_person,status,created_at')
    .order('created_at', { ascending: false })
    .limit(5000);
  if (error) throw error;
  return (data || []) as Row[];
}

let memo: { at: number; list: ListedProvider[] } | null = null;

/** Every listed company, newest first. Cached for 5 minutes per server. */
export async function getListedProviders(): Promise<ListedProvider[]> {
  if (memo && Date.now() - memo.at < 5 * 60_000) return memo.list;
  try {
    const rows = await fetchRows();
    // a listing that was cancelled or expired is hidden, and so is one whose profile isn't
    // finished yet (no country or no port: nothing to show)
    const list = withSlugs(rows.filter((r) => !HIDDEN.has(str(r.status).toLowerCase())).map(toProvider).filter((p) => p.country && p.ports.length > 0));
    memo = { at: Date.now(), list };
    return list;
  } catch (e) {
    console.error('providers-db:', e);
    return memo?.list || [];
  }
}

export async function getProviderBySlug(slug: string) {
  return (await getListedProviders()).find((p) => p.slug === slug) || null;
}

/** Companies serving a port (by its slug). */
export async function getProvidersForPortSlug(portSlug: string) {
  return (await getListedProviders()).filter((p) => p.ports.some((x) => x.slug === portSlug));
}

/** Numbers for the homepage: total companies, new in the last 30 days, countries they are in. */
export async function getListingStats() {
  const list = await getListedProviders();
  const since = Date.now() - 30 * 86400_000;
  return {
    total: list.length,
    last30: list.filter((p) => Date.parse(p.joinedAt) >= since).length,
    countries: new Set(list.map((p) => p.country).filter(Boolean)).size,
    ports: new Set(list.flatMap((p) => p.ports.map((x) => x.slug))).size,
  };
}

/** Ports that have at least one listed company, busiest first. */
export async function getActivePorts() {
  const list = await getListedProviders();
  const m = new Map<string, { port: PortRef; providers: number; services: Set<string> }>();
  for (const p of list)
    for (const port of p.ports) {
      const e = m.get(port.slug) || { port, providers: 0, services: new Set<string>() };
      e.providers += 1;
      for (const s of p.svc) e.services.add(s);
      e.services.add(p.type);
      m.set(port.slug, e);
    }
  return [...m.values()].sort((a, b) => b.providers - a.providers || a.port.name.localeCompare(b.port.name)).map((e) => ({ ...e.port, providers: e.providers, services: e.services.size }));
}

/** "2 days ago", "3 weeks ago" (for joined dates). */
export function agoText(iso: string, now = Date.now()) {
  const d = Math.max(0, now - Date.parse(iso));
  const day = 86400_000;
  if (d < 3600_000) return 'just now';
  if (d < day) return `${Math.floor(d / 3600_000)} hour${Math.floor(d / 3600_000) === 1 ? '' : 's'} ago`;
  if (d < 2 * day) return 'yesterday';
  if (d < 14 * day) return `${Math.floor(d / day)} days ago`;
  if (d < 60 * day) return `${Math.floor(d / (7 * day))} weeks ago`;
  return new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

/** Two letters for the company's initials tile. */
export function initials(name: string) {
  const w = name.replace(/[^A-Za-z0-9 ]/g, ' ').split(/\s+/).filter((x) => x && !/^(ltd|llc|inc|co|sa|bv|gmbh|pte|the|and|of)$/i.test(x));
  return ((w[0]?.[0] || name[0] || '?') + (w[1]?.[0] || '')).toUpperCase();
}

export { ALL_PORTS };

/** Does a company offer a service category (lib/services-config.ts)? */
export function providerOffers(p: ListedProvider, cat: { type: string; svcKey?: string }) {
  if (cat.type === 'agent') return p.type === 'agent';
  if (cat.type === 'chandler') return p.type === 'chandler';
  if (p.type !== 'service') return false;
  return !cat.svcKey || p.svc.includes(cat.svcKey);
}
