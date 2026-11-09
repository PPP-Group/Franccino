'use client';

import { useRouter } from 'next/navigation';
import type { FormEvent, ReactNode } from 'react';

/**
 * Formulário de filtro (GET) que troca só a lista, sem recarregar a página (retorno de 09/11/2026): o envio vira uma
 * navigation do roteador para o mesmo endereço com a busca nova, sem rolar; a lista remonta e as peças entram de novo
 * com a revelação. Sem JavaScript, continua um formulário GET comum (`action`).
 */
export function FilterForm({
  action,
  className,
  role,
  children,
}: {
  /** Caminho público da listagem; sem ele, a página atual. */
  action?: string;
  className?: string;
  role?: string;
  children: ReactNode;
}) {
  const router = useRouter();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = new URLSearchParams();
    new FormData(event.currentTarget).forEach((value, name) => {
      if (typeof value === 'string' && value.trim() !== '') query.append(name, value);
    });
    const path = action ?? window.location.pathname;
    const search = query.toString();
    router.push(search ? `${path}?${search}` : path, { scroll: false });
  }

  return (
    <form className={className} action={action} method="get" role={role} onSubmit={onSubmit}>
      {children}
    </form>
  );
}
