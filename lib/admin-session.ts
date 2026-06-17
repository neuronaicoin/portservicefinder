import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'psf_admin_session';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

interface SessionData {
  authenticated: boolean;
  createdAt: number;
  expiresAt: number;
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be set and at least 32 characters');
  }
  return secret;
}

function signData(data: string): string {
  const secret = getSessionSecret();
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

export async function createSession(): Promise<void> {
  const now = Date.now();
  const sessionData: SessionData = {
    authenticated: true,
    createdAt: now,
    expiresAt: now + SESSION_DURATION,
  };

  const dataStr = JSON.stringify(sessionData);
  const signature = signData(dataStr);
  const token = Buffer.from(dataStr).toString('base64') + '.' + signature;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: SESSION_DURATION / 1000,
    path: '/',
  });
}

export async function validateSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return false;
    }

    const [encodedData, signature] = sessionCookie.value.split('.');
    if (!encodedData || !signature) {
      return false;
    }

    const dataStr = Buffer.from(encodedData, 'base64').toString('utf-8');
    const expectedSignature = signData(dataStr);

    if (signature !== expectedSignature) {
      return false;
    }

    const sessionData: SessionData = JSON.parse(dataStr);

    if (!sessionData.authenticated || Date.now() > sessionData.expiresAt) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Simple in-memory rate limiting (resets on server restart)
const loginAttempts = new Map<string, { count: number; blockedUntil: number }>();

export function checkRateLimit(ip: string): { allowed: boolean; remainingMs?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record) {
    return { allowed: true };
  }

  if (record.blockedUntil > now) {
    return { allowed: false, remainingMs: record.blockedUntil - now };
  }

  // Reset if block expired
  if (record.blockedUntil > 0 && record.blockedUntil <= now) {
    loginAttempts.delete(ip);
  }

  return { allowed: true };
}

export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0, blockedUntil: 0 };

  record.count += 1;

  // Block for 30 minutes after 5 failed attempts
  if (record.count >= 5) {
    record.blockedUntil = now + 30 * 60 * 1000;
    record.count = 0;
  }

  loginAttempts.set(ip, record);
}

export function clearFailedAttempts(ip: string): void {
  loginAttempts.delete(ip);
}
