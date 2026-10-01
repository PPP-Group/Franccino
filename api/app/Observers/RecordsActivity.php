<?php

namespace App\Observers;

use App\Models\ActivityLog;
use App\Models\ContactMessage;
use App\Models\NewsletterSubscriber;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

/**
 * Activity log of the panel (PPP-54). Only actions of a signed-in person are recorded: imports, seeders and
 * the public API are not someone's edit. The log keeps the names of the changed fields, never their values,
 * and labels messages and subscribers by id so no visitor's personal data is copied.
 */
class RecordsActivity
{
    /** Fields that change on every save or are derived from others: they say nothing about the edit. */
    private const IGNORED = ['created_at', 'updated_at', 'remember_token', 'search_text'];

    public function created(Model $model): void
    {
        $this->record('created', $model);
    }

    public function updated(Model $model): void
    {
        $changes = array_values(array_diff(array_keys($model->getChanges()), self::IGNORED));
        if ($changes !== []) {
            $this->record('updated', $model, $changes);
        }
    }

    public function deleted(Model $model): void
    {
        $this->record('deleted', $model);
    }

    /** @param list<string>|null $changes */
    private function record(string $action, Model $model, ?array $changes = null): void
    {
        $user = Auth::user();
        if (! $user instanceof User) {
            return;
        }

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => $action,
            'subject_type' => $model->getMorphClass(),
            'subject_id' => $model->getKey(),
            'subject_label' => Str::limit(self::label($model), 190, ''),
            'changes' => $changes,
        ]);
    }

    private static function label(Model $model): string
    {
        if ($model instanceof ContactMessage || $model instanceof NewsletterSubscriber) {
            return '#'.$model->getKey();
        }
        foreach (['name', 'title', 'key', 'from_path'] as $attribute) {
            $value = $model->getAttribute($attribute);
            if (is_string($value) && $value !== '') {
                return $value;
            }
        }

        return '#'.$model->getKey();
    }
}
