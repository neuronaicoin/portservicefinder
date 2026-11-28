import Link from 'next/link';
import { pscZoneForPort, pscRate, PSC_US_TOTAL, PSC_US_SOURCE } from '@/lib/psc-us';

/** Port state control figures for a U.S. port (U.S. Coast Guard data), with links to the services that fix common detainable deficiencies. */
export function PscCard({ slug, portName }: { slug: string; portName: string }) {
  const z = pscZoneForPort(slug);
  if (!z) return null;
  const rate = pscRate(z);
  const nat = pscRate(PSC_US_TOTAL);
  const cmp = z.exams < 30 ? '' : rate > nat * 1.5 ? 'above' : rate < nat * 0.6 ? 'below' : 'close to';
  return (
    <section className="psc-card" aria-label={`Port state control in ${portName}`}>
      <p className="psc-k">Port state control · {PSC_US_SOURCE.year}</p>
      <h2>PSC detentions in {portName}</h2>
      <div className="psc-nums">
        <div><b>{z.exams.toLocaleString('en-US')}</b><span>safety exams</span></div>
        <div><b>{z.detentions}</b><span>detentions</span></div>
        <div><b>{rate.toFixed(2)}%</b><span>detention rate</span></div>
      </div>
      <p className="psc-t">
        {z.zone} (U.S. Coast Guard), {PSC_US_SOURCE.year}.{cmp && ` That is ${cmp} the U.S. average of ${nat.toFixed(2)}%.`} Fire safety and safety management (maintenance of ship and equipment) were the most common reasons for detention nationwide.
      </p>
      <p className="psc-links">
        Prepare before arrival: <Link href={`/ports/${slug}/firefighting-safety`}>firefighting &amp; safety</Link> · <Link href={`/ports/${slug}/liferaft-lsa`}>liferaft &amp; LSA</Link> · <Link href={`/ports/${slug}/classification-survey`}>class surveys</Link> · <Link href="/psc-detentions">all U.S. ports</Link>
      </p>
      <style>{`
        .psc-card{margin:18px 0;padding:18px 20px;border-radius:14px;border:1px solid var(--line,#24304d);background:var(--card)}
        .psc-k{margin:0 0 4px;color:#d6b25e;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em}
        .psc-card h2{margin:0 0 12px;font-size:20px;color:var(--ink)}
        .psc-nums{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:12px}
        .psc-nums div{border:1px solid var(--line,#24304d);border-radius:10px;padding:10px;text-align:center}
        .psc-nums b{display:block;font-size:22px;color:var(--ink)}
        .psc-nums span{font-size:12px;color:var(--muted,#8a97a8)}
        .psc-t,.psc-links{margin:0 0 6px;font-size:14px;line-height:1.55;color:var(--ink2,var(--ink))}
        .psc-links a{color:#d6b25e}
      `}</style>
    </section>
  );
}
