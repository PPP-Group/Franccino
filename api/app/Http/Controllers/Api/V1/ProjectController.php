<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ProjectType;
use App\Http\Controllers\Controller;
use App\Http\Resources\V1\ProjectCardResource;
use App\Http\Resources\V1\ProjectResource;
use App\Models\Project;
use App\Support\ContentLocale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['sometimes', 'string', Rule::in(array_column(ProjectType::cases(), 'value'))],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:48'],
        ]);

        $perPage = $validated['per_page'] ?? 24;
        $page = $validated['page'] ?? 1;

        $paginator = Project::published()
            ->when($validated['type'] ?? null, fn ($query, $type) => $query->where('type', $type))
            ->with('media')
            ->ordered()
            ->paginate($perPage, ['*'], 'page', $page)
            ->appends($request->query());

        return response()->json([
            'data' => ProjectCardResource::collection($paginator->items())->toArray($request),
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
            ],
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $locale = app(ContentLocale::class)->current();

        $project = Project::published()
            ->where("slug->{$locale}", $slug)
            ->with([
                'media',
                'products' => fn ($query) => $query->published(),
                'products.area', 'products.category', 'products.designer', 'products.media',
                'products.launches' => fn ($query) => $query->published(),
            ])
            ->firstOrFail();

        return response()->json(['data' => (new ProjectResource($project))->resolve()]);
    }
}
