<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Peça em destaque ao lado do texto do projeto, escolhida no painel (retorno de 12/11/2026: a peça automática não tinha
 * nada a ver com o projeto).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->foreignId('featured_product_id')->nullable()->after('year')->constrained('products')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropConstrainedForeignId('featured_product_id');
        });
    }
};
