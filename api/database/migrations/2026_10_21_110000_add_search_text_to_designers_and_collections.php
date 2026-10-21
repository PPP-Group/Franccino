<?php

use App\Models\Collection;
use App\Models\Designer;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Accent-free search for designers and collections, like `products.search_text`. Fills the existing rows. */
return new class extends Migration
{
    public function up(): void
    {
        foreach (['designers', 'collections'] as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->text('search_text')->nullable();
            });
        }

        foreach ([Designer::class, Collection::class] as $model) {
            $model::withoutEvents(fn () => $model::query()->each(function ($record) use ($model) {
                $record->forceFill(['search_text' => $model::normalizeSearch(implode(' ', array_filter($record->searchableTexts())))])->saveQuietly();
            }));
        }
    }

    public function down(): void
    {
        foreach (['designers', 'collections'] as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->dropColumn('search_text');
            });
        }
    }
};
