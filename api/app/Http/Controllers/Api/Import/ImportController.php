<?php

namespace App\Http\Controllers\Api\Import;

use App\Enums\BannerPlacement;
use App\Enums\ProductFileType;
use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Client;
use App\Models\Collection;
use App\Models\Designer;
use App\Models\Finish;
use App\Models\FinishGroup;
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
use Illuminate\Support\Facades\DB;
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
        'product' => ['model' => Product::class, 'key' => 'slug->pt', 'collections' => ['cover', 'gallery', 'cutout', 'model_3d']],
        'project' => ['model' => Project::class, 'key' => 'slug->pt', 'collections' => ['cover', 'gallery', 'video', 'video_poster']],
        'designer' => ['model' => Designer::class, 'key' => 'slug', 'collections' => ['portrait', 'signature']],
        'collection' => ['model' => Collection::class, 'key' => 'slug->pt', 'collections' => ['cover', 'gallery', 'video', 'video_poster']],
        'launch' => ['model' => Launch::class, 'key' => 'slug->pt', 'collections' => ['cover', 'gallery']],
        'store' => ['model' => Store::class, 'key' => 'id', 'collections' => ['image']],
        'client' => ['model' => Client::class, 'key' => 'id', 'collections' => ['logo']],
        'scene' => ['model' => Scene::class, 'key' => 'id', 'collections' => ['image']],
        // Banners da home pela posição na ordem do carrossel (1, 2, 3...): a API pública não mostra o id.
        'banner' => ['model' => Banner::class, 'key' => 'position', 'collections' => ['image', 'image_mobile']],
        // Acabamento pelo código (o da cartela da fábrica, ou o que `POST /import/finishes` gravou).
        'finish' => ['model' => Finish::class, 'key' => 'code', 'collections' => ['swatch']],
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
            return $request->input('collection') === 'video' ? $this->pageVideo($request) : $this->pageGallery($request);
        }

        // `video` takes the page film (MP4, up to the page video limit), `model_3d` the product's GLB (the 3D viewer,
        // private disk); every other collection takes a photo.
        $file = match ($request->input('collection')) {
            'video' => ['required', 'file', 'mimetypes:video/mp4', 'max:'.config('franccino.uploads.video_max_kb')],
            'model_3d' => ['required', 'file', 'extensions:glb', 'max:'.config('franccino.uploads.model_3d_max_kb')],
            default => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:30720'],
        };
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
     * Removes photos from one record (e.g. the old-site copies of photos that came again from the Drive): only the
     * given ids that belong to that record and collection; anything else is left alone and reported as not found.
     */
    public function removeMedia(Request $request): JsonResponse
    {
        $data = $request->validate([
            'target' => ['required', Rule::in(array_keys(self::TARGETS))],
            'key' => ['required', 'string', 'max:200'],
            'collection' => ['required', 'string'],
            'ids' => ['required', 'array', 'min:1', 'max:100'],
            'ids.*' => ['integer'],
        ]);
        $target = self::TARGETS[$data['target']];
        abort_unless(in_array($data['collection'], $target['collections'], true), 422, 'Coleção não aceita para esse tipo.');

        /** @var class-string<Model&HasMedia> $class */
        $class = $target['model'];
        $record = $target['key'] === 'position'
            ? $this->bannerAt((int) $data['key'])
            : $class::query()->where($target['key'], $data['key'])->firstOrFail();

        $ids = array_map('intval', $data['ids']);
        $removed = [];
        foreach ($record->getMedia($data['collection']) as $media) {
            if (in_array($media->id, $ids, true)) {
                $media->delete();
                $removed[] = $media->id;
            }
        }

        return response()->json(['data' => [
            'removed' => $removed,
            'not_found' => array_values(array_diff($ids, $removed)),
        ]]);
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
     * A film for a fixed page (e.g. the factory film): a Video block with the MP4 (disk `media`, `videos/`, as the panel
     * stores it), the optional cover and the title. A block with the same title in Portuguese gets the new file; any
     * other video block (e.g. the YouTube one) stays.
     */
    private function pageVideo(Request $request): JsonResponse
    {
        $data = $request->validate([
            'key' => ['required', 'string', 'max:60'],
            'title' => ['required', 'string', 'max:160'],
            'title_en' => ['nullable', 'string', 'max:160'],
            'file' => ['required', 'file', 'mimetypes:video/mp4', 'max:'.config('franccino.uploads.video_max_kb')],
            'poster' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:30720'],
        ]);
        $page = Page::query()->where('key', $data['key'])->firstOrFail();
        $block = ['type' => 'video', 'data' => [
            'file' => $data['file']->storeAs('videos', Str::lower(Str::random(8)).'-'.Str::slug($data['title']).'.mp4', 'media'),
            'poster' => isset($data['poster']) ? $data['poster']->store('pages', 'media') : null,
            'url' => null,
            'title' => array_filter(['pt' => $data['title'], 'en' => $data['title_en'] ?? null]),
        ]];

        $content = array_values((array) ($page->content ?? []));
        $index = collect($content)->search(fn ($item) => ($item['type'] ?? null) === 'video'
            && (($item['data']['title']['pt'] ?? null) === $data['title']));
        if ($index === false) {
            $content[] = $block;
        } else {
            $content[$index] = $block;
        }
        $page->update(['content' => $content]);

        return response()->json(['data' => ['file' => $block['data']['file'], 'replaced' => $index !== false]], 201);
    }

    /**
     * A technical file for download (block 2D/3D, sheet, catalog) of a product, designer or launch, on the private
     * `downloads` disk, published unless `published=0`. A file with the same original name on the same owner is
     * replaced (the old file is deleted), so a batch can run again after the Franccino updates a block.
     */
    /**
     * `POST /api/import/finishes`: cria ou atualiza grupos e acabamentos pelo código e liga cada acabamento às peças
     * da lista (sem tirar as ligações que já existem). A foto da amostra vai depois por `/media` (`target=finish`).
     */
    public function finishes(Request $request): JsonResponse
    {
        $data = $request->validate([
            'groups' => ['required', 'array', 'min:1', 'max:20'],
            'groups.*.name.pt' => ['required', 'string', 'max:120'],
            'groups.*.name.en' => ['nullable', 'string', 'max:120'],
            'groups.*.finishes' => ['required', 'array', 'min:1', 'max:100'],
            'groups.*.finishes.*.code' => ['required', 'string', 'max:60'],
            'groups.*.finishes.*.name.pt' => ['required', 'string', 'max:120'],
            'groups.*.finishes.*.name.en' => ['nullable', 'string', 'max:120'],
            'groups.*.finishes.*.description.pt' => ['nullable', 'string', 'max:2000'],
            'groups.*.finishes.*.description.en' => ['nullable', 'string', 'max:2000'],
            'groups.*.finishes.*.products' => ['sometimes', 'array', 'max:200'],
            'groups.*.finishes.*.products.*' => ['string', 'max:200'],
        ]);

        $finishes = 0;
        $links = 0;
        $missing = [];
        foreach ($data['groups'] as $groupOrder => $groupData) {
            $group = FinishGroup::query()->where('name->pt', $groupData['name']['pt'])->first() ?? new FinishGroup;
            $group->setTranslations('name', array_filter($groupData['name']));
            $group->sort_order ??= $groupOrder;
            $group->save();

            foreach ($groupData['finishes'] as $order => $item) {
                $finish = Finish::query()->firstOrNew(['code' => $item['code']]);
                $finish->group()->associate($group);
                $finish->setTranslations('name', array_filter($item['name']));
                if (filled($item['description'] ?? null)) {
                    $finish->setTranslations('description', array_filter($item['description']));
                }
                $finish->is_published = true;
                $finish->sort_order = $order;
                $finish->save();
                $finishes++;

                foreach ($item['products'] ?? [] as $slug) {
                    $product = Product::query()->where('slug->pt', $slug)->first();
                    if ($product === null) {
                        $missing[] = $slug;

                        continue;
                    }
                    $links += count($product->finishes()->syncWithoutDetaching([$finish->id])['attached']);
                }
            }
        }

        return response()->json(['data' => ['finishes' => $finishes, 'linked' => $links, 'not_found' => array_values(array_unique($missing))]]);
    }

    /**
     * `POST /api/import/image-points` (retorno de 13/11/2026): os pontos clicáveis de cada foto, trocando os que ela
     * tinha. A foto vai pela mídia (`media_id`, o `id` da `Image` na API: banner, capa, galeria) ou por um ambiente
     * que já existe (`scene_id`, ex.: o do projeto). A peça vai pelo slug em pt. Sem nenhum ponto, a foto fica sem
     * pontos (o ambiente da mídia sai).
     */
    public function imagePoints(Request $request): JsonResponse
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1', 'max:300'],
            'items.*.media_id' => ['required_without:items.*.scene_id', 'nullable', 'integer', 'exists:media,id'],
            'items.*.scene_id' => ['required_without:items.*.media_id', 'nullable', 'integer', 'exists:scenes,id'],
            'items.*.title' => ['nullable', 'string', 'max:160'],
            'items.*.points' => ['present', 'array', 'max:40'],
            'items.*.points.*.x' => ['required', 'numeric', 'between:0,100'],
            'items.*.points.*.y' => ['required', 'numeric', 'between:0,100'],
            'items.*.points.*.product' => ['required', 'string', 'max:200'],
        ]);

        $saved = 0;
        $points = 0;
        $removed = 0;
        $missing = [];
        foreach ($data['items'] as $item) {
            DB::transaction(function () use ($item, &$saved, &$points, &$removed, &$missing) {
                $scene = filled($item['scene_id'] ?? null)
                    ? Scene::query()->findOrFail($item['scene_id'])
                    : Scene::query()->firstOrNew(['photo_media_id' => $item['media_id']]);

                $rows = [];
                foreach ($item['points'] as $order => $point) {
                    $product = Product::query()->where('slug->pt', $point['product'])->first();
                    if ($product === null) {
                        $missing[] = $point['product'];

                        continue;
                    }
                    $rows[] = ['product_id' => $product->id, 'x' => $point['x'], 'y' => $point['y'], 'sort_order' => $order];
                }

                if ($rows === [] && $scene->photo_media_id !== null) {
                    if ($scene->exists) {
                        $scene->delete();
                        $removed++;
                    }

                    return;
                }

                if (filled($item['title'] ?? null)) {
                    $scene->setTranslation('title', 'pt', $item['title']);
                } elseif (! $scene->exists) {
                    $scene->setTranslation('title', 'pt', 'Foto '.$item['media_id']);
                }
                if (! $scene->exists) {
                    $scene->is_published = true;
                    $scene->sort_order = 0;
                }
                $scene->save();
                $scene->hotspots()->delete();
                $scene->hotspots()->createMany($rows);
                $saved++;
                $points += count($rows);
            });
        }

        return response()->json(['data' => [
            'scenes' => $saved,
            'points' => $points,
            'removed' => $removed,
            'not_found' => array_values(array_unique($missing)),
        ]]);
    }

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
