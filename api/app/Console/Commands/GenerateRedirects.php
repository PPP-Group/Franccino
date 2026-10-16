<?php

namespace App\Console\Commands;

use App\Actions\GenerateLegacyRedirects;
use Illuminate\Console\Command;

/**
 * P5b Task 3: writes the old site's redirects (`legacy_url` of migrated records and the fixed paths in
 * `config('franccino.legacy')`). Safe to run again after every import; rules edited in the panel stay.
 */
class GenerateRedirects extends Command
{
    protected $signature = 'franccino:redirects:generate {--dry-run : only count, without writing}';

    protected $description = 'Gera os redirects do site antigo a partir do legacy_url dos registros migrados';

    public function handle(GenerateLegacyRedirects $generate): int
    {
        $counts = $generate->handle(dryRun: (bool) $this->option('dry-run'));

        $this->table(
            ['Criados', 'Atualizados', 'Sem mudança', 'Desativados', 'Preservados (painel)'],
            [array_values($counts)],
        );
        if ($this->option('dry-run')) {
            $this->comment('Simulação: nada foi gravado.');
        }

        return self::SUCCESS;
    }
}
