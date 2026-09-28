<?php

namespace App\Mail;

use App\Models\ContactMessage;
use App\Models\Finish;
use App\Models\Product;
use App\Support\Localized;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

/**
 * Internal notification sent to `GeneralSettings::contact_recipients` when a
 * visitor submits `POST /contact` (`docs/api.md`). Always in Portuguese —
 * this mailbox is read by the Franccino team, not by site visitors, so it is
 * not part of the pt/en interface that must go through translation files.
 */
class ContactMessageReceived extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public readonly ContactMessage $contactMessage) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: sprintf(
                '[Site] Nova mensagem: %s — %s',
                $this->contactMessage->type->label(),
                $this->contactMessage->name
            ),
            replyTo: [new Address($this->contactMessage->email, $this->contactMessage->name)],
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.contact-message-received',
            with: [
                'contactMessage' => $this->contactMessage,
                'items' => $this->resolveItems(),
                'panelUrl' => url('/admin/contact-messages/'.$this->contactMessage->id),
            ],
        );
    }

    /**
     * @return list<array{
     *     product: string|null,
     *     quantity: int,
     *     finishes: list<array{name: string, code: string|null}>,
     *     note: string|null,
     * }>
     */
    private function resolveItems(): array
    {
        /** @var list<array{product_id?: int, quantity?: int, finish_ids?: list<int>, note?: string|null}> $items */
        $items = $this->contactMessage->items ?? [];

        if ($items === []) {
            return [];
        }

        $products = Product::whereIn('id', array_column($items, 'product_id'))->get()->keyBy('id');

        $finishIds = Collection::make($items)
            ->flatMap(fn (array $item) => $item['finish_ids'] ?? [])
            ->unique()
            ->values();

        $finishes = Finish::whereIn('id', $finishIds)->get()->keyBy('id');

        return array_map(function (array $item) use ($products, $finishes) {
            /** @var Product|null $product */
            $product = $products->get($item['product_id'] ?? null);

            return [
                'product' => $product ? Localized::value($product, 'name', 'pt') : null,
                'quantity' => $item['quantity'] ?? 1,
                'finishes' => Collection::make($item['finish_ids'] ?? [])
                    ->map(fn (int $id) => $finishes->get($id))
                    ->filter()
                    ->map(fn (Finish $finish) => [
                        'name' => Localized::value($finish, 'name', 'pt'),
                        'code' => $finish->code,
                    ])
                    ->values()
                    ->all(),
                'note' => $item['note'] ?? null,
            ];
        }, $items);
    }
}
