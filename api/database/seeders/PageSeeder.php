<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

class PageSeeder extends Seeder
{
    /**
     * Seed the 17 fixed page keys from docs/data-model.md. Idempotent: uses
     * `firstOrCreate` by `key` so content already edited through the panel is
     * never overwritten by a later run.
     */
    public function run(): void
    {
        $pages = [
            'home' => ['pt' => 'Início', 'en' => 'Home'],
            'indoor' => ['pt' => 'Interno', 'en' => 'Indoor'],
            'outdoor' => ['pt' => 'Externo', 'en' => 'Outdoor'],
            'products' => ['pt' => 'Produtos', 'en' => 'Products'],
            'launches' => ['pt' => 'Lançamentos', 'en' => 'Novelties'],
            'collections' => ['pt' => 'Coleções', 'en' => 'Collections'],
            'designers' => ['pt' => 'Designers', 'en' => 'Designers'],
            'projects' => ['pt' => 'Projetos', 'en' => 'Projects'],
            'corporate' => ['pt' => 'Corporativo', 'en' => 'Contract'],
            'factory' => ['pt' => 'Fábrica', 'en' => 'Factory'],
            'stores' => ['pt' => 'Lojas', 'en' => 'Stores'],
            'finishes' => ['pt' => 'Acabamentos', 'en' => 'Finishes'],
            'downloads' => ['pt' => 'Blocos 3D e fichas técnicas', 'en' => '3D blocks and spec sheets'],
            'contact' => ['pt' => 'Contato', 'en' => 'Contact'],
            'privacy' => ['pt' => 'Política de privacidade', 'en' => 'Privacy policy'],
            'terms' => ['pt' => 'Termos de uso', 'en' => 'Terms of use'],
            'cookies' => ['pt' => 'Política de cookies', 'en' => 'Cookie policy'],
        ];

        foreach ($pages as $key => $title) {
            Page::firstOrCreate(
                ['key' => $key],
                [
                    'title' => $title,
                    'content' => [],
                    'is_published' => true,
                ],
            );
        }
    }
}
