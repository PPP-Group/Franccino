import type { Settings } from '@/lib/api/types';

/** Usado só quando o build roda sem API (a API está fora do ar e `ALLOW_BUILD_WITHOUT_API=true`). */
export const EMPTY_SETTINGS: Settings = {
  company_name: 'Franccino',
  contact_email: null,
  contact_phone: null,
  factory_address: null,
  quotes_whatsapp: null,
  assistance_whatsapp: null,
  assistance_phone: null,
  instagram_url: null,
  facebook_url: null,
  pinterest_url: null,
  linkedin_url: null,
  youtube_url: null,
  footer_documents: [],
};

export type SocialPlatform = 'instagram' | 'facebook' | 'pinterest' | 'linkedin' | 'youtube';

const SOCIAL_FIELDS: [SocialPlatform, keyof Settings][] = [
  ['instagram', 'instagram_url'],
  ['facebook', 'facebook_url'],
  ['pinterest', 'pinterest_url'],
  ['linkedin', 'linkedin_url'],
  ['youtube', 'youtube_url'],
];

/** Redes sociais com URL cadastrada, na ordem acima. */
export function socialLinks(settings: Settings): { platform: SocialPlatform; url: string }[] {
  return SOCIAL_FIELDS.flatMap(([platform, field]) => {
    const url = settings[field];
    return typeof url === 'string' && url ? [{ platform, url }] : [];
  });
}
