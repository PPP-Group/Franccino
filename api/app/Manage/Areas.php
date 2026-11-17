<?php

namespace App\Manage;

/**
 * As áreas da API de gestão (docs/api-gestao.md): uma por tela do painel. Cada área tem os escopos `area:ler` e
 * `area:escrever`, e escrever já inclui ler. `mensagens` só tem leitura: contatos, newsletter, listas de desejos e
 * downloads trazem dados pessoais de clientes e não mudam pela API.
 *
 * Fica de fora de propósito (decisão de 17/11/2026): usuários e permissões do painel, o registro de atividade, os
 * registros de consentimento (LGPD), apagar peças em definitivo e as próprias chaves da API.
 */
final class Areas
{
    /** @var array<string, array{label: string, write: bool}> */
    public const LIST = [
        'pecas' => ['label' => 'Peças', 'write' => true],
        'colecoes' => ['label' => 'Coleções', 'write' => true],
        'lancamentos' => ['label' => 'Lançamentos', 'write' => true],
        'designers' => ['label' => 'Designers', 'write' => true],
        'categorias' => ['label' => 'Categorias e áreas', 'write' => true],
        'linhas' => ['label' => 'Linhas', 'write' => true],
        'acabamentos' => ['label' => 'Acabamentos', 'write' => true],
        'projetos' => ['label' => 'Projetos', 'write' => true],
        'ambientes' => ['label' => 'Ambientes', 'write' => true],
        'lojas' => ['label' => 'Lojas', 'write' => true],
        'banners' => ['label' => 'Banners', 'write' => true],
        'paginas' => ['label' => 'Páginas', 'write' => true],
        'clientes' => ['label' => 'Clientes (logos)', 'write' => true],
        'redirecionamentos' => ['label' => 'Redirecionamentos', 'write' => true],
        'configuracoes' => ['label' => 'Configurações gerais', 'write' => true],
        'mensagens' => ['label' => 'Mensagens, listas e downloads', 'write' => false],
    ];

    /** @return list<string> Todos os escopos válidos. */
    public static function scopes(): array
    {
        $scopes = [];
        foreach (self::LIST as $area => $info) {
            $scopes[] = "{$area}:ler";
            if ($info['write']) {
                $scopes[] = "{$area}:escrever";
            }
        }

        return $scopes;
    }

    /** @return list<string> O máximo que se pode pedir: escrever onde dá, ler no resto. */
    public static function fullScopes(): array
    {
        return array_map(
            fn (string $area) => self::LIST[$area]['write'] ? "{$area}:escrever" : "{$area}:ler",
            array_keys(self::LIST),
        );
    }

    /**
     * @param  list<string>  $granted
     *                                 O escopo pedido pela operação está entre os da credencial? `*` vale para qualquer credencial;
     *                                 `area:escrever` inclui `area:ler`.
     */
    public static function allows(array $granted, string $required): bool
    {
        if ($required === '*') {
            return true;
        }
        if (in_array($required, $granted, true)) {
            return true;
        }
        [$area, $level] = explode(':', $required) + [1 => ''];

        return $level === 'ler' && in_array("{$area}:escrever", $granted, true);
    }

    /**
     * @param  array<int, mixed>  $scopes
     * @return list<string> Só os escopos válidos, sem repetir, com `ler` absorvido por `escrever`.
     */
    public static function normalize(array $scopes): array
    {
        $valid = array_values(array_unique(array_filter(
            array_map('strval', $scopes),
            fn (string $scope) => in_array($scope, self::scopes(), true),
        )));

        return array_values(array_filter(
            $valid,
            fn (string $scope) => ! (str_ends_with($scope, ':ler')
                && in_array(substr($scope, 0, -4).':escrever', $valid, true)),
        ));
    }

    /** "pecas:escrever" → "Peças: ler e mudar". */
    public static function describe(string $scope): string
    {
        [$area, $level] = explode(':', $scope) + [1 => ''];
        $label = self::LIST[$area]['label'] ?? $area;

        return $label.': '.($level === 'escrever' ? 'ler e mudar' : 'ler');
    }
}
