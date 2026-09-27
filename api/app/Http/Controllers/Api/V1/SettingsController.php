<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Settings\GeneralSettings;
use App\Support\Localized;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

/**
 * `GET /settings`: the public `GeneralSettings` fields (docs/data-model.md
 * "settings"), without `contact_recipients` (Ruling R10). `footer_documents`
 * becomes `[{ label, url }]`: `label` resolved to the requested locale, `url`
 * an absolute link to the file on the `media` disk.
 */
class SettingsController extends Controller
{
    public function __invoke(GeneralSettings $settings): JsonResponse
    {
        return response()->json(['data' => [
            'company_name' => $settings->company_name,
            'contact_email' => $settings->contact_email,
            'contact_phone' => $settings->contact_phone,
            'factory_address' => $settings->factory_address,
            'quotes_whatsapp' => $settings->quotes_whatsapp,
            'assistance_whatsapp' => $settings->assistance_whatsapp,
            'assistance_phone' => $settings->assistance_phone,
            'instagram_url' => $settings->instagram_url,
            'facebook_url' => $settings->facebook_url,
            'pinterest_url' => $settings->pinterest_url,
            'linkedin_url' => $settings->linkedin_url,
            'youtube_url' => $settings->youtube_url,
            'footer_documents' => collect($settings->footer_documents)
                ->map(fn (array $document) => [
                    'label' => Localized::array($document['label'] ?? null),
                    'url' => Storage::disk('media')->url($document['path']),
                ])
                ->values()
                ->all(),
        ]]);
    }
}
