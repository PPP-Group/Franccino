<?php

namespace App\Filament\Support;

use App\Filament\Resources\Banners\BannerResource;
use App\Filament\Resources\Clients\ClientResource;
use App\Filament\Resources\Collections\CollectionResource;
use App\Filament\Resources\ContactMessages\ContactMessageResource;
use App\Filament\Resources\Designers\DesignerResource;
use App\Filament\Resources\Finishes\FinishResource;
use App\Filament\Resources\FinishGroups\FinishGroupResource;
use App\Filament\Resources\Launches\LaunchResource;
use App\Filament\Resources\NewsletterSubscribers\NewsletterSubscriberResource;
use App\Filament\Resources\Pages\PageResource;
use App\Filament\Resources\Products\ProductResource;
use App\Filament\Resources\Projects\ProjectResource;
use App\Filament\Resources\Scenes\SceneResource;
use App\Filament\Resources\Stores\StoreResource;
use App\Filament\Resources\Users\UserResource;
use App\Settings\GeneralSettings;
use Filament\Resources\Resource;
use Illuminate\Support\Str;
use Throwable;

/**
 * The help center guides: their order, the panel screen each one explains and the optional tutorial
 * video set in Settings. Texts live in `lang/pt_BR/guides.php` (`guides.sections.<key>`).
 */
final class PanelGuides
{
    /**
     * Guide key => resources it explains (the first one is the "Abrir a tela" link).
     *
     * @var array<string, list<class-string<resource>>>
     */
    private const GUIDES = [
        'start' => [],
        'products' => [ProductResource::class],
        'collections' => [CollectionResource::class],
        'launches' => [LaunchResource::class],
        'designers' => [DesignerResource::class],
        'banners' => [BannerResource::class],
        'scenes' => [SceneResource::class],
        'pages' => [PageResource::class],
        'projects' => [ProjectResource::class],
        'stores' => [StoreResource::class],
        'clients' => [ClientResource::class],
        'finishes' => [FinishResource::class, FinishGroupResource::class],
        'downloads' => [],
        'model3d' => [],
        'messages' => [ContactMessageResource::class, NewsletterSubscriberResource::class],
        'writing' => [],
        'photos' => [],
        'users' => [UserResource::class],
    ];

    /** @return list<string> */
    public static function keys(): array
    {
        return array_keys(self::GUIDES);
    }

    /**
     * Everything the help center renders for one guide.
     *
     * @return array{key: string, title: string, summary: string, steps: list<string>, tips: list<string>, url: ?string, video: ?string}
     */
    public static function guide(string $key): array
    {
        /** @var array{title: string, summary: string, steps: list<string>, tips: list<string>} $texts */
        $texts = trans("guides.sections.{$key}");

        return [
            'key' => $key,
            'title' => $texts['title'],
            'summary' => $texts['summary'],
            'steps' => $texts['steps'],
            'tips' => $texts['tips'],
            'url' => self::screenUrl($key),
            'video' => self::videoEmbedUrl(self::videos()[$key] ?? null),
        ];
    }

    /** @return list<array{key: string, title: string, summary: string, steps: list<string>, tips: list<string>, url: ?string, video: ?string}> */
    public static function all(): array
    {
        return array_map(self::guide(...), self::keys());
    }

    /** Guide that explains the panel screen behind a route name (e.g. "filament.admin.resources.products.edit"). */
    public static function forRoute(?string $routeName): ?string
    {
        if ($routeName === null) {
            return null;
        }

        foreach (self::GUIDES as $key => $resources) {
            foreach ($resources as $resource) {
                if (Str::startsWith($routeName, $resource::getRouteBaseName().'.')) {
                    return $key;
                }
            }
        }

        return null;
    }

    /** Guide keys a tutorial video can be set for, with their titles (for the Settings select). */
    public static function options(): array
    {
        return collect(self::keys())
            ->mapWithKeys(fn (string $key): array => [$key => trans("guides.sections.{$key}.title")])
            ->all();
    }

    /**
     * Turns a YouTube, Vimeo or Google Drive share link into an embeddable player address.
     * Anything else is ignored, so a typo never renders a broken frame.
     */
    public static function videoEmbedUrl(?string $url): ?string
    {
        if (blank($url)) {
            return null;
        }

        if (preg_match('~(?:youtu\.be/|youtube\.com/(?:watch\?(?:.*&)?v=|embed/|shorts/))([\w-]{11})~', $url, $match)) {
            return "https://www.youtube-nocookie.com/embed/{$match[1]}";
        }

        if (preg_match('~vimeo\.com/(?:video/)?(\d+)~', $url, $match)) {
            return "https://player.vimeo.com/video/{$match[1]}";
        }

        if (preg_match('~drive\.google\.com/file/d/([\w-]+)~', $url, $match)) {
            return "https://drive.google.com/file/d/{$match[1]}/preview";
        }

        return null;
    }

    private static function screenUrl(string $key): ?string
    {
        $resource = self::GUIDES[$key][0] ?? null;

        return $resource !== null && $resource::canAccess() ? $resource::getUrl() : null;
    }

    /** @return array<string, string> */
    private static function videos(): array
    {
        try {
            $rows = app(GeneralSettings::class)->tutorial_videos;
        } catch (Throwable) {
            return [];
        }

        return collect($rows)
            ->filter(fn ($row): bool => is_array($row) && filled($row['guide'] ?? null) && filled($row['url'] ?? null))
            ->mapWithKeys(fn (array $row): array => [$row['guide'] => $row['url']])
            ->all();
    }
}
