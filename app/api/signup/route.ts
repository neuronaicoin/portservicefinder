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

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    console.error('Signup API error:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
