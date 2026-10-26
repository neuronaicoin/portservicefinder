// ============================================================
// What a port page knows about its port beyond the listed companies: reference data from the
// Voyage Hub port directory, the guides that cover it, and the other ports of its country.
// ============================================================
import { DIRECTORY_PORTS } from './port-directory';
import { ALL_PORTS, type PortRef } from './ports';
import { BLOG_POSTS } from '@/app/data/blog';

/** Reference data (draft, pilotage, VHF…) when the port is in the Voyage Hub directory. */
export function directoryEntry(port: PortRef) {
  const n = port.name.toLowerCase();
  return (
    DIRECTORY_PORTS.find((d) => d.country === port.country && (d.name.toLowerCase() === n || d.name.toLowerCase().startsWith(n + ' ') || d.name.toLowerCase().includes(`(${n})`))) || null
  );
}

/** Guides about this port: featured on it, or naming it in the title. */
export function guidesFor(port: PortRef, limit = 4) {
  const n = port.name.toLowerCase();
  const re = new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
  return BLOG_POSTS.filter((b) => String(b.featuredPort || '').toLowerCase() === n || re.test(b.title))
    .sort((a, b) => String(b.publishedDate).localeCompare(String(a.publishedDate)))
    .slice(0, limit);
}

/** The other ports of the same country (for links). */
export function countryPorts(port: PortRef) {
  return ALL_PORTS.filter((p) => p.country === port.country && p.slug !== port.slug);
}
