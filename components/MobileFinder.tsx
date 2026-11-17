'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ALL_PORTS, FLAG, PORT_DATA } from '@/lib/ports';
import { SERVICE_CATEGORIES } from '@/lib/services-config';

/**
 * Phone-only finder: three fixed buttons at the bottom of the screen
 * (Country · Port · Service). Each opens a sheet; the service sheet shows
 * Ship Agent, Shipchandler and Marine Service, and Marine Service opens its
 * categories. Results open the existing port / provider pages.
 * Any page can open it with: window.dispatchEvent(new Event('psf:finder'))
 */

const COUNTRIES = Object.keys(PORT_DATA).sort((a, b) => a.localeCompare(b));
const MARINE = SERVICE_CATEGORIES.filter((s) => s.type === 'service');
const HIDE_ON = ['/admin', '/for-providers/'];

type Sheet = null | 'country' | 'port' | 'service' | 'marine';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function MobileFinder() {
  const path = usePathname() || '/';
  const router = useRouter();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [country, setCountry] = useState('');
  const [port, setPort] = useState('');
  const [q, setQ] = useState('');

  const ports = useMemo(() => (country ? ALL_PORTS.filter((p) => p.country === country) : []), [country]);
  const portRef = ports.find((p) => p.slug === port);

  useEffect(() => {
    const open = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (d === 'country') setSheet('country');
      else if (d === 'port') setSheet(country ? 'port' : 'country');
      else if (d === 'service') setSheet(port ? 'service' : country ? 'port' : 'country');
      else setSheet(country ? (port ? 'service' : 'port') : 'country');
    };
    window.addEventListener('psf:finder', open);
    return () => window.removeEventListener('psf:finder', open);
  }, [country, port]);

  // restore the last choice in this tab, and tell the page's Country / Port / Service boxes about it
  useEffect(() => {
    try {
      const v = JSON.parse(sessionStorage.getItem('psfFinder') || '{}');
      if (v.country) setCountry(v.country);
      if (v.port) setPort(v.port);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem('psfFinder', JSON.stringify({ country, port }));
    } catch {}
    window.dispatchEvent(new CustomEvent('psf:finder-state', { detail: { country, port, portName: portRef?.name || '' } }));
  }, [country, port, portRef]);
  useEffect(() => {
    const ask = () => window.dispatchEvent(new CustomEvent('psf:finder-state', { detail: { country, port, portName: portRef?.name || '' } }));
    window.addEventListener('psf:finder-ask', ask);
    return () => window.removeEventListener('psf:finder-ask', ask);
  }, [country, port, portRef]);
  useEffect(() => setSheet(null), [path]);
  useEffect(() => setQ(''), [sheet]);
  useEffect(() => {
    if (!sheet) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setSheet(null);
    window.addEventListener('keydown', esc);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', esc);
    };
  }, [sheet]);

  if (path === '/admin' || HIDE_ON.some((h) => path.startsWith(h))) return null;

  /** slug: a service category slug, or 'agent' / 'chandler' / 'marine' (all marine services) */
  const go = (slug: string) => {
    const cat =
      slug === 'agent' ? 'ship-agent' : slug === 'chandler' ? 'shipchandler' : slug === 'marine' ? '' : slug;
    if (portRef) {
      fetch('/api/track-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: portRef.country, port: portRef.name, service_type: cat || 'marine-services' }),
      }).catch(() => {});
      setSheet(null);
      router.push(cat ? `/ports/${portRef.slug}/${cat}` : `/ports/${portRef.slug}#marine-services`);
      return;
    }
    const u = new URLSearchParams();
    if (country) u.set('country', country);
    if (slug === 'agent' || slug === 'chandler') u.set('type', slug);
    else if (slug === 'marine') u.set('type', 'service');
    else u.set('service', slug);
    setSheet(null);
    router.push(`/providers?${u}`);
  };

  const qn = norm(q.trim());
  const countryList = COUNTRIES.filter((c) => !qn || norm(c).includes(qn));
  const portList = ports.filter((p) => !qn || norm(p.name).includes(qn));
  const marineList = MARINE.filter((s) => !qn || norm(s.label).includes(qn));

  const title =
    sheet === 'country' ? 'Choose a country' : sheet === 'port' ? (country ? `Ports in ${country}` : 'Choose a country first') : sheet === 'service' ? (portRef ? `What do you need in ${portRef.name}?` : 'Choose a service') : 'Marine services';

  return (
    <>
      <style>{CSS}</style>

      {sheet && (
        <div className="mf-wrap" role="dialog" aria-modal="true" aria-label={title}>
          <button type="button" className="mf-dim" aria-label="Close" onClick={() => setSheet(null)} />
          <div className="mf-sheet">
            <div className="mf-grab" aria-hidden="true" />
            <div className="mf-head">
              {(sheet === 'marine' || sheet === 'port' || sheet === 'service') && (
                <button type="button" className="mf-back" aria-label="Back" onClick={() => setSheet(sheet === 'marine' ? 'service' : sheet === 'service' ? 'port' : 'country')}>
                  <BackIcon />
                </button>
              )}
              <div className="mf-ht">
                <h2>{title}</h2>
                {(country || portRef) && (
                  <small>
                    {country && `${FLAG[country] || ''} ${country}`}
                    {portRef && ` · ${portRef.name}`}
                  </small>
                )}
              </div>
              <button type="button" className="mf-x" aria-label="Close" onClick={() => setSheet(null)}>
                <CloseIcon />
              </button>
            </div>

            {(sheet === 'country' || sheet === 'port' || sheet === 'marine') && (
              <div className="mf-search">
                <SearchIcon />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={sheet === 'country' ? 'Search 150+ countries' : sheet === 'port' ? 'Search ports' : 'Search marine services'}
                  aria-label="Search"
                  autoComplete="off"
                />
              </div>
            )}

            <div className="mf-body">
              {sheet === 'country' && (
                <ul className="mf-list">
                  {countryList.map((c) => (
                    <li key={c}>
                      <button type="button" className={country === c ? 'on' : ''} onClick={() => { setCountry(c); setPort(''); setSheet('port'); }}>
                        <span className="f">{FLAG[c] || '🏳️'}</span>
                        <span className="n">{c}</span>
                        <em>{(PORT_DATA[c] || []).length} {(PORT_DATA[c] || []).length === 1 ? 'port' : 'ports'}</em>
                      </button>
                    </li>
                  ))}
                  {countryList.length === 0 && <li className="none">No country found</li>}
                </ul>
              )}

              {sheet === 'port' && (
                <ul className="mf-list">
                  {portList.map((p) => (
                    <li key={p.slug}>
                      <button type="button" className={port === p.slug ? 'on' : ''} onClick={() => { setPort(p.slug); setSheet('service'); }}>
                        <span className="f"><AnchorIcon /></span>
                        <span className="n">{p.name}</span>
                      </button>
                    </li>
                  ))}
                  {portList.length === 0 && <li className="none">No port found</li>}
                </ul>
              )}

              {sheet === 'service' && (
                <div className="mf-tiles">
                  <button type="button" onClick={() => go('agent')}>
                    <span className="ti">🏢</span>
                    <b>Ship Agent</b>
                    <small>Port agency, husbandry, clearance</small>
                  </button>
                  <button type="button" onClick={() => go('chandler')}>
                    <span className="ti">⚓</span>
                    <b>Shipchandler</b>
                    <small>Provisions, stores, spares</small>
                  </button>
                  <button type="button" onClick={() => go('marine')}>
                    <span className="ti">🔧</span>
                    <b>Marine Service</b>
                    <small>Engine, electrical, hull, diving, surveys and more</small>
                  </button>
                </div>
              )}

              {sheet === 'marine' && (
                <ul className="mf-list">
                  {!qn && (
                    <li>
                      <button type="button" onClick={() => go('marine')}>
                        <span className="f">🔧</span>
                        <span className="n">All marine services</span>
                      </button>
                    </li>
                  )}
                  {marineList.map((s) => (
                    <li key={s.slug}>
                      <button type="button" onClick={() => go(s.slug)}>
                        <span className="f">•</span>
                        <span className="n">{s.label}</span>
                      </button>
                    </li>
                  ))}
                  {marineList.length === 0 && <li className="none">No service found</li>}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const GlobeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.7 3.7 5.7 3.7 9s-1.2 6.3-3.7 9c-2.5-2.7-3.7-5.7-3.7-9S9.5 5.7 12 3z" /></svg>
);
const AnchorIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2.5" /><path d="M12 7.5V21M5 12H3a9 9 0 0 0 18 0h-2M8 11h8" /></svg>
);
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
);
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
);
const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
);

const CSS = `
.mf-bar,.mf-space,.mf-wrap{display:none}
@media (max-width:820px){
  .mf-space{display:block;height:calc(68px + env(safe-area-inset-bottom))}
  .mf-bar{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;position:fixed;left:0;right:0;bottom:0;z-index:900;padding:7px 8px calc(7px + env(safe-area-inset-bottom));background:color-mix(in srgb,var(--card) 94%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-top:1px solid var(--line);box-shadow:0 -6px 20px rgba(11,27,43,.08)}
  .mf-btn{min-width:0;display:grid;grid-template-columns:auto minmax(0,1fr);grid-template-rows:auto auto;column-gap:7px;align-items:center;text-align:left;padding:7px 9px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer;font:inherit;-webkit-tap-highlight-color:transparent}
  .mf-btn i{grid-row:1/3;font-style:normal;font-size:18px;line-height:1;display:flex;color:var(--acc)}
  .mf-btn span{font-size:10.5px;font-weight:600;color:var(--ink3);text-transform:uppercase;letter-spacing:.04em;line-height:1.2}
  .mf-btn b{font-size:13.5px;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.25}
  .mf-btn.set{border-color:color-mix(in srgb,var(--acc) 50%,var(--line));background:color-mix(in srgb,var(--acc) 7%,var(--card))}
  .mf-go{background:#c8a84b;border-color:#c8a84b;color:#08100a}
  .mf-go i,.mf-go span{color:#08100a}
  .mf-go span{opacity:.75}
  .mf-wrap{display:block;position:fixed;inset:0;z-index:1000}
  .mf-dim{position:absolute;inset:0;border:0;background:rgba(4,12,20,.5);cursor:pointer;animation:mfFade .18s ease}
  .mf-sheet{position:absolute;left:0;right:0;bottom:0;max-height:86vh;max-height:86dvh;display:flex;flex-direction:column;background:var(--card);border-radius:20px 20px 0 0;box-shadow:0 -10px 40px rgba(0,0,0,.2);padding-bottom:env(safe-area-inset-bottom);animation:mfUp .22s cubic-bezier(.2,.8,.2,1)}
  .mf-grab{width:40px;height:4px;border-radius:4px;background:var(--line);margin:8px auto 2px}
  .mf-head{display:flex;align-items:center;gap:8px;padding:6px 14px 10px}
  .mf-ht{flex:1;min-width:0}
  .mf-ht h2{margin:0;font-size:18px;font-weight:750;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .mf-ht small{display:block;color:var(--ink3);font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .mf-x,.mf-back{flex:none;width:38px;height:38px;border-radius:10px;border:1px solid var(--line);background:var(--bg2);color:var(--ink);display:flex;align-items:center;justify-content:center;cursor:pointer}
  .mf-search{display:flex;align-items:center;gap:8px;margin:0 14px 8px;padding:0 12px;border:1px solid var(--line);border-radius:12px;background:var(--bg);color:var(--ink3)}
  .mf-search input{flex:1;min-width:0;border:0;background:transparent;outline:none;font-size:16px;padding:12px 0;color:var(--ink)}
  .mf-body{overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:0 8px 12px}
  .mf-list{list-style:none;margin:0;padding:0}
  .mf-list button{width:100%;display:flex;align-items:center;gap:12px;padding:13px 10px;border:0;border-bottom:1px solid var(--line);background:transparent;color:var(--ink);font:inherit;font-size:16px;text-align:left;cursor:pointer}
  .mf-list button.on{color:var(--acc);font-weight:650}
  .mf-list .f{width:24px;flex:none;display:flex;justify-content:center;font-size:19px;color:var(--acc)}
  .mf-list .n{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .mf-list em{font-style:normal;font-size:12.5px;color:var(--ink3);flex:none}
  .mf-list .none{padding:22px 10px;color:var(--ink3);text-align:center}
  .mf-tiles{display:grid;gap:10px;padding:4px 6px 8px}
  .mf-tiles button{position:relative;display:grid;grid-template-columns:48px minmax(0,1fr);grid-template-rows:auto auto;column-gap:12px;align-items:center;text-align:left;padding:16px 36px 16px 14px;border-radius:14px;border:1px solid var(--line);background:var(--bg);color:var(--ink);font:inherit;cursor:pointer}
  .mf-tiles button:active{border-color:var(--acc)}
  .mf-tiles .ti{grid-row:1/3;width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;background:color-mix(in srgb,var(--acc) 10%,var(--card))}
  .mf-tiles b{font-size:17px;font-weight:700}
  .mf-tiles small{font-size:13.5px;color:var(--ink3)}
  .mf-tiles .arr{position:absolute;right:14px;top:50%;transform:translateY(-50%);font-style:normal;font-size:26px;color:var(--ink3)}
}
@keyframes mfUp{from{transform:translateY(100%)}to{transform:none}}
@keyframes mfFade{from{opacity:0}to{opacity:1}}
`;

/** A button (phones) that opens the bottom finder sheet. */
export function FinderButton({ className, children, sheet }: { className?: string; children: React.ReactNode; sheet?: 'country' | 'port' | 'service' }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new CustomEvent('psf:finder', { detail: sheet }))}>
      {children}
    </button>
  );
}
