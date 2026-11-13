<?php

namespace App\Queries;

use App\Models\Product;
use App\Support\ContentLocale;
use Illuminate\Support\Collection;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Capa de reserva de cada categoria sem capa no painel: a capa da primeira peça dela, na ordem da listagem (destaque
 * primeiro, depois a ordem das peças e o nome, como em `ProductQuery`). Serve ao filtro de categoria do catálogo, que
 * mostra uma foto ao passar o mouse (retornos de 12 e 13/11/2026).
 */
class CategorySampleCovers
{
    /**
     * @param  Collection<int, int>  $categoryIds
     * @return Collection<int, Media> capa por `category_id`
     */
    public static function for(Collection $categoryIds, ?int $areaId = null): Collection
    {
        if ($categoryIds->isEmpty()) {
            return collect();
        }

        $locale = app(ContentLocale::class)->current();

        return Product::published()
            ->when($areaId, fn ($query) => $query->where('area_id', $areaId))
            ->whereIn('category_id', $categoryIds)
            ->whereHas('media', fn ($query) => $query->where('collection_name', 'cover'))
            ->with('media')
            ->orderByDesc('is_featured')
            ->orderBy('sort_order')
            ->orderBy("name->{$locale}")
            ->orderBy('id')
            ->get()
            ->unique('category_id')
            ->mapWithKeys(fn (Product $product) => [$product->category_id => $product->getFirstMedia('cover')])
            ->filter();
    }
}
