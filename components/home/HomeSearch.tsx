'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ALL_PORTS, FLAG, PORT_DATA } from '@/lib/ports';
import { SERVICE_CATEGORIES } from '@/lib/services-config';

const COUNTRIES = Object.keys(PORT_DATA).sort((a, b) => a.localeCompare(b));
const MARINE = SERVICE_CATEGORIES.filter((s) => s.type === 'service');

/** Emoji flag → ISO code, so we can show a flag image (Windows browsers do not draw emoji flags). */
function iso(country: string) {
  const f = FLAG[country];
  if (!f) return '';
  const cps = [...f].map((c) => (c.codePointAt(0) || 0) - 0x1f1e6 + 97);
  if (cps.length !== 2 || cps.some((c) => c < 97 || c > 122)) return '';
  return String.fromCharCode(...cps);
}
function Flag({ country }: { country: string }) {
  const c = iso(country);
  if (!c) return <span className="hsf-noflag" aria-hidden="true">🌍</span>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="hsf-flag" src={`https://flagcdn.com/w40/${c}.png`} alt="" width={20} height={15} loading="lazy" />;
}
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

type Open = null | 'country' | 'port' | 'service';
/** service: '' (any) | 'agent' | 'chandler' | 'marine' (all marine services) | a marine service slug */

/** Country → port → service. Opens the port page (or the port's service page); otherwise the provider list. */
export function HomeSearch() {
  const router = useRouter();
  const [country, setCountry] = useState('');
  const [port, setPort] = useState('');
  const [service, setService] = useState('');
  const [open, setOpen] = useState<Open>(null);
  const [marineStep, setMarineStep] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLFormElement>(null);
  const ports = useMemo(() => (country ? ALL_PORTS.filter((p) => p.country === country) : []), [country]);
  const portRef = ALL_PORTS.find((x) => x.slug === port);

  useEffect(() => {
    const out = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); };
    document.addEventListener('mousedown', out);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', out); document.removeEventListener('keydown', esc); };
  }, []);
  const toggle = (o: Open) => { setQ(''); setMarineStep(o === 'service' && (service === 'marine' || MARINE.some((m) => m.slug === service))); setOpen(open === o ? null : o); };

  const serviceLabel =
    service === 'agent' ? 'Ship agent' : service === 'chandler' ? 'Shipchandler' : service === 'marine' ? 'All marine services' :
    MARINE.find((m) => m.slug === service)?.label || 'Any service';

  const go = (e?: React.FormEvent) => {
    e?.preventDefault();
    setOpen(null);
    const cat = service === 'agent' ? 'ship-agent' : service === 'chandler' ? 'shipchandler' : service === 'marine' ? '' : service;
    if (portRef) {
      fetch('/api/track-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: portRef.country, port: portRef.name, service_type: service === 'marine' ? 'marine-services' : cat || 'all' }),
      }).catch(() => {});
      router.push(cat ? `/ports/${portRef.slug}/${cat}` : service === 'marine' ? `/ports/${portRef.slug}#marine-services` : `/ports/${portRef.slug}`);
      return;
    }
    const u = new URLSearchParams();
    if (country) u.set('country', country);
    if (service === 'agent' || service === 'chandler') u.set('type', service);
    else if (service === 'marine') u.set('type', 'service');
    else if (service) u.set('service', service);
    router.push(`/providers${u.toString() ? `?${u}` : ''}`);
  };

  const qn = norm(q.trim());
  const countryList = COUNTRIES.filter((c) => !qn || norm(c).includes(qn));
  const portList = ports.filter((p) => !qn || norm(p.name).includes(qn));
  const marineList = MARINE.filter((s) => !qn || norm(s.label).includes(qn));

  return (
    <form ref={ref} onSubmit={go} className="psf-search" role="search" aria-label="Find marine service providers">
      <style>{`
        .psf-search{position:relative;display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:6px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:6px;box-shadow:var(--shadow)}
        .psf-search .hsf{position:relative;min-width:0}
        .psf-search .hsf+.hsf{border-left:1px solid var(--line)}
        .psf-search .hsf-btn{display:flex;flex-direction:column;align-items:flex-start;width:100%;border:0;background:transparent;padding:8px 12px;border-radius:9px;cursor:pointer;text-align:left;color:var(--ink);font:inherit}
        .psf-search .hsf-btn:hover,.psf-search .hsf.on .hsf-btn{background:color-mix(in srgb,var(--ink) 6%,transparent)}
        .psf-search .hsf-btn:disabled{cursor:not-allowed;opacity:.6}
        .psf-search .hsf-btn small{font-size:12px;font-weight:600;color:var(--ink3)}
        .psf-search .hsf-val{display:flex;align-items:center;gap:8px;width:100%;font-size:15px;padding-top:2px;min-width:0}
        .psf-search .hsf-val em{font-style:normal;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0}
        .psf-search .hsf-val i{flex:none;width:7px;height:7px;border-right:2px solid var(--ink3);border-bottom:2px solid var(--ink3);transform:rotate(45deg) translate(-2px,-2px);transition:transform .15s}
        .psf-search .hsf.on .hsf-val i{transform:rotate(-135deg) translate(-2px,-2px)}
        .psf-search .hsf-flag{width:20px;height:15px;border-radius:3px;object-fit:cover;flex:none;box-shadow:0 0 0 1px rgba(255,255,255,.12)}
        .psf-search .hsf-noflag{font-size:14px;line-height:1;flex:none}
        .psf-search .hsf-pop{position:absolute;top:calc(100% + 10px);left:0;z-index:60;width:max(100%,300px);max-width:380px;background:var(--card);border:1px solid var(--line);border-radius:14px;box-shadow:0 18px 50px rgba(0,0,0,.45);padding:8px;animation:hsfIn .14s ease-out}
        @keyframes hsfIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
        .psf-search .hsf-q{width:100%;box-sizing:border-box;border:1px solid var(--line);background:color-mix(in srgb,var(--ink) 4%,transparent);color:var(--ink);border-radius:10px;padding:9px 12px;font:inherit;font-size:14px;outline:none;margin-bottom:6px}
        .psf-search .hsf-q:focus{border-color:var(--acc)}
        .psf-search .hsf-list{list-style:none;margin:0;padding:0;max-height:300px;overflow:auto;overscroll-behavior:contain}
        .psf-search .hsf-list button{display:flex;align-items:center;gap:10px;width:100%;border:0;background:transparent;color:var(--ink);font:inherit;font-size:14.5px;text-align:left;padding:9px 10px;border-radius:9px;cursor:pointer}
        .psf-search .hsf-list button:hover,.psf-search .hsf-list button.sel{background:color-mix(in srgb,var(--acc) 16%,transparent)}
        .psf-search .hsf-list button.sel{font-weight:650}
        .psf-search .hsf-list .big{padding:12px 12px;font-size:15.5px;font-weight:650}
        .psf-search .hsf-list .big small{display:block;font-weight:500;font-size:12.5px;color:var(--ink3);margin-top:2px}
        .psf-search .hsf-list .ico{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;background:color-mix(in srgb,var(--acc) 14%,transparent);flex:none;font-size:17px}
        .psf-search .hsf-list .arr{margin-left:auto;color:var(--ink3)}
        .psf-search .hsf-back{display:flex;align-items:center;gap:6px;border:0;background:transparent;color:var(--ink3);font:inherit;font-size:13px;font-weight:600;padding:4px 6px 8px;cursor:pointer}
        .psf-search .hsf-none{padding:10px;color:var(--ink3);font-size:14px}
        .psf-search>button{border:0;border-radius:10px;background:var(--acc);color:var(--on-acc);font-weight:650;font-size:15px;padding:0 26px;cursor:pointer;min-height:48px}
        .psf-search>button:hover{background:var(--acc-h)}
        @media (max-width:820px){.psf-search{grid-template-columns:1fr}.psf-search .hsf+.hsf{border-left:0;border-top:1px solid var(--line)}.psf-search>button{min-height:50px}.psf-search .hsf-pop{width:100%;max-width:none}}
      `}</style>

      <div className={`hsf${open === 'country' ? ' on' : ''}`}>
        <button type="button" className="hsf-btn" onClick={() => toggle('country')} aria-haspopup="listbox" aria-expanded={open === 'country'}>
          <small>Country</small>
          <span className="hsf-val">{country && <Flag country={country} />}<em>{country || 'Any country'}</em><i /></span>
        </button>
        {open === 'country' && (
          <div className="hsf-pop">
            <input className="hsf-q" autoFocus placeholder="Search 150+ countries" value={q} onChange={(e) => setQ(e.target.value)} />
            <ul className="hsf-list" role="listbox">
              {!qn && (
                <li><button type="button" className={!country ? 'sel' : ''} onClick={() => { setCountry(''); setPort(''); setOpen(null); }}><span className="hsf-noflag">🌍</span>Any country</button></li>
              )}
              {countryList.map((c) => (
                <li key={c}>
                  <button type="button" className={c === country ? 'sel' : ''} onClick={() => { setCountry(c); setPort(''); setQ(''); setOpen('port'); }}>
                    <Flag country={c} />{c}
                  </button>
                </li>
              ))}
              {countryList.length === 0 && <li className="hsf-none">No country found</li>}
            </ul>
          </div>
        )}
      </div>

      <div className={`hsf${open === 'port' ? ' on' : ''}`}>
        <button type="button" className="hsf-btn" onClick={() => toggle('port')} disabled={!country} aria-haspopup="listbox" aria-expanded={open === 'port'}>
          <small>Port</small>
          <span className="hsf-val"><em>{portRef ? portRef.name : country ? `Any port in ${country}` : 'Choose a country first'}</em><i /></span>
        </button>
        {open === 'port' && country && (
          <div className="hsf-pop">
            {ports.length > 8 && <input className="hsf-q" autoFocus placeholder={`Search ports in ${country}`} value={q} onChange={(e) => setQ(e.target.value)} />}
            <ul className="hsf-list" role="listbox">
              {!qn && (
                <li><button type="button" className={!port ? 'sel' : ''} onClick={() => { setPort(''); setOpen('service'); setMarineStep(false); }}>⚓ Any port in {country}</button></li>
              )}
              {portList.map((p) => (
                <li key={p.slug}>
                  <button type="button" className={p.slug === port ? 'sel' : ''} onClick={() => { setPort(p.slug); setQ(''); setMarineStep(false); setOpen('service'); }}>
                    {p.name}
                  </button>
                </li>
              ))}
              {portList.length === 0 && <li className="hsf-none">No port found</li>}
            </ul>
          </div>
        )}
      </div>

      <div className={`hsf${open === 'service' ? ' on' : ''}`}>
        <button type="button" className="hsf-btn" onClick={() => toggle('service')} aria-haspopup="listbox" aria-expanded={open === 'service'}>
          <small>Service</small>
          <span className="hsf-val"><em>{serviceLabel}</em><i /></span>
        </button>
        {open === 'service' && (
          <div className="hsf-pop">
            {!marineStep ? (
              <ul className="hsf-list" role="listbox">
                <li><button type="button" className={`big${service === 'agent' ? ' sel' : ''}`} onClick={() => { setService('agent'); setOpen(null); }}><span className="ico">🧭</span><span>Ship agent<small>Port agency, clearance, husbandry</small></span></button></li>
                <li><button type="button" className={`big${service === 'chandler' ? ' sel' : ''}`} onClick={() => { setService('chandler'); setOpen(null); }}><span className="ico">📦</span><span>Shipchandler<small>Provisions, stores, spares</small></span></button></li>
                <li><button type="button" className={`big${service === 'marine' || MARINE.some((m) => m.slug === service) ? ' sel' : ''}`} onClick={() => { setQ(''); setMarineStep(true); }}><span className="ico">🔧</span><span>Marine services<small>{MARINE.length} categories: engines, diving, bunkers…</small></span><span className="arr">›</span></button></li>
              </ul>
            ) : (
              <>
                <button type="button" className="hsf-back" onClick={() => { setQ(''); setMarineStep(false); }}>‹ Back</button>
                <input className="hsf-q" autoFocus placeholder="Search marine services" value={q} onChange={(e) => setQ(e.target.value)} />
                <ul className="hsf-list" role="listbox">
                  {!qn && (
                    <li><button type="button" className={service === 'marine' ? 'sel' : ''} onClick={() => { setService('marine'); setOpen(null); }}><b>All marine services</b></button></li>
                  )}
                  {marineList.map((s) => (
                    <li key={s.slug}>
                      <button type="button" className={s.slug === service ? 'sel' : ''} onClick={() => { setService(s.slug); setOpen(null); }}>{s.label}</button>
                    </li>
                  ))}
                  {marineList.length === 0 && <li className="hsf-none">No service found</li>}
                </ul>
              </>
            )}
          </div>
        )}
      </div>

      <button type="submit" className="gold">Search</button>
    </form>
  );
}
