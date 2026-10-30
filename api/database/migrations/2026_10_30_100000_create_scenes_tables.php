<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Ambientes com pontos clicáveis (banco de ideias, ideia 7): uma foto de ambiente e, sobre ela, pontos que levam às
 * peças. Cada ponto guarda a posição em porcentagem da foto (0 a 100), para valer em qualquer tamanho de tela.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scenes', function (Blueprint $table) {
            $table->id();
            $table->json('title');
            $table->boolean('is_published')->default(false)->index();
            $table->integer('sort_order')->default(0)->index();
            $table->timestamps();
        });

        Schema::create('scene_hotspots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('scene_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->decimal('x', 5, 2);
            $table->decimal('y', 5, 2);
            $table->integer('sort_order')->default(0)->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scene_hotspots');
        Schema::dropIfExists('scenes');
    }
};
