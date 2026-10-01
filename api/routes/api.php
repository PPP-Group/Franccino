<?php

use App\Http\Controllers\Api\V1;
use Illuminate\Support\Facades\Route;

// `no-store` must be outermost so it also catches errors from `content.locale`
// (422 on a bad `locale`) and `throttle:api-read` (429) — see NoStoreCache.
Route::prefix('v1')->name('api.v1.')->middleware(['no-store', 'content.locale'])->group(function () {
    Route::middleware('throttle:api-read')->group(function () {
        Route::get('home', V1\HomeController::class)->name('home');
        Route::get('areas', [V1\AreaController::class, 'index'])->name('areas.index');
        Route::get('areas/{key}', [V1\AreaController::class, 'show'])->name('areas.show');
        Route::get('categories', [V1\CategoryController::class, 'index'])->name('categories.index');
        Route::get('categories/{slug}', [V1\CategoryController::class, 'show'])->name('categories.show');
        Route::get('products', [V1\ProductController::class, 'index'])->name('products.index');
        Route::get('products/facets', V1\ProductFacetController::class)->name('products.facets');
        Route::get('products/{slug}', [V1\ProductController::class, 'show'])->name('products.show');
        Route::get('collections', [V1\CollectionController::class, 'index'])->name('collections.index');
        Route::get('collections/{slug}', [V1\CollectionController::class, 'show'])->name('collections.show');
        Route::get('designers', [V1\DesignerController::class, 'index'])->name('designers.index');
        Route::get('designers/{slug}', [V1\DesignerController::class, 'show'])->name('designers.show');
        Route::get('launches', [V1\LaunchController::class, 'index'])->name('launches.index');
        Route::get('launches/{slug}', [V1\LaunchController::class, 'show'])->name('launches.show');
        Route::get('projects', [V1\ProjectController::class, 'index'])->name('projects.index');
        Route::get('projects/{slug}', [V1\ProjectController::class, 'show'])->name('projects.show');
        Route::get('clients', [V1\ClientController::class, 'index'])->name('clients.index');
        Route::get('stores', [V1\StoreController::class, 'index'])->name('stores.index');
        Route::get('finishes', [V1\FinishController::class, 'index'])->name('finishes.index');
        Route::get('banners', [V1\BannerController::class, 'index'])->name('banners.index');
        Route::get('pages/{key}', [V1\PageController::class, 'show'])->name('pages.show');
        Route::get('settings', V1\SettingsController::class)->name('settings');
        Route::get('downloads', [V1\DownloadController::class, 'index'])->name('downloads.index');
        Route::get('search', V1\SearchController::class)->name('search');
        Route::get('sitemap', V1\SitemapController::class)->name('sitemap');
        Route::get('redirects', [V1\RedirectController::class, 'index'])->name('redirects.index');
    });

    Route::middleware('throttle:api-forms')->group(function () {
        Route::post('contact', V1\ContactController::class)->name('contact');
        Route::post('newsletter', V1\NewsletterController::class)->name('newsletter');
        Route::post('consents', V1\ConsentController::class)->name('consents');
    });

    Route::post('downloads/{file}/link', [V1\DownloadController::class, 'link'])
        ->middleware('throttle:api-downloads')
        ->name('downloads.link');
});
