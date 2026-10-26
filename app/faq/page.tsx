import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'FAQ: Vessel Operators and Providers',
  description:
    'Answers about PortServiceFinder: free search for vessel operators, how listings work, launch-period pricing for providers, payments and where we are based.',
  alternates: { canonical: '/faq' },
};

interface FAQItem {
  q: string;
  a: string;
}
interface FAQCategory {
  title: string;
  items: FAQItem[];
}

const FAQ_DATA: FAQCategory[] = [
  {
    title: 'For vessel operators',
    items: [
      {
        q: 'Is PortServiceFinder free for vessel operators?',
        a: 'Yes. There is no subscription, no sign-up and no paywall. Search any port and contact any provider for free, whether you are a ship manager, master, superintendent or shipping company.',
      },
      {
        q: 'How do I contact a provider after I find them?',
        a: 'Open the provider listing to see their phone, email, WhatsApp and website. You talk to the provider directly. We do not sit in the middle, filter messages or take a commission.',
      },
      {
        q: 'Can I ask several providers for a quote at once?',
        a: 'Yes. Use the Request a Quote form: choose the port and service, describe what you need, and the request goes to the listed providers that match. They reply to you directly.',
      },
      {
        q: 'How are providers checked?',
        a: 'We review listings against our listing rules, including contact details and the ports a company claims to serve, and remove listings with false information. Listings that pass display a Verified badge. The badge confirms the business is real; it is not a guarantee of service quality, so do your usual checks before you appoint anyone.',
      },
      {
        q: 'What if no provider is listed at my port?',
        a: 'We show providers from the same country as a fallback. You can also email us with the port name and we will prioritise finding providers there.',
      },
    ],
  },
  {
    title: 'For service providers',
    items: [
      {
        q: 'How much does it cost to list my business?',
        a: 'Listing is free during our launch period. After the launch period, listings will cost $49.90/month or $499.90/year. We never take a commission on any job you win through the platform.',
      },
      {
        q: 'What happens when the launch period ends?',
        a: 'We will email every listed provider before it ends. You choose whether to continue on a paid plan; you are never moved to one automatically, and you can remove your listing at any time.',
      },
      {
        q: 'What does "founding member" mean?',
        a: 'Providers who list during the launch period are our founding members. They are the first companies operators see at their ports while the directory grows.',
      },
      {
        q: 'How do I get the Verified badge?',
        a: 'Complete your profile with accurate company details, ports and contact information. We review new listings and add the badge once the details check out.',
      },
      {
        q: 'How many ports can I list?',
        a: 'Up to 10 ports per listing, at no extra cost per port. If you serve more ports than that, contact us.',
      },
      {
        q: 'Do I get my own company page?',
        a: 'Yes. Your listing appears on each of your port pages and also has its own company page with a link you can share on LinkedIn, in email signatures or with clients.',
      },
    ],
  },
  {
    title: 'Payments and billing',
    items: [
      {
        q: 'When am I charged?',
        a: 'Not during the launch period: listing is free and we do not ask for card details. Charges only start if you choose a paid plan after the launch period ends, and we will tell you before that happens.',
      },
      {
        q: 'Which payment methods will you accept?',
        a: 'We will publish the accepted payment methods and email listed providers before paid plans start.',
      },
      {
        q: 'Can I switch between monthly and annual?',
        a: 'Yes. Once paid plans are live you can move from monthly to annual at any time. Moving from annual to monthly takes effect at the end of your annual period.',
      },
      {
        q: 'What is your refund policy?',
        a: 'Refunds apply to paid subscriptions after the launch period, as set out in our Refund Policy. You can cancel at any time and your listing stays active until the end of the period you paid for.',
      },
    ],
  },
  {
    title: 'General',
    items: [
      {
        q: 'Who runs PortServiceFinder?',
        a: 'PortServiceFinder is run by people from the maritime industry who have worked on board and around port operations. We built it because finding reliable services at an unfamiliar port was slow and opaque.',
      },
      {
        q: 'Where are you based?',
        a: 'We are based in London, England, United Kingdom, and cover 1,200+ ports in 150+ countries.',
      },
      {
        q: 'How is PortServiceFinder different from other maritime directories?',
        a: 'Three things: search is free for vessel operators with no sign-up; we never take commission on jobs; and the platform is built by people who have done the work, so it is organised around how a port call actually runs.',
      },
      {
        q: 'Do you have free tools as well?',
        a: 'Yes. Voyage Hub has about 41 free browser-based maritime calculators and tools. No sign-up is needed and your data stays in your browser.',
      },
    ],
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_DATA.flatMap((c) =>
    c.items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  ),
};

export default function FAQPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }} />
      <style>{`
        .fq{max-width:820px;margin:0 auto;padding:44px 20px 8px;color:var(--ink);font-family:var(--font-ui)}
        .fq .eyebrow{font-size:13px;font-weight:600;color:var(--ink3);margin:0 0 8px}
        .fq h1{font-size:clamp(28px,6vw,42px);font-weight:700;letter-spacing:-0.02em;line-height:1.15;margin:0 0 12px}
        .fq .lede{font-size:17px;line-height:1.65;color:var(--ink2);margin:0 0 12px}
        .fq h2{font-size:20px;font-weight:700;margin:36px 0 12px}
        .fq .list{display:grid;gap:8px}
        .fq details{background:var(--card);border:1px solid var(--line);border-radius:12px}
        .fq details[open]{border-color:color-mix(in srgb, var(--acc) 45%, var(--line))}
        .fq summary{list-style:none;cursor:pointer;padding:14px 18px;min-height:44px;display:flex;align-items:center;justify-content:space-between;gap:14px;font-size:15.5px;font-weight:600;line-height:1.4}
        .fq summary::-webkit-details-marker{display:none}
        .fq summary .pm{flex-shrink:0;color:var(--ink3);font-size:20px;line-height:1;transition:transform .2s}
        .fq details[open] summary .pm{transform:rotate(45deg)}
        .fq .ans{padding:0 18px 16px;font-size:15px;line-height:1.7;color:var(--ink2)}
        .fq .help{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:22px;margin-top:36px}
        .fq .help h2{margin:0 0 6px}
        .fq .help p{font-size:15px;line-height:1.65;color:var(--ink2);margin:0 0 14px}
        .fq .actions{display:flex;flex-wrap:wrap;gap:10px}
        .fq .btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 20px;border-radius:10px;font-weight:650;font-size:15px;text-decoration:none}
        .fq .btn.primary{background:var(--acc);color:var(--on-acc)}
        .fq .btn.primary:hover{background:var(--acc-h)}
        .fq .btn.ghost{border:1px solid var(--line);color:var(--ink);background:var(--bg)}
      `}</style>
      <SiteHeader />
      <main className="fq">
        <p className="eyebrow">FAQ</p>
        <h1>Frequently asked questions</h1>
        <p className="lede">Common questions from vessel operators, service providers and others in the industry.</p>

        {FAQ_DATA.map((category) => (
          <section key={category.title}>
            <h2>{category.title}</h2>
            <div className="list">
              {category.items.map((item) => (
                <details key={item.q}>
                  <summary>
                    <span>{item.q}</span>
                    <span className="pm" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <div className="ans">{item.a}</div>
                </details>
              ))}
            </div>
          </section>
        ))}

        <div className="help">
          <h2>Still have a question?</h2>
          <p>Write to us and we will usually reply within 24 hours.</p>
          <div className="actions">
            <Link href="/contact" className="btn primary">
              Contact us
            </Link>
            <a href="mailto:contact@portservicefinder.com" className="btn ghost">
              contact@portservicefinder.com
            </a>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
