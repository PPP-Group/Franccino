<?php

/*
 * Conteúdo da Central de ajuda, do tour de boas-vindas e da página inicial do painel.
 * As telas citadas usam os nomes do menu. Os links de cada guia ficam em App\Filament\Support\PanelGuides.
 */

return [
    'center' => [
        'title' => 'Ajuda e tutoriais',
        'intro' => 'Passo a passo de tudo o que dá para fazer no painel. Escolha um assunto abaixo. Em qualquer tela, o botão "Como preencher" traz o guia daquela tela.',
        'open_screen' => 'Abrir a tela',
        'steps' => 'Passo a passo',
        'tips' => 'Dicas',
        'video' => 'Vídeo',
        'restart_tour' => 'Ver o tour de boas-vindas de novo',
        'contents' => 'Assuntos',
    ],

    'contextual' => 'Como preencher',

    'sections' => [
        'start' => [
            'title' => 'Primeiros passos',
            'summary' => 'Como o painel funciona e como suas mudanças chegam ao site.',
            'steps' => [
                'O menu da esquerda é dividido em grupos: Catálogo (produtos, coleções, lançamentos, designers, acabamentos), Conteúdo (banners, páginas, projetos, lojas, clientes), Relacionamento (mensagens e newsletter) e Sistema.',
                'Para criar algo, entre na tela pelo menu e clique em "Criar", no canto superior direito. Para mudar algo que já existe, clique na linha da lista.',
                'Preencha os campos e clique em "Criar" (item novo) ou "Salvar alterações" (item existente). Nada vai ao site antes de salvar.',
                'Tudo que tem a chave "Publicado" só aparece no site quando ela está ligada. Desligada, o item fica como rascunho, visível só aqui.',
                'Depois de salvar, o site se atualiza sozinho em poucos minutos. Não é preciso fazer mais nada.',
                'Campos com as abas "Português" e "English": o português é obrigatório; o inglês é opcional. Sem inglês, o site em inglês mostra o texto em português.',
            ],
            'tips' => [
                'Use a busca do topo para achar qualquer produto, coleção ou designer pelo nome.',
                'Embaixo de cada campo há uma dica curta do que escrever ou enviar.',
                'Errou? Abra o item, corrija e salve de novo. Para tirar algo do site sem apagar, desligue "Publicado".',
            ],
        ],

        'products' => [
            'title' => 'Cadastrar um produto',
            'summary' => 'Peça nova do catálogo, com fotos, medidas, acabamentos e 3D.',
            'steps' => [
                'Menu Catálogo → Produtos → "Criar".',
                'Aba Geral: escreva o nome em português (o endereço da página se preenche sozinho). Escolha a área (Casa ou Giardini), a categoria, a linha e o designer.',
                'Aba Conteúdo: escreva a descrição e os materiais. O texto em inglês é opcional.',
                'Aba Medidas: clique em "Adicionar" e informe largura, profundidade e altura em milímetros. Peça com mais de um tamanho ganha uma linha por versão (ex.: "2,00 m" e "2,70 m").',
                'Depois de salvar, na lista Acabamentos (abaixo do formulário): "Anexar" para escolher os acabamentos da peça e arraste para mudar a ordem.',
                'Aba Mídia e 3D: envie a foto de capa (obrigatória para publicar) e, se tiver, as fotos da galeria e o arquivo 3D em GLB.',
                'Aba SEO: opcional. Vazio, o site usa o nome e a descrição.',
                'Ligue "Publicado" (aba Geral) e clique em "Criar".',
                'Para fichas técnicas e blocos SketchUp/DWG, abra o produto salvo e use a área "Arquivos" no fim da página.',
            ],
            'tips' => [
                'Foto de capa: fundo branco, peça centralizada e todas as peças no mesmo ângulo. Assim a lista do catálogo fica padronizada.',
                'Medidas sempre em milímetros: 2 metros = 2000.',
                'Marque "Destaque" só nas peças que devem aparecer primeiro.',
            ],
        ],

        'collections' => [
            'title' => 'Coleções',
            'summary' => 'Agrupar peças de uma coleção, com foto grande e texto de apresentação.',
            'steps' => [
                'Menu Catálogo → Coleções → "Criar".',
                'Escreva o nome, o resumo (uma frase) e a descrição.',
                'Depois de salvar, na lista Produtos (abaixo do formulário): "Anexar" para escolher as peças e arraste para pôr na ordem do site.',
                'Envie a capa: foto horizontal grande. Ela aparece no bloco da coleção e no topo da página.',
                'Ligue "Publicado" e clique em "Criar".',
            ],
            'tips' => [
                'A página de coleções mostra dois blocos por linha. Ao passar o mouse, a foto escurece e aparece o botão "Saiba mais".',
            ],
        ],

        'launches' => [
            'title' => 'Lançamentos',
            'summary' => 'Peças novas, com a etiqueta "Lançamentos" no catálogo.',
            'steps' => [
                'Menu Catálogo → Lançamentos → "Criar".',
                'Escreva o título (ex.: Coleção Tempo 25 anos), o resumo e o ano.',
                'Depois de salvar, na lista Produtos (abaixo do formulário): "Anexar" para escolher as peças lançadas e arraste para pôr na ordem do site. Elas ganham a etiqueta "Lançamentos".',
                'Envie a capa e ligue "Publicado".',
                'A foto do topo da página Lançamentos fica em Conteúdo → Páginas → Lançamentos → Capa.',
            ],
            'tips' => [
                'Todas as peças lançadas aparecem juntas na página Lançamentos.',
            ],
        ],

        'designers' => [
            'title' => 'Designers',
            'summary' => 'Quem assina as peças.',
            'steps' => [
                'Menu Catálogo → Designers → "Criar".',
                'Preencha nome, frase curta, texto completo e cidade.',
                'Envie o retrato vertical. O site mostra em preto e branco.',
                'Para ligar a peça ao designer, abra o produto e escolha o designer na aba Geral.',
            ],
            'tips' => [],
        ],

        'banners' => [
            'title' => 'Banner da página inicial',
            'summary' => 'As fotos grandes que trocam sozinhas no topo da página inicial.',
            'steps' => [
                'Menu Conteúdo → Banners → "Criar". Cada foto do carrossel é um banner.',
                'Em Posicionamento, escolha "Destaque da home".',
                'Escreva o título e o subtítulo (opcionais) e, se quiser um botão, o texto e o endereço dele.',
                'Envie a foto horizontal e, se tiver, a versão para celular.',
                'Ligue "Publicado" e clique em "Criar". Repita para cada foto.',
                'A ordem dos banners muda arrastando as linhas na lista.',
            ],
            'tips' => [
                'Use as datas de início e fim para banners de campanha: eles aparecem e somem sozinhos.',
                'Fotos com uma área mais calma deixam o texto mais legível.',
            ],
        ],

        'pages' => [
            'title' => 'Páginas do site (Fábrica, Corporativo, Projetos...)',
            'summary' => 'Textos, fotos, vídeo e linha do tempo das páginas institucionais.',
            'steps' => [
                'Menu Conteúdo → Páginas e clique na página (ex.: Fábrica).',
                'Capa: a foto do topo da página. Na Fábrica, use a foto da fachada.',
                'Em Conteúdo, monte a página com blocos: "Adicionar" e escolha o tipo (texto, imagem, imagem e texto, linha do tempo, vídeo, números, citação, galeria, perguntas frequentes).',
                'Vídeo: envie o arquivo MP4, que roda no próprio site (é o caso do filme da Fábrica), ou cole o endereço do YouTube ou Vimeo. Envie também uma imagem de capa: o vídeo só carrega quando a pessoa clica.',
                'Linha do tempo: um item por ano, com título e texto curto. O site mostra na horizontal, com setas.',
                'Arraste os blocos para mudar a ordem e clique em "Salvar alterações".',
            ],
            'tips' => [
                'Blocos curtos e com imagem são mais lidos que um texto longo.',
                'Vídeo no site: exporte em 1080p, MP4 (H.264), com até 150 MB. No HandBrake (gratuito), use a predefinição "Fast 1080p30" com "Web Optimized" marcado. Um vídeo de 3 minutos fica com cerca de 60 MB. Não envie o arquivo original em 4K.',
            ],
        ],

        'projects' => [
            'title' => 'Projetos e corporativo',
            'summary' => 'Hotéis, resorts e projetos com peças da Franccino.',
            'steps' => [
                'Menu Conteúdo → Projetos → "Criar".',
                'Escolha o tipo (corporativo ou residencial), o título e o texto.',
                'Preencha cliente, local, arquiteto e ano, se puderem ser divulgados.',
                'Em Produtos, escolha as peças usadas no projeto.',
                'Envie a capa e as fotos da galeria, ligue "Publicado" e salve.',
                'Os logos da faixa "Alguns de nossos clientes" ficam em Conteúdo → Clientes.',
            ],
            'tips' => [],
        ],

        'stores' => [
            'title' => 'Lojas',
            'summary' => 'Lojas e revendas, com foto e posição no mapa.',
            'steps' => [
                'Menu Conteúdo → Lojas → "Criar".',
                'Preencha nome, tipo (exclusiva ou revenda), endereço completo, cidade e a sigla do estado.',
                'Latitude e longitude: no Google Maps, clique com o botão direito no endereço; os dois números do topo são latitude e longitude. Sem eles, a loja não aparece no mapa.',
                'Preencha telefone, WhatsApp (só números) e horário.',
                'Envie a foto da loja, ligue "Publicado" e salve.',
            ],
            'tips' => [],
        ],

        'clients' => [
            'title' => 'Clientes (logos)',
            'summary' => 'A faixa "Alguns de nossos clientes" da página Corporativo.',
            'steps' => [
                'Menu Conteúdo → Clientes → "Criar".',
                'Escreva o nome e envie o logo (PNG com fundo transparente ou SVG).',
                'Ligue "Publicado" e salve. A ordem muda arrastando as linhas na lista.',
            ],
            'tips' => [],
        ],

        'finishes' => [
            'title' => 'Acabamentos',
            'summary' => 'Madeiras, tecidos, couros e cordas que aparecem nas páginas de produto.',
            'steps' => [
                'Primeiro os grupos: Catálogo → Grupos de acabamento (ex.: Madeiras, Tecidos).',
                'Depois cada acabamento: Catálogo → Acabamentos → "Criar". Escolha o grupo, escreva o nome e o código e envie a foto da amostra.',
                'Por fim, abra cada produto e anexe os acabamentos na lista Acabamentos, abaixo do formulário.',
            ],
            'tips' => [
                'Foto da amostra quadrada, com luz uniforme e sem sombra, para as amostras ficarem iguais lado a lado.',
            ],
        ],

        'downloads' => [
            'title' => 'Fichas técnicas e blocos (downloads)',
            'summary' => 'PDFs e arquivos SketchUp/DWG para arquitetos baixarem.',
            'steps' => [
                'Abra o produto (ou o designer, ou o lançamento) já salvo.',
                'No fim da página, na área "Arquivos", clique em "Criar".',
                'Escolha o tipo (ficha técnica, bloco 2D, bloco 3D, manual, catálogo...), dê um nome e envie o arquivo.',
                'O arquivo aparece no site como botão de download, com link temporário e registro de quem baixou.',
            ],
            'tips' => [
                'Bloco 3D = SketchUp (.skp). Bloco 2D = AutoCAD (.dwg).',
            ],
        ],

        'model3d' => [
            'title' => 'Visualizador 3D',
            'summary' => 'Mostrar a peça em 3D na página do produto.',
            'steps' => [
                'Abra o produto → aba Mídia e 3D.',
                'Em Modelo 3D, envie o arquivo em formato GLB (até 5 MB).',
                'Ligue "3D ativado" e salve. A página do produto ganha o botão "3D".',
            ],
            'tips' => [
                'Só o formato GLB funciona no site. Arquivos SketchUp entram como download (guia "Fichas técnicas e blocos").',
            ],
        ],

        'messages' => [
            'title' => 'Mensagens e newsletter',
            'summary' => 'Pedidos de contato e de orçamento que chegam pelo site.',
            'steps' => [
                'Menu Relacionamento → Mensagens de contato. As mais novas aparecem primeiro.',
                'Clique na mensagem para ver os dados e as peças pedidas.',
                'Inscritos na newsletter ficam em Relacionamento → Inscritos na newsletter. Dá para exportar a lista.',
            ],
            'tips' => [],
        ],

        'writing' => [
            'title' => 'Como escrever os textos',
            'summary' => 'Tom, tamanho e cuidados para os textos do site.',
            'steps' => [
                'Frases curtas e diretas. Um assunto por parágrafo.',
                'Fale da peça: inspiração, materiais, conforto e onde ela funciona bem.',
                'Não coloque preço, prazo de entrega nem promessas que podem mudar.',
                'Nomes de peças e coleções sempre com a mesma grafia (ex.: Coleção Tempo).',
                'O texto em inglês pode ficar para depois: sem ele, o site mostra o português.',
            ],
            'tips' => [
                'O título SEO (até 70 letras) e a descrição SEO (até 160 letras) são o que aparece no Google.',
            ],
        ],

        'photos' => [
            'title' => 'Padrão das fotos',
            'summary' => 'Tamanhos e cuidados para as fotos ficarem bonitas no site.',
            'steps' => [
                'Formato JPG ou PNG, até 10 MB. O site diminui e otimiza sozinho.',
                'Produto (capa): fundo branco, peça centralizada, mesma distância e mesmo ângulo em todas (três quartos, com um pouco da frente e da lateral).',
                'Banners e capas de página: horizontais, pelo menos 2400 px de largura.',
                'Retratos de designer: verticais, pelo menos 1200 px de largura.',
                'Logos de clientes: PNG com fundo transparente ou SVG.',
            ],
            'tips' => [
                'Evite fotos com texto escrito por cima: no celular, o texto fica pequeno demais.',
            ],
        ],

        'users' => [
            'title' => 'Usuários e acessos',
            'summary' => 'Quem entra no painel e o que cada um pode fazer.',
            'steps' => [
                'Menu Sistema → Usuários → "Criar" (só administradores).',
                'Informe nome, e-mail, o perfil (Administrador, Editor ou Atendimento) e uma senha inicial.',
                'Passe o e-mail e a senha inicial para a pessoa por um canal seguro. No primeiro acesso, ela troca a senha no próprio perfil (menu do canto superior direito).',
                'No mesmo perfil, cada pessoa pode ligar a verificação em duas etapas, com um app de autenticação no celular.',
            ],
            'tips' => [
                'Nunca compartilhe senha entre pessoas: o registro de atividades mostra quem fez cada mudança.',
            ],
        ],
    ],

    'tour' => [
        'next' => 'Próximo',
        'back' => 'Voltar',
        'skip' => 'Pular',
        'done' => 'Começar',
        'counter' => ':current de :total',
        'steps' => [
            ['title' => 'Bem-vindo ao painel da Franccino', 'body' => 'Aqui você cadastra e atualiza tudo o que aparece no site: produtos, coleções, lançamentos, páginas, lojas e mais. Este tour leva menos de um minuto.'],
            ['title' => 'O menu', 'body' => 'À esquerda ficam as telas, divididas em Catálogo, Conteúdo, Relacionamento e Sistema. A busca do topo acha qualquer item pelo nome.'],
            ['title' => 'Criar e salvar', 'body' => 'Em cada tela, "Criar" (canto superior direito) começa um item novo. Clique numa linha da lista para editar. Nada vai ao site antes de salvar.'],
            ['title' => 'Publicado ou rascunho', 'body' => 'Itens com a chave "Publicado" desligada ficam só aqui no painel. Ligue quando estiver pronto: o site se atualiza sozinho em poucos minutos.'],
            ['title' => 'Português e inglês', 'body' => 'Textos têm as abas "Português" e "English". O português é obrigatório; sem inglês, o site em inglês mostra o português.'],
            ['title' => 'Ajuda sempre à mão', 'body' => 'Embaixo de cada campo há uma dica. O botão "Como preencher" abre o passo a passo da tela, e "Ajuda e tutoriais" no menu reúne todos os guias.'],
        ],
    ],

    'dashboard' => [
        'title' => 'Início',
        'greeting' => 'Olá, :name',
        'welcome' => 'Este é o painel do site da Franccino. Comece pelos atalhos abaixo ou abra a central de ajuda.',
        'tour' => 'Ver o tour',
        'help' => 'Ajuda e tutoriais',
        'site' => 'Ver o site',
        'shortcuts' => 'Atalhos',
        'shortcut' => [
            'new_product' => 'Novo produto',
            'new_collection' => 'Nova coleção',
            'new_launch' => 'Novo lançamento',
            'banners' => 'Banner da página inicial',
            'pages' => 'Páginas do site',
            'stores' => 'Lojas',
            'clients' => 'Logos de clientes',
            'messages' => 'Mensagens',
        ],
        'health' => 'O que pede atenção',
        'stat' => [
            'published' => 'Produtos publicados',
            'published_hint' => ':count no total',
            'drafts' => 'Produtos em rascunho',
            'drafts_hint' => 'Não aparecem no site',
            'no_cover' => 'Produtos sem foto de capa',
            'no_cover_hint' => 'Precisam de foto para publicar',
            'no_description' => 'Produtos publicados sem descrição',
            'no_description_hint' => 'Aba Conteúdo do produto',
            'no_english' => 'Produtos sem nome em inglês',
            'no_english_hint' => 'O site em inglês mostra o português',
            'unread' => 'Mensagens não lidas',
            'unread_hint' => 'Relacionamento → Mensagens de contato',
            'no_recipients' => 'Mensagens do site sem destinatário',
            'no_recipients_value' => 'Ninguém recebe',
            'no_recipients_hint' => 'Cadastre os e-mails em Configurações → Contato',
            'job_failed_title' => 'Uma tarefa automática falhou',
            'job_failed_body' => ':job: :message. As próximas falhas iguais na próxima hora não geram aviso.',
        ],
    ],

    'login' => 'Painel do site da Franccino. Entre com o e-mail e a senha que você recebeu.',
    'topbar_help' => 'Ajuda',
    'english_tab_note' => 'Opcional. Sem texto em inglês, o site em inglês mostra o texto em português.',
];
