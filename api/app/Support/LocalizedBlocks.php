<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;

/**
 * Resolves the `pages.content` block list (docs/data-model.md "pages") for the
 * requested locale, for `GET /pages/{key}` (see `PageController`, `PageResource`).
 *
 * Each block is `{type, data}` (matching the shape the Filament `Builder` field
 * — see `App\Filament\Resources\Pages\Schemas\PageBlocks` — stores in the
 * `content` JSON column). This class replaces every `{pt, en}` array inside
 * `data` with the plain string in the requested locale (fallback `pt`, via
 * `Localized::array()`), sanitizes `rich_text.body` and `image_text.body` — the
 * *only* HTML fields in any block, including page `intro`, which is plain text
 * (Ruling R8) — and turns `image` / `images[]` (paths on the `media` disk) into
 * absolute URLs. A `video` block also gets its `embed_url` (YouTube/Vimeo, see
 * `VideoEmbed`), or `null` for any other address.
 */
final class LocalizedBlocks
{
    /**
     * @param  list<array{type: string, data: array<string, mixed>}>  $blocks
     * @return list<array{type: string, data: array<string, mixed>}>
     */
    public static function resolve(array $blocks, ?string $locale = null): array
    {
        $locale ??= app(ContentLocale::class)->current();

        return array_map(
            fn (array $block) => [
                'type' => $block['type'],
                'data' => self::resolveData($block['type'], $block['data'], $locale),
            ],
            $blocks,
        );
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private static function resolveData(string $type, array $data, string $locale): array
    {
        return match ($type) {
            'rich_text' => [
                'body' => RichText::sanitize(Localized::array($data['body'] ?? null, $locale)),
            ],
            'image' => [
                'image' => self::url($data['image'] ?? null),
                'caption' => Localized::array($data['caption'] ?? null, $locale),
            ],
            'image_text' => [
                'image' => self::url($data['image'] ?? null),
                'heading' => Localized::array($data['heading'] ?? null, $locale),
                'body' => RichText::sanitize(Localized::array($data['body'] ?? null, $locale)),
                'image_position' => $data['image_position'] ?? 'left',
            ],
            'timeline' => [
                'items' => array_map(fn (array $item) => [
                    'year' => $item['year'] ?? null,
                    'title' => Localized::array($item['title'] ?? null, $locale),
                    'text' => Localized::array($item['text'] ?? null, $locale),
                ], $data['items'] ?? []),
            ],
            'faq' => [
                'items' => array_map(fn (array $item) => [
                    'question' => Localized::array($item['question'] ?? null, $locale),
                    'answer' => Localized::array($item['answer'] ?? null, $locale),
                ], $data['items'] ?? []),
            ],
            'stats' => [
                'items' => array_map(fn (array $item) => [
                    'value' => $item['value'] ?? null,
                    'label' => Localized::array($item['label'] ?? null, $locale),
                ], $data['items'] ?? []),
            ],
            'quote' => [
                'text' => Localized::array($data['text'] ?? null, $locale),
                'author' => $data['author'] ?? null,
            ],
            'cta' => [
                'heading' => Localized::array($data['heading'] ?? null, $locale),
                'body' => Localized::array($data['body'] ?? null, $locale),
                'label' => Localized::array($data['label'] ?? null, $locale),
                'url' => Localized::array($data['url'] ?? null, $locale),
            ],
            'gallery' => [
                'images' => array_map(fn (?string $path) => self::url($path), $data['images'] ?? []),
                'caption' => Localized::array($data['caption'] ?? null, $locale),
            ],
            'video' => [
                'url' => $data['url'] ?? null,
                'embed_url' => filled($data['url'] ?? null) ? VideoEmbed::url($data['url']) : null,
                'poster' => self::url($data['poster'] ?? null),
                'title' => Localized::array($data['title'] ?? null, $locale),
            ],
            default => $data,
        };
    }

    private static function url(?string $path): ?string
    {
        return $path === null ? null : Storage::disk('media')->url($path);
    }
}
