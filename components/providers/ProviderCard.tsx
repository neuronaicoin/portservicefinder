import Link from 'next/link';
import { ProviderAvatar } from '@/components/home/ProviderAvatar';
import { agoText, initials, type ListedProvider } from '@/lib/providers-db';

/** A company in a list: name, what it does, where, and a link to its page. */
export function ProviderCard({ p, now = Date.now() }: { p: ListedProvider; now?: number }) {
  const ports = p.ports.slice(0, 3).map((x) => x.name).join(', ') + (p.ports.length > 3 ? ` +${p.ports.length - 3}` : '');
  return (
    <Link
      href={`/providers/${p.slug}`}
      className="psf-pcard"
      style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 16, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, textDecoration: 'none', color: 'inherit', minWidth: 0 }}
    >
      <span style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
        <ProviderAvatar text={initials(p.name)} size={42} />
        <span style={{ minWidth: 0 }}>
          <b style={{ display: 'block', fontSize: 15.5, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</b>
          <small style={{ display: 'block', color: 'var(--ink3)', fontSize: 13, marginTop: 2 }}>
            {p.typeLabel} · {p.flag} {p.country}
          </small>
        </span>
      </span>
      {p.bio && (
        <span style={{ color: 'var(--ink2)', fontSize: 14, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.bio}</span>
      )}
      <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12.5, color: 'var(--ink3)', marginTop: 'auto' }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Ports: {ports}</span>
        <span style={{ whiteSpace: 'nowrap', color: 'var(--ok)' }}>Joined {agoText(p.joinedAt, now)}</span>
      </span>
    </Link>
  );
}
