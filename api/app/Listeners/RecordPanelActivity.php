<?php

namespace App\Listeners;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Auth;
use Spatie\LaravelSettings\Events\SettingsSaved;

/** Panel sign-ins and settings changes for the activity log (PPP-54); model edits go through `RecordsActivity`. */
class RecordPanelActivity
{
    public function handleLogin(Login $event): void
    {
        if ($event->user instanceof User) {
            ActivityLog::create(['user_id' => $event->user->id, 'action' => 'login']);
        }
    }

    public function handleSettingsSaved(SettingsSaved $event): void
    {
        $user = Auth::user();
        if (! $user instanceof User) {
            return;
        }

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'updated',
            'subject_type' => 'settings',
            'subject_label' => $event->settings::group(),
        ]);
    }
}
