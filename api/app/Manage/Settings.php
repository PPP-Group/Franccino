<?php

namespace App\Manage;

use App\Filament\Support\PanelGuides;
use App\Settings\GeneralSettings;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

/**
 * As configurações gerais do painel (Configurações) na API de gestão: os mesmos campos e regras da tela. Os documentos
 * do rodapé são PDFs do disco de mídia: pela API dá para mudar o rótulo, a ordem ou tirar; um PDF novo entra pelo
 * painel (o caminho tem de ser de um arquivo que já existe).
 */
final class Settings
{
    /** @var array<string, array<string, mixed>> */
    private const FIELDS = [
        'company_name' => ['kind' => 'string', 'max' => 255, 'description' => 'Nome da empresa.'],
        'contact_email' => ['kind' => 'string', 'max' => 255, 'format' => 'email', 'description' => 'E-mail de contato.'],
        'contact_phone' => ['kind' => 'string', 'max' => 255, 'description' => 'Telefone de contato.'],
        'factory_address' => ['kind' => 'string', 'max' => 255, 'description' => 'Endereço da fábrica.'],
        'quotes_whatsapp' => ['kind' => 'string', 'max' => 255, 'description' => 'WhatsApp dos orçamentos.'],
        'assistance_whatsapp' => ['kind' => 'string', 'max' => 255, 'description' => 'WhatsApp da assistência.'],
        'assistance_phone' => ['kind' => 'string', 'max' => 255, 'description' => 'Telefone da assistência.'],
        'instagram_url' => ['kind' => 'string', 'max' => 255, 'format' => 'url', 'description' => 'Instagram.'],
        'facebook_url' => ['kind' => 'string', 'max' => 255, 'format' => 'url', 'description' => 'Facebook.'],
        'pinterest_url' => ['kind' => 'string', 'max' => 255, 'format' => 'url', 'description' => 'Pinterest.'],
        'linkedin_url' => ['kind' => 'string', 'max' => 255, 'format' => 'url', 'description' => 'LinkedIn.'],
        'youtube_url' => ['kind' => 'string', 'max' => 255, 'format' => 'url', 'description' => 'YouTube.'],
    ];

    /** Texts of the cookie notice and how they are called in the panel. */
    private const COOKIE_TEXTS = [
        'title' => 'Título.',
        'body' => 'Texto do aviso.',
        'necessary' => 'Cookies necessários: o que fazem.',
        'analytics' => 'Cookies de análise: o que fazem.',
        'marketing' => 'Cookies de marketing: o que fazem.',
    ];

    /** @return array<string, array<string, mixed>> */
    public static function schema(): array
    {
        $schema = array_map(fn (array $spec) => Schema::json($spec), self::FIELDS);
        $schema['contact_recipients'] = ['type' => 'array', 'items' => ['type' => 'string', 'format' => 'email'], 'description' => 'E-mails que recebem as mensagens do site (pelo menos um).'];
        $schema['footer_documents'] = ['type' => 'array', 'description' => 'Documentos do rodapé, na ordem: `{label: {pt, en}, path}`. O `path` é de um PDF que já está no site (para um PDF novo, use o painel).', 'items' => [
            'type' => 'object',
            'properties' => (object) [
                'label' => Schema::json(['kind' => 'i18n', 'max' => 160, 'description' => 'Rótulo.']),
                'path' => ['type' => 'string', 'description' => 'Caminho do PDF.'],
            ],
        ]];
        $schema['tutorial_videos'] = ['type' => 'array', 'description' => 'Vídeos da central de ajuda do painel, um por guia: `{guide, url}`.', 'items' => [
            'type' => 'object',
            'properties' => (object) [
                'guide' => ['type' => 'string', 'enum' => array_keys(PanelGuides::options()), 'description' => 'Guia.'],
                'url' => ['type' => 'string', 'format' => 'uri', 'description' => 'Link do YouTube, Vimeo ou Google Drive.'],
            ],
        ]];

        $schema['cookie_banner'] = ['type' => 'object', 'description' => 'Textos do aviso de cookies do site. Vazio, o site usa o texto padrão. `title`, `body` (o texto do aviso), `necessary`, `analytics` e `marketing` (o que cada categoria faz).', 'properties' => (object) array_map(
            fn (string $label) => Schema::json(['kind' => 'i18n', 'max' => 600, 'description' => $label]),
            self::COOKIE_TEXTS,
        )];

        return $schema;
    }

    /** @return array<string, string> */
    public static function attributes(): array
    {
        return Schema::attributes(self::FIELDS) + [
            'contact_recipients' => 'e-mails que recebem as mensagens',
            'contact_recipients.*' => 'e-mail que recebe as mensagens',
            'footer_documents' => 'documentos do rodapé',
            'footer_documents.*.label' => 'documentos do rodapé › rótulo',
            'footer_documents.*.label.pt' => 'documentos do rodapé › rótulo (português)',
            'footer_documents.*.label.en' => 'documentos do rodapé › rótulo (inglês)',
            'footer_documents.*.path' => 'documentos do rodapé › caminho do PDF',
            'tutorial_videos' => 'vídeos da central de ajuda',
            'tutorial_videos.*.guide' => 'vídeos da central de ajuda › guia',
            'tutorial_videos.*.url' => 'vídeos da central de ajuda › link',
            'cookie_banner' => 'aviso de cookies',
        ];
    }

    /** @return array<string, mixed> */
    public static function rules(): array
    {
        $rules = [];
        foreach (self::FIELDS as $name => $spec) {
            $rules += Schema::fieldRules($name, $spec, false);
        }
        $rules['company_name'] = ['sometimes', 'filled', 'string', 'max:255'];

        return $rules + [
            'contact_recipients' => ['sometimes', 'array', 'min:1', 'max:20'],
            'contact_recipients.*' => ['email'],
            'footer_documents' => ['sometimes', 'array', 'max:20'],
            'footer_documents.*.label' => ['required', 'array:pt,en'],
            'footer_documents.*.label.pt' => ['required', 'string', 'max:160'],
            'footer_documents.*.label.en' => ['nullable', 'string', 'max:160'],
            'footer_documents.*.path' => ['required', 'string', 'max:255', function (string $attribute, mixed $value, \Closure $fail): void {
                if (! is_string($value) || ! str_starts_with($value, 'documents/') || ! Storage::disk('media')->exists($value)) {
                    $fail('O documento tem de ser um PDF que já está no site (um caminho de documents/).');
                }
            }],
            'tutorial_videos' => ['sometimes', 'array', 'max:50'],
            'tutorial_videos.*.guide' => ['required', 'distinct', Rule::in(array_keys(PanelGuides::options()))],
            'tutorial_videos.*.url' => ['required', 'url'],
            'cookie_banner' => ['sometimes', 'array:'.implode(',', array_keys(self::COOKIE_TEXTS))],
            'cookie_banner.*' => ['nullable', 'array:pt,en'],
            'cookie_banner.*.*' => ['nullable', 'string', 'max:600'],
        ];
    }

    /** @return array<string, mixed> */
    public static function read(GeneralSettings $settings): array
    {
        $data = [];
        foreach (array_keys(self::FIELDS) as $name) {
            $data[$name] = $settings->{$name};
        }

        return $data + [
            'contact_recipients' => $settings->contact_recipients,
            'footer_documents' => array_values($settings->footer_documents),
            'tutorial_videos' => array_values($settings->tutorial_videos),
            'cookie_banner' => (object) $settings->cookie_banner,
        ];
    }

    /** @param  array<string, mixed>  $input */
    public static function write(GeneralSettings $settings, array $input): void
    {
        foreach ($input as $name => $value) {
            if (array_key_exists($name, self::FIELDS) || in_array($name, ['contact_recipients', 'footer_documents', 'tutorial_videos', 'cookie_banner'], true)) {
                $settings->{$name} = is_string($value) ? trim($value) : $value;
            }
        }
        $settings->save();
    }

    public static function etag(GeneralSettings $settings): string
    {
        return '"'.substr(hash('sha256', (string) json_encode(self::read($settings))), 0, 32).'"';
    }
}
