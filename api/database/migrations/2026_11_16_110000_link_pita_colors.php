<?php

use App\Models\Product;
use Illuminate\Database\Migrations\Migration;

/**
 * Peças que são a mesma e só mudam de cor (16/11/2026), conferidas pelas fotos entre as 399 publicadas: só a Cadeira
 * Pitá com braço (cinza e verde) e a Pitá sem braço (azul e laranja). As versões Indoor e Outdoor (Marcela, Dara, Alba,
 * Dome, Málaga) e a Poltrona Sô com corda mudam de material ou de desenho: ficam de fora. Novos grupos se fazem no
 * painel, em "A mesma peça em outras cores".
 */
return new class extends Migration
{
    private const GROUPS = [
        ['cadeira-pita-com-braco', 'cadeira-pita-com-braco-2'],
        ['cadeira-pita-sem-braco', 'cadeira-pita-sem-braco-2'],
    ];

    public function up(): void
    {
        foreach (self::GROUPS as $slugs) {
            $products = Product::query()->where(function ($query) use ($slugs) {
                foreach ($slugs as $slug) {
                    $query->orWhere('slug->pt', $slug);
                }
            })->get();

            // Só liga quando acha o grupo inteiro e nenhuma peça dele já tem outras cores (o painel manda).
            if ($products->count() !== count($slugs) || $products->contains(fn (Product $product) => $product->color_group !== null)) {
                continue;
            }

            $products->first()->syncColors($products->skip(1)->pluck('id')->all());
        }
    }

    public function down(): void
    {
        foreach (self::GROUPS as $slugs) {
            foreach ($slugs as $slug) {
                Product::query()->where('slug->pt', $slug)->update(['color_group' => null]);
            }
        }
    }
};
