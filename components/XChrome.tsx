'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogoMark } from '@/components/Logo';

/*
  X-style frame around every existing page, shown only to people who opened the new app at /x
  (it stores psfx_on=1 in their browser). Pages keep their own server-rendered content, URLs and SEO;
  search engines and normal visitors never get this frame.
*/
const P: Record<string, string> = {
  home: 'M3 10.2 12 3l9 7.2V20a1 1 0 0 1-1 1h-5.5v-6.5h-5V21H4a1 1 0 0 1-1-1z',
  search: 'M10.8 4a6.8 6.8 0 1 0 0 13.6 6.8 6.8 0 0 0 0-13.6zM20.5 20.5l-4.9-4.9',
  anchor: 'M12 7.6a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6zM12 7.6V21M8.2 11h7.6M4 13.4a8 8 0 0 0 16 0M4 13.4l-1.6 1.7M4 13.4l1.6 1.7M20 13.4l-1.6 1.7M20 13.4l1.6 1.7',
  bell: 'M6 16.5V10a6 6 0 1 1 12 0v6.5l1.8 2H4.2zM9.8 20.5a2.3 2.3 0 0 0 4.4 0',
  chat: 'M12 3.5c4.8 0 8.5 3.4 8.5 7.7s-3.7 7.7-8.5 7.7c-1 0-2-.1-2.9-.4L4.5 20.5l1.2-3.7C4.3 15.4 3.5 13.4 3.5 11.2 3.5 6.9 7.2 3.5 12 3.5z',
  back: 'M20 12H4.5M10.5 18l-6-6 6-6',
  tool: 'M14.5 6.5a4 4 0 0 0-5.3 5.3L3.5 17.5l3 3 5.7-5.7a4 4 0 0 0 5.3-5.3l-2.6 2.6-2.3-.7-.7-2.3z',
  user: 'M12 11.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 21a7.5 7.5 0 0 1 15 0',
  bookmark: 'M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4.4-6.5 4.4v-16a1 1 0 0 1 1-1z',
};
const Ico = ({ d, w = 2 }: { d: string; w?: number }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={P[d]} /></svg>
);
const NAV: [string, string, string][] = [
  ['/x', 'home', 'Home'], ['/x?v=search', 'search', 'Explore'], ['/x?v=find', 'anchor', 'Find a service'],
  ['/x?v=notifs', 'bell', 'Notifications'], ['/x?v=chat', 'chat', 'Chat'], ['/x?v=saved', 'bookmark', 'Bookmarks'],
  ['/x?v=tools', 'tool', 'Voyage tools'], ['/x?v=me', 'user', 'Profile'],
];
const BOTTOM = NAV.slice(0, 5);
const SKIP = ['/x', '/admin'];

export function XChrome() {
  const path = usePathname() || '/';
  const router = useRouter();
  const [on, setOn] = useState(false);
  const [title, setTitle] = useState('');
  const [hide, setHide] = useState(false);

  useEffect(() => {
    let enabled = false;
    try { enabled = localStorage.getItem('psfx_on') === '1'; } catch {}
    const skip = SKIP.some((s) => path === s || path.startsWith(s + '/'));
    const root = document.documentElement;
    if (enabled && path === '/') { router.replace('/x'); return; }
    if (enabled && !skip) {
      root.dataset.psfxon = '1';
      try { const t = localStorage.getItem('psfx_theme'); if (t) { root.dataset.psfx = t; root.dataset.theme = t; } } catch {}
      setOn(true);
    } else {
      delete root.dataset.psfxon;
      setOn(false);
    }
    const t = setTimeout(() => setTitle((document.title || '').split(/\s[|·–-]\s/)[0].slice(0, 60)), 60);
    return () => clearTimeout(t);
  }, [path, router]);

  useEffect(() => {
    if (!on) return;
    let last = window.scrollY;
    const onScroll = () => { const y = window.scrollY; setHide((h) => (y > 80 && y > last + 2 ? true : y < last - 2 ? false : h)); last = y; };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [on]);

  if (!on) return null;
  const back = () => { if (history.length > 1) history.back(); else router.push('/x'); };
  return (
    <>
      <header className={'xc-top' + (hide ? ' hid' : '')}>
        <button onClick={back} aria-label="Back" className="xc-ib"><Ico d="back" /></button>
        <b className="xc-tt">{title}</b>
        <a href="/x" aria-label="PortServiceFinder home" className="xc-logo"><LogoMark size={26} /></a>
      </header>
      <aside className="xc-left">
        <a href="/x" className="xc-lg" aria-label="Home"><LogoMark size={32} /></a>
        {NAV.map(([h, d, l]) => <a key={h} href={h} className="xc-nav"><Ico d={d} w={1.9} /><span>{l}</span></a>)}
        <a href="/x?v=request" className="xc-big"><span>Get quotes</span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg></a>
      </aside>
      <nav className={'xc-bot' + (hide ? ' hid' : '')} aria-label="Main">
        {BOTTOM.map(([h, d, l]) => <a key={h} href={h} aria-label={l}><Ico d={d} /></a>)}
      </nav>
      <style>{CSS}</style>
    </>
  );
}

const CSS = `
html[data-psfxon]{--xbg:#fff;--xfg:#0f1419;--xmu:#536471;--xln:#eff3f4}
html[data-psfxon][data-psfx=dark]{--xbg:#000;--xfg:#e7e9ea;--xmu:#71767b;--xln:#2f3336}
html[data-psfxon]:root,html[data-psfxon]:root[data-theme]{--bg:var(--xbg);--bg2:var(--xbg);--card:var(--xbg);--ink:var(--xfg);--ink2:var(--xfg);--ink3:var(--xmu);--line:var(--xln);--acc:var(--xfg);--acc-h:var(--xfg);--on-acc:var(--xbg);--shadow:none;--font-ui:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;--font-display:var(--font-ui)}
html[data-psfxon] body{background:var(--xbg)!important;color:var(--xfg);font-family:var(--font-ui)!important;-webkit-font-smoothing:antialiased;overflow-x:hidden}
html[data-psfxon] .psf-header,html[data-psfxon] .psf-footer,html[data-psfxon] .bn,html[data-psfxon] .bn-space,html[data-psfxon] .mf-bar{display:none!important}
.xc-top,.xc-bot{position:fixed;left:0;right:0;z-index:950;background:var(--xbg);transition:transform .2s ease}
.xc-top{top:0;height:53px;display:flex;align-items:center;gap:20px;padding:0 16px;border-bottom:1px solid var(--xln);background:color-mix(in srgb,var(--xbg) 85%,transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
.xc-top.hid{transform:translateY(-100%)}
.xc-ib{width:36px;height:36px;margin-left:-8px;border:0;background:none;color:var(--xfg);display:grid;place-items:center;border-radius:99px;cursor:pointer}
.xc-tt{flex:1;min-width:0;font-size:17px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--xfg)}
.xc-logo{display:flex}
.xc-bot{bottom:0;height:calc(53px + env(safe-area-inset-bottom));padding-bottom:env(safe-area-inset-bottom);display:flex;justify-content:space-around;align-items:center;border-top:1px solid var(--xln)}
.xc-bot.hid{transform:translateY(100%)}
.xc-bot a{flex:1;display:grid;place-items:center;height:53px;color:var(--xfg)}
.xc-left{display:none}
html[data-psfxon] body{padding-top:53px;padding-bottom:calc(60px + env(safe-area-inset-bottom))}
@media (min-width:601px){
  .xc-top,.xc-bot{display:none}
  html[data-psfxon] body{padding-top:0;padding-bottom:0;padding-left:88px}
  .xc-left{display:flex;flex-direction:column;align-items:center;gap:2px;position:fixed;top:0;bottom:0;left:0;width:88px;padding:4px 8px;border-right:1px solid var(--xln);background:var(--xbg);z-index:950}
  .xc-lg{width:52px;height:52px;display:grid;place-items:center;border-radius:99px}
  .xc-nav{display:flex;align-items:center;gap:20px;padding:12px;border-radius:99px;color:var(--xfg);font-size:20px;text-decoration:none}
  .xc-nav:hover,.xc-lg:hover{background:var(--xln)}
  .xc-nav span{display:none}
  .xc-big{margin-top:14px;width:52px;height:52px;border-radius:99px;background:var(--xfg);color:var(--xbg);display:grid;place-items:center;text-decoration:none;font-weight:700}
  .xc-big span{display:none}
}
@media (min-width:1265px){
  html[data-psfxon] body{padding-left:275px}
  .xc-left{width:275px;align-items:flex-start;padding:4px 12px}
  .xc-nav span{display:inline}
  .xc-big{width:234px;display:flex;justify-content:center}.xc-big span{display:inline;font-size:17px}.xc-big svg{display:none}
}
`;
