<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Peça em destaque de cada página (revisão da Franccino, 12/11/2026): escolhida no painel, aparece ao lado do título
 * (Corporativo, Lançamentos). Sem escolha, o site não mostra peça nenhuma ali.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            $table->foreignId('featured_product_id')->nullable()->after('key')->constrained('products')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            $table->dropConstrainedForeignId('featured_product_id');
        });
    }
};
