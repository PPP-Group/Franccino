<?php

namespace App\Http\Resources\V1;

use App\Models\Project;
use App\Support\ImagePresenter;
use App\Support\Localized;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * `ProjectCard` from docs/api.md (`id`, `slug`, `type`, `title`, `client_name`,
 * `location`, `year`, `summary`, `cover`).
 *
 * @property-read Project $resource
 */
class ProjectCardResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $project = $this->resource;
        $title = Localized::value($project, 'title');

        return [
            'id' => $project->id,
            'slug' => Localized::value($project, 'slug'),
            'type' => $project->type->value,
            'title' => $title,
            'client_name' => $project->client_name,
            'location' => $project->location,
            'year' => $project->year,
            'summary' => Localized::value($project, 'summary'),
            'cover' => ImagePresenter::present($project->getFirstMedia('cover'), $title),
        ];
    }
}
