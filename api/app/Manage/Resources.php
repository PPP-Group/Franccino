<?php

namespace App\Manage;

use App\Enums\BannerPlacement;
use App\Enums\ProductRoom;
use App\Enums\ProjectType;
use App\Enums\RedirectStatus;
use App\Enums\StoreType;
use App\Models\Area;
use App\Models\Banner;
use App\Models\Category;
use App\Models\Client;
use App\Models\Collection;
use App\Models\Designer;
use App\Models\Finish;
use App\Models\FinishGroup;
use App\Models\Launch;
use App\Models\Line;
use App\Models\Page;
use App\Models\Product;
use App\Models\Project;
use App\Models\Redirect;
use App\Models\Scene;
use App\Models\Store;
use App\Support\BrazilianStates;

/**
 * As telas do painel descritas para a API de gestão: cada recurso tem os mesmos campos e as mesmas regras do
 * formulário do painel (nome, tamanho máximo, obrigatório, endereço único), as relações que a tela liga e as coleções
 * de foto. O teste `ManageCatalogCoverageTest` compara isto com os formulários do painel campo a campo: um campo novo no
 * painel sem par aqui reprova.
 *
 * Tipos de campo (`kind`): `i18n` (texto por idioma, `{pt, en}`), `string`, `integer`, `number`, `boolean`, `enum`,
 * `datetime`, `ref` (id de outro registro), `list` (lista de valores), `objects` (lista de objetos, como as medidas) e
 * `json` (estrutura livre, como os blocos de uma página).
 */
final class Resources
{
    /** @return array<string, array<string, mixed>> */
    public static function all(): array
    {
        return [
            'products' => [
                'model' => Product::class,
                'area' => 'pecas',
                'label' => 'peça',
                'plural' => 'peças',
                'title' => 'name',
                'fields' => [
                    'name' => self::i18n(160, required: true, description: 'Nome da peça, como aparece no site.'),
                    'slug' => self::slug(i18n: true),
                    'tagline' => self::i18n(255, description: 'Frase curta embaixo do nome.'),
                    'color_name' => self::i18n(60, description: 'Nome da cor desta peça, quando ela faz parte de um grupo de cores.'),
                    'sku' => self::string(255, description: 'Referência da peça.'),
                    'area_id' => self::ref(Area::class, required: true, description: 'Área (interna ou externa): id de `GET /areas`.'),
                    'category_id' => self::ref(Category::class, required: true, description: 'Categoria: id de `GET /categories`.'),
                    'line_id' => self::ref(Line::class, description: 'Linha: id de `GET /lines`.'),
                    'designer_id' => self::ref(Designer::class, description: 'Designer: id de `GET /designers`.'),
                    'is_featured' => self::boolean('Em destaque: aparece primeiro nas listas.'),
                    'rooms' => ['kind' => 'list', 'items' => self::enum(array_column(ProductRoom::cases(), 'value')), 'description' => 'Ambientes da casa em que a peça aparece no filtro.'],
                    'is_published' => self::boolean('Publicada no site.'),
                    'description' => self::i18n(html: true, description: 'Texto da peça (HTML simples: parágrafos, negrito, itálico, listas e links).'),
                    'materials' => self::i18n(description: 'Materiais.'),
                    'finishes_note' => self::i18n(description: 'Nota sobre os acabamentos.'),
                    'dimensions' => ['kind' => 'objects', 'description' => 'Medidas em milímetros, uma linha por versão (ex.: "Módulo I").', 'fields' => [
                        'label' => self::i18n(description: 'Rótulo da linha de medidas.'),
                        'width' => self::number('Largura (mm).'),
                        'width_max' => self::number('Largura até (mm), quando varia.'),
                        'depth' => self::number('Profundidade (mm).'),
                        'depth_max' => self::number('Profundidade até (mm).'),
                        'height' => self::number('Altura (mm).'),
                        'height_max' => self::number('Altura até (mm).'),
                        'seat_height' => self::number('Altura do assento (mm).'),
                        'diameter' => self::number('Diâmetro (mm).'),
                        'diameter_max' => self::number('Diâmetro até (mm).'),
                    ]],
                    'is_3d_enabled' => self::boolean('Visualizador 3D ligado (precisa do arquivo GLB em `model_3d`).'),
                    ...self::seo(),
                ],
                'relations' => [
                    'variants' => ['kind' => 'ids', 'model' => Product::class, 'relation' => 'variants', 'description' => 'Outras versões desta peça (com e sem braço, outra medida): ids das peças.'],
                    'color_ids' => ['kind' => 'ids', 'model' => Product::class, 'sync' => 'colors', 'description' => 'A mesma peça em outras cores: ids das outras peças do grupo (o grupo fica exatamente esta peça e as escolhidas).'],
                    'finish_ids' => ['kind' => 'ids', 'model' => Finish::class, 'relation' => 'finishes', 'ordered' => true, 'description' => 'Acabamentos disponíveis, na ordem em que aparecem: ids de `GET /finishes`.'],
                ],
                'media' => [
                    'cover' => ['kind' => 'image', 'single' => true, 'description' => 'Capa: a peça na diagonal virada para a esquerda, fundo branco.'],
                    'gallery' => ['kind' => 'image', 'single' => false, 'description' => 'Outras fotos.'],
                    'cutout' => ['kind' => 'cutout', 'single' => true, 'description' => 'Foto sem fundo (PNG ou WebP transparente) para o carrossel da home.'],
                    'top_view' => ['kind' => 'cutout', 'single' => true, 'description' => 'Vista de cima (planta) para a sala para montar.'],
                    'model_3d' => ['kind' => 'glb', 'single' => true, 'description' => 'Modelo 3D em GLB.'],
                ],
                'files' => true,
                'links' => true,
                'filters' => [
                    'area' => ['kind' => 'enum', 'values' => ['indoor', 'outdoor'], 'description' => 'Só a área interna (indoor) ou externa (outdoor).'],
                    'category_id' => self::ref(Category::class, description: 'Só desta categoria.'),
                    'designer_id' => self::ref(Designer::class, description: 'Só deste designer.'),
                ],
                'delete' => 'Vai para a lixeira do painel (dá para restaurar lá).',
            ],
            'collections' => [
                'model' => Collection::class,
                'area' => 'colecoes',
                'label' => 'coleção',
                'plural' => 'coleções',
                'title' => 'name',
                'fields' => [
                    'name' => self::i18n(160, required: true, description: 'Nome da coleção.'),
                    'slug' => self::slug(i18n: true),
                    'summary' => self::i18n(description: 'Resumo.'),
                    'description' => self::i18n(html: true, description: 'Texto (HTML simples).'),
                    'year' => self::number('Ano.'),
                    'is_featured' => self::boolean('Em destaque.'),
                    'is_published' => self::boolean('Publicada no site.'),
                    ...self::seo(),
                ],
                'relations' => [
                    'product_ids' => ['kind' => 'ids', 'model' => Product::class, 'relation' => 'products', 'ordered' => true, 'description' => 'Peças da coleção, na ordem em que aparecem.'],
                ],
                'media' => [
                    'cover' => ['kind' => 'image', 'single' => true, 'description' => 'Capa.'],
                    'gallery' => ['kind' => 'image', 'single' => false, 'description' => 'Fotos.'],
                    'video' => ['kind' => 'video', 'single' => true, 'description' => 'Filme (MP4).'],
                    'video_poster' => ['kind' => 'image', 'single' => true, 'description' => 'Capa do filme.'],
                ],
            ],
            'launches' => [
                'model' => Launch::class,
                'area' => 'lancamentos',
                'label' => 'lançamento',
                'plural' => 'lançamentos',
                'title' => 'title',
                'fields' => [
                    'title' => self::i18n(160, required: true, description: 'Título do lançamento.'),
                    'slug' => self::slug(i18n: true),
                    'summary' => self::i18n(description: 'Resumo.'),
                    'description' => self::i18n(html: true, description: 'Texto (HTML simples).'),
                    'year' => self::number('Ano.', required: true),
                    'is_published' => self::boolean('Publicado no site.'),
                    ...self::seo(),
                ],
                'relations' => [
                    'product_ids' => ['kind' => 'ids', 'model' => Product::class, 'relation' => 'products', 'ordered' => true, 'description' => 'Peças do lançamento, na ordem em que aparecem.'],
                ],
                'media' => [
                    'cover' => ['kind' => 'image', 'single' => true, 'description' => 'Capa.'],
                    'gallery' => ['kind' => 'image', 'single' => false, 'description' => 'Fotos.'],
                ],
                'files' => true,
                'links' => true,
            ],
            'designers' => [
                'model' => Designer::class,
                'area' => 'designers',
                'label' => 'designer',
                'plural' => 'designers',
                'title' => 'name',
                'fields' => [
                    'name' => self::string(160, required: true, description: 'Nome.'),
                    'slug' => self::slug(i18n: false),
                    'short_bio' => self::i18n(280, description: 'Bio curta.'),
                    'bio' => self::i18n(html: true, description: 'Bio completa (HTML simples).'),
                    'location' => self::string(160, description: 'Cidade.'),
                    'website_url' => self::string(255, format: 'url', description: 'Site.'),
                    'instagram_url' => self::string(255, format: 'url', description: 'Instagram.'),
                    'is_published' => self::boolean('Publicado no site.'),
                    ...self::seo(),
                ],
                'media' => [
                    'portrait' => ['kind' => 'image', 'single' => true, 'description' => 'Retrato.'],
                    'signature' => ['kind' => 'image', 'single' => true, 'description' => 'Assinatura.'],
                ],
                'files' => true,
                'links' => true,
            ],
            'categories' => [
                'model' => Category::class,
                'area' => 'categorias',
                'label' => 'categoria',
                'plural' => 'categorias',
                'title' => 'name',
                'fields' => [
                    'name' => self::i18n(160, required: true, description: 'Nome no plural (ex.: Cadeiras).'),
                    'singular_name' => self::i18n(160, required: true, description: 'Nome no singular (ex.: Cadeira).'),
                    'slug' => self::slug(i18n: true),
                    'description' => self::i18n(description: 'Descrição.'),
                    'is_published' => self::boolean('Publicada no site.'),
                    ...self::seo(),
                ],
                'media' => [
                    'cover' => ['kind' => 'image', 'single' => true, 'description' => 'Capa.'],
                ],
            ],
            'areas' => [
                'model' => Area::class,
                'area' => 'categorias',
                'label' => 'área',
                'plural' => 'áreas (interna e externa)',
                'title' => 'name',
                'create' => false,
                'delete' => false,
                'fields' => [
                    'brand_name' => self::string(255, required: true, description: 'Nome da marca da área (ex.: Franccino Giardini).'),
                    'name' => self::i18n(160, required: true, description: 'Nome da área.'),
                    'description' => self::i18n(description: 'Descrição.'),
                    ...self::seo(),
                ],
                'media' => [
                    'cover' => ['kind' => 'image', 'single' => true, 'description' => 'Capa.'],
                ],
            ],
            'lines' => [
                'model' => Line::class,
                'area' => 'linhas',
                'label' => 'linha',
                'plural' => 'linhas',
                'title' => 'name',
                'fields' => [
                    'name' => self::string(160, required: true, description: 'Nome.'),
                    'slug' => self::slug(i18n: false),
                    'designer_id' => self::ref(Designer::class, description: 'Designer da linha.'),
                    'description' => self::i18n(description: 'Descrição.'),
                ],
            ],
            'finish-groups' => [
                'model' => FinishGroup::class,
                'area' => 'acabamentos',
                'label' => 'grupo de acabamentos',
                'plural' => 'grupos de acabamentos',
                'title' => 'name',
                'fields' => [
                    'name' => self::i18n(160, required: true, description: 'Nome do grupo (ex.: Madeiras).'),
                ],
            ],
            'finishes' => [
                'model' => Finish::class,
                'area' => 'acabamentos',
                'label' => 'acabamento',
                'plural' => 'acabamentos',
                'title' => 'name',
                'fields' => [
                    'finish_group_id' => self::ref(FinishGroup::class, required: true, description: 'Grupo: id de `GET /finish-groups`.'),
                    'name' => self::i18n(160, required: true, description: 'Nome.'),
                    'description' => self::i18n(description: 'Descrição.'),
                    'code' => self::string(255, description: 'Código da cartela.'),
                    'is_published' => self::boolean('Publicado no site.'),
                ],
                'media' => [
                    'swatch' => ['kind' => 'image', 'single' => true, 'description' => 'Amostra.'],
                ],
            ],
            'projects' => [
                'model' => Project::class,
                'area' => 'projetos',
                'label' => 'projeto',
                'plural' => 'projetos',
                'title' => 'title',
                'fields' => [
                    'type' => self::enum(array_column(ProjectType::cases(), 'value'), required: true, description: 'Residencial ou corporativo.'),
                    'title' => self::i18n(160, required: true, description: 'Título.'),
                    'slug' => self::slug(i18n: true),
                    'summary' => self::i18n(description: 'Resumo.'),
                    'description' => self::i18n(html: true, description: 'Texto (HTML simples).'),
                    'client_name' => self::string(160, description: 'Cliente.'),
                    'location' => self::string(160, description: 'Local.'),
                    'architect' => self::string(160, description: 'Arquitetura.'),
                    'year' => self::number('Ano.'),
                    'featured_product_id' => self::ref(Product::class, description: 'Peça em destaque.'),
                    'is_featured' => self::boolean('Em destaque.'),
                    'is_published' => self::boolean('Publicado no site.'),
                    ...self::seo(),
                ],
                'relations' => [
                    'product_ids' => ['kind' => 'ids', 'model' => Product::class, 'relation' => 'products', 'description' => 'Peças usadas no projeto.'],
                ],
                'media' => [
                    'cover' => ['kind' => 'image', 'single' => true, 'description' => 'Capa.'],
                    'gallery' => ['kind' => 'image', 'single' => false, 'description' => 'Fotos.'],
                    'video' => ['kind' => 'video', 'single' => true, 'description' => 'Filme (MP4).'],
                    'video_poster' => ['kind' => 'image', 'single' => true, 'description' => 'Capa do filme.'],
                ],
            ],
            'scenes' => [
                'model' => Scene::class,
                'area' => 'ambientes',
                'label' => 'ambiente',
                'plural' => 'ambientes',
                'title' => 'title',
                'fields' => [
                    'title' => self::i18n(160, required: true, description: 'Título do ambiente.'),
                    'is_published' => self::boolean('Publicado no site (precisa da foto em `image`).'),
                    'project_id' => self::ref(Project::class, description: 'Projeto do ambiente.'),
                ],
                'relations' => [
                    'hotspots' => ['kind' => 'children', 'relation' => 'hotspots', 'order' => 'sort_order', 'description' => 'Pontos sobre a foto, cada um com a peça e a posição em porcentagem (0 a 100). A lista troca todos os pontos.', 'fields' => [
                        'product_id' => self::ref(Product::class, required: true, description: 'Peça do ponto.'),
                        'x' => self::number('Posição na horizontal, em % (0 a 100).', required: true, min: 0, max: 100),
                        'y' => self::number('Posição na vertical, em % (0 a 100).', required: true, min: 0, max: 100),
                    ]],
                ],
                'media' => [
                    'image' => ['kind' => 'image', 'single' => true, 'description' => 'Foto do ambiente.'],
                ],
            ],
            'stores' => [
                'model' => Store::class,
                'area' => 'lojas',
                'label' => 'loja',
                'plural' => 'lojas',
                'title' => 'name',
                'fields' => [
                    'name' => self::string(160, required: true, description: 'Nome.'),
                    'type' => self::enum(array_column(StoreType::cases(), 'value'), required: true, description: 'Loja exclusiva ou revenda.'),
                    'address' => self::string(255, required: true, description: 'Endereço.'),
                    'address_complement' => self::string(255, description: 'Complemento.'),
                    'district' => self::string(160, description: 'Bairro.'),
                    'city' => self::string(160, required: true, description: 'Cidade.'),
                    'state' => self::enum(array_keys(BrazilianStates::options()), required: true, description: 'UF.'),
                    'postal_code' => self::string(20, description: 'CEP.'),
                    'country' => self::string(2, required: true, description: 'País (código de 2 letras, ex.: BR).'),
                    'latitude' => self::number('Latitude.', min: -90, max: 90),
                    'longitude' => self::number('Longitude.', min: -180, max: 180),
                    'phone' => self::string(30, format: 'phone', description: 'Telefone.'),
                    'whatsapp' => self::string(30, format: 'phone', description: 'WhatsApp.'),
                    'email' => self::string(255, format: 'email', description: 'E-mail.'),
                    'website_url' => self::string(255, format: 'url', description: 'Site.'),
                    'instagram_url' => self::string(255, format: 'url', description: 'Instagram.'),
                    'opening_hours' => self::i18n(description: 'Horário de funcionamento.'),
                    'description' => self::i18n(600, description: 'Descrição.'),
                    'is_published' => self::boolean('Publicada no site.'),
                ],
                'media' => [
                    'image' => ['kind' => 'image', 'single' => true, 'description' => 'Foto da loja.'],
                ],
            ],
            'banners' => [
                'model' => Banner::class,
                'area' => 'banners',
                'label' => 'banner',
                'plural' => 'banners',
                'title' => 'title',
                'fields' => [
                    'placement' => self::enum(array_column(BannerPlacement::cases(), 'value'), required: true, description: 'Onde o banner aparece.'),
                    'title' => self::i18n(160, description: 'Título.'),
                    'subtitle' => self::i18n(255, description: 'Subtítulo.'),
                    'cta_label' => self::i18n(160, description: 'Texto do botão.'),
                    'cta_url' => self::i18n(255, format: 'url', description: 'Link do botão.'),
                    'starts_at' => ['kind' => 'datetime', 'description' => 'Começa a aparecer (ISO 8601).'],
                    'ends_at' => ['kind' => 'datetime', 'description' => 'Para de aparecer (ISO 8601).'],
                    'is_published' => self::boolean('Publicado no site (precisa da foto em `image`).'),
                ],
                'media' => [
                    'image' => ['kind' => 'image', 'single' => true, 'description' => 'Foto (16:9).'],
                    'image_mobile' => ['kind' => 'image', 'single' => true, 'description' => 'Foto para o celular (4:5).'],
                    'video' => ['kind' => 'video', 'single' => true, 'description' => 'Vídeo (MP4).'],
                ],
            ],
            'pages' => [
                'model' => Page::class,
                'area' => 'paginas',
                'label' => 'página',
                'plural' => 'páginas',
                'title' => 'title',
                'create' => false,
                'delete' => false,
                'fields' => [
                    'title' => self::i18n(160, required: true, description: 'Título da página.'),
                    'intro' => self::i18n(description: 'Introdução.'),
                    'featured_product_id' => self::ref(Product::class, description: 'Peça em destaque.'),
                    'content' => ['kind' => 'json', 'description' => 'Blocos da página, na ordem: lista de `{type, data}`. Tipos: rich_text, image, image_text, timeline, faq, stats, quote, cta, gallery e video. Leia a página antes de mudar e mande a lista inteira; caminhos de imagem saem de `POST /pages/{id}/images`.'],
                    ...self::seo(),
                ],
                'media' => [
                    'cover' => ['kind' => 'image', 'single' => true, 'description' => 'Capa (banner).'],
                    'og_image' => ['kind' => 'image', 'single' => true, 'description' => 'Imagem para redes sociais.'],
                ],
            ],
            'clients' => [
                'model' => Client::class,
                'area' => 'clientes',
                'label' => 'cliente',
                'plural' => 'clientes (logos)',
                'title' => 'name',
                'fields' => [
                    'name' => self::string(160, required: true, description: 'Nome.'),
                    'url' => self::string(255, format: 'url', description: 'Site.'),
                    'is_published' => self::boolean('Publicado no site.'),
                ],
                'media' => [
                    'logo' => ['kind' => 'image', 'single' => true, 'description' => 'Logo.'],
                ],
            ],
            'redirects' => [
                'model' => Redirect::class,
                'area' => 'redirecionamentos',
                'label' => 'redirecionamento',
                'plural' => 'redirecionamentos',
                'title' => 'from_path',
                'fields' => [
                    'from_path' => self::string(512, required: true, description: 'Caminho antigo (começa com /).', unique: true, startsWith: '/'),
                    'status_code' => self::enum(array_column(RedirectStatus::cases(), 'value'), required: true, description: '301 (mudou de vez), 302 (temporário) ou 410 (não existe mais).', integer: true),
                    'to_path' => self::string(2048, description: 'Para onde vai (obrigatório, menos no 410; diferente do caminho antigo).'),
                    'is_active' => self::boolean('Ativo.'),
                    'notes' => self::string(null, description: 'Anotações.'),
                ],
            ],
        ];
    }

    /** @return array<string, mixed> */
    public static function get(string $key): array
    {
        return self::all()[$key] ?? throw new \InvalidArgumentException("Recurso {$key} não existe.");
    }

    /** @return array<string, mixed> */
    private static function i18n(?int $max = null, bool $required = false, string $description = '', bool $html = false, ?string $format = null): array
    {
        return array_filter(['kind' => 'i18n', 'max' => $max, 'required' => $required, 'html' => $html, 'format' => $format, 'description' => $description], fn ($v) => $v !== null && $v !== false);
    }

    /** @return array<string, mixed> */
    private static function slug(bool $i18n): array
    {
        return [
            'kind' => $i18n ? 'i18n' : 'string',
            'max' => 160,
            'required' => true,
            'slug' => true,
            'description' => 'Final do endereço da página (letras, números e hífens), único. Se faltar na criação, sai do nome. Trocar quebra o endereço antigo: só com motivo.',
        ];
    }

    /** @return array<string, mixed> */
    private static function string(?int $max, bool $required = false, string $description = '', ?string $format = null, bool $unique = false, ?string $startsWith = null): array
    {
        return array_filter(['kind' => 'string', 'max' => $max, 'required' => $required, 'format' => $format, 'unique' => $unique, 'starts_with' => $startsWith, 'description' => $description], fn ($v) => $v !== null && $v !== false);
    }

    /** @return array<string, mixed> */
    private static function number(string $description, bool $required = false, ?float $min = null, ?float $max = null): array
    {
        return array_filter(['kind' => 'number', 'required' => $required, 'min' => $min, 'max' => $max, 'description' => $description], fn ($v) => $v !== null && $v !== false);
    }

    /** @return array<string, mixed> */
    private static function boolean(string $description): array
    {
        return ['kind' => 'boolean', 'description' => $description];
    }

    /**
     * @param  list<int|string>  $values
     * @return array<string, mixed>
     */
    private static function enum(array $values, bool $required = false, string $description = '', bool $integer = false): array
    {
        $spec = ['kind' => 'enum', 'values' => $values, 'description' => $description];
        if ($required) {
            $spec['required'] = true;
        }
        if ($integer) {
            $spec['integer'] = true;
        }

        return $spec;
    }

    /**
     * @param  class-string  $model
     * @return array<string, mixed>
     */
    private static function ref(string $model, bool $required = false, string $description = ''): array
    {
        return array_filter(['kind' => 'ref', 'model' => $model, 'required' => $required, 'description' => $description], fn ($v) => $v !== false && $v !== '');
    }

    /** @return array<string, array<string, mixed>> */
    private static function seo(): array
    {
        return [
            'seo_title' => self::i18n(70, description: 'Título para o Google (até 70 caracteres).'),
            'seo_description' => self::i18n(160, description: 'Descrição para o Google (até 160 caracteres).'),
        ];
    }
}
