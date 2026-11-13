<?php

use App\Jobs\RevalidateFrontend;
use App\Models\Banner;
use Filament\Actions\Exports\Models\Export;
use Illuminate\Support\Facades\Schedule;

/*
 * Rotinas do container da API (`docker/entrypoint.sh` roda `schedule:work`; fora do Docker, o cron do runbook roda
 * `schedule:run`). `onOneServer()`: num redeploy dois containers convivem por alguns minutos no mesmo banco.
 */

// Logs com dados pessoais além do prazo de franccino.retention (LGPD).
Schedule::command('model:prune')->dailyAt('03:10')->onOneServer()->withoutOverlapping();

// Jobs que falharam há mais de 30 dias (o painel avisa na hora em que falham).
Schedule::command('queue:prune-failed --hours=720')->dailyAt('03:20')->onOneServer();

// Exportações CSV do painel (e-mails e mensagens) ficam 7 dias, o tempo de baixar.
Schedule::call(function () {
    Export::query()->where('created_at', '<', now()->subDays(7))->each(function (Export $export) {
        $export->deleteFileDirectory();
        $export->delete();
    });
})->name('limpar-exportacoes')->dailyAt('03:30')->onOneServer();

// Backup do preview (SQLite): banco todo dia, banco e arquivos aos domingos.
Schedule::command('franccino:backup')->dailyAt('02:40')->onOneServer()->withoutOverlapping();
Schedule::command('franccino:backup --with-files')->weeklyOn(0, '02:50')->onOneServer()->withoutOverlapping();

// Banner de campanha: quando um período começa ou acaba, o site troca o banner da home sozinho (revisão de 12/11/2026).
// Roda de 5 em 5 minutos e só avisa o site quando algum início ou fim caiu nesse intervalo.
Schedule::call(function () {
    $since = now()->subMinutes(5);
    $changed = Banner::query()
        ->where(fn ($query) => $query->whereBetween('starts_at', [$since, now()])->orWhereBetween('ends_at', [$since, now()]))
        ->exists();
    if ($changed) {
        RevalidateFrontend::dispatch(['banners', 'home']);
    }
})->name('banner-de-campanha')->everyFiveMinutes()->onOneServer();
