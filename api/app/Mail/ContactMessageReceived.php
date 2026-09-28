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
 * visitor submits `POST /contact` (`docs/api.md`). Read by the Franccino team,
 * so it is always rendered in the panel language (`pt_BR`), whatever locale
 * the visitor used.
 */
class ContactMessageReceived extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    private const LOCALE = 'pt_BR';

    public function __construct(public readonly ContactMessage $contactMessage)
    {
        $this->locale(self::LOCALE);
    }

    public function envelope(): Envelope
    {
        // Laravel builds the envelope outside `withLocale()` for assertions, so
        // the subject pins its locale itself.
        return $this->withLocale(self::LOCALE, fn () => new Envelope(
            subject: __('[Site] New message: :type — :name', [
                'type' => $this->contactMessage->type->label(),
                'name' => $this->contactMessage->name,
            ]),
            replyTo: [new Address($this->contactMessage->email, $this->contactMessage->name)],
        ));
    }

    public function content(): Content
    {
        $productId = $this->contactMessage->product_id;

        return new Content(
            markdown: 'mail.contact-message-received',
            with: [
                'contactMessage' => $this->contactMessage,
                'product' => $productId ? $this->productLabel(Product::find($productId), $productId) : null,
                'items' => $this->resolveItems(),
                'panelUrl' => url('/admin/contact-messages/'.$this->contactMessage->id),
            ],
        );
    }

    /**
     * @return list<array{
     *     product: string,
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
                'product' => $this->productLabel($product, $item['product_id'] ?? null),
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

    private function productLabel(?Product $product, ?int $id): string
    {
        return $product
            ? Localized::value($product, 'name', 'pt')
            : __('Removed product (:id)', ['id' => $id]);
    }
}
