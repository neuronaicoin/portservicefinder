'use client';
import { useState } from 'react';

export function ClaimForm({ slug, t, mode, masked }: { slug: string; t: string; mode: 'confirm' | 'send'; masked: string }) {
  const [phone, setPhone] = useState('');
  const [person, setPerson] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'sent' | 'err'>('idle');
  const [msg, setMsg] = useState('');

  async function go(e: React.FormEvent) {
    e.preventDefault();
    setState('busy');
    const r = await fetch('/api/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: mode, slug, t, phone, whatsapp: phone, contact_person: person }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setState('err'); setMsg(j.error || 'Something went wrong'); return; }
    if (mode === 'send') { setState('sent'); return; }
    window.location.href = j.url || '/providers';
  }

  if (state === 'sent')
    return <p className="cl-ok">✓ Done. We sent a one-click activation link to <b>{masked}</b>. Open it to activate your page.</p>;

  return (
    <form onSubmit={go} className="cl-form">
      {mode === 'confirm' && (
        <>
          <label>Phone / WhatsApp (optional, shown on your page)<input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+90 532 000 00 00" /></label>
          <label>Contact person (optional)<input value={person} onChange={(e) => setPerson(e.target.value)} placeholder="Name Surname" /></label>
        </>
      )}
      <button disabled={state === 'busy'}>{state === 'busy' ? 'Please wait…' : mode === 'confirm' ? 'Activate my free page' : `Send activation link to ${masked}`}</button>
      {state === 'err' && <p className="cl-err">{msg}</p>}
      <p className="cl-small">Free. No commission. Operators contact you directly. You can remove the page any time.</p>
    </form>
  );
}
