<?php

use App\Models\Product;
use Illuminate\Database\Migrations\Migration;

/**
 * Tira do ar o "Produto de Teste" que ficou publicado no preview (retorno de 13/11/2026). É exclusão reversível
 * (soft delete): a peça some do site e da API, e o painel ainda consegue restaurar. Só pega a peça com esse nome e
 * esse endereço; em outro banco, não faz nada.
 */
return new class extends Migration
{
    public function up(): void
    {
        Product::query()
            ->where('slug->pt', 'produto-de-teste')
            ->where('name->pt', 'Produto de Teste')
            ->get()
            ->each(fn (Product $product) => $product->delete());
    }

    public function down(): void
    {
        Product::onlyTrashed()
            ->where('slug->pt', 'produto-de-teste')
            ->where('name->pt', 'Produto de Teste')
            ->get()
            ->each(fn (Product $product) => $product->restore());
    }
};
