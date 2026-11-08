<?php

namespace App\Console\Commands;

use App\Models\Client as ClientLogo;
use App\Models\Page;
use App\Models\Product;
use App\Models\Project;
use App\Models\Scene;
use App\Models\Store;
use App\Support\WordPress\Client;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\HasMedia;

/**
 * Applies content extracted from the current WordPress site (database/data/wordpress/*.json): product tagline and
 * description, store photos, project galleries, client logos, extra blocks of the factory page, and scenes (photo
 * with clickable points) tied to projects. Only fills what is empty: whatever the panel already has stays. Images
 * are downloaded from the old site when the list runs. Runs once per list: the container entrypoint calls it on every
 * start, and the marker in storage/ makes the next starts skip it.
 */
class ApplyLegacyContent extends Command
{
    protected $signature = 'franccino:content:apply
        {file : JSON com o conteúdo extraído do site antigo (database/data/wordpress/)}
        {--dry-run : only count, without writing}
        {--force : run again even if this list was already applied}';

    protected $description = 'Preenche o que está vazio com o conteúdo extraído do site antigo (textos, fotos de lojas, galerias, logos, ambientes)';

    /** @var array<string, array{0: int, 1: int}> filled and skipped per section */
    private array $counts = [];

    private bool $dryRun = false;

    public function handle(Client $client): int
    {
        $file = (string) $this->argument('file');
        if (! File::exists($file)) {
            $this->error("Arquivo não encontrado: {$file}");

            return self::FAILURE;
        }

        /** @var array<string, mixed> $list */
        $list = json_decode(File::get($file), true, flags: JSON_THROW_ON_ERROR);
        $version = preg_replace('/[^A-Za-z0-9_-]/', '', (string) ($list['version'] ?? pathinfo($file, PATHINFO_FILENAME)));
        $marker = self::marker($version);
        $this->dryRun = (bool) $this->option('dry-run');

        if (File::exists($marker) && ! $this->option('force')) {
            $this->info("Lista {$version} já aplicada em ".trim(File::get($marker)).'.');

            return self::SUCCESS;
        }

        $this->products($list['products'] ?? []);
        $this->stores($list['stores'] ?? [], $client);
        $this->projects($list['projects'] ?? [], $client);
        $this->clients($list['clients'] ?? [], $client);
        $this->pages($list['pages'] ?? [], $client);
        $this->scenes($list['scenes'] ?? [], $client);

        $this->table(
            ['Parte', 'Preenchidos', 'Ignorados (já tinha ou não encontrado)'],
            collect($this->counts)->map(fn (array $count, string $part) => [$part, $count[0], $count[1]])->values()->all(),
        );

        if ($this->dryRun) {
            $this->comment('Simulação: nada foi gravado.');
        } else {
            File::put($marker, now()->toIso8601String());
        }

        return self::SUCCESS;
    }

    public static function marker(string $version): string
    {
        return storage_path(".content-{$version}");
    }

    /** @param list<array{wp_id?: int, slug: string, tagline?: ?string, description?: ?string}> $items */
    private function products(array $items): void
    {
        foreach ($items as $item) {
            $product = (isset($item['wp_id']) ? Product::query()->where('legacy_wp_id', $item['wp_id'])->first() : null)
                ?? Product::query()->where('slug->pt', $item['slug'])->first();
            $changed = false;
            if ($product !== null) {
                foreach (['tagline', 'description'] as $field) {
                    $value = $item[$field] ?? null;
                    if (filled($value) && blank(strip_tags((string) $product->getTranslation($field, 'pt', false)))) {
                        $product->setTranslation($field, 'pt', $value);
                        $changed = true;
                    }
                }
            }
            if ($changed && ! $this->dryRun) {
                $product->save();
            }
            $this->count('Textos das peças', $changed);
        }
    }

    /** @param list<array{name: string, image: string}> $items */
    private function stores(array $items, Client $client): void
    {
        $stores = Store::query()->get()->keyBy(fn (Store $store) => self::key((string) $store->name));
        foreach ($items as $item) {
            $store = $stores->get(self::key($item['name']));
            $this->count('Fotos das lojas', $store !== null && ! $store->hasMedia('image')
                && $this->attach($store, 'image', $item['image'], $client));
        }
    }

    /** @param list<array{slug: string, gallery: list<string>}> $items */
    private function projects(array $items, Client $client): void
    {
        foreach ($items as $item) {
            $project = Project::query()->where('slug->pt', $item['slug'])->first();
            $existing = $project?->getMedia('gallery')->map(fn ($media) => $media->getCustomProperty('legacy_url'))->filter()->all() ?? [];
            foreach ($item['gallery'] as $url) {
                $this->count('Fotos dos projetos', $project !== null && ! in_array($url, $existing, true)
                    && $this->attach($project, 'gallery', $url, $client));
            }
        }
    }

    /** @param list<array{name: string, logo: string}> $items */
    private function clients(array $items, Client $client): void
    {
        $clients = ClientLogo::query()->get()->keyBy(fn (ClientLogo $logo) => self::key((string) $logo->name));
        foreach ($items as $item) {
            $logo = $clients->get(self::key($item['name']));
            $this->count('Logos dos clientes', $logo !== null && ! $logo->hasMedia('logo')
                && $this->attach($logo, 'logo', $item['logo'], $client));
        }
    }

    /**
     * Appends blocks to a page, only the types the page does not have yet. Image fields hold old-site URLs, copied
     * to the media disk like a panel upload (`pages/`).
     *
     * @param  list<array{key: string, blocks: list<array{type: string, data: array<string, mixed>}>}>  $items
     */
    private function pages(array $items, Client $client): void
    {
        foreach ($items as $item) {
            $page = Page::query()->where('key', $item['key'])->first();
            $content = $page === null ? [] : (array) ($page->content ?? []);
            $types = array_column($content, 'type');
            foreach ($item['blocks'] as $block) {
                $add = $page !== null && ! in_array($block['type'], $types, true);
                if ($add && ! $this->dryRun) {
                    $data = $block['data'];
                    foreach (['image', 'poster'] as $field) {
                        if (isset($data[$field])) {
                            $data[$field] = $this->copyToMedia($data[$field], $client);
                        }
                    }
                    if (isset($data['images'])) {
                        $data['images'] = array_values(array_filter(array_map(fn (string $url) => $this->copyToMedia($url, $client), $data['images'])));
                    }
                    $content[] = ['type' => $block['type'], 'data' => $data];
                }
                $this->count('Blocos de páginas', $add);
            }
            if ($page !== null && ! $this->dryRun) {
                $page->update(['content' => $content]);
            }
        }
    }

    /**
     * Creates a scene (photo with clickable points) for a project that has none.
     *
     * @param  list<array{title: array<string, string>, project: string, image: string, hotspots: list<array{product: string, x: float, y: float}>}>  $items
     */
    private function scenes(array $items, Client $client): void
    {
        foreach ($items as $item) {
            $project = Project::query()->where('slug->pt', $item['project'])->first();
            $create = $project !== null && ! Scene::query()->where('project_id', $project->id)->exists();
            if ($create && ! $this->dryRun) {
                $scene = Scene::query()->create([
                    'title' => $item['title'],
                    'project_id' => $project->id,
                    'is_published' => true,
                ]);
                $this->attach($scene, 'image', $item['image'], $client);
                foreach ($item['hotspots'] as $index => $point) {
                    $product = Product::query()->where('slug->pt', $point['product'])->first();
                    if ($product !== null) {
                        $scene->hotspots()->create([
                            'product_id' => $product->id,
                            'x' => $point['x'],
                            'y' => $point['y'],
                            'sort_order' => $index,
                        ]);
                    }
                }
            }
            $this->count('Ambientes dos projetos', $create);
        }
    }

    private function attach(HasMedia $model, string $collection, string $url, Client $client): bool
    {
        if ($this->dryRun) {
            return true;
        }
        $path = $client->download($url);
        if ($path === null) {
            $this->warn("Imagem não baixada: {$url}");

            return false;
        }
        $model->addMedia($path)
            ->preservingOriginal()
            ->usingFileName(basename((string) parse_url($url, PHP_URL_PATH)))
            ->withCustomProperties(['legacy_url' => $url])
            ->toMediaCollection($collection);

        return true;
    }

    /** Copies an old-site image to the media disk (`pages/`), like a page block upload; `null` when it fails. */
    private function copyToMedia(string $url, Client $client): ?string
    {
        $path = $client->download($url);
        if ($path === null) {
            $this->warn("Imagem não baixada: {$url}");

            return null;
        }
        $target = 'pages/'.Str::lower(Str::random(8)).'-'.basename((string) parse_url($url, PHP_URL_PATH));
        Storage::disk('media')->put($target, File::get($path));

        return $target;
    }

    private function count(string $part, bool $filled): void
    {
        $this->counts[$part] ??= [0, 0];
        $this->counts[$part][$filled ? 0 : 1]++;
    }

    private static function key(string $name): string
    {
        return Str::of($name)->ascii()->lower()->squish()->toString();
    }
}
