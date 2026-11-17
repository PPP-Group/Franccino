<?php

namespace App\Manage;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Rule;

/**
 * Os campos dos recursos (`Resources`) em dois formatos: o JSON Schema que o conector e o OpenAPI mostram e as regras
 * de validação do Laravel, as mesmas do formulário do painel (tamanho, obrigatório, endereço único, formato).
 */
final class Schema
{
    /** Idiomas dos textos traduzíveis; o português é o obrigatório. */
    public const LOCALES = ['pt', 'en'];

    /**
     * @param  array<string, mixed>  $resource
     * @return array<string, array<string, mixed>>
     */
    public static function properties(array $resource): array
    {
        $properties = [];
        foreach ($resource['fields'] as $name => $spec) {
            $properties[$name] = self::json($spec);
        }
        foreach ($resource['relations'] ?? [] as $name => $spec) {
            $properties[$name] = self::json($spec);
        }

        return $properties;
    }

    /**
     * Obrigatórios na criação (o endereço sai do nome quando falta, como no painel).
     *
     * @param  array<string, mixed>  $resource
     * @return list<string>
     */
    public static function requiredOnCreate(array $resource): array
    {
        return array_keys(array_filter(
            $resource['fields'],
            fn (array $spec) => ($spec['required'] ?? false) && ! ($spec['slug'] ?? false),
        ));
    }

    /**
     * @param  array<string, mixed>  $spec
     * @return array<string, mixed>
     */
    public static function json(array $spec): array
    {
        $description = $spec['description'] ?? '';
        $schema = match ($spec['kind']) {
            'i18n' => [
                'type' => 'object',
                'properties' => (object) array_combine(self::LOCALES, array_map(
                    fn (string $locale) => array_filter([
                        'type' => ['string', 'null'],
                        'maxLength' => $spec['max'] ?? null,
                        'format' => ($spec['format'] ?? null) === 'url' ? 'uri' : null,
                        'description' => $locale === 'pt' ? 'Em português.' : 'Em inglês (sem ele, o site em inglês mostra o português).',
                    ]),
                    self::LOCALES,
                )),
                'additionalProperties' => false,
            ],
            'string' => array_filter([
                'type' => ['string', 'null'],
                'maxLength' => $spec['max'] ?? null,
                'format' => match ($spec['format'] ?? null) {
                    'url' => 'uri',
                    'email' => 'email',
                    default => null,
                },
            ]),
            'number' => array_filter(['type' => ['number', 'null'], 'minimum' => $spec['min'] ?? null, 'maximum' => $spec['max'] ?? null], fn ($v) => $v !== null),
            'integer' => ['type' => ['integer', 'null']],
            'boolean' => ['type' => 'boolean'],
            'enum' => ['type' => ($spec['integer'] ?? false) ? 'integer' : 'string', 'enum' => array_values($spec['values'])],
            'datetime' => ['type' => ['string', 'null'], 'format' => 'date-time'],
            'ref' => ['type' => ['integer', 'null']],
            'list' => ['type' => 'array', 'items' => self::json($spec['items'])],
            'objects', 'children' => [
                'type' => 'array',
                'items' => [
                    'type' => 'object',
                    'properties' => (object) array_map(fn (array $sub) => self::json($sub), $spec['fields']),
                    'additionalProperties' => false,
                ],
            ],
            'json' => ['type' => 'array', 'items' => ['type' => 'object', 'properties' => (object) [
                'type' => ['type' => 'string'],
                'data' => ['type' => 'object'],
            ]]],
            'ids' => ['type' => 'array', 'items' => ['type' => 'integer']],
            default => throw new \InvalidArgumentException('Tipo de campo desconhecido: '.$spec['kind']),
        };

        return $description !== '' ? $schema + ['description' => $description] : $schema;
    }

    /**
     * Regras de validação do Laravel para a entrada de criar ou mudar um registro.
     *
     * @param  array<string, mixed>  $resource
     * @return array<string, mixed>
     */
    public static function rules(array $resource, ?Model $record): array
    {
        $creating = $record === null;
        /** @var class-string<Model> $class */
        $class = $resource['model'];
        $table = (new $class)->getTable();
        $rules = [];

        foreach ($resource['fields'] as $name => $spec) {
            $rules += self::fieldRules($name, $spec, $creating, $table, $record?->getKey());
        }
        foreach ($resource['relations'] ?? [] as $name => $spec) {
            $rules += self::fieldRules($name, $spec, $creating, $table, $record?->getKey());
        }

        return $rules;
    }

    /**
     * @param  array<string, mixed>  $spec
     * @return array<string, mixed>
     */
    public static function fieldRules(string $name, array $spec, bool $creating, ?string $table = null, mixed $ignoreId = null): array
    {
        $required = $creating && ($spec['required'] ?? false);
        $presence = $required ? ['required'] : ['sometimes'];

        switch ($spec['kind']) {
            case 'i18n':
                $rules = [$name => [...$presence, 'array:'.implode(',', self::LOCALES)]];
                foreach (self::LOCALES as $locale) {
                    $rule = [$locale === 'pt' && $required ? 'required' : 'nullable', 'string'];
                    if (isset($spec['max'])) {
                        $rule[] = 'max:'.$spec['max'];
                    }
                    if (($spec['format'] ?? null) === 'url') {
                        $rule[] = 'url';
                    }
                    if ($spec['slug'] ?? false) {
                        $rule[] = 'alpha_dash';
                        $rule[] = Rule::unique($table, "slug->{$locale}")->ignore($ignoreId);
                    }
                    if ($locale === 'pt' && ! $creating && ($spec['required'] ?? false)) {
                        // Mudando: o português de um campo obrigatório não pode ficar vazio.
                        $rule[0] = 'sometimes';
                        $rule[] = 'filled';
                    }
                    $rules["{$name}.{$locale}"] = $rule;
                }

                return $rules;

            case 'string':
                $rule = [...$presence, $required ? 'string' : 'nullable', 'string'];
                if (! $creating && ($spec['required'] ?? false)) {
                    $rule = ['sometimes', 'filled', 'string'];
                }
                if (isset($spec['max'])) {
                    $rule[] = 'max:'.$spec['max'];
                }
                $rule = [...$rule, ...match ($spec['format'] ?? null) {
                    'url' => ['url'],
                    'email' => ['email'],
                    'phone' => ['regex:/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\.\/0-9]*$/'],
                    default => [],
                }];
                if (isset($spec['starts_with'])) {
                    $rule[] = 'starts_with:'.$spec['starts_with'];
                }
                if (($spec['slug'] ?? false)) {
                    $rule[] = 'alpha_dash';
                }
                if (($spec['slug'] ?? false) || ($spec['unique'] ?? false)) {
                    $rule[] = Rule::unique($table, $name)->ignore($ignoreId);
                }

                return [$name => array_values(array_unique($rule, SORT_REGULAR))];

            case 'number':
            case 'integer':
                $rule = [...$presence, $required ? 'required' : 'nullable', $spec['kind'] === 'integer' ? 'integer' : 'numeric'];
                if (isset($spec['min'])) {
                    $rule[] = 'min:'.$spec['min'];
                }
                if (isset($spec['max'])) {
                    $rule[] = 'max:'.$spec['max'];
                }

                return [$name => array_values(array_unique($rule))];

            case 'boolean':
                return [$name => ['sometimes', 'boolean']];

            case 'enum':
                return [$name => [...$presence, Rule::in($spec['values'])]];

            case 'datetime':
                return [$name => ['sometimes', 'nullable', 'date']];

            case 'ref':
                /** @var class-string<Model> $model */
                $model = $spec['model'];

                return [$name => [...$presence, $required ? 'integer' : 'nullable', 'integer', Rule::exists((new $model)->getTable(), 'id')]];

            case 'list':
                return [$name => ['sometimes', 'nullable', 'array', 'max:50']]
                    + self::fieldRules("{$name}.*", $spec['items'] + ['required' => true], true, $table);

            case 'objects':
            case 'children':
                $rules = [$name => ['sometimes', 'nullable', 'array', 'max:100'], "{$name}.*" => ['array']];
                foreach ($spec['fields'] as $sub => $subSpec) {
                    $rules += self::fieldRules("{$name}.*.{$sub}", $subSpec, true, $table);
                }

                return $rules;

            case 'json':
                return [
                    $name => ['sometimes', 'nullable', 'array', 'max:100'],
                    "{$name}.*" => ['array'],
                    "{$name}.*.type" => ['required', 'string', 'max:40'],
                    "{$name}.*.data" => ['present', 'array'],
                ];

            case 'ids':
                /** @var class-string<Model> $model */
                $model = $spec['model'];

                return [
                    $name => ['sometimes', 'array', 'max:300'],
                    "{$name}.*" => ['integer', 'distinct', Rule::exists((new $model)->getTable(), 'id')],
                ];
        }

        throw new \InvalidArgumentException('Tipo de campo desconhecido: '.$spec['kind']);
    }
}
