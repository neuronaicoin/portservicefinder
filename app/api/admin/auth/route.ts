import { NextRequest, NextResponse } from 'next/server';
import {
  createSession,
  destroySession,
  checkRateLimit,
  recordFailedAttempt,
  clearFailedAttempts,
} from '@/lib/admin-session';

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0].trim() || realIp || 'unknown';
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // Check rate limit
  const rateLimitCheck = checkRateLimit(ip);
  if (!rateLimitCheck.allowed) {
    const minutesRemaining = Math.ceil((rateLimitCheck.remainingMs || 0) / 60000);
    return NextResponse.json(
      {
        success: false,
        error: `Too many failed attempts. Try again in ${minutesRemaining} minutes.`,
      },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { action, password } = body;

    if (action === 'logout') {
      await destroySession();
      return NextResponse.json({ success: true });
    }

    if (action === 'login') {
      // Intentional 2 second delay to slow brute force attempts
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminPassword) {
        return NextResponse.json(
          { success: false, error: 'Server configuration error' },
          { status: 500 }
        );
      }

      if (!password || typeof password !== 'string') {
        recordFailedAttempt(ip);
        return NextResponse.json(
          { success: false, error: 'Invalid password' },
          { status: 401 }
        );
      }

      if (password !== adminPassword) {
        recordFailedAttempt(ip);
        return NextResponse.json(
          { success: false, error: 'Invalid password' },
          { status: 401 }
        );
      }

      clearFailedAttempts(ip);
      await createSession();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
