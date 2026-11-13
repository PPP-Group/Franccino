<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pontos clicáveis numa foto que já está no site (retorno de 13/11/2026): banner da home, capa de coleção, de
 * página ou de projeto, foto de galeria. O ambiente aponta a foto (`photo_media_id`, a mídia de outro registro) em vez
 * de ter uma foto própria; o site desenha os pontos por cima dela onde ela aparecer. Apagada a foto, o ambiente sai.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('scenes', function (Blueprint $table) {
            $table->foreignId('photo_media_id')->nullable()->unique()->after('project_id')
                ->constrained('media')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('scenes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('photo_media_id');
        });
    }
};
