<?php

namespace App\Manage;

use App\Models\ContactMessage;
use App\Models\DownloadLog;
use App\Models\NewsletterSubscriber;
use App\Models\Page;
use App\Models\QuoteList;
use App\Settings\GeneralSettings;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/** As operações que não são de um recurso: a credencial, as configurações, as imagens das páginas e a caixa de entrada. */
final class Specials
{
    /** @param  array<string, mixed>  $input */
    public static function run(string $name, array $input, Context $context): Result
    {
        return match ($name) {
            'me' => self::me($context),
            'settings_get' => self::settingsGet($context),
            'settings_update' => self::settingsUpdate($input, $context),
            'pages_image_upload' => self::pageImage($input, $context),
            'inbox_contact' => self::inbox(ContactMessage::query()->with('product'), $input, $context, fn (ContactMessage $m) => [
                'id' => $m->id,
                'type' => $m->type->value,
                'name' => $m->name,
                'email' => $m->email,
                'phone' => $m->phone,
                'company' => $m->company,
                'profession' => $m->profession?->value,
                'city' => $m->city,
                'state' => $m->state,
                'message' => $m->message,
                'product' => $m->product ? ['id' => $m->product->id, 'name' => $m->product->getTranslation('name', 'pt', false)] : null,
                'items' => $m->items,
                'locale' => $m->locale,
                'read_at' => $m->read_at?->toIso8601String(),
                'created_at' => $m->created_at->toIso8601String(),
            ]),
            'inbox_quote_lists' => self::inbox(QuoteList::query(), $input, $context, fn (QuoteList $l) => [
                'id' => $l->id,
                'code' => $l->code,
                'items' => $l->items,
                'locale' => $l->locale,
                'contact_message_id' => $l->contact_message_id,
                'site_url' => $l->siteUrl(),
                'expires_at' => $l->expires_at->toIso8601String(),
                'created_at' => $l->created_at->toIso8601String(),
            ]),
            'inbox_newsletter' => self::inbox(NewsletterSubscriber::query(), $input, $context, fn (NewsletterSubscriber $s) => [
                'id' => $s->id,
                'email' => $s->email,
                'name' => $s->name,
                'locale' => $s->locale,
                'source' => $s->source,
                'unsubscribed_at' => $s->unsubscribed_at?->toIso8601String(),
                'created_at' => $s->created_at->toIso8601String(),
            ]),
            'inbox_downloads' => self::inbox(DownloadLog::query()->with(['productFile', 'product']), $input, $context, fn (DownloadLog $d) => [
                'id' => $d->id,
                'product' => $d->product ? ['id' => $d->product->id, 'name' => $d->product->getTranslation('name', 'pt', false)] : null,
                'file' => $d->productFile ? ['id' => $d->productFile->id, 'title' => $d->productFile->getTranslation('title', 'pt', false), 'format' => $d->productFile->format] : null,
                'locale' => $d->locale,
                'created_at' => $d->created_at->toIso8601String(),
            ]),
            default => throw ApiProblem::notFound('A operação '.$name),
        };
    }

    private static function me(Context $context): Result
    {
        $credential = $context->credential;

        return new Result(200, ['data' => [
            'name' => $credential->name,
            'kind' => $credential->kind === 'key' ? 'chave' : 'conexão',
            'scopes' => $credential->scopes,
            'permissions' => array_map(fn (string $s) => Areas::describe($s), $credential->scopes),
            'expires_at' => $credential->expires_at?->toIso8601String(),
            'site' => (string) config('franccino.frontend.url'),
            'docs' => rtrim((string) config('app.url'), '/').'/api/manage/docs',
        ]]);
    }

    private static function settingsGet(Context $context): Result
    {
        self::authorizeSettings($context);
        $settings = app(GeneralSettings::class);

        return new Result(200, ['data' => Settings::read($settings)], ['ETag' => Settings::etag($settings)]);
    }

    /** @param  array<string, mixed>  $input */
    private static function settingsUpdate(array $input, Context $context): Result
    {
        self::authorizeSettings($context);
        $settings = app(GeneralSettings::class);
        if ($context->ifMatch !== null && $context->ifMatch !== '*' && trim($context->ifMatch) !== Settings::etag($settings)) {
            throw new ApiProblem(412, 'versao', 'Versão vencida', 'As configurações mudaram depois da sua leitura. Leia de novo e refaça a mudança.');
        }
        try {
            Validator::make($input, Settings::rules(), [], Settings::attributes())->validate();
        } catch (ValidationException $e) {
            throw ApiProblem::invalid('Os dados não passaram nas regras do painel: '.collect($e->errors())->flatten()->first(), $e->errors());
        }
        Settings::write($settings, $input);
        $fresh = app(GeneralSettings::class);

        return new Result(200, ['data' => Settings::read($fresh)], ['ETag' => Settings::etag($fresh)]);
    }

    /** As configurações são só do administrador no painel; a conta interna é administradora, então vale a regra. */
    private static function authorizeSettings(Context $context): void
    {
        if (! $context->user->isAdmin()) {
            throw new ApiProblem(403, 'sem_permissao', 'Não permitido', 'Só o administrador muda as configurações.');
        }
    }

    /** @param  array<string, mixed>  $input */
    private static function pageImage(array $input, Context $context): Result
    {
        $page = Page::query()->find((int) ($input['id'] ?? 0)) ?? throw ApiProblem::notFound('A página '.($input['id'] ?? ''));
        if (! Gate::forUser($context->user)->allows('update', $page)) {
            throw new ApiProblem(403, 'sem_permissao', 'Não permitido', 'O painel não deixa mudar esta página.');
        }
        $file = IncomingFile::from($input, 'image');
        $path = Storage::disk('media')->putFileAs('pages', $file->path, Str::random(40).'.'.$file->extension);

        return new Result(201, ['data' => [
            'path' => $path,
            'url' => Storage::disk('media')->url($path),
            'uso' => 'Ponha este `path` no campo de imagem do bloco (ex.: {"type": "image", "data": {"image": "'.$path.'"}}) e mande a lista de blocos em pages_update.',
        ]]);
    }

    /**
     * Listas da caixa de entrada: da mais nova para a mais antiga, com `since` e paginação por cursor. Só leitura.
     *
     * @template TModel of Model
     *
     * @param  Builder<TModel>  $query
     * @param  array<string, mixed>  $input
     * @param  callable(TModel): array<string, mixed>  $map
     */
    private static function inbox(Builder $query, array $input, Context $context, callable $map): Result
    {
        if (! Gate::forUser($context->user)->allows('viewAny', $query->getModel()::class)) {
            throw new ApiProblem(403, 'sem_permissao', 'Não permitido', 'O painel não deixa ver esta lista.');
        }
        $limit = max(1, min(200, (int) ($input['limit'] ?? 50)));
        if (filled($input['since'] ?? null)) {
            try {
                $query->where('created_at', '>=', Carbon::parse((string) $input['since']));
            } catch (\Throwable) {
                throw ApiProblem::badRequest('O `since` precisa ser uma data ISO 8601 (ex.: 2026-11-01T00:00:00-03:00).');
            }
        }
        if (filled($input['cursor'] ?? null)) {
            $after = base64_decode((string) $input['cursor'], true);
            if ($after === false || ! ctype_digit($after)) {
                throw ApiProblem::badRequest('O `cursor` não é válido: use o `next_cursor` da página anterior.');
            }
            $query->where('id', '<', (int) $after);
        }
        $rows = $query->orderByDesc('id')->limit($limit + 1)->get();
        $more = $rows->count() > $limit;
        $rows = $rows->take($limit);

        return new Result(200, [
            'data' => $rows->map($map)->values()->all(),
            'next_cursor' => $more ? base64_encode((string) $rows->last()?->getKey()) : null,
        ]);
    }
}
