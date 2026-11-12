<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Cadastro antes de baixar (revisão da Franccino, 12/11/2026, item 22): nome, sobrenome, e-mail e perfil de quem
 * baixa blocos, fichas e catálogos. Cada link gerado passa a dizer quem baixou (`download_logs.download_lead_id`).
 * O site guarda só o `token` (o banco guarda o sha256 dele) para não pedir o cadastro de novo a cada arquivo.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('download_leads', function (Blueprint $table) {
            $table->id();
            $table->string('profile', 20);
            $table->string('first_name', 80);
            $table->string('last_name', 80);
            $table->string('email', 190)->index();
            $table->string('interest', 190)->nullable();
            $table->string('phone', 40)->nullable();
            $table->string('locale', 2);
            $table->string('token_hash', 64)->unique();
            $table->timestamps();
        });

        Schema::table('download_logs', function (Blueprint $table) {
            $table->foreignId('download_lead_id')->nullable()->after('product_id')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('download_logs', function (Blueprint $table) {
            $table->dropConstrainedForeignId('download_lead_id');
        });
        Schema::dropIfExists('download_leads');
    }
};
