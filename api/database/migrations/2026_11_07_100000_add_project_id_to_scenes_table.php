<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Ambiente ligado a um projeto (retorno de 07/11/2026): a foto do projeto com os pontos clicáveis aparece no
 * Corporativo e na página do projeto. Sem projeto, o ambiente segue na home, como antes.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('scenes', function (Blueprint $table) {
            $table->foreignId('project_id')->nullable()->after('id')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('scenes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('project_id');
        });
    }
};
