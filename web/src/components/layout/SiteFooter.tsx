import { useTranslations } from 'next-intl';
import { NewsletterForm } from '@/components/forms/NewsletterForm';
import { BrandIcon } from '@/components/ui/BrandIcon';
import { Link } from '@/i18n/navigation';
import type { Settings } from '@/lib/api/types';
import { telHref, whatsappUrl } from '@/lib/contact-links';
import { socialLinks } from '@/lib/settings';
import { BackToTop } from './BackToTop';
import { Logo } from './Logo';
import { VortexMark } from './VortexMark';

export function SiteFooter({ settings }: { settings: Settings }) {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');
  const common = useTranslations('common');
  const quotes = whatsappUrl(settings.quotes_whatsapp);
  const assistance = whatsappUrl(settings.assistance_whatsapp);
  // String: como número, o ICU formataria "2.026" em pt-BR.
  const year = String(new Date().getFullYear());

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link className="wordmark" href="/" aria-label={t('wordmark')}>
              <Logo />
            </Link>
            {settings.factory_address ? (
              <p className="footer-muted">{t('factory', { address: settings.factory_address })}</p>
            ) : null}
            <p className="footer-contacts">
              {settings.contact_phone ? (
                <a href={telHref(settings.contact_phone)}>{settings.contact_phone}</a>
              ) : null}
              {settings.contact_email ? (
                <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>
              ) : null}
            </p>
          </div>

          <section aria-labelledby="footer-catalog-heading">
            <h2 id="footer-catalog-heading" className="footer-title">
              {t('catalog')}
            </h2>
            <ul>
              <li>
                <Link href="/indoor">{nav('indoor')}</Link>
              </li>
              <li>
                <Link href="/outdoor">{nav('outdoor')}</Link>
              </li>
              <li>
                <Link href="/launches">{nav('launches')}</Link>
              </li>
              <li>
                <Link href="/collections">{nav('collections')}</Link>
              </li>
              <li>
                <Link href="/finishes">{nav('finishes')}</Link>
              </li>
              <li>
                <Link href="/room-planner">{nav('planner')}</Link>
              </li>
            </ul>
          </section>

          <section aria-labelledby="footer-service-heading">
            <h2 id="footer-service-heading" className="footer-title">
              {t('service')}
            </h2>
            <ul>
              {quotes ? (
                <li>
                  <a className="footer-icon-link" href={quotes} target="_blank" rel="noopener noreferrer">
                    <BrandIcon name="whatsapp" size={18} />
                    {t('quotesWhatsapp')}
                    <span className="visually-hidden">{common('opensInNewWindow')}</span>
                  </a>
                </li>
              ) : null}
              {assistance ? (
                <li>
                  <a className="footer-icon-link" href={assistance} target="_blank" rel="noopener noreferrer">
                    <BrandIcon name="whatsapp" size={18} />
                    {t('assistanceWhatsapp')}
                    <span className="visually-hidden">{common('opensInNewWindow')}</span>
                  </a>
                </li>
              ) : null}
              <li>
                <Link href="/stores">{t('whereToFind')}</Link>
              </li>
              <li>
                <Link href="/downloads">{nav('downloads')}</Link>
              </li>
              <li>
                <Link href="/projects">{nav('projects')}</Link>
              </li>
              <li>
                <Link href="/faq">{nav('faq')}</Link>
              </li>
              <li>
                <Link href="/partner">{nav('partner')}</Link>
              </li>
              <li>
                <Link href="/contact">{nav('contact')}</Link>
              </li>
            </ul>
          </section>

          <section aria-labelledby="footer-newsletter-heading">
            <h2 id="footer-newsletter-heading" className="footer-title">
              {t('newsletter')}
            </h2>
            <NewsletterForm />
          </section>
        </div>

        <div className="footer-base">
          <span className="footer-base__credits">
            <span>{t('copyright', { year, company: settings.company_name })}</span>
            <a
              className="footer-vortex"
              href="https://vortexsystems.tech/"
              rel="noopener"
              target="_blank"
              aria-label={t('vortex')}
            >
              <VortexMark />
            </a>
          </span>
          <ul className="footer-legal" aria-label={t('legal')}>
            <li>
              <Link href="/privacy">{t('privacy')}</Link>
            </li>
            <li>
              <Link href="/terms">{t('terms')}</Link>
            </li>
            <li>
              <Link href="/cookies">{t('cookies')}</Link>
            </li>
            <li>
              <Link href="/site-map">{t('siteMap')}</Link>
            </li>
            {settings.footer_documents.map((document) => (
              <li key={document.url}>
                <a href={document.url}>{document.label}</a>
              </li>
            ))}
            {socialLinks(settings).map((link) => (
              <li key={link.platform}>
                <a className="footer-icon-link" href={link.url} rel="noopener noreferrer" target="_blank">
                  {link.platform === 'instagram' || link.platform === 'facebook' ? (
                    <BrandIcon name={link.platform} size={18} />
                  ) : null}
                  {t(`social.${link.platform}`)}
                  <span className="visually-hidden">{common('opensInNewWindow')}</span>
                </a>
              </li>
            ))}
          </ul>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}
