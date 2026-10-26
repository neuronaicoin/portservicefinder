import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendShareEmail } from '@/lib/share-email';

/**
 * Called by the provider's own browser right after it finishes its profile:
 * sends the "your listing is live, share it" email to that company (once).
 */
export async function POST(request: Request) {
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  const { data: user, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user?.user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  const { data: row } = await supabaseAdmin.from('providers').select('id').eq('auth_user_id', user.user.id).single();
  if (!row) return NextResponse.json({ error: 'No listing' }, { status: 404 });
  try {
    const result = await sendShareEmail(String(row.id));
    return NextResponse.json({ result });
  } catch (e) {
    console.error('share-email:', e);
    return NextResponse.json({ result: 'failed' }, { status: 500 });
  }
}
