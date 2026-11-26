// Blog posts live in src/content/blog/<slug>.tsx: a `meta` export and a
// default component with the body. The list below is the only registry, so
// a post is published by adding it here.

import type { ComponentType } from 'react';
import * as cookieless from '@/content/blog/cookieless-visitor-counting';
import * as architecture from '@/content/blog/how-flarepanel-runs-on-cloudflare';
import * as introducing from '@/content/blog/introducing-flarepanel';
import * as openpanel from '@/content/blog/moving-from-openpanel';

export type PostTag = 'Announcement' | 'Engineering' | 'Privacy' | 'Guides';

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  author: string;
  tags: PostTag[];
}

export interface Post {
  meta: PostMeta;
  Body: ComponentType;
}

const MODULES: { meta: PostMeta; default: ComponentType }[] = [
  introducing,
  architecture,
  cookieless,
  openpanel,
];

/** Newest first. */
export const POSTS: Post[] = MODULES.map((m) => ({
  meta: m.meta,
  Body: m.default,
})).sort((a, b) => b.meta.date.localeCompare(a.meta.date));

export function getPost(slug: string): Post | undefined {
  return POSTS.find((post) => post.meta.slug === slug);
}

export function formatPostDate(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
