import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { BrandIcon } from '@/components/ui/BrandIcon';
import type { Settings } from '@/lib/api/types';
import { telHref, whatsappUrl } from '@/lib/contact-links';

type ChannelRow = { key: string; label: string; value: ReactNode };

/** Canais de `GET /settings`; cada linha só aparece se o painel preencheu (D7). */
export function ContactChannels({ settings }: { settings: Settings }) {
  const t = useTranslations('contactPage.channels');
  const common = useTranslations('common');
  // WhatsApp com o símbolo oficial ao lado do texto (nunca o balão desenhado à mão).
  const whatsapp = (href: string, text: string) => (
    <a className="channel-link" href={href} target="_blank" rel="noopener noreferrer">
      <BrandIcon name="whatsapp" size={18} />
      {text}
      <span className="visually-hidden">{common('opensInNewWindow')}</span>
    </a>
  );
  const quotes = whatsappUrl(settings.quotes_whatsapp);
  const assistance = whatsappUrl(settings.assistance_whatsapp);
  const candidates: (ChannelRow | null)[] = [
    settings.contact_phone
      ? {
          key: 'phone',
          label: t('phone'),
          value: <a href={telHref(settings.contact_phone)}>{settings.contact_phone}</a>,
        }
      : null,
    settings.contact_email
      ? {
          key: 'email',
          label: t('email'),
          value: <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>,
        }
      : null,
    quotes ? { key: 'quotes', label: t('quotes'), value: whatsapp(quotes, t('openWhatsapp')) } : null,
    assistance
      ? { key: 'assistance', label: t('assistance'), value: whatsapp(assistance, t('openWhatsapp')) }
      : null,
    settings.assistance_phone
      ? {
          key: 'assistancePhone',
          label: t('assistancePhone'),
          value: <a href={telHref(settings.assistance_phone)}>{settings.assistance_phone}</a>,
        }
      : null,
    settings.factory_address
      ? { key: 'address', label: t('address'), value: settings.factory_address }
      : null,
  ];
  const rows = candidates.filter((row): row is ChannelRow => row !== null);
  if (rows.length === 0) {
    return null;
  }
  return (
    <dl className="facts">
      {rows.map((row) => (
        <div key={row.key}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
