// Dados do protótipo. Nomes, imagens, designers e lojas vêm do site atual; medidas, acabamentos e arquivos
// são ILUSTRATIVOS (o site novo recebe tudo da API/painel).

window.FRANCCINO = (() => {
  // tex: recorte de textura das fotos atuais (img/finishes); tons derivados são ilustrativos
  const woods = [
    { id: 'freijo', name: 'Freijó natural', code: 'MD-02', color: '#b07a4f', tex: 'freijo' },
    { id: 'nogueira', name: 'Nogueira', code: 'MD-05', color: '#6f4a31', tex: 'nogueira' },
    { id: 'carvalho', name: 'Carvalho claro (tom ilustrativo)', code: 'MD-09', color: '#c9a77e', tex: 'carvalho-claro' },
    { id: 'ebano', name: 'Ébano tingido (tom ilustrativo)', code: 'MD-14', color: '#2e2621', tex: 'ebano' },
  ];
  const fabrics = [
    { id: 'linho', name: 'Linho cru', code: 'TC-110', color: '#e4dccd', tex: 'linho' },
    { id: 'boucle', name: 'Bouclê areia', code: 'TC-204', color: '#d8cbb6', tex: 'boucle-areia' },
    { id: 'boucle-terracota', name: 'Bouclê terracota', code: 'TC-207', color: '#9c5237', tex: 'boucle-terracota' },
    { id: 'musgo', name: 'Veludo musgo', code: 'TC-318', color: '#5b6247', tex: 'veludo-musgo' },
    { id: 'caramelo', name: 'Couro caramelo', code: 'CR-021', color: '#9a5b2c', tex: 'couro-caramelo' },
  ];
  const outdoor = [
    { id: 'teca', name: 'Teca natural', code: 'EX-01', color: '#a57c52', tex: 'teca' },
    { id: 'grafite', name: 'Alumínio grafite', code: 'EX-12', color: '#3b3d3c', tex: 'aluminio-grafite' },
    { id: 'corda-areia', name: 'Corda náutica areia', code: 'CN-03', color: '#d6c7a8', tex: 'corda-areia' },
    { id: 'corda-terracota', name: 'Corda náutica terracota', code: 'CN-08', color: '#9a5a3f', tex: 'corda-terracota' },
  ];

  const casaFinishes = { madeira: woods, tecido: fabrics };
  const giardiniFinishes = { estrutura: outdoor.slice(0, 2), trama: outdoor.slice(2) };

  const products = [
    { slug: 'cadeira-aura', name: 'Cadeira Aura', area: 'casa', category: 'Cadeiras', designer: 'Daniela Ferro', img: 'aura', w: 520, d: 560, h: 800, seat: 460, shape: 'rect', isNew: true },
    { slug: 'cadeira-toe', name: 'Cadeira Toé', area: 'casa', category: 'Cadeiras', designer: 'Sérgio J. Matos', img: 'toe', w: 500, d: 540, h: 790, seat: 450, shape: 'rect', isNew: true },
    { slug: 'sofa-majestic', name: 'Sofá Majestic', area: 'casa', category: 'Sofás', designer: 'Zanocchi & Starke', img: 'majestic', w: 2400, d: 1000, h: 750, seat: 420, shape: 'rect', isNew: true },
    { slug: 'mesa-lateral-epoca', name: 'Mesa Lateral Época', area: 'casa', category: 'Mesas laterais', designer: 'Alva Design', img: 'epoca', w: 500, d: 500, h: 550, shape: 'round', isNew: true },
    { slug: 'buffet-heritage', name: 'Buffet Heritage', area: 'casa', category: 'Aparadores e buffets', designer: 'Estúdio Franccino', img: 'heritage', w: 2000, d: 480, h: 780, shape: 'rect', isNew: true },
    { slug: 'mesa-lateral-rito', name: 'Mesa lateral Rito', area: 'casa', category: 'Mesas laterais', designer: 'Vinícius Siega', img: 'rito', w: 450, d: 450, h: 520, shape: 'round', isNew: true },
    { slug: 'cadeira-sopro', name: 'Cadeira Sopro', area: 'casa', category: 'Cadeiras', designer: 'La Mamba', img: 'sopro', w: 540, d: 560, h: 780, seat: 460, shape: 'rect', isNew: true },
    { slug: 'poltrona-orvalho', name: 'Poltrona Orvalho', area: 'casa', category: 'Poltronas', designer: 'Marina Linhares', img: 'orvalho', w: 780, d: 820, h: 760, seat: 400, shape: 'rect', isNew: true },
    { slug: 'poltrona-so-corda', name: 'Poltrona Sô (corda)', area: 'giardini', category: 'Poltronas', designer: 'Sérgio J. Matos', img: 'so', w: 760, d: 800, h: 740, seat: 390, shape: 'rect', isNew: true },
    { slug: 'mesa-de-centro-trem', name: 'Mesa de centro Trem', area: 'casa', category: 'Mesas de centro', designer: 'Paulo Alves', img: 'trem', w: 1200, d: 700, h: 350, shape: 'rect', isNew: true },
    { slug: 'poltrona-terezinha', name: 'Poltrona Terezinha', area: 'casa', category: 'Poltronas', designer: 'Isabela Vecci', img: 'terezinha', w: 720, d: 780, h: 800, seat: 410, shape: 'rect', isNew: true },
    { slug: 'sofa-antonio', name: 'Sofá Antônio', area: 'casa', category: 'Sofás', designer: 'Bruno Rangel', img: 'antonio', w: 2200, d: 950, h: 780, seat: 430, shape: 'rect', isNew: true },
    { slug: 'mesa-joey', name: 'Mesa Joey', area: 'casa', category: 'Mesas de jantar', designer: 'Zia Costa', img: 'joey', w: 1300, d: 1300, h: 750, shape: 'round', isNew: false },
    { slug: 'sofa-adhara', name: 'Sofá Adhara', area: 'giardini', category: 'Sofás', designer: 'Estúdio Franccino', img: 'adhara', w: 2100, d: 900, h: 720, seat: 400, shape: 'rect', isNew: false },
    { slug: 'mesa-de-jantar-arp', name: 'Mesa de Jantar ARP', area: 'giardini', category: 'Mesas de jantar', designer: 'Andrea Zanocchi', img: 'arp-mesa', w: 2200, d: 1000, h: 750, shape: 'rect', isNew: false },
  ].map((p) => ({ ...p, finishes: p.area === 'casa' ? casaFinishes : giardiniFinishes }));

  const designers = [
    { name: 'Andrea Zanocchi', img: 'zanocchi.webp', note: 'Coleção ARP, inspirada na Pedra do Arpoador.' },
    { name: 'Vinícius Siega', img: 'siega.webp', note: 'Autor da linha Bloco.' },
    { name: 'La Mamba', img: 'lamamba.webp', note: 'Estúdio espanhol, autor da linha Pinot.' },
    { name: 'Sérgio J. Matos', img: 'sergio.jpg', note: 'Linhas Sambura e Sambaqui.' },
  ];

  const stores = [
    { name: 'Franccino Casa Gabriel', type: 'Loja exclusiva', city: 'São Paulo', state: 'SP', address: 'Alameda Gabriel Monteiro da Silva, 1229 — Jardim América', phone: '(11) 3062-0233' },
    { name: 'Franccino Giardini Gabriel', type: 'Loja exclusiva', city: 'São Paulo', state: 'SP', address: 'Al. Gabriel Monteiro da Silva, 1094 — Jardim América', phone: '(11) 3081-5980' },
    { name: 'Franccino Casa D&D', type: 'Loja exclusiva', city: 'São Paulo', state: 'SP', address: 'Av. das Nações Unidas, 12.555 — Piso superior, Brooklin Novo', phone: '(11) 98604-5126' },
    { name: 'Franccino Giardini D&D', type: 'Loja exclusiva', city: 'São Paulo', state: 'SP', address: 'Av. das Nações Unidas, 12.555 — Loja 321, Brooklin Novo', phone: '(11) 3043-6360' },
    { name: 'Franccino Campinas', type: 'Loja exclusiva', city: 'Campinas', state: 'SP', address: 'R. Gen. Osório, 1952 — Cambuí', phone: '(19) 99245-2887' },
    { name: 'Grupo Robusti', type: 'Revenda', city: 'Ribeirão Preto', state: 'SP', address: 'Av. Sumaré, 808 — Jardim Sumaré', phone: '(16) 3329-4045' },
    { name: 'Franccino Lourdes', type: 'Loja exclusiva', city: 'Belo Horizonte', state: 'MG', address: 'Rua Marília de Dirceu, 204 — Lourdes', phone: '(31) 99746-9821' },
    { name: 'Franccino Ponteio', type: 'Loja exclusiva', city: 'Belo Horizonte', state: 'MG', address: 'BR-356, 2500 — Santa Lúcia', phone: '(31) 98442-6639' },
    { name: 'Franccino CasaShopping', type: 'Loja exclusiva', city: 'Rio de Janeiro', state: 'RJ', address: 'Av. Ayrton Senna, 2150 — Barra da Tijuca', phone: '(21) 97297-6720' },
    { name: 'Franccino Brasília', type: 'Loja exclusiva', city: 'Brasília', state: 'DF', address: 'Casa Park — SGCV Sul, Lote 22 — Guará', phone: '(61) 3532-2886' },
    { name: 'Franccino Curitiba', type: 'Loja exclusiva', city: 'Curitiba', state: 'PR', address: 'Alameda Doutor Carlos de Carvalho, 1024 — Centro', phone: '(41) 99179-7019' },
    { name: 'Franccino Londrina', type: 'Loja exclusiva', city: 'Londrina', state: 'PR', address: 'Av. Me. Leônia Milito, 1355 — Bela Suíça', phone: '(43) 3066-6473' },
  ];

  const contact = {
    quotesWhatsapp: '5511942900080',
    assistanceWhatsapp: '5537998725961',
    email: 'contato@franccino.com.br',
    phone: '(37) 3381-4204',
    address: 'Rod. MG 260, KM 36, 1254 — Sobrado, Cláudio — MG, 35530-000',
  };

  return { products, designers, stores, contact };
})();
