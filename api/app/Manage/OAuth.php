<?php

namespace App\Manage;

use App\Models\Manage\ApiCredential;
use App\Models\Manage\OAuthClient;
use App\Models\Manage\OAuthCode;
use App\Models\Manage\OAuthRequest;
use App\Models\Manage\OAuthToken;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Throwable;

/**
 * O servidor de autorização do conector (OAuth 2.1 com PKCE, sem segredo do cliente), como o Claude e o ChatGPT
 * pedem: metadados (RFC 8414 e RFC 9728), registro dinâmico (RFC 7591) ou o documento de metadados do cliente
 * (`client_id` https), pedido de autorização aprovado pelo administrador no painel, troca do código, renovação com
 * rotação e revogação (RFC 7009). Os tokens ficam presos ao recurso `/mcp` (RFC 8707).
 */
final class OAuth
{
    public const ACCESS_TTL = 3600;

    public const REFRESH_DAYS = 90;

    public const REQUEST_MINUTES = 15;

    public const CODE_SECONDS = 120;

    public static function issuer(): string
    {
        return rtrim((string) config('app.url'), '/');
    }

    public static function mcpResource(): string
    {
        return self::issuer().'/mcp';
    }

    /** @return array<string, mixed> RFC 9728: o recurso protegido (o `/mcp`). */
    public static function resourceMetadata(): array
    {
        return [
            'resource' => self::mcpResource(),
            'authorization_servers' => [self::issuer()],
            'scopes_supported' => Areas::scopes(),
            'bearer_methods_supported' => ['header'],
            'resource_name' => 'Franccino: painel do site',
            'resource_documentation' => self::issuer().'/api/manage/docs',
        ];
    }

    /** @return array<string, mixed> RFC 8414: o servidor de autorização. */
    public static function serverMetadata(): array
    {
        return [
            'issuer' => self::issuer(),
            'authorization_endpoint' => self::issuer().'/oauth/authorize',
            'token_endpoint' => self::issuer().'/oauth/token',
            'registration_endpoint' => self::issuer().'/oauth/register',
            'revocation_endpoint' => self::issuer().'/oauth/revoke',
            'response_types_supported' => ['code'],
            'grant_types_supported' => ['authorization_code', 'refresh_token'],
            'code_challenge_methods_supported' => ['S256'],
            'token_endpoint_auth_methods_supported' => ['none'],
            'revocation_endpoint_auth_methods_supported' => ['none'],
            'scopes_supported' => Areas::scopes(),
            'client_id_metadata_document_supported' => true,
            'service_documentation' => self::issuer().'/api/manage/docs',
        ];
    }

    /** O que vai no `WWW-Authenticate` do 401 do `/mcp`: onde estão os metadados e o que pedir. */
    public static function challenge(string $error = ''): string
    {
        $parts = ['resource_metadata="'.self::issuer().'/.well-known/oauth-protected-resource/mcp"', 'scope="'.implode(' ', Areas::fullScopes()).'"'];
        if ($error !== '') {
            array_unshift($parts, 'error="'.$error.'"');
        }

        return 'Bearer '.implode(', ', $parts);
    }

    /**
     * Registro dinâmico: só endereços de volta https ou do próprio computador (localhost), até 10.
     *
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    public static function register(array $input, string $ip): array
    {
        self::limit('register:'.$ip, 20);
        $uris = array_values(array_filter((array) ($input['redirect_uris'] ?? []), 'is_string'));
        if ($uris === [] || count($uris) > 10) {
            throw self::error('invalid_redirect_uri', 'Mande de 1 a 10 redirect_uris.');
        }
        foreach ($uris as $uri) {
            if (! self::validRedirect($uri)) {
                throw self::error('invalid_redirect_uri', 'Endereço de volta não aceito: '.$uri.' (só https ou localhost).');
            }
        }
        $client = OAuthClient::query()->create([
            'client_id' => 'fcc-'.Str::lower(Str::random(32)),
            'name' => Str::limit(trim((string) ($input['client_name'] ?? 'Aplicativo')), 150, ''),
            'redirect_uris' => $uris,
        ]);

        return [
            'client_id' => $client->client_id,
            'client_name' => $client->name,
            'redirect_uris' => $uris,
            'grant_types' => ['authorization_code', 'refresh_token'],
            'response_types' => ['code'],
            'token_endpoint_auth_method' => 'none',
            'client_id_issued_at' => $client->created_at?->getTimestamp(),
        ];
    }

    /**
     * Pedido de autorização: confere o cliente, o endereço de volta e o PKCE, guarda o pedido (15 minutos) e devolve o
     * endereço do painel em que o administrador aprova.
     *
     * @param  array<string, mixed>  $query
     */
    public static function authorize(array $query, string $ip): string
    {
        self::limit('authorize:'.$ip, 60, 3600);
        self::limit('authorize:all', 3000, 3600);

        $client = self::client((string) ($query['client_id'] ?? ''));
        $redirect = (string) ($query['redirect_uri'] ?? '');
        if ($redirect === '' && count($client->redirect_uris) === 1) {
            $redirect = $client->redirect_uris[0];
        }
        if (! in_array($redirect, $client->redirect_uris, true)) {
            // Sem um endereço de volta conhecido, não redireciona: mostra o erro.
            throw new ApiProblem(400, 'invalid_request', 'Endereço de volta desconhecido', 'O redirect_uri não está entre os registrados por este aplicativo.');
        }
        if (($query['response_type'] ?? '') !== 'code') {
            throw self::redirectError($redirect, $query, 'unsupported_response_type', 'Só response_type=code.');
        }
        $challenge = (string) ($query['code_challenge'] ?? '');
        if (($query['code_challenge_method'] ?? '') !== 'S256' || ! preg_match('/^[A-Za-z0-9_-]{43,128}$/', $challenge)) {
            throw self::redirectError($redirect, $query, 'invalid_request', 'PKCE obrigatório (code_challenge com S256).');
        }
        $resource = $query['resource'] ?? null;
        if ($resource !== null && rtrim((string) $resource, '/') !== self::mcpResource()) {
            throw self::redirectError($redirect, $query, 'invalid_target', 'Recurso desconhecido.');
        }
        $state = isset($query['state']) ? (string) $query['state'] : null;
        if ($state !== null && strlen($state) > 4000) {
            throw self::redirectError($redirect, $query, 'invalid_request', 'O state passa de 4.000 caracteres.');
        }

        $requested = Areas::normalize(preg_split('/\s+/', trim((string) ($query['scope'] ?? ''))) ?: []);
        $request = OAuthRequest::query()->create([
            'client_id' => $client->client_id,
            'redirect_uri' => $redirect,
            'state' => $state,
            'code_challenge' => $challenge,
            'scopes' => $requested !== [] ? $requested : Areas::fullScopes(),
            'resource' => $resource !== null ? self::mcpResource() : null,
            'expires_at' => now()->addMinutes(self::REQUEST_MINUTES),
        ]);

        return self::issuer().'/admin/connect-app?request='.$request->id;
    }

    /** O pedido ainda válido, com o aplicativo, para a tela de aprovar. */
    public static function pending(string $id): ?OAuthRequest
    {
        return OAuthRequest::query()->whereKey($id)->where('expires_at', '>', now())->first();
    }

    public static function clientName(string $clientId): string
    {
        return OAuthClient::query()->where('client_id', $clientId)->value('name') ?? $clientId;
    }

    /**
     * O administrador aprovou: cria a conexão (credencial `connector`) com as permissões escolhidas (no máximo as
     * pedidas) e o código de uso único, e devolve o endereço de volta com `code`, `state` e `iss`.
     *
     * @param  list<string>  $scopes
     */
    public static function approve(OAuthRequest $request, array $scopes, User $admin): string
    {
        $allowed = array_values(array_filter(
            Areas::normalize($scopes),
            fn (string $scope) => Areas::allows($request->scopes, $scope),
        ));
        if ($allowed === []) {
            throw new ApiProblem(422, 'regra', 'Sem permissões', 'Escolha pelo menos uma permissão.');
        }

        $credential = ApiCredential::query()->create([
            'kind' => ApiCredential::CONNECTOR,
            'name' => Str::limit(self::clientName($request->client_id), 110, ''),
            'prefix' => 'conector',
            'scopes' => $allowed,
            'oauth_client_id' => $request->client_id,
            'created_by' => $admin->id,
        ]);
        $code = Str::random(48);
        OAuthCode::query()->create([
            'code_hash' => hash('sha256', $code),
            'api_credential_id' => $credential->id,
            'client_id' => $request->client_id,
            'redirect_uri' => $request->redirect_uri,
            'code_challenge' => $request->code_challenge,
            'resource' => $request->resource,
            'expires_at' => now()->addSeconds(self::CODE_SECONDS),
        ]);
        OAuthClient::query()->where('client_id', $request->client_id)->update(['last_used_at' => now()]);
        $request->delete();

        return self::withQuery($request->redirect_uri, array_filter([
            'code' => $code,
            'state' => $request->state,
            'iss' => self::issuer(),
        ], fn ($v) => $v !== null));
    }

    public static function deny(OAuthRequest $request): string
    {
        $request->delete();

        return self::withQuery($request->redirect_uri, array_filter([
            'error' => 'access_denied',
            'error_description' => 'O administrador não aprovou a conexão.',
            'state' => $request->state,
            'iss' => self::issuer(),
        ], fn ($v) => $v !== null));
    }

    /**
     * `POST /oauth/token`: troca do código (com PKCE) ou renovação (com rotação).
     *
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    public static function token(array $input, string $ip): array
    {
        self::limit('token:'.$ip, 120, 3600);

        return match ($input['grant_type'] ?? '') {
            'authorization_code' => self::exchangeCode($input),
            'refresh_token' => self::refresh($input),
            default => throw self::error('unsupported_grant_type', 'Só authorization_code e refresh_token.'),
        };
    }

    /**
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    private static function exchangeCode(array $input): array
    {
        $code = OAuthCode::query()->where('code_hash', hash('sha256', (string) ($input['code'] ?? '')))->first();
        if ($code === null) {
            throw self::error('invalid_grant', 'Código inválido.');
        }
        if ($code->used_at !== null) {
            // Código usado duas vezes: sinal de vazamento. A conexão cai (RFC 6749, 4.1.2).
            $code->credential?->revoke();

            throw self::error('invalid_grant', 'Código já usado: a conexão foi desfeita por segurança.');
        }
        if ($code->expires_at->isPast()) {
            throw self::error('invalid_grant', 'Código vencido.');
        }
        if (($input['client_id'] ?? '') !== $code->client_id) {
            throw self::error('invalid_grant', 'O código é de outro aplicativo.');
        }
        if (isset($input['redirect_uri']) && $input['redirect_uri'] !== $code->redirect_uri) {
            throw self::error('invalid_grant', 'O redirect_uri não é o do pedido.');
        }
        $verifier = (string) ($input['code_verifier'] ?? '');
        $computed = rtrim(strtr(base64_encode(hash('sha256', $verifier, true)), '+/', '-_'), '=');
        if ($verifier === '' || ! hash_equals($code->code_challenge, $computed)) {
            throw self::error('invalid_grant', 'O code_verifier não confere com o code_challenge.');
        }
        $resource = $input['resource'] ?? null;
        if ($resource !== null && rtrim((string) $resource, '/') !== self::mcpResource()) {
            throw self::error('invalid_target', 'Recurso desconhecido.');
        }
        $code->forceFill(['used_at' => now()])->save();
        $credential = $code->credential;
        if ($credential === null || ! $credential->isActive()) {
            throw self::error('invalid_grant', 'A conexão foi desfeita.');
        }

        return self::issue($credential, $code->client_id);
    }

    /**
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    private static function refresh(array $input): array
    {
        $token = OAuthToken::query()
            ->where('token_hash', hash('sha256', (string) ($input['refresh_token'] ?? '')))
            ->where('type', OAuthToken::REFRESH)
            ->first();
        if ($token === null) {
            throw self::error('invalid_grant', 'Token de renovação inválido.');
        }
        if ($token->revoked_at !== null) {
            // Reaproveitado depois da rotação: sinal de vazamento. A conexão cai.
            $token->credential?->revoke();

            throw self::error('invalid_grant', 'Token de renovação já usado: a conexão foi desfeita por segurança.');
        }
        if ($token->expires_at->isPast() || ($input['client_id'] ?? $token->client_id) !== $token->client_id) {
            throw self::error('invalid_grant', 'Token de renovação vencido ou de outro aplicativo.');
        }
        $credential = $token->credential;
        if ($credential === null || ! $credential->isActive()) {
            throw self::error('invalid_grant', 'A conexão foi desfeita.');
        }
        $token->forceFill(['revoked_at' => now()])->save();

        return self::issue($credential, $token->client_id);
    }

    /** @return array<string, mixed> */
    private static function issue(ApiCredential $credential, string $clientId): array
    {
        $access = OAuthToken::ACCESS_PREFIX.bin2hex(random_bytes(24));
        $refresh = OAuthToken::REFRESH_PREFIX.bin2hex(random_bytes(24));
        foreach ([[$access, OAuthToken::ACCESS, now()->addSeconds(self::ACCESS_TTL)], [$refresh, OAuthToken::REFRESH, now()->addDays(self::REFRESH_DAYS)]] as [$secret, $type, $expires]) {
            OAuthToken::query()->create([
                'token_hash' => hash('sha256', $secret),
                'type' => $type,
                'api_credential_id' => $credential->id,
                'client_id' => $clientId,
                'resource' => self::mcpResource(),
                'expires_at' => $expires,
            ]);
        }

        return [
            'access_token' => $access,
            'token_type' => 'Bearer',
            'expires_in' => self::ACCESS_TTL,
            'refresh_token' => $refresh,
            'scope' => implode(' ', $credential->scopes),
        ];
    }

    /** RFC 7009: revoga o token mandado (e, se for de renovação, a conexão inteira). Sempre 200. */
    public static function revoke(string $token): void
    {
        $row = OAuthToken::query()->where('token_hash', hash('sha256', $token))->first();
        if ($row === null) {
            return;
        }
        if ($row->type === OAuthToken::REFRESH) {
            $row->credential?->revoke();
        } else {
            $row->forceFill(['revoked_at' => now()])->save();
        }
    }

    /**
     * O cliente pelo `client_id`: registrado aqui, ou o endereço https do documento de metadados (buscado com 5 s, até
     * 20 KB, sem redirecionamento e só host público).
     */
    private static function client(string $clientId): OAuthClient
    {
        $client = OAuthClient::query()->where('client_id', $clientId)->first();
        if ($client !== null) {
            return $client;
        }
        if (! str_starts_with($clientId, 'https://')) {
            throw new ApiProblem(400, 'invalid_client', 'Aplicativo desconhecido', 'O client_id não está registrado.');
        }

        $document = Cache::remember('oauth-cimd:'.sha1($clientId), 3600, fn () => self::fetchMetadataDocument($clientId));
        if (! is_array($document) || ($document['client_id'] ?? null) !== $clientId) {
            throw new ApiProblem(400, 'invalid_client', 'Aplicativo desconhecido', 'O documento do client_id não confere.');
        }
        $uris = array_values(array_filter((array) ($document['redirect_uris'] ?? []), fn ($u) => is_string($u) && self::validRedirect($u)));
        if ($uris === []) {
            throw new ApiProblem(400, 'invalid_client', 'Aplicativo sem endereço de volta', 'O documento do client_id não tem redirect_uris válidos.');
        }

        return OAuthClient::query()->updateOrCreate(['client_id' => $clientId], [
            'name' => Str::limit(trim((string) ($document['client_name'] ?? parse_url($clientId, PHP_URL_HOST))), 150, ''),
            'redirect_uris' => $uris,
            'is_metadata_document' => true,
        ]);
    }

    /** @return array<string, mixed>|null */
    private static function fetchMetadataDocument(string $url): ?array
    {
        $host = (string) parse_url($url, PHP_URL_HOST);
        $port = parse_url($url, PHP_URL_PORT);
        if ($host === '' || ($port !== null && (int) $port !== 443) || filter_var($host, FILTER_VALIDATE_IP)) {
            return null;
        }
        foreach (@gethostbynamel($host) ?: [] as $ip) {
            if (! filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return null;
            }
        }
        try {
            $response = Http::withOptions(['allow_redirects' => false, 'timeout' => 5, 'connect_timeout' => 5])
                ->accept('application/json')->get($url);
            $body = $response->body();
            if (! $response->successful() || strlen($body) > 20480) {
                return null;
            }
            $json = json_decode($body, true);

            return is_array($json) ? $json : null;
        } catch (Throwable) {
            return null;
        }
    }

    private static function validRedirect(string $uri): bool
    {
        $parts = parse_url($uri);
        if (! is_array($parts) || ! isset($parts['scheme'], $parts['host']) || isset($parts['fragment'])) {
            return false;
        }

        return $parts['scheme'] === 'https'
            || ($parts['scheme'] === 'http' && in_array($parts['host'], ['localhost', '127.0.0.1', '[::1]'], true));
    }

    /** @param  array<string, string>  $params */
    private static function withQuery(string $uri, array $params): string
    {
        return $uri.(str_contains($uri, '?') ? '&' : '?').http_build_query($params, '', '&', PHP_QUERY_RFC3986);
    }

    private static function limit(string $key, int $max, int $decay = 3600): void
    {
        if (RateLimiter::tooManyAttempts('oauth:'.$key, $max)) {
            throw self::error('slow_down', 'Muitos pedidos. Tente mais tarde.', 429);
        }
        RateLimiter::hit('oauth:'.$key, $decay);
    }

    public static function error(string $code, string $description, int $status = 400): ApiProblem
    {
        return new ApiProblem($status, $code, $code, $description, ['oauth' => true]);
    }

    /** @param  array<string, mixed>  $query */
    private static function redirectError(string $redirect, array $query, string $code, string $description): ApiProblem
    {
        return new ApiProblem(302, $code, $code, $description, ['location' => self::withQuery($redirect, array_filter([
            'error' => $code,
            'error_description' => $description,
            'state' => $query['state'] ?? null,
            'iss' => self::issuer(),
        ], fn ($v) => $v !== null))]);
    }
}
