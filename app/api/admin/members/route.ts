import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/admin-session';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const isAuthenticated = await validateSession();
  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const port = searchParams.get('port') || 'all';

    let query = supabaseAdmin
      .from('providers')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (status !== 'all') {
      query = query.eq('subscription_status', status);
    }

    if (port !== 'all') {
      query = query.eq('port', port);
    }

    if (search) {
      query = query.or(
        `company_name.ilike.%${search}%,contact_name.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      members: data || [],
      total: data?.length || 0,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
