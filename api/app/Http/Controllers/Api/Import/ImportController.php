<?php

namespace App\Http\Controllers\Api\Import;

use App\Enums\BannerPlacement;
use App\Enums\ProductFileType;
use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Client;
use App\Models\Collection;
use App\Models\Designer;
use App\Models\Launch;
use App\Models\Page;
use App\Models\Product;
use App\Models\ProductFile;
use App\Models\Project;
use App\Models\Scene;
use App\Models\Store;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Spatie\MediaLibrary\HasMedia;

/**
 * Bulk import for the team (`/api/import/*`, docs/api.md "Importação em massa"): photos sent from a computer or a
 * script, one request per file, and the same JSON lists the container applies on deploy (covers, cut-outs are files,
 * old-site content), applied right away on the queue. Nothing goes through the repository and no panel login is
 * needed; the token (`CONTENT_IMPORT_TOKEN`) turns it on per environment.
 */
class ImportController extends Controller
{
    /** Collections each kind of record accepts, and how the record is found. */
    private const TARGETS = [
        'product' => ['model' => Product::class, 'key' => 'slug->pt', 'collections' => ['cover', 'gallery', 'cutout']],
        'project' => ['model' => Project::class, 'key' => 'slug->pt', 'collections' => ['cover', 'gallery', 'video', 'video_poster']],
        'designer' => ['model' => Designer::class, 'key' => 'slug', 'collections' => ['portrait']],
        'collection' => ['model' => Collection::class, 'key' => 'slug->pt', 'collections' => ['cover', 'gallery', 'video', 'video_poster']],
        'launch' => ['model' => Launch::class, 'key' => 'slug->pt', 'collections' => ['cover', 'gallery']],
        'store' => ['model' => Store::class, 'key' => 'id', 'collections' => ['image']],
        'client' => ['model' => Client::class, 'key' => 'id', 'collections' => ['logo']],
        'scene' => ['model' => Scene::class, 'key' => 'id', 'collections' => ['image']],
        // Banners da home pela posição na ordem do carrossel (1, 2, 3...): a API pública não mostra o id.
        'banner' => ['model' => Banner::class, 'key' => 'position', 'collections' => ['image', 'image_mobile']],
    ];

    /** Owners of technical files (downloads), found by the slug in Portuguese (designers have one slug). */
    private const FILE_OWNERS = [
        'product' => ['model' => Product::class, 'key' => 'slug->pt'],
        'designer' => ['model' => Designer::class, 'key' => 'slug'],
        'launch' => ['model' => Launch::class, 'key' => 'slug->pt'],
    ];

    /**
     * One photo for one record: `cover`, `cutout`, `image`, `logo` and `portrait` replace the current one; `gallery`
     * adds. `page` (key = page key, e.g. `factory`) adds the photo to the page's gallery block.
     */
    public function media(Request $request): JsonResponse
    {
        if ($request->input('target') === 'page') {
            return $this->pageGallery($request);
        }

        // `video` takes the page film (MP4, up to the page video limit); every other collection takes a photo.
        $file = $request->input('collection') === 'video'
            ? ['required', 'file', 'mimetypes:video/mp4', 'max:'.config('franccino.uploads.video_max_kb')]
            : ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:30720'];
        $data = $request->validate([
            'target' => ['required', Rule::in(array_keys(self::TARGETS))],
            'key' => ['required', 'string', 'max:200'],
            'collection' => ['required', 'string'],
            'file' => $file,
            'source' => ['nullable', 'string', 'max:500'],
            'replaces' => ['nullable', 'string', 'max:500'],
        ]);
        $target = self::TARGETS[$data['target']];
        abort_unless(in_array($data['collection'], $target['collections'], true), 422, 'Coleção não aceita para esse tipo.');

        /** @var class-string<Model&HasMedia> $class */
        $class = $target['model'];
        $record = $target['key'] === 'position'
            ? $this->bannerAt((int) $data['key'])
            : $class::query()->where($target['key'], $data['key'])->firstOrFail();

        // The same source twice (a batch that runs again) does not add the photo again.
        $source = $data['source'] ?? null;
        $known = $source === null ? null : $record->getMedia($data['collection'])
            ->first(fn ($media) => $media->getCustomProperty('legacy_url') === $source);
        if ($known !== null) {
            return response()->json(['data' => ['id' => $known->id, 'collection' => $data['collection'], 'skipped' => true]]);
        }

        $media = $record->addMedia($data['file'])
            ->usingFileName($data['file']->getClientOriginalName())
            ->withCustomProperties(array_filter(['legacy_url' => $data['source'] ?? null]))
            ->toMediaCollection($data['collection']);

        // `replaces`: the photo sent before from that source leaves the collection and the new one takes its place in
        // the order (e.g. the edited version of a project photo instead of the original).
        $old = filled($data['replaces'] ?? null) ? $record->getMedia($data['collection'])
            ->first(fn ($item) => $item->id !== $media->id && $item->getCustomProperty('legacy_url') === $data['replaces']) : null;
        if ($old !== null) {
            $media->forceFill(['order_column' => $old->order_column])->save();
            $old->delete();
        }

        return response()->json(['data' => ['id' => $media->id, 'collection' => $data['collection']]], 201);
    }

    /**
     * A photo for a gallery block of a fixed page, saved on the media disk like a panel upload (`pages/`). Without
     * `caption`, the first gallery block; with it, the gallery block with that caption in Portuguese (e.g. "Peças em
     * produção"), created at the end when the page does not have it. The same file name twice is skipped, so a batch
     * can run again.
     */
    private function pageGallery(Request $request): JsonResponse
    {
        $data = $request->validate([
            'key' => ['required', 'string', 'max:60'],
            'collection' => ['required', Rule::in(['gallery'])],
            'caption' => ['nullable', 'string', 'max:120'],
            'caption_en' => ['nullable', 'string', 'max:120'],
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:30720'],
        ]);
        $caption = $data['caption'] ?? null;
        $page = Page::query()->where('key', $data['key'])->firstOrFail();
        $name = Str::slug(pathinfo($data['file']->getClientOriginalName(), PATHINFO_FILENAME)).'.'.Str::lower($data['file']->getClientOriginalExtension());

        $content = array_values((array) ($page->content ?? []));
        $index = collect($content)->search(fn ($block) => ($block['type'] ?? null) === 'gallery'
            && ($caption === null || (($block['data']['caption']['pt'] ?? null) === $caption)));
        if ($index === false) {
            $content[] = ['type' => 'gallery', 'data' => [
                'images' => [],
                'caption' => array_filter(['pt' => $caption, 'en' => $data['caption_en'] ?? null]),
            ]];
            $index = array_key_last($content);
        }
        $images = array_values((array) ($content[$index]['data']['images'] ?? []));
        if (collect($images)->contains(fn ($path) => str_ends_with((string) $path, '-'.$name))) {
            return response()->json(['data' => ['path' => null, 'skipped' => true]]);
        }

        $path = $data['file']->storeAs('pages', Str::lower(Str::random(8)).'-'.$name, 'media');
        $images[] = $path;
        $content[$index]['data']['images'] = $images;
        $page->update(['content' => $content]);

        return response()->json(['data' => ['path' => $path, 'skipped' => false]], 201);
    }

    /**
     * A technical file for download (block 2D/3D, sheet, catalog) of a product, designer or launch, on the private
     * `downloads` disk, published unless `published=0`. A file with the same original name on the same owner is
     * replaced (the old file is deleted), so a batch can run again after the Franccino updates a block.
     */
    public function files(Request $request): JsonResponse
    {
        $data = $request->validate([
            'target' => ['required', Rule::in(array_keys(self::FILE_OWNERS))],
            'key' => ['required', 'string', 'max:200'],
            'type' => ['required', Rule::enum(ProductFileType::class)],
            'title' => ['required', 'string', 'max:160'],
            'title_en' => ['nullable', 'string', 'max:160'],
            'published' => ['nullable', 'boolean'],
            'file' => [
                'required', 'file',
                'max:'.config('franccino.uploads.downloads_max_kb'),
                'extensions:'.implode(',', config('franccino.uploads.downloads_extensions')),
            ],
        ]);
        $owner = self::FILE_OWNERS[$data['target']];
        /** @var Product|Designer|Launch $record */
        $record = $owner['model']::query()->where($owner['key'], $data['key'])->firstOrFail();

        $upload = $data['file'];
        $original = $upload->getClientOriginalName();
        $extension = Str::lower($upload->getClientOriginalExtension());
        $path = $upload->storeAs(Str::plural(Str::kebab(class_basename($record))), Str::random(40).'.'.$extension, 'downloads');

        /** @var ProductFile|null $file */
        $file = $record->files()->where('original_name', $original)->first();
        $attributes = [
            'type' => $data['type'],
            'title' => array_filter(['pt' => $data['title'], 'en' => $data['title_en'] ?? null]),
            'path' => $path,
            'disk' => 'downloads',
            'original_name' => $original,
            'format' => Str::upper($extension),
            'is_published' => (bool) ($data['published'] ?? true),
        ];
        if ($file === null) {
            $file = $record->files()->create($attributes + ['sort_order' => (int) $record->files()->reorder()->max('sort_order') + 1]);
        } else {
            $file->update($attributes);
        }

        return response()->json(['data' => ['id' => $file->id, 'replaced' => ! $file->wasRecentlyCreated, 'size' => $file->size]], $file->wasRecentlyCreated ? 201 : 200);
    }

    /** The home hero banner at a position of the carousel (1-based), published or not, in the panel order. */
    private function bannerAt(int $position): Banner
    {
        abort_if($position < 1, 404);

        return Banner::query()
            ->where('placement', BannerPlacement::HomeHero->value)
            ->ordered()
            ->skip($position - 1)
            ->firstOrFail();
    }

    /** A covers list (`database/data/covers/*.json` format), applied on the queue. */
    public function covers(Request $request): JsonResponse
    {
        $request->validate(['version' => ['required', 'string', 'max:120'], 'covers' => ['required', 'array']]);

        return $this->queueList('franccino:covers:apply', $request->all());
    }

    /** An old-site content list (`database/data/wordpress/*.json` format), applied on the queue. */
    public function content(Request $request): JsonResponse
    {
        $request->validate(['version' => ['required', 'string', 'max:120']]);

        return $this->queueList('franccino:content:apply', $request->all());
    }

    /**
     * A translations list (`database/data/translations/*.json` format: `{locale, items: [{model, field, pt, en}]}`),
     * applied on the queue. Only fills what has no translation yet (`franccino:translations:import`).
     */
    public function translations(Request $request): JsonResponse
    {
        $request->validate(['version' => ['required', 'string', 'max:120'], 'items' => ['required', 'array']]);

        return $this->queueList('franccino:translations:import', $request->all());
    }

    /** @param array<string, mixed> $list */
    private function queueList(string $command, array $list): JsonResponse
    {
        $version = (string) preg_replace('/[^A-Za-z0-9_-]/', '', (string) $list['version']);
        $file = storage_path("app/imports/{$version}.json");
        File::ensureDirectoryExists(dirname($file));
        File::put($file, json_encode($list, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR));
        Artisan::queue($command, ['file' => $file]);

        return response()->json(['data' => ['queued' => $command, 'version' => $version]], 202);
    }
}
