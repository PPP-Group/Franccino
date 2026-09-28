<?php

namespace App\Http\Requests\Api\V1;

use App\Services\Turnstile;
use App\Support\Locales;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validates `POST /newsletter` (`docs/api.md`).
 */
class NewsletterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'max:190'],
            'name' => ['nullable', 'string', 'max:120'],
            'locale' => ['required', Rule::in(Locales::all())],
            'source' => ['nullable', 'string', 'max:60'],
            'consent' => ['accepted'],
            'turnstile_token' => [
                'bail',
                Rule::requiredIf(fn () => filled(config('franccino.turnstile.secret_key'))),
                'nullable',
                'string',
                $this->turnstileRule(),
            ],
        ];
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
