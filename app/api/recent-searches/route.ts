import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data } = await supabaseAdmin
      .from('search_events')
      .select('country, port, service_type, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({ events: data || [] });
  } catch (err) {
    console.error('recent-searches error:', err);
    return NextResponse.json({ events: [] });
  }
}
