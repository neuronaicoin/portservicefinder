import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'List Your Maritime Company Free',
  description:
    'Ship agents, shipchandlers and marine service companies: list free during our launch period. Appear on your port pages and get a shareable company page.',
  alternates: { canonical: '/for-providers' },
};

const PRICING_LINE = 'Listing is free during our launch period. After the launch period, listings will cost $49.90/month or $499.90/year.';

const BENEFITS = [
  {
    title: 'Operators search by port',
    desc: 'A superintendent with a vessel heading to Constanta or Santos searches that port. If you serve it, your company is on the list they see.',
  },
  {
    title: 'Your own company page',
    desc: 'Your listing gets a company page with its own link. Share it on LinkedIn, put it in your email signature or send it to clients.',
  },
  {
    title: 'Direct contact, no commission',
    desc: 'Operators call, email or WhatsApp you directly. We are not in the middle and we never take a cut of the job.',
  },
  {
    title: 'Quote requests by port',
    desc: 'When an operator sends a quote request for your port and service, it lands in your dashboard with their contact details.',
  },
  {
    title: 'See your visibility',
    desc: 'Your dashboard shows how often your ports were searched in the last 30 days and when operators called or emailed you.',
  },
  {
    title: 'Built by maritime people',
    desc: 'PortServiceFinder was founded by maritime industry professionals. The directory is organised the way a port call runs.',
  },
];

const STEPS = [
  { title: 'Create your account', desc: 'Company name, email and password. Takes about a minute.' },
  { title: 'Add ports and services', desc: 'Choose up to 10 ports you serve, your services and your contact details.' },
  { title: 'Go live', desc: 'Your listing appears on your port pages as soon as the profile is complete.' },
  { title: 'Hear from operators', desc: 'Operators contact you by phone, email or WhatsApp, or send quote requests to your dashboard.' },
];

const WHO = [
  { title: 'Ship agents', desc: 'Port agency, husbandry, customs clearance, crew change and bunker coordination.' },
  { title: 'Shipchandlers', desc: 'Provisions, bonded stores, deck, engine and cabin stores.' },
  { title: 'Marine service companies', desc: '34 categories including engine and electrical repair, diving, welding, BWTS, refrigeration, hydraulics and surveys.' },
];

const FAQ = [
  {
    q: 'What does it cost?',
    a: `${PRICING_LINE} We will email you before the launch period ends, and you are never moved to a paid plan without choosing one.`,
  },
  {
    q: 'Do I need a credit card to sign up?',
    a: 'No. We do not ask for payment details during the launch period.',
  },
  {
    q: 'What does founding member mean?',
    a: 'Companies that list during the launch period are our founding members: the first providers operators see at their ports while the directory grows.',
  },
  {
    q: 'How many ports can I list?',
    a: 'Up to 10 ports per listing, with no extra charge per port. If you serve more, contact us.',
  },
  {
    q: 'Do you take commission on jobs?',
    a: 'No, never. Every job you agree with an operator is between you and them.',
  },
  {
    q: 'Can I remove my listing?',
    a: 'Yes, at any time. Email contact@portservicefinder.com and we remove it within 24 hours.',
  },
  {
    q: 'We operate at 20+ ports. Is there an option for us?',
    a: 'Yes. Contact us and we will set up a listing that covers all of your ports.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
};

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 3 }}>
    <path d="M5 12.5l4.5 4.5L19 7" />
  </svg>
);

export default function ForProvidersPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }} />
      <style>{`
        .fp{max-width:1080px;margin:0 auto;padding:48px 20px 8px;color:var(--ink);font-family:var(--font-ui)}
        .fp .eyebrow{font-size:13px;font-weight:600;color:var(--ink3);margin:0 0 10px}
        .fp h1{font-size:clamp(30px,6.5vw,48px);font-weight:700;letter-spacing:-0.025em;line-height:1.1;margin:0 0 16px;max-width:820px}
        .fp .lede{font-size:18px;line-height:1.6;color:var(--ink2);margin:0 0 22px;max-width:680px}
        .fp .points{list-style:none;margin:0 0 26px;padding:0;display:grid;gap:8px}
        .fp .points li{display:flex;gap:10px;align-items:flex-start;font-size:15.5px;line-height:1.5;color:var(--ink2)}
        .fp .actions{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
        .fp .btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 22px;border-radius:10px;font-weight:650;font-size:15.5px;text-decoration:none}
        .fp .btn.primary{background:var(--acc);color:var(--on-acc)}
        .fp .btn.primary:hover{background:var(--acc-h)}
        .fp .btn.ghost{border:1px solid var(--line);color:var(--ink);background:var(--card)}
        .fp .fine{font-size:14px;color:var(--ink3);margin:12px 0 0}
        .fp section{margin-top:56px}
        .fp h2{font-size:clamp(22px,4vw,28px);font-weight:700;letter-spacing:-0.015em;line-height:1.2;margin:0 0 8px}
        .fp .sub{font-size:16px;line-height:1.6;color:var(--ink2);margin:0 0 20px;max-width:680px}
        .fp .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}
        .fp .card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:18px 20px}
        .fp .card h3{font-size:16px;font-weight:650;margin:0 0 6px}
        .fp .card p{font-size:14.5px;line-height:1.6;color:var(--ink2);margin:0}
        .fp .num{display:inline-flex;width:28px;height:28px;border-radius:8px;align-items:center;justify-content:center;background:color-mix(in srgb, var(--acc) 12%, transparent);color:var(--acc);font-weight:700;font-size:14px;margin-bottom:10px}
        .fp .founding{background:var(--card);border:1px solid var(--acc);border-radius:14px;padding:24px;display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:24px;align-items:center}
        .fp .founding .price{font-size:15px;line-height:1.7;color:var(--ink2)}
        .fp .founding .price strong{color:var(--ink)}
        .fp .faq{display:grid;gap:8px;max-width:820px}
        .fp details{background:var(--card);border:1px solid var(--line);border-radius:12px}
        .fp summary{list-style:none;cursor:pointer;padding:14px 18px;min-height:44px;display:flex;align-items:center;justify-content:space-between;gap:14px;font-size:15.5px;font-weight:600}
        .fp summary::-webkit-details-marker{display:none}
        .fp summary .pm{color:var(--ink3);font-size:20px;line-height:1;transition:transform .2s;flex-shrink:0}
        .fp details[open] summary .pm{transform:rotate(45deg)}
        .fp details p{padding:0 18px 16px;margin:0;font-size:15px;line-height:1.7;color:var(--ink2)}
        .fp .final{text-align:center;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:32px 20px}
        .fp .final .sub{margin:0 auto 18px}
        @media (max-width:760px){.fp .founding{grid-template-columns:1fr}}
      `}</style>
      <SiteHeader />
      <main className="fp">
        <p className="eyebrow">For ship agents, shipchandlers and marine service companies</p>
        <h1>Be the company operators find when they search your port</h1>
        <p className="lede">
          Vessel operators use PortServiceFinder to find providers by port. List your company free during our launch period and join as a
          founding member.
        </p>
        <ul className="points">
          <li>
            <Check />
            Your listing appears on the page of every port you serve.
          </li>
          <li>
            <Check />
            You get your own company page you can share on LinkedIn.
          </li>
          <li>
            <Check />
            Operators contact you directly. No commission, ever.
          </li>
        </ul>
        <div className="actions">
          <Link href="/for-providers/signup" className="btn primary gold">
            List your company free
          </Link>
          <a href="#how-it-works" className="btn ghost">
            How it works
          </a>
        </div>
        <p className="fine">No card needed. Takes about 5 minutes. Covering 1,200+ ports in 150+ countries.</p>

        <section aria-labelledby="why">
          <h2 id="why">Why list with us</h2>
          <p className="sub">Operators who need an agent, chandler or technician at a port start by searching that port. Make sure you are there.</p>
          <div className="grid">
            {BENEFITS.map((b) => (
              <div key={b.title} className="card">
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" aria-labelledby="how" style={{ scrollMarginTop: 84 }}>
          <h2 id="how">How it works</h2>
          <p className="sub">From sign-up to a live listing in one sitting.</p>
          <div className="grid">
            {STEPS.map((s, i) => (
              <div key={s.title} className="card">
                <div className="num">{i + 1}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="who">
          <h2 id="who">Who can list</h2>
          <p className="sub">
            Companies that actually operate at the ports they list. See the <Link href="/listing-rules" style={{ color: 'var(--acc)' }}>listing rules</Link>.
          </p>
          <div className="grid">
            {WHO.map((w) => (
              <div key={w.title} className="card">
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="price">
          <div className="founding">
            <div>
              <h2 id="price">Free for founding members</h2>
              <p className="price">
                <strong>{PRICING_LINE}</strong> We will email you before the launch period ends, and you are never moved to a paid plan
                without choosing one.
              </p>
            </div>
            <div>
              <Link href="/for-providers/signup" className="btn primary gold" style={{ width: '100%' }}>
                Claim your free listing
              </Link>
              <p className="fine" style={{ textAlign: 'center' }}>
                <Link href="/pricing" style={{ color: 'var(--acc)' }}>
                  See pricing details
                </Link>
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="faq">
          <h2 id="faq">Questions from providers</h2>
          <div className="faq" style={{ marginTop: 16 }}>
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>
                  <span>{f.q}</span>
                  <span className="pm" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section>
          <div className="final">
            <h2>Put your company on your port pages</h2>
            <p className="sub">Free during the launch period. No card, no commission.</p>
            <Link href="/for-providers/signup" className="btn primary gold">
              List your company free
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
