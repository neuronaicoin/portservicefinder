import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Bir kullanici Call ya da Email butonuna tikladiginda cagrilir.
// Fire-and-forget - hicbir zaman kullanicinin tel:/mailto: gecisini
// geciktirmemeli, bu yuzden hata olsa bile sessizce basarisiz olur.
export async function POST(request: Request) {
  try {
    const { providerId, contactMethod } = await request.json();

    if (!providerId || !['call', 'email'].includes(contactMethod)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('leads').insert([
      { provider_id: providerId, contact_method: contactMethod },
    ]);

    if (error) {
      console.error('track-lead insert error:', error.message);
      return NextResponse.json({ ok: false });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('track-lead route error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
