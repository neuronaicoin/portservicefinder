import { SERVICE_CATEGORIES } from './services-config';
import { MARINE_SERVICES, findPort, type PortRef } from './ports';

/**
 * Live demand for the public "Port requests" board.
 * Reads existing tables only (rfq_requests, search_events) and never exposes
 * an operator's name, email, phone or free-text details: just port, service,
 * vessel type, ETA month and timing.
 */
export type DemandItem = {
  id: string;
  kind: 'request' | 'search';
  port: PortRef | null;
  portName: string;
  country: string;
  service: string;
  serviceSlug: string | null;
  vessel: string | null;
  eta: string | null;
  urgent: boolean;
  at: string;
};

function serviceInfo(raw: string | null | undefined): { label: string; slug: string | null } {
  const v = String(raw || '').trim();
  if (!v || v === 'all') return { label: 'Ship agents, chandlers & marine services', slug: null };
  if (v === 'marine-services' || v === 'service') return { label: 'Marine services', slug: null };
  if (v === 'agent' || v === 'ship-agent') return { label: 'Ship agent', slug: 'ship-agent' };
  if (v === 'chandler' || v === 'shipchandler') return { label: 'Shipchandler', slug: 'shipchandler' };
  const bySlug = SERVICE_CATEGORIES.find((c) => c.slug === v);
  if (bySlug) return { label: bySlug.label, slug: bySlug.slug };
  const byKey = SERVICE_CATEGORIES.find((c) => c.svcKey === v);
  if (byKey) return { label: byKey.label, slug: byKey.slug };
  const ms = MARINE_SERVICES.find((m) => m.key === v);
  if (ms) return { label: ms.label, slug: null };
  return { label: v.replace(/-/g, ' '), slug: null };
}

function cleanVessel(v: unknown): string | null {
  const s = String(v || '').replace(/[^\p{L}\p{N} /&().,-]/gu, '').trim().slice(0, 40);
  return s || null;
}

function etaMonth(v: unknown): string | null {
  const t = Date.parse(String(v || ''));
  if (!Number.isFinite(t)) return null;
  return new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

let memo: { at: number; items: DemandItem[] } | null = null;

/** Requests and searches from the last 60 days, newest first. Cached 2 minutes. */
export async function getDemand(): Promise<DemandItem[]> {
  if (memo && Date.now() - memo.at < 120_000) return memo.items;
  // Local previews without the database (never set in production)
  if (process.env.PSF_DEMAND_FIXTURE) {
    const fs = await import('node:fs/promises');
    const rows = JSON.parse(await fs.readFile(process.env.PSF_DEMAND_FIXTURE, 'utf8')) as any[];
    return rows.map((r, i) => {
      const s = serviceInfo(r.service_type);
      return { id: `f-${i}`, kind: r.kind, port: findPort(r.port, r.country), portName: r.port, country: r.country, service: s.label, serviceSlug: s.slug, vessel: cleanVessel(r.vessel_type), eta: etaMonth(r.eta), urgent: r.urgency === 'urgent', at: r.created_at } as DemandItem;
    });
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) return [];
  try {
    const { supabaseAdmin } = await import('./supabase');
    const since = new Date(Date.now() - 60 * 86400_000).toISOString();
    const [rq, se] = await Promise.all([
      supabaseAdmin
        .from('rfq_requests')
        .select('id,country,port,service_type,vessel_type,eta,urgency,created_at')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(200),
      supabaseAdmin
        .from('search_events')
        .select('country,port,service_type,created_at')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(400),
    ]);
    const items: DemandItem[] = [];
    for (const r of (rq.data || []) as any[]) {
      const s = serviceInfo(r.service_type);
      items.push({
        id: `r-${r.id}`,
        kind: 'request',
        port: findPort(r.port, r.country),
        portName: String(r.port || ''),
        country: String(r.country || ''),
        service: s.label,
        serviceSlug: s.slug,
        vessel: cleanVessel(r.vessel_type),
        eta: etaMonth(r.eta),
        urgent: r.urgency === 'urgent',
        at: r.created_at,
      });
    }
    let n = 0;
    for (const r of (se.data || []) as any[]) {
      n++;
      const s = serviceInfo(r.service_type);
      items.push({
        id: `s-${n}-${r.created_at}`,
        kind: 'search',
        port: findPort(r.port, r.country),
        portName: String(r.port || ''),
        country: String(r.country || ''),
        service: s.label,
        serviceSlug: s.slug,
        vessel: null,
        eta: null,
        urgent: false,
        at: r.created_at,
      });
    }
    const list = items.filter((i) => i.portName).sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
    memo = { at: Date.now(), items: list };
    return list;
  } catch (e) {
    console.error('port-requests:', e);
    return memo?.items || [];
  }
}

export async function getDemandForPort(portSlug: string, limit = 5) {
  return (await getDemand()).filter((d) => d.port?.slug === portSlug).slice(0, limit);
}

export function demandHref(d: DemandItem) {
  if (!d.port) return '/providers';
  return d.serviceSlug ? `/ports/${d.port.slug}/${d.serviceSlug}` : `/ports/${d.port.slug}`;
}
