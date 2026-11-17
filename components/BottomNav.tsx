'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Phone-only app-style bottom menu. */
const HIDE_ON = ['/admin', '/for-providers/dashboard', '/for-providers/complete-profile'];

export function BottomNav() {
  const path = usePathname() || '/';
  if (HIDE_ON.some((h) => path.startsWith(h))) return null;
  const on = (h: string) => (h === '/' ? path === '/' : path === h || path.startsWith(h + '/'));
  return (
    <>
      <style>{CSS}</style>
      <div className="bn-space" aria-hidden="true" />
      <nav className="bn" aria-label="Quick menu">
        <Link href="/" className={on('/') ? 'on' : ''}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg>
          <span>Home</span>
        </Link>
        <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('psf:finder', { detail: 'ask' }))}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <span>Search</span>
        </button>
        <Link href="/request-quote" className={on('/request-quote') ? 'on' : ''}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v12H8l-4 4z" /><path d="M12 7v6M9 10h6" /></svg>
          <span>Get quotes</span>
        </Link>
        <Link href="/requests" className={on('/requests') ? 'on' : ''}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10" /></svg>
          <span>Requests</span>
        </Link>
        <Link href="/for-providers/signup" className="gold">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          <span>List free</span>
        </Link>
      </nav>
    </>
  );
}

const CSS = `
.bn,.bn-space{display:none}
@media (max-width:820px){
  .bn-space{display:block;height:calc(64px + env(safe-area-inset-bottom))}
  .bn{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));position:fixed;left:0;right:0;bottom:0;z-index:900;padding:6px 4px calc(6px + env(safe-area-inset-bottom));background:color-mix(in srgb,var(--card) 95%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-top:1px solid var(--line);box-shadow:0 -6px 20px rgba(11,27,43,.08)}
  .bn a,.bn button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;min-width:0;height:50px;border:0;background:none;color:var(--ink3);text-decoration:none;font:inherit;font-size:10.5px;font-weight:600;cursor:pointer;border-radius:10px;-webkit-tap-highlight-color:transparent}
  .bn svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
  .bn span{white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}
  .bn .on{color:var(--acc)}
  .bn .gold{color:var(--on-acc);background:var(--acc);margin:0 3px}
  .bn a:active,.bn button:active{transform:scale(.95)}
}
@media print{.bn,.bn-space{display:none}}
`;
