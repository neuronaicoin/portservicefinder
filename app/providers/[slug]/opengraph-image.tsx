import { ImageResponse } from 'next/og';
import { getProviderBySlug } from '@/lib/providers-db';

export const alt = 'Company listed on PortServiceFinder';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const revalidate = 3600;

/** The card a company's page shows when shared on LinkedIn, X, WhatsApp or Facebook. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProviderBySlug(slug);
  const name = p?.name || 'PortServiceFinder';
  const place = p ? (p.ports[0] ? `${p.ports[0].name}, ${p.country}` : p.country) : 'Ship agents, chandlers and marine services';
  const tags = p ? [p.typeLabel, ...p.ports.slice(1, 3).map((x) => x.name)].slice(0, 3) : [];
  const joined = p ? new Date(p.joinedAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '';
  const fontSize = name.length > 34 ? 52 : name.length > 22 ? 62 : 72;
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px 72px', background: 'linear-gradient(135deg,#0b1f33 0%,#0e2a47 60%,#123a63 100%)', color: '#ffffff', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 24, color: '#9fc4ea', fontWeight: 700, letterSpacing: 1 }}>{p ? 'NOW LISTED ON PORTSERVICEFINDER' : 'PORTSERVICEFINDER'}</div>
          <div style={{ display: 'flex', fontSize, fontWeight: 800, marginTop: 26, lineHeight: 1.05, maxWidth: 1050 }}>{name}</div>
          <div style={{ display: 'flex', fontSize: 32, marginTop: 20, color: '#d6e4f2' }}>{place}</div>
          <div style={{ display: 'flex', marginTop: 28 }}>
            {tags.map((t) => (
              <div key={t} style={{ display: 'flex', fontSize: 24, border: '2px solid #3b6b98', borderRadius: 12, padding: '8px 18px', marginRight: 12 }}>
                {t}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 30, fontWeight: 700 }}>
            <svg width="52" height="52" viewBox="0 0 100 100" style={{ marginRight: 16 }}><circle cx="50" cy="50" r="49" fill="#08100a" /><circle cx="50" cy="50" r="44" fill="none" stroke="#c8a84b" strokeWidth="2.5" /><circle cx="50" cy="50" r="36" fill="none" stroke="#c8a84b" strokeWidth="0.6" opacity="0.5" /><polygon points="50,15 56,50 50,50" fill="#f5f0e8" /><polygon points="50,15 44,50 50,50" fill="#c8a84b" /><polygon points="50,85 56,50 50,50" fill="#c8a84b" /><polygon points="50,85 44,50 50,50" fill="#f5f0e8" /><polygon points="85,50 50,44 50,50" fill="#c8a84b" /><polygon points="85,50 50,56 50,50" fill="#f5f0e8" /><polygon points="15,50 50,44 50,50" fill="#f5f0e8" /><polygon points="15,50 50,56 50,50" fill="#c8a84b" /><circle cx="50" cy="50" r="3.5" fill="#c8a84b" /></svg>
            portservicefinder.com
          </div>
          {joined && <div style={{ display: 'flex', background: '#12805c', padding: '12px 22px', borderRadius: 14, fontSize: 24, fontWeight: 700 }}>Joined {joined}</div>}
        </div>
      </div>
    ),
    size
  );
}
