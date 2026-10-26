import type { MetadataRoute } from 'next';

// Search engines and AI answer engines are welcome on every public page.
const AI_BOTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended', 'Bingbot'];
const PRIVATE = ['/api/', '/admin/', '/for-providers/dashboard', '/for-providers/complete-profile'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: PRIVATE }, ...AI_BOTS.map((userAgent) => ({ userAgent, allow: '/', disallow: PRIVATE }))],
    sitemap: 'https://www.portservicefinder.com/sitemap.xml',
    host: 'https://www.portservicefinder.com',
  };
}
