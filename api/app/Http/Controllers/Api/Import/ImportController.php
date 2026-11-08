<?php

namespace App\Http\Controllers\Api\Import;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Product;
use App\Models\Project;
use App\Models\Scene;
use App\Models\Store;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
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
        'project' => ['model' => Project::class, 'key' => 'slug->pt', 'collections' => ['cover', 'gallery']],
        'store' => ['model' => Store::class, 'key' => 'id', 'collections' => ['image']],
        'client' => ['model' => Client::class, 'key' => 'id', 'collections' => ['logo']],
        'scene' => ['model' => Scene::class, 'key' => 'id', 'collections' => ['image']],
    ];

    /** One photo for one record: `cover`, `cutout`, `image` and `logo` replace the current one; `gallery` adds. */
    public function media(Request $request): JsonResponse
    {
        $data = $request->validate([
            'target' => ['required', Rule::in(array_keys(self::TARGETS))],
            'key' => ['required', 'string', 'max:200'],
            'collection' => ['required', 'string'],
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:30720'],
            'source' => ['nullable', 'string', 'max:500'],
        ]);
        $target = self::TARGETS[$data['target']];
        abort_unless(in_array($data['collection'], $target['collections'], true), 422, 'Coleção não aceita para esse tipo.');

        /** @var class-string<Model&HasMedia> $class */
        $class = $target['model'];
        $record = $class::query()->where($target['key'], $data['key'])->firstOrFail();

        $media = $record->addMedia($data['file'])
            ->usingFileName($data['file']->getClientOriginalName())
            ->withCustomProperties(array_filter(['legacy_url' => $data['source'] ?? null]))
            ->toMediaCollection($data['collection']);

        return response()->json(['data' => ['id' => $media->id, 'collection' => $data['collection']]], 201);
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
