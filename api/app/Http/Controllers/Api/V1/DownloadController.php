<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\CreateDownloadLink;
use App\Enums\ProductFileType;
use App\Http\Controllers\Controller;
use App\Http\Resources\V1\DownloadFileResource;
use App\Http\Resources\V1\DownloadProductResource;
use App\Models\Designer;
use App\Models\DownloadLead;
use App\Models\Launch;
use App\Models\Product;
use App\Models\ProductFile;
use App\Queries\ProductQuery;
use App\Support\ImagePresenter;
use App\Support\Localized;
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
     * `GET /downloads/catalogs` (reunião de 18/11/2026, como a área de downloads da donaflormobilia.com): os catálogos
     * publicados, de peça, designer ou lançamento publicados, com o nome e a foto do dono para a capa do card. O
     * arquivo só sai pelo `POST /downloads/{id}/link`, com o cadastro, como os outros.
     */
    public function catalogs(Request $request): JsonResponse
    {
        $files = ProductFile::query()
            ->published()
            ->where('type', ProductFileType::Catalog->value)
            ->with(['product.media', 'designer.media', 'launch.media'])
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->filter(fn (ProductFile $file) => (bool) $file->owner()?->is_published)
            ->values();

        return response()->json([
            'data' => $files->map(fn (ProductFile $file) => $this->catalog($file, $request))->all(),
        ]);
    }

    /** @return array<string, mixed> */
    private function catalog(ProductFile $file, Request $request): array
    {
        $owner = $file->owner();
        $name = $owner instanceof Designer ? $owner->name : (string) Localized::value($owner, $owner instanceof Launch ? 'title' : 'name');
        $media = match (true) {
            $owner instanceof Designer => $owner->getFirstMedia('portrait'),
            default => $owner?->getFirstMedia('cover'),
        };

        return [
            'file' => (new DownloadFileResource($file))->toArray($request),
            'owner' => [
                'type' => match (true) {
                    $owner instanceof Product => 'product',
                    $owner instanceof Designer => 'designer',
                    default => 'launch',
                },
                'name' => $name,
                'slug' => $owner instanceof Designer ? $owner->slug : Localized::value($owner, 'slug'),
            ],
            'cover' => ImagePresenter::present($media, $name),
        ];
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
