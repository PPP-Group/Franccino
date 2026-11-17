<?php

namespace App\Manage;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

/**
 * Executa uma operação do catálogo para quem chama, pela REST e pelo conector igual: confere o escopo, recusa campo
 * desconhecido, entra como a conta interna da credencial (as permissões do painel, o registro de atividade e a
 * atualização do site valem como no painel) e chama o tratamento do recurso ou a operação especial.
 */
final class Engine
{
    /** @param  array<string, mixed>  $input */
    public static function run(string $operationId, array $input, Context $context): Result
    {
        $operation = Catalog::operations()[$operationId] ?? throw ApiProblem::notFound('A operação '.$operationId);

        if (! Areas::allows($context->credential->scopes, $operation['scope'])) {
            throw ApiProblem::forbidden($operation['scope']);
        }

        self::rejectUnknown($operation, $input);

        $previous = Auth::user();
        Auth::setUser($context->user);
        try {
            [$type, $target] = $operation['handler'];
            $run = fn () => $type === 'special'
                ? Specials::run($target, $input, $context)
                : (new ResourceHandler($target, $context))->run($type, $input);

            return $operation['method'] === 'GET' ? $run() : DB::transaction($run);
        } finally {
            if ($previous !== null) {
                Auth::setUser($previous);
            } else {
                Auth::forgetUser();
            }
        }
    }

    /**
     * Campo que a operação não conhece dá 400 com o nome dele (erro de digitação não passa calado).
     *
     * @param  array<string, mixed>  $operation
     * @param  array<string, mixed>  $input
     */
    private static function rejectUnknown(array $operation, array $input): void
    {
        $known = array_keys((array) ($operation['input']['properties'] ?? []));
        $unknown = array_values(array_diff(array_keys($input), $known));
        if ($unknown !== []) {
            throw ApiProblem::badRequest('Campo desconhecido: '.implode(', ', $unknown).'. Os campos aceitos são: '.implode(', ', $known).'.');
        }
    }
}
