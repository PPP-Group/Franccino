<?php

namespace App\Http\Controllers\Manage;

use App\Http\Controllers\Controller;
use App\Manage\ApiProblem;
use App\Manage\Areas;
use App\Manage\Catalog;
use App\Manage\Gateway;
use App\Manage\Mcp;
use App\Manage\OAuth;
use App\Manage\OpenApi;
use App\Manage\Result;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Str;
use Illuminate\View\View;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

/**
 * As portas da API de gestão (docs/api-gestao.md): a REST em `/api/manage/v1`, o conector em `/mcp`, o OAuth em
 * `/oauth/*`, os metadados em `/.well-known/*` e a documentação em `/api/manage/docs`.
 */
class ManageController extends Controller
{
    /** Origens aceitas no `/mcp` quando o navegador manda `Origin` (contra DNS rebinding). */
    private const MCP_ORIGINS = ['https://claude.ai', 'https://chatgpt.com', 'https://chat.openai.com', 'https://platform.openai.com'];

    public function rest(Request $request, string $path = ''): SymfonyResponse
    {
        $requestId = (string) Str::uuid();
        $path = '/'.trim($path, '/');

        try {
            $credential = Gateway::credential($request, false);
            [$operation, $params] = $this->route($request->method(), $path);
            $input = $params + $this->input($request, $operation);
            [$result, $headers] = Gateway::call($credential, $operation['id'], $input, 'rest', $request, $requestId);
        } catch (ApiProblem $problem) {
            [$result, $headers] = [$problem, ['X-Request-Id' => $requestId]];
        }

        return $this->respond($result, $headers, $requestId);
    }

    public function mcp(Request $request): SymfonyResponse
    {
        $requestId = (string) Str::uuid();
        $origin = $request->header('Origin');
        if ($origin !== null && ! $this->allowedOrigin($origin)) {
            return response()->json(['error' => 'Origem não aceita.'], 403);
        }
        if ($request->isMethod('OPTIONS')) {
            return $this->cors(response('', 204), $origin);
        }
        if (! $request->isMethod('POST')) {
            return $this->cors(response()->json(['error' => 'O /mcp só aceita POST (Streamable HTTP sem estado).'], 405, ['Allow' => 'POST']), $origin);
        }

        try {
            $credential = Gateway::credential($request, true);
        } catch (ApiProblem $problem) {
            return $this->cors(response()->json(
                ['error' => 'invalid_token', 'error_description' => $problem->getMessage()],
                401,
                ['WWW-Authenticate' => OAuth::challenge($request->bearerToken() ? 'invalid_token' : '')],
            ), $origin);
        }

        $payload = json_decode($request->getContent(), true);
        if (! is_array($payload)) {
            return $this->cors(response()->json(Mcp::error(null, -32700, 'JSON inválido.'), 400), $origin);
        }
        $batch = array_is_list($payload) && $payload !== [];
        $messages = $batch ? $payload : [$payload];
        if (count($messages) > 20) {
            return $this->cors(response()->json(Mcp::error(null, -32600, 'No máximo 20 mensagens por lote.'), 400), $origin);
        }

        $responses = [];
        foreach ($messages as $message) {
            $reply = is_array($message) ? Mcp::handle($message, $credential, $request, $requestId) : Mcp::error(null, -32600, 'Mensagem inválida.');
            if ($reply !== null) {
                $responses[] = $reply;
            }
        }
        if ($responses === []) {
            return $this->cors(response('', 202), $origin);
        }

        return $this->cors(response()->json($batch ? $responses : $responses[0], 200, [
            'X-Request-Id' => $requestId,
            'Cache-Control' => 'no-store',
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), $origin);
    }

    // ---------------------------------------------------------------------------------------------------------------
    // OAuth

    public function resourceMetadata(): JsonResponse
    {
        return response()->json(OAuth::resourceMetadata(), 200, ['Cache-Control' => 'public, max-age=300', 'Access-Control-Allow-Origin' => '*']);
    }

    public function serverMetadata(): JsonResponse
    {
        return response()->json(OAuth::serverMetadata(), 200, ['Cache-Control' => 'public, max-age=300', 'Access-Control-Allow-Origin' => '*']);
    }

    public function register(Request $request): JsonResponse
    {
        try {
            return response()->json(OAuth::register($this->body($request), (string) $request->ip()), 201, ['Cache-Control' => 'no-store']);
        } catch (ApiProblem $problem) {
            return $this->oauthError($problem);
        }
    }

    public function oauthAuthorize(Request $request): RedirectResponse|Response
    {
        try {
            return redirect()->away(OAuth::authorize($request->query(), (string) $request->ip()));
        } catch (ApiProblem $problem) {
            if ($problem->status === 302 && isset($problem->extra['location'])) {
                return redirect()->away((string) $problem->extra['location']);
            }

            return response()->view('manage.oauth-error', ['message' => $problem->getMessage()], $problem->status);
        }
    }

    public function token(Request $request): JsonResponse
    {
        try {
            return response()->json(OAuth::token($this->body($request), (string) $request->ip()), 200, ['Cache-Control' => 'no-store', 'Pragma' => 'no-cache']);
        } catch (ApiProblem $problem) {
            return $this->oauthError($problem);
        }
    }

    public function revoke(Request $request): JsonResponse
    {
        OAuth::revoke((string) ($this->body($request)['token'] ?? ''));

        return response()->json((object) [], 200, ['Cache-Control' => 'no-store']);
    }

    // ---------------------------------------------------------------------------------------------------------------
    // Documentação

    public function openapi(): JsonResponse
    {
        return response()->json(OpenApi::build(), 200, ['Cache-Control' => 'public, max-age=300'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    public function docs(): View
    {
        $groups = [];
        foreach (Catalog::operations() as $op) {
            $area = explode(':', $op['scope'])[0];
            $groups[$area === '*' ? 'geral' : $area][] = $op;
        }

        return view('manage.docs', [
            'groups' => $groups,
            'areas' => Areas::LIST,
            'base' => rtrim((string) config('app.url'), '/'),
            'count' => count(Catalog::operations()),
        ]);
    }

    // ---------------------------------------------------------------------------------------------------------------
    // Apoio

    /**
     * A operação do catálogo para o método e o caminho (a rota literal ganha da com parâmetro), com os parâmetros.
     *
     * @return array{0: array<string, mixed>, 1: array<string, int>}
     */
    private function route(string $method, string $path): array
    {
        $candidates = Catalog::operations();
        uasort($candidates, fn (array $a, array $b) => substr_count($a['path'], '{') <=> substr_count($b['path'], '{'));
        $allowed = [];
        foreach ($candidates as $op) {
            $regex = '#^'.preg_replace('/\\\{(\w+)\\\}/', '(?P<$1>[0-9]+)', preg_quote($op['path'], '#')).'$#';
            if (! preg_match($regex, $path, $matches)) {
                continue;
            }
            if ($op['method'] !== $method) {
                $allowed[] = $op['method'];

                continue;
            }
            $params = [];
            foreach ($matches as $key => $value) {
                if (is_string($key)) {
                    $params[$key] = (int) $value;
                }
            }

            return [$op, $params];
        }

        if ($allowed !== []) {
            throw new ApiProblem(405, 'metodo', 'Método não aceito', 'Este caminho aceita: '.implode(', ', array_unique($allowed)).'.', [], ['Allow' => implode(', ', array_unique($allowed))]);
        }

        throw new ApiProblem(404, 'nao_encontrado', 'Caminho desconhecido', 'Não existe '.$method.' '.$path.'. Veja a lista em /api/manage/docs.');
    }

    /**
     * A entrada da operação: a query no GET e no DELETE (convertida pelo tipo do campo) e o corpo JSON nos demais.
     *
     * @param  array<string, mixed>  $operation
     * @return array<string, mixed>
     */
    private function input(Request $request, array $operation): array
    {
        if (in_array($operation['method'], ['GET', 'DELETE'], true)) {
            $properties = (array) ($operation['input']['properties'] ?? []);
            $input = [];
            foreach ($request->query() as $key => $value) {
                $type = $properties[$key]['type'] ?? 'string';
                $type = is_array($type) ? $type[0] : $type;
                $input[$key] = match (true) {
                    ! is_string($value) => $value,
                    $type === 'integer' && preg_match('/^-?\d+$/', $value) === 1 => (int) $value,
                    $type === 'number' && is_numeric($value) => (float) $value,
                    $type === 'boolean' => in_array(strtolower($value), ['1', 'true', 'sim'], true),
                    default => $value,
                };
            }

            return $input;
        }

        $content = trim($request->getContent());
        if ($content === '') {
            return [];
        }
        $body = json_decode($content, true);
        if (! is_array($body) || array_is_list($body)) {
            throw ApiProblem::badRequest('O corpo precisa ser um objeto JSON (Content-Type: application/json).');
        }

        return $body;
    }

    /** @param  array<string, string>  $headers */
    private function respond(Result|ApiProblem $result, array $headers, string $requestId): SymfonyResponse
    {
        if ($result instanceof ApiProblem) {
            return response()->json($result->toArray($requestId), $result->status, $headers + $result->headers + [
                'Content-Type' => 'application/problem+json',
                'Cache-Control' => 'no-store',
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }

        return response()->json($result->body, $result->status, $headers + $result->headers + ['Cache-Control' => 'no-store'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    private function oauthError(ApiProblem $problem): JsonResponse
    {
        return response()->json(['error' => $problem->errorCode, 'error_description' => $problem->getMessage()], $problem->status === 302 ? 400 : $problem->status, ['Cache-Control' => 'no-store']);
    }

    /** @return array<string, mixed> O corpo do OAuth: formulário ou JSON. */
    private function body(Request $request): array
    {
        if (str_contains((string) $request->header('Content-Type'), 'json')) {
            $json = json_decode($request->getContent(), true);

            return is_array($json) ? $json : [];
        }

        return $request->request->all();
    }

    private function allowedOrigin(string $origin): bool
    {
        $own = array_filter([
            rtrim((string) config('app.url'), '/'),
            rtrim((string) config('franccino.frontend.url'), '/'),
        ]);

        return in_array(rtrim($origin, '/'), [...self::MCP_ORIGINS, ...$own], true)
            || (bool) preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#', $origin);
    }

    private function cors(SymfonyResponse $response, ?string $origin): SymfonyResponse
    {
        if ($origin !== null) {
            $response->headers->set('Access-Control-Allow-Origin', $origin);
            $response->headers->set('Vary', 'Origin');
            $response->headers->set('Access-Control-Allow-Methods', 'POST, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Authorization, Content-Type, Mcp-Protocol-Version, Mcp-Session-Id');
            $response->headers->set('Access-Control-Expose-Headers', 'WWW-Authenticate, X-Request-Id');
        }

        return $response;
    }
}
