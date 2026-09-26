<?php

namespace App\Filament\Resources\ContactMessages\Schemas;

use App\Enums\ContactProfession;
use App\Enums\ContactType;
use App\Models\ContactMessage;
use App\Models\Finish;
use App\Models\Product;
use Filament\Infolists\Components\RepeatableEntry;
use Filament\Infolists\Components\RepeatableEntry\TableColumn;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Illuminate\Support\Collection;

class ContactMessageInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make(__('Message'))
                    ->columns(2)
                    ->schema([
                        TextEntry::make('type')
                            ->label(__('Type'))
                            ->badge()
                            ->formatStateUsing(fn (ContactType $state): string => $state->label()),
                        TextEntry::make('locale')
                            ->label(__('Language')),
                        TextEntry::make('name')
                            ->label(__('Name')),
                        TextEntry::make('email')
                            ->label(__('Email')),
                        TextEntry::make('phone')
                            ->label(__('Phone'))
                            ->placeholder('—'),
                        TextEntry::make('company')
                            ->label(__('Company'))
                            ->placeholder('—'),
                        TextEntry::make('profession')
                            ->label(__('Profession'))
                            ->formatStateUsing(fn (?ContactProfession $state): ?string => $state?->label())
                            ->placeholder('—'),
                        TextEntry::make('city')
                            ->label(__('City'))
                            ->placeholder('—'),
                        TextEntry::make('state')
                            ->label(__('State'))
                            ->placeholder('—'),
                        TextEntry::make('product.name')
                            ->label(__('Product'))
                            ->placeholder('—'),
                        TextEntry::make('consent_at')
                            ->label(__('Consented at'))
                            ->dateTime(),
                        TextEntry::make('read_at')
                            ->label(__('Read at'))
                            ->dateTime()
                            ->placeholder(__('Not read yet')),
                        TextEntry::make('message')
                            ->label(__('Message'))
                            ->columnSpanFull(),
                    ]),
                Section::make(__('Items'))
                    ->visible(fn (ContactMessage $record): bool => filled($record->items))
                    ->schema([
                        RepeatableEntry::make('items')
                            ->hiddenLabel()
                            ->state(fn (ContactMessage $record): array => self::items($record))
                            ->table([
                                TableColumn::make(__('Product')),
                                TableColumn::make(__('Quantity')),
                                TableColumn::make(__('Finishes')),
                                TableColumn::make(__('Note')),
                            ])
                            ->schema([
                                TextEntry::make('product')
                                    ->hiddenLabel(),
                                TextEntry::make('quantity')
                                    ->hiddenLabel(),
                                TextEntry::make('finishes')
                                    ->hiddenLabel(),
                                TextEntry::make('note')
                                    ->hiddenLabel()
                                    ->placeholder('—'),
                            ]),
                    ]),
            ]);
    }

    /**
     * Resolves each item's product and finishes with a single query per lookup
     * (not one per item), tolerating products/finishes deleted since the message
     * was sent by showing their id with a "removed" label (Ruling R6).
     *
     * @return array<int, array<string, string|int|null>>
     */
    private static function items(ContactMessage $record): array
    {
        $items = collect($record->items ?? []);

        $productIds = $items->pluck('product_id')->filter()->unique()->values();
        $finishIds = $items->flatMap(fn (array $item): array => $item['finish_ids'] ?? [])
            ->filter()
            ->unique()
            ->values();

        $products = Product::query()->whereIn('id', $productIds)->get()->keyBy('id');
        $finishes = Finish::query()->whereIn('id', $finishIds)->get()->keyBy('id');

        return $items
            ->map(function (array $item) use ($products, $finishes): array {
                $productId = $item['product_id'] ?? null;
                $product = $productId ? $products->get($productId) : null;

                return [
                    'product' => match (true) {
                        $product !== null => $product->name,
                        $productId !== null => __('Removed product (:id)', ['id' => $productId]),
                        default => '—',
                    },
                    'quantity' => $item['quantity'] ?? '—',
                    'finishes' => self::finishesLabel(collect($item['finish_ids'] ?? []), $finishes),
                    'note' => $item['note'] ?? null,
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @param  Collection<int, int>  $finishIds
     * @param  Collection<int, Finish>  $finishes
     */
    private static function finishesLabel(Collection $finishIds, Collection $finishes): string
    {
        $labels = $finishIds
            ->map(function (int $finishId) use ($finishes): string {
                $finish = $finishes->get($finishId);

                return $finish !== null
                    ? "{$finish->name} ({$finish->code})"
                    : __('Removed finish (:id)', ['id' => $finishId]);
            });

        return $labels->isNotEmpty() ? $labels->implode(', ') : '—';
    }
}
