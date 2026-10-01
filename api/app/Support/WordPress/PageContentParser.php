<?php

namespace App\Support\WordPress;

use Dom\Element;
use Dom\HTMLDocument;

/**
 * Reads the text of an institutional page of the current site (Elementor markup) for the `pages.content`
 * blocks: headings, paragraphs and lists become a `rich_text` body; the carousel whose slides open with a
 * year becomes a `timeline`. Only text is copied; layout, icons and images stay behind.
 */
final class PageContentParser
{
    private const TEXT_NODES = 'h1, h2, h3, h4, h5, h6, p, li';

    /**
     * Headings, paragraphs and lists in page order, up to the heading `$stopAt` (case-insensitive) and
     * skipping carousels. `null` when the page has no text.
     */
    public function richText(string $html, ?string $stopAt = null): ?string
    {
        $parts = [];
        $list = [];
        $last = null;
        foreach ($this->document($html)->querySelectorAll(self::TEXT_NODES) as $node) {
            if ($node->closest('.swiper') !== null || self::insideListItem($node)) {
                continue;
            }
            $text = self::text($node);
            if ($text === '' || $text === $last) {
                continue;
            }
            $last = $text;
            if ($node->localName === 'li') {
                $list[] = '<li>'.e($text).'</li>';

                continue;
            }
            if ($list !== []) {
                $parts[] = '<ul>'.implode('', $list).'</ul>';
                $list = [];
            }
            if ($node->localName === 'p') {
                $parts[] = '<p>'.e($text).'</p>';

                continue;
            }
            if ($stopAt !== null && mb_strtolower($text) === mb_strtolower($stopAt)) {
                break;
            }
            $tag = in_array($node->localName, ['h1', 'h2'], true) ? 'h2' : 'h3';
            $parts[] = "<{$tag}>".e(self::sentenceCase($text))."</{$tag}>";
        }
        if ($list !== []) {
            $parts[] = '<ul>'.implode('', $list).'</ul>';
        }

        return $parts === [] ? null : implode("\n", $parts);
    }

    /**
     * Slides of the longest carousel whose slides open with a year: the year, the next text as title and
     * the remaining texts (one per line).
     *
     * @return list<array{year: string, title: string, text: string}>
     */
    public function timeline(string $html): array
    {
        $best = [];
        foreach ($this->document($html)->querySelectorAll('.swiper') as $carousel) {
            $items = [];
            foreach ($carousel->querySelectorAll('.swiper-slide') as $slide) {
                $texts = [];
                foreach ($slide->querySelectorAll(self::TEXT_NODES) as $node) {
                    $text = self::text($node);
                    if ($text !== '' && ! self::insideListItem($node)) {
                        $texts[] = $text;
                    }
                }
                if ($texts === [] || ! preg_match('/^\d{4}$/', $texts[0])) {
                    continue;
                }
                $items[] = [
                    'year' => $texts[0],
                    'title' => $texts[1] ?? '',
                    'text' => implode("\n", array_slice($texts, 2)),
                ];
            }
            if (count($items) >= count($best)) {
                $best = $items;
            }
        }

        return $best;
    }

    private function document(string $html): HTMLDocument
    {
        return HTMLDocument::createFromString('<!DOCTYPE html><html><body>'.$html.'</body></html>', LIBXML_NOERROR);
    }

    private static function insideListItem(Element $node): bool
    {
        return $node->localName !== 'li' && $node->parentElement?->closest('li') !== null;
    }

    private static function text(Element $node): string
    {
        return trim((string) preg_replace('/[\s\x{00A0}]+/u', ' ', (string) $node->textContent));
    }

    /** "NOSSA HISTÓRIA" and "quem somos" become "Nossa história" and "Quem somos"; mixed case is kept. */
    private static function sentenceCase(string $text): string
    {
        if ($text !== mb_strtoupper($text) && $text !== mb_strtolower($text)) {
            return $text;
        }

        return mb_strtoupper(mb_substr($text, 0, 1)).mb_strtolower(mb_substr($text, 1));
    }
}
