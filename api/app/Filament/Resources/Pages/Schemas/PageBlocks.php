<?php

namespace App\Filament\Resources\Pages\Schemas;

use App\Filament\Support\Translatable;
use Filament\Forms\Components\Builder\Block;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Radio;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;

/**
 * The page content blocks, exactly as listed in `docs/data-model.md` (pages.content):
 * `rich_text`, `image`, `image_text`, `timeline`, `faq`, `stats`, `quote`, `cta`, `gallery`.
 * Each block's translatable texts are edited pt/en side by side via `Translatable::tabs`;
 * block images use a plain `FileUpload` on the `media` disk, `pages` directory (Ruling R8) —
 * not Spatie Media Library, since block images live inside the `content` JSON, not a
 * model media collection.
 */
class PageBlocks
{
    /** @return array<int, Block> */
    public static function all(): array
    {
        return [
            self::richText(),
            self::image(),
            self::imageText(),
            self::timeline(),
            self::faq(),
            self::stats(),
            self::quote(),
            self::cta(),
            self::gallery(),
        ];
    }

    private static function richText(): Block
    {
        return Block::make('rich_text')
            ->label(__('Rich text'))
            ->schema([
                Translatable::tabs(fn (string $locale): array => [
                    RichEditor::make("body.{$locale}")
                        ->label(__('Body')),
                ]),
            ]);
    }

    private static function image(): Block
    {
        return Block::make('image')
            ->label(__('Image'))
            ->schema([
                FileUpload::make('image')
                    ->label(__('Image'))
                    ->disk('media')
                    ->directory('pages')
                    ->image()
                    ->required(),
                Translatable::tabs(fn (string $locale): array => [
                    TextInput::make("caption.{$locale}")
                        ->label(__('Caption')),
                ]),
            ]);
    }

    private static function imageText(): Block
    {
        return Block::make('image_text')
            ->label(__('Image and text'))
            ->schema([
                FileUpload::make('image')
                    ->label(__('Image'))
                    ->disk('media')
                    ->directory('pages')
                    ->image()
                    ->required(),
                Radio::make('image_position')
                    ->label(__('Image position'))
                    ->options([
                        'left' => __('Left'),
                        'right' => __('Right'),
                    ])
                    ->default('left')
                    ->inline(),
                Translatable::tabs(fn (string $locale): array => [
                    TextInput::make("heading.{$locale}")
                        ->label(__('Heading')),
                    RichEditor::make("body.{$locale}")
                        ->label(__('Body')),
                ]),
            ]);
    }

    private static function timeline(): Block
    {
        return Block::make('timeline')
            ->label(__('Timeline'))
            ->schema([
                Repeater::make('items')
                    ->label(__('Items'))
                    ->schema([
                        TextInput::make('year')
                            ->label(__('Year')),
                        Translatable::tabs(fn (string $locale): array => [
                            TextInput::make("title.{$locale}")
                                ->label(__('Title')),
                            Textarea::make("text.{$locale}")
                                ->label(__('Text')),
                        ]),
                    ])
                    ->reorderable()
                    ->collapsible(),
            ]);
    }

    private static function faq(): Block
    {
        return Block::make('faq')
            ->label(__('FAQ'))
            ->schema([
                Repeater::make('items')
                    ->label(__('Items'))
                    ->schema([
                        Translatable::tabs(fn (string $locale): array => [
                            TextInput::make("question.{$locale}")
                                ->label(__('Question')),
                            Textarea::make("answer.{$locale}")
                                ->label(__('Answer')),
                        ]),
                    ])
                    ->reorderable()
                    ->collapsible(),
            ]);
    }

    private static function stats(): Block
    {
        return Block::make('stats')
            ->label(__('Stats'))
            ->schema([
                Repeater::make('items')
                    ->label(__('Items'))
                    ->schema([
                        TextInput::make('value')
                            ->label(__('Value')),
                        Translatable::tabs(fn (string $locale): array => [
                            TextInput::make("label.{$locale}")
                                ->label(__('Label')),
                        ]),
                    ])
                    ->reorderable()
                    ->collapsible(),
            ]);
    }

    private static function quote(): Block
    {
        return Block::make('quote')
            ->label(__('Quote'))
            ->schema([
                Translatable::tabs(fn (string $locale): array => [
                    Textarea::make("text.{$locale}")
                        ->label(__('Text')),
                ]),
                TextInput::make('author')
                    ->label(__('Author')),
            ]);
    }

    private static function cta(): Block
    {
        return Block::make('cta')
            ->label(__('Call to action'))
            ->schema([
                Translatable::tabs(fn (string $locale): array => [
                    TextInput::make("heading.{$locale}")
                        ->label(__('Heading')),
                    Textarea::make("body.{$locale}")
                        ->label(__('Body')),
                    TextInput::make("label.{$locale}")
                        ->label(__('Label')),
                    TextInput::make("url.{$locale}")
                        ->label(__('URL'))
                        ->url(),
                ]),
            ]);
    }

    private static function gallery(): Block
    {
        return Block::make('gallery')
            ->label(__('Gallery'))
            ->schema([
                FileUpload::make('images')
                    ->label(__('Images'))
                    ->disk('media')
                    ->directory('pages')
                    ->image()
                    ->multiple()
                    ->reorderable(),
                Translatable::tabs(fn (string $locale): array => [
                    TextInput::make("caption.{$locale}")
                        ->label(__('Caption')),
                ]),
            ]);
    }
}
