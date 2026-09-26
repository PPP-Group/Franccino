<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lines', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->foreignId('designer_id')->nullable()->constrained()->nullOnDelete();
            $table->json('description')->nullable();
            $table->integer('sort_order')->default(0)->index();
            $table->unsignedBigInteger('legacy_wp_id')->nullable()->unique();
            $table->string('legacy_url', 512)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lines');
    }
};
