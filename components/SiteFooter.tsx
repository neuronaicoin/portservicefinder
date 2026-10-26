import Link from 'next/link';
import { Logo } from './Logo';
import { siteConfig } from '@/lib/site-config';

const COLS: { title: string; links: [string, string][] }[] = [
  { title: 'Find', links: [['/providers', 'All providers'], ['/ports', 'Ports'], ['/request-quote', 'Request a quote'], ['/voyage', 'Voyage tools']] },
  { title: 'Providers', links: [['/for-providers', 'Why list with us'], ['/for-providers/signup', 'List your company free'], ['/for-providers/login', 'Provider login'], ['/listing-rules', 'Listing rules'], ['/pricing', 'Pricing']] },
  { title: 'Company', links: [['/about', 'About'], ['/blog', 'Guides'], ['/faq', 'FAQ'], ['/contact', 'Contact']] },
  { title: 'Legal', links: [['/terms', 'Terms'], ['/privacy', 'Privacy'], ['/refund-policy', 'Refund policy']] },
];

/** The one footer every page uses. */
export function SiteFooter() {
  return (
    <footer className="psf-footer" style={{ borderTop: '1px solid var(--line)', background: 'var(--card)', marginTop: 64 }}>
      <style>{`
        .psf-footer .in{max-width:1200px;margin:0 auto;padding:44px 20px 28px;display:grid;grid-template-columns:minmax(0,1.3fr) repeat(4,minmax(0,1fr));gap:28px}
        .psf-footer h3{font-size:13px;font-weight:650;color:var(--ink);margin:0 0 10px}
        .psf-footer ul{list-style:none;margin:0;padding:0;display:grid;gap:8px}
        .psf-footer a{color:var(--ink2);text-decoration:none;font-size:14px}
        .psf-footer a:hover{color:var(--acc)}
        .psf-footer .base{max-width:1200px;margin:0 auto;padding:16px 20px 28px;border-top:1px solid var(--line);display:flex;flex-wrap:wrap;gap:8px 20px;justify-content:space-between;color:var(--ink3);font-size:13px}
        @media (max-width:860px){.psf-footer .in{grid-template-columns:repeat(2,minmax(0,1fr))}.psf-footer .brand{grid-column:1/-1}}
      `}</style>
      <div className="in">
        <div className="brand">
          <Logo />
          <p style={{ color: 'var(--ink2)', fontSize: 14, lineHeight: 1.6, marginTop: 12, maxWidth: 340 }}>
            The global directory of ship agents, shipchandlers and marine service companies. Free for vessel operators, no commission on any job.
          </p>
          <p style={{ color: 'var(--ink3)', fontSize: 13, marginTop: 10 }}>{siteConfig.address.addressLocality}, {siteConfig.address.addressCountry === 'GB' ? 'United Kingdom' : siteConfig.address.addressCountry}</p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <h3>{c.title}</h3>
            <ul>
              {c.links.map(([href, label]) => (
                <li key={href}>
                  <Link href={href}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="base">
        <span>© {new Date().getFullYear()} PortServiceFinder. All rights reserved.</span>
        <span>
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
        </span>
      </div>
    </footer>
  );
}
