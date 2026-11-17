<?php

namespace App\Manage;

use App\Enums\ProductFileType;

/**
 * O catálogo da API de gestão (docs/api-gestao.md): cada operação descrita uma vez, e dela saem a rota REST, a
 * ferramenta do conector (MCP), o OpenAPI e a página de documentação. As operações dos recursos (listar, ler, criar,
 * mudar, apagar, fotos, arquivos técnicos e vídeos) saem de `Resources`; as especiais (configurações, imagens dos
 * blocos das páginas, caixa de entrada) ficam aqui.
 *
 * Cada operação: `id` (nome da ferramenta e `operationId`), `method`, `path` (sem o `/api/manage/v1`), `scope`,
 * `title`, `description`, `input` (JSON Schema), `handler` (`[tipo, recurso]`), `destructive` (desfaz ou troca algo:
 * o aplicativo pede confirmação) e `additive` (só acrescenta).
 */
final class Catalog
{
    /** @var array<string, array<string, mixed>>|null */
    private static ?array $operations = null;

    /** @return array<string, array<string, mixed>> */
    public static function operations(): array
    {
        if (self::$operations !== null) {
            return self::$operations;
        }

        $ops = [];
        $add = function (array $op) use (&$ops): void {
            $ops[$op['id']] = $op + ['destructive' => false, 'additive' => false];
        };

        $add([
            'id' => 'me',
            'method' => 'GET',
            'path' => '/me',
            'scope' => '*',
            'title' => 'Ver esta credencial',
            'description' => 'O nome da chave ou da conexão, as permissões e o endereço do site. Bom para começar.',
            'input' => self::object([]),
            'handler' => ['special', 'me'],
        ]);

        foreach (Resources::all() as $key => $resource) {
            foreach (self::resourceOperations($key, $resource) as $op) {
                $add($op);
            }
        }

        foreach (self::specials() as $op) {
            $add($op);
        }

        return self::$operations = $ops;
    }

    /** @return array<string, mixed> */
    public static function get(string $id): array
    {
        return self::operations()[$id] ?? throw new \InvalidArgumentException("Operação {$id} não existe.");
    }

    /** Nome da operação a partir do recurso: `finish-groups` → `finish_groups`. */
    public static function slug(string $resource): string
    {
        return str_replace('-', '_', $resource);
    }

    /**
     * @param  array<string, mixed>  $r
     * @return list<array<string, mixed>>
     */
    private static function resourceOperations(string $key, array $r): array
    {
        $base = '/'.$key;
        $name = self::slug($key);
        $read = $r['area'].':ler';
        $write = $r['area'].':escrever';
        $idField = ['id' => ['type' => 'integer', 'description' => 'Id do registro.']];
        $ops = [];

        $filters = [
            'q' => ['type' => 'string', 'description' => 'Busca pelo nome ou título (sem acento também acha).'],
            'published' => ['type' => 'boolean', 'description' => 'Só publicados (true) ou só rascunhos (false).'],
        ];
        foreach ($r['filters'] ?? [] as $field => $spec) {
            $filters[$field] = Schema::json($spec);
        }
        $ops[] = [
            'id' => "{$name}_list",
            'method' => 'GET',
            'path' => $base,
            'scope' => $read,
            'title' => 'Listar '.$r['plural'],
            'description' => 'Lista '.$r['plural'].' (o resumo de cada um, inclusive rascunhos). Use `cursor` para a página seguinte.',
            'input' => self::object($filters + self::paging()),
            'handler' => ['list', $key],
        ];
        $ops[] = [
            'id' => "{$name}_get",
            'method' => 'GET',
            'path' => $base.'/{id}',
            'scope' => $read,
            'title' => 'Ver '.self::article($r['label']).' '.$r['label'],
            'description' => 'Todos os campos, as relações e as fotos de '.self::article($r['label']).' '.$r['label'].', em português e inglês. Devolve o `ETag` da versão.',
            'input' => self::object($idField, ['id']),
            'handler' => ['get', $key],
        ];

        $fields = Schema::properties($r);
        if ($r['create'] ?? true) {
            $ops[] = [
                'id' => "{$name}_create",
                'method' => 'POST',
                'path' => $base,
                'scope' => $write,
                'title' => 'Criar '.self::article($r['label']).' '.$r['label'],
                'description' => 'Cria '.self::article($r['label']).' '.$r['label'].' com as mesmas regras do painel. Textos por idioma vão como `{"pt": "...", "en": "..."}`. Fotos entram depois, por `'.$name.'_media_add`.',
                'input' => self::object($fields, Schema::requiredOnCreate($r)),
                'handler' => ['create', $key],
                'additive' => true,
            ];
        }
        $ops[] = [
            'id' => "{$name}_update",
            'method' => 'PATCH',
            'path' => $base.'/{id}',
            'scope' => $write,
            'title' => 'Mudar '.self::article($r['label']).' '.$r['label'],
            'description' => 'Muda só os campos enviados. Num texto por idioma, só os idiomas enviados mudam (`null` apaga aquele idioma). Uma lista de relação troca a lista inteira. Leia antes de mudar.',
            'input' => self::object($idField + $fields, ['id']),
            'handler' => ['update', $key],
            'destructive' => true,
        ];
        if (($r['delete'] ?? true) !== false) {
            $ops[] = [
                'id' => "{$name}_delete",
                'method' => 'DELETE',
                'path' => $base.'/{id}',
                'scope' => $write,
                'title' => 'Apagar '.self::article($r['label']).' '.$r['label'],
                'description' => is_string($r['delete'] ?? null)
                    ? 'Apaga '.self::article($r['label']).' '.$r['label'].'. '.$r['delete']
                    : 'Apaga '.self::article($r['label']).' '.$r['label'].' de vez, com as fotos dele. Confirme com a pessoa antes.',
                'input' => self::object($idField, ['id']),
                'handler' => ['delete', $key],
                'destructive' => true,
            ];
        }

        if (! empty($r['media'])) {
            $collections = array_keys($r['media']);
            $describe = implode('; ', array_map(
                fn (string $c) => "`{$c}`: ".$r['media'][$c]['description'].($r['media'][$c]['single'] ? ' (uma só: troca a atual)' : ' (várias)'),
                $collections,
            ));
            $ops[] = [
                'id' => "{$name}_media_add",
                'method' => 'POST',
                'path' => $base.'/{id}/media',
                'scope' => $write,
                'title' => 'Enviar foto ou arquivo de mídia',
                'description' => 'Põe uma foto (ou vídeo, ou modelo 3D) na coleção pedida, a partir de um endereço https público (`url`) ou do arquivo em base64 (`data` + `filename`). Coleções: '.$describe.'.',
                'input' => self::object($idField + [
                    'collection' => ['type' => 'string', 'enum' => $collections, 'description' => 'Coleção.'],
                    'url' => ['type' => 'string', 'format' => 'uri', 'description' => 'Endereço https público do arquivo.'],
                    'data' => ['type' => 'string', 'description' => 'O arquivo em base64 (no lugar de `url`), até 10 MB.'],
                    'filename' => ['type' => 'string', 'description' => 'Nome do arquivo, com a extensão (com `data`, ou para trocar o nome).'],
                ], ['id', 'collection']),
                'handler' => ['media_add', $key],
                'destructive' => true,
            ];
            $ops[] = [
                'id' => "{$name}_media_remove",
                'method' => 'DELETE',
                'path' => $base.'/{id}/media/{media_id}',
                'scope' => $write,
                'title' => 'Tirar uma foto',
                'description' => 'Tira a foto (o id vem de `'.$name.'_get`, em `media`). Apaga o arquivo.',
                'input' => self::object($idField + ['media_id' => ['type' => 'integer', 'description' => 'Id da foto.']], ['id', 'media_id']),
                'handler' => ['media_remove', $key],
                'destructive' => true,
            ];
            $multiple = array_values(array_filter($collections, fn (string $c) => ! $r['media'][$c]['single']));
            if ($multiple !== []) {
                $ops[] = [
                    'id' => "{$name}_media_order",
                    'method' => 'PUT',
                    'path' => $base.'/{id}/media/order',
                    'scope' => $write,
                    'title' => 'Mudar a ordem das fotos',
                    'description' => 'Põe as fotos da coleção na ordem dos ids enviados (todas as da coleção).',
                    'input' => self::object($idField + [
                        'collection' => ['type' => 'string', 'enum' => $multiple, 'description' => 'Coleção.'],
                        'media_ids' => ['type' => 'array', 'items' => ['type' => 'integer'], 'description' => 'Ids das fotos, na ordem nova.'],
                    ], ['id', 'collection', 'media_ids']),
                    'handler' => ['media_order', $key],
                    'destructive' => true,
                ];
            }
            if (isset($r['media']['cover'], $r['media']['gallery'])) {
                $ops[] = [
                    'id' => "{$name}_cover_from_gallery",
                    'method' => 'POST',
                    'path' => $base.'/{id}/cover',
                    'scope' => $write,
                    'title' => 'Trocar a capa por uma foto da galeria',
                    'description' => 'A foto da galeria vira a capa; a capa antiga vai para a galeria. Na peça, a capa é a foto na diagonal virada para a esquerda (sem ela, a de frente). Se a peça tiver foto sem fundo (`cutout`), ela foi feita da capa antiga: avise a pessoa.',
                    'input' => self::object($idField + ['media_id' => ['type' => 'integer', 'description' => 'Id da foto da galeria.']], ['id', 'media_id']),
                    'handler' => ['cover_from_gallery', $key],
                    'destructive' => true,
                ];
            }
        }

        if ($r['files'] ?? false) {
            foreach (self::fileOperations($key, $name, $write, $read, $idField) as $op) {
                $ops[] = $op;
            }
        }
        if ($r['links'] ?? false) {
            foreach (self::linkOperations($key, $name, $write, $read, $idField) as $op) {
                $ops[] = $op;
            }
        }

        return $ops;
    }

    /**
     * @param  array<string, mixed>  $idField
     * @return list<array<string, mixed>>
     */
    private static function fileOperations(string $key, string $name, string $write, string $read, array $idField): array
    {
        $types = array_column(ProductFileType::cases(), 'value');
        $fileId = ['file_id' => ['type' => 'integer', 'description' => 'Id do arquivo.']];
        $meta = [
            'type' => ['type' => 'string', 'enum' => $types, 'description' => 'Tipo: ficha técnica, bloco 2D, bloco 3D, manual, catálogo, apresentação ou outro.'],
            'title' => Schema::json(['kind' => 'i18n', 'max' => 160, 'description' => 'Título do arquivo.']),
            'format' => ['type' => 'string', 'maxLength' => 20, 'description' => 'Formato mostrado no site (ex.: PDF, DWG). Sai da extensão quando falta.'],
            'is_published' => ['type' => 'boolean', 'description' => 'Publicado no site.'],
        ];

        return [
            ['id' => "{$name}_files_list", 'method' => 'GET', 'path' => "/{$key}/{id}/files", 'scope' => $read,
                'title' => 'Listar os arquivos técnicos', 'description' => 'Os arquivos para baixar (fichas, blocos 2D e 3D, manuais).',
                'input' => self::object($idField, ['id']), 'handler' => ['files_list', $key]],
            ['id' => "{$name}_files_add", 'method' => 'POST', 'path' => "/{$key}/{id}/files", 'scope' => $write,
                'title' => 'Enviar um arquivo técnico', 'description' => 'Envia um arquivo para baixar, a partir de `url` (https público) ou de `data` (base64) com `filename`.',
                'input' => self::object($idField + $meta + [
                    'url' => ['type' => 'string', 'format' => 'uri', 'description' => 'Endereço https público do arquivo.'],
                    'data' => ['type' => 'string', 'description' => 'O arquivo em base64, até 10 MB.'],
                    'filename' => ['type' => 'string', 'description' => 'Nome do arquivo, com a extensão.'],
                ], ['id', 'type', 'title']), 'handler' => ['files_add', $key], 'additive' => true],
            ['id' => "{$name}_files_update", 'method' => 'PATCH', 'path' => "/{$key}/{id}/files/{file_id}", 'scope' => $write,
                'title' => 'Mudar um arquivo técnico', 'description' => 'Muda o tipo, o título, o formato ou a publicação do arquivo.',
                'input' => self::object($idField + $fileId + $meta, ['id', 'file_id']), 'handler' => ['files_update', $key], 'destructive' => true],
            ['id' => "{$name}_files_remove", 'method' => 'DELETE', 'path' => "/{$key}/{id}/files/{file_id}", 'scope' => $write,
                'title' => 'Apagar um arquivo técnico', 'description' => 'Apaga o arquivo de vez.',
                'input' => self::object($idField + $fileId, ['id', 'file_id']), 'handler' => ['files_remove', $key], 'destructive' => true],
        ];
    }

    /**
     * @param  array<string, mixed>  $idField
     * @return list<array<string, mixed>>
     */
    private static function linkOperations(string $key, string $name, string $write, string $read, array $idField): array
    {
        $linkId = ['link_id' => ['type' => 'integer', 'description' => 'Id do vídeo ou link.']];
        $meta = [
            'kind' => ['type' => 'string', 'enum' => ['video', 'link'], 'description' => 'Vídeo (YouTube e Vimeo tocam no site) ou link externo.'],
            'title' => Schema::json(['kind' => 'i18n', 'max' => 160, 'description' => 'Título.']),
            'url' => ['type' => 'string', 'format' => 'uri', 'maxLength' => 512, 'description' => 'Endereço.'],
        ];

        return [
            ['id' => "{$name}_links_list", 'method' => 'GET', 'path' => "/{$key}/{id}/links", 'scope' => $read,
                'title' => 'Listar os vídeos e links', 'description' => 'Os vídeos e links externos.',
                'input' => self::object($idField, ['id']), 'handler' => ['links_list', $key]],
            ['id' => "{$name}_links_add", 'method' => 'POST', 'path' => "/{$key}/{id}/links", 'scope' => $write,
                'title' => 'Pôr um vídeo ou link', 'description' => 'Acrescenta um vídeo ou link externo.',
                'input' => self::object($idField + $meta, ['id', 'kind', 'title', 'url']), 'handler' => ['links_add', $key], 'additive' => true],
            ['id' => "{$name}_links_update", 'method' => 'PATCH', 'path' => "/{$key}/{id}/links/{link_id}", 'scope' => $write,
                'title' => 'Mudar um vídeo ou link', 'description' => 'Muda o tipo, o título ou o endereço.',
                'input' => self::object($idField + $linkId + $meta, ['id', 'link_id']), 'handler' => ['links_update', $key], 'destructive' => true],
            ['id' => "{$name}_links_remove", 'method' => 'DELETE', 'path' => "/{$key}/{id}/links/{link_id}", 'scope' => $write,
                'title' => 'Tirar um vídeo ou link', 'description' => 'Tira o vídeo ou link.',
                'input' => self::object($idField + $linkId, ['id', 'link_id']), 'handler' => ['links_remove', $key], 'destructive' => true],
        ];
    }

    /** @return list<array<string, mixed>> */
    private static function specials(): array
    {
        $settings = Settings::schema();

        return [
            ['id' => 'settings_get', 'method' => 'GET', 'path' => '/settings', 'scope' => 'configuracoes:ler',
                'title' => 'Ver as configurações gerais', 'description' => 'Nome da empresa, contatos, WhatsApp, redes sociais, destinatários do formulário e documentos do rodapé. Devolve o `ETag`.',
                'input' => self::object([]), 'handler' => ['special', 'settings_get']],
            ['id' => 'settings_update', 'method' => 'PATCH', 'path' => '/settings', 'scope' => 'configuracoes:escrever',
                'title' => 'Mudar as configurações gerais', 'description' => 'Muda só os campos enviados, com as regras do painel. Uma lista troca a lista inteira.',
                'input' => self::object($settings), 'handler' => ['special', 'settings_update'], 'destructive' => true],
            ['id' => 'pages_image_upload', 'method' => 'POST', 'path' => '/pages/{id}/images', 'scope' => 'paginas:escrever',
                'title' => 'Enviar uma imagem para um bloco da página', 'description' => 'Guarda a imagem e devolve o `path` para usar no bloco (image, image_text, gallery, poster do video) em `pages_update`. Sozinha não muda a página.',
                'input' => self::object([
                    'id' => ['type' => 'integer', 'description' => 'Id da página.'],
                    'url' => ['type' => 'string', 'format' => 'uri', 'description' => 'Endereço https público da imagem.'],
                    'data' => ['type' => 'string', 'description' => 'A imagem em base64, até 10 MB.'],
                    'filename' => ['type' => 'string', 'description' => 'Nome do arquivo, com a extensão.'],
                ], ['id']), 'handler' => ['special', 'pages_image_upload'], 'additive' => true],
            ['id' => 'contact_messages_list', 'method' => 'GET', 'path' => '/inbox/contact-messages', 'scope' => 'mensagens:ler',
                'title' => 'Listar as mensagens de contato', 'description' => 'Mensagens do formulário de contato e de orçamento, da mais nova para a mais antiga. Têm dados pessoais: use só para atender.',
                'input' => self::object(['since' => ['type' => 'string', 'format' => 'date-time', 'description' => 'Só a partir desta data.']] + self::paging()),
                'handler' => ['special', 'inbox_contact']],
            ['id' => 'quote_lists_list', 'method' => 'GET', 'path' => '/inbox/quote-lists', 'scope' => 'mensagens:ler',
                'title' => 'Listar as listas de desejos compartilhadas', 'description' => 'As listas que os visitantes compartilharam, com as peças e as quantidades.',
                'input' => self::object(['since' => ['type' => 'string', 'format' => 'date-time', 'description' => 'Só a partir desta data.']] + self::paging()),
                'handler' => ['special', 'inbox_quote_lists']],
            ['id' => 'newsletter_list', 'method' => 'GET', 'path' => '/inbox/newsletter', 'scope' => 'mensagens:ler',
                'title' => 'Listar os inscritos na newsletter', 'description' => 'E-mails inscritos, do mais novo para o mais antigo.',
                'input' => self::object(['since' => ['type' => 'string', 'format' => 'date-time', 'description' => 'Só a partir desta data.']] + self::paging()),
                'handler' => ['special', 'inbox_newsletter']],
            ['id' => 'downloads_list', 'method' => 'GET', 'path' => '/inbox/downloads', 'scope' => 'mensagens:ler',
                'title' => 'Listar os downloads', 'description' => 'Quem baixou qual arquivo técnico e quando.',
                'input' => self::object(['since' => ['type' => 'string', 'format' => 'date-time', 'description' => 'Só a partir desta data.']] + self::paging()),
                'handler' => ['special', 'inbox_downloads']],
        ];
    }

    /** @return array<string, array<string, mixed>> */
    private static function paging(): array
    {
        return [
            'limit' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 200, 'description' => 'Quantos por página (1 a 200; padrão 50).'],
            'cursor' => ['type' => 'string', 'description' => 'O `next_cursor` da página anterior.'],
        ];
    }

    /**
     * @param  array<string, mixed>  $properties
     * @param  list<string>  $required
     * @return array<string, mixed>
     */
    private static function object(array $properties, array $required = []): array
    {
        $schema = ['type' => 'object', 'properties' => (object) $properties];
        if ($required !== []) {
            $schema['required'] = $required;
        }

        return $schema;
    }

    private static function article(string $label): string
    {
        return in_array(mb_substr($label, -1), ['a', 'ã'], true) || str_ends_with($label, 'ção') ? 'uma' : 'um';
    }
}
