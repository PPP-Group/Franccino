<?php

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

class GeneralSettings extends Settings
{
    public string $company_name;

    public ?string $contact_email;

    public ?string $contact_phone;

    public ?string $factory_address;

    public ?string $quotes_whatsapp;

    public ?string $assistance_whatsapp;

    public ?string $assistance_phone;

    public ?string $instagram_url;

    public ?string $facebook_url;

    public ?string $pinterest_url;

    public ?string $linkedin_url;

    public ?string $youtube_url;

    /** @var list<string> */
    public array $contact_recipients;

    /**
     * List of footer documents: `['label' => ['pt' => ..., 'en' => ...], 'path' => 'documents/file.pdf']`,
     * files stored on the `media` disk. No `@var` shape tag here on purpose — laravel-settings'
     * docblock resolver only understands simple bracket generics and chokes on `array{...}` shapes.
     */
    public array $footer_documents;

    public static function group(): string
    {
        return 'general';
    }
}
