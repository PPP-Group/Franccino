<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Jobs\BuildCollectionZip;
use App\Models\Collection as CollectionModel;
use App\Models\DownloadLead;
use App\Models\DownloadLog;
use App\Support\CollectionZip;
use App\Support\ContentLocale;
use App\Support\IpHasher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * `POST /collections/{slug}/download` (`docs/api.md`): todos os arquivos técnicos da coleção num zip, com o mesmo
 * cadastro dos outros downloads. Zip pronto: `201` com o link temporário. Ainda não: `202 { status: "preparing" }` e o
 * zip começa a ser montado na fila; o site pergunta de novo em alguns segundos.
 */
class CollectionDownloadController extends Controller
{
    public function __invoke(string $slug, Request $request): JsonResponse
    {
        $locale = app(ContentLocale::class)->current();
        $collection = CollectionModel::published()->whereLocalizedSlug($slug, $locale)->firstOrFail();

        $lead = DownloadLead::findByToken($request->input('lead_token'));
        if ($lead === null) {
            return response()->json([
                'message' => __('Please fill in your details to download.'),
                'errors' => ['lead_token' => [__('Please fill in your details to download.')]],
            ], 422);
        }

        $files = CollectionZip::files($collection);
        abort_if($files->isEmpty(), 404);

        $path = CollectionZip::path($collection, $files);
        $disk = Storage::disk('downloads');
        if (! $disk->exists($path)) {
            BuildCollectionZip::dispatch($collection->id);

            return response()->json(['data' => ['status' => 'preparing']], 202);
        }

        $expiresAt = now()->addMinutes((int) config('franccino.downloads.link_ttl_minutes'));
        $url = $disk->temporaryUrl($path, $expiresAt, [
            'ResponseContentDisposition' => 'attachment; filename="'.CollectionZip::downloadName($collection).'"',
        ]);

        // "Quem baixou" no painel: uma linha por arquivo do zip, como se cada um fosse baixado.
        foreach ($files as $file) {
            DownloadLog::create([
                'product_file_id' => $file->id,
                'product_id' => $file->product_id,
                'download_lead_id' => $lead->id,
                'locale' => $locale,
                'ip_hash' => IpHasher::hash($request->ip()),
                'user_agent' => Str::limit((string) $request->userAgent(), 512, ''),
                'referer' => Str::limit((string) $request->header('referer'), 512, ''),
            ]);
        }

        return response()->json([
            'data' => ['status' => 'ready', 'url' => $url, 'expires_at' => $expiresAt->toIso8601String()],
        ], 201);
    }
}
