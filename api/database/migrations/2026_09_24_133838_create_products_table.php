<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->json('name');
            $table->json('slug');
            $table->string('sku')->nullable();
            $table->json('tagline')->nullable();
            $table->json('description');
            $table->foreignId('area_id')->constrained()->restrictOnDelete();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->foreignId('line_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('designer_id')->nullable()->constrained()->nullOnDelete();
            $table->json('dimensions');
            $table->json('materials')->nullable();
            $table->json('finishes_note')->nullable();
            $table->boolean('is_3d_enabled')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_published')->default(false)->index();
            $table->integer('sort_order')->default(0)->index();
            $table->json('seo_title')->nullable();
            $table->json('seo_description')->nullable();
            $table->unsignedBigInteger('legacy_wp_id')->nullable()->unique();
            $table->string('legacy_url', 512)->nullable();
            $table->text('search_text')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
