'use client';

import { useEffect, useState } from 'react';
import { FLAG } from '@/lib/ports';

type St = { country: string; port: string; portName: string };
const open = (sheet: 'country' | 'port' | 'service') => window.dispatchEvent(new CustomEvent('psf:finder', { detail: sheet }));

/** The phone search: Country → Port → Service, each box shows what was picked. */
export function HeroFinder() {
  const [st, setSt] = useState<St>({ country: '', port: '', portName: '' });
  useEffect(() => {
    const on = (e: Event) => setSt((e as CustomEvent<St>).detail);
    window.addEventListener('psf:finder-state', on);
    window.dispatchEvent(new Event('psf:finder-ask'));
    return () => window.removeEventListener('psf:finder-state', on);
  }, []);
  const step = !st.country ? 1 : !st.port ? 2 : 3;
  return (
    <div className="hs-mob" aria-label="Search providers">
      <button type="button" className={`fb fb-c${step === 1 ? ' now' : ''}`} onClick={() => open('country')}>
        <small>1 · Country</small>
        <b>{st.country ? `${FLAG[st.country] || ''} ${st.country}` : 'Select'}</b>
      </button>
      <button type="button" className={`fb fb-p${step === 2 ? ' now' : ''}`} onClick={() => open('port')}>
        <small>2 · Port</small>
        <b>{st.portName || 'Select'}</b>
      </button>
      <button type="button" className={`fb fb-s${step === 3 ? ' now' : ''}`} onClick={() => open('service')}>
        <small>3 · Service</small>
        <b>Search</b>
      </button>
    </div>
  );
}
