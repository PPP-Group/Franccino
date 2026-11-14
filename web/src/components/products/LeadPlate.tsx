'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { leadFor } from '@/lib/ui/morph';
import { ProductPlate } from './ProductPlate';

/**
 * Primeiro card da grade quando a lista foi aberta a partir da página de uma peça que está nela (o caminho "Sofás"
 * no Sofá Royale, retorno de 13/11/2026): a foto da peça encolhe até aqui, e o card dela no lugar de sempre some nesse
 * momento, para a peça não aparecer duas vezes. A volta para a peça cresce daqui. Fora dessa navegação não desenha nada.
 */
export function LeadPlate() {
  const pathname = usePathname();
  const [lead] = useState(() => leadFor(pathname));
  if (!lead) {
    return null;
  }
  const slug = lead.card.slug.replace(/[^a-z0-9-]/gi, '');
  const hideOriginal = `.grid-plates > .plate[data-slug="${slug}"]:not(.plate--lead){display:none}`;
  return (
    <>
      <style>{hideOriginal}</style>
      <ProductPlate product={lead.card} morph={lead.morph} className="plate--lead" priority />
    </>
  );
}
