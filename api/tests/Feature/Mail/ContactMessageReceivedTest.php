<?php

use App\Enums\ContactProfession;
use App\Mail\ContactMessageReceived;
use App\Models\ContactMessage;
use App\Models\Finish;
use Illuminate\Support\Facades\App;

it('is written in portuguese with every field and the quote items, whatever the request locale', function () {
    App::setLocale('en');
    $product = publishedProduct();
    $finish = Finish::factory()->create(['name' => ['pt' => 'Freijó', 'en' => 'Freijo'], 'code' => 'MD-02']);

    $message = ContactMessage::factory()->create([
        'name' => 'Ana Souza',
        'email' => 'ana@exemplo.com',
        'phone' => '+55 11 99999-0000',
        'company' => 'Estúdio Souza',
        'profession' => ContactProfession::Architect,
        'city' => 'São Paulo',
        'state' => 'SP',
        'message' => 'Gostaria de um orçamento.',
        'product_id' => $product->id,
        'items' => [['product_id' => $product->id, 'quantity' => 2, 'finish_ids' => [$finish->id], 'note' => 'Cor mais clara']],
        'locale' => 'en',
        'source_url' => 'https://franccino.com.br/en/products/aura-chair',
    ]);

    $mail = new ContactMessageReceived($message);

    $mail->assertHasSubject('[Site] Nova mensagem: Orçamento — Ana Souza');
    $mail->assertHasReplyTo('ana@exemplo.com', 'Ana Souza');
    $mail->assertSeeInOrderInText([
        'Nova mensagem de contato',
        'Tipo', 'Orçamento',
        'E-mail', 'ana@exemplo.com',
        'Telefone', '+55 11 99999-0000',
        'Empresa', 'Estúdio Souza',
        'Profissão', 'Arquiteto(a)',
        'Localização', 'São Paulo - SP',
        'Produto', 'Cadeira Aura',
        'Idioma', 'en',
        'Mensagem', 'Gostaria de um orçamento.',
        'Itens', 'Cadeira Aura', 'Quantidade', '2', 'Acabamentos', 'Freijó (MD-02)', 'Observação', 'Cor mais clara',
        'Enviado a partir de', 'https://franccino.com.br/en/products/aura-chair',
        'Ver no painel',
    ]);
    $mail->assertSeeInHtml('/admin/contact-messages/'.$message->id);
});

it('labels an item whose product no longer exists', function () {
    $message = ContactMessage::factory()->create([
        'items' => [['product_id' => 999999, 'quantity' => 1]],
    ]);

    (new ContactMessageReceived($message))->assertSeeInText('Produto removido');
});
