<?php

use App\Filament\Resources;
use App\Manage\Areas;
use App\Manage\Catalog;
use App\Manage\Resources as ManageResources;
use App\Manage\Schema;
use App\Models\Manage\ApiCredential;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Support\Facades\RateLimiter;

use function Pest\Livewire\livewire;

/**
 * "Tudo o que o painel faz, a API faz" (docs/api-gestao.md): cada campo de cada formulário do painel tem par no
 * catálogo, com o mesmo tamanho máximo e a mesma obrigatoriedade; cada tela do painel está na API ou na lista do que
 * fica de fora; e cada recurso se cria pela API com só os campos obrigatórios.
 */

/** Telas do painel que ficam de fora da API de propósito. */
const MANAGE_EXCLUDED_RESOURCES = ['ActivityLogs', 'ConsentRecords', 'Users', 'ContactMessages', 'NewsletterSubscribers', 'QuoteLists', 'DownloadLogs'];

/** Campos do painel que não são dados (só ajudam a tela). */
const MANAGE_PANEL_ONLY_FIELDS = ['point_picker'];

/** Obrigatórios só em parte dos casos: a regra fica no tratamento do recurso (ResourceHandler::validate). */
const MANAGE_CONDITIONAL_REQUIRED = ['redirects.to_path'];

/** @return array<string, array{0: class-string, 1: string}> */
function manageCreatePages(): array
{
    return [
        'products' => [Resources\Products\Pages\CreateProduct::class, 'products'],
        'collections' => [Resources\Collections\Pages\CreateCollection::class, 'collections'],
        'launches' => [Resources\Launches\Pages\CreateLaunch::class, 'launches'],
        'designers' => [Resources\Designers\Pages\CreateDesigner::class, 'designers'],
        'categories' => [Resources\Categories\Pages\CreateCategory::class, 'categories'],
        'lines' => [Resources\Lines\Pages\CreateLine::class, 'lines'],
        'finish-groups' => [Resources\FinishGroups\Pages\CreateFinishGroup::class, 'finish-groups'],
        'finishes' => [Resources\Finishes\Pages\CreateFinish::class, 'finishes'],
        'projects' => [Resources\Projects\Pages\CreateProject::class, 'projects'],
        'scenes' => [Resources\Scenes\Pages\CreateScene::class, 'scenes'],
        'stores' => [Resources\Stores\Pages\CreateStore::class, 'stores'],
        'banners' => [Resources\Banners\Pages\CreateBanner::class, 'banners'],
        'clients' => [Resources\Clients\Pages\CreateClient::class, 'clients'],
        'redirects' => [Resources\Redirects\Pages\CreateRedirect::class, 'redirects'],
    ];
}

it('has every field of every panel form in the catalog, with the same limits', function (string $page, string $key) {
    $this->actingAs(User::factory()->admin()->create());
    $resource = ManageResources::get($key);
    $known = array_merge(
        array_keys($resource['fields']),
        array_keys($resource['relations'] ?? []),
        array_keys($resource['media'] ?? []),
        MANAGE_PANEL_ONLY_FIELDS,
        ['variants', 'products', 'hotspots'],
    );

    $form = livewire($page)->instance()->getSchema('form');
    foreach ($form->getFlatFields(withHidden: true) as $path => $field) {
        // "data.translations-pt.name.pt" → "name"; "data.dimensions.<uuid>.width" → "dimensions".
        $parts = explode('.', preg_replace('/^data\./', '', (string) $path));
        $parts = array_values(array_filter($parts, fn (string $p) => ! preg_match('/^(translations|seo)-(pt|en)$/', $p)));
        $name = $parts[0];

        expect($known)->toContain($name);

        $spec = $resource['fields'][$name] ?? null;
        if ($spec === null || count($parts) > 2 || in_array($spec['kind'], ['objects', 'children', 'json'], true)) {
            continue;
        }
        $rules = collect($field->getValidationRules())->filter(fn ($r) => is_string($r))->all();
        $max = collect($rules)->first(fn (string $r) => str_starts_with($r, 'max:'));
        if ($max !== null && $spec['kind'] !== 'number') {
            expect($spec['max'] ?? null)->toBe((int) substr($max, 4), "{$key}.{$name}: tamanho máximo diferente do painel");
        }
        $locale = $parts[1] ?? 'pt';
        if ($field->isRequired() && $locale === 'pt' && ! in_array("{$key}.{$name}", MANAGE_CONDITIONAL_REQUIRED, true)) {
            expect($spec['required'] ?? false)->toBeTrue("{$key}.{$name}: obrigatório no painel");
        }
    }
})->with(manageCreatePages());

it('has every panel screen in the API or in the list of what stays out', function () {
    $screens = collect(Filament::getPanel('admin')->getResources())
        ->map(fn (string $class) => explode('\\', $class)[3])
        ->unique()
        ->values();
    $covered = collect(ManageResources::all())->map(fn (array $r) => class_basename($r['model']))->values();

    foreach ($screens as $screen) {
        $model = str($screen)->singular()->toString();
        $inApi = $covered->contains($model) || ($screen === 'FinishGroups' && $covered->contains('FinishGroup'));
        expect($inApi || in_array($screen, MANAGE_EXCLUDED_RESOURCES, true))->toBeTrue("A tela {$screen} não está na API nem na lista do que fica de fora");
    }
});

it('gives every field of every tool a type (the Claude refuses fields without one)', function () {
    $missing = [];
    $walk = function (array $schema, string $path) use (&$walk, &$missing): void {
        if (! isset($schema['type'])) {
            $missing[] = $path;
        }
        foreach ((array) ($schema['properties'] ?? []) as $name => $sub) {
            $walk((array) $sub, "{$path}.{$name}");
        }
        if (isset($schema['items'])) {
            $walk((array) $schema['items'], "{$path}[]");
        }
    };
    foreach (Catalog::operations() as $op) {
        $walk($op['input'], $op['id']);
        expect(strlen($op['id']))->toBeLessThanOrEqual(64)
            ->and(preg_match('/^[a-z0-9_]+$/', $op['id']))->toBe(1);
    }

    expect($missing)->toBe([]);
});

it('names every field in portuguese in the error messages, never by its internal name', function (string $key) {
    $resource = ManageResources::get($key);
    $names = Schema::attributes($resource['fields'] + ($resource['relations'] ?? []));

    $rules = array_keys(Schema::rules($resource, null));
    expect(array_diff($rules, array_keys($names)))->toBe([], "{$key}: campo sem nome nas mensagens de erro");
    foreach ($names as $attribute => $name) {
        expect($name)->not->toContain('_', "{$key}.{$attribute}: nome interno na mensagem");
    }
})->with(fn () => array_keys(ManageResources::all()));

it('creates every resource through the API with only the required fields', function (string $key) {
    RateLimiter::clear('manage:all');
    $resource = ManageResources::get($key);
    [, $secret] = ApiCredential::issueKey('Cobertura', Areas::fullScopes(), null, null);

    $payload = [];
    foreach ($resource['fields'] as $name => $spec) {
        if (! ($spec['required'] ?? false) || ($spec['slug'] ?? false)) {
            continue;
        }
        $payload[$name] = match ($spec['kind']) {
            'i18n' => ['pt' => 'Teste '.$name],
            'string' => match ($name) {
                'country' => 'BR',
                'from_path' => '/caminho-antigo',
                default => 'Teste '.$name,
            },
            'enum' => $spec['values'][0],
            'number' => 2026,
            'ref' => $name === 'area_id' ? area('indoor')->id : $spec['model']::factory()->create()->id,
            default => null,
        };
    }
    if ($key === 'redirects') {
        $payload['to_path'] = '/caminho-novo';
    }

    $this->postJson("/api/manage/v1/{$key}", $payload, ['Authorization' => 'Bearer '.$secret])
        ->assertCreated()
        ->assertJsonPath('data.id', fn ($id) => is_int($id));
})->with(fn () => array_keys(array_filter(ManageResources::all(), fn (array $r) => $r['create'] ?? true)));
