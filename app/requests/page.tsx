import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { getDemand, demandHref, type DemandItem } from '@/lib/port-requests';
import { agoText } from '@/lib/providers-db';
import { FLAG } from '@/lib/ports';
import { MoreToggle } from '@/components/MoreToggle';

export const revalidate = 120;

export const metadata: Metadata = {
  title: 'Live Port Requests: What Ship Operators Need Right Now',
  description:
    'Live requests and searches from ship operators for ship agents, shipchandlers and marine services, port by port. Providers: list your company free to receive these enquiries.',
  alternates: { canonical: '/requests' },
};


export default async function RequestsPage() {
  const all = (await getDemand()).slice(0, 60);
  const now = Date.now();

  return (
    <div className="rq">
      <style>{CSS}</style>
      <SiteHeader />
      <main className="wrap">
        <div className="top">
          <h1>Port requests</h1>
          <p className="lead">Ship operators say what they need at a port. Companies listed at that port reply to them directly.</p>
        </div>

        <div className="lh">
          <h2>
            <span className="dot" aria-hidden="true" /> What operators are looking for
          </h2>
        </div>

        {all.length === 0 ? (
          <div className="empty">
            <p>New requests will show here.</p>
          </div>
        ) : (
          <ul className="list">
            {all.map((d, i) => (
              <Row key={d.id} d={d} now={now} extra={i >= 10} />
            ))}
          </ul>
        )}
        {all.length > 10 && <MoreToggle label={`Load more (${all.length - 10})`} />}
      </main>
      <SiteFooter />
    </div>
  );
}

function Row({ d, now, extra }: { d: DemandItem; now: number; extra: boolean }) {
  const flag = d.port?.flag || FLAG[d.country] || '';
  const req = d.kind === 'request';
  const sub = [req ? 'Quote request' : 'Searched', d.vessel, d.eta ? `ETA ${d.eta}` : null, agoText(d.at, now)].filter(Boolean).join(' · ');
  return (
    <li className={`it${req ? ' req' : ''}${extra ? ' xtra' : ''}`}>
      <Link href={req ? '/for-providers/signup' : demandHref(d)}>
        <span className="fl" aria-hidden="true">{flag || '⚓'}</span>
        <span className="body">
          <b>
            {d.service} <span className="in">in {d.portName}</span>
          </b>
          <small>
            {d.urgent && <em className="urg">Urgent</em>}
            {sub}
          </small>
        </span>
        <span className={`go${req ? ' gold' : ''}`}>{req ? 'Reply' : '›'}</span>
      </Link>
    </li>
  );
}

const CSS = `
.rq{background:var(--bg);color:var(--ink);min-height:100vh}
.rq .wrap{max-width:820px;margin:0 auto;padding:22px var(--gutter) 0}
.rq .top{text-align:center}
.rq h1{font-size:clamp(28px,6vw,42px);letter-spacing:-0.035em;margin:6px 0 6px;font-weight:800;line-height:1.1}
.rq .lead{color:var(--ink2);font-size:16px;line-height:1.5;max-width:560px;margin:0 auto}
.rq .two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:20px}
.rq .box{border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:6px;min-width:0}
.rq .box.op{background:var(--card);border:1px solid color-mix(in srgb,var(--acc) 40%,var(--line))}
.rq .box.pr{background:linear-gradient(135deg,#0b1b2b,#16314f);color:#fff}
.rq .tag{align-self:flex-start;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:3px 8px;border-radius:6px;background:color-mix(in srgb,var(--acc) 14%,transparent);color:var(--acc)}
.rq .box.pr .tag{background:rgba(201,162,39,.2);color:#e3c25a}
.rq .box b{font-size:17px;line-height:1.3}
.rq .box p{margin:0 0 6px;font-size:14px;line-height:1.5;color:var(--ink2)}
.rq .box.pr p{color:rgba(255,255,255,.78)}
.rq .btn{margin-top:auto;display:block;text-align:center;padding:12px 16px;border-radius:10px;font-weight:700;text-decoration:none;font-size:15px}
.rq .btn.gold{background:var(--acc);color:var(--on-acc)}
.rq .btn.dark{background:#c9a227;color:#1b1b1b}
.rq .lh{margin:28px 0 10px}
.rq .lh h2{display:flex;align-items:center;gap:9px;font-size:19px;margin:0;letter-spacing:-0.02em}
.rq .dot{flex:none;width:9px;height:9px;border-radius:50%;background:var(--ok);animation:rqPulse 2s infinite}
@keyframes rqPulse{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--ok) 55%,transparent)}70%{box-shadow:0 0 0 8px transparent}100%{box-shadow:0 0 0 0 transparent}}
.rq .list{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:minmax(0,1fr);gap:8px}
.rq .it{min-width:0}
.rq .it a{display:flex;align-items:center;gap:12px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 14px;text-decoration:none;color:inherit;min-width:0}
.rq .it.req a{border-color:color-mix(in srgb,var(--acc) 45%,var(--line))}
.rq .fl{flex:none;width:36px;height:36px;border-radius:10px;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:20px}
.rq .body{flex:1;min-width:0;display:flex;flex-direction:column}
.rq .body b{font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rq .body .in{font-weight:500;color:var(--ink2)}
.rq .body small{color:var(--ink3);font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rq .urg{font-style:normal;font-size:10.5px;font-weight:700;color:#fff;background:#d64545;padding:1px 6px;border-radius:999px;margin-right:6px}
.rq .go{flex:none;color:var(--ink3);font-size:22px;line-height:1}
.rq .go.gold{font-size:13px;font-weight:700;background:var(--acc);color:var(--on-acc);padding:8px 12px;border-radius:9px}
.rq .empty{background:var(--card);border:1px dashed var(--line);border-radius:14px;padding:20px;text-align:center;color:var(--ink2)}
.rq main:not(.open) .xtra{display:none}
.rq .more-tg{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;margin-top:12px;padding:12px;border:1px solid var(--line);border-radius:12px;background:var(--card);color:var(--ink);font:inherit;font-weight:650;font-size:15px;cursor:pointer}
@media (max-width:620px){
  .rq .two{grid-template-columns:minmax(0,1fr);gap:10px}
  .rq .lead{font-size:15px}
  .rq .box{padding:16px}
  .rq .it a{padding:11px 12px;gap:10px}
  .rq .body b{font-size:14.5px}
}
@media (prefers-reduced-motion:reduce){.rq .dot{animation:none}}
`;
