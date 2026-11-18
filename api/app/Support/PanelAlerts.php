<?php

namespace App\Support;

use App\Enums\UserRole;
use App\Models\User;
use Filament\Notifications\Notification;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Throwable;

/**
 * Problems of the site in the panel bell of every active administrator (revisão de 17/11/2026: "o sino de
 * notificações tem que mostrar os erros do site"): a server error in the API, the site out of the air, a background
 * task that failed. One warning per problem per hour, so a broken setting does not flood the panel.
 */
class PanelAlerts
{
    public static function send(string $key, string $title, string $body): void
    {
        if (! Cache::add('panel-alert:'.$key, true, now()->addHour())) {
            return;
        }

        $admins = User::query()->where('role', UserRole::Admin)->where('is_active', true)->whereNull('api_credential_id')->get();
        if ($admins->isEmpty()) {
            return;
        }

        Notification::make()->title($title)->body($body)->danger()->sendToDatabase($admins);
    }

    /** A server error the API reported (500): what broke and where, never the request data. */
    public static function exception(Throwable $exception): void
    {
        // Queue workers and commands: a failed task already warns through NotifyAdminsOfFailedJob.
        if (app()->runningInConsole() && ! app()->runningUnitTests()) {
            return;
        }

        rescue(function () use ($exception): void {
            $where = Str::after($exception->getFile(), base_path().DIRECTORY_SEPARATOR).':'.$exception->getLine();
            $path = '/'.ltrim(request()->path(), '/');

            self::send(
                'exception:'.md5($exception::class.$where),
                __('guides.dashboard.alerts.exception_title'),
                __('guides.dashboard.alerts.exception_body', [
                    'path' => Str::limit($path, 80),
                    'message' => Str::limit(class_basename($exception).': '.$exception->getMessage(), 160),
                    'where' => $where,
                ]),
            );
        }, report: false);
    }
}
