<?php

use App\Models\Product;
use Illuminate\Database\Migrations\Migration;

/**
 * Poltrona Tatu (revisão geral de 14/11/2026): a descrição trazida do site antigo tinha erros de digitação ("te sua",
 * "animas", "Sergio" sem acento, como no nome do designer), e a peça não tinha inglês, então a página em inglês mostrava
 * tudo em português. Corrige só os trechos errados do texto em português e preenche o inglês só onde ainda está vazio:
 * o que a Franccino mudar no painel fica como está. Em outro banco (sem a peça), não faz nada.
 */
return new class extends Migration
{
    /** Trechos errados do texto em português e a correção. */
    private const TYPOS = [
        'A Poltrona Tatu te sua ergonomia' => 'A Poltrona Tatu tem sua ergonomia',
        'um dos animas mais curiosos' => 'um dos animais mais curiosos',
        'inspiração de Sergio J. Matos' => 'inspiração de Sérgio J. Matos',
    ];

    private const ENGLISH = [
        'name' => 'Tatu Armchair',
        'slug' => 'tatu-armchair',
        'tagline' => 'Handcrafted work with human warmth.',
        'description' => '<p>The Tatu Armchair takes its ergonomics from the shell of one of the most curious animals of '
            .'the Brazilian fauna, the armadillo ("tatu" in Portuguese), which inspired Sérgio J. Matos to create the '
            .'Tatu armchair. Like the animal\'s armor, the shell of the piece is formed by a mosaic of nautical rope. '
            .'The legs elegantly support the structure, which gains lightness where the two elements meet. Armchair '
            .'with aluminum structure. Seat cushion in foam and batting. Handwoven: each piece takes 24 hours and 470 '
            .'meters of rope.</p>',
    ];

    public function up(): void
    {
        $product = $this->tatu();
        if ($product === null) {
            return;
        }

        $description = (string) $product->getTranslation('description', 'pt', false);
        $fixed = strtr($description, self::TYPOS);
        if ($fixed !== $description) {
            $product->setTranslation('description', 'pt', $fixed);
        }

        foreach (self::ENGLISH as $field => $value) {
            if (blank($product->getTranslation($field, 'en', false))) {
                $product->setTranslation($field, 'en', $value);
            }
        }

        if ($product->isDirty()) {
            $product->save();
        }
    }

    public function down(): void
    {
        // Texto editável no painel: não volta.
    }

    private function tatu(): ?Product
    {
        return Product::query()->where('slug->pt', 'poltrona-tatu')->first();
    }
};
