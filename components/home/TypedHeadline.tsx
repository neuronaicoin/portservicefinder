'use client';

import { useEffect, useState } from 'react';

const PHRASES = [
  'a ship agent in Singapore.',
  'a shipchandler in Istanbul.',
  'a diver in Rotterdam.',
  'bunkers in Fujairah.',
  'an engine tech in Santos.',
  'a surveyor in Houston.',
  'fresh water in Piraeus.',
  'crew change in Manila.',
  'provisions in Durban.',
  'hull cleaning in Gibraltar.',
  'a Suez transit agent.',
  'spares delivery in Hamburg.',
  'BWTS service in Antwerp.',
  'crane repair in Jebel Ali.',
  'a shipchandler in Algeciras.',
  'a P&I surveyor in Shanghai.',
  'liferaft servicing in Busan.',
  'an electrician in Port Said.',
  'a ship agent in Panama.',
  'sludge removal in Malta.',
  'a boiler technician in Mumbai.',
  'tank cleaning in Houston.',
  'a ship agent in Cape Town.',
  'calibration in Yokohama.',
  'a launch boat in Lagos.',
  'a chandler in Vancouver.',
  'a radio technician in Tuzla.',
  'a ship agent in Constanta.',
  'turbo service in Hong Kong.',
  'hull inspection in Valencia.',
  'fire safety in Jeddah.',
  'a shipchandler in Kandla.',
];

function shuffled(a: string[]) {
  const b = a.slice(1);
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return [a[0], ...b];
}

export function TypedHeadline() {
  const [list, setList] = useState(PHRASES);
  useEffect(() => { setList(shuffled(PHRASES)); }, []);
  const [i, setI] = useState(0);
  const [n, setN] = useState(PHRASES[0].length);
  const [del, setDel] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const full = list[i];
    let t: ReturnType<typeof setTimeout>;
    if (!del && n === full.length) t = setTimeout(() => setDel(true), 2200);
    else if (del && n === 0) t = setTimeout(() => { setDel(false); setI((i + 1) % list.length); }, 350);
    else t = setTimeout(() => setN(n + (del ? -1 : 1)), del ? 28 : 62);
    return () => clearTimeout(t);
  }, [i, n, del, list]);

  const text = list[i].slice(0, n);
  return (
    <h1 className="typed-h1">
      <span className="sr-only">Ship agents, chandlers and marine services, port by port.</span>
      <span aria-hidden="true" className="th">
        Find <span className="tw">{text}</span>
        <span className="tc">|</span>
      </span>
    </h1>
  );
}
