import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Settings } from '@/lib/api/types';
import { NewsletterForm } from '@/components/forms/NewsletterForm';

type SiteFooterProps = {
  settings: Settings;
};

export async function SiteFooter({ settings }: SiteFooterProps) {
  const t = await getTranslations('footer');
  const tCommon = await getTranslations('common');
  const year = new Date().getFullYear();

  const hasContact = settings.contact_email || settings.contact_phone || settings.whatsapp;

  return (
    <footer>
      {(hasContact || settings.social_links.length > 0) && (
        <section aria-labelledby="footer-contact-heading">
          <h2 id="footer-contact-heading">{t('contactHeading')}</h2>
          <ul>
            {settings.contact_email && (
              <li>
                <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>
              </li>
            )}
            {settings.contact_phone && (
              <li>
                <a href={`tel:${settings.contact_phone}`}>{settings.contact_phone}</a>
              </li>
            )}
            {settings.whatsapp && (
              <li>
                <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}>{settings.whatsapp}</a>
              </li>
            )}
            {settings.social_links.map((link) => (
              <li key={link.url}>
                <a href={link.url}>{link.platform}</a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {settings.footer_documents.length > 0 && (
        <section aria-labelledby="footer-documents-heading">
          <h2 id="footer-documents-heading">{t('documentsHeading')}</h2>
          <ul>
            {settings.footer_documents.map((document) => (
              <li key={document.url}>
                <a href={document.url}>{document.title}</a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="footer-newsletter-heading">
        <h2 id="footer-newsletter-heading">{t('newsletterHeading')}</h2>
        <NewsletterForm source="footer" />
      </section>

      <nav aria-label={t('legalNavigation')}>
        <ul>
          <li>
            <Link href="/privacy">{t('privacy')}</Link>
          </li>
          <li>
            <Link href="/terms">{t('terms')}</Link>
          </li>
        </ul>
      </nav>

      <p>
        {tCommon('siteName')} © {year}
      </p>
      <p>{t('rightsReserved')}</p>
    </footer>
  );
}
