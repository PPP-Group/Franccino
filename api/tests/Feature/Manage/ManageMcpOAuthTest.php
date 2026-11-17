<?php

use App\Filament\Pages\ApiConnections;
use App\Filament\Pages\ConnectApp;
use App\Manage\Areas;
use App\Models\Manage\ApiCredential;
use App\Models\Manage\OAuthRequest;
use App\Models\User;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

use function Pest\Livewire\livewire;

/** O conector do Claude e do ChatGPT: MCP, OAuth 2.1 com PKCE e a aprovação no painel (docs/api-gestao.md). */
function mcpCall(string $token, array $message, array $headers = [])
{
    return test()->postJson('/mcp', $message, ['Authorization' => 'Bearer '.$token] + $headers);
}

/** @return array{0: string, 1: string} [code_verifier, code_challenge] */
function pkce(): array
{
    $verifier = Str::random(64);

    return [$verifier, rtrim(strtr(base64_encode(hash('sha256', $verifier, true)), '+/', '-_'), '=')];
}

beforeEach(fn () => RateLimiter::clear('manage:all'));

it('answers 401 with the way to the OAuth metadata when there is no token', function () {
    $challenge = $this->postJson('/mcp', ['jsonrpc' => '2.0', 'id' => 1, 'method' => 'initialize'])
        ->assertStatus(401)
        ->headers->get('WWW-Authenticate');
    expect($challenge)->toContain('resource_metadata="'.config('app.url').'/.well-known/oauth-protected-resource/mcp"')
        ->toContain('pecas:escrever');

    $this->getJson('/.well-known/oauth-protected-resource/mcp')
        ->assertOk()
        ->assertJsonPath('resource', config('app.url').'/mcp')
        ->assertJsonPath('authorization_servers.0', config('app.url'));
    $this->getJson('/.well-known/oauth-authorization-server')
        ->assertOk()
        ->assertJsonPath('code_challenge_methods_supported', ['S256'])
        ->assertJsonPath('registration_endpoint', config('app.url').'/oauth/register');
});

it('speaks MCP with a panel key: initialize, tools by scope, calls and errors the model can read', function () {
    publishedProduct();
    [, $key] = ApiCredential::issueKey('Claude Code', ['pecas:ler'], null, null);

    mcpCall($key, ['jsonrpc' => '2.0', 'id' => 1, 'method' => 'initialize', 'params' => ['protocolVersion' => '2025-06-18']])
        ->assertOk()
        ->assertJsonPath('result.protocolVersion', '2025-06-18')
        ->assertJsonPath('result.serverInfo.name', 'franccino')
        ->assertJsonPath('result.instructions', fn (string $text) => str_contains($text, 'diagonal virada para a esquerda'));

    $tools = collect(mcpCall($key, ['jsonrpc' => '2.0', 'id' => 2, 'method' => 'tools/list'])->json('result.tools'))->keyBy('name');
    expect($tools->has('products_list'))->toBeTrue()
        ->and($tools->has('products_update'))->toBeFalse()
        ->and($tools->has('collections_list'))->toBeFalse()
        ->and($tools['products_get']['annotations']['readOnlyHint'])->toBeTrue();

    mcpCall($key, ['jsonrpc' => '2.0', 'id' => 3, 'method' => 'tools/call', 'params' => ['name' => 'products_list', 'arguments' => ['q' => 'aura']]])
        ->assertOk()
        ->assertJsonPath('result.structuredContent.data.0.title.pt', 'Cadeira Aura');

    mcpCall($key, ['jsonrpc' => '2.0', 'id' => 4, 'method' => 'tools/call', 'params' => ['name' => 'products_update', 'arguments' => ['id' => 1, 'sku' => 'X']]])
        ->assertOk()
        ->assertJsonPath('result.isError', true)
        ->assertJsonPath('result.content.0.text', fn (string $text) => str_contains($text, 'pecas:escrever'));

    $this->postJson('/mcp', ['jsonrpc' => '2.0', 'method' => 'notifications/initialized'], ['Authorization' => 'Bearer '.$key])->assertStatus(202);
    mcpCall($key, ['jsonrpc' => '2.0', 'id' => 5, 'method' => 'ping'], ['Origin' => 'https://evil.example'])->assertStatus(403);
    $this->getJson('/mcp', ['Authorization' => 'Bearer '.$key])->assertStatus(405);
});

it('marks only additions as non destructive', function () {
    [, $key] = ApiCredential::issueKey('Tudo', Areas::fullScopes(), null, null);
    $tools = collect(mcpCall($key, ['jsonrpc' => '2.0', 'id' => 1, 'method' => 'tools/list'])->json('result.tools'))->keyBy('name');

    expect($tools['products_create']['annotations']['destructiveHint'])->toBeFalse()
        ->and($tools['products_update']['annotations']['destructiveHint'])->toBeTrue()
        ->and($tools['products_delete']['annotations']['destructiveHint'])->toBeTrue()
        ->and($tools['products_cover_from_gallery']['annotations']['destructiveHint'])->toBeTrue()
        ->and($tools->has('contact_messages_list'))->toBeTrue();
});

it('connects like the Claude does: register, authorize, admin approval, PKCE token, MCP, refresh and revocation', function () {
    publishedProduct();
    $admin = User::factory()->admin()->create();
    $callback = 'https://claude.ai/api/mcp/auth_callback';

    $client = $this->postJson('/oauth/register', ['client_name' => 'Claude', 'redirect_uris' => [$callback]])
        ->assertCreated()->json('client_id');
    $this->postJson('/oauth/register', ['redirect_uris' => ['http://evil.example/cb']])->assertStatus(400);

    [$verifier, $challenge] = pkce();
    $state = str_repeat('s', 600);
    $location = $this->get('/oauth/authorize?'.http_build_query([
        'response_type' => 'code', 'client_id' => $client, 'redirect_uri' => $callback,
        'code_challenge' => $challenge, 'code_challenge_method' => 'S256', 'state' => $state,
        'scope' => 'pecas:escrever colecoes:ler', 'resource' => config('app.url').'/mcp',
    ]))->assertRedirect()->headers->get('Location');
    expect($location)->toStartWith(config('app.url').'/admin/connect-app?request=');
    $requestId = str($location)->after('request=')->toString();

    // O administrador diminui: peças só leitura.
    $this->actingAs($admin);
    $page = livewire(ConnectApp::class, ['requestId' => $requestId])
        ->assertSee('Claude')
        ->set('levels.pecas', 'ler')
        ->call('approve');
    $back = $page->effects['redirect'] ?? '';
    expect($back)->toStartWith($callback.'?code=')->toContain('state='.$state)->toContain('iss=');
    parse_str((string) parse_url($back, PHP_URL_QUERY), $query);

    $tokens = $this->postJson('/oauth/token', [
        'grant_type' => 'authorization_code', 'code' => $query['code'], 'client_id' => $client,
        'redirect_uri' => $callback, 'code_verifier' => $verifier, 'resource' => config('app.url').'/mcp',
    ])->assertOk()->assertJsonPath('token_type', 'Bearer')->json();
    expect($tokens['scope'])->toBe('pecas:ler colecoes:ler')
        ->and($tokens['access_token'])->toStartWith('fcca_');

    // O código não vale duas vezes: e usar de novo derruba a conexão.
    $credential = ApiCredential::query()->where('kind', ApiCredential::CONNECTOR)->firstOrFail();
    expect($credential->name)->toBe('Claude')->and($credential->created_by)->toBe($admin->id);

    $tools = collect(mcpCall($tokens['access_token'], ['jsonrpc' => '2.0', 'id' => 1, 'method' => 'tools/list'])->json('result.tools'))->pluck('name');
    expect($tools)->toContain('products_get')->not->toContain('products_update');

    // O token de acesso do conector não vale na REST.
    $this->getJson('/api/manage/v1/me', ['Authorization' => 'Bearer '.$tokens['access_token']])->assertStatus(401);

    $renewed = $this->postJson('/oauth/token', ['grant_type' => 'refresh_token', 'refresh_token' => $tokens['refresh_token'], 'client_id' => $client])
        ->assertOk()->json();
    expect($renewed['refresh_token'])->not->toBe($tokens['refresh_token']);
    mcpCall($renewed['access_token'], ['jsonrpc' => '2.0', 'id' => 2, 'method' => 'ping'])->assertOk();

    // Renovar com o token antigo (já trocado) é sinal de vazamento: a conexão cai.
    $this->postJson('/oauth/token', ['grant_type' => 'refresh_token', 'refresh_token' => $tokens['refresh_token'], 'client_id' => $client])
        ->assertStatus(400)->assertJsonPath('error', 'invalid_grant');
    expect($credential->fresh()->revoked_at)->not->toBeNull();
    mcpCall($renewed['access_token'], ['jsonrpc' => '2.0', 'id' => 3, 'method' => 'ping'])->assertStatus(401);
});

it('refuses a wrong PKCE verifier and a reused code', function () {
    $admin = User::factory()->admin()->create();
    $callback = 'https://chatgpt.com/connector_platform_oauth_redirect';
    $client = $this->postJson('/oauth/register', ['client_name' => 'ChatGPT', 'redirect_uris' => [$callback]])->json('client_id');
    [$verifier, $challenge] = pkce();
    $location = $this->get('/oauth/authorize?'.http_build_query([
        'response_type' => 'code', 'client_id' => $client, 'redirect_uri' => $callback,
        'code_challenge' => $challenge, 'code_challenge_method' => 'S256',
    ]))->headers->get('Location');

    $this->actingAs($admin);
    $back = livewire(ConnectApp::class, ['requestId' => str($location)->after('request=')->toString()])->call('approve')->effects['redirect'];
    parse_str((string) parse_url($back, PHP_URL_QUERY), $query);

    $this->postJson('/oauth/token', ['grant_type' => 'authorization_code', 'code' => $query['code'], 'client_id' => $client, 'code_verifier' => 'errado'])
        ->assertStatus(400)->assertJsonPath('error', 'invalid_grant');
    // Sem PKCE no pedido: volta ao aplicativo com o erro.
    $this->get('/oauth/authorize?'.http_build_query(['response_type' => 'code', 'client_id' => $client, 'redirect_uri' => $callback]))
        ->assertRedirect()
        ->assertRedirectContains('error=invalid_request');
    // Endereço de volta que não é do aplicativo: mostra o erro, sem redirecionar.
    $this->get('/oauth/authorize?'.http_build_query(['response_type' => 'code', 'client_id' => $client, 'redirect_uri' => 'https://evil.example/cb', 'code_challenge' => $challenge, 'code_challenge_method' => 'S256']))
        ->assertStatus(400);
});

it('lets only real administrators approve connections and manage keys', function () {
    $request = OAuthRequest::query()->create([
        'client_id' => 'x', 'redirect_uri' => 'https://claude.ai/cb', 'code_challenge' => str_repeat('a', 43),
        'scopes' => ['pecas:ler'], 'expires_at' => now()->addMinutes(15),
    ]);

    $this->actingAs(User::factory()->editor()->create());
    $this->get('/admin/connect-app?request='.$request->id)->assertForbidden();
    $this->get('/admin/api-e-conectores')->assertForbidden();
});

it('creates a key in the panel, shows the secret once and revokes it', function () {
    $this->actingAs(User::factory()->admin()->create());

    $page = livewire(ApiConnections::class)
        ->callAction('createKey', ['name' => 'Planilha de preços', 'days' => '30', 'all' => '', 'areas' => ['pecas' => 'escrever', 'mensagens' => 'ler']])
        ->assertHasNoActionErrors();

    $secret = $page->get('newSecret');
    $credential = ApiCredential::query()->where('name', 'Planilha de preços')->firstOrFail();
    expect($secret)->toStartWith('fcc_')
        ->and(ApiCredential::findBySecret($secret)?->id)->toBe($credential->id)
        ->and($credential->scopes)->toBe(['pecas:escrever', 'mensagens:ler'])
        ->and($credential->expires_at?->isFuture())->toBeTrue();

    $page->call('dismissSecret')->assertSet('newSecret', null);

    livewire(ApiConnections::class)->callTableAction('revoke', $credential);
    expect($credential->fresh()->isActive())->toBeFalse();
});

it('publishes the OpenAPI and the documentation from the catalog', function () {
    $spec = $this->getJson('/api/manage/v1/openapi.json')->assertOk()->json();

    expect($spec['openapi'])->toBe('3.1.0')
        ->and($spec['paths'])->toHaveKey('/products/{id}')
        ->and($spec['paths']['/products/{id}'])->toHaveKeys(['get', 'patch', 'delete'])
        ->and($spec['components']['securitySchemes']['oauth']['flows']['authorizationCode']['scopes'])->toHaveKey('pecas:escrever');

    $this->get('/api/manage/docs')->assertOk()->assertSee('API de gestão da Franccino')->assertSee('products_cover_from_gallery');
});
