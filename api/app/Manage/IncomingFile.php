<?php

namespace App\Manage;

use GuzzleHttp\Psr7\Uri;
use GuzzleHttp\Psr7\UriResolver;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

/**
 * Um arquivo que chega pela API: de um endereço https público (`url`) ou em base64 (`data` + `filename`). O endereço
 * só pode ser https na porta padrão, de um host público (nada de IP interno ou da rede local: proteção contra SSRF),
 * sem seguir redirecionamento para outro lugar e com tempo e tamanho limitados.
 */
final class IncomingFile
{
    /** Tipos aceitos por coleção (os mesmos do painel). */
    public const KINDS = [
        'image' => ['extensions' => ['jpg', 'jpeg', 'png', 'webp'], 'max_kb' => 30720, 'label' => 'imagem JPG, PNG ou WebP'],
        'cutout' => ['extensions' => ['png', 'webp'], 'max_kb' => 30720, 'label' => 'imagem PNG ou WebP (com fundo transparente)'],
        'video' => ['extensions' => ['mp4'], 'max_kb' => null, 'label' => 'vídeo MP4'],
        'glb' => ['extensions' => ['glb'], 'max_kb' => null, 'label' => 'modelo 3D GLB'],
        'download' => ['extensions' => null, 'max_kb' => null, 'label' => 'arquivo técnico'],
        'pdf' => ['extensions' => ['pdf'], 'max_kb' => 20480, 'label' => 'PDF'],
    ];

    /** Base64 até 10 MB (o corpo do pedido tem limite). */
    private const DATA_MAX_BYTES = 10 * 1024 * 1024;

    private function __construct(public readonly string $path, public readonly string $name, public readonly string $extension) {}

    public function __destruct()
    {
        if (is_file($this->path)) {
            @unlink($this->path);
        }
    }

    /** @param  array<string, mixed>  $input */
    public static function from(array $input, string $kind): self
    {
        $url = $input['url'] ?? null;
        $data = $input['data'] ?? null;
        if (! is_string($url) && ! is_string($data)) {
            throw ApiProblem::badRequest('Mande o arquivo em `url` (endereço https público) ou em `data` (base64) com `filename`.');
        }

        $limits = self::limits($kind);
        $file = is_string($data)
            ? self::fromData($data, (string) ($input['filename'] ?? ''), $limits['max_bytes'])
            : self::fromUrl($url, isset($input['filename']) ? (string) $input['filename'] : null, $limits['max_bytes']);

        if ($limits['extensions'] !== null && ! in_array($file->extension, $limits['extensions'], true)) {
            throw ApiProblem::invalid('O arquivo tem de ser '.self::KINDS[$kind]['label'].' (veio .'.$file->extension.').');
        }

        return $file;
    }

    /** @return array{extensions: list<string>|null, max_bytes: int} */
    private static function limits(string $kind): array
    {
        $uploads = (array) config('franccino.uploads');
        $maxKb = match ($kind) {
            'video' => (int) ($uploads['video_max_kb'] ?? 153600),
            'glb' => (int) ($uploads['model_3d_max_kb'] ?? 20480),
            'download' => (int) ($uploads['downloads_max_kb'] ?? 204800),
            default => (int) self::KINDS[$kind]['max_kb'],
        };
        $extensions = $kind === 'download'
            ? array_values((array) ($uploads['downloads_extensions'] ?? []))
            : self::KINDS[$kind]['extensions'];

        return ['extensions' => $extensions, 'max_bytes' => $maxKb * 1024];
    }

    private static function fromData(string $data, string $filename, int $maxBytes): self
    {
        $filename = self::cleanName($filename);
        if ($filename === '' || pathinfo($filename, PATHINFO_EXTENSION) === '') {
            throw ApiProblem::badRequest('Com `data`, mande também o `filename` com a extensão (ex.: capa.webp).');
        }
        if (str_contains($data, ',') && str_starts_with($data, 'data:')) {
            $data = substr($data, strpos($data, ',') + 1);
        }
        $bytes = base64_decode($data, true);
        if ($bytes === false || $bytes === '') {
            throw ApiProblem::badRequest('O `data` não é base64 válido.');
        }
        if (strlen($bytes) > min($maxBytes, self::DATA_MAX_BYTES)) {
            throw ApiProblem::invalid('O arquivo passa do tamanho aceito em base64 (10 MB). Para arquivos maiores, use `url`.');
        }

        return self::store($bytes, $filename);
    }

    private static function fromUrl(string $url, ?string $filename, int $maxBytes): self
    {
        for ($hop = 0; $hop < 3; $hop++) {
            self::assertPublicHttps($url);
            try {
                $response = Http::withOptions([
                    'allow_redirects' => false,
                    'stream' => true,
                    'connect_timeout' => 5,
                    'timeout' => 60,
                ])->withHeaders(['User-Agent' => 'Franccino-API/1.0'])->get($url);
            } catch (Throwable) {
                throw ApiProblem::invalid('Não deu para baixar o arquivo desse endereço.');
            }

            if (in_array($response->status(), [301, 302, 303, 307, 308], true) && $response->header('Location') !== '') {
                $url = (string) UriResolver::resolve(new Uri($url), new Uri($response->header('Location')));

                continue;
            }
            if (! $response->successful()) {
                throw ApiProblem::invalid('O endereço respondeu '.$response->status().'; o arquivo precisa estar público.');
            }

            $body = $response->toPsrResponse()->getBody();
            $bytes = '';
            while (! $body->eof()) {
                $bytes .= $body->read(1024 * 1024);
                if (strlen($bytes) > $maxBytes) {
                    throw ApiProblem::invalid('O arquivo passa do tamanho aceito ('.intdiv($maxBytes, 1024 * 1024).' MB).');
                }
            }
            if ($bytes === '') {
                throw ApiProblem::invalid('O endereço devolveu um arquivo vazio.');
            }

            $name = self::cleanName($filename ?? rawurldecode(basename((string) parse_url($url, PHP_URL_PATH))));
            if (pathinfo($name, PATHINFO_EXTENSION) === '') {
                $name = ($name !== '' ? $name : 'arquivo').'.'.self::extensionFromMime((string) $response->header('Content-Type'));
            }

            return self::store($bytes, $name);
        }

        throw ApiProblem::invalid('O endereço redireciona demais.');
    }

    /** Só https, porta padrão, host com nome e que resolve só para IPs públicos. */
    private static function assertPublicHttps(string $url): void
    {
        $parts = parse_url($url);
        $host = $parts['host'] ?? '';
        if (($parts['scheme'] ?? '') !== 'https' || $host === '' || isset($parts['user']) || isset($parts['pass'])
            || (isset($parts['port']) && (int) $parts['port'] !== 443) || filter_var(trim($host, '[]'), FILTER_VALIDATE_IP)) {
            throw ApiProblem::invalid('O endereço tem de ser https, público e com nome (não um IP).');
        }
        if (app()->runningUnitTests() && str_ends_with($host, '.test')) {
            return;
        }
        $ips = @gethostbynamel($host) ?: [];
        if ($ips === []) {
            throw ApiProblem::invalid('Não achei o endereço '.$host.'.');
        }
        foreach ($ips as $ip) {
            if (! filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                throw ApiProblem::invalid('Esse endereço aponta para a rede interna.');
            }
        }
    }

    private static function store(string $bytes, string $name): self
    {
        $path = tempnam(sys_get_temp_dir(), 'fcc-api-');
        file_put_contents($path, $bytes);

        return new self($path, $name, Str::lower(pathinfo($name, PATHINFO_EXTENSION)));
    }

    private static function cleanName(string $name): string
    {
        $name = trim(str_replace(['/', '\\', "\0"], '-', $name));

        return Str::limit($name, 180, '');
    }

    private static function extensionFromMime(string $mime): string
    {
        return match (strtolower(trim(explode(';', $mime)[0]))) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            'video/mp4' => 'mp4',
            'application/pdf' => 'pdf',
            'model/gltf-binary' => 'glb',
            default => 'bin',
        };
    }
}
