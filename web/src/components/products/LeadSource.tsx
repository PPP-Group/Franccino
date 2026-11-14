'use client';

import { useEffect } from 'react';
import { setLeadSource } from '@/components/layout/navigation-motion';
import type { ProductCard } from '@/lib/api/types';

/**
 * Avisa ao controle da navegação que a página desta peça está aberta, com os endereços das listagens que a contêm
 * (área, categoria, coleções, designer, lançamentos, todas as peças). Um link para uma delas, de qualquer lugar da
 * página (caminho, menu, rodapé), faz a foto da peça encolher até o primeiro lugar da lista (`LeadPlate`). Não desenha
 * nada.
 */
export function LeadSource({ card, morph, paths }: { card: ProductCard; morph: string; paths: string[] }) {
  const key = paths.join('|');
  useEffect(() => {
    setLeadSource({ card, morph, paths: key.split('|') });
    return () => setLeadSource(null);
  }, [card, morph, key]);
  return null;
}
