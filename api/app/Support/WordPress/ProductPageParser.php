<?php

namespace App\Support\WordPress;

/**
 * Reads what the WordPress REST API does not expose from a product page (JetEngine fields, content
 * inventory §"Campos de produto"): the gallery, the technical table (label → value pairs) and the
 * designer link. Only markup inside the product's own widgets is read; nothing is inferred from text.
 */
final class ProductPageParser
{
    private const LABEL = '/^(medidas?|dimens(ões|oes)|di[aâ]m(e|en)tro|altura|largura|profundidade|materia(is|l|s)|acabamentos?)\b/iu';

    /** @return list<string> full-size image URLs in page order, without repeats */
    public function gallery(string $html): array
    {
        preg_match_all(
            '/class="jet-engine-gallery-(?:slider|grid|justify)__item[^"]*"[^>]*>\s*<a href="([^"]+)"/u',
            $html,
            $matches,
        );

        $urls = [];
        foreach ($matches[1] as $url) {
            $url = html_entity_decode($url, ENT_QUOTES | ENT_HTML5);
            if (! in_array($url, $urls, true) && preg_match('/\.(jpe?g|png|webp)$/i', $url)) {
                $urls[] = $url;
            }
        }

        return $urls;
    }

    /**
     * The technical table: each label ("Medida padrão: Modelo I", "Materiais:") with the value that
     * follows it in the JetEngine dynamic fields.
     *
     * @return list<array{label: string, value: string}>
     */
    public function specs(string $html): array
    {
        preg_match_all('/class="jet-listing-dynamic-field__content"[^>]*>(.*?)<\/div>/su', $html, $matches);
        $texts = array_values(array_filter(array_map(self::text(...), $matches[1]), fn (string $text) => $text !== ''));

        $pairs = [];
        $count = count($texts);
        for ($i = 0; $i < $count - 1; $i++) {
            $label = $texts[$i];
            if (mb_strlen($label) <= 60 && preg_match(self::LABEL, $label) && ! preg_match(self::LABEL, $texts[$i + 1])) {
                $pairs[] = ['label' => rtrim($label, ': '), 'value' => $texts[$i + 1]];
                $i++;
            }
        }

        return $pairs;
    }

    /** Slug of the first designer page linked from the product (the product block comes before related items). */
    public function designerSlug(string $html): ?string
    {
        return preg_match('#href="https?://(?:www\.)?franccino\.com\.br/designer/([a-z0-9-]+)/?"#u', $html, $match)
            ? $match[1]
            : null;
    }

    private static function text(string $html): string
    {
        $html = (string) preg_replace('/<br\s*\/?>/i', "\n", $html);
        $text = html_entity_decode(strip_tags($html), ENT_QUOTES | ENT_HTML5);

        return trim((string) preg_replace('/[ \t\x{00A0}]+/u', ' ', $text));
    }
}
