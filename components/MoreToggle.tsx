'use client';

import { useState } from 'react';

/** Phone-only "show more" for long port pages: the extra sections (class "more") stay folded until tapped. */
export function MoreToggle({ label }: { label: string }) {
  const [open, setOpen] = useState(false);
  if (open) return null;
  return (
    <button
      type="button"
      className="more-tg"
      onClick={(e) => {
        (e.currentTarget.closest('main') as HTMLElement | null)?.classList.add('open');
        setOpen(true);
      }}
    >
      {label}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  );
}
