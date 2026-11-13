<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * A escolha de cookies saiu do rodapé e foi para a própria Política de cookies (retorno de 13/11/2026). Troca só a frase
 * que mandava a pessoa ao rodapé, no texto inicial de 12/11; o resto do que a Franccino editar no painel fica.
 */
return new class extends Migration
{
    private const REPLACE = [
        'Você pode mudar a escolha a qualquer momento em "Preferências de cookies", no rodapé de todas as páginas.' => 'Você pode mudar a escolha a qualquer momento no fim desta página, em "Preferências de cookies".',
        'You can change your choice at any time under "Cookie preferences", in the footer of every page.' => 'You can change your choice at any time at the end of this page, under "Cookie preferences".',
    ];

    public function up(): void
    {
        $page = DB::table('pages')->where('key', 'cookies')->first();
        if ($page === null || $page->content === null) {
            return;
        }
        $content = strtr((string) $page->content, self::jsonPairs());
        if ($content !== $page->content) {
            DB::table('pages')->where('id', $page->id)->update(['content' => $content, 'updated_at' => now()]);
        }
    }

    public function down(): void
    {
        // Texto editável no painel: não volta.
    }

    /**
     * The phrases as they sit inside the JSON column (quotes escaped, accents as stored by `json_encode`).
     *
     * @return array<string, string>
     */
    private static function jsonPairs(): array
    {
        $pairs = [];
        foreach (self::REPLACE as $from => $to) {
            foreach ([0, JSON_UNESCAPED_UNICODE] as $flags) {
                $pairs[substr((string) json_encode($from, $flags), 1, -1)] = substr((string) json_encode($to, $flags), 1, -1);
            }
        }

        return $pairs;
    }
};
