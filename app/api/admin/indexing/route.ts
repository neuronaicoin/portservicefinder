import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/admin-session';
import { BLOG_POSTS } from '@/app/data/blog';

const SITE_URL = 'https://www.portservicefinder.com';

// Get all URLs to be indexed
function getAllUrls(): string[] {
  const urls: string[] = [
    `${SITE_URL}/`,
    `${SITE_URL}/blog`,
    `${SITE_URL}/contact`,
    `${SITE_URL}/about`,
    `${SITE_URL}/faq`,
    `${SITE_URL}/for-providers`,
    `${SITE_URL}/listing-rules`,
    `${SITE_URL}/privacy`,
    `${SITE_URL}/terms`,
    `${SITE_URL}/refund-policy`,
  ];

  // Add all blog posts
  BLOG_POSTS.forEach((post) => {
    urls.push(`${SITE_URL}/blog/${post.slug}`);
  });

  return urls;
}

// Bing IndexNow API - submit URLs
async function submitToBingIndexNow(urls: string[]): Promise<{
  success: boolean;
  message: string;
  status?: number;
}> {
  const indexNowKey = process.env.BING_INDEXNOW_KEY;

  if (!indexNowKey) {
    return {
      success: false,
      message: 'BING_INDEXNOW_KEY not configured in environment',
    };
  }

  try {
    const response = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Host: 'api.indexnow.org',
      },
      body: JSON.stringify({
        host: 'www.portservicefinder.com',
        key: indexNowKey,
        keyLocation: `${SITE_URL}/${indexNowKey}.txt`,
        urlList: urls,
      }),
    });

    if (response.ok || response.status === 200 || response.status === 202) {
      return {
        success: true,
        message: `${urls.length} URLs submitted to Bing IndexNow`,
        status: response.status,
      };
    }

    const text = await response.text();
    return {
      success: false,
      message: `Bing returned ${response.status}: ${text.substring(0, 200)}`,
      status: response.status,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Bing API error: ${error.message}`,
    };
  }
}

// Google sitemap ping (legacy but still works for sitemap discovery)
async function pingGoogleSitemap(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const sitemapUrl = encodeURIComponent(`${SITE_URL}/sitemap.xml`);
    const response = await fetch(
      `https://www.google.com/ping?sitemap=${sitemapUrl}`,
      { method: 'GET' }
    );

    if (response.ok) {
      return {
        success: true,
        message: 'Google sitemap ping successful',
      };
    }

    return {
      success: false,
      message: `Google ping returned ${response.status}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Google ping error: ${error.message}`,
    };
  }
}

// Yandex IndexNow (same protocol as Bing)
async function submitToYandexIndexNow(urls: string[]): Promise<{
  success: boolean;
  message: string;
}> {
  const indexNowKey = process.env.BING_INDEXNOW_KEY;

  if (!indexNowKey) {
    return {
      success: false,
      message: 'IndexNow key not configured',
    };
  }

  try {
    const response = await fetch('https://yandex.com/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        host: 'www.portservicefinder.com',
        key: indexNowKey,
        keyLocation: `${SITE_URL}/${indexNowKey}.txt`,
        urlList: urls,
      }),
    });

    if (response.ok || response.status === 200 || response.status === 202) {
      return {
        success: true,
        message: `${urls.length} URLs submitted to Yandex`,
      };
    }

    return {
      success: false,
      message: `Yandex returned ${response.status}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Yandex error: ${error.message}`,
    };
  }
}

export async function POST(request: NextRequest) {
  // Auth check
  const isAuthenticated = await validateSession();
  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const urls = getAllUrls();

    // Submit to all search engines in parallel
    const [bingResult, googleResult, yandexResult] = await Promise.all([
      submitToBingIndexNow(urls),
      pingGoogleSitemap(),
      submitToYandexIndexNow(urls),
    ]);

    return NextResponse.json({
      success: true,
      totalUrls: urls.length,
      results: {
        bing: bingResult,
        google: googleResult,
        yandex: yandexResult,
      },
      submittedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Indexing error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Server error',
      },
      { status: 500 }
    );
  }
}

// GET request returns URL count for preview
export async function GET(request: NextRequest) {
  const isAuthenticated = await validateSession();
  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const urls = getAllUrls();
  return NextResponse.json({
    success: true,
    totalUrls: urls.length,
    sampleUrls: urls.slice(0, 5),
  });
}
