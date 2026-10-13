<?php

return [
    'locales' => array_values(array_filter(array_map('trim', explode(',', (string) env('APP_LOCALES', 'pt,en'))))),

    'frontend' => [
        'url' => env('FRONTEND_URL', 'http://localhost:3000'),
        'api_key' => env('FRONTEND_API_KEY'),
        'revalidate_url' => env('FRONTEND_REVALIDATE_URL'),
        'revalidate_secret' => env('FRONTEND_REVALIDATE_SECRET'),
    ],

    'turnstile' => [
        'secret_key' => env('TURNSTILE_SECRET_KEY'),
    ],

    'admin' => [
        'name' => env('ADMIN_NAME', 'Administrador'),
        'email' => env('ADMIN_EMAIL'),
        'password' => env('ADMIN_PASSWORD'),
    ],

    'downloads' => [
        'link_ttl_minutes' => 10,
    ],

    'uploads' => [
        'model_3d_max_kb' => 20480,
    ],

    'demo' => [
        'image_cache' => storage_path('app/demo-cache'),
    ],

    'wordpress' => [
        'base_url' => env('WORDPRESS_BASE_URL', 'https://franccino.com.br'),
        'per_page' => 100,
        'cache' => storage_path('app/wordpress-cache'),
    ],

    /*
     * Redirects do site antigo (P5b T3, `php artisan franccino:redirects:generate`). Caminhos novos em `pt`,
     * espelhando os `pathnames` do web (web/src/i18n/routing.ts). `from` termina em `/*` para valer para
     * tudo abaixo do prefixo (docs/api.md, `GET /redirects`); regra exata vence a de prefixo.
     */
    'legacy' => [
        'public_paths' => [
            'product' => '/pt/produtos/{slug}',
            'designer' => '/pt/designers/{slug}',
            'collection' => '/pt/colecoes/{slug}',
            'project' => '/pt/projetos/{slug}',
            'line' => '/pt/produtos?line={slug}',
            'category' => '/pt/{area}/{slug}',
        ],

        // Segmento da URL antiga de categoria (`/categoria/interna/<slug>/`) para a área nova.
        'category_areas' => [
            'interna' => 'indoor',
            'externa' => 'outdoor',
        ],

        // Páginas e listagens do site antigo (sitemap `page`, menu e taxonomias sem registro próprio).
        'paths' => [
            '/seja-um-parceiro' => '/pt/contato',
            '/6369-2' => '/pt/contato',
            '/belohorizonte' => '/pt/lojas',
            '/designers' => '/pt/designers',
            '/lancamentos' => '/pt/lancamentos',
            '/colecoes' => '/pt/colecoes',
            '/todos-produtos' => '/pt/produtos',
            '/produtos-indoor' => '/pt/indoor',
            '/produtos-outdoor' => '/pt/outdoor',
            '/areas/area-interna' => '/pt/indoor',
            '/areas/area-externa' => '/pt/outdoor',
            '/institucional' => '/pt/fabrica',
            '/corporativo' => '/pt/corporativo',
            '/cases' => '/pt/projetos',
            '/projetos' => '/pt/projetos',
            '/lojas' => '/pt/lojas',
            '/contato' => '/pt/contato',
            '/wishlist' => '/pt/lista-de-orcamento',
            '/politica-de-privacidade' => '/pt/privacidade',
            '/termos-e-condicoes-de-uso' => '/pt/termos',
            // Registro que não foi migrado cai na listagem do mesmo tipo.
            '/produto/*' => '/pt/produtos',
            '/designer/*' => '/pt/designers',
            '/colecoes/*' => '/pt/colecoes',
            '/cases/*' => '/pt/projetos',
            '/projetos/*' => '/pt/projetos',
            '/categoria/interna/*' => '/pt/indoor',
            '/categoria/externa/*' => '/pt/outdoor',
            '/lojas/*' => '/pt/lojas',
            '/estado/*' => '/pt/lojas',
            '/clientes/*' => '/pt/corporativo',
            '/downloads/*' => '/pt/downloads',
            '/categorias-de-downloads/*' => '/pt/downloads',
        ],

        // Respondem 410: conteúdo sem equivalente no site novo (popups, rascunhos, blog e autor).
        'gone' => [
            '/jet-popup/*',
            '/banners/*',
            '/author/*',
            '/categoria/*',
            '/impressoes',
            '/a-importancia-do-design-de-interiores-para-os-ambientes',
            '/a-importancia-da-ergonomia-em-casa-e-nos-ambientes-de-trabalho',
        ],
    ],
];
