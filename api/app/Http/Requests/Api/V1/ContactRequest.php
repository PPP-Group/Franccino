<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\ContactProfession;
use App\Enums\ContactType;
use App\Services\Turnstile;
use App\Support\Locales;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Exists;

/**
 * Validates `POST /contact` (`docs/api.md`). `items` is the optional quote
 * list ("Sala para montar"): up to 50 lines, each pointing at a published
 * product, an optional list of existing finishes and a short note.
 */
class ContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(array_column(ContactType::cases(), 'value'))],
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'phone' => ['nullable', 'string', 'max:40'],
            'company' => ['nullable', 'string', 'max:120'],
            'profession' => ['nullable', Rule::in(array_column(ContactProfession::cases(), 'value'))],
            'city' => ['nullable', 'string', 'max:120'],
            'state' => ['nullable', 'string', 'size:2'],
            'message' => ['required', 'string', 'max:5000'],
            'product_id' => ['nullable', 'integer', $this->publishedProductRule()],
            'items' => ['sometimes', 'array', 'max:50'],
            'items.*.product_id' => ['required', 'integer', $this->publishedProductRule()],
            'items.*.quantity' => ['required', 'integer', 'between:1,99'],
            'items.*.finish_ids' => ['sometimes', 'array', 'max:10'],
            'items.*.finish_ids.*' => ['integer', Rule::exists('finishes', 'id')],
            'items.*.note' => ['nullable', 'string', 'max:500'],
            'locale' => ['required', Rule::in(Locales::all())],
            'source_url' => ['nullable', 'url', 'max:512'],
            'consent' => ['accepted'],
            'turnstile_token' => [
                Rule::requiredIf(fn () => filled(config('franccino.turnstile.secret_key'))),
                $this->turnstileRule(),
            ],
        ];
    }

    private function publishedProductRule(): Exists
    {
        return Rule::exists('products', 'id')->where('is_published', true)->whereNull('deleted_at');
    }

    private function turnstileRule(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail): void {
            if (blank(config('franccino.turnstile.secret_key'))) {
                return;
            }

            if (! app(Turnstile::class)->verify($value, $this->ip())) {
                $fail(__('The Turnstile verification failed.'));
            }
        };
    }
}
