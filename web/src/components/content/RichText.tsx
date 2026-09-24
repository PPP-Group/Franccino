/**
 * Renders HTML already sanitized by the API (product descriptions, page
 * content, etc.) via `dangerouslySetInnerHTML`. No sanitization happens
 * here — see `docs/api.md` for the contract's guarantee that this HTML is
 * safe to render as-is.
 */

type RichTextProps = {
  html: string | null;
  className?: string;
};

export function RichText({ html, className }: RichTextProps) {
  if (!html) {
    return null;
  }

  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
