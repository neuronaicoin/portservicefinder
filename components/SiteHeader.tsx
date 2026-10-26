'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

const NAV = [
  { href: '/providers', label: 'Find providers' },
  { href: '/ports', label: 'Ports' },
  { href: '/voyage', label: 'Voyage tools' },
  { href: '/blog', label: 'Guides' },
  { href: '/for-providers', label: 'For providers' },
];

/** The one header every page uses: navigation, theme switch, log in and the free listing button. */
export function SiteHeader() {
  const path = usePathname() || '/';
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const active = (href: string) => path === href || path.startsWith(href + '/');
  return (
    <header className="psf-header" style={{ position: 'sticky', top: 0, zIndex: 100, background: 'color-mix(in srgb, var(--card) 92%, transparent)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderBottom: '1px solid var(--line)' }}>
      <style>{`
        .psf-header .in{max-width:1200px;margin:0 auto;padding:0 20px;height:64px;display:flex;align-items:center;gap:24px}
        .psf-header nav.main{display:flex;gap:4px}
        .psf-header nav.main a{padding:8px 10px;border-radius:8px;font-size:14.5px;color:var(--ink2);text-decoration:none;font-weight:500}
        .psf-header nav.main a:hover{color:var(--ink);background:var(--bg2)}
        .psf-header nav.main a.on{color:var(--ink);font-weight:600}
        .psf-header .right{margin-left:auto;display:flex;align-items:center;gap:10px}
        .psf-header .login{font-size:14.5px;color:var(--ink2);text-decoration:none;padding:8px 10px;font-weight:500}
        .psf-header .cta{background:var(--acc);color:var(--on-acc);text-decoration:none;font-weight:650;font-size:14.5px;padding:10px 16px;border-radius:10px;white-space:nowrap}
        .psf-header .cta:hover{background:var(--acc-h)}
        .psf-header .burger{display:none;width:40px;height:40px;border-radius:9px;border:1px solid var(--line);background:var(--card);color:var(--ink);align-items:center;justify-content:center;cursor:pointer}
        .psf-header .sheet{display:none}
        @media (max-width:960px){
          .psf-header nav.main,.psf-header .login{display:none}
          .psf-header .burger{display:inline-flex}
          .psf-header .in{gap:12px;padding:0 16px;height:60px}
          .psf-header .sheet.open{display:block;border-top:1px solid var(--line);background:var(--card);padding:8px 16px 16px}
          .psf-header .sheet a{display:block;padding:13px 4px;border-bottom:1px solid var(--line);color:var(--ink);text-decoration:none;font-size:16px;font-weight:500}
        }
        @media (max-width:420px){.psf-header .in{gap:8px;padding:0 12px}.psf-header .right{gap:6px}.psf-header .cta{padding:8px 10px;font-size:13.5px}.psf-header .cta .long{display:none}.psf-header .psf-logo{font-size:14px!important;gap:7px!important;letter-spacing:0!important}.psf-header .psf-logo svg{width:26px;height:26px}}
      `}</style>
      <div className="in">
        <Link href="/" aria-label="PortServiceFinder home" style={{ textDecoration: 'none' }}>
          <Logo />
        </Link>
        <nav className="main" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={active(n.href) ? 'on' : ''}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="right">
          <ThemeToggle />
          <Link href="/for-providers/login" className="login">
            Log in
          </Link>
          <Link href="/for-providers/signup" className="cta">
            List<span className="long"> your company</span> free
          </Link>
          <button type="button" className="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
      <div className={'sheet' + (open ? ' open' : '')}>
        {NAV.map((n) => (
          <Link key={n.href} href={n.href}>
            {n.label}
          </Link>
        ))}
        <Link href="/for-providers/login">Log in</Link>
      </div>
    </header>
  );
}
