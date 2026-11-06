import { IconBrandFacebook, IconBrandInstagram, IconBrandWhatsapp } from '@tabler/icons-react';

const ICONS = {
  whatsapp: IconBrandWhatsapp,
  instagram: IconBrandInstagram,
  facebook: IconBrandFacebook,
} as const;

export type BrandName = keyof typeof ICONS;

/**
 * Ícones oficiais das marcas (Tabler Icons, contorno), no lugar de desenhos próprios: o WhatsApp é sempre o logo
 * oficial (retorno de 06/11/2026). Decorativo: o texto do link ou o `aria-label` do botão dá o nome.
 */
export function BrandIcon({ name, size = 20 }: { name: BrandName; size?: number }) {
  const Component = ICONS[name];
  return (
    <Component className="icon icon--brand" size={size} stroke={1.5} aria-hidden="true" focusable="false" />
  );
}
