import type { MetadataRoute } from 'next';
import { getAllPorts } from './data/providers';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.portservicefinder.com';
  const today = new Date();

  // Static pages
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
  ];

  // Dynamic port pages — one URL per port slug
  const allPorts = getAllPorts();
  const portPages: MetadataRoute.Sitemap = allPorts.map((p) => ({
    url: `${baseUrl}/ports/${p.slug}`,
    lastModified: today,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...portPages];
}
