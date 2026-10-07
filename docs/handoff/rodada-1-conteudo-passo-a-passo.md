# Rodada 1: conteúdo e passo a passo para terminar (PPP-42)

Para quem vai terminar a rodada 1 (PR #23, branch `feature/ajustes-cliente-rodada-1`). O código está pronto; falta
**cadastrar o conteúdo no painel** e **publicar**. Atualizado em 07/10/2026.

Regra: imagens e arquivos pesados **não vão para o repositório**. Entram só pelo painel (disco de mídia).

## 1. Ordem certa

1. Revisar e aprovar o PR #23 (tech lead). Merge na `develop`.
2. Testar em container igual ao servidor: `docker compose -f compose.preview.yaml up --build` (ver
   `docs/deploy-preview.md`). Ninguém testou assim ainda.
3. PR da `develop` para a `main`, com CI verde. O EasyPanel faz o deploy sozinho.
4. Deploy da API primeiro (esperar a bolinha verde), depois do site.
5. **Só então** cadastrar o conteúdo abaixo no painel (`https://api-preview-franccino.valenteai.cloud/admin`). O bloco
   "Vídeo" e os campos novos só existem depois do deploy da API.
6. Fazer Deploy do site de novo, para as páginas pegarem o conteúdo novo.

## 2. O que subir no painel

Onde cada coisa se cadastra e de onde vem o arquivo. "Site atual" = https://franccino.com.br (público, mas as
imagens de lá são comprimidas: peça os originais ao cliente, ver seção 4).

| #   | Onde no painel            | O que cadastrar                                                                               | Origem do arquivo                                                                                                                                                                                                                                                                                                                 |
| --- | ------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Banners**               | 3 banners na ordem: restaurante, piscina de dia, piscina à noite                              | **Não temos os arquivos.** São da versão do Marcelo (o cliente mostrou só prints, com marca d'água do Lightshot, que não servem). Pedir os originais ao Matheus.                                                                                                                                                                  |
| 2   | **Páginas → Lançamentos** | Capa (banner do topo)                                                                         | Foto da piscina à noite do item 1, como na referência do cliente.                                                                                                                                                                                                                                                                 |
| 3   | **Páginas → Corporativo** | Capa                                                                                          | Saguão com painel de madeira da versão do Marcelo (item 1: pedir ao Matheus).                                                                                                                                                                                                                                                     |
| 4   | **Páginas → Projetos**    | Capa                                                                                          | Uma foto de projeto, por exemplo `https://franccino.com.br/wp-content/uploads/2025/03/Clara-Arte-scaled.webp`.                                                                                                                                                                                                                    |
| 5   | **Páginas → Fábrica**     | Capa = foto da fachada da fábrica                                                             | **Não temos o arquivo** (só o print no PDF do cliente). Pedir o original.                                                                                                                                                                                                                                                         |
| 6   | **Páginas → Fábrica**     | Bloco **Vídeo**: endereço `https://youtu.be/OG_GNCn0HoQ`, capa e título "Conheça a Franccino" | Capa provável: `https://franccino.com.br/wp-content/uploads/2024/01/video-francciono.png` (conferir se é a imagem do vídeo).                                                                                                                                                                                                      |
| 7   | **Clientes**              | 5 clientes com logo: Fazenda Boa Vista, Kûara Hotel, Clara Resorts, Carmel, Botânico Shopping | Site atual, página `/corporativo/`: `2025/03/Fazenda-Boa-Vista-png.webp`, `2025/03/Clara-Resorts.webp`, `2025/03/Carmel-Hoteis-2.webp`, `2025/03/Botanico-Shopping.webp` e `2025/03/kuara_hotel_arraial_d_ajuda.webp` (base `https://franccino.com.br/wp-content/uploads/`). **Conferir se cada arquivo é logo** (pode ser foto). |
| 8   | **Lojas**                 | Uma foto por loja (campo foto, em cada loja)                                                  | Drive, pasta `Paginas institucionais`: fotos "Franccino – Belo Horizonte - NN.webp" (loja de BH). Das outras 11 lojas **não temos foto**: pedir ao cliente.                                                                                                                                                                       |
| 9   | **Projetos** (opcional)   | Mais fotos nos 3 projetos                                                                     | Site atual, `/corporativo/`: `2025/03/Boa-Vista-2-scaled.webp`, `Boa-Vista-3-scaled.webp`, `Clara-Arte-2-scaled.webp`, `FRANCCINO-CLARA-ART-2-scaled.webp`, `Kuara-2-scaled.webp`, `Kuara-3-scaled.webp`.                                                                                                                         |

Texto do banner da home, como aparece no PDF do cliente (confirmar com ele): "Estética e funcionalidade" /
"Design para viver o tempo" / "Mobiliário autoral que une precisão, matéria e o fazer brasileiro em peças criadas para
permanecer" / botão "Conheça as peças".

## 3. O que alterar por conta própria

- **Mapa das lojas:** usa os ladrilhos do OpenStreetMap, sem biblioteca. A política deles pede provedor comercial para
  uso pesado. Para trocar, mude só `TILE_URL` em `web/src/lib/stores/map-view.ts`.
- **Escopo:** o mapa e o bloco "Vídeo" no painel são funções novas. Confirmar que entram na rodada 1 do contrato.
- **Texto do banner e das páginas:** o que for cadastrado no painel aparece como está. Revisar pt e en.
- **Itens que o cliente pediu e ainda dependem de decisão dele** (reunião de 05/10, PPP-42): remover o nome do
  designer do card (hoje já mostra só foto e nome), busca no cabeçalho (feita), nomes das áreas (fica "Casa" e
  "Giardini", como no documento do cliente).
- **Fotos de produto:** o cliente quer fundo branco, peça centralizada e todas no mesmo ângulo. Isso depende das fotos
  novas dele; não se resolve no código.

## 4. O que pedir ao cliente (prazo combinado: 19/10/2026)

Ver também `docs/reunioes/2026-10-05-reuniao-franccino.md`.

- Os 3 banners da home em alta resolução e as capas de Corporativo e da fachada da fábrica.
- Fotos das lojas (12 lojas; só temos BH).
- Logos dos clientes em vetor ou PNG grande.
- Licença da fonte: **resolvida**. A fonte Adobe Garamond Pro foi trocada por Cormorant Garamond e EB Garamond, que
  têm licença aberta.
- Logo da Franccino em SVG, textos em inglês, descrições de produto, lista de acabamentos, fichas técnicas em PDF,
  fotos originais dos produtos, blocos 3D e 2D que já existem.

## 5. Conferir no fim

- [ ] `pnpm --filter web test`, `lint`, `typecheck` e o build como no CI (`docs/HANDOFF.md`, seção 2.3).
- [ ] Cada página alterada aberta no computador e no celular, sem rolagem lateral.
- [ ] Mapa de lojas acompanhando o filtro de estado e tipo.
- [ ] Banner da home trocando as 3 imagens, com pausa e setas.
- [ ] Atualizar a PPP-42 no Linear (texto neutro, sem preço nem notas comerciais).
