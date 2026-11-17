<?php

namespace App\Manage;

/** O OpenAPI 3.1 da API de gestão, montado do catálogo: nada escrito à mão operação por operação. */
final class OpenApi
{
    /** @return array<string, mixed> */
    public static function build(): array
    {
        $base = rtrim((string) config('app.url'), '/');
        $paths = [];

        foreach (Catalog::operations() as $op) {
            preg_match_all('/\{(\w+)\}/', $op['path'], $matches);
            $pathParams = $matches[1];
            $properties = (array) ($op['input']['properties'] ?? []);
            $required = $op['input']['required'] ?? [];
            $parameters = [];

            foreach ($pathParams as $param) {
                $parameters[] = ['name' => $param, 'in' => 'path', 'required' => true, 'schema' => ['type' => 'integer'], 'description' => $properties[$param]['description'] ?? ''];
                unset($properties[$param]);
            }

            $operation = [
                'operationId' => $op['id'],
                'summary' => $op['title'],
                'description' => $op['description']."\n\nPermissão: `{$op['scope']}`".($op['destructive'] ? "\n\nMuda ou desfaz algo." : ''),
                'tags' => [Areas::LIST[explode(':', $op['scope'])[0]]['label'] ?? 'Geral'],
                'security' => [['chave' => []], ['oauth' => $op['scope'] === '*' ? [] : [$op['scope']]]],
                'x-franccino-escopo' => $op['scope'],
                'x-franccino-destrutivo' => $op['destructive'],
            ];

            if (in_array($op['method'], ['GET', 'DELETE'], true)) {
                foreach ($properties as $name => $schema) {
                    $parameters[] = ['name' => $name, 'in' => 'query', 'required' => in_array($name, $required, true), 'schema' => $schema, 'description' => $schema['description'] ?? ''];
                }
            } elseif ($properties !== []) {
                $operation['requestBody'] = [
                    'required' => true,
                    'content' => ['application/json' => ['schema' => [
                        'type' => 'object',
                        'properties' => (object) $properties,
                        'required' => array_values(array_diff($required, $pathParams)),
                        'additionalProperties' => false,
                    ]]],
                ];
            }
            if ($op['method'] !== 'GET') {
                $parameters[] = ['$ref' => '#/components/parameters/IdempotencyKey'];
            }
            if (in_array($op['method'], ['PATCH', 'DELETE'], true)) {
                $parameters[] = ['$ref' => '#/components/parameters/IfMatch'];
            }
            $operation['parameters'] = $parameters;
            $operation['responses'] = [
                str_ends_with($op['id'], '_create') || str_ends_with($op['id'], '_add') ? '201' : '200' => ['description' => 'Certo.', 'content' => ['application/json' => ['schema' => ['type' => 'object']]]],
                '400' => ['$ref' => '#/components/responses/Problem'],
                '401' => ['$ref' => '#/components/responses/Problem'],
                '403' => ['$ref' => '#/components/responses/Problem'],
                '404' => ['$ref' => '#/components/responses/Problem'],
                '412' => ['$ref' => '#/components/responses/Problem'],
                '422' => ['$ref' => '#/components/responses/Problem'],
                '429' => ['$ref' => '#/components/responses/Problem'],
            ];

            $paths[$op['path']][strtolower($op['method'])] = $operation;
        }

        return [
            'openapi' => '3.1.0',
            'info' => [
                'title' => 'Franccino: API de gestão',
                'version' => '1.0.0',
                'description' => 'O que o painel do site faz, por API: peças, coleções, lançamentos, designers, categorias, linhas, acabamentos, projetos, ambientes, lojas, banners, páginas, clientes, redirecionamentos e configurações, com as mesmas regras do painel. Guia: '.$base.'/api/manage/docs',
            ],
            'servers' => [['url' => $base.'/api/manage/v1']],
            'paths' => (object) $paths,
            'components' => [
                'securitySchemes' => [
                    'chave' => ['type' => 'http', 'scheme' => 'bearer', 'description' => 'A chave criada no painel (API e conectores), `fcc_...`.'],
                    'oauth' => ['type' => 'oauth2', 'flows' => ['authorizationCode' => [
                        'authorizationUrl' => $base.'/oauth/authorize',
                        'tokenUrl' => $base.'/oauth/token',
                        'refreshUrl' => $base.'/oauth/token',
                        'scopes' => (object) array_combine(Areas::scopes(), array_map(fn (string $s) => Areas::describe($s), Areas::scopes())),
                    ]]],
                ],
                'parameters' => [
                    'IdempotencyKey' => ['name' => 'Idempotency-Key', 'in' => 'header', 'required' => false, 'schema' => ['type' => 'string', 'minLength' => 8, 'maxLength' => 120], 'description' => 'O mesmo pedido com a mesma chave devolve a mesma resposta por 24 horas.'],
                    'IfMatch' => ['name' => 'If-Match', 'in' => 'header', 'required' => false, 'schema' => ['type' => 'string'], 'description' => 'O ETag da leitura: se o registro mudou depois, a resposta é 412.'],
                ],
                'responses' => [
                    'Problem' => ['description' => 'Erro (RFC 9457), com a frase em português.', 'content' => ['application/problem+json' => ['schema' => [
                        'type' => 'object',
                        'properties' => (object) [
                            'type' => ['type' => 'string'], 'title' => ['type' => 'string'], 'status' => ['type' => 'integer'],
                            'detail' => ['type' => 'string'], 'codigo' => ['type' => 'string'], 'requisicao' => ['type' => 'string'],
                        ],
                    ]]]],
                ],
            ],
        ];
    }
}
