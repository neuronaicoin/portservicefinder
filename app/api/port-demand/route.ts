import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Aggregate demand per port over the last N days (default 30): site searches and operator requests.
// Counts only, no personal data.
export async function GET(request: Request) {
  const days = Math.min(365, Number(new URL(request.url).searchParams.get('days')) || 30);
  const since = new Date(Date.now() - days * 86400_000).toISOString();
  const count = (rows: { port?: unknown; service_type?: unknown }[] | null) => {
    const m: Record<string, { total: number; svc: Record<string, number> }> = {};
    for (const r of rows || []) {
      const p = String(r.port || '').trim();
      if (!p) continue;
      const e = (m[p] ||= { total: 0, svc: {} });
      e.total++;
      const s = String(r.service_type || 'any');
      e.svc[s] = (e.svc[s] || 0) + 1;
    }
    return m;
  };
  const [s, q] = await Promise.all([
    supabaseAdmin.from('search_events').select('port,service_type').gte('created_at', since).limit(50000),
    supabaseAdmin.from('rfq_requests').select('port,service_type').gte('created_at', since).limit(5000),
  ]);
  return NextResponse.json({ days, searches: count(s.data), requests: count(q.data), errors: [s.error?.message, q.error?.message].filter(Boolean) });
}
