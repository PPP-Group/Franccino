import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo/metadata';
import { serverEnv } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  const { SITE_ENV } = serverEnv();

  if (SITE_ENV === 'production') {
    return {
      rules: { userAgent: '*', allow: '/' },
      sitemap: absoluteUrl('/sitemap.xml'),
    };
  }

  return {
    rules: { userAgent: '*', disallow: '/' },
  };
}
