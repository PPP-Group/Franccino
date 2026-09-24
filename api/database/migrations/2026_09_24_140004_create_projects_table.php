<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->json('title');
            $table->json('slug');
            $table->string('client_name')->nullable();
            $table->string('location')->nullable();
            $table->string('architect')->nullable();
            $table->smallInteger('year')->nullable();
            $table->json('summary');
            $table->json('description');
            $table->boolean('is_featured')->default(false);
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
        Schema::dropIfExists('projects');
    }
};
