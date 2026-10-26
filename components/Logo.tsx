/**
 * The PortServiceFinder logo, unchanged from the original brand: the gold
 * compass rose and "PortService" + gold "Finder" in Libre Baskerville.
 * The mark sits on its own dark disc so the cream points read on light pages too.
 */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ flex: 'none' }}>
      <circle cx="50" cy="50" r="49" fill="#08100a" />
      <circle cx="50" cy="50" r="44" fill="none" stroke="#c8a84b" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="36" fill="none" stroke="#c8a84b" strokeWidth="0.6" opacity="0.5" />
      <polygon points="50,15 56,50 50,50" fill="#f5f0e8" />
      <polygon points="50,15 44,50 50,50" fill="#c8a84b" />
      <polygon points="50,85 56,50 50,50" fill="#c8a84b" />
      <polygon points="50,85 44,50 50,50" fill="#f5f0e8" />
      <polygon points="85,50 50,44 50,50" fill="#c8a84b" />
      <polygon points="85,50 50,56 50,50" fill="#f5f0e8" />
      <polygon points="15,50 50,44 50,50" fill="#f5f0e8" />
      <polygon points="15,50 50,56 50,50" fill="#c8a84b" />
      <circle cx="50" cy="50" r="3.5" fill="#c8a84b" />
    </svg>
  );
}

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <span className="psf-logo" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: "'Libre Baskerville', Georgia, serif", fontWeight: 700, fontSize: 19, letterSpacing: 0.5, color: 'var(--ink)', whiteSpace: 'nowrap' }}>
      <LogoMark size={size} />
      <span>
        PortService<span style={{ color: '#c8a84b' }}>Finder</span>
      </span>
    </span>
  );
}
