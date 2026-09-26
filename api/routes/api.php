<?php

use App\Http\Controllers\Api\V1;
use Illuminate\Support\Facades\Route;

// `no-store` must be outermost so it also catches errors from `content.locale`
// (422 on a bad `locale`) and `throttle:api-read` (429) — see NoStoreCache.
Route::prefix('v1')->name('api.v1.')->middleware(['no-store', 'content.locale'])->group(function () {
    Route::middleware('throttle:api-read')->group(function () {
        Route::get('areas', [V1\AreaController::class, 'index'])->name('areas.index');
        Route::get('areas/{key}', [V1\AreaController::class, 'show'])->name('areas.show');
        Route::get('categories', [V1\CategoryController::class, 'index'])->name('categories.index');
        Route::get('categories/{slug}', [V1\CategoryController::class, 'show'])->name('categories.show');
        Route::get('products', [V1\ProductController::class, 'index'])->name('products.index');
        Route::get('products/facets', V1\ProductFacetController::class)->name('products.facets');
        Route::get('products/{slug}', [V1\ProductController::class, 'show'])->name('products.show');
        Route::get('search', V1\SearchController::class)->name('search');
    });
});
