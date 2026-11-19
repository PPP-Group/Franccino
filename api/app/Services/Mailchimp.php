<?php

namespace App\Services;

use App\Models\NewsletterSubscriber;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Inscritos da newsletter no Mailchimp (revisão da Franccino, 18/11/2026). Cada inscrição ou descadastro do site (e do
 * painel) atualiza o contato na audiência: inscrito ou descadastrado, com o nome e o idioma. O e-mail é a chave, pelo
 * hash MD5 em minúsculas, como a API do Mailchimp pede.
 */
class Mailchimp
{
    public function enabled(): bool
    {
        return filled(config('franccino.mailchimp.api_key')) && filled(config('franccino.mailchimp.audience_id'));
    }

    public function sync(NewsletterSubscriber $subscriber): void
    {
        if (! $this->enabled()) {
            return;
        }

        $key = (string) config('franccino.mailchimp.api_key');
        $server = str_contains($key, '-') ? substr($key, strrpos($key, '-') + 1) : '';
        if ($server === '') {
            throw new RuntimeException('MAILCHIMP_API_KEY sem o servidor no fim (ex.: ...-us21).');
        }

        $email = strtolower(trim($subscriber->email));
        $status = $subscriber->unsubscribed_at === null ? 'subscribed' : 'unsubscribed';
        $body = array_filter([
            'email_address' => $email,
            'status_if_new' => $status,
            'status' => $status,
            'language' => $subscriber->locale,
            'merge_fields' => filled($subscriber->name) ? ['FNAME' => $subscriber->name] : null,
        ], fn (mixed $value): bool => $value !== null);

        Http::withBasicAuth('franccino', $key)
            ->acceptJson()
            ->timeout(15)
            ->put(sprintf(
                'https://%s.api.mailchimp.com/3.0/lists/%s/members/%s',
                $server,
                config('franccino.mailchimp.audience_id'),
                md5($email),
            ), $body)
            ->throw();
    }
}
