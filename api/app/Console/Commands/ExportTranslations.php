<?php

namespace App\Console\Commands;

use App\Actions\ContentTranslations;
use Illuminate\Console\Command;

/**
 * Lists every text of the panel that has Portuguese and is still empty in the other language, as a JSON file to be
 * translated and brought back with `franccino:translations:import`.
 */
class ExportTranslations extends Command
{
    protected $signature = 'franccino:translations:export {file : arquivo JSON de saída} {--locale=en : idioma a traduzir}';

    protected $description = 'Exporta os textos do painel que ainda não têm tradução';

    public function handle(ContentTranslations $translations): int
    {
        $locale = (string) $this->option('locale');
        $items = array_map(fn (array $item): array => $item + [$locale => null], $translations->export($locale));

        file_put_contents((string) $this->argument('file'), json_encode(
            ['locale' => $locale, 'generated_at' => now()->toIso8601String(), 'items' => $items],
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES,
        ));

        $this->info(count($items).' textos sem tradução gravados em '.$this->argument('file'));

        return self::SUCCESS;
    }
}
