import Link from 'next/link';
import { ProviderAvatar } from '@/components/home/ProviderAvatar';
import { agoText, initials, type ListedProvider } from '@/lib/providers-db';

const TYPE_STYLE: Record<string, { bg: string; fg: string }> = {
  agent: { bg: 'color-mix(in srgb, var(--acc) 12%, var(--card))', fg: 'var(--acc)' },
  chandler: { bg: 'color-mix(in srgb, #c8a84b 20%, var(--card))', fg: 'color-mix(in srgb, #8a6d1c 75%, var(--ink))' },
  service: { bg: 'color-mix(in srgb, var(--ok) 13%, var(--card))', fg: 'var(--ok)' },
};

/** A company in a list: name, what it does, where, and a link to its page. */
export function ProviderCard({ p, now = Date.now() }: { p: ListedProvider; now?: number }) {
  const ports = p.ports.slice(0, 3).map((x) => x.name).join(', ') + (p.ports.length > 3 ? ` +${p.ports.length - 3}` : '');
  const t = TYPE_STYLE[p.type] || TYPE_STYLE.service;
  return (
    <Link href={`/providers/${p.slug}`} className="psf-pcard">
      <style>{CSS}</style>
      <span className="pc-top">
        <ProviderAvatar text={initials(p.name)} size={46} />
        <span className="pc-id">
          <b>{p.name}</b>
          <span className="pc-type" style={{ background: t.bg, color: t.fg }}>
            {p.typeLabel}
          </span>
        </span>
      </span>
      <span className="pc-where">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="5" r="2.5" />
          <path d="M12 7.5V21M5 12H3a9 9 0 0 0 18 0h-2M8 11h8" />
        </svg>
        <span>
          {ports}
          {p.country ? ` · ${p.flag} ${p.country}` : ''}
        </span>
      </span>
      {p.bio && <span className="pc-bio">{p.bio}</span>}
      <span className="pc-foot">
        {p.claimed && <span className="pc-joined">Joined {agoText(p.joinedAt, now)}</span>}
        <span className="pc-go">View &amp; contact →</span>
      </span>
    </Link>
  );
}

const CSS = `
.psf-pcard{display:flex;flex-direction:column;gap:12px;padding:16px;background:var(--card);border:1px solid var(--line);border-radius:16px;text-decoration:none;color:inherit;min-width:0;box-shadow:0 1px 2px rgba(11,27,43,.04);transition:border-color .15s,box-shadow .15s,transform .15s}
.psf-pcard:hover{border-color:color-mix(in srgb,var(--acc) 50%,var(--line));box-shadow:var(--shadow);transform:translateY(-1px)}
.psf-pcard .pc-top{display:flex;gap:12px;align-items:center;min-width:0}
.psf-pcard .pc-id{display:flex;flex-direction:column;align-items:flex-start;gap:5px;min-width:0}
.psf-pcard .pc-id b{display:block;max-width:100%;font-size:16px;line-height:1.25;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.psf-pcard .pc-type{font-size:12px;font-weight:650;padding:3px 9px;border-radius:999px;white-space:nowrap}
.psf-pcard .pc-where{display:flex;gap:7px;align-items:center;color:var(--ink2);font-size:13.5px;min-width:0}
.psf-pcard .pc-where svg{flex:none;color:var(--acc)}
.psf-pcard .pc-where span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.psf-pcard .pc-bio{color:var(--ink2);font-size:14px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.psf-pcard .pc-foot{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:auto;padding-top:12px;border-top:1px solid var(--line)}
.psf-pcard .pc-joined{font-size:12.5px;color:var(--ok);font-weight:550;white-space:nowrap}
.psf-pcard .pc-go{font-size:13.5px;font-weight:650;color:var(--acc);white-space:nowrap}
`;
