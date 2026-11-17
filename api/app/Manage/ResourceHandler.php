<?php

namespace App\Manage;

use App\Enums\ProductFileType;
use App\Filament\RelationManagers\MediaLinksRelationManager;
use App\Models\Designer;
use App\Models\Launch;
use App\Models\Product;
use App\Models\ProductFile;
use App\Support\CoverFromGallery;
use App\Support\ImagePresenter;
use BackedEnum;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * O tratamento genérico dos recursos do catálogo (`Resources`): listar, ler, criar, mudar, apagar, as fotos, os
 * arquivos técnicos e os vídeos e links. Grava pelos mesmos modelos do painel (observadores: atualização do site,
 * registro de atividade, texto de busca) e confere a permissão pela mesma política do painel.
 */
final class ResourceHandler
{
    /** Coleções que servem de miniatura no resumo da lista, na ordem. */
    private const THUMBS = ['cover', 'image', 'logo', 'portrait', 'swatch'];

    /** @var array<string, mixed> */
    private array $resource;

    public function __construct(private readonly string $key, private readonly Context $context)
    {
        $this->resource = Resources::get($key);
    }

    /** @param  array<string, mixed>  $input */
    public function run(string $action, array $input): Result
    {
        return match ($action) {
            'list' => $this->list($input),
            'get' => $this->show($this->find($input)),
            'create' => $this->create($input),
            'update' => $this->update($this->find($input), $input),
            'delete' => $this->delete($this->find($input)),
            'media_add' => $this->mediaAdd($this->find($input), $input),
            'media_remove' => $this->mediaRemove($this->find($input), $input),
            'media_order' => $this->mediaOrder($this->find($input), $input),
            'cover_from_gallery' => $this->coverFromGallery($this->find($input), $input),
            'files_list' => new Result(200, ['data' => $this->files($this->find($input))]),
            'files_add' => $this->filesAdd($this->find($input), $input),
            'files_update' => $this->filesUpdate($this->find($input), $input),
            'files_remove' => $this->filesRemove($this->find($input), $input),
            'links_list' => new Result(200, ['data' => $this->links($this->find($input))]),
            'links_add' => $this->linksAdd($this->find($input), $input),
            'links_update' => $this->linksUpdate($this->find($input), $input),
            'links_remove' => $this->linksRemove($this->find($input), $input),
            default => throw ApiProblem::notFound('A ação '.$action),
        };
    }

    // ---------------------------------------------------------------------------------------------------------------
    // Leitura

    /** @param  array<string, mixed>  $input */
    private function list(array $input): Result
    {
        $this->authorize('viewAny');
        $limit = max(1, min(200, (int) ($input['limit'] ?? 50)));
        $after = $this->decodeCursor($input['cursor'] ?? null);

        $query = $this->query()->orderByDesc('id');
        if (is_subclass_of($this->resource['model'], HasMedia::class)) {
            // Linhas, grupos de acabamentos e redirecionamentos não têm fotos.
            $query->with('media');
        }
        if (array_key_exists('published', $input) && isset($this->resource['fields']['is_published'])) {
            $query->where('is_published', filter_var($input['published'], FILTER_VALIDATE_BOOLEAN));
        }
        foreach ($this->resource['filters'] ?? [] as $field => $spec) {
            if (! array_key_exists($field, $input) || $input[$field] === null) {
                continue;
            }
            if ($field === 'area') {
                $query->whereHas('area', fn ($q) => $q->where('key', $input['area']));
            } else {
                $query->where($field, $input[$field]);
            }
        }

        $q = trim((string) ($input['q'] ?? ''));
        if ($q !== '' && $this->resource['model'] === Product::class) {
            $query->where('search_text', 'like', '%'.Str::of($q)->ascii()->lower()->squish().'%');
            $q = '';
        }

        if ($q === '') {
            if ($after !== null) {
                $query->where('id', '<', $after);
            }
            $rows = $query->limit($limit + 1)->get();
        } else {
            // Tabelas pequenas: a busca sem acento é feita aqui, sobre o título nos dois idiomas.
            $needle = Str::of($q)->ascii()->lower()->squish()->toString();
            $rows = $query->get()
                ->filter(fn (Model $m) => str_contains(Str::of($this->titleText($m))->ascii()->lower()->toString(), $needle))
                ->filter(fn (Model $m) => $after === null || $m->getKey() < $after)
                ->take($limit + 1)
                ->values();
        }

        $more = $rows->count() > $limit;
        $rows = $rows->take($limit);

        return new Result(200, [
            'data' => $rows->map(fn (Model $m) => $this->summary($m))->values()->all(),
            'next_cursor' => $more ? base64_encode((string) $rows->last()?->getKey()) : null,
        ]);
    }

    private function show(Model $record): Result
    {
        $this->authorize('view', $record);
        $data = $this->represent($record);

        return new Result(200, ['data' => $data], ['ETag' => $this->etag($data)]);
    }

    /** @return array<string, mixed> */
    private function summary(Model $record): array
    {
        $title = $this->resource['title'];
        $fields = $this->resource['fields'];

        return array_filter([
            'id' => $record->getKey(),
            'title' => $this->value($record, $title, $fields[$title]),
            'slug' => isset($fields['slug']) ? $this->value($record, 'slug', $fields['slug']) : null,
            'is_published' => isset($fields['is_published']) ? (bool) $record->getAttribute('is_published') : null,
            'thumbnail' => $this->thumbnail($record),
            'updated_at' => $record->getAttribute('updated_at')?->toIso8601String(),
        ], fn ($v) => $v !== null);
    }

    /** @return array<string, mixed> */
    public function represent(Model $record): array
    {
        $record->refresh();
        $data = ['id' => $record->getKey()];
        foreach ($this->resource['fields'] as $name => $spec) {
            $data[$name] = $this->value($record, $name, $spec);
        }
        foreach ($this->resource['relations'] ?? [] as $name => $spec) {
            $data[$name] = $this->relationValue($record, $spec);
        }
        if (! empty($this->resource['media']) && $record instanceof HasMedia) {
            $data['media'] = [];
            foreach ($this->resource['media'] as $collection => $spec) {
                $data['media'][$collection] = $record->getMedia($collection)
                    ->map(fn (Media $m) => $this->mediaItem($m))->values()->all();
            }
        }
        if ($this->resource['files'] ?? false) {
            $data['files'] = $this->files($record);
        }
        if ($this->resource['links'] ?? false) {
            $data['links'] = $this->links($record);
        }
        $data['site_url'] = $this->siteUrl($record);
        $data['created_at'] = $record->getAttribute('created_at')?->toIso8601String();
        $data['updated_at'] = $record->getAttribute('updated_at')?->toIso8601String();

        return $data;
    }

    // ---------------------------------------------------------------------------------------------------------------
    // Gravação

    /** @param  array<string, mixed>  $input */
    private function create(array $input): Result
    {
        $this->authorize('create');
        $input = $this->withSlug($input);
        $this->validate($input, null);

        /** @var class-string<Model> $class */
        $class = $this->resource['model'];
        $record = new $class;
        // Como o painel: os textos por idioma que não vieram começam vazios (as colunas JSON não aceitam nulo).
        $empty = [];
        foreach ($this->resource['fields'] as $name => $spec) {
            if (! array_key_exists($name, $input) && in_array($spec['kind'], ['i18n', 'list', 'objects', 'json'], true)) {
                $empty[$name] = $spec['kind'] === 'i18n' ? '{}' : '[]';
            }
        }
        $record->setRawAttributes($empty + $record->getAttributes());
        $this->fill($record, $input);
        $record->save();
        $this->saveRelations($record, $input);

        $data = $this->represent($record);

        return new Result(201, ['data' => $data], [
            'ETag' => $this->etag($data),
            'Location' => rtrim((string) config('app.url'), '/').'/api/manage/v1/'.$this->key.'/'.$record->getKey(),
        ]);
    }

    /** @param  array<string, mixed>  $input */
    private function update(Model $record, array $input): Result
    {
        $this->authorize('update', $record);
        $this->checkVersion($record);
        unset($input['id']);
        $this->validate($input, $record);

        $this->fill($record, $input);
        $record->save();
        $this->saveRelations($record, $input);
        $record->touch();

        $data = $this->represent($record);

        return new Result(200, ['data' => $data], ['ETag' => $this->etag($data)]);
    }

    private function delete(Model $record): Result
    {
        $this->authorize('delete', $record);
        $this->checkVersion($record);
        $record->delete();

        return new Result(200, ['data' => ['id' => $record->getKey(), 'deleted' => true]]);
    }

    /** @param  array<string, mixed>  $input */
    private function validate(array $input, ?Model $record): void
    {
        $validator = Validator::make($input, Schema::rules($this->resource, $record), [], Schema::attributes(
            $this->resource['fields'] + ($this->resource['relations'] ?? []),
        ));

        if ($this->key === 'redirects') {
            // As mesmas regras do painel: o destino é obrigatório (menos no 410) e não pode ser o próprio caminho.
            $validator->after(function ($v) use ($input, $record): void {
                $current = $record?->getAttribute('status_code');
                $status = (int) ($input['status_code'] ?? ($current instanceof BackedEnum ? $current->value : $current) ?? 301);
                $from = $input['from_path'] ?? $record?->getAttribute('from_path');
                $to = array_key_exists('to_path', $input) ? $input['to_path'] : $record?->getAttribute('to_path');
                if ($status !== 410 && blank($to)) {
                    $v->errors()->add('to_path', 'O destino é obrigatório (menos no 410).');
                }
                if ($status !== 410 && filled($to) && $to === $from) {
                    $v->errors()->add('to_path', 'O destino tem de ser diferente do caminho antigo.');
                }
            });
        }

        try {
            $validator->validate();
        } catch (ValidationException $e) {
            throw ApiProblem::invalid('Os dados não passaram nas regras do painel: '.collect($e->errors())->flatten()->first(), $e->errors());
        }
    }

    /**
     * O endereço sai do nome quando falta na criação, como no painel.
     *
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    private function withSlug(array $input): array
    {
        $slug = $this->resource['fields']['slug'] ?? null;
        if ($slug === null || array_key_exists('slug', $input)) {
            return $input;
        }
        $source = $input[$this->resource['title']] ?? null;
        if ($slug['kind'] === 'i18n' && is_array($source)) {
            $input['slug'] = array_filter(array_map(fn ($v) => is_string($v) && $v !== '' ? Str::slug($v) : null, $source));
        } elseif (is_string($source)) {
            $input['slug'] = Str::slug($source);
        }

        return $input;
    }

    /** @param  array<string, mixed>  $input */
    private function fill(Model $record, array $input): void
    {
        foreach ($this->resource['fields'] as $name => $spec) {
            if (! array_key_exists($name, $input)) {
                continue;
            }
            $value = $input[$name];
            if ($spec['kind'] === 'i18n') {
                if (! method_exists($record, 'setTranslation') || ! method_exists($record, 'forgetTranslation')) {
                    continue;
                }
                foreach ((array) $value as $locale => $text) {
                    if ($text === null || $text === '') {
                        $record->forgetTranslation($name, (string) $locale);
                    } else {
                        $record->setTranslation($name, (string) $locale, is_string($text) ? trim($text) : $text);
                    }
                }

                continue;
            }
            if ($value === null && in_array($spec['kind'], ['list', 'objects', 'json'], true)) {
                $value = [];
            }
            if (is_string($value)) {
                $value = trim($value);
                if ($value === '' && $spec['kind'] !== 'string') {
                    $value = null;
                }
            }
            $record->setAttribute($name, $value);
        }
    }

    /** @param  array<string, mixed>  $input */
    private function saveRelations(Model $record, array $input): void
    {
        foreach ($this->resource['relations'] ?? [] as $name => $spec) {
            if (! array_key_exists($name, $input)) {
                continue;
            }
            $value = array_values((array) $input[$name]);

            if (($spec['sync'] ?? null) === 'colors' && $record instanceof Product) {
                $record->syncColors($value);

                continue;
            }

            if ($spec['kind'] === 'children') {
                $relation = $record->{$spec['relation']}();
                $relation->delete();
                foreach ($value as $index => $child) {
                    $relation->create(array_intersect_key((array) $child, $spec['fields']) + [$spec['order'] => $index + 1]);
                }

                continue;
            }

            /** @var BelongsToMany<Model, Model> $relation */
            $relation = $record->{$spec['relation']}();
            if ($spec['ordered'] ?? false) {
                $relation->sync(collect($value)->mapWithKeys(fn ($id, $index) => [(int) $id => ['sort_order' => $index + 1]])->all());
            } else {
                $relation->sync(array_map('intval', $value));
            }
        }
    }

    // ---------------------------------------------------------------------------------------------------------------
    // Fotos

    /** @param  array<string, mixed>  $input */
    private function mediaAdd(Model $record, array $input): Result
    {
        $this->authorize('update', $record);
        $collection = (string) $input['collection'];
        $spec = $this->resource['media'][$collection] ?? throw ApiProblem::badRequest('Coleção desconhecida: '.$collection.'.');
        $file = IncomingFile::from($input, $spec['kind']);

        /** @var HasMedia&Model $record */
        $media = $record->addMedia($file->path)
            ->preservingOriginal()
            ->usingFileName($file->name)
            ->usingName(pathinfo($file->name, PATHINFO_FILENAME))
            ->toMediaCollection($collection);
        $record->touch();

        $body = ['data' => ['media' => $this->mediaItem($media), 'collection' => $collection]];
        if ($collection === 'cover' && $record->hasMedia('cutout')) {
            $body['aviso'] = 'A capa mudou e a peça tem foto sem fundo (cutout) feita da capa antiga: ela também precisa ser trocada.';
        }

        return new Result(201, $body);
    }

    /** @param  array<string, mixed>  $input */
    private function mediaRemove(Model $record, array $input): Result
    {
        $this->authorize('update', $record);
        $media = $this->ownMedia($record, (int) $input['media_id']);
        $media->delete();
        $record->touch();

        return new Result(200, ['data' => ['media_id' => $media->id, 'deleted' => true]]);
    }

    /** @param  array<string, mixed>  $input */
    private function mediaOrder(Model $record, array $input): Result
    {
        $this->authorize('update', $record);
        /** @var HasMedia&Model $record */
        $current = $record->getMedia((string) $input['collection'])->pluck('id')->map(fn ($id) => (int) $id)->sort()->values()->all();
        $wanted = array_map('intval', (array) $input['media_ids']);
        $sorted = $wanted;
        sort($sorted);
        if ($sorted !== $current) {
            throw ApiProblem::invalid('Mande todos os ids das fotos da coleção, cada um uma vez (a coleção tem: '.implode(', ', $current).').');
        }
        Media::setNewOrder($wanted);
        $record->touch();

        return new Result(200, ['data' => ['collection' => $input['collection'], 'media_ids' => $wanted]]);
    }

    /** @param  array<string, mixed>  $input */
    private function coverFromGallery(Model $record, array $input): Result
    {
        $this->authorize('update', $record);
        /** @var HasMedia&Model $record */
        $media = Media::query()->find((int) $input['media_id']);
        if ($media === null || ! CoverFromGallery::belongs($record, $media)) {
            throw ApiProblem::invalid('A foto '.$input['media_id'].' não está na galeria deste registro.');
        }
        $cover = CoverFromGallery::apply($record, $media);
        $record->touch();

        $body = ['data' => ['cover' => $this->mediaItem($cover)]];
        if ($record->hasMedia('cutout')) {
            $body['aviso'] = 'A peça tem foto sem fundo (cutout) feita da capa antiga: ela também precisa ser trocada.';
        }

        return new Result(200, $body);
    }

    private function ownMedia(Model $record, int $id): Media
    {
        $media = Media::query()->find($id);
        if ($media === null || $media->model_type !== $record->getMorphClass() || (int) $media->model_id !== (int) $record->getKey()
            || ! array_key_exists($media->collection_name, $this->resource['media'] ?? [])) {
            throw ApiProblem::notFound('A foto '.$id.' deste registro');
        }

        return $media;
    }

    /** @return array<string, mixed> */
    private function mediaItem(Media $media): array
    {
        $public = $media->disk !== 'downloads';

        return [
            'id' => $media->id,
            'collection' => $media->collection_name,
            'file_name' => $media->file_name,
            'mime_type' => $media->mime_type,
            'size' => $media->size,
            'order' => $media->order_column,
            'url' => $public ? $media->getUrl() : null,
        ];
    }

    // ---------------------------------------------------------------------------------------------------------------
    // Arquivos técnicos

    /** @return list<array<string, mixed>> */
    private function files(Model $record): array
    {
        return $this->fileOwner($record)->files()->orderBy('sort_order')->get()->map(fn (ProductFile $f) => [
            'id' => $f->id,
            'type' => $f->type->value,
            'title' => $this->translations($f, 'title'),
            'format' => $f->format,
            'original_name' => $f->original_name,
            'size' => $f->size,
            'is_published' => (bool) $f->is_published,
        ])->values()->all();
    }

    /** @param  array<string, mixed>  $input */
    private function filesAdd(Model $record, array $input): Result
    {
        $this->authorize('update', $record);
        $this->validateMeta($input, [
            'type' => ['required', 'in:'.implode(',', array_column(ProductFileType::cases(), 'value'))],
            'title' => ['required', 'array:pt,en'],
            'title.pt' => ['required', 'string', 'max:160'],
            'title.en' => ['nullable', 'string', 'max:160'],
            'format' => ['nullable', 'string', 'max:20'],
            'is_published' => ['sometimes', 'boolean'],
        ]);
        $file = IncomingFile::from($input, 'download');
        $directory = Str::plural(Str::kebab(class_basename($record)));
        $path = Storage::disk('downloads')->putFileAs($directory, $file->path, Str::random(40).'.'.$file->extension);

        $model = new ProductFile;
        $model->forceFill([
            'type' => $input['type'],
            'format' => $input['format'] ?? Str::upper($file->extension),
            'disk' => 'downloads',
            'path' => $path,
            'original_name' => $file->name,
            'is_published' => (bool) ($input['is_published'] ?? false),
            'sort_order' => ((int) $this->fileOwner($record)->files()->max('sort_order')) + 1,
        ]);
        foreach ((array) $input['title'] as $locale => $text) {
            if (filled($text)) {
                $model->setTranslation('title', $locale, trim((string) $text));
            }
        }
        $this->fileOwner($record)->files()->save($model);
        $record->touch();

        return new Result(201, ['data' => collect($this->files($record))->firstWhere('id', $model->id)]);
    }

    /** @param  array<string, mixed>  $input */
    private function filesUpdate(Model $record, array $input): Result
    {
        $this->authorize('update', $record);
        $file = $this->fileOwner($record)->files()->find((int) $input['file_id']) ?? throw ApiProblem::notFound('O arquivo '.$input['file_id'].' deste registro');
        $this->validateMeta($input, [
            'type' => ['sometimes', 'in:'.implode(',', array_column(ProductFileType::cases(), 'value'))],
            'title' => ['sometimes', 'array:pt,en'],
            'title.pt' => ['sometimes', 'filled', 'string', 'max:160'],
            'title.en' => ['nullable', 'string', 'max:160'],
            'format' => ['sometimes', 'nullable', 'string', 'max:20'],
            'is_published' => ['sometimes', 'boolean'],
        ]);
        foreach (['type', 'format', 'is_published'] as $field) {
            if (array_key_exists($field, $input)) {
                $file->setAttribute($field, $input[$field]);
            }
        }
        foreach ((array) ($input['title'] ?? []) as $locale => $text) {
            filled($text) ? $file->setTranslation('title', $locale, trim((string) $text)) : $file->forgetTranslation('title', $locale);
        }
        $file->save();
        $record->touch();

        return new Result(200, ['data' => collect($this->files($record))->firstWhere('id', $file->id)]);
    }

    /** @param  array<string, mixed>  $input */
    private function filesRemove(Model $record, array $input): Result
    {
        $this->authorize('update', $record);
        $file = $this->fileOwner($record)->files()->find((int) $input['file_id']) ?? throw ApiProblem::notFound('O arquivo '.$input['file_id'].' deste registro');
        $file->delete();
        $record->touch();

        return new Result(200, ['data' => ['file_id' => (int) $input['file_id'], 'deleted' => true]]);
    }

    // ---------------------------------------------------------------------------------------------------------------
    // Vídeos e links

    /** @return list<array<string, mixed>> */
    private function links(Model $record): array
    {
        return $this->linkOwner($record)->mediaLinks()->orderBy('sort_order')->get()->map(fn (Model $l) => [
            'id' => $l->getKey(),
            'kind' => $l->getAttribute('kind'),
            'title' => $this->translations($l, 'title'),
            'url' => $l->getAttribute('url'),
        ])->values()->all();
    }

    /** @param  array<string, mixed>  $input */
    private function linksAdd(Model $record, array $input): Result
    {
        $this->authorize('update', $record);
        $this->validateMeta($input, $this->linkRules(true));
        if ($record instanceof Product && $this->linkOwner($record)->mediaLinks()->count() >= MediaLinksRelationManager::PRODUCT_LIMIT) {
            throw ApiProblem::invalid('A peça já tem '.MediaLinksRelationManager::PRODUCT_LIMIT.' vídeos ou links, o máximo do painel.');
        }
        $link = $this->linkOwner($record)->mediaLinks()->make(['kind' => $input['kind'], 'url' => trim((string) $input['url'])]);
        foreach ((array) $input['title'] as $locale => $text) {
            if (filled($text)) {
                $link->setTranslation('title', $locale, trim((string) $text));
            }
        }
        $link->setAttribute('sort_order', ((int) $this->linkOwner($record)->mediaLinks()->max('sort_order')) + 1);
        $link->save();
        $record->touch();

        return new Result(201, ['data' => collect($this->links($record))->firstWhere('id', $link->getKey())]);
    }

    /** @param  array<string, mixed>  $input */
    private function linksUpdate(Model $record, array $input): Result
    {
        $this->authorize('update', $record);
        $link = $this->linkOwner($record)->mediaLinks()->find((int) $input['link_id']) ?? throw ApiProblem::notFound('O vídeo ou link '.$input['link_id'].' deste registro');
        $this->validateMeta($input, $this->linkRules(false));
        foreach (['kind', 'url'] as $field) {
            if (array_key_exists($field, $input)) {
                $link->setAttribute($field, trim((string) $input[$field]));
            }
        }
        foreach ((array) ($input['title'] ?? []) as $locale => $text) {
            filled($text) ? $link->setTranslation('title', $locale, trim((string) $text)) : $link->forgetTranslation('title', $locale);
        }
        $link->save();
        $record->touch();

        return new Result(200, ['data' => collect($this->links($record))->firstWhere('id', $link->getKey())]);
    }

    /** @param  array<string, mixed>  $input */
    private function linksRemove(Model $record, array $input): Result
    {
        $this->authorize('update', $record);
        $link = $this->linkOwner($record)->mediaLinks()->find((int) $input['link_id']) ?? throw ApiProblem::notFound('O vídeo ou link '.$input['link_id'].' deste registro');
        $link->delete();
        $record->touch();

        return new Result(200, ['data' => ['link_id' => (int) $input['link_id'], 'deleted' => true]]);
    }

    /** @return array<string, mixed> */
    private function linkRules(bool $creating): array
    {
        $presence = $creating ? 'required' : 'sometimes';

        return [
            'kind' => [$presence, 'in:video,link'],
            'title' => [$presence, 'array:pt,en'],
            'title.pt' => [$creating ? 'required' : 'sometimes', 'filled', 'string', 'max:160'],
            'title.en' => ['nullable', 'string', 'max:160'],
            'url' => [$presence, 'url', 'max:512'],
        ];
    }

    // ---------------------------------------------------------------------------------------------------------------
    // Apoio

    /**
     * @param  array<string, mixed>  $input
     * @param  array<string, mixed>  $rules
     */
    private function validateMeta(array $input, array $rules): void
    {
        try {
            Validator::make($input, $rules, [], Schema::metaAttributes())->validate();
        } catch (ValidationException $e) {
            throw ApiProblem::invalid('Os dados não passaram nas regras do painel: '.collect($e->errors())->flatten()->first(), $e->errors());
        }
    }

    /** @return Builder<Model> */
    private function query(): Builder
    {
        /** @var class-string<Model> $class */
        $class = $this->resource['model'];

        return $class::query();
    }

    /** @param  array<string, mixed>  $input */
    private function find(array $input): Model
    {
        $id = $input['id'] ?? null;
        $record = is_numeric($id) ? $this->query()->find((int) $id) : null;

        return $record ?? throw ApiProblem::notFound(Str::ucfirst($this->resource['label']).' '.($id ?? ''));
    }

    private function authorize(string $ability, ?Model $record = null): void
    {
        $allowed = Gate::forUser($this->context->user)->allows($ability, $record ?? $this->resource['model']);
        if (! $allowed) {
            throw new ApiProblem(403, 'sem_permissao', 'Não permitido', 'O painel não deixa '.match ($ability) {
                'create' => 'criar',
                'delete' => 'apagar',
                'update' => 'mudar',
                default => 'ver',
            }.' '.$this->resource['plural'].'.');
        }
    }

    /** If-Match com a versão vencida dá 412: outra pessoa mudou o registro depois da leitura. */
    private function checkVersion(Model $record): void
    {
        $ifMatch = $this->context->ifMatch;
        if ($ifMatch === null || $ifMatch === '' || $ifMatch === '*') {
            return;
        }
        $current = $this->etag($this->represent($record));
        if (trim($ifMatch) !== $current) {
            throw new ApiProblem(412, 'versao', 'Versão vencida',
                'O registro mudou depois da sua leitura. Leia de novo e refaça a mudança.', ['etag_atual' => $current]);
        }
    }

    /** @param  array<string, mixed>  $data */
    private function etag(array $data): string
    {
        return '"'.substr(hash('sha256', (string) json_encode($data)), 0, 32).'"';
    }

    /** @param  array<string, mixed>  $spec */
    private function value(Model $record, string $name, array $spec): mixed
    {
        if ($spec['kind'] === 'i18n') {
            return $this->translations($record, $name);
        }
        $value = $record->getAttribute($name);

        return match (true) {
            $value instanceof BackedEnum => $value->value,
            $value instanceof CarbonInterface => $value->toIso8601String(),
            default => $value,
        };
    }

    /** @return array<string, string|null> */
    private function translations(Model $record, string $name): array
    {
        $out = [];
        foreach (Schema::LOCALES as $locale) {
            $text = method_exists($record, 'getTranslation') ? $record->getTranslation($name, $locale, false) : null;
            $out[$locale] = $text === '' ? null : $text;
        }

        return $out;
    }

    /** @param  array<string, mixed>  $spec */
    private function relationValue(Model $record, array $spec): mixed
    {
        if (($spec['sync'] ?? null) === 'colors' && $record instanceof Product) {
            return $record->color_group === null ? [] : $record->colors()->whereKeyNot($record->getKey())->pluck('id')->map(fn ($id) => (int) $id)->values()->all();
        }
        if ($spec['kind'] === 'children') {
            return $record->{$spec['relation']}()->orderBy($spec['order'])->get()
                ->map(fn (Model $child) => array_intersect_key($child->toArray(), $spec['fields']))->values()->all();
        }
        $relation = $record->{$spec['relation']}();

        return $relation->pluck($relation->getRelated()->getTable().'.id')->map(fn ($id) => (int) $id)->values()->all();
    }

    private function titleText(Model $record): string
    {
        $title = $this->resource['title'];
        $value = $this->value($record, $title, $this->resource['fields'][$title]);

        return is_array($value) ? implode(' ', array_filter($value)) : (string) $value;
    }

    private function thumbnail(Model $record): ?string
    {
        if (! $record instanceof HasMedia) {
            return null;
        }
        foreach (self::THUMBS as $collection) {
            $media = $record->getFirstMedia($collection);
            if ($media !== null) {
                return ImagePresenter::present($media, '')['src'] ?? $media->getUrl();
            }
        }

        return null;
    }

    /** Endereço da página no site, quando o registro tem uma. */
    private function siteUrl(Model $record): ?string
    {
        $base = rtrim((string) config('franccino.frontend.url'), '/').'/pt/';
        $slug = fn () => method_exists($record, 'isTranslatableAttribute') && method_exists($record, 'getTranslation') && $record->isTranslatableAttribute('slug')
            ? $record->getTranslation('slug', 'pt', false)
            : $record->getAttribute('slug');

        return match ($this->key) {
            'products' => $base.'produtos/'.$slug(),
            'collections' => $base.'colecoes/'.$slug(),
            'launches' => $base.'lancamentos/'.$slug(),
            'designers' => $base.'designers/'.$slug(),
            'projects' => $base.'corporativo/'.$slug(),
            default => null,
        };
    }

    /** Quem tem arquivos técnicos: peça, designer ou lançamento. */
    private function fileOwner(Model $record): Product|Designer|Launch
    {
        return $record instanceof Product || $record instanceof Designer || $record instanceof Launch
            ? $record
            : throw ApiProblem::notFound('Arquivos técnicos neste registro');
    }

    /** Quem tem vídeos e links: peça, designer ou lançamento. */
    private function linkOwner(Model $record): Product|Designer|Launch
    {
        return $this->fileOwner($record);
    }

    private function decodeCursor(mixed $cursor): ?int
    {
        if (! is_string($cursor) || $cursor === '') {
            return null;
        }
        $id = base64_decode($cursor, true);
        if ($id === false || ! ctype_digit($id)) {
            throw ApiProblem::badRequest('O `cursor` não é válido: use o `next_cursor` da página anterior.');
        }

        return (int) $id;
    }
}
