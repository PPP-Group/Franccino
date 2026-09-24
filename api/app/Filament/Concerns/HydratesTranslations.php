<?php

namespace App\Filament\Concerns;

/**
 * Replaces every translatable attribute's value with the full `getTranslations()`
 * array before the edit form is filled, so the pt/en tabs each show the record's
 * value for that locale instead of only the current app locale's translation.
 *
 * Used by `EditRecord` pages of resources whose model uses
 * `Spatie\Translatable\HasTranslations`.
 */
trait HydratesTranslations
{
    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function mutateFormDataBeforeFill(array $data): array
    {
        $record = $this->getRecord();

        // @phpstan-ignore method.notFound (only used on models with `HasTranslations`)
        foreach ($record->getTranslatableAttributes() as $attribute) {
            // @phpstan-ignore method.notFound (only used on models with `HasTranslations`)
            $data[$attribute] = $record->getTranslations($attribute);
        }

        return $data;
    }
}
