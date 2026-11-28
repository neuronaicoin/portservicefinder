import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { PSC_US_ZONES, PSC_US_TOTAL, PSC_US_BREAKDOWN, PSC_US_SOURCE, pscRate } from '@/lib/psc-us';
import { portBySlug } from '@/lib/ports';
import { PSC_REGIMES } from '@/lib/psc-regimes';

export const metadata: Metadata = {
  title: 'Port State Control Detentions by Port 2025: U.S. Data & PSC Regimes Worldwide',
  description: 'U.S. Coast Guard port state control by port: safety exams, detentions and detention rates for Houston, New Orleans, Miami, Los Angeles and every U.S. Captain of the Port zone, plus the most common detainable deficiencies.',
  alternates: { canonical: '/psc-detentions' },
};

export default function PscDetentionsPage() {
  const rows = [...PSC_US_ZONES].sort((a, b) => b.detentions - a.detentions || b.exams - a.exams);
  const nat = pscRate(PSC_US_TOTAL);
  return (
    <>
      <SiteHeader />
      <main className="pd-wrap">
        <p className="pd-k">Port state control · United States · {PSC_US_SOURCE.year}</p>
        <h1>U.S. port state control detentions by port</h1>
        <p className="pd-lead">
          In {PSC_US_SOURCE.year} the U.S. Coast Guard carried out <b>{PSC_US_TOTAL.exams.toLocaleString('en-US')}</b> port state control safety exams on foreign ships and detained <b>{PSC_US_TOTAL.detentions}</b>, a detention rate of <b>{nat.toFixed(2)}%</b>. Below are the figures for each Captain of the Port zone, so you can see where inspections and detentions are most frequent before your ship arrives.
        </p>

        <div className="pd-tablewrap">
          <table className="pd-table">
            <thead><tr><th>Zone</th><th>Exams</th><th>Detentions</th><th>Rate</th><th>Ports on PortServiceFinder</th></tr></thead>
            <tbody>
              {rows.map((z) => (
                <tr key={z.zone}>
                  <td>{z.zone}<small>{z.district}</small></td>
                  <td>{z.exams.toLocaleString('en-US')}</td>
                  <td>{z.detentions}</td>
                  <td>{pscRate(z).toFixed(2)}%</td>
                  <td>{z.ports.length ? z.ports.map((s, i) => <span key={s}>{i ? ', ' : ''}<Link href={`/ports/${s}`}>{portBySlug(s)?.name || s}</Link></span>) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="pd-note">Zones with few exams can show a high or low rate from just one detention. Read small numbers with care.</p>

        <h2>Why ships were detained</h2>
        <p>The breakdown of detention deficiencies in the three largest categories ({PSC_US_SOURCE.year}, all U.S. ports):</p>
        <div className="pd-cats">
          {PSC_US_BREAKDOWN.map((c) => (
            <div key={c.cat} className="pd-cat">
              <h3>{c.cat} <small>{c.total} deficiencies</small></h3>
              <ul>{c.items.map(([n, p]) => <li key={n}><span>{n}</span><b>{p}%</b></li>)}</ul>
            </div>
          ))}
        </div>

        <h2>How to avoid a detention</h2>
        <ul className="pd-list">
          <li>Test fire detection and alarm systems and clean oil accumulation in the engine room before arrival.</li>
          <li>Check lifeboats, rescue boats and liferafts: engines start, release gear works, servicing is in date.</li>
          <li>Make sure certificates (SMC, Safety Construction, Safe Manning, ISSC, Load Line) are valid and on board.</li>
          <li>Report known defects in the advance notice of arrival, as the Coast Guard expects.</li>
        </ul>
        <p>Read more in our guide to <Link href="/blog/port-state-control-inspection-common-deficiencies-how-agents-chandlers-help-2026">common PSC deficiencies and how agents and chandlers help</Link>, or look up deficiency codes in the <Link href="/voyage/psc">PSC tool</Link>.</p>

        <h2>Port state control regimes worldwide</h2>
        <p>Outside the United States, port state control is organised in regional agreements. Each publishes its own inspection and detention database. Find the regime for your next port:</p>
        <div className="pd-tablewrap">
          <table className="pd-table">
            <thead><tr><th>Regime</th><th>Region</th><th>Member states (coastal)</th><th>Official site</th></tr></thead>
            <tbody>
              {PSC_REGIMES.filter((r) => r.key !== 'uscg').map((r) => (
                <tr key={r.key}><td>{r.name}</td><td>{r.region}</td><td>{r.countries.join(', ')}</td><td><a href={r.url} target="_blank" rel="nofollow noopener">Detentions →</a></td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="pd-note">Some countries belong to more than one regime (for example Turkey, Russia, Australia, Canada, Chile and Panama). Membership lists are for guidance; check the regime's own site.</p>

        <section className="pd-cta">
          <h2>Find help at a U.S. port</h2>
          <p>Firefighting and safety service, liferaft and LSA stations, class surveyors and ship agents, port by port: <Link href="/ports/houston/firefighting-safety">Houston</Link> · <Link href="/ports/new-orleans/firefighting-safety">New Orleans</Link> · <Link href="/ports/miami/firefighting-safety">Miami</Link> · <Link href="/ports/los-angeles/firefighting-safety">Los Angeles</Link> · <Link href="/ports/mobile/firefighting-safety">Mobile</Link>. Service companies: <Link href="/for-providers/signup">list your company free</Link>.</p>
        </section>

        <p className="pd-src">Source: <a href={PSC_US_SOURCE.url} rel="nofollow noopener" target="_blank">{PSC_US_SOURCE.title}</a> (statistics by port and detention deficiency breakdown). Current monthly list of detained ships: <a href={PSC_US_SOURCE.detentionsUrl} rel="nofollow noopener" target="_blank">U.S. Coast Guard detentions</a>. Figures are by Coast Guard Captain of the Port zone, which may cover several ports.</p>
      </main>
      <SiteFooter />
      <style>{`
        .pd-wrap{max-width:900px;margin:0 auto;padding:32px 16px 48px;color:var(--ink)}
        .pd-k{color:#d6b25e;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:.06em;margin:0 0 6px}
        .pd-wrap h1{font-size:clamp(26px,4vw,36px);line-height:1.15;margin:0 0 12px}
        .pd-wrap h2{font-size:22px;margin:28px 0 10px}
        .pd-wrap p,.pd-list li{line-height:1.6;color:var(--ink2,var(--ink))}
        .pd-tablewrap{overflow-x:auto;-webkit-overflow-scrolling:touch;border:1px solid var(--line,#24304d);border-radius:12px;margin-top:16px}
        .pd-table{width:100%;border-collapse:collapse;font-size:14px;min-width:560px}
        .pd-table th,.pd-table td{padding:9px 10px;border-bottom:1px solid var(--line,#24304d);text-align:left;vertical-align:top}
        .pd-table th{font-size:12px;text-transform:uppercase;color:var(--muted,#8a97a8)}
        .pd-table td small{display:block;color:var(--muted,#8a97a8);font-size:12px}
        .pd-table a,.pd-wrap a{color:#d6b25e}
        .pd-note,.pd-src{font-size:13px;color:var(--muted,#8a97a8)}
        .pd-cats{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}
        .pd-cat{border:1px solid var(--line,#24304d);border-radius:12px;padding:14px;background:var(--card)}
        .pd-cat h3{margin:0 0 8px;font-size:16px}.pd-cat h3 small{color:var(--muted,#8a97a8);font-weight:400;font-size:12px}
        .pd-cat ul{list-style:none;margin:0;padding:0}.pd-cat li{display:flex;justify-content:space-between;gap:10px;font-size:14px;padding:4px 0;border-bottom:1px dashed var(--line,#24304d)}
        .pd-cta{margin-top:24px;padding:18px;border-radius:14px;background:linear-gradient(135deg,#0d1030,#16224a);border:1px solid #d6b25e55}
        .pd-cta h2{margin-top:0;color:#fff}.pd-cta p{color:#c9d2e3}
      `}</style>
    </>
  );
}
