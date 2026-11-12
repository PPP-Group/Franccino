<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Páginas novas da revisão da Franccino (12/11/2026, opcionais): "Tire suas dúvidas" (perguntas e respostas sobre as
 * peças e a assistência técnica, em blocos FAQ no painel) e "Seja um parceiro" (texto no painel e o formulário de
 * parceria). O painel não cria páginas, então elas entram aqui, vazias e publicadas; quem escreve é a Franccino.
 */
return new class extends Migration
{
    public function up(): void
    {
        $pages = [
            'faq' => ['pt' => 'Tire suas dúvidas', 'en' => 'Frequently asked questions'],
            'partner' => ['pt' => 'Seja um parceiro', 'en' => 'Become a partner'],
        ];
        foreach ($pages as $key => $title) {
            if (DB::table('pages')->where('key', $key)->exists()) {
                continue;
            }
            DB::table('pages')->insert([
                'key' => $key,
                'title' => json_encode($title, JSON_UNESCAPED_UNICODE),
                'content' => json_encode([]),
                'is_published' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('pages')->whereIn('key', ['faq', 'partner'])->delete();
    }
};
