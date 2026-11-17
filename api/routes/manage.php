<?php

use App\Http\Controllers\Manage\ManageController;
use Illuminate\Support\Facades\Route;

/*
 * API de gestão e conector do Claude e do ChatGPT (docs/api-gestao.md). Sem sessão nem CSRF: cada chamada traz a
 * própria credencial (`Authorization: Bearer`). Registradas em bootstrap/app.php, fora dos grupos web e api.
 */

Route::get('/api/manage/v1/openapi.json', [ManageController::class, 'openapi'])->name('manage.openapi');
Route::get('/api/manage/docs', [ManageController::class, 'docs'])->name('manage.docs');
Route::any('/api/manage/v1/{path?}', [ManageController::class, 'rest'])->where('path', '.*')->name('manage.rest');

Route::match(['GET', 'POST', 'DELETE', 'OPTIONS'], '/mcp', [ManageController::class, 'mcp'])->name('manage.mcp');

Route::get('/.well-known/oauth-protected-resource/{path?}', [ManageController::class, 'resourceMetadata'])->where('path', 'mcp')->name('manage.well-known.resource');
Route::get('/.well-known/oauth-authorization-server/{path?}', [ManageController::class, 'serverMetadata'])->where('path', 'mcp')->name('manage.well-known.server');
Route::get('/.well-known/openid-configuration', [ManageController::class, 'serverMetadata'])->name('manage.well-known.openid');

Route::prefix('oauth')->name('manage.oauth.')->group(function () {
    Route::post('register', [ManageController::class, 'register'])->name('register');
    Route::get('authorize', [ManageController::class, 'oauthAuthorize'])->name('authorize');
    Route::post('token', [ManageController::class, 'token'])->name('token');
    Route::post('revoke', [ManageController::class, 'revoke'])->name('revoke');
});
