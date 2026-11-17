<?php

namespace App\Manage;

use App\Models\Manage\ApiCredential;
use App\Models\Manage\ApiIdempotency;
use App\Models\Manage\ApiLog;
use App\Models\Manage\OAuthToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Throwable;

/**
 * A porta comum da REST e do conector: confere a credencial, conta os limites, aplica a `Idempotency-Key`, executa a
 * operação (`Engine`), registra a chamada sem os valores e devolve o resultado ou o erro.
 */
final class Gateway
{
    /** Limites por credencial e no total (por minuto e por dia). */
    public const PER_MINUTE = 60;

    public const WRITES_PER_MINUTE = 30;

    public const PER_DAY = 10000;

    public const TOTAL_PER_MINUTE = 300;

    /**
     * A credencial do cabeçalho `Authorization: Bearer`: a chave do painel (`fcc_`) ou, quando `$oauth`, o token de
     * acesso do conector (`fcca_`), que só vale para o recurso em que foi emitido (o `/mcp`).
     */
    public static function credential(Request $request, bool $oauth): ApiCredential
    {
        $token = (string) $request->bearerToken();
        if ($token === '') {
            throw new ApiProblem(401, 'sem_credencial', 'Sem credencial', 'Mande a chave no cabeçalho `Authorization: Bearer fcc_...` (crie a chave no painel, em API e conectores).');
        }

        $credential = null;
        if (str_starts_with($token, ApiCredential::KEY_PREFIX)) {
            $credential = ApiCredential::findBySecret($token);
        } elseif ($oauth && str_starts_with($token, OAuthToken::ACCESS_PREFIX)) {
            $access = OAuthToken::query()
                ->where('token_hash', hash('sha256', $token))
                ->where('type', OAuthToken::ACCESS)
                ->whereNull('revoked_at')
                ->where('expires_at', '>', now())
                ->first();
            if ($access !== null && ($access->resource === null || $access->resource === OAuth::mcpResource())) {
                $credential = $access->credential;
            }
        }

        if ($credential === null || ! $credential->isActive()) {
            throw new ApiProblem(401, 'credencial_invalida', 'Credencial inválida',
                'A credencial não existe, foi revogada ou venceu. Crie outra no painel (API e conectores) ou conecte o aplicativo de novo.');
        }

        return $credential;
    }

    /**
     * Executa a operação para a credencial e devolve [resultado ou erro, cabeçalhos dos limites].
     *
     * @param  array<string, mixed>  $input
     * @return array{0: Result|ApiProblem, 1: array<string, string>}
     */
    public static function call(ApiCredential $credential, string $operationId, array $input, string $channel, Request $request, string $requestId): array
    {
        $started = microtime(true);
        $operation = Catalog::operations()[$operationId] ?? null;
        $headers = [];
        $result = null;

        try {
            $headers = self::throttle($credential, $operation === null || $operation['method'] !== 'GET');
            if ($operation === null) {
                throw ApiProblem::notFound('A operação '.$operationId);
            }
            $context = new Context(
                $credential,
                $credential->internalUser(),
                $channel,
                $channel === 'rest' ? $request->header('If-Match') : null,
            );
            $key = $channel === 'rest' && $operation['method'] !== 'GET' ? $request->header('Idempotency-Key') : null;
            $result = $key !== null
                ? self::idempotent($credential, (string) $key, $operationId, $input, fn () => Engine::run($operationId, $input, $context))
                : Engine::run($operationId, $input, $context);
        } catch (ApiProblem $problem) {
            $result = $problem;
        } catch (Throwable $e) {
            report($e);
            $result = new ApiProblem(500, 'interno', 'Erro interno', 'Algo deu errado do nosso lado. Tente de novo; se continuar, avise a equipe com o número da requisição.');
        }

        $status = $result instanceof ApiProblem ? $result->status : $result->status;
        ApiLog::query()->create([
            'api_credential_id' => $credential->id,
            'channel' => $channel,
            'operation' => $operation !== null ? $operationId : 'desconhecida',
            'method' => $operation['method'] ?? $request->method(),
            'status' => $status,
            'duration_ms' => (int) round((microtime(true) - $started) * 1000),
            'ip' => $request->ip(),
            'created_at' => now(),
        ]);
        if ($credential->last_used_at === null || $credential->last_used_at->lt(now()->subMinute())) {
            $credential->forceFill(['last_used_at' => now()])->saveQuietly();
        }

        return [$result, $headers + ['X-Request-Id' => $requestId]];
    }

    /** @return array<string, string> */
    private static function throttle(ApiCredential $credential, bool $write): array
    {
        $buckets = [
            ['manage:min:'.$credential->id, self::PER_MINUTE, 60],
            ['manage:day:'.$credential->id, self::PER_DAY, 86400],
            ['manage:all', self::TOTAL_PER_MINUTE, 60],
        ];
        if ($write) {
            $buckets[] = ['manage:write:'.$credential->id, self::WRITES_PER_MINUTE, 60];
        }
        foreach ($buckets as [$key, $max]) {
            if (RateLimiter::tooManyAttempts($key, $max)) {
                $retry = RateLimiter::availableIn($key);
                throw new ApiProblem(429, 'limite', 'Muitas chamadas',
                    'Passou do limite de chamadas. Espere '.$retry.' segundos.', [], ['Retry-After' => (string) $retry]);
            }
        }
        foreach ($buckets as [$key, , $decay]) {
            RateLimiter::hit($key, $decay);
        }

        return [
            'RateLimit-Limit' => (string) self::PER_MINUTE,
            'RateLimit-Remaining' => (string) max(0, RateLimiter::remaining('manage:min:'.$credential->id, self::PER_MINUTE)),
        ];
    }

    /**
     * A mesma `Idempotency-Key` com o mesmo pedido devolve a mesma resposta por 24 horas; com outro pedido, 422; com o
     * pedido ainda rodando, 409. Só respostas de sucesso ficam guardadas: um erro pode ser tentado de novo.
     *
     * @param  array<string, mixed>  $input
     * @param  callable(): Result  $run
     */
    private static function idempotent(ApiCredential $credential, string $key, string $operationId, array $input, callable $run): Result
    {
        if (strlen($key) < 8 || strlen($key) > 120) {
            throw ApiProblem::badRequest('A `Idempotency-Key` precisa ter de 8 a 120 caracteres (um UUID serve).');
        }
        $hash = hash('sha256', $operationId.'|'.json_encode($input));
        $existing = ApiIdempotency::query()
            ->where('api_credential_id', $credential->id)
            ->where('key', $key)
            ->where('created_at', '>', now()->subDay())
            ->first();

        if ($existing !== null) {
            if ($existing->request_hash !== $hash) {
                throw new ApiProblem(422, 'idempotencia', 'Chave repetida', 'Esta Idempotency-Key já foi usada com outro pedido.');
            }
            if ($existing->status === null) {
                throw new ApiProblem(409, 'em_andamento', 'Em andamento', 'O pedido com esta Idempotency-Key ainda está rodando.');
            }

            return new Result($existing->status, json_decode((string) $existing->body, true), ['Idempotent-Replayed' => 'true']);
        }

        ApiIdempotency::query()->where('api_credential_id', $credential->id)->where('key', $key)->delete();
        $row = ApiIdempotency::query()->create([
            'api_credential_id' => $credential->id,
            'key' => $key,
            'request_hash' => $hash,
            'created_at' => now(),
        ]);

        try {
            $result = $run();
        } catch (Throwable $e) {
            $row->delete();

            throw $e;
        }
        $row->forceFill(['status' => $result->status, 'body' => json_encode($result->body)])->save();

        return $result;
    }
}
