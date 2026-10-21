<?php

namespace App\Listeners;

use App\Enums\UserRole;
use App\Models\User;
use Filament\Notifications\Notification;
use Illuminate\Queue\Events\JobFailed;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/**
 * A background task that fails for good (site revalidation, contact e-mail, photo sizes) shows up in the panel bell
 * of every active administrator. One warning per task per hour, so a broken setting doesn't flood the panel.
 */
class NotifyAdminsOfFailedJob
{
    public function handle(JobFailed $event): void
    {
        $job = class_basename($event->job->resolveName());

        if (! Cache::add("failed-job-warning:{$job}", true, now()->addHour())) {
            return;
        }

        $admins = User::query()->where('role', UserRole::Admin)->where('is_active', true)->get();

        Notification::make()
            ->title(__('guides.dashboard.stat.job_failed_title'))
            ->body(__('guides.dashboard.stat.job_failed_body', [
                'job' => $job,
                'message' => Str::limit($event->exception->getMessage(), 160),
            ]))
            ->danger()
            ->sendToDatabase($admins);
    }
}
