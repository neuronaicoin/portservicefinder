import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { getDemand, demandHref, type DemandItem } from '@/lib/port-requests';
import { agoText } from '@/lib/providers-db';
import { FLAG } from '@/lib/ports';

export const revalidate = 120;

export const metadata: Metadata = {
  title: 'Live Port Requests: What Ship Operators Need Right Now',
  description:
    'Live requests and searches from ship operators for ship agents, shipchandlers and marine services, port by port. Providers: list your company free to receive these enquiries.',
  alternates: { canonical: '/requests' },
};

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function RequestsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const tab = (Array.isArray(sp.show) ? sp.show[0] : sp.show) === 'requests' ? 'requests' : 'all';
  const all = await getDemand();
  const now = Date.now();
  const d30 = now - 30 * 86400_000;
  const requests = all.filter((d) => d.kind === 'request');
  const shown = (tab === 'requests' ? requests : all).slice(0, 60);
  const req30 = requests.filter((d) => Date.parse(d.at) >= d30).length;
  const srch30 = all.filter((d) => d.kind === 'search' && Date.parse(d.at) >= d30).length;
  const ports30 = new Set(all.filter((d) => Date.parse(d.at) >= d30).map((d) => d.portName)).size;

  return (
    <div className="rq">
      <style>{CSS}</style>
      <SiteHeader />
      <main className="wrap">
        <div className="top">
          <span className="live">
            <span className="dot" aria-hidden="true" /> Live
          </span>
          <h1>Port requests</h1>
          <p className="lead">What ship operators are looking for right now, port by port. Contact details stay private and go only to companies listed at that port.</p>
          <div className="stats">
            <div>
              <b>{req30}</b>
              <span>quote requests</span>
            </div>
            <div>
              <b>{srch30}</b>
              <span>operator searches</span>
            </div>
            <div>
              <b>{ports30}</b>
              <span>ports</span>
            </div>
          </div>
          <p className="stats-note">Last 30 days</p>
          <div className="ctas">
            <Link href="/for-providers/signup" className="btn gold">
              I&apos;m a provider: get these requests free
            </Link>
            <Link href="/request-quote" className="btn ghost">
              I&apos;m an operator: post a request
            </Link>
          </div>
        </div>

        <div className="tabs" role="tablist" aria-label="Filter">
          <Link href="/requests" className={tab === 'all' ? 'on' : ''} role="tab" aria-selected={tab === 'all'}>
            Everything
          </Link>
          <Link href="/requests?show=requests" className={tab === 'requests' ? 'on' : ''} role="tab" aria-selected={tab === 'requests'}>
            Quote requests only
          </Link>
        </div>

        {shown.length === 0 ? (
          <div className="empty">
            <b>No {tab === 'requests' ? 'quote requests' : 'activity'} in the last 60 days yet.</b>
            <p>Operators post requests from any port page. Companies listed at that port receive them by email and in their dashboard.</p>
            <Link href="/request-quote" className="btn gold">
              Post the first request
            </Link>
          </div>
        ) : (
          <ul className="list">
            {shown.map((d) => (
              <Row key={d.id} d={d} now={now} />
            ))}
          </ul>
        )}

        <section className="how">
          <h2>How providers get these requests</h2>
          <ol>
            <li>
              <b>List your company free</b>
              <span>Pick the ports you serve and your services. It takes about 3 minutes.</span>
            </li>
            <li>
              <b>Requests at your ports reach you</b>
              <span>By email and in your dashboard, with the operator&apos;s contact details.</span>
            </li>
            <li>
              <b>Reply directly</b>
              <span>No commission and no middleman. The job is between you and the operator.</span>
            </li>
          </ol>
          <Link href="/for-providers/signup" className="btn gold wide">
            List your company free
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Row({ d, now }: { d: DemandItem; now: number }) {
  const flag = d.port?.flag || FLAG[d.country] || '';
  return (
    <li className={`it ${d.kind}`}>
      <span className={`ico ${d.kind}`} aria-hidden="true">
        {d.kind === 'request' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v12H8l-4 4z" /></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        )}
      </span>
      <div className="body">
        <div className="l1">
          <b>{d.service}</b>
          {d.urgent && <em className="urg">Urgent</em>}
        </div>
        <div className="l2">
          <span>
            {flag} {d.portName}
            {d.country ? `, ${d.country}` : ''}
          </span>
          {d.vessel && <span>· {d.vessel}</span>}
          {d.eta && <span>· ETA {d.eta}</span>}
        </div>
        <div className="l3">
          {d.kind === 'request' ? 'Quote request' : 'Operator search'} · {agoText(d.at, now)}
        </div>
      </div>
      <div className="act">
        {d.kind === 'request' ? (
          <Link href="/for-providers/signup" className="mini gold">
            Quote this
          </Link>
        ) : (
          <Link href={demandHref(d)} className="mini">
            See port
          </Link>
        )}
      </div>
    </li>
  );
}

const CSS = `
.rq{background:var(--bg);color:var(--ink);min-height:100vh}
.rq .wrap{max-width:860px;margin:0 auto;padding:24px var(--gutter) 0}
.rq .top{text-align:center;padding:12px 0 8px}
.rq .live{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:650;color:var(--ok);background:color-mix(in srgb,var(--ok) 10%,var(--card));border:1px solid color-mix(in srgb,var(--ok) 30%,var(--line));padding:4px 11px;border-radius:999px}
.rq .dot{width:8px;height:8px;border-radius:50%;background:var(--ok);animation:rqPulse 2s infinite}
@keyframes rqPulse{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--ok) 55%,transparent)}70%{box-shadow:0 0 0 8px transparent}100%{box-shadow:0 0 0 0 transparent}}
.rq h1{font-size:clamp(30px,6vw,46px);letter-spacing:-0.035em;margin:12px 0 8px;font-weight:800;line-height:1.08}
.rq .lead{color:var(--ink2);font-size:16.5px;line-height:1.55;max-width:600px;margin:0 auto}
.rq .stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;max-width:520px;margin:20px auto 0}
.rq .stats div{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 6px;display:flex;flex-direction:column;align-items:center;min-width:0}
.rq .stats b{font-size:24px;font-weight:800;letter-spacing:-0.03em}
.rq .stats span{font-size:12.5px;color:var(--ink3);text-align:center}
.rq .stats-note{font-size:12px;color:var(--ink3);margin:6px 0 0}
.rq .ctas{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:18px}
.rq .btn{display:inline-block;padding:12px 18px;border-radius:10px;font-weight:650;text-decoration:none;font-size:15px;text-align:center}
.rq .btn.gold{background:var(--acc);color:var(--on-acc)}
.rq .btn.gold:hover{background:var(--acc-h)}
.rq .btn.ghost{border:1px solid var(--line);background:var(--card);color:var(--ink)}
.rq .btn.wide{display:block;margin-top:16px}
.rq .tabs{display:flex;gap:6px;margin:28px 0 12px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:4px}
.rq .tabs a{flex:1;text-align:center;padding:9px 8px;border-radius:9px;text-decoration:none;color:var(--ink2);font-weight:600;font-size:14px}
.rq .tabs a.on{background:var(--acc);color:var(--on-acc)}
.rq .list{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.rq .it{display:flex;align-items:center;gap:12px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 14px;min-width:0;animation:rqIn .4s ease both}
.rq .it.request{border-color:color-mix(in srgb,var(--acc) 35%,var(--line))}
@keyframes rqIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.rq .ico{flex:none;width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center}
.rq .ico.request{background:color-mix(in srgb,var(--acc) 14%,var(--card));color:var(--acc)}
.rq .ico.search{background:color-mix(in srgb,var(--ok) 12%,var(--card));color:var(--ok)}
.rq .body{flex:1;min-width:0}
.rq .l1{display:flex;align-items:center;gap:8px;min-width:0}
.rq .l1 b{font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rq .urg{font-style:normal;font-size:11px;font-weight:700;color:#fff;background:#d64545;padding:2px 7px;border-radius:999px;flex:none}
.rq .l2{display:flex;flex-wrap:wrap;gap:0 6px;color:var(--ink2);font-size:13.5px;margin-top:2px}
.rq .l3{color:var(--ink3);font-size:12px;margin-top:2px}
.rq .act{flex:none}
.rq .mini{display:inline-block;padding:8px 12px;border-radius:9px;border:1px solid var(--line);color:var(--ink);text-decoration:none;font-size:13px;font-weight:600;white-space:nowrap}
.rq .mini.gold{background:var(--acc);color:var(--on-acc);border-color:transparent}
.rq .empty{background:var(--card);border:1px dashed var(--line);border-radius:14px;padding:26px 20px;text-align:center}
.rq .empty p{color:var(--ink2);font-size:14.5px;line-height:1.55;margin:8px auto 16px;max-width:460px}
.rq .how{margin-top:36px;background:linear-gradient(135deg,color-mix(in srgb,var(--acc) 10%,var(--card)),var(--card));border:1px solid var(--line);border-radius:16px;padding:22px}
.rq .how h2{font-size:21px;margin:0 0 12px;letter-spacing:-0.02em}
.rq .how ol{margin:0;padding:0;list-style:none;display:grid;gap:10px;counter-reset:s}
.rq .how li{display:flex;flex-direction:column;padding-left:38px;position:relative;counter-increment:s}
.rq .how li::before{content:counter(s);position:absolute;left:0;top:0;width:26px;height:26px;border-radius:8px;background:var(--acc);color:var(--on-acc);font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center}
.rq .how b{font-size:15px}.rq .how span{color:var(--ink2);font-size:14px;line-height:1.5}
@media (max-width:560px){
  .rq .lead{font-size:15px}
  .rq .ctas{flex-direction:column}
  .rq .ctas .btn{width:100%}
  .rq .stats b{font-size:20px}
  .rq .it{padding:11px 12px;gap:10px}
  .rq .ico{width:34px;height:34px}
  .rq .mini{padding:7px 10px;font-size:12.5px}
  .rq .l1 b{font-size:14px}
}
@media (prefers-reduced-motion:reduce){.rq .it,.rq .dot{animation:none}}
`;
