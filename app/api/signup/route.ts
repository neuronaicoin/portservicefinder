import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      provider_type,
      company_name,
      bio,
      country,
      ports,
      email,
      phone,
      whatsapp,
      website,
      address,
      contact_person,
      svc,
      plan,
    } = body;

    // Basic validation
    if (!company_name || !email || !phone || !country || !ports || ports.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 3 ay sonra expire
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 3);

    const ico = provider_type === 'agent' ? '🏢' : provider_type === 'chandler' ? '⚓' : '🔧';

    // Ucretli planlar (monthly/annual) odeme onaylanana kadar "pending" —
    // /api/providers sadece status='active' dondurdugu icin listede GORUNMEZ.
    // Odeme alindiginda status elle (Supabase tablosundan) 'active' yapilir.
    // Tablodaki gecerli degerler: pending, active, cancelled, expired
    const initialStatus = plan === 'monthly' || plan === 'annual' ? 'pending' : 'active';

    // Supabase column mapping
    const newProvider = {
      type: provider_type,
      name: company_name,
      bio: bio,
      country: country,
      ports: ports,
      svc: provider_type === 'service' ? svc : [provider_type],
      phone: phone,
      email: email,
      whatsapp: whatsapp || phone,
      website: website || '',
      address: address || '',
      contact_person: contact_person,
      plan: plan,
      plan_type: plan,
      status: initialStatus,
      verified: true,
      verified_at: new Date().toISOString(),
      display_icon: ico,
      expires_at: expiresAt.toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('providers')
      .insert([newProvider])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: error.message || 'Database error' },
        { status: 500 }
      );
    }

    // Odeme bilgisi maili gonder (Monthly / Annual icin) - hata olsa bile kaydi bozmaz
    // Resend anahtari Supabase'deki app_secrets tablosundan okunur (env var gerekmez)
    await supabaseAdmin.from('debug_logs').insert({ step: '1_email_block_entered', detail: 'plan=' + plan });

    if (plan === 'monthly' || plan === 'annual') {
      try {
        const { data: secretRow, error: secretErr } = await supabaseAdmin
          .from('app_secrets')
          .select('value')
          .eq('key', 'resend_api_key')
          .single();
        const resendKey = secretRow?.value as string | undefined;

        await supabaseAdmin.from('debug_logs').insert({
          step: '2_secret_fetched',
          detail: 'found=' + (!!resendKey) + ' err=' + (secretErr ? JSON.stringify(secretErr) : 'none') + ' keyLen=' + (resendKey ? resendKey.length : 0),
        });

        if (!resendKey) {
          console.error('resend_api_key not found in app_secrets table');
        } else {

        const planLabel = plan === 'monthly' ? 'Monthly ($49.90/month)' : 'Annual ($499.90/year)';
        const firstName = (contact_person || company_name || 'there').split(' ')[0];
        const emailHtml =
          '<div style="font-family:Arial,sans-serif;max-width:560px">' +
          '<h2 style="color:#0d1030">Almost there — complete your payment</h2>' +
          '<p>Hi ' + firstName + ',</p>' +
          '<p>Thanks for signing up <b>' + company_name + '</b> on PortServiceFinder. Your listing is saved and will go <b>live as soon as payment is confirmed</b>.</p>' +
          '<p>You selected the <b>' + planLabel + '</b> plan.</p>' +
          '<p style="background:#f4f4f4;padding:12px;border-radius:8px;font-size:13px;">' +
          'We will follow up shortly with payment instructions for your ' + planLabel + ' subscription. Once payment is received, your listing goes live immediately. If you have questions in the meantime, just reply to this email.' +
          '</p>' +
          '<p style="color:#888;font-size:12px;margin-top:18px">You are receiving this because you signed up your business on portservicefinder.com.</p>' +
          '</div>';

        const customerResp = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + resendKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'PortServiceFinder <notifications@shipcrewfinder.com>', // GECICI: portservicefinder.com Resend'de dogrulanana kadar
            reply_to: 'portservicefinder@gmail.com', // Uye "Yanitla" derse gercek gelen kutusuna gider
            to: [email],
            subject: 'Complete your payment to activate your PortServiceFinder listing',
            html: emailHtml,
            text: 'Thanks for signing up ' + company_name + '. You selected the ' + planLabel + ' plan. We will follow up shortly with payment instructions — your listing goes live once payment is confirmed.',
          }),
        });
        const customerRespBody = await customerResp.text();
        await supabaseAdmin.from('debug_logs').insert({
          step: '3_customer_email_sent',
          detail: 'status=' + customerResp.status + ' body=' + customerRespBody.slice(0, 500),
        });
        // Adminin (portservicefinder@gmail.com) haberi olsun diye ayrica bir bildirim maili
        try {
          const adminHtml =
            '<div style="font-family:Arial,sans-serif;max-width:560px">' +
            '<h2 style="color:#0d1030">New signup — payment pending</h2>' +
            '<p><b>' + company_name + '</b> just signed up for the <b>' + planLabel + '</b> plan.</p>' +
            '<ul>' +
            '<li>Type: ' + provider_type + '</li>' +
            '<li>Country: ' + country + '</li>' +
            '<li>Ports: ' + (Array.isArray(ports) ? ports.join(', ') : '') + '</li>' +
            '<li>Contact: ' + contact_person + '</li>' +
            '<li>Email: ' + email + '</li>' +
            '<li>Phone: ' + phone + '</li>' +
            '</ul>' +
            '<p>Once you receive payment, set their <code>status</code> to <code>active</code> in the Supabase providers table to make them go live.</p>' +
            '</div>';

          const adminResp = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: 'Bearer ' + resendKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'PortServiceFinder <notifications@shipcrewfinder.com>',
              reply_to: email,
              to: ['portservicefinder@gmail.com'],
              subject: 'New signup: ' + company_name + ' (' + planLabel + ')',
              html: adminHtml,
              text: company_name + ' signed up for ' + planLabel + '. Contact: ' + contact_person + ' / ' + email + ' / ' + phone,
            }),
          });
          const adminRespBody = await adminResp.text();
          await supabaseAdmin.from('debug_logs').insert({
            step: '4_admin_email_sent',
            detail: 'status=' + adminResp.status + ' body=' + adminRespBody.slice(0, 500),
          });
        } catch (adminEmailErr) {
          console.error('Admin notification email error:', adminEmailErr);
          await supabaseAdmin.from('debug_logs').insert({
            step: '4_admin_email_EXCEPTION',
            detail: String(adminEmailErr),
          });
        }

        } // resendKey varsa bloğu kapat
      } catch (emailErr) {
        console.error('Payment email send error:', emailErr);
        await supabaseAdmin.from('debug_logs').insert({
          step: '5_outer_EXCEPTION',
          detail: String(emailErr),
        });
        // Mail hatasi kaydi asla bozmaz
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    console.error('Signup API error:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
