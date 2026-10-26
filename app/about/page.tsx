import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'About PortServiceFinder: A London-Based Maritime Directory',
  description:
    'PortServiceFinder is a London-based directory of ship agents, shipchandlers and marine service companies, founded by maritime professionals. Free for operators, no commission.',
  alternates: { canonical: '/about' },
};

const aboutSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About PortServiceFinder',
  url: `${siteConfig.url}/about`,
  about: {
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    email: siteConfig.email,
    address: { '@type': 'PostalAddress', ...siteConfig.address },
  },
};

const WHAT = [
  {
    title: 'Search',
    desc: 'Vessel operators look up ship agents, chandlers and marine service companies by port. Free, and no account needed.',
  },
  {
    title: 'List',
    desc: 'Providers publish a company profile with the ports they serve, their services and direct contact details.',
  },
  {
    title: 'Contact',
    desc: 'Operators call, email or message the provider directly. We are not in the middle of the conversation or the deal.',
  },
];

const DIFFERENT = [
  { title: 'No commission', desc: 'We never take a cut of any job agreed between an operator and a provider.' },
  { title: 'Free for vessel operators', desc: 'No subscription, no sign-up and no paywall for searching or contacting providers.' },
  { title: 'Listings are checked', desc: 'We review provider listings against our listing rules and remove ones with false details.' },
  { title: 'Built by people from the industry', desc: 'PortServiceFinder was founded by maritime industry professionals with operational experience.' },
];

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema).replace(/</g, '\\u003c') }} />
      <style>{`
        .ab{max-width:880px;margin:0 auto;padding:44px 20px 8px;color:var(--ink);font-family:var(--font-ui)}
        .ab .eyebrow{font-size:13px;font-weight:600;color:var(--ink3);margin:0 0 8px}
        .ab h1{font-size:clamp(28px,6vw,42px);font-weight:700;letter-spacing:-0.02em;line-height:1.15;margin:0 0 14px}
        .ab .lede{font-size:17px;line-height:1.65;color:var(--ink2);margin:0 0 8px;max-width:680px}
        .ab h2{font-size:22px;font-weight:700;letter-spacing:-0.01em;margin:40px 0 14px}
        .ab p{font-size:15.5px;line-height:1.75;color:var(--ink2);margin:0 0 14px}
        .ab p strong{color:var(--ink);font-weight:600}
        .ab .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
        .ab .card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:18px 20px}
        .ab .card h3{font-size:16px;font-weight:650;margin:0 0 6px}
        .ab .card p{font-size:14.5px;margin:0;line-height:1.6}
        .ab .actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:8px}
        .ab .btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 20px;border-radius:10px;font-weight:650;font-size:15px;text-decoration:none}
        .ab .btn.primary{background:var(--acc);color:var(--on-acc)}
        .ab .btn.primary:hover{background:var(--acc-h)}
        .ab .btn.ghost{border:1px solid var(--line);color:var(--ink);background:var(--card)}
      `}</style>
      <SiteHeader />
      <main className="ab">
        <p className="eyebrow">About us</p>
        <h1>Built by maritime professionals, for the people who run port calls</h1>
        <p className="lede">
          PortServiceFinder started from a problem we had ourselves: finding a reliable ship agent, chandler or service company at a port
          we did not know.
        </p>

        <h2>Why we built it</h2>
        <p>
          The usual routine is calling four or five contacts, chasing quotes over WhatsApp, waiting hours for replies and never being quite
          sure whether a company is real. It runs on personal contacts rather than open information, and it is slow when a vessel is
          already on its way.
        </p>
        <p>
          PortServiceFinder puts that information in one place: a global directory of ship agents, shipchandlers and marine service
          companies, organised by port. <strong>Searching is free for vessel operators, and we never take a commission on the work.</strong>
        </p>

        <h2>What we do</h2>
        <div className="grid">
          {WHAT.map((w) => (
            <div key={w.title} className="card">
              <h3>{w.title}</h3>
              <p>{w.desc}</p>
            </div>
          ))}
        </div>

        <h2>How we are different</h2>
        <div className="grid">
          {DIFFERENT.map((d) => (
            <div key={d.title} className="card">
              <h3>{d.title}</h3>
              <p>{d.desc}</p>
            </div>
          ))}
        </div>

        <h2>Where we are</h2>
        <p>
          PortServiceFinder is based in London, England, one of the oldest centres of shipping, insurance and ship management. The
          directory covers 1,200+ ports in 150+ countries and 34 service categories.
        </p>

        <h2>Get in touch</h2>
        <p>Operators, providers and anyone else in the industry: we read every message.</p>
        <div className="actions">
          <Link href="/contact" className="btn primary">
            Contact us
          </Link>
          <Link href="/ports" className="btn ghost">
            Browse ports
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
