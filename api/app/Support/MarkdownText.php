<?php

namespace App\Support;

/**
 * Visitor text shown inside a Markdown e-mail (`mail.contact-message-received`): Blade already escapes HTML, this
 * escapes the Markdown syntax too, so a message can't turn into a disguised link or heading in the team's inbox.
 */
final class MarkdownText
{
    public static function escape(?string $text): string
    {
        // Only what makes links, emphasis, headings, tables or HTML: the plain-text copy of the e-mail shows the
        // backslashes, so the list stays short.
        return (string) preg_replace('/([\\\\`*_\[\]<>#|])/', '\\\\$1', (string) $text);
    }
}
