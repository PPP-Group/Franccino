import type { MetadataRoute } from 'next';
import { defaultLocale, locales } from '@/i18n/config';
import { getSitemap } from '@/lib/api/content';
import { sitemapEntries } from '@/lib/seo/sitemap';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getSitemap(defaultLocale);
  return sitemapEntries(entries, locales);
}
