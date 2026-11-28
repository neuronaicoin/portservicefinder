import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getListedProviders, getListedProvidersFresh } from '@/lib/providers-db';
import { claimToken, claimUrl } from '@/lib/claim';

async function resendKey() {
  const { data } = await supabaseAdmin.from('app_secrets').select('value').eq('key', 'resend_api_key').single();
  return (data?.value as string | undefined) || '';
}

export async function POST(request: Request) {
  try {
    const { action, slug, t, phone, whatsapp, contact_person } = await request.json();
    const p = (await getListedProviders()).find((x) => x.slug === slug);
    if (!p) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    if (p.claimed) return NextResponse.json({ ok: true, url: `/providers/${p.slug}`, already: true });
    if (!p.email) return NextResponse.json({ error: 'no-email' }, { status: 400 });

    if (action === 'send') {
      const key = await resendKey();
      if (!key) return NextResponse.json({ error: 'Email not available' }, { status: 500 });
      const link = claimUrl(p.slug, p.email);
      const html =
        '<div style="font-family:Arial,sans-serif;max-width:560px;color:#0d1030">' +
        `<h2>Activate ${p.name} on PortServiceFinder</h2>` +
        `<p>Someone asked to activate the free company page of <b>${p.name}</b> (${p.ports[0]?.name || p.country}). Click below to confirm. It takes one click, it's free, and there is no commission.</p>` +
        `<p><a href="${link}" style="display:inline-block;background:#0d1030;color:#d6b25e;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Activate my free page</a></p>` +
        '<p style="color:#888;font-size:12px">If you did not ask for this, ignore this email and nothing changes.</p></div>';
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'PortServiceFinder <notifications@shipcrewfinder.com>',
          reply_to: 'portservicefinder@gmail.com',
          to: [p.email],
          subject: `Activate ${p.name} on PortServiceFinder`,
          html,
          text: `Activate the free page of ${p.name} on PortServiceFinder: ${link}`,
        }),
      });
      if (!r.ok) return NextResponse.json({ error: 'Could not send email' }, { status: 502 });
      return NextResponse.json({ ok: true, sent: true });
    }

    if (action === 'confirm') {
      if (t !== claimToken(p.slug, p.email)) return NextResponse.json({ error: 'This link is not valid' }, { status: 403 });
      const expires = new Date();
      expires.setMonth(expires.getMonth() + 3);
      const row = {
        type: p.type,
        name: p.name,
        bio: p.bio,
        country: p.country,
        ports: p.ports.map((x) => x.name),
        svc: p.svc,
        email: p.email,
        phone: String(phone || '').trim(),
        whatsapp: String(whatsapp || phone || '').trim(),
        website: p.website,
        address: '',
        contact_person: String(contact_person || '').trim(),
        plan: 'free_trial',
        plan_type: 'free_trial',
        status: 'active',
        verified: true,
        verified_at: new Date().toISOString(),
        display_icon: p.type === 'agent' ? '🏢' : p.type === 'chandler' ? '⚓' : '🔧',
        expires_at: expires.toISOString(),
      };
      const { error } = await supabaseAdmin.from('providers').insert([row]);
      if (error) {
        await supabaseAdmin.from('debug_logs').insert({ step: 'claim_error', detail: `${p.name} | ${error.message}` });
        return NextResponse.json({ error: 'Something went wrong. Please try again or email portservicefinder@gmail.com.' }, { status: 500 });
      }
      await supabaseAdmin.from('debug_logs').insert({ step: 'claim', detail: `${p.name} | ${p.email}` });
      const fresh = await getListedProvidersFresh();
      const m = fresh.find((x) => x.claimed && x.email.toLowerCase() === p.email.toLowerCase());
      return NextResponse.json({ ok: true, url: m ? `/providers/${m.slug}?claimed=1` : '/providers' });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
