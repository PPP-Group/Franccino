<?php

namespace App\Http\Requests\Api\V1;

use App\Support\Locales;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validates `POST /download-leads` (`docs/api.md`): o cadastro antes de baixar arquivos técnicos.
 */
class DownloadLeadRequest extends FormRequest
{
    public const PROFILES = ['professional', 'client'];

    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'profile' => ['required', Rule::in(self::PROFILES)],
            'first_name' => ['required', 'string', 'max:80'],
            'last_name' => ['required', 'string', 'max:80'],
            'email' => ['required', 'email', 'max:190'],
            'interest' => ['nullable', 'string', 'max:190'],
            'phone' => ['nullable', 'string', 'max:40'],
            'locale' => ['required', Rule::in(Locales::all())],
            'consent' => ['accepted'],
        ];
    }
}
