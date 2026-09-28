<?php

/*
 * Demo content for local development (P2 Task 14), taken from public pages of franccino.com.br on
 * 2026-09-28 (WP REST API + product, designer, collection, case and store pages). Temporary: the
 * client's own files replace it. Nothing here is invented: missing values stay null/empty, product
 * measurements that the site gives as ranges or alternatives are left out, English appears only on
 * names/slugs of about half the items so the pt fallback gets exercised.
 */

return [
    'categories' => [
        'sofas' => [
            'name' => [
                'pt' => 'Sofás',
                'en' => 'Sofas',
            ],
            'singular_name' => [
                'pt' => 'Sofá',
                'en' => 'Sofa',
            ],
            'slug' => [
                'pt' => 'sofas',
                'en' => 'sofas',
            ],
        ],
        'armchairs' => [
            'name' => [
                'pt' => 'Poltronas',
                'en' => 'Armchairs',
            ],
            'singular_name' => [
                'pt' => 'Poltrona',
                'en' => 'Armchair',
            ],
            'slug' => [
                'pt' => 'poltronas',
                'en' => 'armchairs',
            ],
        ],
        'chairs' => [
            'name' => [
                'pt' => 'Cadeiras',
                'en' => 'Chairs',
            ],
            'singular_name' => [
                'pt' => 'Cadeira',
                'en' => 'Chair',
            ],
            'slug' => [
                'pt' => 'cadeiras',
                'en' => 'chairs',
            ],
        ],
        'stools-benches' => [
            'name' => [
                'pt' => 'Banquetas e bancos',
                'en' => 'Stools and benches',
            ],
            'singular_name' => [
                'pt' => 'Banqueta',
                'en' => 'Stool',
            ],
            'slug' => [
                'pt' => 'banquetas-e-bancos',
                'en' => 'stools-and-benches',
            ],
        ],
        'dining-tables' => [
            'name' => [
                'pt' => 'Mesas de jantar',
                'en' => 'Dining tables',
            ],
            'singular_name' => [
                'pt' => 'Mesa de jantar',
                'en' => 'Dining table',
            ],
            'slug' => [
                'pt' => 'mesas-de-jantar',
                'en' => 'dining-tables',
            ],
        ],
        'coffee-tables' => [
            'name' => [
                'pt' => 'Mesas de centro',
                'en' => 'Coffee tables',
            ],
            'singular_name' => [
                'pt' => 'Mesa de centro',
                'en' => 'Coffee table',
            ],
            'slug' => [
                'pt' => 'mesas-de-centro',
                'en' => 'coffee-tables',
            ],
        ],
        'side-tables' => [
            'name' => [
                'pt' => 'Mesas laterais',
                'en' => 'Side tables',
            ],
            'singular_name' => [
                'pt' => 'Mesa lateral',
                'en' => 'Side table',
            ],
            'slug' => [
                'pt' => 'mesas-laterais',
                'en' => 'side-tables',
            ],
        ],
        'sideboards' => [
            'name' => [
                'pt' => 'Aparadores e buffets',
                'en' => 'Sideboards and buffets',
            ],
            'singular_name' => [
                'pt' => 'Aparador',
                'en' => 'Sideboard',
            ],
            'slug' => [
                'pt' => 'aparadores-e-buffets',
                'en' => 'sideboards-and-buffets',
            ],
        ],
        'poufs' => [
            'name' => [
                'pt' => 'Puffs',
                'en' => 'Poufs',
            ],
            'singular_name' => [
                'pt' => 'Puff',
                'en' => 'Pouf',
            ],
            'slug' => [
                'pt' => 'puffs',
                'en' => 'poufs',
            ],
        ],
        'swings' => [
            'name' => [
                'pt' => 'Balanços',
                'en' => 'Swings',
            ],
            'singular_name' => [
                'pt' => 'Balanço',
                'en' => 'Swing',
            ],
            'slug' => [
                'pt' => 'balancos',
                'en' => 'swings',
            ],
        ],
        'accessories' => [
            'name' => [
                'pt' => 'Acessórios',
                'en' => 'Accessories',
            ],
            'singular_name' => [
                'pt' => 'Acessório',
                'en' => 'Accessory',
            ],
            'slug' => [
                'pt' => 'acessorios',
                'en' => 'accessories',
            ],
        ],
    ],
    'designers' => [
        [
            'slug' => 'vinicius-siega',
            'name' => 'Vinícius Siega',
            'short_bio' => [
                'pt' => 'Vinícius Siega é designer de produtos laureado pela Universidade de Caxias do Sul, com extensão em design de interiores e design gráfico.',
            ],
            'bio' => [
                'pt' => '<p>Vinícius Siega é designer de produtos laureado pela Universidade de Caxias do Sul, com extensão em design de interiores e design gráfico. Natural da serra gaúcha, possui contato com a indústria do mobiliário há mais de uma década. Trabalhou para expoentes marcas de móveis, onde obteve experiências em design estratégico, branding, processos fabris de alta escala, direção criativa e mercados de consumo. Desde 2015 estabeleceu seu próprio estúdio de design, iniciando um envolvimento mais aprofundado em todas as etapas dos processos de criação enquanto estabelece seu trabalho autoral.</p>',
            ],
            'portrait' => 'https://franccino.com.br/wp-content/uploads/2026/01/FOTO-PERFIL-VINICIUS-SIEGA.webp',
            'legacy_wp_id' => 10828,
            'legacy_url' => 'https://franccino.com.br/designer/vinicius-siega/',
        ],
        [
            'slug' => 'andrea-zanocchi',
            'name' => 'Andrea Zanocchi',
            'short_bio' => [
                'pt' => 'traz ao desenho de produto uma leitura precisa entre técnica e sensibilidade. Formado pela tradição italiana do design industrial e com trajetória construída entre Europa e Brasil, seu trabalho nasce da observação do uso cotidiano e da relação íntima entre forma, função e tempo.',
            ],
            'bio' => [
                'pt' => '<p>traz ao desenho de produto uma leitura precisa entre técnica e sensibilidade. Formado pela tradição italiana do design industrial e com trajetória construída entre Europa e Brasil, seu trabalho nasce da observação do uso cotidiano e da relação íntima entre forma, função e tempo.</p><p>Cada peça é pensada como presença, em objetos que revelam seu valor na convivência diária, no gesto, no toque e na permanência. A atenção aos materiais, à qualidade construtiva e ao impacto consciente define um desenho durável, essencial e naturalmente atemporal.</p>',
            ],
            'portrait' => 'https://franccino.com.br/wp-content/uploads/2026/01/FOTO-PERFIL-ZANOCCHI.webp',
            'legacy_wp_id' => 10694,
            'legacy_url' => 'https://franccino.com.br/designer/andrea-zanocchi/',
        ],
        [
            'slug' => 'la-mamba',
            'name' => 'La Mamba',
            'short_bio' => [
                'pt' => 'Na La Mamba, respiramos design. Entendemos o design de uma perspectiva harmonizada e global.',
            ],
            'bio' => [
                'pt' => '<p>Na La Mamba, respiramos design. Entendemos o design de uma perspectiva harmonizada e global. De mãos dadas com nosso cliente, definimos a estética, a funcionalidade e a comunicação de cada produto, a partir de um ponto de vista humanista e lógico que abre novos horizontes. Somos especializados em design de produto, direção de arte, interiorismo, branding, arquitetura efêmera, direção artística e consultoria estratégica para empresas. Trazemos funcionalidade, sensibilidade, serenidade, equilíbrio e sutileza a cada projeto, que concebemos e desenvolvemos do início ao fim.</p>',
            ],
            'portrait' => 'https://franccino.com.br/wp-content/uploads/2025/03/La-Mamba-Foto.webp',
            'legacy_wp_id' => 7911,
            'legacy_url' => 'https://franccino.com.br/designer/la-mamba/',
        ],
        [
            'slug' => 'marina-linhares',
            'name' => 'Marina Linhares',
            'short_bio' => [
                'pt' => 'Marina Linhares desenvolve projetos de interiores há quase 30 anos, combinando com maestria sua sensibilidade para captar desejos e seu rigor com a qualidade.',
            ],
            'bio' => [
                'pt' => '<p>Marina Linhares desenvolve projetos de interiores há quase 30 anos, combinando com maestria sua sensibilidade para captar desejos e seu rigor com a qualidade. Seus projetos refletem a personalidade de cada cliente, suas histórias de vida, memórias afetivas e sonhos para o futuro.</p><p>Observadora e curiosa, Marina também cria móveis e objetos de decoração, além de uma linha de aromas para casa. Na Coleção Gerais, desenvolvida para a Franccino, ela misturou materiais com delicadeza e um olhar atento ao conforto.</p>',
            ],
            'portrait' => 'https://franccino.com.br/wp-content/uploads/2024/10/foto.jpg',
            'legacy_wp_id' => 6057,
            'legacy_url' => 'https://franccino.com.br/designer/marina-linhares/',
        ],
        [
            'slug' => 'daniela-ferro',
            'name' => 'Daniela Ferro',
            'short_bio' => [
                'pt' => 'Daniela Ferro formou-se em design pela Universidade Federal do Paraná. Desde o início de sua carreira, tem se dedicado ao design de móveis e hoje possui um portfólio extenso de criações, que abrange todas as tipologias do segmento.',
            ],
            'bio' => [
                'pt' => '<p>Daniela Ferro formou-se em design pela Universidade Federal do Paraná. Desde o início de sua carreira, tem se dedicado ao design de móveis e hoje possui um portfólio extenso de criações, que abrange todas as tipologias do segmento. Ela se inspira nos designers da Bauhaus e sua estética radicalmente moderna, passando pelos dinamarqueses e pelos grandes mestres brasileiros das décadas de 50 e 60, para um conceito contemporâneo, que é uma marca de suas notáveis criações. Seu design caracteriza-se pelo traço conciso e expressivo, pela harmonia de proporções e pelo conforto.</p>',
            ],
            'portrait' => 'https://franccino.com.br/wp-content/uploads/2024/04/Daniela-Ferro-100.jpg',
            'legacy_wp_id' => 3159,
            'legacy_url' => 'https://franccino.com.br/designer/daniela-ferro/',
        ],
        [
            'slug' => 'sergio-matos',
            'name' => 'Sérgio J. Matos',
            'short_bio' => [
                'pt' => 'Sergio J. Matos começou sua carreira em 2005, quando abriu seu estúdio.',
            ],
            'bio' => [
                'pt' => '<p>Sergio J. Matos começou sua carreira em 2005, quando abriu seu estúdio. Por ter nascido em uma região próxima à reserva indígena do Xingu, Sérgio aprendeu a admirar a cultura local.</p><p>A curiosidade pela diversidade da floresta, com seus materiais naturais, fez com que adotasse elementos regionais em seus trabalhos, se abastecendo de um referendado no caldeirão cultural. Sua estampa de originalidade está no feito à mão, com calor humano.</p>',
            ],
            'portrait' => 'https://franccino.com.br/wp-content/uploads/2024/01/Sergio-J-Matos-100.jpg',
            'legacy_wp_id' => 1802,
            'legacy_url' => 'https://franccino.com.br/designer/sergio-matos/',
        ],
        [
            'slug' => 'zanocchi-starke',
            'name' => 'Zanocchi & Starke',
            'short_bio' => [
                'pt' => 'Fundado em 2013, o estúdio de arquitetura e design Zanocchi & Starke se baseia na fusão e diversidade de experiências profissionais e culturais do arquiteto italiano Andrea Zanocchi e da designer brasileira Carolina Starke.',
            ],
            'bio' => [
                'pt' => '<p>Fundado em 2013, o estúdio de arquitetura e design Zanocchi & Starke se baseia na fusão e diversidade de experiências profissionais e culturais do arquiteto italiano Andrea Zanocchi e da designer brasileira Carolina Starke. A paixão pelo design faz com que a dupla explore em suas criações a capacidade de evocar emoções e transmitir uma história, transcendendo o mero uso e a utilidade da peça. O Estúdio detém premiações como o Brasil Design Awards, Museu da Casa Brasileira e Salão Design, além de ter participado de exposições em eventos como o Salone del Mobile, Paris Design Week, Bienal Iberoamericana de Diseño e DW! São Paulo Design Weekend.</p>',
            ],
            'portrait' => 'https://franccino.com.br/wp-content/uploads/2024/04/Zanocchi-Starke-100.jpg',
            'legacy_wp_id' => 3181,
            'legacy_url' => 'https://franccino.com.br/designer/zanocchi-starke/',
        ],
        [
            'slug' => 'zia-costa',
            'name' => 'Zia Costa',
            'short_bio' => [
                'pt' => 'Graduado em Design de Produtos em 2008 pela Faculdade de Engenharia e Arquitetura da Universidade Fumec e Pós-Graduado em Design de Móveis no ano de 2011 pela Universidade do Estado de Minas Gerais (UEMG).',
            ],
            'bio' => [
                'pt' => '<p>Graduado em Design de Produtos em 2008 pela Faculdade de Engenharia e Arquitetura da Universidade Fumec e Pós-Graduado em Design de Móveis no ano de 2011 pela Universidade do Estado de Minas Gerais (UEMG). A proximidade com os processos de produção rendeu experiências que influenciam no desenvolvimento de seus projetos, cuja preocupação é facilitar a produção em qualquer nível tecnológico.</p><p>Com um olhar criterioso, preocupado em desenvolver produtos que tenham boas características comerciais, o objetivo é projetar, de forma racional, minimizando processos, materiais e recursos construtivos. A partir de um conceito minimalista, busca o equilíbrio estético e funcional, sempre buscando soluções inteligentes, capazes de conferir ao produto beleza e autenticidade.</p>',
            ],
            'portrait' => 'https://franccino.com.br/wp-content/uploads/2024/04/Zia-Costa-100.jpg',
            'legacy_wp_id' => 3165,
            'legacy_url' => 'https://franccino.com.br/designer/zia-costa/',
        ],
        [
            'slug' => 'paulo-alves',
            'name' => 'Paulo Alves',
            'short_bio' => [
                'pt' => 'Formado em arquitetura na USP-São Carlos, Paulo Alves, em 20 anos de carreira, traz em seus trabalhos uma lógica criativa em que a madeira e suas características naturais e simbólicas é a protagonista.',
            ],
            'bio' => [
                'pt' => '<p>Formado em arquitetura na USP-São Carlos, Paulo Alves, em 20 anos de carreira, traz em seus trabalhos uma lógica criativa em que a madeira e suas características naturais e simbólicas é a protagonista. Sempre com resultados surpreendentes, sua maestria no trabalho autoral com madeira remete ao legado dos mestres do móvel moderno brasileiro.</p><p>Acreditando no potencial da Franccino em relação a metalurgia, Paulo desenvolveu peças em metal para a marca, com a mesma ideologia criativa da sua carreira.</p>',
            ],
            'portrait' => 'https://franccino.com.br/wp-content/uploads/2024/01/Paulo-Alves-100.jpg',
            'legacy_wp_id' => 1799,
            'legacy_url' => 'https://franccino.com.br/designer/paulo-alves/',
        ],
        [
            'slug' => 'bruno-rangel',
            'name' => 'Bruno Rangel',
            'short_bio' => [
                'pt' => 'Bruno Rangel, nascido em Campos dos Goytacazes, no interior do Rio de Janeiro, morou por 20 anos na capital fluminense, onde se formou em Design de Interiores pela Universidade Cândido Mendes e liderou o escritório de arquitetura com mais dois sócios até sua mudança para a capital paulista no início de 2019.',
            ],
            'bio' => [
                'pt' => '<p>Bruno Rangel, nascido em Campos dos Goytacazes, no interior do Rio de Janeiro, morou por 20 anos na capital fluminense, onde se formou em Design de Interiores pela Universidade Cândido Mendes e liderou o escritório de arquitetura com mais dois sócios até sua mudança para a capital paulista no início de 2019. Sua vida profissional foi construída com foco na arquitetura, mas sempre com um olhar voltado para os detalhes, principalmente os relacionados à marcenaria. Durante esses anos na arquitetura, desenhou algumas peças exclusivas para os clientes do escritório.</p><p>Sua dedicação ao design de mobiliário aumentou significativamente no final de 2017, quando uma grande loja especializada em design nacional sediada em São Paulo aprovou e decidiu lançar uma linha, que ocorreu no início de 2018. Uma das peças que compõem essa linha recebeu em 2019 uma menção honrosa no prêmio de design do Museu da Casa Brasileira.</p><p>A cultura indígena, o meio ambiente, a cultura popular e o cotidiano brasileiro são suas maiores referências e o que estimula seu desejo de criar e produzir algo novo.</p>',
            ],
            'portrait' => 'https://franccino.com.br/wp-content/uploads/2024/04/Bruno-Rangel-100.jpg',
            'legacy_wp_id' => 3178,
            'legacy_url' => 'https://franccino.com.br/designer/bruno-rangel/',
        ],
        [
            'slug' => 'maria-jose-canedo',
            'name' => 'Maria José Canêdo',
            'short_bio' => [
                'pt' => 'Graduada em Design de Produto e Design Gráfico pela PUC – RJ, especialista em Marketing pela UFMG, Mestre em Design e professora na Escola de Design da UEMG.',
            ],
            'bio' => [
                'pt' => '<p>Graduada em Design de Produto e Design Gráfico pela PUC – RJ, especialista em Marketing pela UFMG, Mestre em Design e professora na Escola de Design da UEMG. É professora do curso de Pós-Graduação em Design de Móveis da Escola de Design da UEMG.</p><p>Em seus projetos de mobiliário, concilia valores estéticos e funcionais do produto para que se tornem atraentes e prazerosos.</p>',
            ],
            'portrait' => 'https://franccino.com.br/wp-content/uploads/2024/04/Maria-Jose-Canedo-1.png',
            'legacy_wp_id' => 3168,
            'legacy_url' => 'https://franccino.com.br/designer/maria-jose-canedo/',
        ],
        [
            'slug' => 'isabela-vecci',
            'name' => 'Isabela Vecci',
            'short_bio' => [
                'pt' => 'Arquiteta e Mestre em Educação pela UFMG, Isabela Vecci busca inspiração especialmente no campo da História e da Filosofia para suas criações em espaços culturais, comerciais, residenciais e mobiliário.',
            ],
            'bio' => [
                'pt' => '<p>Arquiteta e Mestre em Educação pela UFMG, Isabela Vecci busca inspiração especialmente no campo da História e da Filosofia para suas criações em espaços culturais, comerciais, residenciais e mobiliário.</p><p>Inspirada na literatura e na história, a designer busca se apropriar de imagens – mentais ou materiais – para transformá-las em produtos de grande poesia.</p>',
            ],
            'portrait' => 'https://franccino.com.br/wp-content/uploads/2024/04/Isabela-Vecci-100.jpg',
            'legacy_wp_id' => 3175,
            'legacy_url' => 'https://franccino.com.br/designer/isabela-vecci/',
        ],
        [
            'slug' => 'coletivo-de-arquitetos',
            'name' => 'Coletivo de Arquitetos',
            'short_bio' => [
                'pt' => 'O Coletivo de Arquitetos é um estúdio formado pelos sócios arquitetos Guile Amadeu, Gustavo Fontes, Rodrigo Lacerda e por arquitetos parceiros, que atuam simultaneamente nas cidades de São Paulo e Aracaju.',
            ],
            'bio' => [
                'pt' => '<p>O Coletivo de Arquitetos é um estúdio formado pelos sócios arquitetos Guile Amadeu, Gustavo Fontes, Rodrigo Lacerda e por arquitetos parceiros, que atuam simultaneamente nas cidades de São Paulo e Aracaju. Seu foco principal de trabalho é o desenvolvimento de projetos de arquitetura, com áreas expandidas de interesse que incluem projeto de paisagismo, desenho urbano, intervenção em patrimônio histórico e design de objetos. Para atuar nessas diversas áreas, o coletivo conta com parcerias e colaborações de arquitetos especializados no desenvolvimento de soluções projetuais de forma coletiva.</p><p>Formou-se pela Universidade Federal de Santa Catarina em 2014 e posteriormente obteve pós-graduação pela Escola da Cidade (São Paulo). Durante sua trajetória acadêmica, dedicou-se a pesquisas e projetos com diferentes abordagens, buscando sempre complementar sua formação. Trabalhou em escritórios de arquitetura, atuou como avaliador de eficiência energética em edificações e fez parte da equipe responsável por representar o Brasil na competição internacional de casas solares Solar Decathlon Europe 2012, em Madri. Em 2011, realizou um intercâmbio acadêmico na Faculdade de Arquitetura e Urbanismo da Universidade de São Paulo (FAU – USP), onde cursou disciplinas e trabalhou no desenvolvimento da Casa Solar. No ano seguinte, participou de seu segundo intercâmbio, dessa vez internacional, ingressando na Escola Técnica Superior de Arquitetura da Universidade Politécnica de Madri (E.T.S.A.M – UPM).</p><p>Formou-se pela Fundação Armando Álvares Penteado em 2004 e especializou-se em Projeto de Arquitetura pela Universidade Presbiteriana Mackenzie em 2010. Colaborou com os escritórios Arquitetura de Hospitais Karman, com o Escritório Paulistano de Arquitetura e com o arquiteto Paulo Mendes da Rocha. Em suas atividades profissionais, obteve premiações em escala nacional, como a menção honrosa no 7° Prêmio Jovens Arquitetos IAB-SP com a Residência Aracaju em 2005. Em 2009, fundou o Coletivo de Arquitetos e, além das atividades desenvolvidas no escritório, é professor universitário nas disciplinas de Projeto de Arquitetura e Desenho Urbano em Aracaju, Sergipe.</p><p>Formou-se pela Fundação Armando Álvares Penteado em 2003. No ano seguinte, realizou sua primeira pós-graduação em Desenho e Cálculo de Estruturas pela Universidade Politécnica da Catalunya (UPC). Pela mesma universidade, especializou-se no curso Habitar La Casa em 2005. Durante os quatro anos em que permaneceu fora do Brasil, colaborou com o escritório EMBT – Miralles Tagliabue Arquitectes Associats. Paralelamente, participou de concursos em conjunto com outros dois arquitetos europeus, recebendo em 2006 o Primeiro Prêmio no Concurso de Requalificação de Área Urbana em Podenzano, Itália. No mesmo ano, com a mesma equipe de arquitetos, recebeu menção honrosa no Concurso para Biblioteca Municipal de Melzo, também na Itália. Em 2009, fundou o Coletivo de Arquitetos.</p>',
            ],
            'portrait' => 'https://franccino.com.br/wp-content/uploads/2024/04/Coletivo-de-Arquitetos-100.jpg',
            'legacy_wp_id' => 3172,
            'legacy_url' => 'https://franccino.com.br/designer/coletivo-de-arquitetos/',
        ],
        [
            'slug' => 'alva-design',
            'name' => 'Alva Design',
            'short_bio' => [
                'pt' => 'ALVA é um escritório de design de mobiliário e objetos, formado pelos irmãos Susana Bastos, artista e estilista, e Marcelo Alvarenga, arquiteto.',
            ],
            'bio' => [
                'pt' => '<p>ALVA é um escritório de design de mobiliário e objetos, formado pelos irmãos Susana Bastos, artista e estilista, e Marcelo Alvarenga, arquiteto.</p><p>Seus projetos são resultado do encontro desses dois olhares, o arquitetônico e o artístico, e para além da racionalidade e funcionalidade habituais, eles buscam o inusitado, os novos usos e uma expressiva materialidade.</p>',
            ],
            'portrait' => 'https://franccino.com.br/wp-content/uploads/2025/01/ghiu.webp',
            'legacy_wp_id' => 7540,
            'legacy_url' => 'https://franccino.com.br/designer/alva-design/',
        ],
        [
            'slug' => 'natalia-scarpati',
            'name' => 'Natália Scarpati',
            'short_bio' => [
                'pt' => 'Com uma jornada profissional marcada por um ano e meio de imersão em Barcelona, Natália teve o privilégio de ser orientada por renomados mestres espanhóis, enquanto completava um mestrado especializado em mobiliário residencial, comercial, hoteleiro e urbano.',
            ],
            'bio' => [
                'pt' => '<p>Com uma jornada profissional marcada por um ano e meio de imersão em Barcelona, Natália teve o privilégio de ser orientada por renomados mestres espanhóis, enquanto completava um mestrado especializado em mobiliário residencial, comercial, hoteleiro e urbano. Originária de Vila Velha, Vitória, essa experiência não apenas refinou suas habilidades técnicas, mas também enriqueceu sua visão de mundo, incorporando influências culturais diversas em sua prática.</p><p>Em seu processo criativo, Natália coloca grande ênfase na celebração dos materiais e dos processos. Ela reconhece que cada elemento, desde a escolha da matéria-prima até a técnica de fabricação, contribui para a identidade única de cada peça de mobiliário ou espaço projetado.</p>',
            ],
            'portrait' => 'https://franccino.com.br/wp-content/uploads/2024/04/Natalia-2-1.jpg',
            'legacy_wp_id' => 3409,
            'legacy_url' => 'https://franccino.com.br/designer/natalia-scarpati/',
        ],
        [
            'slug' => 'estudio-franccino',
            'name' => 'Estúdio Franccino',
            'short_bio' => [
                'pt' => 'Desenvolver um novo produto é criar sua história através dos estudos e projetos de criação. É pensar exatamente como ele vai fazer parte da vida das pessoas e agregar valor no ambiente em que for inserido.',
            ],
            'bio' => [
                'pt' => '<p>Desenvolver um novo produto é criar sua história através dos estudos e projetos de criação. É pensar exatamente como ele vai fazer parte da vida das pessoas e agregar valor no ambiente em que for inserido.</p><p>Atenta aos avanços tecnológicos e aos novos anseios das pessoas no jeito de morar, a Franccino busca o design contemporâneo desenvolvendo cada vez mais produtos de conforto e qualidade com detalhes exclusivos. Tudo para garantir bem estar e bom gosto na utilização das peças.</p><p>Os móveis da marca estão em constante evolução, acompanhando as últimas tendências nacionais e internacionais. A pesquisa de tendências e novos materiais orientam a construção dos produtos.</p><p>A cada Lançamento, criação e desenvolvimento caminham interligados com ideias que se materializam a partir de novas experiências e progresso alcançados.</p>',
            ],
            'portrait' => 'https://franccino.com.br/wp-content/uploads/2024/04/estudio-2.png',
            'legacy_wp_id' => 3231,
            'legacy_url' => 'https://franccino.com.br/designer/estudio-franccino/',
        ],
    ],
    'stores' => [
        [
            'name' => 'Franccino Curitiba',
            'type' => 'exclusive',
            'address_complement' => null,
            'address' => 'Alameda Doutor Carlos de Carvalho, 1024',
            'district' => 'Centro',
            'city' => 'Curitiba',
            'state' => 'PR',
            'postal_code' => '80430-180',
            'latitude' => -25.434620608011315,
            'longitude' => -49.28481312547529,
            'phone' => '41 9 9179 7019',
            'email' => null,
            'legacy_wp_id' => 11404,
        ],
        [
            'name' => 'Franccino Londrina',
            'type' => 'exclusive',
            'address_complement' => null,
            'address' => 'Av. Me. Leônia Milito, 1355',
            'district' => 'Bela Suíça',
            'city' => 'Londrina',
            'state' => 'PR',
            'postal_code' => '86050-270',
            'latitude' => -23.335083953278595,
            'longitude' => -51.17586610086236,
            'phone' => '43 3066 6473',
            'email' => 'atendimento@franccinolondrina.com.br',
            'legacy_wp_id' => 11358,
        ],
        [
            'name' => 'Franccino RJ',
            'type' => 'exclusive',
            'address_complement' => null,
            'address' => 'Av. Ayrton Senna, 2150',
            'district' => 'Barra da Tijuca',
            'city' => 'Rio de Janeiro',
            'state' => 'RJ',
            'postal_code' => '22775-900',
            'latitude' => -22.992746270737417,
            'longitude' => -43.36414300030496,
            'phone' => '21 9 7297-6720',
            'email' => 'rj.casashopping@franccino.com.br',
            'legacy_wp_id' => 2091,
        ],
        [
            'name' => 'Franccino Campinas',
            'type' => 'exclusive',
            'address_complement' => null,
            'address' => 'R. Gen. Osório, 1952',
            'district' => 'Cambuí',
            'city' => 'Campinas',
            'state' => 'SP',
            'postal_code' => '13025-155',
            'latitude' => -22.900584206484147,
            'longitude' => -47.05159867528176,
            'phone' => '19 99245-2887',
            'email' => 'vendas@franccinocampinas.com.br',
            'legacy_wp_id' => 7128,
        ],
        [
            'name' => 'Franccino Lourdes',
            'type' => 'exclusive',
            'address_complement' => null,
            'address' => 'Rua Marília de Dirceu, 204',
            'district' => 'Lourdes',
            'city' => 'Belo Horizonte',
            'state' => 'MG',
            'postal_code' => '30170-090',
            'latitude' => -19.934594186038765,
            'longitude' => -43.94654925545299,
            'phone' => '31 9 9746 9821',
            'email' => 'bh.lourdes@franccino.com.br',
            'legacy_wp_id' => 6383,
        ],
        [
            'name' => 'Franccino Ponteio',
            'type' => 'exclusive',
            'address_complement' => null,
            'address' => 'BR-356, 2500',
            'district' => 'Santa Lúcia',
            'city' => 'Belo Horizonte',
            'state' => 'MG',
            'postal_code' => '30320-901',
            'latitude' => -19.963453419223892,
            'longitude' => -43.940225403836145,
            'phone' => '31 9 9739-7984',
            'email' => 'bh.ponteio@franccino.com.br',
            'legacy_wp_id' => 6382,
        ],
        [
            'name' => 'Franccino Brasília',
            'type' => 'exclusive',
            'address_complement' => 'Casa Park',
            'address' => 'SGCV Sul Lote 22',
            'district' => 'Guará',
            'city' => 'Brasília',
            'state' => 'DF',
            'postal_code' => null,
            'latitude' => -15.826900391034416,
            'longitude' => -47.95348095236755,
            'phone' => '61 3532-2886',
            'email' => 'df.casapark@franccino.com.br',
            'legacy_wp_id' => 6368,
        ],
        [
            'name' => 'Franccino Casa Gabriel',
            'type' => 'exclusive',
            'address_complement' => null,
            'address' => 'Alameda Gabriel Monteiro da Silva, 1229',
            'district' => 'Jardim América',
            'city' => 'São Paulo',
            'state' => 'SP',
            'postal_code' => '01442-000',
            'latitude' => -23.57045660447006,
            'longitude' => -46.68029909023626,
            'phone' => '11 3062-0233',
            'email' => 'sp.gabriel.casa@franccino.com.br',
            'legacy_wp_id' => 2090,
        ],
        [
            'name' => 'Franccino Giardini Gabriel',
            'type' => 'exclusive',
            'address_complement' => null,
            'address' => 'Al. Gabriel Monteiro da Silva, 1094',
            'district' => 'Jardim América',
            'city' => 'São Paulo',
            'state' => 'SP',
            'postal_code' => '01442-000',
            'latitude' => -23.569230339223694,
            'longitude' => -46.679908903731494,
            'phone' => '11 3081-5980',
            'email' => 'sp.gabriel.giardini@franccino.com.br',
            'legacy_wp_id' => 6367,
        ],
        [
            'name' => 'Franccino Casa D&D',
            'type' => 'exclusive',
            'address_complement' => 'Piso superior',
            'address' => 'Av. das Nações Unidas, 12.555',
            'district' => 'Brooklin Novo',
            'city' => 'São Paulo',
            'state' => 'SP',
            'postal_code' => '04578-000',
            'latitude' => -23.5693582,
            'longitude' => -46.6799089,
            'phone' => '11 9 8604 5126',
            'email' => 'sp.dd.casa@franccino.com.br',
            'legacy_wp_id' => 4621,
        ],
        [
            'name' => 'Franccino Giardini D&D',
            'type' => 'exclusive',
            'address_complement' => 'Loja 321, piso superior',
            'address' => 'Av. das Nações Unidas, 12.555',
            'district' => 'Brooklin Novo',
            'city' => 'São Paulo',
            'state' => 'SP',
            'postal_code' => '04578-000',
            'latitude' => -23.60841888901148,
            'longitude' => -46.69484036344421,
            'phone' => '11 3043-6360',
            'email' => 'sp.dd.giardini@franccino.com.br',
            'legacy_wp_id' => 4620,
        ],
        [
            'name' => 'Grupo Robusti',
            'type' => 'reseller',
            'address_complement' => null,
            'address' => 'Av. Sumaré, 808',
            'district' => 'Jardim Sumaré',
            'city' => 'Ribeirão Preto',
            'state' => 'SP',
            'postal_code' => '14025-450',
            'latitude' => -21.193256434427543,
            'longitude' => -47.8089726576727,
            'phone' => '16 3329-4045',
            'email' => 'gruporobusti@robusti.com',
            'legacy_wp_id' => 9211,
        ],
    ],
    'collections' => [
        [
            'slug' => [
                'pt' => 'colecao-tempo',
                'en' => 'tempo-collection',
            ],
            'name' => [
                'pt' => 'Coleção TEMPO',
                'en' => 'TEMPO Collection',
            ],
            'summary' => [
                'pt' => 'Coleção TEMPO celebra os 25 anos da Franccino com móveis autorais que valorizam presença, conforto e design pensado para acompanhar a vida ao longo do tempo',
            ],
            'description' => [
                'pt' => '<p>A coleção TEMPO nasce de uma reflexão sobre aquilo que realmente permanece. Em um mundo marcado pela velocidade, a Franccino celebra seus 25 anos reafirmando um valor que sempre guiou seu fazer: criar móveis pensados para acompanhar a vida ao longo do tempo.</p><p>Desenvolvida em colaboração com os designers Daniela Ferro, Zia Costa, Studio La Mamba, Marina Linhares e o Estúdio Franccino, a coleção reúne peças que exploram equilíbrio, simplicidade e conforto. Cada desenho traduz uma relação cuidadosa entre matéria, proporção e uso — características que revelam a maturidade de um processo construído com atenção aos detalhes.</p><p>Mais do que objetos, as peças da coleção TEMPO foram criadas para receber encontros, pausas e memórias. São móveis que habitam o cotidiano com naturalidade, transformando momentos simples em experiências duradouras.</p>',
            ],
            'cover' => 'https://franccino.com.br/wp-content/uploads/2026/03/1920x500_OP.webp',
            'is_featured' => true,
            'products' => [
                'mesa-lateral-epoca',
                'cadeira-aura',
                'cadeira-toe',
                'mesa-lateral-rito',
                'cadeira-sopro',
                'poltrona-orvalho',
                'poltrona-so-corda',
                'mesa-de-centro-trem',
                'poltrona-terezinha',
                'sofa-antonio',
                'cadeira-melina',
                'sofa-royale',
                'mesa-joey',
                'buffet-heritage',
                'sofa-majestic',
            ],
            'legacy_wp_id' => 11010,
            'legacy_url' => 'https://franccino.com.br/colecoes/colecao-tempo/',
        ],
        [
            'slug' => [
                'pt' => 'colecao-traco',
            ],
            'name' => [
                'pt' => 'Coleção Traço',
            ],
            'summary' => [
                'pt' => 'Antes da forma, existe o traço. É ele que inaugura a intenção. Que define proporção, ritmo e estrutura. Por La Mamba, Vinícius Siega e Estúdio Franccino',
            ],
            'description' => [
                'pt' => '<p>A Coleção Traço reúne peças autorais assinadas por diferentes estúdios e designers, selecionadas sob um mesmo princípio: a valorização da estrutura como linguagem.</p><p>Sofás, poltronas, cadeiras, mesas e marcenarias compartilham uma mesma base conceitual — o desenho como fundamento da forma. Cada criação revela sua construção com naturalidade, equilibrando rigor arquitetônico e conforto sensorial.</p><p>Assinadas por La Mamba, Vinícius Siega e Estúdio Franccino, as peças transitam entre o residencial e o corporativo com elegância e versatilidade, compondo espaços que prezam por proporção e cuidado.</p>',
            ],
            'cover' => 'https://franccino.com.br/wp-content/uploads/2026/01/Traco.webp',
            'is_featured' => true,
            'products' => [
                'buffet-bloco',
                'cadeira-sirius',
                'mesa-polux',
            ],
            'legacy_wp_id' => 10745,
            'legacy_url' => 'https://franccino.com.br/colecoes/colecao-traco/',
        ],
        [
            'slug' => [
                'pt' => 'colecao-arp',
                'en' => 'arp-collection',
            ],
            'name' => [
                'pt' => 'Coleção ARP',
                'en' => 'ARP Collection',
            ],
            'summary' => [
                'pt' => 'Assinada por Andrea Zanocchi, a coleção conta com peças para serem utilizadas em áreas externas com um design inspirado na Pedra do Arpoador.',
            ],
            'description' => [
                'pt' => '<p>Inspirada na Pedra do Arpoador, a coleção ARP traduz o equilíbrio entre solidez e leveza em peças de desenho preciso e uso versátil. Assinada por</p>',
            ],
            'cover' => 'https://franccino.com.br/wp-content/uploads/2026/01/ARP-1.webp',
            'is_featured' => true,
            'products' => [
                'mesa-de-centro-arp',
                'mesa-de-jantar-arp',
                'banco-arp',
                'cadeira-arp',
            ],
            'legacy_wp_id' => 10693,
            'legacy_url' => 'https://franccino.com.br/colecoes/colecao-arp/',
        ],
        [
            'slug' => [
                'pt' => 'colecao-avito',
            ],
            'name' => [
                'pt' => 'Coleção Avito',
            ],
            'summary' => [
                'pt' => 'A Coleção Avito é aquela sensação de Descanso e aconchego em voltar a criação, em um lugar de acolhimento e conforto. Ter a certeza de que lendas, mistérios, e aquele olhar para o conhecido nos leva a acreditar que tudo tem um começo.',
            ],
            'description' => [
                'pt' => '<p>A Coleção Avito é aquela sensação de Descanso e aconchego em voltar a criação, em um lugar de acolhimento e conforto. Ter a certeza de que lendas, mistérios, e aquele olhar para o conhecido nos leva a acreditar que tudo tem um começo.</p>',
            ],
            'cover' => 'https://franccino.com.br/wp-content/uploads/2025/03/Avito-1.webp',
            'is_featured' => true,
            'products' => [
                'poltrona-noa',
                'cadeira-noa',
                'mesa-de-jantar-noa',
                'sofa-noa',
            ],
            'legacy_wp_id' => 7914,
            'legacy_url' => 'https://franccino.com.br/colecoes/7914/',
        ],
        [
            'slug' => [
                'pt' => 'colecao-gerais',
                'en' => 'gerais-collection',
            ],
            'name' => [
                'pt' => 'Coleção Gerais',
                'en' => 'Gerais Collection',
            ],
            'summary' => [
                'pt' => 'Costuma-se dizer que Minas Gerais não é apenas um estado, é um país. Tem seus costumes, suas tradições e até seu próprio ’mineirês’, um pequeno dicionário de expressões regionais.',
            ],
            'description' => [
                'pt' => '<p>Costuma-se dizer que Minas Gerais não é apenas um estado, é um país. Tem seus costumes, suas tradições e até seu próprio ’mineirês’, um pequeno dicionário de expressões regionais.</p><p>Cada palavra tem um significado especial, com uma timidez característica que esconde segredos de estado. E assim é GERAIS: um lugar que reúne um pouco de tudo, agregando e trazendo para si o aconchego de ser tradicional.</p>',
            ],
            'cover' => 'https://franccino.com.br/wp-content/uploads/2024/10/Gerais.webp',
            'is_featured' => false,
            'products' => [
                'banqueta-arreda',
                'cadeira-arreda',
            ],
            'legacy_wp_id' => 6065,
            'legacy_url' => 'https://franccino.com.br/colecoes/colecao-gerais/',
        ],
        [
            'slug' => [
                'pt' => 'colecao-caminhos',
            ],
            'name' => [
                'pt' => 'Coleção Caminhos',
            ],
            'summary' => [
                'pt' => 'Guiados pelas estrelas e pela posição no universo, por mapas ou orientados por cartas cartográficas, os caminhos são o meio para se chegar ao destino, para se encontrar e apreciar a jornada.',
            ],
            'description' => [
                'pt' => '<p>Guiados pelas estrelas e pela posição no universo, por mapas ou orientados por cartas cartográficas, os caminhos são o meio para se chegar ao destino, para se encontrar e apreciar a jornada.</p><p>Os caminhos representam a oportunidade de se encontrar, sendo a parte divertida da jornada para alcançar o destino. Sair de um ponto de partida e conduzir uma jornada é o que permite ao designer se inspirar, dando-lhe a liberdade de criar e de mover seus pensamentos. Utilizar as estrelas como guia, ser como uma rosa dos ventos que aponta para o Norte. A Coleção Caminhos nos move, nos conduz e se torna um mapa de emoções e sentimentos.</p><p>Os antigos desbravadores e conquistadores sempre buscaram riquezas, almejando preciosidades. As peças da Coleção Caminhos são como as preciosidades de cada designer, foram Estrelas Guia e agora são peças raras.</p>',
            ],
            'cover' => 'https://franccino.com.br/wp-content/uploads/2024/10/Caminhos-1.webp',
            'is_featured' => false,
            'products' => [
                'cadeira-cancun-2',
                'cadeira-luzy-com-braco',
                'cadeira-luzy-sem-braco',
                'sofa-sol',
            ],
            'legacy_wp_id' => 3192,
            'legacy_url' => 'https://franccino.com.br/colecoes/colecao-caminhos/',
        ],
        [
            'slug' => [
                'pt' => 'colecao-encontro',
                'en' => 'encontro-collection',
            ],
            'name' => [
                'pt' => 'Coleção Encontro',
                'en' => 'Encontro Collection',
            ],
            'summary' => [
                'pt' => 'Estar junto de quem se gosta é uma das melhores sensações que podemos vivenciar. A boa conversa, os sorrisos e o afeto fluem por nós ativando ondas de prazer que nos fazem sentir vivos. Com a experiência da pandemia, passamos a valorizar ainda mais a arte do encontro e reconhecer o quão significativo ele é para o cotidiano.',
            ],
            'description' => [
                'pt' => '<p>Estar junto de quem se gosta é uma das melhores sensações que podemos vivenciar. A boa conversa, os sorrisos e o afeto fluem por nós ativando ondas de prazer que nos fazem sentir vivos. Com a experiência da pandemia, passamos a valorizar ainda mais a arte do encontro e reconhecer o quão significativo ele é para o cotidiano.</p>',
            ],
            'cover' => 'https://franccino.com.br/wp-content/uploads/2024/10/Encontro.webp',
            'is_featured' => false,
            'products' => [
                'sofa-snodo',
                'poltrona-irani',
                'poltrona-caete',
                'mesa-de-jantar-duna',
            ],
            'legacy_wp_id' => 3184,
            'legacy_url' => 'https://franccino.com.br/colecoes/colecao-encontro/',
        ],
        [
            'slug' => [
                'pt' => 'colecao-horizonte',
            ],
            'name' => [
                'pt' => 'Coleção Horizonte',
            ],
            'summary' => [
                'pt' => 'Entre linhas e contornos, o horizonte inspira por propiciar cenários únicos que confortam. Ponto de contemplação, diante dele são criadas novas perspectivas e estimulados sonhos, ideias, esperança… harmonia. Sensação de esvaziamento do caos para o preenchimento de motivação. Um trabalho minucioso da natureza que atrai, resiste e proporciona bem-estar no contato.',
            ],
            'description' => [
                'pt' => '<p>Entre linhas e contornos, o horizonte inspira por propiciar cenários únicos que confortam. Ponto de contemplação, diante dele são criadas novas perspectivas e estimulados sonhos, ideias, esperança… harmonia. Sensação de esvaziamento do caos para o preenchimento de motivação. Um trabalho minucioso da natureza que atrai, resiste e proporciona bem-estar no contato.</p><p>A junção de todos esses elementos é o nosso incentivo para a criação de peças acolhedoras. Nesse conceito, apresentamos uma linha com móveis exclusivos que abarcam a expressão do belo em encaixes perfeitos e formas que aconchegam.</p><p>Aliando a curadoria e criatividade do nosso talentoso time de designers ao alto padrão dos processos de fabricação Franccino, conceberemos itens capazes de levar vida a cada espaço.</p>',
            ],
            'cover' => 'https://franccino.com.br/wp-content/uploads/2024/10/Horizonte.webp',
            'is_featured' => false,
            'products' => [
                'balanco-alfaia',
                'sofa-mares',
                'sofa-dara',
                'sofa-alba',
            ],
            'legacy_wp_id' => 3197,
            'legacy_url' => 'https://franccino.com.br/colecoes/colecao-horizonte/',
        ],
        [
            'slug' => [
                'pt' => 'colecao-elo',
                'en' => 'elo-collection',
            ],
            'name' => [
                'pt' => 'Coleção Elo',
                'en' => 'Elo Collection',
            ],
            'summary' => [
                'pt' => 'A conexão entre as peças, o designer e a natureza. A união entre matéria-prima e design trazendo maior conforto e tranquilidade. Mostrando cada item como mais do que uma decoração, mas também parte das memórias, parte da família. A coleção apresenta um lado único de cada elemento como componente de ambientes exclusivos e harmônicos. Somos estimulados pela arte de transformar matérias-primas em peças, com formas e design que unem sofisticação e conforto.',
            ],
            'description' => [
                'pt' => '<p>A conexão entre as peças, o designer e a natureza. A união entre matéria-prima e design trazendo maior conforto e tranquilidade. Mostrando cada item como mais do que uma decoração, mas também parte das memórias, parte da família. A coleção apresenta um lado único de cada elemento como componente de ambientes exclusivos e harmônicos. Somos estimulados pela arte de transformar matérias-primas em peças, com formas e design que unem sofisticação e conforto.</p><p>O elo entre o belo e o artesanal, o cuidado em unir em uma peça conceitos que agreguem ao ambiente sofisticação e tecnologia, proporcionando uma experiência única e sensorial. Permitindo que cada fibra e matéria-prima usada entreguem uma nova percepção da maneira como móveis em alto padrão nos permitem explorar nossa intimidade com quem amamos e queremos por perto. Aconchego em cada detalhe, beleza funcional.</p>',
            ],
            'cover' => 'https://franccino.com.br/wp-content/uploads/2024/04/Elo-1.webp',
            'is_featured' => false,
            'products' => [
                'banqueta-turin',
                'poltrona-bras',
            ],
            'legacy_wp_id' => 3212,
            'legacy_url' => 'https://franccino.com.br/colecoes/colecao-elo/',
        ],
        [
            'slug' => [
                'pt' => 'colecao-origem',
            ],
            'name' => [
                'pt' => 'Coleção Origem',
            ],
            'summary' => [
                'pt' => 'Todo ciclo possui o seu ponto de partida. Um movimento que direciona muitas de nossas ações ao longo da vida. Mudamos conforme novas experiências e bagagem, mas nossa ORIGEM é o ponto ao qual constantemente retornamos. Ela sustenta muito do que somos e construímos. Nossa identidade. Nossa marca. Nossa autenticidade e relevância para o mundo.',
            ],
            'description' => [
                'pt' => '<p>Todo ciclo possui o seu ponto de partida. Um movimento que direciona muitas de nossas ações ao longo da vida. Mudamos conforme novas experiências e bagagem, mas nossa ORIGEM é o ponto ao qual constantemente retornamos. Ela sustenta muito do que somos e construímos. Nossa identidade. Nossa marca. Nossa autenticidade e relevância para o mundo.</p><p>Em seus 20 anos de história, a Franccino ampara-se na riqueza de particularidade do ciclo de cada indivíduo para o lançamento da coleção Origem. Com a parceria de profissionais reconhecidos no design de móveis e produtos patenteados, explora a máxima experiência de conforto e sofisticação em suas formas, aliando o alto padrão de seu DNA às tendências do mercado para a casa contemporânea.</p>',
            ],
            'cover' => 'https://franccino.com.br/wp-content/uploads/2024/04/Origem.webp',
            'is_featured' => false,
            'products' => [
                'banqueta-helena',
                'poltrona-helena',
                'buffet-juno',
                'sofa-tasca',
            ],
            'legacy_wp_id' => 3202,
            'legacy_url' => 'https://franccino.com.br/colecoes/3202/',
        ],
        [
            'slug' => [
                'pt' => 'colecao-outset',
                'en' => 'outset-collection',
            ],
            'name' => [
                'pt' => 'Coleção Outset',
                'en' => 'Outset Collection',
            ],
            'summary' => [
                'pt' => 'Com a proposta de atualizar os conceitos da marca em termos de inspiração, criação e desenvolvimento, a Coleção Outset apresenta acabamentos e combinações inéditas na Franccino, além de explorar bastante das curvas e formas das estruturas das peças.',
            ],
            'description' => [
                'pt' => '<p>Com a proposta de atualizar os conceitos da marca em termos de inspiração, criação e desenvolvimento, a Coleção Outset apresenta acabamentos e combinações inéditas na Franccino, além de explorar bastante das curvas e formas das estruturas das peças.</p><p>A grande novidade da coleção é a inserção da corda no mix de produtos. Material que já estava em forte ascendência no mercado e que o Estúdio Franccino, através de pesquisa detalhada e o estudo completo desse acabamento, lança peças que vão se destacar não só no nosso showroom, mas também nos seus ambientes.</p><p>Com combinações de cores envolventes e refinadas, os produtos com revestimento em corda encantam também pelas tramas feitas em um trabalho artesanal, o que valoriza e deixa a peça ainda mais sofisticada.</p><p>Além da corda, novas cores de laca, lâmina, pintura eletrostática, telas e fibras são lançadas para abrir o leque de acabamentos na marca.</p>',
            ],
            'cover' => 'https://franccino.com.br/wp-content/uploads/2024/01/Outset.webp',
            'is_featured' => false,
            'products' => [
                'cadeira-marcela-sem-braco-2',
                'almofada-zoe',
                'almofada-sim',
                'poltrona-turin',
            ],
            'legacy_wp_id' => 3227,
            'legacy_url' => 'https://franccino.com.br/colecoes/colecao-outset/',
        ],
    ],
    'products' => [
        [
            'slug' => [
                'pt' => 'mesa-lateral-epoca',
                'en' => 'epoca-side-table',
            ],
            'name' => [
                'pt' => 'Mesa Lateral Época',
                'en' => 'Época Side Table',
            ],
            'area' => 'indoor',
            'category' => 'side-tables',
            'designer' => 'estudio-franccino',
            'tagline' => [
                'pt' => 'Formas que atravessam as épocas',
            ],
            'description' => [
                'pt' => '<p>A Mesa Época traduz a ideia de permanência através da matéria. Sua estrutura em madeira sustenta superfícies que combinam pedra ou MDF, criando um diálogo entre solidez e delicadeza.</p><p>O desenho simples e bem resolvido permite que a peça transite entre diferentes ambientes e composições, funcionando tanto como mesa lateral quanto como mesa de centro. Desenvolvida pelo Estúdio Franccino para a coleção TEMPO, a peça reflete a essência da marca: criar móveis que não pertencem apenas a um momento, mas que acompanham diferentes fases da vida com naturalidade e elegância.</p>',
            ],
            'dimensions' => [],
            'materials' => [
                'pt' => 'Estrutura em madeira tauari tingida, contratampo em MDF laqueado e tampo em pedra ou MDF laminado ou laqueado.',
            ],
            'finishes_note' => [
                'pt' => 'Estrutura em madeira tauari tingida com contratampo em MDF laqueado. Tampo disponível em pedra natural ou MDF laminado ou laqueado.',
            ],
            'cover' => 'https://franccino.com.br/wp-content/uploads/2026/03/Epoca-3-scaled.webp',
            'is_featured' => true,
            'legacy_wp_id' => 11128,
            'legacy_url' => 'https://franccino.com.br/produto/mesa-lateral-epoca-2/',
        ],
        [
            'slug' => [
                'pt' => 'cadeira-aura',
            ],
            'name' => [
                'pt' => 'Cadeira Aura',
            ],
            'area' => 'outdoor',
            'category' => 'chairs',
            'designer' => 'estudio-franccino',
            'tagline' => [
                'pt' => 'Presenças sutis que transformam o ambiente',
            ],
            'description' => [
                'pt' => '<p>A Cadeira Aura nasce daquilo que não se impõe, mas se percebe. Seu desenho privilegia linhas suaves e proporções equilibradas, criando uma presença silenciosa que se integra naturalmente ao espaço.</p><p>Assento e encosto estofados ampliam a sensação de conforto, enquanto a estrutura revela o cuidado construtivo característico da Franccino. Desenvolvida pelo Estúdio Franccino para a coleção TEMPO, a peça traduz a ideia de que certos elementos não precisam de protagonismo para marcar presença — assim como o tempo, que muitas vezes se revela nas atmosferas mais sutis do cotidiano.</p>',
            ],
            'dimensions' => [
                [
                    'label' => null,
                    'width' => 600,
                    'depth' => 600,
                    'height' => 750,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => [
                'pt' => 'Estrutura em madeira freijó ou cumaru com almofadas soltas de assento e encosto.',
            ],
            'finishes_note' => [
                'pt' => 'Estrutura em madeira freijó ou cumaru com acabamentos em verniz ou stain natural. Almofadas estofadas com tecidos personalizáveis.',
            ],
            'cover' => 'https://franccino.com.br/wp-content/uploads/2026/03/Aura-1-scaled.webp',
            'is_featured' => true,
            'legacy_wp_id' => 11122,
            'legacy_url' => 'https://franccino.com.br/produto/cadeira-aura/',
        ],
        [
            'slug' => [
                'pt' => 'cadeira-toe',
                'en' => 'toe-chair',
            ],
            'name' => [
                'pt' => 'Cadeira Toé',
                'en' => 'Toé Chair',
            ],
            'area' => 'indoor',
            'category' => 'chairs',
            'designer' => 'estudio-franccino',
            'tagline' => [
                'pt' => 'Movimentos leves no ritmo do tempo',
            ],
            'description' => [
                'pt' => '<p>A Cadeira Toé nasce da ideia de movimento natural no cotidiano. Seu desenho estofado cria uma presença acolhedora, enquanto a base com rodízios permite deslocamentos suaves e intuitivos, acompanhando o ritmo de quem vive o espaço.</p><p>As proporções equilibradas e o conforto do estofamento convidam a permanecer, seja em uma conversa prolongada, em uma refeição ou em um momento de pausa. Desenvolvida pelo Estúdio Franccino para a coleção TEMPO, a peça revela que o tempo também se manifesta nos pequenos gestos — nos movimentos simples que tornam os ambientes mais vivos e dinâmicos.</p>',
            ],
            'dimensions' => [
                [
                    'label' => null,
                    'width' => 620,
                    'depth' => 620,
                    'height' => 750,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => [
                'pt' => 'Estrutura em compensado estofado com base equipada com rodízios.',
            ],
            'finishes_note' => [
                'pt' => 'Estrutura totalmente estofada com tecidos personalizáveis e base com rodízios que permitem mobilidade no uso.',
            ],
            'cover' => 'https://franccino.com.br/wp-content/uploads/2026/03/Toe-1-scaled.webp',
            'is_featured' => true,
            'legacy_wp_id' => 11119,
            'legacy_url' => 'https://franccino.com.br/produto/cadeira-toe/',
        ],
        [
            'slug' => [
                'pt' => 'mesa-lateral-rito',
            ],
            'name' => [
                'pt' => 'Mesa lateral Rito',
            ],
            'area' => 'indoor',
            'category' => 'side-tables',
            'designer' => 'estudio-franccino',
            'tagline' => [
                'pt' => 'Pequenos rituais que marcam o tempo.',
            ],
            'description' => [
                'pt' => '<p>A Mesa Lateral Rito nasce da observação dos gestos cotidianos que, repetidos ao longo do tempo, se transformam em rituais. Seu desenho combina a presença sólida da base com a leveza da estrutura metálica, criando uma peça equilibrada e discreta que se integra naturalmente ao ambiente.</p><p>O tampo delicado completa a composição e oferece apoio para os objetos que acompanham os momentos do dia — um livro, uma xícara, uma pausa. Desenvolvida pelo Estúdio Franccino para a coleção TEMPO, a mesa celebra aquilo que permanece: os pequenos hábitos que constroem a atmosfera de um espaço vivido.</p>',
            ],
            'dimensions' => [],
            'materials' => [
                'pt' => 'Base em pedra ou MDF laminado ou laqueado, tampo em MDF laminado ou laqueado e estrutura em aço.',
            ],
            'finishes_note' => [
                'pt' => 'Base disponível em pedra natural ou MDF laminado ou laqueado. Estrutura em aço com acabamento laqueado ou pintura eletrostática e tampo em MDF laminado ou laqueado.',
            ],
            'cover' => 'https://franccino.com.br/wp-content/uploads/2026/03/Rito-3-scaled.webp',
            'is_featured' => true,
            'legacy_wp_id' => 11116,
            'legacy_url' => 'https://franccino.com.br/produto/mesa-lateral-rito/',
        ],
        [
            'slug' => [
                'pt' => 'cadeira-sopro',
                'en' => 'sopro-chair',
            ],
            'name' => [
                'pt' => 'Cadeira Sopro',
                'en' => 'Sopro Chair',
            ],
            'area' => 'indoor',
            'category' => 'chairs',
            'designer' => 'estudio-franccino',
            'tagline' => [
                'pt' => 'A leveza de um instante',
            ],
            'description' => [
                'pt' => '<p>A Cadeira Sopro nasce da ideia de leveza. Seu desenho revela uma estrutura delicada que sustenta assento e encosto estofados, criando equilíbrio entre presença e suavidade.</p><p>As proporções precisas permitem que a peça se integre ao ambiente com naturalidade, oferecendo conforto sem excessos. Desenvolvida pelo Estúdio Franccino para a coleção TEMPO, a cadeira convida a valorizar os pequenos instantes — aqueles momentos simples que passam quase como um sopro, mas permanecem na memória.</p>',
            ],
            'dimensions' => [
                [
                    'label' => null,
                    'width' => 600,
                    'depth' => 560,
                    'height' => 750,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => [
                'pt' => 'Estrutura em aço com assento e encosto estofados.',
            ],
            'finishes_note' => [
                'pt' => 'Estrutura em aço com acabamento laqueado ou pintura eletrostática. Assento e encosto estofados com tecidos personalizáveis.',
            ],
            'cover' => 'https://franccino.com.br/wp-content/uploads/2026/03/Sopro-1-scaled.webp',
            'is_featured' => true,
            'legacy_wp_id' => 11113,
            'legacy_url' => 'https://franccino.com.br/produto/cadeira-sopro/',
        ],
        [
            'slug' => [
                'pt' => 'poltrona-orvalho',
            ],
            'name' => [
                'pt' => 'Poltrona Orvalho',
            ],
            'area' => 'indoor',
            'category' => 'armchairs',
            'designer' => 'estudio-franccino',
            'tagline' => [
                'pt' => 'Silêncios que repousam no tempo',
            ],
            'description' => [
                'pt' => '<p>A Poltrona Orvalho traduz a delicadeza dos momentos que surgem sem pressa. Sua estrutura em madeira sustenta volumes estofados que acolhem o corpo com naturalidade, criando uma presença serena no ambiente.</p><p>O desenho privilegia proporções equilibradas e uma construção cuidadosa, onde cada detalhe reforça a sensação de conforto e permanência. Desenvolvida pelo Estúdio Franccino, a peça integra a coleção TEMPO ao lembrar que os instantes mais simples — como uma pausa silenciosa ou uma leitura tranquila — são aqueles que permanecem na memória.</p>',
            ],
            'dimensions' => [
                [
                    'label' => null,
                    'width' => 630,
                    'depth' => 670,
                    'height' => 675,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => [
                'pt' => 'Estrutura em compensado estofado com detalhe de encosto em MDF laminado ou laqueado e base giratória.',
            ],
            'finishes_note' => [
                'pt' => 'Estrutura estofada com detalhe de encosto em MDF laminado ou laqueado e base giratória laqueada ou com pintura eletrostática.',
            ],
            'cover' => 'https://franccino.com.br/wp-content/uploads/2026/03/Orvalho-2-scaled.webp',
            'is_featured' => true,
            'legacy_wp_id' => 11110,
            'legacy_url' => 'https://franccino.com.br/produto/poltrona-orvalho/',
        ],
        [
            'slug' => [
                'pt' => 'poltrona-so-corda',
                'en' => 'so-corda-armchair',
            ],
            'name' => [
                'pt' => 'Poltrona Sô (corda)',
                'en' => 'Sô (corda) Armchair',
            ],
            'area' => 'outdoor',
            'category' => 'armchairs',
            'designer' => 'marina-linhares',
            'tagline' => [
                'pt' => 'Tramas que acolhem o tempo',
            ],
            'description' => [
                'pt' => '<p>A Poltrona Sô traduz o conforto por meio da leveza e da textura. Sua estrutura em alumínio sustenta uma trama delicada em corda, criando um desenho que equilibra transparência visual e acolhimento.</p><p>Os detalhes em madeira adicionam calor ao conjunto e revelam o cuidado com cada material que compõe a peça. Assinada por Marina Linhares, a poltrona integra a coleção TEMPO como um convite à convivência — um lugar para desacelerar, compartilhar conversas e viver os encontros com serenidade.</p>',
            ],
            'dimensions' => [
                [
                    'label' => null,
                    'width' => 800,
                    'depth' => 800,
                    'height' => 750,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => [
                'pt' => 'Estrutura em alumínio com trama em corda e detalhes em madeira freijó ou cumaru, com almofadas estofadas.',
            ],
            'finishes_note' => [
                'pt' => 'Estrutura em alumínio com pintura eletrostática e trama em corda de 6 mm. Detalhes em madeira freijó ou cumaru e almofadas estofadas personalizáveis.',
            ],
            'cover' => 'https://franccino.com.br/wp-content/uploads/2026/03/Frame-870-scaled.webp',
            'is_featured' => true,
            'legacy_wp_id' => 11107,
            'legacy_url' => 'https://franccino.com.br/produto/poltrona-so-corda/',
        ],
        [
            'slug' => [
                'pt' => 'mesa-de-centro-trem',
            ],
            'name' => [
                'pt' => 'Mesa de centro Trem',
            ],
            'area' => 'indoor',
            'category' => 'coffee-tables',
            'designer' => 'marina-linhares',
            'tagline' => [
                'pt' => 'Movimentos sutis que acompanham o tempo',
            ],
            'description' => [
                'pt' => '<p>A Mesa de Centro Trem traduz o tempo como movimento. Seu desenho combina a presença da madeira com a solidez do tampo, criando uma peça que equilibra matéria e leveza visual.</p><p>Um detalhe especial define sua personalidade: uma bandeja em madeira que desliza suavemente sobre a superfície, permitindo reorganizar o espaço e transformar o uso da mesa de acordo com o momento. Assinada por Marina Linhares, a peça integra a coleção TEMPO ao revelar que o tempo também se expressa em movimento — nos gestos simples que transformam o espaço ao longo do dia.</p>',
            ],
            'dimensions' => [],
            'materials' => [
                'pt' => 'Estrutura em madeira tauari tingida com bandeja em MDF laminado ou laqueado e tampo em pedra ou MDF.',
            ],
            'finishes_note' => [
                'pt' => 'Estrutura em madeira tauari tingida com bandeja deslizante em MDF laminado ou laqueado. Tampo disponível em pedra natural ou MDF laminado ou laqueado.',
            ],
            'cover' => 'https://franccino.com.br/wp-content/uploads/2026/03/Trem-1-scaled.webp',
            'is_featured' => true,
            'legacy_wp_id' => 11104,
            'legacy_url' => 'https://franccino.com.br/produto/mesa-de-centro-trem/',
        ],
        [
            'slug' => [
                'pt' => 'poltrona-terezinha',
                'en' => 'terezinha-armchair',
            ],
            'name' => [
                'pt' => 'Poltrona Terezinha',
                'en' => 'Terezinha Armchair',
            ],
            'area' => 'indoor',
            'category' => 'armchairs',
            'designer' => 'zia-costa',
            'tagline' => [
                'pt' => 'Gestos que o tempo transforma em memória',
            ],
            'description' => [
                'pt' => '<p>A Poltrona Terezinha nasce de uma história de afeto e reconhecimento. Criada por Zia Costa, a peça estabelece uma ligação direta com a Poltrona Maria — desenhada anos antes em homenagem à sua mãe — e surge como um tributo à mãe dos fundadores da Franccino.</p><p>Ambas compartilham a mesma essência: mulheres de origem simples, mas de força extraordinária, que foram base silenciosa de suas famílias. Essa inspiração se traduz em um desenho limpo, sem excessos, onde a simplicidade revela solidez e caráter. Integrando a coleção TEMPO, a poltrona expressa a ideia de que aquilo que é feito com verdade atravessa os anos — assim como as histórias e os valores que permanecem de geração em geração.</p>',
            ],
            'dimensions' => [
                [
                    'label' => null,
                    'width' => 800,
                    'depth' => 800,
                    'height' => 790,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => [
                'pt' => 'Estrutura em madeira tauari tingida com assento, encosto e braços estofados.',
            ],
            'finishes_note' => [
                'pt' => 'Estrutura em madeira com acabamento tingido e estofamento que valoriza conforto e acolhimento. Assento, encosto e braços estofados com tecidos personalizáveis.',
            ],
            'cover' => 'https://franccino.com.br/wp-content/uploads/2026/03/Terezinha-2-scaled.webp',
            'is_featured' => false,
            'legacy_wp_id' => 11101,
            'legacy_url' => 'https://franccino.com.br/produto/poltrona-terezinha/',
        ],
        [
            'slug' => [
                'pt' => 'sofa-antonio',
            ],
            'name' => [
                'pt' => 'Sofá Antônio',
            ],
            'area' => 'indoor',
            'category' => 'sofas',
            'designer' => 'daniela-ferro',
            'tagline' => [
                'pt' => 'Memórias que encontram lugar no presente',
            ],
            'description' => [
                'pt' => '<p>O Sofá Antônio nasce como um gesto de memória. Criado por Daniela Ferro, a peça homenageia o pai dos fundadores da Franccino e traduz em forma aquilo que permanece ao longo do tempo: presença, acolhimento e continuidade.</p><p>Seu desenho privilegia proporções serenas e volumes generosos de estofamento, apoiados por uma base leve em alumínio que revela equilíbrio entre estrutura e suavidade. Integrando a coleção TEMPO, o sofá convida a transformar momentos simples em lembranças duradouras, lembrando que o tempo vivido com presença é aquele que permanece na memória.</p>',
            ],
            'dimensions' => [],
            'materials' => [
                'pt' => 'Estrutura com base em alumínio, encosto em aço e almofadas soltas.',
            ],
            'finishes_note' => [
                'pt' => 'Base em alumínio com acabamento refinado e estrutura estofada com almofadas soltas. Estofado personalizável, permitindo diferentes combinações de tecidos para adequação ao ambiente.',
            ],
            'cover' => 'https://franccino.com.br/wp-content/uploads/2026/03/Antonio-1-scaled.webp',
            'is_featured' => false,
            'legacy_wp_id' => 11097,
            'legacy_url' => 'https://franccino.com.br/produto/sofa-antonio/',
        ],
        [
            'slug' => [
                'pt' => 'cadeira-melina',
                'en' => 'melina-estofada-chair',
            ],
            'name' => [
                'pt' => 'Cadeira Melina Estofada',
                'en' => 'Melina Estofada Chair',
            ],
            'area' => 'indoor',
            'category' => 'chairs',
            'designer' => 'daniela-ferro',
            'tagline' => [
                'pt' => 'Leveza que atravessa o tempo',
            ],
            'description' => [
                'pt' => '<p>A Cadeira Melina nasce de um gesto sutil, onde forma e conforto se encontram em equilíbrio. Seu desenho privilegia linhas suaves e proporções acolhedoras, criando uma presença elegante que se integra naturalmente ao ambiente.</p><p>O estofamento generoso amplia a sensação de conforto, enquanto a estrutura revela o cuidado construtivo que define o fazer da Franccino. Assinada por Daniela Ferro, a peça integra a coleção TEMPO ao valorizar a delicadeza do cotidiano — momentos simples que, quando vividos com calma, transformam o espaço em cenário de vida.</p>',
            ],
            'dimensions' => [
                [
                    'label' => null,
                    'width' => 585,
                    'depth' => 570,
                    'height' => 830,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => [
                'pt' => 'Estrutura em madeira com assento e encosto estofados.',
            ],
            'finishes_note' => [
                'pt' => 'Estrutura em madeira com acabamento refinado e estofamento personalizável em diferentes tecidos.',
            ],
            'cover' => 'https://franccino.com.br/wp-content/uploads/2026/03/Melina-1-scaled.webp',
            'is_featured' => false,
            'legacy_wp_id' => 11094,
            'legacy_url' => 'https://franccino.com.br/produto/cadeira-melina/',
        ],
        [
            'slug' => [
                'pt' => 'sofa-royale',
            ],
            'name' => [
                'pt' => 'Sofá Royale',
            ],
            'area' => 'indoor',
            'category' => 'sofas',
            'designer' => 'la-mamba',
            'tagline' => [
                'pt' => 'Elegância estrutural, conforto que envolve',
            ],
            'description' => [
                'pt' => '<p>O Sofá Royale nasce da ideia de conforto elevado à sua forma mais essencial. Sustentado por quatro apoios delicados, sua estrutura cria a sensação de leveza enquanto acolhe volumes generosos de estofamento.</p><p>O encosto de traço ovalado desenha a identidade da peça e introduz um gesto escultórico que equilibra rigor estrutural e suavidade visual. Assinado pelo estúdio La Mamba, o Royale integra a coleção TEMPO como um espaço de presença — um sofá pensado para acolher conversas longas, encontros e momentos vividos plenamente no agora.</p>',
            ],
            'dimensions' => [],
            'materials' => [
                'pt' => 'Estrutura em caixaria estofada com pés em aço e almofadas soltas.',
            ],
            'finishes_note' => [
                'pt' => 'Estrutura estofada com almofadas soltas que ampliam o conforto da peça. Pés metálicos com acabamento refinado e estofado personalizável em diferentes tecidos.',
            ],
            'cover' => 'https://franccino.com.br/wp-content/uploads/2026/03/Royale-2-scaled.webp',
            'is_featured' => false,
            'legacy_wp_id' => 11074,
            'legacy_url' => 'https://franccino.com.br/produto/sofa-royale/',
        ],
        [
            'slug' => [
                'pt' => 'mesa-joey',
                'en' => 'joey-table',
            ],
            'name' => [
                'pt' => 'Mesa Joey',
                'en' => 'Joey Table',
            ],
            'area' => 'indoor',
            'category' => 'dining-tables',
            'designer' => 'la-mamba',
            'tagline' => [
                'pt' => 'Entre peso e leveza, o tempo repousa',
            ],
            'description' => [
                'pt' => '<p>A Mesa Joey nasce do diálogo entre materiais que se completam. A base em pedra maciça sustenta o desenho com presença e estabilidade, enquanto o tampo revela a delicadeza da superfície e a precisão das proporções.</p><p>Entre esses elementos, uma estrutura metálica atua como elo visual e construtivo, criando uma composição equilibrada e silenciosa. Assinada pelo estúdio La Mamba, Joey integra a coleção TEMPO como um convite ao encontro — uma mesa pensada para reunir pessoas, histórias e momentos que se prolongam naturalmente ao seu redor.</p>',
            ],
            'dimensions' => [],
            'materials' => [
                'pt' => 'Base em pedra maciça com estrutura em aço e MDF laqueado.',
            ],
            'finishes_note' => [
                'pt' => 'Base em pedra natural com acabamento polido, escovado ou levigado. Tampo em MDF laqueado ou laminado, permitindo diferentes composições de materiais.',
            ],
            'cover' => 'https://franccino.com.br/wp-content/uploads/2026/03/Joey-2-scaled.webp',
            'is_featured' => false,
            'legacy_wp_id' => 11045,
            'legacy_url' => 'https://franccino.com.br/produto/mesa-joey/',
        ],
        [
            'slug' => [
                'pt' => 'buffet-heritage',
            ],
            'name' => [
                'pt' => 'Buffet Heritage',
            ],
            'area' => 'indoor',
            'category' => 'sideboards',
            'designer' => 'la-mamba',
            'tagline' => [
                'pt' => 'Matéria que guarda o tempo',
            ],
            'description' => [
                'pt' => '<p>O Buffet Heritage nasce do encontro entre proporção e matéria. Seu desenho privilegia linhas puras e uma composição equilibrada entre madeira, pedra e vidro, revelando a força silenciosa dos materiais naturais.</p><p>Os pés metálicos elevam o volume principal e criam um vazio sutil entre o móvel e o piso, trazendo leveza visual à peça. Assinado pelo estúdio La Mamba, o Heritage dialoga com a coleção TEMPO ao expressar a ideia de legado — móveis criados para atravessar os anos com elegância e continuar fazendo sentido com o passar do tempo.</p>',
            ],
            'dimensions' => [],
            'materials' => [
                'pt' => 'Estrutura em MDF laminado ou laqueado com pés em aço. Tampo superior e elementos internos podendo combinar pedra, MDF, vidro, espelho ou tecido.',
            ],
            'finishes_note' => [
                'pt' => 'Estrutura em MDF com acabamento laminado ou laqueado e pés metálicos com pintura refinada. Tampo e prateleiras podem receber diferentes composições de materiais, permitindo personalização e adaptação ao ambiente.',
            ],
            'cover' => 'https://franccino.com.br/wp-content/uploads/2026/03/Heritage-3-scaled.webp',
            'is_featured' => false,
            'legacy_wp_id' => 11041,
            'legacy_url' => 'https://franccino.com.br/produto/buffet-heritage/',
        ],
        [
            'slug' => [
                'pt' => 'sofa-majestic',
                'en' => 'majestic-sofa',
            ],
            'name' => [
                'pt' => 'Sofá Majestic',
                'en' => 'Majestic Sofa',
            ],
            'area' => 'indoor',
            'category' => 'sofas',
            'designer' => 'la-mamba',
            'tagline' => [
                'pt' => 'Leveza estrutural, conforto que permanece',
            ],
            'description' => [
                'pt' => '<p>O Sofá Majestic interpreta o conforto a partir da leveza. Suas linhas precisas, suavemente sinuosas, criam uma presença serena que convida ao descanso, à conversa e aos momentos que se estendem sem pressa.</p><p>A base aparente, resolvida por um sistema de dupla estrutura, revela a engenharia da peça e reforça a sensação de suspensão visual, como se o volume estofado repousasse com delicadeza no espaço. Assinado pelo estúdio La Mamba, o Majestic traduz o espírito da coleção TEMPO ao equilibrar matéria, proporção e permanência.</p>',
            ],
            'dimensions' => [],
            'materials' => [
                'pt' => 'Estrutura em caixaria estofada com pés em aço e almofadas soltas.',
            ],
            'finishes_note' => [
                'pt' => 'Estrutura estofada com almofadas soltas de assento e encosto. Pés metálicos com acabamento refinado e estofado personalizável, permitindo a escolha de diferentes tecidos para adequação ao ambiente.',
            ],
            'cover' => 'https://franccino.com.br/wp-content/uploads/2026/03/Majestic-2-scaled.webp',
            'is_featured' => false,
            'legacy_wp_id' => 11007,
            'legacy_url' => 'https://franccino.com.br/produto/sofa-majestic/',
        ],
        [
            'slug' => [
                'pt' => 'mesa-de-centro-arp',
            ],
            'name' => [
                'pt' => 'Mesa de Centro ARP',
            ],
            'area' => 'outdoor',
            'category' => 'coffee-tables',
            'designer' => 'andrea-zanocchi',
            'tagline' => [
                'pt' => 'Pausa leve entre sol, sombra e forma',
            ],
            'description' => [
                'pt' => '<p>A</p><p>Mesa de Centro ARP</p><p>traduz a identidade da coleção em uma peça de presença sutil e equilibrada. Construída integralmente em alumínio, com opção de tampo em alumínio ou Fórmica, permite personalização da pintura eletrostática, adaptando-se com naturalidade a diferentes composições.</p><p>Assinada por</p><p>Andrea Zanocchi</p><p>, pode ser utilizada em áreas externas e revela, em suas linhas e planos bem definidos, a inspiração na Pedra do Arpoador. Um desenho preciso e durável, pensado para acompanhar momentos de pausa com elegância e leveza.</p>',
            ],
            'dimensions' => [],
            'materials' => [
                'pt' => 'Estrutura em alumínio com acabamento em pintura eletrostática e tampo em fórmica ou alumínio (personalizável)',
            ],
            'finishes_note' => null,
            'cover' => 'https://franccino.com.br/wp-content/uploads/2026/01/Detalhe-Wide-2.webp',
            'is_featured' => false,
            'legacy_wp_id' => 10687,
            'legacy_url' => 'https://franccino.com.br/produto/mesa-de-centro-arp/',
        ],
        [
            'slug' => [
                'pt' => 'poltrona-noa',
                'en' => 'noa-armchair',
            ],
            'name' => [
                'pt' => 'Poltrona Noa',
                'en' => 'Noa Armchair',
            ],
            'area' => 'outdoor',
            'category' => 'armchairs',
            'designer' => 'la-mamba',
            'tagline' => [
                'pt' => 'Sofisticação, sem perder a leveza e a praticidade.',
            ],
            'description' => [
                'pt' => '<p>A Poltrona Noa é uma verdadeira expressão de</p><p>minimalismo</p><p>, onde cada detalhe foi cuidadosamente pensado para exalar</p><p>requinte</p><p>e</p><p>simplicidade</p><p>. Com</p><p>estrutura em alumínio com pintura eletrostática</p><p>, ela combina durabilidade e leveza, criando uma base elegante e moderna. A</p><p>almofada de assento</p><p>oferece conforto sem exageros, enquanto o</p><p>encosto e os braços em trama com corda de 6mm</p><p>conferem um toque artesanal e contemporâneo à peça. O</p><p>detalhe decorativo</p><p>do encosto adiciona uma camada de sofisticação, sem perder a leveza e a praticidade, tornando-a perfeita para ambientes que valorizam a beleza discreta e o design funcional. Cada elemento dessa cadeira é uma combinação de elegância sutil e estilo atemporal.</p>',
            ],
            'dimensions' => [
                [
                    'label' => null,
                    'width' => 720,
                    'depth' => 690,
                    'height' => 700,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => null,
            'finishes_note' => null,
            'cover' => 'https://franccino.com.br/wp-content/uploads/2025/03/poltrona-noa.webp',
            'is_featured' => false,
            'legacy_wp_id' => 8021,
            'legacy_url' => 'https://franccino.com.br/produto/poltrona-noa/',
        ],
        [
            'slug' => [
                'pt' => 'cadeira-cancun-2',
            ],
            'name' => [
                'pt' => 'Poltrona Cancun',
            ],
            'area' => 'outdoor',
            'category' => 'armchairs',
            'designer' => 'estudio-franccino',
            'tagline' => [
                'pt' => 'Diversão e elegância com o frescor dos ambientes externos',
            ],
            'description' => [
                'pt' => '<p>Uma peça original desenvolvida pelo Estúdio Franccino. A Poltrona Cancun traduz a tranquilidade e refrescância de se estar de bem com a vida, de ter o calor a seu favor. Conforto e qualidade brincam com o alumínio e a corda, dando a segurança e a sensação de descanso.</p><p>Assim como as praias quentes e as noites de diversão, a Poltrona Cancun permite a versatilidade de se ter em um ambiente a mesma energia que contagia, a mesma forma única de descontração que só a os climas quentes e divertidos podem proporcionar. Fechar os olhos e sentir que o vento está a seu favor.</p>',
            ],
            'dimensions' => [
                [
                    'label' => null,
                    'width' => 655,
                    'depth' => 690,
                    'height' => 860,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => null,
            'finishes_note' => null,
            'cover' => 'https://franccino.com.br/wp-content/uploads/2025/01/gvbwased.webp',
            'is_featured' => false,
            'legacy_wp_id' => 7436,
            'legacy_url' => 'https://franccino.com.br/produto/cadeira-cancun-2/',
        ],
        [
            'slug' => [
                'pt' => 'sofa-snodo',
                'en' => 'snodo-sofa',
            ],
            'name' => [
                'pt' => 'Sofá Snodo',
                'en' => 'Snodo Sofa',
            ],
            'area' => 'indoor',
            'category' => 'sofas',
            'designer' => 'zanocchi-starke',
            'tagline' => [
                'pt' => 'A irreverência e a presença marcante do Sofá Snodo o tornam parte essencial de um ambiente contemporâneo, refrescante e único.',
            ],
            'description' => [
                'pt' => '<p>Com um visual informal e despojado, o Sofá Snodo se destaca pelo estofado maleável que envolve a estrutura, dobrando-se sobre ela e delineando o encosto e os braços. A estrutura é feita em perfil de alumínio, enquanto os assentos, braços e encosto são confeccionados em compensado, revestidos com espumas e tecidos.</p><p>Ele confere ao ambiente uma atmosfera urbana e acolhedora, permitindo que o sofá se integre à composição e abra espaço para novas interpretações, adicionando uma dinâmica singular ao espaço.</p>',
            ],
            'dimensions' => [
                [
                    'label' => null,
                    'width' => 2200,
                    'depth' => 900,
                    'height' => 820,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => [
                'pt' => 'Estrutura em alumínio, assento, braços e encosto em compensado com espuma e tecido',
            ],
            'finishes_note' => null,
            'cover' => 'https://franccino.com.br/wp-content/uploads/2024/04/SOFA-SNODO-4.jpg',
            'is_featured' => false,
            'legacy_wp_id' => 3287,
            'legacy_url' => 'https://franccino.com.br/produto/sofa-snodo/',
        ],
        [
            'slug' => [
                'pt' => 'balanco-alfaia',
            ],
            'name' => [
                'pt' => 'Balanço Alfaia',
            ],
            'area' => 'outdoor',
            'category' => 'swings',
            'designer' => 'estudio-franccino',
            'tagline' => [
                'pt' => 'Encanto, detalhes que fazem toda a diferença.',
            ],
            'description' => [
                'pt' => '<p>O Balanço Alfaia, uma peça autoral da Franccino, é a perfeita união entre leveza e sofisticação. Inspirado na essência das formas orgânicas, seu design destaca uma trama elegante e vazada que envolve e acolhe, proporcionando uma experiência de conforto inigualável.</p><p>Com estrutura em alumínio e acabamento em corda náutica, o Balanço Alfaia combina resistência e beleza, sendo ideal para ambientes internos ou externos. Suas almofadas macias garantem aconchego, enquanto seu formato singular transforma qualquer espaço em um refúgio de tranquilidade e charme.</p>',
            ],
            'dimensions' => [
                [
                    'label' => null,
                    'width' => 1300,
                    'depth' => 950,
                    'height' => 1150,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => null,
            'finishes_note' => null,
            'cover' => 'https://franccino.com.br/wp-content/uploads/2024/12/asdaswda.webp',
            'is_featured' => false,
            'legacy_wp_id' => 6587,
            'legacy_url' => 'https://franccino.com.br/produto/6587/',
        ],
        [
            'slug' => [
                'pt' => 'banqueta-helena',
                'en' => 'helena-stool',
            ],
            'name' => [
                'pt' => 'Banqueta Helena',
                'en' => 'Helena Stool',
            ],
            'area' => 'indoor',
            'category' => 'stools-benches',
            'designer' => 'estudio-franccino',
            'tagline' => [
                'pt' => 'Conforto unindo matérias e formas.',
            ],
            'description' => [
                'pt' => '<p>A Banqueta Helena é um assento elegante e funcional, com design sofisticado que combina madeira e estofado. Sua estrutura é feita de madeira maciça com acabamento polido, oferecendo resistência e durabilidade. O assento e o encosto são acolchoados e revestidos com material de alta qualidade, como couro ou tecido sintético, proporcionando conforto ao usuário.</p><p>Ela possui braços integrados e um apoio para os pés, o que favorece uma postura ergonômica, tornando-a ideal para balcões e bancadas. Seu estilo moderno com toques retrô e linhas arredondadas a torna uma peça versátil, perfeita para ambientes residenciais ou comerciais, como cozinhas gourmet, bares ou restaurantes.</p>',
            ],
            'dimensions' => [
                [
                    'label' => [
                        'pt' => 'assento de 70cm',
                    ],
                    'width' => 500,
                    'depth' => 490,
                    'height' => 1050,
                    'seat_height' => null,
                    'diameter' => null,
                ],
                [
                    'label' => [
                        'pt' => 'assento de 80cm',
                    ],
                    'width' => 500,
                    'depth' => 490,
                    'height' => 1150,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => null,
            'finishes_note' => null,
            'cover' => 'https://franccino.com.br/wp-content/uploads/2025/01/BANQUETA-HELEAN-8.webp',
            'is_featured' => false,
            'legacy_wp_id' => 7702,
            'legacy_url' => 'https://franccino.com.br/produto/banqueta-helena/',
        ],
        [
            'slug' => [
                'pt' => 'cadeira-marcela-sem-braco-2',
            ],
            'name' => [
                'pt' => 'Cadeira Marcela sem braço',
            ],
            'area' => 'indoor',
            'category' => 'chairs',
            'designer' => 'estudio-franccino',
            'tagline' => [
                'pt' => 'Moderna e resistente, fazendo parte do ambiente e marcando com seu visual sofisticado.',
            ],
            'description' => [
                'pt' => '<p>A Cadeira Marcela é uma elegante opção de assento para complementar sua decoração. Com sua estrutura em madeira maciça de tauari, ela é resistente e durável, além de possuir um visual sofisticado e moderno.</p><p>O encosto da cadeira é composto por uma aplicação de tela que permite uma boa circulação de ar, aumentando o conforto do usuário. Já o assento é revestido em espuma flexível de alto desempenho, proporcionando um alto nível de conforto e aconchego</p><p>A Cadeira Marcela é ideal para compor ambientes como sala de jantar, sala de estar, entre outros, agregando beleza e conforto ao espaço.</p>',
            ],
            'dimensions' => [
                [
                    'label' => null,
                    'width' => 550,
                    'depth' => 610,
                    'height' => 850,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => [
                'pt' => 'Cadeira com estrutura em madeira maciça Tauari. Assento revestido em espuma flexível de poliuretano poliéster de alto desempenho, recoberta com manta siliconada, estruturado sobre percintas.',
            ],
            'finishes_note' => null,
            'cover' => 'https://franccino.com.br/wp-content/uploads/2025/05/CADEIRA-MARCELA-S-BR-92461200503-2-1-scaled.webp',
            'is_featured' => false,
            'legacy_wp_id' => 9804,
            'legacy_url' => 'https://franccino.com.br/produto/cadeira-marcela-sem-braco-2/',
        ],
        [
            'slug' => [
                'pt' => 'buffet-bloco',
                'en' => 'bloco-sideboard',
            ],
            'name' => [
                'pt' => 'Buffet Bloco',
                'en' => 'Bloco Sideboard',
            ],
            'area' => 'indoor',
            'category' => 'sideboards',
            'designer' => 'vinicius-siega',
            'tagline' => [
                'pt' => 'Planos definidos, presença organizada',
            ],
            'description' => [
                'pt' => '<p>O Buffet Bloco expressa o traço por meio da organização dos volumes. A base metálica sustenta um conjunto de planos bem definidos, onde nichos, portas e gavetas se articulam com precisão.</p><p>O desenho valoriza a proporção e o equilíbrio entre cheios e vazios, criando uma peça que estrutura o ambiente com elegância. Funcional e arquitetônico, integra armazenamento e presença em uma mesma linguagem.</p>',
            ],
            'dimensions' => [],
            'materials' => [
                'pt' => 'Base em aço carbono. Estrutura, portas, gavetas e nichos em MDF.',
            ],
            'finishes_note' => [
                'pt' => 'Base com pintura eletrostática ou laca. Estrutura disponível em laca ou lâmina natural. Puxadores metálicos com acabamento em laca ou pintura eletrostática.',
            ],
            'cover' => 'https://franccino.com.br/wp-content/uploads/2026/01/Detalhe-Wide-_-Buffet-Bloco.webp',
            'is_featured' => false,
            'legacy_wp_id' => 10759,
            'legacy_url' => 'https://franccino.com.br/produto/buffet-bloco/',
        ],
        [
            'slug' => [
                'pt' => 'mesa-de-jantar-arp',
            ],
            'name' => [
                'pt' => 'Mesa de Jantar ARP',
            ],
            'area' => 'outdoor',
            'category' => 'dining-tables',
            'designer' => 'andrea-zanocchi',
            'tagline' => [
                'pt' => 'O verão como cenário do encontro',
            ],
            'description' => [
                'pt' => '<p>A</p><p>Mesa de Jantar ARP</p><p>expressa a força silenciosa da coleção em uma peça que valoriza o encontro. Sua estrutura em alumínio recebe tampo em alumínio ou Fórmica, com acabamento em pintura eletrostática personalizável, garantindo resistência, versatilidade e harmonia no ambiente.</p><p>Assinada por</p><p>Andrea Zanocchi</p><p>, é indicada também para áreas externas e apresenta um desenho claro, inspirado na Pedra do Arpoador, onde planos firmes e linhas contínuas se equilibram com naturalidade. Uma peça atemporal, pensada para atravessar o tempo e reunir pessoas com conforto visual e elegância.</p>',
            ],
            'dimensions' => [],
            'materials' => [
                'pt' => 'Estrutura em alumínio com acabamento em pintura eletrostática e tampo em fórmica ou alumínio (personalizável)',
            ],
            'finishes_note' => null,
            'cover' => 'https://franccino.com.br/wp-content/uploads/2026/01/Detalhe-Wide-1.webp',
            'is_featured' => false,
            'legacy_wp_id' => 10682,
            'legacy_url' => 'https://franccino.com.br/produto/mesa-de-jantar-arp/',
        ],
        [
            'slug' => [
                'pt' => 'cadeira-noa',
                'en' => 'noa-chair',
            ],
            'name' => [
                'pt' => 'Cadeira Noa',
                'en' => 'Noa Chair',
            ],
            'area' => 'outdoor',
            'category' => 'chairs',
            'designer' => 'la-mamba',
            'tagline' => [
                'pt' => 'Modernidade e o calor do artesanalmente sofisticado.',
            ],
            'description' => [
                'pt' => '<p>A Cadeira Noa reflete a essência do</p><p>minimalismo</p><p>, com linhas limpas e design descomplicado que exalam</p><p>requinte</p><p>e sofisticação. A</p><p>estrutura em alumínio</p><p>com pintura eletrostática</p><p>traz um toque moderno e durável, enquanto a</p><p>almofada de</p><p>assento</p><p>oferece conforto sem perder a leveza visual. O</p><p>encosto e assento em trama com</p><p>corda de 8mm</p><p>adicionam um elemento artesanal e ao mesmo tempo contemporâneo, criando uma peça que é sinônimo de</p><p>simplicidade</p><p>refinada. Seu design elegante e funcional, aliado à escolha de materiais de qualidade, torna esta cadeira a escolha ideal para quem busca beleza e praticidade de forma sutil e sofisticada.</p>',
            ],
            'dimensions' => [
                [
                    'label' => null,
                    'width' => 600,
                    'depth' => 600,
                    'height' => 760,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => null,
            'finishes_note' => null,
            'cover' => 'https://franccino.com.br/wp-content/uploads/2025/03/cadeira-noa.webp',
            'is_featured' => false,
            'legacy_wp_id' => 8013,
            'legacy_url' => 'https://franccino.com.br/produto/cadeira-noa/',
        ],
        [
            'slug' => [
                'pt' => 'cadeira-luzy-com-braco',
            ],
            'name' => [
                'pt' => 'Cadeira Luzy – Com Braço',
            ],
            'area' => 'outdoor',
            'category' => 'chairs',
            'designer' => 'estudio-franccino',
            'tagline' => [
                'pt' => 'Caminhos que revelam a liberdade de ser única.',
            ],
            'description' => [
                'pt' => '<p>Liberdade de caminhar, de levar, de ser e de pertencer. A Cadeira Luzy é mais do que um móvel em alto padrão. Mesmo que o metal de sua estrutura seja frio, a trama que a envolve a torna libertadora.</p><p>Desenvolvida pelo Estúdio Franccino a liberdade e a sensualidade que envolve os ambientes externos proporcionam a peça momentos de cativar. Essa liberdade, permite que a Cadeira Luzy ganhe forma, leve elegância e ao mesmo tempo seja presente. Assim, ela pertence aos Caminhos que e a levaram a ser única.</p>',
            ],
            'dimensions' => [
                [
                    'label' => null,
                    'width' => 550,
                    'depth' => 570,
                    'height' => 810,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => null,
            'finishes_note' => null,
            'cover' => 'https://franccino.com.br/wp-content/uploads/2025/01/vadvga.webp',
            'is_featured' => false,
            'legacy_wp_id' => 7323,
            'legacy_url' => 'https://franccino.com.br/produto/cadeira-luzy-com-braco/',
        ],
        [
            'slug' => [
                'pt' => 'poltrona-irani',
                'en' => 'irani-armchair',
            ],
            'name' => [
                'pt' => 'Poltrona Irani',
                'en' => 'Irani Armchair',
            ],
            'area' => 'outdoor',
            'category' => 'armchairs',
            'designer' => 'sergio-matos',
            'tagline' => [
                'pt' => 'A Poltrona Irani traz personalidade e uma riqueza de detalhes contemporâneos ao ambiente, revelando a exclusiva ousadia da peça.',
            ],
            'description' => [
                'pt' => '<p>A sofisticação permeia a sinuosidade das linhas orgânicas e as minúcias da trama artesanal na Poltrona Irani, proporcionando um frescor contemporâneo à decoração repleta de personalidade. O design é um elo entre a natureza inspiradora e a ancestralidade presente nos conhecimentos e habilidades que resistem ao tempo. Estruturada em perfil de alumínio redondo, com trama de fita slim 10mm.</p><p>O desenho de borda curvilínea evoca o significado da denominação "Irani", colhida da língua tupi-guarani com a bela tradução "rio de mel", fazendo alusão às colmeias. O entrelaçamento da fita náutica, emoldurado pelas curvas da estrutura de alumínio, remete à arte milenar da cestaria indígena, criando um efeito ótico com o contraste das cores. Uma verdadeira riqueza do trabalho manual.</p>',
            ],
            'dimensions' => [
                [
                    'label' => null,
                    'width' => 960,
                    'depth' => 820,
                    'height' => 1000,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => [
                'pt' => 'Estrutura em alumínio, trama em fita slim 10mm',
            ],
            'finishes_note' => null,
            'cover' => 'https://franccino.com.br/wp-content/uploads/2024/04/7-POLTRONA-IRANI.jpg',
            'is_featured' => false,
            'legacy_wp_id' => 3277,
            'legacy_url' => 'https://franccino.com.br/produto/poltrona-irani/',
        ],
        [
            'slug' => [
                'pt' => 'sofa-mares',
            ],
            'name' => [
                'pt' => 'Sofá Marés',
            ],
            'area' => 'indoor',
            'category' => 'sofas',
            'designer' => 'daniela-ferro',
            'tagline' => [
                'pt' => 'Curvas que desenham a beleza de estar em casa e que compõem memórias de momentos relaxantes.',
            ],
            'description' => [
                'pt' => '<p>Horizontalidade em curvas suaves que acolhem o encontro. O Sofá Marés tem na perspectiva do olhar sem barreiras e na leveza da sinuosidade em areia e mar a inspiração para a máxima experiência de relaxamento. Como um ponto de encontro, assim como o horizonte conciliador entre céu e terra, a peça se estrutura na base em madeira maciça, que se estende para além do assento estofado, funcionando como suporte para objetos, a critério do usuário. A delicadeza do design sinuoso também está presente no encaixe dos módulos, que oferecem, em um dos lados, a versão chaise, como um convite ao bem-estar.</p>',
            ],
            'dimensions' => [
                [
                    'label' => [
                        'pt' => 'Modulo I - 2 braços',
                    ],
                    'width' => 2480,
                    'depth' => 1120,
                    'height' => 700,
                    'seat_height' => null,
                    'diameter' => null,
                ],
                [
                    'label' => [
                        'pt' => 'Modulo II - 1 braço',
                    ],
                    'width' => 2430,
                    'depth' => 1070,
                    'height' => 700,
                    'seat_height' => null,
                    'diameter' => null,
                ],
                [
                    'label' => [
                        'pt' => 'Modulo III - 1 braço',
                    ],
                    'width' => 1865,
                    'depth' => 1050,
                    'height' => 700,
                    'seat_height' => null,
                    'diameter' => null,
                ],
                [
                    'label' => [
                        'pt' => 'Modulo IV - 1 braço + bandeja',
                    ],
                    'width' => 2870,
                    'depth' => 1080,
                    'height' => 700,
                    'seat_height' => null,
                    'diameter' => null,
                ],
                [
                    'label' => [
                        'pt' => 'Modulo V - Central',
                    ],
                    'width' => 3085,
                    'depth' => 1670,
                    'height' => 700,
                    'seat_height' => null,
                    'diameter' => null,
                ],
                [
                    'label' => [
                        'pt' => 'Modulo VI - Canto',
                    ],
                    'width' => 1700,
                    'depth' => 1700,
                    'height' => 700,
                    'seat_height' => null,
                    'diameter' => null,
                ],
                [
                    'label' => [
                        'pt' => 'Modulo VI - Chaise com bandeja',
                    ],
                    'width' => 2700,
                    'depth' => 1700,
                    'height' => 700,
                    'seat_height' => null,
                    'diameter' => null,
                ],
                [
                    'label' => [
                        'pt' => 'Modulo VII - Complementar',
                    ],
                    'width' => 1290,
                    'depth' => 1880,
                    'height' => 700,
                    'seat_height' => null,
                    'diameter' => null,
                ],
                [
                    'label' => [
                        'pt' => 'Modulo VIII - Chaise',
                    ],
                    'width' => 1700,
                    'depth' => 2190,
                    'height' => 700,
                    'seat_height' => null,
                    'diameter' => null,
                ],
                [
                    'label' => [
                        'pt' => 'Modulo IX - Central com encosto parcial',
                    ],
                    'width' => 3050,
                    'depth' => 1670,
                    'height' => 700,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => [
                'pt' => 'Estrutura da base em madeira maciça, almofadas de assento e encosto em espumas D28+D26.',
            ],
            'finishes_note' => null,
            'cover' => 'https://franccino.com.br/wp-content/uploads/2024/04/Sofa-mares.png',
            'is_featured' => false,
            'legacy_wp_id' => 3450,
            'legacy_url' => 'https://franccino.com.br/produto/sofa-mares/',
        ],
        [
            'slug' => [
                'pt' => 'banqueta-turin',
                'en' => 'turin-stool',
            ],
            'name' => [
                'pt' => 'Banqueta Turin',
                'en' => 'Turin Stool',
            ],
            'area' => 'outdoor',
            'category' => 'stools-benches',
            'designer' => 'estudio-franccino',
            'tagline' => [
                'pt' => 'Personalidade com suavidade e requinte.',
            ],
            'description' => [
                'pt' => '<p>A Banqueta Turin é uma peça de mobiliário elegante e funcional, feita em madeira com um design moderno e sofisticado. Sua estrutura é robusta, com linhas retas e detalhes bem trabalhados, destacando-se pelo acabamento natural da madeira, que valoriza os veios e a textura do material.</p><p>A banqueta possui um assento e encosto vazados com ripas horizontais, garantindo conforto e ventilação. Os braços integrados proporcionam um suporte adicional, enquanto os apoios para os pés, dispostos na base, oferecem estabilidade e comodidade ao usuário. Esse design combina simplicidade e beleza, ideal para ambientes como cozinhas, varandas ou bares.</p>',
            ],
            'dimensions' => [
                [
                    'label' => [
                        'pt' => '60cm',
                    ],
                    'width' => 560,
                    'depth' => 500,
                    'height' => 1100,
                    'seat_height' => null,
                    'diameter' => null,
                ],
                [
                    'label' => [
                        'pt' => '70cm',
                    ],
                    'width' => 560,
                    'depth' => 500,
                    'height' => 1200,
                    'seat_height' => null,
                    'diameter' => null,
                ],
                [
                    'label' => [
                        'pt' => '80cm',
                    ],
                    'width' => 560,
                    'depth' => 500,
                    'height' => 1300,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => null,
            'finishes_note' => null,
            'cover' => 'https://franccino.com.br/wp-content/uploads/2025/01/hnhhi.webp',
            'is_featured' => false,
            'legacy_wp_id' => 7595,
            'legacy_url' => 'https://franccino.com.br/produto/banqueta-turin/',
        ],
        [
            'slug' => [
                'pt' => 'poltrona-helena',
            ],
            'name' => [
                'pt' => 'Poltrona Helena',
            ],
            'area' => 'indoor',
            'category' => 'armchairs',
            'designer' => 'estudio-franccino',
            'tagline' => [
                'pt' => 'Sofisticação e elegância, aliadas à durabilidade e beleza para ambientes internos.',
            ],
            'description' => [
                'pt' => '<p>A Poltrona Helena é uma opção elegante e confortável para ambientes internos, como salas de jantar, cozinhas e escritórios. Sua estrutura é feita de madeira tauari, proporcionando durabilidade e resistência. O encosto e o assento da cadeira são estofados, proporcionando maior conforto ao usuário durante o uso prolongado. Além disso, a cadeira apresenta um acabamento arredondado em seu design, conferindo um aspecto sofisticado e contemporâneo ao ambiente.</p>',
            ],
            'dimensions' => [
                [
                    'label' => null,
                    'width' => 700,
                    'depth' => 675,
                    'height' => 780,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => null,
            'finishes_note' => null,
            'cover' => 'https://franccino.com.br/wp-content/uploads/2025/01/gveasdwgfw.webp',
            'is_featured' => false,
            'legacy_wp_id' => 7609,
            'legacy_url' => 'https://franccino.com.br/produto/poltrona-helena/',
        ],
        [
            'slug' => [
                'pt' => 'almofada-zoe',
                'en' => 'zoe-cushion',
            ],
            'name' => [
                'pt' => 'Almofada Zoe',
                'en' => 'Zoe Cushion',
            ],
            'area' => 'indoor',
            'category' => 'accessories',
            'designer' => 'estudio-franccino',
            'tagline' => [
                'pt' => 'Acolhimento com charme e estilo.',
            ],
            'description' => [
                'pt' => '<p>A Almofada Zoe é a perfeita expressão de leveza, frescor e graciosidade. Seu design delicado evoca uma sensação de acolhimento, com suaves curvas que se adaptam ao corpo, promovendo um toque de relaxamento instantâneo. A harmonia entre sua textura macia e o design refinado cria um ambiente de serenidade, onde cada detalhe foi pensado para trazer conforto e beleza. Ideal para quem busca não só um objeto de decoração, mas também uma experiência sensorial que eleva o ambiente a novos níveis de tranquilidade e estilo.</p>',
            ],
            'dimensions' => [],
            'materials' => null,
            'finishes_note' => null,
            'cover' => 'https://franccino.com.br/wp-content/uploads/2025/02/gwew.webp',
            'is_featured' => false,
            'legacy_wp_id' => 7795,
            'legacy_url' => 'https://franccino.com.br/produto/almofada-zoe/',
        ],
        [
            'slug' => [
                'pt' => 'cadeira-sirius',
            ],
            'name' => [
                'pt' => 'Cadeira Sirius',
            ],
            'area' => 'indoor',
            'category' => 'chairs',
            'designer' => 'estudio-franccino',
            'tagline' => [
                'pt' => 'Leveza estrutural, elegância natural',
            ],
            'description' => [
                'pt' => '<p>A Cadeira Sirius revela o traço por meio da madeira como elemento central. Sua estrutura em tauari desenha uma silhueta leve e bem proporcionada, onde o assento e o encosto estofados acrescentam conforto com discrição.</p><p>O equilíbrio entre matéria e forma cria uma presença serena, capaz de valorizar o ambiente sem excessos. Uma peça que traduz naturalidade e precisão em cada detalhe.</p>',
            ],
            'dimensions' => [
                [
                    'label' => null,
                    'width' => 540,
                    'depth' => 545,
                    'height' => 860,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => [
                'pt' => 'Estrutura em madeira tauari, com assento e encosto estofados.',
            ],
            'finishes_note' => [
                'pt' => 'Madeira disponível nas tonalidades do mostruário Franccino. Revestimento personalizável conforme mostruário.',
            ],
            'cover' => 'https://franccino.com.br/wp-content/uploads/2026/01/Detalhe-Wide-_-Cadeira-Polux.webp',
            'is_featured' => false,
            'legacy_wp_id' => 10758,
            'legacy_url' => 'https://franccino.com.br/produto/cadeira-sirius/',
        ],
        [
            'slug' => [
                'pt' => 'banco-arp',
                'en' => 'arp-bench',
            ],
            'name' => [
                'pt' => 'Banco ARP',
                'en' => 'ARP Bench',
            ],
            'area' => 'outdoor',
            'category' => 'stools-benches',
            'designer' => 'andrea-zanocchi',
            'tagline' => [
                'pt' => 'Essência do verão em forma contínua',
            ],
            'description' => [
                'pt' => '<p>O</p><p>Banco ARP</p><p>traduz a identidade da coleção em um gesto mais direto e versátil. Produzido integralmente em alumínio, com acabamento em pintura eletrostática personalizável, o banco pode ser adaptado a diferentes composições e usos, inclusive em áreas externas.</p><p>Assinado por</p><p>Andrea Zanocchi</p><p>, seu desenho valoriza linhas limpas e proporções cuidadosamente desenhadas, com curvas sutis que remetem à Pedra do Arpoador. Uma peça de presença discreta e marcante, que une resistência, leveza visual e atemporalidade.</p>',
            ],
            'dimensions' => [],
            'materials' => [
                'pt' => 'Estrutura em alumínio com acabamento em pintura eletrostática e almofada solta (personalizável)',
            ],
            'finishes_note' => null,
            'cover' => 'https://franccino.com.br/wp-content/uploads/2026/01/Detalhe-Wide.webp',
            'is_featured' => false,
            'legacy_wp_id' => 10674,
            'legacy_url' => 'https://franccino.com.br/produto/banco-arp/',
        ],
        [
            'slug' => [
                'pt' => 'mesa-de-jantar-noa',
            ],
            'name' => [
                'pt' => 'Mesa de Jantar Noa',
            ],
            'area' => 'outdoor',
            'category' => 'dining-tables',
            'designer' => 'la-mamba',
            'tagline' => [
                'pt' => 'A sutileza em unir e agregar sofisticação.',
            ],
            'description' => [
                'pt' => '<p>A Mesa de Jantar Noa é o convite perfeito para</p><p>reunir</p><p>familiares e amigos, criando o ambiente ideal para</p><p>confraternizar</p><p>e compartilhar momentos especiais. Com</p><p>estrutura em madeira maciça freijó</p><p>, ela transmite solidez e elegância, enquanto o</p><p>tampo em madeira maciça freijó</p><p>, com</p><p>detalhes nas laterais</p><p>, acrescenta um toque de sofisticação sutil e ao mesmo tempo acolhedor. Sua presença no ambiente é capaz de</p><p>acolher</p><p>a todos com seu design harmonioso, sendo o centro de grandes refeições e conversas que aquecem o coração. Uma mesa pensada para proporcionar não apenas funcionalidade, mas também conforto e união em cada encontro.</p>',
            ],
            'dimensions' => [],
            'materials' => null,
            'finishes_note' => null,
            'cover' => 'https://franccino.com.br/wp-content/uploads/2025/03/mesa-noa.webp',
            'is_featured' => false,
            'legacy_wp_id' => 8007,
            'legacy_url' => 'https://franccino.com.br/produto/mesa-de-jantar-noa/',
        ],
        [
            'slug' => [
                'pt' => 'banqueta-arreda',
                'en' => 'arreda-stool',
            ],
            'name' => [
                'pt' => 'Banqueta Arreda',
                'en' => 'Arreda Stool',
            ],
            'area' => 'indoor',
            'category' => 'stools-benches',
            'designer' => 'marina-linhares',
            'tagline' => [
                'pt' => 'Bons momentos com a suavidade da madeira.',
            ],
            'description' => [
                'pt' => '<p>Desenvolvida em estrutura em madeira maciça tauari tingida a Banqueta Arreda tem o assento/encosto em couro ou tecido. É um chegar para o lado, é um arrastar, mas também é como um segredo, porque é daqueles pequenos segredos que dividimos com quem amamos. Tem o detalhe de metal dos pés em laca e madeira do encosto tauari tingida. O verbo em si já um charme, é um chamego. Arreda é um carinho com embalo cantado na pronúncia.</p>',
            ],
            'dimensions' => [
                [
                    'label' => [
                        'pt' => '60cm',
                    ],
                    'width' => 440,
                    'depth' => 560,
                    'height' => 970,
                    'seat_height' => null,
                    'diameter' => null,
                ],
                [
                    'label' => [
                        'pt' => '70cm',
                    ],
                    'width' => 440,
                    'depth' => 560,
                    'height' => 1070,
                    'seat_height' => null,
                    'diameter' => null,
                ],
                [
                    'label' => [
                        'pt' => '80cm',
                    ],
                    'width' => 440,
                    'depth' => 560,
                    'height' => 1170,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => null,
            'finishes_note' => null,
            'cover' => 'https://franccino.com.br/wp-content/uploads/2024/12/Sem-titulo-1.webp',
            'is_featured' => false,
            'legacy_wp_id' => 6533,
            'legacy_url' => 'https://franccino.com.br/produto/banqueta-arreda/',
        ],
        [
            'slug' => [
                'pt' => 'cadeira-luzy-sem-braco',
            ],
            'name' => [
                'pt' => 'Cadeira Luzy – Sem Braço',
            ],
            'area' => 'outdoor',
            'category' => 'chairs',
            'designer' => 'estudio-franccino',
            'tagline' => [
                'pt' => 'Caminhos que revelam a liberdade de ser única.',
            ],
            'description' => [
                'pt' => '<p>Liberdade de caminhar, de levar, de ser e de pertencer. A Cadeira Luzy é mais do que um móvel em alto padrão. Mesmo que o metal de sua estrutura seja frio, a trama que a envolve a torna libertadora.</p><p>Desenvolvida pelo Estúdio Franccino a liberdade e a sensualidade que envolve os ambientes externos proporcionam a peça momentos de cativar. Essa liberdade, permite que a Cadeira Luzy ganhe forma, leve elegância e ao mesmo tempo seja presente. Assim, ela pertence aos Caminhos que e a levaram a ser única.</p>',
            ],
            'dimensions' => [
                [
                    'label' => null,
                    'width' => 450,
                    'depth' => 570,
                    'height' => 810,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => null,
            'finishes_note' => null,
            'cover' => 'https://franccino.com.br/wp-content/uploads/2025/01/vasdfvs.webp',
            'is_featured' => false,
            'legacy_wp_id' => 7315,
            'legacy_url' => 'https://franccino.com.br/produto/cadeira-luzy-sem-braco/',
        ],
        [
            'slug' => [
                'pt' => 'poltrona-caete',
                'en' => 'caete-armchair',
            ],
            'name' => [
                'pt' => 'Poltrona Caeté',
                'en' => 'Caeté Armchair',
            ],
            'area' => 'outdoor',
            'category' => 'armchairs',
            'designer' => 'sergio-matos',
            'tagline' => [
                'pt' => ': Incorporando a ancestralidade em cada detalhe, a Poltrona Caeté proporciona sensação de conforto e expressa conceito em uma simbiose visual e sensitiva.',
            ],
            'description' => [
                'pt' => '<p>Linhas orgânicas e envolventes definem o desenho da Poltrona Caeté. O nome, enraizado na língua indígena tupi, representa o conceito de "mata densa". O design, inspirado na conexão com a natureza, transmite aconchego e proteção. O volume do encosto e das laterais evoca a sensação de um abraço simbólico pelas copas das árvores que compõem o manto verde das florestas intocadas. Estruturada em perfil de alumínio redondo, com trama de fita slim 10mm.</p><p>Leve, a base forjada em alumínio é revestida com a sutileza da fita náutica, preservando o primor do processo artesanal elaborado sem pressa. Os entrelaçados criam um padrão têxtil que remete à arte ancestral da cestaria.</p>',
            ],
            'dimensions' => [
                [
                    'label' => null,
                    'width' => 960,
                    'depth' => 730,
                    'height' => 990,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => [
                'pt' => 'Estrutura em alumínio, trama em fita slim 10mm',
            ],
            'finishes_note' => null,
            'cover' => 'https://franccino.com.br/wp-content/uploads/2024/04/6-POLTRONA-CAETE.jpg',
            'is_featured' => false,
            'legacy_wp_id' => 3268,
            'legacy_url' => 'https://franccino.com.br/produto/poltrona-caete/',
        ],
        [
            'slug' => [
                'pt' => 'sofa-dara',
            ],
            'name' => [
                'pt' => 'Sofá Dara Outdoor',
            ],
            'area' => 'outdoor',
            'category' => 'sofas',
            'designer' => 'daniela-ferro',
            'tagline' => [
                'pt' => 'O mesmo conforto do indoor agora no outdoor, proporcionando também a sensação de bem-estar e graça.',
            ],
            'description' => [
                'pt' => '<p>O aspecto casual, juntamente com a valorização do artesanato brasileiro nas tramas, se destacou. Dessa vez, o conjunto ganha mais uma peça outdoor com um design mais despojado para sofá. A madeira é substituída pelo alumínio recoberto por pintura eletrostática, e o couro do acabamento na trama é substituído por fita náutica, além de ser revestido por um tecido mais leve. A horizontalidade continua bem demarcada com o tablado que se estende para além do estofado.</p>',
            ],
            'dimensions' => [
                [
                    'label' => [
                        'pt' => 'Modulo I',
                    ],
                    'width' => 2500,
                    'depth' => 1000,
                    'height' => 750,
                    'seat_height' => null,
                    'diameter' => null,
                ],
                [
                    'label' => [
                        'pt' => 'Modulo II',
                    ],
                    'width' => 1100,
                    'depth' => 2400,
                    'height' => 750,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => [
                'pt' => 'Estrutura em alumínio, detalhe tramado com fita náutica.',
            ],
            'finishes_note' => null,
            'cover' => 'https://franccino.com.br/wp-content/uploads/2024/04/Sofa-Dara-1.png',
            'is_featured' => false,
            'legacy_wp_id' => 3442,
            'legacy_url' => 'https://franccino.com.br/produto/sofa-dara/',
        ],
        [
            'slug' => [
                'pt' => 'poltrona-bras',
                'en' => 'bras-armchair',
            ],
            'name' => [
                'pt' => 'Poltrona Brás',
                'en' => 'Brás Armchair',
            ],
            'area' => 'outdoor',
            'category' => 'armchairs',
            'designer' => 'alva-design',
            'tagline' => [
                'pt' => 'Design funcional com o detalhe do requinte.',
            ],
            'description' => [
                'pt' => '<p>A Poltrona Brás é uma peça que combina o tradicional e o contemporâneo, inspirada no conceito do passante – um elemento funcional que conecta partes do mobiliário. Nesse design, o passante ganha destaque e escala, transformando a madeira que fixa a tela do assento no próprio braço da poltrona.</p><p>A estrutura da poltrona é composta por peças retas, semelhantes a tábuas, que conferem uma estética campestre e tradicional. Em contraste, o assento, com um caimento orgânico e solto, traz leveza e modernidade à peça. Essa fusão de elementos dá personalidade única à Poltrona Brás, evidenciando sua simplicidade funcional e ao mesmo tempo elegante.</p>',
            ],
            'dimensions' => [
                [
                    'label' => null,
                    'width' => 880,
                    'depth' => 750,
                    'height' => 800,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => null,
            'finishes_note' => null,
            'cover' => 'https://franccino.com.br/wp-content/uploads/2025/01/ge.webp',
            'is_featured' => false,
            'legacy_wp_id' => 7544,
            'legacy_url' => 'https://franccino.com.br/produto/poltrona-bras/',
        ],
        [
            'slug' => [
                'pt' => 'buffet-juno',
            ],
            'name' => [
                'pt' => 'Buffet Juno',
            ],
            'area' => 'indoor',
            'category' => 'sideboards',
            'designer' => 'bruno-rangel',
            'tagline' => [
                'pt' => 'O design clássico com o dinamismo dos espaços.',
            ],
            'description' => [
                'pt' => '<p>O Buffet Juno, assinado por Bruno Rangel, é uma peça de design sofisticada e contemporânea. Feito em madeira natural, o móvel apresenta portas com ripas verticais que criam uma textura elegante e dinâmica, conferindo profundidade ao visual. As linhas retas e a base discreta proporcionam um equilíbrio entre robustez e leveza, tornando-o ideal para compor ambientes modernos e acolhedores. Sua estrutura funcional combina praticidade e estética, sendo perfeito para armazenar objetos de forma organizada enquanto valoriza a decoração do espaço.</p>',
            ],
            'dimensions' => [
                [
                    'label' => [
                        'pt' => '4 portas',
                    ],
                    'width' => 1657,
                    'depth' => 500,
                    'height' => 800,
                    'seat_height' => null,
                    'diameter' => null,
                ],
                [
                    'label' => [
                        'pt' => '5 portas',
                    ],
                    'width' => 2068,
                    'depth' => 500,
                    'height' => 800,
                    'seat_height' => null,
                    'diameter' => null,
                ],
                [
                    'label' => [
                        'pt' => '6 portas',
                    ],
                    'width' => 2479,
                    'depth' => 500,
                    'height' => 800,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => null,
            'finishes_note' => null,
            'cover' => 'https://franccino.com.br/wp-content/uploads/2025/01/ooho.webp',
            'is_featured' => false,
            'legacy_wp_id' => 7176,
            'legacy_url' => 'https://franccino.com.br/produto/buffet-juno/',
        ],
        [
            'slug' => [
                'pt' => 'almofada-sim',
                'en' => 'sim-cushion',
            ],
            'name' => [
                'pt' => 'Almofada Sim',
                'en' => 'Sim Cushion',
            ],
            'area' => 'indoor',
            'category' => 'accessories',
            'designer' => 'estudio-franccino',
            'tagline' => [
                'pt' => 'Harmonia entre textura e aconchego.',
            ],
            'description' => [
                'pt' => '<p>A Almofada Sim é a perfeita fusão de conforto, beleza, decor e elegância. Com seu formato e acabamento impecável, ela traz um toque de sofisticação a qualquer ambiente, equilibrando de forma harmoniosa praticidade e estilo. Seu toque macio oferece aconchego imediato, enquanto seu design refinado se adapta facilmente a diferentes estilos de decoração. A escolha ideal para quem deseja transformar o ambiente, trazendo um toque de classe e bem-estar ao mesmo tempo. Uma peça que une funcionalidade e charme.</p>',
            ],
            'dimensions' => [
                [
                    'label' => null,
                    'width' => 600,
                    'depth' => 300,
                    'height' => null,
                    'seat_height' => null,
                    'diameter' => null,
                ],
                [
                    'label' => null,
                    'width' => 600,
                    'depth' => 350,
                    'height' => null,
                    'seat_height' => null,
                    'diameter' => null,
                ],
                [
                    'label' => null,
                    'width' => 600,
                    'depth' => 400,
                    'height' => null,
                    'seat_height' => null,
                    'diameter' => null,
                ],
                [
                    'label' => null,
                    'width' => 450,
                    'depth' => 450,
                    'height' => null,
                    'seat_height' => null,
                    'diameter' => null,
                ],
                [
                    'label' => null,
                    'width' => 400,
                    'depth' => 550,
                    'height' => null,
                    'seat_height' => null,
                    'diameter' => null,
                ],
                [
                    'label' => null,
                    'width' => 480,
                    'depth' => 480,
                    'height' => null,
                    'seat_height' => null,
                    'diameter' => null,
                ],
                [
                    'label' => null,
                    'width' => 460,
                    'depth' => 530,
                    'height' => null,
                    'seat_height' => null,
                    'diameter' => null,
                ],
                [
                    'label' => null,
                    'width' => 530,
                    'depth' => 530,
                    'height' => null,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => null,
            'finishes_note' => null,
            'cover' => 'https://franccino.com.br/wp-content/uploads/2025/02/fgtqawetrw.webp',
            'is_featured' => false,
            'legacy_wp_id' => 7791,
            'legacy_url' => 'https://franccino.com.br/produto/almofada-sim/',
        ],
        [
            'slug' => [
                'pt' => 'mesa-polux',
            ],
            'name' => [
                'pt' => 'Mesa Polux',
            ],
            'area' => 'indoor',
            'category' => 'dining-tables',
            'designer' => 'estudio-franccino',
            'tagline' => [
                'pt' => 'Presença estrutural, proporção marcante',
            ],
            'description' => [
                'pt' => '<p>A Mesa Polux expressa o traço por meio de planos definidos e proporções amplas. Sua base estruturada sustenta o tampo com solidez e equilíbrio, revelando um desenho que valoriza a arquitetura da peça.</p><p>A composição é marcada pela relação entre robustez e refinamento, criando uma presença que organiza o espaço com elegância. Ideal para projetos residenciais ou corporativos que exigem escala e personalidade.</p>',
            ],
            'dimensions' => [
                [
                    'label' => null,
                    'width' => 2000,
                    'depth' => 1100,
                    'height' => 750,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => [
                'pt' => 'Base em MDF. Tampo inferior e superior em MDF, com possibilidade de tampo superior em pedra ou lâmina natural.',
            ],
            'finishes_note' => [
                'pt' => 'Base e tampo inferior em laca ou lâmina. Tampo superior disponível em laca, lâmina natural ou pedra. Opção de vidro sobreposto. Cores personalizáveis',
            ],
            'cover' => 'https://franccino.com.br/wp-content/uploads/2026/01/Detalhe-Wideda-_-Mesa-Polux.webp',
            'is_featured' => false,
            'legacy_wp_id' => 10757,
            'legacy_url' => 'https://franccino.com.br/produto/mesa-polux/',
        ],
        [
            'slug' => [
                'pt' => 'cadeira-arp',
                'en' => 'arp-chair',
            ],
            'name' => [
                'pt' => 'Cadeira ARP',
                'en' => 'ARP Chair',
            ],
            'area' => 'outdoor',
            'category' => 'chairs',
            'designer' => 'andrea-zanocchi',
            'tagline' => [
                'pt' => 'Verão esculpido em linhas permanentes',
            ],
            'description' => [
                'pt' => '<p>A</p><p>Cadeira ARP</p><p>é inteiramente construída em alumínio, com estofado que amplia o conforto e valoriza a experiência de uso. A pintura eletrostática e o tecido são personalizáveis, permitindo que cada peça seja única e alinhada ao projeto.</p><p>Assinada por</p><p>Andrea Zanocchi</p><p>, pode ser utilizada em áreas externas e traz no encosto curvo a inspiração da Pedra do Arpoador — uma referência sutil ao encontro entre solidez e movimento. Seu desenho revela planos bem definidos combinados a curvas suaves, resultando em uma cadeira durável, confortável e naturalmente elegante, pensada para acompanhar o tempo com leveza.</p>',
            ],
            'dimensions' => [
                [
                    'label' => null,
                    'width' => 600,
                    'depth' => 640,
                    'height' => 750,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => [
                'pt' => 'Estrutura em alumínio com acabamento em pintura eletrostática e almofada solta (personalizável)',
            ],
            'finishes_note' => null,
            'cover' => 'https://franccino.com.br/wp-content/uploads/2026/01/Detalhe-Wide-_-Cadeira-Arp-1.webp',
            'is_featured' => false,
            'legacy_wp_id' => 10658,
            'legacy_url' => 'https://franccino.com.br/produto/cadeira-arp/',
        ],
        [
            'slug' => [
                'pt' => 'sofa-noa',
            ],
            'name' => [
                'pt' => 'Sofá Noa',
            ],
            'area' => 'outdoor',
            'category' => 'sofas',
            'designer' => 'la-mamba',
            'tagline' => [
                'pt' => 'Definição de descanso e relaxamento com o toque do sofisticado.',
            ],
            'description' => [
                'pt' => '<p>O Sofá Noa é a definição de</p><p>descanso</p><p>e</p><p>relaxamento</p><p>, projetado para oferecer momentos de</p><p>bem-estar</p><p>em qualquer ambiente. Sua</p><p>estrutura em alumínio com</p><p>pintura eletrostática</p><p>garante resistência e um toque contemporâneo, enquanto a</p><p>base em</p><p>madeira maciça freijó</p><p>, com</p><p>detalhes nas laterais</p><p>, traz um charme natural e sofisticado. O</p><p>encosto e braços em trama com corda de 22mm</p><p>conferem um visual leve e elegante, enquanto as</p><p>almofadas de assento e encosto estofadas</p><p>proporcionam o conforto ideal para um descanso completo. Cada elemento foi pensado para criar um espaço perfeito para relaxar e se desconectar, promovendo um ambiente acolhedor e harmonioso.</p>',
            ],
            'dimensions' => [],
            'materials' => null,
            'finishes_note' => null,
            'cover' => 'https://franccino.com.br/wp-content/uploads/2025/03/SOFA-NOA.webp',
            'is_featured' => false,
            'legacy_wp_id' => 7999,
            'legacy_url' => 'https://franccino.com.br/produto/sofa-noa/',
        ],
        [
            'slug' => [
                'pt' => 'cadeira-arreda',
                'en' => 'arreda-chair',
            ],
            'name' => [
                'pt' => 'Cadeira Arreda',
                'en' => 'Arreda Chair',
            ],
            'area' => 'indoor',
            'category' => 'chairs',
            'designer' => 'marina-linhares',
            'tagline' => [
                'pt' => 'Carinho, com elegância e qualidade.',
            ],
            'description' => [
                'pt' => '<p>Desenvolvida em estrutura em madeira maciça tauari tingida a Cadeira Arreda tem o assento/encosto em couro ou tecido. É um chegar para o lado, é um arrastar, mas também é como um segredo, porque é daqueles pequenos segredos que dividimos com quem amamos. Tem o detalhe de metal dos pés em laca e madeira do encosto tauari tingida. Marina Linhares brinca com o sotaque, manuseia as matérias e exalta a força das sutilezas. O verbo em si já um charme, é um chamego. Arreda é um carinho com embalo cantado na pronúncia.</p>',
            ],
            'dimensions' => [
                [
                    'label' => null,
                    'width' => 450,
                    'depth' => 550,
                    'height' => 800,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => null,
            'finishes_note' => null,
            'cover' => 'https://franccino.com.br/wp-content/uploads/2024/12/CADEIRA-ARREDA-5-Photoroom.webp',
            'is_featured' => false,
            'legacy_wp_id' => 6524,
            'legacy_url' => 'https://franccino.com.br/produto/cadeira-arreda/',
        ],
        [
            'slug' => [
                'pt' => 'sofa-sol',
            ],
            'name' => [
                'pt' => 'Sofá Sol',
            ],
            'area' => 'outdoor',
            'category' => 'sofas',
            'designer' => 'daniela-ferro',
            'tagline' => [
                'pt' => 'Beleza e elegância com a força da natureza.',
            ],
            'description' => [
                'pt' => '<p>O Sofá Sol para ambientes externos são eternos girassóis, buscando sempre por calor humano, por histórias e por conversas soltas. São naturais, são climáticos e são envolventes. A linha Sol de Daniela Ferro reflete essa essência, levando a um contato mais intimista e acolhedor. O Sofá Sol tem sua estrutura em metal abraçada por uma espuma e tecidos que cativam e trazem um lugar de pertencimento enraigado a suas curvas desenvolvidas para proporcionar uma experiência sensorial completa entre a natureza e o recorte de seus traços.</p>',
            ],
            'dimensions' => [],
            'materials' => null,
            'finishes_note' => null,
            'cover' => 'https://franccino.com.br/wp-content/uploads/2024/12/vgadsvf.webp',
            'is_featured' => false,
            'legacy_wp_id' => 7093,
            'legacy_url' => 'https://franccino.com.br/produto/sofa-sol/',
        ],
        [
            'slug' => [
                'pt' => 'mesa-de-jantar-duna',
                'en' => 'duna-dining-table',
            ],
            'name' => [
                'pt' => 'Mesa de Jantar Duna',
                'en' => 'Duna Dining Table',
            ],
            'area' => 'indoor',
            'category' => 'dining-tables',
            'designer' => 'daniela-ferro',
            'tagline' => [
                'pt' => 'A flexibilidade e leveza das dunas permitem a ação dos elementos, trazendo a beleza como resultado, e assim causando impacto entre o belo e o funcional.',
            ],
            'description' => [
                'pt' => '<p>Formas sinuosas desde a base até o tampo. As dunas são esculpidas minuciosamente pela ação do vento e da água, referenciando o design único da peça, que com suas formas generosas, acolhe para além da funcionalidade. Estruturada em madeira, que alia elegância e atemporalidade à decoração, a mesa convida à interação ao seu redor. Com base e tampo em MDF laminado e contratampo em MDF laqueado.</p><p>A Mesa de Jantar Duna carrega consigo a paciência e persistência dos elementos água e ar em lapidar e construir o desenho único das dunas, valorizando o detalhe de suas curvas e personalidade.</p>',
            ],
            'dimensions' => [
                [
                    'label' => null,
                    'width' => 2600,
                    'depth' => 1100,
                    'height' => 745,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => [
                'pt' => 'Base e tampo em MDF laminado e contra tampo em MDF laqueado',
            ],
            'finishes_note' => null,
            'cover' => 'https://franccino.com.br/wp-content/uploads/2024/04/1-MESA-DE-JANTAR-DUNA.jpg',
            'is_featured' => false,
            'legacy_wp_id' => 3261,
            'legacy_url' => 'https://franccino.com.br/produto/mesa-de-jantar-duna/',
        ],
        [
            'slug' => [
                'pt' => 'sofa-alba',
            ],
            'name' => [
                'pt' => 'Sofá Alba Outdoor',
            ],
            'area' => 'outdoor',
            'category' => 'sofas',
            'designer' => 'zanocchi-starke',
            'tagline' => [
                'pt' => 'A inspiração e o contato com a natureza dão ao Sofá Alba a essência do ser, proporcionando conforto em seu cantinho especial.',
            ],
            'description' => [
                'pt' => '<p>A interação com seu animal de estimação inspirou Carolina Starke a propor um design referenciado nas formas volumosas e acolhedoras do bichinho. O conforto de estar com a vaca Alba foi determinante, inclusive para o nome da peça. Para a coleção Origem, lançada no ano passado, foi criada a versão indoor do móvel aconchegante. Agora, o produto é adaptado para uso outdoor, com base e acabamentos diferenciados.</p>',
            ],
            'dimensions' => [
                [
                    'label' => null,
                    'width' => 2200,
                    'depth' => 920,
                    'height' => 800,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => [
                'pt' => 'Estrutura em alumínio, assento, braços e encosto em compensado com espuma e tecido',
            ],
            'finishes_note' => null,
            'cover' => 'https://franccino.com.br/wp-content/uploads/2024/04/sofa-alba.png',
            'is_featured' => false,
            'legacy_wp_id' => 3435,
            'legacy_url' => 'https://franccino.com.br/produto/sofa-alba/',
        ],
        [
            'slug' => [
                'pt' => 'sofa-tasca',
                'en' => 'tasca-sofa',
            ],
            'name' => [
                'pt' => 'Sofá Tasca',
                'en' => 'Tasca Sofa',
            ],
            'area' => 'outdoor',
            'category' => 'sofas',
            'designer' => 'zanocchi-starke',
            'tagline' => [
                'pt' => 'Um design que proporciona conforto e cria uma atmosfera de bem-estar, transportando para uma zona de relaxamento.',
            ],
            'description' => [
                'pt' => '<p>Em um design que exalta a funcionalidade, a linha composta por sofá e poltrona apresenta aberturas no tecido dos braços, formando compartimentos capazes de acomodar objetos como celulares e controles, que ficam ao alcance da mão durante os momentos de relaxamento. A estrutura é construída em freijó ou cumaru, com sustentação e modelagem de braços e encosto em alumínio, revestidos em tela sling, enquanto as almofadas de assento e encosto são soltas. A remoção das almofadas facilita a limpeza da peça, que é aconchegante e versátil. Sua adaptação ao ambiente interno é realçada pelo caráter acolhedor da madeira, que não só sustenta a estrutura, mas também confere charme ao conjunto.</p>',
            ],
            'dimensions' => [
                [
                    'label' => null,
                    'width' => 2210,
                    'depth' => 950,
                    'height' => 800,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => [
                'pt' => 'Estrutura em madeira freijó ou cumaru, sustentação e modelagem de braços e encosto em alumínio, revestidos em tela sling',
            ],
            'finishes_note' => null,
            'cover' => 'https://franccino.com.br/wp-content/uploads/2024/04/Poltrona-Tasca-3-1.png',
            'is_featured' => false,
            'legacy_wp_id' => 3751,
            'legacy_url' => 'https://franccino.com.br/produto/sofa-tasca/',
        ],
        [
            'slug' => [
                'pt' => 'poltrona-turin',
            ],
            'name' => [
                'pt' => 'Poltrona Turin',
            ],
            'area' => 'outdoor',
            'category' => 'armchairs',
            'designer' => 'estudio-franccino',
            'tagline' => [
                'pt' => 'Design singelo, conforto e segurança.',
            ],
            'description' => [
                'pt' => '<p>A Poltrona Turin tem sua estrutura sólida de madeira, exibe um charme rústico que reflete a qualidade e firmeza de sua construção. Seu design singelo e discreto transmite uma sensação de segurança e acolhimento, tornando-a a escolha perfeita para ambientes que buscam uma atmosfera tranquila e acolhedora. O assento e o encosto, ambos revestidos com almofadas em tecido acrílico, proporcionam não apenas conforto, mas também durabilidade, adequando-se facilmente ao uso diário. A opção de adicionar uma almofada extra para o encosto aumenta ainda mais o conforto, tornando a poltrona um verdadeiro convite ao descanso e ao aconchego.</p><p>Obs.: Almofada decorativa vendida separadamente.</p>',
            ],
            'dimensions' => [
                [
                    'label' => null,
                    'width' => 730,
                    'depth' => 700,
                    'height' => 780,
                    'seat_height' => null,
                    'diameter' => null,
                ],
            ],
            'materials' => null,
            'finishes_note' => null,
            'cover' => 'https://franccino.com.br/wp-content/uploads/2025/01/gveawf.webp',
            'is_featured' => false,
            'legacy_wp_id' => 7681,
            'legacy_url' => 'https://franccino.com.br/produto/poltrona-turin/',
        ],
    ],
    'projects' => [
        [
            'slug' => [
                'pt' => 'clara-arte-resort-inhotim',
            ],
            'title' => [
                'pt' => 'Clara Arte Resort – Inhotim',
            ],
            'type' => 'corporate',
            'summary' => [
                'pt' => 'Desenvolvida em meio a natureza e ao contemporâneo, a tradicionalidade, o simples e o jeitinho mineiro de levar a vida. Aquela áurea de calma interiorana e também de sossego. Sem deixar de lado as particularidades de pertencer a essa terra.',
            ],
            'description' => [
                'pt' => '<p>Desenvolvida em meio a natureza e ao contemporâneo, a tradicionalidade, o simples e o jeitinho mineiro de levar a vida. Aquela áurea de calma interiorana e também de sossego. Sem deixar de lado as particularidades de pertencer a essa terra.</p><p>Desenvolvida em meio a natureza e ao contemporâneo, a tradicionalidade, o simples e o jeitinho mineiro de levar a vida. Aquela áurea de calma interiorana e também de sossego. Sem deixar de lado as particularidades de pertencer a essa terra. Sob as sombras que encobrem seu território brilha a cultura, ganhando vida pela arte contemporânea e cercado pelo Jardim Botânico reluz o Museu Inhotim.</p><p>O Museu Inhotim permite respiro, tranquilidade, encantamento e também descanso. Assim escolhemos a Coleção Gerais neste projeto, proporcionando conforto e requinte para o belo. Em meio a rotina e a agitação, encontrar paz e aconchego.</p><p>Minas é expressão, é o encurtamento das palavras, é a união de outras e o surgimento de novas formas.</p><p>Desenvolvida em meio a natureza e ao contemporâneo, a tradicionalidade, o simples e o jeitinho mineiro de levar a vida. Aquela áurea de calma interiorana e também de sossego.</p><p>Desenvolvida em meio a natureza e ao contemporâneo, a tradicionalidade, o simples e o jeitinho mineiro de levar a vida. Aquela áurea de calma interiorana e também de sossego.</p>',
            ],
            'cover' => 'https://franccino.com.br/wp-content/uploads/2023/09/bt-voltar.png',
            'legacy_wp_id' => 8106,
            'legacy_url' => 'https://franccino.com.br/cases/clara-resort/',
        ],
        [
            'slug' => [
                'pt' => 'fazenda-boa-vista-jhsf',
            ],
            'title' => [
                'pt' => 'Fazenda Boa Vista – JHSF',
            ],
            'type' => 'corporate',
            'summary' => [
                'pt' => 'A integração entre a Franccino e a Fazenda Boa Vista resulta em um ambiente de luxo e aconchego para os lares do empreendimento. Com móveis de alta qualidade e design exclusivo, a Franccino ajuda a criar espaços que oferecem conforto e elegância, alinhados ao conceito de equilíbrio e liberdade proposto pela JHSF. Cada peça foi cuidadosamente escolhida para se harmonizar com as exuberantes paisagens e áreas verdes ao redor, criando um ambiente acolhedor e funcional, onde as famílias podem aproveitar momentos de tranquilidade e convivência, sem perder a privacidade e o bem-estar.',
            ],
            'description' => [
                'pt' => '<p>A integração entre a Franccino e a Fazenda Boa Vista resulta em um ambiente de luxo e aconchego para os lares do empreendimento. Com móveis de alta qualidade e design exclusivo, a Franccino ajuda a criar espaços que oferecem conforto e elegância, alinhados ao conceito de equilíbrio e liberdade proposto pela JHSF. Cada peça foi cuidadosamente escolhida para se harmonizar com as exuberantes paisagens e áreas verdes ao redor, criando um ambiente acolhedor e funcional, onde as famílias podem aproveitar momentos de tranquilidade e convivência, sem perder a privacidade e o bem-estar.</p>',
            ],
            'cover' => 'https://franccino.com.br/wp-content/uploads/2023/09/bt-voltar.png',
            'legacy_wp_id' => 8105,
            'legacy_url' => 'https://franccino.com.br/cases/rascunho-automatico-2/',
        ],
        [
            'slug' => [
                'pt' => 'kuara-hotel',
            ],
            'title' => [
                'pt' => 'Kûara Hotel',
            ],
            'type' => 'corporate',
            'summary' => [
                'pt' => 'A parceria entre a Franccino e o Kûara Hotel traz um conceito único de design e conforto. Os móveis de luxo e a marcenaria assinada pela Franccino transformam o ambiente do hotel, criando uma atmosfera acolhedora e refinada única no Arraial d’Ajuda. Cada peça foi pensada para oferecer funcionalidade e estética, resultando em espaços que encantam os hóspedes com seu estilo contemporâneo e atenção aos detalhes. Onde a arquitetura orgânica e equilibrada cativa os seus sentidos e torna os momentos de confraternização únicos e leves.',
            ],
            'description' => [
                'pt' => '<p>A parceria entre a Franccino e o Kûara Hotel traz um conceito único de design e conforto. Os móveis de luxo e a marcenaria assinada pela Franccino transformam o ambiente do hotel, criando uma atmosfera acolhedora e refinada única no Arraial d’Ajuda. Cada peça foi pensada para oferecer funcionalidade e estética, resultando em espaços que encantam os hóspedes com seu estilo contemporâneo e atenção aos detalhes. Onde a arquitetura orgânica e equilibrada cativa os seus sentidos e torna os momentos de confraternização únicos e leves.</p>',
            ],
            'cover' => 'https://franccino.com.br/wp-content/uploads/2023/09/bt-voltar.png',
            'legacy_wp_id' => 8104,
            'legacy_url' => 'https://franccino.com.br/cases/rascunho-automatico/',
        ],
    ],
    'clients' => [
        [
            'name' => 'Cyrela',
            'legacy_wp_id' => 10401,
            'legacy_url' => 'https://franccino.com.br/clientes/cyrela/',
        ],
        [
            'name' => 'Fazenda da Grama',
            'legacy_wp_id' => 10399,
            'legacy_url' => 'https://franccino.com.br/clientes/fazenda-da-grama/',
        ],
        [
            'name' => 'Quinta da Baroneza',
            'legacy_wp_id' => 10395,
            'legacy_url' => 'https://franccino.com.br/clientes/quinta-da-baroneza/',
        ],
        [
            'name' => 'JHSF – Fazenda Boa Vista',
            'legacy_wp_id' => 8252,
            'legacy_url' => 'https://franccino.com.br/clientes/jhsf-fazenda-boa-vista/',
        ],
        [
            'name' => 'Kûara Hotel',
            'legacy_wp_id' => 8189,
            'legacy_url' => 'https://franccino.com.br/clientes/kuara/',
        ],
        [
            'name' => 'Clara Resorts',
            'legacy_wp_id' => 8114,
            'legacy_url' => 'https://franccino.com.br/clientes/clararesorts/',
        ],
        [
            'name' => 'Carmel Hotéis',
            'legacy_wp_id' => 8109,
            'legacy_url' => 'https://franccino.com.br/clientes/carmel/',
        ],
        [
            'name' => 'Botânico Shopping',
            'legacy_wp_id' => 8107,
            'legacy_url' => 'https://franccino.com.br/clientes/botanico/',
        ],
    ],
    'launch' => [
        'title' => [
            'pt' => 'Lançamentos',
            'en' => 'Novelties',
        ],
        'slug' => [
            'pt' => 'lancamentos',
            'en' => 'novelties',
        ],
        'summary' => [
            'pt' => 'Coleção TEMPO celebra os 25 anos da Franccino com móveis autorais que valorizam presença, conforto e design pensado para acompanhar a vida ao longo do tempo',
        ],
        'description' => [
            'pt' => '<p>A coleção TEMPO nasce de uma reflexão sobre aquilo que realmente permanece. Em um mundo marcado pela velocidade, a Franccino celebra seus 25 anos reafirmando um valor que sempre guiou seu fazer: criar móveis pensados para acompanhar a vida ao longo do tempo.</p><p>Desenvolvida em colaboração com os designers Daniela Ferro, Zia Costa, Studio La Mamba, Marina Linhares e o Estúdio Franccino, a coleção reúne peças que exploram equilíbrio, simplicidade e conforto. Cada desenho traduz uma relação cuidadosa entre matéria, proporção e uso — características que revelam a maturidade de um processo construído com atenção aos detalhes.</p><p>Mais do que objetos, as peças da coleção TEMPO foram criadas para receber encontros, pausas e memórias. São móveis que habitam o cotidiano com naturalidade, transformando momentos simples em experiências duradouras.</p>',
        ],
        'products' => [
            'mesa-lateral-epoca',
            'cadeira-aura',
            'cadeira-toe',
            'mesa-lateral-rito',
            'cadeira-sopro',
            'poltrona-orvalho',
            'poltrona-so-corda',
            'mesa-de-centro-trem',
            'poltrona-terezinha',
            'sofa-antonio',
            'cadeira-melina',
            'sofa-royale',
            'mesa-joey',
            'buffet-heritage',
            'sofa-majestic',
        ],
    ],
    'banners' => [
        [
            'image' => 'https://franccino.com.br/wp-content/uploads/2026/03/1920x500_OP.webp',
        ],
        [
            'image' => 'https://franccino.com.br/wp-content/uploads/2024/10/Horizonte.webp',
        ],
        [
            'image' => 'https://franccino.com.br/wp-content/uploads/2024/04/Elo-1.webp',
        ],
    ],
];
