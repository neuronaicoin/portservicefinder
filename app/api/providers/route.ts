import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('providers')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform Supabase rows to match Provider interface used in page.tsx
    const providers = (data || []).map((row) => ({
      id: row.id,
      type: row.type,
      ico: row.display_icon || (row.type === 'agent' ? '🏢' : row.type === 'chandler' ? '⚓' : '🔧'),
      name: row.name,
      bio: row.bio,
      ports: row.ports || [],
      country: row.country,
      svc: row.svc || [],
      phone: row.phone || '',
      email: row.email || '',
      wa: row.whatsapp || row.phone || '',
      web: row.website || '',
      addr: row.address || '',
      person: row.contact_person || '',
    }));

    return NextResponse.json({ providers });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    console.error('Providers API error:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
