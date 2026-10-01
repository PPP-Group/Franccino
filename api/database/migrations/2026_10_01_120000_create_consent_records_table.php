<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consent_records', function (Blueprint $table) {
            $table->id();
            $table->uuid('visitor_id')->index();
            $table->string('choice', 10);
            $table->string('policy_version', 40)->nullable();
            $table->string('locale', 2);
            $table->string('ip_hash', 64);
            $table->string('user_agent', 512)->nullable();
            $table->timestamp('created_at')->useCurrent()->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consent_records');
    }
};
