<?php

namespace App\Filament\Support;

use App\Models\Area;
use App\Models\Banner;
use App\Models\Collection;
use App\Models\Page;
use App\Models\Project;
use App\Models\Scene;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Where a photo of the site is, in words the panel uses ("Projeto Clara Arte · galeria"), and which photos can carry
 * clickable points (revisão de 17/11/2026: "pontos clicáveis em toda foto que sobe, e Ambientes organizado").
 */
class PhotoPlaces
{
    /** Photo collections the site draws points on, per model (web/src/components/media/PhotoPoints). */
    public const WITH_POINTS = [
        Project::class => ['cover', 'gallery'],
        Collection::class => ['cover', 'gallery'],
        Area::class => ['cover'],
        Page::class => ['cover'],
    ];

    public static function describe(?Media $media): string
    {
        if ($media === null) {
            return __('Photo removed');
        }
        $owner = $media->model;
        $kind = match (true) {
            $owner instanceof Project => __('Project'),
            $owner instanceof Collection => __('Collection'),
            $owner instanceof Area => __('Area'),
            $owner instanceof Page => __('Page'),
            $owner instanceof Banner => __('Banner'),
            default => class_basename($media->model_type),
        };

        return trim($kind.' '.self::name($owner)).' · '.self::collection($media->collection_name);
    }

    /** Where a scene shows on the site. */
    public static function forScene(Scene $scene): string
    {
        if ($scene->photo_media_id !== null) {
            return self::describe($scene->photo);
        }
        if ($scene->project !== null) {
            return __('Project').' '.self::name($scene->project).' · '.__('Corporate strip and project page');
        }

        return __('Home page · Scenes section');
    }

    /** @return list<Media> the photos of a record that can carry points, in the panel order */
    public static function photosOf(Model $record): array
    {
        $collections = self::WITH_POINTS[$record::class] ?? [];
        if ($collections === [] || ! method_exists($record, 'getMedia')) {
            return [];
        }

        return collect($collections)
            ->flatMap(fn (string $collection) => $record->getMedia($collection))
            ->filter(fn (Media $media): bool => str_starts_with((string) $media->mime_type, 'image/'))
            ->values()
            ->all();
    }

    private static function collection(string $name): string
    {
        return match ($name) {
            'cover' => __('cover'),
            'gallery' => __('gallery'),
            'image', 'image_mobile' => __('photo'),
            default => $name,
        };
    }

    private static function name(?Model $owner): string
    {
        if ($owner === null) {
            return '';
        }
        foreach (['title', 'name'] as $attribute) {
            if (method_exists($owner, 'getTranslation') && in_array($attribute, $owner->translatable ?? [], true)) {
                return (string) $owner->getTranslation($attribute, 'pt', false);
            }
            if (filled($owner->getAttribute($attribute))) {
                return (string) $owner->getAttribute($attribute);
            }
        }

        return '#'.$owner->getKey();
    }
}
