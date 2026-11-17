'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { siteConfig } from '@/lib/site-config';

/**
 * A small round help button in the corner (above the mobile finder bar on phones).
 * Opens a panel: WhatsApp (when a number is set in site-config), email, contact form,
 * and the free listing link for providers.
 */
const HIDE_ON = ['/admin', '/for-providers/dashboard', '/for-providers/complete-profile'];
const FINDER_HIDDEN = ['/admin', '/for-providers/'];

export function HelpBubble() {
  const path = usePathname() || '/';
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown, { passive: true });
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (HIDE_ON.some((h) => path.startsWith(h))) return null;
  const finderShown = !(path === '/admin' || FINDER_HIDDEN.some((h) => path.startsWith(h)));
  const wa = String((siteConfig as { whatsapp?: string }).whatsapp || '').replace(/[^\d]/g, '');

  return (
    <div ref={box} className={`hb${finderShown ? ' over-bar' : ''}`}>
      <style>{CSS}</style>
      {open && (
        <div className="hb-panel" role="dialog" aria-label="Help and contact">
          <b className="hb-t">How can we help?</b>
          {wa && (
            <a className="hb-row wa" href={`https://wa.me/${wa}?text=${encodeURIComponent('Hello PortServiceFinder, ')}`} target="_blank" rel="noopener noreferrer">
              <WaIcon /> Chat on WhatsApp
            </a>
          )}
          <a className="hb-row" href={`mailto:${siteConfig.email}`}>
            <MailIcon /> {siteConfig.email}
          </a>
          <Link className="hb-row" href="/contact">
            <FormIcon /> Send us a message
          </Link>
          <Link className="hb-row gold" href="/for-providers/signup">
            List your company free →
          </Link>
        </div>
      )}
      <button type="button" className={`hb-btn${wa ? ' is-wa' : ''}`} aria-expanded={open} aria-label={open ? 'Close help' : 'Help and contact'} onClick={() => setOpen((o) => !o)}>
        {open ? <CloseIcon /> : wa ? <WaIcon big /> : <ChatIcon />}
      </button>
    </div>
  );
}

const WaIcon = ({ big }: { big?: boolean }) => (
  <svg width={big ? 26 : 18} height={big ? 26 : 18} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2s.2-1.1.2-1.2-.2-.2-.5-.3z" />
  </svg>
);
const ChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
  </svg>
);
const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);
const FormIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M4 4h16v12H8l-4 4z" />
  </svg>
);

const CSS = `
.hb{position:fixed;right:18px;bottom:calc(18px + env(safe-area-inset-bottom));z-index:950;display:flex;flex-direction:column;align-items:flex-end;gap:10px}
.hb-btn{width:54px;height:54px;border-radius:50%;border:0;cursor:pointer;display:flex;align-items:center;justify-content:center;background:var(--acc);color:var(--on-acc);box-shadow:0 8px 22px rgba(11,27,43,.28);transition:transform .15s}
.hb-btn.is-wa{background:#25d366;color:#fff}
.hb-btn:active{transform:scale(.94)}
.hb-panel{width:min(290px,calc(100vw - 36px));background:var(--card);border:1px solid var(--line);border-radius:16px;box-shadow:0 14px 40px rgba(11,27,43,.22);padding:14px;display:flex;flex-direction:column;gap:6px;animation:hbIn .18s ease}
@keyframes hbIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.hb-t{font-size:15px;margin:2px 4px 6px;color:var(--ink)}
.hb-row{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;border:1px solid var(--line);text-decoration:none;color:var(--ink);font-size:14px;font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hb-row svg{flex:none;color:var(--acc)}
.hb-row.wa svg{color:#25d366}
.hb-row.gold{background:var(--acc);color:var(--on-acc);border-color:transparent;justify-content:center}
@media (max-width:820px){
  .hb{right:12px;bottom:calc(14px + env(safe-area-inset-bottom))}
  .hb.over-bar{display:none}
  .hb-btn{width:48px;height:48px}
}
@media print{.hb{display:none}}
`;
