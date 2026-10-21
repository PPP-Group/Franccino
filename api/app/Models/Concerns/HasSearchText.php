<?php

namespace App\Models\Concerns;

use Illuminate\Support\Str;

/**
 * `search_text`: the searchable names in ASCII lowercase, so "colecao" finds "Coleção" in any database (MySQL's JSON
 * and SQLite compare accents and case byte by byte). Same idea as `products.search_text`; the search normalizes the
 * term the same way (`SearchController`, `ProductQuery`).
 */
trait HasSearchText
{
    /** @return list<string|null> */
    abstract public function searchableTexts(): array;

    public static function normalizeSearch(string $text): string
    {
        return Str::of($text)->ascii()->lower()->squish()->toString();
    }

    protected static function bootHasSearchText(): void
    {
        static::saving(function (self $model): void {
            $model->setAttribute('search_text', static::normalizeSearch(implode(' ', array_filter($model->searchableTexts()))));
        });
    }
}
