<?php

namespace App\Filament\RelationManagers\Concerns;

use Filament\Actions\AttachAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DetachAction;
use Filament\Actions\DetachBulkAction;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Ordered many-to-many lists of the panel (pieces of a collection or a launch, finishes of a piece). The API orders
 * them by the pivot `sort_order`: items are dragged into place, and an attached item goes to the end of the list.
 */
trait AttachesInOrder
{
    protected function orderedTable(Table $table, string $recordTitleAttribute): Table
    {
        return $table
            ->recordTitleAttribute($recordTitleAttribute)
            ->reorderable('sort_order')
            ->defaultSort('sort_order')
            ->headerActions([
                AttachAction::make()
                    ->multiple()
                    ->preloadRecordSelect()
                    ->after(fn (array $data) => $this->appendInOrder((array) $data['recordId'])),
            ])
            ->recordActions([
                DetachAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DetachBulkAction::make(),
                ]),
            ]);
    }

    /** @param  array<int, int|string>  $ids */
    private function appendInOrder(array $ids): void
    {
        /** @var BelongsToMany<Model, Model> $relationship */
        $relationship = $this->getRelationship();
        $next = (int) $relationship->newPivotQuery()->max('sort_order');

        foreach ($ids as $id) {
            $relationship->updateExistingPivot($id, ['sort_order' => ++$next]);
        }
    }
}
