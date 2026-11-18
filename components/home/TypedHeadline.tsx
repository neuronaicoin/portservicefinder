'use client';

import { useEffect, useState } from 'react';

const PHRASES = [
  'a ship agent in Singapore.',
  'a shipchandler in Istanbul.',
  'a diver in Rotterdam.',
  'bunkers in Fujairah.',
  'an engine technician in Santos.',
  'a surveyor in Houston.',
  'fresh water in Piraeus.',
];

export function TypedHeadline() {
  const [i, setI] = useState(0);
  const [n, setN] = useState(PHRASES[0].length);
  const [del, setDel] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const full = PHRASES[i];
    let t: ReturnType<typeof setTimeout>;
    if (!del && n === full.length) t = setTimeout(() => setDel(true), 2200);
    else if (del && n === 0) t = setTimeout(() => { setDel(false); setI((i + 1) % PHRASES.length); }, 350);
    else t = setTimeout(() => setN(n + (del ? -1 : 1)), del ? 28 : 62);
    return () => clearTimeout(t);
  }, [i, n, del]);

  const text = PHRASES[i].slice(0, n);
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
