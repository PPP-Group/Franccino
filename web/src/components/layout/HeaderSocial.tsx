import { useTranslations } from 'next-intl';
import { BrandIcon } from '@/components/ui/BrandIcon';
import type { Settings } from '@/lib/api/types';
import { HEADER_SOCIAL, socialLinks } from '@/lib/settings';

/**
 * Instagram, Pinterest e Casoca à direita do menu ("Alterações site", Franccino, 18/11/2026). Só os que têm endereço
 * em Configurações › Redes sociais. O Casoca não tem ícone oficial numa biblioteca de ícones: vai o nome, em caixa alta
 * pequena, como os itens do menu.
 */
export function HeaderSocial({
  settings,
  className = 'header-social',
}: {
  settings: Settings;
  className?: string;
}) {
  const t = useTranslations('footer.social');
  const common = useTranslations('common');
  const links = socialLinks(settings).filter((link) => HEADER_SOCIAL.includes(link.platform));
  if (links.length === 0) {
    return null;
  }
  return (
    <ul className={className}>
      {links.map((link) => (
        <li key={link.platform}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t(link.platform)} (${common('opensInNewWindow')})`}
          >
            {link.platform === 'instagram' || link.platform === 'pinterest' ? (
              <BrandIcon name={link.platform} size={18} />
            ) : (
              <span className="header-social__name">{t(link.platform)}</span>
            )}
          </a>
        </li>
      ))}
    </ul>
  );
}
