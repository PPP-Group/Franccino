<?php

namespace App\Console\Commands;

use App\Support\WordPress\WordPressImporter;
use Illuminate\Console\Command;

/**
 * P5b Task 4: imports designers, lines, categories and products from the current WordPress site,
 * idempotently. `--publish` exists for local and staging previews; in production publishing stays a
 * decision of the client in the panel.
 */
class ImportWordPress extends Command
{
    protected $signature = 'franccino:wordpress:import
        {--only=* : designers, lines, categories, products, pages (default: all)}
        {--dry-run : only read the site and write the report}
        {--without-media : skip downloading product photos}
        {--publish : publish what is imported (local/staging previews only)}
        {--limit= : import at most N products}';

    protected $description = 'Importa o catálogo e as páginas institucionais do site WordPress atual';

    public function handle(WordPressImporter $importer): int
    {
        $only = array_values(array_intersect((array) $this->option('only'), WordPressImporter::ENTITIES));
        if ($this->option('only') !== [] && $only === []) {
            $this->error('Use --only com: '.implode(', ', WordPressImporter::ENTITIES));

            return self::FAILURE;
        }
        if ($this->option('publish') && app()->isProduction()) {
            $this->error('--publish não roda em produção: publicar é decisão da Franccino no painel.');

            return self::FAILURE;
        }

        $dryRun = (bool) $this->option('dry-run');
        $report = $importer->run(
            only: $only,
            dryRun: $dryRun,
            withMedia: ! $this->option('without-media'),
            publish: (bool) $this->option('publish'),
            limit: $this->option('limit') !== null ? (int) $this->option('limit') : null,
            progress: fn (string $message) => $this->line($message),
        );

        $this->table(
            ['Entidade', 'Criados', 'Atualizados', 'Ignorados'],
            collect($report->counts())->map(fn (array $count, string $entity) => [$entity, ...array_values($count)])->values()->all(),
        );
        $path = $report->write($dryRun ? 'Migração do WordPress (simulação)' : 'Migração do WordPress');
        $this->info("Relatório: {$path}");

        return self::SUCCESS;
    }
}
