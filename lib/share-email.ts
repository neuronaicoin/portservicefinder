// ============================================================
// "YOUR LISTING IS LIVE" EMAIL — sent once to each company whose listing goes live, asking it
// to share its company page on LinkedIn (and X, Facebook, WhatsApp) and to add the
// "Listed on PortServiceFinder" badge to its website.
//
// Sent automatically when a company finishes its profile, and once to every company already
// listed from the admin panel. providers.share_email_sent_at records who got it, so nobody
// gets it twice.
// The Resend key is read from the app_secrets table, like the other emails on the site.
// Sender: PSF_MAIL_FROM (Railway variable) once portservicefinder.com is verified in Resend.
// ============================================================
import { supabaseAdmin } from './supabase';
import { getListedProvidersFresh, type ListedProvider } from './providers-db';
import { siteConfig } from './site-config';

const FROM = process.env.PSF_MAIL_FROM || 'PortServiceFinder <notifications@shipcrewfinder.com>';
const REPLY_TO = 'portservicefinder@gmail.com';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function list(names: string[]) {
  if (names.length <= 1) return names[0] || '';
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

export function shareText(p: ListedProvider) {
  const ports = list(p.ports.slice(0, 3).map((x) => x.name));
  const what = p.type === 'agent' ? 'ship agency' : p.type === 'chandler' ? 'ship supply' : 'marine services';
  return `We're now listed on PortServiceFinder 🚢 Vessel operators can find ${p.name} for ${what} in ${ports}, ${p.country} and contact us directly.`;
}

export function buildShareEmail(p: ListedProvider) {
  const url = `${siteConfig.url}/providers/${p.slug}`;
  const shortUrl = url.replace(/^https?:\/\/(www\.)?/, '');
  const enc = encodeURIComponent;
  const text = shareText(p);
  const first = (p.contactPerson || '').split(/\s+/)[0];
  const ports = p.ports.slice(0, 4).map((x) => `<b>${esc(x.name)}</b>`);
  const portsHtml = ports.length <= 1 ? ports[0] || '' : `${ports.slice(0, -1).join(', ')} and ${ports[ports.length - 1]}`;
  const li = `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`;
  const x = `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`;
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`;
  const wa = `https://wa.me/?text=${enc(`${text} ${url}`)}`;
  const dash = `${siteConfig.url}/for-providers/dashboard`;
  const sec = 'display:inline-block;width:30%;text-align:center;border:1px solid #dde3ea;padding:10px 0;border-radius:9px;color:#0f1b2a;font-weight:600;font-size:14px;text-decoration:none';
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#eef1f5;padding:20px 12px;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #dde3ea">
<div style="background:#08100a;padding:16px 24px"><img src="${siteConfig.url}/icon-192.png" width="28" height="28" alt="" style="vertical-align:middle;border-radius:50%"> <span style="vertical-align:middle;font-family:Georgia,serif;font-weight:700;font-size:19px;color:#f5f0e8">PortService<span style="color:#c8a84b">Finder</span></span></div>
<div style="padding:26px 26px 6px">
<p style="margin:0 0 6px;color:#12805c;font-weight:bold;font-size:14px">&#9679; Your listing is live</p>
<h1 style="margin:0 0 14px;font-size:23px;line-height:1.25;color:#0f1b2a">${esc(p.name)} is now on PortServiceFinder</h1>
<p style="color:#3a4a5c;font-size:15.5px;line-height:1.6;margin:0 0 18px">${first ? `Hi ${esc(first)},<br><br>` : ''}Your company page is live. Vessel operators searching ${portsHtml} now see you on those port pages and can contact you directly.</p>
<div style="border:1px solid #dde3ea;border-radius:10px;padding:14px 16px;margin-bottom:22px"><div style="font-size:13px;color:#6b7a8c">Your company page</div><a href="${url}" style="display:block;font-weight:bold;color:#0b5cad;font-size:15px;margin-top:4px;word-break:break-all;text-decoration:none">${esc(shortUrl)}</a></div>
<h2 style="font-size:17px;color:#0f1b2a;margin:0 0 8px">Tell your clients: share it on LinkedIn</h2>
<p style="color:#3a4a5c;font-size:15px;line-height:1.6;margin:0 0 14px">One post to your network brings operators straight to your page. The text below is ready, so it takes a few seconds.</p>
<a href="${li}" style="display:block;text-align:center;background:#0a66c2;color:#ffffff;font-weight:bold;padding:14px;border-radius:10px;text-decoration:none;font-size:16px">Share on LinkedIn</a>
<div style="margin:10px 0 20px;text-align:center"><a href="${x}" style="${sec}">X</a> <a href="${fb}" style="${sec}">Facebook</a> <a href="${wa}" style="${sec}">WhatsApp</a></div>
<div style="background:#f5f7fa;border-radius:10px;padding:14px 16px;margin-bottom:22px;font-size:14px;color:#3a4a5c;line-height:1.55"><b style="color:#0f1b2a">Suggested post</b><br>${esc(text)} ${esc(url)}</div>
<h2 style="font-size:17px;color:#0f1b2a;margin:0 0 8px">Add the badge to your website</h2>
<p style="color:#3a4a5c;font-size:15px;line-height:1.6;margin:0 0 10px"><img src="${siteConfig.url}/badge-listed.png" width="190" height="52" alt="Listed on PortServiceFinder" style="vertical-align:middle"></p>
<p style="color:#3a4a5c;font-size:14px;line-height:1.6;margin:0 0 8px">Copy the badge code from your <a href="${dash}" style="color:#0b5cad">dashboard</a> and paste it on your website. It links to your company page.</p>
</div>
<div style="padding:16px 26px 24px;border-top:1px solid #eef1f5;margin-top:14px;font-size:12.5px;color:#8593a3;line-height:1.5">Listing is free during our launch period. You can update your listing at any time from your dashboard.<br>PortServiceFinder &middot; London, United Kingdom</div>
</div></body></html>`;
  const plain = `${first ? `Hi ${first},\n\n` : ''}${p.name} is now listed on PortServiceFinder. Your company page: ${url}

Share it on LinkedIn: ${li}

Suggested post:
${text} ${url}

Add the "Listed on PortServiceFinder" badge to your website: copy the code from your dashboard, ${dash}

Listing is free during our launch period.
PortServiceFinder, London, United Kingdom`;
  return { subject: `${p.name} is now live on PortServiceFinder`, html, text: plain, url };
}

async function resendKey(): Promise<string | null> {
  const { data } = await supabaseAdmin.from('app_secrets').select('value').eq('key', 'resend_api_key').single();
  return (data?.value as string) || null;
}

export type ShareResult = 'sent' | 'already-sent' | 'not-listed' | 'no-email' | 'no-key' | 'failed';

/**
 * Sends the email to one company, once. `key` is passed in by the bulk sender so the
 * secret is read a single time.
 */
export async function sendShareEmail(providerId: string, key?: string | null): Promise<ShareResult> {
  const { data: row, error } = await supabaseAdmin.from('providers').select('id,email,share_email_sent_at').eq('id', providerId).single();
  // without the share_email_sent_at column (SQL not run yet) the email still goes out
  const missingColumn = !!error && /share_email_sent_at/.test(error.message || '');
  if (error && !missingColumn) return 'failed';
  if (!missingColumn && row?.share_email_sent_at) return 'already-sent';

  const p = (await getListedProvidersFresh()).find((x) => x.id === String(providerId));
  if (!p) return 'not-listed';
  if (!p.email || !p.email.includes('@')) return 'no-email';
  const apiKey = key ?? (await resendKey());
  if (!apiKey) return 'no-key';

  const mail = buildShareEmail(p);
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, reply_to: REPLY_TO, to: [p.email], subject: mail.subject, html: mail.html, text: mail.text }),
  });
  if (!res.ok) {
    console.error('share email failed', p.id, res.status, (await res.text()).slice(0, 300));
    return 'failed';
  }
  if (!missingColumn) await supabaseAdmin.from('providers').update({ share_email_sent_at: new Date().toISOString() }).eq('id', p.id);
  return 'sent';
}

/** Every listed company that has not had the email yet. Resend allows about 2 emails a second. */
export async function sendShareEmailsToAll(): Promise<{ ok: boolean; error?: string; counts: Record<string, number> }> {
  const counts: Record<string, number> = {};
  const { data, error } = await supabaseAdmin.from('providers').select('id,share_email_sent_at').is('share_email_sent_at', null).limit(5000);
  if (error) return { ok: false, error: 'Run the one-line SQL first: the share_email_sent_at column is missing.', counts };
  const pending = new Set((data || []).map((r) => String(r.id)));
  const listed = (await getListedProvidersFresh()).filter((p) => pending.has(p.id));
  const key = await resendKey();
  if (!key) return { ok: false, error: 'Resend key not found in app_secrets.', counts };
  for (const p of listed) {
    const r = await sendShareEmail(p.id, key);
    counts[r] = (counts[r] || 0) + 1;
    await new Promise((ok) => setTimeout(ok, 600));
  }
  return { ok: true, counts };
}
