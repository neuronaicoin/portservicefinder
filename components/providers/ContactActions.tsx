'use client';

/** Email, phone, WhatsApp and website buttons. Calls and emails are counted as leads for the company's dashboard. */
export function ContactActions({ providerId, name, phone, email, whatsapp, website }: { providerId: string; name: string; phone?: string; email?: string; whatsapp?: string; website?: string }) {
  const track = (method: 'call' | 'email') =>
    fetch('/api/track-lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ providerId, contactMethod: method }) }).catch(() => {});
  const wa = (whatsapp || '').replace(/[^\d]/g, '');
  const site = website ? (/^https?:\/\//i.test(website) ? website : `https://${website}`) : '';
  const btn: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 44, borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: 'none', padding: '0 14px' };
  const ghost: React.CSSProperties = { ...btn, border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--ink)' };
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {email && (
        <a
          href={`mailto:${email}?subject=${encodeURIComponent('Inquiry via PortServiceFinder')}&body=${encodeURIComponent(`Hello ${name},\n\nI found your company on PortServiceFinder and would like a quote for:\n\nVessel:\nPort and ETA:\nService needed:\n\nThank you.`)}`}
          onClick={() => track('email')}
          style={{ ...btn, background: 'var(--acc)', color: 'var(--on-acc)' }}
        >
          Email {name.length > 22 ? 'the company' : name}
        </a>
      )}
      {phone && (
        <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} onClick={() => track('call')} style={ghost}>
          Call {phone}
        </a>
      )}
      {wa.length >= 7 && (
        <a href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hello, I found ${name} on PortServiceFinder.`)}`} target="_blank" rel="noopener noreferrer nofollow" style={ghost}>
          WhatsApp
        </a>
      )}
      {site && (
        <a href={site} target="_blank" rel="noopener nofollow" style={ghost}>
          Visit website
        </a>
      )}
    </div>
  );
}
