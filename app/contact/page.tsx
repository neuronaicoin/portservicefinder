'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Please enter your name.');
    if (!form.email.trim()) return setError('Please enter your email.');
    if (!form.subject.trim()) return setError('Please enter a subject.');
    if (!form.message.trim()) return setError('Please write a message.');

    setSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
        }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const msg = errData?.errors?.[0]?.message || `Submission failed (status ${response.status}). Please try again.`;
        setError(msg);
        setSubmitting(false);
        return;
      }
      setSentTo(form.email);
      setSubmitted(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <style>{`
        .ct{max-width:1040px;margin:0 auto;padding:44px 20px 8px;color:var(--ink);font-family:var(--font-ui)}
        .ct .eyebrow{font-size:13px;font-weight:600;color:var(--ink3);margin:0 0 8px}
        .ct h1{font-size:clamp(28px,6vw,42px);font-weight:700;letter-spacing:-0.02em;line-height:1.15;margin:0 0 12px}
        .ct .lede{font-size:17px;line-height:1.65;color:var(--ink2);margin:0 0 28px;max-width:640px}
        .ct .grid{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:20px;align-items:start}
        .ct .card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:22px}
        .ct h2{font-size:19px;font-weight:700;margin:0 0 16px}
        .ct label{display:block;font-size:13px;font-weight:600;color:var(--ink2);margin-bottom:6px}
        .ct .field{margin-bottom:14px}
        .ct input,.ct textarea{width:100%;box-sizing:border-box;background:var(--bg);border:1px solid var(--line);border-radius:10px;color:var(--ink);padding:11px 12px;font-size:15px;font-family:var(--font-ui);min-height:44px}
        .ct input:focus,.ct textarea:focus{outline:none;border-color:var(--acc)}
        .ct textarea{resize:vertical;min-height:140px}
        .ct .count{font-size:12px;color:var(--ink3);text-align:right;margin-top:4px}
        .ct .err{padding:10px 12px;background:color-mix(in srgb, var(--bad) 10%, transparent);border:1px solid color-mix(in srgb, var(--bad) 35%, transparent);border-radius:10px;color:var(--bad);font-size:14px;margin-bottom:14px}
        .ct .btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 20px;border-radius:10px;font-weight:650;font-size:15px;text-decoration:none;border:none;cursor:pointer;font-family:var(--font-ui)}
        .ct .btn.primary{background:var(--acc);color:var(--on-acc);width:100%}
        .ct .btn.primary:hover{background:var(--acc-h)}
        .ct .btn.primary:disabled{opacity:.7;cursor:wait}
        .ct .btn.ghost{background:var(--bg);border:1px solid var(--line);color:var(--ink)}
        .ct .small{font-size:13px;color:var(--ink3);text-align:center;margin:10px 0 0}
        .ct .side{display:grid;gap:12px}
        .ct .side .k{font-size:13px;font-weight:600;color:var(--ink3);margin-bottom:4px}
        .ct .side .v{font-size:15px;color:var(--ink);line-height:1.5;overflow-wrap:anywhere}
        .ct .side a{color:var(--acc)}
        .ct .side ul{list-style:none;margin:0;padding:0;display:grid;gap:8px;font-size:15px}
        .ct .ok{padding:22px;background:color-mix(in srgb, var(--ok) 8%, transparent);border:1px solid color-mix(in srgb, var(--ok) 35%, transparent);border-radius:12px}
        .ct .ok h3{font-size:18px;font-weight:700;margin:0 0 6px}
        .ct .ok p{font-size:15px;color:var(--ink2);line-height:1.65;margin:0 0 14px}
        @media (max-width:760px){.ct .grid{grid-template-columns:1fr}}
      `}</style>
      <SiteHeader />
      <main className="ct">
        <p className="eyebrow">Contact</p>
        <h1>Get in touch</h1>
        <p className="lede">
          Questions about a listing, a correction to port data, a partnership idea or a technical problem. We read every message and usually
          reply within 24 hours.
        </p>

        <div className="grid">
          <div className="card">
            <h2>Send us a message</h2>
            {submitted ? (
              <div className="ok" role="status">
                <h3>Message received</h3>
                <p>
                  Thanks for writing. We will reply to <strong style={{ color: 'var(--ink)' }}>{sentTo || 'your email'}</strong> within 24
                  hours.
                </p>
                <button type="button" onClick={() => setSubmitted(false)} className="btn ghost">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="field">
                  <label htmlFor="c-name">Name</label>
                  <input id="c-name" type="text" autoComplete="name" placeholder="Your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={submitting} />
                </div>
                <div className="field">
                  <label htmlFor="c-email">Email</label>
                  <input id="c-email" type="email" autoComplete="email" placeholder="you@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={submitting} />
                </div>
                <div className="field">
                  <label htmlFor="c-subject">Subject</label>
                  <input id="c-subject" type="text" placeholder="What is this about?" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} disabled={submitting} />
                </div>
                <div className="field">
                  <label htmlFor="c-message">Message</label>
                  <textarea id="c-message" placeholder="Write your message here" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} disabled={submitting} maxLength={2000} />
                  <div className="count">{form.message.length}/2000</div>
                </div>

                {error && (
                  <div className="err" role="alert">
                    {error}
                  </div>
                )}

                <button type="submit" className="btn primary" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send message'}
                </button>
                <p className="small">We only use your details to reply to you.</p>
              </form>
            )}
          </div>

          <div className="side">
            <div className="card">
              <div className="k">Email</div>
              <div className="v">
                <a href="mailto:contact@portservicefinder.com">contact@portservicefinder.com</a>
              </div>
            </div>
            <div className="card">
              <div className="k">Based in</div>
              <div className="v">London, England, United Kingdom</div>
            </div>
            <div className="card">
              <div className="k">LinkedIn</div>
              <div className="v">
                <a href="https://www.linkedin.com/company/portservicefinder" target="_blank" rel="noopener noreferrer">
                  PortServiceFinder on LinkedIn
                </a>
              </div>
            </div>
            <div className="card">
              <div className="k">Looking for something else?</div>
              <ul>
                <li>
                  <Link href="/faq">Frequently asked questions</Link>
                </li>
                <li>
                  <Link href="/request-quote">Request a quote from providers</Link>
                </li>
                <li>
                  <Link href="/for-providers">List your company</Link>
                </li>
                <li>
                  <Link href="/listing-rules">Listing rules</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
