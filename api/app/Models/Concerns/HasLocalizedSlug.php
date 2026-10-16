<?php

namespace App\Models\Concerns;

use App\Support\Locales;
use Illuminate\Database\Eloquent\Builder;

/**
 * Finds a record by its slug in the requested locale, with the same fallback the API uses for text
 * (`Localized::value`): a record without a slug in that locale is found by its slug in the default locale.
 * Without this, `/en/products/cadeira-aura` (the card shows the `pt` slug when `en` is empty) answered 404.
 */
trait HasLocalizedSlug
{
    /**
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeWhereLocalizedSlug(Builder $query, string $slug, string $locale): Builder
    {
        $default = Locales::default();
        if ($locale === $default) {
            return $query->where("slug->{$default}", $slug);
        }

        return $query->where(fn (Builder $query) => $query
            ->where("slug->{$locale}", $slug)
            ->orWhere(fn (Builder $query) => $query
                ->where("slug->{$default}", $slug)
                ->where(fn (Builder $query) => $query->whereNull("slug->{$locale}")->orWhere("slug->{$locale}", ''))));
    }
}
