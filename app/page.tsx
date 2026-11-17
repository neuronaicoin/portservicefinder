import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { HomeSearch } from '@/components/home/HomeSearch';
import { FinderButton } from '@/components/MobileFinder';
import { ProviderAvatar } from '@/components/home/ProviderAvatar';
import { agoText, getListedProviders, getListingStats, initials } from '@/lib/providers-db';
import { BLOG_POSTS } from './data/blog';
import { siteConfig } from '@/lib/site-config';

// the newest companies and counts: refreshed every 5 minutes
export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: 'PortServiceFinder: Ship Agents, Shipchandlers & Marine Services at 1,200+ Ports' },
  description:
    'Find ship agents, shipchandlers and marine service companies port by port and contact them directly. Free for vessel operators, no commission. Providers list free.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'PortServiceFinder: ship agents, shipchandlers and marine services worldwide',
    description: 'Search providers port by port and contact them directly. Free for vessel operators, no commission.',
    url: '/',
    type: 'website',
  },
};

const TOOLS: [string, string, string][] = [
  ['laytime', 'Laytime & demurrage', 'Statement of facts to demurrage or despatch in minutes.'],
  ['cii', 'CII rating', 'Attained vs required CII and the A to E rating.'],
  ['distance', 'Port distance', 'Sea routes and distances between ports.'],
  ['bunker', 'Bunker calculator', 'Consumption, ROB and bunker cost for a passage.'],
  ['tce', 'TCE calculator', 'Time charter equivalent from voyage revenue and costs.'],
  ['psc', 'PSC checklist', 'Prepare for port state control inspections.'],
];

const FAQ = [
  {
    q: 'Is PortServiceFinder free for ship operators?',
    a: 'Yes. Searching providers and contacting them is free for vessel operators, charterers and ship managers. You contact companies directly by phone, email or WhatsApp, and PortServiceFinder takes no commission on any job.',
  },
  {
    q: 'Which services can I find?',
    a: 'Ship agents, shipchandlers and 34 categories of marine services, including bunker supply, engine and electrical repair, hull cleaning and diving, surveys, crew change logistics, waste disposal and safety equipment service.',
  },
  {
    q: 'How do companies get listed?',
    a: 'Any ship agent, shipchandler or marine service company can create a listing for the ports it serves. Listing is free during our launch period. After the launch period, listings will cost $49.90 a month or $499.90 a year.',
  },
  {
    q: 'Do you check the companies?',
    a: 'Each listing is created by the company itself with its contact details and the ports it serves. Operators should still check references and certificates before appointing any provider, as with any new supplier.',
  },
];

export default async function Home() {
  const [stats, providers] = await Promise.all([getListingStats(), getListedProviders()]);
  const newest = providers.slice(0, 6);
  const ticker = providers.slice(0, 24);
  const guides = [...BLOG_POSTS].sort((a, b) => String(b.publishedDate).localeCompare(String(a.publishedDate))).slice(0, 6);
  const now = Date.now();

  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
    newest.length > 0 && {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Companies that joined PortServiceFinder recently',
      itemListElement: newest.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.name, url: `${siteConfig.url}/providers/${p.slug}` })),
    },
  ].filter(Boolean);

  return (
    <div className="home">
      <style>{CSS}</style>
      {ld.map((o, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(o).replace(/</g, '\\u003c') }} />
      ))}
      <SiteHeader />

      <section className="wrap joined-wrap" aria-label="Companies joining PortServiceFinder">
        <div className="joined">
          <div className="j-num">
            <span className="pulse" aria-hidden="true" />
            <b>{stats.last30 > 0 ? stats.last30 : stats.total}</b>
            <span className="j-t">
              {stats.last30 > 0 ? (
                <>
                  {stats.last30 === 1 ? 'company' : 'companies'} joined
                  <br />
                  in the last 30 days
                </>
              ) : (
                <>
                  companies
                  <br />
                  listed so far
                </>
              )}
            </span>
          </div>
          {newest.length > 0 && (
            <div className="j-faces" aria-hidden="true">
              {newest.slice(0, 5).map((p) => (
                <span key={p.id} className="j-face">
                  <ProviderAvatar text={initials(p.name)} size={34} />
                </span>
              ))}
              <span className="j-more">{stats.total} companies listed</span>
            </div>
          )}
          <p className="j-sub">Ship agents, shipchandlers and marine service companies are listing their ports now. Listing is free during our launch period.</p>
          <Link href="/for-providers/signup" className="btn gold j-cta">
            List<span className="j-long"> your company</span> free →
          </Link>
        </div>
      </section>

      <section className="wrap hero">
        <div className="hero-main">
          <h1>Ship agents, chandlers and marine services, port by port.</h1>
          <p className="sub">
            Find providers at 1,200+ ports in 150+ countries and contact them directly. Free for ship operators, no commission on any job.
          </p>
          <div className="hstats" aria-label="Coverage">
            <div>
              <b>1,200+</b>
              <span>ports</span>
            </div>
            <div>
              <b>150+</b>
              <span>countries</span>
            </div>
            <div>
              <b>34</b>
              <span>service categories</span>
            </div>
          </div>
          <div className="hs-desk">
            <HomeSearch />
          </div>
          <FinderButton className="hs-mob">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <span>
              <b>Find a provider</b>
              <small>Country · Port · Service</small>
            </span>
          </FinderButton>
        </div>

        <aside className="panel" aria-labelledby="new-h">
          <div className="panel-h">
            <h2 id="new-h">New on PortServiceFinder</h2>
            <span className="live">
              <span className="pulse" aria-hidden="true" /> Live
            </span>
          </div>
          {newest.length === 0 && <p className="empty">The first companies are joining now.</p>}
          {newest.map((p) => (
            <Link key={p.id} href={`/providers/${p.slug}`} className="row">
              <ProviderAvatar text={initials(p.name)} size={38} />
              <span className="row-t">
                <b>{p.name}</b>
                <small>
                  {p.flag} {p.ports[0]?.name}, {p.country} · {p.typeLabel}
                </small>
              </span>
              <em>Joined {agoText(p.joinedAt, now)}</em>
            </Link>
          ))}
          <Link href="/providers" className="more">
            See all {stats.total} companies →
          </Link>
        </aside>
      </section>

      {ticker.length > 0 && (
        <div className="ticker" aria-label="Companies that joined recently">
          <span className="lab">Just joined</span>
          <div className="track-wrap">
            <div className="track" style={{ animationDuration: `${Math.max(90, ticker.length * 7)}s` }}>
              {[0, 1].map((k) => (
                <span key={k} className="set" aria-hidden={k === 1}>
                  {ticker.map((p) => (
                    <Link key={`${k}-${p.id}`} href={`/providers/${p.slug}`} className="chip" tabIndex={k === 1 ? -1 : undefined}>
                      <ProviderAvatar text={initials(p.name)} size={24} />
                      <b>{p.name}</b>
                      <span>
                        {p.flag} {p.ports[0]?.name}, {p.country} · joined {agoText(p.joinedAt, now)}
                      </span>
                    </Link>
                  ))}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}


      <section className="wrap sec">
        <h2>How it works</h2>
        <ol className="steps">
          <li>
            <b>Pick a port and a service</b>
            <span>Ship agency, chandlery, bunkers, repairs, surveys and 30 more categories.</span>
          </li>
          <li>
            <b>Compare the companies there</b>
            <span>See what each provider does, which ports they cover and how to reach them.</span>
          </li>
          <li>
            <b>Contact them directly</b>
            <span>Call, email or WhatsApp. No middleman, no commission, no signup needed.</span>
          </li>
        </ol>
      </section>

      <section className="wrap">
        <div className="join card">
          <div>
            <h2>Your competitors are listing here. Are you?</h2>
            <p>
              {stats.last30 > 0 ? `${stats.last30} companies joined in the last 30 days. ` : ''}
              Get a company page operators find by port, a listing on every port you serve and a card to share on LinkedIn. Free during our launch period.
            </p>
          </div>
          <div className="join-cta">
            <Link href="/for-providers/signup" className="btn gold">
              List your company free
            </Link>
            <Link href="/for-providers" className="ghost">
              How listing works
            </Link>
          </div>
        </div>
      </section>

      <section className="wrap sec">
        <div className="sec-h">
          <h2>Free voyage tools</h2>
          <Link href="/voyage">All 41 tools →</Link>
        </div>
        <div className="grid3">
          {TOOLS.map(([slug, name, text]) => (
            <Link key={slug} href={`/voyage/${slug}`} className="card tool">
              <b>{name}</b>
              <span>{text}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="wrap sec">
        <div className="sec-h">
          <h2>Latest guides</h2>
          <Link href="/blog">All guides →</Link>
        </div>
        <div className="grid3">
          {guides.map((g) => (
            <Link key={g.slug} href={`/blog/${g.slug}`} className="card guide">
              <b>{g.title}</b>
              <span>{g.excerpt}</span>
              {Number(g.readingTime) > 0 && <small>{g.readingTime} min read</small>}
            </Link>
          ))}
        </div>
      </section>

      <section className="wrap sec faq">
        <h2>Questions</h2>
        <dl>
          {FAQ.map((f) => (
            <div key={f.q}>
              <dt>{f.q}</dt>
              <dd>{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <SiteFooter />
    </div>
  );
}

const CSS = `
.home{background:var(--bg);color:var(--ink);min-height:100vh}
.home .wrap{max-width:var(--wrap);margin:0 auto;padding:0 var(--gutter)}
.home .hero{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:clamp(28px,4vw,64px);padding-top:28px;padding-bottom:36px;align-items:start}
.home .eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:var(--ok);margin:0}
.home .pulse{width:8px;height:8px;border-radius:50%;background:var(--ok);box-shadow:0 0 0 0 color-mix(in srgb,var(--ok) 60%,transparent);animation:psfPulse 2s infinite}
@keyframes psfPulse{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--ok) 55%,transparent)}70%{box-shadow:0 0 0 8px transparent}100%{box-shadow:0 0 0 0 transparent}}
.home h1{font-size:clamp(30px,4.6vw,60px);line-height:1.06;letter-spacing:-0.035em;margin:0;font-weight:800;overflow-wrap:break-word}
.home .sub{color:var(--ink2);font-size:18px;line-height:1.55;margin:16px 0 24px;max-width:600px}
.home .popular{margin:14px 0 0;font-size:14px;color:var(--ink3);display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.home .popular a{border:1px solid var(--line);background:var(--card);border-radius:999px;padding:5px 11px;color:var(--ink2);text-decoration:none}
.home .popular a:hover{border-color:var(--acc);color:var(--acc)}
.home .panel{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px 18px 14px;box-shadow:var(--shadow)}
.home .panel-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}
.home .panel h2{font-size:15px;margin:0;font-weight:700}
.home .live{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;color:var(--ok);font-weight:600}
.home .row{display:flex;gap:12px;align-items:center;padding:11px 0;border-bottom:1px solid var(--line);text-decoration:none;color:inherit}
.home .row:last-of-type{border-bottom:0}
.home .row-t{min-width:0;flex:1}.home .row b{display:block;font-size:14.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.home .row small{display:block;color:var(--ink3);font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.home .row em{font-style:normal;font-size:12px;color:var(--ok);white-space:nowrap;font-weight:500}
.home .row:hover b{color:var(--acc)}
.home .more{display:block;margin-top:10px;color:var(--acc);font-weight:600;font-size:14px;text-decoration:none}
.home .empty{color:var(--ink3);font-size:14px}
.home .ticker{display:flex;align-items:center;border-top:1px solid var(--line);border-bottom:1px solid var(--line);background:var(--card);overflow:hidden}
.home .ticker .lab{flex:none;background:var(--acc);color:var(--on-acc);font-weight:700;font-size:12.5px;padding:5px 11px;border-radius:7px;margin:10px 14px 10px 20px;position:relative;z-index:1}
.home .track-wrap{overflow:hidden;flex:1;-webkit-mask-image:linear-gradient(90deg,transparent,#000 40px,#000 calc(100% - 40px),transparent);mask-image:linear-gradient(90deg,transparent,#000 40px,#000 calc(100% - 40px),transparent)}
.home .track{display:flex;width:max-content;animation:psfTicker 160s linear infinite}
.home .ticker:hover .track{animation-play-state:paused}
@keyframes psfTicker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.home .set{display:flex;flex:none}
.home .chip{display:inline-flex;align-items:center;gap:8px;margin-right:28px;white-space:nowrap;font-size:14px;color:var(--ink2);text-decoration:none;padding:12px 0}
.home .chip b{color:var(--ink);font-weight:600}
.home .hstats{display:grid;grid-template-columns:repeat(3,max-content);gap:12px 40px;margin:0 0 22px;padding:14px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.home .hstats div{display:flex;flex-direction:column;line-height:1.2}
.home .hstats b{font-size:26px;font-weight:800;letter-spacing:-0.03em;color:var(--ink)}
.home .hstats span{font-size:13.5px;color:var(--ink3);margin-top:2px}
@media (max-width:820px){.home .hstats{grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;border:0;padding:0}.home .hstats div{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 8px;text-align:center;align-items:center;min-width:0}.home .hstats b{font-size:clamp(19px,5.6vw,24px)}.home .hstats span{font-size:12px;line-height:1.25;overflow-wrap:break-word}}
.home .stats{display:flex;flex-wrap:wrap;gap:16px 44px;padding-top:30px;padding-bottom:10px}
.home .stats div{display:flex;flex-direction:column}
.home .stats b{font-size:28px;letter-spacing:-0.03em;font-weight:800}
.home .stats span{color:var(--ink3);font-size:13.5px}
.home .sec{padding-top:40px}
.home .sec h2,.home .join h2{font-size:24px;letter-spacing:-0.025em;margin:0 0 14px;font-weight:750}
.home .sec-h{display:flex;align-items:baseline;justify-content:space-between;gap:12px}
.home .sec-h a{color:var(--acc);font-weight:600;font-size:14.5px;text-decoration:none;white-space:nowrap}
.home .card{background:var(--card);border:1px solid var(--line);border-radius:14px;text-decoration:none;color:inherit}
.home a.card:hover{border-color:color-mix(in srgb,var(--acc) 55%,var(--line))}
.home .grid4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.home .grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.home .port{padding:14px 16px}.home .port b{display:block;font-size:15px}.home .port small{color:var(--ink3);font-size:13px}
.home .steps{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;counter-reset:s}
.home .steps li{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px;counter-increment:s}
.home .steps li::before{content:counter(s);display:inline-flex;width:28px;height:28px;border-radius:8px;background:color-mix(in srgb,var(--acc) 12%,var(--card));color:var(--acc);font-weight:700;align-items:center;justify-content:center;margin-bottom:10px}
.home .steps b{display:block;font-size:16px;margin-bottom:4px}.home .steps span{color:var(--ink2);font-size:14.5px;line-height:1.55}
.home .join{margin-top:40px;padding:26px;display:flex;gap:24px;align-items:center;justify-content:space-between;background:linear-gradient(135deg,color-mix(in srgb,var(--acc) 10%,var(--card)),var(--card))}
.home .join p{color:var(--ink2);margin:0;max-width:640px;line-height:1.6}
.home .join-cta{display:flex;gap:10px;flex-wrap:wrap;flex:none}
.home .btn{background:var(--acc);color:var(--on-acc);padding:12px 18px;border-radius:10px;font-weight:650;text-decoration:none;white-space:nowrap}
.home .btn:hover{background:var(--acc-h)}
.home .ghost{border:1px solid var(--line);background:var(--card);color:var(--ink);padding:11px 16px;border-radius:10px;font-weight:600;text-decoration:none;white-space:nowrap}
.home .tool,.home .guide{padding:16px 18px;display:flex;flex-direction:column;gap:6px}
.home .tool b,.home .guide b{font-size:15.5px;line-height:1.35}
.home .tool span,.home .guide span{color:var(--ink2);font-size:14px;line-height:1.5}
.home .guide span{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.home .guide small{color:var(--ink3);font-size:12.5px;margin-top:auto}
.home .faq dl{margin:0;display:grid;gap:10px}
.home .faq dl div{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px 18px}
.home .faq dt{font-weight:650;font-size:15.5px}.home .faq dd{margin:6px 0 0;color:var(--ink2);line-height:1.6;font-size:14.5px}
@media (max-width:960px){
  .home .hero{grid-template-columns:minmax(0,1fr);padding-top:20px;gap:24px}
  .home .grid4{grid-template-columns:repeat(2,minmax(0,1fr))}
  .home .grid3,.home .steps{grid-template-columns:1fr}
  .home .join{flex-direction:column;align-items:flex-start}
}
@media (max-width:520px){
  .home .sub{font-size:16.5px}
  .home .stats{gap:14px 28px}.home .stats b{font-size:24px}
  .home .ticker .lab{margin-left:16px}
  .home .row em{display:none}
}
.home .joined-wrap{padding-top:16px}
.home .joined{display:grid;grid-template-columns:auto auto minmax(0,1fr) auto;align-items:center;gap:14px 28px;padding:12px 20px;border-radius:18px;border:1px solid color-mix(in srgb,var(--ok) 35%,var(--line));background:linear-gradient(120deg,color-mix(in srgb,var(--ok) 12%,var(--card)),var(--card) 60%);box-shadow:var(--shadow)}
.home .j-num{display:flex;align-items:center;gap:12px}
.home .j-num .pulse{width:11px;height:11px;flex:none}
.home .j-num b{font-size:clamp(34px,3.4vw,44px);line-height:1;font-weight:850;letter-spacing:-0.04em;color:var(--ok)}
.home .j-t{font-size:15px;font-weight:650;line-height:1.3;color:var(--ink)}
.home .j-faces{display:flex;align-items:center}
.home .j-face{display:inline-flex;border-radius:10px;box-shadow:0 0 0 2px var(--card);margin-left:4px;background:var(--card)}
.home .j-face:first-child{margin-left:0}
.home .j-more{margin-left:10px;font-size:13.5px;font-weight:650;color:var(--ink2);white-space:nowrap}
.home .j-sub{margin:0;color:var(--ink2);font-size:14.5px;line-height:1.5}
.home .j-cta{padding:13px 20px;font-size:15px}
.home .hs-mob{display:none}
.home .hero-main,.home .panel{min-width:0}
@media (max-width:1100px){.home .joined{grid-template-columns:auto minmax(0,1fr) auto}.home .j-faces{display:none}}
@media (max-width:820px){
  .home .hs-desk{display:none}
  .home .hs-mob{display:flex;width:100%;align-items:center;gap:12px;padding:14px 16px;border-radius:14px;border:0;background:var(--acc);color:var(--on-acc);font:inherit;text-align:left;cursor:pointer;box-shadow:var(--shadow)}
  .home .hs-mob span{display:flex;flex-direction:column;line-height:1.25}
  .home .hs-mob b{font-size:17px}.home .hs-mob small{font-size:13px;opacity:.85}
  .home .joined{grid-template-columns:minmax(0,1fr) auto;gap:10px;padding:12px 14px;border-radius:14px}
  .home .j-faces,.home .j-sub,.home .j-long{display:none}
  .home .j-num{gap:9px}
  .home .j-num .pulse{width:9px;height:9px}
  .home .j-num b{font-size:32px}
  .home .j-t{font-size:13.5px;line-height:1.25}
  .home .j-cta{padding:10px 12px;font-size:14px;white-space:nowrap}
  .home .popular{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;margin-right:calc(var(--gutter) * -1);padding-right:var(--gutter)}
  .home .popular::-webkit-scrollbar{display:none}
  .home .popular a{white-space:nowrap;flex:none}
}
@media (max-width:520px){
  .home .j-face:nth-child(n+5){display:none}
  .home .j-faces{flex-wrap:wrap;row-gap:6px}
  .home .port{padding:12px}.home .port b{font-size:14.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.home .port small{display:block;font-size:12.5px}
  .home .sec h2,.home .join h2{font-size:21px}
  .home .join{padding:20px}.home .join-cta{width:100%}.home .join-cta a{flex:1;text-align:center}
  .home .sec-h a{font-size:14px}
}
`;
