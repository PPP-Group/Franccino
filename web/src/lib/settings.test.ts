import { describe, expect, it } from 'vitest';
import { EMPTY_SETTINGS, socialLinks } from './settings';

describe('settings helpers', () => {
  it('lists only the social networks that have a url', () => {
    expect(
      socialLinks({
        ...EMPTY_SETTINGS,
        instagram_url: 'https://www.instagram.com/franccino/',
        youtube_url: '',
        facebook_url: 'https://www.facebook.com/franccino',
      }),
    ).toEqual([
      { platform: 'instagram', url: 'https://www.instagram.com/franccino/' },
      { platform: 'facebook', url: 'https://www.facebook.com/franccino' },
    ]);
    expect(socialLinks(EMPTY_SETTINGS)).toEqual([]);
  });
});
