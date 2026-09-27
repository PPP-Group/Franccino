<?php

namespace App\Actions;

use App\Models\DownloadLog;
use App\Models\ProductFile;
use App\Support\ContentLocale;
use App\Support\IpHasher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Generates a temporary, signed download URL for a `ProductFile` and logs the
 * download attempt. The caller (`DownloadController::link()`) is responsible
 * for checking that the file and its product are published — see
 * `docs/api.md` (`POST /downloads/{file}/link`).
 */
class CreateDownloadLink
{
    /** @return array{url: string, expires_at: string} */
    public function handle(ProductFile $file, Request $request): array
    {
        $expiresAt = now()->addMinutes((int) config('franccino.downloads.link_ttl_minutes'));

        $url = Storage::disk($file->disk)->temporaryUrl($file->path, $expiresAt);

        DownloadLog::create([
            'product_file_id' => $file->id,
            'product_id' => $file->product_id,
            'locale' => app(ContentLocale::class)->current(),
            'ip_hash' => IpHasher::hash($request->ip()),
            'user_agent' => $this->truncate($request->userAgent()),
            'referer' => $this->truncate($request->header('referer')),
        ]);

        return [
            'url' => $url,
            'expires_at' => $expiresAt->toIso8601String(),
        ];
    }

    private function truncate(?string $value): ?string
    {
        return $value === null ? null : Str::limit($value, 512, '');
    }
}
