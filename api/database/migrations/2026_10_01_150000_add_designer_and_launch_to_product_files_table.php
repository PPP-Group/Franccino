<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * PPP-109: files for download also belong to a designer or a launch (catalogs, presentations). Each file has
 * exactly one owner: `product_id`, `designer_id` or `launch_id`. The download log keeps `product_id` only
 * when the file is a product's.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_files', function (Blueprint $table) {
            $table->foreignId('product_id')->nullable()->change();
            $table->foreignId('designer_id')->nullable()->after('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('launch_id')->nullable()->after('designer_id')->constrained()->cascadeOnDelete();
        });

        Schema::table('download_logs', function (Blueprint $table) {
            $table->foreignId('product_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('product_files', function (Blueprint $table) {
            $table->dropConstrainedForeignId('launch_id');
            $table->dropConstrainedForeignId('designer_id');
        });
    }
};
