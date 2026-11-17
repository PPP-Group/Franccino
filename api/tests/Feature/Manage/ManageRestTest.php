<?php

use App\Filament\Resources\Users\UserResource;
use App\Manage\Areas;
use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\Finish;
use App\Models\Manage\ApiCredential;
use App\Models\Manage\ApiLog;
use App\Models\Product;
use App\Models\Redirect;
use App\Settings\GeneralSettings;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;

/** API de gestão pela REST (docs/api-gestao.md). */
function manageKey(array $scopes = ['pecas:escrever'], string $name = 'Planilha'): string
{
    [, $secret] = ApiCredential::issueKey($name, $scopes, 30, null);

    return $secret;
}

function manage(string $secret): array
{
    return ['Authorization' => 'Bearer '.$secret, 'Accept' => 'application/json'];
}

beforeEach(function () {
    Storage::fake('media');
    RateLimiter::clear('manage:all');
});

it('refuses calls without a key or with a revoked one, in problem+json', function () {
    $this->getJson('/api/manage/v1/me')
        ->assertStatus(401)
        ->assertHeader('Content-Type', 'application/problem+json')
        ->assertJsonPath('codigo', 'sem_credencial');

    [$credential, $secret] = ApiCredential::issueKey('Antiga', ['pecas:ler'], null, null);
    $credential->revoke();

    $this->getJson('/api/manage/v1/me', manage($secret))->assertStatus(401)->assertJsonPath('codigo', 'credencial_invalida');
});

it('shows the credential and its permissions', function () {
    $this->getJson('/api/manage/v1/me', manage(manageKey(['pecas:escrever', 'mensagens:ler'])))
        ->assertOk()
        ->assertJsonPath('data.name', 'Planilha')
        ->assertJsonPath('data.scopes', ['pecas:escrever', 'mensagens:ler'])
        ->assertHeader('X-Request-Id');
});

it('lists products with the read scope and refuses another area', function () {
    publishedProduct();
    $secret = manageKey(['pecas:ler']);

    $this->getJson('/api/manage/v1/products?q=aura&limit=10', manage($secret))
        ->assertOk()
        ->assertJsonPath('data.0.title.pt', 'Cadeira Aura')
        ->assertJsonPath('next_cursor', null);

    $this->getJson('/api/manage/v1/collections', manage($secret))
        ->assertStatus(403)
        ->assertJsonPath('codigo', 'escopo')
        ->assertJsonPath('escopo', 'colecoes:ler');

    $this->postJson('/api/manage/v1/products', ['name' => ['pt' => 'X']], manage($secret))
        ->assertStatus(403)
        ->assertJsonPath('escopo', 'pecas:escrever');
});

it('creates a product with the panel rules, the slug from the name and the change in the activity log', function () {
    $category = Category::factory()->create();
    $finishes = Finish::factory()->count(2)->create();
    $secret = manageKey(['pecas:escrever'], 'Assistente');

    $response = $this->postJson('/api/manage/v1/products', [
        'name' => ['pt' => 'Cadeira Teste', 'en' => 'Test Chair'],
        'area_id' => area('indoor')->id,
        'category_id' => $category->id,
        'seo_description' => ['pt' => 'Uma cadeira.'],
        'finish_ids' => [$finishes[1]->id, $finishes[0]->id],
        'rooms' => ['dining'],
    ], manage($secret))->assertCreated()->assertHeader('ETag')->assertHeader('Location');

    expect($response->json('data.slug'))->toBe(['pt' => 'cadeira-teste', 'en' => 'test-chair'])
        ->and($response->json('data.finish_ids'))->toBe([$finishes[1]->id, $finishes[0]->id])
        ->and($response->json('data.is_published'))->toBeFalse();

    $product = Product::query()->findOrFail($response->json('data.id'));
    $log = ActivityLog::query()->where('subject_id', $product->id)->where('action', 'created')->first();
    expect($log?->user?->name)->toBe('API · Assistente')
        ->and(ApiLog::query()->where('operation', 'products_create')->where('status', 201)->exists())->toBeTrue();
});

it('refuses what the panel refuses: too long, unknown field, duplicate slug', function () {
    $product = publishedProduct();
    $secret = manageKey();

    $tooLong = $this->patchJson("/api/manage/v1/products/{$product->id}", ['seo_description' => ['pt' => str_repeat('a', 161)]], manage($secret))
        ->assertStatus(422)
        ->assertJsonPath('codigo', 'regra')
        ->assertJsonStructure(['erros' => ['seo_description.pt']]);
    expect($tooLong->json('erros')['seo_description.pt'][0])->toContain('descrição para o Google (português)');

    $this->patchJson("/api/manage/v1/products/{$product->id}", ['nome' => 'x'], manage($secret))
        ->assertStatus(400)
        ->assertJsonPath('codigo', 'valor_invalido');

    $other = Product::factory()->for(area('indoor'))->create(['slug' => ['pt' => 'outra']]);
    $this->patchJson("/api/manage/v1/products/{$other->id}", ['slug' => ['pt' => 'cadeira-aura']], manage($secret))
        ->assertStatus(422);

    $this->patchJson("/api/manage/v1/products/{$product->id}", ['name' => ['pt' => '']], manage($secret))
        ->assertStatus(422);
});

it('changes only the languages sent, checks the version and links colours', function () {
    $product = publishedProduct();
    $green = Product::factory()->for(area('indoor'))->create();
    $secret = manageKey();

    $etag = $this->getJson("/api/manage/v1/products/{$product->id}", manage($secret))->assertOk()->headers->get('ETag');

    $this->patchJson("/api/manage/v1/products/{$product->id}", [
        'tagline' => ['en' => 'New tagline'],
        'color_ids' => [$green->id],
    ], manage($secret) + ['If-Match' => $etag])
        ->assertOk()
        ->assertJsonPath('data.tagline.en', 'New tagline')
        ->assertJsonPath('data.name.pt', 'Cadeira Aura')
        ->assertJsonPath('data.color_ids', [$green->id]);

    expect($green->fresh()->color_group)->toBe($product->fresh()->color_group);

    $this->patchJson("/api/manage/v1/products/{$product->id}", ['sku' => 'X1'], manage($secret) + ['If-Match' => $etag])
        ->assertStatus(412)
        ->assertJsonPath('codigo', 'versao');
});

it('sends products to the trash, never deletes them for good', function () {
    $product = publishedProduct();

    $this->deleteJson("/api/manage/v1/products/{$product->id}", [], manage(manageKey()))->assertOk();

    expect(Product::withTrashed()->find($product->id)?->trashed())->toBeTrue();
});

it('replays an idempotent change and refuses the same key with another request', function () {
    $product = publishedProduct();
    $secret = manageKey();
    $headers = manage($secret) + ['Idempotency-Key' => 'f4b5c6d7-0000-4000-8000-000000000001'];

    $first = $this->patchJson("/api/manage/v1/products/{$product->id}", ['sku' => 'A1'], $headers)->assertOk();
    $this->patchJson("/api/manage/v1/products/{$product->id}", ['sku' => 'A1'], $headers)
        ->assertOk()
        ->assertHeader('Idempotent-Replayed', 'true')
        ->assertJsonPath('data.sku', $first->json('data.sku'));
    $this->patchJson("/api/manage/v1/products/{$product->id}", ['sku' => 'B2'], $headers)
        ->assertStatus(422)
        ->assertJsonPath('codigo', 'idempotencia');
});

it('answers 429 past the limit, with Retry-After', function () {
    [$credential, $secret] = ApiCredential::issueKey('Rápida', ['pecas:ler'], null, null);
    for ($i = 0; $i < 60; $i++) {
        RateLimiter::hit('manage:min:'.$credential->id, 60);
    }

    $this->getJson('/api/manage/v1/products', manage($secret))
        ->assertStatus(429)
        ->assertHeader('Retry-After')
        ->assertJsonPath('codigo', 'limite');
});

it('adds a photo from base64 and turns a gallery photo into the cover', function () {
    $product = publishedProduct();
    $secret = manageKey();
    $png = base64_encode((string) file_get_contents(base_path('tests/fixtures/pixel.png')));

    $gallery = $this->postJson("/api/manage/v1/products/{$product->id}/media", [
        'collection' => 'gallery', 'data' => $png, 'filename' => 'diagonal.png',
    ], manage($secret))->assertCreated()->json('data.media.id');

    $this->postJson("/api/manage/v1/products/{$product->id}/cover", ['media_id' => $gallery], manage($secret))
        ->assertOk()
        ->assertJsonPath('data.cover.id', $gallery);

    expect($product->fresh()->getFirstMedia('cover')?->id)->toBe($gallery);

    $this->postJson("/api/manage/v1/products/{$product->id}/media", [
        'collection' => 'cutout', 'data' => base64_encode('not an image'), 'filename' => 'x.jpg',
    ], manage($secret))->assertStatus(422);

    $this->postJson("/api/manage/v1/products/{$product->id}/media", [
        'collection' => 'gallery', 'url' => 'https://127.0.0.1/a.png',
    ], manage($secret))->assertStatus(422);
});

it('reads and changes the settings with the version and the panel rules', function () {
    $secret = manageKey(['configuracoes:escrever']);

    $etag = $this->getJson('/api/manage/v1/settings', manage($secret))->assertOk()->headers->get('ETag');

    $this->patchJson('/api/manage/v1/settings', ['contact_email' => 'nao-e-email'], manage($secret))->assertStatus(422);
    $this->patchJson('/api/manage/v1/settings', ['instagram_url' => 'https://www.instagram.com/franccino.oficial/'], manage($secret) + ['If-Match' => $etag])
        ->assertOk()
        ->assertJsonPath('data.instagram_url', 'https://www.instagram.com/franccino.oficial/');

    expect(app(GeneralSettings::class)->instagram_url)->toBe('https://www.instagram.com/franccino.oficial/');
});

it('keeps the redirect rules of the panel', function () {
    $secret = manageKey(['redirecionamentos:escrever']);

    $this->postJson('/api/manage/v1/redirects', ['from_path' => '/antigo', 'status_code' => 301], manage($secret))
        ->assertStatus(422)
        ->assertJsonStructure(['erros' => ['to_path']]);
    $this->postJson('/api/manage/v1/redirects', ['from_path' => '/antigo', 'status_code' => 410], manage($secret))
        ->assertCreated();
    $this->postJson('/api/manage/v1/redirects', ['from_path' => '/antigo', 'status_code' => 410], manage($secret))
        ->assertStatus(422)
        ->assertJsonPath('detail', fn (string $detail) => str_contains($detail, 'caminho antigo') && ! str_contains($detail, 'from path'));

    expect(Redirect::query()->where('from_path', '/antigo')->exists())->toBeTrue();
});

it('lists the inbox read-only and only with its scope', function () {
    $secret = manageKey(['mensagens:ler']);

    $this->getJson('/api/manage/v1/inbox/contact-messages', manage($secret))->assertOk()->assertJsonPath('data', []);
    $this->getJson('/api/manage/v1/products', manage($secret))->assertStatus(403);
    expect(Areas::scopes())->not->toContain('mensagens:escrever');
});

it('answers 404 and 405 for unknown paths and methods', function () {
    $secret = manageKey();

    $this->getJson('/api/manage/v1/nada', manage($secret))->assertStatus(404);
    $this->putJson('/api/manage/v1/products', [], manage($secret))->assertStatus(405)->assertHeader('Allow');
});

it('never lets an api account into the panel and hides it from the users screen', function () {
    [$credential] = ApiCredential::issueKey('Conta', ['pecas:ler'], null, null);
    $account = $credential->internalUser();

    expect($account->canAccessPanel(filament()->getPanel('admin')))->toBeFalse()
        ->and($account->isApiAccount())->toBeTrue()
        ->and(UserResource::getEloquentQuery()->whereKey($account->id)->exists())->toBeFalse()
        ->and($account->email)->toEndWith('@api.franccino.invalid');
});
