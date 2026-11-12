<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Lista de desejos compartilhada por link (retorno de 12/11/2026). `items` guarda o mesmo formato dos itens do contato
 * (`product_id`, `quantity`, `finish_ids`, `note`). Depois de vencida, a lista some do site; o registro sai do banco
 * 30 dias depois (`model:prune`).
 *
 * @property list<array{product_id: int, quantity: int, finish_ids?: list<int>, note?: string}> $items
 */
class QuoteList extends Model
{
    use Prunable;

    /** Letras e números sem os parecidos (0/o, 1/l/i), para o código ser lido e digitado sem erro. */
    private const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

    protected $guarded = [];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'items' => 'array',
            'expires_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<ContactMessage, $this> */
    public function contactMessage(): BelongsTo
    {
        return $this->belongsTo(ContactMessage::class);
    }

    /**
     * @param  Builder<QuoteList>  $query
     * @return Builder<QuoteList>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('expires_at', '>', now());
    }

    /** @param  list<array<string, mixed>>  $items */
    public static function share(array $items, string $locale, ?int $contactMessageId = null): self
    {
        return self::create([
            'code' => self::newCode(),
            'items' => $items,
            'locale' => $locale,
            'contact_message_id' => $contactMessageId,
            'expires_at' => now()->addDays((int) config('franccino.quote_lists.days', 90)),
        ]);
    }

    public static function newCode(): string
    {
        do {
            $code = '';
            for ($i = 0; $i < 8; $i++) {
                $code .= self::ALPHABET[random_int(0, strlen(self::ALPHABET) - 1)];
            }
        } while (self::query()->where('code', $code)->exists());

        return $code;
    }

    /** Total de peças (somando as quantidades). */
    public function pieceCount(): int
    {
        return (int) collect($this->items)->sum(fn (array $item) => (int) ($item['quantity'] ?? 1));
    }

    /** Endereço da lista no site, no idioma em que foi criada. */
    public function siteUrl(): string
    {
        // FRONTEND_URL pode ter mais de uma origem separada por vírgula (CORS): vale a primeira.
        $base = rtrim(trim(explode(',', (string) config('franccino.frontend.url'))[0]), '/');
        $path = $this->locale === 'en' ? 'en/list' : 'pt/lista';

        return "{$base}/{$path}/{$this->code}";
    }

    /** @return Builder<QuoteList> */
    public function prunable(): Builder
    {
        return self::query()->where('expires_at', '<', now()->subDays(30));
    }
}
