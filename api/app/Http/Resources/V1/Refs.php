<?php

namespace App\Http\Resources\V1;

use App\Models\Area;
use App\Models\Category;
use App\Models\Collection as CollectionModel;
use App\Models\Designer;
use App\Models\Line;
use App\Support\ImagePresenter;
use App\Support\Localized;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Builds the small reference shapes (`AreaRef`, `CategoryRef`, ...) and the
 * shared `Seo` shape from docs/api.md, reused across list and detail resources.
 */
final class Refs
{
    /**
     * The page video of a project or collection: the MP4 served by the site's storage and its optional cover
     * (`Image`, whose width and height give the frame its shape: a vertical film keeps 9:16).
     *
     * @return array{url: string, poster: array<string, mixed>|null}|null
     */
    public static function video(HasMedia $model, string $alt): ?array
    {
        $video = $model->getFirstMedia('video');

        return $video === null ? null : [
            'url' => $video->getUrl(),
            'poster' => ImagePresenter::present($model->getFirstMedia('video_poster'), $alt),
        ];
    }

    /** @return array{key: string, name: string, brand_name: string} */
    public static function area(Area $area): array
    {
        return [
            'key' => $area->key->value,
            'name' => Localized::value($area, 'name'),
            'brand_name' => $area->brand_name,
        ];
    }

    /** @return array{id: int, slug: string, name: string, singular_name: string} */
    public static function category(Category $category): array
    {
        return [
            'id' => $category->id,
            'slug' => Localized::value($category, 'slug'),
            'name' => Localized::value($category, 'name'),
            'singular_name' => Localized::value($category, 'singular_name'),
        ];
    }

    /** @return array{id: int, slug: string, name: string}|null */
    public static function designer(?Designer $designer): ?array
    {
        if ($designer === null) {
            return null;
        }

        return [
            'id' => $designer->id,
            'slug' => $designer->slug,
            'name' => $designer->name,
        ];
    }

    /** @return array{id: int, slug: string, name: string}|null */
    public static function line(?Line $line): ?array
    {
        if ($line === null) {
            return null;
        }

        return [
            'id' => $line->id,
            'slug' => $line->slug,
            'name' => $line->name,
        ];
    }

    /** @return array{id: int, slug: string, name: string, year: int|null} */
    public static function collection(CollectionModel $collection): array
    {
        return [
            'id' => $collection->id,
            'slug' => Localized::value($collection, 'slug'),
            'name' => Localized::value($collection, 'name'),
            'year' => $collection->year,
        ];
    }

    /** @return array{title: string|null, description: string|null, image: array|null} */
    public static function seo(Model $model, ?Media $image, string $fallbackTitle): array
    {
        return [
            'title' => Localized::value($model, 'seo_title') ?? $fallbackTitle,
            'description' => Localized::value($model, 'seo_description'),
            'image' => ImagePresenter::present($image, $fallbackTitle),
        ];
    }
}
