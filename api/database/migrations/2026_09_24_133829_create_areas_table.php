<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('areas', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->json('name');
            $table->string('brand_name');
            $table->json('description')->nullable();
            $table->integer('sort_order')->default(0)->index();
            $table->json('seo_title')->nullable();
            $table->json('seo_description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('areas');
    }
};
