<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A mesma peça em outras cores (retorno de 16/11/2026): as peças do mesmo grupo continuam sendo peças separadas nas
 * listas, mas ficam ligadas entre si (troca de cor na página da peça e as capas das outras cores no hover).
 * `color_name` é o nome da cor desta peça, por idioma (opcional: sem ele, a troca mostra só a foto).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('color_group', 36)->nullable()->index()->after('line_id');
            $table->json('color_name')->nullable()->after('color_group');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['color_group']);
            $table->dropColumn(['color_group', 'color_name']);
        });
    }
};
