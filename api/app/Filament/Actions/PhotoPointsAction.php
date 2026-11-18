<?php

namespace App\Filament\Actions;

use App\Filament\Resources\Scenes\SceneResource;
use App\Filament\Support\PhotoPlaces;
use App\Models\Scene;
use Filament\Actions\Action;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * "Pontos nas fotos" on the edit page of a record with photos on the site: every photo of it, with how many points it
 * has; a click opens that photo to mark the pieces (PhotoPoints creates the scene the first time).
 */
class PhotoPointsAction
{
    public static function make(): Action
    {
        return Action::make('photoPoints')
            ->label(__('Points on the photos'))
            ->icon(Heroicon::OutlinedCursorArrowRays)
            ->color('gray')
            ->modalHeading(__('Points on the photos'))
            ->modalDescription(__('Choose a photo to mark the pieces that appear in it. On the site, each point opens the page of the piece.'))
            ->modalSubmitAction(false)
            ->modalCancelActionLabel(__('Close'))
            ->modalWidth('4xl')
            ->visible(fn (Model $record): bool => PhotoPlaces::photosOf($record) !== [])
            ->modalContent(function (Model $record) {
                $photos = PhotoPlaces::photosOf($record);
                $points = Scene::query()
                    ->whereIn('photo_media_id', array_map(fn (Media $media) => $media->getKey(), $photos))
                    ->withCount('hotspots')
                    ->pluck('hotspots_count', 'photo_media_id');

                return view('filament.scenes.photo-points', [
                    'photos' => array_map(fn (Media $media): array => [
                        'url' => SceneResource::getUrl('photo', ['media' => $media->getKey()]),
                        'thumb' => $media->hasGeneratedConversion('w480') ? $media->getUrl('w480') : $media->getUrl(),
                        'label' => PhotoPlaces::describe($media),
                        'points' => (int) ($points[$media->getKey()] ?? 0),
                    ], $photos),
                ]);
            });
    }
}
