<?php

namespace App\Manage;

use RuntimeException;

/**
 * Um erro da API de gestão, que sai em `application/problem+json` (RFC 9457) com a frase em português e o código
 * (`codigo`) que a documentação explica. No conector, a mesma frase volta como resultado com `isError: true`, para o
 * modelo ler e se corrigir.
 */
class ApiProblem extends RuntimeException
{
    /** @param  array<string, mixed>  $extra */
    public function __construct(
        public readonly int $status,
        public readonly string $errorCode,
        public readonly string $title,
        string $detail,
        public readonly array $extra = [],
        /** @var array<string, string> */
        public readonly array $headers = [],
    ) {
        parent::__construct($detail);
    }

    public static function notFound(string $what = 'O registro'): self
    {
        return new self(404, 'nao_encontrado', 'Não encontrado', "{$what} não existe.");
    }

    public static function invalid(string $detail, array $errors = []): self
    {
        return new self(422, 'regra', 'Dados recusados', $detail, $errors === [] ? [] : ['erros' => $errors]);
    }

    public static function badRequest(string $detail): self
    {
        return new self(400, 'valor_invalido', 'Pedido inválido', $detail);
    }

    public static function forbidden(string $scope): self
    {
        return new self(403, 'escopo', 'Sem permissão',
            "Esta credencial não tem a permissão {$scope} (".Areas::describe($scope).'). Crie uma chave com ela, ou reconecte o aplicativo pedindo essa permissão, no painel (API e conectores).',
            ['escopo' => $scope]);
    }

    /** @return array<string, mixed> */
    public function toArray(string $requestId): array
    {
        return [
            'type' => rtrim((string) config('app.url'), '/').'/api/manage/docs#erro-'.$this->errorCode,
            'title' => $this->title,
            'status' => $this->status,
            'detail' => $this->getMessage(),
            'codigo' => $this->errorCode,
            'requisicao' => $requestId,
        ] + $this->extra;
    }
}
