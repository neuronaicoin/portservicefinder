import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/admin-session';
import { supabaseAdmin } from '@/lib/supabase';

function escapeCsvValue(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: NextRequest) {
  const isAuthenticated = await validateSession();
  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { data: providers, error } = await supabaseAdmin
      .from('providers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    // CSV headers
    const headers = [
      'Company Name',
      'Contact Name',
      'Email',
      'Phone',
      'Port',
      'Service Type',
      'Status',
      'Created Date',
    ];

    // CSV rows
    const rows = (providers || []).map((p) => [
      escapeCsvValue(p.company_name),
      escapeCsvValue(p.contact_name),
      escapeCsvValue(p.email),
      escapeCsvValue(p.phone),
      escapeCsvValue(p.port),
      escapeCsvValue(p.service_type),
      escapeCsvValue(p.subscription_status || 'pending'),
      escapeCsvValue(p.created_at ? new Date(p.created_at).toISOString() : ''),
    ]);

    // Combine
    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const filename = `psf-members-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
