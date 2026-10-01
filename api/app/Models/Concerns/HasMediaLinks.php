<?php

namespace App\Models\Concerns;

use App\Models\MediaLink;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait HasMediaLinks
{
    /** @return MorphMany<MediaLink, $this> */
    public function mediaLinks(): MorphMany
    {
        return $this->morphMany(MediaLink::class, 'linkable')->orderBy('sort_order')->orderBy('id');
    }
}
