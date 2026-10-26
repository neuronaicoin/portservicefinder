import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { getActivePorts } from '@/lib/providers-db';
import { ALL_PORTS, FLAG, PORT_DATA } from '@/lib/ports';
import { PORT_CSS } from '@/lib/port-css';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Ports: Ship Agents & Marine Services by Port and Country',
  description: 'Find ship agents, shipchandlers and marine service companies port by port: 1,200+ ports in 150+ countries, with the companies listed at each one.',
  alternates: { canonical: '/ports' },
};

export default async function PortsPage() {
  const active = await getActivePorts();
  const countries = Object.keys(PORT_DATA).sort((a, b) => a.localeCompare(b));
  const byCountry = new Map<string, typeof ALL_PORTS>();
  for (const p of ALL_PORTS) byCountry.set(p.country, [...(byCountry.get(p.country) || []), p]);
  const activeSet = new Set(active.map((p) => p.slug));
  return (
    <div className="pt">
      <style>{PORT_CSS + EXTRA}</style>
      <SiteHeader />
      <main className="wrap">
        <h1>Ports</h1>
        <p className="lead">Pick a port to see the ship agents, shipchandlers and marine service companies listed there and contact them directly.</p>

        {active.length > 0 && (
          <section className="sec">
            <h2>Ports with listed companies</h2>
            <div className="links">
              {active.map((p) => (
                <Link key={p.slug} href={`/ports/${p.slug}`}>
                  {p.flag} {p.name} <span>({p.providers})</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="sec">
          <h2>All ports by country</h2>
          <div className="az">
            {countries.map((c) => (
              <details key={c}>
                <summary>
                  {FLAG[c] || ''} {c} <span>{byCountry.get(c)?.length || 0}</span>
                </summary>
                <div className="links">
                  {(byCountry.get(c) || []).map((p) => (
                    <Link key={p.slug} href={`/ports/${p.slug}`} className={activeSet.has(p.slug) ? 'has' : ''}>
                      {p.name}
                    </Link>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

const EXTRA = `
.pt .az{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.pt .az details{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 14px}
.pt .az summary{cursor:pointer;font-weight:600;display:flex;justify-content:space-between;gap:8px}
.pt .az summary span{color:var(--ink3);font-weight:500;font-size:13px}
.pt .az .links{margin-top:10px}.pt .az .links a{font-size:13.5px;padding:6px 10px}
.pt .az .links a.has{border-color:color-mix(in srgb,var(--acc) 50%,var(--line));font-weight:600}
@media (max-width:720px){.pt .az{grid-template-columns:1fr}}
`;
