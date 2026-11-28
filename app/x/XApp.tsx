'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LogoMark } from '@/components/Logo';

export type FeedItem = { id: string; kind: 'member' | 'guide' | 'data'; at: string; author: string; handle: string; initials: string; text: string; sub?: string; href: string; cta: string; tag: string };
type Follow = { name: string; slug: string; sub: string; initials: string };

const I = {
  home: 'M12 3l9 7.5V21h-6v-6H9v6H3V10.5z',
  search: 'M10.5 3a7.5 7.5 0 015.9 12.1l4.8 4.8-1.4 1.4-4.8-4.8A7.5 7.5 0 1110.5 3zm0 2a5.5 5.5 0 100 11 5.5 5.5 0 000-11z',
  anchor: 'M12 2a3 3 0 011 5.8V10h3v2h-3v7.9A7 7 0 0019 13h-2l3-4 3 4h-2a9 9 0 01-18 0H1l3-4 3 4H5a7 7 0 006 6.9V12H8v-2h3V7.8A3 3 0 0112 2zm0 2a1 1 0 100 2 1 1 0 000-2z',
  bell: 'M12 2a6 6 0 016 6v4l2 3v1H4v-1l2-3V8a6 6 0 016-6zm-2 16h4a2 2 0 01-4 0z',
  mail: 'M3 5h18v14H3zm2 2v.5l7 4.5 7-4.5V7zm14 3l-7 4.5L5 10v7h14z',
  user: 'M12 3a4.5 4.5 0 110 9 4.5 4.5 0 010-9zm0 11c5 0 8 2.5 8 6v1H4v-1c0-3.5 3-6 8-6z',
  port: 'M4 20h16v2H4zm2-2V9l6-5 6 5v9h-4v-5h-4v5z',
  book: 'M5 3h11a3 3 0 013 3v15H7a2 2 0 01-2-2zm2 2v12h10V6a1 1 0 00-1-1z',
  shield: 'M12 2l8 3v6c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V5z',
  gear: 'M12 8a4 4 0 110 8 4 4 0 010-8zm-1-6h2l.5 3 2 .9 2.5-1.8 1.4 1.4-1.8 2.5.9 2 3 .5v2l-3 .5-.9 2 1.8 2.5-1.4 1.4-2.5-1.8-2 .9-.5 3h-2l-.5-3-2-.9-2.5 1.8-1.4-1.4 1.8-2.5-.9-2-3-.5v-2l3-.5.9-2L4.1 5.5l1.4-1.4L8 5.9l2-.9z',
  help: 'M12 2a10 10 0 110 20 10 10 0 010-20zm0 14a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4zM12 6a3.5 3.5 0 00-3.5 3.5h2A1.5 1.5 0 1112 11c-.8 0-1 .7-1 1.5V14h2v-1.2A3.5 3.5 0 0012 6z',
  reply: 'M4 4h16v12H8l-4 4z',
  repost: 'M7 7h10l-3-3 1.4-1.4L21 8l-5.6 5.4L14 12l3-3H7v4H5V9a2 2 0 012-2zm10 10H7l3 3-1.4 1.4L3 16l5.6-5.4L10 12l-3 3h10v-4h2v4a2 2 0 01-2 2z',
  heart: 'M12 21l-1.4-1.3C5.4 15 2 12 2 8.3 2 5.3 4.3 3 7.3 3c1.7 0 3.3.8 4.7 2.1C13.4 3.8 15 3 16.7 3 19.7 3 22 5.3 22 8.3c0 3.7-3.4 6.7-8.6 11.4z',
  share: 'M12 3l5 5-1.4 1.4L13 6.8V16h-2V6.8L8.4 9.4 7 8zM4 14h2v5h12v-5h2v7H4z',
  plus: 'M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7z',
};
const Ico = ({ d, s = 24 }: { d: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true"><path d={d} fill="currentColor" /></svg>;

function ago(iso: string) {
  const d = Math.max(0, Date.now() - Date.parse(iso)); const h = 3600_000;
  if (d < h) return Math.max(1, Math.floor(d / 60000)) + 'm';
  if (d < 24 * h) return Math.floor(d / h) + 'h';
  if (d < 7 * 24 * h) return Math.floor(d / (24 * h)) + 'd';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const NAV: [string, string, string][] = [['Home', I.home, '/x'], ['Explore', I.search, '/providers'], ['Requests', I.anchor, '/request-quote'], ['Notifications', I.bell, '#'], ['Messages', I.mail, '#'], ['Ports', I.port, '/ports'], ['Guides', I.book, '/blog'], ['Profile', I.user, '/for-providers/login']];
const DRAWER: [string, string, string][] = [['Profile', I.user, '/for-providers/login'], ['My company page', I.port, '/for-providers/login'], ['Requests', I.anchor, '/requests'], ['Guides', I.book, '/blog'], ['PSC detentions', I.shield, '/psc-detentions'], ['Voyage tools', I.gear, '/voyage'], ['For providers', I.plus, '/for-providers/signup']];

export function XApp({ items, follow, trending, listed, joined }: { items: FeedItem[]; follow: Follow[]; trending: [string, string, number][]; listed: number; joined: number }) {
  const [tab, setTab] = useState<'for' | 'follow' | 'ports'>('for');
  const [drawer, setDrawer] = useState(false);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [rep, setRep] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState('');
  useEffect(() => { try { setLiked(JSON.parse(localStorage.getItem('psfx_l') || '{}')); setRep(JSON.parse(localStorage.getItem('psfx_r') || '{}')); } catch {} }, []);
  const save = (k: string, v: Record<string, boolean>) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const say = (t: string) => { setToast(t); setTimeout(() => setToast(''), 1800); };
  const list = tab === 'for' ? items : tab === 'follow' ? items.filter((i) => i.kind === 'member') : items.filter((i) => i.kind !== 'member');

  return (
    <div className="xapp">
      <aside className="x-left">
        <Link href="/x" className="x-logo" aria-label="PortServiceFinder home"><LogoMark size={34} /></Link>
        {NAV.map(([n, d, h]) => (
          <Link key={n} href={h} className={'x-nav' + (n === 'Home' ? ' on' : '')} onClick={(e) => { if (h === '#') { e.preventDefault(); say(n + ' is coming soon'); } }}><Ico d={d} s={26} /><span>{n}</span></Link>
        ))}
        <Link href="/for-providers/signup" className="x-post">List your company</Link>
      </aside>

      <main className="x-main">
        <header className="x-top">
          <div className="x-mbar">
            <button className="x-av" onClick={() => setDrawer(true)} aria-label="Open menu">PS</button>
            <LogoMark size={28} />
            <span style={{ width: 32 }} />
          </div>
          <nav className="x-tabs">
            {([['for', 'For you'], ['follow', 'New members'], ['ports', 'Ports & data']] as const).map(([k, l]) => (
              <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}><span>{l}</span></button>
            ))}
          </nav>
        </header>

        <section className="x-hero">
          <div><b>{listed.toLocaleString('en-US')}</b> companies listed · <b className="g">+{joined}</b> joined in 30 days</div>
          <Link href="/request-quote" className="x-ask">Need an agent or supplies? Get quotes →</Link>
        </section>

        {list.map((i) => (
          <article key={i.id} className="x-item">
            <div className={'x-pic k-' + i.kind}>{i.initials}</div>
            <div className="x-body">
              <div className="x-meta"><b>{i.author}</b> <span>@{i.handle.slice(0, 18)} · {ago(i.at)}</span></div>
              <Link href={i.href} className="x-text">{i.text}</Link>
              {i.sub && <Link href={i.href} className="x-card"><small>{i.tag}</small><span>{i.sub}</span></Link>}
              {!i.sub && <Link href={i.href} className="x-tag">#{i.tag.replace(/\s+/g, '')} · {i.cta} →</Link>}
              <div className="x-acts">
                <Link href={i.href} aria-label="Reply"><Ico d={I.reply} s={18} /></Link>
                <button className={rep[i.id] ? 'rp' : ''} onClick={() => { const n = { ...rep, [i.id]: !rep[i.id] }; setRep(n); save('psfx_r', n); }} aria-label="Repost"><Ico d={I.repost} s={18} />{rep[i.id] ? 1 : ''}</button>
                <button className={liked[i.id] ? 'lk' : ''} onClick={() => { const n = { ...liked, [i.id]: !liked[i.id] }; setLiked(n); save('psfx_l', n); }} aria-label="Like"><Ico d={I.heart} s={18} />{liked[i.id] ? 1 : ''}</button>
                <button onClick={() => { const u = location.origin + i.href; try { (navigator as Navigator).share ? navigator.share({ url: u }) : navigator.clipboard.writeText(u); } catch {} say('Link ready to share'); }} aria-label="Share"><Ico d={I.share} s={18} /></button>
              </div>
            </div>
          </article>
        ))}
        <div className="x-end">You are all caught up · <Link href="/ports">Browse 1,200+ ports</Link></div>
      </main>

      <aside className="x-right">
        <form action="/providers" className="x-search"><Ico d={I.search} s={18} /><input name="q" placeholder="Search ports and companies" /></form>
        <div className="x-box">
          <h3>Ports operators search</h3>
          {trending.map(([n, s, c]) => <Link key={s} href={`/ports/${s}`} className="x-tr"><small>Last 90 days</small><b>{n}</b><small>{c} searches</small></Link>)}
        </div>
        <div className="x-box">
          <h3>New on PortServiceFinder</h3>
          {follow.map((f) => <Link key={f.slug} href={`/providers/${f.slug}`} className="x-fl"><span className="x-pic k-member sm">{f.initials}</span><span><b>{f.name}</b><small>{f.sub}</small></span><em>View</em></Link>)}
        </div>
        <p className="x-foot"><Link href="/about">About</Link> · <Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link> · <Link href="/psc-detentions">PSC data</Link></p>
      </aside>

      <Link href="/for-providers/signup" className="x-fab" aria-label="List your company"><Ico d={I.plus} s={26} /></Link>

      <nav className="x-bottom" aria-label="Main">
        <Link href="/x" className="on" aria-label="Home"><Ico d={I.home} /></Link>
        <Link href="/providers" aria-label="Search"><Ico d={I.search} /></Link>
        <Link href="/request-quote" className="mid" aria-label="Get quotes"><Ico d={I.anchor} /></Link>
        <a href="#" onClick={(e) => { e.preventDefault(); say('Notifications are coming soon'); }} aria-label="Notifications"><Ico d={I.bell} /></a>
        <a href="#" onClick={(e) => { e.preventDefault(); say('Messages are coming soon'); }} aria-label="Messages"><Ico d={I.mail} /></a>
      </nav>

      {drawer && (
        <div className="x-dw" onClick={() => setDrawer(false)}>
          <div className="x-dwp" onClick={(e) => e.stopPropagation()}>
            <div className="x-av lg">PS</div>
            <b className="x-dwn">Guest</b><small className="x-dwh">Log in to follow ports and companies</small>
            <div className="x-dwc"><b>0</b> Following <b>0</b> Followers</div>
            {DRAWER.map(([n, d, h]) => <Link key={n} href={h} className="x-dwi" onClick={() => setDrawer(false)}><Ico d={d} />{n}</Link>)}
            <hr /><Link href="/for-providers/login" className="x-dwi sm"><Ico d={I.gear} s={20} />Settings and privacy</Link>
            <Link href="/contact" className="x-dwi sm"><Ico d={I.help} s={20} />Help center</Link>
          </div>
        </div>
      )}
      {toast && <div className="x-toast">{toast}</div>}

      <style>{`
        body:has(.xapp) .bn,body:has(.xapp) .bn-space,body:has(.xapp) .mf-launch{display:none!important}
        .xapp{--b:#2a3550;--m:#8b98a5;--g:#d6b25e;display:flex;justify-content:center;min-height:100vh;background:#060b16;color:#e7e9ea;font-family:var(--font-ui,system-ui)}
        .xapp a{color:inherit;text-decoration:none}
        .x-left{position:sticky;top:0;height:100vh;width:250px;padding:8px 12px;display:flex;flex-direction:column;gap:2px}
        .x-logo{padding:10px;width:fit-content;border-radius:99px}
        .x-nav{display:flex;align-items:center;gap:18px;padding:12px;border-radius:99px;font-size:19px;width:fit-content}
        .x-nav:hover{background:#ffffff14}.x-nav.on{font-weight:800}
        .x-post{margin-top:14px;background:var(--g);color:#0d1030!important;font-weight:800;text-align:center;padding:14px;border-radius:99px;font-size:16px}
        .x-main{width:600px;max-width:100%;border-left:1px solid var(--b);border-right:1px solid var(--b);min-height:100vh}
        .x-top{position:sticky;top:0;z-index:5;background:#060b16cc;backdrop-filter:blur(12px);border-bottom:1px solid var(--b)}
        .x-mbar{display:none;align-items:center;justify-content:space-between;padding:8px 14px}
        .x-av{width:32px;height:32px;border-radius:50%;background:#16224a;color:var(--g);border:1px solid var(--g);font-weight:800;font-size:12px;display:grid;place-items:center;cursor:pointer}
        .x-av.lg{width:44px;height:44px;font-size:15px}
        .x-tabs{display:flex}.x-tabs button{flex:1;background:none;border:0;color:var(--m);padding:16px 0 0;font-size:15px;font-weight:600;cursor:pointer}
        .x-tabs button span{display:inline-block;padding-bottom:12px;border-bottom:4px solid transparent}.x-tabs button.on{color:#e7e9ea;font-weight:800}.x-tabs button.on span{border-color:var(--g)}
        .x-hero{padding:12px 16px;border-bottom:1px solid var(--b);font-size:14px;color:var(--m);display:flex;flex-direction:column;gap:8px}
        .x-hero b{color:#e7e9ea}.x-hero .g{color:#3ecf8e}.x-ask{color:var(--g)!important;font-weight:700}
        .x-item{display:flex;gap:12px;padding:12px 16px;border-bottom:1px solid var(--b)}.x-item:hover{background:#ffffff06}
        .x-pic{flex:none;width:42px;height:42px;border-radius:50%;display:grid;place-items:center;font-weight:800;font-size:13px;background:#16224a;color:var(--g)}
        .x-pic.k-guide{background:var(--g);color:#0d1030}.x-pic.k-data{background:#0f3d3a;color:#7ee0d0;font-size:11px}.x-pic.sm{width:38px;height:38px;font-size:12px}
        .x-body{min-width:0;flex:1}.x-meta{font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.x-meta span{color:var(--m)}
        .x-text{display:block;font-size:15px;line-height:1.4;margin:2px 0 8px;overflow-wrap:anywhere}
        .x-card{display:block;border:1px solid var(--b);border-radius:16px;padding:12px;font-size:14px;color:var(--m)!important;line-height:1.4}.x-card small{display:block;color:var(--g);font-weight:700;margin-bottom:4px}
        .x-tag{color:var(--g)!important;font-size:14px}
        .x-acts{display:flex;justify-content:space-between;max-width:420px;margin-top:10px;color:var(--m)}
        .x-acts a,.x-acts button{display:flex;align-items:center;gap:6px;background:none;border:0;color:inherit;font-size:13px;cursor:pointer;padding:4px}
        .x-acts .lk{color:#f91880}.x-acts .rp{color:#00ba7c}
        .x-end{padding:30px 16px 120px;text-align:center;color:var(--m);font-size:14px}.x-end a{color:var(--g)}
        .x-right{position:sticky;top:0;height:100vh;width:350px;padding:8px 20px;display:flex;flex-direction:column;gap:14px;overflow-y:auto}
        .x-search{display:flex;align-items:center;gap:10px;background:#16181c;border-radius:99px;padding:10px 16px;color:var(--m)}
        .x-search input{background:none;border:0;outline:0;color:#e7e9ea;font-size:15px;width:100%}
        .x-box{border:1px solid var(--b);border-radius:16px;padding:12px 0}.x-box h3{margin:0 16px 8px;font-size:20px}
        .x-tr{display:flex;flex-direction:column;padding:8px 16px}.x-tr:hover,.x-fl:hover{background:#ffffff08}.x-tr small{color:var(--m);font-size:13px}
        .x-fl{display:flex;align-items:center;gap:10px;padding:8px 16px}.x-fl>span:nth-child(2){flex:1;min-width:0}.x-fl b,.x-fl small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.x-fl small{color:var(--m)}
        .x-fl em{font-style:normal;background:#e7e9ea;color:#0f1419;font-weight:800;font-size:13px;padding:6px 14px;border-radius:99px}
        .x-foot{color:var(--m);font-size:13px;padding:0 4px}
        .x-fab{display:none}.x-bottom{display:none}
        .x-dw{position:fixed;inset:0;background:#5b708366;z-index:50}.x-dwp{position:absolute;left:0;top:0;bottom:0;width:min(300px,82vw);background:#060b16;padding:18px;overflow-y:auto;display:flex;flex-direction:column}
        .x-dwn{margin-top:10px;font-size:17px}.x-dwh{color:var(--m)}.x-dwc{color:var(--m);font-size:14px;margin:10px 0 14px}.x-dwc b{color:#e7e9ea}
        .x-dwi{display:flex;align-items:center;gap:18px;font-size:19px;font-weight:700;padding:13px 0}.x-dwi.sm{font-size:15px;font-weight:600}.x-dwp hr{border:0;border-top:1px solid var(--b);width:100%;margin:8px 0}
        .x-toast{position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:var(--g);color:#0d1030;font-weight:700;padding:10px 16px;border-radius:8px;z-index:60}
        @media (max-width:1080px){.x-right{display:none}.x-left{width:88px;align-items:center}.x-nav span{display:none}.x-post{font-size:0;width:52px;height:52px;padding:0}.x-post::after{content:'+';font-size:26px}}
        @media (max-width:640px){
          .x-left{display:none}.x-main{border:0}.x-mbar{display:flex}
          .x-fab{display:grid;place-items:center;position:fixed;right:16px;bottom:76px;width:56px;height:56px;border-radius:50%;background:var(--g);color:#0d1030!important;box-shadow:0 4px 14px #0008;z-index:20}
          .x-bottom{display:flex;justify-content:space-around;align-items:center;position:fixed;left:0;right:0;bottom:0;height:58px;padding-bottom:env(safe-area-inset-bottom);background:#060b16f2;border-top:1px solid var(--b);z-index:20}
          .x-bottom a{padding:10px;color:var(--m)}.x-bottom a.on{color:#e7e9ea}.x-bottom a.mid{color:var(--g)}
        }
      `}</style>
    </div>
  );
}
