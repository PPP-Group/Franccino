<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\CreateDownloadLink;
use App\Http\Controllers\Controller;
use App\Http\Resources\V1\DownloadProductResource;
use App\Models\DownloadLead;
use App\Models\ProductFile;
use App\Queries\ProductQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DownloadController extends Controller
{
    /**
     * `GET /downloads`: paginated `ProductCard & { files }`, only products
     * with at least one published `ProductFile` (docs/api.md).
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'area' => ['sometimes', 'string'],
            'category' => ['sometimes', 'string'],
            'q' => ['sometimes', 'string'],
            'format' => ['sometimes', 'string', 'max:10'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:48'],
        ]);

        $perPage = $validated['per_page'] ?? 24;
        $page = $validated['page'] ?? 1;

        // Tipo de arquivo (retorno de 13/11/2026): só as peças que têm um arquivo naquele formato (SKP, DWG, GLB...).
        $format = filled($validated['format'] ?? null) ? strtoupper($validated['format']) : null;

        $paginator = ProductQuery::make($validated)
            ->whereHas('files', fn ($query) => $query->published()->when($format, fn ($query) => $query->whereRaw('upper(format) = ?', [$format])))
            ->with(['files' => fn ($query) => $query->published()->orderBy('sort_order')->orderBy('id')])
            ->paginate($perPage, ['*'], 'page', $page)
            ->appends($request->query());

        return response()->json([
            'data' => DownloadProductResource::collection($paginator->items())->toArray($request),
            'links' => [
                'first' => $paginator->url(1),
                'last' => $paginator->url($paginator->lastPage()),
                'prev' => $paginator->previousPageUrl(),
                'next' => $paginator->nextPageUrl(),
            ],
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'formats' => $this->formats(),
            ],
        ]);
    }

    /**
     * Os formatos que existem nos arquivos publicados das peças publicadas, com quantas peças têm cada um (para o filtro
     * "Tipo de arquivo" da Área do Profissional), do mais comum ao menos comum.
     *
     * @return list<array{format: string, count: int}>
     */
    private function formats(): array
    {
        return ProductFile::query()
            ->published()
            ->whereNotNull('product_id')
            ->whereHas('product', fn ($query) => $query->published())
            ->selectRaw('upper(format) as format, count(distinct product_id) as count')
            ->groupByRaw('upper(format)')
            ->orderByDesc('count')
            ->orderBy('format')
            ->get()
            ->map(fn (ProductFile $file) => ['format' => (string) $file->format, 'count' => (int) $file->getAttribute('count')])
            ->all();
    }

    /**
     * `POST /downloads/{file}/link` (`docs/api.md`, "Escrita"). Only files of
     * a published product, designer or launch may be linked; anything else
     * (missing file, unpublished file, unpublished/deleted owner) is a `404`,
     * never exposing whether the file exists.
     */
    public function link(ProductFile $file, Request $request, CreateDownloadLink $action): JsonResponse
    {
        abort_unless($file->is_published && $file->owner()?->is_published, 404);

        // Só baixa quem se cadastrou (revisão da Franccino, 12/11/2026, item 22): o site manda o token do cadastro.
        $lead = DownloadLead::findByToken($request->input('lead_token'));
        if ($lead === null) {
            return response()->json([
                'message' => __('Please fill in your details to download.'),
                'errors' => ['lead_token' => [__('Please fill in your details to download.')]],
            ], 422);
        }

        return response()->json(['data' => $action->handle($file, $request, $lead)], 201);
    }
}
