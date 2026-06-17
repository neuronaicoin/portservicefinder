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
    // Get all providers
    const { data: providers, error } = await supabaseAdmin
      .from('providers')
      .select('*');

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    const total = providers?.length || 0;
    const activeSubscriptions =
      providers?.filter((p) => p.subscription_status === 'active').length || 0;
    const pending =
      providers?.filter((p) => p.subscription_status === 'pending' || !p.subscription_status)
        .length || 0;

    // This month registrations
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth =
      providers?.filter((p) => {
        if (!p.created_at) return false;
        return new Date(p.created_at) >= firstDayOfMonth;
      }).length || 0;

    // Last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const lastWeek =
      providers?.filter((p) => {
        if (!p.created_at) return false;
        return new Date(p.created_at) >= sevenDaysAgo;
      }).length || 0;

    // Port distribution
    const portCounts: Record<string, number> = {};
    providers?.forEach((p) => {
      if (p.port) {
        portCounts[p.port] = (portCounts[p.port] || 0) + 1;
      }
    });

    const portDistribution = Object.entries(portCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([port, count]) => ({ port, count }));

    // Service distribution
    const serviceCounts: Record<string, number> = {};
    providers?.forEach((p) => {
      if (p.service_type) {
        serviceCounts[p.service_type] = (serviceCounts[p.service_type] || 0) + 1;
      }
    });

    const serviceDistribution = Object.entries(serviceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([service, count]) => ({ service, count }));

    return NextResponse.json({
      success: true,
      stats: {
        total,
        activeSubscriptions,
        pending,
        thisMonth,
        lastWeek,
        portDistribution,
        serviceDistribution,
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
