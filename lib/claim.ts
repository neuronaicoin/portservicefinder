import { createHmac } from 'node:crypto';

/** Token in the one-click claim link we email to a listed company. */
export function claimToken(slug: string, email: string) {
  return createHmac('sha256', 'psf-claim-v1' + (process.env.CLAIM_SALT || ''))
    .update(`${slug}:${email.trim().toLowerCase()}`)
    .digest('hex')
    .slice(0, 16);
}

export function claimUrl(slug: string, email: string) {
  return `https://www.portservicefinder.com/claim/${slug}?t=${claimToken(slug, email)}`;
}

export function maskEmail(email: string) {
  const [u, d] = email.split('@');
  if (!d) return email;
  return `${u.slice(0, 2)}${'•'.repeat(Math.max(2, u.length - 2))}@${d}`;
}
