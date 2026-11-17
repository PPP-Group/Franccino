<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * API de gestão e conector do Claude e do ChatGPT (17/11/2026, desenho do VTX Tap adaptado; docs/api-gestao.md).
 *
 * - `api_credentials`: a chave criada no painel (`kind = key`) e a conexão aprovada pelo OAuth (`kind = connector`). O
 *   segredo só existe como SHA-256. Cada credencial age como um usuário interno ("API · nome"), ligado por
 *   `users.api_credential_id`, que não entra no painel.
 * - `api_logs`: cada chamada (a operação do catálogo, nunca os valores), 30 dias.
 * - `api_idempotency`: a resposta guardada de cada `Idempotency-Key`, 24 horas.
 * - `oauth_*`: os aplicativos registrados, os pedidos de autorização, os códigos de uso único e os tokens (só hashes).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('api_credentials', function (Blueprint $table) {
            $table->id();
            $table->string('kind', 16);
            $table->string('name', 120);
            $table->string('prefix', 24);
            $table->string('secret_hash', 64)->nullable()->unique();
            $table->json('scopes');
            $table->string('oauth_client_id')->nullable()->index();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('api_credential_id')->nullable()->after('is_active')
                ->constrained('api_credentials')->cascadeOnDelete();
        });

        Schema::create('api_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('api_credential_id')->nullable()->constrained('api_credentials')->nullOnDelete();
            $table->string('channel', 8);
            $table->string('operation', 80);
            $table->string('method', 8);
            $table->unsignedSmallInteger('status');
            $table->unsignedInteger('duration_ms');
            $table->string('ip', 45)->nullable();
            $table->timestamp('created_at')->index();
        });

        Schema::create('api_idempotency', function (Blueprint $table) {
            $table->id();
            $table->foreignId('api_credential_id')->constrained('api_credentials')->cascadeOnDelete();
            $table->string('key', 120);
            $table->string('request_hash', 64);
            $table->unsignedSmallInteger('status')->nullable();
            $table->longText('body')->nullable();
            $table->timestamp('created_at')->index();
            $table->unique(['api_credential_id', 'key']);
        });

        Schema::create('oauth_clients', function (Blueprint $table) {
            $table->id();
            $table->string('client_id')->unique();
            $table->string('name', 160);
            $table->json('redirect_uris');
            $table->boolean('is_metadata_document')->default(false);
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
        });

        Schema::create('oauth_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('client_id');
            $table->text('redirect_uri');
            $table->text('state')->nullable();
            $table->string('code_challenge', 128);
            $table->json('scopes');
            $table->string('resource')->nullable();
            $table->timestamp('expires_at')->index();
            $table->timestamps();
        });

        Schema::create('oauth_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code_hash', 64)->unique();
            $table->foreignId('api_credential_id')->constrained('api_credentials')->cascadeOnDelete();
            $table->string('client_id');
            $table->text('redirect_uri');
            $table->string('code_challenge', 128);
            $table->string('resource')->nullable();
            $table->timestamp('expires_at')->index();
            $table->timestamp('used_at')->nullable();
            $table->timestamps();
        });

        Schema::create('oauth_tokens', function (Blueprint $table) {
            $table->id();
            $table->string('token_hash', 64)->unique();
            $table->string('type', 8);
            $table->foreignId('api_credential_id')->constrained('api_credentials')->cascadeOnDelete();
            $table->string('client_id');
            $table->string('resource')->nullable();
            $table->timestamp('expires_at')->index();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('oauth_tokens');
        Schema::dropIfExists('oauth_codes');
        Schema::dropIfExists('oauth_requests');
        Schema::dropIfExists('oauth_clients');
        Schema::dropIfExists('api_idempotency');
        Schema::dropIfExists('api_logs');
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('api_credential_id');
        });
        Schema::dropIfExists('api_credentials');
    }
};
