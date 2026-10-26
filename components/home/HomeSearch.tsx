'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ALL_PORTS, FLAG, PORT_DATA } from '@/lib/ports';
import { SERVICE_CATEGORIES } from '@/lib/services-config';

const COUNTRIES = Object.keys(PORT_DATA).sort((a, b) => a.localeCompare(b));

/** Country → port → service. Opens the port page (or the port's service page); a country alone opens the provider list. */
export function HomeSearch() {
  const router = useRouter();
  const [country, setCountry] = useState('');
  const [port, setPort] = useState('');
  const [service, setService] = useState('');
  const ports = useMemo(() => (country ? ALL_PORTS.filter((p) => p.country === country) : []), [country]);

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    const p = ALL_PORTS.find((x) => x.slug === port);
    if (p) {
      fetch('/api/track-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: p.country, port: p.name, service_type: service || 'all' }),
      }).catch(() => {});
      router.push(service ? `/ports/${p.slug}/${service}` : `/ports/${p.slug}`);
      return;
    }
    const q = new URLSearchParams();
    if (country) q.set('country', country);
    if (service) q.set('service', service);
    router.push(`/providers${q.toString() ? `?${q}` : ''}`);
  };

  return (
    <form onSubmit={go} className="psf-search" role="search" aria-label="Find marine service providers">
      <style>{`
        .psf-search{display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:6px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:6px;box-shadow:var(--shadow)}
        .psf-search label{display:flex;flex-direction:column;padding:8px 12px;border-radius:9px;min-width:0}
        .psf-search label+label{border-left:1px solid var(--line)}
        .psf-search span{font-size:12px;font-weight:600;color:var(--ink3)}
        .psf-search select{appearance:none;-webkit-appearance:none;border:0;background:transparent;font-size:15px;color:var(--ink);padding:2px 18px 2px 0;outline:none;min-width:0;width:100%;cursor:pointer;background-image:linear-gradient(45deg,transparent 50%,var(--ink3) 50%),linear-gradient(135deg,var(--ink3) 50%,transparent 50%);background-position:calc(100% - 7px) 55%,calc(100% - 2px) 55%;background-size:5px 5px,5px 5px;background-repeat:no-repeat}
        .psf-search select:disabled{color:var(--ink3);cursor:not-allowed}
        .psf-search button{border:0;border-radius:10px;background:var(--acc);color:var(--on-acc);font-weight:650;font-size:15px;padding:0 26px;cursor:pointer;min-height:48px}
        .psf-search button:hover{background:var(--acc-h)}
        @media (max-width:820px){.psf-search{grid-template-columns:1fr}.psf-search label+label{border-left:0;border-top:1px solid var(--line)}.psf-search button{min-height:50px}}
      `}</style>
      <label>
        <span>Country</span>
        <select value={country} onChange={(e) => { setCountry(e.target.value); setPort(''); }} aria-label="Country">
          <option value="">Any country</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {FLAG[c] ? `${FLAG[c]} ` : ''}{c}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Port</span>
        <select value={port} onChange={(e) => setPort(e.target.value)} disabled={!country} aria-label="Port">
          <option value="">{country ? `Any port in ${country}` : 'Choose a country first'}</option>
          {ports.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Service</span>
        <select value={service} onChange={(e) => setService(e.target.value)} aria-label="Service">
          <option value="">All services</option>
          {SERVICE_CATEGORIES.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <button type="submit">Search</button>
    </form>
  );
}
