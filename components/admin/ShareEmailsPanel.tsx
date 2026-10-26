'use client';

import { useState } from 'react';

/** Admin: send the "your listing is live, share it on LinkedIn" email to every listed company (once each). */
export function ShareEmailsPanel() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const run = async () => {
    if (!window.confirm('Send the share email to every listed company that has not received it yet?')) return;
    setBusy(true);
    setMsg('');
    setErr('');
    try {
      const res = await fetch('/api/admin/share-emails', { method: 'POST' });
      const d = await res.json();
      if (d.success) {
        const c = d.counts || {};
        setMsg(`Sent: ${c.sent || 0}` + (c['no-email'] ? ` · no email: ${c['no-email']}` : '') + (c.failed ? ` · failed: ${c.failed}` : '') + (c['already-sent'] ? ` · already sent: ${c['already-sent']}` : ''));
      } else setErr(d.error || 'Failed');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Network error');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="bg-gradient-to-r from-sky-900/20 to-sky-800/20 border border-sky-700/50 rounded-lg p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-sky-300 mb-1">📣 Share email to listed companies</h3>
          <p className="text-sm text-slate-300">
            Emails every listed company its page link with a one-click LinkedIn share and the website badge. Each company gets it only once; new companies get it automatically.
          </p>
        </div>
        <button onClick={run} disabled={busy} className="bg-sky-500 hover:bg-sky-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-900 font-bold px-6 py-3 rounded-lg transition whitespace-nowrap">
          {busy ? '⏳ Sending...' : '📣 Send share emails'}
        </button>
      </div>
      {msg && <p className="mt-3 text-sm text-emerald-300">✅ {msg}</p>}
      {err && <p className="mt-3 text-sm text-red-300">❌ {err}</p>}
    </div>
  );
}
