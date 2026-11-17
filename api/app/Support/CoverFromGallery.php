<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Uma foto da galeria vira a capa (revisões de capa de 06 a 16/11/2026), sem copiar arquivo: a foto troca de coleção
 * (mantém o id) e a capa antiga vai para o fim da galeria, a não ser que a galeria já tenha o mesmo arquivo (aí a capa
 * antiga é uma cópia repetida e sai). Usado pelas listas de capas (`franccino:covers:apply`) e pela API de gestão.
 */
final class CoverFromGallery
{
    public static function belongs(HasMedia&Model $record, Media $media): bool
    {
        return $media->model_type === $record->getMorphClass()
            && (int) $media->model_id === (int) $record->getKey()
            && $media->collection_name === 'gallery';
    }

    public static function apply(HasMedia&Model $record, Media $photo): Media
    {
        $old = $record->getFirstMedia('cover');
        if ($old !== null) {
            $duplicate = $record->getMedia('gallery')->contains(
                fn (Media $item) => $item->isNot($photo) && $item->size === $old->size && $item->mime_type === $old->mime_type,
            );
            if ($duplicate) {
                $old->delete();
            } else {
                $old->collection_name = 'gallery';
                $old->order_column = (int) Media::query()
                    ->where('model_type', $record->getMorphClass())
                    ->where('model_id', $record->getKey())
                    ->where('collection_name', 'gallery')
                    ->max('order_column') + 1;
                $old->save();
            }
        }

        $photo->collection_name = 'cover';
        $photo->save();

        return $photo;
    }
}
