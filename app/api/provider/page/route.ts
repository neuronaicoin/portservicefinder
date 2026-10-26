import { NextResponse } from 'next/server';
import { getListedProvidersFresh, getListedProviders } from '@/lib/providers-db';
import { shareText } from '@/lib/share-email';
import { siteConfig } from '@/lib/site-config';

/** The public company page of a listing (for the share box in the provider dashboard). */
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  let p = (await getListedProviders()).find((x) => x.id === id);
  if (!p) p = (await getListedProvidersFresh()).find((x) => x.id === id);
  if (!p) return NextResponse.json({ listed: false });
  return NextResponse.json({
    listed: true,
    url: `${siteConfig.url}/providers/${p.slug}`,
    name: p.name,
    text: shareText(p),
  });
}
