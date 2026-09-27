<?php

namespace App\Http\Resources\V1;

use App\Models\Project;
use App\Support\ImagePresenter;
use App\Support\Locales;
use App\Support\Localized;
use App\Support\RichText;
use Illuminate\Http\Request;

/**
 * `ProjectCard` + `architect`, `description`, `gallery`, `products`, `seo`,
 * `slugs` from docs/api.md, for `GET /projects/{slug}`. Expects the project
 * loaded with `products.*` and `media` — see `ProjectController::show()`.
 *
 * @property-read Project $resource
 */
class ProjectResource extends ProjectCardResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $project = $this->resource;
        $title = Localized::value($project, 'title');

        return array_merge(parent::toArray($request), [
            'architect' => $project->architect,
            'description' => RichText::sanitize(Localized::value($project, 'description')),
            'gallery' => ImagePresenter::presentMany($project->getMedia('gallery'), $title),
            'products' => ProductCardResource::collection($project->products)->toArray($request),
            'seo' => Refs::seo($project, $project->getFirstMedia('cover'), $title),
            'slugs' => collect(Locales::all())
                ->mapWithKeys(fn (string $locale) => [$locale => $project->getTranslation('slug', $locale, false) ?: null])
                ->all(),
        ]);
    }
}
