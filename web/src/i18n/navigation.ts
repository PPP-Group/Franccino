import { createNavigation } from 'next-intl/navigation';
import type { ComponentProps } from 'react';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);

/** Href aceito pelo `Link` tipado (rota interna ou `{ pathname, params?, query? }`). */
export type AppHref = ComponentProps<typeof Link>['href'];
