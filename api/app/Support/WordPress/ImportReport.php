<?php

namespace App\Support\WordPress;

use Illuminate\Support\Facades\File;

/**
 * What one import run did: counts per entity and the gaps per record (fields the site does not have).
 * The Markdown version goes to the client as the content-gap report (roadmap week 5).
 */
class ImportReport
{
    /** @var array<string, array{created: int, updated: int, skipped: int}> */
    private array $counts = [];

    /** @var array<string, array<string, list<string>>> entity → record → gaps */
    private array $gaps = [];

    public function count(string $entity, string $outcome): void
    {
        $this->counts[$entity] ??= ['created' => 0, 'updated' => 0, 'skipped' => 0];
        $this->counts[$entity][$outcome]++;
    }

    public function gap(string $entity, string $record, string $gap): void
    {
        $this->gaps[$entity][$record][] = $gap;
    }

    /** @return array<string, array{created: int, updated: int, skipped: int}> */
    public function counts(): array
    {
        return $this->counts;
    }

    /** @return array<string, array<string, list<string>>> */
    public function gaps(): array
    {
        return $this->gaps;
    }

    public function toMarkdown(string $title): string
    {
        $lines = ["# {$title}", '', '| Entidade | Criados | Atualizados | Ignorados |', '| --- | --- | --- | --- |'];
        foreach ($this->counts as $entity => $count) {
            $lines[] = "| {$entity} | {$count['created']} | {$count['updated']} | {$count['skipped']} |";
        }

        foreach ($this->gaps as $entity => $records) {
            $lines[] = '';
            $lines[] = "## Lacunas: {$entity} (".count($records).')';
            $lines[] = '';
            ksort($records);
            foreach ($records as $record => $gaps) {
                $lines[] = "- **{$record}**: ".implode('; ', $gaps);
            }
        }

        return implode("\n", $lines)."\n";
    }

    public function write(string $title): string
    {
        $path = storage_path('app/migration/relatorio-'.now()->format('Y-m-d').'.md');
        File::ensureDirectoryExists(dirname($path));
        File::put($path, $this->toMarkdown($title));

        return $path;
    }
}
