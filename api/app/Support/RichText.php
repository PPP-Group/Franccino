<?php

namespace App\Support;

use Symfony\Component\HtmlSanitizer\HtmlSanitizer;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig;

final class RichText
{
    private static ?HtmlSanitizer $sanitizer = null;

    public static function sanitize(?string $html): ?string
    {
        if (blank($html) || blank(strip_tags((string) $html))) {
            return null;
        }

        return self::sanitizer()->sanitize((string) $html);
    }

    private static function sanitizer(): HtmlSanitizer
    {
        return self::$sanitizer ??= new HtmlSanitizer(
            (new HtmlSanitizerConfig)
                ->allowElement('p')->allowElement('br')
                ->allowElement('h2')->allowElement('h3')->allowElement('h4')
                ->allowElement('strong')->allowElement('em')
                ->allowElement('ul')->allowElement('ol')->allowElement('li')
                ->allowElement('blockquote')
                ->allowElement('a', ['href', 'title', 'target', 'rel'])
                ->allowLinkSchemes(['http', 'https', 'mailto', 'tel'])
                ->forceAttribute('a', 'rel', 'noopener noreferrer')
        );
    }
}
