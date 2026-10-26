import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <style>{`
        .nf{max-width:640px;margin:0 auto;padding:72px 20px 24px;text-align:center;color:var(--ink);font-family:var(--font-ui)}
        .nf .code{font-size:14px;font-weight:600;color:var(--ink3);margin:0 0 10px}
        .nf h1{font-size:clamp(28px,6vw,40px);font-weight:700;letter-spacing:-0.02em;line-height:1.15;margin:0 0 12px}
        .nf p{font-size:16px;line-height:1.65;color:var(--ink2);margin:0 auto 26px;max-width:480px}
        .nf .actions{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
        .nf .btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 20px;border-radius:10px;font-weight:650;font-size:15px;text-decoration:none}
        .nf .btn.primary{background:var(--acc);color:var(--on-acc)}
        .nf .btn.primary:hover{background:var(--acc-h)}
        .nf .btn.ghost{border:1px solid var(--line);color:var(--ink);background:var(--card)}
        .nf .help{margin-top:32px;font-size:14px;color:var(--ink3)}
        .nf .help a{color:var(--acc)}
      `}</style>
      <SiteHeader />
      <main className="nf">
        <p className="code">Error 404</p>
        <h1>We can&apos;t find that page</h1>
        <p>The link may be out of date, or the page may have moved. Try searching by port or go back to the homepage.</p>
        <div className="actions">
          <Link href="/" className="btn primary">
            Go to the homepage
          </Link>
          <Link href="/ports" className="btn ghost">
            Browse ports
          </Link>
          <Link href="/blog" className="btn ghost">
            Read the guides
          </Link>
        </div>
        <p className="help">
          Still stuck? <Link href="/contact">Contact us</Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
