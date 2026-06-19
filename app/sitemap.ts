import type { MetadataRoute } from 'next';
import { getAllPorts, PROVIDERS } from './data/providers';
import { BLOG_POSTS } from './data/blog';
import { SERVICE_CATEGORIES } from '@/lib/services-config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.portservicefinder.com';
  const today = new Date();

  // ============================================================
  // STATIC PAGES
  // ============================================================
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: today,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/#how`,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/#pricing`,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/for-providers`,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: today,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: today,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: today,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/listing-rules`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // ============================================================
  // PORT PAGES (/ports/[port])
  // ============================================================
  const allPorts = getAllPorts();
  const portPages: MetadataRoute.Sitemap = allPorts.map((p) => ({
    url: `${baseUrl}/ports/${p.slug}`,
    lastModified: today,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // ============================================================
  // PORT × SERVICE PAGES (/ports/[port]/[service])
  // Only include populated combinations (skip empty - they're noindex)
  // ============================================================
  const portServicePages: MetadataRoute.Sitemap = [];

  allPorts.forEach((port) => {
    SERVICE_CATEGORIES.forEach((service) => {
      // Check if this port × service combination has any providers
      const hasProviders = PROVIDERS.some((p) => {
        if (!p.ports.includes(port.name)) return false;

        if (service.type === 'agent') return p.type === 'agent';
        if (service.type === 'chandler') return p.type === 'chandler';
        if (service.type === 'service') {
          if (p.type !== 'service') return false;
          if (service.svcKey && !p.svc.includes(service.svcKey)) return false;
          return true;
        }
        return false;
      });

      // Only add to sitemap if has at least 1 provider
      if (hasProviders) {
        portServicePages.push({
          url: `${baseUrl}/ports/${port.slug}/${service.slug}`,
          lastModified: today,
          changeFrequency: 'weekly' as const,
          priority: 0.75,
        });
      }
    });
  });

  // ============================================================
  // BLOG POSTS (/blog/[slug])
  // ============================================================
  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedDate),
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }));

  // ============================================================
  // COMBINE ALL
  // ============================================================
  return [
    ...staticPages,
    ...portPages,
    ...portServicePages,
    ...blogPages,
  ];
}
