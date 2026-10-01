<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Spatie\Translatable\HasTranslations;

/**
 * Video or external link of a product, designer or launch (Anexo I: "vídeos e links externos"; up to
 * three per product in the initial load).
 */
class MediaLink extends Model
{
    use HasTranslations;

    public const KINDS = ['video', 'link'];

    protected $guarded = [];

    /** @var list<string> */
    public $translatable = ['title'];

    /** @return MorphTo<Model, $this> */
    public function linkable(): MorphTo
    {
        return $this->morphTo();
    }
}
