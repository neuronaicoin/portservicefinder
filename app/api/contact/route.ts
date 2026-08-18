import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: secretRow, error: secretErr } = await supabaseAdmin
      .from('app_secrets')
      .select('value')
      .eq('key', 'resend_api_key')
      .single();

    const resendKey = secretRow?.value as string | undefined;

    if (!resendKey) {
      console.error('resend_api_key not found in app_secrets table', secretErr);
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const html =
      '<div style="font-family:Arial,sans-serif;max-width:560px">' +
      '<h2 style="color:#0d1030">New Contact Form Message</h2>' +
      '<p><b>From:</b> ' + name + ' (' + email + ')</p>' +
      '<p><b>Subject:</b> ' + subject + '</p>' +
      '<p style="background:#f4f4f4;padding:12px;border-radius:8px;white-space:pre-wrap;">' + message + '</p>' +
      '</div>';

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + resendKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'PortServiceFinder <notifications@shipcrewfinder.com>',
        reply_to: email,
        to: ['portservicefinder@gmail.com'],
        subject: 'Contact Form: ' + subject,
        html,
        text: name + ' (' + email + '): ' + message,
      }),
    });

    const respBody = await resp.text();
    if (!resp.ok) {
      console.error('Resend send failed:', resp.status, respBody);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
