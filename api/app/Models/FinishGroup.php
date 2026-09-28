<?php

namespace App\Models;

use Database\Factories\FinishGroupFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Translatable\HasTranslations;

class FinishGroup extends Model
{
    /** @use HasFactory<FinishGroupFactory> */
    use HasFactory, HasTranslations;

    protected $guarded = [];

    /** @var list<string> */
    public $translatable = ['name'];

    /** @return HasMany<Finish, $this> */
    public function finishes(): HasMany
    {
        return $this->hasMany(Finish::class);
    }
}
