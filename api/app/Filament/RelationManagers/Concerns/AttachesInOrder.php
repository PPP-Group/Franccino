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
        // Qualified by the pivot table: the related tables have a `sort_order` of their own, and MySQL refuses the
        // ambiguous column (SQLite, in the preview, silently picks one).
        $column = $this->pivotRelationship()->getTable().'.sort_order';

        return $table
            ->recordTitleAttribute($recordTitleAttribute)
            ->reorderable($column)
            ->defaultSort($column)
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
        $relationship = $this->pivotRelationship();
        $next = (int) $relationship->newPivotQuery()->max('sort_order');

        foreach ($ids as $id) {
            $relationship->updateExistingPivot($id, ['sort_order' => ++$next]);
        }
    }

    /** @return BelongsToMany<Model, Model> */
    private function pivotRelationship(): BelongsToMany
    {
        /** @var BelongsToMany<Model, Model> $relationship */
        $relationship = $this->getRelationship();

        return $relationship;
    }
}
