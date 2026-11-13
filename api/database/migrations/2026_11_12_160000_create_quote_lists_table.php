<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Lista de desejos compartilhada por link (retorno de 12/11/2026): o WhatsApp e o e-mail levam um link curto para a
 * lista com fotos, em vez de uma linha por peça. A lista vale por um tempo (`expires_at`) e aparece no painel.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quote_lists', function (Blueprint $table) {
            $table->id();
            $table->string('code', 16)->unique();
            $table->json('items');
            $table->string('locale', 5);
            $table->foreignId('contact_message_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('expires_at')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quote_lists');
    }
};
