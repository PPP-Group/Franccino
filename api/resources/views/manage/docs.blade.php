<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <title>API de gestão · Franccino</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        /* As cores e a fonte do site (web/src/styles/tokens.css e base.css; revisão de 18/11/2026). */
        :root { --ink: #171717; --muted: #57564f; --line: #dcd9d1; --line-strong: #bdb9ae; --paper: #fff; --sand: #f4efe6; --sand-soft: #faf8f4; --wood: #7b4b2a; --garden: #2e4a37; --alert: #9b2c1f;
            /* Cantos: a regra do site (web/src/styles/radius.css): 6 px nas caixas, 2 px nas etiquetas pequenas. */
            --radius: 6px; --radius-inner: 2px; }
        * { box-sizing: border-box; scrollbar-width: thin; }
        html { scroll-behavior: smooth; scroll-padding-top: 1.5rem; scrollbar-color: var(--muted) var(--sand); }
        @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
        ::selection { background: var(--ink); color: var(--paper); }
        pre ::selection, pre::selection { background: var(--sand); color: var(--ink); }
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-track { background: var(--sand); }
        ::-webkit-scrollbar-thumb { background: var(--muted); border: 2px solid var(--sand); }
        ::-webkit-scrollbar-thumb:hover { background: var(--ink); }
        ::-webkit-scrollbar-corner { background: var(--sand); }
        body { margin: 0; font-family: Jost, system-ui, -apple-system, sans-serif; color: var(--ink); background: var(--sand-soft); line-height: 1.6; }
        a { color: var(--ink); }
        .wrap { display: grid; grid-template-columns: 17rem minmax(0, 1fr); max-width: 80rem; margin: 0 auto; gap: 2.5rem; padding: 2rem 1.25rem 5rem; }

        .toc { position: sticky; top: 1rem; align-self: start; max-height: calc(100vh - 2rem); display: flex; flex-direction: column; gap: .75rem; font-size: .9rem; }
        .toc__search { position: relative; }
        .toc__search input { width: 100%; padding: .6rem .75rem .6rem 2.1rem; font: inherit; color: var(--ink); background: var(--paper); border: 1px solid var(--line-strong); border-radius: var(--radius); outline: none; }
        .toc__search input:focus { border-color: var(--ink); }
        .toc__search svg { position: absolute; left: .7rem; top: 50%; width: 1rem; height: 1rem; transform: translateY(-50%); color: var(--muted); pointer-events: none; }
        .toc__search kbd { position: absolute; right: .6rem; top: 50%; transform: translateY(-50%); font: .75rem Jost, sans-serif; color: var(--muted); border: 1px solid var(--line); padding: 0 .35rem; }
        .toc__search input::-webkit-search-cancel-button { -webkit-appearance: none; width: .9rem; height: .9rem; cursor: pointer;
            background: linear-gradient(45deg, transparent 45%, var(--ink) 45%, var(--ink) 55%, transparent 55%), linear-gradient(-45deg, transparent 45%, var(--ink) 45%, var(--ink) 55%, transparent 55%); }
        .toc__search input:not(:placeholder-shown) ~ kbd { display: none; }
        .toc__count { margin: 0; font-size: .8rem; color: var(--muted); min-height: 1.2em; }
        .toc__list { overflow-y: auto; padding-right: .5rem; }
        .toc h2 { font-size: .72rem; font-weight: 500; text-transform: uppercase; letter-spacing: .08em; margin: 1.25rem 0 .35rem; color: var(--muted); }
        .toc h2:first-child { margin-top: 0; }
        .toc a { display: block; color: var(--muted); text-decoration: none; padding: .2rem 0 .2rem .75rem; border-left: 2px solid var(--line); transition: color .15s, border-color .15s; }
        .toc a:hover { color: var(--ink); }
        .toc a.is-active { color: var(--ink); border-left-color: var(--ink); font-weight: 500; }
        .toc__ops { display: none; margin: .1rem 0 .4rem; }
        .toc__ops a { padding-left: 1.5rem; font-size: .84rem; }
        .toc__group.is-current .toc__ops, .toc.is-searching .toc__ops { display: block; }
        .toc.is-searching .toc__guide { display: none; }
        .toc [hidden] { display: none !important; }

        main { min-width: 0; }
        h1 { font-size: 2rem; font-weight: 400; margin: 0 0 .5rem; }
        section.guide, article { background: var(--paper); border: 1px solid var(--line); padding: 1.25rem 1.5rem; margin: 0 0 1rem; }
        h2.area { margin: 2.75rem 0 .75rem; font-size: 1.4rem; font-weight: 400; }
        h3 { margin: 0 0 .5rem; font-size: 1.05rem; font-weight: 500; }
        code, pre { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .85rem; }
        pre { background: var(--ink); color: #f3f1ec; padding: .9rem 1rem; overflow-x: auto; margin: .5rem 0 0; scrollbar-color: var(--line-strong) var(--ink); }
        .method { display: inline-block; min-width: 4.2rem; padding: .1rem .4rem; font: 600 .75rem ui-monospace, monospace; color: #fff; background: var(--garden); text-align: center; margin-right: .5rem; }
        .method.DELETE { background: var(--alert); } .method.PATCH, .method.PUT { background: var(--wood); } .method.POST { background: #2b4a6f; }
        .meta { color: var(--muted); font-size: .95rem; }
        table { width: 100%; border-collapse: collapse; font-size: .88rem; margin-top: .75rem; }
        th, td { text-align: left; padding: .35rem .5rem; border-top: 1px solid var(--line); vertical-align: top; }
        th { font-weight: 500; }
        .tag { font-size: .75rem; padding: .05rem .4rem; border: 1px solid var(--line); margin-left: .25rem; color: var(--muted); }
        mark { background: var(--sand); color: inherit; padding: 0 .1em; }
        section.guide, article, pre, .empty, .toc__search input { border-radius: var(--radius); }
        .method, .tag, .toc__search kbd, :not(pre) > code { border-radius: var(--radius-inner); }
        .empty { padding: 2rem; text-align: center; color: var(--muted); border: 1px dashed var(--line-strong); }
        @media (max-width: 52rem) {
            .wrap { grid-template-columns: 1fr; gap: 1.5rem; }
            .toc { position: sticky; top: 0; z-index: 2; max-height: none; background: var(--sand-soft); padding: .75rem 0; }
            .toc__list { display: none; }
            .toc.is-searching .toc__list { display: block; max-height: 50vh; }
        }
    </style>
</head>
<body>
<div class="wrap">
    <nav class="toc" aria-label="Seções" id="toc">
        <div class="toc__search" role="search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            <input type="search" id="busca" placeholder="Buscar função (ex.: capa, products_update)" aria-label="Buscar uma função da API" autocomplete="off">
            <kbd aria-hidden="true">/</kbd>
        </div>
        <p class="toc__count" id="busca-resultado" aria-live="polite"></p>
        <div class="toc__list">
            <div class="toc__guide">
                <h2>Guia</h2>
                <a href="#comecar">Primeira chamada</a>
                <a href="#autenticacao">Autenticação</a>
                <a href="#permissoes">Permissões</a>
                <a href="#ia">Claude e ChatGPT</a>
                <a href="#regras">Textos, fotos e regras</a>
                <a href="#limites">Limites</a>
                <a href="#erros">Erros</a>
                <a href="#versao">Idempotência e ETag</a>
                <a href="#paginas">Listas e páginas</a>
                <a href="#seguranca">Segurança</a>
            </div>
            <h2>Referência ({{ $count }})</h2>
            @foreach ($groups as $area => $ops)
                <div class="toc__group" data-area="area-{{ $area }}">
                    <a href="#area-{{ $area }}">{{ $areas[$area]['label'] ?? 'Geral' }} ({{ count($ops) }})</a>
                    <div class="toc__ops">
                        @foreach ($ops as $op)
                            <a href="#op-{{ $op['id'] }}" data-op="op-{{ $op['id'] }}">{{ $op['title'] }}</a>
                        @endforeach
                    </div>
                </div>
            @endforeach
        </div>
    </nav>
    <main>
        <h1>API de gestão da Franccino</h1>
        <p class="meta">Tudo o que o painel do site faz, por API e pelo conector do Claude e do ChatGPT, com as mesmas regras do painel. Endereço: <code>{{ $base }}/api/manage/v1</code> · OpenAPI: <a href="{{ $base }}/api/manage/v1/openapi.json">openapi.json</a> · Conector: <code>{{ $base }}/mcp</code></p>

        <section class="guide" id="comecar">
            <h3>Primeira chamada</h3>
            <p>Crie uma chave no painel (<strong>API e conectores › Criar chave</strong>), escolha as permissões e copie o segredo, que só aparece uma vez. Depois:</p>
            <pre>curl {{ $base }}/api/manage/v1/me \
  -H "Authorization: Bearer fcc_..."</pre>
            <p>A resposta mostra o nome da chave e as permissões. Toda mudança feita pela API aparece no registro de atividade do painel como "API · nome da chave" e vai para o site na hora, como no painel.</p>
        </section>

        <section class="guide" id="autenticacao">
            <h3>Autenticação</h3>
            <p>Há dois tipos de credencial: a <strong>chave</strong> do painel (<code>fcc_</code> + 48 caracteres), para scripts e integrações, e a <strong>conexão</strong> do Claude ou do ChatGPT, criada pelo OAuth quando o administrador aprova no painel (tokens <code>fcca_</code>, de 1 hora, e <code>fccr_</code>, de renovação). As duas vão em <code>Authorization: Bearer</code>, têm permissões, validade e revogação, e só o hash do segredo fica guardado. O token da conexão só vale no <code>/mcp</code>.</p>
            <p>Fica de fora de propósito: usuários e permissões do painel, registro de atividade, consentimentos (LGPD), apagar peças em definitivo e as próprias chaves.</p>
        </section>

        <section class="guide" id="permissoes">
            <h3>Permissões</h3>
            <p>Cada área do painel tem <code>area:ler</code> e <code>area:escrever</code>; escrever já inclui ler.</p>
            <table>
                <thead><tr><th>Área</th><th>Ler</th><th>Ler e mudar</th></tr></thead>
                <tbody>
                @foreach ($areas as $key => $info)
                    <tr><td>{{ $info['label'] }}</td><td><code>{{ $key }}:ler</code></td><td>@if ($info['write'])<code>{{ $key }}:escrever</code>@else só leitura @endif</td></tr>
                @endforeach
                </tbody>
            </table>
        </section>

        <section class="guide" id="ia">
            <h3>Conectar o Claude ou o ChatGPT</h3>
            <p><strong>Claude</strong> (claude.ai, plano que aceita conectores): Configurações › Conectores › Adicionar conector personalizado. Nome: Franccino. URL: <code>{{ $base }}/mcp</code>. Clique em Conectar: abre o painel da Franccino; entre como administrador, confira as permissões (dá para diminuir) e clique em Aprovar.</p>
            <p><strong>ChatGPT</strong> (plano com conectores ou modo desenvolvedor): Configurações › Aplicativos e conectores › Criar (ou Adicionar conector). URL do servidor MCP: <code>{{ $base }}/mcp</code>, autenticação OAuth. Conecte e aprove no painel do mesmo jeito.</p>
            <p><strong>Se der errado:</strong> confira se a URL termina em <code>/mcp</code>, se quem aprova é administrador e se a conexão não foi desfeita no painel (API e conectores). Para trocar as permissões, desconecte e conecte de novo.</p>
        </section>

        <section class="guide" id="regras">
            <h3>Textos, fotos e regras</h3>
            <p>Textos traduzíveis vão como <code>{"pt": "...", "en": "..."}</code>; só os idiomas enviados mudam e <code>null</code> apaga aquele idioma. As regras são as do painel: tamanho máximo (ex.: título SEO até 70, descrição SEO até 160), obrigatórios e endereço (slug) único. Listas de relação (peças de uma coleção, acabamentos, outras cores) trocam a lista inteira.</p>
            <p>Fotos entram por <code>…/media</code> a partir de um endereço https público (<code>url</code>) ou do arquivo em base64 (<code>data</code> + <code>filename</code>, até 10 MB). O endereço tem de ser público: nada de IP ou rede interna. Coleções de uma foto só (capa, foto sem fundo) trocam a atual.</p>
        </section>

        <section class="guide" id="limites">
            <h3>Limites</h3>
            <p>Por credencial: 60 chamadas por minuto, 30 mudanças por minuto e 10.000 por dia; no total, 300 por minuto. Quem passa recebe 429 com <code>Retry-After</code>. As respostas trazem <code>RateLimit-Limit</code>, <code>RateLimit-Remaining</code> e <code>X-Request-Id</code>.</p>
        </section>

        <section class="guide" id="erros">
            <h3>Erros</h3>
            <p>Todo erro sai em <code>application/problem+json</code> (RFC 9457), com a frase em português, o <code>codigo</code> e o número da requisição.</p>
            <table>
                <thead><tr><th>Status</th><th>Código</th><th>Quando</th></tr></thead>
                <tbody>
                <tr id="erro-valor_invalido"><td>400</td><td><code>valor_invalido</code></td><td>Campo desconhecido, corpo que não é JSON, cursor inválido.</td></tr>
                <tr id="erro-sem_credencial"><td>401</td><td><code>sem_credencial</code>, <code>credencial_invalida</code></td><td>Sem chave, ou chave revogada ou vencida.</td></tr>
                <tr id="erro-escopo"><td>403</td><td><code>escopo</code>, <code>sem_permissao</code></td><td>A credencial não tem a permissão da operação, ou o painel não deixa.</td></tr>
                <tr id="erro-nao_encontrado"><td>404</td><td><code>nao_encontrado</code></td><td>Registro ou caminho que não existe.</td></tr>
                <tr id="erro-metodo"><td>405</td><td><code>metodo</code></td><td>O caminho existe com outro método (veja o <code>Allow</code>).</td></tr>
                <tr id="erro-em_andamento"><td>409</td><td><code>em_andamento</code></td><td>O pedido com a mesma Idempotency-Key ainda está rodando.</td></tr>
                <tr id="erro-versao"><td>412</td><td><code>versao</code></td><td>O <code>If-Match</code> é de uma versão vencida.</td></tr>
                <tr id="erro-regra"><td>422</td><td><code>regra</code>, <code>idempotencia</code></td><td>Os dados não passaram nas regras do painel (o campo e a frase vêm em <code>erros</code>).</td></tr>
                <tr id="erro-limite"><td>429</td><td><code>limite</code></td><td>Passou do limite de chamadas.</td></tr>
                <tr id="erro-interno"><td>500</td><td><code>interno</code></td><td>Erro do nosso lado (o detalhe fica só no registro do servidor).</td></tr>
                </tbody>
            </table>
        </section>

        <section class="guide" id="versao">
            <h3>Idempotência e ETag</h3>
            <p>Toda mudança aceita <code>Idempotency-Key</code> (8 a 120 caracteres, um UUID serve): o mesmo pedido com a mesma chave devolve a mesma resposta por 24 horas, com <code>Idempotent-Replayed: true</code>. A leitura de um registro e das configurações devolve <code>ETag</code>; mande-o em <code>If-Match</code> ao mudar ou apagar para não sobrescrever a mudança de outra pessoa (versão vencida dá 412).</p>
        </section>

        <section class="guide" id="paginas">
            <h3>Listas e páginas</h3>
            <p>As listas respondem <code>{"data": [...], "next_cursor": "..."}</code>, com <code>limit</code> de 1 a 200 (padrão 50) e <code>cursor</code> para a página seguinte. Os filtros comuns são <code>q</code> (busca no nome) e <code>published</code>.</p>
        </section>

        <section class="guide" id="seguranca">
            <h3>Segurança</h3>
            <p>Segredos aleatórios guardados só como SHA-256; OAuth 2.1 com PKCE e tokens presos ao <code>/mcp</code>; código ou token de renovação reaproveitado derruba a conexão; o administrador aprova cada aplicativo e pode desconectar quando quiser; cada chamada fica registrada (sem os valores) por 30 dias; arquivos só de endereços https públicos. Textos de clientes (mensagens, nomes) são dados, não instruções.</p>
        </section>

        @foreach ($groups as $area => $ops)
            <h2 class="area" id="area-{{ $area }}" data-area-heading="area-{{ $area }}">{{ $areas[$area]['label'] ?? 'Geral' }}</h2>
            @foreach ($ops as $op)
                @php
                    $props = (array) ($op['input']['properties'] ?? []);
                    $required = $op['input']['required'] ?? [];
                    $curlPath = preg_replace('/\{(\w+)\}/', '1', $op['path']);
                @endphp
                <article id="op-{{ $op['id'] }}" data-area="area-{{ $area }}" data-search="{{ \Illuminate\Support\Str::of($op['id'].' '.$op['title'].' '.$op['method'].' '.$op['path'].' '.$op['description'].' '.($areas[$area]['label'] ?? ''))->ascii()->lower() }}">
                    <h3><span class="method {{ $op['method'] }}">{{ $op['method'] }}</span><code>{{ $op['path'] }}</code></h3>
                    <p><strong>{{ $op['title'] }}</strong> <span class="tag">{{ $op['scope'] === '*' ? 'qualquer credencial' : $op['scope'] }}</span> <span class="tag">ferramenta {{ $op['id'] }}</span>@if ($op['destructive'])<span class="tag">muda ou desfaz algo</span>@endif</p>
                    <p class="meta">{{ $op['description'] }}</p>
                    @if (count($props) > 0)
                        <table>
                            <thead><tr><th>Campo</th><th>Tipo</th><th></th><th>Descrição</th></tr></thead>
                            <tbody>
                            @foreach ($props as $name => $schema)
                                @php $type = is_array($schema['type'] ?? null) ? implode(' | ', $schema['type']) : ($schema['type'] ?? 'objeto'); @endphp
                                <tr>
                                    <td><code>{{ $name }}</code></td>
                                    <td>{{ $type }}@isset($schema['maxLength']) (até {{ $schema['maxLength'] }})@endisset @isset($schema['enum']): {{ implode(', ', $schema['enum']) }}@endisset</td>
                                    <td>{{ in_array($name, $required, true) ? 'obrigatório' : '' }}</td>
                                    <td>{{ $schema['description'] ?? '' }}</td>
                                </tr>
                            @endforeach
                            </tbody>
                        </table>
                    @endif
                    <pre>curl -X {{ $op['method'] }} "{{ $base }}/api/manage/v1{{ $curlPath }}" \
  -H "Authorization: Bearer fcc_..."@if (! in_array($op['method'], ['GET', 'DELETE'], true)) \
  -H "Content-Type: application/json" \
  -d '{...}'@endif</pre>
                </article>
            @endforeach
        @endforeach
        <p class="empty" id="busca-vazia" hidden>Nenhuma função encontrada. Tente outra palavra, o nome da ferramenta (ex.: <code>products_list</code>) ou o caminho (ex.: <code>/collections</code>).</p>
    </main>
</div>
<script>
/* Busca e menu que acompanha a rolagem (revisão de 18/11/2026). */
(() => {
    const toc = document.getElementById('toc');
    const input = document.getElementById('busca');
    const count = document.getElementById('busca-resultado');
    const empty = document.getElementById('busca-vazia');
    const list = toc.querySelector('.toc__list');
    const articles = [...document.querySelectorAll('article[data-search]')];
    const guides = [...document.querySelectorAll('section.guide')];
    const headings = [...document.querySelectorAll('h2[data-area-heading]')];
    const groups = [...toc.querySelectorAll('.toc__group')];
    const links = new Map([...toc.querySelectorAll('a[href^="#"]')].map((a) => [a.getAttribute('href').slice(1), a]));
    const norm = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

    // Busca: todas as palavras precisam aparecer (nome, ferramenta, caminho, método ou descrição).
    const search = () => {
        const words = norm(input.value).split(/\s+/).filter(Boolean);
        const on = words.length > 0;
        toc.classList.toggle('is-searching', on);
        guides.forEach((section) => { section.hidden = on; });
        let shown = 0;
        const areasShown = new Set();
        articles.forEach((article) => {
            const hit = !on || words.every((word) => article.dataset.search.includes(word));
            article.hidden = !hit;
            const link = links.get(article.id);
            if (link) link.hidden = !hit;
            if (hit) { shown++; areasShown.add(article.dataset.area); }
        });
        headings.forEach((heading) => { heading.hidden = !areasShown.has(heading.dataset.areaHeading); });
        groups.forEach((group) => { group.hidden = !areasShown.has(group.dataset.area); });
        empty.hidden = !on || shown > 0;
        count.textContent = on ? (shown === 1 ? '1 função encontrada' : shown + ' funções encontradas') : '';
        if (on) spy();
    };
    input.addEventListener('input', search);
    document.addEventListener('keydown', (event) => {
        if (event.key === '/' && document.activeElement !== input) { event.preventDefault(); input.focus(); }
        if (event.key === 'Escape' && document.activeElement === input) { input.value = ''; search(); }
    });

    // Menu: marca a seção e a função que estão no topo da tela e rola o menu para mantê-las à vista.
    const targets = [...document.querySelectorAll('section.guide, h2[data-area-heading], article[data-search]')];
    let current = null;
    const spy = () => {
        const line = window.innerHeight * 0.25;
        let active = null;
        for (const element of targets) {
            if (element.hidden || element.offsetParent === null) continue;
            if (element.getBoundingClientRect().top - line <= 0) active = element; else break;
        }
        active ??= targets.find((element) => !element.hidden);
        if (!active || active === current) return;
        current = active;
        links.forEach((link) => link.classList.remove('is-active'));
        const area = active.dataset.area || active.dataset.areaHeading || null;
        groups.forEach((group) => group.classList.toggle('is-current', group.dataset.area === area));
        const marked = [links.get(active.id), area ? links.get(area) : null].filter(Boolean);
        marked.forEach((link) => link.classList.add('is-active'));
        const link = marked[0];
        if (link && list.scrollHeight > list.clientHeight) {
            const top = link.offsetTop - list.offsetTop;
            if (top < list.scrollTop + 40 || top > list.scrollTop + list.clientHeight - 60) {
                list.scrollTo({ top: Math.max(0, top - list.clientHeight / 3), behavior: 'smooth' });
            }
        }
    };
    let queued = false;
    window.addEventListener('scroll', () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => { queued = false; spy(); });
    }, { passive: true });
    window.addEventListener('resize', spy);
    spy();
})();
</script>
</body>
</html>
