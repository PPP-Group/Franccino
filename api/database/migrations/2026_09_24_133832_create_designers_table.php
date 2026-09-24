<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('designers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->json('short_bio');
            $table->json('bio');
            $table->string('location')->nullable();
            $table->string('website_url')->nullable();
            $table->string('instagram_url')->nullable();
            $table->boolean('is_published')->default(false)->index();
            $table->integer('sort_order')->default(0)->index();
            $table->json('seo_title')->nullable();
            $table->json('seo_description')->nullable();
            $table->unsignedBigInteger('legacy_wp_id')->nullable()->unique();
            $table->string('legacy_url', 512)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('designers');
    }
};
