import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { HomeSearch } from '@/components/home/HomeSearch';
import { HeroFinder } from '@/components/home/HeroFinder';
import { ProviderAvatar } from '@/components/home/ProviderAvatar';
import { agoText, getListedProviders, getListingStats, initials } from '@/lib/providers-db';
import { BLOG_POSTS } from './data/blog';
import { siteConfig } from '@/lib/site-config';
import { getDemand, demandHref } from '@/lib/port-requests';

// the newest companies and counts: refreshed every 5 minutes
export const revalidate = 120;

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
  const [stats, providers, demand] = await Promise.all([getListingStats(), getListedProviders(), getDemand()]);
  const live = demand.slice(0, 4);
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

      <section className="wrap hero">
        <div className="hero-main">
          <h1>Ship agents, chandlers and marine services, <span className="h1-acc">port by port.</span></h1>
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
          <p className="popular hp-desk">
            <span>Popular:</span>
            <Link href="/ports/singapore/bunker-supply">Singapore bunkers</Link>
            <Link href="/ports/rotterdam/ship-agent">Rotterdam agents</Link>
            <Link href="/ports/istanbul/shipchandler">Istanbul chandlers</Link>
            <Link href="/ports/houston/main-engine-service">Houston engine service</Link>
            <Link href="/ports/fujairah">Fujairah</Link>
            <Link href="/ports/santos">Santos</Link>
            <Link href="/ports/cape-town">Cape Town</Link>
            <Link href="/ports">All ports →</Link>
          </p>
          <div className="hs-desk">
            <HomeSearch />
          </div>
          <HeroFinder />
          {live.length > 0 && (
            <section className="livereq lr-mob" aria-labelledby="lr-h">
              <div className="sec-h">
                <h2 id="lr-h">
                  <span className="pulse" aria-hidden="true" /> Live port requests
                </h2>
                <Link href="/requests">See all →</Link>
              </div>
              <ul className="lr">
                {live.map((d) => (
                  <li key={d.id}>
                    <Link href={d.kind === 'request' ? '/requests' : demandHref(d)}>
                      <span className={`lk ${d.kind}`}>{d.kind === 'request' ? 'Request' : 'Looking for'}</span>
                      <span className="lt">
                        <b>{d.service}</b>
                        <small>
                          {d.port?.flag} {d.portName} · {agoText(d.at, now)}
                        </small>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="hero-side">
            {live.length > 0 && (
              <section className="livereq lr-desk" aria-labelledby="lr-h2">
                <div className="sec-h">
                  <h2 id="lr-h2">
                    <span className="pulse" aria-hidden="true" /> Live port requests
                  </h2>
                  <Link href="/requests">See all →</Link>
                </div>
                <ul className="lr">
                  {live.map((d) => (
                    <li key={d.id}>
                      <Link href={d.kind === 'request' ? '/requests' : demandHref(d)}>
                        <span className={`lk ${d.kind}`}>{d.kind === 'request' ? 'Request' : 'Looking for'}</span>
                        <span className="lt">
                          <b>{d.service}</b>
                          <small>
                            {d.port?.flag} {d.portName} · {agoText(d.at, now)}
                          </small>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
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
        </div>
      </section>



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

      <section className="wrap sec" aria-labelledby="ft-h">
        <div className="sec-h">
          <h2 id="ft-h">Featured companies</h2>
          <Link href="/contact?topic=featured">Get featured →</Link>
        </div>
        <div className="feat">
          {['Ship agent', 'Shipchandler', 'Marine services'].map((t) => (
            <Link key={t} href="/contact?topic=featured" className="card fslot">
              <span className="fbadge">Featured spot</span>
              <b>Your company here</b>
              <small>{t} · top of your port pages</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="wrap sec">
        <div className="sec-h">
          <h2>Free voyage tools</h2>
          <Link href="/voyage">All 41 tools →</Link>
        </div>
        <div className="grid3 tools-grid">
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
        <div className="qs">
          {FAQ.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
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
.home .h1-acc{background:linear-gradient(90deg,var(--acc),#c9a227,var(--acc));background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:psfShine 6s linear infinite}
@keyframes psfShine{to{background-position:-200% 0}}
.home .hero{position:relative;isolation:isolate}
.home .hero::before{content:"";position:absolute;inset:0 0 auto;height:340px;-webkit-mask-image:linear-gradient(transparent,#000 25%,#000 60%,transparent);mask-image:linear-gradient(transparent,#000 25%,#000 60%,transparent);z-index:-1;pointer-events:none;background:radial-gradient(600px 220px at 15% 20%,color-mix(in srgb,var(--acc) 16%,transparent),transparent 70%),radial-gradient(500px 200px at 85% 10%,color-mix(in srgb,#c9a227 14%,transparent),transparent 70%);animation:psfFloat 9s ease-in-out infinite alternate}
@keyframes psfFloat{to{transform:translate3d(0,14px,0) scale(1.03)}}
.home .hero,.home .sec,.home .join{animation:psfUp .6s ease both}
@keyframes psfUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.home .ticker{margin-top:12px}
.home .faq .qs{display:grid;gap:10px}
.home .faq details{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:0 18px}
.home .faq summary{list-style:none;cursor:pointer;font-weight:650;font-size:15.5px;padding:15px 28px 15px 0;position:relative}
.home .faq summary::-webkit-details-marker{display:none}
.home .faq summary::after{content:"+";position:absolute;right:0;top:50%;transform:translateY(-50%);font-size:22px;font-weight:500;color:var(--acc);transition:transform .2s}
.home .faq details[open] summary::after{transform:translateY(-50%) rotate(45deg)}
.home .faq details p{margin:0 0 15px;color:var(--ink2);line-height:1.6;font-size:14.5px}
@media (prefers-reduced-motion:reduce){.home .h1-acc,.home .hero::before,.home .hero,.home .sec,.home .join{animation:none}}
@media (max-width:820px){
  .home .sub{display:none}
  .home .hero{padding-bottom:8px}
  .home h1{margin-bottom:16px}
  .home .hstats{margin-bottom:10px}
  .home .hstats div{padding:0 4px;height:56px;justify-content:center}
  .home .hstats b{font-size:clamp(16px,4.6vw,19px);line-height:1.1}
  .home .hstats span{font-size:10.5px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
  .home .hs-mob{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:0;background:none;box-shadow:none;border-radius:0}
  .home .fb{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-width:0;height:56px;padding:0 6px;border:0;border-radius:12px;font:inherit;cursor:pointer;color:#fff;box-shadow:0 6px 16px -8px rgba(0,0,0,.45);position:relative;overflow:hidden}
  .home .fb b{font-size:14px;font-weight:750;line-height:1.15;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .home .fb small{font-size:10.5px;font-weight:650;opacity:.85;letter-spacing:.02em;text-transform:uppercase;white-space:nowrap}
  .home .fb.now{box-shadow:0 0 0 3px color-mix(in srgb,var(--acc) 35%,transparent),0 6px 16px -8px rgba(0,0,0,.45)}
  .home .fb-c{background:linear-gradient(135deg,#1f6feb,#2a4fb3)}
  .home .fb-p{background:linear-gradient(135deg,#0f9d8a,#137a6b)}
  .home .fb-s{background:linear-gradient(135deg,#d4a72c,#b8892a);color:#1b1b1b}
  .home .fb::after{content:"";position:absolute;inset:0;background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.28) 50%,transparent 70%);transform:translateX(-100%);animation:psfSweep 3.6s ease-in-out infinite}
  .home .fb-p::after{animation-delay:.4s}.home .fb-s::after{animation-delay:.8s}
  .home .fb:active{transform:scale(.97)}
  .home .ticker{margin-top:10px}
  .home .ticker .lab{margin:8px 10px 8px 12px;font-size:11.5px;padding:4px 9px}
  .home .chip{padding:9px 0;font-size:13px}
  .home .sec{padding-top:28px}
  .home .steps{grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
  .home .steps li{padding:12px 10px}
  .home .steps li::before{width:24px;height:24px;margin-bottom:6px;font-size:13px}
  .home .steps b{font-size:13px;line-height:1.3;margin:0}
  .home .steps span{display:none}
  .home .join{margin-top:28px}
  .home .tools-grid{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;margin-right:calc(var(--gutter) * -1);padding-right:var(--gutter)}
  .home .tools-grid::-webkit-scrollbar{display:none}
  .home .tools-grid .tool{flex:none;padding:10px 14px;border-radius:999px}
  .home .tools-grid .tool span{display:none}
  .home .tools-grid .tool b{font-size:14px;white-space:nowrap}
  .home .guide:nth-child(n+3){display:none}
  .home .faq summary{font-size:14.5px;padding:13px 26px 13px 0}
  .home .faq details{padding:0 14px}
  .home .faq details p{font-size:14px}
}

.home .livereq{margin-top:26px}
.home .livereq h2{display:flex;align-items:center;gap:10px;font-size:19px;font-weight:750;margin:0 0 10px;letter-spacing:-0.02em}
.home .livereq h2 .pulse{flex:none}
.home .lr{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.home .lr a{display:flex;align-items:center;gap:12px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 14px;text-decoration:none;color:inherit;min-width:0;animation:psfUp .5s ease both}
.home .lr li:nth-child(2) a{animation-delay:.08s}.home .lr li:nth-child(3) a{animation-delay:.16s}.home .lr li:nth-child(4) a{animation-delay:.24s}
.home .lr a:hover{border-color:color-mix(in srgb,var(--acc) 55%,var(--line))}
.home .lk{flex:none;font-size:11.5px;font-weight:700;padding:4px 9px;border-radius:999px}
.home .lk.request{background:color-mix(in srgb,var(--acc) 14%,var(--card));color:var(--acc)}
.home .lk.search{background:color-mix(in srgb,var(--ok) 12%,var(--card));color:var(--ok)}
.home .lt{min-width:0;display:flex;flex-direction:column}
.home .lt b{font-size:14.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.home .lt small{color:var(--ink3);font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.home .feat{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.home .fslot{padding:16px 18px;display:flex;flex-direction:column;gap:4px;border-style:dashed;background:linear-gradient(135deg,color-mix(in srgb,#c9a227 8%,var(--card)),var(--card))}
.home .fslot b{font-size:15.5px}.home .fslot small{color:var(--ink3);font-size:13px}
.home .fbadge{align-self:flex-start;font-size:11px;font-weight:700;letter-spacing:.02em;color:#8a6d12;background:color-mix(in srgb,#c9a227 22%,var(--card));padding:3px 8px;border-radius:6px;margin-bottom:4px}
@media (max-width:820px){
  .home .livereq{margin-top:18px}
  .home .panel .row:nth-child(n+5){display:none}
  .home .lr{grid-template-columns:minmax(0,1fr);gap:8px}
  .home .lr a{padding:10px 12px}
  .home .feat{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;margin-right:calc(var(--gutter) * -1);padding-right:var(--gutter)}
  .home .feat::-webkit-scrollbar{display:none}
  .home .fslot{flex:none;width:72%;max-width:260px;padding:12px 14px}
}
@keyframes psfSweep{0%,60%{transform:translateX(-100%)}100%{transform:translateX(100%)}}

/* desktop fit */
.home .lr-desk,.home .hp-desk{display:none}
@media (min-width:821px){
  .home .lr-mob{display:none}
  .home .lr-desk{display:block;margin:0 0 14px}
  .home .lr-desk .lr{grid-template-columns:minmax(0,1fr);gap:6px}
  .home .lr-desk .lr a{padding:7px 12px;border-radius:12px}
  .home .lr-desk h2{font-size:15px;font-weight:700;margin:0}
  .home .lr-desk .sec-h{margin-bottom:8px;align-items:center}
  .home .lr-desk .sec-h a{font-size:13.5px}
  .home .hero-side{min-width:0;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px 18px 12px;box-shadow:var(--shadow)}
  .home .hero-side .panel{background:none;border:0;box-shadow:none;padding:12px 0 0;border-top:1px solid var(--line);border-radius:0}
  .home .hero-side .panel .row{padding:8px 0}
  .home .hero-side .panel .row:nth-of-type(n+5){display:none}
  .home .hero-main{display:flex;flex-direction:column}
  .home .hero-main .hs-desk{order:3;margin-bottom:18px}
  .home .hero-main .hstats{order:4;margin-bottom:0;border-bottom:0;padding-bottom:0}
  .home .hp-desk{display:flex;order:5;margin-top:18px}
  .home .lr-desk .lk{font-size:11px;padding:3px 8px}
  .home .lr-desk .lt b{font-size:14px}
  .home .hero{padding-top:22px;padding-bottom:28px;align-items:start}
  .home h1{font-size:clamp(34px,3.7vw,54px)}
  .home .sub{margin:12px 0 20px;font-size:17px}
  .home .joined-wrap{padding-top:12px}
  .home .joined{padding:8px 18px;gap:10px 24px}
  .home .j-num b{font-size:clamp(28px,2.6vw,36px)}
  .home .j-sub{font-size:13.5px;line-height:1.4}
  .home .j-cta{padding-top:10px;padding-bottom:10px}
  .home .chip{padding:9px 0}
  .home .ticker .lab{margin-top:7px;margin-bottom:7px}
}
@media (min-width:821px) and (max-height:820px){
  .home h1{font-size:clamp(32px,3.3vw,46px)}
  .home .sub{font-size:16px;margin:10px 0 16px}
}
`;
