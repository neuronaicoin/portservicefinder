// ============================================================
// BLOG POSTS — Modular structure
// ============================================================
// This is the aggregator file for blog posts.
// It combines legacy posts (from ../blog-posts.ts) with new
// individual post files in this directory.
// ============================================================

import {
  BLOG_POSTS as LEGACY_BLOG_POSTS,
  formatBlogDate as legacyFormatBlogDate,
} from '../blog-posts';

// Re-export the BlogPost type for use in individual post files
export type { BlogPost } from '../blog-posts';

// New individual blog posts
import { shanghai } from './shanghai';
import { hongKong } from './hong-kong';

// Aggregated blog posts (legacy + new)
export const BLOG_POSTS = [
  ...LEGACY_BLOG_POSTS,
  shanghai,
  hongKong,
];

// Helper: get all post slugs (for static generation)
export function getAllBlogSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug);
}

// Helper: get post by slug
export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug) || null;
}

// Helper: get recent posts (excluding current)
export function getRelatedPosts(currentSlug: string, limit: number = 3) {
  return BLOG_POSTS.filter((p) => p.slug !== currentSlug).slice(0, limit);
}

// Helper: format date for display
export function formatBlogDate(dateString: string): string {
  return legacyFormatBlogDate(dateString);
}
