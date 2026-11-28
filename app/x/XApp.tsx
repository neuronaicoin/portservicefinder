'use client';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LogoMark } from '@/components/Logo';
import { ALL_PORTS, MARINE_SERVICES, portBySlug, type PortRef } from '@/lib/ports';
import { submitRfq } from '@/lib/rfq';

export type FeedItem = { id: string; kind: 'member' | 'guide' | 'data'; at: string; author: string; handle: string; badge?: boolean; text: string; sub?: string; href: string };
export type XProvider = { s: string; n: string; t: string; tl: string; c: string; f: string; p: string[]; sv: string[]; b: string; wa: string; ph: string; em: string; w: string; cl: boolean; j: string };
type View = { v: 'home' | 'search' | 'profile' | 'port' | 'notifs' | 'chat' | 'saved' | 'request'; a?: string; q?: string };

/* ---------- icons (outline, X-like weight) ---------- */
const P = {
  home: 'M3 10.2 12 3l9 7.2V20a1 1 0 0 1-1 1h-5.5v-6.5h-5V21H4a1 1 0 0 1-1-1z',
  search: 'M10.8 4a6.8 6.8 0 1 0 0 13.6 6.8 6.8 0 0 0 0-13.6zM20.5 20.5l-4.9-4.9',
  anchor: 'M12 7.6a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6zM12 7.6V21M8.2 11h7.6M4 13.4a8 8 0 0 0 16 0M4 13.4l-1.6 1.7M4 13.4l1.6 1.7M20 13.4l-1.6 1.7M20 13.4l1.6 1.7',
  bell: 'M6 16.5V10a6 6 0 1 1 12 0v6.5l1.8 2H4.2zM9.8 20.5a2.3 2.3 0 0 0 4.4 0',
  chat: 'M12 3.5c4.8 0 8.5 3.4 8.5 7.7s-3.7 7.7-8.5 7.7c-1 0-2-.1-2.9-.4L4.5 20.5l1.2-3.7C4.3 15.4 3.5 13.4 3.5 11.2 3.5 6.9 7.2 3.5 12 3.5z',
  user: 'M12 11.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 21a7.5 7.5 0 0 1 15 0',
  reply: 'M12 4c4.7 0 8.5 3.2 8.5 7.3 0 4-3.8 7.2-8.5 7.2h-.6L7 21v-3.6C5 16.1 3.5 13.9 3.5 11.3 3.5 7.2 7.3 4 12 4z',
  repost: 'M17 3.5l3 3-3 3M4.5 11.5V10a3.5 3.5 0 0 1 3.5-3.5h12M7 20.5l-3-3 3-3M19.5 12.5V14a3.5 3.5 0 0 1-3.5 3.5H4',
  heart: 'M12 20.3s-7.6-4.6-9.2-9.3C1.7 7.6 3.9 4.5 7.1 4.5c2 0 3.5 1.1 4.9 2.9 1.4-1.8 2.9-2.9 4.9-2.9 3.2 0 5.4 3.1 4.3 6.5-1.6 4.7-9.2 9.3-9.2 9.3z',
  bookmark: 'M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4.4-6.5 4.4v-16a1 1 0 0 1 1-1z',
  share: 'M12 3.5v12M7.5 8 12 3.5 16.5 8M4.5 14v5.5a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1V14',
  plus: 'M12 5v14M5 12h14',
  back: 'M20 12H4.5M10.5 18l-6-6 6-6',
  close: 'M6 6l12 12M18 6 6 18',
  bulb: 'M9.5 18h5M10.3 21h3.4M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.2 1.1 2V16h5v-.2c0-.8.4-1.5 1.1-2A6 6 0 0 0 12 3z',
  pin: 'M12 21s-6.8-6-6.8-11.3a6.8 6.8 0 0 1 13.6 0C18.8 15 12 21 12 21zM12 12a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8z',
  cal: 'M4.5 6h15v14.5h-15zM4.5 10h15M8.5 3.5v4M15.5 3.5v4',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  book: 'M4.5 5.5a2 2 0 0 1 2-2h13v15h-13a2 2 0 0 0-2 2zM4.5 20.5v-15',
  shield: 'M12 3l8 3v5.8c0 4.4-3.4 8.2-8 9.2-4.6-1-8-4.8-8-9.2V6z',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.8 1.2V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3.2 14H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1A2 2 0 1 1 7 4.2l.1.1A1.7 1.7 0 0 0 10 3.1V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 20.9 10H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.2 9.2a2.9 2.9 0 0 1 5.6 1c0 1.9-2.8 2.6-2.8 2.6M12 16.8h.01',
  biz: 'M3.5 7.5h17v12h-17zM9 7.5V4.5h6v3M3.5 12.5h17',
  mail: 'M3.5 5.5h17v13h-17zM3.5 6.5l8.5 6.5 8.5-6.5',
  phone: 'M5.5 3.5h3.5l1.8 4.6-2.3 1.4a11 11 0 0 0 6 6l1.4-2.3 4.6 1.8v3.5a2 2 0 0 1-2 2A16.5 16.5 0 0 1 3.5 5.5a2 2 0 0 1 2-2z',
  trend: 'M3.5 16.5l6-6 4 4 7-7M15 7.5h5.5V13',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
};
const Ico = ({ d, s = 24, w = 1.8, fill }: { d: string; s?: number; w?: number; fill?: boolean }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"><path d={P[d as keyof typeof P] || d} /></svg>
);
const Badge = () => (
  <svg className="x-badge" width="17" height="17" viewBox="0 0 24 24" aria-label="Verified member"><path fill="#d6a838" d="M12 1.8l2.4 1.8 3-.2.9 2.8 2.5 1.7-.9 2.9.9 2.9-2.5 1.7-.9 2.8-3-.2L12 22.2l-2.4-1.8-3 .2-.9-2.8-2.5-1.7.9-2.9-.9-2.9 2.5-1.7.9-2.8 3 .2z" /><path d="M8 12.3l2.7 2.7L16.3 9.4" fill="none" stroke="#0d1b4a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

/* ---------- helpers ---------- */
const HUES = ['#1f6feb', '#0f766e', '#7c3aed', '#b45309', '#be123c', '#0369a1', '#15803d', '#4338ca', '#9d174d', '#0e7490'];
const hue = (s: string) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return HUES[Math.abs(h) % HUES.length]; };
const ini = (n: string) => n.replace(/[^A-Za-z0-9 ]/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'PS';
const OFFICIAL = new Set(['portservicefinder', 'psfdata']);
function Av({ name, handle, size = 40 }: { name: string; handle: string; size?: number }) {
  if (OFFICIAL.has(handle)) return <span className="x-av off" style={{ width: size, height: size }}><LogoMark size={Math.round(size * 0.62)} /></span>;
  return <span className="x-av" style={{ width: size, height: size, background: hue(handle), fontSize: size * 0.36 }}>{ini(name)}</span>;
}
function ago(iso: string) {
  const d = Math.max(0, Date.now() - Date.parse(iso)); const h = 3600_000;
  if (d < h) return Math.max(1, Math.floor(d / 60000)) + 'm';
  if (d < 24 * h) return Math.floor(d / h) + 'h';
  if (d < 7 * 24 * h) return Math.floor(d / (24 * h)) + 'd';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
const SERVICES: { key: string; label: string; emoji: string; words: string[] }[] = [
  { key: 'agent', label: 'Ship agent', emoji: '🧭', words: ['agent', 'agency', 'agents', 'husbandry'] },
  { key: 'chandler', label: 'Ship chandler', emoji: '📦', words: ['chandler', 'chandlers', 'shipchandler', 'provisions', 'provision', 'stores', 'chandlery'] },
  ...MARINE_SERVICES.map((m) => ({
    key: m.key, label: m.label, emoji: '🔧',
    words: [m.key, ...m.label.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3 && !['service', 'supply', 'survey', 'inspection', 'disposal', 'cleaning', 'system', 'systems', 'update'].includes(w))],
  })),
];
const EMO: Record<string, string> = { agent: '🧭', chandler: '📦', bunker: '⛽', crew: '👥', engine: '⚙️', diving: '🤿', survey: '📋', freshwater: '💧', liferaft: '🛟', electrical: '⚡', hull: '🚢', garbage: '♻️', lubricant: '🛢️', refrigeration: '❄️' };
const QUICK = ['agent', 'chandler', 'bunker', 'crew', 'engine', 'diving', 'survey', 'freshwater', 'liferaft', 'electrical'];
const svcLabel = (k: string) => SERVICES.find((s) => s.key === k)?.label || k;
const offers = (p: XProvider, k: string) => (k === 'agent' || k === 'chandler' ? p.t === k : p.sv.includes(k) || (p.t === 'service' && !p.sv.length && false));

function parseQuery(q: string) {
  const ql = ' ' + q.toLowerCase().replace(/[#,]/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
  const nq = norm(q);
  const ports = ALL_PORTS.filter((p) => { const n = p.name.toLowerCase(); return (n.length >= 3 && ql.includes(' ' + n + ' ')) || (nq.length >= 4 && norm(p.name) === nq); });
  const tokens = ql.trim().split(' ').filter(Boolean);
  const svc = SERVICES.find((s) => tokens.some((t) => t.length >= 4 && s.words.some((w) => w.startsWith(t) || t.startsWith(w))));
  return { ports, svc: svc?.key };
}

/* ---------- app ---------- */
export function XApp({ items, providers, trending, listed, joined }: { items: FeedItem[]; providers: XProvider[]; trending: [string, number][]; listed: number; joined: number }) {
  const [view, setView] = useState<View>({ v: 'home' });
  const [tab, setTab] = useState<'for' | 'following'>('for');
  const [drawer, setDrawer] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [hide, setHide] = useState(false);
  const [toast, setToast] = useState('');
  const [st, setSt] = useState<{ l: Record<string, 1>; r: Record<string, 1>; b: Record<string, 1>; f: Record<string, 1> }>({ l: {}, r: {}, b: {}, f: {} });
  const homeY = useRef(0);
  const bySlug = useMemo(() => new Map(providers.map((p) => [p.s, p])), [providers]);

  useEffect(() => {
    setTheme((document.documentElement.dataset.psfx as 'dark' | 'light') || 'dark');
    try { setSt({ l: {}, r: {}, b: {}, f: {}, ...JSON.parse(localStorage.getItem('psfx_state') || '{}') }); } catch {}
    const fromUrl = (): View => {
      const u = new URLSearchParams(location.search);
      if (u.get('c')) return { v: 'profile', a: u.get('c')! };
      if (u.get('port')) return { v: 'port', a: u.get('port')! };
      const v = u.get('v') as View['v'] | null;
      return v ? { v, q: u.get('q') || '' } : { v: 'home' };
    };
    setView(fromUrl());
    const pop = () => setView(fromUrl());
    window.addEventListener('popstate', pop);
    let last = 0;
    const sc = () => { const y = window.scrollY; setHide(y > 80 && y > last); last = y; };
    window.addEventListener('scroll', sc, { passive: true });
    return () => { window.removeEventListener('popstate', pop); window.removeEventListener('scroll', sc); };
  }, []);

  const go = useCallback((n: View) => {
    if (view.v === 'home') homeY.current = window.scrollY;
    const u = n.v === 'profile' ? `?c=${n.a}` : n.v === 'port' ? `?port=${n.a}` : n.v === 'home' ? '' : `?v=${n.v}${n.q ? '&q=' + encodeURIComponent(n.q) : ''}`;
    history.pushState(null, '', '/x' + u);
    setView(n); setDrawer(false);
    requestAnimationFrame(() => window.scrollTo(0, n.v === 'home' ? homeY.current : 0));
  }, [view.v]);
  const back = () => (history.length > 1 ? history.back() : go({ v: 'home' }));
  const say = (t: string) => { setToast(t); setTimeout(() => setToast(''), 2000); };
  const flip = (k: 'l' | 'r' | 'b' | 'f', id: string) => {
    setSt((o) => { const m = { ...o[k] }; if (m[id]) delete m[id]; else m[id] = 1; const n = { ...o, [k]: m }; try { localStorage.setItem('psfx_state', JSON.stringify(n)); } catch {} return n; });
  };
  const toggleTheme = () => { const t = theme === 'dark' ? 'light' : 'dark'; setTheme(t); document.documentElement.dataset.psfx = t; try { localStorage.setItem('psfx_theme', t); } catch {} };
  const open = (href: string) => { if (href.startsWith('/')) location.href = href; else go({ v: 'profile', a: href }); };
  const tagSearch = (t: string) => go({ v: 'search', q: t });

  const feed = tab === 'for' ? items : items.filter((i) => st.f[i.handle]);

  /* ---------- pieces ---------- */
  const Rich = ({ text }: { text: string }) => (
    <>{text.split(/(#[A-Za-z0-9_]+)/g).map((part, i) => part.startsWith('#')
      ? <button key={i} className="x-ht" onClick={(e) => { e.stopPropagation(); tagSearch(part.slice(1)); }}>{part}</button>
      : <Fragment key={i}>{part}</Fragment>)}</>
  );
  const Post = ({ i }: { i: FeedItem }) => (
    <article className="x-post" onClick={() => open(i.href)}>
      <div className="x-pl" onClick={(e) => { e.stopPropagation(); if (i.kind === 'member') go({ v: 'profile', a: i.handle }); }}><Av name={i.author} handle={i.handle} /></div>
      <div className="x-pr">
        <div className="x-hd"><b>{i.author}</b>{i.badge && <Badge />}<span>@{i.handle.slice(0, 20)}</span><span>·</span><span>{ago(i.at)}</span></div>
        <div className="x-tx"><Rich text={i.text} /></div>
        {i.sub && <div className={'x-cd' + (i.kind === 'guide' ? ' g' : '')}>{i.kind === 'guide' && <small>portservicefinder.com</small>}<span>{i.sub}</span></div>}
        <div className="x-ac" onClick={(e) => e.stopPropagation()}>
          <button aria-label="Reply" onClick={() => open(i.href)}><Ico d="reply" s={18.5} /></button>
          <button aria-label="Repost" className={st.r[i.id] ? 'rp' : ''} onClick={() => flip('r', i.id)}><Ico d="repost" s={18.5} /><em>{st.r[i.id] ? 1 : ''}</em></button>
          <button aria-label="Like" className={st.l[i.id] ? 'lk' : ''} onClick={() => flip('l', i.id)}><Ico d="heart" s={18.5} fill={!!st.l[i.id]} /><em>{st.l[i.id] ? 1 : ''}</em></button>
          <span className="x-ac2">
            <button aria-label="Bookmark" className={st.b[i.id] ? 'bm' : ''} onClick={() => { flip('b', i.id); if (!st.b[i.id]) say('Added to your Bookmarks'); }}><Ico d="bookmark" s={18.5} fill={!!st.b[i.id]} /></button>
            <button aria-label="Share" onClick={() => { const u = location.origin + (i.href.startsWith('/') ? i.href : '/providers/' + i.href); try { if (navigator.share) navigator.share({ url: u }); else { navigator.clipboard.writeText(u); say('Copied to clipboard'); } } catch {} }}><Ico d="share" s={18.5} /></button>
          </span>
        </div>
      </div>
    </article>
  );
  const Cell = ({ p }: { p: XProvider }) => (
    <div className="x-cell" onClick={() => go({ v: 'profile', a: p.s })}>
      <Av name={p.n} handle={p.s} />
      <div className="x-cm">
        <div className="x-hd"><b>{p.n}</b>{p.cl && <Badge />}</div>
        <div className="x-mu">{p.tl} · {p.f} {p.p.slice(0, 2).map((s) => portBySlug(s)?.name).filter(Boolean).join(', ') || p.c}</div>
        {p.b && <div className="x-cb">{p.b.slice(0, 120)}</div>}
      </div>
      <button className={'x-btn sm' + (st.f[p.s] ? ' ol' : '')} onClick={(e) => { e.stopPropagation(); flip('f', p.s); }}>{st.f[p.s] ? 'Following' : 'Follow'}</button>
    </div>
  );
  const Head = ({ title, sub, tabs }: { title?: string; sub?: string; tabs?: React.ReactNode }) => (
    <header className={'x-top' + (hide ? ' hid' : '')}>
      {title ? (
        <div className="x-bar"><button className="x-ib" onClick={back} aria-label="Back"><Ico d="back" s={20} w={2} /></button><div className="x-tt"><b>{title}</b>{sub && <small>{sub}</small>}</div></div>
      ) : (
        <div className="x-bar m">
          <button className="x-me" onClick={() => setDrawer(true)} aria-label="Open menu"><Ico d="user" s={18} /></button>
          <span className="x-mid"><LogoMark size={27} /></span>
          <button className="x-ib" onClick={() => go({ v: 'search' })} aria-label="Search"><Ico d="search" s={21} /></button>
        </div>
      )}
      {tabs}
    </header>
  );
  const Tabs = <T extends string>({ list, on, set }: { list: [T, string][]; on: T; set: (t: T) => void }) => (
    <nav className="x-tabs">{list.map(([k, l]) => <button key={k} className={on === k ? 'on' : ''} onClick={() => set(k)}><span>{l}</span></button>)}</nav>
  );
  const Empty = ({ t, s, cta }: { t: string; s: string; cta?: React.ReactNode }) => <div className="x-empty"><h2>{t}</h2><p>{s}</p>{cta}</div>;

  /* ---------- views ---------- */
  let body: React.ReactNode = null;
  if (view.v === 'home') {
    body = (<>
      <Head tabs={<Tabs list={[['for', 'For you'], ['following', 'Following']]} on={tab} set={setTab} />} />
      <div className="x-ask" onClick={() => go({ v: 'request' })}>
        <span className="x-av off" style={{ width: 40, height: 40 }}><Ico d="anchor" s={20} /></span>
        <div><b>What do you need, and in which port?</b><small>Agents, chandlers and service companies reply with quotes</small></div>
      </div>
      <div className="x-chips">{QUICK.slice(0, 8).map((k) => <button key={k} onClick={() => go({ v: 'search', q: svcLabel(k) })}>{EMO[k] || '🔧'} {svcLabel(k)}</button>)}</div>
      {feed.length ? feed.map((i) => <Post key={i.id} i={i} />) : (
        <Empty t="Welcome to your timeline" s="Follow ship agents, chandlers and service companies. Their news shows up here." cta={<button className="x-btn" onClick={() => go({ v: 'search' })}>Find companies</button>} />
      )}
      <div className="x-endpad" />
    </>);
  } else if (view.v === 'search') {
    body = <SearchView q={view.q || ''} providers={providers} trending={trending} hide={hide} onBack={back} go={go} Cell={Cell} onDrawer={() => setDrawer(true)} />;
  } else if (view.v === 'profile') {
    const p = bySlug.get(view.a || '');
    const posts = items.filter((i) => i.handle === view.a);
    body = p ? <Profile p={p} posts={posts} Post={Post} Head={Head} following={!!st.f[p.s]} onFollow={() => flip('f', p.s)} go={go} /> : <><Head title="Profile" /><Empty t="This account doesn’t exist" s="Try searching for another." /></>;
  } else if (view.v === 'port') {
    body = <PortView slug={view.a || ''} providers={providers} Head={Head} Cell={Cell} go={go} />;
  } else if (view.v === 'notifs') {
    body = (<>
      <Head title="Notifications" tabs={<Tabs list={[['all', 'All'], ['req', 'Requests']]} on={'all'} set={() => {}} />} />
      <Empty t="Nothing to see here — yet" s="Quotes for your requests, replies and new companies in the ports you follow will show up here." cta={<div className="x-row"><a className="x-btn" href="/for-providers/signup">Create account</a><a className="x-btn ol" href="/for-providers/login">Log in</a></div>} />
    </>);
  } else if (view.v === 'chat') {
    body = (<>
      <Head title="Chat" />
      <Empty t="Welcome to your inbox!" s="Talk to ship agents, chandlers and service companies directly. Open a company and tap the message button." cta={<button className="x-btn ac" onClick={() => go({ v: 'search' })}>Find a company</button>} />
    </>);
  } else if (view.v === 'saved') {
    const saved = items.filter((i) => st.b[i.id]);
    body = (<><Head title="Bookmarks" />{saved.length ? saved.map((i) => <Post key={i.id} i={i} />) : <Empty t="Save posts for later" s="Bookmark posts to easily find them again in the future." />}</>);
  } else if (view.v === 'request') {
    body = <RequestView initial={view.q || ''} onClose={back} />;
  }

  const NAV: [View['v'], string, string][] = [['home', 'home', 'Home'], ['search', 'search', 'Explore'], ['notifs', 'bell', 'Notifications'], ['chat', 'chat', 'Chat'], ['saved', 'bookmark', 'Bookmarks']];
  return (
    <div className="xapp">
      <aside className="x-left">
        <button className="x-logo" onClick={() => go({ v: 'home' })} aria-label="Home"><LogoMark size={32} /></button>
        {NAV.map(([v, d, l]) => <button key={v} className={'x-nav' + (view.v === v ? ' on' : '')} onClick={() => go({ v })}><Ico d={d} s={26} w={view.v === v ? 2.4 : 1.8} /><span>{l}</span></button>)}
        <a className="x-nav" href="/for-providers/login"><Ico d="user" s={26} /><span>Profile</span></a>
        <button className="x-nav" onClick={toggleTheme}><Ico d="bulb" s={26} /><span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span></button>
        <button className="x-big" onClick={() => go({ v: 'request' })}><span>Get quotes</span><Ico d="plus" s={24} w={2.4} /></button>
        <a className="x-acct" href="/for-providers/signup"><span className="x-av" style={{ width: 40, height: 40, background: '#536471' }}><Ico d="user" s={20} /></span><span><b>List your company</b><small>Free for providers</small></span></a>
      </aside>

      <main className="x-main">{body}</main>

      <aside className="x-right">
        <div className="x-sbox" onClick={() => go({ v: 'search' })}><Ico d="search" s={18} /><span>Search ports, companies, services</span></div>
        <section className="x-panel">
          <h3>Need something in port?</h3>
          <p className="x-mu" style={{ padding: '0 16px 12px' }}>Send one request. Matching agents, chandlers and service companies reply with quotes.</p>
          <div style={{ padding: '0 16px 4px' }}><button className="x-btn" onClick={() => go({ v: 'request' })}>Get quotes</button></div>
        </section>
        <section className="x-panel">
          <h3>Trending ports</h3>
          {trending.map(([s, c], n) => { const p = portBySlug(s); return p && <button key={s} className="x-trd" onClick={() => go({ v: 'port', a: s })}><small>{n + 1} · Trending in {p.country}</small><b>{p.name} {p.flag}</b><small>{c} searches</small></button>; })}
        </section>
        <section className="x-panel">
          <h3>Who to follow</h3>
          {providers.filter((p) => p.cl).sort((a, b) => b.j.localeCompare(a.j)).slice(0, 3).map((p) => <Cell key={p.s} p={p} />)}
        </section>
        <p className="x-foot"><a href="/about">About</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/psc-detentions">PSC data</a><span>{listed.toLocaleString('en-US')} companies · +{joined} this month</span></p>
      </aside>

      {(view.v === 'home' || view.v === 'search' || view.v === 'chat') && (
        <button className={'x-fab' + (hide ? ' dim' : '')} onClick={() => go({ v: view.v === 'chat' ? 'search' : 'request' })} aria-label={view.v === 'chat' ? 'New message' : 'Get quotes'}><Ico d={view.v === 'chat' ? 'mail' : 'plus'} s={26} w={2.2} /></button>
      )}
      {view.v !== 'request' && (
        <nav className={'x-bot' + (hide ? ' dim' : '')} aria-label="Main">
          {([['home', 'home'], ['search', 'search'], ['request', 'anchor'], ['notifs', 'bell'], ['chat', 'chat']] as [View['v'], string][]).map(([v, d]) => (
            <button key={v} className={view.v === v ? 'on' : ''} onClick={() => (v === 'home' && view.v === 'home' ? window.scrollTo({ top: 0, behavior: 'smooth' }) : go({ v }))} aria-label={v}><Ico d={d} s={26} w={view.v === v ? 2.4 : 1.8} fill={view.v === v && v !== 'search' && v !== 'request'} /></button>
          ))}
        </nav>
      )}

      {drawer && (
        <div className="x-dw" onClick={() => setDrawer(false)}>
          <div className="x-dwp" onClick={(e) => e.stopPropagation()}>
            <span className="x-av" style={{ width: 40, height: 40, background: '#536471' }}><Ico d="user" s={20} /></span>
            <b className="x-dwn">Guest</b><span className="x-mu">@guest</span>
            <div className="x-dwc"><b>{Object.keys(st.f).length}</b> Following <b style={{ marginLeft: 14 }}>0</b> Followers</div>
            <a className="x-dwi" href="/for-providers/login"><Ico d="user" />Profile</a>
            <button className="x-dwi" onClick={() => go({ v: 'request' })}><Ico d="anchor" />Get quotes</button>
            <button className="x-dwi" onClick={() => go({ v: 'saved' })}><Ico d="bookmark" />Bookmarks</button>
            <button className="x-dwi" onClick={() => go({ v: 'search' })}><Ico d="pin" />Ports</button>
            <a className="x-dwi" href="/blog"><Ico d="book" />Guides</a>
            <a className="x-dwi" href="/psc-detentions"><Ico d="shield" />PSC data</a>
            <a className="x-dwi" href="/for-providers/signup"><Ico d="biz" />List your company</a>
            <hr />
            <a className="x-dwi sm" href="/for-providers/login"><Ico d="gear" s={20} />Settings and privacy</a>
            <a className="x-dwi sm" href="/contact"><Ico d="help" s={20} />Help Center</a>
            <button className="x-bulb" onClick={toggleTheme} aria-label="Switch theme"><Ico d="bulb" s={24} /></button>
          </div>
        </div>
      )}
      {toast && <div className="x-toast">{toast}</div>}
      <style>{CSS}</style>
    </div>
  );
}

/* ---------- search ---------- */
function SearchView({ q: q0, providers, trending, hide, onBack, go, Cell, onDrawer }: { q: string; providers: XProvider[]; trending: [string, number][]; hide: boolean; onBack: () => void; go: (v: View) => void; Cell: (x: { p: XProvider }) => React.ReactNode; onDrawer: () => void }) {
  const [q, setQ] = useState(q0);
  const [tab, setTab] = useState<'top' | 'companies' | 'ports'>('top');
  useEffect(() => setQ(q0), [q0]);
  const r = useMemo(() => {
    const t = q.trim();
    if (!t) return null;
    const { ports, svc } = parseQuery(t);
    const nq = norm(t);
    let cos: XProvider[];
    if (ports.length || svc) {
      const ps = new Set(ports.map((p) => p.slug));
      cos = providers.filter((p) => (!ps.size || p.p.some((s) => ps.has(s))) && (!svc || offers(p, svc)));
    } else {
      cos = providers.filter((p) => norm(p.n).includes(nq) || norm(p.c) === nq || p.p.some((s) => norm(s).startsWith(nq)));
    }
    cos.sort((a, b) => Number(b.cl) - Number(a.cl) || a.n.localeCompare(b.n));
    const pl = nq.length >= 2 ? ALL_PORTS.filter((p) => norm(p.name).startsWith(nq) || norm(p.country) === nq || ports.includes(p)).slice(0, 30) : [];
    return { cos, pl, svc, ports };
  }, [q, providers]);
  const PortRow = ({ p }: { p: PortRef }) => (
    <button className="x-prow" onClick={() => go({ v: 'port', a: p.slug })}><span className="x-pin"><Ico d="pin" s={20} /></span><span><b>{p.name} {p.flag}</b><small>{p.country} · {providers.filter((x) => x.p.includes(p.slug)).length} companies</small></span></button>
  );
  return (<>
    <header className={'x-top' + (hide ? ' hid' : '')}>
      <div className="x-bar">
        <button className="x-me sm-only" onClick={onDrawer} aria-label="Open menu"><Ico d="user" s={18} /></button>
        {q && <button className="x-ib" onClick={() => (q0 ? onBack() : setQ(''))} aria-label="Back"><Ico d="back" s={20} w={2} /></button>}
        <label className="x-sin"><Ico d="search" s={17} /><input autoFocus={!q0} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search port, company or service" enterKeyHint="search" />{q && <button onClick={() => setQ('')} aria-label="Clear"><Ico d="close" s={14} w={2.6} /></button>}</label>
      </div>
      {r && <nav className="x-tabs">{([['top', 'Top'], ['companies', 'Companies'], ['ports', 'Ports']] as const).map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}><span>{l}</span></button>)}</nav>}
    </header>
    {!r ? (<>
      <h2 className="x-h2">What do you need?</h2>
      <div className="x-grid">{QUICK.map((k) => <button key={k} onClick={() => setQ(svcLabel(k) + ' ')}><span>{EMO[k] || '🔧'}</span>{svcLabel(k)}</button>)}</div>
      <p className="x-hint">Tip: type a service and a port together, like <button onClick={() => setQ('ship chandler Istanbul')}>ship chandler Istanbul</button> or <button onClick={() => setQ('bunker Singapore')}>bunker Singapore</button></p>
      <h2 className="x-h2">Trending ports</h2>
      {trending.map(([s, c], n) => { const p = portBySlug(s); return p && <button key={s} className="x-trd" onClick={() => go({ v: 'port', a: s })}><small>{n + 1} · Trending in {p.country}</small><b>#{p.name.replace(/\s+/g, '')}</b><small>{c} searches in 90 days</small></button>; })}
      <div className="x-endpad" />
    </>) : (<>
      {(r.svc || r.ports.length > 0) && (
        <div className="x-intent">
          {r.svc && <span>{EMO[r.svc] || '🔧'} {svcLabel(r.svc)}</span>}{r.ports.slice(0, 2).map((p) => <span key={p.slug}>📍 {p.name}</span>)}
          <b>{r.cos.length} {r.cos.length === 1 ? 'company' : 'companies'}</b>
        </div>
      )}
      {(r.svc || r.ports.length > 0) && <div className="x-reqbar"><span>Get quotes from all of them with one request</span><button className="x-btn sm" onClick={() => go({ v: 'request', q: [r.svc || '', r.ports[0]?.slug || ''].join('|') })}>Get quotes</button></div>}
      {tab !== 'companies' && r.pl.length > 0 && (<>{tab === 'top' && <h2 className="x-h2">Ports</h2>}{r.pl.slice(0, tab === 'top' ? 3 : 30).map((p) => <PortRow key={p.slug} p={p} />)}</>)}
      {tab !== 'ports' && (<>{tab === 'top' && r.cos.length > 0 && <h2 className="x-h2">Companies</h2>}{r.cos.slice(0, tab === 'top' ? 25 : 80).map((p) => <Cell key={p.s} p={p} />)}</>)}
      {!r.cos.length && !r.pl.length && <div className="x-empty"><h2>No results for “{q}”</h2><p>Try a port name like Rotterdam, or a service like bunker.</p></div>}
      <div className="x-endpad" />
    </>)}
  </>);
}

/* ---------- port ---------- */
function PortView({ slug, providers, Head, Cell, go }: { slug: string; providers: XProvider[]; Head: (x: { title?: string; sub?: string; tabs?: React.ReactNode }) => React.ReactNode; Cell: (x: { p: XProvider }) => React.ReactNode; go: (v: View) => void }) {
  const port = portBySlug(slug);
  const [t, setT] = useState<'all' | 'agent' | 'chandler' | 'service'>('all');
  const list = useMemo(() => providers.filter((p) => p.p.includes(slug)).sort((a, b) => Number(b.cl) - Number(a.cl) || a.n.localeCompare(b.n)), [providers, slug]);
  if (!port) return <><Head title="Port" /><div className="x-empty"><h2>Port not found</h2></div></>;
  const shown = t === 'all' ? list : list.filter((p) => p.t === t);
  return (<>
    <Head title={port.name} sub={`${list.length} companies`} />
    <div className="x-phero">
      <div className="x-pbig">{port.flag || '⚓'}</div>
      <h1>{port.name}</h1><div className="x-mu">{port.country} · Port</div>
      <div className="x-row"><button className="x-btn" onClick={() => go({ v: 'request', q: '|' + slug })}>Get quotes in {port.name}</button><a className="x-btn ol" href={`/ports/${slug}`}>Port guide</a></div>
    </div>
    <nav className="x-tabs">{([['all', 'All'], ['agent', 'Agents'], ['chandler', 'Chandlers'], ['service', 'Services']] as const).map(([k, l]) => <button key={k} className={t === k ? 'on' : ''} onClick={() => setT(k)}><span>{l}</span></button>)}</nav>
    {shown.length ? shown.map((p) => <Cell key={p.s} p={p} />) : <div className="x-empty"><h2>No companies listed yet</h2><p>Send a request and we will find one for you in {port.name}.</p></div>}
    <div className="x-endpad" />
  </>);
}

/* ---------- profile ---------- */
function Profile({ p, posts, Post, Head, following, onFollow, go }: { p: XProvider; posts: FeedItem[]; Post: (x: { i: FeedItem }) => React.ReactNode; Head: (x: { title?: string; sub?: string; tabs?: React.ReactNode }) => React.ReactNode; following: boolean; onFollow: () => void; go: (v: View) => void }) {
  const [t, setT] = useState<'posts' | 'about'>('posts');
  const ports = p.p.map((s) => portBySlug(s)).filter(Boolean) as PortRef[];
  const wa = p.wa.replace(/[^0-9]/g, '');
  const web = p.w ? (p.w.startsWith('http') ? p.w : 'https://' + p.w) : '';
  return (<>
    <Head title={p.n} sub={p.tl} />
    <div className="x-ban" style={{ background: `linear-gradient(135deg, ${hue(p.s)}, #0d1b4a)` }} />
    <div className="x-pf">
      <div className="x-pfr">
        <span className="x-pfav"><Av name={p.n} handle={p.s} size={80} /></span>
        <div className="x-row r">
          {wa && <a className="x-cir" href={`https://wa.me/${wa}`} target="_blank" rel="noopener" aria-label="WhatsApp"><Ico d="chat" s={19} /></a>}
          {p.em && <a className="x-cir" href={`mailto:${p.em}`} aria-label="Email"><Ico d="mail" s={19} /></a>}
          {p.ph && <a className="x-cir" href={`tel:${p.ph.replace(/\s/g, '')}`} aria-label="Call"><Ico d="phone" s={18} /></a>}
          <button className={'x-btn' + (following ? ' ol' : '')} onClick={onFollow}>{following ? 'Following' : 'Follow'}</button>
        </div>
      </div>
      <h1 className="x-pfn">{p.n}{p.cl && <Badge />}</h1>
      <div className="x-mu">@{p.s}</div>
      {p.b && <p className="x-pfb">{p.b}</p>}
      <div className="x-pfm">
        <span><Ico d="biz" s={17} />{p.tl}</span>
        <span><Ico d="pin" s={17} />{ports.slice(0, 2).map((x) => x.name).join(', ') || p.c}{ports.length > 2 ? ` +${ports.length - 2}` : ''} {p.f}</span>
        {web && <a href={web} target="_blank" rel="noopener nofollow"><Ico d="link" s={17} />{p.w.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').slice(0, 28)}</a>}
        {p.cl && <span><Ico d="cal" s={17} />Joined {new Date(p.j).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>}
      </div>
      <button className="x-btn ac full" onClick={() => go({ v: 'request', q: `${p.t === 'service' ? p.sv[0] || '' : p.t}|${p.p[0] || ''}` })}>Request a quote</button>
      {!p.cl && <p className="x-claim">Listed from public information. <a href={`/claim/${p.s}`}>Is this your company? Claim it free</a></p>}
    </div>
    <nav className="x-tabs"><button className={t === 'posts' ? 'on' : ''} onClick={() => setT('posts')}><span>Posts</span></button><button className={t === 'about' ? 'on' : ''} onClick={() => setT('about')}><span>About</span></button></nav>
    {t === 'posts' ? (posts.length ? posts.map((i) => <Post key={i.id} i={i} />) : <div className="x-empty"><h2>@{p.s.slice(0, 24)} hasn’t posted</h2><p>When they do, their posts will show up here.</p></div>) : (
      <div className="x-about">
        <h3>Ports</h3><div className="x-tags">{ports.map((x) => <button key={x.slug} onClick={() => go({ v: 'port', a: x.slug })}>📍 {x.name}</button>)}</div>
        {p.sv.length > 0 && (<><h3>Services</h3><div className="x-tags">{p.sv.map((k) => <span key={k}>{EMO[k] || '🔧'} {svcLabel(k)}</span>)}</div></>)}
        <h3>Country</h3><p>{p.f} {p.c}</p>
        <a className="x-hint" href={`/providers/${p.s}`}>Open full company page →</a>
      </div>
    )}
    <div className="x-endpad" />
  </>);
}

/* ---------- request (compose) ---------- */
function RequestView({ initial, onClose }: { initial: string; onClose: () => void }) {
  const [svc0, port0] = initial.split('|');
  const [svc, setSvc] = useState(svc0 || '');
  const [port, setPort] = useState<PortRef | null>(port0 ? portBySlug(port0) : null);
  const [pq, setPq] = useState('');
  const [text, setText] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [phone, setPhone] = useState(''); const [vessel, setVessel] = useState('');
  const [busy, setBusy] = useState(false); const [done, setDone] = useState<number | null>(null); const [err, setErr] = useState('');
  const hits = useMemo(() => { const n = norm(pq); return n.length < 2 ? [] : ALL_PORTS.filter((p) => norm(p.name).startsWith(n)).slice(0, 6); }, [pq]);
  const ok = !!(svc && port && text.trim().length >= 5 && name.trim() && /\S+@\S+\.\S+/.test(email));
  const send = async () => {
    if (!ok || !port || busy) return;
    setBusy(true); setErr('');
    try {
      const r = await submitRfq({ country: port.country, port: port.name, serviceType: svc, vesselType: vessel, eta: '', requirementDetails: text.trim(), urgency: urgent ? 'urgent' : 'standard', operatorName: name.trim(), operatorEmail: email.trim(), operatorPhone: phone.trim() });
      if (r.ok) setDone(r.distributedCount); else setErr('Could not send. Please try again.');
    } catch { setErr('Could not send. Please try again.'); }
    setBusy(false);
  };
  if (done !== null) return (
    <div className="x-cmp">
      <div className="x-bar"><button className="x-ib" onClick={onClose} aria-label="Close"><Ico d="close" s={20} w={2} /></button></div>
      <div className="x-empty"><h2>Request sent ✅</h2><p>{done > 0 ? `${done} ${done === 1 ? 'company' : 'companies'} in ${port?.name} got your request. Quotes come to ${email}.` : `We received it and will pass it to companies in ${port?.name}. Quotes come to ${email}.`}</p><button className="x-btn" onClick={onClose}>Done</button></div>
    </div>
  );
  return (
    <div className="x-cmp">
      <div className="x-bar sp"><button className="x-tl" onClick={onClose}>Cancel</button><button className="x-btn ac sm" disabled={!ok || busy} onClick={send}>{busy ? 'Sending…' : 'Send'}</button></div>
      <div className="x-cbody">
        <span className="x-av off" style={{ width: 40, height: 40 }}><Ico d="anchor" s={20} /></span>
        <div className="x-cf">
          <textarea autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="What do you need? e.g. Fresh provisions for 22 crew, ETA Friday 🥩🥖" rows={4} maxLength={2000} />
          <div className="x-lbl">📍 Port</div>
          {port ? <button className="x-pill on" onClick={() => setPort(null)}>{port.flag} {port.name}, {port.country} ✕</button> : (
            <div><input className="x-in" value={pq} onChange={(e) => setPq(e.target.value)} placeholder="Type a port name" />{hits.map((p) => <button key={p.slug} className="x-opt" onClick={() => { setPort(p); setPq(''); }}>{p.flag} {p.name} <small>{p.country}</small></button>)}</div>
          )}
          <div className="x-lbl">🧰 Service</div>
          <div className="x-tags">{QUICK.map((k) => <button key={k} className={svc === k ? 'on' : ''} onClick={() => setSvc(k)}>{EMO[k] || '🔧'} {svcLabel(k)}</button>)}
            <select className="x-in sel" value={QUICK.includes(svc) ? '' : svc} onChange={(e) => setSvc(e.target.value)}><option value="">More services…</option>{SERVICES.filter((s) => !QUICK.includes(s.key)).map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}</select>
          </div>
          <label className="x-urg"><input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} /> ⚡ Urgent (within 24 hours)</label>
          <div className="x-lbl">Your details</div>
          <input className="x-in" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name or company" autoComplete="name" />
          <input className="x-in" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email for quotes" type="email" autoComplete="email" />
          <input className="x-in" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone / WhatsApp (optional)" type="tel" autoComplete="tel" />
          <input className="x-in" value={vessel} onChange={(e) => setVessel(e.target.value)} placeholder="Vessel type (optional)" />
          {err && <p className="x-err">{err}</p>}
          <p className="x-mu sm">Your request goes to matching companies in that port. They reply to your email.</p>
        </div>
      </div>
    </div>
  );
}

/* ---------- styles ---------- */
const CSS = `
html:has(.xapp){background:var(--xbg,#000)}
html[data-psfx=light]:has(.xapp){--xbg:#fff}
html[data-psfx=dark]:has(.xapp){--xbg:#000}
body:has(.xapp){margin:0;background:var(--xbg);overflow-x:hidden}
body:has(.xapp) .bn,body:has(.xapp) .bn-space,body:has(.xapp) .mf-bar,body:has(.xapp) .mf-wrap{display:none!important}
.xapp{--bg:#fff;--fg:#0f1419;--mu:#536471;--ln:#eff3f4;--hv:rgba(15,20,25,.03);--sf:#f7f9f9;--ch:#eff3f4;--ac:#946800;--acb:#d6a838;--hd:rgba(255,255,255,.85);--ov:rgba(0,0,0,.4);--sh:0 0 15px rgba(101,119,134,.2),0 0 3px rgba(101,119,134,.15)}
html[data-psfx=dark] .xapp{--bg:#000;--fg:#e7e9ea;--mu:#71767b;--ln:#2f3336;--hv:rgba(231,233,234,.03);--sf:#16181c;--ch:#202327;--ac:#e2b54d;--acb:#d6a838;--hd:rgba(0,0,0,.65);--ov:rgba(91,112,131,.4);--sh:0 0 15px rgba(255,255,255,.2),0 0 3px rgba(255,255,255,.15)}
.xapp{display:flex;justify-content:center;min-height:100vh;background:var(--bg);color:var(--fg);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:20px;-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent;overflow-x:clip}
.xapp *{box-sizing:border-box}
.xapp a{color:inherit;text-decoration:none}
.xapp button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer;text-align:left}
.xapp h1,.xapp h2,.xapp h3,.xapp p{margin:0}
.x-mu{color:var(--mu)}.x-mu.sm{font-size:13px;margin-top:6px}
.x-left{position:sticky;top:0;height:100vh;width:275px;padding:2px 8px;display:flex;flex-direction:column;align-items:flex-start}
.x-logo{width:52px;height:52px;display:grid!important;place-items:center;border-radius:99px;margin:2px 0}
.x-logo:hover,.x-nav:hover{background:var(--ch)}
.x-nav{display:flex!important;align-items:center;gap:20px;padding:12px!important;border-radius:99px;font-size:20px;line-height:24px}
.x-nav.on{font-weight:700}
.x-big{display:flex!important;align-items:center;justify-content:center;width:234px;height:52px;margin-top:16px;border-radius:99px;background:var(--fg)!important;color:var(--bg)!important;font-weight:700!important;font-size:17px}
.x-big svg{display:none}
.x-acct{display:flex;align-items:center;gap:12px;margin-top:auto;margin-bottom:12px;padding:12px;border-radius:99px;width:100%}.x-acct:hover{background:var(--ch)}
.x-acct b,.x-acct small{display:block}.x-acct small{color:var(--mu);font-size:15px}
.x-main{width:600px;max-width:100%;min-height:100vh;border-left:1px solid var(--ln);border-right:1px solid var(--ln)}
.x-top{position:sticky;top:0;z-index:30;background:var(--hd);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--ln);transition:transform .2s}
.x-bar{display:flex;align-items:center;gap:20px;min-height:53px;padding:0 16px}
.x-bar.m{display:none;justify-content:space-between}
.x-bar.sp{justify-content:space-between}
.x-mid{position:absolute;left:50%;transform:translateX(-50%);display:flex}
.x-ib{width:36px;height:36px;display:grid!important;place-items:center;border-radius:99px;margin-left:-8px}.x-ib:hover{background:var(--ch)}
.x-tt b{display:block;font-size:20px;line-height:24px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:70vw}.x-tt small{color:var(--mu);font-size:13px}
.x-me{width:32px;height:32px;border-radius:50%;display:grid!important;place-items:center;background:var(--ch);color:var(--mu)!important;flex:none}
.sm-only{display:none!important}
.x-tabs{display:flex}
.x-tabs button{flex:1;display:flex!important;justify-content:center;color:var(--mu)!important;font-weight:500;height:53px;align-items:center}
.x-tabs button:hover{background:var(--hv)}
.x-tabs button span{position:relative;display:flex;align-items:center;height:100%}
.x-tabs button.on{color:var(--fg)!important;font-weight:700}
.x-tabs button.on span::after{content:'';position:absolute;left:0;right:0;bottom:0;height:4px;border-radius:99px;background:var(--acb)}
.x-ask{display:flex;gap:12px;align-items:center;padding:12px 16px;border-bottom:1px solid var(--ln);cursor:pointer}
.x-ask b{display:block;font-size:17px;font-weight:600}.x-ask small{color:var(--mu);font-size:14px}
.x-chips{display:flex;gap:8px;padding:12px 16px;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid var(--ln)}.x-chips::-webkit-scrollbar{display:none}
.x-chips button{flex:none;border:1px solid var(--ln)!important;border-radius:99px;padding:6px 14px!important;font-weight:600;font-size:14px;white-space:nowrap}.x-chips button:hover{background:var(--hv)}
.x-av{display:grid;place-items:center;border-radius:50%;color:#fff;font-weight:700;flex:none;overflow:hidden}
.x-av.off{background:#0d1b4a;color:#d6a838}
.x-post{display:flex;gap:8px;padding:12px 16px 4px;border-bottom:1px solid var(--ln);cursor:pointer}.x-post:hover{background:var(--hv)}
.x-pl{flex:none;padding-right:4px}.x-pr{min-width:0;flex:1}
.x-hd{display:flex;align-items:center;gap:4px;min-width:0;white-space:nowrap}
.x-hd b{font-weight:700;overflow:hidden;text-overflow:ellipsis}.x-hd span{color:var(--mu)}.x-hd span:nth-of-type(1){overflow:hidden;text-overflow:ellipsis;min-width:0}
.x-badge{flex:none}
.x-tx{white-space:pre-wrap;overflow-wrap:anywhere;margin-top:2px}
.x-ht{color:var(--ac)!important}.x-ht:hover{text-decoration:underline}
.x-cd{margin-top:12px;border:1px solid var(--ln);border-radius:16px;padding:12px;color:var(--mu);font-size:15px;line-height:20px;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
.x-cd.g{color:var(--fg)}.x-cd small{display:block;color:var(--mu);font-size:13px;margin-bottom:2px}
.x-ac{display:flex;justify-content:space-between;align-items:center;margin:4px 0 0 -8px;max-width:440px;color:var(--mu)}
.x-ac button{display:flex!important;align-items:center;gap:2px;height:34px;padding:0 8px!important;border-radius:99px;transition:color .15s}
.x-ac em{font-style:normal;font-size:13px;min-width:8px}
.x-ac button[aria-label=Reply]:hover,.x-ac button[aria-label=Share]:hover{color:#1d9bf0}
.x-ac button[aria-label=Repost]:hover,.x-ac .rp{color:#00ba7c!important}
.x-ac button[aria-label=Like]:hover,.x-ac .lk{color:#f91880!important}
.x-ac button[aria-label=Bookmark]:hover,.x-ac .bm{color:var(--ac)!important}
.x-ac2{display:flex}
.x-btn{display:inline-flex!important;align-items:center;justify-content:center;height:36px;padding:0 16px!important;border-radius:99px;background:var(--fg)!important;color:var(--bg)!important;font-weight:700;font-size:15px;white-space:nowrap}
.x-btn:disabled{opacity:.5;cursor:default}
.x-btn.sm{height:32px;font-size:14px}
.x-btn.ol{background:transparent!important;color:var(--fg)!important;border:1px solid var(--ln)!important}
.x-btn.ac{background:var(--acb)!important;color:#0d1b4a!important}
.x-btn.full{width:100%;height:44px;margin-top:14px;font-size:16px}
.x-row{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}.x-row.r{justify-content:flex-end;align-items:center}
.x-cell{display:flex;gap:12px;padding:12px 16px;cursor:pointer;align-items:flex-start}.x-cell:hover{background:var(--hv)}
.x-cm{min-width:0;flex:1}.x-cm .x-mu{font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.x-cb{margin-top:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.x-empty{padding:40px 32px;max-width:400px;margin:0 auto;display:flex;flex-direction:column;gap:10px;align-items:flex-start}
.x-empty h2{font-size:31px;line-height:36px;font-weight:800}.x-empty p{color:var(--mu)}.x-empty .x-btn{height:52px;padding:0 32px!important;font-size:17px;margin-top:16px}
.x-endpad{height:120px}
.x-h2{font-size:20px;line-height:24px;font-weight:800;padding:12px 16px}
.x-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 16px 8px}
.x-grid button{display:flex!important;align-items:center;gap:10px;border:1px solid var(--ln)!important;border-radius:14px;padding:12px!important;font-weight:600;font-size:14px;line-height:18px}.x-grid button:hover{background:var(--hv)}.x-grid span{font-size:20px}
.x-hint{display:block;color:var(--mu);font-size:14px;padding:8px 16px 4px}.x-hint button{color:var(--ac)!important}
.x-trd{display:flex!important;flex-direction:column;width:100%;padding:12px 16px!important}.x-trd:hover{background:var(--hv)}.x-trd small{color:var(--mu);font-size:13px;line-height:16px}.x-trd b{font-weight:700;margin:2px 0}
.x-sin{flex:1;display:flex;align-items:center;gap:10px;height:42px;border-radius:99px;background:var(--ch);padding:0 14px;color:var(--mu);border:1px solid transparent}
.x-sin:focus-within{border-color:var(--acb);background:var(--bg);color:var(--acb)}
.x-sin input{flex:1;min-width:0;background:none;border:0;outline:0;color:var(--fg);font-size:16px}
.x-sin button{width:22px;height:22px;border-radius:50%;background:var(--acb)!important;color:#0d1b4a!important;display:grid!important;place-items:center}
.x-intent{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:12px 16px 4px}.x-intent span{background:var(--ch);border-radius:99px;padding:4px 12px;font-weight:600;font-size:14px}.x-intent b{margin-left:auto;color:var(--mu);font-weight:500;font-size:14px}
.x-reqbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:8px 16px;padding:12px;border-radius:16px;background:var(--sf);font-weight:600;font-size:14px}
.x-prow{display:flex!important;gap:12px;align-items:center;width:100%;padding:10px 16px!important}.x-prow:hover{background:var(--hv)}.x-prow b,.x-prow small{display:block}.x-prow small{color:var(--mu)}
.x-pin{width:40px;height:40px;border-radius:50%;background:var(--ch);display:grid;place-items:center;flex:none}
.x-phero{padding:24px 16px;text-align:center;border-bottom:1px solid var(--ln);display:flex;flex-direction:column;align-items:center;gap:6px}
.x-pbig{font-size:52px;line-height:60px}.x-phero h1{font-size:24px;line-height:28px;font-weight:800}.x-phero .x-row{margin-top:12px}
.x-ban{height:150px}
.x-pf{padding:12px 16px 16px}
.x-pfr{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}
.x-pfav{margin-top:-52px;border:4px solid var(--bg);border-radius:50%;display:inline-flex}
.x-cir{width:36px;height:36px;border-radius:50%;border:1px solid var(--ln);display:grid;place-items:center}.x-cir:hover{background:var(--hv)}
.x-pfn{display:flex;align-items:center;gap:4px;font-size:20px;line-height:24px;font-weight:800;margin-top:8px}
.x-pfb{margin-top:12px;white-space:pre-wrap}
.x-pfm{display:flex;flex-wrap:wrap;gap:4px 14px;margin-top:12px;color:var(--mu)}.x-pfm>*{display:inline-flex;align-items:center;gap:4px}.x-pfm a{color:var(--ac)}
.x-claim{margin-top:12px;color:var(--mu);font-size:14px}.x-claim a{color:var(--ac)}
.x-about{padding:8px 16px}.x-about h3{font-size:17px;font-weight:800;margin:16px 0 8px}
.x-tags{display:flex;flex-wrap:wrap;gap:8px}
.x-tags>*{border:1px solid var(--ln)!important;border-radius:99px;padding:6px 12px!important;font-size:14px;font-weight:600}
.x-tags button.on{background:var(--fg)!important;color:var(--bg)!important;border-color:var(--fg)!important}
.x-sbox{display:flex;align-items:center;gap:12px;height:44px;border-radius:99px;background:var(--ch);padding:0 16px;color:var(--mu);cursor:text;margin:4px 0 4px}
.x-right{position:sticky;top:0;height:100vh;width:350px;padding:0 0 0 30px;display:flex;flex-direction:column;gap:16px;overflow-y:auto;scrollbar-width:none}
.x-panel{border:1px solid var(--ln);border-radius:16px;padding:12px 0;overflow:hidden}.x-panel h3{font-size:20px;line-height:24px;font-weight:800;padding:0 16px 12px}
.x-foot{display:flex;flex-wrap:wrap;gap:4px 12px;color:var(--mu);font-size:13px;padding:0 16px 20px}.x-foot a:hover{text-decoration:underline}
.x-fab,.x-bot{display:none!important}
.x-dw{position:fixed;inset:0;background:var(--ov);z-index:80;animation:xf .2s}
.x-dwp{position:absolute;left:0;top:0;bottom:0;width:min(280px,80vw);background:var(--bg);padding:16px 16px 70px;overflow-y:auto;display:flex;flex-direction:column;align-items:flex-start;animation:xs .22s ease-out}
.x-dwn{margin-top:8px;font-size:17px;font-weight:700}
.x-dwc{color:var(--mu);font-size:14px;margin:12px 0 8px}.x-dwc b{color:var(--fg)}
.x-dwi{display:flex!important;align-items:center;gap:22px;width:100%;font-size:20px;font-weight:700;padding:14px 0!important}
.x-dwi.sm{font-size:16px;font-weight:600;gap:14px;padding:12px 0!important}
.x-dwp hr{border:0;border-top:1px solid var(--ln);width:100%;margin:6px 0}
.x-bulb{position:absolute;left:16px;bottom:16px;width:40px;height:40px;display:grid!important;place-items:center;border-radius:50%}
@keyframes xs{from{transform:translateX(-100%)}}@keyframes xf{from{opacity:0}}
.x-toast{position:fixed;left:50%;bottom:80px;transform:translateX(-50%);background:#1d9bf0;color:#fff;font-weight:500;padding:12px 18px;border-radius:6px;z-index:90;white-space:nowrap}
.x-cmp{min-height:100vh}
.x-tl{font-size:16px}
.x-cbody{display:flex;gap:12px;padding:8px 16px}.x-cf{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px}
.x-cf textarea{width:100%;background:none;border:0;outline:0;resize:none;color:var(--fg);font:inherit;font-size:20px;line-height:26px;padding:8px 0;border-bottom:1px solid var(--ln)}
.x-lbl{font-weight:700;margin-top:8px}
.x-in{width:100%;height:44px;border-radius:8px;border:1px solid var(--ln);background:var(--bg);color:var(--fg);padding:0 12px;font:inherit;font-size:16px;outline:0}.x-in:focus{border-color:var(--acb)}
.x-in.sel{width:auto;height:32px;border-radius:99px;font-size:14px;padding:0 10px}
.x-opt{display:block!important;width:100%;padding:10px 4px!important;border-bottom:1px solid var(--ln)!important}.x-opt small{color:var(--mu)}
.x-pill{align-self:flex-start;border:1px solid var(--ln)!important;border-radius:99px;padding:6px 12px!important;font-weight:600}.x-pill.on{background:var(--ch)}
.x-urg{display:flex;gap:8px;align-items:center;margin-top:6px;font-weight:600}
.x-err{color:#f4212e}
@media (max-width:1265px){.x-left{width:88px;align-items:center}.x-nav span,.x-acct span:nth-child(2){display:none}.x-big{width:52px;height:52px}.x-big span{display:none}.x-big svg{display:block}.x-acct{width:auto}}
@media (max-width:1000px){.x-right{display:none}}
@media (max-width:600px){
  .x-left{display:none}.x-main{border:0}
  .x-bar.m{display:flex}.sm-only{display:grid!important}
  .x-top.hid{transform:translateY(-54px)}
  .x-fab{display:grid!important;place-items:center;position:fixed;right:16px;bottom:calc(70px + env(safe-area-inset-bottom));width:56px;height:56px;border-radius:50%;background:var(--acb)!important;color:#0d1b4a!important;box-shadow:var(--sh);z-index:40;transition:opacity .2s}
  .x-fab.dim,.x-bot.dim{opacity:.55}
  .x-bot{display:flex!important;justify-content:space-around;position:fixed;left:0;right:0;bottom:0;height:calc(53px + env(safe-area-inset-bottom));padding-bottom:env(safe-area-inset-bottom);background:var(--bg);border-top:1px solid var(--ln);z-index:40;transition:opacity .2s}
  .x-bot button{flex:1;display:grid!important;place-items:center;color:var(--fg)!important}
  .x-empty h2{font-size:26px;line-height:32px}
  .x-pfr .x-btn{padding:0 14px!important}
}
`;
