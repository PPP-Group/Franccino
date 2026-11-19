<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Data em que a peça entrou no lançamento (revisão da Franccino, 18/11/2026, item 16): a peça fica como "Lançamento"
 * por um ano a partir dessa data e sai sozinha da página de Lançamentos depois. As peças que já estavam em lançamentos
 * contam a partir de hoje, para nada sumir de uma vez no deploy.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('launch_product', function (Blueprint $table) {
            $table->timestamps();
        });

        DB::table('launch_product')->update(['created_at' => now(), 'updated_at' => now()]);
    }

    public function down(): void
    {
        Schema::table('launch_product', function (Blueprint $table) {
            $table->dropTimestamps();
        });
    }
};
