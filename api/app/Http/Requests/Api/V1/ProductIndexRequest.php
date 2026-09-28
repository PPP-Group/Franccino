<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\AreaKey;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validates `GET /products` filters. An unrecognized enum-like value (bad
 * `area`, `sort`, `finish`, `page` or `per_page`) is a 422 — the front treats
 * that as an empty result. Free-text slug filters (`category`, `designer`,
 * `collection`, `line`, `launch`) are not validated against existing records:
 * an unknown slug simply matches nothing.
 */
class ProductIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'area' => ['sometimes', 'string', Rule::in(array_column(AreaKey::cases(), 'value'))],
            'category' => ['sometimes', 'string'],
            'designer' => ['sometimes', 'string'],
            'collection' => ['sometimes', 'string'],
            'line' => ['sometimes', 'string'],
            'finish' => ['sometimes', 'integer'],
            'launch' => ['sometimes', 'string'],
            'q' => ['sometimes', 'string'],
            'sort' => ['sometimes', Rule::in(['featured', 'name', 'newest'])],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:48'],
        ];
    }
}
