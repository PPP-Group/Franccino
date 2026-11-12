<?php

namespace App\Http\Requests\Api\V1;

use App\Support\Locales;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Valida `POST /quote-lists` (`docs/api.md`): os itens no mesmo formato do contato (até 50 linhas de peças
 * publicadas, com acabamentos e uma observação curta).
 */
class QuoteListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*.product_id' => [
                'required',
                'integer',
                Rule::exists('products', 'id')->where('is_published', true)->whereNull('deleted_at'),
            ],
            'items.*.quantity' => ['required', 'integer', 'between:1,99'],
            'items.*.finish_ids' => ['sometimes', 'array', 'max:10'],
            'items.*.finish_ids.*' => ['integer', Rule::exists('finishes', 'id')],
            'items.*.note' => ['nullable', 'string', 'max:500'],
            'locale' => ['required', Rule::in(Locales::all())],
        ];
    }
}
