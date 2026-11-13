<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Texto inicial da Política de cookies e do "Tire suas dúvidas" (retorno de 12/11/2026: as duas páginas estavam
 * vazias). Entra só onde a página ainda não tem conteúdo: o que a Franccino escrever no painel nunca é sobrescrito.
 * Nada de prazo, preço ou garantia: as respostas levam aos canais de atendimento. A Franccino revisa e ajusta.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Banco novo: a página de cookies vinha só do PageSeeder; aqui ela já nasce com o texto.
        if (! DB::table('pages')->where('key', 'cookies')->exists()) {
            DB::table('pages')->insert([
                'key' => 'cookies',
                'title' => json_encode(['pt' => 'Política de cookies', 'en' => 'Cookie policy'], JSON_UNESCAPED_UNICODE),
                'content' => json_encode([]),
                'is_published' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        $this->fill('cookies', [self::richText(self::cookiesPt(), self::cookiesEn())]);
        $this->fill('faq', [['type' => 'faq', 'data' => ['items' => self::faqItems()]]]);
    }

    public function down(): void
    {
        // O texto pode ter sido editado no painel: não é apagado.
    }

    /** @param  list<array<string, mixed>>  $content */
    private function fill(string $key, array $content): void
    {
        $page = DB::table('pages')->where('key', $key)->first();
        if ($page === null) {
            return;
        }
        $current = json_decode((string) ($page->content ?? '[]'), true);
        if (is_array($current) && $current !== []) {
            return;
        }
        DB::table('pages')->where('key', $key)->update([
            'content' => json_encode($content, JSON_UNESCAPED_UNICODE),
            'updated_at' => now(),
        ]);
    }

    /** @return array<string, mixed> */
    private static function richText(string $pt, string $en): array
    {
        return ['type' => 'rich_text', 'data' => ['body' => ['pt' => $pt, 'en' => $en]]];
    }

    private static function cookiesPt(): string
    {
        return <<<'HTML'
<p>Esta política explica como o site da Franccino usa cookies e tecnologias parecidas (como o armazenamento local do navegador), para que servem e como você escolhe o que aceita. Ela complementa a Política de privacidade.</p>
<h2>O que são cookies</h2>
<p>Cookies são pequenos arquivos que um site guarda no seu navegador. Tecnologias parecidas, como o armazenamento local, guardam informações no próprio aparelho. Eles permitem que o site funcione, lembre as suas escolhas e, se você permitir, entenda como é usado.</p>
<h2>Quais usamos</h2>
<h3>Necessários (sempre ligados)</h3>
<ul>
<li>Lista de desejos, sala para montar e peças vistas: ficam guardadas no seu navegador para você continuar de onde parou.</li>
<li>Sua escolha sobre cookies: para não perguntar de novo a cada página.</li>
<li>Cadastro da Área do Profissional: lembra que você já informou os seus dados para baixar os arquivos técnicos.</li>
<li>Segurança dos formulários: a verificação contra robôs (Cloudflare Turnstile) pode usar cookies próprios ao enviar um formulário.</li>
</ul>
<p>Sem eles o site não funciona como deveria, por isso não dependem de consentimento.</p>
<h3>Análise (com a sua permissão)</h3>
<p>Mostram, de forma agregada, quantas pessoas visitam o site, quais páginas são vistas e de onde vêm os acessos (Google Analytics, pelo Google Tag Manager). Só são carregados se você aceitar.</p>
<h3>Marketing (com a sua permissão)</h3>
<p>Medem o resultado de campanhas e anúncios. Só são carregados se você aceitar.</p>
<h2>Como escolher</h2>
<p>Na primeira visita, o aviso de cookies permite aceitar todos, recusar os opcionais ou escolher por categoria. Você pode mudar a escolha a qualquer momento em "Preferências de cookies", no rodapé de todas as páginas. Também é possível apagar ou bloquear cookies nas configurações do navegador; nesse caso, algumas funções do site podem deixar de funcionar.</p>
<h2>Por quanto tempo</h2>
<p>Os dados guardados no navegador ficam até você apagá-los. A sua escolha sobre cookies vale até a próxima mudança desta política, quando perguntamos de novo.</p>
<h2>Contato</h2>
<p>Dúvidas sobre esta política ou sobre os seus dados podem ser enviadas pela página Contato.</p>
HTML;
    }

    private static function cookiesEn(): string
    {
        return <<<'HTML'
<p>This policy explains how the Franccino website uses cookies and similar technologies (such as the browser's local storage), what they are for and how you choose what to accept. It complements the Privacy policy.</p>
<h2>What cookies are</h2>
<p>Cookies are small files a website stores in your browser. Similar technologies, such as local storage, keep information on your device. They let the site work, remember your choices and, if you allow it, understand how it is used.</p>
<h2>Which ones we use</h2>
<h3>Necessary (always on)</h3>
<ul>
<li>Wishlist, room planner and recently viewed pieces: kept in your browser so you can pick up where you left off.</li>
<li>Your cookie choice: so we do not ask again on every page.</li>
<li>Professionals area registration: remembers that you have already shared your details to download technical files.</li>
<li>Form security: the anti-bot check (Cloudflare Turnstile) may use its own cookies when you send a form.</li>
</ul>
<p>The site does not work as it should without them, so they do not depend on consent.</p>
<h3>Analytics (with your permission)</h3>
<p>Show, in aggregate, how many people visit the site, which pages are viewed and where visits come from (Google Analytics, through Google Tag Manager). They only load if you accept.</p>
<h3>Marketing (with your permission)</h3>
<p>Measure the results of campaigns and ads. They only load if you accept.</p>
<h2>How to choose</h2>
<p>On your first visit, the cookie notice lets you accept all, decline the optional ones or choose by category. You can change your choice at any time under "Cookie preferences", in the footer of every page. You can also delete or block cookies in your browser settings; some features of the site may then stop working.</p>
<h2>How long</h2>
<p>Data kept in your browser stays until you delete it. Your cookie choice lasts until this policy changes, when we ask again.</p>
<h2>Contact</h2>
<p>Questions about this policy or your data can be sent through the Contact page.</p>
HTML;
    }

    /** @return list<array{question: array{pt: string, en: string}, answer: array{pt: string, en: string}}> */
    private static function faqItems(): array
    {
        $items = [
            [
                'Como peço um orçamento?',
                'Na página de cada peça, use "Solicitar orçamento desta peça", ou adicione as peças à Lista de desejos e envie a lista por e-mail ou pelo WhatsApp para a equipe de vendas.',
                'How do I ask for a quote?',
                'On each piece\'s page, use "Request a quote for this piece", or add the pieces to your Wishlist and send the list by email or WhatsApp to the sales team.',
            ],
            [
                'Onde posso ver as peças pessoalmente?',
                'Na página Lojas estão as lojas exclusivas e as revendas, com endereço, contato e mapa.',
                'Where can I see the pieces in person?',
                'The Stores page lists the exclusive stores and the resellers, with address, contact and map.',
            ],
            [
                'Quais acabamentos estão disponíveis?',
                'Cada peça mostra os acabamentos em que é feita. A página Acabamentos reúne todos, por grupo. Para confirmar uma combinação, fale com a equipe de vendas.',
                'Which finishes are available?',
                'Each piece shows the finishes it is made in. The Finishes page brings them all together, by group. To confirm a combination, talk to the sales team.',
            ],
            [
                'As medidas podem variar?',
                'As medidas de cada peça estão na página dela. Algumas peças têm medida flexível, mostrada como intervalo (por exemplo, largura de 100 a 150 cm). Para outras necessidades, fale com a equipe de vendas.',
                'Can the dimensions vary?',
                'Each piece\'s dimensions are on its page. Some pieces have flexible dimensions, shown as a range (for example, width from 100 to 150 cm). For other needs, talk to the sales team.',
            ],
            [
                'Onde baixo blocos 3D, desenhos 2D e fichas técnicas?',
                'Na Área do Profissional e na seção "Integre ao seu projeto" de cada peça. No primeiro download pedimos nome, sobrenome e e-mail; depois, os arquivos saem direto.',
                'Where do I download 3D blocks, 2D drawings and technical sheets?',
                'In the Professionals area and in each piece\'s "Integrate into your project" section. On the first download we ask for your name and email; after that, files download right away.',
            ],
            [
                'Como cuidar da minha peça?',
                'Os manuais de uso e conservação ficam na Área do Profissional, junto dos arquivos de cada peça. Em caso de dúvida, fale com a assistência técnica.',
                'How do I care for my piece?',
                'Use and care manuals are in the Professionals area, with each piece\'s files. If in doubt, contact technical assistance.',
            ],
            [
                'Como solicito assistência técnica?',
                'Pelo WhatsApp de Assistência técnica, no rodapé, ou pela página Contato. Informe o nome da peça, onde ela foi comprada e, se possível, envie fotos.',
                'How do I request technical assistance?',
                'Through the Technical assistance WhatsApp, in the footer, or the Contact page. Tell us the piece\'s name and where it was bought and, if possible, send photos.',
            ],
            [
                'A Franccino atende projetos corporativos?',
                'Sim. A página Corporativo mostra alguns projetos. Para um projeto novo, fale com a equipe pela página Contato.',
                'Does Franccino work on corporate projects?',
                'Yes. The Corporate projects page shows some of them. For a new project, talk to the team through the Contact page.',
            ],
        ];

        return array_map(fn (array $item) => [
            'question' => ['pt' => $item[0], 'en' => $item[2]],
            'answer' => ['pt' => $item[1], 'en' => $item[3]],
        ], $items);
    }
};
