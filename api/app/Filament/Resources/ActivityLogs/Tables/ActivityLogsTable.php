<?php

namespace App\Filament\Resources\ActivityLogs\Tables;

use App\Models\ActivityLog;
use App\Models\User;
use Filament\Forms\Components\DatePicker;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class ActivityLogsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query) => $query->with('user'))
            ->columns([
                TextColumn::make('created_at')
                    ->label(__('Date'))
                    ->dateTime()
                    ->sortable(),
                TextColumn::make('user.name')
                    ->label(__('User'))
                    ->placeholder('—'),
                TextColumn::make('action')
                    ->label(__('Action'))
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => self::actionLabel($state))
                    ->color(fn (string $state): string => match ($state) {
                        'created' => 'success',
                        'deleted' => 'danger',
                        'login' => 'gray',
                        default => 'info',
                    }),
                TextColumn::make('subject_type')
                    ->label(__('Type'))
                    ->formatStateUsing(fn (?string $state): string => self::typeLabel($state))
                    ->placeholder('—'),
                TextColumn::make('subject_label')
                    ->label(__('Record'))
                    ->placeholder('—')
                    ->searchable(),
                TextColumn::make('changes')
                    ->label(__('Changed fields'))
                    ->formatStateUsing(fn (mixed $state): string => is_array($state) ? implode(', ', $state) : (string) $state)
                    ->limit(60)
                    ->placeholder('—'),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('user_id')
                    ->label(__('User'))
                    ->options(fn (): array => User::query()->orderBy('name')->pluck('name', 'id')->all()),
                SelectFilter::make('action')
                    ->label(__('Action'))
                    ->options(fn (): array => collect(ActivityLog::ACTIONS)->mapWithKeys(fn (string $action) => [$action => self::actionLabel($action)])->all()),
                Filter::make('created_at')
                    ->label(__('Period'))
                    ->schema([
                        DatePicker::make('from')
                            ->label(__('From')),
                        DatePicker::make('until')
                            ->label(__('Until')),
                    ])
                    ->query(fn (Builder $query, array $data): Builder => $query
                        ->when($data['from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('created_at', '>=', $date))
                        ->when($data['until'] ?? null, fn (Builder $query, string $date) => $query->whereDate('created_at', '<=', $date))),
            ]);
    }

    private static function actionLabel(string $action): string
    {
        return match ($action) {
            'created' => __('Created'),
            'updated' => __('Edited'),
            'deleted' => __('Deleted'),
            'login' => __('Signed in'),
            default => $action,
        };
    }

    /** `App\Models\ProductFile` → "File for download"; `settings` → "Settings". */
    private static function typeLabel(?string $type): string
    {
        if ($type === null) {
            return '—';
        }

        return __(match ($type) {
            'settings' => 'Settings',
            'App\Models\ProductFile' => 'File for download',
            'App\Models\MediaLink' => 'Video or link',
            default => Str::headline(class_basename($type)),
        });
    }
}
