<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\QuoteListRequest;
use App\Http\Resources\V1\ProductCardResource;
use App\Models\Finish;
use App\Models\Product;
use App\Models\QuoteList;
use App\Support\ImagePresenter;
use App\Support\Localized;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Lista de desejos compartilhada por link (`docs/api.md`, retorno de 12/11/2026): o site guarda a lista e manda o link
 * no WhatsApp e no e-mail; quem recebe abre a lista com as fotos.
 */
class QuoteListController extends Controller
{
    /** `POST /quote-lists`: guarda a lista e devolve o código e a validade. */
    public function store(QuoteListRequest $request): JsonResponse
    {
        $data = $request->validated();
        $list = QuoteList::share(self::cleanItems($data['items']), $data['locale']);

        return response()->json([
            'data' => ['code' => $list->code, 'expires_at' => $list->expires_at->toIso8601String()],
        ], 201);
    }

    /** `GET /quote-lists/{code}`: a lista com as peças (só as publicadas). Vencida ou inexistente, 404. */
    public function show(Request $request, string $code): JsonResponse
    {
        $list = QuoteList::active()->where('code', strtolower($code))->firstOrFail();
        $items = collect($list->items);

        $products = Product::published()
            ->whereIn('id', $items->pluck('product_id'))
            ->with(['area', 'category', 'designer', 'media', 'launches' => fn ($query) => $query->published()])
            ->get()
            ->keyBy('id');
        $finishes = Finish::query()
            ->whereIn('id', $items->pluck('finish_ids')->flatten()->filter())
            ->with('media')
            ->get()
            ->keyBy('id');

        $lines = $items
            ->filter(fn (array $item) => $products->has($item['product_id']))
            ->map(fn (array $item) => [
                'product' => (new ProductCardResource($products[$item['product_id']]))->toArray($request),
                'quantity' => (int) $item['quantity'],
                'finishes' => collect($item['finish_ids'] ?? [])
                    ->filter(fn ($id) => $finishes->has($id))
                    ->map(function ($id) use ($finishes): array {
                        $finish = $finishes[$id];
                        $name = Localized::value($finish, 'name');

                        return [
                            'id' => $finish->id,
                            'name' => $name,
                            'code' => $finish->code,
                            'swatch' => ImagePresenter::present($finish->getFirstMedia('swatch'), $name),
                        ];
                    })
                    ->values()
                    ->all(),
                'note' => $item['note'] ?? null,
            ])
            ->values()
            ->all();

        return response()->json(['data' => [
            'code' => $list->code,
            'created_at' => $list->created_at?->toIso8601String(),
            'expires_at' => $list->expires_at->toIso8601String(),
            'items' => $lines,
        ]]);
    }

    /**
     * @param  list<array<string, mixed>>  $items
     * @return list<array<string, mixed>>
     */
    public static function cleanItems(array $items): array
    {
        return array_map(fn (array $item) => array_filter([
            'product_id' => (int) $item['product_id'],
            'quantity' => (int) $item['quantity'],
            'finish_ids' => array_values(array_map('intval', $item['finish_ids'] ?? [])),
            'note' => filled($item['note'] ?? null) ? (string) $item['note'] : null,
        ], fn ($value) => $value !== null && $value !== []), $items);
    }
}
