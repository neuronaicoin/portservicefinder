'use client';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LogoMark } from '@/components/Logo';
import { ALL_PORTS, FLAG, MARINE_SERVICES, PORT_DATA, portBySlug, type PortRef } from '@/lib/ports';
import { submitRfq } from '@/lib/rfq';
import { supabaseBrowser } from '@/lib/supabase-browser';

export type FeedItem = { id: string; kind: 'member' | 'guide' | 'data' | 'post'; at: string; author: string; handle: string; badge?: boolean; text: string; sub?: string; href: string; pid?: string; img?: string; likes?: number; replies?: number; reposts?: number; op?: boolean; req?: { port: string; country: string; service: string; vessel: string; eta: string; urgent: boolean } };
export type XProvider = { id: string; s: string; n: string; t: string; tl: string; c: string; f: string; p: string[]; sv: string[]; b: string; wa: string; ph: string; em: string; w: string; cl: boolean; j: string };
type View = { v: 'home' | 'search' | 'find' | 'profile' | 'port' | 'post' | 'notifs' | 'chat' | 'saved' | 'request' | 'tools' | 'login' | 'compose' | 'me' | 'settings' | 'edit' | 'u'; a?: string; q?: string };

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
  tool: 'M14.5 6.5a4 4 0 0 0-5.3 5.3L3.5 17.5l3 3 5.7-5.7a4 4 0 0 0 5.3-5.3l-2.6 2.6-2.3-.7-.7-2.3z',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z',
  chev: 'M9 6l6 6-6 6',
};
const Ico = ({ d, s = 24, w = 1.8, fill }: { d: string; s?: number; w?: number; fill?: boolean }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"><path d={P[d as keyof typeof P] || d} /></svg>
);
const Badge = () => (
  <svg className="x-badge" width="20" height="20" viewBox="0 0 24 24" aria-label="Verified member"><path fill="#d6a838" d="M12 1.8l2.4 1.8 3-.2.9 2.8 2.5 1.7-.9 2.9.9 2.9-2.5 1.7-.9 2.8-3-.2L12 22.2l-2.4-1.8-3 .2-.9-2.8-2.5-1.7.9-2.9-.9-2.9 2.5-1.7.9-2.8 3 .2z" /><path d="M8 12.3l2.7 2.7L16.3 9.4" fill="none" stroke="#0d1b4a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

/* ---------- helpers ---------- */
const HUES = ['#1f6feb', '#0f766e', '#7c3aed', '#b45309', '#be123c', '#0369a1', '#15803d', '#4338ca', '#9d174d', '#0e7490'];
const hue = (s: string) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return HUES[Math.abs(h) % HUES.length]; };
const ini = (n: string) => n.replace(/[^A-Za-z0-9 ]/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'PS';
const OFFICIAL = new Set(['portservicefinder', 'psfdata', 'requests']);
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
type Me = { user_id: string; kind: 'operator' | 'provider'; name: string; provider_id: string | null; gold: boolean; handle: string | null; handle_changed_at: string | null; bio: string | null; country: string | null; created_at: string };
type DbPost = { id: string; body: string; image_url: string | null; likes: number; replies: number; reposts: number; created_at: string; user_id: string | null; kind?: string; req_port?: string | null; req_country?: string | null; req_service?: string | null; req_vessel?: string | null; req_eta?: string | null; req_urgent?: boolean; x_profiles: { name: string; kind: string; provider_id: string | null; gold: boolean } | null };
const POST_COLS = 'id,body,image_url,likes,replies,reposts,created_at,user_id,kind,req_port,req_country,req_service,req_vessel,req_eta,req_urgent,x_profiles!x_posts_user_id_fkey(name,kind,provider_id,gold)';
const LINK_RE = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|co|uk|tr|gr|sg|nl|de|info|biz|me|app|xyz)\b)/i;
const plain = (e: unknown) => (e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : 'Something went wrong').replace(/^.*?:\s*/, '');

export function XApp({ items, providers, trending, listed, joined }: { items: FeedItem[]; providers: XProvider[]; trending: [string, number][]; listed: number; joined: number }) {
  const [view, setView] = useState<View>({ v: 'home' });
  const [tab, setTab] = useState<'for' | 'find'>('for');
  const [drawer, setDrawer] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [hide, setHide] = useState(false);
  const [toast, setToast] = useState('');
  const [loc, setLoc] = useState<{ l: Record<string, 1>; r: Record<string, 1>; b: Record<string, 1> }>({ l: {}, r: {}, b: {} });
  const [me, setMe] = useState<Me | null>(null);
  const [db, setDb] = useState<DbPost[]>([]);
  const [myL, setMyL] = useState<Record<string, 1>>({});
  const [myR, setMyR] = useState<Record<string, 1>>({});
  const [fol, setFol] = useState<Record<string, 1>>({});
  const [unread, setUnread] = useState(0);
  const homeY = useRef(0);
  const bySlug = useMemo(() => new Map(providers.map((p) => [p.s, p])), [providers]);
  const byId = useMemo(() => new Map(providers.map((p) => [p.id, p])), [providers]);

  const say = (t: string) => { setToast(t); setTimeout(() => setToast(''), 2400); };

  const loadFeed = useCallback(async () => {
    const { data } = await supabaseBrowser.from('x_posts').select(POST_COLS).order('created_at', { ascending: false }).limit(40);
    if (data) setDb(data as unknown as DbPost[]);
  }, []);
  const loadMine = useCallback(async (uid: string) => {
    const [l, r, f, n] = await Promise.all([
      supabaseBrowser.from('x_likes').select('post_id').eq('user_id', uid).limit(500),
      supabaseBrowser.from('x_reposts').select('post_id').eq('user_id', uid).limit(500),
      supabaseBrowser.from('x_follows').select('provider_id').eq('user_id', uid).limit(1000),
      supabaseBrowser.from('x_notifications').select('id', { count: 'exact', head: true }).eq('user_id', uid).eq('read', false),
    ]);
    setMyL(Object.fromEntries((l.data || []).map((x) => [x.post_id, 1 as const])));
    setMyR(Object.fromEntries((r.data || []).map((x) => [x.post_id, 1 as const])));
    setFol(Object.fromEntries((f.data || []).map((x) => [x.provider_id, 1 as const])));
    setUnread(n.count || 0);
  }, []);
  const ensure = useCallback(async (name?: string) => {
    const { data, error } = await supabaseBrowser.rpc('x_ensure_profile', { p_name: name || null });
    if (error || !data) return null;
    const p = data as Me; setMe(p); loadMine(p.user_id); return p;
  }, [loadMine]);

  useEffect(() => {
    setTheme((document.documentElement.dataset.psfx as 'dark' | 'light') || 'dark');
    try { localStorage.setItem('psfx_on', '1'); } catch {}
    try { setLoc({ l: {}, r: {}, b: {}, ...JSON.parse(localStorage.getItem('psfx_state') || '{}') }); } catch {}
    const fromUrl = (): View => {
      const u = new URLSearchParams(location.search);
      if (u.get('c')) return { v: 'profile', a: u.get('c')! };
      if (u.get('port')) return { v: 'port', a: u.get('port')! };
      if (u.get('post')) return { v: 'post', a: u.get('post')! };
      if (u.get('u')) return { v: 'u', a: u.get('u')! };
      const v = u.get('v') as View['v'] | null;
      return v ? { v, q: u.get('q') || '' } : { v: 'home' };
    };
    setView(fromUrl());
    const pop = () => setView(fromUrl());
    window.addEventListener('popstate', pop);
    let last = 0;
    const sc = () => { const y = window.scrollY; setHide(y > 80 && y > last); last = y; };
    window.addEventListener('scroll', sc, { passive: true });
    loadFeed();
    supabaseBrowser.auth.getSession().then(({ data }) => { if (data.session) ensure(); });
    const { data: sub } = supabaseBrowser.auth.onAuthStateChange((ev) => { if (ev === 'SIGNED_OUT') { setMe(null); setMyL({}); setMyR({}); setFol({}); setUnread(0); } });
    return () => { window.removeEventListener('popstate', pop); window.removeEventListener('scroll', sc); sub.subscription.unsubscribe(); };
  }, [loadFeed, ensure]);

  const go = useCallback((n: View) => {
    if (view.v === 'home') homeY.current = window.scrollY;
    const u = n.v === 'profile' ? `?c=${n.a}` : n.v === 'port' ? `?port=${n.a}` : n.v === 'post' ? `?post=${n.a}` : n.v === 'u' ? `?u=${n.a}` : n.v === 'home' ? '' : `?v=${n.v}${n.q ? '&q=' + encodeURIComponent(n.q) : ''}`;
    history.pushState(null, '', '/x' + u);
    setView(n); setDrawer(false);
    requestAnimationFrame(() => window.scrollTo(0, n.v === 'home' ? homeY.current : 0));
  }, [view.v]);
  const back = () => (history.length > 1 ? history.back() : go({ v: 'home' }));
  const needLogin = () => { say('Log in or join to do that'); go({ v: 'login' }); };
  const flipLoc = (k: 'l' | 'r' | 'b', id: string) => {
    setLoc((o) => { const m = { ...o[k] }; if (m[id]) delete m[id]; else m[id] = 1; const n = { ...o, [k]: m }; try { localStorage.setItem('psfx_state', JSON.stringify(n)); } catch {} return n; });
  };
  const toggleTheme = () => { const t = theme === 'dark' ? 'light' : 'dark'; setTheme(t); document.documentElement.dataset.psfx = t; try { localStorage.setItem('psfx_theme', t); localStorage.setItem('psf-theme', t); } catch {} };

  const bump = (pid: string, k: 'likes' | 'reposts' | 'replies', d: number) => setDb((xs) => xs.map((x) => (x.id === pid ? { ...x, [k]: Math.max(0, x[k] + d) } : x)));
  const like = async (pid: string) => {
    if (!me) return needLogin();
    const on = !!myL[pid];
    setMyL((m) => { const n = { ...m }; if (on) delete n[pid]; else n[pid] = 1; return n; }); bump(pid, 'likes', on ? -1 : 1);
    const r = on ? await supabaseBrowser.from('x_likes').delete().eq('post_id', pid).eq('user_id', me.user_id) : await supabaseBrowser.from('x_likes').insert({ post_id: pid, user_id: me.user_id });
    if (r.error) { bump(pid, 'likes', on ? 1 : -1); setMyL((m) => { const n = { ...m }; if (on) n[pid] = 1; else delete n[pid]; return n; }); }
  };
  const repost = async (pid: string) => {
    if (!me) return needLogin();
    const on = !!myR[pid];
    setMyR((m) => { const n = { ...m }; if (on) delete n[pid]; else n[pid] = 1; return n; }); bump(pid, 'reposts', on ? -1 : 1);
    const r = on ? await supabaseBrowser.from('x_reposts').delete().eq('post_id', pid).eq('user_id', me.user_id) : await supabaseBrowser.from('x_reposts').insert({ post_id: pid, user_id: me.user_id });
    if (r.error) { bump(pid, 'reposts', on ? 1 : -1); setMyR((m) => { const n = { ...m }; if (on) n[pid] = 1; else delete n[pid]; return n; }); }
  };
  const follow = async (p: XProvider) => {
    if (!me) return needLogin();
    if (me.provider_id === p.id) return say('This is your company');
    const on = !!fol[p.id];
    setFol((m) => { const n = { ...m }; if (on) delete n[p.id]; else n[p.id] = 1; return n; });
    const r = on ? await supabaseBrowser.from('x_follows').delete().eq('provider_id', p.id).eq('user_id', me.user_id) : await supabaseBrowser.from('x_follows').insert({ provider_id: p.id, user_id: me.user_id });
    if (r.error) setFol((m) => { const n = { ...m }; if (on) n[p.id] = 1; else delete n[p.id]; return n; });
  };

  const takeReq = async (pid: string) => {
    if (!me) return needLogin();
    const { error } = await supabaseBrowser.rpc('x_take_request', { p_post: pid });
    if (error) return say(plain(error));
    say('Added to your requests. Opening your dashboard…');
    setTimeout(() => { location.href = '/for-providers/dashboard'; }, 900);
  };
  const toItem = useCallback((d: DbPost): FeedItem => {
    if (d.kind === 'request') {
      const ref = ALL_PORTS.find((x) => x.name === d.req_port && x.country === d.req_country);
      const svcL = d.req_service ? svcLabel(d.req_service) : 'Any service';
      return { id: 'p-' + d.id, pid: d.id, kind: 'post', at: d.created_at, author: 'Quote request', handle: 'requests', text: `${d.req_urgent ? '⚡ Urgent · ' : ''}${svcL} needed in #${(d.req_port || '').replace(/[^A-Za-z0-9]/g, '')} ${ref?.flag || FLAG[d.req_country || ''] || ''}\n\n${d.body}`, likes: d.likes, replies: d.replies, reposts: d.reposts, href: ref ? '/ports/' + ref.slug : '', req: { port: d.req_port || '', country: d.req_country || '', service: d.req_service || '', vessel: d.req_vessel || '', eta: d.req_eta || '', urgent: !!d.req_urgent } };
    }
    const pr = d.x_profiles; const comp = pr?.provider_id ? byId.get(pr.provider_id) : undefined;
    return { id: 'p-' + d.id, pid: d.id, kind: 'post', at: d.created_at, author: pr?.name || 'Member', handle: comp?.s || (pr?.kind === 'operator' ? 'operator' : 'member'), badge: !!pr?.gold, text: d.body, img: d.image_url || undefined, likes: d.likes, replies: d.replies, reposts: d.reposts, href: comp ? comp.s : '', op: !comp };
  }, [byId]);
  const feed = useMemo(() => [...db.map(toItem), ...items].sort((a, b) => b.at.localeCompare(a.at)), [db, items, toItem]);

  /* ---------- pieces ---------- */
  const Rich = ({ text }: { text: string }) => (
    <>{text.split(/(#[A-Za-z0-9_]+)/g).map((part, i) => part.startsWith('#')
      ? <button key={i} className="x-ht" onClick={(e) => { e.stopPropagation(); go({ v: 'search', q: part.slice(1) }); }}>{part}</button>
      : <Fragment key={i}>{part}</Fragment>)}</>
  );
  const openItem = (i: FeedItem) => { if (i.pid) go({ v: 'post', a: i.pid }); else if (i.href.startsWith('/')) location.href = i.href; else if (i.href) go({ v: 'profile', a: i.href }); };
  const Post = ({ i, big }: { i: FeedItem; big?: boolean }) => {
    const db1 = !!i.pid;
    const lk = db1 ? !!myL[i.pid!] : !!loc.l[i.id]; const rp = db1 ? !!myR[i.pid!] : !!loc.r[i.id];
    const nL = db1 ? i.likes || 0 : lk ? 1 : 0; const nR = db1 ? i.reposts || 0 : rp ? 1 : 0; const nC = db1 ? i.replies || 0 : 0;
    return (
      <article className={'x-post' + (big ? ' big' : '')} onClick={() => !big && openItem(i)}>
        <div className="x-pl" onClick={(e) => { e.stopPropagation(); if (bySlug.has(i.handle)) go({ v: 'profile', a: i.handle }); }}><Av name={i.author} handle={i.handle === 'operator' || i.handle === 'member' ? i.author : i.handle} /></div>
        <div className="x-pr">
          <div className="x-hd"><b>{i.author}</b>{i.badge && <Badge />}<span>{i.op ? (i.handle === 'operator' ? 'Operator' : 'Company') : '@' + i.handle.slice(0, 20)}</span><span>·</span><span>{ago(i.at)}</span></div>
          <div className="x-tx"><Rich text={i.text} /></div>
          {i.img && <img className="x-img" src={i.img} alt="" loading="lazy" />}
          {i.req && (
            <div className="x-rq" onClick={(e) => e.stopPropagation()}>
              <div className="x-rqm">{i.req.vessel && <span>🚢 {i.req.vessel}</span>}{i.req.eta && <span>📅 ETA {new Date(i.req.eta).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}<span>📍 {i.req.port}, {i.req.country}</span></div>
              {me?.kind === 'provider'
                ? <button className="x-btn ac sm" onClick={() => takeReq(i.pid!)}>Send a quote</button>
                : <button className="x-btn ol sm" onClick={() => go({ v: 'request', q: `${i.req!.service}||${i.req!.country}` })}>Need this too? Get quotes</button>}
            </div>
          )}
          {i.sub && <div className={'x-cd' + (i.kind === 'guide' ? ' g' : '')}>{i.kind === 'guide' && <small>portservicefinder.com</small>}<span>{i.sub}</span></div>}
          <div className="x-ac" onClick={(e) => e.stopPropagation()}>
            <button aria-label="Reply" onClick={() => openItem(i)}><Ico d="reply" s={18.5} /><em>{nC || ''}</em></button>
            <button aria-label="Repost" className={rp ? 'rp' : ''} onClick={() => (db1 ? repost(i.pid!) : flipLoc('r', i.id))}><Ico d="repost" s={18.5} /><em>{nR || ''}</em></button>
            <button aria-label="Like" className={lk ? 'lk' : ''} onClick={() => (db1 ? like(i.pid!) : flipLoc('l', i.id))}><Ico d="heart" s={18.5} fill={lk} /><em>{nL || ''}</em></button>
            <span className="x-ac2">
              <button aria-label="Bookmark" className={loc.b[i.id] ? 'bm' : ''} onClick={() => { flipLoc('b', i.id); if (!loc.b[i.id]) say('Added to your Bookmarks'); }}><Ico d="bookmark" s={18.5} fill={!!loc.b[i.id]} /></button>
              <button aria-label="Share" onClick={() => { const u = location.origin + (i.pid ? '/x?post=' + i.pid : i.href.startsWith('/') ? i.href : '/providers/' + i.href); try { if (navigator.share) navigator.share({ url: u }); else { navigator.clipboard.writeText(u); say('Copied to clipboard'); } } catch {} }}><Ico d="share" s={18.5} /></button>
            </span>
          </div>
        </div>
      </article>
    );
  };
  const Cell = ({ p }: { p: XProvider }) => (
    <div className="x-cell" onClick={() => go({ v: 'profile', a: p.s })}>
      <Av name={p.n} handle={p.s} />
      <div className="x-cm">
        <div className="x-hd"><b>{p.n}</b></div>
        <div className="x-mu">{p.tl} · {p.f} {p.p.slice(0, 2).map((s) => portBySlug(s)?.name).filter(Boolean).join(', ') || p.c}</div>
        {p.b && <div className="x-cb">{p.b.slice(0, 120)}</div>}
      </div>
      <button className={'x-btn sm' + (fol[p.id] ? ' ol' : '')} onClick={(e) => { e.stopPropagation(); follow(p); }}>{fol[p.id] ? 'Following' : 'Follow'}</button>
    </div>
  );
  const Head = ({ title, sub, tabs }: { title?: string; sub?: string; tabs?: React.ReactNode }) => (
    <header className={'x-top' + (hide ? ' hid' : '')}>
      {title ? (
        <div className="x-bar"><button className="x-ib" onClick={back} aria-label="Back"><Ico d="back" s={20} w={2} /></button><div className="x-tt"><b>{title}</b>{sub && <small>{sub}</small>}</div></div>
      ) : (
        <div className="x-bar m">
          <button className="x-me" onClick={() => setDrawer(true)} aria-label="Open menu">{me ? <Av name={me.name} handle={me.provider_id ? byId.get(me.provider_id)?.s || me.name : me.name} size={32} /> : <Ico d="user" s={18} />}</button>
          <span className="x-mid"><LogoMark size={27} /></span>
          <button className="x-ib r" onClick={() => go({ v: 'search' })} aria-label="Search"><Ico d="search" s={21} /></button>
        </div>
      )}
      {tabs}
    </header>
  );
  const Tabs = <T extends string>({ list, on, set }: { list: [T, string][]; on: T; set: (t: T) => void }) => (
    <nav className="x-tabs">{list.map(([k, l]) => <button key={k} className={on === k ? 'on' : ''} onClick={() => set(k)}><span>{l}</span></button>)}</nav>
  );
  const Empty = ({ t, s, cta }: { t: string; s: string; cta?: React.ReactNode }) => <div className="x-empty"><h2>{t}</h2><p>{s}</p>{cta}</div>;

  const signOut = async () => { await supabaseBrowser.auth.signOut(); setMe(null); setDrawer(false); say('Logged out'); go({ v: 'home' }); };

  /* ---------- views ---------- */
  let body: React.ReactNode = null;
  if (view.v === 'home') {
    body = (<>
      <Head tabs={<Tabs list={[['for', 'For you'], ['find', 'Find a service']]} on={tab} set={(t) => { setTab(t); window.scrollTo(0, 0); }} />} />
      {tab === 'find' ? <FindView providers={providers} trending={trending} go={go} Cell={Cell} /> : (<>
        <div className="x-ask" onClick={() => go({ v: 'find' })}>
          <span className="x-av off" style={{ width: 40, height: 40 }}><Ico d="search" s={20} /></span>
          <div><b>Find an agent, chandler or service</b><small>Pick a country, a port and what you need</small></div>
          <span className="x-go"><Ico d="chev" s={18} /></span>
        </div>
        {feed.map((i) => <Post key={i.id} i={i} />)}
        <div className="x-endpad" />
      </>)}
    </>);
  } else if (view.v === 'find') {
    body = <><Head title="Find a service" sub="Country, port, service" /><FindView providers={providers} trending={trending} go={go} Cell={Cell} /></>;
  } else if (view.v === 'search') {
    body = <SearchView q={view.q || ''} providers={providers} trending={trending} hide={hide} onBack={back} go={go} Cell={Cell} onDrawer={() => setDrawer(true)} />;
  } else if (view.v === 'profile') {
    const p = bySlug.get(view.a || '');
    body = p ? <Profile key={p.s} p={p} statics={items.filter((i) => i.handle === p.s)} toItem={toItem} Post={Post} Head={Head} following={!!fol[p.id]} onFollow={() => follow(p)} go={go} /> : <><Head title="Profile" /><Empty t="This account doesn’t exist" s="Try searching for another." /></>;
  } else if (view.v === 'port') {
    body = <PortView slug={view.a || ''} providers={providers} Head={Head} Cell={Cell} go={go} />;
  } else if (view.v === 'post') {
    body = <Thread key={view.a} pid={view.a || ''} me={me} toItem={toItem} Post={Post} Head={Head} needLogin={needLogin} onReply={(pid) => bump(pid, 'replies', 1)} />;
  } else if (view.v === 'notifs') {
    body = <Notifs me={me} Head={Head} go={go} onRead={() => setUnread(0)} />;
  } else if (view.v === 'chat') {
    body = (<>
      <Head title="Chat" />
      <Empty t="Messages are coming soon" s="Soon you can message ship agents, chandlers and service companies directly here. For now, open a company and use WhatsApp, email or call." cta={<button className="x-btn ac" onClick={() => go({ v: 'find' })}>Find a company</button>} />
    </>);
  } else if (view.v === 'saved') {
    const saved = feed.filter((i) => loc.b[i.id]);
    body = (<><Head title="Bookmarks" />{saved.length ? saved.map((i) => <Post key={i.id} i={i} />) : <Empty t="Save posts for later" s="Bookmark posts to easily find them again in the future." />}</>);
  } else if (view.v === 'tools') {
    body = (<><Head title="Voyage tools" sub="Free calculators and checklists" />
      {TOOLS.map(([g, rows]) => (<section key={g}><h2 className="x-h2">{g}</h2>{rows.map(([href, e, t, d]) => <a key={href} className="x-prow" href={href.startsWith('/') ? href : `/voyage/${href}`}><span className="x-pin">{e}</span><span><b>{t}</b><small>{d}</small></span></a>)}</section>))}
      <div className="x-endpad" /></>);
  } else if (view.v === 'request') {
    body = <RequestView initial={view.q || ''} onClose={back} onPublished={loadFeed} />;
  } else if (view.v === 'login') {
    body = <Login onDone={async (name) => { await ensure(name); back(); say('Welcome to PortServiceFinder'); }} onClose={back} />;
  } else if (view.v === 'compose') {
    body = me && me.kind === 'operator' ? <><Head title="Post" /><Empty t="Posting is for company accounts" s="Agents, chandlers and service companies share news here. As an operator you can get quotes, reply, like and follow." cta={<button className="x-btn ac" onClick={() => go({ v: 'request' })}>Get quotes</button>} /></> : me ? <Compose me={me} onClose={back} onPosted={(d) => { setDb((xs) => [d, ...xs]); go({ v: 'home' }); say('Your post was sent'); }} /> : <Login onDone={async (name) => { await ensure(name); }} onClose={back} note="Log in or join to post updates." />;
  } else if (view.v === 'settings') {
    body = me ? <Settings me={me} theme={theme} toggleTheme={toggleTheme} Head={Head} go={go} signOut={signOut} /> : <Login onDone={async (name) => { await ensure(name); }} onClose={back} />;
  } else if (view.v === 'edit') {
    body = me ? <EditProfile me={me} onClose={back} onSaved={(p) => { setMe(p); back(); say('Profile saved'); }} /> : <Login onDone={async (name) => { await ensure(name); }} onClose={back} />;
  } else if (view.v === 'u') {
    body = <UserView handle={view.a || ''} me={me} Head={Head} go={go} byId={byId} />;
  } else if (view.v === 'me') {
    body = me && me.provider_id && byId.get(me.provider_id)
      ? <Profile p={byId.get(me.provider_id)!} statics={[]} toItem={toItem} Post={Post} Head={Head} following={false} onFollow={() => {}} go={go} mine />
      : me ? <UserView handle={me.handle || ''} me={me} Head={Head} go={go} byId={byId} /> : <Login onDone={async (name) => { await ensure(name); }} onClose={back} />;
  }

  const isCo = me?.kind === 'provider';
  const primary = () => go({ v: isCo ? 'compose' : 'request' });
  const NAV: [View['v'], string, string][] = [['home', 'home', 'Home'], ['search', 'search', 'Explore'], ['find', 'anchor', 'Find a service'], ['notifs', 'bell', 'Notifications'], ['chat', 'chat', 'Chat'], ['saved', 'bookmark', 'Bookmarks'], ['tools', 'tool', 'Voyage tools'], ['me', 'user', 'Profile']];
  const meHandle = me ? (me.provider_id ? byId.get(me.provider_id)?.s : '') || me.name : '';
  return (
    <div className="xapp">
      <aside className="x-left">
        <button className="x-logo" onClick={() => go({ v: 'home' })} aria-label="Home"><LogoMark size={32} /></button>
        {NAV.map(([v, d, l]) => <button key={v} className={'x-nav' + (view.v === v ? ' on' : '')} onClick={() => go({ v })}><span className="x-ni"><Ico d={d} s={26} w={view.v === v ? 2.4 : 1.8} />{v === 'notifs' && unread > 0 && <i className="x-dot">{unread > 9 ? '9+' : unread}</i>}</span><span>{l}</span></button>)}
        <button className="x-nav" onClick={toggleTheme}><Ico d="bulb" s={26} /><span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span></button>
        <button className="x-big" onClick={primary}><span>{isCo ? 'Post' : 'Get quotes'}</span><Ico d="plus" s={24} w={2.4} /></button>
        {me ? (
          <button className="x-acct" onClick={signOut} title="Log out"><Av name={me.name} handle={meHandle} /><span><b>{me.name}</b><small>{me.kind === 'provider' ? 'Company' : 'Operator'} · Log out</small></span></button>
        ) : (
          <button className="x-acct" onClick={() => go({ v: 'login' })}><span className="x-av" style={{ width: 40, height: 40, background: '#536471' }}><Ico d="user" s={20} /></span><span><b>Log in or join</b><small>Free for everyone</small></span></button>
        )}
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
        <p className="x-foot"><a href="/about">About</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><span>{listed.toLocaleString('en-US')} companies · +{joined} this month</span></p>
      </aside>

      {(view.v === 'home' || view.v === 'search' || view.v === 'find' || view.v === 'profile' || view.v === 'port') && (
        <button className={'x-fab' + (hide ? ' dim' : '')} onClick={primary} aria-label={isCo ? 'Post' : 'Get quotes'}><Ico d="plus" s={26} w={2.2} /></button>
      )}
      {!['request', 'compose', 'login'].includes(view.v) && (
        <nav className={'x-bot' + (hide ? ' hid' : '')} aria-label="Main">
          {([['home', 'home', 'Home'], ['search', 'search', 'Search'], ['find', 'anchor', 'Find a service'], ['notifs', 'bell', 'Notifications'], ['chat', 'chat', 'Chat']] as [View['v'], string, string][]).map(([v, d, l]) => (
            <button key={v} className={view.v === v ? 'on' : ''} onClick={() => (v === 'home' && view.v === 'home' ? window.scrollTo({ top: 0, behavior: 'smooth' }) : go({ v }))} aria-label={l}>
              <span className="x-ni"><Ico d={d} s={26} w={view.v === v ? 2.5 : 2} fill={view.v === v && (v === 'home' || v === 'notifs' || v === 'chat')} />{v === 'notifs' && unread > 0 && <i className="x-dot">{unread > 9 ? '9+' : unread}</i>}</span>
            </button>
          ))}
        </nav>
      )}

      {drawer && (
        <div className="x-dw" onClick={() => setDrawer(false)}>
          <div className="x-dwp" onClick={(e) => e.stopPropagation()}>
            {me ? <Av name={me.name} handle={meHandle} /> : <span className="x-av" style={{ width: 40, height: 40, background: '#536471' }}><Ico d="user" s={20} /></span>}
            <b className="x-dwn">{me ? me.name : 'Guest'}</b><span className="x-mu">{me ? '@' + (me.handle || '') : 'Not logged in'}</span>
            <div className="x-dwc"><b>{Object.keys(fol).length}</b> Following</div>
            {!me && <button className="x-btn full" style={{ marginTop: 0, marginBottom: 6 }} onClick={() => go({ v: 'login' })}>Log in or join</button>}
            <button className="x-dwi" onClick={() => go({ v: 'me' })}><Ico d="user" />Profile</button>
            <button className="x-dwi" onClick={() => go({ v: 'find' })}><Ico d="anchor" />Find a service</button>
            <button className="x-dwi" onClick={() => go({ v: 'request' })}><Ico d="mail" />Get quotes</button>
            <button className="x-dwi" onClick={() => go({ v: 'saved' })}><Ico d="bookmark" />Bookmarks</button>
            <button className="x-dwi" onClick={() => go({ v: 'tools' })}><Ico d="tool" />Voyage tools</button>
            <a className="x-dwi" href="/blog"><Ico d="book" />Guides</a>
            {(!me || me.kind === 'operator') && <a className="x-dwi" href="/for-providers/signup"><Ico d="biz" />List your company</a>}
            <hr />
            <button className="x-dwi sm" onClick={() => go({ v: me ? 'settings' : 'login' })}><Ico d="gear" s={20} />Settings and privacy</button>
            <a className="x-dwi sm" href="/contact"><Ico d="help" s={20} />Help Center</a>
            {me && <button className="x-dwi sm" onClick={signOut}><Ico d="back" s={20} />Log out</button>}
            <button className="x-bulb" onClick={toggleTheme} aria-label="Switch theme"><Ico d="bulb" s={24} /></button>
          </div>
        </div>
      )}
      {toast && <div className="x-toast">{toast}</div>}
      <style>{CSS}</style>
    </div>
  );
}

/* ---------- auth ---------- */
function Login({ onDone, onClose, note }: { onDone: (name?: string) => Promise<void>; onClose: () => void; note?: string }) {
  const [mode, setMode] = useState<'login' | 'join'>('join');
  const [role, setRole] = useState<'' | 'operator'>('');
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const submit = async () => {
    setErr('');
    if (!/\S+@\S+\.\S+/.test(email)) return setErr('Enter a valid email.');
    if (pw.length < 8) return setErr('Password must be at least 8 characters.');
    if (mode === 'join' && name.trim().length < 2) return setErr('Enter your name or company.');
    setBusy(true);
    try {
      if (mode === 'login') {
        const { error } = await supabaseBrowser.auth.signInWithPassword({ email: email.trim(), password: pw });
        if (error) throw error;
        await onDone();
      } else {
        const { data, error } = await supabaseBrowser.auth.signUp({ email: email.trim(), password: pw });
        if (error) throw error;
        if (!data.session) { setErr('Check your email to confirm your account, then log in.'); setBusy(false); return; }
        await onDone(name.trim());
      }
    } catch (e) { setErr(plain(e)); }
    setBusy(false);
  };
  return (
    <div className="x-cmp">
      <div className="x-bar sp"><button className="x-ib" onClick={onClose} aria-label="Close"><Ico d="close" s={20} w={2} /></button><LogoMark size={28} /><span style={{ width: 28 }} /></div>
      <div className="x-auth">
        <h1>{mode === 'login' ? 'Log in to PortServiceFinder' : 'Join PortServiceFinder'}</h1>
        {note && <p className="x-mu">{note}</p>}
        {mode === 'join' && !role ? (<>
          <p className="x-mu">Free for everyone. Who are you?</p>
          <button className="x-role" onClick={() => setRole('operator')}><span>🚢</span><span><b>Ship operator, owner or crew</b><small>Find services, follow companies, comment</small></span></button>
          <a className="x-role" href="/for-providers/signup"><span>⚓</span><span><b>Service company</b><small>Agent, chandler or marine service: list your company free</small></span></a>
        </>) : (<>
          {mode === 'join' && <input className="x-in" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name or company" autoComplete="name" />}
          <input className="x-in" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" autoComplete="email" />
          <input className="x-in" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password (8+ characters)" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} onKeyDown={(e) => e.key === 'Enter' && submit()} />
          {err && <p className="x-err">{err}</p>}
          <button className="x-btn full" disabled={busy} onClick={submit}>{busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}</button>
          {mode === 'login' && <a className="x-hint" href="/for-providers/login">Forgot password?</a>}
        </>)}
        <p className="x-swap">{mode === 'login' ? <>Don’t have an account? <button onClick={() => { setMode('join'); setRole(''); setErr(''); }}>Join</button></> : <>Already have an account? <button onClick={() => { setMode('login'); setErr(''); }}>Log in</button></>}</p>
      </div>
    </div>
  );
}

/* ---------- compose ---------- */
async function shrink(file: File): Promise<Blob> {
  const img = await createImageBitmap(file);
  const k = Math.min(1, 1080 / Math.max(img.width, img.height));
  const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
  for (const q of [0.75, 0.6, 0.45]) {
    const b = await new Promise<Blob | null>((r) => c.toBlob(r, 'image/webp', q));
    if (b && b.size < 380000) return b.type === 'image/webp' ? b : new Blob([b], { type: 'image/jpeg' });
  }
  const j = await new Promise<Blob | null>((r) => c.toBlob(r, 'image/jpeg', 0.5));
  if (!j) throw new Error('Could not read this image');
  return j;
}
function Compose({ me, onClose, onPosted }: { me: Me; onClose: () => void; onPosted: (d: DbPost) => void }) {
  const max = me.gold ? 600 : 160;
  const [text, setText] = useState('');
  const [img, setImg] = useState<{ blob: Blob; url: string } | null>(null);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const left = max - text.length;
  const hasLink = !me.gold && LINK_RE.test(text);
  const ok = text.trim().length > 0 && left >= 0 && !hasLink && !busy;
  const pick = async (f?: File) => { if (!f) return; setErr(''); try { const b = await shrink(f); setImg({ blob: b, url: URL.createObjectURL(b) }); } catch (e) { setErr(plain(e)); } };
  const send = async () => {
    if (!ok) return; setBusy(true); setErr('');
    try {
      let image_url: string | null = null;
      if (img) {
        const path = `${me.user_id}/${Date.now()}.${img.blob.type === 'image/webp' ? 'webp' : 'jpg'}`;
        const up = await supabaseBrowser.storage.from('x-media').upload(path, img.blob, { contentType: img.blob.type, upsert: false });
        if (up.error) throw up.error;
        image_url = supabaseBrowser.storage.from('x-media').getPublicUrl(path).data.publicUrl;
      }
      const { data, error } = await supabaseBrowser.from('x_posts').insert({ user_id: me.user_id, body: text.trim(), image_url }).select(POST_COLS).single();
      if (error) throw error;
      onPosted(data as unknown as DbPost);
    } catch (e) { setErr(plain(e)); }
    setBusy(false);
  };
  const pct = Math.min(1, text.length / max);
  return (
    <div className="x-cmp">
      <div className="x-bar sp"><button className="x-tl" onClick={onClose}>Cancel</button><button className="x-btn ac sm" disabled={!ok} onClick={send}>{busy ? 'Posting…' : 'Post'}</button></div>
      <div className="x-cbody">
        <Av name={me.name} handle={me.name} />
        <div className="x-cf">
          <textarea autoFocus value={text} onChange={(e) => setText(e.target.value.slice(0, max + 20))} placeholder={me.kind === 'provider' ? 'Share news from your port: a delivery done, a new service, a special offer ⚓' : 'What’s happening in port?'} rows={5} />
          {img && <div className="x-prev"><img src={img.url} alt="" /><button onClick={() => setImg(null)} aria-label="Remove image"><Ico d="close" s={16} w={2.6} /></button></div>}
          {hasLink && <p className="x-err">Links are available with the gold badge (coming soon).</p>}
          {err && <p className="x-err">{err}</p>}
          <div className="x-ctool">
            <label className="x-ib" aria-label="Add a photo"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><circle cx="9" cy="10" r="1.8" /><path d="M20.5 16l-5-5-8.5 8.5" /></svg><input type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} /></label>
            <span className={'x-cnt' + (left < 0 ? ' over' : left <= 20 ? ' warn' : '')}>
              <svg width="26" height="26" viewBox="0 0 26 26"><circle cx="13" cy="13" r="10" fill="none" stroke="var(--ln)" strokeWidth="2.5" /><circle cx="13" cy="13" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray={`${pct * 62.8} 62.8`} transform="rotate(-90 13 13)" /></svg>
              {left <= 20 && <em>{left}</em>}
            </span>
          </div>
          <p className="x-mu sm">{me.gold ? 'Gold: up to 600 characters and links.' : 'Up to 160 characters, one photo. Gold badge (coming soon): 600 characters and links.'}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------- thread ---------- */
type DbComment = { id: string; body: string; created_at: string; user_id: string; x_profiles: { name: string; kind: string; provider_id: string | null } | null };
function Thread({ pid, me, toItem, Post, Head, needLogin, onReply }: { pid: string; me: Me | null; toItem: (d: DbPost) => FeedItem; Post: (x: { i: FeedItem; big?: boolean }) => React.ReactNode; Head: (x: { title?: string; sub?: string; tabs?: React.ReactNode }) => React.ReactNode; needLogin: () => void; onReply: (pid: string) => void }) {
  const [post, setPost] = useState<DbPost | null | undefined>(undefined);
  const [cs, setCs] = useState<DbComment[]>([]);
  const [text, setText] = useState(''); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  useEffect(() => {
    supabaseBrowser.from('x_posts').select(POST_COLS).eq('id', pid).maybeSingle().then(({ data }) => setPost((data as unknown as DbPost) || null));
    supabaseBrowser.from('x_comments').select('id,body,created_at,user_id,x_profiles!x_comments_user_id_fkey(name,kind,provider_id)').eq('post_id', pid).order('created_at').limit(200).then(({ data }) => setCs((data as unknown as DbComment[]) || []));
  }, [pid]);
  const send = async () => {
    if (!me) return needLogin();
    const t = text.trim(); if (!t || t.length > 100 || busy) return;
    setBusy(true); setErr('');
    const { data, error } = await supabaseBrowser.from('x_comments').insert({ post_id: pid, user_id: me.user_id, body: t }).select('id,body,created_at,user_id,x_profiles!x_comments_user_id_fkey(name,kind,provider_id)').single();
    if (error) setErr(plain(error)); else { setCs((x) => [...x, data as unknown as DbComment]); setText(''); onReply(pid); setPost((p) => (p ? { ...p, replies: p.replies + 1 } : p)); }
    setBusy(false);
  };
  if (post === undefined) return <><Head title="Post" /><div className="x-load" /></>;
  if (!post) return <><Head title="Post" /><div className="x-empty"><h2>This post was deleted</h2></div></>;
  return (<>
    <Head title="Post" />
    <Post i={toItem(post)} big />
    <div className="x-reply">
      {me ? <Av name={me.name} handle={me.name} size={36} /> : <span className="x-av" style={{ width: 36, height: 36, background: '#536471' }}><Ico d="user" s={18} /></span>}
      <input value={text} maxLength={100} onFocus={() => !me && needLogin()} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Post your reply" />
      <span className="x-mu sm">{100 - text.length}</span>
      <button className="x-btn ac sm" disabled={!text.trim() || busy} onClick={send}>Reply</button>
    </div>
    {err && <p className="x-err" style={{ padding: '0 16px' }}>{err}</p>}
    {cs.map((c) => (
      <div key={c.id} className="x-post">
        <div className="x-pl"><Av name={c.x_profiles?.name || 'Member'} handle={c.x_profiles?.name || 'm'} /></div>
        <div className="x-pr"><div className="x-hd"><b>{c.x_profiles?.name || 'Member'}</b><span>{c.x_profiles?.kind === 'provider' ? 'Company' : 'Operator'}</span><span>·</span><span>{ago(c.created_at)}</span></div><div className="x-tx">{c.body}</div></div>
      </div>
    ))}
    <div className="x-endpad" />
  </>);
}

/* ---------- notifications ---------- */
type DbNotif = { id: string; kind: string; actor: string; post_id: string | null; read: boolean; created_at: string };
function Notifs({ me, Head, go, onRead }: { me: Me | null; Head: (x: { title?: string; sub?: string; tabs?: React.ReactNode }) => React.ReactNode; go: (v: View) => void; onRead: () => void }) {
  const [list, setList] = useState<DbNotif[] | null>(null);
  useEffect(() => {
    if (!me) return;
    supabaseBrowser.from('x_notifications').select('id,kind,actor,post_id,read,created_at').eq('user_id', me.user_id).order('created_at', { ascending: false }).limit(60).then(({ data }) => {
      setList((data as DbNotif[]) || []);
      if ((data || []).some((n: DbNotif) => !n.read)) supabaseBrowser.from('x_notifications').update({ read: true }).eq('user_id', me.user_id).eq('read', false).then(() => onRead());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.user_id]);
  const TXT: Record<string, [string, string, string]> = { like: ['heart', '#f91880', 'liked your post'], repost: ['repost', '#00ba7c', 'reposted your post'], reply: ['reply', '#1d9bf0', 'replied to your post'], follow: ['user', '#d6a838', 'followed your company'] };
  return (<>
    <Head title="Notifications" />
    {!me ? <div className="x-empty"><h2>Nothing to see here — yet</h2><p>Log in to see likes, replies and new followers.</p><button className="x-btn" onClick={() => go({ v: 'login' })}>Log in or join</button></div>
      : list === null ? <div className="x-load" />
      : !list.length ? <div className="x-empty"><h2>Nothing to see here — yet</h2><p>Likes, replies and new followers will show up here.</p></div>
      : list.map((n) => { const t = TXT[n.kind] || ['bell', '#71767b', n.kind]; return (
        <div key={n.id} className={'x-ntf' + (n.read ? '' : ' new')} onClick={() => n.post_id && go({ v: 'post', a: n.post_id })}>
          <span style={{ color: t[1] }}><Ico d={t[0]} s={26} fill={n.kind === 'like'} /></span>
          <div><Av name={n.actor} handle={n.actor} size={32} /><p><b>{n.actor}</b> {t[2]}</p><small className="x-mu">{ago(n.created_at)}</small></div>
        </div>); })}
    <div className="x-endpad" />
  </>);
}

/* ---------- voyage tools ---------- */
const TOOLS: [string, [string, string, string, string][]][] = [
  ['Voyage & commercial', [
    ['distance', '🧭', 'Sea distance', 'Port to port distance and days at sea'],
    ['laytime', '⏱️', 'Laytime calculator', 'Demurrage and despatch'],
    ['tce', '💵', 'TCE calculator', 'Time charter equivalent per day'],
    ['hire', '📄', 'Hire calculator', 'Charter hire and off-hire'],
    ['bunker-prices', '⛽', 'Bunker prices', 'VLSFO, MGO and HSFO by port'],
    ['bunker', '🛢️', 'Bunker calculator', 'Consumption and cost'],
    ['bunker-plan', '🗺️', 'Bunker planning', 'Where and how much to stem'],
    ['cii', '🌱', 'CII calculator', 'Carbon intensity rating'],
    ['indices', '📈', 'Freight indices', 'Market overview'],
  ]],
  ['Port call', [
    ['disbursement', '🧾', 'Port disbursement (DA)', 'Estimate port costs'],
    ['congestion', '🚢', 'Port congestion', 'Waiting times'],
    ['holidays', '📅', 'Port holidays', 'Public holidays by country'],
    ['visa', '🛂', 'Crew visa', 'Visa rules for crew'],
    ['psc', '🛡️', 'PSC checklist', 'Prepare for port state control'],
    ['/psc-detentions', '📊', 'PSC detentions by port', 'U.S. data and PSC regimes worldwide'],
    ['weather', '🌦️', 'Marine weather', 'Wind and sea forecast'],
    ['tide', '🌊', 'Tide times', 'High and low water'],
  ]],
  ['On board', [
    ['noon', '📝', 'Noon report', 'Daily position report'],
    ['draft', '📏', 'Draft survey', 'Cargo quantity by draft'],
    ['stability', '⚖️', 'Stability', 'GM and stability checks'],
    ['lashing', '🔗', 'Lashing', 'Cargo securing'],
    ['maintenance', '🔧', 'Maintenance', 'Planned maintenance'],
    ['drills', '🚨', 'Drills', 'Drill schedule'],
    ['marpol', '♻️', 'MARPOL', 'Discharge rules'],
    ['mlc', '👷', 'MLC', 'Rest hours and crew rules'],
    ['wages', '💰', 'Crew wages', 'Wage calculator'],
  ]],
];

/* ---------- find (country → port → category → search) ---------- */
const COUNTRIES = Object.keys(PORT_DATA).sort((a, b) => a.localeCompare(b));
const CATS: [string, string, string, string][] = [['agent', '🧭', 'Ship agent', 'Port agency, husbandry, clearance'], ['chandler', '📦', 'Ship chandler', 'Provisions, stores, spares'], ['marine', '🔧', 'Marine services', 'Repairs, bunker, diving, surveys and more']];
function FindView({ providers, go, Cell }: { providers: XProvider[]; trending?: [string, number][]; go: (v: View) => void; Cell: (x: { p: XProvider }) => React.ReactNode }) {
  const [country, setCountry] = useState('');
  const [port, setPort] = useState('');
  const [cat, setCat] = useState('');
  const [svc, setSvc] = useState('');
  const [open, setOpen] = useState<'' | 'country' | 'port' | 'cat'>('country');
  const [q, setQ] = useState('');
  const [done, setDone] = useState(false);
  const top = useRef<HTMLDivElement>(null);
  useEffect(() => { try { const s = JSON.parse(sessionStorage.getItem('psfx_find2') || '{}'); if (s.country) { setCountry(s.country); setPort(s.port || ''); setCat(s.cat || ''); setSvc(s.svc || ''); setDone(!!s.done); setOpen(s.done ? '' : s.port ? 'cat' : 'port'); } } catch {} }, []);
  useEffect(() => { try { sessionStorage.setItem('psfx_find2', JSON.stringify({ country, port, cat, svc, done })); } catch {} }, [country, port, cat, svc, done]);
  const count = useMemo(() => { const m = new Map<string, number>(); for (const p of providers) for (const s of p.p) m.set(s, (m.get(s) || 0) + 1); return m; }, [providers]);
  const cCount = useMemo(() => { const m = new Map<string, number>(); for (const p of providers) m.set(p.c, (m.get(p.c) || 0) + 1); return m; }, [providers]);
  const nq = norm(q);
  const countries = COUNTRIES.filter((c) => !nq || norm(c).includes(nq));
  const ports = ALL_PORTS.filter((p) => p.country === country && (!nq || norm(p.name).includes(nq))).sort((a, b) => a.name.localeCompare(b.name));
  const portRef = port ? portBySlug(port) : null;
  const key = cat === 'marine' ? svc : cat;
  const results = useMemo(() => {
    if (!done || !country) return [];
    return providers.filter((p) => (port ? p.p.includes(port) : p.c === country) && (!key ? (cat === 'marine' ? p.t === 'service' : true) : offers(p, key))).sort((a, b) => Number(b.cl) - Number(a.cl) || a.n.localeCompare(b.n));
  }, [providers, country, port, cat, key, done]);
  const toTop = () => requestAnimationFrame(() => top.current?.scrollIntoView({ block: 'start' }));
  const pick = (k: typeof open) => { setOpen(open === k ? '' : k); setQ(''); setDone(false); };
  const catLabel = cat === 'marine' ? (svc ? svcLabel(svc) : 'Marine services') : cat ? svcLabel(cat) : '';
  const ready = !!country && !!cat && (cat !== 'marine' || !!svc);
  const Step = ({ k, n, icon, label, value, disabled }: { k: typeof open; n: number; icon: string; label: string; value: string; disabled?: boolean }) => (
    <button className={'x-step' + (open === k ? ' on' : '') + (value ? ' set' : '')} disabled={disabled} onClick={() => pick(k)}>
      <span className="x-sn">{value ? '✓' : n}</span><span className="x-se">{icon}</span>
      <span className="x-sl"><small>{label}</small><b>{value || 'Choose'}</b></span><Ico d="chev" s={18} />
    </button>
  );
  return (<div className="x-find" ref={top}>
    <div className="x-fhd"><h2>Find a service in any port</h2><p>Choose a country, a port and what you need. Then search.</p></div>
    <Step k="country" n={1} icon="🌍" label="Country" value={country ? `${FLAG[country] || ''} ${country}` : ''} />
    {open === 'country' && (<div className="x-pick">
      <label className="x-sin"><Ico d="search" s={17} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${COUNTRIES.length} countries`} /></label>
      <div className="x-list">{countries.map((c) => <button key={c} onClick={() => { setCountry(c); setPort(''); setDone(false); setOpen('port'); setQ(''); toTop(); }}><span>{FLAG[c] || '🏳️'} {c}</span><small>{cCount.get(c) || ''}</small></button>)}
        {!countries.length && <p className="x-hint">No country matches “{q}”.</p>}</div>
    </div>)}
    <Step k="port" n={2} icon="📍" label="Port" value={portRef ? portRef.name : country && open !== 'port' && open !== 'country' ? `All ports in ${country}` : ''} disabled={!country} />
    {open === 'port' && country && (<div className="x-pick">
      {ports.length > 8 && <label className="x-sin"><Ico d="search" s={17} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ports in ${country}`} /></label>}
      <div className="x-list"><button onClick={() => { setPort(''); setOpen('cat'); setQ(''); toTop(); }}><span>All ports in {country}</span><small>{cCount.get(country) || ''}</small></button>
        {ports.map((p) => <button key={p.slug} onClick={() => { setPort(p.slug); setOpen('cat'); setQ(''); toTop(); }}><span>{p.name}</span><small>{count.get(p.slug) || ''}</small></button>)}</div>
    </div>)}
    <Step k="cat" n={3} icon="🧰" label="What do you need?" value={catLabel} disabled={!country} />
    {open === 'cat' && country && (<div className="x-pick">
      <div className="x-cats">{CATS.map(([k, e, l, d]) => <button key={k} className={cat === k ? 'on' : ''} onClick={() => { setCat(k); if (k !== 'marine') { setSvc(''); setOpen(''); } }}><span>{e}</span><b>{l}</b><small>{d}</small></button>)}</div>
      {cat === 'marine' && (<>
        <div className="x-lbl" style={{ padding: '8px 12px 6px' }}>Choose a marine service</div>
        <div className="x-list">{MARINE_SERVICES.map((m) => <button key={m.key} className={svc === m.key ? 'on' : ''} onClick={() => { setSvc(m.key); setOpen(''); }}><span>{EMO[m.key] || '🔧'} {m.label}</span>{svc === m.key && <small>✓</small>}</button>)}</div>
      </>)}
    </div>)}
    <div style={{ padding: '14px 16px 4px' }}><button className="x-btn ac full" style={{ marginTop: 0 }} disabled={!ready} onClick={() => { setDone(true); setOpen(''); }}><Ico d="search" s={18} w={2.4} />&nbsp; Search</button></div>
    {done && ready && (<>
      <div className="x-reqbar"><span>{results.length} {results.length === 1 ? 'company' : 'companies'} · {catLabel} · {portRef ? portRef.name : country}</span>
        {results.length > 0 && <button className="x-btn sm" onClick={() => go({ v: 'request', q: `${key || ''}|${port}|${country}` })}>Get quotes</button>}</div>
      {results.slice(0, 80).map((p) => <Cell key={p.s} p={p} />)}
      {!results.length && (
        <div className="x-empty">
          <h2>No company listed yet</h2>
          <p>Send a free quote request. It goes to the companies we know {portRef ? `in ${portRef.name}` : `in ${country}`} and is posted on the feed so more companies can reply.</p>
          <button className="x-btn ac" onClick={() => go({ v: 'request', q: `${key || ''}|${port}|${country}` })}>Get quotes</button>
        </div>
      )}
      <button className="x-hint" onClick={() => { setCountry(''); setPort(''); setCat(''); setSvc(''); setDone(false); setOpen('country'); toTop(); }}>↺ New search</button>
    </>)}
    <div className="x-endpad" />
  </div>);
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

/* ---------- profile (company) ---------- */
function useScrolled(px: number) {
  const [s, setS] = useState(false);
  useEffect(() => { const f = () => setS(window.scrollY > px); f(); window.addEventListener('scroll', f, { passive: true }); return () => window.removeEventListener('scroll', f); }, [px]);
  return s;
}
function ProfileTop({ title, sub, onBack }: { title: string; sub: string; onBack: () => void }) {
  const solid = useScrolled(110);
  return (
    <div className={'x-phd' + (solid ? ' on' : '')}>
      <button className="x-circ" onClick={onBack} aria-label="Back"><Ico d="back" s={19} w={2.2} /></button>
      <div className="x-phd-t"><b>{title}</b><small>{sub}</small></div>
    </div>
  );
}
function Profile({ p, statics, toItem, Post, following, onFollow, go, mine }: { p: XProvider; statics: FeedItem[]; toItem: (d: DbPost) => FeedItem; Post: (x: { i: FeedItem }) => React.ReactNode; Head?: unknown; following: boolean; onFollow: () => void; go: (v: View) => void; mine?: boolean }) {
  const [t, setT] = useState<'posts' | 'about'>('posts');
  const [dbp, setDbp] = useState<DbPost[]>([]);
  const [followers, setFollowers] = useState<number | null>(null);
  const [contact, setContact] = useState(false);
  useEffect(() => {
    supabaseBrowser.from('x_posts').select('id,body,image_url,likes,replies,reposts,created_at,user_id,x_profiles!x_posts_user_id_fkey!inner(name,kind,provider_id,gold)').eq('x_profiles.provider_id', p.id).order('created_at', { ascending: false }).limit(50).then(({ data }) => setDbp((data as unknown as DbPost[]) || []));
    supabaseBrowser.from('x_follows').select('user_id', { count: 'exact', head: true }).eq('provider_id', p.id).then(({ count }) => setFollowers(count || 0));
  }, [p.id]);
  const posts = [...dbp.map(toItem), ...statics].sort((a, b) => b.at.localeCompare(a.at));
  const ports = p.p.map((s) => portBySlug(s)).filter(Boolean) as PortRef[];
  const wa = p.wa.replace(/[^0-9]/g, '');
  const web = p.w ? (p.w.startsWith('http') ? p.w : 'https://' + p.w) : '';
  const back = () => (history.length > 1 ? history.back() : go({ v: 'home' }));
  const share = () => { const u = location.origin + '/providers/' + p.s; try { if (navigator.share) navigator.share({ url: u, title: p.n }); else navigator.clipboard.writeText(u); } catch {} };
  return (<>
    <ProfileTop title={p.n} sub={`${posts.length} posts`} onBack={back} />
    <div className="x-ban" style={{ background: `linear-gradient(135deg, ${hue(p.s)}, #0d1b4a)` }} />
    <div className="x-pf">
      <div className="x-pfr">
        <span className="x-pfav"><Av name={p.n} handle={p.s} size={80} /></span>
        <div className="x-row r">
          {mine ? (<>
            <button className="x-btn ol" onClick={share}>Share profile</button>
            <button className="x-btn ol" onClick={() => go({ v: 'edit' })}>Edit profile</button>
          </>) : (<>
            {(wa || p.em || p.ph) && <button className="x-btn ol" onClick={() => setContact(true)}>Message</button>}
            <button className={'x-btn' + (following ? ' ol' : '')} onClick={onFollow}>{following ? 'Following' : 'Follow'}</button>
          </>)}
        </div>
      </div>
      <h1 className="x-pfn">{p.n}</h1>
      <div className="x-mu">@{p.s}</div>
      {p.b && <p className="x-pfb">{p.b}</p>}
      <div className="x-pfm">
        <span><Ico d="biz" s={17} />{p.tl}</span>
        <span><Ico d="pin" s={17} />Based in {p.c} {p.f}</span>
        {web && <a href={web} target="_blank" rel="noopener nofollow"><Ico d="link" s={17} />{p.w.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').slice(0, 28)}</a>}
        {p.cl && <span><Ico d="cal" s={17} />Joined {new Date(p.j).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>}
      </div>
      <div className="x-ff"><span><b>{ports.length}</b> Ports</span><span><b>{followers === null ? '–' : followers}</b> Followers</span></div>
      {!mine && <button className="x-btn ac full" onClick={() => go({ v: 'request', q: `${p.t === 'service' ? p.sv[0] || '' : p.t}|${p.p[0] || ''}` })}>Request a quote</button>}
      {!p.cl && <p className="x-claim">Listed from public information. <a href={`/claim/${p.s}`}>Is this your company? Claim it free</a></p>}
    </div>
    <nav className="x-tabs"><button className={t === 'posts' ? 'on' : ''} onClick={() => setT('posts')}><span>Posts</span></button><button className={t === 'about' ? 'on' : ''} onClick={() => setT('about')}><span>About</span></button></nav>
    {t === 'posts' ? (posts.length ? posts.map((i) => <Post key={i.id} i={i} />) : <div className="x-empty"><h2>No posts yet</h2><p>When they post, it will show up here.</p></div>) : (
      <div className="x-about">
        <h3>Ports</h3><div className="x-tags">{ports.map((x) => <button key={x.slug} onClick={() => go({ v: 'port', a: x.slug })}>📍 {x.name}</button>)}</div>
        {p.sv.length > 0 && (<><h3>Services</h3><div className="x-tags">{p.sv.map((k) => <span key={k}>{EMO[k] || '🔧'} {svcLabel(k)}</span>)}</div></>)}
        <h3>Based in</h3><p>{p.f} {p.c}</p>
        <a className="x-hint" href={`/providers/${p.s}`}>Full company page →</a>
      </div>
    )}
    {contact && (
      <div className="x-sheet" onClick={() => setContact(false)}>
        <div onClick={(e) => e.stopPropagation()}>
          <b>Contact {p.n}</b>
          {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener"><Ico d="chat" s={22} />WhatsApp</a>}
          {p.em && <a href={`mailto:${p.em}`}><Ico d="mail" s={22} />Email</a>}
          {p.ph && <a href={`tel:${p.ph.replace(/\s/g, '')}`}><Ico d="phone" s={22} />Call</a>}
          <button className="x-btn ol full" onClick={() => setContact(false)}>Cancel</button>
        </div>
      </div>
    )}
    <div className="x-endpad" />
  </>);
}

/* ---------- user profile (any account, by @username) ---------- */
type PubProfile = { user_id: string; kind: string; name: string; provider_id: string | null; handle: string | null; bio: string | null; country: string | null; created_at: string };
type MyReply = { id: string; body: string; created_at: string; post_id: string };
function UserView({ handle, me, go, byId }: { handle: string; me: Me | null; Head?: unknown; go: (v: View) => void; byId: Map<string, XProvider> }) {
  const [u, setU] = useState<PubProfile | null | undefined>(undefined);
  const [replies, setReplies] = useState<MyReply[]>([]);
  const [following, setFollowing] = useState(0);
  useEffect(() => {
    if (!handle) { setU(null); return; }
    supabaseBrowser.from('x_profiles').select('user_id,kind,name,provider_id,handle,bio,country,created_at').ilike('handle', handle).maybeSingle().then(({ data }) => {
      const pr = data as PubProfile | null; setU(pr);
      if (!pr) return;
      const comp = pr.provider_id ? byId.get(pr.provider_id) : undefined;
      if (comp) { go({ v: 'profile', a: comp.s }); return; }
      supabaseBrowser.from('x_comments').select('id,body,created_at,post_id').eq('user_id', pr.user_id).order('created_at', { ascending: false }).limit(50).then(({ data: d }) => setReplies((d as MyReply[]) || []));
      supabaseBrowser.from('x_follows').select('provider_id', { count: 'exact', head: true }).eq('user_id', pr.user_id).then(({ count }) => setFollowing(count || 0));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle]);
  const back = () => (history.length > 1 ? history.back() : go({ v: 'home' }));
  if (u === undefined) return <><ProfileTop title="Profile" sub="" onBack={back} /><div style={{ height: 60 }} /><div className="x-load" /></>;
  if (!u) return <><ProfileTop title="Profile" sub="" onBack={back} /><div style={{ height: 60 }} /><div className="x-empty"><h2>This account doesn’t exist</h2><p>Try searching for another.</p></div></>;
  const mine = me?.user_id === u.user_id;
  const flag = u.country ? FLAG[u.country] || '' : '';
  return (<>
    <ProfileTop title={u.name} sub={`${replies.length} replies`} onBack={back} />
    <div className="x-ban" style={{ background: `linear-gradient(135deg, ${hue(u.handle || u.name)}, #0d1b4a)` }} />
    <div className="x-pf">
      <div className="x-pfr">
        <span className="x-pfav"><Av name={u.name} handle={u.handle || u.name} size={80} /></span>
        {mine && <div className="x-row r"><button className="x-btn ol" onClick={() => go({ v: 'settings' })}>Settings</button><button className="x-btn ol" onClick={() => go({ v: 'edit' })}>Edit profile</button></div>}
      </div>
      <h1 className="x-pfn">{u.name}</h1>
      <div className="x-mu">@{u.handle}</div>
      {u.bio && <p className="x-pfb">{u.bio}</p>}
      <div className="x-pfm">
        <span><Ico d="user" s={17} />{u.kind === 'provider' ? 'Company' : 'Operator'}</span>
        {u.country && <span><Ico d="pin" s={17} />Based in {u.country} {flag}</span>}
        <span><Ico d="cal" s={17} />Joined {new Date(u.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
      </div>
      <div className="x-ff"><span><b>{following}</b> Following</span></div>
    </div>
    <nav className="x-tabs"><button className="on"><span>Replies</span></button></nav>
    {replies.length ? replies.map((r) => (
      <div key={r.id} className="x-post" onClick={() => go({ v: 'post', a: r.post_id })}>
        <div className="x-pl"><Av name={u.name} handle={u.handle || u.name} /></div>
        <div className="x-pr"><div className="x-hd"><b>{u.name}</b><span>@{u.handle}</span><span>·</span><span>{ago(r.created_at)}</span></div><div className="x-tx">{r.body}</div></div>
      </div>
    )) : <div className="x-empty"><h2>No replies yet</h2><p>{mine ? 'Reply to company posts and it will show up here.' : 'Replies will show up here.'}</p></div>}
    <div className="x-endpad" />
  </>);
}

/* ---------- edit profile ---------- */
function EditProfile({ me, onClose, onSaved }: { me: Me; onClose: () => void; onSaved: (p: Me) => void }) {
  const [name, setName] = useState(me.name);
  const [bio, setBio] = useState(me.bio || '');
  const [country, setCountry] = useState(me.country || '');
  const [handle, setHandle] = useState(me.handle || '');
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const next = me.handle_changed_at ? new Date(Date.parse(me.handle_changed_at) + 30 * 864e5) : null;
  const locked = !!next && next.getTime() > Date.now();
  const save = async () => {
    setBusy(true); setErr('');
    try {
      const a = await supabaseBrowser.rpc('x_update_profile', { p_name: name, p_bio: bio, p_country: country });
      if (a.error) throw a.error;
      let p = a.data as Me;
      if (handle.trim().toLowerCase() !== (me.handle || '').toLowerCase()) {
        const b = await supabaseBrowser.rpc('x_set_handle', { p_handle: handle });
        if (b.error) throw b.error;
        p = b.data as Me;
      }
      onSaved(p);
    } catch (e) { setErr(plain(e)); }
    setBusy(false);
  };
  return (
    <div className="x-cmp">
      <div className="x-bar sp"><button className="x-tl" onClick={onClose}>Cancel</button><b style={{ fontSize: 17 }}>Edit profile</b><button className="x-tl b" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save'}</button></div>
      <div className="x-ban sm" style={{ background: `linear-gradient(135deg, ${hue(me.handle || me.name)}, #0d1b4a)` }} />
      <div className="x-pf"><span className="x-pfav"><Av name={name || me.name} handle={me.handle || me.name} size={72} /></span></div>
      <div className="x-form">
        <label><span>Name</span><input value={name} maxLength={80} onChange={(e) => setName(e.target.value)} /></label>
        <label><span>Username</span><div className="x-at"><em>@</em><input value={handle} maxLength={15} disabled={locked} onChange={(e) => setHandle(e.target.value.replace(/[^A-Za-z0-9_]/g, ''))} /></div>
          <small>{locked ? `You can change your username again on ${next!.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.` : 'You can change your username once every 30 days. Your name can be changed any time.'}</small></label>
        <label><span>Bio</span><textarea value={bio} maxLength={160} rows={3} onChange={(e) => setBio(e.target.value)} /><small>{160 - bio.length} characters left</small></label>
        {me.kind === 'operator' ? (
          <label><span>Location</span><select value={country} onChange={(e) => setCountry(e.target.value)}><option value="">Add your country</option>{COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
        ) : (
          <a className="x-frow" href="/for-providers/dashboard"><span><b>Company details</b><small>Ports, services, phone, WhatsApp, website</small></span><Ico d="chev" s={18} /></a>
        )}
        {err && <p className="x-err">{err}</p>}
      </div>
    </div>
  );
}

/* ---------- settings ---------- */
function Settings({ me, theme, toggleTheme, Head, go, signOut }: { me: Me; theme: string; toggleTheme: () => void; Head: (x: { title?: string; sub?: string; tabs?: React.ReactNode }) => React.ReactNode; go: (v: View) => void; signOut: () => void }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState(''); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { supabaseBrowser.auth.getUser().then(({ data }) => setEmail(data.user?.email || '')); }, []);
  const changePw = async () => {
    if (pw.length < 8) return setMsg('Password must be at least 8 characters.');
    setBusy(true); const { error } = await supabaseBrowser.auth.updateUser({ password: pw }); setBusy(false);
    setMsg(error ? plain(error) : 'Password updated.'); if (!error) setPw('');
  };
  const classic = () => { try { localStorage.removeItem('psfx_on'); } catch {} location.href = '/'; };
  return (<>
    <Head title="Settings and privacy" sub={'@' + (me.handle || '')} />
    <h2 className="x-h2">Your account</h2>
    <div className="x-set"><span><b>Email</b><small>{email || '…'} · never shown publicly</small></span></div>
    <button className="x-set" onClick={() => go({ v: 'edit' })}><span><b>Username</b><small>@{me.handle} · change once every 30 days</small></span><Ico d="chev" s={18} /></button>
    <button className="x-set" onClick={() => go({ v: 'edit' })}><span><b>Name and bio</b><small>{me.name}</small></span><Ico d="chev" s={18} /></button>
    {me.kind === 'provider' && <a className="x-set" href="/for-providers/dashboard"><span><b>Company details</b><small>Ports, services and contacts on your listing</small></span><Ico d="chev" s={18} /></a>}
    <div className="x-set col">
      <b>Change password</b>
      <div className="x-row" style={{ justifyContent: 'flex-start', width: '100%' }}><input className="x-in" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password (8+ characters)" style={{ flex: 1, minWidth: 0 }} /><button className="x-btn" disabled={busy} onClick={changePw}>Save</button></div>
      {msg && <small>{msg}</small>}
    </div>
    <div className="x-set"><span><b>Stay logged in</b><small>You stay logged in on this device until you log out. Your browser can also save your email and password.</small></span></div>
    <h2 className="x-h2">Display</h2>
    <button className="x-set" onClick={toggleTheme}><span><b>Dark mode</b><small>{theme === 'dark' ? 'On' : 'Off'}</small></span><span className={'x-sw' + (theme === 'dark' ? ' on' : '')}><i /></span></button>
    <h2 className="x-h2">More</h2>
    <a className="x-set" href="/contact"><span><b>Help Center</b><small>Contact the PortServiceFinder team</small></span><Ico d="chev" s={18} /></a>
    <a className="x-set" href="/privacy"><span><b>Privacy policy</b></span><Ico d="chev" s={18} /></a>
    <button className="x-set" onClick={classic}><span><b>Use the classic website</b><small>Switch back to the old design on this device</small></span><Ico d="chev" s={18} /></button>
    <button className="x-set red" onClick={signOut}><span><b>Log out</b></span></button>
    <div className="x-endpad" />
  </>);
}

/* ---------- request (compose) ---------- */
function RequestView({ initial, onClose, onPublished }: { initial: string; onClose: () => void; onPublished?: () => void }) {
  const [svc0, port0, country0] = initial.split('|');
  const [pub, setPub] = useState(true);
  const [svc, setSvc] = useState(svc0 || '');
  const [port, setPort] = useState<PortRef | null>(port0 ? portBySlug(port0) : null);
  const [pq, setPq] = useState('');
  const [text, setText] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [phone, setPhone] = useState(''); const [vessel, setVessel] = useState('');
  const [busy, setBusy] = useState(false); const [done, setDone] = useState<number | null>(null); const [err, setErr] = useState('');
  const inCountry = useMemo(() => (country0 ? ALL_PORTS.filter((p) => p.country === country0) : []), [country0]);
  const hits = useMemo(() => { const n = norm(pq); if (inCountry.length && n.length < 2) return inCountry.slice(0, 40); return n.length < 2 ? [] : (inCountry.length ? inCountry : ALL_PORTS).filter((p) => norm(p.name).includes(n)).slice(0, 12); }, [pq, inCountry]);
  const ok = !!(svc && port && text.trim().length >= 5 && name.trim() && /\S+@\S+\.\S+/.test(email));
  const send = async () => {
    if (!ok || !port || busy) return;
    setBusy(true); setErr('');
    try {
      const r = await submitRfq({ country: port.country, port: port.name, serviceType: svc, vesselType: vessel, eta: '', requirementDetails: text.trim(), urgency: urgent ? 'urgent' : 'standard', operatorName: name.trim(), operatorEmail: email.trim(), operatorPhone: phone.trim() });
      if (r.ok) {
        if (pub && r.rfqId) { const p = await supabaseBrowser.rpc('x_publish_request', { p_rfq: r.rfqId }); if (!p.error) onPublished?.(); }
        setDone(r.distributedCount);
      } else setErr('Could not send. Please try again.');
    } catch { setErr('Could not send. Please try again.'); }
    setBusy(false);
  };
  if (done !== null) return (
    <div className="x-cmp">
      <div className="x-bar"><button className="x-ib" onClick={onClose} aria-label="Close"><Ico d="close" s={20} w={2} /></button></div>
      <div className="x-empty"><h2>Request sent ✅</h2><p>{done > 0 ? `${done} ${done === 1 ? 'company' : 'companies'} in ${port?.name} got your request. Quotes come to ${email}.` : `We received it and will pass it to companies in ${port?.name}. Quotes come to ${email}.`}{pub ? ' It is also on the feed, so more companies can see it and reply.' : ''}</p><button className="x-btn" onClick={onClose}>Done</button></div>
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
            <div><input className="x-in" value={pq} onChange={(e) => setPq(e.target.value)} placeholder={country0 ? `Type a port in ${country0}` : 'Type a port name'} />{hits.map((p) => <button key={p.slug} className="x-opt" onClick={() => { setPort(p); setPq(''); }}>{p.flag} {p.name} <small>{p.country}</small></button>)}</div>
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
          <label className="x-urg"><input type="checkbox" checked={pub} onChange={(e) => setPub(e.target.checked)} /> 📣 Also post it on the feed so more companies can reply</label>
          <p className="x-mu sm">Your request goes to matching companies in that port and they reply to your email. On the feed we show only the port, service, vessel type and your text: your name, email and phone stay private.</p>
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
.x-go{margin-left:auto;color:var(--mu)}
.x-find{padding-bottom:8px}
.x-fhd{padding:16px 16px 8px}.x-fhd h2{font-size:23px;line-height:28px;font-weight:800}.x-fhd p{color:var(--mu);margin-top:4px}
.x-step{display:flex!important;align-items:center;gap:12px;width:calc(100% - 32px);margin:8px 16px 0;padding:12px 14px!important;border:1px solid var(--ln)!important;border-radius:16px;color:var(--fg)}
.x-step:disabled{opacity:.45;cursor:default}.x-step.on{border-color:var(--acb)!important;box-shadow:0 0 0 1px var(--acb)}
.x-step svg{color:var(--mu);transition:transform .2s}.x-step.on svg{transform:rotate(90deg)}
.x-sn{width:24px;height:24px;border-radius:50%;background:var(--ch);display:grid;place-items:center;font-size:13px;font-weight:700;flex:none}.x-step.set .x-sn{background:#00ba7c;color:#fff}
.x-se{font-size:22px}.x-sl{flex:1;min-width:0}.x-sl small{display:block;color:var(--mu);font-size:13px;line-height:16px}.x-sl b{display:block;font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.x-pick{margin:0 16px;border:1px solid var(--ln);border-top:0;border-radius:0 0 16px 16px;padding:12px 0 4px}
.x-pick>.x-sin{margin:0 12px 8px}
.x-pick .x-grid{padding:0 12px 8px}
.x-grid button.on{background:var(--fg)!important;color:var(--bg)!important}
.x-tags.pad{padding:0 12px 8px}
.x-list{}
.x-list button.on{font-weight:700}
.x-cats{display:flex;flex-direction:column;gap:8px;padding:0 12px 8px}
.x-cats button{display:grid!important;grid-template-columns:36px 1fr;column-gap:10px;align-items:center;border:1px solid var(--ln)!important;border-radius:14px;padding:12px!important}
.x-cats button span{grid-row:span 2;font-size:26px}.x-cats button small{color:var(--mu);font-size:13px}.x-cats button.on{border-color:var(--acb)!important;box-shadow:0 0 0 1px var(--acb)}
.x-rq{margin-top:10px;border:1px solid var(--ln);border-radius:16px;padding:12px;display:flex;flex-direction:column;gap:10px;align-items:flex-start}
.x-rqm{display:flex;flex-wrap:wrap;gap:6px 12px;color:var(--mu);font-size:14px}
.x-list button{display:flex!important;justify-content:space-between;width:100%;padding:12px 16px!important;font-size:16px}.x-list button:hover{background:var(--hv)}.x-list small{color:var(--mu)}

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
.x-err{color:#f4212e;font-size:14px}
.x-phd{position:sticky;top:0;z-index:30;height:53px;margin-bottom:-53px;display:flex;align-items:center;gap:20px;padding:0 12px;transition:background .2s}
.x-phd.on{background:var(--hd);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--ln)}
.x-phd-t{min-width:0;opacity:0;transition:opacity .2s}.x-phd.on .x-phd-t{opacity:1}.x-phd-t b{display:block;font-size:17px;line-height:20px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.x-phd-t small{color:var(--mu);font-size:13px}
.x-circ{width:34px;height:34px;flex:none;border-radius:50%;background:rgba(15,20,25,.6)!important;color:#fff!important;display:grid!important;place-items:center}
.x-phd.on .x-circ{background:transparent!important;color:var(--fg)!important}
.x-ban.sm{height:110px}
.x-ff{display:flex;gap:18px}
.x-sheet{position:fixed;inset:0;background:var(--ov);z-index:85;display:flex;align-items:flex-end;justify-content:center;animation:xf .2s}
.x-sheet>div{width:100%;max-width:600px;background:var(--bg);border-radius:16px 16px 0 0;padding:18px 18px calc(18px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:4px}
.x-sheet b{font-size:19px;margin-bottom:8px}.x-sheet a{display:flex;align-items:center;gap:16px;padding:14px 4px;font-size:17px;font-weight:600}
.x-form{padding:4px 16px 24px;display:flex;flex-direction:column;gap:18px}
.x-form label{display:flex;flex-direction:column;gap:6px;border-bottom:1px solid var(--ln);padding-bottom:10px}
.x-form label>span{font-weight:700;font-size:15px}
.x-form input,.x-form textarea,.x-form select{background:none;border:0;outline:0;color:var(--fg);font:inherit;font-size:17px;padding:2px 0;resize:none;width:100%}
.x-form select{appearance:none}.x-form select option{color:#0f1419}
.x-form small{color:var(--mu);font-size:13px}
.x-form input:disabled{opacity:.55}
.x-at{display:flex;align-items:center;gap:2px}.x-at em{font-style:normal;color:var(--mu);font-size:17px}
.x-frow{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--ln);padding-bottom:10px}.x-frow b,.x-frow small{display:block}.x-frow small{color:var(--mu);font-size:13px}
.x-tl.b{font-weight:700}.x-tl:disabled{opacity:.5}
.x-set{display:flex!important;justify-content:space-between;align-items:center;gap:12px;width:100%;padding:14px 16px!important;border-bottom:1px solid var(--ln)!important}
.x-set:hover{background:var(--hv)}.x-set b,.x-set small{display:block}.x-set small{color:var(--mu);font-size:13px;line-height:17px;margin-top:2px}
.x-set.col{flex-direction:column;align-items:flex-start}.x-set.red b{color:#f4212e}
.x-sw{width:44px;height:26px;border-radius:99px;background:var(--ch);position:relative;flex:none;transition:background .2s}.x-sw i{position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:left .2s}
.x-sw.on{background:var(--acb)}.x-sw.on i{left:21px}

.x-ni{position:relative;display:inline-flex}
.x-dot{position:absolute;top:-5px;right:-8px;min-width:18px;height:18px;padding:0 5px;border-radius:99px;background:var(--acb);color:#0d1b4a;font-size:11px;font-style:normal;font-weight:700;line-height:18px;text-align:center;border:2px solid var(--bg)}
.x-ib.r{margin-left:0;margin-right:-8px}
.x-me .x-av{font-size:12px!important}
.x-img{display:block;width:100%;max-height:510px;object-fit:cover;border-radius:16px;border:1px solid var(--ln);margin-top:12px}
.x-post.big{cursor:default}.x-post.big .x-tx{font-size:17px;line-height:24px}
.x-ff{margin-top:12px;color:var(--mu)}.x-ff b{color:var(--fg)}
.x-prev{position:relative;margin-top:8px}.x-prev img{width:100%;border-radius:16px;display:block}.x-prev button{position:absolute;top:8px;left:8px;width:30px;height:30px;border-radius:50%;background:rgba(15,20,25,.75)!important;color:#fff!important;display:grid!important;place-items:center}
.x-ctool{display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--ln);padding-top:8px;color:var(--acb)}
.x-ctool .x-ib{margin-left:-8px;cursor:pointer}
.x-cnt{position:relative;display:grid;place-items:center;color:var(--acb)}.x-cnt.warn{color:#ffd400}.x-cnt.over{color:#f4212e}.x-cnt em{position:absolute;font-style:normal;font-size:11px;color:var(--mu)}
.x-reply{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--ln)}
.x-reply input{flex:1;min-width:0;background:none;border:0;outline:0;color:var(--fg);font-size:17px}
.x-ntf{display:flex;gap:12px;padding:12px 16px;border-bottom:1px solid var(--ln);cursor:pointer}.x-ntf.new{background:var(--hv)}.x-ntf>span{width:40px;display:flex;justify-content:flex-end;flex:none}.x-ntf p{margin-top:8px}
.x-load{height:3px;margin:20px 16px;border-radius:3px;background:linear-gradient(90deg,var(--ln),var(--acb),var(--ln));background-size:200% 100%;animation:xl 1s linear infinite}@keyframes xl{to{background-position:-200% 0}}
.x-auth{max-width:420px;margin:0 auto;padding:16px 24px;display:flex;flex-direction:column;gap:12px}
.x-auth h1{font-size:28px;line-height:34px;font-weight:800;margin:8px 0 4px}
.x-role{display:flex!important;gap:14px;align-items:center;border:1px solid var(--ln)!important;border-radius:16px;padding:16px!important}.x-role:hover{background:var(--hv)}.x-role>span:first-child{font-size:28px}.x-role b,.x-role small{display:block}.x-role small{color:var(--mu);font-size:14px;margin-top:2px}
.x-swap{color:var(--mu);margin-top:12px}.x-swap button{color:var(--ac)!important;font-weight:600}
.x-pfr{flex-wrap:wrap}
@media (max-width:360px){.x-cir{width:32px;height:32px}.x-row.r{gap:6px}.x-btn{padding:0 12px!important}.x-grid button{font-size:13px;padding:10px!important}}

@media (max-width:1265px){.x-left{width:88px;align-items:center}.x-nav>span:not(.x-ni),.x-acct span:nth-child(2){display:none}.x-big{width:52px;height:52px}.x-big span{display:none}.x-big svg{display:block}.x-acct{width:auto}}
@media (max-width:1000px){.x-right{display:none}}
@media (max-width:600px){
  .x-left{display:none}.x-main{border:0}
  .x-bar.m{display:flex}.sm-only{display:grid!important}
  .x-top.hid{transform:translateY(-54px)}
  .x-fab{display:grid!important;place-items:center;position:fixed;right:16px;bottom:calc(70px + env(safe-area-inset-bottom));width:56px;height:56px;border-radius:50%;background:var(--acb)!important;color:#0d1b4a!important;box-shadow:var(--sh);z-index:40;transition:opacity .2s}
  .x-fab.dim{opacity:.6}
  .x-bot.hid{transform:translateY(100%)}
  .x-bot{display:flex!important;justify-content:space-around;position:fixed;left:0;right:0;bottom:0;height:calc(53px + env(safe-area-inset-bottom));padding-bottom:env(safe-area-inset-bottom);background:var(--bg);border-top:1px solid var(--ln);z-index:40;transition:transform .2s ease}
  .x-bot button{flex:1;display:grid!important;place-items:center;color:var(--fg)!important}
  .x-empty h2{font-size:26px;line-height:32px}
  .x-pfr .x-btn{padding:0 14px!important}
}
`;
