// ============================================================
// BLOG POSTS — Modular structure
// ============================================================
// This is the new aggregator file for blog posts.
// Currently it re-exports everything from ../blog-posts.ts (the legacy file).
// New blog posts will be added as individual files in this directory
// and merged into the BLOG_POSTS array below.
// ============================================================

import {
  BLOG_POSTS as LEGACY_BLOG_POSTS,
  getAllBlogSlugs as legacyGetAllBlogSlugs,
  getBlogPost as legacyGetBlogPost,
  getRelatedPosts as legacyGetRelatedPosts,
  formatBlogDate as legacyFormatBlogDate,
} from '../blog-posts';

// Re-export the BlogPost type for use in individual post files
export type { BlogPost } from '../blog-posts';

// Aggregated blog posts (currently only legacy, new posts will be merged here)
export const BLOG_POSTS = [...LEGACY_BLOG_POSTS];

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
