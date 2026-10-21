<?php

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
