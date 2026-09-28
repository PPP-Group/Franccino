import type { AnchorHTMLAttributes } from 'react';

type HrefObject = {
  pathname: string;
  params?: Record<string, string | number>;
  query?: Record<string, string | number | undefined>;
};

type MockLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string | HrefObject;
  locale?: string;
};

/** Converte o href tipado do next-intl no caminho interno (sem idioma), para asserções. */
export function hrefToString(href: string | HrefObject): string {
  if (typeof href === 'string') {
    return href;
  }
  let path = href.pathname;
  for (const [key, value] of Object.entries(href.params ?? {})) {
    path = path.replace(`[${key}]`, String(value));
  }
  const query = new URLSearchParams(
    Object.entries(href.query ?? {})
      .filter((entry): entry is [string, string | number] => entry[1] !== undefined)
      .map(([key, value]) => [key, String(value)]),
  ).toString();
  return query ? `${path}?${query}` : path;
}

function MockLink({ href, locale, children, ...rest }: MockLinkProps) {
  return (
    <a href={hrefToString(href)} data-locale={locale} {...rest}>
      {children}
    </a>
  );
}

export const navigationMock = {
  Link: MockLink,
  usePathname: () => '/',
  useRouter: () => ({ push: () => undefined, replace: () => undefined }),
  getPathname: ({ href }: { href: string | HrefObject }) => hrefToString(href),
  redirect: () => undefined,
};
