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
      status: 'active',
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
    if ((plan === 'monthly' || plan === 'annual') && process.env.RESEND_API_KEY) {
      try {
        const planLabel = plan === 'monthly' ? 'Monthly ($49.90/month)' : 'Annual ($499.90/year)';
        const firstName = (contact_person || company_name || 'there').split(' ')[0];
        const emailHtml =
          '<div style="font-family:Arial,sans-serif;max-width:560px">' +
          '<h2 style="color:#0d1030">Your PortServiceFinder listing is live</h2>' +
          '<p>Hi ' + firstName + ',</p>' +
          '<p>Your listing for <b>' + company_name + '</b> is now active and visible to vessel operators searching your ports.</p>' +
          '<p>You selected the <b>' + planLabel + '</b> plan. To keep your listing active, please complete payment:</p>' +
          '<p style="background:#f4f4f4;padding:12px;border-radius:8px;font-size:13px;">' +
          'We will follow up shortly with payment details for your ' + planLabel + ' subscription. If you have questions in the meantime, just reply to this email.' +
          '</p>' +
          '<p style="color:#888;font-size:12px;margin-top:18px">You are receiving this because you listed your business on portservicefinder.com.</p>' +
          '</div>';

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + process.env.RESEND_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'PortServiceFinder <hello@portservicefinder.com>',
            to: [email],
            subject: 'Your PortServiceFinder listing is live — payment details',
            html: emailHtml,
            text: 'Your listing for ' + company_name + ' is active. You selected the ' + planLabel + ' plan. We will follow up shortly with payment details.',
          }),
        });
      } catch (emailErr) {
        console.error('Payment email send error:', emailErr);
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
