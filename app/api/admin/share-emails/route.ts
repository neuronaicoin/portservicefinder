import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/admin-session';
import { sendShareEmailsToAll } from '@/lib/share-email';

export const maxDuration = 300;

/** Admin: send the "your listing is live, share it" email to every listed company that hasn't had it. */
export async function POST() {
  if (!(await validateSession())) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const r = await sendShareEmailsToAll();
    return NextResponse.json({ success: r.ok, error: r.error, counts: r.counts });
  } catch (e) {
    console.error('share-emails:', e);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
