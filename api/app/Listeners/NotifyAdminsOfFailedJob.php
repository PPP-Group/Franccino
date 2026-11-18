<?php

namespace App\Listeners;

use App\Support\PanelAlerts;
use Illuminate\Queue\Events\JobFailed;
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

        PanelAlerts::send(
            "failed-job:{$job}",
            __('guides.dashboard.stat.job_failed_title'),
            __('guides.dashboard.stat.job_failed_body', [
                'job' => $job,
                'message' => Str::limit($event->exception->getMessage(), 160),
            ]),
        );
    }
}
