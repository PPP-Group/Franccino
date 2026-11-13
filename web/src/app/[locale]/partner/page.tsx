import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Blocks } from '@/components/content/Blocks';
import { ContactForm } from '@/components/forms/ContactForm';
import { PageHead } from '@/components/layout/PageHead';
import type { Locale } from '@/i18n/config';
import { getPage } from '@/lib/api/content';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: 'partnerPage' }),
    getPage(locale as Locale, 'partner'),
  ]);
  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/partner' },
    title: page?.seo.title ?? page?.title ?? t('title'),
    description: page?.seo.description ?? page?.intro ?? t('description'),
    image: page?.seo.image ?? page?.cover,
  });
}

/**
 * "Seja um parceiro" (revisão da Franccino, 12/11/2026, opcional): para quem quer abrir uma loja ou revender. O texto
 * vem do painel (Páginas → Seja um parceiro); o formulário é o de contato, já no assunto "Parceria", e chega na caixa
 * de mensagens do painel como os outros contatos.
 */
export default async function PartnerPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: 'partnerPage' }),
    getPage(locale, 'partner'),
  ]);
  return (
    <main className="wrap page-end">
      <PageHead title={page?.title ?? t('title')} lead={page?.intro ?? t('description')} />
      {page && page.content.length > 0 ? <Blocks blocks={page.content} /> : null}
      <section className="quote-form partner-form" aria-labelledby="partner-form-title">
        <h2 id="partner-form-title" className="form-title">
          {t('formTitle')}
        </h2>
        <ContactForm type="partnership" />
      </section>
    </main>
  );
}
