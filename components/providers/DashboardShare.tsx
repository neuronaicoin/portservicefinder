'use client';

import { useEffect, useState } from 'react';

/** Provider dashboard: "Share your company page" box with LinkedIn first, plus the website badge. */
export function DashboardShare({ providerId, hideLive = false }: { providerId: string; hideLive?: boolean }) {
  const [page, setPage] = useState<{ url: string; name: string; text: string } | null>(null);
  const [copied, setCopied] = useState('');
  useEffect(() => {
    fetch(`/api/provider/page?id=${encodeURIComponent(providerId)}`)
      .then((r) => r.json())
      .then((d) => d?.listed && setPage({ url: d.url, name: d.name, text: d.text }))
      .catch(() => {});
  }, [providerId]);
  if (!page) return null;

  const enc = encodeURIComponent;
  const { url, name, text } = page;
  const badge = `<a href="${url}" title="${name} on PortServiceFinder"><img src="https://www.portservicefinder.com/badge-listed.svg" alt="Listed on PortServiceFinder" width="190" height="52"></a>`;
  const copy = async (what: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(what);
      setTimeout(() => setCopied(''), 1800);
    } catch {}
  };
  const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 42, padding: '0 15px', borderRadius: 9, border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--ink)', fontWeight: 600, fontSize: 14.5, textDecoration: 'none', cursor: 'pointer' };
  const link = { color: 'var(--acc)', fontWeight: 600, fontSize: 14, background: 'none', border: 0, padding: 0, cursor: 'pointer' } as React.CSSProperties;

  return (
    <section style={{ background: 'var(--card)', border: '2px solid #c8a84b', borderRadius: 14, padding: '20px 20px 18px', marginBottom: 22 }} aria-labelledby="share-h">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0, flex: '1 1 320px' }}>
          {!hideLive && <p style={{ margin: '0 0 4px', color: 'var(--ok)', fontWeight: 600, fontSize: 13.5 }}>● Your listing is live</p>}
          <h2 id="share-h" style={{ margin: '0 0 6px', fontSize: 20, color: 'var(--ink)', fontWeight: 700 }}>
            Share your company page
          </h2>
          <p style={{ margin: 0, color: 'var(--ink2)', fontSize: 14.5, lineHeight: 1.55 }}>Companies that share their page on LinkedIn get found faster. Post it once, it takes a few seconds.</p>
        </div>
        <a href={url} target="_blank" rel="noopener" style={{ ...link, textDecoration: 'none' }}>
          View my page →
        </a>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '16px 0 12px' }}>
        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`} target="_blank" rel="noopener" style={{ ...btn, background: '#0a66c2', borderColor: '#0a66c2', color: '#fff', fontWeight: 700 }}>
          Share on LinkedIn
        </a>
        <a href={`https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`} target="_blank" rel="noopener" style={btn}>
          X
        </a>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`} target="_blank" rel="noopener" style={btn}>
          Facebook
        </a>
        <a href={`https://wa.me/?text=${enc(`${text} ${url}`)}`} target="_blank" rel="noopener" style={btn}>
          WhatsApp
        </a>
        <button type="button" onClick={() => copy('link', url)} style={btn}>
          {copied === 'link' ? 'Copied' : 'Copy link'}
        </button>
      </div>
      <div style={{ background: 'var(--bg2)', borderRadius: 10, padding: '12px 14px', fontSize: 13.5, color: 'var(--ink2)', lineHeight: 1.55 }}>
        Suggested post: “{text}”{' '}
        <button type="button" onClick={() => copy('text', `${text} ${url}`)} style={link}>
          {copied === 'text' ? 'Copied' : 'Copy text'}
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/badge-listed.svg" width={190} height={52} alt="Listed on PortServiceFinder" />
        <button type="button" onClick={() => copy('badge', badge)} style={link}>
          {copied === 'badge' ? 'Badge code copied' : 'Copy badge code for your website'}
        </button>
      </div>
    </section>
  );
}
