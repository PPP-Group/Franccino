<?php

namespace App\Filament\Support;

use App\Support\WebpImage;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

/**
 * How every upload field of the panel looks and behaves (revisão de 17/11/2026: "a imagem fica esticada, com um X e um
 * nome esquisito"; "mover e cortar antes de subir"; "a galeria com as fotos uma em cima da outra"):
 *  - photos in small squares side by side, never stretched over the form;
 *  - the editor to crop, turn and reframe a photo before saving (Filament's own, no new dependency);
 *  - the file keeps the name it had on the computer, and the hint above says what is accepted (every photo is saved
 *    as WebP by ConvertImageToWebp, whatever the format sent);
 *  - video and 3D files show only the name and size.
 */
class PanelUploads
{
    public static function configure(SpatieMediaLibraryFileUpload $upload): SpatieMediaLibraryFileUpload
    {
        return $upload
            ->disk(config('media-library.disk_name'))
            ->preserveFilenames()
            ->panelLayout(fn (SpatieMediaLibraryFileUpload $component): ?string => self::isPhoto($component) ? 'grid' : null)
            ->imageEditor(fn (SpatieMediaLibraryFileUpload $component): bool => self::isPhoto($component) && ! self::acceptsSvg($component))
            ->imageEditorAspectRatioOptions([null, '16:9', '3:2', '4:3', '1:1', '4:5'])
            ->extraAttributes(fn (SpatieMediaLibraryFileUpload $component): array => [
                'class' => self::isPhoto($component) ? 'fr-upload fr-upload--photo' : 'fr-upload fr-upload--file',
            ], merge: true)
            ->hint(fn (SpatieMediaLibraryFileUpload $component): ?string => self::isPhoto($component)
                ? __(self::acceptsSvg($component) ? 'SVG, PNG, JPG or WebP. Photos are saved as WebP.' : 'JPG, PNG or WebP. Saved as WebP, lighter and with the same quality.')
                : null)
            ->hintIcon(fn (SpatieMediaLibraryFileUpload $component): ?string => self::isPhoto($component) ? 'heroicon-o-photo' : null);
    }

    /** A field that only takes images (cover, gallery, logo, swatch), not video, 3D or documents. */
    public static function isPhoto(SpatieMediaLibraryFileUpload $component): bool
    {
        $types = $component->getAcceptedFileTypes() ?? [];

        return $types !== [] && collect($types)->every(fn (string $type): bool => str_starts_with($type, 'image/'));
    }

    private static function acceptsSvg(SpatieMediaLibraryFileUpload $component): bool
    {
        return in_array('image/svg+xml', $component->getAcceptedFileTypes() ?? [], true);
    }

    /**
     * Photo field that is not in the media library (the page blocks): the same look, the editor, and the photo saved
     * as WebP in the field's own folder.
     */
    public static function photo(FileUpload $upload): FileUpload
    {
        return $upload
            ->image()
            ->panelLayout('grid')
            ->imageEditor()
            ->imageEditorAspectRatioOptions([null, '16:9', '3:2', '4:3', '1:1', '4:5'])
            ->extraAttributes(['class' => 'fr-upload fr-upload--photo'], merge: true)
            ->hint(__('JPG, PNG or WebP. Saved as WebP, lighter and with the same quality.'))
            ->hintIcon('heroicon-o-photo')
            ->saveUploadedFileUsing(static fn (FileUpload $component, TemporaryUploadedFile $file): string => WebpImage::store(
                $component->getDiskName(),
                trim($component->getDirectory().'/'.$component->getUploadedFileNameForStorage($file), '/'),
                $file->get(),
                $file->getMimeType(),
            ));
    }
}
