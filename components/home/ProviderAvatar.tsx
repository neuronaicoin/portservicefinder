/** A company's initials on a tinted tile (no logos are uploaded yet). */
export function ProviderAvatar({ text, size = 40 }: { text: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        flex: 'none',
        borderRadius: Math.round(size * 0.24),
        background: 'color-mix(in srgb, var(--acc) 12%, var(--card))',
        color: 'var(--acc)',
        fontWeight: 700,
        fontSize: Math.round(size * 0.36),
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        letterSpacing: '-0.02em',
      }}
    >
      {text}
    </span>
  );
}
