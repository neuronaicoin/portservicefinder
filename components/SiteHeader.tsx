'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { siteConfig } from '@/lib/site-config';

const NAV = [
  { href: '/providers', label: 'Find providers' },
  { href: '/ports', label: 'Ports' },
  { href: '/requests', label: 'Requests' },
  { href: '/voyage', label: 'Voyage tools' },
  { href: '/blog', label: 'Guides' },
  { href: '/for-providers', label: 'For providers' },
];

/** The one header every page uses: navigation, theme switch, log in and the free listing button. */
export function SiteHeader() {
  const path = usePathname() || '/';
  const router = useRouter();
  const goBack = () => {
    let sameSite = false;
    try {
      sameSite = !!document.referrer && new URL(document.referrer).origin === location.origin;
    } catch {}
    if (sameSite && window.history.length > 1) router.back();
    else router.push(path.split('/').slice(0, -1).join('/') || '/');
  };
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const active = (href: string) => path === href || path.startsWith(href + '/');
  return (
    <header className="psf-header" style={{ position: 'sticky', top: 0, zIndex: 100, background: 'color-mix(in srgb, var(--card) 92%, transparent)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderBottom: '1px solid var(--line)' }}>
      <style>{`
        .psf-header .in{max-width:var(--wrap);margin:0 auto;padding:0 var(--gutter);height:64px;display:flex;align-items:center;gap:24px}
        .psf-header .home-link{display:flex;min-width:0;flex:0 1 auto;text-decoration:none}
        .psf-header .back{flex:none;width:40px;height:40px;margin-right:-12px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0}
        .psf-header .back:hover{border-color:var(--acc);color:var(--acc)}
        .psf-header .home-link{overflow:hidden}
        .psf-header nav.main{display:flex;gap:4px}
        .psf-header nav.main a{padding:8px 10px;border-radius:8px;font-size:14.5px;color:var(--ink2);text-decoration:none;font-weight:500;white-space:nowrap}
        .psf-header nav.main a:hover{color:var(--ink);background:var(--bg2)}
        .psf-header nav.main a.on{color:var(--ink);font-weight:600}
        .psf-header .right{margin-left:auto;display:flex;align-items:center;gap:10px;flex:none}
        .psf-header .login{font-size:14.5px;color:var(--ink2);text-decoration:none;padding:8px 10px;font-weight:500;white-space:nowrap}
        .psf-header .cta{background:var(--acc);color:var(--on-acc);text-decoration:none;font-weight:650;font-size:14.5px;padding:10px 16px;border-radius:10px;white-space:nowrap;display:inline-block}
        .psf-header .cta:hover{background:var(--acc-h)}
        .psf-header .burger{display:none;width:40px;height:40px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink);align-items:center;justify-content:center;cursor:pointer;flex:none;padding:0}
        .psf-header .sheet{display:none}
        .psf-header .sheet-theme{display:none}
        @media (max-width:1240px){.psf-header .cta .long{display:none}}
        @media (max-width:1010px){.psf-header nav.main a[href="/voyage"]{display:none}}
        @media (max-width:1080px){.psf-header .in{gap:14px}.psf-header nav.main a{padding:8px 7px;font-size:14px}.psf-header nav.main a[href="/blog"]{display:none}}
        @media (max-width:960px){
          .psf-header nav.main,.psf-header .login{display:none}
          .psf-header .burger{display:inline-flex}
          .psf-header .in{gap:10px;height:60px}
          .psf-header .right{gap:8px}
          .psf-header .right>button:first-child{width:40px!important;height:40px!important;border-radius:10px!important}
          .psf-header .cta{height:40px;line-height:40px;padding:0 14px;font-size:14px}
          .psf-header .sheet.open{display:block;border-top:1px solid var(--line);background:var(--card);padding:6px var(--gutter) 16px;max-height:calc(100dvh - 60px);overflow-y:auto}
          .psf-header .sheet a{display:flex;align-items:center;justify-content:space-between;padding:14px 2px;border-bottom:1px solid var(--line);color:var(--ink);text-decoration:none;font-size:16px;font-weight:500}
          .psf-header .sheet a::after{content:'›';color:var(--ink3);font-size:20px}
          .psf-header .sheet a.sheet-cta{justify-content:center;margin-top:14px;border:0;border-radius:12px;padding:14px;font-weight:700}
          .psf-header .sheet a.sheet-cta::after{content:none}
        }
        @media (max-width:620px){.psf-header .cta .long{display:none}}
        @media (max-width:560px){
          .psf-header .in{gap:6px;height:56px}
          .psf-header .back{width:38px;height:38px;margin-right:0}
          .psf-header .right{gap:6px}
          .psf-header .right>button:first-child{display:none!important}
          .psf-header .sheet-theme{display:flex;align-items:center;justify-content:space-between;padding:12px 2px;border-bottom:1px solid var(--line);font-size:16px;font-weight:500}
          .psf-header .cta,.psf-header .burger{height:38px}.psf-header .cta{line-height:38px}
          .psf-header .burger{width:38px}
          .psf-header .cta{padding:0 12px;font-size:13.5px}
          .psf-header .psf-logo{font-size:15px!important;gap:7px!important;letter-spacing:0!important}
          .psf-header .psf-logo svg{width:28px;height:28px}
        }
        @media (max-width:400px){.psf-header .psf-logo{font-size:13.5px!important;gap:6px!important}}
        @media (max-width:430px){.psf-header .back~.home-link .psf-logo{font-size:13px!important;gap:6px!important}.psf-header .back~.home-link .psf-logo svg{width:26px;height:26px}}
        @media (max-width:369px){.psf-header .back~.home-link .psf-logo>span{display:none}}
        @media (max-width:350px){.psf-header .psf-logo{font-size:13px!important;gap:6px!important}.psf-header .psf-logo svg{width:24px;height:24px}.psf-header .cta{padding:0 10px;font-size:13px}}
      `}</style>
      <div className="in">
        {path !== '/' && (
          <button type="button" className="back" aria-label="Go back" onClick={goBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
        )}
        <Link href="/" aria-label="PortServiceFinder home" className="home-link">
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
          <Link href="/for-providers/signup" className="cta gold">
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
        {String((siteConfig as { whatsapp?: string }).whatsapp || '') ? (
          <a href={`https://wa.me/${String((siteConfig as { whatsapp?: string }).whatsapp).replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer">
            Help on WhatsApp
          </a>
        ) : (
          <Link href="/contact">Help &amp; contact</Link>
        )}
        <div className="sheet-theme">
          <span>Dark / light mode</span>
          <ThemeToggle />
        </div>
        <Link href="/for-providers/signup" className="sheet-cta gold">
          List your company free
        </Link>
      </div>
    </header>
  );
}
