'use client';

import { useEffect, useState } from 'react';

/**
 * Share a company page: LinkedIn, X, Facebook, WhatsApp, the phone's own share sheet or a copied
 * link, with a ready-made message. Plus the "Listed on PortServiceFinder" badge for the company's
 * own website (a link back to its page).
 */
export function ShareListing({ url, name, place, service, owner = false }: { url: string; name: string; place: string; service: string; owner?: boolean }) {
  const [copied, setCopied] = useState<'' | 'link' | 'badge' | 'text'>('');
  const [showBadge, setShowBadge] = useState(false);
  const [canShare, setCanShare] = useState(false);
  useEffect(() => setCanShare(typeof navigator !== 'undefined' && 'share' in navigator), []);
  const text = owner
    ? `We're now listed on PortServiceFinder 🚢 Vessel operators can find ${name} for ${service.toLowerCase()} in ${place} and contact us directly.`
    : `${name}: ${service.toLowerCase()} in ${place}, listed on PortServiceFinder.`;
  const enc = encodeURIComponent;
  const links: [string, string][] = [
    ['LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`],
    ['X', `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`],
    ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`],
    ['WhatsApp', `https://wa.me/?text=${enc(`${text} ${url}`)}`],
  ];
  const badge = `<a href="${url}" title="${name} on PortServiceFinder"><img src="https://www.portservicefinder.com/badge-listed.svg" alt="Listed on PortServiceFinder" width="190" height="52"></a>`;
  const copy = async (what: 'link' | 'badge' | 'text', value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(what);
      setTimeout(() => setCopied(''), 1800);
    } catch {}
  };
  const native = async () => {
    try {
      await navigator.share({ title: name, text, url });
    } catch {}
  };
  const b: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 40, padding: '0 12px', borderRadius: 9, border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--ink)', fontWeight: 600, fontSize: 14, textDecoration: 'none', cursor: 'pointer' };
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {links.map(([label, href]) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={label === 'LinkedIn' ? { ...b, background: 'var(--acc)', color: 'var(--on-acc)', borderColor: 'var(--acc)' } : b}>
            {label}
          </a>
        ))}
        {canShare && (
          <button type="button" onClick={native} style={b}>
            More…
          </button>
        )}
        <button type="button" onClick={() => copy('link', url)} style={b}>
          {copied === 'link' ? 'Link copied' : 'Copy link'}
        </button>
      </div>
      <p style={{ fontSize: 13.5, color: 'var(--ink3)', margin: '10px 0 0', lineHeight: 1.5 }}>
        Suggested post: “{text}”{' '}
        <button type="button" onClick={() => copy('text', `${text} ${url}`)} style={{ border: 0, background: 'none', color: 'var(--acc)', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: 13.5 }}>
          {copied === 'text' ? 'Copied' : 'Copy text'}
        </button>
      </p>
      {owner && (
        <div style={{ marginTop: 12 }}>
          <button type="button" onClick={() => setShowBadge((s) => !s)} style={{ ...b, minHeight: 36, fontSize: 13.5 }}>
            {showBadge ? 'Hide website badge' : 'Add our badge to your website'}
          </button>
          {showBadge && (
            <div style={{ marginTop: 10 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/badge-listed.svg" alt="Listed on PortServiceFinder" width={190} height={52} />
              <textarea readOnly value={badge} rows={3} style={{ display: 'block', width: '100%', marginTop: 8, fontFamily: 'ui-monospace, monospace', fontSize: 12, padding: 10, borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg2)', color: 'var(--ink2)' }} />
              <button type="button" onClick={() => copy('badge', badge)} style={{ ...b, marginTop: 8, minHeight: 36, fontSize: 13.5 }}>
                {copied === 'badge' ? 'Code copied' : 'Copy badge code'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
