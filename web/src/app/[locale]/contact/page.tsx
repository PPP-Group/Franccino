import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactChannels } from '@/components/contact/ContactChannels';
import { Blocks } from '@/components/content/Blocks';
import { ContactForm } from '@/components/forms/ContactForm';
import { PageHead } from '@/components/layout/PageHead';
import type { Locale } from '@/i18n/config';
import { getPage, getSettings } from '@/lib/api/content';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: 'contactPage' }),
    getPage(locale as Locale, 'contact'),
  ]);
  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/contact' },
    title: page?.seo.title ?? page?.title ?? t('title'),
    description: page?.seo.description ?? page?.intro,
    image: page?.seo.image ?? page?.cover,
  });
}

export default async function ContactPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [t, page, settings] = await Promise.all([
    getTranslations({ locale, namespace: 'contactPage' }),
    getPage(locale, 'contact'),
    getSettings(locale),
  ]);
  return (
    <main className="wrap">
      <PageHead title={page?.title ?? t('title')} lead={page?.intro} />
      <div className="contact-layout">
        <aside aria-labelledby="contact-channels">
          <h2 id="contact-channels" className="section-title">
            {t('channelsTitle')}
          </h2>
          <ContactChannels settings={settings} />
        </aside>
        <section className="quote-form" aria-labelledby="contact-form-title">
          <h2 id="contact-form-title">{t('formTitle')}</h2>
          <ContactForm typeSelectable />
        </section>
      </div>
      {page ? <Blocks blocks={page.content} /> : null}
    </main>
  );
}
