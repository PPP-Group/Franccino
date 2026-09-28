<?php

use App\Jobs\RevalidateFrontend;
use App\Models\Product;
use App\Settings\GeneralSettings;
use App\Support\FrontendRevalidator;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Http;

beforeEach(fn () => config([
    'franccino.frontend.revalidate_url' => 'http://front.test/api/revalidate',
    'franccino.frontend.revalidate_secret' => 's3cret',
]));

it('dispatches a single job with unique tags', function () {
    Bus::fake([RevalidateFrontend::class]);

    Product::factory()->count(2)->create();
    app(FrontendRevalidator::class)->flush();

    Bus::assertDispatchedTimes(RevalidateFrontend::class, 1);
    Bus::assertDispatched(RevalidateFrontend::class, fn ($job) => collect($job->tags)->sort()->values()->all() === ['areas', 'categories', 'home', 'products']);
});

it('posts the tags with the secret', function () {
    Http::fake(['front.test/*' => Http::response(['revalidated' => true])]);

    (new RevalidateFrontend(['products']))->handle();

    Http::assertSent(fn ($request) => $request->url() === 'http://front.test/api/revalidate'
        && $request->header('x-revalidate-secret')[0] === 's3cret'
        && $request['tags'] === ['products']);
});

it('does nothing without a revalidate url', function () {
    config(['franccino.frontend.revalidate_url' => null]);
    Bus::fake([RevalidateFrontend::class]);

    Product::factory()->create();
    app(FrontendRevalidator::class)->flush();

    Bus::assertNotDispatched(RevalidateFrontend::class);
});

it('fails the job on an error response so the queue retries it', function () {
    Http::fake(['front.test/*' => Http::response(['message' => 'Não autorizado.'], 401)]);

    (new RevalidateFrontend(['products']))->handle();
})->throws(RequestException::class);

it('revalidates the owner model tags when its media changes', function () {
    Bus::fake([RevalidateFrontend::class]);
    $product = Product::factory()->create();
    app(FrontendRevalidator::class)->flush();

    $product->addMedia(UploadedFile::fake()->image('cover.jpg', 40, 30))->toMediaCollection('cover');
    app(FrontendRevalidator::class)->flush();

    Bus::assertDispatched(RevalidateFrontend::class, fn ($job) => collect($job->tags)->sort()->values()->all() === ['home', 'products']);
});

it('revalidates the settings tag when the general settings are saved', function () {
    Bus::fake([RevalidateFrontend::class]);

    $settings = app(GeneralSettings::class);
    $settings->contact_recipients = ['vendas@franccino.com.br'];
    $settings->save();
    app(FrontendRevalidator::class)->flush();

    Bus::assertDispatched(RevalidateFrontend::class, fn ($job) => $job->tags === ['settings']);
});
