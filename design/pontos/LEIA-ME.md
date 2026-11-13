# Pontos clicáveis nas fotos do site (13/11/2026)

Cada foto do site (banner da home, capa de área, coleção, página ou projeto, foto de galeria) pode ter pontos que
levam à peça. Os pontos ficam num ambiente ligado à foto (`scenes.photo_media_id`) e saem em `GET /image-points`; o site
desenha os pontos sobre a foto onde ela aparecer, acompanhando o recorte (`PhotoPoints`). Contrato em `docs/api.md`.

- `2026-11-13-pontos.json`: os pontos de cada foto (`media_id` = `Image.id` na API do preview; `scene_id` para o
  ambiente que já existia na Fazenda Boa Vista), com o que não foi achado no catálogo em `not_found`.
- `enviar.py`: envia o arquivo (`POST /api/import/image-points`), com `CONTENT_IMPORT_TOKEN` no ambiente. Cada item troca
  os pontos daquela foto.

## Como as peças foram achadas

- **Clara Arte:** o catálogo do projeto no Drive ("Franccino e Clara Arte Resort.pdf") lista as peças: Chaise Cocê,
  Poltrona e Banqueta Apruma, Mesa de centro Trêm, Cadeira Melina, Mesa de cabeceira e Aparador Xovê, Escrivaninha
  Bruma e Banco Paco. Cada foto foi conferida contra a foto da peça.
- **Fazenda Boa Vista e Kûara:** sem lista de peças; comparação foto a foto com o catálogo inteiro. Na Boa Vista,
  Chaise Madri (com almofada), Poltrona, Sofá e Mesa de centro Frizzo; o ambiente de teste (Chaise Madri e Poltrona
  Derby) foi refeito com as peças reais. No Kûara, nenhuma peça bate com o catálogo.
- **Coleções:** a galeria e a capa de cada coleção, comparadas com as peças dela e com o catálogo inteiro.
- Peça repetida na mesma foto: um ponto só, na que aparece melhor.

Resultado: 88 fotos revisadas, 70 com pontos, 86 pontos.

## Para a Franccino: peças que aparecem nas fotos e não estão no catálogo

São da Franccino? Se forem, precisam ser cadastradas (nome, fotos, medidas) para ganhar o ponto.

- **Kûara Hotel:** espreguiçadeira de fibra trançada marrom, sem braços; poltrona de madeira com assento de fibra; sofá
  longo com almofadas azuis e verdes; mesinhas laterais de fibra.
- **Fazenda Boa Vista:** sofá modular azul-petróleo; poltrona de madeira de braço reto com almofadas bege; ombrelone
  verde-escuro de mastro central.
- **Clara Arte:** mesa lateral de tronco de madeira; ombrelone de mastro de madeira com lona bege; luminária de piso
  marrom; mesas redondas do restaurante (tampo de madeira, tampo branco, base de concreto, base cônica); mesa bistrô de
  tampo de pedra verde; aparador de ripas do restaurante; puffs de tricô vermelho; poltrona de madeira com assento de
  couro (quarto); cadeiras de ripas do deck.
- **Capas das coleções:** Traço (poltronas arredondadas marrons e mesinha de pé cônico), Gerais (poltrona laranja com
  laterais de corda), Avito (mesa de centro escura de pés em bloco), Origem (poltrona de madeira com encosto redondo de
  couro), Outset (sofá de ripas curvas com pés escuros).
- **Galerias das coleções:** Elo (mesa de centro retangular escura), Outset (mesa de cabeceira de madeira com nicho e
  gaveta).
- **Capas de páginas:** Casa (sofá em L com laterais de ripas e tecido rosado, mesa de centro de pedra verde, mesa de
  centro de ripas), Fábrica (sofá cinza em L, mesa de centro de madeira maciça, mesa lateral com nicho).

Também apareceram e não entram como peça: camas e marcenaria sob medida dos quartos, abajures, mesa de bilhar.
