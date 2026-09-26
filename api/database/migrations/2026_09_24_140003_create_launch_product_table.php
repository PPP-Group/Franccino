<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('launch_product', function (Blueprint $table) {
            $table->foreignId('launch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->integer('sort_order')->default(0);
            $table->primary(['launch_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('launch_product');
    }
};
