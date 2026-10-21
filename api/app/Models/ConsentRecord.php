<?php

namespace App\Models;

use App\Models\Concerns\PrunedAfterRetention;
use Illuminate\Database\Eloquent\Model;

/**
 * One cookie-consent choice made in the site banner (Anexo I, "registro do aceite"). Append-only: a new
 * choice by the same visitor is a new row, so the history of what was accepted and when is kept.
 */
class ConsentRecord extends Model
{
    use PrunedAfterRetention;

    public const CHOICES = ['granted', 'denied'];

    const UPDATED_AT = null;

    protected $guarded = [];

    protected static function retentionKey(): string
    {
        return 'consent_records';
    }
}
