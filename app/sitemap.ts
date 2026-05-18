import type { MetadataRoute } from 'next';
import { getAllPorts } from './data/providers';
import { BLOG_POSTS } from './data/blog-posts';

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
  ];

  // Dynamic port pages
  const allPorts = getAllPorts();
  const portPages: MetadataRoute.Sitemap = allPorts.map((p) => ({
    url: `${baseUrl}/ports/${p.slug}`,
    lastModified: today,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Dynamic blog post pages
  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedDate),
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }));

  return [...staticPages, ...portPages, ...blogPages];
}
