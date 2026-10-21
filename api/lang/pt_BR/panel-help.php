<?php

/*
 * Dicas que aparecem embaixo dos campos do painel (App\Filament\Support\FieldHelp).
 * A chave é "<modelo>.<campo>" (ex.: "product.cover"); sem ela, vale a chave só com o campo.
 * Em campo com pt/en, a dica aparece só na aba Português.
 */

return [
    // Campos que se repetem em várias telas
    'name' => 'Como o nome aparece no site.',
    'title' => 'Título que aparece no topo da página ou do bloco.',
    'slug' => 'Final do endereço da página no site (ex.: /produtos/cadeira-marcela). Ele se preenche sozinho a partir do nome. Só troque se souber o motivo: o endereço antigo deixa de funcionar.',
    'is_published' => 'Desligado, o item fica como rascunho e só aparece aqui no painel. Ligue quando estiver pronto para ir ao site.',
    'is_featured' => 'Itens em destaque aparecem primeiro nas listas e na página inicial.',
    'seo_title' => 'Título que aparece na aba do navegador e no Google. Até 70 letras. Vazio, o site usa o nome.',
    'seo_description' => 'Resumo que aparece no Google, embaixo do título. Até 160 letras, em uma ou duas frases.',
    'summary' => 'Uma ou duas frases curtas. Aparecem nas listas e no topo da página.',
    'description' => 'Texto principal. Use parágrafos curtos; o negrito e os títulos ficam na barra do editor.',
    'year' => 'Ano com 4 dígitos (ex.: 2026).',
    'products' => 'Escolha as peças. Digite parte do nome para buscar.',
    'cover' => 'Foto principal. Use JPG ou PNG com pelo menos 1600 px de largura e até 10 MB. O site corta e diminui sozinho.',
    'gallery' => 'Mais fotos. Arraste para mudar a ordem; a primeira aparece antes.',
    'url' => 'Endereço completo, começando com https://',
    'website_url' => 'Endereço completo, começando com https://',
    'instagram_url' => 'Endereço do perfil, ex.: https://instagram.com/franccino',
    'location' => 'Cidade e estado, ex.: Belo Horizonte, MG.',
    'og_image' => 'Imagem que aparece quando alguém compartilha a página no WhatsApp ou nas redes. Ideal: 1200 × 630 px.',

    // Produto
    'product.name' => 'Nome da peça como aparece no site, ex.: Cadeira Marcela sem braço.',
    'product.tagline' => 'Frase curta opcional que aparece embaixo do nome.',
    'product.sku' => 'Código interno da peça (opcional). Não aparece no site.',
    'product.area_id' => 'Casa (interno) ou Giardini (externo). Define em qual menu a peça aparece.',
    'product.category_id' => 'Tipo da peça (cadeira, sofá, mesa...). Define o filtro do catálogo.',
    'product.line_id' => 'Família da peça. Peças da mesma linha aparecem juntas em "Da linha".',
    'product.designer_id' => 'Quem assina a peça. Aparece na página do produto e na do designer.',
    'product.description' => 'Texto sobre a peça: inspiração, uso e diferenciais. Evite preço e prazo.',
    'product.materials' => 'Materiais da peça, ex.: Estrutura em madeira maciça Tauari; assento em espuma.',
    'product.finishes_note' => 'Observação sobre acabamentos, ex.: Disponível em outras cores sob consulta.',
    'product.dimensions' => 'Medidas em milímetros (1 metro = 1000 mm). Para peças com mais de um tamanho, use "Adicionar" e dê um nome a cada versão.',
    'product.finishes' => 'Acabamentos em que a peça é feita. Eles aparecem como amostras na página do produto.',
    'product.cover' => 'Foto principal da peça: fundo branco, peça centralizada e todas no mesmo ângulo. Pelo menos 1600 px. Obrigatória para publicar.',
    'product.gallery' => 'Outras fotos da peça (detalhes, ambientes). Arraste para mudar a ordem.',
    'product.model_3d' => 'Arquivo 3D em GLB, até 5 MB. Ele aparece no botão "3D" da página do produto.',
    'product.is_3d_enabled' => 'Liga ou desliga o visualizador 3D desta peça, sem apagar o arquivo.',

    // Coleção e lançamento
    'collection.name' => 'Nome da coleção, ex.: Tempo.',
    'collection.cover' => 'Foto grande e horizontal (ideal 2400 × 1200 px). Aparece no bloco da coleção e no topo da página dela.',
    'launch.title' => 'Nome do lançamento, ex.: Coleção Tempo 25 anos.',
    'launch.cover' => 'Foto grande e horizontal (ideal 2400 × 1200 px) para o topo do lançamento.',

    // Designer
    'designer.name' => 'Nome do designer ou do estúdio.',
    'designer.short_bio' => 'Uma frase sobre o designer. Aparece na página do produto.',
    'designer.bio' => 'Texto completo, para a página do designer.',
    'designer.portrait' => 'Retrato vertical (ideal 1200 × 1600 px). O site mostra em preto e branco.',

    // Banner da página inicial
    'banner.placement' => 'Onde o banner aparece. "Destaque da home" é o banner grande que troca de imagem na página inicial.',
    'banner.title' => 'Frase principal sobre a foto, ex.: Design para viver o tempo. Pode ficar vazia.',
    'banner.subtitle' => 'Frase menor, embaixo do título.',
    'banner.cta_label' => 'Texto do botão, ex.: Conheça as peças. Vazio, o botão não aparece.',
    'banner.cta_url' => 'Para onde o botão leva, ex.: /pt/produtos',
    'banner.starts_at' => 'Opcional: o banner só aparece a partir desta data.',
    'banner.ends_at' => 'Opcional: o banner some depois desta data.',
    'banner.image' => 'Foto horizontal de alta qualidade (ideal 2400 × 1200 px). O texto fica por cima, então prefira fotos com área mais calma.',
    'banner.image_mobile' => 'Opcional: versão vertical para celular (ideal 1080 × 1350 px). Vazio, o site usa a foto principal.',

    // Páginas do site
    'page.key' => 'Qual página do site é esta. Não muda.',
    'page.title' => 'Título que aparece no topo da página.',
    'page.intro' => 'Texto curto embaixo do título.',
    'page.content' => 'Monte a página com blocos: clique em "Adicionar" e escolha texto, imagem, vídeo, linha do tempo etc. Arraste para mudar a ordem.',
    'page.cover' => 'Banner do topo da página (ideal 2400 × 1000 px).',

    // Projeto
    'project.type' => 'Corporativo (hotéis, empresas) ou residencial.',
    'project.client_name' => 'Nome do cliente do projeto, ex.: Fazenda Boa Vista.',
    'project.architect' => 'Escritório de arquitetura, se puder ser divulgado.',
    'project.cover' => 'Foto principal do projeto, horizontal (ideal 2400 × 1600 px).',
    'project.products' => 'Peças da Franccino usadas no projeto. Aparecem na página do projeto.',

    // Loja
    'store.type' => 'Loja exclusiva Franccino ou revenda.',
    'store.state' => 'Sigla do estado, ex.: MG. É o filtro por estado da página de lojas.',
    'store.latitude' => 'Posição no mapa. No Google Maps, clique com o botão direito no endereço e copie o primeiro número.',
    'store.longitude' => 'Posição no mapa. No Google Maps, clique com o botão direito no endereço e copie o segundo número.',
    'store.whatsapp' => 'Só números, com DDD, ex.: 31999998888.',
    'store.opening_hours' => 'Ex.: Seg. a sex., 9h às 18h; sáb., 9h às 13h.',
    'store.image' => 'Foto da fachada ou do interior da loja, horizontal (ideal 1600 × 1200 px).',

    // Cliente
    'client.name' => 'Nome do cliente. Aparece ao passar o mouse sobre o logo.',
    'client.url' => 'Opcional: site do cliente.',
    'client.logo' => 'Logo em PNG com fundo transparente ou SVG, com pelo menos 400 px de largura.',

    // Acabamento
    'finish.finish_group_id' => 'Grupo do acabamento: madeiras, tecidos, couros, cordas, metais...',
    'finish.code' => 'Código do acabamento usado na fábrica, ex.: TAU-01.',
    'finish.swatch' => 'Foto quadrada da amostra (ideal 600 × 600 px), bem iluminada e sem sombra.',

    // Usuário
    'user.role' => 'Administrador vê tudo; Editor cadastra conteúdo; Atendimento só consulta mensagens.',
];
