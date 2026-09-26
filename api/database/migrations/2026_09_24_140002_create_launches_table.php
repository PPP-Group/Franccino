<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('launches', function (Blueprint $table) {
            $table->id();
            $table->json('title');
            $table->json('slug');
            $table->smallInteger('year');
            $table->json('summary');
            $table->json('description');
            $table->boolean('is_published')->default(false)->index();
            $table->integer('sort_order')->default(0)->index();
            $table->json('seo_title')->nullable();
            $table->json('seo_description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('launches');
    }
};
