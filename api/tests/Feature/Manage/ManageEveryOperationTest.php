<?php

use App\Manage\Areas;
use App\Manage\Catalog;
use App\Manage\Resources as ManageResources;
use App\Models\Manage\ApiCredential;
use App\Models\Page;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;

/**
 * Cada operação do catálogo, chamada de verdade pelo conector (MCP), em cada tela do painel: criar, listar, buscar,
 * abrir, mudar, fotos (pôr, ordenar, virar capa, tirar), arquivos, vídeos e links, apagar. O teste reprova se uma
 * operação do catálogo ficar sem chamada aqui (docs/api-gestao.md).
 */
beforeEach(function () {
    Storage::fake('media');
    Storage::fake('downloads');
    RateLimiter::clear('manage:all');
});

it('runs every operation of the catalog through the connector without an error', function () {
    [, $key] = ApiCredential::issueKey('Bateria', Areas::fullScopes(), null, null);
    $called = [];
    $png = base64_encode((string) file_get_contents(base_path('tests/fixtures/pixel.png')));

    $call = function (string $tool, array $arguments = []) use ($key, &$called): array {
        $called[$tool] = true;
        RateLimiter::clear('manage:all');
        foreach (ApiCredential::query()->pluck('id') as $id) {
            RateLimiter::clear('manage:min:'.$id);
            RateLimiter::clear('manage:write:'.$id);
        }
        $response = test()->postJson('/mcp', [
            'jsonrpc' => '2.0', 'id' => 1, 'method' => 'tools/call',
            'params' => ['name' => $tool, 'arguments' => (object) $arguments],
        ], ['Authorization' => 'Bearer '.$key]);
        $response->assertOk();
        expect($response->json('error'))->toBeNull("{$tool}: erro de protocolo")
            ->and($response->json('result.isError'))->not->toBeTrue("{$tool}: ".$response->json('result.content.0.text'));

        return (array) $response->json('result.structuredContent');
    };

    $call('me');
    $settings = $call('settings_get')['data'];
    $call('settings_update', ['instagram_url' => 'https://www.instagram.com/teste/']);
    $call('settings_update', ['instagram_url' => $settings['instagram_url']]);
    foreach (['contact_messages_list', 'newsletter_list', 'quote_lists_list', 'downloads_list'] as $inbox) {
        $call($inbox, ['limit' => 5]);
    }

    $page = Page::factory()->create();
    $path = $call('pages_image_upload', ['id' => $page->id, 'data' => $png, 'filename' => 'bloco.png'])['data']['path'];
    expect($path)->toBeString();

    foreach (ManageResources::all() as $key => $resource) {
        $name = str_replace('-', '_', $key);
        $ops = collect(Catalog::operations())->pluck('id')->filter(fn (string $id) => str_starts_with($id, $name.'_'))->flip();

        // Criar (só com os obrigatórios) ou usar um que já existe.
        if ($ops->has("{$name}_create")) {
            $payload = [];
            foreach ($resource['fields'] as $field => $spec) {
                if (! ($spec['required'] ?? false) || ($spec['slug'] ?? false)) {
                    continue;
                }
                $payload[$field] = match ($spec['kind']) {
                    'i18n' => ['pt' => 'Teste '.$field],
                    'string' => match ($field) {
                        'country' => 'BR',
                        'from_path' => '/caminho-antigo',
                        default => 'Teste '.$field,
                    },
                    'enum' => $spec['values'][0],
                    'number' => 2026,
                    'ref' => $field === 'area_id' ? area('indoor')->id : $spec['model']::factory()->create()->id,
                    default => null,
                };
            }
            if ($key === 'redirects') {
                $payload['to_path'] = '/caminho-novo';
            }
            $id = $call("{$name}_create", $payload)['data']['id'];
        } else {
            $id = match ($key) {
                'areas' => area('indoor')->id,
                'pages' => $page->id,
            };
        }

        // Listar, buscar, a página seguinte e abrir.
        $call("{$name}_list", ['limit' => 1]);
        $call("{$name}_list", ['q' => 'teste']);
        $record = $call("{$name}_get", ['id' => $id])['data'];
        expect($record['id'])->toBe($id);

        // Mudar um campo de texto (um opcional; sem nenhum, o obrigatório).
        $hasOptional = collect($resource['fields'])->contains(fn (array $spec) => in_array($spec['kind'], ['string', 'i18n'], true)
            && ! ($spec['required'] ?? false) && ! ($spec['slug'] ?? false) && ! isset($spec['format']) && ! ($spec['unique'] ?? false));
        foreach ($resource['fields'] as $field => $spec) {
            $plain = (! ($spec['required'] ?? false) || ! $hasOptional) && ! ($spec['slug'] ?? false) && ! isset($spec['format']) && ! ($spec['unique'] ?? false);
            if ($plain && $spec['kind'] === 'string') {
                expect($call("{$name}_update", ['id' => $id, $field => 'Mudado'])['data'][$field])->toBe('Mudado');
                break;
            }
            if ($plain && $spec['kind'] === 'i18n') {
                expect($call("{$name}_update", ['id' => $id, $field => ['pt' => 'Mudado']])['data'][$field]['pt'])->toBe('Mudado');
                break;
            }
        }

        // Fotos: pôr em cada coleção de imagem, ordenar a galeria, virar capa e tirar.
        $added = [];
        foreach ($resource['media'] ?? [] as $collection => $spec) {
            if (! in_array($spec['kind'], ['image', 'cutout'], true)) {
                continue;
            }
            $times = $spec['single'] ? 1 : 2;
            for ($i = 0; $i < $times; $i++) {
                $added[$collection][] = $call("{$name}_media_add", [
                    'id' => $id, 'collection' => $collection, 'data' => $png, 'filename' => "{$collection}-{$i}.png",
                ])['data']['media']['id'];
            }
        }
        if (isset($added['gallery'])) {
            $call("{$name}_media_order", ['id' => $id, 'collection' => 'gallery', 'media_ids' => array_reverse($added['gallery'])]);
            if ($ops->has("{$name}_cover_from_gallery")) {
                $call("{$name}_cover_from_gallery", ['id' => $id, 'media_id' => $added['gallery'][0]]);
            }
        }
        $media = $call("{$name}_get", ['id' => $id])['data']['media'] ?? [];
        foreach ($media as $items) {
            foreach ($items as $item) {
                $call("{$name}_media_remove", ['id' => $id, 'media_id' => $item['id']]);
            }
        }

        // Arquivos para baixar.
        if ($ops->has("{$name}_files_add")) {
            $file = $call("{$name}_files_add", [
                'id' => $id, 'type' => 'technical_sheet', 'title' => ['pt' => 'Ficha'],
                'data' => base64_encode("%PDF-1.4\n%%EOF\n"), 'filename' => 'ficha.pdf',
            ])['data']['id'];
            $call("{$name}_files_list", ['id' => $id]);
            $call("{$name}_files_update", ['id' => $id, 'file_id' => $file, 'title' => ['pt' => 'Ficha nova'], 'is_published' => false]);
            $call("{$name}_files_remove", ['id' => $id, 'file_id' => $file]);
        }

        // Vídeos e links.
        if ($ops->has("{$name}_links_add")) {
            $link = $call("{$name}_links_add", [
                'id' => $id, 'kind' => 'video', 'title' => ['pt' => 'Vídeo'], 'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            ])['data']['id'];
            $call("{$name}_links_list", ['id' => $id]);
            $call("{$name}_links_update", ['id' => $id, 'link_id' => $link, 'kind' => 'link', 'url' => 'https://www.franccino.com.br/']);
            $call("{$name}_links_remove", ['id' => $id, 'link_id' => $link]);
        }

        if ($ops->has("{$name}_delete")) {
            $call("{$name}_delete", ['id' => $id]);
        }
    }

    $missing = collect(Catalog::operations())->pluck('id')->reject(fn (string $id) => isset($called[$id]))->values()->all();
    expect($missing)->toBe([]);
});
