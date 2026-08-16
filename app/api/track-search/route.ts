import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { country, port, service_type } = body;

    if (!country || !port) {
      return NextResponse.json({ error: 'Missing country or port' }, { status: 400 });
    }

    await supabaseAdmin.from('search_events').insert({
      country: String(country).slice(0, 100),
      port: String(port).slice(0, 100),
      service_type: service_type ? String(service_type).slice(0, 100) : null,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('track-search error:', err);
    // Loglama hatasi asla arama sonucunu bozmasin
    return NextResponse.json({ success: false });
  }
}
