<?php

namespace App\Http\Requests\Api\V1;

use App\Models\ConsentRecord;
use App\Support\Locales;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validates `POST /consents` (`docs/api.md`): the choice made in the cookie banner.
 */
class ConsentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'visitor_id' => ['required', 'uuid'],
            'choice' => ['required', Rule::in(ConsentRecord::CHOICES)],
            'policy_version' => ['nullable', 'string', 'max:40'],
            'locale' => ['required', Rule::in(Locales::all())],
        ];
    }
}
