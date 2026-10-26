import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'Pricing for Providers',
  description:
    'Listing on PortServiceFinder is free during our launch period. After it, listings cost $49.90/month or $499.90/year. No commission. Free for vessel operators.',
  alternates: { canonical: '/pricing' },
};

const INCLUDED = [
  'Your company on the provider list of every port you serve (up to 10 per listing)',
  'A company page of your own that you can share on LinkedIn and with clients',
  'Phone, email, WhatsApp and website shown to operators',
  'Quote requests from operators sent to your dashboard',
  'Dashboard showing how often your ports were searched and who contacted you',
  'No commission on any job, ever',
];

export default function PricingPage() {
  return (
    <>
      <style>{`
        .pr{max-width:760px;margin:0 auto;padding:44px 20px 8px;color:var(--ink);font-family:var(--font-ui)}
        .pr .eyebrow{font-size:13px;font-weight:600;color:var(--ink3);margin:0 0 8px}
        .pr h1{font-size:clamp(28px,6vw,42px);font-weight:700;letter-spacing:-0.02em;line-height:1.15;margin:0 0 12px}
        .pr .lede{font-size:17px;line-height:1.65;color:var(--ink2);margin:0 0 28px;max-width:620px}
        .pr .plans{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;margin-bottom:28px}
        .pr .card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:22px}
        .pr .card.now{border-color:var(--acc);box-shadow:0 0 0 1px var(--acc) inset}
        .pr .card .k{font-size:13px;font-weight:600;color:var(--ink3);margin-bottom:6px}
        .pr .card .amt{font-size:30px;font-weight:700;letter-spacing:-0.02em;margin-bottom:4px}
        .pr .card .sub{font-size:14px;color:var(--ink2);line-height:1.55}
        .pr h2{font-size:20px;font-weight:700;margin:32px 0 12px}
        .pr ul{list-style:none;margin:0 0 24px;padding:0;display:grid;gap:10px}
        .pr li{display:flex;gap:10px;align-items:flex-start;font-size:15px;line-height:1.55;color:var(--ink2)}
        .pr li svg{flex-shrink:0;margin-top:3px;color:var(--ok)}
        .pr .btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 22px;border-radius:10px;background:var(--acc);color:var(--on-acc);font-weight:650;font-size:15px;text-decoration:none}
        .pr .btn:hover{background:var(--acc-h)}
        .pr .note{font-size:14px;line-height:1.7;color:var(--ink3);margin-top:18px}
        .pr .note a{color:var(--acc)}
      `}</style>
      <SiteHeader />
      <main className="pr">
        <p className="eyebrow">Pricing</p>
        <h1>Free to list during our launch period</h1>
        <p className="lede">
          Listing is free during our launch period. After the launch period, listings will cost $49.90/month or $499.90/year. Searching
          and contacting providers is always free for vessel operators, and we never take a commission.
        </p>

        <div className="plans">
          <div className="card now">
            <div className="k">Now, during the launch period</div>
            <div className="amt">$0</div>
            <div className="sub">No card needed. Everything below is included.</div>
          </div>
          <div className="card">
            <div className="k">After the launch period</div>
            <div className="amt">$49.90<span style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink3)' }}>/month</span></div>
            <div className="sub">or $499.90/year. We email you before anything changes.</div>
          </div>
        </div>

        <h2>What a listing includes</h2>
        <ul>
          {INCLUDED.map((item) => (
            <li key={item}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12.5l4.5 4.5L19 7" />
              </svg>
              {item}
            </li>
          ))}
        </ul>

        <Link href="/for-providers/signup" className="btn gold">
          List your company free
        </Link>

        <p className="note">
          Providers who join during the launch period are our founding members. You will not be moved to a paid plan without choosing one,
          and you can remove your listing at any time. Details are in our <Link href="/terms">Terms</Link> and{' '}
          <Link href="/refund-policy">Refund Policy</Link>.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
