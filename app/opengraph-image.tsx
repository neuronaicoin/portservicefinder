import { ImageResponse } from 'next/og';

export const alt = 'PortServiceFinder: ship agents, shipchandlers and marine services at 1,200+ ports';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** The default share card for every page without its own. */
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '70px 76px', background: 'linear-gradient(135deg,#0b1f33 0%,#0e2a47 60%,#123a63 100%)', color: '#ffffff', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 34, fontWeight: 800 }}>
          <svg width="60" height="60" viewBox="0 0 100 100" style={{ marginRight: 18 }}><circle cx="50" cy="50" r="49" fill="#08100a" /><circle cx="50" cy="50" r="44" fill="none" stroke="#c8a84b" strokeWidth="2.5" /><circle cx="50" cy="50" r="36" fill="none" stroke="#c8a84b" strokeWidth="0.6" opacity="0.5" /><polygon points="50,15 56,50 50,50" fill="#f5f0e8" /><polygon points="50,15 44,50 50,50" fill="#c8a84b" /><polygon points="50,85 56,50 50,50" fill="#c8a84b" /><polygon points="50,85 44,50 50,50" fill="#f5f0e8" /><polygon points="85,50 50,44 50,50" fill="#c8a84b" /><polygon points="85,50 50,56 50,50" fill="#f5f0e8" /><polygon points="15,50 50,44 50,50" fill="#f5f0e8" /><polygon points="15,50 50,56 50,50" fill="#c8a84b" /><circle cx="50" cy="50" r="3.5" fill="#c8a84b" /></svg>
          <div style={{ display: 'flex' }}><span>PortService</span><span style={{ color: '#c8a84b', marginLeft: -5 }}>Finder</span></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 66, fontWeight: 800, lineHeight: 1.06, maxWidth: 1000 }}>Ship agents, chandlers and marine services, port by port.</div>
          <div style={{ display: 'flex', fontSize: 30, marginTop: 24, color: '#cfe0f2' }}>1,200+ ports · 150+ countries · Free for vessel operators</div>
        </div>
        <div style={{ display: 'flex', fontSize: 26, color: '#9fc4ea', fontWeight: 600 }}>portservicefinder.com</div>
      </div>
    ),
    size
  );
}
