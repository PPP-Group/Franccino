<?php

namespace App\Support;

use App\Models\ContactMessage;
use App\Models\DownloadLog;
use App\Models\Product;
use App\Models\QuoteList;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Numbers for the panel home (revisão de 17/11/2026: "o dashboard tem que mostrar a saúde do site, dos códigos, da
 * versão"): is the site up, which version is running and since when, how the queue and the backups are, and how
 * complete the catalog is. The slow checks are cached for a few minutes.
 */
class SiteStatus
{
    /** Marker the container entrypoint writes on every start (docker/entrypoint.sh). */
    public const DEPLOY_MARKER = '.deployed-at';

    /** @return array{up: bool, ms: ?int, checked_at: string} */
    public function frontend(): array
    {
        return Cache::remember('panel.status.frontend', now()->addMinutes(5), function (): array {
            $url = rtrim((string) config('franccino.frontend.url'), '/').'/robots.txt';
            $started = microtime(true);
            try {
                $up = Http::timeout(5)->get($url)->successful();
            } catch (Throwable) {
                $up = false;
            }

            return [
                'up' => $up,
                'ms' => $up ? (int) round((microtime(true) - $started) * 1000) : null,
                'checked_at' => now()->toIso8601String(),
            ];
        });
    }

    /** @return array{deployed_at: ?CarbonImmutable, commit: ?string, laravel: string, php: string, migration: ?string} */
    public function version(): array
    {
        $marker = storage_path(self::DEPLOY_MARKER);
        $lines = File::exists($marker) ? array_map('trim', explode("\n", trim(File::get($marker)))) : [];
        $deployedAt = isset($lines[0]) && $lines[0] !== '' ? rescue(fn () => CarbonImmutable::parse($lines[0]), null, false) : null;
        $migration = rescue(fn () => DB::table('migrations')->orderByDesc('id')->value('migration'), null, false);

        return [
            'deployed_at' => $deployedAt,
            'commit' => isset($lines[1]) && $lines[1] !== '' ? substr($lines[1], 0, 7) : null,
            'laravel' => app()->version(),
            'php' => PHP_VERSION,
            'migration' => is_string($migration) ? $migration : null,
        ];
    }

    /** @return array{pending: int, failed_week: int} */
    public function queue(): array
    {
        return [
            'pending' => (int) rescue(fn () => DB::table('jobs')->count(), 0, false),
            'failed_week' => (int) rescue(fn () => DB::table('failed_jobs')->where('failed_at', '>=', now()->subDays(7))->count(), 0, false),
        ];
    }

    /** Date of the newest backup file in storage/app/backups (franccino:backup), or null when there is none. */
    public function lastBackup(): ?CarbonImmutable
    {
        $dir = storage_path('app/backups');
        if (! File::isDirectory($dir)) {
            return null;
        }
        $newest = collect(File::files($dir))->max(fn ($file) => $file->getMTime());

        return $newest ? CarbonImmutable::createFromTimestamp($newest) : null;
    }

    /**
     * Share of the published pieces that have each part the site shows, in percent (0 to 100).
     *
     * @return array<string, int>
     */
    public function completeness(): array
    {
        $published = Product::query()->where('is_published', true);
        $total = (clone $published)->count();
        if ($total === 0) {
            return [];
        }
        $default = Locales::default();
        $other = collect(Locales::all())->first(fn (string $locale): bool => $locale !== $default);
        $percent = fn (Builder $query): int => (int) round($query->count() * 100 / $total);

        return array_filter([
            'cover' => $percent((clone $published)->whereHas('media', fn (Builder $q) => $q->where('collection_name', 'cover'))),
            'description' => $percent((clone $published)->whereNotNull("description->{$default}")->where("description->{$default}", '!=', '')),
            'english' => $other === null ? null : $percent((clone $published)->whereNotNull("name->{$other}")->where("name->{$other}", '!=', '')),
            'dimensions' => $percent((clone $published)->whereNotNull('dimensions')->where('dimensions', '!=', '[]')->where('dimensions', '!=', '{}')),
            'model' => $percent((clone $published)->whereHas('media', fn (Builder $q) => $q->where('collection_name', 'model_3d'))),
            'files' => $percent((clone $published)->whereHas('files')),
        ], fn (?int $value): bool => $value !== null);
    }

    /**
     * Contact messages, wish lists sent by link and technical downloads per day, for the last `$days` days.
     *
     * @return array{labels: list<string>, messages: list<int>, lists: list<int>, downloads: list<int>}
     */
    public function activity(int $days = 30): array
    {
        $from = now()->startOfDay()->subDays($days - 1);
        $count = function (string $model) use ($from): array {
            /** @var class-string<Model> $model */
            return $model::query()
                ->where('created_at', '>=', $from)
                ->get(['created_at'])
                ->countBy(fn ($row) => CarbonImmutable::parse($row->getRawOriginal('created_at'))->toDateString())
                ->all();
        };
        $messages = $count(ContactMessage::class);
        $lists = $count(QuoteList::class);
        $downloads = $count(DownloadLog::class);

        $labels = $m = $l = $d = [];
        for ($i = 0; $i < $days; $i++) {
            $day = $from->copy()->addDays($i);
            $key = $day->toDateString();
            $labels[] = $day->format('d/m');
            $m[] = $messages[$key] ?? 0;
            $l[] = $lists[$key] ?? 0;
            $d[] = $downloads[$key] ?? 0;
        }

        return ['labels' => $labels, 'messages' => $m, 'lists' => $l, 'downloads' => $d];
    }
}
