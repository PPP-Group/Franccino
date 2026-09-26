<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('company')->nullable();
            $table->string('profession')->nullable();
            $table->string('city')->nullable();
            $table->char('state', 2)->nullable();
            $table->text('message');
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            // Quote list / "Sala para montar" items, decided 2026-09-23 (see docs/data-model.md):
            // [{product_id, quantity, finish_ids, note}].
            $table->json('items')->nullable();
            $table->string('locale', 2);
            $table->string('source_url')->nullable();
            $table->timestamp('consent_at');
            $table->string('ip_hash', 64);
            $table->string('user_agent', 512)->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_messages');
    }
};
