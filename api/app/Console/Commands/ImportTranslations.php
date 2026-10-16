<?php

namespace App\Console\Commands;

use App\Actions\ContentTranslations;
use Illuminate\Console\Command;

/**
 * Applies translated texts (`{model, field, pt, en}`) to the content, matching by the Portuguese text. Only empty
 * fields are filled unless --force, so what was written in the panel stays.
 */
class ImportTranslations extends Command
{
    protected $signature = 'franccino:translations:import
        {file : arquivo JSON com as traduções}
        {--locale=en : idioma das traduções}
        {--force : sobrescreve também o que já tem tradução}
        {--dry-run : só conta, sem gravar}';

    protected $description = 'Importa as traduções do conteúdo do painel (só preenche o que está vazio)';

    public function handle(ContentTranslations $translations): int
    {
        $file = (string) $this->argument('file');
        $data = is_file($file) ? json_decode((string) file_get_contents($file), true) : null;

        if (! is_array($data) || ! is_array($data['items'] ?? null)) {
            $this->error("Arquivo inválido: {$file}");

            return self::FAILURE;
        }

        $locale = (string) $this->option('locale');
        $counts = $translations->import($data['items'], $locale, (bool) $this->option('force'), (bool) $this->option('dry-run'));

        $this->table(
            ['Registros atualizados', 'Textos preenchidos', 'Já traduzidos (mantidos)', 'Endereços criados', 'Sem correspondência'],
            [array_values($counts)],
        );

        if ($this->option('dry-run')) {
            $this->comment('Simulação: nada foi gravado.');
        }

        return self::SUCCESS;
    }
}
